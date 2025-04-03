import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { Todo, TodoSchema } from '@/models/todo/Todo';
import { z } from 'zod';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectToDatabase();
  const todos = await Todo.find({ userId: session.user.id });
  return NextResponse.json(todos);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await req.json();

    const title = typeof data === 'string' ? data : data.title;
    const parsed = TodoSchema.omit({ completed: true }).parse({
      userId: session.user.id,
      title,
    });

    await connectToDatabase();
    const todo = new Todo(parsed);
    await todo.save();
    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await req.json();
    const { id, completed } = data;

    if (!id || typeof completed !== 'boolean') {
      return NextResponse.json({ error: 'Missing id or completed status' }, { status: 400 });
    }

    await connectToDatabase();
    const todo = await Todo.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { completed },
      { new: true }
    );

    if (!todo) return NextResponse.json({ error: 'Todo not found' }, { status: 404 });

    return NextResponse.json(todo);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await req.json();
    const { id } = data;

    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    await connectToDatabase();
    const result = await Todo.deleteOne({ _id: id, userId: session.user.id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Todo deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}