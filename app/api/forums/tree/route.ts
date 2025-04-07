import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Category } from "@/models/forums/Category";
import { Subcategory } from "@/models/forums/Subcategory";

export const GET = async () => {
  try {
    await connectToDatabase();

    // Get all non-deleted categories
    const categories = await Category.find({ isDeleted: false }).sort({
      createdAt: 1,
    });

    // Get all non-deleted subcategories
    const subcategories = await Subcategory.find({ isDeleted: false }).sort({
      createdAt: 1,
    });

    // Build tree structure
    const result = categories.map((cat) => {
      const catSubs = subcategories
        .filter((sub) => sub.category?.toString() === cat._id.toString())
        .map((sub) => ({
          id: sub._id,
          name: sub.name,
        }));

      return {
        id: cat._id,
        name: cat.name,
        subcategories: catSubs,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error building category tree:", error);
    return NextResponse.json(
      { error: "Failed to fetch category tree" },
      { status: 500 }
    );
  }
};
