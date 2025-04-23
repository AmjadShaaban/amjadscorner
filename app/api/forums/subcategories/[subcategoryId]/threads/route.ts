import { auth } from "@/lib/auth/auth";
import { connectToDatabase } from "@/lib/db";
import { ThreadSchema } from "@/lib/validators/forums/thread";
import { Thread } from "@/models/forums/Thread";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ subcategoryId: string }> }
) => {
  try {
    const { subcategoryId } = await params;
    await connectToDatabase();

    const threads = await Thread.find({
      subcategory: subcategoryId,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .populate("author", "id firstName lastName");

    return NextResponse.json(threads);
  } catch (error) {
    console.error("Error fetching threads:", error);
    return NextResponse.json(
      { error: "Failed to load threads" },
      { status: 500 }
    );
  }
};

const CreateThreadSchema = ThreadSchema.pick({
  title: true,
  content: true,
});

export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ subcategoryId: string }> }
) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { subcategoryId } = await params;

  try {
    const { title, content } = await req.json();
    CreateThreadSchema.parse({ title, content });

    await connectToDatabase();

    const newThread = new Thread({
      title,
      content,
      subcategory: new mongoose.Types.ObjectId(subcategoryId),
      author: new mongoose.Types.ObjectId(session.user.id),
      createdBy: new mongoose.Types.ObjectId(session.user.id),
    });

    await newThread.save();

    return NextResponse.json(newThread, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Error creating thread:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
