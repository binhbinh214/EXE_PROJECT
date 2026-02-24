import api from './api';

const chatbotService = {
  sendMessage: (message) => api.post('/chatbot/chat', { message }),
  getHistory: () => api.get('/chatbot/history'),
  clearHistory: () => api.delete('/chatbot/history'),
};

export default chatbotService;
