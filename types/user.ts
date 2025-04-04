import { UserRole } from "@/types/roles";

export interface ExtendedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}
