import React, { useState, useEffect } from 'react';
import { listStartups, generateReport } from '../services/api';
import ScoreAnalysis from '../components/ScoreAnalysis';

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '12px',
    padding: '40px',
    marginBottom: '30px',
    color: 'white',
    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
  },
  title: {
    fontSize: '36px',
    fontWeight: '800',
    margin: '0 0 10px 0',
  },
  subtitle: {
    fontSize: '16px',
    opacity: '0.9',
    margin: '0',
  },
  selectionSection: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    marginBottom: '30px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '20px',
    color: '#2c3e50',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  checkboxGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '12px',
    marginBottom: '25px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    border: '2px solid transparent',
  },
  checkboxLabelSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#3498db',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
    accentColor: '#3498db',
  },
  startupName: {
    fontWeight: '600',
    color: '#2c3e50',
  },
  buttonContainer: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  button: {
    padding: '14px 32px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
  },
  buttonDisabled: {
    background: '#95a5a6',
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  selectedCount: {
    fontSize: '14px',
    color: '#7f8c8d',
    fontWeight: '600',
  },
  report: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '40px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    marginBottom: '30px',
    pageBreakAfter: 'always',
  },
  reportHeader: {
    borderBottom: '3px solid #667eea',
    paddingBottom: '20px',
    marginBottom: '30px',
    background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
    padding: '25px',
    borderRadius: '8px',
    marginLeft: '-40px',
    marginRight: '-40px',
    marginTop: '-40px',
  },
  reportTitle: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#2c3e50',
    marginBottom: '8px',
  },
  reportSubtitle: {
    fontSize: '14px',
    color: '#7f8c8d',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  scoreCard: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '30px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  },
  scoreItem: {
    textAlign: 'center',
  },
  scoreLabel: {
    fontSize: '12px',
    textTransform: 'uppercase',
    color: '#7f8c8d',
    fontWeight: '600',
    marginBottom: '5px',
  },
  scoreValue: {
    fontSize: '28px',
    fontWeight: '800',
  },
  section: {
    marginBottom: '30px',
  },
  sectionHeading: {
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '15px',
    color: '#2c3e50',
    paddingBottom: '10px',
    borderBottom: '2px solid #ecf0f1',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  recommendation: {
    padding: '20px',
    background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
    border: '2px solid #4caf50',
    borderRadius: '8px',
    marginTop: '20px',
  },
  recommendationBad: {
    background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
    border: '2px solid #f44336',
  },
  recommendationText: {
    fontWeight: '600',
    fontSize: '16px',
  },
  recommendationTextGood: {
    color: '#2e7d32',
  },
  recommendationTextBad: {
    color: '#c62828',
  },
  printButton: {
    padding: '10px 20px',
    backgroundColor: '#34495e',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  loading: {
    textAlign: 'center',
    padding: '60px',
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

  const handlePrint = () => {
    window.print();
  };

  const getScoreColor = (score) => {
    if (!score) return '#95a5a6';
    if (score >= 80) return '#27ae60';
    if (score >= 60) return '#f39c12';
    return '#e74c3c';
  };

  if (loading) {
    return <div style={styles.loading}>⏳ Loading startups...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header} className="no-print">
        <h1 style={styles.title}>📊 Investor Reports</h1>
        <p style={styles.subtitle}>
          Generate comprehensive investment analysis reports for your portfolio startups
        </p>
      </div>

      <div style={styles.selectionSection} className="no-print">
        <h3 style={styles.sectionTitle}>
          <span>✓</span> Select Startups for Report
        </h3>
        <div style={styles.checkboxGrid}>
          {startups.map(startup => (
            <label
              key={startup.id}
              style={{
                ...styles.checkboxLabel,
                ...(selectedIds.includes(startup.id) ? styles.checkboxLabelSelected : {})
              }}
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(startup.id)}
                onChange={() => toggleStartup(startup.id)}
                style={styles.checkbox}
              />
              <span style={styles.startupName}>{startup.name}</span>
            </label>
          ))}
        </div>
        
        <div style={styles.buttonContainer}>
          <button
            onClick={handleGenerate}
            disabled={generating || selectedIds.length === 0}
            style={{
              ...styles.button,
              ...(generating || selectedIds.length === 0 ? styles.buttonDisabled : {})
            }}
          >
            {generating ? '⏳ Generating Reports...' : '📄 Generate Reports'}
          </button>
          
          {selectedIds.length > 0 && (
            <span style={styles.selectedCount}>
              {selectedIds.length} startup{selectedIds.length !== 1 ? 's' : ''} selected
            </span>
          )}
        </div>
      </div>

      {reports.length > 0 && (
        <div className="no-print" style={{ marginBottom: '20px', textAlign: 'right' }}>
          <button onClick={handlePrint} style={styles.printButton}>
            <span>🖨️</span> Print / Save as PDF
          </button>
        </div>
      )}

      {reports.map((report, index) => (
        <div key={report.startup_id || index} style={styles.report}>
          <div style={styles.reportHeader}>
            <h2 style={styles.reportTitle}>{report.startup_name}</h2>
            <div style={styles.reportSubtitle}>
              <span>📋</span> Investment Analysis Report
              <span>•</span>
              <span>📅 {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
          </div>

          {report.score_breakdown && (
            <div style={styles.scoreCard}>
              {report.overall_score && (
                <div style={styles.scoreItem}>
                  <div style={styles.scoreLabel}>Overall Score</div>
                  <div style={{
                    ...styles.scoreValue,
                    color: getScoreColor(report.overall_score)
                  }}>
                    {report.overall_score.toFixed(1)}
                  </div>
                </div>
              )}
              {report.confidence_level && (
                <div style={styles.scoreItem}>
                  <div style={styles.scoreLabel}>Confidence</div>
                  <div style={styles.scoreValue}>{report.confidence_level}</div>
                </div>
              )}
            </div>
          )}

          {report.executive_summary && (
            <div style={styles.section}>
              <h3 style={styles.sectionHeading}>
                <span>🎯</span> Executive Summary
              </h3>
              <ScoreAnalysis reasoning={report.executive_summary} />
            </div>
          )}

          {report.score_breakdown && (
            <div style={styles.section}>
              <h3 style={styles.sectionHeading}>
                <span>📊</span> Score Breakdown
              </h3>
              <ScoreAnalysis reasoning={report.score_breakdown} />
            </div>
          )}

          {report.market_analysis && (
            <div style={styles.section}>
              <h3 style={styles.sectionHeading}>
                <span>📈</span> Market Analysis
              </h3>
              <ScoreAnalysis reasoning={report.market_analysis} />
            </div>
          )}

          {report.swot_analysis && (
            <div style={styles.section}>
              <h3 style={styles.sectionHeading}>
                <span>⚖️</span> SWOT Analysis
              </h3>
              <ScoreAnalysis reasoning={report.swot_analysis} />
            </div>
          )}

          {report.recommendation && (
            <div style={{
              ...styles.recommendation,
              ...(report.recommendation.toLowerCase().includes('not recommend') || 
                  report.recommendation.toLowerCase().includes('pass') ? 
                  styles.recommendationBad : {})
            }}>
              <h3 style={styles.sectionHeading}>
                <span>💡</span> Investment Recommendation
              </h3>
              <p style={{
                ...styles.recommendationText,
                ...(report.recommendation.toLowerCase().includes('not recommend') || 
                    report.recommendation.toLowerCase().includes('pass') ? 
                    styles.recommendationTextBad : styles.recommendationTextGood)
              }}>
                {report.recommendation}
              </p>
            </div>
          )}
        </div>
      ))}

      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}

export default Reports;