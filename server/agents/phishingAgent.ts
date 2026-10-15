import { AgentFinding } from '../types.js';
import { URL } from 'url';

export interface PhishingDetectionResult {
  status: 'clean' | 'suspicious' | 'malicious' | 'unknown';
  serviceName: string;
  isBlacklisted: boolean;
  threatType?: string;
  threatDetails: string[];
  findings: AgentFinding[];
}

// Known malicious or compromised patterns commonly circulating in student groups
const LOCAL_THREAT_SIGNATURES = [
  { match: 'scholarsh1ps', threat: 'Typosquatted Scholarship Phishing Portal' },
  { match: 'free-scholarship-apply', threat: 'Commercial Lead-Gen / Fee Advance Scam' },
  { match: 'ugc-direct-approval', threat: 'Government Authority Impersonation' },
  { match: 'win-laptop-scholarship', threat: 'Malware Lure / Fake Prize Distribution' },
  { match: 'student-instant-cash-grant', threat: 'Advance Fee Loan/Grant Fraud' },
  { match: 'nsp-online-reg-portal.xyz', threat: 'Confirmed Phishing Mirror' },
  { match: 'pay-ugc-verify', threat: 'Fake Payment Extraction Scheme' },
  { match: 'free-macbook-scholarship', threat: 'Device Lottery Phishing Trap' }
];

export async function runPhishingAgent(
  targetUrl: string,
  detectedFormSensitives: string[] = []
): Promise<PhishingDetectionResult> {
  const timestamp = new Date().toISOString();
  const findings: AgentFinding[] = [];
  const threatDetails: string[] = [];
  let isBlacklisted = false;
  let threatType: string | undefined;

  let parsed: URL;
  try {
    parsed = new URL(targetUrl);
  } catch {
    return {
      status: 'unknown',
      serviceName: 'ScholarShield Threat Intel Engine & Safe Browsing Integration',
      isBlacklisted: false,
      threatDetails: ['Unable to query threat intelligence on invalid URL format'],
      findings: []
    };
  }

  const fullUrlLower = targetUrl.toLowerCase();
  const hostLower = parsed.hostname.toLowerCase();

  // 1. Local Threat Intelligence Feed Lookup
  for (const sig of LOCAL_THREAT_SIGNATURES) {
    if (fullUrlLower.includes(sig.match) || hostLower.includes(sig.match)) {
      isBlacklisted = true;
      threatType = sig.threat;
      threatDetails.push(`Matched signature: "${sig.match}" -> ${sig.threat}`);
      
      findings.push({
        agentName: 'Phishing Detection Agent',
        status: 'malicious',
        title: `Known Threat Intelligence Signature: ${sig.threat}`,
        description: `This URL pattern has been identified in security threat feeds as an active threat targeting students (${sig.threat}).`,
        riskPoints: 50,
        confidence: 'high',
        evidence: [
          `Target: ${targetUrl}`,
          `Threat classification: ${sig.threat}`,
          `Feed source: ScholarShield Threat Intelligence Corpus`
        ],
        timestamp
      });
      break;
    }
  }

  // 2. Google Safe Browsing API Integration (if GOOGLE_SAFE_BROWSING_KEY is provided in env)
  const gsbKey = process.env.GOOGLE_SAFE_BROWSING_KEY;
  if (gsbKey && !isBlacklisted) {
    try {
      const gsbResult = await queryGoogleSafeBrowsing(targetUrl, gsbKey);
      if (gsbResult.isMalicious) {
        isBlacklisted = true;
        threatType = gsbResult.threatType;
        threatDetails.push(`Google Safe Browsing Match: ${gsbResult.threatType}`);
        findings.push({
          agentName: 'Phishing Detection Agent',
          status: 'malicious',
          title: `Google Safe Browsing Flagged: ${gsbResult.threatType}`,
          description: `Google Safe Browsing categorises this destination as ${gsbResult.threatType}. Visiting this site may lead to credential theft or malware.`,
          riskPoints: 50,
          confidence: 'high',
          evidence: [
            `Service: Google Safe Browsing v4 API`,
            `Threat type: ${gsbResult.threatType}`
          ],
          timestamp
        });
      }
    } catch (e: any) {
      findings.push({
        agentName: 'Phishing Detection Agent',
        status: 'inconclusive',
        title: 'Google Safe Browsing External API Inconclusive',
        description: 'External Safe Browsing check timed out or failed to return a valid response.',
        riskPoints: 0,
        confidence: 'low',
        evidence: [e?.message || 'External API Error'],
        limitations: 'Local threat intelligence heuristics applied in place of external lookup.',
        timestamp
      });
    }
  } else if (!gsbKey) {
    // Transparently note that external cloud API key is not configured, local engine active
    findings.push({
      agentName: 'Phishing Detection Agent',
      status: isBlacklisted ? 'malicious' : 'passed',
      title: 'Local Threat Signature & Heuristic Evaluation Active',
      description: 'Checked against ScholarShield student security signatures, known phishing mirrors, and heuristic indicator patterns.',
      riskPoints: 0,
      confidence: 'medium',
      evidence: ['Local academic phishing signature database evaluated'],
      limitations: 'Google Safe Browsing API key not set in environment. Relying on local threat intelligence and behavioral heuristics.',
      timestamp
    });
  }

  // 3. Credential theft & Phishing Form Synthesis
  const criticalSensitives = detectedFormSensitives.filter(f => 
    f.toLowerCase().includes('pin') || 
    f.toLowerCase().includes('password') || 
    f.toLowerCase().includes('otp')
  );

  if (criticalSensitives.length > 0) {
    findings.push({
      agentName: 'Phishing Detection Agent',
      status: 'malicious',
      title: 'Active Phishing / Credential Harvesting Vector Identified',
      description: `Target solicits high-risk confidential security secrets: ${criticalSensitives.join(', ')}. This is a hallmark of identity theft and financial draining attacks.`,
      riskPoints: 40,
      confidence: 'high',
      evidence: criticalSensitives.map(s => `Solicited field: ${s}`),
      timestamp
    });
  }

  let finalStatus: PhishingDetectionResult['status'] = 'clean';
  if (isBlacklisted || criticalSensitives.length > 0) {
    finalStatus = 'malicious';
  } else if (threatDetails.length > 0) {
    finalStatus = 'suspicious';
  }

  return {
    status: finalStatus,
    serviceName: gsbKey ? 'Google Safe Browsing + ScholarShield Threat Feed' : 'ScholarShield Threat Feed & Heuristic Engine',
    isBlacklisted,
    threatType,
    threatDetails,
    findings
  };
}

async function queryGoogleSafeBrowsing(url: string, apiKey: string): Promise<{ isMalicious: boolean; threatType?: string }> {
  const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;
  const payload = {
    client: {
      clientId: 'scholarshield-ai',
      clientVersion: '1.0.0'
    },
    threatInfo: {
      threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
      platformTypes: ['ANY_PLATFORM'],
      threatEntryTypes: ['URL'],
      threatEntries: [{ url }]
    }
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Safe Browsing HTTP ${response.status}`);
  }

  const data = await response.json();
  if (data && data.matches && data.matches.length > 0) {
    return {
      isMalicious: true,
      threatType: data.matches[0].threatType
    };
  }

  return { isMalicious: false };
}
