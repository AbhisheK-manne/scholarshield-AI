import React, { useState, useEffect } from 'react';
import { 
  Search, 
  RotateCcw, 
  History, 
  AlertCircle, 
  ShieldCheck, 
  ShieldAlert, 
  FileText, 
  Loader2, 
  XCircle,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { RiskReport } from '../types';

interface ScannerPageProps {
  initialUrl?: string;
  onScanComplete: (report: RiskReport) => void;
  onViewHistory: () => void;
}

const SCAN_STAGES = [
  'Validating URL syntax & enforcing SSRF isolation',
  'Inspecting HTTPS encryption & tracing safe redirects',
  'Analyzing form contents & scanning for credential/OTP requests',
  'Cross-referencing National Scholarship Portal (scholarships.gov.in) & trust registry',
  'Evaluating threat intelligence & calculating deterministic risk score'
];

export const ScannerPage: React.FC<ScannerPageProps> = ({ 
  initialUrl = '', 
  onScanComplete, 
  onViewHistory 
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [scholarshipName, setScholarshipName] = useState('');
  const [claimedOrg, setClaimedOrg] = useState('');
  const [contextDescription, setContextDescription] = useState('');
  const [userProvidedFormText, setUserProvidedFormText] = useState('');
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [showFormPasteTab, setShowFormPasteTab] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (initialUrl) {
      setUrl(initialUrl);
    }
  }, [initialUrl]);

  // Stage animation during scanning
  useEffect(() => {
    let interval: any;
    if (isLoading) {
      interval = setInterval(() => {
        setCurrentStageIndex((prev) => (prev < SCAN_STAGES.length - 1 ? prev + 1 : prev));
      }, 700);
    } else {
      setCurrentStageIndex(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const validateUrl = (input: string): { valid: boolean; error?: string } => {
    if (!input || !input.trim()) {
      return { valid: false, error: 'Please enter a URL to scan.' };
    }
    const clean = input.trim();
    if (clean.startsWith('javascript:') || clean.startsWith('data:') || clean.startsWith('file:') || clean.startsWith('blob:')) {
      return { valid: false, error: 'Unsupported and unsafe protocol scheme rejected.' };
    }
    try {
      const parsed = new URL(clean.startsWith('http://') || clean.startsWith('https://') ? clean : `https://${clean}`);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return { valid: false, error: 'Only HTTP and HTTPS URLs are accepted.' };
      }
      return { valid: true };
    } catch {
      return { valid: false, error: 'The entered URL format is malformed.' };
    }
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    const validation = validateUrl(targetUrl);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid URL');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: targetUrl,
          scholarshipName: scholarshipName.trim() || undefined,
          claimedOrganization: claimedOrg.trim() || undefined,
          contextDescription: contextDescription.trim() || undefined,
          userProvidedFormText: userProvidedFormText.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete security scan.');
      }

      setIsLoading(false);
      onScanComplete(data.report);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Unable to scan target link. Please check network connection.');
    }
  };

  const handleClear = () => {
    setUrl('');
    setScholarshipName('');
    setClaimedOrg('');
    setContextDescription('');
    setUserProvidedFormText('');
    setErrorMessage('');
  };

  const sampleScans = [
    {
      title: 'Official NSP National Scheme',
      url: 'https://scholarships.gov.in',
      name: 'Central Sector Scheme of Scholarships',
      org: 'Ministry of Education'
    },
    {
      title: 'Fake Google Form (Requests UPI PIN)',
      url: 'https://forms.gle/xK99fakeScholarshipWinUPI',
      name: 'All India Student Relief Grant 2026',
      org: 'Student Aid Foundation'
    },
    {
      title: 'Typosquatted Phishing Domain',
      url: 'http://scholarsh1ps-gov-in.free-apply-portal.xyz/student-login.php',
      name: 'National Scholarship Portal 2.0',
      org: 'Govt of India Impersonator'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14213D] tracking-tight">
          Link & Google Form Scanner
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
          Submit any scholarship link, Google Form, or registration website. Our 5-agent security pipeline evaluates domain hygiene, phishing heuristics, credential theft risks, and official registry citations.
        </p>
      </div>

      {/* Main Scanner Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <form onSubmit={handleScan} className="space-y-5">
          {/* URL Input */}
          <div>
            <label htmlFor="scan-url" className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Scholarship Website or Form URL <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="scan-url"
                type="text"
                disabled={isLoading}
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="https://scholarships.gov.in or https://forms.gle/..."
                className="w-full px-4 py-3 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition disabled:bg-slate-50 text-slate-900 font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Accepts standard HTTP/HTTPS links and Google Forms (forms.gle or docs.google.com/forms).
            </p>
          </div>

          {/* Toggle Optional Context */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowOptionalFields(!showOptionalFields)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
            >
              <span>{showOptionalFields ? 'Hide' : 'Add'} claimed scheme details & message context</span>
              {showOptionalFields ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Collapsible Context Inputs */}
          {showOptionalFields && (
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="sch-name" className="block text-xs font-semibold text-slate-700 mb-1">
                    Claimed Scholarship Name (Optional)
                  </label>
                  <input
                    id="sch-name"
                    type="text"
                    value={scholarshipName}
                    onChange={(e) => setScholarshipName(e.target.value)}
                    placeholder="e.g. AICTE Pragati Scholarship"
                    className="w-full px-3 py-2 text-xs rounded border border-slate-300 focus:ring-1 focus:ring-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="claimed-org" className="block text-xs font-semibold text-slate-700 mb-1">
                    Claimed Organization (Optional)
                  </label>
                  <input
                    id="claimed-org"
                    type="text"
                    value={claimedOrg}
                    onChange={(e) => setClaimedOrg(e.target.value)}
                    placeholder="e.g. Ministry of Education / Tata Trusts"
                    className="w-full px-3 py-2 text-xs rounded border border-slate-300 focus:ring-1 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="msg-context" className="block text-xs font-semibold text-slate-700 mb-1">
                  Message or WhatsApp Text Received with Link (Optional)
                </label>
                <textarea
                  id="msg-context"
                  rows={2}
                  value={contextDescription}
                  onChange={(e) => setContextDescription(e.target.value)}
                  placeholder="Paste accompanying message to inspect for advance-fee requests, urgent deadlines, or suspicious WhatsApp forwards..."
                  className="w-full px-3 py-2 text-xs rounded border border-slate-300 focus:ring-1 focus:ring-blue-600 outline-none"
                />
              </div>
            </div>
          )}

          {/* Optional Form Paste Tab (for private Google Forms) */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowFormPasteTab(!showFormPasteTab)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Is this Google Form private or requiring login? Paste questions manually</span>
              {showFormPasteTab ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showFormPasteTab && (
              <div className="mt-2 p-4 bg-amber-50/60 rounded-lg border border-amber-200/80">
                <p className="text-xs text-amber-900 mb-2">
                  <span className="font-semibold">Privacy-Respecting Inspection: </span>
                  ScholarShield AI never attempts to bypass Google sign-in screens. If the form requires login, paste the form description or question text here for deep analysis.
                </p>
                <textarea
                  rows={3}
                  value={userProvidedFormText}
                  onChange={(e) => setUserProvidedFormText(e.target.value)}
                  placeholder="Paste question titles or form text (e.g., 'Enter your UPI PIN to receive ₹50,000 scholarship payment', 'Upload Aadhaar card front & back', etc.)..."
                  className="w-full px-3 py-2 text-xs rounded border border-amber-300 bg-white focus:ring-1 focus:ring-amber-600 outline-none"
                />
              </div>
            )}
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors flex items-center gap-2 shadow-sm disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Scanning Link...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Scan Link</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={handleClear}
                className="px-4 py-2.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onViewHistory}
              className="text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center gap-1.5 transition-colors"
            >
              <History className="w-4 h-4" />
              <span>Previous Reports</span>
            </button>
          </div>
        </form>

        {/* Real Live Scanning Progress Box */}
        {isLoading && (
          <div className="mt-8 pt-6 border-t border-slate-200 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Multi-Agent Security Pipeline Active</span>
              <span className="text-slate-500 font-mono">Stage {currentStageIndex + 1} of 5</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-blue-600 h-2 transition-all duration-500 rounded-full"
                style={{ width: `${((currentStageIndex + 1) / SCAN_STAGES.length) * 100}%` }}
              ></div>
            </div>

            {/* Stage items */}
            <div className="space-y-2 pt-2">
              {SCAN_STAGES.map((stage, idx) => {
                const isCurrent = idx === currentStageIndex;
                const isDone = idx < currentStageIndex;
                return (
                  <div key={idx} className="flex items-center gap-2.5 text-xs">
                    {isDone ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0"></div>
                    )}
                    <span className={isCurrent ? 'font-semibold text-blue-900' : isDone ? 'text-slate-700' : 'text-slate-400'}>
                      {stage}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="text-right pt-2">
              <button
                type="button"
                onClick={() => setIsLoading(false)}
                className="text-xs text-slate-500 hover:text-rose-600 transition-colors"
              >
                Cancel Scan
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Preset Test Scenarios */}
      <div className="mt-8">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
          Quick Verification Scenarios (1-Click Fill)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {sampleScans.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setUrl(sample.url);
                setScholarshipName(sample.name);
                setClaimedOrg(sample.org);
                setShowOptionalFields(true);
              }}
              className="text-left p-3 rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all"
            >
              <div className="text-xs font-semibold text-slate-900">{sample.title}</div>
              <div className="text-[11px] text-slate-500 truncate font-mono mt-0.5">{sample.url}</div>
              <div className="text-[10px] text-blue-600 mt-1">Fill form & test</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
