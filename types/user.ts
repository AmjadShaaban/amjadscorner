import { UserRole } from "@/types/roles";

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
}
