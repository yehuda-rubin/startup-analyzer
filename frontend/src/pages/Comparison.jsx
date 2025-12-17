import React, { useState, useEffect } from 'react';
import { listStartups, getStartupScores } from '../services/api';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from 'recharts';
import { Scale, Check, AlertCircle, Loader2 } from 'lucide-react';

function Comparison() {
  const [startups, setStartups] = useState([]);
  const [scores, setScores] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const startupsData = await listStartups();
      setStartups(startupsData);

      // Load scores
      const scoresData = {};
      for (const startup of startupsData) {
        try {
          const startupScores = await getStartupScores(startup.id);
          if (startupScores.length > 0) {
            scoresData[startup.id] = startupScores[0];
          }
        } catch (error) {
          console.error(`Failed to load scores for ${startup.id}`, error);
        }
      }
      setScores(scoresData);
    } catch (error) {
      console.error('Failed to load data:', error);
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

  const getRadarData = () => {
    if (selectedIds.length === 0) return [];

    const categories = ['Team', 'Product', 'Market', 'Traction', 'Financials', 'Innovation'];

    return categories.map(category => {
      const dataPoint = { category };
      selectedIds.forEach(id => {
        const startup = startups.find(s => s.id === id);
        const score = scores[id];
        if (score && startup) {
          const categoryKey = category.toLowerCase() + '_score';
          dataPoint[startup.name] = score.category_scores?.[category.toLowerCase()] || 0;
        }
      });
      return dataPoint;
    });
  };

  const getColor = (index) => {
    const colors = ['#00FF41', '#00E5FF', '#f39c12', '#e74c3c', '#9b59b6', '#1abc9c'];
    return colors[index % colors.length];
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-[#00FF41]';
    if (score >= 60) return 'text-[#00E5FF]';
    return 'text-red-500';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-zinc-500 animate-pulse">
        <Loader2 className="w-12 h-12 mb-4 opacity-50 text-[#00E5FF] animate-spin" />
        <p className="text-lg tracking-wider font-mono">Loading Data...</p>
      </div>
    );
  }

  const selectedStartups = selectedIds.map(id => startups.find(s => s.id === id)).filter(Boolean);
  const radarData = getRadarData();

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight flex items-center gap-3">
          <Scale className="text-[#00FF41]" /> Entity Comparison
        </h1>
        <p className="text-zinc-400">
          Compare startup metrics and performance scores side-by-side
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
        {startups.map(startup => (
          <div
            key={startup.id}
            onClick={() => toggleStartup(startup.id)}
            className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border backdrop-blur-md
              ${selectedIds.includes(startup.id)
                ? 'bg-[#00E5FF]/10 border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.15)] relative z-10'
                : 'bg-black/40 border-zinc-800 hover:border-zinc-600 hover:bg-white/5'
              }`}
          >
            <div className="flex items-start justify-between mb-2">
              <span className={`font-bold transition-colors ${selectedIds.includes(startup.id) ? 'text-white' : 'text-zinc-400'}`}>
                {startup.name}
              </span>
              <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors
                  ${selectedIds.includes(startup.id) ? 'bg-[#00E5FF] border-[#00E5FF]' : 'border-zinc-600 bg-transparent'}
               `}>
                {selectedIds.includes(startup.id) && <Check size={14} className="text-black font-bold" />}
              </div>
            </div>

            {scores[startup.id] ? (
              <div className="flex items-end gap-2">
                <span className={`text-2xl font-bold ${getScoreColor(scores[startup.id].overall_score)}`}>
                  {scores[startup.id].overall_score.toFixed(0)}
                </span>
                <span className="text-xs text-zinc-500 mb-1 font-mono uppercase">Overall Score</span>
              </div>
            ) : (
              <span className="text-xs text-zinc-600 font-mono">No Score Data</span>
            )}
          </div>
        ))}
      </div>

      {selectedIds.length === 0 && (
        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-xl bg-white/5 text-zinc-500">
          <Scale className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Select 2 or more entities to initiate comparison sequence</p>
        </div>
      )}

      {selectedIds.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* Chart */}
          <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/5 rounded-xl p-8">
            <h3 className="text-xl font-bold text-white mb-6 text-center">Metric Overlay</h3>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#333" />
                  <PolarAngleAxis dataKey="category" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#333" tick={{ fill: '#666' }} />
                  {selectedStartups.map((startup, index) => (
                    <Radar
                      key={startup.id}
                      name={startup.name}
                      dataKey={startup.name}
                      stroke={getColor(index)}
                      fill={getColor(index)}
                      fillOpacity={0.2}
                    />
                  ))}
                  <Legend wrapperStyle={{ color: '#fff', paddingTop: '20px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table */}
          <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/5 rounded-xl p-0 overflow-hidden">
            <div className="p-6 border-b border-white/5">
              <h3 className="text-xl font-bold text-white mb-0">Detailed Specs</h3>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider bg-black/20 border-b border-zinc-800 sticky left-0 z-10 backdrop-blur-md">Category</th>
                    {selectedStartups.map(startup => (
                      <th key={startup.id} className="p-4 text-sm font-bold text-white border-b border-zinc-800 min-w-[120px] whitespace-nowrap">
                        {startup.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  <tr className="bg-white/5">
                    <td className="p-4 text-sm font-bold text-white sticky left-0 bg-[#0A0A0A] border-r border-zinc-800 z-10 backdrop-blur-md">Overall Score</td>
                    {selectedStartups.map(startup => {
                      const score = scores[startup.id];
                      return (
                        <td key={startup.id} className={`p-4 text-lg font-bold ${getScoreColor(score?.overall_score || 0)}`}>
                          {score?.overall_score?.toFixed(1) || 'N/A'}
                        </td>
                      );
                    })}
                  </tr>
                  {['Team', 'Product', 'Market', 'Traction', 'Financials', 'Innovation'].map(category => (
                    <tr key={category} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 text-sm text-zinc-400 sticky left-0 bg-[#0A0A0A] border-r border-zinc-800 z-10 backdrop-blur-md">{category}</td>
                      {selectedStartups.map(startup => {
                        const score = scores[startup.id];
                        const categoryScore = score?.category_scores?.[category.toLowerCase()];
                        return (
                          <td key={startup.id} className="p-4 text-sm text-zinc-300 font-mono">
                            {categoryScore?.toFixed(1) || 'N/A'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr>
                    <td className="p-4 text-sm text-zinc-400 sticky left-0 bg-[#0A0A0A] border-r border-zinc-800 z-10 backdrop-blur-md">Confidence</td>
                    {selectedStartups.map(startup => {
                      const score = scores[startup.id];
                      return (
                        <td key={startup.id} className="p-4 text-sm text-zinc-500 font-mono">
                          {score?.confidence_level || 'N/A'}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default Comparison;