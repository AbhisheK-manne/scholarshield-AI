import React from 'react';
import { ShieldCheck, ShieldAlert, FileText, BookOpen, Lock } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  return (
    <header className="sticky top-0 z-50 bg-[#14213D] text-white border-b border-slate-700/60 shadow-sm backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 text-left text-lg font-bold tracking-tight text-white hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-inner">
              <ShieldCheck className="w-5 h-5 text-cyan-300" />
            </div>
            <span>ScholarShield AI</span>
          </button>

          {/* Zone 2: 5 concise single-line nav links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
            <button
              onClick={() => onNavigate('home')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                currentPage === 'home' ? 'text-cyan-400 font-semibold' : ''
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('scanner')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                currentPage === 'scanner' ? 'text-cyan-400 font-semibold' : ''
              }`}
            >
              Scan Link
            </button>
            <button
              onClick={() => onNavigate('message_analyzer')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                currentPage === 'message_analyzer' ? 'text-cyan-400 font-semibold' : ''
              }`}
            >
              Message Analyzer
            </button>
            <button
              onClick={() => onNavigate('scholarships')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                currentPage === 'scholarships' ? 'text-cyan-400 font-semibold' : ''
              }`}
            >
              Scholarship Verification
            </button>
            <button
              onClick={() => onNavigate('simulator')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                currentPage === 'simulator' ? 'text-cyan-400 font-semibold' : ''
              }`}
            >
              Training Lab
            </button>
            <button
              onClick={() => onNavigate('safety')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                currentPage === 'safety' ? 'text-cyan-400 font-semibold' : ''
              }`}
            >
              Safety Tips
            </button>
            <button
              onClick={() => onNavigate('batch')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                currentPage === 'batch' ? 'text-cyan-400 font-semibold' : ''
              }`}
            >
              Batch Scanner
            </button>
            <button
              onClick={() => onNavigate('admin')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                currentPage === 'admin' ? 'text-cyan-400 font-semibold' : ''
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Admin</span>
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('scanner')}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#14213D] whitespace-nowrap shrink-0"
            >
              Scan Link Now
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav drawer */}
      <div className="md:hidden border-t border-slate-700/80 bg-[#101b33] px-4 py-2 flex items-center justify-between text-xs overflow-x-auto gap-3">
        <button
          onClick={() => onNavigate('home')}
          className={`py-1.5 px-2 whitespace-nowrap rounded ${currentPage === 'home' ? 'text-cyan-400 font-bold bg-white/5' : 'text-slate-300'}`}
        >
          Home
        </button>
        <button
          onClick={() => onNavigate('scanner')}
          className={`py-1.5 px-2 whitespace-nowrap rounded ${currentPage === 'scanner' ? 'text-cyan-400 font-bold bg-white/5' : 'text-slate-300'}`}
        >
          Scan
        </button>
        <button
          onClick={() => onNavigate('message_analyzer')}
          className={`py-1.5 px-2 whitespace-nowrap rounded ${currentPage === 'message_analyzer' ? 'text-cyan-400 font-bold bg-white/5' : 'text-slate-300'}`}
        >
          Messages
        </button>
        <button
          onClick={() => onNavigate('scholarships')}
          className={`py-1.5 px-2 whitespace-nowrap rounded ${currentPage === 'scholarships' ? 'text-cyan-400 font-bold bg-white/5' : 'text-slate-300'}`}
        >
          Verify
        </button>
        <button
          onClick={() => onNavigate('simulator')}
          className={`py-1.5 px-2 whitespace-nowrap rounded ${currentPage === 'simulator' ? 'text-cyan-400 font-bold bg-white/5' : 'text-slate-300'}`}
        >
          Lab
        </button>
        <button
          onClick={() => onNavigate('batch')}
          className={`py-1.5 px-2 whitespace-nowrap rounded ${currentPage === 'batch' ? 'text-cyan-400 font-bold bg-white/5' : 'text-slate-300'}`}
        >
          Batch
        </button>
        <button
          onClick={() => onNavigate('safety')}
          className={`py-1.5 px-2 whitespace-nowrap rounded ${currentPage === 'safety' ? 'text-cyan-400 font-bold bg-white/5' : 'text-slate-300'}`}
        >
          Tips
        </button>
        <button
          onClick={() => onNavigate('admin')}
          className={`py-1.5 px-2 whitespace-nowrap rounded ${currentPage === 'admin' ? 'text-cyan-400 font-bold bg-white/5' : 'text-slate-300'}`}
        >
          Admin
        </button>
      </div>
    </header>
  );
};
