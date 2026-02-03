/**
 * Chat API Service
 * Handles all chat-related API calls
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

/**
 * Ask a question about an analysis
 * @param {number} analysisId - The analysis ID
 * @param {string} userId - Firebase user ID
 * @param {string} question - The question text
 * @returns {Promise} Response with answer
 */
export const askQuestion = async (analysisId, userId, question) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/chat/analyses/${analysisId}/chat`,
      {
        question,
        user_id: userId
      }
    );
    return response.data;
  } catch (error) {
    // Handle quota exceeded errors specially
    if (error.response?.status === 429) {
      const quotaError = new Error('Quota exceeded');
      quotaError.type = 'quota_exceeded';
      Object.assign(quotaError, error.response.data.detail);
      throw quotaError;
    }
    throw error;
  }
};

/**
 * Get chat history for an analysis
 * @param {number} analysisId - The analysis ID
 * @returns {Promise} Array of chat messages
 */
export const getChatHistory = async (analysisId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/chat/analyses/${analysisId}/chat`
    );
    return response.data;
  } catch (error) {
    console.error('Failed to get chat history:', error);
    throw error;
  }
};

/**
 * Get remaining questions for an analysis
 * @param {number} analysisId - The analysis ID
 * @param {string} userId - Firebase user ID
 * @returns {Promise} Object with remaining questions info
 */
export const getRemainingQuestions = async (analysisId, userId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/chat/analyses/${analysisId}/remaining-questions`,
      {
        params: { user_id: userId }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to get remaining questions:', error);
    throw error;
  }
};

/**
 * Get user usage limits
 * @param {string} userId - Firebase user ID
 * @returns {Promise} Object with usage limits
 */
export const getUsageLimits = async (userId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/chat/usage/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error('Failed to get usage limits:', error);
    throw error;
  }
};