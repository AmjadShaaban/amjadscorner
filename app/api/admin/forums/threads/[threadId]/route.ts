import { requireRole } from "@/lib/auth/requireRole";
import { connectToDatabase } from "@/lib/db";
import { Thread, ThreadSchema } from "@/models/forums/Thread";
import { UserRole } from "@/types/roles";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export const PUT = async (
  req: NextRequest,
  { params }: { params: { threadId: string } }
) => {
  const user = await requireRole([UserRole.ADMIN], { returnJson: true });
  if (user instanceof NextResponse) return user;

  try {
    const { searchParams } = new URL(req.url);
    const restore = searchParams.get("restore") === "true";

    const data = await req.json();
    const parsed = ThreadSchema.pick({
      title: true,
      content: true,
    }).parse(data);

    await connectToDatabase();

    const thread = await Thread.findById(params.threadId);
    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    thread.title = parsed.title;
    thread.content = parsed.content;
    thread.updatedBy = new mongoose.Types.ObjectId(user.id);

    if (restore) {
      thread.isDeleted = false;
      thread.deletedAt = null;
      thread.deletedBy = null;
    }

    await thread.save();
    return NextResponse.json(thread.toJSON());
  } catch (error) {
    console.error("Thread update error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export const DELETE = async (
  _req: NextRequest,
  { params }: { params: { threadId: string } }
) => {
  const user = await requireRole([UserRole.ADMIN], { returnJson: true });
  if (user instanceof NextResponse) return user;

  try {
    await connectToDatabase();

    const thread = await Thread.findById(params.threadId);
    if (!thread || thread.isDeleted) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    thread.isDeleted = true;
    thread.deletedAt = new Date();
    thread.deletedBy = new mongoose.Types.ObjectId(user.id);

    await thread.save();
    return NextResponse.json({ message: "Thread deleted" });
  } catch (error) {
    console.error("Thread delete error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
