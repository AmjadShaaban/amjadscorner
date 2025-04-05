import { DefaultSession } from "next-auth";
import { UserRole } from "@/types/roles";

declare module "next-auth" {
  type Session = {
    user: {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      role: UserRole;
    } & DefaultSession["user"];
  };

  type User = {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: UserRole;
  };
}
