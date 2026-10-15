import React, { useState } from 'react';
import { 
  Layers, 
  Search, 
  Download, 
  RotateCcw, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Loader2, 
  ArrowRight,
  FileSpreadsheet
} from 'lucide-react';
import { BatchScanResult, RiskReport } from '../types';

interface BatchScannerPageProps {
  onViewReport: (report: RiskReport) => void;
}

export const BatchScannerPage: React.FC<BatchScannerPageProps> = ({ onViewReport }) => {
  const [urlsInput, setUrlsInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [batchResult, setBatchResult] = useState<BatchScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const sampleBatch = `https://scholarships.gov.in
http://scholarsh1ps-gov-in.free-apply-portal.xyz/student-login.php
https://forms.gle/xK99fakeScholarshipWinUPI
https://www.aicte-india.org
https://www.reliancefoundation.org/scholarships`;

  const handleScanBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    const urls = urlsInput
      .split('\n')
      .map(u => u.trim())
      .filter(u => u.length > 0);

    if (urls.length === 0) {
      setErrorMsg('Please enter at least one URL (one per line).');
      return;
    }
    if (urls.length > 10) {
      setErrorMsg('Maximum 10 URLs allowed per batch scan.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/scan/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Batch scan failed.');
      }
      setBatchResult(data);
      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Error processing batch scan.');
    }
  };

  const handleExportCSV = () => {
    if (!batchResult || batchResult.reports.length === 0) return;

    const headers = ['URL', 'Host', 'Risk Score', 'Category', 'Critical Warning', 'HTTPS', 'Verified Scheme'];
    const rows = batchResult.reports.map(r => [
      `"${r.submittedUrl}"`,
      `"${r.domainAnalysis.hostname}"`,
      r.overallScore,
      `"${r.riskCategoryLabel}"`,
      r.criticalWarning ? 'YES' : 'NO',
      r.domainAnalysis.isHttps ? 'HTTPS' : 'HTTP',
      `"${r.scholarshipVerification.matchedOfficialRecord?.name || r.scholarshipVerification.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `scholarshield_audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded mb-2">
          <Layers className="w-4 h-4 text-purple-600" />
          <span>Counselor & Campus Security Audit Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14213D] tracking-tight">
          Batch URL Security Scanner
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
          Audit up to 10 scholarship links, registration URLs, or Google Forms in a single automated scan. Ideal for university financial aid offices, student grievance committees, and college counselor teams.
        </p>
      </div>

      {/* Input Box */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <form onSubmit={handleScanBatch} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="batch-urls" className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                URLs to Scan (One per line, up to 10) <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setUrlsInput(sampleBatch)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                Insert Sample Batch
              </button>
            </div>
            <textarea
              id="batch-urls"
              rows={6}
              value={urlsInput}
              onChange={(e) => {
                setUrlsInput(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder={`https://scholarships.gov.in\nhttp://scholarsh1ps-gov-in.free-apply-portal.xyz/apply\nhttps://forms.gle/sample...`}
              className="w-full p-3 font-mono text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none leading-relaxed"
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-600 font-medium">{errorMsg}</p>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-sm disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Executing Batch Multi-Agent Scans...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Scan All URLs</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setUrlsInput('');
                  setBatchResult(null);
                  setErrorMsg('');
                }}
                className="px-3 py-2 text-xs text-slate-600 hover:text-slate-900 rounded"
              >
                Clear
              </button>
            </div>

            <span className="text-xs text-slate-400 font-mono">
              {urlsInput.split('\n').filter(u => u.trim()).length} / 10 URLs entered
            </span>
          </div>
        </form>
      </div>

      {/* Batch Results View */}
      {batchResult && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Batch Security Audit Summary</h2>
              <p className="text-xs text-slate-500">
                Completed evaluation of {batchResult.completed} out of {batchResult.total} submitted targets.
              </p>
            </div>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 border border-slate-300 shadow-sm self-start sm:self-auto"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV Audit Log</span>
            </button>
          </div>

          {/* Aggregated KPI Strip */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <span className="text-[10px] font-bold uppercase text-emerald-800 block">Clean / Low Risk</span>
              <span className="text-2xl font-extrabold font-mono text-emerald-700 tabular-nums">
                {batchResult.cleanCount}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
              <span className="text-[10px] font-bold uppercase text-amber-800 block">Caution Required</span>
              <span className="text-2xl font-extrabold font-mono text-amber-700 tabular-nums">
                {batchResult.cautionCount}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-center">
              <span className="text-[10px] font-bold uppercase text-rose-800 block">High Risk / Scam</span>
              <span className="text-2xl font-extrabold font-mono text-rose-700 tabular-nums">
                {batchResult.highRiskCount}
              </span>
            </div>
          </div>

          {/* Table of Scanned Targets */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px]">
                  <th className="py-2.5 px-3">Target URL</th>
                  <th className="py-2.5 px-3">Risk Score</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Scheme Verification</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {batchResult.reports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 max-w-xs">
                      <div className="font-mono text-slate-900 font-medium truncate">{report.submittedUrl}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{report.domainAnalysis.hostname} · {report.domainAnalysis.isHttps ? 'HTTPS' : 'HTTP'}</div>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold tabular-nums">
                      <span className={`px-2 py-0.5 rounded ${
                        report.overallScore >= 50 || report.criticalWarning ? 'bg-rose-100 text-rose-800' :
                        report.overallScore >= 20 ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {report.overallScore}/100
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium">
                      {report.riskCategoryLabel}
                      {report.criticalWarning && (
                        <span className="text-rose-600 block text-[10px] font-bold">CRITICAL WARNING</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {report.scholarshipVerification.matchedOfficialRecord ? (
                        <span className="text-emerald-700 font-semibold">{report.scholarshipVerification.matchedOfficialRecord.name}</span>
                      ) : (
                        <span className="text-slate-500">{report.scholarshipVerification.status.replace('_', ' ')}</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onViewReport(report)}
                        className="text-blue-600 hover:text-blue-800 font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        <span>Audit Report</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
