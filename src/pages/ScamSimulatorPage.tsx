import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Award, 
  RotateCcw, 
  ArrowRight, 
  Printer, 
  FileText,
  Mail,
  MessageSquare,
  Lock,
  ExternalLink
} from 'lucide-react';

interface Scenario {
  id: number;
  title: string;
  sourceType: 'WhatsApp Forward' | 'Email Notification' | 'SMS Alert' | 'Google Form Notice';
  senderDisplay: string;
  claimedScheme: string;
  simulatedMessage: string;
  embeddedLink: string;
  correctVerdict: 'phishing' | 'legitimate' | 'caution';
  verdictLabel: string;
  forensicBreakdown: {
    senderAnalysis: string;
    domainHygiene: string;
    paymentRules: string;
    keyRedFlag: string;
  };
  explanation: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 1,
    title: 'Urgent WhatsApp Forward: "PM Free Laptop Scheme"',
    sourceType: 'WhatsApp Forward',
    senderDisplay: 'Forwarded many times (Unknown Number)',
    claimedScheme: 'Prime Minister Free Laptop & Merit Cash Grant',
    simulatedMessage: '🚨 PM FREE LAPTOP & ₹50,000 SCHOLARSHIP 🚨\nUnder the new youth scheme, all college students are granted a free laptop and ₹50,000 cash! Only 500 units left for this state quota. No exam required. Claim immediately before 12 PM today:\nhttp://scholarsh1ps-gov-in.free-apply-portal.xyz/student-login.php',
    embeddedLink: 'http://scholarsh1ps-gov-in.free-apply-portal.xyz/student-login.php',
    correctVerdict: 'phishing',
    verdictLabel: 'Phishing Scam',
    forensicBreakdown: {
      senderAnalysis: 'Anonymous WhatsApp forward with no institutional sender identity.',
      domainHygiene: 'Domain uses "scholarsh1ps-gov-in" typosquat on unsecure HTTP and a commercial .xyz TLD, not official .gov.in.',
      paymentRules: 'False promises of universal free laptops without academic merit criteria.',
      keyRedFlag: 'Artificial urgency ("before 12 PM today") and typosquatted fake government hostname.'
    },
    explanation: 'Central Government schemes are hosted exclusively on .gov.in or .nic.in domains. The Indian Government does not distribute laptops through forwarded WhatsApp links.'
  },
  {
    id: 2,
    title: 'Official Circular: AICTE Pragati Scholarship for Girls',
    sourceType: 'Email Notification',
    senderDisplay: 'scholarship-schemes@aicte-india.org (Verified SPF/DKIM)',
    claimedScheme: 'AICTE Pragati Scholarship Scheme for Girl Students',
    simulatedMessage: 'Dear Student,\nApplications for the AICTE Pragati Scholarship for Girls enrolled in 1st year degree/diploma technical courses are now open. Eligible candidates can submit applications online on the National Scholarship Portal (NSP) at https://scholarships.gov.in. No fee is required.',
    embeddedLink: 'https://scholarships.gov.in',
    correctVerdict: 'legitimate',
    verdictLabel: 'Legitimate & Safe',
    forensicBreakdown: {
      senderAnalysis: 'Sent from authentic official statutory body domain (@aicte-india.org).',
      domainHygiene: 'Application destination is the genuine National Scholarship Portal (https://scholarships.gov.in) with HTTPS.',
      paymentRules: 'Reaffirms that official applications on NSP are 100% free of cost.',
      keyRedFlag: 'None. Official scheme with authentic portal citation.'
    },
    explanation: 'The link directs to the genuine National Scholarship Portal (scholarships.gov.in) and originates from an authorized AICTE email address.'
  },
  {
    id: 3,
    title: 'Google Form: "Tata Trusts Higher Ed Grant" (Demands UPI PIN)',
    sourceType: 'Google Form Notice',
    senderDisplay: 'Shared Google Form via public social link',
    claimedScheme: 'Tata Educational Relief Trust Grant',
    simulatedMessage: 'Congratulations! You have qualified for the Tata Merit Endowment grant of ₹1,00,000. To disburse the money into your bank account, please complete this Google Form and enter your PhonePe/GPay UPI PIN and Aadhaar OTP for instant verification: https://forms.gle/xK99fakeScholarshipWinUPI',
    embeddedLink: 'https://forms.gle/xK99fakeScholarshipWinUPI',
    correctVerdict: 'phishing',
    verdictLabel: 'Phishing Scam (Severe Credential Theft)',
    forensicBreakdown: {
      senderAnalysis: 'Hosted on anonymous free Google Form, not official tatatrusts.org portal.',
      domainHygiene: 'Legitimate corporate trusts never use public free forms for formal scholarships.',
      paymentRules: 'Solicits student UPI PIN under the guise of "receiving" money.',
      keyRedFlag: 'DEMAND FOR UPI PIN: Entering a UPI PIN always authorizes a DEBIT from your account, never a credit.'
    },
    explanation: 'Never enter a UPI PIN or OTP to "receive" funds. UPI PINs are strictly authorization passwords to release money from your account.'
  },
  {
    id: 4,
    title: 'SMS Alert: "UGC Fellowship Pending Approval (Pay Verification Fee)"',
    sourceType: 'SMS Alert',
    senderDisplay: 'VM-SCHLR (Bulk Promotional Gateway)',
    claimedScheme: 'University Grants Commission Fellowship',
    simulatedMessage: 'UGC ALERT: Your student fellowship grant has been paused due to pending document verification. Pay ₹1,200 verification fee within 24 hours to clear payment: http://ugc-scholarship-direct-approval.site/pay-processing.html',
    embeddedLink: 'http://ugc-scholarship-direct-approval.site/pay-processing.html',
    correctVerdict: 'phishing',
    verdictLabel: 'Phishing / Advance-Fee Scam',
    forensicBreakdown: {
      senderAnalysis: 'Promotional SMS gateway with deceptive sender tag.',
      domainHygiene: 'Domain is "ugc-scholarship-direct-approval.site", not authentic ugc.ac.in.',
      paymentRules: 'Demands an advance fee of ₹1,200 to release fellowship funds.',
      keyRedFlag: 'UGC never charges clearance fees to disburse scholar fellowships.'
    },
    explanation: 'Statutory fellowships are disbursed directly via PFMS/DBT. Demanding a fee to release financial aid is standard advance-fee fraud.'
  },
  {
    id: 5,
    title: 'Official Notice: UK Chevening International Scholarships',
    sourceType: 'Email Notification',
    senderDisplay: 'scholarships@chevening.org (Official UK FCDO)',
    claimedScheme: 'Chevening International Scholarships (UK)',
    simulatedMessage: 'Chevening Scholarships are now accepting applications for one-year Master’s degrees in the UK. Applications are fully funded, including tuition and living allowances. Apply exclusively via the official Chevening online application system: https://www.chevening.org/apply. We do not use third-party agents.',
    embeddedLink: 'https://www.chevening.org/apply',
    correctVerdict: 'legitimate',
    verdictLabel: 'Legitimate & Safe',
    forensicBreakdown: {
      senderAnalysis: 'Official chevening.org domain managed by UK Government.',
      domainHygiene: 'Links directly to HTTPS secure application portal on chevening.org.',
      paymentRules: 'Clearly states zero-fee policy and warns against unauthorized agents.',
      keyRedFlag: 'None.'
    },
    explanation: 'Chevening is a globally recognized UK Government program. The announcement uses verified HTTPS URLs and explicitly rejects third-party fee charges.'
  }
];

export const ScamSimulatorPage: React.FC = () => {
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [selectedVerdict, setSelectedVerdict] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showCertificate, setShowCertificate] = useState(false);
  const [studentName, setStudentName] = useState('');

  const currentScenario = SCENARIOS[currentScenarioIndex];

  const handleChooseVerdict = (verdict: 'phishing' | 'legitimate' | 'caution') => {
    if (isAnswered) return;
    setSelectedVerdict(verdict);
    setIsAnswered(true);

    if (verdict === currentScenario.correctVerdict) {
      setScore(prev => prev + 20); // 20 pts per question (5 questions = 100 pts)
    }
  };

  const handleNext = () => {
    if (currentScenarioIndex < SCENARIOS.length - 1) {
      setCurrentScenarioIndex(prev => prev + 1);
      setSelectedVerdict(null);
      setIsAnswered(false);
    } else {
      setShowCertificate(true);
    }
  };

  const handleRestart = () => {
    setCurrentScenarioIndex(0);
    setSelectedVerdict(null);
    setIsAnswered(false);
    setScore(0);
    setShowCertificate(false);
    setStudentName('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header with Lab Image */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-8 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded">
            <ShieldCheck className="w-4 h-4 text-cyan-600" />
            <span>Interactive Cyber Defense Lab & Simulator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14213D] tracking-tight">
            Scholarship Phishing Awareness Lab
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
            Test your cyber intuition against real-world scholarship lures. Inspect the sender addresses, URL destinations, and psychological tricks to decide whether to trust or block the communication.
          </p>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 pt-1">
            <span>Scenario {currentScenarioIndex + 1} of {SCENARIOS.length}</span>
            <span>·</span>
            <span className="font-mono text-blue-600">Awareness Score: {score}/100</span>
          </div>
        </div>

        <div className="md:col-span-4 flex justify-center">
          <div className="w-full max-w-[280px] rounded-xl overflow-hidden border border-slate-200 shadow-md bg-slate-900">
            <img
              src="/src/assets/images/scam_simulator_lab_1792033231466.jpg"
              alt="Interactive Cybersecurity Training Lab Console"
              referrerPolicy="no-referrer"
              className="w-full h-auto object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        </div>
      </div>

      {/* Main Interactive Scenario Card */}
      {!showCertificate ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                {currentScenario.sourceType}
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-2">
                {currentScenario.title}
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Scenario #{currentScenario.id}
            </span>
          </div>

          {/* Realistic Message Simulation Container */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-300 font-mono text-xs space-y-3">
            <div className="flex items-center justify-between text-slate-500 border-b border-slate-200 pb-2 text-[11px]">
              <span className="truncate">From / Header: <strong className="text-slate-800">{currentScenario.senderDisplay}</strong></span>
              <span className="shrink-0">Claimed: {currentScenario.claimedScheme}</span>
            </div>

            <div className="text-slate-900 whitespace-pre-wrap leading-relaxed font-sans text-xs sm:text-sm bg-white p-4 rounded-lg border border-slate-200 shadow-inner">
              {currentScenario.simulatedMessage}
            </div>

            <div className="p-2.5 bg-slate-100 rounded border border-slate-200 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Destination Link:</span>
              <span className="font-mono text-blue-700 truncate max-w-sm">{currentScenario.embeddedLink}</span>
            </div>
          </div>

          {/* Student Decision Action Buttons */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              What is your cybersecurity verdict on this notice?
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                disabled={isAnswered}
                onClick={() => handleChooseVerdict('legitimate')}
                className={`p-4 rounded-xl border text-xs font-bold flex flex-col items-center gap-2 transition ${
                  selectedVerdict === 'legitimate'
                    ? currentScenario.correctVerdict === 'legitimate'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                      : 'bg-rose-50 border-rose-500 text-rose-800'
                    : 'bg-white border-slate-200 hover:border-emerald-400 text-slate-800 hover:bg-emerald-50/40'
                } disabled:cursor-default`}
              >
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Legitimate & Safe</span>
                <span className="text-[10px] font-normal text-slate-500">Official recognized scheme</span>
              </button>

              <button
                type="button"
                disabled={isAnswered}
                onClick={() => handleChooseVerdict('caution')}
                className={`p-4 rounded-xl border text-xs font-bold flex flex-col items-center gap-2 transition ${
                  selectedVerdict === 'caution'
                    ? currentScenario.correctVerdict === 'caution'
                      ? 'bg-amber-50 border-amber-500 text-amber-800'
                      : 'bg-rose-50 border-rose-500 text-rose-800'
                    : 'bg-white border-slate-200 hover:border-amber-400 text-slate-800 hover:bg-amber-50/40'
                } disabled:cursor-default`}
              >
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span>Caution Required</span>
                <span className="text-[10px] font-normal text-slate-500">Needs university confirmation</span>
              </button>

              <button
                type="button"
                disabled={isAnswered}
                onClick={() => handleChooseVerdict('phishing')}
                className={`p-4 rounded-xl border text-xs font-bold flex flex-col items-center gap-2 transition ${
                  selectedVerdict === 'phishing'
                    ? currentScenario.correctVerdict === 'phishing'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                      : 'bg-rose-50 border-rose-500 text-rose-800'
                    : 'bg-white border-slate-200 hover:border-rose-400 text-slate-800 hover:bg-rose-50/40'
                } disabled:cursor-default`}
              >
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <span>Phishing Scam</span>
                <span className="text-[10px] font-normal text-slate-500">Fraudulent trap / Fee scam</span>
              </button>
            </div>
          </div>

          {/* Feedback & Forensic Reveal */}
          {isAnswered && (
            <div className="p-6 rounded-xl border bg-slate-50/80 border-slate-200 space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2.5">
                {selectedVerdict === currentScenario.correctVerdict ? (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    <div>
                      <span className="text-sm font-bold text-emerald-800">Correct Assessment! (+20 Points)</span>
                      <p className="text-xs text-slate-600">Actual Verdict: {currentScenario.verdictLabel}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 h-6 text-rose-600" />
                    <div>
                      <span className="text-sm font-bold text-rose-800">Incorrect Analysis</span>
                      <p className="text-xs text-slate-600">Actual Verdict: {currentScenario.verdictLabel}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Forensic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <span className="font-semibold text-slate-700 block">Sender & Gateway Inspection:</span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{currentScenario.forensicBreakdown.senderAnalysis}</p>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <span className="font-semibold text-slate-700 block">Domain & Protocol Hygiene:</span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{currentScenario.forensicBreakdown.domainHygiene}</p>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <span className="font-semibold text-slate-700 block">Payment & Fee Policy:</span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{currentScenario.forensicBreakdown.paymentRules}</p>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <span className="font-semibold text-rose-700 block">Critical Red Flag:</span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{currentScenario.forensicBreakdown.keyRedFlag}</p>
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-900 border border-blue-200">
                <span className="font-bold">Core Learning Takeaway: </span>
                {currentScenario.explanation}
              </div>

              <div className="text-right pt-2">
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors inline-flex items-center gap-2 shadow-sm"
                >
                  <span>{currentScenarioIndex < SCENARIOS.length - 1 ? 'Next Scenario' : 'View Final Awareness Certificate'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Certificate View upon completion */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xl p-8 sm:p-12 space-y-8 text-center max-w-3xl mx-auto">
          <div className="space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
              <Award className="w-8 h-8" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
              Training Module Completed
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#14213D] tracking-tight">
              Scholarship Cyber Defense Certificate
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Demonstrated practical literacy in recognizing fake scholarship lures, typosquats, and credential theft.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-4 text-left text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <span className="text-slate-500 block">Candidate Name:</span>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter your name for certificate..."
                  className="mt-1 font-bold text-base text-slate-900 border-b border-blue-600 focus:outline-none bg-transparent"
                />
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Final Awareness Score:</span>
                <span className="font-mono text-2xl font-extrabold text-blue-600">{score}/100</span>
              </div>
            </div>

            <div className="space-y-1 text-slate-600 leading-relaxed text-[11px]">
              <p>• Verified proficiency in detecting domain typosquatting against the National Scholarship Portal (scholarships.gov.in).</p>
              <p>• Understood that no scholarship provider ever asks for UPI PINs, banking passwords, or upfront verification fees.</p>
              <p>• Certified to independently advise fellow students on avoiding cyber phishing traps.</p>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between text-[11px] text-slate-400 font-mono">
              <span>Date: {new Date().toLocaleDateString()}</span>
              <span>Issued by ScholarShield AI Security Engine</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save Certificate PDF</span>
            </button>
            <button
              onClick={handleRestart}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Simulator</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
