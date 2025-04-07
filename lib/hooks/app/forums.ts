import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

type Subcategory = {
  id: string;
  name: string;
};

type CategoryTree = {
  id: string;
  name: string;
  subcategories: Subcategory[];
};
type Thread = {
  id: string;
  title: string;
  author: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt?: string;
  replyCount?: number;
};

export const useThreadReplies = (threadId: string) =>
  useQuery({
    queryKey: ["replies", threadId],
    queryFn: async () => {
      const res = await axios.get(`/api/forums/threads/${threadId}/replies`);
      return res.data;
    },
    enabled: !!threadId,
  });

export const usePostReply = (threadId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      content: string;
      quotedReplyId?: string;
    }) => {
      const res = await axios.post(
        `/api/forums/threads/${threadId}/replies`,
        payload
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["replies", threadId] });
    },
  });
};

export function useSubcategoryThreads(subcategoryId: string | null) {
  return useQuery<Thread[]>({
    queryKey: ["forums", "threads", subcategoryId],
    enabled: !!subcategoryId,
    queryFn: async () => {
      const res = await axios.get(
        `/api/forums/subcategories/${subcategoryId}/threads`
      );
      return res.data;
    },
  });
}

export function useCategoryTree() {
  return useQuery<CategoryTree[]>({
    queryKey: ["forums", "categoryTree"],
    queryFn: async () => {
      const res = await axios.get("/api/forums/tree");
      return res.data;
    },
  });
}
