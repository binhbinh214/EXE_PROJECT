import api from './api';

const journalService = {
  createJournal: (data) => api.post('/journals', data),
  getMyJournals: (params) => api.get('/journals', { params }),
  getJournalById: (id) => api.get(`/journals/${id}`),
  updateJournal: (id, data) => api.put(`/journals/${id}`, data),
  deleteJournal: (id) => api.delete(`/journals/${id}`),
  shareJournal: (id, providerId) => api.put(`/journals/${id}/share`, { providerId }),
  getEmotionStats: (params) => api.get('/journals/stats', { params }),
  
  // Doctor
  getPatientJournals: (patientId, params) => api.get(`/journals/patient/${patientId}`, { params }),
};

export default journalService;
