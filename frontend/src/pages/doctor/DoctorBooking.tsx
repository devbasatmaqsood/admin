import CancelBooking from "@/component/booking/CancelBooking";
import CompletedBooking from "@/component/booking/CompletedBooking";
import ConfirmBooking from "@/component/booking/ConfirmBooking";
import PendingBookingDialog from "@/component/booking/PendingBookingDialog";
import RootLayout from "@/component/layout/Layout";
import Analytics from "@/extra/Analytic";
import Pagination from "@/extra/Pagination";
import Table from "@/extra/Table";
import Title from "@/extra/Title";
import { openDialog } from "@/store/dialogSlice";
import { getParticularDoctorAppointment } from "@/store/doctorSlice";
import { RootStore, useAppDispatch } from "@/store/store";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

interface bookingData {
  _id: any;
  time: string;
  amount: number;
  user: {
    name: string;
    image: string;
  };

  date: string;
  appointmentId: any;
  doctor: {
    name: string;
  };
  service: string;
}

const DoctorBooking = () => {
  const { doctorAppointment, total } = useSelector(
    (state: RootStore) => state?.doctor
  );

  const { setting }: any = useSelector((state: RootStore) => state?.setting);

  const [startDate, setStartDate] = useState("ALL");
  const [endDate, setEndDate] = useState("ALL");
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [status, setStatus] = useState<string>("ALL");
  const dispatch = useAppDispatch();
  const { dialogueType } = useSelector((state: RootStore) => state.dialogue);


  const router = useRouter();
  const id: any = router?.query?.id;

  useEffect(() => {
    let payload: any = {
      doctorId: id,
      start: page,
      limit: rowsPerPage,
      startDate: startDate,
      endDate: endDate,
      status: status,
    };
    dispatch(getParticularDoctorAppointment(payload));
  }, [dispatch, id, page, rowsPerPage, startDate, endDate, status]);

  const handleChangePage = (event: any, newPage: any) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(0);
  };

  const handlePendingOpenDialogue = (row: any) => {
    dispatch(openDialog({ type: "pending", data: row }));
  };
  const handleOpenDialogue = (row: any) => {
    dispatch(openDialog({ type: "cancel", data: row }));
  };

  const handleCompletedDialogue = (row: any) => {
    dispatch(openDialog({ type: "completed", data: row }));
  };

  const handleConfirmDialogue = (row: any) => {
    dispatch(openDialog({ type: "confirm", data: row }));
  };

  const bookingTable = [
    {
      Header: "No",
      Cell: ({ index }: { index: any }) => (
        <span>{page * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },

    {
      Header: "User",
      Cell: ({ row, index }: { row: bookingData; index: number }) => (
        <div className="userProfile">
          <div className="userProfile">
            <img
              src={row?.user?.image}
              style={{ width: "70px", height: "70px" }}
              alt={`Doctor ${page * rowsPerPage + index + 1}`}
            />
          </div>
        </div>
      ),
    },

    {
      Header: "Name",
      Cell: ({ row }: { row: bookingData }) => (
        <span className="text-capitalize fw-bold cursor">
          {row?.user?.name}
        </span>
      ),
    },

    {
      Header: "Doctor",
      Cell: ({ row }: { row: bookingData }) => (
        <span className="text-capitalize fw-bold cursor">
          {row?.doctor?.name}
        </span>
      ),
    },

    {
      Header: "AppoinmentId",
      Cell: ({ row }: { row: bookingData }) => (
        <span className="text-capitalize fw-bold cursor">
          {row?.appointmentId}
        </span>
      ),
    },

    {
      Header: "Service",
      Cell: ({ row }: { row: bookingData }) => (
        <span className="text-capitalize fw-bold cursor">{row?.service}</span>
      ),
    },

    {
      Header: "Time",
      Cell: ({ row }: { row: bookingData }) => (
        <span className="text-capitalize fw-bold cursor">{row?.time}</span>
      ),
    },

    {
      Header: `Amount (${setting?.currencySymbol})`,
      Cell: ({ row }: { row: bookingData }) => (
        <span className="text-capitalize fw-bold cursor">{row?.amount}</span>
      ),
    },

    {
      Header: "Status",
      Cell: ({ row }) =>
        row?.status === 1 ? (
          <button
            className="  m5-right p12-x p4-y fs-12 br-5 text-white"
            style={{ backgroundColor: "#ff7512" }}
            onClick={() => handlePendingOpenDialogue(row)}
          >
            Pending
          </button>
        ) : row?.status === 2 ? (
          <button className="bg-info text-white m5-right p12-x p4-y fs-12 br-5 "
          onClick={() => handleConfirmDialogue(row)}
          >
            Confirm
          </button>
        ) : row?.status === 3 ? (
          <button
            className="bg-success text-white m5-right p12-x p4-y fs-12 br-5 "
            onClick={() => handleCompletedDialogue(row)}
          >
            Completed
          </button>
        ) : row?.status === 4 ? (
          <button
            className="bg-danger text-white m5-right p12-x p4-y fs-12 br-5 "
            style={{ cursor: "pointer" }}
            onClick={() => handleOpenDialogue(row)}
          >
            Cancel
          </button>
        ) : (
          ""
        ),
    },

    {
      Header: "Date",
      Cell: ({ row }: { row: bookingData }) => (
        <span className="text-capitalize fw-bold cursor">{row?.date}</span>
      ),
    },
  ];

  const bookingType = [
    { name: "ALL", value: "ALL" },
    { name: "Pending", value: 1 },
    { name: "Completed", value: 3 },
    { name: "Cancelled", value: 4 },
  ];
  return (
    <>
      <div className="mainCategory">
        <Title name="Bookings" />
        {dialogueType == "pending" ? (
        <PendingBookingDialog />
      ) : dialogueType == "cancel" ? (
        <CancelBooking />
      ) : dialogueType == "completed" ? (
        <CompletedBooking />
      ) :
        dialogueType == "confirm" ? (
          <ConfirmBooking />
        )
          :
          (
            ""
          )}
        <div className="row">
          <div className="inputData col-2">
            <label className="styleForTitle" htmlFor="bookingType">
            Appointment type
            </label>
            <select
              name="bookingType"
              className="rounded-2 fw-bold"
              id="bookingType"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
              }}
            >
              {bookingType?.map((data) => {
                return <option value={data?.value}>{data?.name}</option>;
              })}
            </select>
          </div>

          <div className="col-9">
            <div className="inputData">
              <label>Analytic</label>
            </div>
            <Analytics
              analyticsStartDate={startDate}
              analyticsStartEnd={endDate}
              analyticsStartDateSet={setStartDate}
              analyticsStartEndSet={setEndDate}
            />
          </div>
        </div>
        <div>
          <Table
            type={"server"}
            data={doctorAppointment}
            mapData={bookingTable}
            serverPerPage={rowsPerPage}
            Page={page}
          />
        </div>

        <div>
          <Pagination
            type={"server"}
            serverPage={page}
            setServerPage={setPage}
            serverPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            totalData={total}
          />
        </div>
      </div>
    </>
  );
};

DoctorBooking.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default DoctorBooking;
