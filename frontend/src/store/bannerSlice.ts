import { Success } from "@/api/toastServices";
import {  apiInstanceFetch } from "@/utils/ApiInstance";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

interface UserState {
  banner: any[];
  isLoading: boolean;
  isSkeleton: boolean;
}

const initialState: UserState = {
  banner: [],
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
  bannerId: any;
  payload: any;
}


export const getBanner = createAsyncThunk(
  "admin/banner/getAll",
  async (payload: AllUsersPayload | undefined) => {
    return apiInstanceFetch.get(`admin/banner/getAll`);
  }
);

export const createBanner = createAsyncThunk(
  "admin/banner/create",
  async (payload: AllUsersPayload | undefined) => {
    
    return axios.post("admin/banner/create", payload);
  }
);

export const deleteBanner = createAsyncThunk(
  "admin/banner/delete",
  async (payload: AllUsersPayload | undefined) => {
    return axios.delete(`admin/banner/delete?bannerId=${payload}`);
  }
);

export const updatedBanner = createAsyncThunk(
  "admin/service/update",
  async (payload: any) => {
    return axios.patch(
      `admin/banner/update?bannerId=${payload?.id}`,
      payload?.formData
    );
  }
);

export const activeBanner = createAsyncThunk(
  "admin/banner/isActive",
  async (payload: AllUsersPayload | undefined) => {
    return axios.put(`admin/banner/isActive?bannerId=${payload}`);
  }
);

const bannerSlice = createSlice({
  name: "banner",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getBanner.pending, (state, action: PayloadAction<any>) => {
      state.isSkeleton = true;
    });
    builder.addCase(
      getBanner.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isSkeleton = false;
        state.banner = action.payload.data;
      }
    );
    builder.addCase(getBanner.rejected, (state, action: PayloadAction<any>) => {
      state.isSkeleton = false;
    });

    builder.addCase(
      createBanner.pending,
      (state, action: PayloadAction<any>) => {
        state.isLoading = true;
      }
    );

    builder.addCase(
      createBanner.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        if (action.payload.status) {
          
          state.banner.unshift(action?.payload?.data?.banner);

          Success("Banner Add Successfully");
        }
      }
    );
    builder.addCase(createBanner.rejected, (state) => {
      state.isLoading = false;
    });

    builder.addCase(
      deleteBanner.pending,
      (state, action: PayloadAction<any>) => {
        state.isLoading = true;
      }
    );

    builder.addCase(deleteBanner.fulfilled, (state, action: any) => {
      if (action?.payload?.status) {
        
        state.banner = state.banner.filter(
          (banner) => banner?._id !== action?.meta?.arg
        );
        Success("Banner Delete Successfully");
      }
      state.isLoading = false;
    });

    builder.addCase(deleteBanner.rejected, (state, action) => {
      state.isLoading = false;
    });

    
    builder.addCase(
      updatedBanner.pending,
      (state, action: PayloadAction<any>) => {
        state.isLoading = true;
      }
    );

    builder.addCase(
      updatedBanner.fulfilled,
      (state, action: PayloadAction<any>) => {
          if (action.payload.status) {

            
            const serviceInx = state.banner.findIndex(
              (service) => service?._id === action?.payload?.data?.data?._id
            );
            
            if (serviceInx !== -1) {

              state.banner[serviceInx] = {
                ...state.banner[serviceInx],
                ...action.payload.data.data,
              };
            }
          }
          Success("Banner Update Successfully");
        state.isLoading = false;
      }
    );

    builder.addCase(updatedBanner.rejected, (state, action) => {
      state.isLoading = false;
    });

    builder.addCase(
      activeBanner.pending,
      (state, action: PayloadAction<any>) => {
        state.isLoading = true;
      }
    );

    builder.addCase(
      activeBanner.fulfilled,
      (state, action: PayloadAction<any>) => {
        
        if (action?.payload?.data?.status) {
          
          const updatedBanner = action.payload.data.data;
          const bannerIndex = state.banner.findIndex(
            (banner) => banner?._id === updatedBanner?._id
          );
          if (bannerIndex !== -1) {
            state.banner[bannerIndex].isActive = updatedBanner.isActive;
          }
          Success("Banner Status Update Successfully");
        }
        state.isLoading = false;
      }
    );

    builder.addCase(activeBanner.rejected, (state, action) => {
      state.isLoading = false;
    });
  },
});

export default bannerSlice.reducer;
