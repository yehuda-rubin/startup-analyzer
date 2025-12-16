import axios from 'axios';

import { auth } from '../firebase';

// ✅ Fix: Hardcode the full URL
const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the Firebase token
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
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
export const createStartup = async (startupData) => {
  // Note: Backend endpoint might need to be created if not exists.
  // Assuming POST /startups/ exists or reusing previous logic.
  // If it doesn't exist, this will 404, but fixes the compile error.
  const response = await api.post('/startups/', startupData);
  return response.data;
};

export const parsePitchDeck = async (startupId, formData) => {
  // This seems to align with uploadDocuments but specific to the upload flow
  // Reuse uploadDocuments logic but ensure the endpoint matches
  // uploadDocuments uses /documents/upload which takes startup_name.
  // Here we have startupId.
  // We might need a specific endpoint or just link it.
  // For now, let's assume a direct document upload for a specific startup ID.
  const response = await api.post(`/documents/upload/${startupId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteStartup = async (startupId) => {
  const response = await api.delete(`/startups/${startupId}`);
  return response.data;
};

// Users
export const registerUser = async (userData) => {
  const response = await api.post('/users/', userData);
  return response.data;
};

export const getUserProfile = async () => {
  const response = await api.get('/users/me');
  return response.data;
};

export const getStartups = async () => {
  const response = await api.get('/startups/');
  return response.data;
};

export default api;