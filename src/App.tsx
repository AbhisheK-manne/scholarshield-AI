import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { ScannerPage } from './pages/ScannerPage';
import { ReportPage } from './pages/ReportPage';
import { ScholarshipVerificationPage } from './pages/ScholarshipVerificationPage';
import { SafetyEducationPage } from './pages/SafetyEducationPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { MessageAnalyzerPage } from './pages/MessageAnalyzerPage';
import { ScamSimulatorPage } from './pages/ScamSimulatorPage';
import { BatchScannerPage } from './pages/BatchScannerPage';
import { HistoryModal } from './components/HistoryModal';
import { RiskReport } from './types';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [currentReport, setCurrentReport] = useState<RiskReport | null>(null);
  const [scannerInitialUrl, setScannerInitialUrl] = useState<string>('');
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  const handleStartScan = (initialUrl?: string) => {
    if (initialUrl) {
      setScannerInitialUrl(initialUrl);
    }
    setCurrentPage('scanner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScanComplete = (report: RiskReport) => {
    setCurrentReport(report);
    setCurrentPage('report');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectReportFromHistory = async (reportId: string) => {
    try {
      const res = await fetch(`/api/scan/${reportId}`);
      if (res.ok) {
        const report = await res.json();
        setCurrentReport(report);
        setCurrentPage('report');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Failed to load past report:', err);
    }
  };

  const navigateTo = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F6FB] text-[#172033] font-sans antialiased">
      {/* 3-Zone Navigation Header */}
      <Navbar currentPage={currentPage} onNavigate={navigateTo} />

      {/* Main View Area */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <LandingPage onStartScan={handleStartScan} onNavigate={navigateTo} />
        )}

        {currentPage === 'scanner' && (
          <ScannerPage
            initialUrl={scannerInitialUrl}
            onScanComplete={handleScanComplete}
            onViewHistory={() => setIsHistoryOpen(true)}
          />
        )}

        {currentPage === 'report' && currentReport && (
          <ReportPage
            report={currentReport}
            onBackToScanner={() => setCurrentPage('scanner')}
          />
        )}

        {currentPage === 'scholarships' && (
          <ScholarshipVerificationPage />
        )}

        {currentPage === 'message_analyzer' && (
          <MessageAnalyzerPage onViewReport={handleScanComplete} />
        )}

        {currentPage === 'simulator' && (
          <ScamSimulatorPage />
        )}

        {currentPage === 'batch' && (
          <BatchScannerPage onViewReport={handleScanComplete} />
        )}

        {currentPage === 'safety' && (
          <SafetyEducationPage />
        )}

        {currentPage === 'admin' && (
          <AdminDashboardPage />
        )}
      </main>

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectReport={handleSelectReportFromHistory}
      />

      {/* Global Footer with mandatory disclaimers and authority sources */}
      <Footer onNavigate={navigateTo} />
    </div>
  );
}
