import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import RateMaster from "../schema";
import RateHistory from "../history-schema";
import { getTokenFromHeader, verifyJWT } from "@/lib/auth";

export async function POST(req) {
  await connectDb();
  
  try {
    const token = getTokenFromHeader(req);
    if (!token) {
      return NextResponse.json({ success: false, message: "Token missing" }, { status: 401 });
    }

    const user = await verifyJWT(token);
    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    const { masterId, locationId } = await req.json();

    const rateMaster = await RateMaster.findOne({
      _id: masterId,
      companyId: user.companyId,
    });

    if (!rateMaster) {
      return NextResponse.json({ success: false, message: "Rate master not found" }, { status: 404 });
    }

    // Get all active rates for this location
    const locationRates = rateMaster.locationRates.filter(
      r => r.locationId.toString() === locationId && r.isActive === true
    );
    
    // Find duplicates (same fromQty and toQty)
    const uniqueMap = new Map();
    const duplicates = [];
    
    locationRates.forEach(rate => {
      const key = `${rate.fromQty}-${rate.toQty}`;
      if (uniqueMap.has(key)) {
        duplicates.push(rate);
      } else {
        uniqueMap.set(key, rate);
      }
    });
    
    if (duplicates.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: "No duplicates found",
        duplicatesCount: 0 
      });
    }
    
    // Save duplicates to history before removing
    for (let dup of duplicates) {
      const location = await Location.findById(dup.locationId);
      await RateHistory.create({
        rateMasterId: rateMaster._id,
        rateMasterTitle: rateMaster.title,
        locationId: dup.locationId,
        locationName: location?.name || 'Unknown',
        fromQty: dup.fromQty,
        toQty: dup.toQty,
        rate: dup.rate,
        version: dup.version || 1,
        revisedBy: user.id,
        action: 'DELETED',
        changes: { reason: 'Duplicate rate removed' }
      });
    }
    
    // Mark duplicates as inactive
    const updatedRates = rateMaster.locationRates.map(rate => {
      const isDuplicate = duplicates.some(d => d._id.toString() === rate._id.toString());
      if (isDuplicate && rate.isActive === true) {
        return { 
          ...rate.toObject(), 
          isActive: false, 
          revisedAt: new Date().toISOString()
        };
      }
      return rate;
    });
    
    rateMaster.locationRates = updatedRates;
    await rateMaster.save();
    
    return NextResponse.json({
      success: true,
      message: `Found and removed ${duplicates.length} duplicate rate(s)`,
      duplicatesCount: duplicates.length
    });
    
  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}