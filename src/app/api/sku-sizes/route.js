import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import SKUSize from "./schema";
import { getTokenFromHeader, verifyJWT } from "@/lib/auth";

// ✅ Role-based access check
function isAuthorized(user) {
  return (
    user?.type === "company" ||
    user?.role === "Admin" ||
    user?.permissions?.includes("sku-size")
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

// ✅ Valid units from your list
const validUnits = [
  'BAG', 'BAL', 'BDL', 'BKL', 'BOU', 'BOX', 'BTL', 'BUN', 'CAN', 'CBM', 
  'CCM', 'CMS', 'CTN', 'DOZ', 'DRM', 'GGK', 'GMS', 'GRS', 'GYD', 'KGS', 
  'KLR', 'KME', 'LTR', 'MLT', 'MTR', 'MTS', 'NOS', 'OTH', 'PAC', 'PCS', 
  'PRS', 'QTL', 'ROL', 'SET', 'SQF', 'SQM', 'SQY', 'TBS', 'TGM', 'THD', 
  'TON', 'TUB', 'UGS', 'UNT', 'YDS'
];

/* ========================================
   GET /api/sku-sizes
======================================== */
export async function GET(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    const sizes = await SKUSize.find({
      companyId: user.companyId,
      isActive: true
    }).sort({ value: 1, unit: 1 });

    return NextResponse.json({ success: true, data: sizes }, { status: 200 });
  } catch (err) {
    console.error("GET /sku-sizes error:", err);
    return NextResponse.json({ success: false, message: "Failed to fetch SKU sizes" }, { status: 500 });
  }
}

/* ========================================
   POST /api/sku-sizes
======================================== */
export async function POST(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    const { value, unit } = await req.json();

    if (!value || !unit) {
      return NextResponse.json({ success: false, message: "Value and unit are required" }, { status: 400 });
    }

    if (isNaN(value) || value <= 0) {
      return NextResponse.json({ success: false, message: "Valid positive value is required" }, { status: 400 });
    }

    if (!validUnits.includes(unit)) {
      return NextResponse.json({ success: false, message: "Invalid unit selected" }, { status: 400 });
    }

    // ✅ Check if same size already exists
    const existingSize = await SKUSize.findOne({
      value: value,
      unit: unit,
      companyId: user.companyId,
    });
    
    if (existingSize) {
      return NextResponse.json({ success: false, message: "SKU size already exists" }, { status: 400 });
    }

    // ✅ Create new SKU size
    const newSize = new SKUSize({
      value: value,
      unit: unit,
      companyId: user.companyId,
      createdBy: user.id,
    });

    await newSize.save();
    return NextResponse.json({ success: true, data: newSize }, { status: 201 });
  } catch (error) {
    console.error("POST /sku-sizes error:", error);
    return NextResponse.json({ success: false, message: "Failed to create SKU size" }, { status: 500 });
  }
}

/* ========================================
   PUT /api/sku-sizes
======================================== */
export async function PUT(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    const { id, value, unit } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, message: "SKU size ID is required" }, { status: 400 });
    }

    if (!value || !unit) {
      return NextResponse.json({ success: false, message: "Value and unit are required" }, { status: 400 });
    }

    if (isNaN(value) || value <= 0) {
      return NextResponse.json({ success: false, message: "Valid positive value is required" }, { status: 400 });
    }

    if (!validUnits.includes(unit)) {
      return NextResponse.json({ success: false, message: "Invalid unit selected" }, { status: 400 });
    }

    // ✅ Check if size exists
    const existingSize = await SKUSize.findOne({
      _id: id,
      companyId: user.companyId,
      isActive: true
    });

    if (!existingSize) {
      return NextResponse.json({ success: false, message: "SKU size not found" }, { status: 404 });
    }

    // ✅ Check for duplicates
    const duplicateSize = await SKUSize.findOne({
      value: value,
      unit: unit,
      companyId: user.companyId,
      _id: { $ne: id }
    });

    if (duplicateSize) {
      return NextResponse.json({ success: false, message: "SKU size already exists" }, { status: 400 });
    }

    // ✅ Update
    existingSize.value = value;
    existingSize.unit = unit;
    await existingSize.save();

    return NextResponse.json({ success: true, data: existingSize }, { status: 200 });
  } catch (error) {
    console.error("PUT /sku-sizes error:", error);
    return NextResponse.json({ success: false, message: "Failed to update SKU size" }, { status: 500 });
  }
}

/* ========================================
   DELETE /api/sku-sizes?id=123
======================================== */
export async function DELETE(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    const url = new URL(req.url);
    const sizeId = url.searchParams.get("id");

    if (!sizeId) {
      return NextResponse.json({ success: false, message: "SKU size ID is required" }, { status: 400 });
    }

    const updatedSize = await SKUSize.findOneAndUpdate(
      { _id: sizeId, companyId: user.companyId },
      { isActive: false },
      { new: true }
    );

    if (!updatedSize) {
      return NextResponse.json({ success: false, message: "SKU size not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "SKU size deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /sku-sizes error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete SKU size" }, { status: 500 });
  }
}