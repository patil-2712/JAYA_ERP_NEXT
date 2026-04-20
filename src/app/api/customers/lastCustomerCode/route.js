import { NextResponse } from "next/server";
import dbConnect from "@/lib/db.js";
import Customer from "@/models/CustomerModel";
import { getTokenFromHeader, verifyJWT } from "@/lib/auth";

export async function GET(req) {
  try {
    await dbConnect();
    
    const token = getTokenFromHeader(req);
    const user = await verifyJWT(token);
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get the last customer for this company
    const lastCustomer = await Customer.findOne({ 
      companyId: user.companyId 
    }).sort({ customerCode: -1 }).limit(1);
    
    let lastCustomerCode = "CUST-0000";
    
    if (lastCustomer && lastCustomer.customerCode) {
      lastCustomerCode = lastCustomer.customerCode;
    }
    
    return NextResponse.json({ 
      success: true, 
      lastCustomerCode: lastCustomerCode 
    });
    
  } catch (error) {
    console.error("Error fetching last customer code:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch last customer code" 
    }, { status: 500 });
  }
}