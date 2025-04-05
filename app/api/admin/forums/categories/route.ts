import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { requireRole } from "@/lib/auth/requireRole";
import { UserRole } from "@/types/roles";
import { Category, CategorySchema } from "@/models/forums/Category";

export async function GET() {
  const user = await requireRole([UserRole.ADMIN], { returnJson: true });
  if (user instanceof NextResponse) return user;

  try {
    await connectToDatabase();
    const categories = await Category.find().sort({
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

export async function POST(req: NextRequest) {
  const user = await requireRole([UserRole.ADMIN], { returnJson: true });
  if (user instanceof NextResponse) return;

  try {
    const data = await req.json();
    const parsed = CategorySchema.parse({
      name: data.name,
    });

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
}
