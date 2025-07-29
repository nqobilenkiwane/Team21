import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

// Set up axios defaults
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Health API endpoints
export const healthAPI = {
  // Get user's health metrics
  getHealthMetrics: async () => {
    try {
      const response = await api.get('/health/metrics');
      return response.data;
    } catch (error) {
      console.error('Error fetching health metrics:', error);
      throw error;
    }
  },

  // Update health metrics
  updateHealthMetrics: async (metrics) => {
    try {
      const response = await api.put('/health/metrics', metrics);
      return response.data;
    } catch (error) {
      console.error('Error updating health metrics:', error);
      throw error;
    }
  },

  // Get user's symptoms
  getSymptoms: async () => {
    try {
      const response = await api.get('/health/symptoms');
      return response.data;
    } catch (error) {
      console.error('Error fetching symptoms:', error);
      throw error;
    }
  },

  // Add new symptom
  addSymptom: async (symptomData) => {
    try {
      const response = await api.post('/health/symptoms', symptomData);
      return response.data;
    } catch (error) {
      console.error('Error adding symptom:', error);
      throw error;
    }
  },

  // Get appointments
  getAppointments: async () => {
    try {
      const response = await api.get('/health/appointments');
      return response.data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  },

  // Create new appointment
  createAppointment: async (appointmentData) => {
    try {
      const response = await api.post('/health/appointments', appointmentData);
      return response.data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  },

  // Get AI recommendations
  getAIRecommendations: async () => {
    try {
      const response = await api.get('/health/ai-recommendations');
      return response.data;
    } catch (error) {
      console.error('Error fetching AI recommendations:', error);
      throw error;
    }
  },

  // Get AI diagnosis
  getAIDiagnosis: async (symptoms) => {
    try {
      const response = await api.post('/health/ai-diagnosis', { symptoms });
      return response.data;
    } catch (error) {
      console.error('Error getting AI diagnosis:', error);
      throw error;
    }
  },

  // Get health score
  getHealthScore: async () => {
    try {
      const response = await api.get('/health/score');
      return response.data;
    } catch (error) {
      console.error('Error fetching health score:', error);
      throw error;
    }
  },

  // Generate health report
  generateHealthReport: async () => {
    try {
      const response = await api.get('/health/report');
      return response.data;
    } catch (error) {
      console.error('Error generating health report:', error);
      throw error;
    }
  },

  // Find nearby clinics
  findNearbyClinics: async (location) => {
    try {
      const response = await api.post('/health/nearby-clinics', { location });
      return response.data;
    } catch (error) {
      console.error('Error finding nearby clinics:', error);
      throw error;
    }
  },
};

// User API endpoints
export const userAPI = {
  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/user/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/user/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },
};

// Authentication API endpoints
export const authAPI = {
  // User registration
  register: async (userData) => {
    try {
      const response = await api.post('/register', userData);
      return response.data;
    } catch (error) {
      console.error('Error during registration:', error);
      throw error;
    }
  },

  // User login
  login: async (credentials) => {
    try {
      const response = await api.post('/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  },
};

export default api;
