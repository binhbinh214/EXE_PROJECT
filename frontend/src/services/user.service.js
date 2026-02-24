import api from './api';

const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  updateAvailability: (data) => api.put('/users/availability', data),
  getDoctors: (params) => api.get('/users/doctors', { params }),
  getHealers: (params) => api.get('/users/healers', { params }),
  getProviderById: (id) => api.get(`/users/provider/${id}`),
  getBalance: () => api.get('/users/balance'),
  
  // Admin
  getAllUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUserRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  toggleSuspendUser: (id) => api.put(`/users/${id}/suspend`),
  verifyProviderProfile: (id) => api.put(`/users/${id}/verify-profile`),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

export default userService;
