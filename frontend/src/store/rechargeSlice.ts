import {  apiInstanceFetch } from "@/utils/ApiInstance";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface SuggestionState {
  recharge: [];
  isLoading: boolean;
}

const initialState: SuggestionState = {
  recharge: [],
  isLoading: false,
};

interface AllUsersPayload {
  startDate?: any;
  endDate?: any;
  status?: any;
}

export const getRechargeRequest = createAsyncThunk(
  "admin/userWallet/getRechargeHistory",
  async (payload: AllUsersPayload | undefined) => {
    return await apiInstanceFetch.get(
      `admin/userWallet/getRechargeHistory?startDate=${payload?.startDate}&endDate=${payload?.endDate}&status=${payload?.status}`
    );
  }
);

const rechargeSlice = createSlice({
  name: "withdrawal",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      getRechargeRequest.pending,
      (state, action: PayloadAction<any>) => {
        state.isLoading = true;
      }
    );

    builder.addCase(
      getRechargeRequest.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.recharge = action.payload.data;
      }
    );
  },
});

export default rechargeSlice.reducer;
