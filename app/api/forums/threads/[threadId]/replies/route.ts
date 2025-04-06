import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";

import { connectToDatabase } from "@/lib/db";
import { auth } from "@/lib/auth/auth";
import { Reply, ReplySchema } from "@/models/forums/Reply";
import { Thread } from "@/models/forums/Thread";

export const GET = async (
  _req: NextRequest,
  context: { params: Promise<{ threadId: string }> }
) => {
  const { threadId } = await context.params;
  try {
    await connectToDatabase();

    const replies = await Reply.find({
      thread: threadId,
      isDeleted: false,
    })
      .populate("createdBy", "name id")
      .populate("quotedReply", "content createdBy")
      .populate("quotedThread", "title content createdBy")
      .sort({ createdAt: 1 });

    return NextResponse.json(replies);
  } catch (error) {
    console.error("Error fetching replies:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export const POST = async (
  req: NextRequest,
  context: { params: Promise<{ threadId: string }> }
) => {
  const { threadId } = await context.params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const thread = await Thread.findById(threadId);

    if (!thread || thread.isDeleted) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    const data = await req.json();

    const parsed = ReplySchema.parse(data);

    const reply = new Reply({
      thread: thread._id,
      content: parsed.content,
      quotedReply: parsed.quotedReply
        ? new mongoose.Types.ObjectId(parsed.quotedReply)
        : undefined,
      quotedThread: parsed.quotedThread
        ? new mongoose.Types.ObjectId(parsed.quotedThread)
        : undefined,
      createdBy: new mongoose.Types.ObjectId(session.user.id),
    });

    await reply.save();
    return NextResponse.json(reply, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Reply creation error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
