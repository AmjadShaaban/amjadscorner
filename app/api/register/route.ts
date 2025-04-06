import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User, UserSchema } from "@/models/auth/User";
import bcrypt from "bcryptjs";

export const POST = async (req: NextRequest) => {
  const data = await req.json();
  const parsed = UserSchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();
    const userData = parsed.data;

    userData.password = bcrypt.hashSync(userData.password, 10);

    const user = new User(userData);
    await user.save();

    return NextResponse.json({ user: user.toJSON() }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
