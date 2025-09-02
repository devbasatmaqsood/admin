import React, { useEffect, useState } from "react";
import RootLayout from "../component/layout/Layout";
import { useAppDispatch } from "@/store/store";
import { getRechargeRequest } from "../store/rechargeSlice";
import { useSelector } from "react-redux";
import Table from "@/extra/Table";
import Pagination from "@/extra/Pagination";
import Analytics from "@/extra/Analytic";
import Title from "@/extra/Title";

interface rechargeTable {
  _id?: string;
  user?: {
    name: string;
  };
  date?: string;
  amount?: any;
  paymentGateway?: any;
  time?: string;
  currencySymbol?: any;
  couponId?: any;
  couponAmount?: any;
}

interface RootStore {
  setting: any;
  recharge: {
    recharge: any;
    userWalletHistory: any;
    user: any;
  };
}

const Recharge = () => {
  const dispatch = useAppDispatch();
  const [data, setData] = useState<any>();
  const [rowsPerPage, setRowsPerPage] = useState<number>(20);
  const [page, setPage] = useState<number>(0);
  const [startDate, setStartDate] = useState("ALL");
  const [endDate, setEndDate] = useState("ALL");
  const [status, setStatus] = useState<string>("ALL");
  const { recharge } = useSelector((state: RootStore) => state.recharge);
  const { setting } = useSelector((state: RootStore) => state.setting);


  useEffect(() => {
    const payload = {
      startDate,
      endDate,
      status,
    };
    dispatch(getRechargeRequest(payload));
  }, [dispatch, startDate, endDate, status]);

  const handleChangePage = (event: any, newPage: any) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(0);
  };

  const bookingType = [
    { name: "ALL", value: "ALL" },
    { name: "Credit", value: 1 },
    { name: "Debit", value: 2 },
  ];

  const rechargeTable = [
    {
      Header: "No",
      Cell: ({ index }: { index: any }) => (
        <span>{page * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },
    {
      Header: "User",
      Cell: ({ row }: { row: rechargeTable }) => (
        <span className="text-capitalize fw-bold">
          {row?.user?.name ? row?.user?.name : "-"}
        </span>
      ),
    },

    {
      Header: "Payment Gateway",
      Cell: ({ row }: { row: rechargeTable }) => (
        <span className="text-capitalize fw-bold">
          {row?.paymentGateway === 1
            ? "Razorpay"
            : row?.paymentGateway === 2
            ? "Stripe"
            : "Flutter"}
        </span>
      ),
    },

    {
      Header: `Amount (${setting?.currencySymbol || "$"})`,
      Cell: ({ row }: { row: rechargeTable }) => (
        <span className="text-capitalize fw-bold">{row?.amount}</span>
      ),
    },

    {
      Header: "Coupon Code",
      Cell: ({ row }: { row: rechargeTable }) => (
        <span className="text-capitalize fw-bold">
          {row?.couponId !== "" ? row?.couponId : "-"}
        </span>
      ),
    },

    {
      Header: "Discount",
      Cell: ({ row }: { row: rechargeTable }) => (
        <span className="text-capitalize fw-bold">
          {row?.couponAmount ? row?.couponAmount : "-"}
        </span>
      ),
    },

    {
      Header: "Date",
      Cell: ({ row }: { row: rechargeTable }) => (
        <span className="text-capitalize fw-bold">{`${row?.date}`}</span>
      ),
    },

    {
      Header: "Time",
      Cell: ({ row }: { row: rechargeTable }) => (
        <span className="text-capitalize fw-bold">{row?.time}</span>
      ),
    },
  ];

  return (
    <div>
      <Title name="Recharge" />

      <div className="row">
        <div className="inputData col-2">
          <label className="styleForTitle" htmlFor="bookingType">
            Recharge type
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
        <div className="col-3">
          <div className="inputData">
            <label>Analytic</label>
          </div>
          <div>
            <Analytics
              analyticsStartDate={startDate}
              analyticsStartEnd={endDate}
              analyticsStartDateSet={setStartDate}
              analyticsStartEndSet={setEndDate}
            />
          </div>
        </div>
      </div>

      <div className="mt-3">
        <Table
          type={"client"}
          data={recharge}
          mapData={rechargeTable}
          PerPage={rowsPerPage}
          Page={page}
        />
      </div>

      <Pagination
        type={"client"}
        serverPage={page}
        setServerPage={setPage}
        serverPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        totalData={recharge?.length}
      />
    </div>
  );
};

Recharge.getLayout = function getLayout(page) {
  return <RootLayout>{page}</RootLayout>;
};

export default Recharge;
