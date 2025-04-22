// TODO rate limit
import { connectToDatabase } from "@/lib/db";
import { HandleCheckSchema } from "@/lib/validators/auth/user";
import { User } from "@/models/auth/User";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const handle = searchParams.get("handle");

    if (!handle) {
      return NextResponse.json({ error: "Missing handle" }, { status: 400 });
    }

    const parsed = HandleCheckSchema.safeParse({ handle });
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.format() },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const exists = await User.exists({ _handle: handle.toLowerCase() });

    return NextResponse.json({
      handle,
      available: !exists,
    });
  } catch (err) {
    console.error("Handle availability check error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
