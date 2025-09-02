"use client";
import { Providers } from "@/Provider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../assets/scss/custom/custom.css";
import "../assets/scss/default/default.css";
import "../assets/scss/style/style.css";
import "../assets/scss/dateRange.css";
import axios from "axios";
import { baseURL, key } from "@/utils/config";
import AuthCheck from "./AuthCheck";
import Loader from "@/utils/Loader";
import { store } from "@/store/store";
import { useEffect } from "react";
import { useRouter } from "next/router";


export default function App({ Component, pageProps }) {

  const router = useRouter();

  const getToken =
    typeof window !== "undefined" && sessionStorage.getItem("token");
  const getLayout = Component.getLayout || ((page) => page);
  axios.defaults.baseURL = baseURL;
  axios.defaults.headers.common["key"] = key;
  axios.defaults.headers.common["Authorization"] = getToken
    ? `${getToken}`
    : "";

useEffect(() => {
  if (getToken && router.pathname === "/") {
    router.replace("/dashboard");
  }
}, [getToken, router.pathname]);


  return getLayout(
    <Providers>
      <AuthCheck>
        <ToastContainer />
        <Component {...pageProps} />
        <Loader />
      </AuthCheck>
    </Providers>
  );
}
