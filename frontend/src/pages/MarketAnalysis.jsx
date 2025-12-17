import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { listStartups, analyzeMarket, getMarketAnalyses } from '../services/api';
import MarketChart from '../components/MarketChart';

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
    color: '#f8fafc',
  },
  select: {
    padding: '10px 15px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    minWidth: '250px',
  },
  button: {
    padding: '12px 24px',
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '20px',
  },
  buttonDisabled: {
    backgroundColor: '#95a5a6',
    cursor: 'not-allowed',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '25px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '20px',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#2c3e50',
  },
  section: {
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#34495e',
  },
  text: {
    lineHeight: '1.6',
    color: '#555',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '15px',
  },
  trendCard: {
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    borderLeft: '4px solid #3498db',
  },
  trendName: {
    fontWeight: '600',
    marginBottom: '5px',
    color: '#2c3e50',
  },
  trendDesc: {
    fontSize: '14px',
    color: '#555',
    marginBottom: '5px',
  },
  trendImpact: {
    fontSize: '13px',
    fontWeight: '600',
  },
  competitorCard: {
    padding: '15px',
    backgroundColor: '#fff3cd',
    borderRadius: '6px',
    borderLeft: '4px solid #f39c12',
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

function MarketAnalysis() {
  const { startupId: urlStartupId } = useParams();
  const [startups, setStartups] = useState([]);
  const [selectedStartupId, setSelectedStartupId] = useState(urlStartupId || '');
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    loadStartups();
  }, []);

  useEffect(() => {
    if (selectedStartupId) {
      loadMarketData();
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

  const loadMarketData = async () => {
    if (!selectedStartupId) return;

    setLoading(true);
    try {
      const analyses = await getMarketAnalyses(parseInt(selectedStartupId));
      if (analyses.length > 0) {
        setMarketData(analyses[0]);
      } else {
        setMarketData(null);
      }
    } catch (error) {
      console.error('Failed to load market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedStartupId) return;

    setAnalyzing(true);
    try {
      const result = await analyzeMarket(parseInt(selectedStartupId));
      setMarketData(result);
    } catch (error) {
      console.error('Market analysis failed:', error);
      alert('Market analysis failed: ' + (error.response?.data?.detail || error.message));
    } finally {
      setAnalyzing(false);
    }
  };

  const getImpactColor = (impact) => {
    if (impact === 'positive') return '#27ae60';
    if (impact === 'negative') return '#e74c3c';
    return '#95a5a6';
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Market Analysis (TAM/SAM/SOM)</h1>
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
        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          style={{
            ...styles.button,
            ...(analyzing ? styles.buttonDisabled : {})
          }}
        >
          {analyzing ? 'Analyzing Market...' : '📊 Run Market Analysis'}
        </button>
      )}

      {loading && <div style={styles.loading}>Loading...</div>}

      {!loading && marketData && (
        <>
          <MarketChart marketData={marketData} />

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Market Insights</h3>

            <div style={styles.section}>
              <div style={styles.sectionTitle}>Growth Rate</div>
              <p style={styles.text}>
                <strong>{marketData.growth_rate}%</strong> annual growth expected
              </p>
            </div>

            <div style={styles.section}>
              <div style={styles.sectionTitle}>Market Size Reasoning</div>
              <p style={styles.text}>{marketData.market_size_reasoning}</p>
            </div>

            {marketData.market_trends && marketData.market_trends.length > 0 && (
              <div style={styles.section}>
                <div style={styles.sectionTitle}>Market Trends</div>
                <div style={styles.grid}>
                  {marketData.market_trends.map((trend, index) => (
                    <div key={index} style={styles.trendCard}>
                      <div style={styles.trendName}>{trend.trend}</div>
                      <div style={styles.trendDesc}>{trend.description}</div>
                      <div style={{
                        ...styles.trendImpact,
                        color: getImpactColor(trend.impact)
                      }}>
                        Impact: {trend.impact}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {marketData.competitors && marketData.competitors.length > 0 && (
              <div style={styles.section}>
                <div style={styles.sectionTitle}>Key Competitors</div>
                <div style={styles.grid}>
                  {marketData.competitors.map((competitor, index) => (
                    <div key={index} style={styles.competitorCard}>
                      <div style={styles.trendName}>{competitor.name}</div>
                      <div style={styles.trendDesc}>{competitor.description}</div>
                      {competitor.strength && (
                        <div style={{ fontSize: '13px', marginTop: '5px', color: '#666' }}>
                          <strong>Their Strength:</strong> {competitor.strength}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {marketData.competitive_advantages && marketData.competitive_advantages.length > 0 && (
              <div style={styles.section}>
                <div style={styles.sectionTitle}>Competitive Advantages</div>
                <ul style={{ paddingLeft: '20px' }}>
                  {marketData.competitive_advantages.map((advantage, index) => (
                    <li key={index} style={{ marginBottom: '8px', color: '#555' }}>
                      {advantage}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div style={styles.section}>
              <div style={styles.sectionTitle}>Analysis Confidence</div>
              <p style={styles.text}>
                {(marketData.confidence_score * 100).toFixed(0)}% confidence in this analysis
              </p>
            </div>
          </div>
        </>
      )}

      {!loading && !marketData && selectedStartupId && (
        <div style={styles.empty}>
          <p>No market analysis available yet. Click "Run Market Analysis" to get started.</p>
        </div>
      )}
    </div>
  );
}

export default MarketAnalysis;