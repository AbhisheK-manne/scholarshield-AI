import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  BarChart3, 
  Layers, 
  FileText, 
  Plus, 
  MessageSquare,
  HelpCircle,
  ExternalLink,
  Loader2,
  LogOut
} from 'lucide-react';
import { BenchmarkResults, TrustedSource, ScholarshipRecord, FeedbackReport } from '../types';

export const AdminDashboardPage: React.FC = () => {
  const [token, setToken] = useState<string>(() => localStorage.getItem('scholarshield_admin_token') || '');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Stats and data
  const [stats, setStats] = useState<any>(null);
  const [trustedSources, setTrustedSources] = useState<TrustedSource[]>([]);
  const [feedbackList, setFeedbackList] = useState<FeedbackReport[]>([]);
  const [activeTab, setActiveTab] = useState<'benchmark' | 'sources' | 'scholarships' | 'feedback'>('benchmark');

  // Benchmark suite
  const [benchmarkResults, setBenchmarkResults] = useState<BenchmarkResults | null>(null);
  const [isRunningBenchmark, setIsRunningBenchmark] = useState(false);

  // New source form
  const [newDomain, setNewDomain] = useState('');
  const [newOrgName, setNewOrgName] = useState('');
  const [newSourceType, setNewSourceType] = useState('government_portal');

  // New scholarship form
  const [newSchName, setNewSchName] = useState('');
  const [newSchProvider, setNewSchProvider] = useState('');
  const [newSchPortal, setNewSchPortal] = useState('');
  const [newSchAmount, setNewSchAmount] = useState('');

  const fetchAdminData = async (authToken: string) => {
    try {
      const statsRes = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      } else if (statsRes.status === 401) {
        handleLogout();
        return;
      }

      const sourcesRes = await fetch('/api/admin/trusted-sources', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (sourcesRes.ok) {
        const data = await sourcesRes.json();
        setTrustedSources(data);
      }

      const fbRes = await fetch('/api/admin/feedback', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (fbRes.ok) {
        const data = await fbRes.json();
        setFeedbackList(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAdminData(token);
    }
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Authentication failed.');
        setIsLoggingIn(false);
        return;
      }

      setToken(data.token);
      localStorage.setItem('scholarshield_admin_token', data.token);
      setIsLoggingIn(false);
    } catch {
      setAuthError('Connection error.');
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('scholarshield_admin_token');
    setStats(null);
  };

  const handleRunBenchmark = async () => {
    setIsRunningBenchmark(true);
    try {
      const res = await fetch('/api/admin/benchmark', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setBenchmarkResults(data);
      setIsRunningBenchmark(false);
    } catch {
      setIsRunningBenchmark(false);
    }
  };

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim() || !newOrgName.trim()) return;

    try {
      const res = await fetch('/api/admin/trusted-sources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          domain: newDomain.trim(),
          organizationName: newOrgName.trim(),
          sourceType: newSourceType
        })
      });
      if (res.ok) {
        setNewDomain('');
        setNewOrgName('');
        fetchAdminData(token);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddScholarship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchName.trim() || !newSchProvider.trim() || !newSchPortal.trim()) return;

    try {
      const res = await fetch('/api/admin/scholarships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newSchName.trim(),
          provider: newSchProvider.trim(),
          officialPortalUrl: newSchPortal.trim(),
          amount: newSchAmount.trim() || '₹10,000 to ₹50,000 / year'
        })
      });
      if (res.ok) {
        setNewSchName('');
        setNewSchProvider('');
        setNewSchPortal('');
        setNewSchAmount('');
        fetchAdminData(token);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Login Screen if not authenticated
  if (!token) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Lock className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold text-slate-900">Administrator Console</h1>
            <p className="text-xs text-slate-500">
              Access restricted to certified security administrators.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 rounded border border-slate-300 focus:ring-1 focus:ring-blue-600 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 rounded border border-slate-300 focus:ring-1 focus:ring-blue-600 outline-none"
              />
            </div>

            {authError && (
              <p className="text-xs text-rose-600 font-medium">{authError}</p>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition shadow-sm disabled:opacity-60"
            >
              {isLoggingIn ? 'Authenticating...' : 'Sign In as Administrator'}
            </button>

            <div className="p-3 bg-slate-50 rounded border border-slate-200 text-slate-600 text-[11px] space-y-1">
              <span className="font-semibold text-slate-800">Demo Credentials for Evaluation:</span>
              <p>Username: <code className="font-mono text-slate-900">admin</code></p>
              <p>Password: <code className="font-mono text-slate-900">scholarshield2026</code></p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-[#14213D] tracking-tight">
            Security Operations & Benchmark Console
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time telemetry, labelled dataset benchmarks, and trusted scholarship registry governance.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Scans Run</span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {stats ? stats.totalScans : '...'}
          </div>
          <span className="text-[10px] text-slate-400">Lifetime logged scans</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">High-Risk Intercepts</span>
          <div className="text-2xl font-bold font-mono text-rose-600 mt-1 tabular-nums">
            {stats ? stats.highRiskScans : '...'}
          </div>
          <span className="text-[10px] text-rose-500">Phishing / Credential harvesting</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Manual Reviews Needed</span>
          <div className="text-2xl font-bold font-mono text-amber-600 mt-1 tabular-nums">
            {stats ? stats.reviewNeeded : '...'}
          </div>
          <span className="text-[10px] text-amber-500">Caution or unverified forms</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Feedback & False Positives</span>
          <div className="text-2xl font-bold font-mono text-blue-600 mt-1 tabular-nums">
            {stats ? stats.feedbackCount : '...'}
          </div>
          <span className="text-[10px] text-blue-500">User dispute reports</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-lg w-fit text-xs font-semibold">
        <button
          onClick={() => setActiveTab('benchmark')}
          className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'benchmark' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Detection Benchmark Suite
        </button>
        <button
          onClick={() => setActiveTab('sources')}
          className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'sources' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Trusted Sources ({trustedSources.length})
        </button>
        <button
          onClick={() => setActiveTab('scholarships')}
          className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'scholarships' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Add Scholarship Scheme
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'feedback' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Feedback Reports ({feedbackList.length})
        </button>
      </div>

      {/* Tab 1: Labelled Test Dataset Detection Benchmark */}
      {activeTab === 'benchmark' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Automated Detection Performance Evaluation
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluates the multi-agent detection pipeline against our labelled ground-truth dataset (genuine NSP schemes, phishing forms, typosquats, and SSRF probes).
              </p>
            </div>

            <button
              onClick={handleRunBenchmark}
              disabled={isRunningBenchmark}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-sm disabled:opacity-60 whitespace-nowrap self-start sm:self-auto cursor-pointer"
            >
              {isRunningBenchmark ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Evaluating Dataset...</span>
                </>
              ) : (
                <>
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Run Benchmark Evaluation</span>
                </>
              )}
            </button>
          </div>

          {/* Benchmark Results Display */}
          {benchmarkResults ? (
            <div className="space-y-6">
              {/* Metric KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Precision</span>
                  <span className="text-xl font-bold font-mono text-emerald-700 tabular-nums">
                    {benchmarkResults.precision}%
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Recall</span>
                  <span className="text-xl font-bold font-mono text-emerald-700 tabular-nums">
                    {benchmarkResults.recall}%
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">False Positive Rate</span>
                  <span className="text-xl font-bold font-mono text-blue-700 tabular-nums">
                    {benchmarkResults.falsePositiveRate}%
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">False Negative Rate</span>
                  <span className="text-xl font-bold font-mono text-rose-700 tabular-nums">
                    {benchmarkResults.falseNegativeRate}%
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Verification Coverage</span>
                  <span className="text-xl font-bold font-mono text-purple-700 tabular-nums">
                    {benchmarkResults.verificationCoverage}%
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">API Failure Rate</span>
                  <span className="text-xl font-bold font-mono text-slate-700 tabular-nums">
                    {benchmarkResults.apiFailureRate}%
                  </span>
                </div>
              </div>

              {/* Individual Evaluation Breakdown Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px]">
                      <th className="py-2.5 px-3">Test Target URL</th>
                      <th className="py-2.5 px-3">Ground Truth</th>
                      <th className="py-2.5 px-3">Predicted Score</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3 text-right">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {benchmarkResults.details.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 max-w-xs truncate text-slate-900">
                          {d.url}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            d.groundTruth === 'malicious' ? 'bg-rose-100 text-rose-800' :
                            d.groundTruth === 'suspicious' ? 'bg-amber-100 text-amber-800' :
                            'bg-emerald-100 text-emerald-800'
                          }`}>
                            {d.groundTruth}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 tabular-nums font-bold text-slate-800">
                          {d.predictedScore}/100
                        </td>
                        <td className="py-2.5 px-3 font-sans text-xs text-slate-600">
                          {d.predictedCategory}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${d.isCorrect ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                            {d.isCorrect ? 'CORRECT' : 'DISCREPANCY'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-xs text-slate-500 space-y-3">
              <BarChart3 className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="font-semibold text-slate-700">Benchmark Ready to Run</p>
              <p className="max-w-md mx-auto">
                Click "Run Benchmark Evaluation" above to compute Precision, Recall, False-Positive Rate, False-Negative Rate, and Verification Coverage across safe synthetic test samples.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Trusted Sources Management */}
      {activeTab === 'sources' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Trusted Authority Governance</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified national government and university domains recognized by the Scholarship Verification Agent.
            </p>
          </div>

          <form onSubmit={handleAddSource} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-800 block">Add Trusted Academic/Government Domain</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                required
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="Domain (e.g. iitd.ac.in)"
                className="px-3 py-2 text-xs rounded border border-slate-300 font-mono"
              />
              <input
                type="text"
                required
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                placeholder="Organization Name"
                className="px-3 py-2 text-xs rounded border border-slate-300"
              />
              <select
                value={newSourceType}
                onChange={(e) => setNewSourceType(e.target.value)}
                className="px-3 py-2 text-xs rounded border border-slate-300"
              >
                <option value="government_portal">Government Portal</option>
                <option value="accredited_university">Accredited University</option>
                <option value="registered_charity">Registered Charity / Trust</option>
                <option value="verified_corporate">Verified Foundation</option>
              </select>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700"
            >
              Add Trusted Domain
            </button>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px]">
                  <th className="py-2.5 px-3">Domain</th>
                  <th className="py-2.5 px-3">Organization</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Country</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trustedSources.map((source) => (
                  <tr key={source.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono text-blue-700 font-semibold">{source.domain}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{source.organizationName}</td>
                    <td className="py-2.5 px-3 text-slate-600">{source.sourceType.replace('_', ' ')}</td>
                    <td className="py-2.5 px-3 text-slate-500">{source.country}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Add Scholarship Record */}
      {activeTab === 'scholarships' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Index New Official Scholarship Scheme</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Add a verified scheme to the authoritative database for automated cross-referencing.
            </p>
          </div>

          <form onSubmit={handleAddScholarship} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Scheme Name *</label>
                <input
                  type="text"
                  required
                  value={newSchName}
                  onChange={(e) => setNewSchName(e.target.value)}
                  placeholder="e.g. Tata Scholarship for Cornell Students"
                  className="w-full px-3 py-2 rounded border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Provider *</label>
                <input
                  type="text"
                  required
                  value={newSchProvider}
                  onChange={(e) => setNewSchProvider(e.target.value)}
                  placeholder="e.g. Tata Trusts"
                  className="w-full px-3 py-2 rounded border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Portal URL *</label>
                <input
                  type="url"
                  required
                  value={newSchPortal}
                  onChange={(e) => setNewSchPortal(e.target.value)}
                  placeholder="https://www.tatatrusts.org"
                  className="w-full px-3 py-2 rounded border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Standard Stipend Amount</label>
                <input
                  type="text"
                  value={newSchAmount}
                  onChange={(e) => setNewSchAmount(e.target.value)}
                  placeholder="e.g. Full tuition coverage"
                  className="w-full px-3 py-2 rounded border border-slate-300"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700"
            >
              Add to Official Registry
            </button>
          </form>
        </div>
      )}

      {/* Tab 4: Reported Feedback & False Positives */}
      {activeTab === 'feedback' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">User Dispute & False Positive Submissions</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review reports filed by students regarding false alarms or missed scam campaigns.
            </p>
          </div>

          {feedbackList.length === 0 ? (
            <p className="text-xs text-slate-500 p-6 bg-slate-50 rounded-lg border border-slate-200">
              No dispute or false positive reports have been submitted yet.
            </p>
          ) : (
            <div className="space-y-3">
              {feedbackList.map((fb) => (
                <div key={fb.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 uppercase text-[11px] bg-slate-200 px-2 py-0.5 rounded">
                      {fb.type.replace('_', ' ')}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {new Date(fb.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="font-mono text-blue-700 font-medium truncate">{fb.url}</p>
                  <p className="text-slate-700">{fb.userNotes}</p>
                  {fb.userEmail && (
                    <p className="text-[11px] text-slate-400">Reporter: {fb.userEmail}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
