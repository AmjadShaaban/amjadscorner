import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { requireRole } from "@/lib/auth/requireRole";
import { UserRole } from "@/types/roles";
import { Category } from "@/models/forums/Category";
import mongoose from "mongoose";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireRole([UserRole.ADMIN], { returnJson: true });
  if (user instanceof NextResponse) return;

  try {
    const { name } = await req.json();
    const nameSchema = z.string().min(1, "Name is required");
    nameSchema.parse(name);

    await connectToDatabase();

    const category = await Category.findById(params.id);

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    category.name = name;
    category.updatedBy = new mongoose.Types.ObjectId(user.id);
    await category.save();

    return NextResponse.json(category);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Category update error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireRole([UserRole.ADMIN], { returnJson: true });
  if (user instanceof NextResponse) return;

  try {
    await connectToDatabase();

    const category = await Category.findById(params.id);
    if (!category || category.isDeleted) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    category.deletedBy = new mongoose.Types.ObjectId(user.id);
    category.deletedAt = new Date();
    category.isDeleted = true;
    await category.save();

    return NextResponse.json({ message: "Category deleted" });
  } catch (error) {
    console.error("Category delete error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
