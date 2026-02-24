import api from "./api";

const messageService = {
  // Send message via HTTP (backup)
  sendMessage: (data) => api.post("/messages", data),

  // Get conversations
  getConversations: () => api.get("/messages/conversations"),

  // Get conversation with specific user
  getConversation: (userId, params) =>
    api.get(`/messages/conversation/${userId}`, { params }),

  // Mark messages as read
  markAsRead: (userId) => api.put(`/messages/read/${userId}`),

  // Delete message
  deleteMessage: (id) => api.delete(`/messages/${id}`),

  // Get unread count
  getUnreadCount: () => api.get("/messages/unread-count"),
};

export default messageService;
