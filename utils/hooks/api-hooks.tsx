import { useDataAccess } from '../data-access.provider';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  PostMessageDto,
  PostProjectDto,
  PostSignUpDto,
} from '../../interfaces/lib/dtos';
import {
  MessagesResponse,
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

export const useGetMessages = () => {
  const { axiosInstance } = useDataAccess();

  return useQuery(
    ['messages'],
    async ({ signal }) => {
      const response = await axiosInstance.get<MessagesResponse>('/contact', {
        signal,
      });

      return response.data;
    },
    {
      initialData: {
        messages: [],
      },
    }
  );
};

export const usePostMessage = () => {
  const queryClient = useQueryClient();
  const { axiosInstance } = useDataAccess();

  return useMutation(
    async (dto: PostMessageDto) => {
      const response = await axiosInstance.post('/contact', dto);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['messages']);
      },
    }
  );
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();
  const { axiosInstance } = useDataAccess();

  return useMutation(
    async (msgId: string | undefined) => {
      const response = await axiosInstance.delete(`/message/${msgId}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['messages']);
      },
    }
  );
};

export const usePostSignUp = () => {
  const { axiosInstance } = useDataAccess();

  return useMutation(async (dto: PostSignUpDto) => {
    const response = await axiosInstance.post('/auth/signup', dto);
    return response.data;
  });
};
