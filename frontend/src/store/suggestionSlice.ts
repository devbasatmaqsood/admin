import { apiInstanceFetch } from "@/utils/ApiInstance";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface SuggestionState {
  userSuggestion: [];
  userTotal: number;
  doctorSuggestion: [];
  doctorTotal: number;
  isLoading: boolean;
}

const initialState: SuggestionState = {
  userSuggestion: [],
  doctorSuggestion: [],
  doctorTotal: 0,
  userTotal: 0,
  isLoading: false,
};
interface AllUsersPayload {
  start?: number;
  limit?: number;
  id?: string;
  data?: any;
  payload?: any;
  type: number;
}

export const getUserSuggestion = createAsyncThunk(
  "admin/complain/usersuggestions",
  async (payload: AllUsersPayload | undefined) => {
    return apiInstanceFetch.get(
      `admin/complain/suggestions?person=${payload?.type}&start=${payload?.start}&limit=${payload?.limit}`
    );
  }
);

export const getDoctorSuggestion = createAsyncThunk(
  "admin/complain/doctorsuggestions",
  async (payload: AllUsersPayload | undefined) => {

    return apiInstanceFetch.get(
      `admin/complain/suggestions?person=${payload?.type}&start=${payload?.start}&limit=${payload?.limit}`
    );
  }
);

const suggestionSlice = createSlice({
  name: "suggestion",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      getUserSuggestion.pending,
      (state, action: PayloadAction<any>) => {
        state.isLoading = true;
      }
    );

    builder.addCase(
      getUserSuggestion.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.userSuggestion = action.payload.data;
        state.userTotal = action.payload.total;
      }
    );

    builder.addCase(
      getDoctorSuggestion.pending,
      (state, action: PayloadAction<any>) => {
        state.isLoading = true;
      }
    );

    builder.addCase(
      getDoctorSuggestion.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.doctorSuggestion = action.payload.data;
        state.doctorTotal = action.payload.total;
      }
    );
  },
});

export default suggestionSlice.reducer;
