import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../../services/user.service';

const initialState = {
  profile: null,
  doctors: [],
  healers: [],
  selectedProvider: null,
  balance: 0,
  isLoading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    pages: 1,
  },
};

// Async thunks
export const getDoctors = createAsyncThunk(
  'user/getDoctors',
  async (params, { rejectWithValue }) => {
    try {
      const response = await userService.getDoctors(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy danh sách bác sĩ');
    }
  }
);

export const getHealers = createAsyncThunk(
  'user/getHealers',
  async (params, { rejectWithValue }) => {
    try {
      const response = await userService.getHealers(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy danh sách chuyên gia');
    }
  }
);

export const getProviderById = createAsyncThunk(
  'user/getProviderById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await userService.getProviderById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không tìm thấy');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (data, { rejectWithValue }) => {
    try {
      const response = await userService.updateProfile(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Cập nhật thất bại');
    }
  }
);

export const getBalance = createAsyncThunk(
  'user/getBalance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getBalance();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearSelectedProvider: (state) => {
      state.selectedProvider = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Doctors
      .addCase(getDoctors.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getDoctors.fulfilled, (state, action) => {
        state.isLoading = false;
        state.doctors = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getDoctors.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get Healers
      .addCase(getHealers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getHealers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.healers = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getHealers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get Provider By ID
      .addCase(getProviderById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProviderById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedProvider = action.payload.data;
      })
      .addCase(getProviderById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.profile = action.payload.data;
      })
      // Get Balance
      .addCase(getBalance.fulfilled, (state, action) => {
        state.balance = action.payload.data.balance;
      });
  },
});

export const { clearSelectedProvider, clearError } = userSlice.actions;
export default userSlice.reducer;
