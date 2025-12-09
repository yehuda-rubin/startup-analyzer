import React, { useState } from 'react';
import { uploadDocuments } from '../services/api';

const styles = {
  container: {
    padding: '30px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '24px',
    marginBottom: '20px',
    color: '#2c3e50',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontWeight: '600',
    color: '#34495e',
  },
  input: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  fileInput: {
    padding: '10px',
    border: '2px dashed #3498db',
    borderRadius: '4px',
    backgroundColor: '#f8f9fa',
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
    transition: 'background-color 0.3s',
  },
  buttonDisabled: {
    backgroundColor: '#95a5a6',
    cursor: 'not-allowed',
  },
  fileList: {
    listStyle: 'none',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
  },
  fileItem: {
    padding: '5px 0',
    fontSize: '14px',
    color: '#555',
  },
  message: {
    padding: '12px',
    borderRadius: '4px',
    marginTop: '15px',
  },
  success: {
    backgroundColor: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb',
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb',
  },
};

function DocumentUpload({ onUploadSuccess }) {
  const [startupName, setStartupName] = useState('');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!startupName || files.length === 0) {
      setMessage({ type: 'error', text: 'Please provide startup name and select files' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const result = await uploadDocuments(startupName, files);
      setMessage({ 
        type: 'success', 
        text: `Successfully uploaded ${result.total_documents} documents for ${result.startup_name}` 
      });
      setStartupName('');
      setFiles([]);
      if (onUploadSuccess) onUploadSuccess(result);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.detail || 'Upload failed' 
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Upload Startup Documents</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Startup Name:</label>
          <input
            type="text"
            value={startupName}
            onChange={(e) => setStartupName(e.target.value)}
            placeholder="Enter startup name"
            style={styles.input}
            required
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Documents (PDF, DOCX, PPTX, XLSX):</label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            accept=".pdf,.docx,.pptx,.xlsx"
            style={styles.fileInput}
            required
          />
        </div>

        {files.length > 0 && (
          <div style={styles.inputGroup}>
            <label style={styles.label}>Selected Files:</label>
            <ul style={styles.fileList}>
              {files.map((file, index) => (
                <li key={index} style={styles.fileItem}>
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          type="submit"
          disabled={uploading}
          style={{
            ...styles.button,
            ...(uploading ? styles.buttonDisabled : {}),
          }}
        >
          {uploading ? 'Uploading...' : 'Upload Documents'}
        </button>
      </form>

      {message && (
        <div style={{
          ...styles.message,
          ...(message.type === 'success' ? styles.success : styles.error),
        }}>
          {message.text}
        </div>
      )}
    </div>
  );
}

export default DocumentUpload;