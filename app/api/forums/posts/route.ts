import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { connectToDatabase } from "@/lib/db";
import { Post, PostSchema } from "@/models/forums/Post";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subcategoryId = searchParams.get("subcategoryId");

    await connectToDatabase();
    const query = subcategoryId ? { subcategoryId } : {};
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .populate("userId", "email");
    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await req.json();
    const parsed = PostSchema.omit({ createdAt: true }).parse({
      userId: session.user.id,
      subcategoryId: data.subcategoryId,
      title: data.title,
      content: data.content,
    });

    await connectToDatabase();
    const post = new Post(parsed);
    await post.save();
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Post creation error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
