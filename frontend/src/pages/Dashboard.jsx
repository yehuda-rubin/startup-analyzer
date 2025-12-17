import React, { useState, useEffect } from 'react';
import { listStartups, getStartupScores } from '../services/api';
import StartupCard from '../components/StartupCard';
import { Plus, Database, activity } from 'lucide-react';

function Dashboard({ onSelectStartup }) {
  const [startups, setStartups] = useState([]);
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStartups();
  }, []);

  const loadStartups = async () => {
    try {
      const data = await listStartups();
      setStartups(data);

      // Load scores for each startup
      const scoresData = {};
      for (const startup of data) {
        try {
          const startupScores = await getStartupScores(startup.id);
          if (startupScores.length > 0) {
            scoresData[startup.id] = startupScores[0].overall_score.toFixed(1);
          }
        } catch (error) {
          console.error(`Failed to load scores for startup ${startup.id}`, error);
        }
      }
      setScores(scoresData);
    } catch (error) {
      console.error('Failed to load startups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (deletedId) => {
    // Remove from state immediately
    setStartups(prevStartups => prevStartups.filter(s => s.id !== deletedId));
    setScores(prevScores => {
      const newScores = { ...prevScores };
      delete newScores[deletedId];
      return newScores;
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-zinc-500 animate-pulse">
        <Database className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-lg tracking-wider font-mono">Initializing Grid...</p>
      </div>
    );
  }

  if (startups.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Startup Dashboard</h1>
          <p className="text-zinc-400 text-lg">Investment Portfolio Overview</p>
        </div>

        <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-dashed border-zinc-800 rounded-2xl p-16 text-center
            flex flex-col items-center justify-center transition-all duration-500 hover:border-[#00FF41]/30 hover:bg-[#00FF41]/5 group">
          <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_20px_rgba(0,255,65,0.1)]">
            <Database className="w-10 h-10 text-zinc-600 group-hover:text-[#00FF41] transition-colors" />
          </div>

          <h3 className="text-2xl font-bold text-white mb-3">System Empty</h3>
          <p className="text-zinc-400 max-w-md mx-auto mb-8 leading-relaxed">
            No active entities found in the grid. Upload pitch decks or financial documents to begin analysis sequence.
          </p>

          <a
            href="/upload"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#00FF41] hover:bg-[#00E5FF] text-black font-bold rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(0,255,65,0.2)] hover:shadow-[0_0_30px_rgba(0,229,255,0.3)] hover:-translate-y-1"
          >
            <Plus size={20} />
            Initialize New Entity
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Startup Dashboard</h1>
          <p className="text-zinc-400">
            Monitoring <span className="text-[#00FF41] font-mono font-bold">{startups.length}</span> active {startups.length !== 1 ? 'entities' : 'entity'}
          </p>
        </div>

        <a
          href="/upload"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-[#00FF41] text-white hover:text-black font-semibold rounded-lg transition-all duration-300 border border-white/10 hover:border-[#00FF41]"
        >
          <Plus size={18} />
          New Entity
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {startups.map(startup => (
          <StartupCard
            key={startup.id}
            startup={startup}
            score={scores[startup.id]}
            onClick={(s) => onSelectStartup && onSelectStartup(s)}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Footer Ambient Glow */}
      <div className="fixed bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent pointer-events-none z-20" />
    </div>
  );
}

export default Dashboard;