import { ScanRequest, RiskReport } from '../types.js';
import { runUrlAnalysisAgent } from './urlAnalysisAgent.js';
import { runGoogleFormAgent } from './googleFormAgent.js';
import { runScholarshipVerificationAgent } from './scholarshipVerificationAgent.js';
import { runPhishingAgent } from './phishingAgent.js';
import { runRiskAssessmentAgent } from './riskAssessmentAgent.js';
import { db } from '../db.js';

export async function orchestrateScan(request: ScanRequest): Promise<RiskReport> {
  const url = request.url.trim();

  // 1. Run Agent 1: URL Analysis & SSRF Inspection
  const urlAnalysis = await runUrlAnalysisAgent(url);

  // 2. Run Agent 2: Google Form Analysis
  // Passes destination URL or user supplied text/OCR
  const googleFormAnalysis = await runGoogleFormAgent(
    urlAnalysis.finalDestinationUrl || url,
    request.userProvidedFormText
  );

  // 3. Run Agent 3: Scholarship Verification Agent
  const scholarshipVerification = await runScholarshipVerificationAgent(
    urlAnalysis.finalDestinationUrl || url,
    request.scholarshipName,
    request.claimedOrganization,
    request.contextDescription
  );

  // 4. Run Agent 4: Phishing Detection Agent
  const phishingDetection = await runPhishingAgent(
    urlAnalysis.finalDestinationUrl || url,
    googleFormAnalysis.detectedSensitiveFields
  );

  // 5. Run Agent 5: Risk Assessment Agent & Scoring Engine
  const riskReport = await runRiskAssessmentAgent(
    url,
    urlAnalysis,
    googleFormAnalysis,
    scholarshipVerification,
    phishingDetection
  );

  // Persist scan report into database
  db.saveScanReport(riskReport);

  return riskReport;
}
