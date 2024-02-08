import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import axios from "axios";
import type { AppProps } from "next/app";
import { QueryClient } from "react-query";
import "react-tippy/dist/tippy.css";
import "../styles/globals.css";
import { DataAccessContextProvider } from "../utils/data-access.provider";

const axiosInstance = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});
const alertOptions = {
  timeout: 5000,
  offset: "30px",
};

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <DataAccessContextProvider {...{ axiosInstance, queryClient }}>
      <Component {...pageProps} />
    </DataAccessContextProvider>
  );
}

export default MyApp;
