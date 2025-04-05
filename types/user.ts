import { UserRole } from "@/types/roles";

export type AuthUser = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
};
