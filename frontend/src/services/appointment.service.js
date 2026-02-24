import api from "./api";

const appointmentService = {
  // Create new appointment
  createAppointment: (data) => api.post("/appointments", data),

  // Get appointments
  getMyAppointments: (params) =>
    api.get("/appointments/my-appointments", { params }),
  getProviderAppointments: (params) =>
    api.get("/appointments/provider-appointments", { params }),
  getAppointmentById: (id) => api.get(`/appointments/${id}`),
  getAllAppointments: (params) => api.get("/appointments", { params }), // Admin

  // Update appointment
  updateAppointmentStatus: (id, status) =>
    api.put(`/appointments/${id}/status`, { status }),
  updateConsultationNotes: (id, notes) =>
    api.put(`/appointments/${id}/notes`, notes),

  // Cancel appointment
  cancelAppointment: (id, cancellationReason) =>
    api.put(`/appointments/${id}/cancel`, { cancellationReason }),

  // Recommendations
  sendRecommendation: (id, data) =>
    api.post(`/appointments/${id}/recommendations`, data),

  // Rating
  rateAppointment: (id, score, review) =>
    api.post(`/appointments/${id}/rate`, { score, review }),
};

export default appointmentService;
