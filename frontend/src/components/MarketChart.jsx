import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#2c3e50',
  },
  description: {
    marginTop: '15px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
  },
  descTitle: {
    fontWeight: '600',
    marginBottom: '8px',
    color: '#34495e',
  },
  descText: {
    fontSize: '14px',
    color: '#555',
    lineHeight: '1.6',
  },
};

function MarketChart({ marketData }) {
  const formatCurrency = (value) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    return `$${value}`;
  };

  const data = [
    {
      name: 'TAM',
      value: marketData.tam || 0,
      fill: '#3498db',
    },
    {
      name: 'SAM',
      value: marketData.sam || 0,
      fill: '#2ecc71',
    },
    {
      name: 'SOM',
      value: marketData.som || 0,
      fill: '#f39c12',
    },
  ];

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Market Size Analysis (TAM/SAM/SOM)</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={formatCurrency} />
          <Tooltip formatter={formatCurrency} />
          <Legend />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>

      <div style={styles.description}>
        <div style={{ marginBottom: '15px' }}>
          <div style={styles.descTitle}>TAM (Total Addressable Market)</div>
          <div style={styles.descText}>{marketData.tam_description || 'Not available'}</div>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <div style={styles.descTitle}>SAM (Serviceable Addressable Market)</div>
          <div style={styles.descText}>{marketData.sam_description || 'Not available'}</div>
        </div>
        <div>
          <div style={styles.descTitle}>SOM (Serviceable Obtainable Market)</div>
          <div style={styles.descText}>{marketData.som_description || 'Not available'}</div>
        </div>
      </div>
    </div>
  );
}

export default MarketChart;