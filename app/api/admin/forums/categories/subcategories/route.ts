import { requireRole } from "@/lib/auth/requireRole";
import { connectToDatabase } from "@/lib/db";
import { Subcategory } from "@/models/forums/Subcategory";
import { UserRole } from "@/types/roles";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const user = await requireRole([UserRole.ADMIN], { returnJson: true });
  if (user instanceof NextResponse) return user;

  try {
    await connectToDatabase();

    const subcategories = await Subcategory.find()
      .sort({ createdAt: 1 })
      .populate("createdBy", "firstName _id")
      .populate("updatedBy", "firstName _id")
      .populate("deletedBy", "firstName _id");

    return NextResponse.json(subcategories);
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
