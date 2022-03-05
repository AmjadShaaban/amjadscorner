import { useDataAccess } from '../data-access.provider';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import dbConnect from '../dbConnect';

export const useGetProjects = () => {
  const { axiosInstance } = useDataAccess();

  return useQuery(
    ['projects'],
    async ({ signal }) => {
      const response = await axiosInstance.get('/projects', { signal });

      return response.data;
    },
    {
      initialData: {
        projects: [],
      },
    }
  );
};
