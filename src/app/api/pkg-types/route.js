import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import PkgType from "./schema";
import { getTokenFromHeader, verifyJWT } from "@/lib/auth";

// Role-based access check
function isAuthorized(user) {
  return (
    user?.type === "company" ||
    user?.role === "Admin" ||
    user?.permissions?.includes("pkg-type")
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
    console.error("JWT Verification Failed:", err);
    return { error: "Invalid token", status: 401 };
  }
}

/* ========================================
   GET /api/pkg-types
======================================== */
export async function GET(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    const pkgTypes = await PkgType.find({
      companyId: user.companyId,
    }).sort({ name: 1 });

    return NextResponse.json({ success: true, data: pkgTypes }, { status: 200 });
  } catch (err) {
    console.error("GET /pkg-types error:", err);
    return NextResponse.json({ success: false, message: "Failed to fetch PKG types" }, { status: 500 });
  }
}

/* ========================================
   POST /api/pkg-types
======================================== */
export async function POST(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    const { name } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ 
        success: false, 
        message: "PKG type name is required" 
      }, { status: 400 });
    }

    // Check if PKG type with same name already exists for this company
    const existingPkgType = await PkgType.findOne({
      name: name.trim(),
      companyId: user.companyId,
    });
    
    if (existingPkgType) {
      return NextResponse.json({ success: false, message: "PKG type name already exists" }, { status: 400 });
    }

    // Create new PKG type
    const newPkgType = new PkgType({
      name: name.trim(),
      companyId: user.companyId,
      createdBy: user.id,
    });

    await newPkgType.save();
    return NextResponse.json({ success: true, data: newPkgType }, { status: 201 });
  } catch (error) {
    console.error("POST /pkg-types error:", error);
    return NextResponse.json({ success: false, message: "Failed to create PKG type" }, { status: 500 });
  }
}

/* ========================================
   PUT /api/pkg-types?id=123
======================================== */
export async function PUT(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    const url = new URL(req.url);
    const pkgTypeId = url.searchParams.get("id");
    const { name } = await req.json();

    if (!pkgTypeId) {
      return NextResponse.json({ success: false, message: "PKG type ID is required" }, { status: 400 });
    }

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, message: "PKG type name is required" }, { status: 400 });
    }

    // Check if another PKG type with same name exists
    const existingPkgType = await PkgType.findOne({
      _id: { $ne: pkgTypeId },
      name: name.trim(),
      companyId: user.companyId,
    });
    
    if (existingPkgType) {
      return NextResponse.json({ success: false, message: "PKG type name already exists" }, { status: 400 });
    }

    // Update PKG type
    const updatedPkgType = await PkgType.findOneAndUpdate(
      { _id: pkgTypeId, companyId: user.companyId },
      { name: name.trim() },
      { new: true }
    );

    if (!updatedPkgType) {
      return NextResponse.json({ success: false, message: "PKG type not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedPkgType }, { status: 200 });
  } catch (error) {
    console.error("PUT /pkg-types error:", error);
    return NextResponse.json({ success: false, message: "Failed to update PKG type" }, { status: 500 });
  }
}

/* ========================================
   DELETE /api/pkg-types?id=123
======================================== */
export async function DELETE(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    const url = new URL(req.url);
    const pkgTypeId = url.searchParams.get("id");

    if (!pkgTypeId) {
      return NextResponse.json({ success: false, message: "PKG type ID is required" }, { status: 400 });
    }

    const deletedPkgType = await PkgType.findOneAndDelete({
      _id: pkgTypeId,
      companyId: user.companyId,
    });

    if (!deletedPkgType) {
      return NextResponse.json({ success: false, message: "PKG type not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "PKG type deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /pkg-types error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete PKG type" }, { status: 500 });
  }
}