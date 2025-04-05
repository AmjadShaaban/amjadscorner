import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireRole } from "@/lib/auth/requireRole";
import { UserRole } from "@/types/roles";
import { Subcategory } from "@/models/forums/Subcategory";

export const GET = async (req: NextRequest) => {
  const user = await requireRole([UserRole.ADMIN], { returnJson: true });
  if (user instanceof NextResponse) return user;

  try {
    await connectToDatabase();

    const subcategories = await Subcategory.find()
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json(subcategories);
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
