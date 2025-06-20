import axios from 'axios';

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const TIMEOUT = 30000; // 30 seconds timeout

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.response?.status === 404) {
      console.warn('API endpoint not found');
    } else if (error.response?.status >= 500) {
      console.error('Server error occurred');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Cannot connect to backend server. Make sure it\'s running on http://localhost:5000');
    }
    
    return Promise.reject(error);
  }
);

/**
 * Analyze product description for sustainability
 * @param {string} description - Product description
 * @param {string} productName - Product name (optional)
 * @param {string} source - Source of analysis ('manual', 'extension', 'web')
 * @returns {Promise} Analysis result
 */
export const analyzeProduct = async (description, productName = 'Manual Analysis', source = 'manual') => {
  try {
    if (!description || !description.trim()) {
      throw new Error('Product description is required');
    }

    const response = await apiClient.post('/predict', {
      data: [description],
      product_name: productName,
      source: source
    });

    return response.data;
  } catch (error) {
    console.error('Error analyzing product:', error);
    throw error;
  }
};

/**
 * Extension-specific analysis endpoint
 * @param {Object} productData - Product data from extension
 * @returns {Promise} Analysis result
 */
export const analyzeProductExtension = async (productData) => {
  try {
    const { title, description, url, imageUrl } = productData;

    if (!description || !description.trim()) {
      throw new Error('Product description is required');
    }

    const response = await apiClient.post('/extension/analyze', {
      title,
      description,
      url,
      imageUrl
    });

    return response.data;
  } catch (error) {
    console.error('Error analyzing product via extension:', error);
    throw error;
  }
};

/**
 * Fetch materials database
 * @returns {Promise} Materials data
 */
export const fetchMaterials = async () => {
  try {
    const response = await apiClient.get('/materials');
    return response.data;
  } catch (error) {
    console.error('Error fetching materials:', error);
    
    // Return fallback materials if API fails
    return {
      data: [
        { name: 'organic cotton', sustainability_score: 9, impact_description: 'Highly sustainable' },
        { name: 'polyester', sustainability_score: 3, impact_description: 'Low sustainability' },
        { name: 'recycled polyester', sustainability_score: 6, impact_description: 'Moderately sustainable' }
      ]
    };
  }
};

/**
 * Fetch sustainability reports with pagination and filters
 * @param {number} page - Page number (default: 1)
 * @param {number} perPage - Items per page (default: 10)
 * @param {Object} filters - Filter options
 * @returns {Promise} Reports data
 */
export const fetchReports = async (page = 1, perPage = 10, filters = {}) => {
  try {
    const params = {
      page,
      per_page: perPage,
      ...filters
    };

    const response = await apiClient.get('/analyses', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching reports:', error);
    
    // Return empty data structure if API fails
    return {
      data: [],
      pagination: {
        page: 1,
        per_page: perPage,
        total: 0,
        pages: 0
      }
    };
  }
};

/**
 * Check backend health status
 * @returns {Promise} Health check result
 */
export const checkBackendHealth = async () => {
  try {
    const response = await apiClient.get('/health-check');
    return response.data;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return {
      status: 'offline',
      database: 'unknown',
      extension_support: false,
      error: error.message
    };
  }
};

/**
 * Save analysis report (for extension use)
 * @param {Object} reportData - Report data to save
 * @returns {Promise} Save result
 */
export const saveAnalysisReport = async (reportData) => {
  try {
    const response = await apiClient.post('/extension/save-report', reportData);
    return response.data;
  } catch (error) {
    console.error('Error saving analysis report:', error);
    throw error;
  }
};

/**
 * Get sustainability statistics from backend
 * @returns {Promise} Statistics data
 */
export const getBackendStats = async () => {
  try {
    const response = await fetchReports(1, 100); // Get recent reports for stats
    
    const analyses = response.data || [];
    const totalAnalyzed = analyses.length;
    const ecoFriendly = analyses.filter(a => a.score >= 7).length;
    const averageScore = totalAnalyzed > 0 
      ? analyses.reduce((sum, a) => sum + a.score, 0) / totalAnalyzed 
      : 0;

    return {
      totalAnalyzed,
      ecoFriendly,
      averageScore: Math.round(averageScore * 10) / 10,
      carbonSaved: ecoFriendly * 2.5 // Estimate 2.5kg CO2 per eco-friendly choice
    };
  } catch (error) {
    console.error('Error getting backend stats:', error);
    return {
      totalAnalyzed: 0,
      ecoFriendly: 0,
      averageScore: 0,
      carbonSaved: 0
    };
  }
};

/**
 * Test API connection
 * @returns {Promise<boolean>} Connection status
 */
export const testConnection = async () => {
  try {
    const health = await checkBackendHealth();
    return health.status === 'operational';
  } catch (error) {
    return false;
  }
};

// Export API client for advanced usage
export { apiClient };

// Default export with all functions
export default {
  analyzeProduct,
  analyzeProductExtension,
  fetchMaterials,
  fetchReports,
  checkBackendHealth,
  saveAnalysisReport,
  getBackendStats,
  testConnection
};