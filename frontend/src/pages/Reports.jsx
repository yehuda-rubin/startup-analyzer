import React, { useState, useEffect } from 'react';
import { listStartups, generateReport } from '../services/api';
import ScoreAnalysis from '../components/ScoreAnalysis';
import { FileText, Printer, Check, Loader2, AlertCircle } from 'lucide-react';

function Reports() {
  const [startups, setStartups] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [reports, setReports] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStartups();
  }, []);

  const loadStartups = async () => {
    try {
      const data = await listStartups();
      setStartups(data);
    } catch (error) {
      console.error('Failed to load startups:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStartup = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleGenerate = async () => {
    if (selectedIds.length === 0) return;

    setGenerating(true);
    try {
      const result = await generateReport(selectedIds);
      setReports(result.reports);
    } catch (error) {
      console.error('Report generation failed:', error);
      alert('Report generation failed: ' + (error.response?.data?.detail || error.message));
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getScoreColor = (score) => {
    if (!score) return 'text-zinc-500';
    if (score >= 80) return 'text-[#00FF41]';
    if (score >= 60) return 'text-[#00E5FF]';
    return 'text-red-500';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-zinc-500 animate-pulse">
        <Loader2 className="w-12 h-12 mb-4 opacity-50 text-[#00E5FF] animate-spin" />
        <p className="text-lg tracking-wider font-mono">Loading Entities...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="no-print mb-12">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight flex items-center gap-3">
              <FileText className="text-[#00FF41]" /> Investor Reports
            </h1>
            <p className="text-zinc-400">
              Generate comprehensive investment analysis reports for your portfolio startups
            </p>
          </div>
        </div>
      </div>

      <div className="no-print bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 rounded-xl p-8 mb-12 shadow-[0_0_50px_rgba(0,0,0,0.3)]">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
          <Check className="text-[#00E5FF]" size={20} /> Select Startups for Report
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {startups.map(startup => (
            <label
              key={startup.id}
              className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all duration-300 border
                ${selectedIds.includes(startup.id)
                  ? 'bg-[#00E5FF]/10 border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.1)]'
                  : 'bg-black/40 border-zinc-800 hover:border-zinc-600'
                }`}
            >
              <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors
                 ${selectedIds.includes(startup.id) ? 'bg-[#00E5FF] border-[#00E5FF]' : 'border-zinc-600 bg-transparent'}
              `}>
                {selectedIds.includes(startup.id) && <Check size={14} className="text-black font-bold" />}
                <input
                  type="checkbox"
                  checked={selectedIds.includes(startup.id)}
                  onChange={() => toggleStartup(startup.id)}
                  className="hidden"
                />
              </div>
              <span className={`font-medium ${selectedIds.includes(startup.id) ? 'text-white' : 'text-zinc-400'}`}>
                {startup.name}
              </span>
            </label>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={handleGenerate}
            disabled={generating || selectedIds.length === 0}
            className={`px-8 py-3 rounded-lg font-bold uppercase tracking-wide transition-all duration-300 shadow-lg flex items-center gap-2
              ${generating || selectedIds.length === 0
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#00FF41] to-[#00E5FF] text-black hover:scale-[1.02] shadow-[0_0_20px_rgba(0,255,65,0.2)] hover:shadow-[0_0_30px_rgba(0,255,65,0.4)]'
              }`}
          >
            {generating ? (
              <><Loader2 className="animate-spin h-5 w-5" /> Generating Reports...</>
            ) : (
              <><FileText className="h-5 w-5" /> Generate Reports</>
            )}
          </button>

          {selectedIds.length > 0 && (
            <span className="text-zinc-500 font-mono text-sm">
              <span className="text-[#00FF41] font-bold">{selectedIds.length}</span> entities selected
            </span>
          )}
        </div>
      </div>

      {reports.length > 0 && (
        <div className="no-print mb-8 text-right">
          <button
            onClick={handlePrint}
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-all flex items-center gap-2 ml-auto hover:shadow-lg border border-white/5"
          >
            <Printer size={18} /> Print / Save as PDF
          </button>
        </div>
      )}

      {/* Reports Section */}
      <div className="space-y-12 print:space-y-0 text-white print:text-black">
        {reports.map((report, index) => (
          <div key={report.startup_id || index} className="bg-[#0A0A0A]/90 backdrop-blur-xl border border-white/10 rounded-xl p-12 print:p-0 print:border-none print:shadow-none print:bg-white print:text-black mb-12 print:block break-after-page">

            {/* Report Header */}
            <div className="border-b-2 border-[#00FF41] pb-6 mb-8 print:border-black">
              <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 print:text-black print:bg-none mb-2">
                {report.startup_name}
              </h2>
              <div className="flex items-center gap-3 text-zinc-500 print:text-black font-mono text-sm uppercase tracking-wider">
                <span>Investment Analysis Report</span>
                <span>•</span>
                <span>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>

            {report.score_breakdown && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-6 bg-white/5 rounded-lg border border-white/5 print:bg-gray-50 print:border-gray-200">
                {report.overall_score && (
                  <div className="text-center">
                    <div className="text-xs uppercase font-bold text-zinc-500 mb-1 tracking-wider">Overall Score</div>
                    <div className={`text-4xl font-bold ${getScoreColor(report.overall_score)} print:text-black`}>
                      {report.overall_score.toFixed(1)}
                    </div>
                  </div>
                )}
                {report.confidence_level && (
                  <div className="text-center border-l border-white/10 print:border-gray-200">
                    <div className="text-xs uppercase font-bold text-zinc-500 mb-1 tracking-wider">Confidence</div>
                    <div className="text-2xl font-bold text-white print:text-black mt-2">{report.confidence_level}</div>
                  </div>
                )}
              </div>
            )}

            {/* Sections */}
            <ReportSection title="Executive Summary" icon="🎯">
              <ScoreAnalysis reasoning={report.executive_summary} />
            </ReportSection>

            <ReportSection title="Score Breakdown" icon="📊">
              <ScoreAnalysis reasoning={report.score_breakdown} />
            </ReportSection>

            <ReportSection title="Market Analysis" icon="📈">
              <ScoreAnalysis reasoning={report.market_analysis} />
            </ReportSection>

            <ReportSection title="SWOT Analysis" icon="⚖️">
              <ScoreAnalysis reasoning={report.swot_analysis} />
            </ReportSection>

            {report.recommendation && (
              <div className={`mt-8 p-6 rounded-lg border-l-4 print:border-4
                ${report.recommendation.toLowerCase().includes('not recommend') || report.recommendation.toLowerCase().includes('pass')
                  ? 'bg-red-500/10 border-red-500 print:bg-red-50 print:border-red-500'
                  : 'bg-[#00FF41]/10 border-[#00FF41] print:bg-green-50 print:border-green-500'
                }`}
              >
                <h3 className={`text-xl font-bold mb-2 flex items-center gap-2
                   ${report.recommendation.toLowerCase().includes('not recommend') || report.recommendation.toLowerCase().includes('pass')
                    ? 'text-red-400 print:text-red-700'
                    : 'text-[#00FF41] print:text-green-700'
                  }`}
                >
                  💡 Investment Recommendation
                </h3>
                <p className={`font-semibold text-lg leading-relaxed
                   ${report.recommendation.toLowerCase().includes('not recommend') || report.recommendation.toLowerCase().includes('pass')
                    ? 'text-red-200 print:text-red-900'
                    : 'text-zinc-200 print:text-green-900'
                  }`}
                >
                  {report.recommendation}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background-color: white !important;
            color: black !important;
          }
          .bg-black {
             background-color: white !important;
          }
          .text-white {
             color: black !important;
          }
        }
      `}</style>
    </div>
  );
}

const ReportSection = ({ title, icon, children }) => (
  <div className="mb-8 print:mb-6">
    <h3 className="text-xl font-bold text-white print:text-black mb-4 flex items-center gap-2 border-b border-white/5 pb-2 print:border-gray-200">
      <span className="text-[#00E5FF] print:text-black">{icon}</span> {title}
    </h3>
    <div className="text-zinc-300 print:text-gray-800 leading-relaxed">
      {children}
    </div>
  </div>
);

export default Reports;