"use client";
import { useAuthStore } from "@/lib/state";
// TODO role-based system
// Hardcoded admin email (replace with your email or a role-based system)
const ADMIN_EMAIL = "test@test.com";

export default function UsersAdminPage() {
  const { user } = useAuthStore();

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <p className="text-white max-w-3xl mx-auto mt-8">
        Access denied. Admins only.
      </p>
    );
  }

  return <>Users Admin Page</>;
}
