import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Copy, 
  Check, 
  Share2, 
  ArrowLeft, 
  ExternalLink,
  Lock,
  Globe,
  FileSearch,
  MessageSquare,
  AlertCircle,
  Printer,
  Award
} from 'lucide-react';
import { RiskReport } from '../types';

interface ReportPageProps {
  report: RiskReport;
  onBackToScanner: () => void;
}

export const ReportPage: React.FC<ReportPageProps> = ({ report, onBackToScanner }) => {
  const [copied, setCopied] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'false_positive' | 'false_negative' | 'general_correction'>('false_positive');
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const getScoreColor = (score: number, critical: boolean) => {
    if (critical || score >= 75) return 'text-rose-600 bg-rose-50 border-rose-200';
    if (score >= 50) return 'text-rose-500 bg-rose-50 border-rose-200';
    if (score >= 20) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  };

  const getCategoryBadge = (category: string, critical: boolean) => {
    if (critical || category === 'very_high') {
      return {
        bg: 'bg-rose-100 text-rose-800 border-rose-300',
        icon: <ShieldAlert className="w-4 h-4 text-rose-600" />
      };
    }
    if (category === 'high') {
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: <ShieldAlert className="w-4 h-4 text-rose-600" />
      };
    }
    if (category === 'caution') {
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        icon: <AlertTriangle className="w-4 h-4 text-amber-600" />
      };
    }
    return {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />
    };
  };

  const handleCopySummary = () => {
    const text = `
=== ScholarShield AI - Security Risk Assessment ===
Submitted URL: ${report.submittedUrl}
Final Destination: ${report.finalDestinationUrl}
Scan Timestamp: ${new Date(report.scanTimestamp).toLocaleString()}
Overall Risk Score: ${report.overallScore}/100 (${report.riskCategoryLabel})
Critical Warning: ${report.criticalWarning ? report.criticalWarningReason : 'None'}

Key Summary:
${report.aiExecutiveSummary}

Contributing Factors:
${report.contributingFactors.map(f => `- ${f.description}: ${f.points > 0 ? '+' : ''}${f.points} pts (${f.agent})`).join('\n')}

Checks Passed: ${report.checksPassed.length} | Failed: ${report.checksFailed.length} | Unable to verify: ${report.checksUnableToVerify.length}

Recommended Next Steps:
${report.recommendedSteps.map((s, idx) => `${idx + 1}. ${s}`).join('\n')}

Disclaimer: No automated tool guarantees 100% safety. Verify claims independently.
=== End of Report ===
`.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackNotes.trim()) return;

    setSubmittingFeedback(true);
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scanId: report.id,
          url: report.submittedUrl,
          type: feedbackType,
          userNotes: feedbackNotes,
          userEmail: feedbackEmail
        })
      });
      setSubmittingFeedback(false);
      setFeedbackSubmitted(true);
    } catch {
      setSubmittingFeedback(false);
    }
  };

  const badge = getCategoryBadge(report.riskCategory, report.criticalWarning);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <button
          onClick={onBackToScanner}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Scanner</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCertificateModal(true)}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-blue-600" />
            <span>Audit Certificate</span>
          </button>

          <button
            onClick={handleCopySummary}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5 shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? 'Summary Copied!' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={() => setShowFeedbackModal(true)}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5 shadow-sm"
          >
            <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
            <span>Report False Positive</span>
          </button>
        </div>
      </div>

      {/* Prominent Critical Warning Banner (Mandatory requirement when critical credentials or malware flagged) */}
      {report.criticalWarning && (
        <div className="p-4 sm:p-5 rounded-xl bg-rose-50 border-2 border-rose-500 text-rose-900 shadow-sm flex items-start gap-4">
          <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-rose-950 uppercase tracking-wide">
              Critical Security Warning Flagged
            </h3>
            <p className="text-xs sm:text-sm text-rose-900 mt-1 font-medium leading-relaxed">
              {report.criticalWarningReason}
            </p>
            <p className="text-xs text-rose-800 mt-2">
              <span className="font-bold">Immediate Recommendation: </span>
              Under no circumstances should you provide your UPI PIN, banking passwords, Aadhaar OTP, or transfer application registration fees.
            </p>
          </div>
        </div>
      )}

      {/* Score and Main Findings Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center border-b border-slate-100">
          
          {/* Risk Gauge / Numerical Box */}
          <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-6 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Overall Risk Score</span>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-5xl sm:text-6xl font-extrabold font-mono tracking-tight text-slate-900 tabular-nums">
                {report.overallScore}
              </span>
              <span className="text-slate-400 font-mono text-xl">/100</span>
            </div>

            <div className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.bg}`}>
              {badge.icon}
              <span>{report.riskCategoryLabel}</span>
            </div>

            <p className="text-[11px] text-slate-500 mt-3 leading-tight">
              Calculated via deterministic rule weights. 0-19: Low Risk · 20-49: Caution · 50-100: High Risk
            </p>
          </div>

          {/* Details & Target summary */}
          <div className="md:col-span-8 space-y-4">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Submitted Target</span>
              <div className="font-mono text-sm text-slate-900 break-all font-medium mt-0.5">
                {report.submittedUrl}
              </div>
            </div>

            {report.finalDestinationUrl && report.finalDestinationUrl !== report.submittedUrl && (
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Resolved Final Destination</span>
                <div className="font-mono text-xs text-slate-700 break-all bg-slate-50 p-2 rounded border border-slate-200 mt-0.5">
                  {report.finalDestinationUrl}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              <span>Scan Date: <strong className="text-slate-700 font-mono tabular-nums">{new Date(report.scanTimestamp).toLocaleString()}</strong></span>
              <span>·</span>
              <span>Host: <strong className="text-slate-700 font-mono">{report.domainAnalysis.hostname || 'N/A'}</strong></span>
              <span>·</span>
              <span>Protocol: <strong className={report.domainAnalysis.isHttps ? 'text-emerald-700 font-medium' : 'text-rose-600 font-medium'}>{report.domainAnalysis.isHttps ? 'HTTPS (Encrypted)' : 'HTTP (Plaintext)'}</strong></span>
            </div>

            {/* AI Executive Summary */}
            <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-lg">
              <span className="text-xs font-bold text-blue-900 block mb-1">Executive Assessment Briefing</span>
              <p className="text-xs text-slate-700 leading-relaxed">
                {report.aiExecutiveSummary}
              </p>
            </div>
          </div>

        </div>

        {/* Explainable Contributing Factors Breakdown */}
        <div className="p-6 bg-slate-50/60">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
            Explainable Factor Breakdown (Deterministic Scoring Weights)
          </h4>
          <div className="space-y-2">
            {report.contributingFactors.length === 0 ? (
              <p className="text-xs text-slate-500">No adverse risk weights were triggered during this inspection.</p>
            ) : (
              report.contributingFactors.map((factor, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs p-2.5 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono text-[11px]">#{idx + 1}</span>
                    <span className="text-slate-800 font-medium">{factor.description}</span>
                    <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {factor.agent}
                    </span>
                  </div>
                  <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs tabular-nums ${factor.points > 0 ? 'text-rose-700 bg-rose-50' : 'text-emerald-700 bg-emerald-50'}`}>
                    {factor.points > 0 ? `+${factor.points}` : factor.points} pts
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Grid of Agent Inspection Domains */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Domain & Transport Analysis */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Globe className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Domain & Transport Findings</h3>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Target Hostname</span>
              <span className="font-mono text-slate-800 font-medium">{report.domainAnalysis.hostname || 'None'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Top-Level Domain (TLD)</span>
              <span className="font-mono text-slate-800 font-medium">.{report.domainAnalysis.tld || 'None'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Transport Layer Security</span>
              <span className={report.domainAnalysis.isHttps ? 'text-emerald-600 font-medium' : 'text-rose-600 font-medium'}>
                {report.domainAnalysis.isHttps ? 'HTTPS Enforced' : 'Unencrypted HTTP'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Subdomain Layer Depth</span>
              <span className="font-mono text-slate-800">{report.domainAnalysis.subdomainDepth} levels</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Redirect Hops Observed</span>
              <span className="font-mono text-slate-800">{report.domainAnalysis.redirectCount} hops</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Typosquatting Mimicry</span>
              <span className={report.domainAnalysis.typosquattingDetected ? 'text-rose-600 font-semibold' : 'text-emerald-600'}>
                {report.domainAnalysis.typosquattingDetected ? `Targeting ${report.domainAnalysis.typosquattingTarget}` : 'No mimicry detected'}
              </span>
            </div>
          </div>
        </div>

        {/* URL Reputation Findings */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Lock className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">URL Threat Reputation</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Threat Intel Service</span>
              <span className="font-medium text-slate-800">{report.urlReputation.serviceName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Reputation Verdict</span>
              <span className={`font-bold uppercase ${report.urlReputation.isBlacklisted ? 'text-rose-600' : 'text-emerald-600'}`}>
                {report.urlReputation.status}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block mb-1.5 font-medium">Reputation Intelligence Log:</span>
              {report.urlReputation.findings.length > 0 ? (
                <ul className="space-y-1">
                  {report.urlReputation.findings.map((f, i) => (
                    <li key={i} className="text-rose-700 bg-rose-50 p-2 rounded border border-rose-200">
                      {f}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-200">
                  No active blacklists or malicious threat feed alerts recorded for this destination.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scholarship Verification Status */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Official Scholarship Verification</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Verification Status</span>
              <span className={`font-bold ${
                report.scholarshipVerification.status === 'verified_official' ? 'text-emerald-600' :
                report.scholarshipVerification.status === 'conflicting_claims' ? 'text-rose-600' :
                'text-amber-600'
              }`}>
                {report.scholarshipVerification.status === 'verified_official' ? 'Official Authority Verified' :
                 report.scholarshipVerification.status === 'conflicting_claims' ? 'Conflicting Official Records' :
                 'Unable to Verify in Central Index'}
              </span>
            </div>

            <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-200">
              {report.scholarshipVerification.notes}
            </p>

            {report.scholarshipVerification.matchedOfficialRecord && (
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-1.5">
                <span className="font-bold text-emerald-900 block text-xs">Matched Scheme Record:</span>
                <p className="font-semibold text-slate-900 text-xs">{report.scholarshipVerification.matchedOfficialRecord.name}</p>
                <p className="text-[11px] text-slate-600">Provider: {report.scholarshipVerification.matchedOfficialRecord.provider}</p>
                {report.scholarshipVerification.matchedOfficialRecord.stipendAmount && (
                  <p className="text-[11px] text-slate-600">Official Amount: {report.scholarshipVerification.matchedOfficialRecord.stipendAmount}</p>
                )}
                <a
                  href={report.scholarshipVerification.matchedOfficialRecord.officialPortalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-emerald-800 font-semibold hover:underline inline-flex items-center gap-1 mt-1"
                >
                  <span>Official Portal Link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Google Form Content Analysis */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileSearch className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Google Form Content Analysis</h3>
          </div>

          {report.googleFormAnalysis ? (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Form Hosting Type</span>
                <span className="font-medium text-slate-800">Public Form Builder</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Public Question Scrape</span>
                <span className={report.googleFormAnalysis.isPubliclyAccessible ? 'text-emerald-600 font-medium' : 'text-amber-600 font-medium'}>
                  {report.googleFormAnalysis.isPubliclyAccessible ? 'Content Retrieved' : 'Protected / Requires Sign-In'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Fee / Payment Solicitation</span>
                <span className={report.googleFormAnalysis.demandsPayment ? 'text-rose-600 font-bold' : 'text-emerald-600'}>
                  {report.googleFormAnalysis.demandsPayment ? 'Payment Solicited' : 'No Payment Demanded'}
                </span>
              </div>

              {report.googleFormAnalysis.detectedSensitiveFields.length > 0 && (
                <div>
                  <span className="text-rose-700 font-bold block mb-1">Confidential Fields Demanded:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {report.googleFormAnalysis.detectedSensitiveFields.map((field, i) => (
                      <span key={i} className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-medium text-[11px]">
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-slate-500 bg-slate-50 p-4 rounded-lg border border-slate-200">
              The submitted destination is a standard web portal, not a hosted Google or Microsoft Form.
            </div>
          )}
        </div>

      </div>

      {/* Comprehensive Security Checks: Passed, Failed, and Unable to Verify */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">Detailed Security Checks Audit</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Individual audit checks categorized by status. Untested or inaccessible endpoints are honestly marked as "Unable to verify".
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Passed Checks */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Checks Passed ({report.checksPassed.length})</span>
            </div>
            <ul className="space-y-2">
              {report.checksPassed.map((chk) => (
                <li key={chk.id} className="p-3 bg-white border border-slate-200 rounded-lg text-xs">
                  <div className="font-semibold text-slate-900">{chk.name}</div>
                  <div className="text-slate-600 mt-1 text-[11px] leading-relaxed">{chk.details}</div>
                </li>
              ))}
            </ul>
          </div>

          {/* Failed Checks */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-200">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>Checks Failed ({report.checksFailed.length})</span>
            </div>
            <ul className="space-y-2">
              {report.checksFailed.length === 0 ? (
                <li className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500">
                  No failed checks recorded.
                </li>
              ) : (
                report.checksFailed.map((chk) => (
                  <li key={chk.id} className="p-3 bg-rose-50/50 border border-rose-200 rounded-lg text-xs">
                    <div className="font-semibold text-rose-950">{chk.name}</div>
                    <div className="text-rose-800 mt-1 text-[11px] leading-relaxed">{chk.details}</div>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Unable to Verify */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <HelpCircle className="w-4 h-4 text-slate-500" />
              <span>Unable to Verify ({report.checksUnableToVerify.length})</span>
            </div>
            <ul className="space-y-2">
              {report.checksUnableToVerify.length === 0 ? (
                <li className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500">
                  All expected checks were executed.
                </li>
              ) : (
                report.checksUnableToVerify.map((chk) => (
                  <li key={chk.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                    <div className="font-semibold text-slate-800">{chk.name}</div>
                    <div className="text-slate-600 mt-1 text-[11px] leading-relaxed">{chk.details}</div>
                  </li>
                ))
              )}
            </ul>
          </div>

        </div>
      </div>

      {/* Recommended Next Steps */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900">Recommended Action Plan for Students</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {report.recommendedSteps.map((step, idx) => (
            <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                {idx + 1}
              </span>
              <p className="text-slate-800 leading-relaxed font-medium">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Evidence Sources & Retrieval Log */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Evidence Sources & Provenance</h3>
        <div className="space-y-2">
          {report.evidenceSources.map((source, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between text-xs py-2 border-b border-slate-100 last:border-b-0 gap-1">
              <div>
                <span className="font-semibold text-slate-900">{source.title}</span>
                {source.url && (
                  <span className="font-mono text-slate-500 text-[11px] block sm:inline sm:ml-2 truncate max-w-md">
                    {source.url}
                  </span>
                )}
              </div>
              <span className="font-mono text-slate-400 text-[11px] shrink-0">
                {new Date(source.retrievedAt).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* False Positive Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Submit Risk Report Feedback</h3>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            {feedbackSubmitted ? (
              <div className="p-4 bg-emerald-50 rounded-lg text-emerald-800 text-xs space-y-2 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="font-bold text-sm">Feedback Recorded</p>
                <p>Thank you. Our cyber threat review team will evaluate this URL against the ground truth dataset.</p>
                <button
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setFeedbackSubmitted(false);
                  }}
                  className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded font-semibold text-xs"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitFeedback} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Feedback Category</label>
                  <select
                    value={feedbackType}
                    onChange={(e: any) => setFeedbackType(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-300 text-xs"
                  >
                    <option value="false_positive">False Positive (Marked too risky, it is legitimate)</option>
                    <option value="false_negative">False Negative (Marked too safe, it is a scam)</option>
                    <option value="general_correction">Data Correction (Outdated date/amount)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Your Explanation / Evidence</label>
                  <textarea
                    rows={3}
                    required
                    value={feedbackNotes}
                    onChange={(e) => setFeedbackNotes(e.target.value)}
                    placeholder="Provide details, official press release links, or university confirmation..."
                    className="w-full px-3 py-2 rounded border border-slate-300 text-xs focus:ring-1 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email for Follow-up (Optional)</label>
                  <input
                    type="email"
                    value={feedbackEmail}
                    onChange={(e) => setFeedbackEmail(e.target.value)}
                    placeholder="your-email@college.edu"
                    className="w-full px-3 py-2 rounded border border-slate-300 text-xs focus:ring-1 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowFeedbackModal(false)}
                    className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingFeedback}
                    className="px-4 py-2 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 disabled:opacity-60"
                  >
                    {submittingFeedback ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Printable Security Audit Certificate Modal */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-8 shadow-2xl border border-slate-300 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">ScholarShield AI Security Audit Certificate</h3>
              </div>
              <button
                onClick={() => setShowCertificateModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            {/* Printable Frame */}
            <div className="p-6 rounded-xl border-2 border-slate-300 bg-slate-50 space-y-4 text-xs font-sans">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-xs font-extrabold text-[#14213D] block">SCHOLARSHIELD AI DEFENSE ENGINE</span>
                  <span className="text-[10px] text-slate-500 font-mono">AUDIT HASH: #{report.id.toUpperCase()}</span>
                </div>
                <div className={`px-2.5 py-1 rounded text-xs font-bold border ${
                  report.overallScore >= 50 || report.criticalWarning ? 'bg-rose-100 text-rose-800 border-rose-300' :
                  report.overallScore >= 20 ? 'bg-amber-100 text-amber-800 border-amber-300' :
                  'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}>
                  {report.riskCategoryLabel} ({report.overallScore}/100)
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Evaluated Destination URL</span>
                  <p className="font-mono text-xs text-slate-900 break-all font-semibold">{report.submittedUrl}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Inspection Date & Time</span>
                    <span className="font-mono font-medium text-slate-800">{new Date(report.scanTimestamp).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Transport Security Protocol</span>
                    <span className="font-mono font-medium text-slate-800">{report.domainAnalysis.isHttps ? 'HTTPS (TLS Enforced)' : 'Plaintext HTTP (Insecure)'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Official Scholarship Registry</span>
                    <span className="font-medium text-slate-800">{report.scholarshipVerification.status.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Threat Intelligence Signature</span>
                    <span className="font-medium text-slate-800">{report.urlReputation.isBlacklisted ? 'FLAGGED AS MALICIOUS' : 'CLEAN / UNFLAGGED'}</span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded border border-slate-200 text-[11px] text-slate-700 leading-relaxed">
                  <strong>Assessment Summary: </strong>
                  {report.aiExecutiveSummary}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Verified by Multi-Agent Security Engine</span>
                <span>Audit ID: {report.id}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCertificateModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Audit Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
