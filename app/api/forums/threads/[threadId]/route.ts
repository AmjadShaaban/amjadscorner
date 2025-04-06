import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth/auth";
import { connectToDatabase } from "@/lib/db";
import { Thread, ThreadSchema } from "@/models/forums/Thread";
import { UserRole } from "@/types/roles";

export const GET = async (
  _req: NextRequest,
  context: { params: Promise<{ threadId: string }> }
) => {
  const { threadId } = await context.params;

  try {
    await connectToDatabase();

    const thread = await Thread.findById(threadId)
      .populate("createdBy", "name id")
      .populate("updatedBy", "name id")
      .lean();

    if (!thread || thread.isDeleted) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    return NextResponse.json(thread);
  } catch (error) {
    console.error("Error fetching thread:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export const PUT = async (
  req: NextRequest,
  context: { params: Promise<{ threadId: string }> }
) => {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { threadId } = await context.params;

  try {
    await connectToDatabase();
    const thread = await Thread.findById(threadId);

    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    const isAuthor = thread.createdBy.toString() === session.user.id;
    const isAdmin = session.user.role === UserRole.ADMIN;

    // If already edited by admin, lock further edits for the user
    const lastEditBy =
      thread.edits?.[thread.edits.length - 1]?.editedBy?.toString();
    const lastEditWasAdmin =
      lastEditBy && lastEditBy !== thread.createdBy.toString();

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!isAdmin && lastEditWasAdmin) {
      return NextResponse.json(
        { error: "Locked due to admin edit" },
        { status: 403 }
      );
    }

    const data = await req.json();
    const parsed = ThreadSchema.parse(data);

    // Record the old content
    if (!thread.edits) thread.edits = [];
    thread.edits.push({
      content: thread.content,
      editedAt: new Date(),
      editedBy: new mongoose.Types.ObjectId(session.user.id),
    });

    // Update the thread
    thread.title = parsed.title;
    thread.content = parsed.content;
    thread.updatedBy = new mongoose.Types.ObjectId(session.user.id);
    await thread.save();

    return NextResponse.json(thread);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Thread update error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
