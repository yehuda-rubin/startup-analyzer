import React, { useState, useEffect } from 'react';
import { listStartups, generateReport, getStartupScores } from '../services/api';

const styles = {
  container: {
    padding: '20px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '30px',
  },
  selectionSection: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '25px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#2c3e50',
  },
  checkboxGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '10px',
    marginBottom: '20px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
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
  },
  buttonDisabled: {
    backgroundColor: '#95a5a6',
    cursor: 'not-allowed',
  },
  report: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '30px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '20px',
  },
  reportHeader: {
    borderBottom: '2px solid #3498db',
    paddingBottom: '15px',
    marginBottom: '20px',
  },
  reportTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '5px',
  },
  reportSubtitle: {
    fontSize: '14px',
    color: '#7f8c8d',
  },
  section: {
    marginBottom: '25px',
  },
  sectionHeading: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#34495e',
  },
  text: {
    lineHeight: '1.6',
    color: '#555',
    whiteSpace: 'pre-line',
  },
  recommendation: {
    padding: '15px',
    backgroundColor: '#e8f5e9',
    borderLeft: '4px solid #4caf50',
    borderRadius: '4px',
    marginTop: '15px',
  },
  recommendationText: {
    fontWeight: '600',
    color: '#2e7d32',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '18px',
    color: '#95a5a6',
  },
};

function Reports() {
  const [startups, setStartups] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [reports, setReports] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStartups();
  }, []);

  const loadStartups = async () => {
    try {
      const data = await listStartups();
      setStartups(data);
    } catch (error) {
      console.error('Failed to load startups:', error);
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

  const handleGenerate = async () => {
    if (selectedIds.length === 0) return;

    setGenerating(true);
    try {
      const result = await generateReport(selectedIds);
      setReports(result.reports);
    } catch (error) {
      console.error('Report generation failed:', error);
      alert('Report generation failed: ' + (error.response?.data?.detail || error.message));
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Investor Reports</h1>

      <div style={styles.selectionSection}>
        <h3 style={styles.sectionTitle}>Select Startups for Report</h3>
        <div style={styles.checkboxGrid}>
          {startups.map(startup => (
            <label key={startup.id} style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={selectedIds.includes(startup.id)}
                onChange={() => toggleStartup(startup.id)}
                style={styles.checkbox}
              />
              <span>{startup.name}</span>
            </label>
          ))}
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating || selectedIds.length === 0}
          style={{
            ...styles.button,
            ...(generating || selectedIds.length === 0 ? styles.buttonDisabled : {})
          }}
        >
          {generating ? 'Generating Reports...' : '📄 Generate Reports'}
        </button>
      </div>

      {reports.map(report => (
        <div key={report.startup_id} style={styles.report}>
          <div style={styles.reportHeader}>
            <h2 style={styles.reportTitle}>{report.startup_name}</h2>
            <div style={styles.reportSubtitle}>
              Investment Analysis Report • Generated {new Date().toLocaleDateString()}
            </div>
          </div>

          {report.executive_summary && (
            <div style={styles.section}>
              <h3 style={styles.sectionHeading}>Executive Summary</h3>
              <p style={styles.text}>{report.executive_summary}</p>
            </div>
          )}

          {report.score_breakdown && (
            <div style={styles.section}>
              <h3 style={styles.sectionHeading}>Score Breakdown</h3>
              <p style={styles.text}>{report.score_breakdown}</p>
            </div>
          )}

          {report.market_analysis && (
            <div style={styles.section}>
              <h3 style={styles.sectionHeading}>Market Analysis</h3>
              <p style={styles.text}>{report.market_analysis}</p>
            </div>
          )}

          {report.swot_analysis && (
            <div style={styles.section}>
              <h3 style={styles.sectionHeading}>SWOT Analysis</h3>
              <p style={styles.text}>{report.swot_analysis}</p>
            </div>
          )}

          {report.recommendation && (
            <div style={styles.recommendation}>
              <h3 style={styles.sectionHeading}>Recommendation</h3>
              <p style={styles.recommendationText}>{report.recommendation}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default Reports;