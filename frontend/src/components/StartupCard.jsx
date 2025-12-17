import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteStartup } from '../services/api';

const getScoreColor = (score) => {
  if (!score) return 'text-slate-400';
  const numScore = parseFloat(score);
  if (numScore >= 80) return 'text-emerald-400';
  if (numScore >= 60) return 'text-yellow-400';
  return 'text-red-400';
};

function StartupCard({ startup, score, onClick, onDelete }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    
    const confirmFirst = window.confirm(
      `Are you sure you want to delete "${startup.name}"?\n\n` +
      `This will delete:\n` +
      `• All uploaded documents\n` +
      `• All analysis data\n` +
      `• All scores and market data\n\n` +
      `This action cannot be undone.`
    );
    
    if (!confirmFirst) return;
    
    const confirmSecond = window.confirm(
      `⚠️ FINAL CONFIRMATION ⚠️\n\n` +
      `Delete "${startup.name}" permanently?\n\n` +
      `Type the startup name to confirm: ${startup.name}`
    );
    
    if (!confirmSecond) return;
    
    setIsDeleting(true);
    try {
      await deleteStartup(startup.id);
      alert(`✓ "${startup.name}" deleted successfully`);
      
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
      className={`bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 cursor-pointer transition-all duration-300 ${
        isHovered ? 'shadow-2xl shadow-indigo-500/10 -translate-y-1 border-indigo-500/30 bg-white/10' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick && onClick(startup)}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-white flex-1 mr-3">{startup.name}</h3>
        {score && (
          <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
            {score}
          </span>
        )}
      </div>

      {startup.description && (
        <p className="text-sm text-slate-400 mb-4 leading-relaxed line-clamp-2">
          {startup.description}
        </p>
      )}

      <div className="flex gap-2 flex-wrap mb-5">
        {startup.industry && (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {startup.industry}
          </span>
        )}
        {startup.stage && (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            {startup.stage}
          </span>
        )}
      </div>

      <div className="flex gap-2 pt-4 border-t border-white/5">
        <button
          className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-all hover:shadow-lg hover:shadow-indigo-500/25"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/analysis/${startup.id}`);
          }}
        >
          View Analysis
        </button>
        <button
          className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-sm font-semibold transition-all border border-white/10"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/market/${startup.id}`);
          }}
        >
          Market Data
        </button>
        <button
          className="px-3 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-semibold transition-all border border-red-500/30"
          onClick={handleDelete}
          disabled={isDeleting}
          title="Delete Startup"
        >
          {isDeleting ? '⏳' : '🗑️'}
        </button>
      </div>
    </div>
  );
}

export default StartupCard;
