import React, { useState, useEffect } from 'react';
import { listStartups, getStartupScores } from '../services/api';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from 'recharts';

const styles = {
  container: {
    padding: '20px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: '30px',
  },
  selectionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '15px',
    marginBottom: '30px',
  },
  checkboxCard: {
    padding: '15px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  checkboxCardSelected: {
    backgroundColor: '#e3f2fd',
    borderLeft: '4px solid #2196f3',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
  },
  startupName: {
    fontWeight: '600',
    fontSize: '16px',
    color: '#2c3e50',
  },
  chart: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '30px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '20px',
  },
  chartTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '20px',
    textAlign: 'center',
    color: '#2c3e50',
  },
  table: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '15px',
    backgroundColor: '#f8f9fa',
    fontWeight: 'bold',
    textAlign: 'left',
    borderBottom: '2px solid #dee2e6',
    color: '#2c3e50',
  },
  td: {
    padding: '12px 15px',
    borderBottom: '1px solid #dee2e6',
  },
  scoreCell: {
    fontWeight: 'bold',
    fontSize: '18px',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '18px',
    color: '#95a5a6',
  },
  empty: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '16px',
    color: '#7f8c8d',
  },
};

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
    const colors = ['#3498db', '#2ecc71', '#f39c12', '#e74c3c', '#9b59b6', '#1abc9c'];
    return colors[index % colors.length];
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#27ae60';
    if (score >= 60) return '#f39c12';
    return '#e74c3c';
  };

  if (loading) {
    return <div style={styles.loading}>Loading comparison data...</div>;
  }

  const selectedStartups = selectedIds.map(id => startups.find(s => s.id === id)).filter(Boolean);
  const radarData = getRadarData();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Compare Startups</h1>

      <div style={styles.selectionGrid}>
        {startups.map(startup => (
          <div
            key={startup.id}
            style={{
              ...styles.checkboxCard,
              ...(selectedIds.includes(startup.id) ? styles.checkboxCardSelected : {})
            }}
            onClick={() => toggleStartup(startup.id)}
          >
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={selectedIds.includes(startup.id)}
                onChange={() => toggleStartup(startup.id)}
                style={styles.checkbox}
              />
              <div>
                <div style={styles.startupName}>{startup.name}</div>
                {scores[startup.id] && (
                  <div style={{ fontSize: '14px', color: '#7f8c8d' }}>
                    Score: {scores[startup.id].overall_score}
                  </div>
                )}
              </div>
            </label>
          </div>
        ))}
      </div>

      {selectedIds.length === 0 && (
        <div style={styles.empty}>
          Select 2 or more startups to compare
        </div>
      )}

      {selectedIds.length > 0 && (
        <>
          <div style={styles.chart}>
            <h3 style={styles.chartTitle}>Category Comparison</h3>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                {selectedStartups.map((startup, index) => (
                  <Radar
                    key={startup.id}
                    name={startup.name}
                    dataKey={startup.name}
                    stroke={getColor(index)}
                    fill={getColor(index)}
                    fillOpacity={0.3}
                  />
                ))}
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Category</th>
                {selectedStartups.map(startup => (
                  <th key={startup.id} style={styles.th}>{startup.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ ...styles.td, fontWeight: 'bold' }}>Overall Score</td>
                {selectedStartups.map(startup => {
                  const score = scores[startup.id];
                  return (
                    <td key={startup.id} style={{
                      ...styles.td,
                      ...styles.scoreCell,
                      color: getScoreColor(score?.overall_score || 0)
                    }}>
                      {score?.overall_score?.toFixed(1) || 'N/A'}
                    </td>
                  );
                })}
              </tr>
              {['Team', 'Product', 'Market', 'Traction', 'Financials', 'Innovation'].map(category => (
                <tr key={category}>
                  <td style={styles.td}>{category}</td>
                  {selectedStartups.map(startup => {
                    const score = scores[startup.id];
                    const categoryScore = score?.category_scores?.[category.toLowerCase()];
                    return (
                      <td key={startup.id} style={styles.td}>
                        {categoryScore?.toFixed(1) || 'N/A'}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr>
                <td style={styles.td}>Confidence</td>
                {selectedStartups.map(startup => {
                  const score = scores[startup.id];
                  return (
                    <td key={startup.id} style={styles.td}>
                      {score?.confidence_level || 'N/A'}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default Comparison;