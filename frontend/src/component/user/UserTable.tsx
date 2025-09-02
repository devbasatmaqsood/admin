import Pagination from "@/extra/Pagination";
import Searching from "@/extra/Searching";
import Table from "@/extra/Table";
import Title from "@/extra/Title";
import ToggleSwitch from "@/extra/TogggleSwitch";
import { openDialog } from "@/store/dialogSlice";
import { RootStore, useAppDispatch } from "@/store/store";
import { blockuser, getAllUser } from "@/store/userSlice";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import male from "../../assets/images/male.png";
import { useRouter } from "next/router";
import NotificationDialogue from "./NotificationDialogue";

const UserTable = () => {
  const dispatch = useAppDispatch();



  const { dialogue, dialogueType } = useSelector(
    (state: RootStore) => state.dialogue
  );

  const { user, total } = useSelector((state: RootStore) => state.user);

  const router = useRouter();

  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [page, setPage] = useState<number>(0);
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState<string | undefined>("ALL");

  useEffect(() => {
    const payload: any = {
      start: page,
      limit: rowsPerPage,
      search,
    };
    dispatch(getAllUser(payload));
  }, [dispatch, search, page, rowsPerPage]);


  const handleChangePage = (event: any, newPage: any) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(0);
  };

  const handleFilterData = (filteredData: any) => {
    if (typeof filteredData === "string") {
      setSearch(filteredData);
    } else {
      setData(filteredData);
    }
  };

  const handleNotify = (id: any) => {
    dispatch(openDialog({ type: "notification", data: { id, type: "user" } }));
  };
  const handleStatus = (id: any) => {

    dispatch(blockuser(id));
  };

  const handleOpenBookings = (id: any) => {
    router.push({
      pathname: "/UserBooking",
      query: { id: id?._id },
    });
  };

  const handleInfo = (id: any) => {


    router.push({
      pathname: "/UserProfile",
      query: { id: id },
    });
  };

  const userTable = [
    {
      Header: "No",
      Cell: ({ index }) => (
        <span>{page * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },
    {
      Header: "Image",
      Cell: ({ row }) => (
        <div className="userProfile">
          <img
            src={row?.image ? row?.image : male}
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
      Cell: ({ row }) => (
        <span
          className="text-capitalize fw-bold cursor"
        //   onClick={() => handleInfo(row._id)}
        >
          {row?.name ? row?.name : "-"}
        </span>
      ),
    },
    {
      Header: "Email",
      Cell: ({ row }) => (
        <span>{row?.email ? row?.email : "demo@demo.com"}</span>
      ),
    },
    {
      Header: "Unique ID",
      Cell: ({ row }) => <span>{row?.uniqueId}</span>,
    },
    {
      Header: "Mobile No",
      Cell: ({ row }) => <span>{row?.mobile ? row?.mobile : "-"}</span>,
    },
    {
      Header: "gender",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.gender ? row?.gender : "Not Specified"}
        </span>
      ),
    },
    {
      Header: "Block",
      Cell: ({ row }) => (
        <ToggleSwitch
          value={row?.isBlock}
          onClick={() => handleStatus(row?._id)}
        />
      ),
    },
    {
      Header: "Appointments",
      Cell: ({ row }) => (
        <button
          className="py-1"
          style={{ backgroundColor: "#FFE7CF", borderRadius: "8px" }}
          onClick={() => handleOpenBookings(row)}
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 26 26"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18.9111 3H6.37786C3.9639 3 2 4.9639 2 7.37786C2 9.8035 3.98431 11.7557 6.35174 11.7557H8.31805V8.32563C8.31805 6.7895 9.56773 5.53978 11.1038 5.53978H11.1099C12.6427 5.54306 13.8897 6.79279 13.8897 8.32563V11.7557H18.9111C21.325 11.7557 23.2889 9.79181 23.2889 7.37786C23.2889 4.9639 21.325 3 18.9111 3ZM20.1499 6.76738L17.6551 9.26217C17.4116 9.50574 17.0166 9.50579 16.7731 9.26217L15.5257 8.01478C15.2821 7.7712 15.2821 7.37632 15.5257 7.13274C15.7692 6.88917 16.1641 6.88917 16.4077 7.13274L17.2141 7.9391L19.2679 5.88535C19.5114 5.64177 19.9063 5.64177 20.1499 5.88535C20.3935 6.12892 20.3935 6.52385 20.1499 6.76738Z"
              fill="#F98519"
            />
            <path
              d="M16.6573 13.5109L12.6422 13.0936V8.32557C12.6422 7.47717 11.9554 6.78894 11.107 6.78711C10.2561 6.78528 9.56528 7.47459 9.56528 8.32557V16.3055H9.55131L8.03269 15.0373C7.39215 14.5025 6.43632 14.6027 5.92073 15.2589C5.4263 15.8882 5.52177 16.7965 6.13619 17.3092L9.21863 19.8814H18.297V15.3676C18.297 14.4237 17.5939 13.6276 16.6573 13.5109ZM9.56524 22.3762C9.56524 22.7206 9.84449 22.9999 10.1889 22.9999H17.6733C18.0178 22.9999 18.297 22.7206 18.297 22.3762V21.1288H9.56524V22.3762Z"
              fill="#F98519"
            />
          </svg>
        </button>
      ),
    },
    {
      Header: "Info",
      Cell: ({ row }) => (
        <span className="">
          <button
            className="py-1"
            style={{ backgroundColor: "#CDE7FF", borderRadius: "8px" }}
            onClick={() => handleInfo(row._id)}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 26 26"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.9996 3C7.47746 3 3 7.47746 3 12.9996C3 18.5217 7.47746 23 12.9996 23C18.5217 23 23 18.5217 23 12.9996C23 7.47746 18.5217 3 12.9996 3ZM15.0813 18.498C14.5666 18.7012 14.1568 18.8552 13.8495 18.9619C13.5048 19.0745 13.1437 19.1286 12.7812 19.1219C12.1581 19.1219 11.673 18.9695 11.3276 18.6656C10.9822 18.3617 10.8104 17.9765 10.8104 17.5084C10.8104 17.3263 10.8231 17.1401 10.8485 16.9505C10.8799 16.7345 10.9214 16.52 10.9729 16.3079L11.6171 14.0324C11.6739 13.814 11.723 13.6066 11.7619 13.4135C11.8008 13.2188 11.8195 13.0402 11.8195 12.8777C11.8195 12.5881 11.7594 12.385 11.64 12.2707C11.5189 12.1564 11.2912 12.1005 10.9517 12.1005C10.7858 12.1005 10.6148 12.1251 10.4396 12.1767C10.266 12.2301 10.1153 12.2783 9.99175 12.3257L10.1619 11.6248C10.5835 11.4529 10.9873 11.3056 11.3725 11.1837C11.7247 11.0659 12.0932 11.0036 12.4646 10.9992C13.0834 10.9992 13.5608 11.1498 13.8969 11.4478C14.2313 11.7467 14.3998 12.1352 14.3998 12.6127C14.3998 12.7117 14.3879 12.8861 14.3651 13.135C14.3452 13.3676 14.3021 13.5976 14.2364 13.8216L13.5956 16.0904C13.5381 16.2956 13.4909 16.5035 13.4542 16.7134C13.4193 16.8881 13.3986 17.0654 13.3924 17.2434C13.3924 17.5448 13.4593 17.7505 13.5947 17.8597C13.7285 17.9689 13.963 18.0239 14.2948 18.0239C14.4514 18.0239 14.6267 17.996 14.8248 17.9418C15.0212 17.8876 15.1634 17.8394 15.2531 17.7979L15.0813 18.498ZM14.9678 9.2891C14.6764 9.56388 14.2889 9.71343 13.8885 9.70561C13.4686 9.70561 13.1062 9.56677 12.8049 9.2891C12.6615 9.16303 12.5471 9.00757 12.4692 8.8333C12.3913 8.65902 12.3519 8.47002 12.3537 8.27915C12.3537 7.8855 12.506 7.54688 12.8049 7.26667C13.0969 6.9897 13.4861 6.83859 13.8885 6.84593C14.3092 6.84593 14.6698 6.98561 14.9678 7.26667C15.2667 7.54688 15.4165 7.8855 15.4165 8.27915C15.4165 8.6745 15.2667 9.01143 14.9678 9.2891Z"
                fill="#0C7FE9"
              />
            </svg>
          </button>
        </span>
      ),
    },
    {
      Header: "Notification",
      Cell: ({ row }) => (
        <span className="">
          <button
            className="py-1"
            style={{ backgroundColor: "#FEF0BF", borderRadius: "8px" }}
            onClick={() => handleNotify(row._id)}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 26 26"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21.1459 17.0942C20.5242 16.5697 20.0247 15.9157 19.6823 15.178C19.3398 14.4403 19.1627 13.6367 19.1634 12.8233V10.5C19.1634 7.5675 16.9851 5.14 14.1634 4.73333V3.83333C14.1634 3.61232 14.0756 3.40036 13.9193 3.24408C13.763 3.0878 13.5511 3 13.3301 3C13.1091 3 12.8971 3.0878 12.7408 3.24408C12.5845 3.40036 12.4967 3.61232 12.4967 3.83333V4.73333C9.67424 5.14 7.49674 7.5675 7.49674 10.5V12.8233C7.49706 13.6383 7.3191 14.4435 6.97533 15.1824C6.63156 15.9213 6.13032 16.5761 5.50674 17.1008C5.28137 17.2951 5.12074 17.5536 5.04636 17.8417C4.97197 18.1298 4.98739 18.4337 5.09054 18.7128C5.1937 18.9919 5.37966 19.2328 5.62353 19.4033C5.8674 19.5738 6.15753 19.6657 6.45507 19.6667H20.2051C21.0092 19.6667 21.6634 19.0125 21.6634 18.2083C21.6634 17.7817 21.4776 17.3783 21.1459 17.0942ZM13.3301 23C14.0501 22.999 14.7477 22.7498 15.3055 22.2944C15.8632 21.839 16.2468 21.2053 16.3917 20.5H10.2684C10.4133 21.2053 10.797 21.839 11.3547 22.2944C11.9124 22.7498 12.6101 22.999 13.3301 23Z"
                fill="#EFBB00"
              />
            </svg>
          </button>
        </span>
      ),
    },
  ];

  return (
    <>
      <div className="mainCategory">
        <Title name="Users" />
        <div className="row">
          <div className="col-3"></div>
          <div className="col-lg-5 col-md-7 col-8  ms-auto">
            <Searching
              type={`server`}
              data={user}
              setData={setData}
              column={userTable}
              serverSearching={handleFilterData}
            />
          </div>
        </div>
        <div>
          <Table
            data={user}
            mapData={userTable}
            PerPage={rowsPerPage}
            Page={page}
            type={"server"}
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
      {dialogueType == "notification" && <NotificationDialogue />}
    </>
  );
};

export default UserTable;
