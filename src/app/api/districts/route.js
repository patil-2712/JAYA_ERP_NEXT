import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import District from "./schema";
import State from "@/app/api/states/schema";
import { getTokenFromHeader, verifyJWT } from "@/lib/auth";

// ✅ Role-based access check
function isAuthorized(user) {
  return (
    user?.type === "company" ||
    user?.role === "Admin" ||
    user?.permissions?.includes("district")
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
   GET /api/districts?state=STATE_ID
======================================== */
export async function GET(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    const url = new URL(req.url);
    const stateId = url.searchParams.get("state");

    if (!stateId) {
      return NextResponse.json({ success: false, message: "State ID is required" }, { status: 400 });
    }

    // Verify state belongs to user's company
    const state = await State.findOne({ 
      _id: stateId, 
      companyId: user.companyId 
    });

    if (!state) {
      return NextResponse.json({ success: false, message: "State not found" }, { status: 404 });
    }

    // Fetch districts for this state
    const districts = await District.find({
      state: stateId,
      companyId: user.companyId,
    }).sort({ name: 1 });

    return NextResponse.json({ success: true, data: districts }, { status: 200 });
  } catch (error) {
    console.error("GET /districts error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch districts" }, { status: 500 });
  }
}

/* ========================================
   POST /api/districts
======================================== */
export async function POST(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    const { name, code, state } = await req.json();

    if (!name || !code || !state) {
      return NextResponse.json({ success: false, message: "Name, code, and state are required" }, { status: 400 });
    }

    // ✅ Find state by ID AND companyId
    const stateDoc = await State.findOne({ 
      _id: state, 
      companyId: user.companyId 
    });

    if (!stateDoc) {
      return NextResponse.json({ success: false, message: "State not found" }, { status: 404 });
    }

    // ✅ Prevent duplicate district code in the same state & company
    const existingDistrict = await District.findOne({
      code,
      state: stateDoc._id,
      companyId: user.companyId,
    });
    
    if (existingDistrict) {
      return NextResponse.json({ success: false, message: "District code already exists for this state" }, { status: 400 });
    }

    // ✅ Create new district
    const newDistrict = new District({
      name,
      code,
      state: stateDoc._id,
      country: stateDoc.country,
      companyId: user.companyId,
      createdBy: user.id,
    });

    await newDistrict.save();
    return NextResponse.json({ success: true, data: newDistrict }, { status: 201 });
  } catch (error) {
    console.error("POST /districts error:", error);
    return NextResponse.json({ success: false, message: "Failed to create district" }, { status: 500 });
  }
}

/* ========================================
   DELETE /api/districts?id=123
======================================== */
export async function DELETE(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    const url = new URL(req.url);
    const districtId = url.searchParams.get("id");

    if (!districtId) {
      return NextResponse.json({ success: false, message: "District ID is required" }, { status: 400 });
    }

    const deletedDistrict = await District.findOneAndDelete({
      _id: districtId,
      companyId: user.companyId,
    });

    if (!deletedDistrict) {
      return NextResponse.json({ success: false, message: "District not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "District deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /districts error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete district" }, { status: 500 });
  }
}