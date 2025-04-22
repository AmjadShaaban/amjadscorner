import { z } from "zod";

export const SubcategorySchema = z.object({
  name: z.string().min(1, { message: "Subcategory name is required" }),
  categoryId: z.string().min(1, { message: "Category ID is required" }),
});

export type SubcategoryInput = z.infer<typeof SubcategorySchema>;
