import React from 'react';

// Helper function to format scores
const formatScore = (score) => {
  if (score === null || score === undefined) return '0';
  const num = Number(score);
  if (isNaN(num)) return '0';

  // Round to 2 decimals
  const rounded = Math.round(num * 100) / 100;

  // If it's a whole number, show without decimals
  if (rounded % 1 === 0) {
    return rounded.toString();
  }

  // Otherwise show with up to 2 decimals, removing trailing zeros
  return rounded.toFixed(2).replace(/\.?0+$/, '');
};

function ScoreGauge({ overall_score, category_scores, showBreakdown = false }) {
  const getColor = (score) => {
    const num = Number(score) || 0;
    if (num >= 80) return '#00FF41'; // Neon Green
    if (num >= 60) return '#00E5FF'; // Cyan
    return '#ef4444'; // Red-500
  };

  const categories = category_scores ? [
    { name: 'Team', score: category_scores.team },
    { name: 'Product', score: category_scores.product },
    { name: 'Market', score: category_scores.market },
    { name: 'Traction', score: category_scores.traction },
    { name: 'Financials', score: category_scores.financials },
    { name: 'Innovation', score: category_scores.innovation },
  ] : [];

  const overallScoreNum = Number(overall_score) || 0;

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-[200px] h-[120px] mb-4 group cursor-default">
        {/* Glow behind gauge */}
        <div className="absolute inset-0 bg-[#00FF41]/10 blur-[40px] rounded-full opacity-50 group-hover:opacity-80 transition-opacity" />

        <svg width="200" height="120" viewBox="0 0 200 120" className="relative z-10 drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]">
          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Score arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={getColor(overallScoreNum)}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${(overallScoreNum / 100) * 251.2} 251.2`}
            className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_currentColor]"
          />
        </svg>
        <div
          className="absolute bottom-2 left-1/2 -translate-x-1/2 text-5xl font-bold tracking-tighter transition-colors duration-300 drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]"
          style={{ color: getColor(overallScoreNum) }}
        >
          {formatScore(overallScoreNum)}
        </div>
      </div>

      <div className="text-zinc-500 text-sm font-bold uppercase tracking-widest mb-8">Overall Score</div>

      {showBreakdown && category_scores && (
        <div className="w-full space-y-4">
          {categories.map((cat, i) => {
            const catScore = Number(cat.score) || 0;
            return (
              <div key={cat.name} className="group/bar">
                <div className="flex justify-between mb-1 text-sm font-medium">
                  <span className="text-zinc-400 group-hover/bar:text-white transition-colors">{cat.name}</span>
                  <span style={{ color: getColor(catScore) }} className="font-mono font-bold drop-shadow-[0_0_5px_currentColor]">
                    {formatScore(catScore)}
                  </span>
                </div>
                <div className="w-full h-2 bg-[#1a1a1a] rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_currentColor]"
                    style={{
                      width: `${catScore}%`,
                      backgroundColor: getColor(catScore)
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ScoreGauge;