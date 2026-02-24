import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import appointmentService from '../../services/appointment.service';

const initialState = {
  appointments: [],
  currentAppointment: null,
  isLoading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    pages: 1,
  },
};

export const createAppointment = createAsyncThunk(
  'appointment/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await appointmentService.createAppointment(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Đặt lịch thất bại');
    }
  }
);

export const getMyAppointments = createAsyncThunk(
  'appointment/getMyAppointments',
  async (params, { rejectWithValue }) => {
    try {
      const response = await appointmentService.getMyAppointments(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi');
    }
  }
);

export const getAppointmentById = createAsyncThunk(
  'appointment/getById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await appointmentService.getAppointmentById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không tìm thấy');
    }
  }
);

export const cancelAppointment = createAsyncThunk(
  'appointment/cancel',
  async (id, { rejectWithValue }) => {
    try {
      const response = await appointmentService.cancelAppointment(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Hủy thất bại');
    }
  }
);

export const rateAppointment = createAsyncThunk(
  'appointment/rate',
  async ({ id, rating, review }, { rejectWithValue }) => {
    try {
      const response = await appointmentService.rateAppointment(id, { rating, review });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Đánh giá thất bại');
    }
  }
);

const appointmentSlice = createSlice({
  name: 'appointment',
  initialState,
  reducers: {
    clearCurrentAppointment: (state) => {
      state.currentAppointment = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createAppointment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.appointments.unshift(action.payload.data);
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getMyAppointments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMyAppointments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.appointments = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getMyAppointments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getAppointmentById.fulfilled, (state, action) => {
        state.currentAppointment = action.payload.data;
      })
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        const index = state.appointments.findIndex(
          (a) => a._id === action.payload.data._id
        );
        if (index !== -1) {
          state.appointments[index] = action.payload.data;
        }
      });
  },
});

export const { clearCurrentAppointment, clearError } = appointmentSlice.actions;
export default appointmentSlice.reducer;
