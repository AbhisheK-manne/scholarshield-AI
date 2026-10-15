import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Calendar, 
  IndianRupee, 
  GraduationCap,
  Building,
  RotateCcw
} from 'lucide-react';
import { ScholarshipRecord, TrustedSource } from '../types';

export const ScholarshipVerificationPage: React.FC = () => {
  const [scholarshipName, setScholarshipName] = useState('');
  const [claimedProvider, setClaimedProvider] = useState('');
  const [officialWebsite, setOfficialWebsite] = useState('');
  const [applicationUrl, setApplicationUrl] = useState('');
  const [advertisedAmount, setAdvertisedAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [eligibility, setEligibility] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [allOfficialSchemes, setAllOfficialSchemes] = useState<ScholarshipRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'government' | 'corporate' | 'international'>('all');

  // Initial fetch of indexed scholarships
  React.useEffect(() => {
    fetch('/api/scholarships/search?q=')
      .then(res => res.json())
      .then(data => {
        if (data.scholarships) setAllOfficialSchemes(data.scholarships);
      })
      .catch(() => {});
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scholarshipName.trim() && !claimedProvider.trim() && !officialWebsite.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/scholarships/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: scholarshipName.trim(),
          provider: claimedProvider.trim(),
          portalUrl: officialWebsite.trim() || applicationUrl.trim(),
          amount: advertisedAmount.trim()
        })
      });
      const data = await res.json();
      setVerificationResult(data);
      setIsLoading(false);
    } catch {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setScholarshipName('');
    setClaimedProvider('');
    setOfficialWebsite('');
    setApplicationUrl('');
    setAdvertisedAmount('');
    setDeadline('');
    setEligibility('');
    setVerificationResult(null);
  };

  const filteredSchemes = allOfficialSchemes.filter(s => {
    if (categoryFilter !== 'all') {
      if (categoryFilter === 'international' && !s.officialPortalUrl.includes('.org') && !s.officialPortalUrl.includes('.de')) {
        return false;
      }
      if (categoryFilter === 'government' && s.providerType !== 'government') {
        return false;
      }
      if (categoryFilter === 'corporate' && s.providerType !== 'corporate') {
        return false;
      }
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.provider.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header with visual banner */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-8 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>National & University Registry Cross-Reference</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14213D] tracking-tight">
            Authoritative Scholarship Verification
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
            Cross-check claimed scholarships against the Indian National Scholarship Portal (NSP), UGC, AICTE, and accredited international foundations. Compare eligibility rules, authentic stipends, and authorized application portals.
          </p>
          <div className="pt-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Important Integrity Rule: </span>
            Absence from the National Scholarship Portal does not automatically mean a private foundation or college grant is fraudulent. Independent verification through institution offices is always documented.
          </div>
        </div>

        <div className="md:col-span-4 flex justify-center">
          <div className="w-full max-w-[280px] rounded-xl overflow-hidden border border-slate-200 shadow-md bg-slate-50">
            <img
              src="/src/assets/images/scholarship_official_cert_1791988363319.jpg"
              alt="Official Academic Certification Seal"
              referrerPolicy="no-referrer"
              className="w-full h-auto object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        </div>
      </div>

      {/* Verification Input Form */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <h2 className="text-base font-bold text-slate-900 mb-1">Verify Scholarship Claim Information</h2>
        <p className="text-xs text-slate-500 mb-6">
          Enter the details claimed in the advertisement, message, or notice board flyer.
        </p>

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ver-name" className="block text-xs font-bold text-slate-700 mb-1">
                Scholarship Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="ver-name"
                type="text"
                required
                value={scholarshipName}
                onChange={(e) => setScholarshipName(e.target.value)}
                placeholder="e.g. Central Sector Scheme of Scholarship"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>

            <div>
              <label htmlFor="ver-prov" className="block text-xs font-bold text-slate-700 mb-1">
                Claimed Provider / Ministry / University
              </label>
              <input
                id="ver-prov"
                type="text"
                value={claimedProvider}
                onChange={(e) => setClaimedProvider(e.target.value)}
                placeholder="e.g. Ministry of Education / Tata Trusts"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>

            <div>
              <label htmlFor="ver-web" className="block text-xs font-bold text-slate-700 mb-1">
                Official Website (if known)
              </label>
              <input
                id="ver-web"
                type="text"
                value={officialWebsite}
                onChange={(e) => setOfficialWebsite(e.target.value)}
                placeholder="https://scholarships.gov.in"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none font-mono"
              />
            </div>

            <div>
              <label htmlFor="ver-app" className="block text-xs font-bold text-slate-700 mb-1">
                Application URL Given to You
              </label>
              <input
                id="ver-app"
                type="text"
                value={applicationUrl}
                onChange={(e) => setApplicationUrl(e.target.value)}
                placeholder="Where you were told to apply or fill details"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none font-mono"
              />
            </div>

            <div>
              <label htmlFor="ver-amt" className="block text-xs font-bold text-slate-700 mb-1">
                Advertised Scholarship Amount
              </label>
              <input
                id="ver-amt"
                type="text"
                value={advertisedAmount}
                onChange={(e) => setAdvertisedAmount(e.target.value)}
                placeholder="e.g. ₹50,000 / year or ₹5,00,000"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>

            <div>
              <label htmlFor="ver-dead" className="block text-xs font-bold text-slate-700 mb-1">
                Claimed Application Deadline
              </label>
              <input
                id="ver-dead"
                type="text"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="e.g. October 31 or 'Today Only Urgent'"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="ver-elig" className="block text-xs font-bold text-slate-700 mb-1">
              Advertised Eligibility Requirements
            </label>
            <textarea
              id="ver-elig"
              rows={2}
              value={eligibility}
              onChange={(e) => setEligibility(e.target.value)}
              placeholder="e.g. 12th pass with 80% marks, family income < 4.5 LPA, or claimed 'Guaranteed for all students'..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-sm disabled:opacity-60 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>{isLoading ? 'Searching Registry...' : 'Cross-Reference Official Registry'}</span>
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </form>

        {/* Verification Result Card */}
        {verificationResult && (
          <div className="mt-8 pt-6 border-t border-slate-200 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Official Registry Search Findings</h3>
              <span className="text-xs text-slate-500 font-mono">
                {verificationResult.matchesFound} Official Match(es) Found
              </span>
            </div>

            {verificationResult.matchesFound > 0 ? (
              <div className="space-y-4">
                {verificationResult.matches.map((sch: ScholarshipRecord) => {
                  const hasAmountConflict = advertisedAmount && !sch.amount.toLowerCase().includes(advertisedAmount.toLowerCase());
                  return (
                    <div key={sch.id} className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/80 pb-2.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <h4 className="font-bold text-slate-900 text-sm">{sch.name}</h4>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5 ml-6">
                            Verified Provider: <strong>{sch.provider}</strong>
                          </p>
                        </div>
                        <span className="text-[11px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded self-start sm:self-auto">
                          Verified on {sch.lastVerifiedDate}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs ml-6">
                        <div>
                          <span className="text-slate-500 block">Official Award Amount:</span>
                          <span className="font-semibold text-slate-800">{sch.amount}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Application Fee Policy:</span>
                          <span className="font-semibold text-emerald-700">{sch.applicationFee}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Standard Deadline Cycle:</span>
                          <span className="font-semibold text-slate-800">{sch.deadline}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Disbursement Channel:</span>
                          <span className="font-semibold text-slate-800">{sch.paymentMethodWarning}</span>
                        </div>
                      </div>

                      <div className="text-xs bg-white p-3 rounded border border-slate-200 ml-6 space-y-1">
                        <span className="font-semibold text-slate-700">Official Eligibility Rules: </span>
                        <p className="text-slate-600 leading-relaxed">{sch.eligibility}</p>
                      </div>

                      {hasAmountConflict && (
                        <div className="ml-6 p-2.5 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Claimed Amount Discrepancy: </span>
                            You indicated "{advertisedAmount}", but the official statutory rate is "{sch.amount}". Exaggerated payout numbers are commonly used by scammers to attract students.
                          </div>
                        </div>
                      )}

                      <div className="ml-6 flex items-center gap-4 pt-1">
                        <a
                          href={sch.officialPortalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                        >
                          <span>Visit Verified Official Portal</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <span className="text-slate-300">|</span>
                        <a
                          href={sch.officialSourceCitation}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-slate-500 hover:text-slate-800 inline-flex items-center gap-1"
                        >
                          <span>Official Scheme Guidelines PDF</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-bold">
                  <HelpCircle className="w-4 h-4 text-slate-500" />
                  <span>No Direct Match Found in Verified Central Index</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  The scholarship query ("{scholarshipName || claimedProvider}") could not be matched against current schemes on the National Scholarship Portal, UGC, or partnered foundations.
                </p>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 space-y-1">
                  <span className="font-bold">Next Steps for Unlisted Grants:</span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700">
                    <li>Contact your college scholarship / financial aid office directly.</li>
                    <li>Search the National Scholarship Portal homepage directly at <a href="https://scholarships.gov.in" target="_blank" rel="noopener noreferrer" className="underline font-semibold text-blue-700">scholarships.gov.in</a>.</li>
                    <li>If the organizers demand an upfront processing fee or UPI transfer, it is almost certainly a scam.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Directory of Verified National & Foundation Scholarships */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Authoritative Scholarship Registry</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified schemes with confirmed zero-fee policies and authentic government / foundation URLs.
            </p>
          </div>
          <div className="w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search schemes or provider..."
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-blue-600 outline-none"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg w-fit text-xs font-semibold">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1 rounded transition-colors ${categoryFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            All Schemes ({allOfficialSchemes.length})
          </button>
          <button
            onClick={() => setCategoryFilter('government')}
            className={`px-3 py-1 rounded transition-colors ${categoryFilter === 'government' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            National Portal & Govt
          </button>
          <button
            onClick={() => setCategoryFilter('corporate')}
            className={`px-3 py-1 rounded transition-colors ${categoryFilter === 'corporate' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Corporate Foundations
          </button>
          <button
            onClick={() => setCategoryFilter('international')}
            className={`px-3 py-1 rounded transition-colors ${categoryFilter === 'international' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            International Fellowships
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px]">
                <th className="py-2.5 px-3">Scheme Name</th>
                <th className="py-2.5 px-3">Provider</th>
                <th className="py-2.5 px-3">Standard Award</th>
                <th className="py-2.5 px-3">Application Fee</th>
                <th className="py-2.5 px-3 text-right">Official Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSchemes.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    {item.name}
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {item.provider}
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-mono">
                    {item.amount}
                  </td>
                  <td className="py-3 px-3 text-emerald-700 font-medium">
                    {item.applicationFee}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <a
                      href={item.officialPortalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      <span>Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
