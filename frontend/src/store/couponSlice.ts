import { Success } from "@/api/toastServices";
import { apiInstanceFetch } from "@/utils/ApiInstance";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

interface UserState {
  coupon: any[];
  isLoading: boolean;
  isSkeleton: boolean;
}
const initialState: UserState = {
  coupon: [],
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
  payload: any;
}

export const getCoupon = createAsyncThunk(
  "admin/coupon/get",
  async (payload: AllUsersPayload | undefined) => {
    return apiInstanceFetch.get(`admin/coupon/get`);
  }
);
export const createCoupon = createAsyncThunk(
  "/admin/coupon/create",
  async (payload: AllUsersPayload | undefined) => {
    return axios.post(`/admin/coupon/create`, payload);
  }
);
export const activeCoupon = createAsyncThunk(
  "admin/coupon/active?couponId",
  async (payload: AllUsersPayload | undefined) => {
    return axios.put(`admin/coupon/active?couponId=${payload}`);
  }
);
export const deleteCoupon = createAsyncThunk(
  "admin/coupon/delete",
  async (payload: AllUsersPayload | undefined) => {
    return axios.delete(`admin/coupon/delete?couponId=${payload}`);
  }
);

const couponSlice = createSlice({
  name: "doctor",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getCoupon.pending, (state, action: PayloadAction<any>) => {
      state.isSkeleton = true;
    });

    builder.addCase(
      getCoupon.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isSkeleton = false;
        state.coupon = action.payload.data;
      }
    );
    builder.addCase(getCoupon.rejected, (state) => {
      state.isSkeleton = false;
    });

    builder.addCase(
      activeCoupon.pending,
      (state, action: PayloadAction<any>) => {
        state.isLoading = true;
      }
    );

    builder.addCase(
      activeCoupon.fulfilled,
      (state, action: PayloadAction<any>) => {
        if (action?.payload?.data?.status) {
          const updatedCoupon = action.payload.data.data;
          const couponIndex = state.coupon.findIndex(
            (coupon) => coupon?._id === updatedCoupon?._id
          );
          if (couponIndex !== -1) {
            state.coupon[couponIndex].isActive = updatedCoupon.isActive;
          }
          Success("Coupon Status Update Successfully");
        }
        state.isLoading = false;
      }
    );

    builder.addCase(activeCoupon.rejected, (state, action) => {
      state.isLoading = false;
    });

    builder.addCase(
      deleteCoupon.pending,
      (state, action: PayloadAction<any>) => {
        state.isLoading = true;
      }
    );

    builder.addCase(
      createCoupon.pending,
      (state, action: PayloadAction<any>) => {
        state.isLoading = true;
      }
    );

    builder.addCase(
      createCoupon.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        if (action.payload.data.status) {
          state.coupon.unshift(action?.payload?.data?.data);

          Success("Coupon Add Successfully");
        }
      }
    );

    builder.addCase(createCoupon.rejected, (state) => {
      state.isLoading = false;
    });

    builder.addCase(deleteCoupon.fulfilled, (state, action: any) => {
      if (action?.payload?.status) {
        state.coupon = state.coupon.filter(
          (coupon) => coupon?._id !== action?.meta?.arg
        );
        Success("Coupon Delete Successfully");
      }
      state.isLoading = false;
    });
    builder.addCase(deleteCoupon.rejected, (state) => {
      state.isLoading = false;
    });
  },
});

export default couponSlice.reducer;
