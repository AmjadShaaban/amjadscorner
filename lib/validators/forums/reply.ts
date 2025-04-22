import { z } from "zod";

export const ReplySchema = z.object({
  content: z.string().min(1, { message: "Reply content is required" }),
  thread: z.string().min(1, { message: "Thread ID is required" }),
  quotedReply: z.string().optional(),
  quotedThread: z.string().optional(),
});

export type ReplyInput = z.infer<typeof ReplySchema>;
