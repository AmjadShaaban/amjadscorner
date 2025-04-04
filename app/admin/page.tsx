"use client";
import RoleGuard from "@/components/auth/RoleGuard";
import Link from "next/link";
import { UserRole } from "../../types/roles";

export default function AdminDashboardPage() {
  return (
    <RoleGuard role={UserRole.ADMIN}>
      <div className="max-w-4xl mx-auto mt-8 p-4">
        <h1 className="text-3xl font-bold mb-6 text-white">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/admin/forums">
            <div className="p-6 bg-gray-700 rounded-lg hover:bg-gray-600 transition">
              <h2 className="text-xl font-semibold text-white">
                Manage Forums
              </h2>
              <p className="text-gray-300 mt-2">
                Administer forum categories, subcategories, and posts.
              </p>
            </div>
          </Link>

          <Link href="/admin/shop">
            <div className="p-6 bg-gray-700 rounded-lg hover:bg-gray-600 transition">
              <h2 className="text-xl font-semibold text-white">Manage Shop</h2>
              <p className="text-gray-300 mt-2">
                Administer shop categories and items.
              </p>
            </div>
          </Link>

          <Link href="/admin/users">
            <div className="p-6 bg-gray-700 rounded-lg hover:bg-gray-600 transition">
              <h2 className="text-xl font-semibold text-white">Manage Users</h2>
              <p className="text-gray-300 mt-2">Administer users.</p>
            </div>
          </Link>
        </div>
      </div>
    </RoleGuard>
  );
}
