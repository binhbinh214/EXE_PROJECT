import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import chatbotService from "../../services/chatbot.service";

const initialState = {
  messages: [],
  conversations: [],
  currentConversation: null,
  isLoading: false,
  error: null,
};

export const sendMessageToChatbot = createAsyncThunk(
  "chat/sendToChatbot",
  async (message, { rejectWithValue }) => {
    try {
      const response = await chatbotService.sendMessage(message);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Không thể gửi tin nhắn. Vui lòng thử lại."
      );
    }
  }
);

export const getChatbotHistory = createAsyncThunk(
  "chat/getChatbotHistory",
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatbotService.getHistory();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi tải lịch sử"
      );
    }
  }
);

export const clearChatbotHistory = createAsyncThunk(
  "chat/clearChatbotHistory",
  async (_, { rejectWithValue }) => {
    try {
      await chatbotService.clearHistory();
      return true;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi xóa lịch sử"
      );
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addUserMessage: (state, action) => {
      state.messages.push({
        role: "user",
        content: action.payload,
        timestamp: new Date().toISOString(),
      });
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    setConversations: (state, action) => {
      state.conversations = action.payload;
    },
    setCurrentConversation: (state, action) => {
      state.currentConversation = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Send message
      .addCase(sendMessageToChatbot.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendMessageToChatbot.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        // Check if response has the expected structure
        if (action.payload?.data?.response) {
          state.messages.push({
            role: "assistant",
            content: action.payload.data.response,
            timestamp:
              action.payload.data.timestamp || new Date().toISOString(),
          });
        } else if (action.payload?.response) {
          // Alternative response structure
          state.messages.push({
            role: "assistant",
            content: action.payload.response,
            timestamp: action.payload.timestamp || new Date().toISOString(),
          });
        }
      })
      .addCase(sendMessageToChatbot.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        // Add error message to chat so user sees feedback
        state.messages.push({
          role: "assistant",
          content: "❌ Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.",
          timestamp: new Date().toISOString(),
          isError: true,
        });
      })
      // Get history
      .addCase(getChatbotHistory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getChatbotHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload?.data || action.payload || [];
      })
      .addCase(getChatbotHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Clear history
      .addCase(clearChatbotHistory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(clearChatbotHistory.fulfilled, (state) => {
        state.isLoading = false;
        state.messages = [];
      })
      .addCase(clearChatbotHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  addUserMessage,
  clearMessages,
  setConversations,
  setCurrentConversation,
  clearError,
} = chatSlice.actions;

export default chatSlice.reducer;
