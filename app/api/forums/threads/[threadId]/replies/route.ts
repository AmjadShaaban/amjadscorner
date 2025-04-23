import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth/auth";
import { connectToDatabase } from "@/lib/db";
import { ReplySchema } from "@/lib/validators/forums/reply";
import { Reply } from "@/models/forums/Reply";
import { Thread } from "@/models/forums/Thread";

export const GET = async (
  _req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) => {
  const { threadId } = await params;
  try {
    await connectToDatabase();

    const replies = await Reply.find({
      thread: threadId,
      isDeleted: false,
    })
      .populate("createdBy", "firstName lastName id")
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
  { params }: { params: Promise<{ threadId: string }> }
) => {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { threadId } = await params;

  try {
    await connectToDatabase();
    const thread = await Thread.findById(threadId);

    if (!thread || thread.isDeleted) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    const data = await req.json();

    const parsed = ReplySchema.parse({
      ...data,
      thread: threadId,
    });
    const reply = new Reply({
      thread: threadId,
      content: parsed.content,
      author: new mongoose.Types.ObjectId(session.user.id),
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
