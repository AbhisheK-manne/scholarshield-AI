import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileSearch, 
  Globe, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  ShieldAlert, 
  Search,
  ExternalLink,
  HelpCircle,
  FileText,
  MessageSquare
} from 'lucide-react';

interface LandingPageProps {
  onStartScan: (initialUrl?: string) => void;
  onNavigate: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartScan, onNavigate }) => {
  const [quickUrl, setQuickUrl] = useState('');
  const [inputError, setInputError] = useState('');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickUrl.trim()) {
      setInputError('Please enter a scholarship or registration form link.');
      return;
    }
    setInputError('');
    onStartScan(quickUrl.trim());
  };

  const sampleLinks = [
    { label: 'Official NSP Portal', url: 'https://scholarships.gov.in' },
    { label: 'Suspicious Free Form Lure', url: 'https://forms.gle/xK99fakeScholarshipWinUPI' },
    { label: 'Typosquatted Govt Portal', url: 'http://scholarsh1ps-gov-in.free-apply-portal.xyz' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#14213D] via-[#1a2b50] to-[#14213D] text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-700">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headline and Fast Scanner */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-300 bg-cyan-950/70 border border-cyan-800/80 px-3 py-1.5 rounded-md">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Multi-Agent Cybersecurity & Phishing Protection for Students</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Verify Before You Trust.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                AI-powered protection against fake scholarships, suspicious Google Forms, and phishing links. Protect your personal information, Aadhaar credentials, and bank accounts from student fee fraud.
              </p>

              {/* URL Quick-Scan Box */}
              <div className="pt-2">
                <form onSubmit={handleQuickSubmit} className="bg-white p-2 sm:p-2.5 rounded-xl shadow-xl border border-slate-200">
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <div className="relative flex-1 w-full">
                      <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={quickUrl}
                        onChange={(e) => {
                          setQuickUrl(e.target.value);
                          if (inputError) setInputError('');
                        }}
                        placeholder="Paste scholarship link, Google Form URL, or registration portal..."
                        className="w-full pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="submit"
                        className="flex-1 sm:flex-initial px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap shadow-sm"
                      >
                        <span>Scan Link</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById('how-it-works');
                          el?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="flex-1 sm:flex-initial px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap border border-slate-300"
                      >
                        <HelpCircle className="w-4 h-4 text-blue-600" />
                        <span>How It Works</span>
                      </button>
                    </div>
                  </div>
                </form>

                {inputError && (
                  <p className="text-xs text-rose-400 mt-2 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{inputError}</span>
                  </p>
                )}

                {/* Quick Sample Links */}
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-300">
                  <span className="text-slate-400">Try samples:</span>
                  {sampleLinks.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setQuickUrl(sample.url);
                        onStartScan(sample.url);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate('scanner')}
                  className="px-4 py-2.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Deep Link Scanner</span>
                </button>
                <button
                  onClick={() => onNavigate('message_analyzer')}
                  className="px-4 py-2.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Analyze WhatsApp Scam</span>
                </button>
                <button
                  onClick={() => onNavigate('simulator')}
                  className="px-4 py-2.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Phishing Awareness Lab</span>
                </button>
                <button
                  onClick={() => onNavigate('batch')}
                  className="px-4 py-2.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-purple-400" />
                  <span>Batch Scan</span>
                </button>
              </div>

            </div>

            {/* Right Column: Hero Visual Asset with resilient fallback */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-slate-700 shadow-2xl bg-slate-900 group">
                <img
                  src="/src/assets/images/scholarshield_hero_banner_1791988361774.jpg"
                  alt="ScholarShield AI Security Console Display"
                  referrerPolicy="no-referrer"
                  className="w-full h-auto object-cover transform transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback container if local asset failed
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#14213D] via-transparent to-transparent opacity-60"></div>
                
                <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md p-3.5 rounded-xl border border-slate-700/80 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-white">Deterministic Risk Engine</p>
                    <p className="text-slate-400">Explainable scoring with zero fabricated safety claims</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-cyan-400 font-medium">
                    <ShieldCheck className="w-4 h-4" />
                    <span>5 Agents Active</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#14213D] tracking-tight">
            Comprehensive Defense Against Student Scams
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Every link undergoes multi-stage structural parsing, transport security validation, and cross-referencing against authentic national scholarship databases.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Link Security */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Link Security & SSRF Defense</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Inspects domain structure, typosquatting variations, suspicious high-abuse TLDs, and isolates redirection loops with strict SSRF controls.
            </p>
          </div>

          {/* Card 2: Scholarship Verification */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Scholarship Verification</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cross-references claims against the National Scholarship Portal (NSP), UGC, AICTE, and verified philanthropic trust records.
            </p>
          </div>

          {/* Card 3: Form Content Analysis */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <FileSearch className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Google Form Analysis</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Audits forms for illegal demands: UPI PINs, passwords, bank OTPs, or application processing fees through anonymous payment apps.
            </p>
          </div>

          {/* Card 4: Evidence-Based Reports */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Evidence-Based Reports</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Transparent, deterministic score breakdowns (0–100) detailing passed checks, failed checks, and items unable to verify.
            </p>
          </div>
        </div>
      </section>

      {/* Assessment Outcomes Explanation Section */}
      <section className="bg-slate-100/80 py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#14213D] tracking-tight">
              Understanding Risk Assessment Bands
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              ScholarShield AI uses deterministic engineering scoring bands. We never label an unverified website as guaranteed safe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Outcome 1: Low Risk */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded">
                    Score: 0 – 19
                  </span>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Few Risk Indicators Detected</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  The link resides on an official institutional domain or uses standard secure transport with clean threat reputation.
                </p>
              </div>
              <div className="text-xs text-slate-500 border-t border-slate-100 pt-3">
                <span className="font-semibold text-slate-700">Action: </span>
                Verify the deadline on the institution's official registrar page.
              </div>
            </div>

            {/* Outcome 2: Caution */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded">
                    Score: 20 – 49
                  </span>
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Caution Required</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Domain is unindexed, newly created, uses free third-party form builders, or evidence was insufficient to verify the provider.
                </p>
              </div>
              <div className="text-xs text-slate-500 border-t border-slate-100 pt-3">
                <span className="font-semibold text-slate-700">Action: </span>
                Do not enter sensitive documents until verified via university faculty.
              </div>
            </div>

            {/* Outcome 3: High / Very High */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-rose-800 bg-rose-50 px-2.5 py-1 rounded">
                    Score: 50 – 100
                  </span>
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">High / Very High Risk</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Evidence of credential harvesting (OTP, PIN), advance application fees, known malicious signatures, or brand typosquatting.
                </p>
              </div>
              <div className="text-xs text-slate-500 border-t border-slate-100 pt-3">
                <span className="font-semibold text-rose-700">Action: </span>
                Exit immediately. Never send money or confidential authentication secrets.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Official Sources Strip */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Official Scholarship Authorities</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Integrated with Indian National Scholarship Portal (scholarships.gov.in), UGC, AICTE, and premier international trusts.
            </p>
          </div>
          <button
            onClick={() => onNavigate('scholarships')}
            className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap"
          >
            Search Official Schemes
          </button>
        </div>
      </section>
    </div>
  );
};
