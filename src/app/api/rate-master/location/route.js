//import { NextResponse } from "next/server";
//import connectDb from "@/lib/db";
//import RateMaster from "../schema";
//import Location from "../../locations/schema";
//import { getTokenFromHeader, verifyJWT } from "@/lib/auth";
//
//// Role-based access check
//function isAuthorized(user) {
//  return (
//    user?.type === "company" ||
//    user?.role === "Admin" ||
//    user?.permissions?.includes("rate-master")
//  );
//}
//
//async function validateUser(req) {
//  const token = getTokenFromHeader(req);
//  if (!token) return { error: "Token missing", status: 401 };
//
//  try {
//    const user = await verifyJWT(token);
//    if (!user) return { error: "Invalid token", status: 401 };
//    if (!isAuthorized(user)) return { error: "Unauthorized", status: 403 };
//    return { user, error: null, status: 200 };
//  } catch (err) {
//    console.error("JWT Verification Failed:", err);
//    return { error: "Invalid token", status: 401 };
//  }
//}
//
//// POST - Add location with rate slabs to a rate master
//export async function POST(req) {
//  await connectDb();
//  const { user, error, status } = await validateUser(req);
//  if (error) return NextResponse.json({ success: false, message: error }, { status });
//
//  try {
//    const { rateMasterId, locationId, rateSlabs } = await req.json();
//
//    if (!rateMasterId) {
//      return NextResponse.json({ success: false, message: "Rate master ID is required" }, { status: 400 });
//    }
//
//    if (!locationId) {
//      return NextResponse.json({ success: false, message: "Location ID is required" }, { status: 400 });
//    }
//
//    if (!rateSlabs || rateSlabs.length === 0) {
//      return NextResponse.json({ success: false, message: "At least one rate slab is required" }, { status: 400 });
//    }
//
//    // Validate location exists
//    const location = await Location.findOne({ _id: locationId, companyId: user.companyId });
//    if (!location) {
//      return NextResponse.json({ success: false, message: "Invalid location selected" }, { status: 400 });
//    }
//
//    // Find rate master
//    const rateMaster = await RateMaster.findOne({
//      _id: rateMasterId,
//      companyId: user.companyId
//    });
//
//    if (!rateMaster) {
//      return NextResponse.json({ success: false, message: "Rate master not found" }, { status: 404 });
//    }
//
//    // Check if location already has rates
//    const existingLocationRate = rateMaster.rateSlabs.find(
//      slab => slab.locationId && slab.locationId.toString() === locationId
//    );
//
//    if (existingLocationRate) {
//      return NextResponse.json({ 
//        success: false, 
//        message: "Rates for this location already exist. Please edit existing rates." 
//      }, { status: 400 });
//    }
//
//    // Validate rate slabs
//    for (let slab of rateSlabs) {
//      if (slab.fromQty >= slab.toQty) {
//        return NextResponse.json({ 
//          success: false, 
//          message: "From quantity must be less than To quantity" 
//        }, { status: 400 });
//      }
//    }
//
//    // Check for overlapping ranges
//    const sortedSlabs = [...rateSlabs].sort((a, b) => a.fromQty - b.fromQty);
//    for (let i = 0; i < sortedSlabs.length - 1; i++) {
//      if (sortedSlabs[i].toQty >= sortedSlabs[i + 1].fromQty) {
//        return NextResponse.json({ 
//          success: false, 
//          message: "Rate slabs cannot overlap. Please check the quantity ranges." 
//        }, { status: 400 });
//      }
//    }
//
//    // Add location rates
//    rateMaster.rateSlabs.push({
//      locationId,
//      slabs: rateSlabs
//    });
//
//    await rateMaster.save();
//
//    return NextResponse.json({ 
//      success: true, 
//      data: {
//        locationId,
//        locationName: location.name,
//        rateSlabs
//      }
//    }, { status: 201 });
//  } catch (error) {
//    console.error("POST /rate-master/location error:", error);
//    return NextResponse.json({ success: false, message: "Failed to add location rates" }, { status: 500 });
//  }
//}
//
//// DELETE - Remove location rates from a rate master
//export async function DELETE(req) {
//  await connectDb();
//  const { user, error, status } = await validateUser(req);
//  if (error) return NextResponse.json({ success: false, message: error }, { status });
//
//  try {
//    const url = new URL(req.url);
//    const locationRateId = url.searchParams.get("id");
//
//    if (!locationRateId) {
//      return NextResponse.json({ success: false, message: "Location rate ID is required" }, { status: 400 });
//    }
//
//    // Find rate master containing this location rate
//    const rateMaster = await RateMaster.findOne({
//      "rateSlabs._id": locationRateId,
//      companyId: user.companyId
//    });
//
//    if (!rateMaster) {
//      return NextResponse.json({ success: false, message: "Location rate not found" }, { status: 404 });
//    }
//
//    // Remove the location rate
//    rateMaster.rateSlabs = rateMaster.rateSlabs.filter(
//      slab => slab._id.toString() !== locationRateId
//    );
//
//    await rateMaster.save();
//
//    return NextResponse.json({ success: true, message: "Location rate deleted successfully" }, { status: 200 });
//  } catch (error) {
//    console.error("DELETE /rate-master/location error:", error);
//    return NextResponse.json({ success: false, message: "Failed to delete location rate" }, { status: 500 });
//  }
//}