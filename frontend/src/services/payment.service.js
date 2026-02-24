import api from './api';

const paymentService = {
  deposit: (data) => api.post('/payments/deposit', data),
  payForAppointment: (appointmentId) => api.post('/payments/pay-appointment', { appointmentId }),
  getMyPayments: (params) => api.get('/payments/my-payments', { params }),
  getPaymentById: (id) => api.get(`/payments/${id}`),
  getBalance: () => api.get('/payments/balance'),
  
  // Admin
  getAllPayments: (params) => api.get('/payments', { params }),
  processRefund: (id, reason) => api.post(`/payments/${id}/refund`, { reason }),
};

export default paymentService;
