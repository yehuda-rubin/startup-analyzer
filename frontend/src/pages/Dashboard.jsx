import React, { useState, useEffect } from 'react';
import { listStartups, getStartupScores } from '../services/api';
import StartupCard from '../components/StartupCard';
import { Plus } from 'lucide-react';

const styles = {
  container: {
    padding: '24px', // Consistent padding (24px)
  },
  header: {
    marginBottom: '32px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700', // Bold
    color: '#f8fafc', // Slate-50
    marginBottom: '8px',
    lineHeight: '1.2',
  },
  subtitle: {
    fontSize: '16px',
    color: '#94a3b8', // Slate-400
    lineHeight: '1.6', // Increased line-height
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
    gap: '24px',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '18px',
    color: '#64748b',
  },
  empty: {
    textAlign: 'center',
    padding: '80px 24px',
    backgroundColor: '#1e293b', // Card lighter background
    borderRadius: '12px',      // Modern radius
    border: '1px solid #334155', // Subtle border
    boxShadow: 'none',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '24px',
    opacity: 0.8,
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: '8px',
  },
  emptyText: {
    fontSize: '16px',
    color: '#94a3b8',
    marginBottom: '32px',
    lineHeight: '1.6',
    maxWidth: '400px',
    margin: '0 auto 32px auto',
  },
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: '#3b82f6', // Electric Blue
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'background-color 0.2s',
  },
  buttonHover: {
    backgroundColor: '#2563eb', // Darker blue on hover
  }
};

function Dashboard({ onSelectStartup }) {
  const [startups, setStartups] = useState([]);
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

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
    return <div style={styles.loading}>Loading portfolio data...</div>;
  }

  if (startups.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Startup Dashboard</h1>
          <p style={styles.subtitle}>Investment Portfolio Overview</p>
        </div>
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>�</div>
          <h3 style={styles.emptyTitle}>No startups tracked yet</h3>
          <p style={styles.emptyText}>
            Upload pitch decks or financial documents to begin analyzing potential investments with AI.
          </p>
          <a
            href="/upload"
            style={{ ...styles.button, ...(isHovering ? styles.buttonHover : {}) }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <Plus size={18} />
            Upload New Documents
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Startup Dashboard</h1>
        <p style={styles.subtitle}>
          Following {startups.length} active {startups.length !== 1 ? 'companies' : 'company'}
        </p>
      </div>

      <div style={styles.grid}>
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
    </div>
  );
}

export default Dashboard;