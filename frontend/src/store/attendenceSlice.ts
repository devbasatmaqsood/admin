import { apiInstanceFetch } from "@/utils/ApiInstance";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface UserState {
  attendence: any[];
  doctorDropDown : [],
  isLoading: boolean;
  isSkeleton: boolean;
}

const initialState: UserState = {
  attendence: [],
  doctorDropDown : [],
  isLoading: false,
  isSkeleton: false,
};

interface AllUsersPayload {
  start?: number;
  limit?: number;
  search: string;
  startDate?: string;
  endDate?: string;
  type?: string;
  meta?: any;
  id?: any;
  data: any;
  doctorId: any;
  payload: any;
  month: any;
}

export const getAttendence = createAsyncThunk(
  "admin/attendance",
  async (payload: AllUsersPayload | undefined) => {
    return apiInstanceFetch.get(
      `admin/attendance?doctorId=${payload?.doctorId}&month=${payload?.month}`
    );
  }
);

export const getDoctorDropDown = createAsyncThunk(
  "admin/complain/getDoctorDropDown",
  async (payload: AllUsersPayload | undefined) => {
    return apiInstanceFetch.get(`admin/doctor/getDoctorDropDown`);
  }
);

const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      getAttendence.pending,
      (state, action: PayloadAction<any>) => {
        state.isSkeleton = true;
      }
    );
    builder.addCase(
      getAttendence.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isSkeleton = false;
        state.attendence = action.payload.data;
      }
    );
    builder.addCase(
      getAttendence.rejected,
      (state, action: PayloadAction<any>) => {
        state.isSkeleton = false;
      }
    );

    builder.addCase(
      getDoctorDropDown.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.doctorDropDown = action.payload.data;
      }
    );
  },
});

export default attendanceSlice.reducer;
