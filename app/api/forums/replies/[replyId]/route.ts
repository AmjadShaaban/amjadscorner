import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";

import { connectToDatabase } from "@/lib/db";
import { auth } from "@/lib/auth/auth";
import { Reply, ReplySchema } from "@/models/forums/Reply";
import { UserRole } from "@/types/roles";

export const PUT = async (
  req: NextRequest,
  context: { params: Promise<{ replyId: string }> }
) => {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { replyId } = await context.params;

  try {
    await connectToDatabase();
    const reply = await Reply.findById(replyId);

    if (!reply || reply.isDeleted) {
      return NextResponse.json({ error: "Reply not found" }, { status: 404 });
    }

    const isAuthor = reply.createdBy.toString() === session.user.id;
    const isAdmin = session.user.role === UserRole.ADMIN;

    const lastEditBy =
      reply.edits?.[reply.edits.length - 1]?.editedBy?.toString();
    const lastEditWasAdmin =
      lastEditBy && lastEditBy !== reply.createdBy.toString();

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!isAdmin && lastEditWasAdmin) {
      return NextResponse.json(
        { error: "Reply locked due to admin edit" },
        { status: 403 }
      );
    }

    const data = await req.json();
    const parsed = ReplySchema.pick({ content: true }).parse(data);

    if (!reply.edits) reply.edits = [];
    reply.edits.push({
      content: reply.content,
      editedAt: new Date(),
      editedBy: new mongoose.Types.ObjectId(session.user.id),
    });

    reply.content = parsed.content;
    reply.updatedBy = new mongoose.Types.ObjectId(session.user.id);

    await reply.save();
    return NextResponse.json(reply);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Reply edit error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export const DELETE = async (
  _req: NextRequest,
  context: { params: Promise<{ replyId: string }> }
) => {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { replyId } = await context.params;

  try {
    await connectToDatabase();
    const reply = await Reply.findById(replyId);

    if (!reply || reply.isDeleted) {
      return NextResponse.json({ error: "Reply not found" }, { status: 404 });
    }

    const isAuthor = reply.createdBy.toString() === session.user.id;
    const isAdmin = session.user.role === UserRole.ADMIN;

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    reply.isDeleted = true;
    reply.deletedAt = new Date();
    reply.deletedBy = new mongoose.Types.ObjectId(session.user.id);

    await reply.save();
    return NextResponse.json({ message: "Reply deleted" });
  } catch (error) {
    console.error("Reply deletion error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
