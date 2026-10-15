import { AgentFinding, ScholarshipRecord, TrustedSource } from '../types.js';
import { db } from '../db.js';
import { URL } from 'url';

export interface ScholarshipVerificationResult {
  status: 'verified_official' | 'known_provider' | 'unverified_provider' | 'conflicting_claims' | 'unable_to_verify';
  providerIdentified?: string;
  isOfficialDomain: boolean;
  matchedRecord?: ScholarshipRecord;
  trustedSourceInfo?: TrustedSource;
  conflictingFields: string[];
  findings: AgentFinding[];
  notes: string;
}

export async function runScholarshipVerificationAgent(
  targetUrl: string,
  claimedName?: string,
  claimedOrg?: string,
  contextMessage?: string
): Promise<ScholarshipVerificationResult> {
  const timestamp = new Date().toISOString();
  const findings: AgentFinding[] = [];
  const conflictingFields: string[] = [];

  let parsed: URL | null = null;
  try {
    parsed = new URL(targetUrl);
  } catch {
    // Malformed URL
  }

  const hostname = parsed?.hostname.toLowerCase() || '';

  // 1. Check if domain matches any certified trusted source
  const trustedCheck = db.isTrustedDomain(hostname);
  const isOfficialDomain = trustedCheck.trusted;
  const trustedSourceInfo = trustedCheck.source;

  // 2. Query known scholarship records
  const allScholarships = db.getScholarships();
  let matchedRecord: ScholarshipRecord | undefined;

  // Match by exact URL first
  matchedRecord = allScholarships.find(s => {
    try {
      const schHost = new URL(s.officialPortalUrl).hostname.toLowerCase();
      const appHost = new URL(s.applicationUrl).hostname.toLowerCase();
      return hostname === schHost || hostname === appHost;
    } catch {
      return false;
    }
  });

  // If not matched by URL, search by claimed name or organization
  if (!matchedRecord && (claimedName || claimedOrg || contextMessage)) {
    const searchTokens = [claimedName, claimedOrg, contextMessage]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    for (const record of allScholarships) {
      const nameParts = record.name.toLowerCase().split(' ');
      const providerParts = record.provider.toLowerCase().split(' ');

      const nameMatch = nameParts.some(p => p.length > 3 && searchTokens.includes(p));
      const provMatch = providerParts.some(p => p.length > 3 && searchTokens.includes(p));

      if (nameMatch || provMatch) {
        matchedRecord = record;
        break;
      }
    }
  }

  // 3. Analyze Findings & Conflicts
  let status: ScholarshipVerificationResult['status'] = 'unable_to_verify';
  let notes = '';

  if (isOfficialDomain) {
    status = 'verified_official';
    notes = `Submitted URL resides on a certified official education/government portal (${trustedSourceInfo?.organizationName}).`;
    findings.push({
      agentName: 'Scholarship Verification Agent',
      status: 'passed',
      title: 'Official Authoritative Domain Confirmed',
      description: `Domain ${hostname} is officially indexed in our authoritative repository as: ${trustedSourceInfo?.organizationName}.`,
      riskPoints: -20, // Negative risk: verified legitimate authority!
      confidence: 'high',
      evidence: [
        `Verified Organization: ${trustedSourceInfo?.organizationName}`,
        `Source Category: ${trustedSourceInfo?.sourceType}`,
        `Reference URL: ${trustedSourceInfo?.officialUrl}`
      ],
      timestamp
    });

    if (matchedRecord) {
      findings.push({
        agentName: 'Scholarship Verification Agent',
        status: 'passed',
        title: `Matched Scheme: ${matchedRecord.name}`,
        description: `Verified scholarship scheme registered under ${matchedRecord.provider}. Standard award: ${matchedRecord.amount}. Official fee status: ${matchedRecord.applicationFee}.`,
        riskPoints: -10,
        confidence: 'high',
        evidence: [
          `Scheme Name: ${matchedRecord.name}`,
          `Official Guidelines: ${matchedRecord.officialSourceCitation}`
        ],
        timestamp
      });
    }
  } else if (matchedRecord) {
    // A known scholarship is claimed, but the application link is hosted on a 3rd party or non-official site!
    status = 'conflicting_claims';
    notes = `Claim refers to "${matchedRecord.name}", but the submitted application link is on an unverified domain (${hostname}) rather than the official portal (${matchedRecord.officialPortalUrl}).`;
    conflictingFields.push('Application Portal Destination mismatch');

    findings.push({
      agentName: 'Scholarship Verification Agent',
      status: 'warning',
      title: 'Portal Mismatch Against Official Records',
      description: `The authentic portal for ${matchedRecord.name} is ${matchedRecord.officialPortalUrl}. Submitting sensitive application data to ${hostname} risks credential theft or fake fee exploitation.`,
      riskPoints: 25,
      confidence: 'high',
      evidence: [
        `Claimed Scheme: ${matchedRecord.name}`,
        `Authentic Portal: ${matchedRecord.officialPortalUrl}`,
        `Submitted URL Host: ${hostname}`,
        `Official Verification Date: ${matchedRecord.lastVerifiedDate}`
      ],
      timestamp
    });

    // Check context for fee contradictions
    if (contextMessage && (contextMessage.toLowerCase().includes('pay') || contextMessage.toLowerCase().includes('fee'))) {
      conflictingFields.push('Fee demand contradicts official zero-fee policy');
      findings.push({
        agentName: 'Scholarship Verification Agent',
        status: 'malicious',
        title: 'Fee Policy Contradiction Detected',
        description: `Official guidelines for ${matchedRecord.name} state: "${matchedRecord.applicationFee}". Any requirement to pay money to receive this scholarship is fraudulent.`,
        riskPoints: 30,
        confidence: 'high',
        evidence: [`Official Fee: ${matchedRecord.applicationFee}`],
        timestamp
      });
    }
  } else {
    // No match found in official database
    status = 'unable_to_verify';
    notes = 'No matching scholarship record was found in the authoritative National Scholarship Portal or accredited partner records. This does not automatically indicate fraud, but independent verification is strongly advised.';
    
    findings.push({
      agentName: 'Scholarship Verification Agent',
      status: 'inconclusive',
      title: 'Scholarship Provider Absent from Official Index',
      description: 'The claimed scholarship could not be matched against verified schemes on the National Scholarship Portal, AICTE, UGC, or partnered foundations.',
      riskPoints: 10,
      confidence: 'medium',
      evidence: [
        `Queried query: ${claimedName || claimedOrg || hostname}`,
        'Search repository: scholarships.gov.in / UGC / AICTE index'
      ],
      limitations: 'Absence from the national database does not constitute proof of fraud, as small private trusts or niche international grants may not be indexed.',
      timestamp
    });
  }

  return {
    status,
    providerIdentified: claimedOrg || matchedRecord?.provider || trustedSourceInfo?.organizationName,
    isOfficialDomain,
    matchedRecord,
    trustedSourceInfo,
    conflictingFields,
    findings,
    notes
  };
}
