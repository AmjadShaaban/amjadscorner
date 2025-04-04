import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";

import { connectToDatabase } from "@/lib/db";
import { requireRole } from "@/lib/auth/requireRole";
import { UserRole } from "@/types/roles";
import { Category } from "@/models/forums/Category";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const user = await requireRole([UserRole.ADMIN], { returnJson: true });
  if (user instanceof NextResponse) return user;

  try {
    const { searchParams } = new URL(req.url);
    const restore = searchParams.get("restore") === "true";

    const { name } = await req.json();
    z.string().min(1).parse(name);

    await connectToDatabase();

    const category = await Category.findOne({ _id: params.id });
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
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const user = await requireRole([UserRole.ADMIN], { returnJson: true });
  if (user instanceof NextResponse) return user;

  try {
    await connectToDatabase();

    const category = await Category.findOne({
      _id: params.id,
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
}
