import React, { useEffect, useState } from "react";
import { Select } from "./Input";

const Pagination = (props: any) => {
  const [pages, setPages] = useState([]);
  const {
    type,
    serverPage,
    setServerPage,
    serverPerPage,
    onPageChange,
    onRowsPerPageChange,
    totalData,
  } = props;

  const onPageChangeClient = (serverPage: any) => {
    setServerPage(serverPage);
  };

  useEffect(() => {
    const totalPages = Math.ceil(totalData / serverPerPage + 1);
    const range = Math.min(3, totalPages);
    const start = Math.max(1, serverPage - Math.floor(range / 2));
    const end = Math.min(start + range, totalPages);

    const pageNumbers: any = Array.from(
      { length: end - start },
      (_, i) => start + i
    );
    setPages(pageNumbers);
  }, [serverPage, totalData, serverPerPage]);

  const totalCount = Math.min((serverPage + 1) * serverPerPage, totalData);

  // back button
  const handleBackButtonClick = (event: any) => {
    onPageChange(event, serverPage - 1);
  };

  //next page button
  const handleNextButtonClick = (event: any) => {
    onPageChange(event, serverPage + 1);
  };

  const option = [5, 10, 25, 50, 100, 200];

  return (
    <div className="pagination">
      <>
        {totalData > 0 && (
          <div className="client-pagination betBox w-100">
            <div className="tableRang midBox">
              <Select
                id={`pagination`}
                option={option}
                defaultValue={serverPerPage}
                label={`Show `}
                onChange={onRowsPerPageChange}
                className={`midBox paginationSelect`}
                btnClass={`mt-0`}
                angle={true}
              />
              <p className="count">
                {`${serverPage * serverPerPage + 1
                  } - ${totalCount} of ${totalData}`}
              </p>
            </div>

            <div className="tableAccess ">
              <div className="d-flex m15-left mainPaginatinBtn">
                <button
                  className={`paginationBtn ${serverPage === 0 && "pageBtnDisable"
                    }`}
                  disabled={serverPage == 0}
                  style={{ backgroundColor: "#fff" }}
                  onClick={() => onPageChangeClient(0)}
                >
                  <i
                    className="ri-arrow-left-double-fill"
                    style={{ fontSize: "29px" }}
                  ></i>
                </button>

                <button
                  className={`paginationBtn ${serverPage === 0 && "pageBtnDisable"
                    }`}
                  disabled={serverPage == 0}
                  style={{ backgroundColor: "#fff" }}
                  onClick={(e: any) => handleBackButtonClick(e)}
                >
                  <i
                    className="ri-arrow-left-s-line"
                    style={{ fontSize: "29px" }}
                  ></i>
                </button>

                {pages.map((serverPages) => {
                  return (
                    <button
                      key={serverPages}
                      onClick={() => onPageChangeClient(serverPages - 1)}
                      className={`paginationBtn paginationNumber ${serverPage + 1 === serverPages ? "active" : "active-btn"
                        }`}
                    >
                      {serverPages}
                    </button>
                  );
                })}
                <button
                  className={`paginationBtn ${serverPage === Math.ceil(totalData / serverPerPage) - 1 &&
                    "pageBtnDisable"
                    }`}
                  disabled={
                    serverPage === Math.ceil(totalData / serverPerPage) - 1
                  }
                  style={{ backgroundColor: "#fff" }}
                  onClick={(e: any) => handleNextButtonClick(e)}
                >
                  <i
                    className="ri-arrow-right-s-line"
                    style={{ fontSize: "29px" }}
                  ></i>
                </button>

                <button
                  className={`paginationBtn ${serverPage === Math.ceil(totalData / serverPerPage) - 1 &&
                    "pageBtnDisable"
                    }`}
                  disabled={
                    serverPage === Math.ceil(totalData / serverPerPage) - 1
                  }
                  style={{ backgroundColor: "#fff" }}
                  onClick={() =>
                    onPageChangeClient(Math.ceil(totalData / serverPerPage) - 1)
                  }
                >
                  <i
                    className="ri-arrow-right-double-line"
                    style={{ fontSize: "29px" }}
                  ></i>
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    </div>
  );
};

export default Pagination;
