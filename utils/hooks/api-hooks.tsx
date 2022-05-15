import { useDataAccess } from '../data-access.provider';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  PostMessageDto,
  PostProjectDto,
  PostSignUpDto,
  PostTodoDto,
  PostTodoListDto,
} from '../../interfaces/lib/dtos';
import {
  MessagesResponse,
  ProjectResponse,
  ProjectsResponse,
  TodoListsResponse,
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
    async (msgId: string) => {
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

export const usePostTodoList = () => {
  const queryClient = useQueryClient();
  const { axiosInstance } = useDataAccess();

  return useMutation(
    async (dto: PostTodoListDto) => {
      const response = await axiosInstance.post('/user/todo/lists', dto);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['todoLists']);
      },
    }
  );
};

export const useGetTodoLists = () => {
  const { axiosInstance } = useDataAccess();
  return useQuery(
    ['todoLists'],
    async ({ signal }) => {
      const response = await axiosInstance.get<TodoListsResponse>(
        '/user/todo/lists',
        { signal }
      );

      return response.data;
    },
    {
      initialData: {
        todoLists: [],
      },
    }
  );
};

export const usePostTodo = () => {
  const queryClient = useQueryClient();
  const { axiosInstance } = useDataAccess();

  return useMutation(
    async (dto: PostTodoDto) => {
      const response = await axiosInstance.post(
        `/user/todo/list/${dto.listId}/`,
        dto
      );
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['todoLists']);
      },
    }
  );
};

export const useDeleteTodo = () => {
  const queryClient = useQueryClient();
  const { axiosInstance } = useDataAccess();

  return useMutation(
    async (itemId: string) => {
      const response = await axiosInstance.delete(`/user/todo/item/${itemId}`);
      return response.data;
    },
    {
      onSuccess: () => queryClient.invalidateQueries(['todoLists']),
    }
  );
};

export const useDeleteTodoList = () => {
  const queryClient = useQueryClient();
  const { axiosInstance } = useDataAccess();

  return useMutation(
    async (listId: string) => {
      const response = await axiosInstance.delete(`/user/todo/list/${listId}`);
      return response.data;
    },
    {
      onSuccess: () => queryClient.invalidateQueries(['todoLists']),
    }
  );
};

export const usePatchTodo = () => {
  const queryClient = useQueryClient();
  const { axiosInstance } = useDataAccess();

  return useMutation(
    async (itemId: string) => {
      const response = await axiosInstance.patch(`/user/todo/item/${itemId}`);
      return response.data;
    },
    {
      onSuccess: () => queryClient.invalidateQueries(['todoLists']),
    }
  );
};
