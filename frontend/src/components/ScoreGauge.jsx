import React from 'react';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
  },
  gauge: {
    position: 'relative',
    width: '200px',
    height: '120px',
  },
  score: {
    position: 'absolute',
    bottom: '10px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '48px',
    fontWeight: 'bold',
  },
  label: {
    marginTop: '10px',
    fontSize: '16px',
    color: '#7f8c8d',
  },
  breakdown: {
    marginTop: '20px',
    width: '100%',
  },
  barContainer: {
    marginBottom: '12px',
  },
  barLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '4px',
    fontSize: '14px',
  },
  barBackground: {
    width: '100%',
    height: '8px',
    backgroundColor: '#ecf0f1',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    transition: 'width 0.5s ease',
  },
};

function ScoreGauge({ overall_score, category_scores, showBreakdown = false }) {
  const getColor = (score) => {
    if (score >= 80) return '#27ae60';
    if (score >= 60) return '#f39c12';
    return '#e74c3c';
  };

  const categories = category_scores ? [
    { name: 'Team', score: category_scores.team },
    { name: 'Product', score: category_scores.product },
    { name: 'Market', score: category_scores.market },
    { name: 'Traction', score: category_scores.traction },
    { name: 'Financials', score: category_scores.financials },
    { name: 'Innovation', score: category_scores.innovation },
  ] : [];

  return (
    <div style={styles.container}>
      <div style={styles.gauge}>
        <svg width="200" height="120" viewBox="0 0 200 120">
          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#ecf0f1"
            strokeWidth="20"
            strokeLinecap="round"
          />
          {/* Score arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={getColor(overall_score)}
            strokeWidth="20"
            strokeLinecap="round"
            strokeDasharray={`${(overall_score / 100) * 251.2} 251.2`}
          />
        </svg>
        <div style={{
          ...styles.score,
          color: getColor(overall_score)
        }}>
          {overall_score}
        </div>
      </div>
      <div style={styles.label}>Overall Score</div>

      {showBreakdown && category_scores && (
        <div style={styles.breakdown}>
          {categories.map(cat => (
            <div key={cat.name} style={styles.barContainer}>
              <div style={styles.barLabel}>
                <span>{cat.name}</span>
                <span>{cat.score?.toFixed(0) || 0}</span>
              </div>
              <div style={styles.barBackground}>
                <div style={{
                  ...styles.barFill,
                  width: `${cat.score || 0}%`,
                  backgroundColor: getColor(cat.score || 0)
                }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ScoreGauge;