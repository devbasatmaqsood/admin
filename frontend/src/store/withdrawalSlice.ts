import { apiInstance, apiInstanceFetch } from "@/utils/ApiInstance";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface SuggestionState {
  withDrawal: [];
  isLoading: boolean;
}

const initialState: SuggestionState = {
  withDrawal: [],
  isLoading: false,
};
interface AllUsersPayload {
  start?: number;
  limit?: number;
  id?: string;
  data?: any;
  payload?: any;
  type?: number;
  reason?: string;
  status?: any;
  startDate?: any;
  endDate?: any;
}

export const getWithdrawalRequest: any = createAsyncThunk(
  "admin/withdrawRequest/getAll",
  async (payload: AllUsersPayload | undefined) => {
    return await apiInstanceFetch.get(
      `admin/withdrawRequest/getAll?status=${payload?.status}&startDate=${payload?.startDate}&endDate=${payload?.endDate}`
    );
  }
);

export const withdrawRequestPayUpdate: any = createAsyncThunk(
  "admin/withdrawRequest/pay",
  async (payload: AllUsersPayload | undefined) => {
    return await apiInstance.patch(
      `admin/withdrawRequest/pay?requestId=${payload}`
    );
  }
);

export const withdrawRequestDeclineUpdate: any = createAsyncThunk(
  "admin/withdrawRequest/decline",
  async (payload: AllUsersPayload | undefined) => {
    return await apiInstance.patch(
      `admin/withdrawRequest/decline?requestId=${payload?.id}&reason=${payload?.reason}`
    );
  }
);

const withdrawalSlice = createSlice({
  name: "withdrawal",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      getWithdrawalRequest.pending,
      (state, action: PayloadAction<any>) => {
        state.isLoading = true;
      }
    );

    builder.addCase(
      getWithdrawalRequest.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.withDrawal = action.payload.data;
      }
    );

    builder.addCase(
      withdrawRequestPayUpdate.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.withDrawal = action.payload.data;
      }
    );

    builder.addCase(
      withdrawRequestDeclineUpdate.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.withDrawal = action.payload.data;
      }
    );
  },
});

export default withdrawalSlice.reducer;
