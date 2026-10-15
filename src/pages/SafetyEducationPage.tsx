import React from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  KeyRound, 
  CreditCard, 
  Globe2, 
  FileCheck, 
  CheckCircle2, 
  HelpCircle,
  ExternalLink,
  Flame,
  ShieldCheck
} from 'lucide-react';

export const SafetyEducationPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header with visual banner */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-8 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>Student Phishing Defense & Fraud Literacy</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14213D] tracking-tight">
            Spotting Fake Scholarships & Phishing Lures
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
            Cybercriminals deliberately target students with promises of urgent cash grants, laptop giveaways, and guaranteed scholarships. Learn how to recognize deceptive tactics before sharing your documents or money.
          </p>
        </div>

        <div className="md:col-span-4 flex justify-center">
          <div className="w-full max-w-[280px] rounded-xl overflow-hidden border border-slate-200 shadow-md bg-slate-900">
            <img
              src="/src/assets/images/safety_warning_phishing_1791988362744.jpg"
              alt="Cybersecurity Shield Intercepting Phishing Form"
              referrerPolicy="no-referrer"
              className="w-full h-auto object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        </div>
      </div>

      {/* Mandatory Prominent Safety Warning Banner */}
      <div className="p-5 rounded-xl bg-rose-50 border-2 border-rose-500 text-rose-950 shadow-sm flex items-start gap-4">
        <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-rose-900">
            Universal Golden Rule of Student Financial Security
          </h3>
          <p className="text-sm font-extrabold text-rose-900 mt-1 leading-relaxed">
            "Never share passwords, UPI PINs, or OTPs through scholarship forms. Verify the scholarship provider independently."
          </p>
          <p className="text-xs text-rose-800 mt-1.5 leading-relaxed">
            No genuine educational institution, state government, or philanthropic foundation will EVER ask you to enter your UPI PIN to "receive" money, nor will they ask for your email password or banking OTP. Entering a UPI PIN always authorizes money leaving your account.
          </p>
        </div>
      </div>

      {/* Deep Educational Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Topic 1: Suspicious Google Forms */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">1. Suspicious Google & Microsoft Forms</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Statutory scholarship schemes like NSP, UGC, and AICTE operate on dedicated government cloud infrastructure. They do not publish application forms on anonymous Google Forms (<code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">forms.gle</code>).
          </p>
          <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1 text-slate-700 border border-slate-200">
            <span className="font-semibold text-rose-700">Red Flags:</span>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Anonymous creator with no official university email domain</li>
              <li>Questions asking for Aadhaar OTP or bank account debit card PIN</li>
              <li>Requests to upload a screenshot of a ₹200–₹500 payment receipt</li>
            </ul>
          </div>
        </div>

        {/* Topic 2: Advance Application Fees Scam */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">2. The "Advance Processing Fee" Trap</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Scammers inform you that you have been "pre-selected" for a ₹1,00,000 scholarship, but require a ₹500 "processing", "file opening", or "GST verification" charge via Google Pay, PhonePe, or Paytm QR.
          </p>
          <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1 text-slate-700 border border-slate-200">
            <span className="font-semibold text-emerald-800">Authentic Reality:</span>
            <p className="text-slate-600">
              Government scholarships under the Central Sector, DBT, and Post-Matric schemes are 100% free to apply. Legitimate organizations disburse money to you; they never charge you to process aid.
            </p>
          </div>
        </div>

        {/* Topic 3: Fake Government Websites & Typosquatting */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Globe2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">3. Fake Government Websites (Typosquats)</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Fraudsters register fake domains resembling official portals by replacing letters (e.g., using <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">scholarsh1ps-gov.in</code> instead of <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">scholarships.gov.in</code>) or using commercial extensions like <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">.xyz</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">.org.in</code>, or <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">.site</code>.
          </p>
          <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1 text-slate-700 border border-slate-200">
            <span className="font-semibold text-blue-900">How to Verify:</span>
            <p className="text-slate-600">
              Indian Central & State Government portals strictly end in <strong className="text-slate-900">.gov.in</strong> or <strong className="text-slate-900">.nic.in</strong>. Look closely at the browser address bar for subtle misspelling or hyphens.
            </p>
          </div>
        </div>

        {/* Topic 4: Guaranteed Selection & High-Urgency Phrasing */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">4. "100% Guaranteed" & Psychological Urgency</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Messages on WhatsApp, Telegram, and Instagram claiming: "Direct Selection! No exam needed! Apply before 12 PM today or quota expires!" are classic psychological lures designed to bypass critical thinking.
          </p>
          <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1 text-slate-700 border border-slate-200">
            <span className="font-semibold text-slate-900">Merit Principles:</span>
            <p className="text-slate-600">
              Every genuine scholarship has defined eligibility quotas, income criteria, or merit evaluations. No legitimate fund gives universal awards without verification.
            </p>
          </div>
        </div>

      </div>

      {/* Checklist to verify any scholarship */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <h3 className="text-base font-bold text-slate-900">5-Step Student Safety Checklist</h3>
        <div className="space-y-3 text-xs">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
            <p className="text-slate-700 leading-relaxed">
              <strong>Check the Top-Level Domain: </strong>
              If it claims to be a national scheme, confirm that the domain ends in <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">.gov.in</code>. Avoid clicking shortened links like <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">bit.ly</code> or <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">tinyurl</code> sent on WhatsApp.
            </p>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
            <p className="text-slate-700 leading-relaxed">
              <strong>Never Pay to Apply: </strong>
              Legitimate government and philanthropic scholarships are free. If anyone demands a payment via QR code or bank transfer, report it immediately.
            </p>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
            <p className="text-slate-700 leading-relaxed">
              <strong>Keep Secrets Confidential: </strong>
              Your UPI PIN is exclusively for approving debits from your own account. No entity needs your UPI PIN or banking OTP to transfer scholarship funds to you.
            </p>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">4</span>
            <p className="text-slate-700 leading-relaxed">
              <strong>Cross-Check with College Administration: </strong>
              Visit your college nodal officer, scholarship desk, or university website to verify if the notification is recognized.
            </p>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">5</span>
            <p className="text-slate-700 leading-relaxed">
              <strong>Report Cyber Frauds Promptly: </strong>
              If you or a friend was defrauded, report immediately to the National Cybercrime Portal at <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-semibold">cybercrime.gov.in</a> or call the Cyber Helpline at <strong className="text-slate-900 font-mono">1930</strong>.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
