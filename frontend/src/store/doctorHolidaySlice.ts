import { apiInstanceFetch } from "@/utils/ApiInstance";
import { setToast } from "@/utils/toastServices";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";


interface SuggestionState {
    doctorHoliday : [],
    doctorDropDown : [],
    isLoading : boolean
}

const initialState : SuggestionState = {
    doctorHoliday : [],
    doctorDropDown : [],
    isLoading : false
}
interface AllUsersPayload {
    payload?: any;
  }
  

export const getdoctorHoliday = createAsyncThunk(
    "admin/complain/doctorholiday",
    async (payload: AllUsersPayload | undefined) => {
      return apiInstanceFetch.get(`admin/doctorBusy/getHoliday?doctorId=${payload}`);
    }
);

export const getDoctorDropDown = createAsyncThunk(
    "admin/complain/getDoctorDropDown",
    async (payload: AllUsersPayload | undefined) => {
      return apiInstanceFetch.get(`admin/doctor/getDoctorDropDown`);
    }
);

export const deleteDoctorHoliday = createAsyncThunk(
  "admin/doctorBusy/delete",
  async (payload: AllUsersPayload | undefined) => {
    return apiInstanceFetch.delete(`admin/doctorBusy/delete?id=${payload}`);
  }
);

  const doctorHolidayslice = createSlice({
    name: "doctorholiday",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(
            getdoctorHoliday.pending,
          (state, action: PayloadAction<any>) => {
            state.isLoading = true;
          }
        );

        builder.addCase(
            getdoctorHoliday.fulfilled,
            (state, action: PayloadAction<any>) => {
              state.isLoading = false;
              state.doctorHoliday = action.payload.data;
            }
          );

          builder.addCase(
            getDoctorDropDown.fulfilled,
            (state, action: PayloadAction<any>) => {
              state.isLoading = false;
              state.doctorDropDown = action.payload.data;
            }
          );

          builder.addCase(deleteDoctorHoliday.fulfilled, (state: any, action: any) => {
            if (action?.payload?.status) {
              state.doctorHoliday = state.doctorHoliday.filter(
                (doctor : any) => doctor._id !== action?.meta?.arg
              );
              setToast("success", "Doctor Holiday Delete Successfully");
            }
            state.isLoading = false;
          });
    }
  })

  export default doctorHolidayslice.reducer