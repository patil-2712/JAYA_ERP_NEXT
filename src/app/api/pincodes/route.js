// app/api/pincodes/route.js
import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Pincode from "./Pincode";
import { getTokenFromHeader, verifyJWT } from "@/lib/auth";

// ✅ Role-based access check
function isAuthorized(user) {
  return (
    user?.type === "company" ||
    user?.role === "Admin" ||
    user?.permissions?.includes("pincode")
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
   GET /api/pincodes
======================================== */
export async function GET(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const isActive = searchParams.get("isActive");

    // Build query
    let query = { companyId: user.companyId };
    
    if (isActive !== null) {
      query.isActive = isActive === "true";
    }

    if (search) {
      query.$or = [
        { pincode: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
      ];
    }

    const pincodes = await Pincode.find(query).sort({ pincode: 1 });

    return NextResponse.json({ success: true, data: pincodes }, { status: 200 });
  } catch (err) {
    console.error("GET /pincodes error:", err);
    return NextResponse.json({ success: false, message: "Failed to fetch pincodes" }, { status: 500 });
  }
}

/* ========================================
   POST /api/pincodes
======================================== */
export async function POST(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    const { pincode, city, isActive } = await req.json();

    // Validation
    if (!pincode || !city) {
      return NextResponse.json({ 
        success: false, 
        message: "Pincode and city are required" 
      }, { status: 400 });
    }

    // Validate pincode format (6 digits)
    if (!/^\d{6}$/.test(pincode)) {
      return NextResponse.json({ 
        success: false, 
        message: "Pincode must be a 6-digit number" 
      }, { status: 400 });
    }

    // ✅ Prevent duplicate pincode in the same company
    const existingPincode = await Pincode.findOne({
      pincode,
      companyId: user.companyId,
    });
    
    if (existingPincode) {
      return NextResponse.json({ 
        success: false, 
        message: "Pincode already exists for this company" 
      }, { status: 400 });
    }

    // ✅ Create new pincode
    const newPincode = new Pincode({
      pincode,
      city: city.trim(),
      isActive: isActive !== undefined ? isActive : true,
      companyId: user.companyId,
      createdBy: user.id,
    });

    await newPincode.save();
    return NextResponse.json({ success: true, data: newPincode }, { status: 201 });
  } catch (error) {
    console.error("POST /pincodes error:", error);
    return NextResponse.json({ success: false, message: "Failed to create pincode" }, { status: 500 });
  }
}

/* ========================================
   DELETE /api/pincodes?id=123
======================================== */
export async function DELETE(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    const url = new URL(req.url);
    const pincodeId = url.searchParams.get("id");

    if (!pincodeId) {
      return NextResponse.json({ success: false, message: "Pincode ID is required" }, { status: 400 });
    }

    const deletedPincode = await Pincode.findOneAndDelete({
      _id: pincodeId,
      companyId: user.companyId,
    });

    if (!deletedPincode) {
      return NextResponse.json({ success: false, message: "Pincode not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Pincode deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /pincodes error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete pincode" }, { status: 500 });
  }
}

/* ========================================
   PUT /api/pincodes (for update)
======================================== */
export async function PUT(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    const { searchParams } = new URL(req.url);
    const pincodeId = searchParams.get("id");
    const updates = await req.json();

    if (!pincodeId) {
      return NextResponse.json({ success: false, message: "Pincode ID is required" }, { status: 400 });
    }

    // Validate pincode format if it's being updated
    if (updates.pincode && !/^\d{6}$/.test(updates.pincode)) {
      return NextResponse.json({ 
        success: false, 
        message: "Pincode must be a 6-digit number" 
      }, { status: 400 });
    }

    // Check for duplicate pincode if pincode is being updated
    if (updates.pincode) {
      const existingPincode = await Pincode.findOne({
        pincode: updates.pincode,
        companyId: user.companyId,
        _id: { $ne: pincodeId }
      });
      
      if (existingPincode) {
        return NextResponse.json({ 
          success: false, 
          message: "Pincode already exists for this company" 
        }, { status: 400 });
      }
    }

    // Trim city if provided
    if (updates.city) {
      updates.city = updates.city.trim();
    }

    const updatedPincode = await Pincode.findOneAndUpdate(
      { _id: pincodeId, companyId: user.companyId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedPincode) {
      return NextResponse.json({ success: false, message: "Pincode not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedPincode }, { status: 200 });
  } catch (error) {
    console.error("PUT /pincodes error:", error);
    return NextResponse.json({ success: false, message: "Failed to update pincode" }, { status: 500 });
  }
}