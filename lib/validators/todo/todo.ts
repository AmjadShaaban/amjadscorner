import { z } from "zod";

export const TodoSchema = z.object({
  userId: z.string().min(1, { message: "User ID is required" }),
  title: z.string().min(1, { message: "Title must be atleast 1 character" }),
  completed: z.boolean().default(false),
});

export type TodoInput = z.infer<typeof TodoSchema>;
