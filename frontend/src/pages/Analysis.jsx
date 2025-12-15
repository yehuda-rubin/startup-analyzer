import React, { useState, useEffect } from 'react';
import ScoreAnalysis from '../components/ScoreAnalysis';
import ReactMarkdown from 'react-markdown';
import { useParams } from 'react-router-dom';
import { 
  listStartups, 
  analyzeStartup, 
  getStartupAnalyses,
  calculateScore,
  getStartupScores 
} from '../services/api';
import ScoreGauge from '../components/ScoreGauge';

const styles = {
  container: {
    padding: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  select: {
    padding: '10px 15px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    minWidth: '250px',
  },
  actions: {
    marginBottom: '20px',
    display: 'flex',
    gap: '10px',
  },
  button: {
    padding: '12px 24px',
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
    backgroundColor: '#2ecc71',
    color: '#fff',
  },
  buttonDisabled: {
    backgroundColor: '#95a5a6',
    cursor: 'not-allowed',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '20px',
    marginBottom: '20px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '25px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#2c3e50',
  },
  section: {
    marginBottom: '25px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#34495e',
  },
  list: {
    listStyle: 'disc',
    paddingLeft: '20px',
  },
  listItem: {
    marginBottom: '8px',
    lineHeight: '1.5',
    color: '#555',
  },
  text: {
    lineHeight: '1.6',
    color: '#555',
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
    color: '#7f8c8d',
  },
};

function Analysis() {
  const { startupId: urlStartupId } = useParams();
  const [startups, setStartups] = useState([]);
  const [selectedStartupId, setSelectedStartupId] = useState(urlStartupId || '');
  const [analysis, setAnalysis] = useState(null);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [scoring, setScoring] = useState(false);

  useEffect(() => {
    loadStartups();
  }, []);

  useEffect(() => {
    if (selectedStartupId) {
      loadData();
    }
  }, [selectedStartupId]);

  const loadStartups = async () => {
    try {
      const data = await listStartups();
      setStartups(data);
      if (data.length > 0 && !selectedStartupId) {
        setSelectedStartupId(data[0].id.toString());
      }
    } catch (error) {
      console.error('Failed to load startups:', error);
    }
  };

  const loadData = async () => {
    if (!selectedStartupId) return;
    
    setLoading(true);
    try {
      // Load latest analysis
      const analyses = await getStartupAnalyses(parseInt(selectedStartupId));
      console.log('🔍 Analyses received:', analyses); // ← הוסף את זה!
      
      if (analyses.length > 0) {
        console.log('✅ First analysis:', analyses[0]); // ← הוסף את זה!
        console.log('✅ Has web_validation_summary?', !!analyses[0].web_validation_summary); // ← הוסף את זה!
        setAnalysis(analyses[0]);
      } else {
        setAnalysis(null);
      }

      // Load latest score
      const scores = await getStartupScores(parseInt(selectedStartupId));
      if (scores.length > 0) {
        setScore(scores[0]);
      } else {
        setScore(null);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedStartupId) return;

    setAnalyzing(true);
    try {
      const result = await analyzeStartup(parseInt(selectedStartupId));
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Analysis failed: ' + (error.response?.data?.detail || error.message));
    } finally {
      setAnalyzing(false);
    }
  };

  const handleScore = async () => {
    if (!selectedStartupId) return;

    setScoring(true);
    try {
      const result = await calculateScore(parseInt(selectedStartupId));
      setScore(result);
    } catch (error) {
      console.error('Scoring failed:', error);
      alert('Scoring failed: ' + (error.response?.data?.detail || error.message));
    } finally {
      setScoring(false);
    }
  };

  const selectedStartup = startups.find(s => s.id === parseInt(selectedStartupId));

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Startup Analysis</h1>
        <select
          value={selectedStartupId}
          onChange={(e) => setSelectedStartupId(e.target.value)}
          style={styles.select}
        >
          <option value="">Select a startup...</option>
          {startups.map(startup => (
            <option key={startup.id} value={startup.id}>
              {startup.name}
            </option>
          ))}
        </select>
      </div>

      {selectedStartupId && (
        <div style={styles.actions}>
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            style={{
              ...styles.button,
              ...styles.buttonPrimary,
              ...(analyzing ? styles.buttonDisabled : {})
            }}
          >
            {analyzing ? 'Analyzing...' : '🔍 Run Analysis'}
          </button>
          <button
            onClick={handleScore}
            disabled={scoring}
            style={{
              ...styles.button,
              ...styles.buttonSecondary,
              ...(scoring ? styles.buttonDisabled : {})
            }}
          >
            {scoring ? 'Scoring...' : '📊 Calculate Score'}
          </button>
        </div>
      )}

      {loading && <div style={styles.loading}>Loading...</div>}

      {!loading && selectedStartupId && (
        <>
          {score && (
            <div style={styles.grid}>
              <div style={styles.card}>
                <ScoreGauge
                  overall_score={score.overall_score}
                  category_scores={score.category_scores}
                  showBreakdown={true}
                />
              </div>

              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Score Analysis</h3>
                <div style={styles.section}>
                  <div style={styles.sectionTitle}>Confidence: {score.confidence_level}</div>
                  <ScoreAnalysis reasoning={score.reasoning} />
                </div>
              </div>
            </div>
          )}

          {analysis && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Comprehensive Analysis</h3>

              <div style={styles.section}>
                <div style={styles.sectionTitle}>Executive Summary</div>
                <p style={styles.text}>{analysis.summary}</p>
              </div>

              {/* 🆕 הוספנו Web Validation Display */}
              {analysis.web_validation_summary && (
                <div style={styles.section}>
                  <div style={{
                    ...styles.sectionTitle,
                    color: '#3498db',
                    fontSize: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    borderTop: '2px solid #ecf0f1',
                    paddingTop: '20px',
                    marginTop: '20px'
                  }}>
                    <span>🌐</span> Web Validation Results
                  </div>
                  <div style={{
                    ...styles.text,
                    backgroundColor: '#f8f9fa',
                    padding: '15px',
                    borderRadius: '6px',
                    border: '1px solid #e0e0e0',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.6',
                    maxHeight: '400px',
                    overflowY: 'auto'
                  }}>
                    {analysis.web_validation_summary}
                  </div>
                </div>
              )}

              {analysis.key_insights && analysis.key_insights.length > 0 && (
                <div style={styles.section}>
                  <div style={styles.sectionTitle}>Key Insights</div>
                  <ul style={styles.list}>
                    {analysis.key_insights.map((insight, i) => (
                      <li key={i} style={styles.listItem}>{insight}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div style={styles.grid}>
                {analysis.strengths && analysis.strengths.length > 0 && (
                  <div style={styles.section}>
                    <div style={styles.sectionTitle}>✅ Strengths</div>
                    <ul style={styles.list}>
                      {analysis.strengths.map((item, i) => (
                        <li key={i} style={styles.listItem}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.weaknesses && analysis.weaknesses.length > 0 && (
                  <div style={styles.section}>
                    <div style={styles.sectionTitle}>⚠️ Weaknesses</div>
                    <ul style={styles.list}>
                      {analysis.weaknesses.map((item, i) => (
                        <li key={i} style={styles.listItem}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div style={styles.grid}>
                {analysis.opportunities && analysis.opportunities.length > 0 && (
                  <div style={styles.section}>
                    <div style={styles.sectionTitle}>🚀 Opportunities</div>
                    <ul style={styles.list}>
                      {analysis.opportunities.map((item, i) => (
                        <li key={i} style={styles.listItem}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.threats && analysis.threats.length > 0 && (
                  <div style={styles.section}>
                    <div style={styles.sectionTitle}>🔴 Threats</div>
                    <ul style={styles.list}>
                      {analysis.threats.map((item, i) => (
                        <li key={i} style={styles.listItem}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {!analysis && !score && !loading && (
            <div style={styles.empty}>
              <p>No analysis available yet. Click "Run Analysis" or "Calculate Score" to get started.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Analysis;