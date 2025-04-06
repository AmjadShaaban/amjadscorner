import { requireRole } from "@/lib/auth/requireRole";
import { connectToDatabase } from "@/lib/db";
import { Category, CategorySchema } from "@/models/forums/Category";
import { UserRole } from "@/types/roles";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const GET = async () => {
  const user = await requireRole([UserRole.ADMIN], { returnJson: true });
  if (user instanceof NextResponse) return user;

  try {
    await connectToDatabase();

    const categories = await Category.find()
      .sort({
        createdAt: 1,
      })
      .populate("createdBy", "firstName _id")
      .populate("updatedBy", "firstName _id")
      .populate("deletedBy", "firstName _id");

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export const POST = async (req: NextRequest) => {
  const user = await requireRole([UserRole.ADMIN], { returnJson: true });
  if (user instanceof NextResponse) return;

  const data = await req.json();
  const parsed = CategorySchema.parse({
    name: data.name,
  });
  try {
    await connectToDatabase();

    const category = new Category({
      name: parsed.name,
      createdBy: user.id,
    });
    await category.save();

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Category creation error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
