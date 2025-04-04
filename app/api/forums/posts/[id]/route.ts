// import { NextRequest, NextResponse } from 'next/server';
// import { connectToDatabase } from '@/lib/db';
// import { Post } from '@/models/forums/Post';

// export async function GET(
//   req: NextRequest,
//   {params}: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const id = (await params).id
//     await connectToDatabase();
//     const post = await Post.findById(id).populate('userId', 'email');
//     if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
//     return NextResponse.json(post);
//   } catch (error) {
//     console.error('Error fetching post:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }
import { NextResponse } from "next/server";
// TODO Finish me
export async function GET() {
  return NextResponse.json("IM A PLACEHOLDER");
}
