// import { NextRequest, NextResponse } from "next/server";
// import mongoose from "mongoose";
// import { ShopItem, ShopItemSchema } from "@/models/shop/ShopItem";
// import { ShopCategory } from "@/models/shop/ShopCategory";
// import { connectToDatabase } from "@/lib/db";
// import { z } from "zod";
// import { auth } from "@/lib/auth/auth";
// // TODO role-based system
// // Hardcoded admin email (replace with your email or a role-based system)
// const ADMIN_EMAIL = "test@test.com";

// export async function GET(req: NextRequest) {
//   try {
//     await connectToDatabase();
//     const categoryId = req.nextUrl.searchParams.get("categoryId");

//     const query = categoryId ? { categoryId } : {};
//     const items = await ShopItem.find(query).exec();
//     return NextResponse.json(items, { status: 200 });
//   } catch (error) {
//     console.error("Error fetching items:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch items" },
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

//     const validatedData = ShopItemSchema.omit({
//       createdAt: true,
//       updatedAt: true,
//     }).parse(body);

//     if (!mongoose.Types.ObjectId.isValid(validatedData.categoryId)) {
//       return NextResponse.json(
//         { error: "Invalid category ID" },
//         { status: 400 }
//       );
//     }

//     const category = await ShopCategory.findById(validatedData.categoryId);
//     if (!category) {
//       return NextResponse.json(
//         { error: "Category not found" },
//         { status: 404 }
//       );
//     }

//     const item = new ShopItem({
//       ...validatedData,
//       categoryId: new mongoose.Types.ObjectId(validatedData.categoryId),
//     });
//     await item.save();

//     return NextResponse.json(
//       { message: "Item created", id: item._id },
//       { status: 201 }
//     );
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return NextResponse.json({ error: error.errors }, { status: 400 });
//     }
//     console.error("Error creating item:", error);
//     return NextResponse.json(
//       { error: "Failed to create item" },
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
//         id: z.string().min(1, "Item ID is required"),
//         name: ShopItemSchema.shape.name,
//         description: ShopItemSchema.shape.description,
//         price: ShopItemSchema.shape.price,
//         categoryId: ShopItemSchema.shape.categoryId,
//       })
//       .parse(body);

//     if (!mongoose.Types.ObjectId.isValid(validatedData.id)) {
//       return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
//     }
//     if (!mongoose.Types.ObjectId.isValid(validatedData.categoryId)) {
//       return NextResponse.json(
//         { error: "Invalid category ID" },
//         { status: 400 }
//       );
//     }

//     const category = await ShopCategory.findById(validatedData.categoryId);
//     if (!category) {
//       return NextResponse.json(
//         { error: "Category not found" },
//         { status: 404 }
//       );
//     }

//     const result = await ShopItem.findByIdAndUpdate(
//       validatedData.id,
//       {
//         name: validatedData.name,
//         description: validatedData.description,
//         price: validatedData.price,
//         categoryId: new mongoose.Types.ObjectId(validatedData.categoryId),
//       },
//       { new: true }
//     );

//     if (!result) {
//       return NextResponse.json({ error: "Item not found" }, { status: 404 });
//     }

//     return NextResponse.json({ message: "Item updated" }, { status: 200 });
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return NextResponse.json({ error: error.errors }, { status: 400 });
//     }
//     console.error("Error updating item:", error);
//     return NextResponse.json(
//       { error: "Failed to update item" },
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
//         id: z.string().min(1, "Item ID is required"),
//       })
//       .parse(body);

//     if (!mongoose.Types.ObjectId.isValid(validatedData.id)) {
//       return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
//     }

//     const result = await ShopItem.findByIdAndDelete(validatedData.id);

//     if (!result) {
//       return NextResponse.json({ error: "Item not found" }, { status: 404 });
//     }

//     return NextResponse.json({ message: "Item deleted" }, { status: 200 });
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return NextResponse.json({ error: error.errors }, { status: 400 });
//     }
//     console.error("Error deleting item:", error);
//     return NextResponse.json(
//       { error: "Failed to delete item" },
//       { status: 500 }
//     );
//   }
// }
