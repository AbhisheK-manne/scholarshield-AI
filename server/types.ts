export interface ScanRequest {
  url: string;
  scholarshipName?: string;
  claimedOrganization?: string;
  contextDescription?: string;
  userProvidedFormText?: string;
}

export type RiskLevel = 'low' | 'caution' | 'high' | 'very_high';

export interface AgentFinding {
  agentName: string;
  status: 'passed' | 'warning' | 'suspicious' | 'malicious' | 'inconclusive' | 'error';
  title: string;
  description: string;
  riskPoints: number; // positive increases risk, negative decreases risk
  confidence: 'high' | 'medium' | 'low';
  evidence: string[];
  limitations?: string;
  timestamp: string;
}

export interface SecurityCheckItem {
  id: string;
  name: string;
  category: 'url_integrity' | 'form_analysis' | 'scholarship_verification' | 'reputation_phishing';
  status: 'passed' | 'failed' | 'not_checked' | 'unable_to_verify';
  details: string;
  evidence?: string;
}

export interface RiskReport {
  id: string;
  submittedUrl: string;
  finalDestinationUrl: string;
  scanTimestamp: string;
  overallScore: number; // 0 to 100
  riskCategory: RiskLevel;
  riskCategoryLabel: string;
  criticalWarning: boolean;
  criticalWarningReason?: string;
  
  // High level agent summaries
  domainAnalysis: {
    hostname: string;
    domain: string;
    tld: string;
    isHttps: boolean;
    isIpAddress: boolean;
    subdomainDepth: number;
    typosquattingDetected: boolean;
    typosquattingTarget?: string;
    redirectCount: number;
    redirectChain: string[];
    riskIndicators: string[];
  };

  urlReputation: {
    status: 'clean' | 'suspicious' | 'malicious' | 'unknown';
    serviceName: string;
    findings: string[];
    isBlacklisted: boolean;
  };

  scholarshipVerification: {
    status: 'verified_official' | 'known_provider' | 'unverified_provider' | 'conflicting_claims' | 'unable_to_verify';
    matchedOfficialRecord?: {
      id: string;
      name: string;
      provider: string;
      officialPortalUrl: string;
      stipendAmount?: string;
      applicationDeadline?: string;
      eligibility?: string;
      verifiedDate: string;
    };
    conflictingFields: string[];
    notes: string;
  };

  googleFormAnalysis?: {
    isGoogleForm: boolean;
    isPubliclyAccessible: boolean;
    formTitle?: string;
    detectedSensitiveFields: string[];
    demandsPayment: boolean;
    paymentInstructions?: string;
    unrealisticClaims: string[];
    userProvidedEvidenceUsed: boolean;
  };

  // Structured breakdown
  contributingFactors: {
    description: string;
    points: number;
    agent: string;
  }[];

  checksPassed: SecurityCheckItem[];
  checksFailed: SecurityCheckItem[];
  checksUnableToVerify: SecurityCheckItem[];

  agentFindings: AgentFinding[];
  evidenceSources: {
    title: string;
    url?: string;
    retrievedAt: string;
    type: 'official_portal' | 'threat_intel' | 'form_scrape' | 'heuristic_analysis' | 'user_evidence';
  }[];

  aiExecutiveSummary: string;
  recommendedSteps: string[];
}

export interface ScholarshipRecord {
  id: string;
  name: string;
  provider: string;
  providerType: 'government' | 'university' | 'foundation' | 'corporate';
  officialPortalUrl: string;
  applicationUrl: string;
  amount: string;
  deadline: string;
  eligibility: string;
  applicationFee: string; // e.g. "Free (Nil)"
  paymentMethodWarning: string;
  lastVerifiedDate: string;
  officialSourceCitation: string;
}

export interface TrustedSource {
  id: string;
  domain: string;
  organizationName: string;
  sourceType: 'government_portal' | 'accredited_university' | 'registered_charity' | 'verified_corporate';
  country: string;
  officialUrl: string;
  notes: string;
}

export interface FeedbackReport {
  id: string;
  scanId: string;
  url: string;
  type: 'false_positive' | 'false_negative' | 'general_correction';
  userNotes: string;
  userEmail?: string;
  createdAt: string;
  status: 'pending' | 'reviewed' | 'resolved';
}

export interface BenchmarkItem {
  id: string;
  url: string;
  groundTruthLabel: 'malicious' | 'suspicious' | 'legitimate';
  type: 'phishing_form' | 'credential_harvest' | 'fake_fee_scam' | 'official_gov' | 'official_university' | 'inconclusive_source';
  description: string;
}

export interface BenchmarkResults {
  totalEvaluated: number;
  correctPredictions: number;
  precision: number;
  recall: number;
  falsePositiveRate: number;
  falseNegativeRate: number;
  verificationCoverage: number;
  apiFailureRate: number;
  timestamp: string;
  details: {
    id: string;
    url: string;
    groundTruth: string;
    predictedScore: number;
    predictedCategory: string;
    isCorrect: boolean;
    criticalWarningFired: boolean;
  }[];
}

export interface MessageAnalysisResult {
  id: string;
  originalText: string;
  extractedUrls: string[];
  analyzedUrlReports: RiskReport[];
  overallRiskScore: number;
  riskCategory: RiskLevel;
  riskCategoryLabel: string;
  criticalWarning: boolean;
  detectedTriggers: {
    category: 'advance_fee' | 'urgent_psychological' | 'false_guarantee' | 'credential_solicitation' | 'impersonation';
    phrase: string;
    description: string;
    severity: 'critical' | 'high' | 'medium';
  }[];
  schemeConflict?: {
    claimedSchemeName: string;
    officialProvider: string;
    officialPolicyNotice: string;
  };
  recommendations: string[];
  summary: string;
  timestamp: string;
}

export interface BatchScanResult {
  total: number;
  completed: number;
  cleanCount: number;
  cautionCount: number;
  highRiskCount: number;
  timestamp: string;
  reports: RiskReport[];
}
