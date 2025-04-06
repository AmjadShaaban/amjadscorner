import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";

import { connectToDatabase } from "@/lib/db";
import { auth } from "@/lib/auth/auth";
import { Thread, ThreadSchema } from "@/models/forums/Thread";

export const GET = async (
  _req: NextRequest,
  context: { params: Promise<{ categoryId: string; subcategoryId: string }> }
) => {
  const { categoryId, subcategoryId } = await context.params;
  try {
    await connectToDatabase();

    const threads = await Thread.find({
      category: categoryId,
      subcategory: subcategoryId,
      isDeleted: false,
    })
      .populate("createdBy", "name id")
      .sort({ createdAt: -1 });

    return NextResponse.json(threads);
  } catch (error) {
    console.error("Error fetching threads:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export const POST = async (
  req: NextRequest,
  context: { params: Promise<{ categoryId: string; subcategoryId: string }> }
) => {
  const { categoryId, subcategoryId } = await context.params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const data = await req.json();

    // Validate thread content
    const parsed = ThreadSchema.parse(data);

    const thread = new Thread({
      ...parsed,
      category: new mongoose.Types.ObjectId(categoryId),
      subcategory: new mongoose.Types.ObjectId(subcategoryId),
      createdBy: new mongoose.Types.ObjectId(session.user.id),
    });

    await thread.save();

    return NextResponse.json(thread, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Thread creation error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
