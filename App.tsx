import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { VendorInputForm } from './components/VendorInputForm';
import { AnalysisReport } from './components/AnalysisReport';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorDisplay } from './components/ErrorDisplay';
import { WelcomeScreen } from './components/WelcomeScreen';
import { History } from './components/History';
import { SettingsModal } from './components/SettingsModal';
import { Analytics } from './components/Analytics';
import { AuthPage } from './components/AuthPage';
import { analyzeVendor, analyzeContract } from './services/geminiService';
import * as db from './services/db';
import * as auth from './services/authService';
import { StoredReport, User } from './types';
import { useSettings } from './hooks/useSettings';

type ActiveTab = 'analyzer' | 'analytics';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  
  const [currentReport, setCurrentReport] = useState<StoredReport | null>(null);
  const [history, setHistory] = useState<StoredReport[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<string>('');
  const [isContractLoading, setIsContractLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('analyzer');
  const { settings, saveSettings } = useSettings(currentUser?.id ?? null);
  const [bulkScanProgress, setBulkScanProgress] = useState<{current: number; total: number} | null>(null);

  useEffect(() => {
    const checkSession = async () => {
        const user = await auth.getCurrentUser();
        setCurrentUser(user);
        setIsAuthLoading(false);
    };
    checkSession();
  }, []);

  const loadHistory = useCallback(async () => {
    if (!currentUser) return;
    const reports = await db.getAllReports(currentUser.id);
    // Defensively filter out any reports that don't have the expected 'result' object.
    // This prevents crashes from old or malformed data in IndexedDB.
    const validReports = reports.filter(r => r && r.result && typeof r.result.overallScore === 'number');
    setHistory(validReports);
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
        loadHistory();
    }
  }, [currentUser, loadHistory]);

  const handleAnalysis = useCallback(async (domain: string, vendorName: string, scanType: 'quick' | 'full') => {
    if (!domain || !currentUser) return;
    setActiveTab('analyzer');
    setIsLoading(true);
    setLoadingProgress('');
    setError(null);
    setCurrentReport(null);

    try {
      const { result, groundingSources } = await analyzeVendor(domain, settings, scanType);
      
      const newReport: StoredReport = {
        userId: currentUser.id,
        domain,
        vendorName: vendorName || domain,
        result,
        sources: groundingSources,
        timestamp: Date.now(),
        scanType,
      };
      const savedReport = await db.saveReport(newReport);
      setCurrentReport(savedReport);
      await loadHistory();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setCurrentReport(null);
    } finally {
      setIsLoading(false);
    }
  }, [settings, loadHistory, currentUser]);

  const handleBulkAnalysis = useCallback(async (vendors: Array<{name: string, domain: string}>, scanType: 'quick' | 'full') => {
    if (!currentUser) return;
    setIsLoading(true);
    setError(null);
    setCurrentReport(null);

    const errorLogs: string[] = [];

    for (const [index, vendor] of vendors.entries()) {
      if (!vendor.domain) continue;
      const progressMessage = `Analyzing ${index + 1} of ${vendors.length}: ${vendor.domain}`;
      setLoadingProgress(progressMessage);
      setBulkScanProgress({ current: index + 1, total: vendors.length });
      try {
        const { result, groundingSources } = await analyzeVendor(vendor.domain, settings, scanType);
        const reportName = vendor.name || result.vendorName || vendor.domain;
        
        const newReport: StoredReport = {
          userId: currentUser.id,
          domain: vendor.domain,
          vendorName: reportName,
          result,
          sources: groundingSources,
          timestamp: Date.now(),
          scanType,
        };
        await db.saveReport(newReport);
      } catch (err) {
        errorLogs.push(`Failed to analyze ${vendor.domain}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
      await loadHistory();
    }
    
    setLoadingProgress('');
    setIsLoading(false);
    setBulkScanProgress(null);

    if (errorLogs.length > 0) {
      setError(`Bulk analysis completed with ${errorLogs.length} error(s).\n- ${errorLogs.join('\n- ')}`);
    }

  }, [settings, loadHistory, currentUser]);

  const handleContractAnalysis = useCallback(async (reportId: number, contractText: string) => {
    if (!currentUser) return;
    setIsContractLoading(true);
    setError(null);

    try {
        const analysisResult = await analyzeContract(contractText, settings);
        
        const reportToUpdate = await db.getReportById(reportId);
        if (!reportToUpdate) {
            throw new Error("Could not find the report to update.");
        }

        reportToUpdate.contractAnalysis = analysisResult;
        
        const updatedReport = await db.saveReport(reportToUpdate);
        
        setCurrentReport(updatedReport);
        await loadHistory();

    } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred during contract analysis.');
    } finally {
        setIsContractLoading(false);
    }
  }, [currentUser, settings, loadHistory]);

  const handleViewReport = useCallback((report: StoredReport) => {
    setActiveTab('analyzer');
    setError(null);
    setCurrentReport(report);
  }, []);

  const handleClearHistory = useCallback(async () => {
    if (!currentUser) return;
    await db.clearAllReports(currentUser.id);
    setHistory([]);
    setCurrentReport(null);
  }, [currentUser]);

  const handleDeleteHistoryItem = useCallback(async (id: number) => {
      if (currentReport?.id === id) {
          setCurrentReport(null);
      }
      await db.deleteReport(id);
      await loadHistory();
  }, [loadHistory, currentReport]);

  const handleLogout = () => {
    auth.logout();
    setCurrentUser(null);
    setHistory([]);
    setCurrentReport(null);
  };

  const TabButton: React.FC<{tab: ActiveTab, label: string}> = ({ tab, label }) => (
      <button
          onClick={() => setActiveTab(tab)}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab 
              ? 'bg-cyan-600 text-white' 
              : 'text-gray-400 hover:bg-[#161b22]'
          }`}
      >
          {label}
      </button>
  );

  if (isAuthLoading) {
      return (
          <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
              <LoadingSpinner />
          </div>
      );
  }

  if (!currentUser) {
      return <AuthPage onAuthSuccess={setCurrentUser} />;
  }

  return (
    <div className="min-h-screen bg-[#0d1117] font-sans text-gray-300 flex flex-col">
      <Header onOpenSettings={() => setIsSettingsOpen(true)} currentUser={currentUser} onLogout={handleLogout} />
      <main className="container mx-auto p-4 md:p-8 flex-grow">
        <div className="mx-auto">
          
          <div className="mb-6 flex space-x-2 border-b border-gray-800 pb-2">
            <TabButton tab="analyzer" label="Analyzer" />
            <TabButton tab="analytics" label="Analytics" />
          </div>

          {activeTab === 'analyzer' && (
            <>
              <VendorInputForm 
                onAnalyze={handleAnalysis} 
                onBulkAnalyze={handleBulkAnalysis} 
                isLoading={isLoading}
                bulkScanProgress={bulkScanProgress}
              />
              
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Column: History */}
                <div className="lg:col-span-1">
                  <History
                    reports={history}
                    onSelect={handleViewReport}
                    onReanalyze={(domain, name, scanType) => handleAnalysis(domain, name, scanType)}
                    onClear={handleClearHistory}
                    onDelete={handleDeleteHistoryItem}
                    isLoading={isLoading}
                    currentReportId={currentReport?.id}
                  />
                </div>

                {/* Right Column: Results */}
                <div className="lg:col-span-3">
                  {error && <ErrorDisplay message={error} />}
                  {isLoading && !bulkScanProgress && <LoadingSpinner progressMessage={loadingProgress} />}
                  {!isLoading && !error && currentReport && (
                    <AnalysisReport 
                      report={currentReport}
                      isContractLoading={isContractLoading}
                      onAnalyzeContract={handleContractAnalysis}
                    />
                  )}
                  {!isLoading && !error && !currentReport && <WelcomeScreen />}
                </div>
              </div>
            </>
          )}

          {activeTab === 'analytics' && (
            <Analytics reports={history} onViewReport={handleViewReport} />
          )}

        </div>
      </main>
      <footer className="text-center p-4 border-t border-gray-800 flex-shrink-0">
        <p className="text-xs text-gray-600 font-mono">
            Threat Intelligence concept by Khalid Lakdawala
        </p>
      </footer>
      {isSettingsOpen && (
        <SettingsModal
          currentSettings={settings}
          onSave={saveSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
};

export default App;