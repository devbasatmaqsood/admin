import RootLayout from "@/component/layout/Layout";
import Pagination from "@/extra/Pagination";
import Table from "@/extra/Table";
import Title from "@/extra/Title";
import { getParticularDoctorEarning } from "@/store/doctorSlice";
import { getSetting } from '@/store/settingSlice';
import { RootStore, useAppDispatch } from "@/store/store";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

interface DoctorEarning {
  amount?: any;
  date?: any;
  time?: any;
  wallet?: any;
  appointment?: any;
}

const DoctorEarning = () => {
  const { doctorAppointment, total, doctorEarning, wallet } = useSelector(
    (state: RootStore) => state?.doctor
  );
  const { setting }: any = useSelector((state: RootStore) => state?.setting);

  const dispatch = useAppDispatch();
  const router = useRouter();
  const id: any = router?.query?.id;
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [status, setStatus] = useState<any>(1);

  useEffect(() => {
    let payload: any = {
      doctorId: id,
      status: status,
    };
    dispatch(getParticularDoctorEarning(payload));
  }, [dispatch, id, status]);

  useEffect(() => {
      dispatch(getSetting())
  }, [])

  const handleChangePage = (event: any, newPage: any) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(0);
  };

  let earningTable: any;

  if (status == 2) {
    earningTable = [
      {
        Header: "No",
        Cell: ({ index }: { index: any }) => <span>{index + 1}</span>,
      },

      {
        Header: `Amount (${setting?.currencySymbol})`,
        Cell: ({ row }: { row: DoctorEarning }) => (
          <span className="text-capitalize fw-bold">{row?.amount}</span>
        ),
      },
      {
        Header: "Date",
        Cell: ({ row }: { row: DoctorEarning }) => (
          <span className="text-capitalize fw-bold">{row?.date}</span>
        ),
      },
      {
        Header: "Time",
        Cell: ({ row }: { row: DoctorEarning }) => (
          <span className="text-capitalize fw-bold">{row?.time}</span>
        ),
      },
    ];
  } else {
    earningTable = [
      {
        Header: "No",
        Cell: ({ index }: { index: any }) => <span>{index + 1}</span>,
      },

      {
        Header: `Amount (${setting?.currencySymbol})`,
        Cell: ({ row }: { row: DoctorEarning }) => (
          <span className="text-capitalize fw-bold">{row?.amount}</span>
        ),
      },
      {
        Header: "Date",
        Cell: ({ row }: { row: DoctorEarning }) => (
          <span className="text-capitalize fw-bold">{row?.date}</span>
        ),
      },

      {
        Header: "Appointment Id",
        Cell: ({ row }: { row: DoctorEarning }) => (
          <span className="text-capitalize fw-bold">
            {row?.appointment?.appointmentId || "-"}
          </span>
        ),
      },
      {
        Header: "Time",
        Cell: ({ row }: { row: DoctorEarning }) => (
          <span className="text-capitalize fw-bold">{row?.time}</span>
        ),
      },
    ];
  }

  const earningType = [
    { name: "Earning", value: 1 },
    { name: "Withdrawal", value: 2 },
  ];

  return (
    <>
      <div className="mainCategory">
        <Title name="Doctor earning" />

        <div className="row  justify-content-between align-self-start">
          <div className="inputData col-2">
            <label className="styleForTitle" htmlFor="bookingType">
              Earning type
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
              {earningType?.map((data) => {
                return <option value={data?.value}>{data?.name}</option>;
              })}
            </select>
          </div>

          <div className="col-2 mt-2">
            <label className="styleForTitle  fw-bold" htmlFor="bookingType">
              Total wallet amount :-
              {' '}{wallet ? wallet : 0}{setting?.currencySymbol}
            </label>
          </div>
        </div>
        <div>
          <Table
            type={"client"}
            data={doctorEarning}
            mapData={earningTable}
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
DoctorEarning.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default DoctorEarning;
