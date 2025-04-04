import { connectToDatabase } from "@/lib/db";
import { Category } from "@/models/forums/Category";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();
    const categories = await Category.find({ isDeleted: false }).sort({
      createdAt: 1,
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
