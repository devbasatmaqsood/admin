import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Success } from "@/api/toastServices";
import { apiInstance, apiInstanceFetch } from "@/utils/ApiInstance";

const initialState = {
  booking: [],
  calendarData: [],
  futureBooking: [],
  isLoading: false,
  isSkeleton: false,
  total: null,
};

interface AllUsersPayload {
  payload?: {
    startDate?: any;
    endDate?: any;
  };
  start?: number;
  limit?: number;
  startDate?: any;
  endDate?: any;
  appoinmentId?: any;
  reason?: string;
  status?: number;
  dialogPayload: any;
}

export const getAllBookings = createAsyncThunk(
  "admin/appointment/get",
  async (payload: AllUsersPayload | undefined) => {
    return apiInstanceFetch.get(
      `admin/appointment/get?status=${payload?.status}&start=${payload?.start}&limit=${payload?.limit}&startDate=${payload?.startDate}&endDate=${payload?.endDate}`
    );
  }
);

export const getDailyBooking = createAsyncThunk(
  "admin/appointment/dailyAppointments",
  async (payload: AllUsersPayload | undefined) => {
    return apiInstanceFetch.get(
      `admin/appointment/dailyAppointments?&start=${payload?.start}&limit=${payload?.limit}startDate=${payload?.startDate}&endDate=${payload?.endDate}`
    );
  }
);

export const cancelBooking = createAsyncThunk(
  "admin/appointment/cancelAppointment",
  async (payload: AllUsersPayload | undefined) => {
    return apiInstance.put(
      `admin/appointment/cancelAppointment?appointmentId=${payload?.appoinmentId}&reason=${payload?.reason}`
    );
  }
);

const bookingSlice = createSlice({
  name: "bookingSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAllBookings.pending, (state, action) => {
      state.isSkeleton = true;
    });

    builder.addCase(getAllBookings.fulfilled, (state, action) => {
      state.isLoading = false;
      state.booking = action.payload.data;
      state.total = action.payload.total;
      state.isSkeleton = false;

    });

    builder.addCase(getDailyBooking.pending, (state, action) => {
      state.isSkeleton = true;
    });

    builder.addCase(getDailyBooking.fulfilled, (state, action) => {
      state.isLoading = false;
      state.calendarData = action.payload.data;
      state.isSkeleton = false;
      state.total = action.payload.total;
    });

    builder.addCase(
      cancelBooking.fulfilled,
      (state, action: PayloadAction<any>) => {
        if (action.payload.status && state.booking) {
          const bookingIndex = state.booking.findIndex(
            (booking: any) => booking?._id === action.payload.booking?._id
          );

      
          Success("Appointment Cancel Successfully");
        }
        state.isLoading = false;
      }
    );
  },
});
export default bookingSlice.reducer;
