import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import UOM from "./schema";
import { getTokenFromHeader, verifyJWT } from "@/lib/auth";

// ✅ Role-based access check
function isAuthorized(user) {
  return (
    user?.type === "company" ||
    user?.role === "Admin" ||
    user?.permissions?.includes("uom")
  );
}

async function validateUser(req) {
  const token = getTokenFromHeader(req);
  if (!token) return { error: "Token missing", status: 401 };

  try {
    const user = await verifyJWT(token);
    if (!user) return { error: "Invalid token", status: 401 };
    if (!isAuthorized(user)) return { error: "Unauthorized", status: 403 };
    return { user, error: null, status: 200 };
  } catch (err) {
    console.error("JWT Verification Failed:", err?.message || err);
    return { error: "Invalid token", status: 401 };
  }
}

/* ========================================
   GET /api/uoms
======================================== */
export async function GET(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    // Fetch UOMs for this company
    const uoms = await UOM.find({
      companyId: user.companyId,
      isActive: true
    }).sort({ name: 1 });

    return NextResponse.json({ success: true, data: uoms }, { status: 200 });
  } catch (err) {
    console.error("GET /uoms error:", err);
    return NextResponse.json({ success: false, message: "Failed to fetch UOMs" }, { status: 500 });
  }
}

/* ========================================
   POST /api/uoms
======================================== */
export async function POST(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    const { name } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, message: "UOM name is required" }, { status: 400 });
    }

    // ✅ Check if UOM with same name already exists for this company
    const existingUOM = await UOM.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      companyId: user.companyId,
    });
    
    if (existingUOM) {
      return NextResponse.json({ success: false, message: "UOM name already exists" }, { status: 400 });
    }

    // ✅ Create new UOM
    const newUOM = new UOM({
      name: name.trim(),
      companyId: user.companyId,
      createdBy: user.id,
    });

    await newUOM.save();
    return NextResponse.json({ success: true, data: newUOM }, { status: 201 });
  } catch (error) {
    console.error("POST /uoms error:", error);
    return NextResponse.json({ success: false, message: "Failed to create UOM" }, { status: 500 });
  }
}

/* ========================================
   PUT /api/uoms (NEW - for updates)
======================================== */
export async function PUT(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    const { id, name } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, message: "UOM ID is required" }, { status: 400 });
    }

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, message: "UOM name is required" }, { status: 400 });
    }

    // ✅ Check if UOM exists and belongs to company
    const existingUOM = await UOM.findOne({
      _id: id,
      companyId: user.companyId,
      isActive: true
    });

    if (!existingUOM) {
      return NextResponse.json({ success: false, message: "UOM not found" }, { status: 404 });
    }

    // ✅ Check if new name conflicts with another UOM
    const duplicateUOM = await UOM.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      companyId: user.companyId,
      _id: { $ne: id } // Exclude current UOM
    });

    if (duplicateUOM) {
      return NextResponse.json({ success: false, message: "UOM name already exists" }, { status: 400 });
    }

    // ✅ Update UOM
    existingUOM.name = name.trim();
    await existingUOM.save();

    return NextResponse.json({ success: true, data: existingUOM, message: "UOM updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("PUT /uoms error:", error);
    return NextResponse.json({ success: false, message: "Failed to update UOM" }, { status: 500 });
  }
}

/* ========================================
   DELETE /api/uoms?id=123
======================================== */
export async function DELETE(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    const url = new URL(req.url);
    const uomId = url.searchParams.get("id");

    if (!uomId) {
      return NextResponse.json({ success: false, message: "UOM ID is required" }, { status: 400 });
    }

    // Soft delete - just mark as inactive
    const updatedUOM = await UOM.findOneAndUpdate(
      { _id: uomId, companyId: user.companyId },
      { isActive: false },
      { new: true }
    );

    if (!updatedUOM) {
      return NextResponse.json({ success: false, message: "UOM not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "UOM deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /uoms error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete UOM" }, { status: 500 });
  }
}