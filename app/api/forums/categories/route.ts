import { connectToDatabase } from "@/lib/db";
import { Category } from "@/models/forums/Category";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    await connectToDatabase();
    const categories = await Category.find({ isDeleted: false }).sort({
      createdAt: 1,
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to load categories" },
      { status: 500 }
    );
  }
};
