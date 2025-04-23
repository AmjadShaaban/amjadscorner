import { requireRole } from "@/lib/auth/requireRole";
import { connectToDatabase } from "@/lib/db";
import { ThreadSchema } from "@/lib/validators/forums/thread";
import { Thread } from "@/models/forums/Thread";
import { UserRole } from "@/types/roles";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ subcategoryId: string }> }
) => {
  const user = await requireRole([UserRole.ADMIN], { returnJson: true });
  if (user instanceof NextResponse) return user;
  const { subcategoryId } = await params;

  try {
    await connectToDatabase();

    const threads = await Thread.find({
      subcategory: subcategoryId,
    })
      .sort({ createdAt: -1 })
      .populate("createdBy", "firstName lastName")
      .populate("updatedBy", "firstName lastName");

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
  { params }: { params: Promise<{ subcategoryId: string }> }
) => {
  const user = await requireRole([UserRole.ADMIN], { returnJson: true });
  if (user instanceof NextResponse) return user;
  const { subcategoryId } = await params;
  const data = await req.json();
  const parsed = ThreadSchema.parse(data);

  try {
    await connectToDatabase();

    const thread = new Thread({
      ...parsed,
      subcategory: new mongoose.Types.ObjectId(subcategoryId),
      createdBy: new mongoose.Types.ObjectId(user.id),
    });

    await thread.save();
    return NextResponse.json(thread.toJSON(), { status: 201 });
  } catch (error) {
    console.error("Error creating thread:", error);
    return NextResponse.json(
      { error: "Failed to create thread" },
      { status: 500 }
    );
  }
};
