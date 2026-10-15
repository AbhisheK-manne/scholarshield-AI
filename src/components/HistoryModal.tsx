import React, { useState, useEffect } from 'react';
import { History, X, Search, ShieldAlert, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { RiskReport } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReport: (reportId: string) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, onSelectReport }) => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/scan/history')
        .then(res => res.json())
        .then(data => {
          if (data.scans) setHistory(data.scans);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = history.filter(s => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return s.submittedUrl.toLowerCase().includes(q) || s.hostname?.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Recent Security Scan Reports</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-sm font-semibold">
            ✕
          </button>
        </div>

        <div className="relative shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search past scans by URL or host..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-blue-600 outline-none"
          />
        </div>

        <div className="overflow-y-auto space-y-2 flex-1 pr-1">
          {loading ? (
            <div className="text-center py-8 text-xs text-slate-500">Loading scan history...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">No past scan records found.</div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectReport(item.id);
                  onClose();
                }}
                className="p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-slate-50/70 transition cursor-pointer flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-slate-900 font-medium truncate">{item.submittedUrl}</div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                    <span>{new Date(item.scanTimestamp).toLocaleDateString()}</span>
                    <span>·</span>
                    <span>{item.isHttps ? 'HTTPS' : 'HTTP'}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs tabular-nums ${
                    item.overallScore >= 50 || item.criticalWarning ? 'bg-rose-100 text-rose-800' :
                    item.overallScore >= 20 ? 'bg-amber-100 text-amber-800' :
                    'bg-emerald-100 text-emerald-800'
                  }`}>
                    {item.overallScore}/100
                  </span>
                  <div className="text-[10px] text-slate-400 mt-0.5">{item.riskCategoryLabel}</div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
