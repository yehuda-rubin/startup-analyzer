import React from 'react';
import { useNavigate } from 'react-router-dom';

const styles = {
  card: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  cardHover: {
    transform: 'translateY(-4px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    marginBottom: '12px',
  },
  name: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#2c3e50',
    margin: 0,
  },
  score: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#27ae60',
  },
  description: {
    fontSize: '14px',
    color: '#7f8c8d',
    marginBottom: '12px',
  },
  meta: {
    display: 'flex',
    gap: '15px',
    fontSize: '13px',
    color: '#95a5a6',
  },
  badge: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600',
  },
  badgeIndustry: {
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
  },
  badgeStage: {
    backgroundColor: '#f3e5f5',
    color: '#7b1fa2',
  },
  actions: {
    marginTop: '15px',
    display: 'flex',
    gap: '10px',
  },
  button: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  buttonPrimary: {
    backgroundColor: '#3498db',
    color: '#fff',
  },
  buttonSecondary: {
    backgroundColor: '#ecf0f1',
    color: '#2c3e50',
  },
};

function StartupCard({ startup, score, onClick }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = React.useState(false);

  const getScoreColor = (score) => {
    if (score >= 80) return '#27ae60';
    if (score >= 60) return '#f39c12';
    return '#e74c3c';
  };

  return (
    <div
      style={{
        ...styles.card,
        ...(isHovered ? styles.cardHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick && onClick(startup)}
    >
      <div style={styles.header}>
        <h3 style={styles.name}>{startup.name}</h3>
        {score && (
          <span style={{
            ...styles.score,
            color: getScoreColor(score)
          }}>
            {score}
          </span>
        )}
      </div>

      {startup.description && (
        <p style={styles.description}>{startup.description}</p>
      )}

      <div style={styles.meta}>
        {startup.industry && (
          <span style={{...styles.badge, ...styles.badgeIndustry}}>
            {startup.industry}
          </span>
        )}
        {startup.stage && (
          <span style={{...styles.badge, ...styles.badgeStage}}>
            {startup.stage}
          </span>
        )}
        {startup.founded_year && (
          <span>Founded: {startup.founded_year}</span>
        )}
      </div>

      <div style={styles.actions}>
        <button
          style={{...styles.button, ...styles.buttonPrimary}}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/analysis/${startup.id}`);
          }}
        >
          View Analysis
        </button>
        <button
          style={{...styles.button, ...styles.buttonSecondary}}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/market/${startup.id}`);
          }}
        >
          Market Data
        </button>
      </div>
    </div>
  );
}

export default StartupCard;