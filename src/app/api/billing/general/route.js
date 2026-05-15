import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import ConsignmentNote from "../../consignment-note/ConsignmentNote";
import { getTokenFromHeader, verifyJWT } from "@/lib/auth";

// Role-based access check
function isAuthorized(user) {
  return (
    user?.type === "company" ||
    user?.role === "Admin" ||
    user?.permissions?.includes("billing")
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
    console.error("JWT Verification Failed:", err?.message || err);
    return { error: "Invalid token", status: 401 };
  }
}

// Helper to extract products from consignment note
function extractProductsFromNote(note) {
  const products = [];
  let rate = 3050; // Default rate
  
  if (note.rate) rate = note.rate;
  
  if (note.packData) {
    if (note.packData.PALLETIZATION && note.packData.PALLETIZATION.length > 0) {
      note.packData.PALLETIZATION.forEach(row => {
        if (row.productName || (row.actualWt && parseFloat(row.actualWt) > 0)) {
          products.push({
            productName: row.productName || 'Palletized Cargo',
            actualWt: parseFloat(row.actualWt) || 0,
            billedWt: parseFloat(row.chargedWt) || parseFloat(row.actualWt) || 0,
            rate: rate
          });
        }
      });
    }
    
    if (note.packData['UNIFORM - BAGS/BOXES'] && note.packData['UNIFORM - BAGS/BOXES'].length > 0) {
      note.packData['UNIFORM - BAGS/BOXES'].forEach(row => {
        if (row.productName || (row.actualWt && parseFloat(row.actualWt) > 0)) {
          products.push({
            productName: row.productName || 'Uniform Cargo',
            actualWt: parseFloat(row.actualWt) || 0,
            billedWt: parseFloat(row.chargedWt) || parseFloat(row.actualWt) || 0,
            rate: rate
          });
        }
      });
    }
    
    if (note.packData['LOOSE - CARGO'] && note.packData['LOOSE - CARGO'].length > 0) {
      note.packData['LOOSE - CARGO'].forEach(row => {
        if (row.productName || (row.actualWt && parseFloat(row.actualWt) > 0)) {
          products.push({
            productName: row.productName || 'Loose Cargo',
            actualWt: parseFloat(row.actualWt) || 0,
            billedWt: parseFloat(row.chargedWt) || parseFloat(row.actualWt) || 0,
            rate: rate
          });
        }
      });
    }
    
    if (note.packData['NON-UNIFORM - GENERAL CARGO'] && note.packData['NON-UNIFORM - GENERAL CARGO'].length > 0) {
      note.packData['NON-UNIFORM - GENERAL CARGO'].forEach(row => {
        if (row.productName || (row.actualWt && parseFloat(row.actualWt) > 0)) {
          products.push({
            productName: row.productName || 'General Cargo',
            actualWt: parseFloat(row.actualWt) || 0,
            billedWt: parseFloat(row.chargedWt) || parseFloat(row.actualWt) || 0,
            rate: rate
          });
        }
      });
    }
  }
  
  if (products.length === 0 && note.totalWeight) {
    products.push({
      productName: 'General Cargo',
      actualWt: note.totalWeight || 0,
      billedWt: note.totalWeight || 0,
      rate: rate
    });
  }
  
  return products;
}

export async function POST(req) {
  try {
    await connectDb();
    const { user, error, status } = await validateUser(req);
    if (error) {
      return NextResponse.json({ success: false, message: error }, { status });
    }

    const body = await req.json();
    console.log("📊 General Bill Request Body:", body);
    
    const { 
      branchId, 
      clientId, 
      status: statusFilter, 
      startDate, 
      endDate,
      orderType 
    } = body;

    // Build query for consignment notes
    let query = { companyId: user.companyId };

    // Date filter - with 60 days fallback if no dates provided
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + 'T23:59:59')
      };
      console.log(`📅 Date range: ${startDate} to ${endDate}`);
    } else {
      // If no date range provided, get last 90 days
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      query.createdAt = { $gte: ninetyDaysAgo };
      console.log(`📅 No date range provided, using last 90 days`);
    }

    // Status filter
    if (statusFilter && statusFilter !== "") {
      query['header.status'] = statusFilter;
    }

    // Order type filter - IMPORTANT: Empty string means NA (All Types)
    // Only filter if orderType is not empty and not "Select Type"
    if (orderType && orderType !== "" && orderType !== "Select Type") {
      query['header.orderType'] = orderType;
      console.log(`📋 Filtering by Order Type: ${orderType}`);
    } else {
      console.log(`📋 NA (All Types) - No order type filter applied`);
    }

    console.log("🔍 MongoDB Query:", JSON.stringify(query, null, 2));

    // Fetch consignment notes
    const consignmentNotes = await ConsignmentNote.find(query)
      .sort({ createdAt: -1 })
      .lean();

    console.log(`📦 Found ${consignmentNotes.length} consignment notes`);

    // Transform data for bill
    const billData = [];
    let totalWeight = 0;
    let totalAmount = 0;

    consignmentNotes.forEach(note => {
      const products = extractProductsFromNote(note);
      products.forEach((product, idx) => {
        const amount = (product.billedWt || 0) * (product.rate || 0);
        billData.push({
          _id: `${note._id}_${idx}`,
          date: note.createdAt ? new Date(note.createdAt).toLocaleDateString('en-GB').replace(/\//g, '.') : '',
          lrNo: note.lrNo || 'N/A',
          vehicleNo: note.header?.vehicleNo || 'N/A',
          from: note.header?.from || 'N/A',
          to: note.header?.to || 'N/A',
          partyName: note.header?.partyName || note.consignor?.name || 'N/A',
          productName: product.productName,
          actualWt: product.actualWt,
          billedWt: product.billedWt,
          rate: product.rate,
          amount: amount,
          status: note.header?.status || 'Pending',
          orderType: note.header?.orderType || 'N/A'
        });
        totalWeight += product.billedWt || 0;
        totalAmount += amount;
      });
    });

    console.log(`✅ Generated ${billData.length} bill entries`);
    console.log(`📊 Total Weight: ${totalWeight.toFixed(2)}, Total Amount: ₹${totalAmount.toFixed(2)}`);

    return NextResponse.json({ 
      success: true, 
      data: billData,
      summary: {
        totalRecords: billData.length,
        totalWeight: totalWeight,
        totalAmount: totalAmount
      },
      message: billData.length === 0 ? "No consignment notes found for the selected filters" : `Found ${billData.length} records`
    }, { status: 200 });

  } catch (error) {
    console.error("❌ POST /api/billing/general error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to generate bill",
      error: error.toString()
    }, { status: 500 });
  }
}