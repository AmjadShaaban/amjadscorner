import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/db';
import { Post } from '../../../../models/Post';

export async function GET(
  req: NextRequest,
  context: { params: { id: string } } // Use context with params
) {
  try {
    const { params } = context; // Destructure params from context
    await connectToDatabase();
    const post = await Post.findById(params.id).populate('userId', 'email');
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}