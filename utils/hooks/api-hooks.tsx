import { useDataAccess } from '../data-access.provider';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { PostProjectDto } from '../../interfaces/lib/dtos';
import {
  ProjectResponse,
  ProjectsResponse,
} from '../../interfaces/lib/responses';

export const useGetProjects = () => {
  const { axiosInstance } = useDataAccess();

  return useQuery(
    ['projects'],
    async ({ signal }) => {
      const response = await axiosInstance.get<ProjectsResponse>('/projects', {
        signal,
      });

      return response.data;
    },
    {
      initialData: {
        projects: [],
      },
    }
  );
};

export const usePostProject = () => {
  const queryClient = useQueryClient();
  const { axiosInstance } = useDataAccess();

  return useMutation(
    async (dto: PostProjectDto) => {
      const response = await axiosInstance.post<ProjectResponse>(
        '/projects',
        dto
      );
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['projects']);
      },
    }
  );
};
