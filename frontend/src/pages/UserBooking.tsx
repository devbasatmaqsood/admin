import CancelBooking from "@/component/booking/CancelBooking";
import CompletedBooking from "@/component/booking/CompletedBooking";
import ConfirmBooking from "@/component/booking/ConfirmBooking";
import PendingBookingDialog from "@/component/booking/PendingBookingDialog";
import RootLayout from "@/component/layout/Layout";
import Table from "@/extra/Table";
import { openDialog } from "@/store/dialogSlice";
import { RootStore, useAppDispatch } from "@/store/store";
import { getUserAppointment } from "@/store/userSlice";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Pagination from "@/extra/Pagination";
import Analytics from "@/extra/Analytic";

interface userBookingData {
  _id: any;
  time: string;
  amount: number;
  user: {
    name: string;
  };

  date: string;
  appointmentId: any;
  doctor: [
    {
      name: string;
      image: string;
    }
  ];
  service: string;
}

export default function UserBooking() {
  const dispatch = useAppDispatch();
  const { booking, total } = useSelector((state: RootStore) => state?.user);
  const { setting }: any = useSelector((state: RootStore) => state?.setting);
  const [startDate, setStartDate] = useState("ALL");
  const [endDate, setEndDate] = useState("ALL");
  const [status, setStatus] = useState<string>("ALL");
  const { dialogueType } = useSelector((state: RootStore) => state.dialogue);
  const [page, setPage] = useState<any>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);


  const router = useRouter();
  const id: any = router?.query?.id;

  useEffect(() => {
    let payload: any = {
      id: id,
      start: page,
      limit: rowsPerPage,
      startDate: startDate,
      endDate: endDate,
      status: status,
    };
    dispatch(getUserAppointment(payload));
  }, [dispatch, id, page, rowsPerPage, startDate, endDate, status]);

  const handleChangePage = (event: any, newPage: any) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(0);
  };

  const bookingType = [
    { name: "ALL", value: "ALL" },
    { name: "Pending", value: 1 },
    { name: "Confirm", value: 2 },
    { name: "Completed", value: 3 },
    { name: "Cancelled", value: 4 },
  ];
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
      Header: "Image",
      Cell: ({ row }) => (
        <div className="userProfile">
          <img
            src={row?.doctor?.map((doctor) => doctor?.image)}
            alt=""
            style={{
              height: "70px",
              width: "70px",
              overflow: "hidden",
              borderRadius: "10px",
            }}
            className="cursor-pointer"
            // onClick={() => handleInfo(row._id)}
          />
        </div>
      ),
    },

    {
      Header: "Name",
      Cell: ({ row }: { row: userBookingData }) => (
        <span className="text-capitalize fw-bold cursor">
          {row?.user?.name}
        </span>
      ),
    },

    {
      Header: "Doctor Name",
      Cell: ({ row }: { row: userBookingData }) => (
        <span className="text-capitalize fw-bold cursor">
          {row?.doctor.map((doctor: any) => doctor?.name)}
        </span>
      ),
    },

    {
      Header: "AppoinmentId",
      Cell: ({ row }: { row: userBookingData }) => (
        <span className="text-capitalize fw-bold cursor">
          {row?.appointmentId}
        </span>
      ),
    },

    {
      Header: "Service",
      Cell: ({ row }: { row: userBookingData }) => (
        <span className="text-capitalize fw-bold cursor">{row?.service}</span>
      ),
    },

    {
      Header: "Time",
      Cell: ({ row }: { row: userBookingData }) => (
        <span className="text-capitalize fw-bold cursor">{row?.time}</span>
      ),
    },

    {
      Header: `Amount(${setting?.currencySymbol})`,
      Cell: ({ row }: { row: userBookingData }) => (
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
          <button
            className="bg-info text-white m5-right p12-x p4-y fs-12 br-5 "
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
      Cell: ({ row }: { row: userBookingData }) => (
        <span className="text-capitalize fw-bold cursor">{row?.date}</span>
      ),
    },
  ];
  return (
    <div className="mainCategory">
      {dialogueType == "pending" ? (
        <PendingBookingDialog />
      ) : dialogueType == "cancel" ? (
        <CancelBooking />
      ) : dialogueType == "completed" ? (
        <CompletedBooking />
      ) : dialogueType == "confirm" ? (
        <ConfirmBooking />
      ) : (
        ""
      )}
      {/* <Title name={`${bookingUserName} ' Appointment`} /> */}
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
          data={booking}
          mapData={bookingTable}
          serverPerPage={rowsPerPage}
          Page={page}
        />

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
  );
}

UserBooking.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};
