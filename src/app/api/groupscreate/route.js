import dbConnect from "@/lib/db";
import Group from "@/models/groupModels";
import { NextResponse } from "next/server";
import { getTokenFromHeader, verifyJWT } from "@/lib/auth";

/**
 * ✅ Validate JWT & Return User
 */
async function authenticate(req) {
  const token = getTokenFromHeader(req);
  if (!token) {
    return { error: "Token missing", status: 401 };
  }

  try {
    const user = await verifyJWT(token);
    if (!user) {
      return { error: "Invalid token", status: 401 };
    }
    return { user };
  } catch (err) {
    console.error("Auth Error:", err.message);
    return { error: "Authentication failed", status: 401 };
  }
}

/* =========================================
   📥 GET All Groups
========================================= */
export async function GET(req) {
  await dbConnect();

  const { user, error, status } = await authenticate(req);
  if (error) {
    return NextResponse.json({ success: false, message: error }, { status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    
    let filter = { companyId: user.companyId };
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } }
      ];
    }
    
    const groups = await Group.find(filter).sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, data: groups },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching groups:", error.message);
    return NextResponse.json(
      { success: false, message: "Error fetching groups" },
      { status: 500 }
    );
  }
}

/* =========================================
   📤 POST Create Group
========================================= */
export async function POST(req) {
  await dbConnect();

  const { user, error, status } = await authenticate(req);
  if (error) {
    return NextResponse.json({ success: false, message: error }, { status });
  }

  try {
    const body = await req.json();
    const { name, description, category } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Name is required" },
        { status: 400 }
      );
    }

    const newGroup = new Group({
      name,
      description,
      category: category || "",
      companyId: user.companyId,
    });

    await newGroup.save();

    return NextResponse.json(
      { success: true, message: "Group created successfully", data: newGroup },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST Error:", err.message);
    return NextResponse.json(
      { success: false, message: "Error creating group" },
      { status: 500 }
    );
  }
}

/* =========================================
   📝 PUT Update Group
========================================= */
export async function PUT(req, { params }) {
  await dbConnect();

  const { user, error, status } = await authenticate(req);
  if (error) {
    return NextResponse.json({ success: false, message: error }, { status });
  }

  try {
    const { id } = await params;  // ✅ AWAIT HERE
    
    if (!id) {
      return NextResponse.json({ success: false, message: "Group ID is required" }, { status: 400 });
    }

    const body = await req.json();
    const { name, description, category } = body;

    const existingGroup = await Group.findOne({ _id: id, companyId: user.companyId });
    if (!existingGroup) {
      return NextResponse.json({ success: false, message: "Group not found" }, { status: 404 });
    }

    const updatedGroup = await Group.findByIdAndUpdate(
      id,
      { name, description, category: category || "" },
      { new: true, runValidators: true }
    );

    return NextResponse.json(
      { success: true, data: updatedGroup, message: "Group updated successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("PUT Error:", err.message);
    return NextResponse.json(
      { success: false, message: "Error updating group" },
      { status: 500 }
    );
  }
}

/* =========================================
   🗑️ DELETE Group
========================================= */
export async function DELETE(req, { params }) {
  await dbConnect();

  const { user, error, status } = await authenticate(req);
  if (error) {
    return NextResponse.json({ success: false, message: error }, { status });
  }

  try {
    const { id } = await params;  // ✅ AWAIT HERE
    
    if (!id) {
      return NextResponse.json({ success: false, message: "Group ID is required" }, { status: 400 });
    }

    const group = await Group.findOne({ _id: id, companyId: user.companyId });
    if (!group) {
      return NextResponse.json({ success: false, message: "Group not found" }, { status: 404 });
    }

    await Group.deleteOne({ _id: id });

    return NextResponse.json(
      { success: true, message: "Group deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("DELETE Error:", err.message);
    return NextResponse.json(
      { success: false, message: "Error deleting group" },
      { status: 500 }
    );
  }
}