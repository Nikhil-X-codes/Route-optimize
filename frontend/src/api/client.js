import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Check health status of the FastAPI backend.
 * @returns {Promise<object>} Health status object
 */
export const checkHealth = async () => {
  try {
    const response = await client.get('/api/health');
    return response.data;
  } catch (error) {
    console.error('API health check failed:', error);
    throw error;
  }
};

/**
 * Optimize stops route sequence.
 * @param {Array} stops Stops array with id, lat, lon, label
 * @param {boolean} returnToDepot Flag indicating if route must return to depot
 * @returns {Promise<object>} Optimized route response data
 */
export const optimizeRoute = async (stops, returnToDepot = false) => {
  try {
    const response = await client.post('/api/optimize', {
      stops,
      return_to_depot: returnToDepot,
    });
    return response.data;
  } catch (error) {
    console.error('API optimization failed:', error);
    throw error;
  }
};
