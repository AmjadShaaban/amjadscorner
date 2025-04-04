// import { NextRequest, NextResponse } from "next/server";
// import mongoose from "mongoose";
// import { ShopCategory, ShopCategorySchema } from "@/models/shop/ShopCategory";
// import { ShopItem } from "@/models/shop/ShopItem";
// import { connectToDatabase } from "@/lib/db";
// import { z } from "zod";
// import { auth } from "@/lib/auth/auth";
// // TODO role-based system
// // Hardcoded admin email (replace with your email or a role-based system)
// const ADMIN_EMAIL = "test@test.com";

// export async function GET(req: NextRequest) {
//   try {
//     await connectToDatabase();
//     const categories = await ShopCategory.find().exec();
//     return NextResponse.json(categories, { status: 200 });
//   } catch (error) {
//     console.error("Error fetching categories:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch categories" },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(req: NextRequest) {
//   const session = await auth();
//   if (!session?.user.id || session.user.email !== ADMIN_EMAIL) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     await connectToDatabase();
//     const body = await req.json();

//     const validatedData = ShopCategorySchema.omit({
//       createdAt: true,
//       updatedAt: true,
//     }).parse(body);

//     const category = new ShopCategory(validatedData);
//     await category.save();

//     return NextResponse.json(
//       { message: "Category created", id: category._id },
//       { status: 201 }
//     );
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return NextResponse.json({ error: error.errors }, { status: 400 });
//     }
//     console.error("Error creating category:", error);
//     return NextResponse.json(
//       { error: "Failed to create category" },
//       { status: 500 }
//     );
//   }
// }

// export async function PUT(req: NextRequest) {
//   const session = await auth();
//   if (!session?.user.id || session.user.email !== ADMIN_EMAIL) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     await connectToDatabase();
//     const body = await req.json();

//     const validatedData = z
//       .object({
//         id: z.string().min(1, "Category ID is required"),
//         name: ShopCategorySchema.shape.name,
//       })
//       .parse(body);

//     if (!mongoose.Types.ObjectId.isValid(validatedData.id)) {
//       return NextResponse.json(
//         { error: "Invalid category ID" },
//         { status: 400 }
//       );
//     }

//     const result = await ShopCategory.findByIdAndUpdate(
//       validatedData.id,
//       { name: validatedData.name },
//       { new: true }
//     );

//     if (!result) {
//       return NextResponse.json(
//         { error: "Category not found" },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({ message: "Category updated" }, { status: 200 });
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return NextResponse.json({ error: error.errors }, { status: 400 });
//     }
//     console.error("Error updating category:", error);
//     return NextResponse.json(
//       { error: "Failed to update category" },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(req: NextRequest) {
//   const session = await auth();
//   if (!session?.user.id || session.user.email !== ADMIN_EMAIL) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     await connectToDatabase();
//     const body = await req.json();

//     const validatedData = z
//       .object({
//         id: z.string().min(1, "Category ID is required"),
//       })
//       .parse(body);

//     if (!mongoose.Types.ObjectId.isValid(validatedData.id)) {
//       return NextResponse.json(
//         { error: "Invalid category ID" },
//         { status: 400 }
//       );
//     }

//     const itemCount = await ShopItem.countDocuments({
//       categoryId: validatedData.id,
//     });
//     if (itemCount > 0) {
//       return NextResponse.json(
//         { error: "Cannot delete category with associated items" },
//         { status: 400 }
//       );
//     }

//     const result = await ShopCategory.findByIdAndDelete(validatedData.id);

//     if (!result) {
//       return NextResponse.json(
//         { error: "Category not found" },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({ message: "Category deleted" }, { status: 200 });
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return NextResponse.json({ error: error.errors }, { status: 400 });
//     }
//     console.error("Error deleting category:", error);
//     return NextResponse.json(
//       { error: "Failed to delete category" },
//       { status: 500 }
//     );
//   }
// }
import { NextResponse } from "next/server";
// TODO Finish me
export async function GET() {
  return NextResponse.json("IM A PLACEHOLDER");
}
