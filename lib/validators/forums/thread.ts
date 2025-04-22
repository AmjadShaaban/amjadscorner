import { z } from "zod";

export const ThreadSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  content: z.string().min(1, { message: "Content is required" }),
  subcategory: z.string().min(1, { message: "Subcategory ID is required" }),
});

export type ThreadInput = z.infer<typeof ThreadSchema>;
