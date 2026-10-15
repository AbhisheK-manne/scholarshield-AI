import React, { useState } from 'react';
import { 
  MessageSquare, 
  Search, 
  RotateCcw, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  ExternalLink, 
  Loader2, 
  ArrowRight,
  Sparkles,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';
import { MessageAnalysisResult, RiskReport } from '../types';

interface MessageAnalyzerPageProps {
  onViewReport: (report: RiskReport) => void;
}

export const MessageAnalyzerPage: React.FC<MessageAnalyzerPageProps> = ({ onViewReport }) => {
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<MessageAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const sampleMessages = [
    {
      title: 'WhatsApp Advance-Fee Scam',
      text: 'Congratulations! 🎉 You have been selected for PM National Youth Merit Scholarship of ₹75,000 cash grant. No exam needed! To confirm your seat, pay ₹299 registration fee via PhonePe/GPay QR code before 12 PM today: https://forms.gle/xK99fakeScholarshipWinUPI'
    },
    {
      title: 'SMS Typosquatting Phishing Lure',
      text: 'URGENT ALERT: All India Free Laptop & ₹1 Lakh Student Welfare Scheme closing in 2 hours! Only 50 seats left. Submit Aadhaar & mobile to claim: http://scholarsh1ps-gov-in.free-apply-portal.xyz/student-login.php'
    },
    {
      title: 'Authentic NSP Official Notification',
      text: 'National Scholarship Portal (Govt of India): Online applications for Central Sector Scheme of Scholarship for College and University Students are open. Apply free of cost directly at official portal https://scholarships.gov.in. No fee or OTP is ever requested.'
    }
  ];

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) {
      setErrorMsg('Please paste message text to analyze.');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/analyze-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageText: messageText.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze message.');
      }
      setAnalysisResult(data);
      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Error connecting to analysis engine.');
    }
  };

  const handleClear = () => {
    setMessageText('');
    setAnalysisResult(null);
    setErrorMsg('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded mb-2">
          <MessageSquare className="w-4 h-4 text-blue-600" />
          <span>WhatsApp, SMS & Social Media Phishing Inspector</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14213D] tracking-tight">
          Scholarship Message & Forward Analyzer
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
          Received an unexpected WhatsApp forward, Telegram notice, or SMS promising a scholarship or free laptop? Paste the text here. Our analyzer extracts embedded links, checks for advance-fee traps, detects psychological urgency triggers, and verifies claimed schemes against official government guidelines.
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div>
            <label htmlFor="msg-input" className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Message or Forwarded Text <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="msg-input"
              rows={5}
              value={messageText}
              onChange={(e) => {
                setMessageText(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="Paste the full WhatsApp message, SMS alert, or email received (including any links)..."
              className="w-full p-3.5 text-xs sm:text-sm text-slate-900 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none leading-relaxed"
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{errorMsg}</span>
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-sm disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Auditing Message Content & Embedded URLs...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Analyze Message Security</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="px-3.5 py-2.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>

            <div className="text-xs text-slate-400">
              Safe & confidential · No phone numbers or names stored
            </div>
          </div>
        </form>

        {/* Quick Sample Messages */}
        <div className="pt-4 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-500 block mb-2">Try Real-World Sample Messages:</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {sampleMessages.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setMessageText(sample.text);
                  if (errorMsg) setErrorMsg('');
                }}
                className="p-2.5 text-left rounded-lg bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 transition text-xs"
              >
                <div className="font-semibold text-slate-900">{sample.title}</div>
                <div className="text-[11px] text-slate-500 line-clamp-2 mt-1">{sample.text}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Analysis Results View */}
      {analysisResult && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Main Risk Score Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Threat Verdict</span>
                <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                  {analysisResult.riskCategoryLabel}
                </h2>
              </div>

              <div className="flex items-center gap-3 self-start sm:self-auto">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Risk Score</span>
                  <span className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
                    {analysisResult.overallRiskScore}/100
                  </span>
                </div>
                <div className={`p-2.5 rounded-lg border ${
                  analysisResult.criticalWarning || analysisResult.overallRiskScore >= 50
                    ? 'bg-rose-50 text-rose-600 border-rose-200'
                    : analysisResult.overallRiskScore >= 20
                    ? 'bg-amber-50 text-amber-600 border-amber-200'
                    : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                }`}>
                  {analysisResult.criticalWarning || analysisResult.overallRiskScore >= 50 ? (
                    <ShieldAlert className="w-6 h-6" />
                  ) : analysisResult.overallRiskScore >= 20 ? (
                    <AlertTriangle className="w-6 h-6" />
                  ) : (
                    <ShieldCheck className="w-6 h-6" />
                  )}
                </div>
              </div>
            </div>

            {/* Critical Warning Alert */}
            {analysisResult.criticalWarning && (
              <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-500 text-rose-950 text-xs sm:text-sm font-medium flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold uppercase tracking-wide block text-rose-900 text-xs mb-1">
                    Severe Threat Indicators Detected
                  </span>
                  {analysisResult.summary}
                </div>
              </div>
            )}

            {/* Trigger Indicators Detected in Message */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Psychological Triggers & Red Flags Flagged ({analysisResult.detectedTriggers.length})
              </h3>
              
              {analysisResult.detectedTriggers.length === 0 ? (
                <p className="text-xs text-slate-500 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  No explicit advance-fee demands or coercive psychological keywords detected in the message prose.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {analysisResult.detectedTriggers.map((trig, idx) => (
                    <div key={idx} className="p-3 rounded-lg border bg-slate-50 border-slate-200 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          trig.severity === 'critical' ? 'bg-rose-100 text-rose-800' :
                          trig.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {trig.category.replace('_', ' ')}
                        </span>
                        <span className="font-mono text-slate-500 text-[11px]">Matched Phrase</span>
                      </div>
                      <div className="font-semibold text-rose-950 font-mono text-[11px] bg-white px-2 py-1 rounded border border-slate-200">
                        "{trig.phrase}"
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed pt-0.5">
                        {trig.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Scheme Conflict if verified */}
            {analysisResult.schemeConflict && (
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-300 text-xs text-amber-950 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Conflict with Official Statutory Guidelines Detected</span>
                </div>
                <p className="font-semibold">Claimed Scheme: {analysisResult.schemeConflict.claimedSchemeName}</p>
                <p className="text-slate-700 leading-relaxed">{analysisResult.schemeConflict.officialPolicyNotice}</p>
              </div>
            )}

            {/* Extracted Embedded URLs and Multi-Agent Results */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Embedded URLs Extracted & Analyzed ({analysisResult.extractedUrls.length})
              </h3>
              
              {analysisResult.extractedUrls.length === 0 ? (
                <p className="text-xs text-slate-500 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  No embedded web links found in the text.
                </p>
              ) : (
                <div className="space-y-3">
                  {analysisResult.analyzedUrlReports.map((report) => (
                    <div key={report.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-400 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1 min-w-0">
                        <div className="font-mono text-slate-900 font-medium truncate max-w-lg">
                          {report.submittedUrl}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span>Host: {report.domainAnalysis.hostname}</span>
                          <span>·</span>
                          <span className={report.domainAnalysis.isHttps ? 'text-emerald-700' : 'text-rose-600 font-semibold'}>
                            {report.domainAnalysis.isHttps ? 'HTTPS' : 'Plain HTTP (Unsafe)'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className={`font-mono font-bold px-2.5 py-1 rounded text-xs tabular-nums ${
                            report.overallScore >= 50 || report.criticalWarning ? 'bg-rose-100 text-rose-800' :
                            report.overallScore >= 20 ? 'bg-amber-100 text-amber-800' :
                            'bg-emerald-100 text-emerald-800'
                          }`}>
                            {report.overallScore}/100 Risk
                          </span>
                        </div>
                        <button
                          onClick={() => onViewReport(report)}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded font-semibold text-xs hover:bg-blue-700 transition flex items-center gap-1 shadow-sm"
                        >
                          <span>Full Audit Report</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Action Steps for Students
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {analysisResult.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
