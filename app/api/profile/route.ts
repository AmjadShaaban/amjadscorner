import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User, UserSchema } from '@/models/auth/User';
import bcrypt from 'bcryptjs';
import { auth } from '@/lib/auth';

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data = await req.json();

  const passwordSchema = UserSchema.pick({ password: true });
  const parsed = passwordSchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  await connectToDatabase();
  const hashedPassword = bcrypt.hashSync(parsed.data.password, 10);
  await User.updateOne({ _id: session.user.id }, { password: hashedPassword });
  return NextResponse.json({ message: 'Password updated' });
}