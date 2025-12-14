import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteStartup } from '../services/api';

const getScoreColor = (score) => {
  if (!score) return '#95a5a6';
  if (score >= 80) return '#27ae60';
  if (score >= 60) return '#f39c12';
  return '#e74c3c';
};

const styles = {
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    position: 'relative',
  },
  cardHover: {
    transform: 'translateY(-4px)',
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    marginBottom: '12px',
  },
  name: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#2c3e50',
    margin: '0',
    flex: 1,
  },
  score: {
    fontSize: '24px',
    fontWeight: '700',
    marginLeft: '12px',
  },
  description: {
    color: '#555',
    fontSize: '14px',
    marginBottom: '16px',
    lineHeight: '1.5',
  },
  meta: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '16px',
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '600',
  },
  badgeIndustry: {
    backgroundColor: '#e8f4f8',
    color: '#2980b9',
  },
  badgeStage: {
    backgroundColor: '#fce8f3',
    color: '#8e44ad',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  button: {
    padding: '10px 16px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    flex: 1,
  },
  buttonPrimary: {
    backgroundColor: '#3498db',
    color: 'white',
  },
  buttonSecondary: {
    backgroundColor: '#ecf0f1',
    color: '#2c3e50',
  },
  buttonDelete: {
    backgroundColor: '#e74c3c',
    color: 'white',
    flex: '0 0 auto',
    padding: '10px 12px',
  },
  deleteIcon: {
    fontSize: '16px',
  },
};

function StartupCard({ startup, score, onClick, onDelete }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    
    // First confirmation
    const confirmFirst = window.confirm(
      `Are you sure you want to delete "${startup.name}"?\n\n` +
      `This will delete:\n` +
      `• All uploaded documents\n` +
      `• All analysis data\n` +
      `• All scores and market data\n\n` +
      `This action cannot be undone.`
    );
    
    if (!confirmFirst) return;
    
    // Second confirmation
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
      
      // Call onDelete callback to refresh the list
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
        <button
          style={{...styles.button, ...styles.buttonDelete}}
          onClick={handleDelete}
          disabled={isDeleting}
          title="Delete Startup"
        >
          <span style={styles.deleteIcon}>
            {isDeleting ? '⏳' : '🗑️'}
          </span>
        </button>
      </div>
    </div>
  );
}

export default StartupCard;