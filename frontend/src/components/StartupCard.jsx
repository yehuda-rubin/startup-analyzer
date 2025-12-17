import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteStartup } from '../services/api';
import { Trash2, ArrowRight, Activity } from 'lucide-react';

const getScoreColor = (score) => {
  if (!score) return 'text-zinc-500';
  if (score >= 80) return 'text-[#00FF41] drop-shadow-[0_0_8px_rgba(0,255,65,0.5)]'; // Neon Green
  if (score >= 60) return 'text-[#00E5FF] drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]'; // Neon Cyan
  return 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]'; // Red
};

function StartupCard({ startup, score, onClick, onDelete }) {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();

    // First confirmation
    const confirmFirst = window.confirm(
      `Delete "${startup.name}"?\n\nThis will permanently destroy all analysis and market data.`
    );

    if (!confirmFirst) return;

    setIsDeleting(true);
    try {
      await deleteStartup(startup.id);
      if (onDelete) {
        onDelete(startup.id);
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert(`Failed to delete startup: ${error.response?.data?.detail || error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      onClick={() => onClick && onClick(startup)}
      className="group relative bg-[#0A0A0A]/80 backdrop-blur-md border border-white/5 rounded-xl p-6 
        transition-all duration-300 hover:border-[#00FF41]/30 hover:shadow-[0_0_30px_rgba(0,255,65,0.1)] hover:-translate-y-1 cursor-pointer overflow-hidden"
    >
      {/* Hover Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00FF41]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-white group-hover:text-[#00FF41] transition-colors truncate pr-4">
            {startup.name}
          </h3>
          {score && (
            <div className={`text-2xl font-bold ${getScoreColor(score)} flex items-center gap-1`}>
              <Activity size={16} />
              {score}
            </div>
          )}
        </div>

        {startup.description && (
          <p className="text-zinc-400 text-sm mb-6 line-clamp-2 leading-relaxed">
            {startup.description}
          </p>
        )}

        <div className="flex gap-2 flex-wrap mb-6">
          {startup.industry && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20">
              {startup.industry}
            </span>
          )}
          {startup.stage && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/20">
              {startup.stage}
            </span>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/analysis/${startup.id}`);
            }}
            className="flex-1 px-4 py-2 bg-white/5 hover:bg-[#00FF41] hover:text-black text-white rounded-lg text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 group/btn"
          >
            Analysis <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/market/${startup.id}`);
            }}
            className="px-4 py-2 bg-white/5 hover:bg-[#00E5FF] hover:text-black text-white rounded-lg text-sm font-medium transition-all duration-300"
          >
            Market
          </button>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg transition-all duration-300 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]"
            title="Delete Startup"
          >
            {isDeleting ? '...' : <Trash2 size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default StartupCard;