import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import RateMaster from "./schema";
import RateHistory from "./history-schema";
import Branch from "../branches/schema";
import Location from "../locations/schema";
import Customer from "@/models/CustomerModel";
import { getTokenFromHeader, verifyJWT } from "@/lib/auth";

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

export async function GET(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const history = searchParams.get('history');
    const locationId = searchParams.get('locationId');
    
    if (history && id && locationId) {
      const historyData = await RateHistory.find({
        rateMasterId: id,
        locationId: locationId
      }).sort({ revisedAt: -1 });
      
      return NextResponse.json({ success: true, data: historyData }, { status: 200 });
    }
    
    if (history && id) {
      const historyData = await RateHistory.find({
        rateMasterId: id
      }).sort({ revisedAt: -1 });
      
      return NextResponse.json({ success: true, data: historyData }, { status: 200 });
    }
    
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
            locationName: location?.name || 'Unknown Location',
            isActive: locRate.isActive,
            createdAt: locRate.createdAt,
            version: locRate.version
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
                locationName: location?.name || 'Unknown Location',
                isActive: locRate.isActive,
                createdAt: locRate.createdAt,
                version: locRate.version
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

export async function POST(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    const { title, customerId, branchId, locationRates, weightRule, approvalOption } = await req.json();

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
          rate: rate,
          isActive: true,
          createdAt: new Date(),
          version: 1
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

    const newRateMaster = new RateMaster({
      title: title.trim(),
      customerId,
      branchId,
      locationRates: validatedLocationRates,
      weightRule: weightRule || 'all_weights',
      approvalOption: approvalOption,
      companyId: user.companyId,
      createdBy: user.id,
      isActive: true
    });

    const savedRateMaster = await newRateMaster.save();

    for (let rate of validatedLocationRates) {
      const location = await Location.findById(rate.locationId);
      await RateHistory.create({
        rateMasterId: savedRateMaster._id,
        rateMasterTitle: savedRateMaster.title,
        locationId: rate.locationId,
        locationName: location?.name || 'Unknown',
        fromQty: rate.fromQty,
        toQty: rate.toQty,
        rate: rate.rate,
        version: 1,
        revisedBy: user.id,
        action: 'CREATED'
      });
    }

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
            locationName: location?.name || 'Unknown Location',
            isActive: locRate.isActive,
            createdAt: locRate.createdAt,
            version: locRate.version
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
        weightRule: savedRateMaster.weightRule,
        approvalOption: savedRateMaster.approvalOption,
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

export async function PUT(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    const url = new URL(req.url);
    const rateMasterId = url.searchParams.get("id");
    const { title, customerId, branchId, locationRates, weightRule, approvalOption, rateId } = await req.json();

    if (!rateMasterId) {
      return NextResponse.json({ success: false, message: "Rate master ID is required" }, { status: 400 });
    }

    const existingRateMaster = await RateMaster.findOne({ 
      _id: rateMasterId, 
      companyId: user.companyId 
    });
    
    if (!existingRateMaster) {
      return NextResponse.json({ success: false, message: "Rate master not found" }, { status: 404 });
    }

    const finalTitle = title !== undefined ? title : existingRateMaster.title;
    const finalCustomerId = customerId !== undefined ? customerId : existingRateMaster.customerId;
    const finalBranchId = branchId !== undefined ? branchId : existingRateMaster.branchId;
    const finalWeightRule = weightRule !== undefined ? weightRule : existingRateMaster.weightRule;
    const finalApprovalOption = approvalOption !== undefined ? approvalOption : existingRateMaster.approvalOption;
    
    if (!finalTitle || !finalTitle.trim()) {
      return NextResponse.json({ success: false, message: "Title is required" }, { status: 400 });
    }

    let validatedLocationRates = [];
    
    // If updating a single rate (revision)
    if (rateId && locationRates && locationRates.length === 1) {
      const oldRate = existingRateMaster.locationRates.find(r => r._id.toString() === rateId);
      
      if (!oldRate) {
        return NextResponse.json({ success: false, message: "Rate not found" }, { status: 404 });
      }
      
      const newRate = locationRates[0];
      const fromQty = parseFloat(newRate.fromQty);
      const toQty = parseFloat(newRate.toQty);
      const rate = parseFloat(newRate.rate);
      
      if (isNaN(fromQty) || isNaN(toQty) || isNaN(rate)) {
        return NextResponse.json({ success: false, message: "Invalid numbers" }, { status: 400 });
      }
      
      if (fromQty >= toQty) {
        return NextResponse.json({ success: false, message: "From quantity must be less than To quantity" }, { status: 400 });
      }
      
      // Check for overlaps with other active rates in same location
      const otherRates = existingRateMaster.locationRates.filter(
        r => r.locationId.toString() === oldRate.locationId.toString() && 
        r._id.toString() !== rateId && 
        r.isActive === true
      );
      
      for (let other of otherRates) {
        if ((fromQty >= other.fromQty && fromQty < other.toQty) ||
            (toQty > other.fromQty && toQty <= other.toQty) ||
            (fromQty <= other.fromQty && toQty >= other.toQty)) {
          const location = await Location.findById(oldRate.locationId);
          return NextResponse.json({ 
            success: false, 
            message: `Weight range ${fromQty}-${toQty} overlaps with existing range ${other.fromQty}-${other.toQty} for location ${location?.name}. Please fix the ranges.` 
          }, { status: 400 });
        }
      }
      
      // Save to history
      const location = await Location.findById(oldRate.locationId);
      await RateHistory.create({
        rateMasterId: existingRateMaster._id,
        rateMasterTitle: existingRateMaster.title,
        locationId: oldRate.locationId,
        locationName: location?.name || 'Unknown',
        fromQty: oldRate.fromQty,
        toQty: oldRate.toQty,
        rate: oldRate.rate,
        version: (oldRate.version || 1),
        revisedBy: user.id,
        action: 'REVISED',
        changes: {
          oldFromQty: oldRate.fromQty,
          oldToQty: oldRate.toQty,
          oldRate: oldRate.rate,
          newFromQty: fromQty,
          newToQty: toQty,
          newRate: rate
        }
      });
      
      // Mark old rate as inactive
      let updatedRates = existingRateMaster.locationRates.map(r => {
        if (r._id.toString() === rateId) {
          return {
            ...r.toObject(),
            isActive: false
          };
        }
        return r;
      });
      
      // Add new rate
      const maxVersion = Math.max(...existingRateMaster.locationRates
        .filter(r => r.locationId.toString() === oldRate.locationId.toString())
        .map(r => r.version || 1), 0) + 1;
      
      const newRateObj = {
        locationId: oldRate.locationId,
        fromQty: fromQty,
        toQty: toQty,
        rate: rate,
        isActive: true,
        createdAt: new Date(),
        version: maxVersion
      };
      
      validatedLocationRates = [...updatedRates, newRateObj];
      
    } else if (locationRates && Array.isArray(locationRates)) {
      validatedLocationRates = locationRates;
    } else {
      validatedLocationRates = existingRateMaster.locationRates;
    }

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
          locationName: location?.name || 'Unknown Location',
          isActive: locRate.isActive,
          createdAt: locRate.createdAt,
          version: locRate.version
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

export async function DELETE(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    const url = new URL(req.url);
    const rateMasterId = url.searchParams.get("id");
    const rateId = url.searchParams.get("rateId");

    if (!rateMasterId) {
      return NextResponse.json({ success: false, message: "Rate master ID is required" }, { status: 400 });
    }

    const rateMaster = await RateMaster.findOne({
      _id: rateMasterId,
      companyId: user.companyId,
    });
    
    if (!rateMaster) {
      return NextResponse.json({ success: false, message: "Rate master not found" }, { status: 404 });
    }

    if (rateId) {
      const rateToDelete = rateMaster.locationRates.find(r => r._id.toString() === rateId);
      
      if (rateToDelete) {
        const location = await Location.findById(rateToDelete.locationId);
        await RateHistory.create({
          rateMasterId: rateMaster._id,
          rateMasterTitle: rateMaster.title,
          locationId: rateToDelete.locationId,
          locationName: location?.name || 'Unknown',
          fromQty: rateToDelete.fromQty,
          toQty: rateToDelete.toQty,
          rate: rateToDelete.rate,
          version: rateToDelete.version || 1,
          revisedBy: user.id,
          action: 'DELETED'
        });
      }
      
      const updatedRates = rateMaster.locationRates.filter(r => r._id.toString() !== rateId);
      rateMaster.locationRates = updatedRates;
      await rateMaster.save();
      
      return NextResponse.json({ success: true, message: "Rate deleted successfully" }, { status: 200 });
    }
    
    for (let rate of rateMaster.locationRates) {
      const location = await Location.findById(rate.locationId);
      await RateHistory.create({
        rateMasterId: rateMaster._id,
        rateMasterTitle: rateMaster.title,
        locationId: rate.locationId,
        locationName: location?.name || 'Unknown',
        fromQty: rate.fromQty,
        toQty: rate.toQty,
        rate: rate.rate,
        version: rate.version || 1,
        revisedBy: user.id,
        action: 'DELETED'
      });
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