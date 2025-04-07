import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireRole } from "@/lib/auth/requireRole";
import { connectToDatabase } from "@/lib/db";
import { Category } from "@/models/forums/Category";
import { UserRole } from "@/types/roles";

export const PUT = async (
  req: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) => {
  const user = await requireRole([UserRole.ADMIN], { returnJson: true });
  if (user instanceof NextResponse) return user;
  const { categoryId } = await params;
  const { searchParams } = new URL(req.url);
  const restore = searchParams.get("restore") === "true";
  const { name } = await req.json();
  z.string().min(1).parse(name);

  try {
    await connectToDatabase();

    const category = await Category.findOne({ _id: categoryId });
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    category.name = name;
    category.updatedBy = new mongoose.Types.ObjectId(user.id);

    if (restore) {
      category.isDeleted = false;
      category.deletedAt = null;
      category.deletedBy = null;
    }

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
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) => {
  const user = await requireRole([UserRole.ADMIN], { returnJson: true });
  if (user instanceof NextResponse) return user;
  const { categoryId } = await params;

  try {
    await connectToDatabase();

    const category = await Category.findOne({
      _id: categoryId,
      isDeleted: false,
    });
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    category.isDeleted = true;
    category.deletedAt = new Date();
    category.deletedBy = new mongoose.Types.ObjectId(user.id);
    await category.save();

    return NextResponse.json({ message: "Category deleted" });
  } catch (error) {
    console.error("Category deletion error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
