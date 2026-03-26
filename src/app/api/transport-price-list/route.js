import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import TransportPriceList from "./TransportPriceList";
import { getTokenFromHeader, verifyJWT } from "@/lib/auth";

// ✅ Role-based access check
function isAuthorized(user) {
  return (
    user?.type === "company" ||
    user?.role === "Admin" ||
    user?.permissions?.includes("transport")
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
   GET /api/transport-price-list
======================================== */
export async function GET(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";
    
    let query = { companyId: user.companyId };
    
    if (search) {
      query.$or = [
        { pincode: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { district: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } }
      ];
    }

    const priceList = await TransportPriceList.find(query).sort({ pincode: 1 });

    return NextResponse.json({ success: true, data: priceList }, { status: 200 });
  } catch (err) {
    console.error("GET /transport-price-list error:", err);
    return NextResponse.json({ success: false, message: "Failed to fetch price list" }, { status: 500 });
  }
}

/* ========================================
   POST /api/transport-price-list
======================================== */
export async function POST(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    const { pincode, city, district, state, price075, price275to3, price3to5, price5Above } = await req.json();

    if (!pincode || !city || !district || !state) {
      return NextResponse.json({ 
        success: false, 
        message: "Pincode, City, District, and State are required" 
      }, { status: 400 });
    }

    // ✅ Prevent duplicate pincode
    const existing = await TransportPriceList.findOne({
      pincode: pincode,
      companyId: user.companyId,
    });
    
    if (existing) {
      return NextResponse.json({ success: false, message: "Entry with this pincode already exists" }, { status: 400 });
    }

    // ✅ Create new price entry
    const newPrice = new TransportPriceList({
      pincode,
      city,
      district,
      state,
      price075: price075 || 0,
      price275to3: price275to3 || 0,
      price3to5: price3to5 || 0,
      price5Above: price5Above || 0,
      companyId: user.companyId,
      createdBy: user.id,
    });

    await newPrice.save();
    return NextResponse.json({ success: true, data: newPrice }, { status: 201 });
  } catch (error) {
    console.error("POST /transport-price-list error:", error);
    return NextResponse.json({ success: false, message: "Failed to create price entry" }, { status: 500 });
  }
}

/* ========================================
   PUT /api/transport-price-list
======================================== */
export async function PUT(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    const { id, pincode, city, district, state, price075, price275to3, price3to5, price5Above } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });
    }

    // Check for duplicate if pincode is being changed
    if (pincode) {
      const existing = await TransportPriceList.findOne({
        pincode: pincode,
        companyId: user.companyId,
        _id: { $ne: id }
      });
      
      if (existing) {
        return NextResponse.json({ success: false, message: "Entry with this pincode already exists" }, { status: 400 });
      }
    }

    const updatedPrice = await TransportPriceList.findOneAndUpdate(
      { _id: id, companyId: user.companyId },
      {
        pincode,
        city,
        district,
        state,
        price075,
        price275to3,
        price3to5,
        price5Above
      },
      { new: true }
    );

    if (!updatedPrice) {
      return NextResponse.json({ success: false, message: "Price entry not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedPrice }, { status: 200 });
  } catch (error) {
    console.error("PUT /transport-price-list error:", error);
    return NextResponse.json({ success: false, message: "Failed to update price entry" }, { status: 500 });
  }
}

/* ========================================
   DELETE /api/transport-price-list?id=123
======================================== */
export async function DELETE(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });
    }

    const deleted = await TransportPriceList.findOneAndDelete({
      _id: id,
      companyId: user.companyId,
    });

    if (!deleted) {
      return NextResponse.json({ success: false, message: "Price entry not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Price entry deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /transport-price-list error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete price entry" }, { status: 500 });
  }
}