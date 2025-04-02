import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../lib/auth';
import { connectToDatabase } from '../../../lib/db';
import { Category, CategorySchema } from '../../../models/Category';
import { z } from 'zod';

// Hardcoded admin email (replace with your email or a role-based system)
const ADMIN_EMAIL = 'test@test.com';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const categories = await Category.find().sort({ createdAt: 1 });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user.id || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();
    const parsed = CategorySchema.omit({ createdAt: true }).parse({
      name: data.name,
    });

    await connectToDatabase();
    const category = new Category(parsed);
    await category.save();
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Category creation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}