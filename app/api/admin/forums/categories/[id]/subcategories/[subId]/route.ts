import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";

import { connectToDatabase } from "@/lib/db";
import { requireRole } from "@/lib/auth/requireRole";
import { UserRole } from "@/types/roles";
import { Subcategory } from "@/models/forums/Subcategory";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; subId: string } }
) {
  const user = await requireRole([UserRole.ADMIN], { returnJson: true });
  if (user instanceof NextResponse) return user;

  try {
    const { name } = await req.json();
    z.string().min(1).parse(name);

    await connectToDatabase();

    const subcategory = await Subcategory.findOne({
      _id: params.subId,
      category: params.id,
      isDeleted: false,
    });

    if (!subcategory) {
      return NextResponse.json(
        { error: "Subcategory not found" },
        { status: 404 }
      );
    }

    subcategory.name = name;
    subcategory.updatedBy = new mongoose.Types.ObjectId(user.id);
    await subcategory.save();

    return NextResponse.json(subcategory);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Subcategory update error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; subId: string } }
) {
  const user = await requireRole([UserRole.ADMIN], { returnJson: true });
  if (user instanceof NextResponse) return user;

  try {
    await connectToDatabase();

    const subcategory = await Subcategory.findOne({
      _id: params.subId,
      category: params.id,
      isDeleted: false,
    });

    if (!subcategory) {
      return NextResponse.json(
        { error: "Subcategory not found" },
        { status: 404 }
      );
    }

    subcategory.isDeleted = true;
    subcategory.deletedAt = new Date();
    subcategory.deletedBy = new mongoose.Types.ObjectId(user.id);
    await subcategory.save();

    return NextResponse.json({ message: "Subcategory deleted" });
  } catch (error) {
    console.error("Subcategory deletion error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
