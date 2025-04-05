import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const useCategories = () =>
  useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await axios.get("/api/admin/forums/categories")).data,
  });

export const useSubcategories = () =>
  useQuery({
    queryKey: ["subcategories"],
    queryFn: async () =>
      (await axios.get("/api/admin/forums/categories/subcategories")).data,
  });

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) =>
      axios.post("/api/admin/forums/categories", data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useCreateSubcategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, categoryId }: { name: string; categoryId: string }) =>
      axios
        .post(`/api/admin/forums/categories/${categoryId}/subcategories`, {
          name,
        })
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
    },
  });
};

export const useEditCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      name,
      restore = false,
    }: {
      id: string;
      name: string;
      restore?: boolean;
    }) =>
      axios
        .put(`/api/admin/forums/categories/${id}?restore=${restore}`, { name })
        .then((res) => res.data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      axios.delete(`/api/admin/forums/categories/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });
};

export const useEditSubcategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      categoryId,
      subcategoryId,
      name,
      restore = false,
    }: {
      categoryId: string;
      subcategoryId: string;
      name: string;
      restore?: boolean;
    }) =>
      axios
        .put(
          `/api/admin/forums/categories/${categoryId}/subcategories/${subcategoryId}?restore=${restore}`,
          { name }
        )
        .then((res) => res.data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["subcategories"] }),
  });
};

export const useDeleteSubcategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      categoryId,
      subcategoryId,
    }: {
      categoryId: string;
      subcategoryId: string;
    }) =>
      axios.delete(
        `/api/admin/forums/categories/${categoryId}/subcategories/${subcategoryId}`
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["subcategories"] }),
  });
};
