//import { NextResponse } from "next/server";
//import connectDb from "@/lib/db";
//import RateMaster from "../../schema";
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
//// PUT - Mark rate master as active (complete)
//export async function PUT(req, { params }) {
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
//    if (rateMaster.rateSlabs.length === 0) {
//      return NextResponse.json({ 
//        success: false, 
//        message: "Cannot complete rate master without any location rates" 
//      }, { status: 400 });
//    }
//
//    rateMaster.isActive = true;
//    await rateMaster.save();
//
//    return NextResponse.json({ success: true, message: "Rate master completed successfully" }, { status: 200 });
//  } catch (error) {
//    console.error("PUT /rate-master/:id/complete error:", error);
//    return NextResponse.json({ success: false, message: "Failed to complete rate master" }, { status: 500 });
//  }
//}