import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import journalService from '../../services/journal.service';

const initialState = {
  journals: [],
  currentJournal: null,
  stats: null,
  isLoading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    pages: 1,
  },
};

export const createJournal = createAsyncThunk(
  'journal/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await journalService.createJournal(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi');
    }
  }
);

export const getMyJournals = createAsyncThunk(
  'journal/getMyJournals',
  async (params, { rejectWithValue }) => {
    try {
      const response = await journalService.getMyJournals(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi');
    }
  }
);

export const getJournalById = createAsyncThunk(
  'journal/getById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await journalService.getJournalById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không tìm thấy');
    }
  }
);

export const updateJournal = createAsyncThunk(
  'journal/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await journalService.updateJournal(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Cập nhật thất bại');
    }
  }
);

export const deleteJournal = createAsyncThunk(
  'journal/delete',
  async (id, { rejectWithValue }) => {
    try {
      await journalService.deleteJournal(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Xóa thất bại');
    }
  }
);

export const getEmotionStats = createAsyncThunk(
  'journal/getStats',
  async (params, { rejectWithValue }) => {
    try {
      const response = await journalService.getEmotionStats(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi');
    }
  }
);

const journalSlice = createSlice({
  name: 'journal',
  initialState,
  reducers: {
    clearCurrentJournal: (state) => {
      state.currentJournal = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createJournal.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createJournal.fulfilled, (state, action) => {
        state.isLoading = false;
        state.journals.unshift(action.payload.data);
      })
      .addCase(createJournal.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getMyJournals.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMyJournals.fulfilled, (state, action) => {
        state.isLoading = false;
        state.journals = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getMyJournals.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getJournalById.fulfilled, (state, action) => {
        state.currentJournal = action.payload.data;
      })
      .addCase(updateJournal.fulfilled, (state, action) => {
        const index = state.journals.findIndex(
          (j) => j._id === action.payload.data._id
        );
        if (index !== -1) {
          state.journals[index] = action.payload.data;
        }
      })
      .addCase(deleteJournal.fulfilled, (state, action) => {
        state.journals = state.journals.filter((j) => j._id !== action.payload);
      })
      .addCase(getEmotionStats.fulfilled, (state, action) => {
        state.stats = action.payload.data;
      });
  },
});

export const { clearCurrentJournal, clearError } = journalSlice.actions;
export default journalSlice.reducer;
