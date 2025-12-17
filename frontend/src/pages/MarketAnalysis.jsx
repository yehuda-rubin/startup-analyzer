import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { listStartups, analyzeMarket, getMarketAnalyses } from '../services/api';
import MarketChart from '../components/MarketChart';
import { TrendingUp, Users, Target, Activity, AlertCircle, Loader2 } from 'lucide-react';

function MarketAnalysis() {
  const { startupId: urlStartupId } = useParams();
  const [startups, setStartups] = useState([]);
  const [selectedStartupId, setSelectedStartupId] = useState(urlStartupId || '');
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    loadStartups();
  }, []);

  useEffect(() => {
    if (selectedStartupId) {
      loadMarketData();
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

  const loadMarketData = async () => {
    if (!selectedStartupId) return;

    setLoading(true);
    try {
      const analyses = await getMarketAnalyses(parseInt(selectedStartupId));
      if (analyses.length > 0) {
        setMarketData(analyses[0]);
      } else {
        setMarketData(null);
      }
    } catch (error) {
      console.error('Failed to load market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedStartupId) return;

    setAnalyzing(true);
    try {
      const result = await analyzeMarket(parseInt(selectedStartupId));
      setMarketData(result);
    } catch (error) {
      console.error('Market analysis failed:', error);
      alert('Market analysis failed: ' + (error.response?.data?.detail || error.message));
    } finally {
      setAnalyzing(false);
    }
  };

  const getImpactColor = (impact) => {
    if (impact === 'positive') return 'text-[#00FF41] border-[#00FF41]/30 bg-[#00FF41]/10';
    if (impact === 'negative') return 'text-red-500 border-red-500/30 bg-red-500/10';
    return 'text-zinc-400 border-zinc-700 bg-zinc-800/50';
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-4">
          Market Analysis <span className="text-zinc-600 text-2xl font-normal">|</span> <span className="text-[#00E5FF] font-mono text-2xl">TAM/SAM/SOM</span>
        </h1>
        <div className="relative group">
          <select
            value={selectedStartupId}
            onChange={(e) => setSelectedStartupId(e.target.value)}
            className="appearance-none bg-[#0A0A0A] border border-zinc-800 text-white py-3 pl-4 pr-12 rounded-lg min-w-[250px] focus:outline-none focus:border-[#00E5FF] focus:shadow-[0_0_15px_rgba(0,229,255,0.15)] transition-all"
          >
            <option value="">Select a startup...</option>
            {startups.map(startup => (
              <option key={startup.id} value={startup.id}>
                {startup.name}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 group-hover:text-[#00E5FF] transition-colors">
            ▼
          </div>
        </div>
      </div>

      {selectedStartupId && (
        <div className="mb-8">
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
              <>
                <Loader2 className="animate-spin h-5 w-5" /> Processing Market Data
              </>
            ) : (
              <>
                <TrendingUp className="h-5 w-5" /> Run Market Analysis
              </>
            )}
          </button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-zinc-500 animate-pulse">
          <Activity className="w-12 h-12 mb-4 opacity-50 text-[#00E5FF]" />
          <p className="text-lg tracking-wider font-mono">Retrieving Market Vector Data...</p>
        </div>
      )}

      {!loading && marketData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

          {/* Main Chart Column */}
          <div className="lg:col-span-3">
            <MarketChart marketData={marketData} />
          </div>

          <div className="lg:col-span-2 space-y-8">
            {/* Market Insights */}
            <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/5 rounded-xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#00E5FF]/5 rounded-full blur-[80px] pointer-events-none" />
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Target className="text-[#00E5FF]" /> Market Evaluation
              </h3>

              <div className="mb-8">
                <h4 className="text-[#E0E0E0] text-sm font-bold uppercase tracking-wider mb-2">Projected Growth</h4>
                <div className="text-5xl font-bold text-[#00FF41] mb-2 drop-shadow-[0_0_10px_rgba(0,255,65,0.3)]">
                  +{marketData.growth_rate}%
                </div>
                <p className="text-zinc-500 text-sm">Annual Compound Growth Rate (CAGR)</p>
              </div>

              <div className="mb-8">
                <h4 className="text-[#E0E0E0] text-sm font-bold uppercase tracking-wider mb-2">Growth Logic</h4>
                <p className="text-zinc-300 leading-relaxed border-l-2 border-[#00E5FF]/30 pl-4">
                  {marketData.market_size_reasoning}
                </p>
              </div>

              {marketData.market_trends && marketData.market_trends.length > 0 && (
                <div>
                  <h4 className="text-[#E0E0E0] text-sm font-bold uppercase tracking-wider mb-4">Core Trends</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {marketData.market_trends.map((trend, index) => (
                      <div key={index} className={`p-4 rounded-lg border ${getImpactColor(trend.impact)}`}>
                        <div className="font-bold mb-1">{trend.trend}</div>
                        <p className="text-xs opacity-80 mb-2">{trend.description}</p>
                        <div className="text-[10px] font-bold uppercase tracking-wider opacity-90">
                          Impact: {trend.impact}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Competitive Advantages */}
            {marketData.competitive_advantages && marketData.competitive_advantages.length > 0 && (
              <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/5 rounded-xl p-8">
                <h3 className="text-xl font-bold text-white mb-6">Competitive Edge</h3>
                <ul className="space-y-3">
                  {marketData.competitive_advantages.map((advantage, index) => (
                    <li key={index} className="flex items-start gap-3 text-zinc-300">
                      <CheckmarkIcon />
                      <span>{advantage}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-8">
            {/* Competitors */}
            {marketData.competitors && marketData.competitors.length > 0 && (
              <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/5 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Users className="text-[#f39c12]" /> Competition
                </h3>
                <div className="space-y-4">
                  {marketData.competitors.map((competitor, index) => (
                    <div key={index} className="p-4 bg-white/5 border border-white/5 rounded-lg">
                      <div className="font-bold text-white mb-1">{competitor.name}</div>
                      <div className="text-xs text-zinc-400 mb-3">{competitor.description}</div>
                      {competitor.strength && (
                        <div className="text-xs border-t border-white/10 pt-2">
                          <span className="text-[#f39c12] font-bold">Strength: </span>
                          <span className="text-zinc-300">{competitor.strength}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/5 rounded-xl p-6 text-center">
              <h4 className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">Analysis Confidence</h4>
              <div className="text-3xl font-bold text-white">
                {(marketData.confidence_score * 100).toFixed(0)}%
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-[#00E5FF] h-full rounded-full"
                  style={{ width: `${marketData.confidence_score * 100}%` }}
                />
              </div>
            </div>
          </div>

        </div>
      )}

      {!loading && !marketData && selectedStartupId && (
        <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-dashed border-zinc-800 rounded-2xl p-16 text-center">
          <AlertCircle className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400 text-lg">No market analysis vector data found.</p>
          <p className="text-zinc-600 text-sm mt-2">Initiate analysis sequence to generate insights.</p>
        </div>
      )}
    </div>
  );
}

const CheckmarkIcon = () => (
  <svg className="w-5 h-5 text-[#00FF41] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
);

export default MarketAnalysis;