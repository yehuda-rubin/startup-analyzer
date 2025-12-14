import axios from 'axios';

// ✅ Fix: Hardcode the full URL
const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Documents
export const uploadDocuments = async (startupName, files) => {
  const formData = new FormData();
  formData.append('startup_name', startupName);
  files.forEach(file => {
    formData.append('files', file);
  });

  const response = await api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getStartupDocuments = async (startupId) => {
  const response = await api.get(`/documents/startup/${startupId}`);
  return response.data;
};

export const deleteDocument = async (documentId) => {
  const response = await api.delete(`/documents/${documentId}`);
  return response.data;
};

// Analysis
export const analyzeStartup = async (startupId, analysisType = 'comprehensive') => {
  const response = await api.post('/analysis/analyze', {
    startup_id: startupId,
    analysis_type: analysisType,
  });
  return response.data;
};

export const getStartupAnalyses = async (startupId) => {
  const response = await api.get(`/analysis/startup/${startupId}`);
  return response.data;
};

export const getAnalysis = async (analysisId) => {
  const response = await api.get(`/analysis/${analysisId}`);
  return response.data;
};

// Scoring
export const calculateScore = async (startupId) => {
  const response = await api.post('/scoring/calculate', {
    startup_id: startupId,
  });
  return response.data;
};

export const getStartupScores = async (startupId) => {
  const response = await api.get(`/scoring/startup/${startupId}`);
  return response.data;
};

export const getScore = async (scoreId) => {
  const response = await api.get(`/scoring/${scoreId}`);
  return response.data;
};

// Market Analysis
export const analyzeMarket = async (startupId) => {
  const response = await api.post('/market/analyze', {
    startup_id: startupId,
  });
  return response.data;
};

export const getMarketAnalyses = async (startupId) => {
  const response = await api.get(`/market/startup/${startupId}`);
  return response.data;
};

// Reports
export const generateReport = async (startupIds, reportType = 'investor_report') => {
  const response = await api.post('/reports/generate', {
    startup_ids: startupIds,
    report_type: reportType,
  });
  return response.data;
};

export const listStartups = async () => {
  const response = await api.get('/reports/startups');
  return response.data;
};

// Startups
export const deleteStartup = async (startupId) => {
  const response = await api.delete(`/startups/${startupId}`);
  return response.data;
};

export default api;