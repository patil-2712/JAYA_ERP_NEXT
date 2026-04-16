//import { NextResponse } from "next/server";
//import connectDb from "@/lib/db";
//import RateMaster from "../../schema";
//import Location from "../../../locations/schema";
//import { getTokenFromHeader, verifyJWT } from "@/lib/auth";
//
//async function validateUser(req) {
//  const token = getTokenFromHeader(req);
//  if (!token) return { error: "Token missing", status: 401 };
//
//  try {
//    const user = await verifyJWT(token);
//    if (!user) return { error: "Invalid token", status: 401 };
//    return { user, error: null, status: 200 };
//  } catch (err) {
//    return { error: "Invalid token", status: 401 };
//  }
//}
//
//// GET - Fetch all locations with rates for a specific rate master
//export async function GET(req, { params }) {
//  await connectDb();
//  const { user, error, status } = await validateUser(req);
//  if (error) return NextResponse.json({ success: false, message: error }, { status });
//
//  try {
//    // ✅ FIX: Await the params object before destructuring
//    const { id } = await params;
//
//    const rateMaster = await RateMaster.findOne({
//      _id: id,
//      companyId: user.companyId
//    });
//
//    if (!rateMaster) {
//      return NextResponse.json({ success: false, message: "Rate master not found" }, { status: 404 });
//    }
//
//    // Get location details for each location rate
//    const locationRates = await Promise.all(
//      rateMaster.rateSlabs.map(async (locationRate) => {
//        const location = await Location.findById(locationRate.locationId);
//        return {
//          _id: locationRate._id,
//          locationId: locationRate.locationId,
//          locationName: location?.name || 'Unknown',
//          rateSlabs: locationRate.slabs
//        };
//      })
//    );
//
//    return NextResponse.json({ success: true, data: locationRates }, { status: 200 });
//  } catch (error) {
//    console.error("GET /rate-master/:id/locations error:", error);
//    return NextResponse.json({ success: false, message: "Failed to fetch location rates" }, { status: 500 });
//  }
//}