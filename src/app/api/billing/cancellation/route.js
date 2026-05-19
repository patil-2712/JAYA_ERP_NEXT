import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import ConsignmentNote from "../../consignment-note/ConsignmentNote";
import { getTokenFromHeader, verifyJWT } from "@/lib/auth";

export async function POST(req) {
  try {
    await connectDb();
    
    const token = getTokenFromHeader(req);
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    
    const user = await verifyJWT(token);
    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }
    
    const body = await req.json();
    const { clientId, clientName, cancellation, startDate, endDate, branchId } = body;
    
    let query = { companyId: user.companyId };
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + 'T23:59:59')
      };
    }
    
    if (clientName) {
      query['header.partyName'] = { $regex: clientName, $options: 'i' };
    }
    
    // Filter cancelled orders (you may have a status field for cancellation)
    query['header.status'] = 'Cancelled';
    
    const consignmentNotes = await ConsignmentNote.find(query).lean();
    
    const billingData = consignmentNotes.map((note, idx) => ({
      id: idx + 1,
      date: note.createdAt,
      lrNo: note.lrNo,
      vehicleNo: note.header?.vehicleNo,
      partyName: note.header?.partyName,
      cancellationType: cancellation || "Order Cancellation",
      amount: 500 // Fixed cancellation fee or calculate based on your logic
    }));
    
    const totalAmount = billingData.reduce((sum, item) => sum + item.amount, 0);
    
    return NextResponse.json({
      success: true,
      data: billingData,
      summary: {
        totalAmount: totalAmount,
        totalRecords: billingData.length
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error('Cancellation billing error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to generate cancellation billing" 
    }, { status: 500 });
  }
}