import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/requireRole";
import { UserRole } from "@/types/roles";

export async function GET() {
  await requireRole([UserRole.ADMIN]);

  return NextResponse.json("admin users route");
}
