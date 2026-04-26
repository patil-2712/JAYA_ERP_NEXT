import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import { getNextBalancePaymentNumber } from "../BalancePaymentCounter";
import { getTokenFromHeader, verifyJWT } from "@/lib/auth";

export async function GET(req) {
  try {
    await connectDb();
    
    const token = getTokenFromHeader(req);
    if (!token) {
      return NextResponse.json({ success: false, message: "Token missing" }, { status: 401 });
    }
    
    const user = await verifyJWT(token);
    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }
    
    const paymentNo = await getNextBalancePaymentNumber(user.companyId);
    
    return NextResponse.json({ success: true, paymentNo });
    
  } catch (error) {
    console.error("Error generating payment number:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}