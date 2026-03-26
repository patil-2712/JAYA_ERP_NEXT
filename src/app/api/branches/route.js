import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Branch from "./schema";  // ✅ Make sure this imports the Branch schema
import { getTokenFromHeader, verifyJWT } from "@/lib/auth";

// ✅ Role-based access check
function isAuthorized(user) {
  return (
    user?.type === "company" ||
    user?.role === "Admin" ||
    user?.permissions?.includes("branch")
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
   GET /api/branches
======================================== */
export async function GET(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    // Fetch branches for this company
    const branches = await Branch.find({
      companyId: user.companyId,
    }).sort({ name: 1 });

    return NextResponse.json({ success: true, data: branches }, { status: 200 });
  } catch (err) {
    console.error("GET /branches error:", err);
    return NextResponse.json({ success: false, message: "Failed to fetch branches" }, { status: 500 });
  }
}

/* ========================================
   POST /api/branches
======================================== */
export async function POST(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    const { name, code } = await req.json();

    if (!name || !code) {
      return NextResponse.json({ success: false, message: "Name and code are required" }, { status: 400 });
    }

    // ✅ Check if branch with same code already exists for this company
    const existingBranch = await Branch.findOne({
      code: code.toUpperCase(),
      companyId: user.companyId,
    });
    
    if (existingBranch) {
      return NextResponse.json({ success: false, message: "Branch code already exists" }, { status: 400 });
    }

    // ✅ Create new branch
    const newBranch = new Branch({
      name: name.trim(),
      code: code.toUpperCase(),
      companyId: user.companyId,
      createdBy: user.id,
    });

    await newBranch.save();
    return NextResponse.json({ success: true, data: newBranch }, { status: 201 });
  } catch (error) {
    console.error("POST /branches error:", error);
    return NextResponse.json({ success: false, message: "Failed to create branch" }, { status: 500 });
  }
}

/* ========================================
   DELETE /api/branches?id=123
======================================== */
export async function DELETE(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    const url = new URL(req.url);
    const branchId = url.searchParams.get("id");

    if (!branchId) {
      return NextResponse.json({ success: false, message: "Branch ID is required" }, { status: 400 });
    }

    const deletedBranch = await Branch.findOneAndDelete({
      _id: branchId,
      companyId: user.companyId,
    });

    if (!deletedBranch) {
      return NextResponse.json({ success: false, message: "Branch not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Branch deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /branches error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete branch" }, { status: 500 });
  }
}