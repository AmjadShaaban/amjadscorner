import { auth } from "@/lib/auth/auth";
import { UserRole } from "@/types/roles";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export async function requireRole(
  allowedRoles: UserRole[],
  options?: { returnJson?: boolean }
) {
  const session = await auth();

  const user = session?.user;

  const isAuthorized = user && allowedRoles.includes(user.role);

  if (!isAuthorized) {
    if (options?.returnJson) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    } else {
      return redirect("/unauthorized");
    }
  }

  return user;
}
