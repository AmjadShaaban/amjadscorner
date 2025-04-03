import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { Subcategory, SubcategorySchema } from '@/models/forums/Subcategory';
import { z } from 'zod';
// TODO role-based system
// Hardcoded admin email (replace with your email or a role-based system)
const ADMIN_EMAIL = 'test@test.com';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const subcategories = await Subcategory.find().sort({ createdAt: 1 });
    return NextResponse.json(subcategories);
  } catch (error) {
    console.error('Error fetching subcategories:', error);
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
    const parsed = SubcategorySchema.omit({ createdAt: true }).parse({
      categoryId: data.categoryId,
      name: data.name,
    });

    await connectToDatabase();
    const subcategory = new Subcategory(parsed);
    await subcategory.save();
    return NextResponse.json(subcategory, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Subcategory creation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}