import { UserRole } from "@/types/roles";
import { z } from "zod";

export const UserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  handle: z.string().min(4),
  _handle: z.string().min(4),
  role: z.nativeEnum(UserRole).default(UserRole.USER),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  verifiedEmail: z.boolean().default(false),
  isDeleted: z.boolean().default(false),
  banned: z.boolean().default(false),
  reasonBanned: z.string().optional(),
  deletedAt: z.date().optional(),
  deletedBy: z.string().optional(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
});

export const HandleCheckSchema = z.object({
  handle: z
    .string()
    .min(4, "Handle must be at least 4 characters")
    .max(30)
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Handle can only contain letters, numbers, and underscores"
    ),
});

export type UserInput = z.infer<typeof UserSchema>;

export type HandleInput = z.infer<typeof HandleCheckSchema>;
