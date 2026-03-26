// app/api/vehicles/route.js
import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Vehicle from "./Vehicle";
import { getTokenFromHeader, verifyJWT } from "@/lib/auth";

// ✅ Role-based access check
function isAuthorized(user) {
  return (
    user?.type === "company" ||
    user?.role === "Admin" ||
    user?.permissions?.includes("vehicle")
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
   GET /api/vehicles
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
        { vehicleNumber: { $regex: search, $options: "i" } },
        { rcNumber: { $regex: search, $options: "i" } },
        { ownerName: { $regex: search, $options: "i" } },
        { chasisNumber: { $regex: search, $options: "i" } },
      ];
    }

    const vehicles = await Vehicle.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: vehicles }, { status: 200 });
  } catch (err) {
    console.error("GET /vehicles error:", err);
    return NextResponse.json({ success: false, message: "Failed to fetch vehicles" }, { status: 500 });
  }
}

/* ========================================
   POST /api/vehicles
======================================== */
export async function POST(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    const { vehicleNumber, rcNumber, pucNumber, fitnessNumber, ownerName, chasisNumber, insuranceNumber, isActive } = await req.json();

    // Validation
    if (!vehicleNumber || !rcNumber || !ownerName) {
      return NextResponse.json({ 
        success: false, 
        message: "Vehicle number, RC number, and owner name are required" 
      }, { status: 400 });
    }

    // ✅ Prevent duplicate vehicle number in the same company
    const existingVehicle = await Vehicle.findOne({
      vehicleNumber: vehicleNumber.toUpperCase(),
      companyId: user.companyId,
    });
    
    if (existingVehicle) {
      return NextResponse.json({ 
        success: false, 
        message: "Vehicle number already exists for this company" 
      }, { status: 400 });
    }

    // ✅ Create new vehicle
    const newVehicle = new Vehicle({
      vehicleNumber: vehicleNumber.toUpperCase(),
      rcNumber: rcNumber.toUpperCase(),
      pucNumber: pucNumber?.toUpperCase(),
      fitnessNumber: fitnessNumber?.toUpperCase(),
      ownerName,
      chasisNumber: chasisNumber?.toUpperCase(),
      insuranceNumber: insuranceNumber?.toUpperCase(),
      isActive: isActive !== undefined ? isActive : true,
      companyId: user.companyId,
      createdBy: user.id,
    });

    await newVehicle.save();
    return NextResponse.json({ success: true, data: newVehicle }, { status: 201 });
  } catch (error) {
    console.error("POST /vehicles error:", error);
    return NextResponse.json({ success: false, message: "Failed to create vehicle" }, { status: 500 });
  }
}

/* ========================================
   DELETE /api/vehicles?id=123
======================================== */
export async function DELETE(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    const url = new URL(req.url);
    const vehicleId = url.searchParams.get("id");

    if (!vehicleId) {
      return NextResponse.json({ success: false, message: "Vehicle ID is required" }, { status: 400 });
    }

    const deletedVehicle = await Vehicle.findOneAndDelete({
      _id: vehicleId,
      companyId: user.companyId,
    });

    if (!deletedVehicle) {
      return NextResponse.json({ success: false, message: "Vehicle not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Vehicle deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /vehicles error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete vehicle" }, { status: 500 });
  }
}

/* ========================================
   PUT /api/vehicles (for update)
======================================== */
export async function PUT(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    const { searchParams } = new URL(req.url);
    const vehicleId = searchParams.get("id");
    const updates = await req.json();

    if (!vehicleId) {
      return NextResponse.json({ success: false, message: "Vehicle ID is required" }, { status: 400 });
    }

    // Check for duplicate vehicle number if it's being updated
    if (updates.vehicleNumber) {
      const existingVehicle = await Vehicle.findOne({
        vehicleNumber: updates.vehicleNumber.toUpperCase(),
        companyId: user.companyId,
        _id: { $ne: vehicleId }
      });
      
      if (existingVehicle) {
        return NextResponse.json({ 
          success: false, 
          message: "Vehicle number already exists for this company" 
        }, { status: 400 });
      }
      
      updates.vehicleNumber = updates.vehicleNumber.toUpperCase();
    }

    // Convert string fields to uppercase
    if (updates.rcNumber) updates.rcNumber = updates.rcNumber.toUpperCase();
    if (updates.pucNumber) updates.pucNumber = updates.pucNumber.toUpperCase();
    if (updates.fitnessNumber) updates.fitnessNumber = updates.fitnessNumber.toUpperCase();
    if (updates.chasisNumber) updates.chasisNumber = updates.chasisNumber.toUpperCase();
    if (updates.insuranceNumber) updates.insuranceNumber = updates.insuranceNumber.toUpperCase();

    const updatedVehicle = await Vehicle.findOneAndUpdate(
      { _id: vehicleId, companyId: user.companyId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedVehicle) {
      return NextResponse.json({ success: false, message: "Vehicle not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedVehicle }, { status: 200 });
  } catch (error) {
    console.error("PUT /vehicles error:", error);
    return NextResponse.json({ success: false, message: "Failed to update vehicle" }, { status: 500 });
  }
}