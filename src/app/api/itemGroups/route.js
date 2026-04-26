//import dbConnect from "@/lib/db";
//import ItemGroup from "@/models/ItemGroupModels";
//import { NextResponse } from "next/server";
//import { getTokenFromHeader, verifyJWT } from "@/lib/auth";
//
//// ✅ Role-based access for item management
//function isAuthorized(user) {
//  if (!user) return false;
//
//  if (user.type === "company") return true;
//
//  const allowedRoles = [
//    "admin",
//    "sales manager",
//    "purchase manager",
//    "inventory manager",
//    "accounts manager",
//    "hr manager",
//    "support executive",
//    "production head",
//    "project manager",
//  ];
//
//  const userRoles = Array.isArray(user.roles)
//    ? user.roles
//    : [];
//
//  return userRoles.some(role =>
//    allowedRoles.includes(role.trim().toLowerCase())
//  );
//}
//
//// ✅ Validate user token & permissions
//async function validateUser(req) {
//  const token = getTokenFromHeader(req);
//  if (!token) return { error: "Token missing", status: 401 };
//
//  try {
//    const user = await verifyJWT(token);
//    if (!user || !isAuthorized(user)) return { error: "Unauthorized", status: 403 };
//    return { user };
//  } catch (err) {
//    console.error("JWT Verification Failed:", err.message);
//    return { error: "Invalid token", status: 401 };
//  }
//}
//
//
//export async function POST(req) {
//  await dbConnect();
//
//  const { user, error, status } = await validateUser(req);
//  if (error) return NextResponse.json({ success: false, message: error }, { status });
//
//  try {
//    const { name, code, category } = await req.json(); // Added category
//    if (!name || !code) {
//      return NextResponse.json(
//        { success: false, message: "Name and Code are required" },
//        { status: 400 }
//      );
//    }
//
//    const newItemGroup = new ItemGroup({ 
//      name, 
//      code, 
//      category: category || '', // Add category with default empty string
//      companyId: user.companyId 
//    });
//    await newItemGroup.save();
//
//    return NextResponse.json(
//      { success: true, data: newItemGroup, message: "Item Group created" },
//      { status: 201 }
//    );
//  } catch (err) {
//    console.error("Error creating item group:", err.message);
//    return NextResponse.json(
//      { success: false, message: "Error creating item group" },
//      { status: 500 }
//    );
//  }
//}
//
//export async function GET(req) {
//  await dbConnect();
//
//  const { user, error, status } = await validateUser(req);
//  if (error) {
//    return NextResponse.json({ success: false, message: error }, { status });
//  }
//
//  try {
//    const { searchParams } = new URL(req.url);
//    const search = searchParams.get("search") || "";
//
//    const filter = {
//      companyId: user.companyId,
//      ...(search ? { name: { $regex: search, $options: "i" } } : {}),
//    };
//
//    const itemGroups = await ItemGroup.find(filter).sort({ createdAt: -1 });
//
//    return NextResponse.json({ success: true, data: itemGroups }, { status: 200 });
//  } catch (err) {
//    console.error("❌ Error fetching item groups:", err.message);
//    return NextResponse.json({ success: false, message: "Error fetching item groups" }, { status: 500 });
//  }
//}
//

import dbConnect from "@/lib/db";
import ItemGroup from "@/models/ItemGroupModels";
import { NextResponse } from "next/server";
import { getTokenFromHeader, verifyJWT } from "@/lib/auth";

// ✅ Role-based access for item management
function isAuthorized(user) {
  if (!user) return false;

  if (user.type === "company") return true;

  const allowedRoles = [
    "admin",
    "sales manager",
    "purchase manager",
    "inventory manager",
    "accounts manager",
    "hr manager",
    "support executive",
    "production head",
    "project manager",
  ];

  const userRoles = Array.isArray(user.roles)
    ? user.roles
    : [];

  return userRoles.some(role =>
    allowedRoles.includes(role.trim().toLowerCase())
  );
}

// ✅ Validate user token & permissions
async function validateUser(req) {
  const token = getTokenFromHeader(req);
  if (!token) return { error: "Token missing", status: 401 };

  try {
    const user = await verifyJWT(token);
    if (!user || !isAuthorized(user)) return { error: "Unauthorized", status: 403 };
    return { user };
  } catch (err) {
    console.error("JWT Verification Failed:", err.message);
    return { error: "Invalid token", status: 401 };
  }
}

export async function POST(req) {
  await dbConnect();

  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    const { name, code, category } = await req.json();
    if (!name || !code) {
      return NextResponse.json(
        { success: false, message: "Name and Code are required" },
        { status: 400 }
      );
    }

    const newItemGroup = new ItemGroup({ 
      name, 
      code, 
      category: category || '',
      companyId: user.companyId 
    });
    await newItemGroup.save();

    return NextResponse.json(
      { success: true, data: newItemGroup, message: "Item Group created" },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error creating item group:", err.message);
    return NextResponse.json(
      { success: false, message: "Error creating item group" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  await dbConnect();

  const { user, error, status } = await validateUser(req);
  if (error) {
    return NextResponse.json({ success: false, message: error }, { status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || ""; // NEW: Filter by category

    // Build filter object
    let filter = { companyId: user.companyId };
    
    // Add search condition (searches in name, code, and category)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } } // NEW: Search in category
      ];
    }
    
    // Add category filter (if provided)
    if (category) {
      filter.category = { $regex: category, $options: "i" };
    }

    const itemGroups = await ItemGroup.find(filter).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: itemGroups }, { status: 200 });
  } catch (err) {
    console.error("❌ Error fetching item groups:", err.message);
    return NextResponse.json({ success: false, message: "Error fetching item groups" }, { status: 500 });
  }
}

// Optional: Add PUT method for updates
export async function PUT(req, { params }) {
  await dbConnect();

  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ success: false, message: "Item Group ID is required" }, { status: 400 });
    }

    const { name, code, category } = await req.json();
    
    const existingItemGroup = await ItemGroup.findOne({ _id: id, companyId: user.companyId });
    if (!existingItemGroup) {
      return NextResponse.json({ success: false, message: "Item Group not found" }, { status: 404 });
    }

    const updatedItemGroup = await ItemGroup.findByIdAndUpdate(
      id,
      { name, code, category: category || '' },
      { new: true, runValidators: true }
    );

    return NextResponse.json({ success: true, data: updatedItemGroup }, { status: 200 });
  } catch (err) {
    console.error("PUT /itemGroups error:", err.message);
    return NextResponse.json({ success: false, message: "Failed to update item group" }, { status: 500 });
  }
}

// Optional: Add DELETE method
export async function DELETE(req, { params }) {
  await dbConnect();

  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ success: false, message: "Item Group ID is required" }, { status: 400 });
    }

    const itemGroup = await ItemGroup.findOne({ _id: id, companyId: user.companyId });
    if (!itemGroup) {
      return NextResponse.json({ success: false, message: "Item Group not found" }, { status: 404 });
    }

    await ItemGroup.deleteOne({ _id: id });

    return NextResponse.json({ success: true, message: "Item Group deleted successfully" }, { status: 200 });
  } catch (err) {
    console.error("DELETE /itemGroups error:", err.message);
    return NextResponse.json({ success: false, message: "Failed to delete item group" }, { status: 500 });
  }
}