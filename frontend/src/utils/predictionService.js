// frontend/src/utils/predictionService.js
import { API_ENDPOINTS, getHeaders } from '../config/api.js';

export const predictionService = {
  async predict(input, modelType = 'default') {
    try {
      const response = await fetch(API_ENDPOINTS.PREDICTION.PREDICT, {
        method: 'POST',
        headers: getHeaders(true), // Include auth token if available
        body: JSON.stringify({
          input,
          modelType
        }),
      });

      if (!response.ok) {
        throw new Error(`Prediction failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Prediction failed');
      }

      return data.data;
    } catch (error) {
      console.error('Prediction service error:', error);
      throw error;
    }
  },

  // Example method for code prediction
  async predictCode(code, language = 'javascript') {
    return this.predict(code, `code-${language}`);
  },

  // Example method for problem recommendation
  async recommendProblem(userId, difficulty = 'easy') {
    return this.predict(`user:${userId},difficulty:${difficulty}`, 'recommendation');
  }
};

export default predictionService;