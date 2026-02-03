import React, { useState, useEffect } from 'react';
import ScoreAnalysis from '../components/ScoreAnalysis';
import ChatContainer from '../components/ChatContainer';
import { useParams } from 'react-router-dom';
import {
  listStartups,
  analyzeStartup,
  getStartupAnalyses,
  calculateScore,
  getStartupScores
} from '../services/api';
import ScoreGauge from '../components/ScoreGauge';
import { Search, Calculator, AlertCircle, CheckCircle2, AlertTriangle, Target, Zap, Loader2 } from 'lucide-react';

function Analysis() {
  const { startupId: urlStartupId } = useParams();
  const [startups, setStartups] = useState([]);
  const [selectedStartupId, setSelectedStartupId] = useState(urlStartupId || '');
  const [analysis, setAnalysis] = useState(null);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [scoring, setScoring] = useState(false);

  useEffect(() => {
    loadStartups();
  }, []);

  useEffect(() => {
    if (selectedStartupId) {
      loadData();
    }
  }, [selectedStartupId]);

  const loadStartups = async () => {
    try {
      const data = await listStartups();
      setStartups(data);
      if (data.length > 0 && !selectedStartupId) {
        setSelectedStartupId(data[0].id.toString());
      }
    } catch (error) {
      console.error('Failed to load startups:', error);
    }
  };

  const loadData = async () => {
    if (!selectedStartupId) return;

    setLoading(true);
    try {
      // Load latest analysis
      const analyses = await getStartupAnalyses(parseInt(selectedStartupId));
      if (analyses.length > 0) {
        setAnalysis(analyses[0]);
      } else {
        setAnalysis(null);
      }

      // Load latest score
      const scores = await getStartupScores(parseInt(selectedStartupId));
      if (scores.length > 0) {
        setScore(scores[0]);
      } else {
        setScore(null);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedStartupId) return;

    setAnalyzing(true);
    try {
      const result = await analyzeStartup(parseInt(selectedStartupId));
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Analysis failed: ' + (error.response?.data?.detail || error.message));
    } finally {
      setAnalyzing(false);
    }
  };

  const handleScore = async () => {
    if (!selectedStartupId) return;

    setScoring(true);
    try {
      const result = await calculateScore(parseInt(selectedStartupId));
      setScore(result);
    } catch (error) {
      console.error('Scoring failed:', error);
      alert('Scoring failed: ' + (error.response?.data?.detail || error.message));
    } finally {
      setScoring(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-4">
          Startup Analysis <span className="text-zinc-600 text-2xl font-normal">|</span> <span className="text-[#00FF41] font-mono text-2xl">Deep Scan</span>
        </h1>
        <div className="relative group">
          <select
            value={selectedStartupId}
            onChange={(e) => setSelectedStartupId(e.target.value)}
            className="appearance-none bg-[#0A0A0A] border border-zinc-800 text-white py-3 pl-4 pr-12 rounded-lg min-w-[250px] focus:outline-none focus:border-[#00FF41] focus:shadow-[0_0_15px_rgba(0,255,65,0.15)] transition-all"
          >
            <option value="">Select a startup...</option>
            {startups.map(startup => (
              <option key={startup.id} value={startup.id}>
                {startup.name}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 group-hover:text-[#00FF41] transition-colors">
            ▼
          </div>
        </div>
      </div>

      {selectedStartupId && (
        <div className="flex gap-4 mb-12">
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className={`px-8 py-3 rounded-lg font-bold uppercase tracking-wide transition-all duration-300 shadow-lg flex items-center gap-2
              ${analyzing
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#00E5FF] to-[#0055FF] text-white hover:scale-[1.02] shadow-[0_0_20px_rgba(0,229,255,0.2)] hover:shadow-[0_0_30px_rgba(0,229,255,0.4)]'
              }`}
          >
            {analyzing ? (
              <><Loader2 className="animate-spin h-5 w-5" /> Processing Deep Scan...</>
            ) : (
              <><Search className="h-5 w-5" /> Run Deep Analysis</>
            )}
          </button>

          <button
            onClick={handleScore}
            disabled={scoring}
            className={`px-8 py-3 rounded-lg font-bold uppercase tracking-wide transition-all duration-300 shadow-lg flex items-center gap-2
              ${scoring
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#00FF41] to-[#00CC33] text-black hover:scale-[1.02] shadow-[0_0_20px_rgba(0,255,65,0.2)] hover:shadow-[0_0_30px_rgba(0,255,65,0.4)]'
              }`}
          >
            {scoring ? (
              <><Loader2 className="animate-spin h-5 w-5" /> Calculating Vector Score...</>
            ) : (
              <><Calculator className="h-5 w-5" /> Calculate Score</>
            )}
          </button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-zinc-500 animate-pulse">
          <Zap className="w-12 h-12 mb-4 opacity-50 text-[#00FF41]" />
          <p className="text-lg tracking-wider font-mono">Retrieving Entity Data...</p>
        </div>
      )}

      {!loading && selectedStartupId && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {score && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/5 rounded-xl p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#00FF41]/5 rounded-full blur-[80px] pointer-events-none" />
                <ScoreGauge
                  overall_score={score.overall_score}
                  category_scores={score.category_scores}
                  showBreakdown={true}
                />
              </div>

              <div className="lg:col-span-2 bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/5 rounded-xl p-8">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Target className="text-[#00FF41]" /> Score Analysis
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-zinc-400 mb-4 bg-white/5 p-3 rounded-lg border border-white/5 inline-block">
                    <span className="uppercase font-bold tracking-wider">Confidence Level:</span>
                    <span className="text-white font-bold">{score.confidence_level}</span>
                  </div>
                  <ScoreAnalysis reasoning={score.reasoning} />
                </div>
              </div>
            </div>
          )}

          {analysis && (
            <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/5 rounded-xl p-8 relative overflow-hidden">
              {/* Background Glows */}
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#00E5FF]/5 rounded-full blur-[100px] pointer-events-none" />

              <h3 className="text-2xl font-bold text-white mb-8 border-b border-white/10 pb-4">
                Comprehensive Analysis Log
              </h3>

              <div className="mb-12">
                <h4 className="text-[#00E5FF] text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Executive Summary
                </h4>
                <p className="text-zinc-300 leading-relaxed text-lg border-l-2 border-[#00E5FF] pl-6 py-2 bg-gradient-to-r from-[#00E5FF]/10 to-transparent rounded-r-lg">
                  {analysis.summary}
                </p>
              </div>

              {analysis.key_insights && analysis.key_insights.length > 0 && (
                <div className="mb-12">
                  <h4 className="text-[#E0E0E0] text-sm font-bold uppercase tracking-wider mb-6">Key Insights</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.key_insights.map((insight, i) => (
                      <div key={i} className="flex gap-4 p-4 rounded-lg bg-white/5 border border-white/5 hover:border-[#00E5FF]/30 transition-colors">
                        <div className="text-[#00E5FF] font-bold text-xl pt-1">0{i + 1}</div>
                        <p className="text-zinc-400 text-sm leading-relaxed">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {analysis.strengths && analysis.strengths.length > 0 && (
                  <div className="bg-[#00FF41]/5 rounded-xl p-6 border border-[#00FF41]/10">
                    <h4 className="text-[#00FF41] font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" /> Strengths
                    </h4>
                    <ul className="space-y-3">
                      {analysis.strengths.map((item, i) => (
                        <li key={i} className="flex gap-3 text-zinc-300 text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41] mt-2 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.weaknesses && analysis.weaknesses.length > 0 && (
                  <div className="bg-red-500/5 rounded-xl p-6 border border-red-500/10">
                    <h4 className="text-red-500 font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" /> Weaknesses
                    </h4>
                    <ul className="space-y-3">
                      {analysis.weaknesses.map((item, i) => (
                        <li key={i} className="flex gap-3 text-zinc-300 text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {analysis.opportunities && analysis.opportunities.length > 0 && (
                  <div className="bg-[#00E5FF]/5 rounded-xl p-6 border border-[#00E5FF]/10">
                    <h4 className="text-[#00E5FF] font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
                      <Zap className="w-5 h-5" /> Opportunities
                    </h4>
                    <ul className="space-y-3">
                      {analysis.opportunities.map((item, i) => (
                        <li key={i} className="flex gap-3 text-zinc-300 text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] mt-2 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.threats && analysis.threats.length > 0 && (
                  <div className="bg-orange-500/5 rounded-xl p-6 border border-orange-500/10">
                    <h4 className="text-orange-500 font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" /> Threats
                    </h4>
                    <ul className="space-y-3">
                      {analysis.threats.map((item, i) => (
                        <li key={i} className="flex gap-3 text-zinc-300 text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {!analysis && !score && !loading && (
            <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-dashed border-zinc-800 rounded-2xl p-16 text-center">
              <Target className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400 text-lg">No analysis data found.</p>
              <p className="text-zinc-600 text-sm mt-2">Initiate "Deep Analysis" or "Calculate Score" to begin.</p>
            </div>
          )}
        </div>
      )}
      {/* Chat Feature - only shows when analysis exists */}
      {analysis && (
        <ChatContainer analysisId={analysis.id} />
      )}
    </div>
  );
}

export default Analysis;