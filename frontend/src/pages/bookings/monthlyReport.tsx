import React, { useEffect, useState } from "react";
import RootLayout from "@/component/layout/Layout";
import { useSelector } from "react-redux";
import { RootStore, useAppDispatch } from "@/store/store";
import { getMonthlyReport } from "@/store/monthlyReportSlice";
import Title from "@/extra/Title";
import Table from "@/extra/Table";
import ReactDatePicker from "react-datepicker";
import moment from "moment";
import Pagination from "@/extra/Pagination";


interface monthlyReport {
  amount?: number;
  completedAppointments?: number;
  doctorEarning?: number;
  doctors?: number;
  month?: string;
  tax?: number;
}

export default function monthlyReport() {
  const thisYear = new Date();
  thisYear.setDate(1);
  const { setting }: any = useSelector((state: RootStore) => state?.setting);
  const monthlyReport = useSelector((state: RootStore) => state?.monthlyReport);

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [selectedDate, setSelectedDate] = useState<any>(thisYear);

  const dispatch = useAppDispatch();

  const formattedDate: any = moment(selectedDate, "YYYY").format("YYYY");
  useEffect(() => {
    dispatch(getMonthlyReport(formattedDate));
  }, [dispatch, formattedDate]);

  const handleChangePage = (event: any, newPage: any) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(0);
  };

  const handleDateChange = (date) => {
    const selectedDateObject = moment(date, "YYYY").toDate();
    setSelectedDate(selectedDateObject);
  };

  const paginatedData = monthlyReport?.monthlyReport?.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const monthReportTable = [
    {
      Header: "No",
      Cell: ({ index }: { index: number }) => (
        <span>{page * rowsPerPage + index + 1}</span>
      ),
    },

    {
      Header: "Month",
      Cell: ({ row }: { row: monthlyReport }) => (
        <span className="text-capitalize fw-bold cursor">{row?.month}</span>
      ),
    },

    {
      Header: "Total Doctor",
      Cell: ({ row }: { row: monthlyReport }) => (
        <span className="text-capitalize fw-bold cursor">{row?.doctors}</span>
      ),
    },

    {
      Header: "Total Appointment",
      Cell: ({ row }: { row: monthlyReport }) => (
        <span className="text-capitalize fw-bold cursor">
          {row?.completedAppointments}
        </span>
      ),
    },
    {
      Header: `Total Revenue (${setting?.currencySymbol || "$"})`,
      Cell: ({ row }: { row: monthlyReport }) => (
        <span className="text-capitalize fw-bold cursor">{row?.amount}</span>
      ),
    },

    {
      Header: `Doctor Earning (${setting?.currencySymbol || "$"})`,
      Cell: ({ row }: { row: monthlyReport }) => (
        <span className="text-capitalize fw-bold cursor">
          {row?.doctorEarning}
        </span>
      ),
    },

    {
      Header: "Tax (%)",
      Cell: ({ row }: { row: monthlyReport }) => (
        <span className="text-capitalize fw-bold cursor">{row?.tax}</span>
      ),
    },
  ];

  return (
    <div className="mainCategory">
      <Title name="Monthly Report" />
      <div className="inputData col-lg-2 col-md-4 me-3 mb-0">
        <label>Select year</label>

        <ReactDatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          dateFormat="yyyy"
          showYearPicker
          className="mt-0"
        />
      </div>

      <div className="mt-4">
        <Table
          type={"client"}
          data={paginatedData}
          mapData={monthReportTable}
          serverPerPage={rowsPerPage}
          Page={page}
        />
      </div>
      <div>
        <Pagination
          type={"client"}
          serverPage={page}
          setServerPage={setPage}
          serverPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          totalData={monthlyReport?.monthlyReport?.length}
        />
      </div>
    </div>
  );
}

monthlyReport.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};
