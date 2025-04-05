import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/requireRole";
import { UserRole } from "@/types/roles";

export const GET = async () => {
  await requireRole([UserRole.ADMIN]);

  return NextResponse.json("admin users route");
};
