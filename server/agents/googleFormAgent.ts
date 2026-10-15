import { AgentFinding } from '../types.js';
import https from 'https';
import http from 'http';
import { URL } from 'url';

export interface GoogleFormAnalysisResult {
  isGoogleForm: boolean;
  formType: 'google_form' | 'microsoft_form' | 'generic_web_form' | 'not_a_form';
  isPubliclyAccessible: boolean;
  formTitle?: string;
  formDescription?: string;
  detectedSensitiveFields: string[];
  demandsPayment: boolean;
  paymentInstructions?: string;
  unrealisticClaims: string[];
  userProvidedEvidenceUsed: boolean;
  findings: AgentFinding[];
  requiresUserFormPaste: boolean;
}

// Patterns that indicate credential theft or financial extortion in student forms
const SENSITIVE_PATTERNS = [
  { keyword: 'upi pin', label: 'UPI PIN Request (Severe Credential Theft)', risk: 40, critical: true },
  { keyword: 'atm pin', label: 'ATM PIN Request (Severe Credential Theft)', risk: 40, critical: true },
  { keyword: 'net banking password', label: 'Banking Password Request', risk: 40, critical: true },
  { keyword: 'login password', label: 'Email/Account Password Request', risk: 35, critical: true },
  { keyword: 'otp', label: 'One-Time Password (OTP) Request', risk: 40, critical: true },
  { keyword: 'cvv', label: 'Card CVV / Security Code Request', risk: 40, critical: true },
  { keyword: 'card expiry', label: 'Payment Card Expiry Details', risk: 25, critical: false },
  { keyword: 'aadhaar otp', label: 'Aadhaar Authentication OTP Request', risk: 40, critical: true }
];

const PAYMENT_PATTERNS = [
  { keyword: 'processing fee', label: 'Mandatory Application/Processing Fee Demand', risk: 20 },
  { keyword: 'registration fee', label: 'Upfront Registration Fee Demand', risk: 20 },
  { keyword: 'verification fee', label: 'Scholarship Verification Fee Demand', risk: 25 },
  { keyword: 'gpay', label: 'UPI Wallet Payment (Google Pay)', risk: 20 },
  { keyword: 'phonepe', label: 'UPI Wallet Payment (PhonePe)', risk: 20 },
  { keyword: 'paytm', label: 'UPI Wallet Payment (Paytm)', risk: 20 },
  { keyword: 'qr code', label: 'Payment QR Code Upload/Transfer Prompt', risk: 20 },
  { keyword: 'screenshot of payment', label: 'Demand for Payment Receipt Screenshot', risk: 25 }
];

const UNREALISTIC_CLAIMS = [
  { keyword: '100% guaranteed', label: 'Guaranteed Selection Claim (Fake Guarantee)' },
  { keyword: 'no exam needed', label: 'Direct Cash Transfer without Academic Evaluation' },
  { keyword: 'immediate sanction', label: 'Instant Grant Promise without Merit List' },
  { keyword: 'everyone gets', label: 'Universal Award Claim without Quota or Eligibility Criteria' },
  { keyword: 'limited seats apply within', label: 'High-Urgency Psychological Pressure Tactic' }
];

export async function runGoogleFormAgent(
  targetUrl: string,
  userProvidedFormText?: string
): Promise<GoogleFormAnalysisResult> {
  const timestamp = new Date().toISOString();
  const findings: AgentFinding[] = [];
  const detectedSensitiveFields: string[] = [];
  const unrealisticClaims: string[] = [];
  let demandsPayment = false;
  let paymentInstructions: string | undefined;

  let parsed: URL;
  try {
    parsed = new URL(targetUrl);
  } catch {
    return {
      isGoogleForm: false,
      formType: 'not_a_form',
      isPubliclyAccessible: false,
      detectedSensitiveFields: [],
      demandsPayment: false,
      unrealisticClaims: [],
      userProvidedEvidenceUsed: false,
      findings: [],
      requiresUserFormPaste: false
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  const pathname = parsed.pathname.toLowerCase();

  const isGoogleForm = 
    hostname === 'forms.gle' || 
    (hostname.includes('google.com') && pathname.includes('/forms/'));
  
  const isMicrosoftForm = 
    hostname.includes('forms.office.com') || 
    hostname.includes('forms.microsoft.com');

  if (!isGoogleForm && !isMicrosoftForm && !userProvidedFormText) {
    return {
      isGoogleForm: false,
      formType: 'not_a_form',
      isPubliclyAccessible: false,
      detectedSensitiveFields: [],
      demandsPayment: false,
      unrealisticClaims: [],
      userProvidedEvidenceUsed: false,
      findings: [],
      requiresUserFormPaste: false
    };
  }

  const formType = isGoogleForm ? 'google_form' : isMicrosoftForm ? 'microsoft_form' : 'generic_web_form';

  // Educational notice: Legitimate national scholarships do not conduct official applications on unverified free Google Forms
  if (isGoogleForm) {
    findings.push({
      agentName: 'Google Form Analysis Agent',
      status: 'warning',
      title: 'Free Form Hosting Used for Scholarship Application',
      description: 'The scholarship link is hosted on a free public Google Form. Legitimate government and statutory bodies (e.g. NSP, UGC) host applications on verified official portals, not free anonymous forms.',
      riskPoints: 15,
      confidence: 'high',
      evidence: [`Form provider: Google Forms (${hostname})`],
      timestamp
    });
  }

  // Content extraction: either from user provided text or public fetch
  let rawContent = '';
  let formTitle = '';
  let isPubliclyAccessible = false;
  let userProvidedEvidenceUsed = false;
  let requiresUserFormPaste = false;

  if (userProvidedFormText && userProvidedFormText.trim().length > 0) {
    rawContent = userProvidedFormText.trim();
    userProvidedEvidenceUsed = true;
    isPubliclyAccessible = true;
    findings.push({
      agentName: 'Google Form Analysis Agent',
      status: 'passed',
      title: 'User-Provided Form Evidence Incorporated',
      description: 'Form questions and descriptive text were supplied directly by the user for deep content inspection.',
      riskPoints: 0,
      confidence: 'medium',
      evidence: ['Manual student transcript / OCR form text'],
      timestamp
    });
  } else {
    // Attempt restricted public fetch of Google Form HTML
    try {
      const fetched = await fetchPublicFormHtml(targetUrl);
      if (fetched.success && fetched.content) {
        rawContent = fetched.content;
        formTitle = fetched.title || '';
        isPubliclyAccessible = true;
      } else {
        isPubliclyAccessible = false;
        requiresUserFormPaste = true;
        findings.push({
          agentName: 'Google Form Analysis Agent',
          status: 'inconclusive',
          title: 'Form Requires Authentication or Private Access',
          description: 'The Google Form could not be publicly fetched (it may require Google sign-in or restrict organizational access). User can paste form text or questions for safety verification.',
          riskPoints: 0,
          confidence: 'medium',
          evidence: [fetched.errorReason || 'HTTP redirect to Google Accounts sign-in'],
          limitations: 'Access controls respected. The agent will not attempt to bypass login screens or auto-submit data.',
          timestamp
        });
      }
    } catch (e: any) {
      isPubliclyAccessible = false;
      requiresUserFormPaste = true;
      findings.push({
        agentName: 'Google Form Analysis Agent',
        status: 'inconclusive',
        title: 'Form Retrieval Blocked or Timed Out',
        description: 'Unable to read form questions from remote endpoint. Manual question inspection recommended.',
        riskPoints: 0,
        confidence: 'low',
        evidence: [e?.message || 'Connection timeout'],
        timestamp
      });
    }
  }

  // Inspect extracted text for dangerous patterns
  if (rawContent) {
    const lowerContent = rawContent.toLowerCase();

    // Check credential harvesting
    for (const item of SENSITIVE_PATTERNS) {
      if (lowerContent.includes(item.keyword)) {
        detectedSensitiveFields.push(item.label);
        findings.push({
          agentName: 'Google Form Analysis Agent',
          status: 'malicious',
          title: `Illegal Credential Request: ${item.label}`,
          description: `The form requests confidential authentication credentials ("${item.keyword}"). Legitimate scholarship portals will NEVER request your OTP, UPI PIN, or bank passwords.`,
          riskPoints: item.risk,
          confidence: 'high',
          evidence: [`Detected matching keyword: "${item.keyword}" in form contents`],
          timestamp
        });
      }
    }

    // Check payment & fee demands
    for (const item of PAYMENT_PATTERNS) {
      if (lowerContent.includes(item.keyword)) {
        demandsPayment = true;
        detectedSensitiveFields.push(item.label);
        paymentInstructions = `Form contains references to "${item.keyword}".`;
        findings.push({
          agentName: 'Google Form Analysis Agent',
          status: 'suspicious',
          title: `Suspicious Payment / Fee Demand: ${item.label}`,
          description: `The form appears to solicit upfront fees or payments via ${item.label}. Most legitimate government and foundation scholarships are 100% free to apply.`,
          riskPoints: item.risk,
          confidence: 'high',
          evidence: [`Payment indicator found: "${item.keyword}"`],
          timestamp
        });
      }
    }

    // Check unrealistic claims
    for (const claim of UNREALISTIC_CLAIMS) {
      if (lowerContent.includes(claim.keyword)) {
        unrealisticClaims.push(claim.label);
        findings.push({
          agentName: 'Google Form Analysis Agent',
          status: 'suspicious',
          title: `Deceptive Marketing Claim: ${claim.label}`,
          description: `Form uses typical scholarship scam phrasing: "${claim.keyword}". Authentic merit scholarships do not promise guaranteed disbursement without verification.`,
          riskPoints: 15,
          confidence: 'medium',
          evidence: [`Phrasing detected: "${claim.keyword}"`],
          timestamp
        });
      }
    }
  }

  return {
    isGoogleForm,
    formType,
    isPubliclyAccessible,
    formTitle,
    detectedSensitiveFields,
    demandsPayment,
    paymentInstructions,
    unrealisticClaims,
    userProvidedEvidenceUsed,
    findings,
    requiresUserFormPaste
  };
}

// Restricted fetch for public form HTML (max 250KB, 4s timeout)
function fetchPublicFormHtml(targetUrl: string): Promise<{ success: boolean; content?: string; title?: string; errorReason?: string }> {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(targetUrl);
      const isSecure = parsed.protocol === 'https:';
      const client = isSecure ? https : http;

      const req = client.get(
        targetUrl,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml'
          },
          timeout: 4000
        },
        (res) => {
          const statusCode = res.statusCode || 200;

          // If redirected to login
          if (res.headers.location && res.headers.location.includes('accounts.google.com')) {
            resolve({ success: false, errorReason: 'Requires Google Account Authentication' });
            return;
          }

          if (statusCode >= 400) {
            resolve({ success: false, errorReason: `HTTP ${statusCode}` });
            return;
          }

          let data = '';
          res.setEncoding('utf8');

          res.on('data', (chunk) => {
            data += chunk;
            if (data.length > 250000) { // Limit to 250KB
              req.destroy();
              finish();
            }
          });

          res.on('end', () => {
            finish();
          });

          function finish() {
            // Strip script and style tags to parse form text safely
            const sanitized = data
              .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
              .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ');

            const titleMatch = sanitized.match(/<title>([^<]+)<\/title>/i);
            const title = titleMatch ? titleMatch[1].replace(' - Google Forms', '').trim() : '';

            // Extract text from sanitized HTML
            const textContent = sanitized.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
            resolve({ success: true, content: textContent, title });
          }
        }
      );

      req.on('timeout', () => {
        req.destroy();
        resolve({ success: false, errorReason: 'Connection timed out' });
      });

      req.on('error', (err) => {
        resolve({ success: false, errorReason: err.message });
      });
    } catch (e: any) {
      resolve({ success: false, errorReason: e.message });
    }
  });
}
