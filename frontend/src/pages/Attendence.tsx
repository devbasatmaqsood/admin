import RootLayout from "@/component/layout/Layout";
import Pagination from "@/extra/Pagination";
import Table from "@/extra/Table";
import Title from "@/extra/Title";
import { getAttendence, getDoctorDropDown } from "@/store/attendenceSlice";
import { RootStore, useAppDispatch } from "@/store/store";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from "next/router";

interface ServiceData {
  _id: string;
  image: string;
  name: string;
  categoryname: number;
  duration: number;
  status: false;
}

const Attendence = () => {
  const dispatch = useAppDispatch();


  const { attendence, doctorDropDown } = useSelector(
    (state: RootStore) => state.attendence
  );
  const { dialogue, dialogueType } = useSelector(
    (state: RootStore) => state.dialogue
  );
  const thisMonth: any = new Date();
  const [rowsPerPage, setRowsPerPage] = useState<number>(20);
  const [page, setPage] = useState<number>(0);
  const [data, setData] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<any>(thisMonth);
  const [doctorId, setDoctorId] = useState<any>("ALL");
  const router = useRouter();

  useEffect(() => {
    // Get current month and year
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1; // Months are zero-indexed, so add 1

    // Format the month in "yyyy-MM" format
    const formattedMonth = `${year}-${month.toString().padStart(2, "0")}`;

    let payload: any = {
      doctorId: doctorId,
      month: formattedMonth,
    };

    dispatch(getAttendence(payload));
    dispatch(getDoctorDropDown());
  }, [dispatch, selectedDate, doctorId]);

  useEffect(() => {
    setData(attendence);
  }, [attendence]);

  const handleChangePage = (event: any, newPage: any) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(0);
  };

  const handleDateChange = (date: any) => {
    const selectedDateObject = moment(date, "YYYY-MM").toDate();
    setSelectedDate(selectedDateObject);
    const formattedDate = moment(selectedDateObject, "YYYY-MM").format(
      "YYYY-MM"
    );
    let payload1: any = {
      month: formattedDate,
      doctorId: doctorId,
    };
    dispatch(getAttendence(payload1));
  };

  const handleInfo = (id: any) => {
    router.push({
      pathname: "/DoctorProfile",
      query: { id: id },
    });
  };

  const attendenceTable = [
    {
      Header: "No",
      Cell: ({ index }: { index: any }) => (
        <span>{page * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },
    {
      Header: "Image",
      Cell: ({ row }) => (
        <div className="userProfile">
          <img
            src={row?.doctor?.image}
            alt="image"
            className="cursor-pointer"
            style={{ height: "70px", width: "70px", overflow: "hidden" }}
            height={`100%`}
          />
        </div>
      ),
    },
    {
      Header: "Doctor Name",
      Cell: ({ row }) => (
        <span
          className="text-capitalize fw-bold cursor"
          onClick={() => handleInfo(row?.doctor?._id)}
        >
          {row?.doctor?.name}
        </span>
      ),
    },

    {
      Header: "Month Year",
      Cell: ({ row }) => <span className="text-capitalize">{row?.month}</span>,
    },
    {
      Header: "Available Days",
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.attendCount}</span>
      ),
    },
    {
      Header: "Absent Days",
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.absentCount}</span>
      ),
    },
    {
      Header: "Total Days",
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.totalDays}</span>
      ),
    },
  ];

  return (
    <div>
      <div className="mainExpert">
        <Title name="Staff attendance data" />
        <div className="row">
          <div className="col-md-6 d-flex">
            <div className="m12-bottom inputData z-index-3 col-lg-4 col-md-4 position-relative">
              <label>Select month</label>
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="yyyy/MM"
                showMonthYearPicker
              />
            </div>
            <div className="inputData ms-4">
              <label className="styleForTitle" htmlFor="bookingType">
                Doctor
              </label>
              <select
                name="bookingType"
                className="rounded-2 fw-bold mt-2"
                id="bookingType"
                value={doctorId}
                onChange={(e) => {
                  const selecteddoctorId = e.target.value;
                  const formattedDate = moment(selectedDate, "YYYY-MM").format(
                    "YYYY-MM"
                  );

                  let payload = {
                    doctorId: selecteddoctorId,
                    date: formattedDate,
                  };
                  setDoctorId(selecteddoctorId);
                }}
              >
                <option key="ALL" value="ALL">
                  All
                </option>
                {doctorDropDown?.map((item: any, index) => {
                  return (
                    <>
                      <option key={index} value={item?._id}>
                        {item?.name}
                      </option>
                    </>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        <div>
          <Table
            data={data}
            mapData={attendenceTable}
            PerPage={rowsPerPage}
            Page={page}
            type={"client"}
          />
          <Pagination
            type={"client"}
            serverPage={page}
            setServerPage={setPage}
            serverPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            totalData={data?.length}
          />
        </div>
      </div>
    </div>
  );
};
Attendence.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};
export default Attendence;
