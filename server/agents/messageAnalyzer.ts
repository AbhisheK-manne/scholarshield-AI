import { MessageAnalysisResult, RiskReport, RiskLevel } from '../types.js';
import { orchestrateScan } from './orchestrator.js';
import { db } from '../db.js';
import { GoogleGenAI } from '@google/genai';

const TRIGGER_RULES = [
  {
    category: 'advance_fee' as const,
    regex: /(?:registration\s*fee|processing\s*fee|file\s*charge|verification\s*fee|security\s*deposit|pay\s*(?:rs|inr|₹|\$)\s*\d+|via\s*(?:gpay|phonepe|paytm|upi)|qr\s*code)/i,
    description: 'Solicitation of upfront registration, processing, or verification fee via UPI/wallet',
    severity: 'critical' as const,
    points: 35
  },
  {
    category: 'credential_solicitation' as const,
    regex: /(?:upi\s*pin|atm\s*pin|bank\s*password|net\s*banking|aadhaar\s*otp|share\s*otp|send\s*otp)/i,
    description: 'Demands for banking authentication secrets, UPI PIN, or OTP',
    severity: 'critical' as const,
    points: 40
  },
  {
    category: 'urgent_psychological' as const,
    regex: /(?:today\s*only|within\s*\d+\s*(?:hours|mins|minutes)|hurry\s*up|limited\s*quota|last\s*chance|expires\s*tonight|offer\s*closing)/i,
    description: 'Artificial urgency designed to bypass critical thinking and verification',
    severity: 'medium' as const,
    points: 15
  },
  {
    category: 'false_guarantee' as const,
    regex: /(?:100%\s*guaranteed|selected\s*without\s*exam|direct\s*sanction|congratulations\s*you\s*have\s*been\s*selected|everyone\s*gets|free\s*laptop\s*scheme)/i,
    description: 'Deceptive claim of guaranteed disbursement without academic merit evaluation',
    severity: 'high' as const,
    points: 25
  },
  {
    category: 'impersonation' as const,
    regex: /(?:national\s*scholarship\s*portal|pm\s*scholarship|ministry\s*of\s*education|ugc\s*fellowship|tata\s*trusts|reliance\s*foundation)/i,
    description: 'Name reference to statutory government or premier educational trust',
    severity: 'medium' as const,
    points: 10
  }
];

export async function analyzeScamMessage(text: string): Promise<MessageAnalysisResult> {
  const timestamp = new Date().toISOString();
  const id = 'msg_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);

  // 1. Extract URLs
  const urlRegex = /(https?:\/\/[^\s<>"'{}|\\^`]+)/gi;
  const matches = text.match(urlRegex) || [];
  const extractedUrls = Array.from(new Set(matches.map(u => u.replace(/[.,;)]+$/, ''))));

  // 2. Scan extracted URLs
  const analyzedUrlReports: RiskReport[] = [];
  for (const url of extractedUrls.slice(0, 3)) { // Max 3 URLs per message
    try {
      const report = await orchestrateScan({
        url,
        contextDescription: text.slice(0, 300)
      });
      analyzedUrlReports.push(report);
    } catch (e) {
      console.error('Error scanning URL extracted from message:', e);
    }
  }

  // 3. Detect psychological and scam trigger patterns
  const detectedTriggers: MessageAnalysisResult['detectedTriggers'] = [];
  let score = 0;
  let criticalWarning = false;

  for (const rule of TRIGGER_RULES) {
    const match = text.match(rule.regex);
    if (match) {
      detectedTriggers.push({
        category: rule.category,
        phrase: match[0],
        description: rule.description,
        severity: rule.severity
      });
      score += rule.points;
      if (rule.severity === 'critical') {
        criticalWarning = true;
      }
    }
  }

  // If any analyzed URL was high risk or critical, escalate
  const hasHighRiskUrl = analyzedUrlReports.some(r => r.overallScore >= 50 || r.criticalWarning);
  if (hasHighRiskUrl) {
    score = Math.max(score, 75);
    criticalWarning = true;
  }

  // If no URLs and no triggers
  if (extractedUrls.length === 0 && detectedTriggers.length === 0) {
    score = 10;
  }

  // Clamp 0 to 100
  const overallRiskScore = Math.min(100, Math.max(0, score));

  let riskCategory: RiskLevel;
  let riskCategoryLabel: string;
  if (overallRiskScore >= 75 || criticalWarning) {
    riskCategory = 'very_high';
    riskCategoryLabel = 'Very High Risk (Likely Scam)';
  } else if (overallRiskScore >= 50) {
    riskCategory = 'high';
    riskCategoryLabel = 'High Risk';
  } else if (overallRiskScore >= 20) {
    riskCategory = 'caution';
    riskCategoryLabel = 'Caution Required';
  } else {
    riskCategory = 'low';
    riskCategoryLabel = 'Low Risk Indicators';
  }

  // 4. Cross reference claimed scheme name against official records
  let schemeConflict = undefined;
  const allScholarships = db.getScholarships();
  const lowerText = text.toLowerCase();
  for (const sch of allScholarships) {
    if (lowerText.includes(sch.name.toLowerCase()) || lowerText.includes(sch.provider.toLowerCase())) {
      // If payment is demanded but official scheme is 100% free
      const demandsPayment = detectedTriggers.some(t => t.category === 'advance_fee');
      if (demandsPayment) {
        schemeConflict = {
          claimedSchemeName: sch.name,
          officialProvider: sch.provider,
          officialPolicyNotice: `Official policy states: "${sch.applicationFee}". All statutory funds are sent via Direct Benefit Transfer (DBT). Never pay anyone to claim this scholarship.`
        };
        score = Math.max(score, 85);
        criticalWarning = true;
      }
      break;
    }
  }

  // 5. Recommendations
  const recommendations: string[] = [];
  if (criticalWarning || overallRiskScore >= 50) {
    recommendations.push('DO NOT send any registration money, verification fee, or UPI transfer.');
    recommendations.push('DO NOT open links asking you to authenticate with bank OTP or UPI PIN.');
    recommendations.push('Forward this warning to your college or class WhatsApp group to prevent other students from falling for it.');
    recommendations.push('Report the scam SMS/forward to the National Cybercrime Portal (cybercrime.gov.in) or call 1930.');
  } else if (overallRiskScore >= 20) {
    recommendations.push('Do not share personal documents or phone numbers without verifying the sender.');
    recommendations.push('Confirm with your college nodal scholarship officer whether such a scheme exists.');
  } else {
    recommendations.push('Verify the exact application portal directly on official education websites.');
  }

  // 6. Summary via Gemini or rule-based fallback
  let summary = `Message analysis generated a risk score of ${overallRiskScore}/100 (${riskCategoryLabel}). Identified ${detectedTriggers.length} warning triggers and ${extractedUrls.length} links.`;
  if (criticalWarning) {
    summary = `CRITICAL FRAUD ALERT: This message contains hallmarks of a scholarship advance-fee scam or credential-harvesting trap. Legitimate educational funds never demand fees via UPI or request personal security PINs.`;
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (geminiApiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey: geminiApiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });
      const prompt = `You are the threat analysis engine of ScholarShield AI.
Provide a 2-sentence executive summary of why this scholarship message is safe, suspicious, or fraudulent.
Message snippet: "${text.slice(0, 250)}"
Risk Score: ${overallRiskScore}/100 (${riskCategoryLabel})
Triggers: ${detectedTriggers.map(t => t.phrase).join(', ') || 'None'}
Strict rule: State facts only, never guarantee 100% safety.`;

      const resp = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt
      });
      if (resp && resp.text) {
        summary = resp.text.trim();
      }
    } catch {
      // Fallback already assigned
    }
  }

  return {
    id,
    originalText: text,
    extractedUrls,
    analyzedUrlReports,
    overallRiskScore,
    riskCategory,
    riskCategoryLabel,
    criticalWarning,
    detectedTriggers,
    schemeConflict,
    recommendations,
    summary,
    timestamp
  };
}
