"use client";
import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/state";
import { UserRole } from "@/types/roles";

type RoleGuardProps = {
  role: UserRole | UserRole[];
  children: ReactNode;
  redirectTo?: string;
};

const RoleGuard = ({
  role,
  children,
  redirectTo = "/unauthorized",
}: RoleGuardProps) => {
  const { user } = useAuthStore();
  const router = useRouter();

  const allowedRoles = Array.isArray(role) ? role : [role];
  const isAuthorized = user && allowedRoles.includes(user.role);

  useEffect(() => {
    if (user && !isAuthorized) {
      router.push(redirectTo);
    }
  }, [user, isAuthorized, router, redirectTo]);

  if (!user || !isAuthorized) return null;

  return <>{children}</>;
};

export default RoleGuard;
