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
    const { clientId, clientName, productCategories, plantId, plantCode, orderType, startDate, endDate, branchId, branchName } = body;
    
    // Build query
    let query = { companyId: user.companyId };
    
    // Date filter
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + 'T23:59:59')
      };
    }
    
    // Client filter by party name
    if (clientName) {
      query['header.partyName'] = { $regex: clientName, $options: 'i' };
    }
    
    // Order type filter
    if (orderType && orderType !== "All Order Types") {
      query['header.orderType'] = orderType;
    }
    
    const consignmentNotes = await ConsignmentNote.find(query).lean();
    
    // Process data to extract product-wise billing
    const billingData = [];
    
    for (const note of consignmentNotes) {
      const rate = 3050; // Default rate, can be customized
      let products = [];
      
      // Extract products from packData
      if (note.packData) {
        if (note.packData.PALLETIZATION) {
          products.push(...note.packData.PALLETIZATION);
        }
        if (note.packData['UNIFORM - BAGS/BOXES']) {
          products.push(...note.packData['UNIFORM - BAGS/BOXES']);
        }
        if (note.packData['LOOSE - CARGO']) {
          products.push(...note.packData['LOOSE - CARGO']);
        }
        if (note.packData['NON-UNIFORM - GENERAL CARGO']) {
          products.push(...note.packData['NON-UNIFORM - GENERAL CARGO']);
        }
      }
      
      // Apply product category filter if needed
      let filteredProducts = products;
      if (productCategories) {
        filteredProducts = products.filter(p => 
          p.productCategory === productCategories || 
          p.productName?.toLowerCase().includes(productCategories.toLowerCase())
        );
      }
      
      for (const product of filteredProducts) {
        const weight = parseFloat(product.actualWt || product.weight || 0);
        billingData.push({
          date: note.createdAt,
          lrNo: note.lrNo,
          vehicleNo: note.header?.vehicleNo,
          orderNo: note.header?.orderNo,
          orderType: note.header?.orderType,
          fromLocation: note.header?.from,
          toLocation: note.header?.to,
          partyName: note.header?.partyName,
          productName: product.productName || product.productName || 'General Cargo',
          productCategory: productCategories || 'General',
          invoiceNo: note.invoice?.boeInvoiceNo,
          invoiceDate: note.invoice?.boeInvoiceDate,
          ewaybillNo: note.ewaybill?.ewaybillNo,
          containerNo: note.ewaybill?.containerNo,
          weight: weight,
          rate: rate,
          amount: weight * rate,
          plantCode: plantCode,
          plantId: plantId
        });
      }
    }
    
    const totalWeight = billingData.reduce((sum, item) => sum + item.weight, 0);
    const totalAmount = billingData.reduce((sum, item) => sum + item.amount, 0);
    
    return NextResponse.json({
      success: true,
      data: billingData,
      summary: {
        totalWeight: totalWeight,
        totalAmount: totalAmount,
        totalRecords: billingData.length
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error('Product-wise billing error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to generate product-wise billing" 
    }, { status: 500 });
  }
}