import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Owner from "./Owner";
import { getTokenFromHeader, verifyJWT } from "@/lib/auth";

// Role-based access check
function isAuthorized(user) {
  return (
    user?.type === "company" ||
    user?.role === "Admin" ||
    user?.permissions?.includes("owner")
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
   GET /api/owners
======================================== */
export async function GET(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const isActive = searchParams.get("isActive");

    let query = { companyId: user.companyId };
    
    if (isActive !== null) {
      query.isActive = isActive === "true";
    }

    if (search) {
      query.$or = [
        { ownerName: { $regex: search, $options: "i" } },
        { vehicleNumber: { $regex: search, $options: "i" } },
        { rcNumber: { $regex: search, $options: "i" } },
        { mobileNumber1: { $regex: search, $options: "i" } },
      ];
    }

    const owners = await Owner.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: owners }, { status: 200 });
  } catch (err) {
    console.error("GET /owners error:", err);
    return NextResponse.json({ success: false, message: "Failed to fetch owners" }, { status: 500 });
  }
}

/* ========================================
   POST /api/owners
======================================== */
export async function POST(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    const { 
      ownerName, 
      vehicleNumber, 
      ownerPanCard, 
      mobileNumber1, 
      mobileNumber2, 
      adharCardNumber, 
      rcNumber,
      panCardDocuments,
      adharCardDocuments,
      rcDocuments,
      isActive 
    } = await req.json();

    if (!ownerName || !vehicleNumber) {
      return NextResponse.json({ 
        success: false, 
        message: "Owner name and vehicle number are required" 
      }, { status: 400 });
    }

    // Check for duplicate
    const existingOwner = await Owner.findOne({
      ownerName: ownerName,
      vehicleNumber: vehicleNumber.toUpperCase(),
      companyId: user.companyId,
    });
    
    if (existingOwner) {
      return NextResponse.json({ 
        success: false, 
        message: "Owner with this name and vehicle already exists" 
      }, { status: 400 });
    }

    const newOwner = new Owner({
      ownerName,
      vehicleNumber: vehicleNumber.toUpperCase(),
      ownerPanCard: ownerPanCard?.toUpperCase(),
      mobileNumber1,
      mobileNumber2,
      adharCardNumber,
      rcNumber: rcNumber?.toUpperCase(),
      panCardDocuments: panCardDocuments || [],
      adharCardDocuments: adharCardDocuments || [],
      rcDocuments: rcDocuments || [],
      isActive: isActive !== undefined ? isActive : true,
      companyId: user.companyId,
      createdBy: user.id,
    });

    await newOwner.save();
    return NextResponse.json({ success: true, data: newOwner }, { status: 201 });
  } catch (error) {
    console.error("POST /owners error:", error);
    return NextResponse.json({ success: false, message: "Failed to create owner" }, { status: 500 });
  }
}

/* ========================================
   DELETE /api/owners?id=123
======================================== */
export async function DELETE(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    const url = new URL(req.url);
    const ownerId = url.searchParams.get("id");

    if (!ownerId) {
      return NextResponse.json({ success: false, message: "Owner ID is required" }, { status: 400 });
    }

    const deletedOwner = await Owner.findOneAndDelete({
      _id: ownerId,
      companyId: user.companyId,
    });

    if (!deletedOwner) {
      return NextResponse.json({ success: false, message: "Owner not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Owner deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /owners error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete owner" }, { status: 500 });
  }
}

/* ========================================
   PUT /api/owners?id=123
======================================== */
export async function PUT(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    const { searchParams } = new URL(req.url);
    const ownerId = searchParams.get("id");
    const updates = await req.json();

    if (!ownerId) {
      return NextResponse.json({ success: false, message: "Owner ID is required" }, { status: 400 });
    }

    // Convert to uppercase where needed
    if (updates.vehicleNumber) updates.vehicleNumber = updates.vehicleNumber.toUpperCase();
    if (updates.ownerPanCard) updates.ownerPanCard = updates.ownerPanCard.toUpperCase();
    if (updates.rcNumber) updates.rcNumber = updates.rcNumber.toUpperCase();

    const updatedOwner = await Owner.findOneAndUpdate(
      { _id: ownerId, companyId: user.companyId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedOwner) {
      return NextResponse.json({ success: false, message: "Owner not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedOwner }, { status: 200 });
  } catch (error) {
    console.error("PUT /owners error:", error);
    return NextResponse.json({ success: false, message: "Failed to update owner" }, { status: 500 });
  }
}