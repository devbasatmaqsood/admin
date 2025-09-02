"use client";

import { apiInstance, apiInstanceFetch } from "@/utils/ApiInstance";
import { jwtDecode } from "jwt-decode";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { setToast } from "@/utils/toastServices";
import { SetDevKey, setToken } from "@/utils/setAuthAxios";
import { key } from "@/utils/config";
import axios from "axios";

interface UserState {
  isAuth: boolean;
  admin: any;
  permission: boolean;
  isLoading: boolean;
}
const flag: any =
  typeof window !== "undefined" && sessionStorage.getItem("admin_");
const initialState: UserState = {
  isAuth: false,
  admin: {},
  permission: false,
  isLoading: false,
};

interface AllUsersPayload {
  adminId: string;
  start?: number;
  limit?: number;
  startDate?: string;
  data: any;
  endDate?: string;
  payload?: any;
  type?: string;
}

export const signUpAdmin = createAsyncThunk(
  "admin/admin/signUp",
  async (payload: any) => {
    return apiInstanceFetch.post("admin/signUp", payload);
  }
);

export const login = createAsyncThunk(
  "admin/login",
  async (payload: AllUsersPayload | undefined) => {
    return axios.post("admin/login", payload);
  }
);

export const adminProfileGet = createAsyncThunk(
  "admin/profile",
  async (payload: AllUsersPayload | undefined) => {
    return apiInstanceFetch.get(`admin/profile`);
  }
);

export const adminProfileUpdate: any = createAsyncThunk(
  "admin/update",
  async (payload: AllUsersPayload | undefined) => {
    return axios.patch(`admin/update`, payload);
  }
);

export const updateAdminPassword: any = createAsyncThunk(
  "admin/updatePassword",
  async (payload: AllUsersPayload | undefined) => {
    return axios.put(`admin/updatePassword`, payload);
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    logoutApi(state: any) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("admin");
      sessionStorage.removeItem("key");
      state.admin = {};
      state.isAuth = false;
      
    },

   
  },
  extraReducers: (builder: any) => {
    builder.addCase(
      signUpAdmin.pending,
      (state: any, action: PayloadAction<any>) => {
        state.isLoading = true;
      }
    );

    builder.addCase(
      signUpAdmin.fulfilled,
      (state: any, action: PayloadAction<any>) => {
        state.isLoading = false;
        if (action.payload && action.payload?.status !== false) {
          setToast("success", "Admin Sign Up Successfully");
        } else {
          setToast("error", action.payload?.message);
        }
      }
    );
    builder.addCase(
      signUpAdmin.rejected,
      (state: any, action: PayloadAction<any>) => {
        state.isLoading = false;
        setToast("error", action.payload?.message);
      }
    );

    builder.addCase(login.pending, (state: any, action: PayloadAction<any>) => {
      state.isLoading = true;
    });
    builder.addCase(
      login.fulfilled,
      (state: any, action: PayloadAction<any>) => {
        state.isLoading = false;
        if (action.payload && action.payload?.data?.status !== false) {
          const token = action.payload.data.data;
          const decodedToken: any = jwtDecode(token);
          state.isAuth = true;
          state.admin = decodedToken;
          state.permission = decodedToken?.flag;
          setToken(action.payload.data.data);
          SetDevKey(key);

          sessionStorage.setItem("token", token);
          sessionStorage.setItem("admin_", JSON.stringify(decodedToken));
          setToast("success", "Login Successfully");

          window.location.href = "/dashboard";
        } else {
          setToast("error", action.payload?.data?.message);
        }
      }
    );
    builder.addCase(
      login.rejected,
      (state: any, action: PayloadAction<any>) => {
        state.isLoading = false;
        setToast("error", action.payload?.message);
      }
    );

    builder.addCase(
      adminProfileGet.pending,
      (state: any, action: PayloadAction<any>) => {
        state.isLoading = true;
      }
    );
    builder.addCase(
      adminProfileGet.fulfilled,
      (state: any, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.admin = {
          ...state.admin,
          _id: action.payload?.data?._id,
          flag: action.payload?.data?.flag,
          name: action.payload?.data?.name,
          email: action.payload?.data?.email,
          image: action.payload?.data?.image,
        };
      }
    );
    builder.addCase(
      adminProfileGet.rejected,
      (state: any, action: PayloadAction<any>) => {
        state.isLoading = false;
        setToast("error", action.payload?.message);
      }
    );

    builder.addCase(
      adminProfileUpdate.pending,
      (state: any, action: PayloadAction<any>) => {
        state.isLoading = true;
      }
    );
    builder.addCase(
      adminProfileUpdate.fulfilled,
      (state: any, action: PayloadAction<any>) => {
        state.isLoading = false;
        if (action.payload.data?.status === true) {
          state.admin = action.payload.data.admin;
          setToast("success", "Admin Profile Update Successful");
        } else {
          setToast("error", action.payload.data.message);
        }
      }
    );
    builder.addCase(
      adminProfileUpdate.rejected,
      (state: any, action: PayloadAction<any>) => {
        state.isLoading = false;
        setToast("error", action.payload?.message);
      }
    );

    builder.addCase(
      updateAdminPassword.pending,
      (state: any, action: PayloadAction<any>) => {
        state.isLoading = true;
      }
    );
    builder.addCase(
      updateAdminPassword.fulfilled,
      (state: any, action: PayloadAction<any>) => {
        state.isLoading = false;
        if (action.payload.data?.status === true) {
          state.admin = action.payload.data?.admin;
          setToast("success", "Admin Password Update Successful");

          window.location.href = "/";
        } else {
          setToast("error", action.payload.data.message);
        }
      }
    );
    builder.addCase(
      updateAdminPassword.rejected,
      (state: any, action: PayloadAction<any>) => {
        state.isLoading = false;
        setToast("error", action.payload?.message);
      }
    );
  },
});

export default adminSlice.reducer;
export const { logoutApi  } = adminSlice.actions;
