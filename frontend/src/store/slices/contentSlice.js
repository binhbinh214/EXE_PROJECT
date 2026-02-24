import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import contentService from '../../services/content.service';

const initialState = {
  contents: [],
  featuredContents: [],
  currentContent: null,
  isLoading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    pages: 1,
  },
};

export const getContents = createAsyncThunk(
  'content/getContents',
  async (params, { rejectWithValue }) => {
    try {
      const response = await contentService.getContents(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi');
    }
  }
);

export const getFeaturedContents = createAsyncThunk(
  'content/getFeatured',
  async (_, { rejectWithValue }) => {
    try {
      const response = await contentService.getFeaturedContents();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi');
    }
  }
);

export const getContentById = createAsyncThunk(
  'content/getById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await contentService.getContentById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không tìm thấy');
    }
  }
);

export const likeContent = createAsyncThunk(
  'content/like',
  async (id, { rejectWithValue }) => {
    try {
      const response = await contentService.likeContent(id);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi');
    }
  }
);

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    clearCurrentContent: (state) => {
      state.currentContent = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getContents.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getContents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.contents = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getContents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getFeaturedContents.fulfilled, (state, action) => {
        state.featuredContents = action.payload.data;
      })
      .addCase(getContentById.fulfilled, (state, action) => {
        state.currentContent = action.payload.data;
      })
      .addCase(likeContent.fulfilled, (state, action) => {
        const index = state.contents.findIndex((c) => c._id === action.payload.id);
        if (index !== -1) {
          state.contents[index].likes = action.payload.data.likes;
        }
      });
  },
});

export const { clearCurrentContent, clearError } = contentSlice.actions;
export default contentSlice.reducer;
