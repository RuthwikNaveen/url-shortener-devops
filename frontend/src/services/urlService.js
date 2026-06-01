import api from '../api/axios';

export const urlService = {
  // Create a new short URL
  createShortUrl: async (originalUrl) => {
    try {
      const response = await api.post('/urls', {
        originalUrl,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get all user's URLs
  getUserUrls: async () => {
    try {
      const response = await api.get('/urls');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete a URL
  deleteUrl: async (id) => {
    try {
      const response = await api.delete(`/urls/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
