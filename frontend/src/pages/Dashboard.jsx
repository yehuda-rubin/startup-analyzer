import React, { useState, useEffect } from 'react';
import { listStartups, getStartupScores } from '../services/api';
import StartupCard from '../components/StartupCard';

const styles = {
  container: {
    padding: '20px',
  },
  header: {
    marginBottom: '30px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#7f8c8d',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '18px',
    color: '#95a5a6',
  },
  empty: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '20px',
  },
  emptyText: {
    fontSize: '18px',
    color: '#7f8c8d',
    marginBottom: '20px',
  },
  button: {
    padding: '12px 24px',
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
  },
};

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
            scoresData[startup.id] = startupScores[0].overall_score;
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

  if (loading) {
    return <div style={styles.loading}>Loading startups...</div>;
  }

  if (startups.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>🚀</div>
          <div style={styles.emptyText}>No startups yet. Upload documents to get started!</div>
          <a href="/upload" style={styles.button}>Upload Documents</a>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Startup Dashboard</h1>
        <p style={styles.subtitle}>
          {startups.length} startup{startups.length !== 1 ? 's' : ''} in your portfolio
        </p>
      </div>

      <div style={styles.grid}>
        {startups.map(startup => (
          <StartupCard
            key={startup.id}
            startup={startup}
            score={scores[startup.id]}
            onClick={(s) => onSelectStartup && onSelectStartup(s)}
          />
        ))}
      </div>
    </div>
  );
}

export default Dashboard;