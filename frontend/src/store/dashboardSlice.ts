import { apiInstanceFetch } from "@/utils/ApiInstance";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface SuggestionState {
  dashboardData: [];
  topDoctors: [];
  upcomingBookings: [];
  chartData: [];
  isLoading: boolean;
}

const initialState: SuggestionState = {
  dashboardData: [],
  topDoctors: [],
  upcomingBookings: [],
  chartData: [],
  isLoading: false,
};
interface AllUsersPayload {
  startDate?: string;
  endDate?: string;
  payload?: {
    startDate?: string;
    endDate?: string;
  };
  type: number;
}

export const getDashboardData = createAsyncThunk(
  "admin/dashboard/allStats",
  async (payload: AllUsersPayload | undefined) => {
    return apiInstanceFetch.get(
      `admin/dashboard/allStats?startateDate=${payload?.startDate}&&endDate=${payload?.endDate}`
    );
  }
);

export const getTopDoctorData = createAsyncThunk(
  "admin/complain/topDoctors",
  async (payload: AllUsersPayload | undefined) => {
    
    return apiInstanceFetch.get(
      `admin/dashboard/topDoctors?startateDate=${payload?.startDate}&endDate=${payload?.endDate}`
    );
  }
);

export const getUpcomingBookings = createAsyncThunk(
  "admin/complain/upcomingBookings",
  async (payload: AllUsersPayload | undefined) => {
    return apiInstanceFetch.get(`admin/dashboard/upcomingBookings?type=1`);
  }
);

export const getChartData = createAsyncThunk(
  "admin/complain/chart",
  async (payload: AllUsersPayload | undefined) => {
    return apiInstanceFetch.get(
      `admin/dashboard/chart?startateDate=${payload?.startDate}&endDate=${payload?.endDate}`
    );
  }
);

const suggestionSlice = createSlice({
  name: "suggestion",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      getDashboardData.pending,
      (state, action: PayloadAction<any>) => {
        state.isLoading = true;
      }
    );

    builder.addCase(
      getDashboardData.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.dashboardData = action.payload.data;
      }
    );

    builder.addCase(
      getTopDoctorData.fulfilled,
      (state, action: PayloadAction<any>) => {
        
        state.isLoading = false;
        state.topDoctors = action.payload.data;
      }
    );

    builder.addCase(
      getUpcomingBookings.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.upcomingBookings = action.payload.data;
      }
    );

    builder.addCase(
      getChartData.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.chartData = action.payload.data;
      }
    );
  },
});

export default suggestionSlice.reducer;
