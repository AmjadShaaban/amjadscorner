import { connectToDatabase } from "@/lib/db";
import { Subcategory } from "@/models/forums/Subcategory";
import { NextResponse } from "next/server";

export const GET = async (
  _req: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) => {
  const { categoryId } = await params;

  try {
    await connectToDatabase();
    const subcategories = await Subcategory.find({
      category: categoryId,
      isDeleted: false,
    }).sort({ createdAt: 1 });

    return NextResponse.json(subcategories);
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return NextResponse.json(
      { error: "Failed to load subcategories" },
      { status: 500 }
    );
  }
};
