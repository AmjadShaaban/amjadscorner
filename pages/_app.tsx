import '../styles/globals.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import type { AppProps } from 'next/app';
import { DataAccessContextProvider } from '../utils/data-access.provider';
import { SessionProvider } from 'next-auth/react';
import { QueryClient } from 'react-query';
import axios from 'axios';

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
