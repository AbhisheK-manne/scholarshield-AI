import assert from 'assert';
import { runUrlAnalysisAgent } from '../server/agents/urlAnalysisAgent.js';
import { runGoogleFormAgent } from '../server/agents/googleFormAgent.js';
import { runScholarshipVerificationAgent } from '../server/agents/scholarshipVerificationAgent.js';
import { runPhishingAgent } from '../server/agents/phishingAgent.js';
import { runRiskAssessmentAgent } from '../server/agents/riskAssessmentAgent.js';
import { db } from '../server/db.js';

async function runTests() {
  console.log('--- STARTING SCHOLARSHIELD AI AUTOMATED TEST SUITE ---');
  let passed = 0;
  let total = 0;

  async function test(name: string, fn: () => Promise<void>) {
    total++;
    try {
      await fn();
      console.log(`✓ [PASSED] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`✗ [FAILED] ${name}:`, err.message);
    }
  }

  // 1. SSRF Protection: Localhost & Private IP Block
  await test('SSRF Protection: Block localhost and 127.0.0.1', async () => {
    const res = await runUrlAnalysisAgent('http://localhost:3000/admin');
    assert.strictEqual(res.isBlockedBySsrf, true);
    assert.strictEqual(res.findings[0].status, 'malicious');
  });

  await test('SSRF Protection: Block AWS/GCP Metadata 169.254.169.254', async () => {
    const res = await runUrlAnalysisAgent('http://169.254.169.254/latest/meta-data/');
    assert.strictEqual(res.isBlockedBySsrf, true);
  });

  await test('SSRF Protection: Block Private Class C 192.168.1.1', async () => {
    const res = await runUrlAnalysisAgent('http://192.168.1.1/setup');
    assert.strictEqual(res.isBlockedBySsrf, true);
  });

  // 2. Unsupported Protocols
  await test('Protocol Filter: Block javascript: and data: URIs', async () => {
    const res1 = await runUrlAnalysisAgent('javascript:alert(1)');
    assert.strictEqual(res1.isBlockedBySsrf, true);
    const res2 = await runUrlAnalysisAgent('data:text/html,<script>steal()</script>');
    assert.strictEqual(res2.isBlockedBySsrf, true);
  });

  // 3. Typosquatting Detection
  await test('Typosquatting: Detect mimicry of scholarships.gov.in', async () => {
    const res = await runUrlAnalysisAgent('http://scholarsh1ps-gov-in.free-apply-portal.xyz/student-login.php');
    assert.strictEqual(res.typosquattingDetected, true);
    assert.ok(res.typosquattingTarget?.includes('National Scholarship Portal'));
  });

  // 4. Valid HTTPS Authentic NSP Portal
  await test('Authentic Domain: scholarships.gov.in passes structure checks', async () => {
    const res = await runUrlAnalysisAgent('https://scholarships.gov.in');
    assert.strictEqual(res.isHttps, true);
    assert.strictEqual(res.isBlockedBySsrf, false);
    assert.strictEqual(res.typosquattingDetected, false);
  });

  // 5. Google Form Credential Harvesting Detection
  await test('Form Agent: Detect UPI PIN & Aadhaar OTP requests', async () => {
    const formText = 'Please enter your Aadhaar number, Mobile Number, and UPI PIN to claim grant.';
    const res = await runGoogleFormAgent('https://forms.gle/testFake123', formText);
    assert.strictEqual(res.isGoogleForm, true);
    assert.ok(res.detectedSensitiveFields.some(f => f.includes('UPI PIN')));
  });

  // 6. Payment Demands in Form
  await test('Form Agent: Detect registration fee demands via QR code', async () => {
    const formText = 'A mandatory processing fee of Rs 500 must be paid via PhonePe or GPay QR code.';
    const res = await runGoogleFormAgent('https://forms.gle/testPayment123', formText);
    assert.strictEqual(res.demandsPayment, true);
  });

  // 7. Scholarship Verification: Official Matching
  await test('Scholarship Agent: Identify NSP official scheme and negative risk score offset', async () => {
    const res = await runScholarshipVerificationAgent('https://scholarships.gov.in');
    assert.strictEqual(res.isOfficialDomain, true);
    assert.strictEqual(res.status, 'verified_official');
    assert.ok(res.findings.some(f => f.riskPoints < 0));
  });

  // 8. Scholarship Verification: Scheme mismatch
  await test('Scholarship Agent: Identify scheme claim mismatch on unverified host', async () => {
    const res = await runScholarshipVerificationAgent(
      'https://free-student-aid-portal.net/apply',
      'AICTE Pragati Scholarship for Girls',
      'AICTE'
    );
    assert.strictEqual(res.status, 'conflicting_claims');
    assert.ok(res.conflictingFields.length > 0);
  });

  // 9. Phishing Agent: Local Signature Detection
  await test('Phishing Agent: Match academic phishing signatures', async () => {
    const res = await runPhishingAgent('http://ugc-direct-approval-fees.net/pay.html');
    assert.strictEqual(res.isBlacklisted, true);
    assert.strictEqual(res.status, 'malicious');
  });

  // 10. Risk Assessment Scoring Engine: Critical Warning Trigger
  await test('Risk Engine: Fire critical warning on credential theft regardless of score', async () => {
    const urlRes = await runUrlAnalysisAgent('https://forms.gle/fakeOtpForm');
    const formRes = await runGoogleFormAgent('https://forms.gle/fakeOtpForm', 'Submit your OTP and net banking password');
    const schRes = await runScholarshipVerificationAgent('https://forms.gle/fakeOtpForm');
    const phishRes = await runPhishingAgent('https://forms.gle/fakeOtpForm', formRes.detectedSensitiveFields);

    const report = await runRiskAssessmentAgent(
      'https://forms.gle/fakeOtpForm',
      urlRes,
      formRes,
      schRes,
      phishRes
    );

    assert.strictEqual(report.criticalWarning, true);
    assert.strictEqual(report.riskCategory, 'very_high');
    assert.ok(report.overallScore >= 50);
  });

  // 11. Database: Integrity & Feedback CRUD
  await test('Database: Create admin session and validate token', async () => {
    const token = db.createAdminSession('admin');
    assert.ok(token.startsWith('admin_sess_'));
    assert.strictEqual(db.validateAdminSession(token), true);
    assert.strictEqual(db.validateAdminSession('invalid_token'), false);
  });

  console.log(`\nTEST RESULTS: ${passed}/${total} passed (${((passed / total) * 100).toFixed(0)}%)`);
  if (passed === total) {
    console.log('ALL VERIFICATION CHECKS COMPLETED SUCCESSFULLY.');
  } else {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
