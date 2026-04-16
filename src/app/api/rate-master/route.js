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
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    // If fetching single rate master by ID
    if (id) {
      const rateMaster = await RateMaster.findOne({
        _id: id,
        companyId: user.companyId,
      });
      
      if (!rateMaster) {
        return NextResponse.json({ success: false, message: "Rate master not found" }, { status: 404 });
      }
      
      const branch = await Branch.findById(rateMaster.branchId);
      const customer = await Customer.findById(rateMaster.customerId);
      
      const locationRatesWithNames = await Promise.all(
        rateMaster.locationRates.map(async (locRate) => {
          const location = await Location.findById(locRate.locationId);
          return {
            _id: locRate._id,
            locationId: locRate.locationId,
            fromQty: locRate.fromQty,
            toQty: locRate.toQty,
            rate: locRate.rate,
            locationName: location?.name || 'Unknown Location'
          };
        })
      );
      
      return NextResponse.json({ 
        success: true, 
        data: {
          _id: rateMaster._id,
          title: rateMaster.title,
          customerId: rateMaster.customerId,
          branchId: rateMaster.branchId,
          companyId: rateMaster.companyId,
          createdBy: rateMaster.createdBy,
          isActive: rateMaster.isActive,
          createdAt: rateMaster.createdAt,
          updatedAt: rateMaster.updatedAt,
          branchName: branch?.name || '',
          customerName: customer?.customerName || '',
          weightRule: rateMaster.weightRule,
          approvalOption: rateMaster.approvalOption,
          locationRates: locationRatesWithNames
        }
      }, { status: 200 });
    }
    
    // If fetching all rate masters
    const rateMasters = await RateMaster.find({
      companyId: user.companyId,
    }).sort({ createdAt: -1 });

    const rateMastersWithNames = await Promise.all(
      rateMasters.map(async (rm) => {
        const branch = await Branch.findById(rm.branchId);
        const customer = await Customer.findById(rm.customerId);
        
        let locationRatesWithNames = [];
        
        if (rm.locationRates && Array.isArray(rm.locationRates) && rm.locationRates.length > 0) {
          locationRatesWithNames = await Promise.all(
            rm.locationRates.map(async (locRate) => {
              const location = await Location.findById(locRate.locationId);
              return {
                _id: locRate._id,
                locationId: locRate.locationId,
                fromQty: locRate.fromQty,
                toQty: locRate.toQty,
                rate: locRate.rate,
                locationName: location?.name || 'Unknown Location'
              };
            })
          );
        }
        
        return {
          _id: rm._id,
          title: rm.title,
          customerId: rm.customerId,
          branchId: rm.branchId,
          companyId: rm.companyId,
          createdBy: rm.createdBy,
          isActive: rm.isActive,
          createdAt: rm.createdAt,
          updatedAt: rm.updatedAt,
          branchName: branch?.name || '',
          branchCode: branch?.code || '',
          customerName: customer?.customerName || '',
          customerCode: customer?.customerCode || '',
          weightRule: rm.weightRule,
          approvalOption: rm.approvalOption,
          locationRates: locationRatesWithNames
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
/* ========================================
   POST /api/rate-master
   FIXED - Include weightRule and approvalOption
======================================== */
export async function POST(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    const { title, customerId, branchId, locationRates, weightRule, approvalOption } = await req.json();

    console.log("Received data:", { title, customerId, branchId, weightRule, approvalOption }); // Debug log

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, message: "Title is required" }, { status: 400 });
    }

    if (!customerId) {
      return NextResponse.json({ success: false, message: "Customer is required" }, { status: 400 });
    }

    if (!branchId) {
      return NextResponse.json({ success: false, message: "Branch is required" }, { status: 400 });
    }

    if (!approvalOption) {
      return NextResponse.json({ success: false, message: "Approval option is required" }, { status: 400 });
    }

    let validatedLocationRates = [];
    
    if (locationRates && Array.isArray(locationRates) && locationRates.length > 0) {
      for (let locRate of locationRates) {
        if (!locRate.locationId) {
          return NextResponse.json({ success: false, message: "Location is required for all rows" }, { status: 400 });
        }
        
        const location = await Location.findOne({ _id: locRate.locationId, companyId: user.companyId });
        if (!location) {
          return NextResponse.json({ success: false, message: `Invalid location selected` }, { status: 400 });
        }
        
        const fromQty = parseFloat(locRate.fromQty);
        const toQty = parseFloat(locRate.toQty);
        const rate = parseFloat(locRate.rate);
        
        if (isNaN(fromQty) || isNaN(toQty) || isNaN(rate)) {
          return NextResponse.json({ 
            success: false, 
            message: `Invalid number format for location ${location.name}` 
          }, { status: 400 });
        }
        
        if (fromQty >= toQty) {
          return NextResponse.json({ 
            success: false, 
            message: `From quantity (${fromQty}) must be less than To quantity (${toQty}) for location ${location.name}` 
          }, { status: 400 });
        }
        
        if (fromQty < 0 || toQty < 0 || rate < 0) {
          return NextResponse.json({ 
            success: false, 
            message: "Quantities and rate cannot be negative" 
          }, { status: 400 });
        }
        
        validatedLocationRates.push({
          locationId: locRate.locationId,
          fromQty: fromQty,
          toQty: toQty,
          rate: rate
        });
      }
    }

    const existingRateMaster = await RateMaster.findOne({
      title: title.trim(),
      companyId: user.companyId,
    });
    
    if (existingRateMaster) {
      return NextResponse.json({ success: false, message: "Rate master with this title already exists" }, { status: 400 });
    }

    // FIXED: Make sure weightRule and approvalOption are included
    const newRateMaster = new RateMaster({
      title: title.trim(),
      customerId,
      branchId,
      locationRates: validatedLocationRates,
      weightRule: weightRule || 'all_weights',  // Make sure this is included
      approvalOption: approvalOption,            // Make sure this is included
      companyId: user.companyId,
      createdBy: user.id,
      isActive: true
    });

    console.log("Saving rate master with data:", newRateMaster); // Debug log

    const savedRateMaster = await newRateMaster.save();
    
    console.log("Saved rate master:", savedRateMaster); // Debug log

    const customer = await Customer.findById(customerId);
    const branch = await Branch.findById(branchId);

    let locationRatesWithNames = [];
    if (validatedLocationRates.length > 0) {
      locationRatesWithNames = await Promise.all(
        savedRateMaster.locationRates.map(async (locRate) => {
          const location = await Location.findById(locRate.locationId);
          return {
            _id: locRate._id,
            locationId: locRate.locationId,
            fromQty: locRate.fromQty,
            toQty: locRate.toQty,
            rate: locRate.rate,
            locationName: location?.name || 'Unknown Location'
          };
        })
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        _id: savedRateMaster._id,
        title: savedRateMaster.title,
        customerId: savedRateMaster.customerId,
        branchId: savedRateMaster.branchId,
        companyId: savedRateMaster.companyId,
        createdBy: savedRateMaster.createdBy,
        isActive: savedRateMaster.isActive,
        createdAt: savedRateMaster.createdAt,
        updatedAt: savedRateMaster.updatedAt,
        weightRule: savedRateMaster.weightRule,      // Include in response
        approvalOption: savedRateMaster.approvalOption, // Include in response
        branchName: branch?.name || '',
        customerName: customer?.customerName || '',
        locationRates: locationRatesWithNames
      }
    }, { status: 201 });
  } catch (error) {
    console.error("POST /rate-master error:", error);
    return NextResponse.json({ success: false, message: "Failed to create rate master: " + error.message }, { status: 500 });
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
    const { title, customerId, branchId, locationRates, weightRule, approvalOption } = await req.json();

    if (!rateMasterId) {
      return NextResponse.json({ success: false, message: "Rate master ID is required" }, { status: 400 });
    }

    // Get existing rate master
    const existingRateMaster = await RateMaster.findOne({ 
      _id: rateMasterId, 
      companyId: user.companyId 
    });
    
    if (!existingRateMaster) {
      return NextResponse.json({ success: false, message: "Rate master not found" }, { status: 404 });
    }

    // Use existing values if not provided
    const finalTitle = title !== undefined ? title : existingRateMaster.title;
    const finalCustomerId = customerId !== undefined ? customerId : existingRateMaster.customerId;
    const finalBranchId = branchId !== undefined ? branchId : existingRateMaster.branchId;
    const finalWeightRule = weightRule !== undefined ? weightRule : existingRateMaster.weightRule;
    const finalApprovalOption = approvalOption !== undefined ? approvalOption : existingRateMaster.approvalOption;
    
    if (!finalTitle || !finalTitle.trim()) {
      return NextResponse.json({ success: false, message: "Title is required" }, { status: 400 });
    }

    // Validate location rates if provided
    let validatedLocationRates = [];
    if (locationRates && Array.isArray(locationRates)) {
      // Group rates by locationId to check overlaps within same location
      const ratesByLocation = {};
      
      for (let locRate of locationRates) {
        if (!locRate.locationId) {
          return NextResponse.json({ success: false, message: "Location is required for all rows" }, { status: 400 });
        }
        
        const location = await Location.findOne({ _id: locRate.locationId, companyId: user.companyId });
        if (!location) {
          return NextResponse.json({ success: false, message: `Invalid location selected` }, { status: 400 });
        }
        
        const fromQty = parseFloat(locRate.fromQty);
        const toQty = parseFloat(locRate.toQty);
        const rate = parseFloat(locRate.rate);
        
        if (isNaN(fromQty) || isNaN(toQty) || isNaN(rate)) {
          return NextResponse.json({ 
            success: false, 
            message: `Invalid number format for location ${location.name}` 
          }, { status: 400 });
        }
        
        if (fromQty >= toQty) {
          return NextResponse.json({ 
            success: false, 
            message: `From quantity (${fromQty}) must be less than To quantity (${toQty}) for location ${location.name}` 
          }, { status: 400 });
        }
        
        if (fromQty < 0 || toQty < 0 || rate < 0) {
          return NextResponse.json({ 
            success: false, 
            message: "Quantities and rate cannot be negative" 
          }, { status: 400 });
        }
        
        // Group by locationId for overlap check
        if (!ratesByLocation[locRate.locationId]) {
          ratesByLocation[locRate.locationId] = [];
        }
        ratesByLocation[locRate.locationId].push({
          fromQty,
          toQty,
          rate,
          locationName: location.name
        });
      }
      
      // Check for overlaps within each location
      for (const [locationId, ranges] of Object.entries(ratesByLocation)) {
        // Sort ranges by fromQty
        ranges.sort((a, b) => a.fromQty - b.fromQty);
        
        // Check for overlaps
        for (let i = 0; i < ranges.length - 1; i++) {
          const current = ranges[i];
          const next = ranges[i + 1];
          
          // Check if ranges overlap or touch
          if (current.toQty > next.fromQty) {
            return NextResponse.json({ 
              success: false, 
              message: `Weight range overlap for location ${ranges[0].locationName}: ${current.fromQty}-${current.toQty} overlaps with ${next.fromQty}-${next.toQty}. Ranges should not overlap for the same location.` 
            }, { status: 400 });
          }
        }
      }
      
      // If no overlaps, add all validated rates
      for (let locRate of locationRates) {
        validatedLocationRates.push({
          locationId: locRate.locationId,
          fromQty: parseFloat(locRate.fromQty),
          toQty: parseFloat(locRate.toQty),
          rate: parseFloat(locRate.rate)
        });
      }
      
    } else {
      // If locationRates is not provided, keep existing ones
      validatedLocationRates = existingRateMaster.locationRates;
    }

    // Update the rate master with replaced locationRates
    const updatedRateMaster = await RateMaster.findOneAndUpdate(
      { _id: rateMasterId, companyId: user.companyId },
      {
        title: finalTitle.trim(),
        customerId: finalCustomerId,
        branchId: finalBranchId,
        locationRates: validatedLocationRates,
        weightRule: finalWeightRule,
        approvalOption: finalApprovalOption
      },
      { new: true }
    );

    const branch = await Branch.findById(updatedRateMaster.branchId);
    const customer = await Customer.findById(updatedRateMaster.customerId);
    
    const locationRatesWithNames = await Promise.all(
      updatedRateMaster.locationRates.map(async (locRate) => {
        const location = await Location.findById(locRate.locationId);
        return {
          _id: locRate._id,
          locationId: locRate.locationId,
          fromQty: locRate.fromQty,
          toQty: locRate.toQty,
          rate: locRate.rate,
          locationName: location?.name || 'Unknown Location'
        };
      })
    );

    return NextResponse.json({ 
      success: true, 
      data: {
        _id: updatedRateMaster._id,
        title: updatedRateMaster.title,
        customerId: updatedRateMaster.customerId,
        branchId: updatedRateMaster.branchId,
        companyId: updatedRateMaster.companyId,
        createdBy: updatedRateMaster.createdBy,
        isActive: updatedRateMaster.isActive,
        createdAt: updatedRateMaster.createdAt,
        updatedAt: updatedRateMaster.updatedAt,
        branchName: branch?.name || '',
        customerName: customer?.customerName || '',
        weightRule: updatedRateMaster.weightRule,
        approvalOption: updatedRateMaster.approvalOption,
        locationRates: locationRatesWithNames
      }
    }, { status: 200 });
  } catch (error) {
    console.error("PUT /rate-master error:", error);
    return NextResponse.json({ success: false, message: "Failed to update rate master: " + error.message }, { status: 500 });
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