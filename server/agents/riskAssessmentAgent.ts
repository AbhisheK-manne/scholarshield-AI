import { 
  AgentFinding, 
  RiskReport, 
  RiskLevel, 
  SecurityCheckItem 
} from '../types.js';
import { UrlAnalysisResult } from './urlAnalysisAgent.js';
import { GoogleFormAnalysisResult } from './googleFormAgent.js';
import { ScholarshipVerificationResult } from './scholarshipVerificationAgent.js';
import { PhishingDetectionResult } from './phishingAgent.js';
import { GoogleGenAI } from '@google/genai';

interface ContributingFactor {
  description: string;
  points: number;
  agent: string;
}

export async function runRiskAssessmentAgent(
  submittedUrl: string,
  urlAnalysis: UrlAnalysisResult,
  googleFormAnalysis: GoogleFormAnalysisResult,
  scholarshipVerification: ScholarshipVerificationResult,
  phishingDetection: PhishingDetectionResult
): Promise<RiskReport> {
  const scanTimestamp = new Date().toISOString();
  const id = 'scan_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);

  const contributingFactors: ContributingFactor[] = [];
  let score = 0;
  let criticalWarning = false;
  let criticalWarningReason = '';

  // 1. Confirmed malicious URL reputation (+50)
  if (phishingDetection.isBlacklisted || phishingDetection.status === 'malicious') {
    contributingFactors.push({
      description: 'Confirmed malicious threat feed / reputation signature',
      points: 50,
      agent: 'Phishing Detection Agent'
    });
    score += 50;
    criticalWarning = true;
    criticalWarningReason = 'This URL has been flagged in active threat intelligence databases as malicious.';
  }

  // 2. Credential or OTP harvesting indicators (+40)
  const hasCredentialTheft = googleFormAnalysis.detectedSensitiveFields.some(f => 
    f.toLowerCase().includes('pin') || 
    f.toLowerCase().includes('password') || 
    f.toLowerCase().includes('otp')
  );
  if (hasCredentialTheft) {
    contributingFactors.push({
      description: 'Credential or OTP harvesting detected (demands PIN, password, or OTP)',
      points: 40,
      agent: 'Google Form Analysis Agent'
    });
    score += 40;
    criticalWarning = true;
    criticalWarningReason = 'Target actively solicits highly sensitive financial or authentication secrets (OTP / PIN / password).';
  }

  // 3. Confirmed impersonation / typosquatting (+35)
  if (urlAnalysis.typosquattingDetected) {
    contributingFactors.push({
      description: `Domain mimics legitimate authority: ${urlAnalysis.typosquattingTarget || 'Official Institution'}`,
      points: 35,
      agent: 'URL Analysis Agent'
    });
    score += 35;
  }

  // 4. Suspicious or unverified payment request (+20)
  if (googleFormAnalysis.demandsPayment) {
    contributingFactors.push({
      description: 'Unverified application fee or UPI/wallet payment solicitation',
      points: 20,
      agent: 'Google Form Analysis Agent'
    });
    score += 20;
  }

  // 5. Significant conflict with official scholarship information (+20)
  if (scholarshipVerification.status === 'conflicting_claims') {
    contributingFactors.push({
      description: 'Contradiction with official scheme portal or guidelines',
      points: 20,
      agent: 'Scholarship Verification Agent'
    });
    score += 20;
  }

  // 6. Provider identity cannot be established (+10)
  if (
    scholarshipVerification.status === 'unable_to_verify' && 
    !scholarshipVerification.isOfficialDomain
  ) {
    contributingFactors.push({
      description: 'Provider identity could not be verified in authoritative registry',
      points: 10,
      agent: 'Scholarship Verification Agent'
    });
    score += 10;
  }

  // 7. Independent authoritative confirmation of claimed scholarship (-20)
  if (scholarshipVerification.isOfficialDomain) {
    contributingFactors.push({
      description: 'Verified official government or educational authority domain',
      points: -20,
      agent: 'Scholarship Verification Agent'
    });
    score -= 20;
  }

  // 8. Protocol & Domain hygiene
  if (!urlAnalysis.isHttps) {
    contributingFactors.push({
      description: 'Unencrypted plain HTTP communication',
      points: 15,
      agent: 'URL Analysis Agent'
    });
    score += 15;
  }

  // 9. Free form hosting for national scholarship claim
  if (googleFormAnalysis.isGoogleForm && !scholarshipVerification.isOfficialDomain) {
    contributingFactors.push({
      description: 'Official scholarship application hosted on anonymous Google Form',
      points: 15,
      agent: 'Google Form Analysis Agent'
    });
    score += 15;
  }

  // SSRF Attempt
  if (urlAnalysis.isBlockedBySsrf) {
    criticalWarning = true;
    criticalWarningReason = 'Private IP or unauthorized loopback destination blocked.';
    score = 100;
  }

  // Clamp score between 0 and 100
  const overallScore = Math.max(0, Math.min(100, score));

  // Determine Category according to strict guidelines:
  // 0–19: Few risk indicators detected
  // 20–49: Caution required
  // 50–74: High risk
  // 75–100: Very high risk
  let riskCategory: RiskLevel;
  let riskCategoryLabel: string;

  if (overallScore >= 75 || (criticalWarning && overallScore >= 50)) {
    riskCategory = 'very_high';
    riskCategoryLabel = 'Very High Risk';
  } else if (overallScore >= 50 || criticalWarning) {
    riskCategory = 'high';
    riskCategoryLabel = 'High Risk';
  } else if (overallScore >= 20) {
    riskCategory = 'caution';
    riskCategoryLabel = 'Caution Required';
  } else {
    riskCategory = 'low';
    riskCategoryLabel = 'Few Risk Indicators Detected';
  }

  // Build Security Check lists
  const checksPassed: SecurityCheckItem[] = [];
  const checksFailed: SecurityCheckItem[] = [];
  const checksUnableToVerify: SecurityCheckItem[] = [];

  // HTTPS check
  if (urlAnalysis.isHttps) {
    checksPassed.push({
      id: 'chk-https',
      name: 'HTTPS Transport Security',
      category: 'url_integrity',
      status: 'passed',
      details: 'Destination enforces encrypted HTTPS transmission.'
    });
  } else {
    checksFailed.push({
      id: 'chk-https',
      name: 'HTTPS Transport Security',
      category: 'url_integrity',
      status: 'failed',
      details: 'Destination transmits unencrypted plaintext (HTTP).'
    });
  }

  // Typosquatting check
  if (!urlAnalysis.typosquattingDetected) {
    checksPassed.push({
      id: 'chk-typosquat',
      name: 'Brand Typosquatting & Mimicry Check',
      category: 'url_integrity',
      status: 'passed',
      details: 'No deceptive homoglyphs or portal impersonation detected.'
    });
  } else {
    checksFailed.push({
      id: 'chk-typosquat',
      name: 'Brand Typosquatting & Mimicry Check',
      category: 'url_integrity',
      status: 'failed',
      details: `Suspected impersonation of: ${urlAnalysis.typosquattingTarget}`
    });
  }

  // Credential theft check
  if (!hasCredentialTheft) {
    checksPassed.push({
      id: 'chk-cred',
      name: 'Credential Harvesting Audit',
      category: 'form_analysis',
      status: 'passed',
      details: 'No requests for UPI PINs, passwords, or authentication OTPs found.'
    });
  } else {
    checksFailed.push({
      id: 'chk-cred',
      name: 'Credential Harvesting Audit',
      category: 'form_analysis',
      status: 'failed',
      details: `Found unauthorized credential requests: ${googleFormAnalysis.detectedSensitiveFields.join(', ')}`
    });
  }

  // Payment check
  if (!googleFormAnalysis.demandsPayment) {
    checksPassed.push({
      id: 'chk-payment',
      name: 'Application Fee & Payment Solicitation Check',
      category: 'form_analysis',
      status: 'passed',
      details: 'No suspicious UPI or wallet fee demands detected.'
    });
  } else {
    checksFailed.push({
      id: 'chk-payment',
      name: 'Application Fee & Payment Solicitation Check',
      category: 'form_analysis',
      status: 'failed',
      details: 'Target solicits application fees, registration deposits, or QR transfers.'
    });
  }

  // Official scholarship registration check
  if (scholarshipVerification.isOfficialDomain) {
    checksPassed.push({
      id: 'chk-gov-domain',
      name: 'Authoritative Official Domain Validation',
      category: 'scholarship_verification',
      status: 'passed',
      details: `Domain verified as authentic: ${scholarshipVerification.trustedSourceInfo?.organizationName}`
    });
  } else if (scholarshipVerification.status === 'conflicting_claims') {
    checksFailed.push({
      id: 'chk-gov-domain',
      name: 'Official Scheme Consistency Check',
      category: 'scholarship_verification',
      status: 'failed',
      details: 'Claimed official scholarship link does not match verified government portal.'
    });
  } else {
    checksUnableToVerify.push({
      id: 'chk-gov-domain',
      name: 'Official Portal Verification',
      category: 'scholarship_verification',
      status: 'unable_to_verify',
      details: 'Provider was not indexed in the central registry. Further verification needed.'
    });
  }

  // Threat reputation check
  if (phishingDetection.isBlacklisted) {
    checksFailed.push({
      id: 'chk-reputation',
      name: 'Global Threat Intelligence Feed Check',
      category: 'reputation_phishing',
      status: 'failed',
      details: `Flagged in threat database: ${phishingDetection.threatType}`
    });
  } else {
    checksPassed.push({
      id: 'chk-reputation',
      name: 'Global Threat Intelligence Feed Check',
      category: 'reputation_phishing',
      status: 'passed',
      details: 'No known malicious matches found in academic threat signatures.'
    });
  }

  // If form was private and could not be scraped
  if (googleFormAnalysis.isGoogleForm && !googleFormAnalysis.isPubliclyAccessible && !googleFormAnalysis.userProvidedEvidenceUsed) {
    checksUnableToVerify.push({
      id: 'chk-form-content',
      name: 'Google Form Interactive Question Inspection',
      category: 'form_analysis',
      status: 'unable_to_verify',
      details: 'Form requires login; questions could not be read remotely. Paste form text for complete inspection.'
    });
  }

  // Aggregate all agent findings
  const allFindings: AgentFinding[] = [
    ...urlAnalysis.findings,
    ...googleFormAnalysis.findings,
    ...scholarshipVerification.findings,
    ...phishingDetection.findings
  ];

  // Evidence sources
  const evidenceSources = [
    {
      title: 'Domain & Transport Inspection',
      url: submittedUrl,
      retrievedAt: scanTimestamp,
      type: 'heuristic_analysis' as const
    },
    {
      title: 'National Scholarship Portal & UGC Registry Cross-Reference',
      url: 'https://scholarships.gov.in',
      retrievedAt: scanTimestamp,
      type: 'official_portal' as const
    },
    {
      title: phishingDetection.serviceName,
      retrievedAt: scanTimestamp,
      type: 'threat_intel' as const
    }
  ];

  if (googleFormAnalysis.isGoogleForm) {
    evidenceSources.push({
      title: googleFormAnalysis.userProvidedEvidenceUsed ? 'User-Provided Form Transcript' : 'Google Form HTML Fetcher',
      url: submittedUrl,
      retrievedAt: scanTimestamp,
      type: (googleFormAnalysis.userProvidedEvidenceUsed ? 'user_evidence' : 'form_scrape') as any
    });
  }

  // Recommended Next Steps
  const recommendedSteps: string[] = [];
  if (criticalWarning || overallScore >= 50) {
    recommendedSteps.push('DO NOT enter your phone number, Aadhaar number, UPI PIN, or passwords on this link.');
    recommendedSteps.push('Never send money or pay registration fees via Google Pay, PhonePe, or Paytm.');
    recommendedSteps.push('Verify genuine scholarship openings directly on official portals like https://scholarships.gov.in.');
    recommendedSteps.push('Warn other students in your college/WhatsApp groups before they share sensitive credentials.');
  } else if (overallScore >= 20) {
    recommendedSteps.push('Proceed with caution: verify the organization independently through phone or university registrar.');
    recommendedSteps.push('Check if the scholarship requires any advance fee; genuine scholarships never demand upfront payment.');
    recommendedSteps.push('Inspect the official website directly rather than relying on social media or messaging forwarded links.');
  } else {
    recommendedSteps.push('Always confirm the official application portal URL directly in your browser address bar.');
    recommendedSteps.push('Remember: No automated security scanner can guarantee 100% safety. Always exercise discretion.');
    recommendedSteps.push('Report any sudden requests for payment or bank OTP immediately to your institution.');
  }

  // Generate Executive Summary with Gemini 2.5/3.8 Flash (or fallback)
  let aiExecutiveSummary = generateRuleBasedSummary(
    overallScore,
    riskCategoryLabel,
    criticalWarning,
    criticalWarningReason,
    contributingFactors,
    scholarshipVerification
  );

  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (geminiApiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey: geminiApiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const prompt = `You are the executive risk assessment engine for ScholarShield AI, an anti-phishing system for students.
Synthesize a concise 2-3 sentence executive briefing for this scan.
Ground your response strictly on these factual findings; do NOT invent or speculate beyond them:
- Submitted URL: ${submittedUrl}
- Final Score: ${overallScore}/100 (${riskCategoryLabel})
- Critical Warning: ${criticalWarning ? criticalWarningReason : 'None'}
- Contributing Factors: ${contributingFactors.map(c => `${c.description} (${c.points > 0 ? '+' : ''}${c.points} pts)`).join('; ')}
- Verification Status: ${scholarshipVerification.notes}
- Disallowed: Never state 100% accuracy.

Output only plain prose.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt
      });

      if (response && response.text) {
        aiExecutiveSummary = response.text.trim();
      }
    } catch {
      // Fallback already assigned
    }
  }

  return {
    id,
    submittedUrl,
    finalDestinationUrl: urlAnalysis.finalDestinationUrl,
    scanTimestamp,
    overallScore,
    riskCategory,
    riskCategoryLabel,
    criticalWarning,
    criticalWarningReason: criticalWarning ? criticalWarningReason : undefined,
    domainAnalysis: {
      hostname: urlAnalysis.hostname,
      domain: urlAnalysis.domain,
      tld: urlAnalysis.tld,
      isHttps: urlAnalysis.isHttps,
      isIpAddress: urlAnalysis.isIpAddress,
      subdomainDepth: urlAnalysis.subdomainDepth,
      typosquattingDetected: urlAnalysis.typosquattingDetected,
      typosquattingTarget: urlAnalysis.typosquattingTarget,
      redirectCount: urlAnalysis.redirectCount,
      redirectChain: urlAnalysis.redirectChain,
      riskIndicators: urlAnalysis.riskIndicators
    },
    urlReputation: {
      status: phishingDetection.status,
      serviceName: phishingDetection.serviceName,
      findings: phishingDetection.threatDetails,
      isBlacklisted: phishingDetection.isBlacklisted
    },
    scholarshipVerification: {
      status: scholarshipVerification.status,
      matchedOfficialRecord: scholarshipVerification.matchedRecord ? {
        id: scholarshipVerification.matchedRecord.id,
        name: scholarshipVerification.matchedRecord.name,
        provider: scholarshipVerification.matchedRecord.provider,
        officialPortalUrl: scholarshipVerification.matchedRecord.officialPortalUrl,
        stipendAmount: scholarshipVerification.matchedRecord.amount,
        applicationDeadline: scholarshipVerification.matchedRecord.deadline,
        eligibility: scholarshipVerification.matchedRecord.eligibility,
        verifiedDate: scholarshipVerification.matchedRecord.lastVerifiedDate
      } : undefined,
      conflictingFields: scholarshipVerification.conflictingFields,
      notes: scholarshipVerification.notes
    },
    googleFormAnalysis: googleFormAnalysis.isGoogleForm ? {
      isGoogleForm: true,
      isPubliclyAccessible: googleFormAnalysis.isPubliclyAccessible,
      formTitle: googleFormAnalysis.formTitle,
      detectedSensitiveFields: googleFormAnalysis.detectedSensitiveFields,
      demandsPayment: googleFormAnalysis.demandsPayment,
      paymentInstructions: googleFormAnalysis.paymentInstructions,
      unrealisticClaims: googleFormAnalysis.unrealisticClaims,
      userProvidedEvidenceUsed: googleFormAnalysis.userProvidedEvidenceUsed
    } : undefined,
    contributingFactors,
    checksPassed,
    checksFailed,
    checksUnableToVerify,
    agentFindings: allFindings,
    evidenceSources,
    aiExecutiveSummary,
    recommendedSteps
  };
}

function generateRuleBasedSummary(
  score: number,
  category: string,
  critical: boolean,
  criticalReason: string,
  factors: ContributingFactor[],
  scholarshipVerification: ScholarshipVerificationResult
): string {
  if (critical) {
    return `CRITICAL RISK DETECTED (${category}): ${criticalReason} Under no circumstances should students provide banking PINs, OTPs, or processing fees on this portal.`;
  }

  if (score >= 50) {
    return `HIGH RISK ASSESSMENT (${score}/100): Multiple high-concern security indicators were identified, including ${factors.slice(0, 2).map(f => f.description.toLowerCase()).join(' and ')}. Exercise extreme caution and do not disclose personal information.`;
  }

  if (score >= 20) {
    return `CAUTION ADVISED (${score}/100): ${scholarshipVerification.notes} While active credential harvesting was not confirmed, key aspects remain unverified against official sources. Independent verification via your university or official agency is recommended.`;
  }

  return `LOW RISK PROFILE (${score}/100): Domain structural checks, transport encryption, and known threat feeds identified no major indicators of fraud. Note that automated analysis cannot guarantee absolute safety; always verify application deadlines directly on official portals.`;
}
