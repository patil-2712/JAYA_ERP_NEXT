import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import RateMaster from "./schema";
import Branch from "../branches/schema";
import Location from "../locations/schema";
import Customer from "@/models/CustomerModel";
import { getTokenFromHeader, verifyJWT } from "@/lib/auth";

// Role-based access check
function isAuthorized(user) {
  return (
    user?.type === "company" ||
    user?.role === "Admin" ||
    user?.permissions?.includes("rate-master")
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
   GET /api/rate-master
======================================== */
export async function GET(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    const rateMasters = await RateMaster.find({
      companyId: user.companyId,
    }).sort({ createdAt: -1 });

    // Populate branch, location, and customer names
    const rateMastersWithNames = await Promise.all(
      rateMasters.map(async (rm) => {
        const branch = await Branch.findById(rm.branchId);
        const location = await Location.findById(rm.locationId);
        const customer = await Customer.findById(rm.customerId);
        
        return {
          ...rm.toObject(),
          branchName: branch?.name || '',
          branchCode: branch?.code || '',
          locationName: location?.name || '',
          customerName: customer?.customerName || '',
          customerCode: customer?.customerCode || '',
        };
      })
    );

    return NextResponse.json({ success: true, data: rateMastersWithNames }, { status: 200 });
  } catch (err) {
    console.error("GET /rate-master error:", err);
    return NextResponse.json({ success: false, message: "Failed to fetch rate masters" }, { status: 500 });
  }
}

/* ========================================
   POST /api/rate-master
======================================== */
export async function POST(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    const { title, customerId, branchId, locationId, rateSlabs } = await req.json();

    if (!title || !title.trim()) {
      return NextResponse.json({ 
        success: false, 
        message: "Title is required" 
      }, { status: 400 });
    }

    if (!customerId) {
      return NextResponse.json({ 
        success: false, 
        message: "Customer is required" 
      }, { status: 400 });
    }

    if (!branchId) {
      return NextResponse.json({ 
        success: false, 
        message: "Branch is required" 
      }, { status: 400 });
    }

    if (!locationId) {
      return NextResponse.json({ 
        success: false, 
        message: "Location is required" 
      }, { status: 400 });
    }

    if (!rateSlabs || rateSlabs.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "At least one rate slab is required" 
      }, { status: 400 });
    }

    // Validate customer exists
    const customer = await Customer.findOne({ _id: customerId, companyId: user.companyId });
    if (!customer) {
      return NextResponse.json({ success: false, message: "Invalid customer selected" }, { status: 400 });
    }

    // Validate branch exists
    const branch = await Branch.findOne({ _id: branchId, companyId: user.companyId });
    if (!branch) {
      return NextResponse.json({ success: false, message: "Invalid branch selected" }, { status: 400 });
    }

    // Validate location exists
    const location = await Location.findOne({ _id: locationId, companyId: user.companyId });
    if (!location) {
      return NextResponse.json({ success: false, message: "Invalid location selected" }, { status: 400 });
    }

    // Check for duplicate title per company
    const existingRateMaster = await RateMaster.findOne({
      title: title.trim(),
      companyId: user.companyId,
    });
    
    if (existingRateMaster) {
      return NextResponse.json({ success: false, message: "Rate master with this title already exists" }, { status: 400 });
    }

    // Validate rate slabs
    for (let slab of rateSlabs) {
      if (slab.fromQty >= slab.toQty) {
        return NextResponse.json({ 
          success: false, 
          message: "From quantity must be less than To quantity" 
        }, { status: 400 });
      }
    }

    // Check for overlapping ranges
    const sortedSlabs = [...rateSlabs].sort((a, b) => a.fromQty - b.fromQty);
    for (let i = 0; i < sortedSlabs.length - 1; i++) {
      if (sortedSlabs[i].toQty >= sortedSlabs[i + 1].fromQty) {
        return NextResponse.json({ 
          success: false, 
          message: "Rate slabs cannot overlap. Please check the quantity ranges." 
        }, { status: 400 });
      }
    }

    // Create new rate master
    const newRateMaster = new RateMaster({
      title: title.trim(),
      customerId,
      branchId,
      locationId,
      rateSlabs: rateSlabs.map(slab => ({
        fromQty: slab.fromQty,
        toQty: slab.toQty,
        rate: slab.rate
      })),
      companyId: user.companyId,
      createdBy: user.id,
    });

    await newRateMaster.save();

    // Get populated data for response
    const populatedRateMaster = {
      ...newRateMaster.toObject(),
      branchName: branch.name,
      branchCode: branch.code,
      locationName: location.name,
      customerName: customer.customerName,
      customerCode: customer.customerCode,
    };

    return NextResponse.json({ success: true, data: populatedRateMaster }, { status: 201 });
  } catch (error) {
    console.error("POST /rate-master error:", error);
    return NextResponse.json({ success: false, message: "Failed to create rate master" }, { status: 500 });
  }
}

/* ========================================
   PUT /api/rate-master?id=123
======================================== */
export async function PUT(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    const url = new URL(req.url);
    const rateMasterId = url.searchParams.get("id");
    const { title, customerId, branchId, locationId, rateSlabs } = await req.json();

    if (!rateMasterId) {
      return NextResponse.json({ success: false, message: "Rate master ID is required" }, { status: 400 });
    }

    if (!title || !title.trim()) {
      return NextResponse.json({ 
        success: false, 
        message: "Title is required" 
      }, { status: 400 });
    }

    if (!customerId) {
      return NextResponse.json({ 
        success: false, 
        message: "Customer is required" 
      }, { status: 400 });
    }

    if (!branchId) {
      return NextResponse.json({ 
        success: false, 
        message: "Branch is required" 
      }, { status: 400 });
    }

    if (!locationId) {
      return NextResponse.json({ 
        success: false, 
        message: "Location is required" 
      }, { status: 400 });
    }

    if (!rateSlabs || rateSlabs.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "At least one rate slab is required" 
      }, { status: 400 });
    }

    // Validate customer exists
    const customer = await Customer.findOne({ _id: customerId, companyId: user.companyId });
    if (!customer) {
      return NextResponse.json({ success: false, message: "Invalid customer selected" }, { status: 400 });
    }

    // Validate branch exists
    const branch = await Branch.findOne({ _id: branchId, companyId: user.companyId });
    if (!branch) {
      return NextResponse.json({ success: false, message: "Invalid branch selected" }, { status: 400 });
    }

    // Validate location exists
    const location = await Location.findOne({ _id: locationId, companyId: user.companyId });
    if (!location) {
      return NextResponse.json({ success: false, message: "Invalid location selected" }, { status: 400 });
    }

    // Check if another rate master with same title exists
    const existingRateMaster = await RateMaster.findOne({
      _id: { $ne: rateMasterId },
      title: title.trim(),
      companyId: user.companyId,
    });
    
    if (existingRateMaster) {
      return NextResponse.json({ success: false, message: "Rate master with this title already exists" }, { status: 400 });
    }

    // Validate rate slabs
    for (let slab of rateSlabs) {
      if (slab.fromQty >= slab.toQty) {
        return NextResponse.json({ 
          success: false, 
          message: "From quantity must be less than To quantity" 
        }, { status: 400 });
      }
    }

    // Check for overlapping ranges
    const sortedSlabs = [...rateSlabs].sort((a, b) => a.fromQty - b.fromQty);
    for (let i = 0; i < sortedSlabs.length - 1; i++) {
      if (sortedSlabs[i].toQty >= sortedSlabs[i + 1].fromQty) {
        return NextResponse.json({ 
          success: false, 
          message: "Rate slabs cannot overlap. Please check the quantity ranges." 
        }, { status: 400 });
      }
    }

    // Update rate master
    const updatedRateMaster = await RateMaster.findOneAndUpdate(
      { _id: rateMasterId, companyId: user.companyId },
      {
        title: title.trim(),
        customerId,
        branchId,
        locationId,
        rateSlabs: rateSlabs.map(slab => ({
          fromQty: slab.fromQty,
          toQty: slab.toQty,
          rate: slab.rate
        }))
      },
      { new: true }
    );

    if (!updatedRateMaster) {
      return NextResponse.json({ success: false, message: "Rate master not found" }, { status: 404 });
    }

    // Get populated data for response
    const populatedRateMaster = {
      ...updatedRateMaster.toObject(),
      branchName: branch.name,
      branchCode: branch.code,
      locationName: location.name,
      customerName: customer.customerName,
      customerCode: customer.customerCode,
    };

    return NextResponse.json({ success: true, data: populatedRateMaster }, { status: 200 });
  } catch (error) {
    console.error("PUT /rate-master error:", error);
    return NextResponse.json({ success: false, message: "Failed to update rate master" }, { status: 500 });
  }
}

/* ========================================
   DELETE /api/rate-master?id=123
======================================== */
export async function DELETE(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    const url = new URL(req.url);
    const rateMasterId = url.searchParams.get("id");

    if (!rateMasterId) {
      return NextResponse.json({ success: false, message: "Rate master ID is required" }, { status: 400 });
    }

    const deletedRateMaster = await RateMaster.findOneAndDelete({
      _id: rateMasterId,
      companyId: user.companyId,
    });

    if (!deletedRateMaster) {
      return NextResponse.json({ success: false, message: "Rate master not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Rate master deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /rate-master error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete rate master" }, { status: 500 });
  }
}