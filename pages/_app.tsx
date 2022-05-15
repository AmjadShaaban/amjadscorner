import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import axios from 'axios';
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import { QueryClient } from 'react-query';
import 'react-tippy/dist/tippy.css';
import '../styles/globals.css';
import { DataAccessContextProvider } from '../utils/data-access.provider';

const axiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider>
      <DataAccessContextProvider {...{ axiosInstance, queryClient }}>
        <Component {...pageProps} />
      </DataAccessContextProvider>
    </SessionProvider>
  );
}

export default MyApp;
