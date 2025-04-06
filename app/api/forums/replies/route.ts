import { NextResponse } from "next/server";
// TODO Finish me
export const GET = async () => {
  return NextResponse.json("IM A PLACEHOLDER");
};

// import { NextRequest, NextResponse } from "next/server";
// import { auth } from "@/lib/auth/auth";
// import { connectToDatabase } from "@/lib/db";
// import { Reply, ReplySchema } from "@/models/forums/Reply";
// import { z } from "zod";

// export const GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const postId = searchParams.get("postId");

//     if (!postId) {
//       return NextResponse.json(
//         { error: "Post ID is required" },
//         { status: 400 }
//       );
//     }

//     await connectToDatabase();
//     const replies = await Reply.find({ postId })
//       .sort({ createdAt: 1 })
//       .populate("userId", "email")
//       .populate("quotedReplyId", "content userId");
//     return NextResponse.json(replies);
//   } catch (error) {
//     console.error("Error fetching replies:", error);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }

// export const POST(req: NextRequest) {
//   const session = await auth();
//   if (!session?.user.id)
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//   try {
//     const data = await req.json();
//     const parsed = ReplySchema.omit({ createdAt: true }).parse({
//       postId: data.postId,
//       userId: session.user.id,
//       content: data.content,
//       quotedReplyId: data.quotedReplyId || undefined,
//     });

//     await connectToDatabase();
//     const reply = new Reply(parsed);
//     await reply.save();
//     return NextResponse.json(reply, { status: 201 });
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return NextResponse.json(
//         { error: error.errors[0].message },
//         { status: 400 }
//       );
//     }
//     console.error("Reply creation error:", error);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }
