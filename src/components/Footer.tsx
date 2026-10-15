import React from 'react';
import { ShieldCheck, ExternalLink, AlertTriangle } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#14213D] text-slate-300 border-t border-slate-700/80 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mandatory Disclaimer Box */}
        <div className="mb-10 p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-xs sm:text-sm text-slate-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white">Security & Verification Disclaimer: </span>
            No automated security check can guarantee that a website is safe. Always verify important claims independently through registered university administration, national education portals, or official phone helplines.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white">
                <ShieldCheck className="w-4 h-4 text-cyan-300" />
              </div>
              <span>ScholarShield AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Autonomous cybersecurity and scholarship verification framework protecting students against advance-fee scams, typosquatting domains, and credential-harvesting Google Forms.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-cyan-400 transition-colors">
                  Home Overview
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('scanner')} className="hover:text-cyan-400 transition-colors">
                  URL & Form Scanner
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('scholarships')} className="hover:text-cyan-400 transition-colors">
                  Scholarship Verification
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('safety')} className="hover:text-cyan-400 transition-colors">
                  Safety Education Guide
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="hover:text-cyan-400 transition-colors">
                  Admin Benchmark Console
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">Official Authorities</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://scholarships.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1"
                >
                  <span>National Scholarship Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.ugc.ac.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1"
                >
                  <span>University Grants Commission</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.aicte-india.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1"
                >
                  <span>AICTE India Schemes</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.chevening.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1"
                >
                  <span>Chevening Scholarships</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">Support & Privacy</h4>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              We never store sensitive personal inputs, passwords, or bank OTPs. Scans run in a restricted sandbox.
            </p>
            <div className="text-xs text-slate-400 space-y-1">
              <p>Student Helpline: support@scholarshield.ai</p>
              <p>Cybercrime Portal: cybercrime.gov.in (National Helpline: 1930)</p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-700/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>© {new Date().getFullYear()} ScholarShield AI. Academic Cyber Defense Framework.</p>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span aria-hidden="true">·</span>
            <span>Terms of Assessment</span>
            <span aria-hidden="true">·</span>
            <span>Report False Positive</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
