import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireRole } from "@/lib/auth/requireRole";
import { connectToDatabase } from "@/lib/db";
import { SubcategorySchema } from "@/lib/validators/forums/subcategory";
import { Subcategory } from "@/models/forums/Subcategory";
import { UserRole } from "@/types/roles";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) => {
  const user = await requireRole([UserRole.ADMIN], { returnJson: true });
  if (user instanceof NextResponse) return user;
  const { categoryId } = await params;

  try {
    await connectToDatabase();

    const subcategories = await Subcategory.find({ category: categoryId })
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

export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) => {
  const user = await requireRole([UserRole.ADMIN], { returnJson: true });
  if (user instanceof NextResponse) return user;
  const { categoryId } = await params;
  const data = await req.json();
  const parsed = SubcategorySchema.parse({
    name: data.name,
    categoryId,
  });

  try {
    await connectToDatabase();

    const subcategory = new Subcategory({
      name: parsed.name,
      category: new mongoose.Types.ObjectId(parsed.categoryId),
      createdBy: new mongoose.Types.ObjectId(user.id),
    });

    await subcategory.save();
    return NextResponse.json(subcategory, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Subcategory creation error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
