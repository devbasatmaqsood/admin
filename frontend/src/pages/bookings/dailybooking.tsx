import React, { useEffect, useState } from "react";
import RootLayout from "@/component/layout/Layout";
import Title from "@/extra/Title";
import { useSelector } from "react-redux";
import { RootStore, useAppDispatch } from "@/store/store";
import { getDailyBooking } from "@/store/bookingSlice";
import Table from "@/extra/Table";
import Analytics from "@/extra/Analytic";
import Pagination from "@/extra/Pagination";

interface dailyBookingData {
  date: string;
  doctor: number;
  totalAmount?: number;
  doctorEarning?: number;
  totalTax?: number;
  adminEarning?: number;
}

export default function DailyBooking() {
  const { setting }: any = useSelector((state: RootStore) => state?.setting);

  const [page, setPage] = useState<any>(0);
  const [rowsPerPage, setRowsPerPage] = useState<any>(10);
  const [startDate, setStartDate] = useState("ALL");
  const [endDate, setEndDate] = useState("ALL");

  const dispatch = useAppDispatch();

  useEffect(() => {
    let payload: any = {
      startDate: startDate,
      endDate: endDate,
      start: page,
      limit: rowsPerPage,
    };

    dispatch(getDailyBooking(payload));
  }, [dispatch, startDate, endDate, page, startDate]);

  const { total, calendarData } = useSelector(
    (state: RootStore) => state?.booking
  );

  const handleChangePage = (event: any, newPage: any) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(0);
  };

  const dailyBookingTable = [
    {
      Header: "No",
      Cell: ({ index }: { index: any }) => (
        <span>{page * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },

    {
      Header: "Date",
      Cell: ({ row }: { row: dailyBookingData }) => (
        <span className="text-capitalize fw-bold cursor">{row?.date}</span>
      ),
    },

    {
      Header: "No Of Doctor",
      Cell: ({ row }: { row: dailyBookingData }) => (
        <span className="text-capitalize fw-bold cursor">{row?.doctor}</span>
      ),
    },

    {
      Header: `Doctor Earning (${setting?.currencySymbol || "$"})`,
      Cell: ({ row }: { row: dailyBookingData }) => (
        <span className="text-capitalize fw-bold cursor">
          {row?.doctorEarning}
        </span>
      ),
    },

    {
      Header: "Total Tax (%)",
      Cell: ({ row }: { row: dailyBookingData }) => (
        <span className="text-capitalize fw-bold cursor">{row?.totalTax}</span>
      ),
    },

    {
      Header: `Admin Earning (${setting?.currencySymbol || "$"})`,
      Cell: ({ row }: { row: dailyBookingData }) => (
        <span className="text-capitalize fw-bold cursor">
          {row?.adminEarning}
        </span>
      ),
    },

    {
      Header: `Total Amount (${setting?.currencySymbol || "$"})`,
      Cell: ({ row }: { row: dailyBookingData }) => (
        <span className="text-capitalize fw-bold cursor">
          {row?.totalAmount}
        </span>
      ),
    },
  ];

  return (
    <div className="mainCategory">
      <Title name="Bookings" />
      <Analytics
        analyticsStartDate={startDate}
        analyticsStartEnd={endDate}
        analyticsStartDateSet={setStartDate}
        analyticsStartEndSet={setEndDate}
      />
      <Table
        type={"server"}
        data={calendarData}
        mapData={dailyBookingTable}
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
  );
}

DailyBooking.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};
