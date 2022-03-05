import { AxiosError } from 'axios';

export const isAxiosError = (e: unknown): e is AxiosError => {
  return (e as AxiosError).isAxiosError;
};
