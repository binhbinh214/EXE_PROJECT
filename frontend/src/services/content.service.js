import api from './api';

const contentService = {
  getContents: (params) => api.get('/content', { params }),
  getFeaturedContents: () => api.get('/content/featured'),
  getContentById: (id) => api.get(`/content/${id}`),
  recordCompletion: (id) => api.post(`/content/${id}/complete`),
  likeContent: (id) => api.post(`/content/${id}/like`),
  rateContent: (id, score) => api.post(`/content/${id}/rate`, { score }),
  
  // Admin/Provider
  createContent: (data) => api.post('/content', data),
  updateContent: (id, data) => api.put(`/content/${id}`, data),
  updateContentStatus: (id, status) => api.put(`/content/${id}/status`, { status }),
  deleteContent: (id) => api.delete(`/content/${id}`),
  getAllContentAdmin: (params) => api.get('/content/admin/all', { params }),
};

export default contentService;
