import { DangerRight, Success } from "@/api/toastServices";
import { apiInstance, apiInstanceFetch } from "@/utils/ApiInstance";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

interface SettingState {
  setting: any[];
  isLoading: boolean;
  isSkeleton: boolean;
  withdrawSetting: any;
}

const initialState: SettingState = {
  setting: [],
  withdrawSetting: [],
  isLoading: false,
  isSkeleton: false,
};

interface SettingPayload {
  meta?: any;
  id?: any;
  data: any;
  settingId: any;
  payload: any;
  type: any;
  status: any;
}

export const getSetting: any = createAsyncThunk(
  "admin/setting",
  async () => {
    return apiInstanceFetch.get("admin/setting");
  }
);

export const updateSetting: any = createAsyncThunk(
  "admin/setting/update",
  async (payload: any | undefined) => {

    return apiInstance.patch(`admin/setting/update`, payload);
  }
);

export const updateCompanyLogo:any = createAsyncThunk(
  "admin/setting/updateCompanyLogo",
  async (payload:any | undefined) => {
    return apiInstance.patch(`admin/setting/updateCompanyLogo`, payload)
  }
)

export const handleSetting: any = createAsyncThunk(
  "admin/setting/handleSwitch",
  async (payload: SettingPayload | undefined) => {
    return apiInstance.put(`admin/setting/handleSwitch?type=${payload?.type}`);
  }
);

export const getWithdrawMethod = createAsyncThunk(
  "admin/withdraw/get",
  async (payload: SettingPayload | undefined) => {
    return apiInstanceFetch.get(`admin/withdraw/getMethods`);
  }
);

export const createWithdrawMethod = createAsyncThunk(
  "admin/withdraw/create",
  async (payload: any) => {
    return axios.post("admin/withdraw/create", payload);
  }
);

export const updateWithdrawMethod = createAsyncThunk(
  "admin/withdraw/update",
  async (payload: any) => {
    return axios.patch(`admin/withdraw/update?withdrawId=${payload?.id}` , payload?.formData);
  }
);
export const activeWithdrawMethod = createAsyncThunk(
  "admin/withdraw/handleSwitch",
  async (payload: any) => {
    return apiInstance.patch(
      `admin/withdraw/handleSwitch?withdrawId=${payload}`
    );
  }
);
export const deleteWithdrawMethod = createAsyncThunk(
  "admin/withdraw/delete",
  async (payload: any) => {
    return apiInstance.delete(`admin/withdraw/delete?withdrawId=${payload}`);
  }
);

const settingSlice = createSlice({
  name: "settingSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getSetting.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(getSetting.fulfilled, (state, action) => {
      state.isLoading = false;
      state.setting = action?.payload?.setting;
    });

    builder.addCase(getSetting.rejected, (state, action) => {
      state.isLoading = false;
    });

    builder.addCase(updateSetting.pending, (state) => {
      state.isLoading = true;
    });

    builder.addCase(updateSetting.fulfilled, (state, action) => {
      if (action.payload.status) {
        state.setting = { ...state.setting, ...action.payload.setting };
        Success("Setting Updated Successfully");
      }
      state.isLoading = false;
    });

    builder.addCase(getWithdrawMethod.pending, (state, action: any) => {
      state.isLoading = true;
    });

    builder.addCase(getWithdrawMethod.fulfilled, (state, action: any) => {
      state.isLoading = false;
      state.withdrawSetting = action.payload.data;
    });

    builder.addCase(getWithdrawMethod.rejected, (state, action: any) => {
      state.isLoading = false;
    });

    
    builder.addCase(handleSetting.fulfilled, (state, action) => {
      state.setting = action.payload.setting;
       if(action.payload.status){
        Success("Updated Successfully");
      }else{
        DangerRight(action?.payload?.message)
      }
    });

    builder.addCase(createWithdrawMethod.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(createWithdrawMethod.fulfilled, (state, action: any) => {
      state.isLoading = false;
      if (action.payload.status) {
        state.withdrawSetting.unshift(action?.payload?.data?.data);

        Success("Withdraw Method Add Successfully");
      } else {
        Success(action?.payload?.data?.message);
      }
    });
    builder.addCase(createWithdrawMethod.rejected, (state) => {
      state.isLoading = false;
    });

    builder.addCase(updateWithdrawMethod.pending, (state, action: any) => {
      state.isLoading = true;
    });

    builder.addCase(updateWithdrawMethod.fulfilled, (state, action: any) => {
      if (action.payload.status) {
        if (action.payload.status) {
          const Index = state.withdrawSetting.findIndex(
            (withdrawSetting) =>
              withdrawSetting?._id === action?.payload?.data?.data?._id
          );

          if (Index !== -1) {
            state.withdrawSetting[Index] = {
              ...state.withdrawSetting[Index],
              ...action.payload.data.data,
            };
          }
        }
        Success("WithDraw Method Update Successfully");
      } else {
        Success(action.payload.data.message);
      }
      state.isLoading = false;
    });

    builder.addCase(updateWithdrawMethod.rejected, (state, action) => {
      state.isLoading = false;
    });

    builder.addCase(activeWithdrawMethod.pending, (state, action: any) => {
      state.isLoading = true;
    });

    builder.addCase(activeWithdrawMethod.fulfilled, (state, action: any) => {
      if (action?.payload?.status) {
        
        const updatedWithdraw = action.payload.data;
        const Index = state.withdrawSetting.findIndex(
          (withdrawSetting) => withdrawSetting?._id === updatedWithdraw?._id
        );
        if (Index !== -1) {
          state.withdrawSetting[Index].isEnabled = updatedWithdraw.isEnabled;
        }
        Success("Withdraw Status Update Successfully");
      } else {
        Success(action.payload.data.message);
      }
      state.isLoading = false;
    });

    builder.addCase(activeWithdrawMethod.rejected, (state, action) => {
      state.isLoading = false;
    });

    builder.addCase(deleteWithdrawMethod.pending, (state, action: any) => {
      state.isLoading = true;
    });

    builder.addCase(deleteWithdrawMethod.fulfilled, (state, action: any) => {
      if (action?.payload?.status) {
        state.withdrawSetting = state.withdrawSetting.filter(
          (withdrawSetting: any) => withdrawSetting._id !== action?.meta?.arg
        );

        Success("Withdraw Delete Successfully");
      } else {
        Success(action.payload.data?.message);
      }
      state.isLoading = false;
    });

    builder.addCase(deleteWithdrawMethod.rejected, (state, action) => {
      state.isLoading = false;
    });
  },
});

export default settingSlice.reducer;
