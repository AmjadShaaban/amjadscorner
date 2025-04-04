import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";

import { connectToDatabase } from "@/lib/db";
import { requireRole } from "@/lib/auth/requireRole";
import { UserRole } from "@/types/roles";
import { Subcategory, SubcategorySchema } from "@/models/forums/Subcategory";
// TODO fix me i hate any types
export async function GET(req: NextRequest, context: any) {
  try {
    await connectToDatabase();
    const { id: categoryId } = context.params;

    const subcategories = await Subcategory.find({
      category: categoryId,
      isDeleted: false,
    }).sort({ createdAt: 1 });

    return NextResponse.json(subcategories);
  } catch (error) {
    console.error("Subcategory fetch error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireRole([UserRole.ADMIN], { returnJson: true });
  if (user instanceof NextResponse) return user;

  try {
    const data = await req.json();
    const parsed = SubcategorySchema.parse({
      name: data.name,
      categoryId: params.id,
    });

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
}
