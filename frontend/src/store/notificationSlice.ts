import { Success } from "@/api/toastServices";
import { apiInstance } from "@/utils/ApiInstance";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import axios from "axios";

interface notificationState {
  notification: [];
  total: any;
  isLoading: boolean;
  isSkeleton: boolean;
}

const initialState: notificationState = {
  notification: [],
  total: null,
  isLoading: false,
  isSkeleton: false,
};

interface AllUsersPayload {
  userId?: any;
  data?: any;
  formData?: any;
  doctorId?: any;
  status?: number;
  expertId?: any;
}

export const userNotification: any = createAsyncThunk(
  "admin/notification/toOneUser",
  async (payload: AllUsersPayload | undefined) => {
    return axios.post(
      `admin/notification/toOneUser?userId=${payload?.userId}`,
      payload?.formData
    );
  }
);

export const doctorNotification = createAsyncThunk(
  "admin/notification/toExpert",
  async (payload: AllUsersPayload | undefined) => {
    return apiInstance.post(
      `admin/notification/toExpert?doctorId=${payload?.doctorId}`,
      payload?.data
    );
  }
);

export const allUserNotification: any = createAsyncThunk(
  "admin/notification/notifyAllUsers",
  async (payload) => {
    return axios.post("admin/notification/notifyAllUsers", payload);
  }
);

export const expertNotification: any = createAsyncThunk(
  "admin/notification/toExpert",
  async (payload: AllUsersPayload | undefined) => {
    return apiInstance.post(
      `admin/notification/toExpert?expertId=${payload?.expertId}`,
      payload?.data
    );
  }
);

const notificationSlice = createSlice({
  name: "payoutSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(userNotification.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(
      userNotification.fulfilled,
      (state, action: PayloadAction<any>) => {
        if (action?.payload.status) {
          Success("Notification Send SuccessFully");
        }
        state.isLoading = false;
      }
    );

    builder.addCase(userNotification.rejected, (state, action) => {
      state.isLoading = false;
    });

    builder.addCase(expertNotification.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(expertNotification.fulfilled, (state, action) => {
      if (action?.payload?.status) {
        Success("Notification Send SuccessFully");
      }
      state.isLoading = false;
    });

    builder.addCase(expertNotification.rejected, (state, action) => {
      state.isLoading = false;
    });


    builder.addCase(allUserNotification.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(
      allUserNotification.fulfilled,
      (state, action: PayloadAction<any>) => {
        if (action?.payload?.status) {
          Success("Notification Send SuccessFully");
        }
        state.isLoading = false;
      }
    );

    builder.addCase(allUserNotification.rejected, (state, action) => {
      state.isLoading = false;
    });
  },
});

export default notificationSlice.reducer;
