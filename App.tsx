
import React, { useState, useEffect, useRef } from 'react';
import { WebsiteAnalysis, HistoryItem } from './types';
import { analyzeWebsite } from './services/geminiService';
import AnalysisCard from './components/AnalysisCard';
import ScoreChart from './components/ScoreChart';

const CACHE_KEY = 'rankmaster_reports_cache';
const HISTORY_KEY = 'rankmaster_history';
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// Declare html2pdf for TypeScript
declare var html2pdf: any;

const App: React.FC = () => {
  const [siteInput, setSiteInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<WebsiteAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isCopied, setIsCopied] = useState(false);
  const [isFromCache, setIsFromCache] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem(HISTORY_KEY);
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const getCachedReport = (url: string): WebsiteAnalysis | null => {
    const cacheRaw = localStorage.getItem(CACHE_KEY);
    if (!cacheRaw) return null;
    
    const cache = JSON.parse(cacheRaw);
    const report = cache[url.toLowerCase().trim()];
    
    if (report) {
      const reportDate = new Date(report.timestamp).getTime();
      const now = Date.now();
      if (now - reportDate < ONE_WEEK_MS) {
        return report;
      }
    }
    return null;
  };

  const saveToCache = (url: string, data: WebsiteAnalysis) => {
    const cacheRaw = localStorage.getItem(CACHE_KEY);
    const cache = cacheRaw ? JSON.parse(cacheRaw) : {};
    cache[url.toLowerCase().trim()] = data;
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteInput) return;

    const formattedUrl = siteInput.toLowerCase().trim();
    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);
    setIsFromCache(false);

    const cached = getCachedReport(formattedUrl);
    if (cached) {
      setTimeout(() => {
        setAnalysis(cached);
        setIsFromCache(true);
        setIsAnalyzing(false);
      }, 800);
      return;
    }

    try {
      const result = await analyzeWebsite(formattedUrl);
      setAnalysis(result);
      saveToCache(formattedUrl, result);
      
      const newHistoryItem: HistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        siteName: result.siteName,
        timestamp: new Date().toLocaleDateString()
      };

      const updatedHistory = [newHistoryItem, ...history.filter(h => h.siteName !== result.siteName).slice(0, 9)];
      setHistory(updatedHistory);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (err: any) {
      console.error(err);
      setError('Analysis failed. Please check your connection or try again later.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExportPDF = async () => {
    if (!reportRef.current || !analysis) return;
    
    setIsExporting(true);
    
    const element = reportRef.current;
    const opt = {
      margin: 10,
      filename: `RankMaster-Report-${analysis.siteName.replace(/[^a-z0-9]/gi, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true,
        scrollX: 0,
        scrollY: 0
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('PDF Export Error:', err);
      // Fallback to print
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareLink = async () => {
    if (!analysis) return;
    const shareText = `RankMaster AI Report for ${analysis.siteName}: Overall Score ${analysis.overallScore}/100. Analysis: ${analysis.summary}`;
    try {
      await navigator.clipboard.writeText(shareText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">R</div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              RankMaster AI
            </h1>
          </div>
          <div className="hidden sm:flex gap-4 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-indigo-600">Dashboard</a>
            <a href="#" className="hover:text-indigo-600">Methodology</a>
          </div>
        </div>
      </nav>

      {/* Hero / Input Section */}
      <div className="max-w-4xl mx-auto px-4 pt-12 text-center no-print">
        <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Level Up Your <span className="text-indigo-600">Search Presence</span>
        </h2>
        <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
          Deep technical insights into SEO, AEO, and Google Ranking factors. Reports are consistent for 7 days per website.
        </p>

        <form onSubmit={handleAnalyze} className="relative max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-2 bg-white p-2 rounded-2xl shadow-xl border border-slate-200">
            <div className="flex-1 relative">
              <input
                type="text"
                value={siteInput}
                onChange={(e) => setSiteInput(e.target.value)}
                placeholder="Enter website URL (e.g. apple.com)"
                className="w-full pl-4 pr-4 py-3 bg-transparent border-none focus:ring-0 text-slate-800 placeholder:text-slate-400 font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={isAnalyzing || !siteInput}
              className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                isAnalyzing 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-lg shadow-indigo-200'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </>
              ) : (
                'Run Analysis'
              )}
            </button>
          </div>
          {error && <p className="mt-4 text-rose-500 text-sm font-medium">{error}</p>}
        </form>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
           <span className="text-xs text-slate-400 uppercase font-bold tracking-widest">Recent Searches:</span>
           {history.length > 0 ? history.map(item => (
             <button 
               key={item.id} 
               onClick={() => setSiteInput(item.siteName)}
               className="text-xs px-2 py-1 bg-white border border-slate-200 rounded text-slate-600 hover:border-indigo-400 transition-colors"
             >
               {item.siteName}
             </button>
           )) : (
             <span className="text-xs text-slate-300">None yet</span>
           )}
        </div>
      </div>

      {/* Analysis Results Container with Ref */}
      {analysis && (
        <div ref={reportRef} className="max-w-7xl mx-auto px-4 mt-16 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-slate-50">
          
          {/* Print Only Header */}
          <div className="print-only mb-8 border-b pb-4 bg-white p-4 rounded-xl">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-indigo-600">RankMaster AI Official Report</h1>
                <p className="text-slate-500">Comprehensive SEO & AEO Analysis</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-slate-800">{analysis.siteName}</p>
                <p className="text-sm text-slate-500">Generated: {new Date(analysis.timestamp).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Summary & Overview */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 no-print">
                  <svg className="w-40 h-40" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                  </svg>
                </div>
                
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-indigo-100 text-sm font-bold uppercase tracking-widest">Overall Score</h3>
                  {isFromCache && (
                    <span className="px-2 py-0.5 bg-indigo-500/30 text-[10px] rounded border border-indigo-400/30 font-bold uppercase tracking-tighter no-print">
                      Cached Report
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-7xl font-extrabold">{analysis.overallScore}</span>
                  <span className="text-2xl font-bold text-indigo-300">/100</span>
                </div>
                <div className="h-2 bg-indigo-900/30 rounded-full mb-6">
                  <div className="h-full bg-indigo-300 rounded-full transition-all duration-1000" style={{ width: `${analysis.overallScore}%` }}></div>
                </div>
                <p className="text-indigo-100 text-sm leading-relaxed mb-4">
                  {analysis.summary}
                </p>
                <div className="pt-4 border-t border-indigo-500/40">
                  <p className="text-[10px] text-indigo-200 uppercase font-bold tracking-widest">
                    Last Analyzed: {new Date(analysis.timestamp).toLocaleDateString()}
                  </p>
                  <p className="text-[9px] text-indigo-300/60 mt-1 italic">
                    Reports are valid for 7 days to ensure standard benchmarking.
                  </p>
                </div>
              </div>

              <ScoreChart analysis={analysis} />
              
              <div className="bg-slate-900 rounded-2xl p-6 text-slate-300 shadow-xl border border-slate-800">
                 <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.3 1.047a1 1 0 01.897.95V7h5.803a1 1 0 01.846 1.531l-9.303 10.303a1 1 0 01-1.642-1.03l2.844-7.804H4.047a1 1 0 01-.897-.95V3a1 1 0 01.846-1.531L11.3 1.047z" clipRule="evenodd" />
                   </svg>
                   What is AEO?
                 </h4>
                 <p className="text-xs leading-relaxed opacity-80 mb-3">
                   Answer Engine Optimization (AEO) is the evolution of SEO. It focuses on optimizing content for direct answer services like ChatGPT and Google's SGE.
                 </p>
                 <ul className="text-[10px] space-y-2 font-mono">
                    <li className="flex gap-2">
                      <span className="text-indigo-400">01</span>
                      <span>Use Structured Data (JSON-LD)</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-indigo-400">02</span>
                      <span>Answer FAQs concisely</span>
                    </li>
                 </ul>
              </div>
            </div>

            {/* Right Column: Detailed Breakdown */}
            <div className="lg:col-span-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnalysisCard 
                  title="SEO" 
                  description="Technical search optimization"
                  data={analysis.seo}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  }
                />
                <AnalysisCard 
                  title="AEO" 
                  description="AI & Conversational Visibility"
                  data={analysis.aeo}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  }
                />
              </div>

              <div className="w-full">
                <AnalysisCard 
                  title="Google Ranking Factors" 
                  description="Authority, Speed, and Vitals"
                  data={analysis.googleRanking}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  }
                />
              </div>

              {/* Action Footer */}
              <div className="bg-white border-dashed border-2 border-slate-200 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 no-print">
                <div>
                  <h4 className="text-xl font-bold text-slate-800">Export Report</h4>
                  <p className="text-slate-500 text-sm">Download as PDF or copy the summary. Valid for 7 days.</p>
                </div>
                <div className="flex gap-3 relative">
                  <button 
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    className={`px-6 py-2 font-semibold rounded-xl transition-all flex items-center gap-2 ${
                      isExporting 
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isExporting ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Preparing...
                      </>
                    ) : 'Save as PDF'}
                  </button>
                  <button 
                    onClick={handleShareLink}
                    className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                  >
                    {isCopied ? 'Copied!' : 'Share Link'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!analysis && !isAnalyzing && (
        <div className="max-w-4xl mx-auto px-4 mt-24 text-center no-print">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h5 className="font-bold text-slate-800 mb-2">Deep Audit</h5>
                <p className="text-sm text-slate-500">Comprehensive check of technical SEO factors.</p>
              </div>
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h5 className="font-bold text-slate-800 mb-2">AEO Readiness</h5>
                <p className="text-sm text-slate-500">Optimized for Gemini, ChatGPT, and AI Search.</p>
              </div>
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="w-10 h-10 bg-violet-100 text-violet-600 rounded-lg flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h5 className="font-bold text-slate-800 mb-2">Ranking Stability</h5>
                <p className="text-sm text-slate-500">Fixed standard benchmarking for one week.</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
