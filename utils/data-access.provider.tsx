import { createContext } from '../utils/create-context';
import { AxiosInstance } from 'axios';

import { FC } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

interface DataAccessContext {
  axiosInstance: AxiosInstance;
}

interface DataAccessProviderProps {
  queryClient: QueryClient;
  axiosInstance: AxiosInstance;
}

export const [useDataAccess, DataAccessContext] =
  createContext<DataAccessContext>();

export const DataAccessContextProvider: FC<DataAccessProviderProps> = ({
  queryClient,
  axiosInstance,
  children,
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <DataAccessContext.Provider value={{ axiosInstance }}>
        {children}
      </DataAccessContext.Provider>
    </QueryClientProvider>
  );
};
