import React from 'react';
import { useNavigate } from 'react-router-dom';
import DocumentUpload from '../components/DocumentUpload';

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
  },
  header: {
    marginBottom: '30px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#7f8c8d',
    lineHeight: '1.6',
  },
  info: {
    marginTop: '30px',
    padding: '20px',
    backgroundColor: '#e8f5e9',
    borderRadius: '8px',
    borderLeft: '4px solid #4caf50',
  },
  infoTitle: {
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#2e7d32',
  },
  infoList: {
    listStyle: 'disc',
    paddingLeft: '20px',
    color: '#555',
  },
  infoItem: {
    marginBottom: '8px',
    lineHeight: '1.5',
  },
};

function Upload() {
  const navigate = useNavigate();

  const handleUploadSuccess = (result) => {
    // Navigate to analysis page after 2 seconds
    setTimeout(() => {
      navigate(`/analysis/${result.startup_id}`);
    }, 2000);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Upload Startup Documents</h1>
        <p style={styles.subtitle}>
          Upload pitch decks, financial reports, business plans, and other documents
          to begin AI-powered analysis. Our system will extract insights, generate scores,
          and provide comprehensive market analysis.
        </p>
      </div>

      <DocumentUpload onUploadSuccess={handleUploadSuccess} />

      <div style={styles.info}>
        <div style={styles.infoTitle}>📋 What happens after upload?</div>
        <ul style={styles.infoList}>
          <li style={styles.infoItem}>
            <strong>Document Processing:</strong> We extract text from PDFs, Word docs, presentations, and spreadsheets
          </li>
          <li style={styles.infoItem}>
            <strong>RAG Indexing:</strong> Content is chunked and indexed in our vector database for semantic search
          </li>
          <li style={styles.infoItem}>
            <strong>AI Analysis:</strong> Generate comprehensive analysis covering team, product, market, and more
          </li>
          <li style={styles.infoItem}>
            <strong>Scoring:</strong> Calculate scores across 6 dimensions (team, product, market, traction, financials, innovation)
          </li>
          <li style={styles.infoItem}>
            <strong>Market Analysis:</strong> Estimate TAM/SAM/SOM and identify competitive landscape
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Upload;