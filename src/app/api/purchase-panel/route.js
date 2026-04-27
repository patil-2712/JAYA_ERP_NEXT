////// route.js
////import { NextResponse } from "next/server";
////import connectDb from "@/lib/db";
////import PurchasePanel from "./PurchasePanel";
////import { getTokenFromHeader, verifyJWT } from "@/lib/auth";
////import { getNextPurchaseNumber } from "./PurchaseCounter";
////import mongoose from 'mongoose';
////
////// Helper function to convert to number
////function num(value) {
////  if (value === null || value === undefined || value === '') return 0;
////  const n = Number(value);
////  return Number.isFinite(n) ? n : 0;
////}
////
////// Role-based access check
////function isAuthorized(user) {
////  return (
////    user?.type === "company" ||
////    user?.role === "Admin" ||
////    user?.permissions?.includes("purchase_panel")
////  );
////}
////
////async function validateUser(req) {
////  const token = getTokenFromHeader(req);
////  if (!token) return { error: "Token missing", status: 401 };
////
////  try {
////    const user = await verifyJWT(token);
////    if (!user) return { error: "Invalid token", status: 401 };
////    if (!isAuthorized(user)) return { error: "Unauthorized", status: 403 };
////    return { user, error: null, status: 200 };
////  } catch (err) {
////    console.error("JWT Verification Failed:", err?.message || err);
////    return { error: "Invalid token", status: 401 };
////  }
////}
////
/////* ========================================
////   GET /api/purchase-panel
////======================================== */
////export async function GET(req) {
////  try {
////    await connectDb();
////    const { user, error, status } = await validateUser(req);
////    if (error) {
////      return NextResponse.json({ success: false, message: error }, { status });
////    }
////
////    const url = new URL(req.url);
////    const id = url.searchParams.get("id");
////    const purchaseNo = url.searchParams.get("purchaseNo");
////    const format = url.searchParams.get("format");
////    const search = url.searchParams.get("search");
////    const fromDate = url.searchParams.get("fromDate");
////    const toDate = url.searchParams.get("toDate");
////    const statusFilter = url.searchParams.get("status");
////
////    // CASE 1: GET SINGLE PURCHASE BY ID
////    if (id) {
////      if (!mongoose.Types.ObjectId.isValid(id)) {
////        return NextResponse.json({ 
////          success: false, 
////          message: "Invalid purchase ID format" 
////        }, { status: 400 });
////      }
////
////      const purchase = await PurchasePanel.findOne({
////        _id: id,
////        companyId: user.companyId
////      }).lean();
////
////      if (!purchase) {
////        return NextResponse.json({ 
////          success: false, 
////          message: "Purchase not found" 
////        }, { status: 404 });
////      }
////
////      return NextResponse.json({ 
////        success: true, 
////        data: purchase 
////      }, { status: 200 });
////    }
////
////    // CASE 2: GET SINGLE PURCHASE BY PURCHASE NUMBER
////    if (purchaseNo) {
////      const purchase = await PurchasePanel.findOne({
////        purchaseNo: purchaseNo,
////        companyId: user.companyId
////      }).lean();
////
////      if (!purchase) {
////        return NextResponse.json({ 
////          success: false, 
////          message: "Purchase not found" 
////        }, { status: 404 });
////      }
////
////      return NextResponse.json({ 
////        success: true, 
////        data: purchase 
////      }, { status: 200 });
////    }
////
////    // CASE 3: TABLE FORMAT FOR LIST VIEW
////    if (format === 'table') {
////      let query = { companyId: user.companyId };
////
////      if (search) {
////        query.$or = [
////          { purchaseNo: { $regex: search, $options: 'i' } },
////          { vnnNo: { $regex: search, $options: 'i' } },
////          { pricingSerialNo: { $regex: search, $options: 'i' } },
////          { 'purchaseDetails.vendorName': { $regex: search, $options: 'i' } },
////          { 'purchaseDetails.vehicleNo': { $regex: search, $options: 'i' } }
////        ];
////      }
////
////      if (statusFilter) {
////        query['approval.status'] = statusFilter;
////      }
////
////      if (fromDate || toDate) {
////        query.createdAt = {};
////        if (fromDate) {
////          query.createdAt.$gte = new Date(fromDate);
////        }
////        if (toDate) {
////          query.createdAt.$lte = new Date(toDate + 'T23:59:59');
////        }
////      }
////
////      const purchases = await PurchasePanel.find(query)
////        .sort({ createdAt: -1 })
////        .lean();
////
////      const tableData = purchases.map(purchase => ({
////        _id: purchase._id,
////        date: purchase.createdAt ? new Date(purchase.createdAt).toLocaleDateString('en-IN') : '',
////        purchaseNo: purchase.purchaseNo || 'N/A',
////        vnnNo: purchase.vnnNo || 'N/A',
////        pricingSerialNo: purchase.pricingSerialNo || 'N/A',
////        loadingInfoNo: purchase.loadingInfoNo || 'N/A',
////        vendorName: purchase.purchaseDetails?.vendorName || 'N/A',
////        vendorCode: purchase.purchaseDetails?.vendorCode || 'N/A',
////        vehicleNo: purchase.purchaseDetails?.vehicleNo || 'N/A',
////        amount: purchase.purchaseDetails?.amount || 0,
////        balance: purchase.balance || 0,
////        status: purchase.approval?.status || 'Draft'
////      }));
////
////      return NextResponse.json({
////        success: true,
////        data: tableData,
////        count: tableData.length
////      }, { status: 200 });
////    }
////
////    // CASE 4: LIST FOR DROPDOWNS
////    const purchases = await PurchasePanel.find({ 
////      companyId: user.companyId 
////    })
////    .select('purchaseNo vnnNo pricingSerialNo purchaseDetails.vendorName purchaseDetails.amount approval.status')
////    .sort({ createdAt: -1 })
////    .lean();
////
////    return NextResponse.json({
////      success: true,
////      data: purchases
////    }, { status: 200 });
////
////  } catch (error) {
////    console.error("❌ GET /purchase-panel error:", error);
////    return NextResponse.json({ 
////      success: false, 
////      message: error.message || "Failed to fetch purchases"
////    }, { status: 500 });
////  }
////}
////
/////* ========================================
////   POST /api/purchase-panel - Create New
////======================================== */
////export async function POST(req) {
////  try {
////    await connectDb();
////    const { user, error, status } = await validateUser(req);
////    if (error) {
////      return NextResponse.json({ success: false, message: error }, { status });
////    }
////
////    const body = await req.json();
////    
////    console.log("📝 Creating new purchase");
////
////    // Generate purchase number
////    let purchaseNo = await getNextPurchaseNumber(user.companyId);
////
////    // Process order rows
////    const processedOrderRows = (body.orders || body.orderRows || []).map(row => ({
////      _id: new mongoose.Types.ObjectId(),
////      orderNo: row.orderNo || '',
////      partyName: row.partyName || '',
////      plantCode: row.plantCode || '',
////      plantName: row.plantName || '',
////      orderType: row.orderType || 'Sales',
////      pinCode: row.pinCode || '',
////      taluka: row.taluka || '',
////      district: row.district || '',
////      state: row.state || '',
////      country: row.country || '',
////      from: row.from || '',
////      to: row.to || '',
////      locationRate: row.locationRate || '',
////      priceList: row.priceList || '',
////      weight: num(row.weight),
////      rate: num(row.rate),
////      totalAmount: num(row.totalAmount) || (num(row.weight) * num(row.rate)),
////      collectionCharges: row.collectionCharges || '0',
////      cancellationCharges: row.cancellationCharges || 'Nil',
////      loadingCharges: row.loadingCharges || 'Nil',
////      otherCharges: row.otherCharges || '0'
////    }));
////
////    // Process additions
////    const processedAdditions = (body.additions || []).map(row => ({
////      _id: new mongoose.Types.ObjectId(),
////      description: row.description || '',
////      amount: num(row.amount)
////    }));
////
////    // Process deductions
////    const processedDeductions = (body.deductions || []).map(row => ({
////      _id: new mongoose.Types.ObjectId(),
////      description: row.description || '',
////      amount: num(row.amount)
////    }));
////
////    // Calculate totals
////    const totalOrderAmount = processedOrderRows.reduce((sum, row) => sum + (row.totalAmount || 0), 0);
////    const totalAdditions = processedAdditions.reduce((sum, row) => sum + (row.amount || 0), 0);
////    const totalDeductions = processedDeductions.reduce((sum, row) => sum + (row.amount || 0), 0);
////    
////    const purchaseAmount = num(body.purchaseDetails?.amount) || totalOrderAmount;
////    const advance = num(body.purchaseDetails?.advance);
////    const totalLoadingExpenses = (
////      num(body.loadingExpenses?.loadingCharges) +
////      num(body.loadingExpenses?.loadingStaffMunshiyana) +
////      num(body.loadingExpenses?.otherExpenses) +
////      num(body.loadingExpenses?.vehicleFloorTarpaulin) +
////      num(body.loadingExpenses?.vehicleOuterTarpaulin)
////    );
////    
////    const balance = totalOrderAmount - advance;
////    const netEffect = advance + totalAdditions - totalDeductions - totalLoadingExpenses;
////
////    // Handle branch ID
////    let branchId = null;
////    if (body.header?.branch) {
////      if (mongoose.Types.ObjectId.isValid(body.header.branch)) {
////        branchId = new mongoose.Types.ObjectId(body.header.branch);
////      } else if (typeof body.header.branch === 'object' && body.header.branch._id) {
////        branchId = new mongoose.Types.ObjectId(body.header.branch._id);
////      }
////    }
////
////    // Create purchase document
////    const purchase = new PurchasePanel({
////      purchaseNo,
////      vehicleNegotiationId: body.vehicleNegotiationId || null,
////      vnnNo: body.vnnNo || body.selectedVNNNo || '',
////      pricingSerialNo: body.header?.pricingSerialNo || body.pricingSerialNo || '',
////      loadingInfoNo: body.loadingInfoNo || '',
////      
////      header: {
////        purchaseNo,
////        pricingSerialNo: body.header?.pricingSerialNo || '',
////        branch: branchId,
////        branchName: body.header?.branchName || '',
////        branchCode: body.header?.branchCode || '',
////        date: body.header?.date ? new Date(body.header.date) : new Date(),
////        delivery: body.header?.delivery || 'Normal',
////      },
////      
////      billing: {
////        billingType: body.billing?.billingType || 'Multi - Order',
////        noOfLoadingPoints: body.billing?.noOfLoadingPoints || '1',
////        noOfDroppingPoint: body.billing?.noOfDroppingPoint || '1',
////        collectionCharges: body.billing?.collectionCharges || '0',
////        cancellationCharges: body.billing?.cancellationCharges || 'Nil',
////        loadingCharges: body.billing?.loadingCharges || 'Nil',
////        otherCharges: body.billing?.otherCharges || 'Nil',
////      },
////      
////      orderRows: processedOrderRows,
////      
////      purchaseDetails: {
////        vendorStatus: body.purchaseDetails?.vendorStatus || 'Active',
////        vendorName: body.purchaseDetails?.vendorName || '',
////        vendorCode: body.purchaseDetails?.vendorCode || '',
////        vehicleNo: body.purchaseDetails?.vehicleNo || '',
////        vehicleType: body.purchaseDetails?.vehicleType || '',
////        driverMobileNo: body.purchaseDetails?.driverMobileNo || '',
////        purchaseType: body.purchaseDetails?.purchaseType || 'Loading & Unloading',
////        paymentTerms: body.purchaseDetails?.paymentTerms || '80 % Advance',
////        rateType: body.purchaseDetails?.rateType || 'Per MT',
////        rate: num(body.purchaseDetails?.rate),
////        weight: num(body.purchaseDetails?.weight),
////        amount: purchaseAmount,
////        advance: advance,
////        vehicleFloorTarpaulin: num(body.purchaseDetails?.vehicleFloorTarpaulin),
////        vehicleOuterTarpaulin: num(body.purchaseDetails?.vehicleOuterTarpaulin),
////        purchaseDate: body.purchaseDetails?.purchaseDate ? new Date(body.purchaseDetails.purchaseDate) : new Date(),
////      },
////      
////      loadingExpenses: {
////        loadingCharges: num(body.loadingExpenses?.loadingCharges),
////        loadingStaffMunshiyana: num(body.loadingExpenses?.loadingStaffMunshiyana),
////        otherExpenses: num(body.loadingExpenses?.otherExpenses),
////        vehicleFloorTarpaulin: num(body.loadingExpenses?.vehicleFloorTarpaulin),
////        vehicleOuterTarpaulin: num(body.loadingExpenses?.vehicleOuterTarpaulin),
////      },
////      totalLoadingExpenses,
////      
////      additions: processedAdditions,
////      deductions: processedDeductions,
////      totalAdditions,
////      totalDeductions,
////      totalOrderAmount,
////      balance,
////      netEffect,
////      
////      registeredVehicle: {
////        vehiclePlate: body.registeredVehicle?.vehiclePlate || body.registeredVehicle?.registeredPlate || '',
////        isRegistered: body.registeredVehicle?.isRegistered || false,
////      },
////      
////      approval: {
////        status: body.approval?.status || 'Pending',
////        remarks: body.approval?.remarks || '',
////      },
////      
////      arrivalDetails: {
////        date: body.arrivalDetails?.date ? new Date(body.arrivalDetails.date) : new Date(),
////        time: body.arrivalDetails?.time || '',
////      },
////      
////      memoFile: body.memoFile || null,
////      
////      companyId: user.companyId,
////      createdBy: user.id,
////      panelStatus: 'Draft'
////    });
////
////    await purchase.save();
////
////    return NextResponse.json({ 
////      success: true, 
////      message: "Purchase created successfully",
////      data: {
////        _id: purchase._id,
////        purchaseNo: purchase.purchaseNo,
////        vnnNo: purchase.vnnNo,
////        pricingSerialNo: purchase.pricingSerialNo
////      }
////    }, { status: 201 });
////
////  } catch (error) {
////    console.error("❌ POST /purchase-panel error:", error);
////
////    if (error.code === 11000) {
////      return NextResponse.json({ 
////        success: false, 
////        message: "Purchase number already exists" 
////      }, { status: 400 });
////    }
////
////    if (error.name === 'ValidationError') {
////      const messages = Object.values(error.errors).map(err => err.message);
////      return NextResponse.json({ 
////        success: false, 
////        message: messages.join(', ') 
////      }, { status: 400 });
////    }
////
////    return NextResponse.json({ 
////      success: false, 
////      message: error.message || "Failed to create purchase"
////    }, { status: 500 });
////  }
////}
////
/////* ========================================
////   PUT /api/purchase-panel - Update
////======================================== */
////export async function PUT(req) {
////  try {
////    await connectDb();
////    const { user, error, status } = await validateUser(req);
////    if (error) {
////      return NextResponse.json({ success: false, message: error }, { status });
////    }
////
////    const body = await req.json();
////    const { id } = body;
////    
////    if (!id) {
////      return NextResponse.json({ 
////        success: false, 
////        message: "Purchase ID is required" 
////      }, { status: 400 });
////    }
////
////    if (!mongoose.Types.ObjectId.isValid(id)) {
////      return NextResponse.json({ 
////        success: false, 
////        message: "Invalid purchase ID format" 
////      }, { status: 400 });
////    }
////
////    const purchase = await PurchasePanel.findOne({
////      _id: id,
////      companyId: user.companyId
////    });
////
////    if (!purchase) {
////      return NextResponse.json({ 
////        success: false, 
////        message: "Purchase not found" 
////      }, { status: 404 });
////    }
////
////    // Update references
////    if (body.vehicleNegotiationId !== undefined) purchase.vehicleNegotiationId = body.vehicleNegotiationId;
////    if (body.vnnNo !== undefined) purchase.vnnNo = body.vnnNo;
////    if (body.pricingSerialNo !== undefined) purchase.pricingSerialNo = body.pricingSerialNo;
////    if (body.loadingInfoNo !== undefined) purchase.loadingInfoNo = body.loadingInfoNo;
////
////    // Update header
////    if (body.header) {
////      purchase.header = {
////        ...purchase.header,
////        ...body.header,
////        branch: body.header.branch ? new mongoose.Types.ObjectId(body.header.branch) : purchase.header.branch,
////        date: body.header.date ? new Date(body.header.date) : purchase.header.date
////      };
////    }
////
////    // Update billing
////    if (body.billing) {
////      purchase.billing = {
////        ...purchase.billing,
////        ...body.billing
////      };
////    }
////
////    // Update order rows
////    if (body.orderRows || body.orders) {
////      const orders = body.orderRows || body.orders;
////      purchase.orderRows = orders.map(row => ({
////        _id: row._id && mongoose.Types.ObjectId.isValid(row._id) 
////          ? new mongoose.Types.ObjectId(row._id) 
////          : new mongoose.Types.ObjectId(),
////        orderNo: row.orderNo || '',
////        partyName: row.partyName || '',
////        plantCode: row.plantCode || '',
////        plantName: row.plantName || '',
////        orderType: row.orderType || 'Sales',
////        pinCode: row.pinCode || '',
////        taluka: row.taluka || '',
////        district: row.district || '',
////        state: row.state || '',
////        country: row.country || '',
////        from: row.from || '',
////        to: row.to || '',
////        locationRate: row.locationRate || '',
////        priceList: row.priceList || '',
////        weight: num(row.weight),
////        rate: num(row.rate),
////        totalAmount: num(row.totalAmount) || (num(row.weight) * num(row.rate)),
////        collectionCharges: row.collectionCharges || '0',
////        cancellationCharges: row.cancellationCharges || 'Nil',
////        loadingCharges: row.loadingCharges || 'Nil',
////        otherCharges: row.otherCharges || '0'
////      }));
////    }
////
////    // Update purchase details
////    if (body.purchaseDetails) {
////      purchase.purchaseDetails = {
////        ...purchase.purchaseDetails,
////        ...body.purchaseDetails,
////        rate: num(body.purchaseDetails.rate),
////        weight: num(body.purchaseDetails.weight),
////        amount: num(body.purchaseDetails.amount),
////        advance: num(body.purchaseDetails.advance),
////        vehicleFloorTarpaulin: num(body.purchaseDetails.vehicleFloorTarpaulin),
////        vehicleOuterTarpaulin: num(body.purchaseDetails.vehicleOuterTarpaulin),
////        purchaseDate: body.purchaseDetails.purchaseDate ? new Date(body.purchaseDetails.purchaseDate) : purchase.purchaseDetails.purchaseDate
////      };
////    }
////
////    // Update loading expenses
////    if (body.loadingExpenses) {
////      purchase.loadingExpenses = {
////        loadingCharges: num(body.loadingExpenses.loadingCharges),
////        loadingStaffMunshiyana: num(body.loadingExpenses.loadingStaffMunshiyana),
////        otherExpenses: num(body.loadingExpenses.otherExpenses),
////        vehicleFloorTarpaulin: num(body.loadingExpenses.vehicleFloorTarpaulin),
////        vehicleOuterTarpaulin: num(body.loadingExpenses.vehicleOuterTarpaulin)
////      };
////      purchase.totalLoadingExpenses = (
////        purchase.loadingExpenses.loadingCharges +
////        purchase.loadingExpenses.loadingStaffMunshiyana +
////        purchase.loadingExpenses.otherExpenses +
////        purchase.loadingExpenses.vehicleFloorTarpaulin +
////        purchase.loadingExpenses.vehicleOuterTarpaulin
////      );
////    }
////
////    // Update additions
////    if (body.additions) {
////      purchase.additions = body.additions.map(row => ({
////        _id: row._id && mongoose.Types.ObjectId.isValid(row._id) 
////          ? new mongoose.Types.ObjectId(row._id) 
////          : new mongoose.Types.ObjectId(),
////        description: row.description || '',
////        amount: num(row.amount)
////      }));
////      purchase.totalAdditions = purchase.additions.reduce((sum, row) => sum + (row.amount || 0), 0);
////    }
////
////    // Update deductions
////    if (body.deductions) {
////      purchase.deductions = body.deductions.map(row => ({
////        _id: row._id && mongoose.Types.ObjectId.isValid(row._id) 
////          ? new mongoose.Types.ObjectId(row._id) 
////          : new mongoose.Types.ObjectId(),
////        description: row.description || '',
////        amount: num(row.amount)
////      }));
////      purchase.totalDeductions = purchase.deductions.reduce((sum, row) => sum + (row.amount || 0), 0);
////    }
////
////    // Update totals
////    purchase.totalOrderAmount = purchase.orderRows.reduce((sum, row) => sum + (row.totalAmount || 0), 0);
////    purchase.balance = purchase.totalOrderAmount - (purchase.purchaseDetails?.advance || 0);
////    purchase.netEffect = (purchase.purchaseDetails?.advance || 0) + purchase.totalAdditions - purchase.totalDeductions - purchase.totalLoadingExpenses;
////
////    // Update registered vehicle
////    if (body.registeredVehicle) {
////      purchase.registeredVehicle = {
////        vehiclePlate: body.registeredVehicle.vehiclePlate || body.registeredVehicle.registeredPlate || purchase.registeredVehicle.vehiclePlate,
////        isRegistered: body.registeredVehicle.isRegistered !== undefined ? body.registeredVehicle.isRegistered : purchase.registeredVehicle.isRegistered
////      };
////    }
////
////    // Update approval
////    if (body.approval) {
////      purchase.approval = {
////        ...purchase.approval,
////        ...body.approval
////      };
////    }
////
////    // Update arrival details
////    if (body.arrivalDetails) {
////      purchase.arrivalDetails = {
////        date: body.arrivalDetails.date ? new Date(body.arrivalDetails.date) : purchase.arrivalDetails.date,
////        time: body.arrivalDetails.time || purchase.arrivalDetails.time
////      };
////    }
////
////    // Update memo file
////    if (body.memoFile !== undefined) {
////      purchase.memoFile = body.memoFile;
////    }
////
////    await purchase.save();
////
////    return NextResponse.json({ 
////      success: true, 
////      message: "Purchase updated successfully",
////      data: {
////        _id: purchase._id,
////        purchaseNo: purchase.purchaseNo,
////        vnnNo: purchase.vnnNo,
////        pricingSerialNo: purchase.pricingSerialNo
////      }
////    }, { status: 200 });
////
////  } catch (error) {
////    console.error("❌ PUT /purchase-panel error:", error);
////    return NextResponse.json({ 
////      success: false, 
////      message: error.message || "Failed to update purchase"
////    }, { status: 500 });
////  }
////}
////
/////* ========================================
////   DELETE /api/purchase-panel - Delete
////======================================== */
////export async function DELETE(req) {
////  try {
////    await connectDb();
////    const { user, error, status } = await validateUser(req);
////    if (error) {
////      return NextResponse.json({ success: false, message: error }, { status });
////    }
////
////    const url = new URL(req.url);
////    const id = url.searchParams.get("id");
////    
////    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
////      return NextResponse.json({ 
////        success: false, 
////        message: "Valid ID is required" 
////      }, { status: 400 });
////    }
////
////    const result = await PurchasePanel.deleteOne({
////      _id: id,
////      companyId: user.companyId
////    });
////
////    if (result.deletedCount === 0) {
////      return NextResponse.json({ 
////        success: false, 
////        message: "Purchase not found" 
////      }, { status: 404 });
////    }
////
////    return NextResponse.json({ 
////      success: true, 
////      message: "Purchase deleted successfully" 
////    }, { status: 200 });
////
////  } catch (error) {
////    console.error("❌ DELETE /purchase-panel error:", error);
////    return NextResponse.json({ 
////      success: false, 
////      message: error.message || "Failed to delete purchase"
////    }, { status: 500 });
////  }
////}
//// route.js
//import { NextResponse } from "next/server";
//import connectDb from "@/lib/db";
//import PurchasePanel from "./PurchasePanel";
//import { getTokenFromHeader, verifyJWT } from "@/lib/auth";
//import { getNextPurchaseNumber } from "./PurchaseCounter";
//import mongoose from 'mongoose';
//
//// Helper function to convert to number
//function num(value) {
//  if (value === null || value === undefined || value === '') return 0;
//  const n = Number(value);
//  return Number.isFinite(n) ? n : 0;
//}
//
//// Role-based access check
//function isAuthorized(user) {
//  return (
//    user?.type === "company" ||
//    user?.role === "Admin" ||
//    user?.permissions?.includes("purchase_panel")
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
//    console.error("JWT Verification Failed:", err?.message || err);
//    return { error: "Invalid token", status: 401 };
//  }
//}
//
///* ========================================
//   GET /api/purchase-panel
//======================================== */
//export async function GET(req) {
//  try {
//    await connectDb();
//    const { user, error, status } = await validateUser(req);
//    if (error) {
//      return NextResponse.json({ success: false, message: error }, { status });
//    }
//
//    const url = new URL(req.url);
//    const id = url.searchParams.get("id");
//    const purchaseNo = url.searchParams.get("purchaseNo");
//    const format = url.searchParams.get("format");
//    const search = url.searchParams.get("search");
//    const fromDate = url.searchParams.get("fromDate");
//    const toDate = url.searchParams.get("toDate");
//    const statusFilter = url.searchParams.get("status");
//
//    // CASE 1: GET SINGLE PURCHASE BY ID
//    if (id) {
//      if (!mongoose.Types.ObjectId.isValid(id)) {
//        return NextResponse.json({ 
//          success: false, 
//          message: "Invalid purchase ID format" 
//        }, { status: 400 });
//      }
//
//      const purchase = await PurchasePanel.findOne({
//        _id: id,
//        companyId: user.companyId
//      }).lean();
//
//      if (!purchase) {
//        return NextResponse.json({ 
//          success: false, 
//          message: "Purchase not found" 
//        }, { status: 404 });
//      }
//
//      return NextResponse.json({ 
//        success: true, 
//        data: purchase 
//      }, { status: 200 });
//    }
//
//    // CASE 2: GET SINGLE PURCHASE BY PURCHASE NUMBER
//    if (purchaseNo) {
//      const purchase = await PurchasePanel.findOne({
//        purchaseNo: purchaseNo,
//        companyId: user.companyId
//      }).lean();
//
//      if (!purchase) {
//        return NextResponse.json({ 
//          success: false, 
//          message: "Purchase not found" 
//        }, { status: 404 });
//      }
//
//      return NextResponse.json({ 
//        success: true, 
//        data: purchase 
//      }, { status: 200 });
//    }
//
//    // CASE 3: TABLE FORMAT FOR LIST VIEW
//    if (format === 'table') {
//      let query = { companyId: user.companyId };
//
//      if (search) {
//        query.$or = [
//          { purchaseNo: { $regex: search, $options: 'i' } },
//          { vnnNo: { $regex: search, $options: 'i' } },
//          { pricingSerialNo: { $regex: search, $options: 'i' } },
//          { 'purchaseDetails.vendorName': { $regex: search, $options: 'i' } },
//          { 'purchaseDetails.vehicleNo': { $regex: search, $options: 'i' } }
//        ];
//      }
//
//      if (statusFilter) {
//        query['approval.status'] = statusFilter;
//      }
//
//      if (fromDate || toDate) {
//        query.createdAt = {};
//        if (fromDate) {
//          query.createdAt.$gte = new Date(fromDate);
//        }
//        if (toDate) {
//          query.createdAt.$lte = new Date(toDate + 'T23:59:59');
//        }
//      }
//
//      const purchases = await PurchasePanel.find(query)
//        .sort({ createdAt: -1 })
//        .lean();
//
//      const tableData = purchases.map(purchase => ({
//        _id: purchase._id,
//        date: purchase.createdAt ? new Date(purchase.createdAt).toLocaleDateString('en-IN') : '',
//        purchaseNo: purchase.purchaseNo || 'N/A',
//        vnnNo: purchase.vnnNo || 'N/A',
//        pricingSerialNo: purchase.pricingSerialNo || 'N/A',
//        loadingInfoNo: purchase.loadingInfoNo || 'N/A',
//        vendorName: purchase.purchaseDetails?.vendorName || 'N/A',
//        vendorCode: purchase.purchaseDetails?.vendorCode || 'N/A',
//        vehicleNo: purchase.purchaseDetails?.vehicleNo || 'N/A',
//        amount: purchase.purchaseAmountFromVNN || purchase.purchaseDetails?.amount || 0,
//        balance: purchase.balance || 0,
//        status: purchase.approval?.status || 'Draft'
//      }));
//
//      return NextResponse.json({
//        success: true,
//        data: tableData,
//        count: tableData.length
//      }, { status: 200 });
//    }
//
//    // CASE 4: LIST FOR DROPDOWNS
//    const purchases = await PurchasePanel.find({ 
//      companyId: user.companyId 
//    })
//    .select('purchaseNo vnnNo pricingSerialNo purchaseDetails.vendorName purchaseAmountFromVNN approval.status')
//    .sort({ createdAt: -1 })
//    .lean();
//
//    return NextResponse.json({
//      success: true,
//      data: purchases
//    }, { status: 200 });
//
//  } catch (error) {
//    console.error("❌ GET /purchase-panel error:", error);
//    return NextResponse.json({ 
//      success: false, 
//      message: error.message || "Failed to fetch purchases"
//    }, { status: 500 });
//  }
//}
//
///* ========================================
//   POST /api/purchase-panel - Create New
//======================================== */
//export async function POST(req) {
//  try {
//    await connectDb();
//    const { user, error, status } = await validateUser(req);
//    if (error) {
//      return NextResponse.json({ success: false, message: error }, { status });
//    }
//
//    const body = await req.json();
//    
//    console.log("📝 Creating new purchase");
//
//    // Generate purchase number
//    let purchaseNo = await getNextPurchaseNumber(user.companyId);
//
//    // Process order rows
//    const processedOrderRows = (body.orders || body.orderRows || []).map(row => ({
//      _id: new mongoose.Types.ObjectId(),
//      orderNo: row.orderNo || '',
//      partyName: row.partyName || '',
//      plantCode: row.plantCode || '',
//      plantName: row.plantName || '',
//      orderType: row.orderType || 'Sales',
//      pinCode: row.pinCode || '',
//      taluka: row.taluka || '',
//      district: row.district || '',
//      state: row.state || '',
//      country: row.country || '',
//      from: row.from || '',
//      to: row.to || '',
//      locationRate: row.locationRate || '',
//      priceList: row.priceList || '',
//      weight: num(row.weight),
//      rate: num(row.rate),
//      totalAmount: num(row.totalAmount) || (num(row.weight) * num(row.rate)),
//      collectionCharges: row.collectionCharges || '0',
//      cancellationCharges: row.cancellationCharges || 'Nil',
//      loadingCharges: row.loadingCharges || 'Nil',
//      otherCharges: row.otherCharges || '0'
//    }));
//
//    // Process additions
//    const processedAdditions = (body.additions || []).map(row => ({
//      _id: new mongoose.Types.ObjectId(),
//      description: row.description || '',
//      amount: num(row.amount)
//    }));
//
//    // Process deductions
//    const processedDeductions = (body.deductions || []).map(row => ({
//      _id: new mongoose.Types.ObjectId(),
//      description: row.description || '',
//      amount: num(row.amount)
//    }));
//
//    // Calculate totals
//    const totalOrderAmount = processedOrderRows.reduce((sum, row) => sum + (row.totalAmount || 0), 0);
//    const totalAdditions = processedAdditions.reduce((sum, row) => sum + (row.amount || 0), 0);
//    const totalDeductions = processedDeductions.reduce((sum, row) => sum + (row.amount || 0), 0);
//    
//    const purchaseAmountFromVNN = num(body.purchaseAmountFromVNN) || num(body.purchaseDetails?.amount) || totalOrderAmount;
//    const advance = num(body.purchaseDetails?.advance);
//    
//    const totalLoadingExpenses = (
//      num(body.loadingExpenses?.loadingCharges) +
//      num(body.loadingExpenses?.loadingStaffMunshiyana) +
//      num(body.loadingExpenses?.otherExpenses) +
//      num(body.loadingExpenses?.vehicleFloorTarpaulin) +
//      num(body.loadingExpenses?.vehicleOuterTarpaulin)
//    );
//    
//    // NEW: Calculate warehouse expenses
//    const totalWarehouseExpenses = (
//      num(body.warehouseExpenses?.wVehicleFloorTarpaulin) +
//      num(body.warehouseExpenses?.wVehicleOuterTarpaulin)
//    );
//    
//    const balance = purchaseAmountFromVNN - advance;
//    const netEffect = advance + totalAdditions - totalDeductions - totalLoadingExpenses - totalWarehouseExpenses;
//
//    // Handle branch ID
//    let branchId = null;
//    if (body.header?.branch) {
//      if (mongoose.Types.ObjectId.isValid(body.header.branch)) {
//        branchId = new mongoose.Types.ObjectId(body.header.branch);
//      } else if (typeof body.header.branch === 'object' && body.header.branch._id) {
//        branchId = new mongoose.Types.ObjectId(body.header.branch._id);
//      }
//    }
//
//    // Handle arrival details with new fields
//    const arrivalDetails = {
//      inDate: body.arrivalDetails?.inDate ? new Date(body.arrivalDetails.inDate) : new Date(),
//      inTime: body.arrivalDetails?.inTime || '',
//      outDate: body.arrivalDetails?.outDate ? new Date(body.arrivalDetails.outDate) : new Date(),
//      outTime: body.arrivalDetails?.outTime || '',
//      remarks: body.arrivalDetails?.remarks || '',
//      detentionDays: num(body.arrivalDetails?.detentionDays),
//      detentionAmount: num(body.arrivalDetails?.detentionAmount)
//    };
//
//    // Create purchase document
//    const purchase = new PurchasePanel({
//      purchaseNo,
//      vehicleNegotiationId: body.vehicleNegotiationId || null,
//      vnnNo: body.vnnNo || body.selectedVNNNo || '',
//      pricingSerialNo: body.header?.pricingSerialNo || body.pricingSerialNo || '',
//      loadingInfoNo: body.loadingInfoNo || '',
//      purchaseAmountFromVNN,
//      
//      header: {
//        purchaseNo,
//        pricingSerialNo: body.header?.pricingSerialNo || '',
//        branch: branchId,
//        branchName: body.header?.branchName || '',
//        branchCode: body.header?.branchCode || '',
//        date: body.header?.date ? new Date(body.header.date) : new Date(),
//        delivery: body.header?.delivery || 'Normal',
//      },
//      
//      billing: {
//        billingType: body.billing?.billingType || 'Multi - Order',
//        noOfLoadingPoints: body.billing?.noOfLoadingPoints || '1',
//        noOfDroppingPoint: body.billing?.noOfDroppingPoint || '1',
//        collectionCharges: body.billing?.collectionCharges || '0',
//        cancellationCharges: body.billing?.cancellationCharges || 'Nil',
//        loadingCharges: body.billing?.loadingCharges || 'Nil',
//        otherCharges: body.billing?.otherCharges || 'Nil',
//      },
//      
//      orderRows: processedOrderRows,
//      
//      purchaseDetails: {
//        vendorStatus: body.purchaseDetails?.vendorStatus || 'Active',
//        vendorName: body.purchaseDetails?.vendorName || '',
//        vendorCode: body.purchaseDetails?.vendorCode || '',
//        vehicleNo: body.purchaseDetails?.vehicleNo || '',
//        vehicleType: body.purchaseDetails?.vehicleType || '',
//        driverMobileNo: body.purchaseDetails?.driverMobileNo || '',
//        purchaseType: body.purchaseDetails?.purchaseType || 'Loading & Unloading',
//        paymentTerms: body.purchaseDetails?.paymentTerms || '80 % Advance',
//        rateType: body.purchaseDetails?.rateType || 'Per MT',
//        rate: num(body.purchaseDetails?.rate),
//        weight: num(body.purchaseDetails?.weight),
//        amount: purchaseAmountFromVNN,
//        advance: advance,
//        vehicleFloorTarpaulin: num(body.purchaseDetails?.vehicleFloorTarpaulin),
//        vehicleOuterTarpaulin: num(body.purchaseDetails?.vehicleOuterTarpaulin),
//        purchaseDate: body.purchaseDetails?.purchaseDate ? new Date(body.purchaseDetails.purchaseDate) : new Date(),
//      },
//      
//      loadingExpenses: {
//        loadingCharges: num(body.loadingExpenses?.loadingCharges),
//        loadingStaffMunshiyana: num(body.loadingExpenses?.loadingStaffMunshiyana),
//        otherExpenses: num(body.loadingExpenses?.otherExpenses),
//        vehicleFloorTarpaulin: num(body.loadingExpenses?.vehicleFloorTarpaulin),
//        vehicleOuterTarpaulin: num(body.loadingExpenses?.vehicleOuterTarpaulin),
//      },
//      totalLoadingExpenses,
//      
//      // NEW: Warehouse Expenses
//      warehouseExpenses: {
//        wVehicleFloorTarpaulin: num(body.warehouseExpenses?.wVehicleFloorTarpaulin),
//        wVehicleOuterTarpaulin: num(body.warehouseExpenses?.wVehicleOuterTarpaulin),
//      },
//      totalWarehouseExpenses,
//      
//      additions: processedAdditions,
//      deductions: processedDeductions,
//      totalAdditions,
//      totalDeductions,
//      totalOrderAmount,
//      balance,
//      netEffect,
//      
//      registeredVehicle: {
//        vehiclePlate: body.registeredVehicle?.vehiclePlate || body.registeredVehicle?.registeredPlate || '',
//        isRegistered: body.registeredVehicle?.isRegistered || false,
//      },
//      
//      approval: {
//        status: body.approval?.status || 'Pending',
//        remarks: body.approval?.remarks || '',
//      },
//      
//      arrivalDetails,
//      
//      memoFile: body.memoFile || null,
//      
//      companyId: user.companyId,
//      createdBy: user.id,
//      panelStatus: 'Draft'
//    });
//
//    await purchase.save();
//
//    return NextResponse.json({ 
//      success: true, 
//      message: "Purchase created successfully",
//      data: {
//        _id: purchase._id,
//        purchaseNo: purchase.purchaseNo,
//        vnnNo: purchase.vnnNo,
//        pricingSerialNo: purchase.pricingSerialNo
//      }
//    }, { status: 201 });
//
//  } catch (error) {
//    console.error("❌ POST /purchase-panel error:", error);
//
//    if (error.code === 11000) {
//      return NextResponse.json({ 
//        success: false, 
//        message: "Purchase number already exists" 
//      }, { status: 400 });
//    }
//
//    if (error.name === 'ValidationError') {
//      const messages = Object.values(error.errors).map(err => err.message);
//      return NextResponse.json({ 
//        success: false, 
//        message: messages.join(', ') 
//      }, { status: 400 });
//    }
//
//    return NextResponse.json({ 
//      success: false, 
//      message: error.message || "Failed to create purchase"
//    }, { status: 500 });
//  }
//}
//
///* ========================================
//   PUT /api/purchase-panel - Update
//======================================== */
//export async function PUT(req) {
//  try {
//    await connectDb();
//    const { user, error, status } = await validateUser(req);
//    if (error) {
//      return NextResponse.json({ success: false, message: error }, { status });
//    }
//
//    const body = await req.json();
//    const { id } = body;
//    
//    if (!id) {
//      return NextResponse.json({ 
//        success: false, 
//        message: "Purchase ID is required" 
//      }, { status: 400 });
//    }
//
//    if (!mongoose.Types.ObjectId.isValid(id)) {
//      return NextResponse.json({ 
//        success: false, 
//        message: "Invalid purchase ID format" 
//      }, { status: 400 });
//    }
//
//    const purchase = await PurchasePanel.findOne({
//      _id: id,
//      companyId: user.companyId
//    });
//
//    if (!purchase) {
//      return NextResponse.json({ 
//        success: false, 
//        message: "Purchase not found" 
//      }, { status: 404 });
//    }
//
//    // Update references
//    if (body.vehicleNegotiationId !== undefined) purchase.vehicleNegotiationId = body.vehicleNegotiationId;
//    if (body.vnnNo !== undefined) purchase.vnnNo = body.vnnNo;
//    if (body.pricingSerialNo !== undefined) purchase.pricingSerialNo = body.pricingSerialNo;
//    if (body.loadingInfoNo !== undefined) purchase.loadingInfoNo = body.loadingInfoNo;
//    if (body.purchaseAmountFromVNN !== undefined) purchase.purchaseAmountFromVNN = num(body.purchaseAmountFromVNN);
//
//    // Update header
//    if (body.header) {
//      purchase.header = {
//        ...purchase.header,
//        ...body.header,
//        branch: body.header.branch ? new mongoose.Types.ObjectId(body.header.branch) : purchase.header.branch,
//        date: body.header.date ? new Date(body.header.date) : purchase.header.date
//      };
//    }
//
//    // Update billing
//    if (body.billing) {
//      purchase.billing = {
//        ...purchase.billing,
//        ...body.billing
//      };
//    }
//
//    // Update order rows
//    if (body.orderRows || body.orders) {
//      const orders = body.orderRows || body.orders;
//      purchase.orderRows = orders.map(row => ({
//        _id: row._id && mongoose.Types.ObjectId.isValid(row._id) 
//          ? new mongoose.Types.ObjectId(row._id) 
//          : new mongoose.Types.ObjectId(),
//        orderNo: row.orderNo || '',
//        partyName: row.partyName || '',
//        plantCode: row.plantCode || '',
//        plantName: row.plantName || '',
//        orderType: row.orderType || 'Sales',
//        pinCode: row.pinCode || '',
//        taluka: row.taluka || '',
//        district: row.district || '',
//        state: row.state || '',
//        country: row.country || '',
//        from: row.from || '',
//        to: row.to || '',
//        locationRate: row.locationRate || '',
//        priceList: row.priceList || '',
//        weight: num(row.weight),
//        rate: num(row.rate),
//        totalAmount: num(row.totalAmount) || (num(row.weight) * num(row.rate)),
//        collectionCharges: row.collectionCharges || '0',
//        cancellationCharges: row.cancellationCharges || 'Nil',
//        loadingCharges: row.loadingCharges || 'Nil',
//        otherCharges: row.otherCharges || '0'
//      }));
//    }
//
//    // Update purchase details
//    if (body.purchaseDetails) {
//      purchase.purchaseDetails = {
//        ...purchase.purchaseDetails,
//        ...body.purchaseDetails,
//        rate: num(body.purchaseDetails.rate),
//        weight: num(body.purchaseDetails.weight),
//        amount: num(body.purchaseDetails.amount),
//        advance: num(body.purchaseDetails.advance),
//        vehicleFloorTarpaulin: num(body.purchaseDetails.vehicleFloorTarpaulin),
//        vehicleOuterTarpaulin: num(body.purchaseDetails.vehicleOuterTarpaulin),
//        purchaseDate: body.purchaseDetails.purchaseDate ? new Date(body.purchaseDetails.purchaseDate) : purchase.purchaseDetails.purchaseDate
//      };
//    }
//
//    // Update loading expenses
//    if (body.loadingExpenses) {
//      purchase.loadingExpenses = {
//        loadingCharges: num(body.loadingExpenses.loadingCharges),
//        loadingStaffMunshiyana: num(body.loadingExpenses.loadingStaffMunshiyana),
//        otherExpenses: num(body.loadingExpenses.otherExpenses),
//        vehicleFloorTarpaulin: num(body.loadingExpenses.vehicleFloorTarpaulin),
//        vehicleOuterTarpaulin: num(body.loadingExpenses.vehicleOuterTarpaulin)
//      };
//      purchase.totalLoadingExpenses = (
//        purchase.loadingExpenses.loadingCharges +
//        purchase.loadingExpenses.loadingStaffMunshiyana +
//        purchase.loadingExpenses.otherExpenses +
//        purchase.loadingExpenses.vehicleFloorTarpaulin +
//        purchase.loadingExpenses.vehicleOuterTarpaulin
//      );
//    }
//
//    // NEW: Update warehouse expenses
//    if (body.warehouseExpenses) {
//      purchase.warehouseExpenses = {
//        wVehicleFloorTarpaulin: num(body.warehouseExpenses.wVehicleFloorTarpaulin),
//        wVehicleOuterTarpaulin: num(body.warehouseExpenses.wVehicleOuterTarpaulin)
//      };
//      purchase.totalWarehouseExpenses = (
//        purchase.warehouseExpenses.wVehicleFloorTarpaulin +
//        purchase.warehouseExpenses.wVehicleOuterTarpaulin
//      );
//    }
//
//    // Update additions
//    if (body.additions) {
//      purchase.additions = body.additions.map(row => ({
//        _id: row._id && mongoose.Types.ObjectId.isValid(row._id) 
//          ? new mongoose.Types.ObjectId(row._id) 
//          : new mongoose.Types.ObjectId(),
//        description: row.description || '',
//        amount: num(row.amount)
//      }));
//      purchase.totalAdditions = purchase.additions.reduce((sum, row) => sum + (row.amount || 0), 0);
//    }
//
//    // Update deductions
//    if (body.deductions) {
//      purchase.deductions = body.deductions.map(row => ({
//        _id: row._id && mongoose.Types.ObjectId.isValid(row._id) 
//          ? new mongoose.Types.ObjectId(row._id) 
//          : new mongoose.Types.ObjectId(),
//        description: row.description || '',
//        amount: num(row.amount)
//      }));
//      purchase.totalDeductions = purchase.deductions.reduce((sum, row) => sum + (row.amount || 0), 0);
//    }
//
//    // Update totals
//    purchase.totalOrderAmount = purchase.orderRows.reduce((sum, row) => sum + (row.totalAmount || 0), 0);
//    const purchaseAmount = purchase.purchaseAmountFromVNN || purchase.purchaseDetails?.amount || 0;
//    purchase.balance = purchaseAmount - (purchase.purchaseDetails?.advance || 0);
//    purchase.netEffect = (purchase.purchaseDetails?.advance || 0) + purchase.totalAdditions - purchase.totalDeductions - purchase.totalLoadingExpenses - purchase.totalWarehouseExpenses;
//
//    // Update registered vehicle
//    if (body.registeredVehicle) {
//      purchase.registeredVehicle = {
//        vehiclePlate: body.registeredVehicle.vehiclePlate || body.registeredVehicle.registeredPlate || purchase.registeredVehicle.vehiclePlate,
//        isRegistered: body.registeredVehicle.isRegistered !== undefined ? body.registeredVehicle.isRegistered : purchase.registeredVehicle.isRegistered
//      };
//    }
//
//    // Update approval
//    if (body.approval) {
//      purchase.approval = {
//        ...purchase.approval,
//        ...body.approval
//      };
//    }
//
//    // Update arrival details with new fields
//    if (body.arrivalDetails) {
//      purchase.arrivalDetails = {
//        inDate: body.arrivalDetails.inDate ? new Date(body.arrivalDetails.inDate) : purchase.arrivalDetails.inDate,
//        inTime: body.arrivalDetails.inTime || purchase.arrivalDetails.inTime,
//        outDate: body.arrivalDetails.outDate ? new Date(body.arrivalDetails.outDate) : purchase.arrivalDetails.outDate,
//        outTime: body.arrivalDetails.outTime || purchase.arrivalDetails.outTime,
//        remarks: body.arrivalDetails.remarks !== undefined ? body.arrivalDetails.remarks : purchase.arrivalDetails.remarks,
//        detentionDays: body.arrivalDetails.detentionDays !== undefined ? num(body.arrivalDetails.detentionDays) : purchase.arrivalDetails.detentionDays,
//        detentionAmount: body.arrivalDetails.detentionAmount !== undefined ? num(body.arrivalDetails.detentionAmount) : purchase.arrivalDetails.detentionAmount
//      };
//    }
//
//    // Update memo file
//    if (body.memoFile !== undefined) {
//      purchase.memoFile = body.memoFile;
//    }
//
//    await purchase.save();
//
//    return NextResponse.json({ 
//      success: true, 
//      message: "Purchase updated successfully",
//      data: {
//        _id: purchase._id,
//        purchaseNo: purchase.purchaseNo,
//        vnnNo: purchase.vnnNo,
//        pricingSerialNo: purchase.pricingSerialNo
//      }
//    }, { status: 200 });
//
//  } catch (error) {
//    console.error("❌ PUT /purchase-panel error:", error);
//    return NextResponse.json({ 
//      success: false, 
//      message: error.message || "Failed to update purchase"
//    }, { status: 500 });
//  }
//}
//
///* ========================================
//   DELETE /api/purchase-panel - Delete
//======================================== */
//export async function DELETE(req) {
//  try {
//    await connectDb();
//    const { user, error, status } = await validateUser(req);
//    if (error) {
//      return NextResponse.json({ success: false, message: error }, { status });
//    }
//
//    const url = new URL(req.url);
//    const id = url.searchParams.get("id");
//    
//    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
//      return NextResponse.json({ 
//        success: false, 
//        message: "Valid ID is required" 
//      }, { status: 400 });
//    }
//
//    const result = await PurchasePanel.deleteOne({
//      _id: id,
//      companyId: user.companyId
//    });
//
//    if (result.deletedCount === 0) {
//      return NextResponse.json({ 
//        success: false, 
//        message: "Purchase not found" 
//      }, { status: 404 });
//    }
//
//    return NextResponse.json({ 
//      success: true, 
//      message: "Purchase deleted successfully" 
//    }, { status: 200 });
//
//  } catch (error) {
//    console.error("❌ DELETE /purchase-panel error:", error);
//    return NextResponse.json({ 
//      success: false, 
//      message: error.message || "Failed to delete purchase"
//    }, { status: 500 });
//  }
//}
// route.js - Updated Purchase Panel API with LR Code fetch from Consignment Notes
import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import PurchasePanel from "./PurchasePanel";
import ConsignmentNote from "../consignment-note/ConsignmentNote"; // Import ConsignmentNote model
import { getTokenFromHeader, verifyJWT } from "@/lib/auth";
import { getNextPurchaseNumber } from "./PurchaseCounter";
import mongoose from 'mongoose';

// Helper function to convert to number
function num(value) {
  if (value === null || value === undefined || value === '') return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

// Role-based access check
function isAuthorized(user) {
  return (
    user?.type === "company" ||
    user?.role === "Admin" ||
    user?.permissions?.includes("purchase_panel")
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

// Helper function to get LR Code from Consignment Note by orderNo
async function getLRCodeByOrderNo(orderNo, companyId) {
  if (!orderNo) return '';
  
  try {
    const consignmentNote = await ConsignmentNote.findOne({
      'header.orderNo': orderNo,
      companyId: companyId
    }).lean();
    
    return consignmentNote?.lrNo || consignmentNote?.header?.lrNo || '';
  } catch (error) {
    console.error(`Error fetching LR code for order ${orderNo}:`, error);
    return '';
  }
}

// Helper function to get LR Code for all orders in a purchase
async function getLRCodeForPurchase(purchase, companyId) {
  let lrCode = '';
  
  if (purchase.orderRows && purchase.orderRows.length > 0) {
    const firstOrderNo = purchase.orderRows[0]?.orderNo;
    if (firstOrderNo) {
      lrCode = await getLRCodeByOrderNo(firstOrderNo, companyId);
    }
  }
  
  return lrCode;
}

/* ========================================
   GET /api/purchase-panel
======================================== */
export async function GET(req) {
  try {
    await connectDb();
    const { user, error, status } = await validateUser(req);
    if (error) {
      return NextResponse.json({ success: false, message: error }, { status });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const purchaseNo = url.searchParams.get("purchaseNo");
    const format = url.searchParams.get("format");
    const search = url.searchParams.get("search");
    const fromDate = url.searchParams.get("fromDate");
    const toDate = url.searchParams.get("toDate");
    const statusFilter = url.searchParams.get("status");

    // Helper function to extract from/to
    const enhancePurchase = async (purchase) => {
      let fromLocation = '';
      let toLocation = '';
      
      if (purchase.orderRows && purchase.orderRows.length > 0) {
        fromLocation = purchase.orderRows[0]?.from || '';
        toLocation = purchase.orderRows[0]?.to || '';
      }
      
      // Get LR code from consignment note
      const lrCode = await getLRCodeForPurchase(purchase, user.companyId);
      
      return {
        ...purchase,
        fromLocation,
        toLocation,
        lrCode
      };
    };

    // CASE 1: GET SINGLE PURCHASE BY ID
    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ 
          success: false, 
          message: "Invalid purchase ID format" 
        }, { status: 400 });
      }

      const purchase = await PurchasePanel.findOne({
        _id: id,
        companyId: user.companyId
      }).lean();

      if (!purchase) {
        return NextResponse.json({ 
          success: false, 
          message: "Purchase not found" 
        }, { status: 404 });
      }

      const enhancedPurchase = await enhancePurchase(purchase);

      return NextResponse.json({ 
        success: true, 
        data: enhancedPurchase 
      }, { status: 200 });
    }

    // CASE 2: GET SINGLE PURCHASE BY PURCHASE NUMBER
    if (purchaseNo) {
      const purchase = await PurchasePanel.findOne({
        purchaseNo: purchaseNo,
        companyId: user.companyId
      }).lean();

      if (!purchase) {
        return NextResponse.json({ 
          success: false, 
          message: "Purchase not found" 
        }, { status: 404 });
      }

      const enhancedPurchase = await enhancePurchase(purchase);

      return NextResponse.json({ 
        success: true, 
        data: enhancedPurchase 
      }, { status: 200 });
    }

    // CASE 3: TABLE FORMAT FOR LIST VIEW
    if (format === 'table') {
      let query = { companyId: user.companyId };

      if (search) {
        query.$or = [
          { purchaseNo: { $regex: search, $options: 'i' } },
          { vnnNo: { $regex: search, $options: 'i' } },
          { pricingSerialNo: { $regex: search, $options: 'i' } },
          { 'purchaseDetails.vendorName': { $regex: search, $options: 'i' } },
          { 'purchaseDetails.vehicleNo': { $regex: search, $options: 'i' } }
        ];
      }

      if (statusFilter) {
        query['approval.status'] = statusFilter;
      }

      if (fromDate || toDate) {
        query.createdAt = {};
        if (fromDate) {
          query.createdAt.$gte = new Date(fromDate);
        }
        if (toDate) {
          query.createdAt.$lte = new Date(toDate + 'T23:59:59');
        }
      }

      const purchases = await PurchasePanel.find(query)
        .sort({ createdAt: -1 })
        .lean();

      // Get LR codes for all purchases (batch processing)
      const purchasesWithLR = await Promise.all(purchases.map(async (purchase) => {
        let fromLocation = '';
        let toLocation = '';
        let lrCode = '';
        
        if (purchase.orderRows && purchase.orderRows.length > 0) {
          fromLocation = purchase.orderRows[0]?.from || '';
          toLocation = purchase.orderRows[0]?.to || '';
          
          // Get LR code from consignment note
          const firstOrderNo = purchase.orderRows[0]?.orderNo;
          if (firstOrderNo) {
            lrCode = await getLRCodeByOrderNo(firstOrderNo, user.companyId);
          }
        }
        
        const vehicleNo = purchase.purchaseDetails?.vehicleNo || 
                          purchase.vehicleNo || 
                          purchase.header?.vehicleNo || 
                          '';
        
        return {
          _id: purchase._id,
          date: purchase.createdAt ? new Date(purchase.createdAt).toLocaleDateString('en-IN') : '',
          purchaseNo: purchase.purchaseNo || 'N/A',
          vnnNo: purchase.vnnNo || 'N/A',
          pricingSerialNo: purchase.pricingSerialNo || 'N/A',
          loadingInfoNo: purchase.loadingInfoNo || 'N/A',
          vendorName: purchase.purchaseDetails?.vendorName || 'N/A',
          vendorCode: purchase.purchaseDetails?.vendorCode || 'N/A',
          vehicleNo: vehicleNo,
          fromLocation: fromLocation,
          toLocation: toLocation,
          lrCode: lrCode,
          amount: purchase.purchaseAmountFromVNN || purchase.purchaseDetails?.amount || 0,
          balance: purchase.balance || 0,
          status: purchase.approval?.status || 'Draft',
          orderRows: purchase.orderRows || []
        };
      }));

      return NextResponse.json({
        success: true,
        data: purchasesWithLR,
        count: purchasesWithLR.length
      }, { status: 200 });
    }

    // CASE 4: LIST FOR DROPDOWNS
    const purchases = await PurchasePanel.find({ 
      companyId: user.companyId 
    })
    .select('purchaseNo vnnNo pricingSerialNo purchaseDetails.vendorName purchaseAmountFromVNN approval.status orderRows purchaseDetails.vehicleNo')
    .sort({ createdAt: -1 })
    .lean();

    // Enhance each purchase for dropdown with LR code from consignment note
    const enhancedPurchases = await Promise.all(purchases.map(async (purchase) => {
      let fromLocation = '';
      let toLocation = '';
      let lrCode = '';
      
      if (purchase.orderRows && purchase.orderRows.length > 0) {
        fromLocation = purchase.orderRows[0]?.from || '';
        toLocation = purchase.orderRows[0]?.to || '';
        
        // Get LR code from consignment note
        const firstOrderNo = purchase.orderRows[0]?.orderNo;
        if (firstOrderNo) {
          lrCode = await getLRCodeByOrderNo(firstOrderNo, user.companyId);
        }
      }
      
      const vehicleNo = purchase.purchaseDetails?.vehicleNo || '';
      
      return {
        ...purchase,
        fromLocation,
        toLocation,
        lrCode,
        vehicleNo
      };
    }));

    return NextResponse.json({
      success: true,
      data: enhancedPurchases
    }, { status: 200 });

  } catch (error) {
    console.error("❌ GET /purchase-panel error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to fetch purchases"
    }, { status: 500 });
  }
}

/* ========================================
   POST /api/purchase-panel - Create New (NO CHANGES)
======================================== */
export async function POST(req) {
  try {
    await connectDb();
    const { user, error, status } = await validateUser(req);
    if (error) {
      return NextResponse.json({ success: false, message: error }, { status });
    }

    const body = await req.json();
    
    console.log("📝 Creating new purchase");

    // Generate purchase number
    let purchaseNo = await getNextPurchaseNumber(user.companyId);

    // Process order rows
    const processedOrderRows = (body.orders || body.orderRows || []).map(row => ({
      _id: new mongoose.Types.ObjectId(),
      orderNo: row.orderNo || '',
      partyName: row.partyName || '',
      plantCode: row.plantCode || '',
      plantName: row.plantName || '',
      orderType: row.orderType || 'Sales',
      pinCode: row.pinCode || '',
      taluka: row.taluka || '',
      district: row.district || '',
      state: row.state || '',
      country: row.country || '',
      from: row.from || '',
      to: row.to || '',
      locationRate: row.locationRate || '',
      priceList: row.priceList || '',
      weight: num(row.weight),
      rate: num(row.rate),
      totalAmount: num(row.totalAmount) || (num(row.weight) * num(row.rate)),
      collectionCharges: row.collectionCharges || '0',
      cancellationCharges: row.cancellationCharges || 'Nil',
      loadingCharges: row.loadingCharges || 'Nil',
      otherCharges: row.otherCharges || '0'
    }));

    // Process additions
    const processedAdditions = (body.additions || []).map(row => ({
      _id: new mongoose.Types.ObjectId(),
      description: row.description || '',
      amount: num(row.amount)
    }));

    // Process deductions
    const processedDeductions = (body.deductions || []).map(row => ({
      _id: new mongoose.Types.ObjectId(),
      description: row.description || '',
      amount: num(row.amount)
    }));

    // Calculate totals
    const totalOrderAmount = processedOrderRows.reduce((sum, row) => sum + (row.totalAmount || 0), 0);
    const totalAdditions = processedAdditions.reduce((sum, row) => sum + (row.amount || 0), 0);
    const totalDeductions = processedDeductions.reduce((sum, row) => sum + (row.amount || 0), 0);
    
    const purchaseAmountFromVNN = num(body.purchaseAmountFromVNN) || num(body.purchaseDetails?.amount) || totalOrderAmount;
    const advance = num(body.purchaseDetails?.advance);
    
    const totalLoadingExpenses = (
      num(body.loadingExpenses?.loadingCharges) +
      num(body.loadingExpenses?.loadingStaffMunshiyana) +
      num(body.loadingExpenses?.otherExpenses) +
      num(body.loadingExpenses?.vehicleFloorTarpaulin) +
      num(body.loadingExpenses?.vehicleOuterTarpaulin)
    );
    
    const totalWarehouseExpenses = (
      num(body.warehouseExpenses?.wVehicleFloorTarpaulin) +
      num(body.warehouseExpenses?.wVehicleOuterTarpaulin)
    );
    
    const balance = purchaseAmountFromVNN - advance;
    const netEffect = advance + totalAdditions - totalDeductions - totalLoadingExpenses - totalWarehouseExpenses;

    // Handle branch ID
    let branchId = null;
    if (body.header?.branch) {
      if (mongoose.Types.ObjectId.isValid(body.header.branch)) {
        branchId = new mongoose.Types.ObjectId(body.header.branch);
      } else if (typeof body.header.branch === 'object' && body.header.branch._id) {
        branchId = new mongoose.Types.ObjectId(body.header.branch._id);
      }
    }

    // Handle arrival details with new fields
    const arrivalDetails = {
      inDate: body.arrivalDetails?.inDate ? new Date(body.arrivalDetails.inDate) : new Date(),
      inTime: body.arrivalDetails?.inTime || '',
      outDate: body.arrivalDetails?.outDate ? new Date(body.arrivalDetails.outDate) : new Date(),
      outTime: body.arrivalDetails?.outTime || '',
      remarks: body.arrivalDetails?.remarks || '',
      detentionDays: num(body.arrivalDetails?.detentionDays),
      detentionAmount: num(body.arrivalDetails?.detentionAmount)
    };

    // Create purchase document
    const purchase = new PurchasePanel({
      purchaseNo,
      vehicleNegotiationId: body.vehicleNegotiationId || null,
      vnnNo: body.vnnNo || body.selectedVNNNo || '',
      pricingSerialNo: body.header?.pricingSerialNo || body.pricingSerialNo || '',
      loadingInfoNo: body.loadingInfoNo || '',
      purchaseAmountFromVNN,
      
      header: {
        purchaseNo,
        pricingSerialNo: body.header?.pricingSerialNo || '',
        branch: branchId,
        branchName: body.header?.branchName || '',
        branchCode: body.header?.branchCode || '',
        date: body.header?.date ? new Date(body.header.date) : new Date(),
        delivery: body.header?.delivery || 'Normal',
      },
      
      billing: {
        billingType: body.billing?.billingType || 'Multi - Order',
        noOfLoadingPoints: body.billing?.noOfLoadingPoints || '1',
        noOfDroppingPoint: body.billing?.noOfDroppingPoint || '1',
        collectionCharges: body.billing?.collectionCharges || '0',
        cancellationCharges: body.billing?.cancellationCharges || 'Nil',
        loadingCharges: body.billing?.loadingCharges || 'Nil',
        otherCharges: body.billing?.otherCharges || 'Nil',
      },
      
      orderRows: processedOrderRows,
      
      purchaseDetails: {
        vendorStatus: body.purchaseDetails?.vendorStatus || 'Active',
        vendorName: body.purchaseDetails?.vendorName || '',
        vendorCode: body.purchaseDetails?.vendorCode || '',
        vehicleNo: body.purchaseDetails?.vehicleNo || '',
        vehicleType: body.purchaseDetails?.vehicleType || '',
        driverMobileNo: body.purchaseDetails?.driverMobileNo || '',
        purchaseType: body.purchaseDetails?.purchaseType || 'Loading & Unloading',
        paymentTerms: body.purchaseDetails?.paymentTerms || '80 % Advance',
        rateType: body.purchaseDetails?.rateType || 'Per MT',
        rate: num(body.purchaseDetails?.rate),
        weight: num(body.purchaseDetails?.weight),
        amount: purchaseAmountFromVNN,
        advance: advance,
        vehicleFloorTarpaulin: num(body.purchaseDetails?.vehicleFloorTarpaulin),
        vehicleOuterTarpaulin: num(body.purchaseDetails?.vehicleOuterTarpaulin),
        purchaseDate: body.purchaseDetails?.purchaseDate ? new Date(body.purchaseDetails.purchaseDate) : new Date(),
      },
      
      loadingExpenses: {
        loadingCharges: num(body.loadingExpenses?.loadingCharges),
        loadingStaffMunshiyana: num(body.loadingExpenses?.loadingStaffMunshiyana),
        otherExpenses: num(body.loadingExpenses?.otherExpenses),
        vehicleFloorTarpaulin: num(body.loadingExpenses?.vehicleFloorTarpaulin),
        vehicleOuterTarpaulin: num(body.loadingExpenses?.vehicleOuterTarpaulin),
      },
      totalLoadingExpenses,
      
      warehouseExpenses: {
        wVehicleFloorTarpaulin: num(body.warehouseExpenses?.wVehicleFloorTarpaulin),
        wVehicleOuterTarpaulin: num(body.warehouseExpenses?.wVehicleOuterTarpaulin),
      },
      totalWarehouseExpenses,
      
      additions: processedAdditions,
      deductions: processedDeductions,
      totalAdditions,
      totalDeductions,
      totalOrderAmount,
      balance,
      netEffect,
      
      registeredVehicle: {
        vehiclePlate: body.registeredVehicle?.vehiclePlate || body.registeredVehicle?.registeredPlate || '',
        isRegistered: body.registeredVehicle?.isRegistered || false,
      },
      
      approval: {
        status: body.approval?.status || 'Pending',
        remarks: body.approval?.remarks || '',
      },
      
      arrivalDetails,
      
      memoFile: body.memoFile || null,
      
      companyId: user.companyId,
      createdBy: user.id,
      panelStatus: 'Draft'
    });

    await purchase.save();

    return NextResponse.json({ 
      success: true, 
      message: "Purchase created successfully",
      data: {
        _id: purchase._id,
        purchaseNo: purchase.purchaseNo,
        vnnNo: purchase.vnnNo,
        pricingSerialNo: purchase.pricingSerialNo
      }
    }, { status: 201 });

  } catch (error) {
    console.error("❌ POST /purchase-panel error:", error);

    if (error.code === 11000) {
      return NextResponse.json({ 
        success: false, 
        message: "Purchase number already exists" 
      }, { status: 400 });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return NextResponse.json({ 
        success: false, 
        message: messages.join(', ') 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to create purchase"
    }, { status: 500 });
  }
}

/* ========================================
   PUT /api/purchase-panel - Update (NO CHANGES)
======================================== */
export async function PUT(req) {
  try {
    await connectDb();
    const { user, error, status } = await validateUser(req);
    if (error) {
      return NextResponse.json({ success: false, message: error }, { status });
    }

    const body = await req.json();
    const { id } = body;
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        message: "Purchase ID is required" 
      }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid purchase ID format" 
      }, { status: 400 });
    }

    const purchase = await PurchasePanel.findOne({
      _id: id,
      companyId: user.companyId
    });

    if (!purchase) {
      return NextResponse.json({ 
        success: false, 
        message: "Purchase not found" 
      }, { status: 404 });
    }

    // Update references
    if (body.vehicleNegotiationId !== undefined) purchase.vehicleNegotiationId = body.vehicleNegotiationId;
    if (body.vnnNo !== undefined) purchase.vnnNo = body.vnnNo;
    if (body.pricingSerialNo !== undefined) purchase.pricingSerialNo = body.pricingSerialNo;
    if (body.loadingInfoNo !== undefined) purchase.loadingInfoNo = body.loadingInfoNo;
    if (body.purchaseAmountFromVNN !== undefined) purchase.purchaseAmountFromVNN = num(body.purchaseAmountFromVNN);

    // Update header
    if (body.header) {
      purchase.header = {
        ...purchase.header,
        ...body.header,
        branch: body.header.branch ? new mongoose.Types.ObjectId(body.header.branch) : purchase.header.branch,
        date: body.header.date ? new Date(body.header.date) : purchase.header.date
      };
    }

    // Update billing
    if (body.billing) {
      purchase.billing = {
        ...purchase.billing,
        ...body.billing
      };
    }

    // Update order rows
    if (body.orderRows || body.orders) {
      const orders = body.orderRows || body.orders;
      purchase.orderRows = orders.map(row => ({
        _id: row._id && mongoose.Types.ObjectId.isValid(row._id) 
          ? new mongoose.Types.ObjectId(row._id) 
          : new mongoose.Types.ObjectId(),
        orderNo: row.orderNo || '',
        partyName: row.partyName || '',
        plantCode: row.plantCode || '',
        plantName: row.plantName || '',
        orderType: row.orderType || 'Sales',
        pinCode: row.pinCode || '',
        taluka: row.taluka || '',
        district: row.district || '',
        state: row.state || '',
        country: row.country || '',
        from: row.from || '',
        to: row.to || '',
        locationRate: row.locationRate || '',
        priceList: row.priceList || '',
        weight: num(row.weight),
        rate: num(row.rate),
        totalAmount: num(row.totalAmount) || (num(row.weight) * num(row.rate)),
        collectionCharges: row.collectionCharges || '0',
        cancellationCharges: row.cancellationCharges || 'Nil',
        loadingCharges: row.loadingCharges || 'Nil',
        otherCharges: row.otherCharges || '0'
      }));
    }

    // Update purchase details
    if (body.purchaseDetails) {
      purchase.purchaseDetails = {
        ...purchase.purchaseDetails,
        ...body.purchaseDetails,
        rate: num(body.purchaseDetails.rate),
        weight: num(body.purchaseDetails.weight),
        amount: num(body.purchaseDetails.amount),
        advance: num(body.purchaseDetails.advance),
        vehicleFloorTarpaulin: num(body.purchaseDetails.vehicleFloorTarpaulin),
        vehicleOuterTarpaulin: num(body.purchaseDetails.vehicleOuterTarpaulin),
        purchaseDate: body.purchaseDetails.purchaseDate ? new Date(body.purchaseDetails.purchaseDate) : purchase.purchaseDetails.purchaseDate
      };
    }

    // Update loading expenses
    if (body.loadingExpenses) {
      purchase.loadingExpenses = {
        loadingCharges: num(body.loadingExpenses.loadingCharges),
        loadingStaffMunshiyana: num(body.loadingExpenses.loadingStaffMunshiyana),
        otherExpenses: num(body.loadingExpenses.otherExpenses),
        vehicleFloorTarpaulin: num(body.loadingExpenses.vehicleFloorTarpaulin),
        vehicleOuterTarpaulin: num(body.loadingExpenses.vehicleOuterTarpaulin)
      };
      purchase.totalLoadingExpenses = (
        purchase.loadingExpenses.loadingCharges +
        purchase.loadingExpenses.loadingStaffMunshiyana +
        purchase.loadingExpenses.otherExpenses +
        purchase.loadingExpenses.vehicleFloorTarpaulin +
        purchase.loadingExpenses.vehicleOuterTarpaulin
      );
    }

    // Update warehouse expenses
    if (body.warehouseExpenses) {
      purchase.warehouseExpenses = {
        wVehicleFloorTarpaulin: num(body.warehouseExpenses.wVehicleFloorTarpaulin),
        wVehicleOuterTarpaulin: num(body.warehouseExpenses.wVehicleOuterTarpaulin)
      };
      purchase.totalWarehouseExpenses = (
        purchase.warehouseExpenses.wVehicleFloorTarpaulin +
        purchase.warehouseExpenses.wVehicleOuterTarpaulin
      );
    }

    // Update additions
    if (body.additions) {
      purchase.additions = body.additions.map(row => ({
        _id: row._id && mongoose.Types.ObjectId.isValid(row._id) 
          ? new mongoose.Types.ObjectId(row._id) 
          : new mongoose.Types.ObjectId(),
        description: row.description || '',
        amount: num(row.amount)
      }));
      purchase.totalAdditions = purchase.additions.reduce((sum, row) => sum + (row.amount || 0), 0);
    }

    // Update deductions
    if (body.deductions) {
      purchase.deductions = body.deductions.map(row => ({
        _id: row._id && mongoose.Types.ObjectId.isValid(row._id) 
          ? new mongoose.Types.ObjectId(row._id) 
          : new mongoose.Types.ObjectId(),
        description: row.description || '',
        amount: num(row.amount)
      }));
      purchase.totalDeductions = purchase.deductions.reduce((sum, row) => sum + (row.amount || 0), 0);
    }

    // Update totals
    purchase.totalOrderAmount = purchase.orderRows.reduce((sum, row) => sum + (row.totalAmount || 0), 0);
    const purchaseAmount = purchase.purchaseAmountFromVNN || purchase.purchaseDetails?.amount || 0;
    purchase.balance = purchaseAmount - (purchase.purchaseDetails?.advance || 0);
    purchase.netEffect = (purchase.purchaseDetails?.advance || 0) + purchase.totalAdditions - purchase.totalDeductions - purchase.totalLoadingExpenses - purchase.totalWarehouseExpenses;

    // Update registered vehicle
    if (body.registeredVehicle) {
      purchase.registeredVehicle = {
        vehiclePlate: body.registeredVehicle.vehiclePlate || body.registeredVehicle.registeredPlate || purchase.registeredVehicle.vehiclePlate,
        isRegistered: body.registeredVehicle.isRegistered !== undefined ? body.registeredVehicle.isRegistered : purchase.registeredVehicle.isRegistered
      };
    }

    // Update approval
    if (body.approval) {
      purchase.approval = {
        ...purchase.approval,
        ...body.approval
      };
    }

    // Update arrival details
    if (body.arrivalDetails) {
      purchase.arrivalDetails = {
        inDate: body.arrivalDetails.inDate ? new Date(body.arrivalDetails.inDate) : purchase.arrivalDetails.inDate,
        inTime: body.arrivalDetails.inTime || purchase.arrivalDetails.inTime,
        outDate: body.arrivalDetails.outDate ? new Date(body.arrivalDetails.outDate) : purchase.arrivalDetails.outDate,
        outTime: body.arrivalDetails.outTime || purchase.arrivalDetails.outTime,
        remarks: body.arrivalDetails.remarks !== undefined ? body.arrivalDetails.remarks : purchase.arrivalDetails.remarks,
        detentionDays: body.arrivalDetails.detentionDays !== undefined ? num(body.arrivalDetails.detentionDays) : purchase.arrivalDetails.detentionDays,
        detentionAmount: body.arrivalDetails.detentionAmount !== undefined ? num(body.arrivalDetails.detentionAmount) : purchase.arrivalDetails.detentionAmount
      };
    }

    // Update memo file
    if (body.memoFile !== undefined) {
      purchase.memoFile = body.memoFile;
    }

    await purchase.save();

    return NextResponse.json({ 
      success: true, 
      message: "Purchase updated successfully",
      data: {
        _id: purchase._id,
        purchaseNo: purchase.purchaseNo,
        vnnNo: purchase.vnnNo,
        pricingSerialNo: purchase.pricingSerialNo
      }
    }, { status: 200 });

  } catch (error) {
    console.error("❌ PUT /purchase-panel error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to update purchase"
    }, { status: 500 });
  }
}

/* ========================================
   DELETE /api/purchase-panel - Delete (NO CHANGES)
======================================== */
export async function DELETE(req) {
  try {
    await connectDb();
    const { user, error, status } = await validateUser(req);
    if (error) {
      return NextResponse.json({ success: false, message: error }, { status });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        message: "Valid ID is required" 
      }, { status: 400 });
    }

    const result = await PurchasePanel.deleteOne({
      _id: id,
      companyId: user.companyId
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "Purchase not found" 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Purchase deleted successfully" 
    }, { status: 200 });

  } catch (error) {
    console.error("❌ DELETE /purchase-panel error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to delete purchase"
    }, { status: 500 });
  }
}