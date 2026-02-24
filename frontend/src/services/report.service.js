import api from './api';

const reportService = {
  createReport: (data) => api.post('/reports', data),
  getMyReports: (params) => api.get('/reports/my-reports', { params }),
  getReportById: (id) => api.get(`/reports/${id}`),
  
  // Admin
  getAllReports: (params) => api.get('/reports', { params }),
  updateReportStatus: (id, data) => api.put(`/reports/${id}/status`, data),
  assignReport: (id, adminId) => api.put(`/reports/${id}/assign`, { adminId }),
  addCommunication: (id, message) => api.post(`/reports/${id}/communicate`, { message }),
};

export default reportService;
