//import { NextResponse } from "next/server";
//import connectDb from "@/lib/db";
//import AdvancePayment from "./AdvancePayment";
//import { getTokenFromHeader, verifyJWT } from "@/lib/auth";
//import { getNextAdvancePaymentNumber } from "./AdvancePaymentCounter";
//import mongoose from 'mongoose';
//
//// Helper function to convert to number
//function num(value) {
//  if (value === null || value === undefined || value === '') return 0;
//  const n = Number(value);
//  return Number.isFinite(n) ? n : 0;
//}
//
//// ✅ Role-based access check
//function isAuthorized(user) {
//  return (
//    user?.type === "company" ||
//    user?.role === "Admin" ||
//    user?.permissions?.includes("advance_payment")
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
//   GET /api/advance-payment - Get All Advance Payments
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
//    const paymentNo = url.searchParams.get("paymentNo");
//    const purchaseNo = url.searchParams.get("purchaseNo");
//    const format = url.searchParams.get("format");
//    const search = url.searchParams.get("search");
//    const fromDate = url.searchParams.get("fromDate");
//    const toDate = url.searchParams.get("toDate");
//    const statusFilter = url.searchParams.get("status");
//
//    // ============ CASE 1: GET SINGLE BY ID ============
//    if (id) {
//      if (!mongoose.Types.ObjectId.isValid(id)) {
//        return NextResponse.json({ 
//          success: false, 
//          message: "Invalid advance payment ID format" 
//        }, { status: 400 });
//      }
//
//      const payment = await AdvancePayment.findOne({
//        _id: id,
//        companyId: user.companyId
//      }).lean();
//
//      if (!payment) {
//        return NextResponse.json({ 
//          success: false, 
//          message: "Advance payment not found" 
//        }, { status: 404 });
//      }
//
//      return NextResponse.json({ 
//        success: true, 
//        data: payment 
//      }, { status: 200 });
//    }
//
//    // ============ CASE 2: GET BY PAYMENT NUMBER ============
//    if (paymentNo) {
//      const payment = await AdvancePayment.findOne({
//        paymentNo: paymentNo,
//        companyId: user.companyId
//      }).lean();
//
//      if (!payment) {
//        return NextResponse.json({ 
//          success: false, 
//          message: "Advance payment not found" 
//        }, { status: 404 });
//      }
//
//      return NextResponse.json({ 
//        success: true, 
//        data: payment 
//      }, { status: 200 });
//    }
//
//    // ============ CASE 3: GET BY PURCHASE NUMBER ============
//    if (purchaseNo) {
//      const payment = await AdvancePayment.findOne({
//        purchaseNo: purchaseNo,
//        companyId: user.companyId
//      }).lean();
//
//      return NextResponse.json({ 
//        success: true, 
//        data: payment || null,
//        exists: !!payment
//      }, { status: 200 });
//    }
//
//    // ============ CASE 4: TABLE FORMAT FOR LIST VIEW ============
//    if (format === 'table') {
//      let query = { companyId: user.companyId };
//
//      // Search filter
//      if (search) {
//        query.$or = [
//          { paymentNo: { $regex: search, $options: 'i' } },
//          { purchaseNo: { $regex: search, $options: 'i' } },
//          { pricingSerialNo: { $regex: search, $options: 'i' } },
//          { 'vendorDetails.vendorName': { $regex: search, $options: 'i' } },
//          { 'vendorDetails.vendorCode': { $regex: search, $options: 'i' } },
//          { 'vendorDetails.vehicleNo': { $regex: search, $options: 'i' } }
//        ];
//      }
//
//      // Status filter
//      if (statusFilter) {
//        query['paymentDetails.paymentStatus'] = statusFilter;
//      }
//
//      // Date range filter
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
//      const payments = await AdvancePayment.find(query)
//        .sort({ createdAt: -1 })
//        .lean();
//
//      const tableData = payments.map(payment => ({
//        _id: payment._id,
//        date: payment.createdAt ? new Date(payment.createdAt).toLocaleDateString('en-GB').replace(/\//g, '.') : '',
//        paymentNo: payment.paymentNo || 'N/A',
//        purchaseNo: payment.purchaseNo || 'N/A',
//        pricingSerialNo: payment.pricingSerialNo || 'N/A',
//        vendorName: payment.vendorDetails?.vendorName || 'N/A',
//        vendorCode: payment.vendorDetails?.vendorCode || 'N/A',
//        vehicleNo: payment.vendorDetails?.vehicleNo || 'N/A',
//        amount: payment.vendorDetails?.amount || 0,
//        advance: payment.vendorDetails?.advance || 0,
//        balance: payment.balance || 0,
//        finalAmount: payment.paymentDetails?.finalAmount || 0,
//        status: payment.paymentDetails?.paymentStatus || 'Draft',
//        queueGenerated: payment.queueGenerated || false
//      }));
//
//      return NextResponse.json({
//        success: true,
//        data: tableData,
//        count: tableData.length
//      }, { status: 200 });
//    }
//
//    // ============ CASE 5: LIST FOR DROPDOWNS ============
//    const payments = await AdvancePayment.find({ 
//      companyId: user.companyId 
//    })
//    .select('paymentNo purchaseNo vendorDetails.vendorName vendorDetails.amount paymentDetails.paymentStatus')
//    .sort({ createdAt: -1 })
//    .lean();
//
//    return NextResponse.json({
//      success: true,
//      data: payments
//    }, { status: 200 });
//
//  } catch (error) {
//    console.error("❌ GET /advance-payment error:", error);
//    return NextResponse.json({ 
//      success: false, 
//      message: error.message || "Failed to fetch advance payments"
//    }, { status: 500 });
//  }
//}
//
///* ========================================
//   POST /api/advance-payment - Create New
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
//    console.log("📝 Creating new advance payment");
//
//    // Generate payment number
//    let paymentNo = await getNextAdvancePaymentNumber(user.companyId);
//
//    // Check if payment for this purchase already exists
//    if (body.purchaseNo) {
//      const existing = await AdvancePayment.findOne({
//        purchaseNo: body.purchaseNo,
//        companyId: user.companyId
//      });
//      
//      if (existing) {
//        return NextResponse.json({ 
//          success: false, 
//          message: `Advance payment already exists for Purchase No: ${body.purchaseNo}` 
//        }, { status: 400 });
//      }
//    }
//
//    // Process order rows
//    const processedOrderRows = (body.orderRows || []).map(row => ({
//      _id: new mongoose.Types.ObjectId(),
//      orderNo: row.orderNo || '',
//      partyName: row.partyName || '',
//      plantCode: row.plantCode || '',
//      plantName: row.plantName || '',
//      orderType: row.orderType || 'Sales',
//      pinCode: row.pinCode || '',
//      state: row.state || '',
//      district: row.district || '',
//      from: row.from || '',
//      to: row.to || '',
//      locationRate: row.locationRate || '',
//      priceList: row.priceList || '',
//      weight: num(row.weight),
//      rate: num(row.rate),
//      totalAmount: num(row.totalAmount) || (num(row.weight) * num(row.rate))
//    }));
//
//    // Process addition items
//    const processedAdditionItems = (body.additions?.items || []).map(item => ({
//      _id: new mongoose.Types.ObjectId(),
//      description: item.description || 'Addition',
//      amount: num(item.amount)
//    }));
//
//    // Process deduction items
//    const processedDeductionItems = (body.deductions?.items || []).map(item => ({
//      _id: new mongoose.Types.ObjectId(),
//      description: item.description || 'Deduction',
//      amount: num(item.amount)
//    }));
//
//    // Calculate totals
//    const totalOrderAmount = processedOrderRows.reduce((sum, row) => sum + (row.totalAmount || 0), 0);
//    const totalAdditions = processedAdditionItems.reduce((sum, item) => sum + (item.amount || 0), 0);
//    const totalDeductions = processedDeductionItems.reduce((sum, item) => sum + (item.amount || 0), 0);
//    
//    const amount = num(body.vendorDetails?.amount) || totalOrderAmount;
//    const advance = num(body.vendorDetails?.advance);
//    const balance = amount - advance - totalDeductions + totalAdditions;
//
//    // Handle branch ID
//    let branchId = null;
//    if (body.header?.branch) {
//      if (mongoose.Types.ObjectId.isValid(body.header.branch)) {
//        branchId = new mongoose.Types.ObjectId(body.header.branch);
//      }
//    }
//
//    // Create advance payment
//    const advancePayment = new AdvancePayment({
//      paymentNo,
//      purchaseNo: body.purchaseNo || body.header?.purchaseNo || '',
//      purchaseId: body.purchaseDataId || null,
//      pricingSerialNo: body.pricingSerialNo || body.header?.pricingSerialNo || '',
//      
//      header: {
//        purchaseNo: body.header?.purchaseNo || '',
//        pricingSerialNo: body.header?.pricingSerialNo || '',
//        branch: branchId,
//        branchName: body.header?.branchName || '',
//        branchCode: body.header?.branchCode || '',
//        date: body.header?.date ? new Date(body.header.date) : new Date(),
//        delivery: body.header?.delivery || 'Normal'
//      },
//      
//      billing: {
//        billingType: body.billing?.billingType || 'Multi - Order',
//        noOfLoadingPoints: body.billing?.noOfLoadingPoints || '1',
//        noOfDroppingPoint: body.billing?.noOfDroppingPoint || '1',
//        collectionCharges: body.billing?.collectionCharges || '0',
//        cancellationCharges: body.billing?.cancellationCharges || 'Nil',
//        loadingCharges: body.billing?.loadingCharges || 'Nil',
//        otherCharges: body.billing?.otherCharges || '0'
//      },
//      
//      orderRows: processedOrderRows,
//      
//      vendorDetails: {
//        vendorStatus: body.vendorDetails?.vendorStatus || 'Active',
//        vendorCode: body.vendorDetails?.vendorCode || '',
//        vendorName: body.vendorDetails?.vendorName || '',
//        vehicleNo: body.vendorDetails?.vehicleNo || '',
//        purchaseType: body.vendorDetails?.purchaseType || 'Loading & Unloading',
//        rate: num(body.vendorDetails?.rate),
//        weight: num(body.vendorDetails?.weight),
//        amount: amount,
//        rateType: body.vendorDetails?.rateType || 'Per MT',
//        paymentTerms: body.vendorDetails?.paymentTerms || '80 % Advance',
//        advance: advance,
//        accountNo: body.vendorDetails?.accountNo || '',
//        bankName: body.vendorDetails?.bankName || '',
//        ifsc: body.vendorDetails?.ifsc || '',
//        transactionId: body.vendorDetails?.transactionId || ''
//      },
//      
//      additions: {
//        totalAddition: totalAdditions,
//        items: processedAdditionItems
//      },
//      
//      deductions: {
//        totalDeduction: totalDeductions,
//        items: processedDeductionItems
//      },
//      
//      paymentDetails: {
//        vendorNameDebit: body.paymentDetails?.vendorNameDebit || body.vendorDetails?.vendorName || '',
//        accountNoCredit: body.paymentDetails?.accountNoCredit || body.vendorDetails?.accountNo || '',
//        finalAmount: num(body.paymentDetails?.finalAmount) || advance,
//        remarks: body.paymentDetails?.remarks || 'ADV Payment',
//        transactionId: body.paymentDetails?.transactionId || '',
//        bankVendorCode: body.paymentDetails?.bankVendorCode || body.vendorDetails?.vendorCode || '',
//        paymentDate: body.paymentDetails?.paymentDate ? new Date(body.paymentDetails.paymentDate) : new Date(),
//        paymentStatus: body.paymentDetails?.paymentStatus || 'Pending'
//      },
//      
//      balance,
//      totalOrderAmount,
//      
//      status: 'Draft',
//      queueGenerated: false,
//      
//      companyId: user.companyId,
//      createdBy: user.id
//    });
//
//    await advancePayment.save();
//
//    return NextResponse.json({ 
//      success: true, 
//      message: "Advance payment created successfully",
//      data: {
//        _id: advancePayment._id,
//        paymentNo: advancePayment.paymentNo,
//        purchaseNo: advancePayment.purchaseNo
//      }
//    }, { status: 201 });
//
//  } catch (error) {
//    console.error("❌ POST /advance-payment error:", error);
//
//    if (error.code === 11000) {
//      return NextResponse.json({ 
//        success: false, 
//        message: "Payment number already exists" 
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
//      message: error.message || "Failed to create advance payment"
//    }, { status: 500 });
//  }
//}
//
///* ========================================
//   PUT /api/advance-payment - Update
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
//        message: "Advance payment ID is required" 
//      }, { status: 400 });
//    }
//
//    if (!mongoose.Types.ObjectId.isValid(id)) {
//      return NextResponse.json({ 
//        success: false, 
//        message: "Invalid advance payment ID format" 
//      }, { status: 400 });
//    }
//
//    const payment = await AdvancePayment.findOne({
//      _id: id,
//      companyId: user.companyId
//    });
//
//    if (!payment) {
//      return NextResponse.json({ 
//        success: false, 
//        message: "Advance payment not found" 
//      }, { status: 404 });
//    }
//
//    // Check if payment is already completed/paid
//    if (payment.paymentDetails?.paymentStatus === 'Paid' || payment.paymentDetails?.paymentStatus === 'Completed') {
//      return NextResponse.json({ 
//        success: false, 
//        message: `Cannot update ${payment.paymentDetails.paymentStatus} payment` 
//      }, { status: 400 });
//    }
//
//    // Update header
//    if (body.header) {
//      payment.header = {
//        ...payment.header,
//        ...body.header,
//        branch: body.header.branch ? new mongoose.Types.ObjectId(body.header.branch) : payment.header.branch,
//        date: body.header.date ? new Date(body.header.date) : payment.header.date
//      };
//    }
//
//    // Update billing
//    if (body.billing) {
//      payment.billing = {
//        ...payment.billing,
//        ...body.billing
//      };
//    }
//
//    // Update order rows
//    if (body.orderRows) {
//      payment.orderRows = body.orderRows.map(row => ({
//        _id: row._id && mongoose.Types.ObjectId.isValid(row._id) 
//          ? new mongoose.Types.ObjectId(row._id) 
//          : new mongoose.Types.ObjectId(),
//        orderNo: row.orderNo || '',
//        partyName: row.partyName || '',
//        plantCode: row.plantCode || '',
//        plantName: row.plantName || '',
//        orderType: row.orderType || 'Sales',
//        pinCode: row.pinCode || '',
//        state: row.state || '',
//        district: row.district || '',
//        from: row.from || '',
//        to: row.to || '',
//        locationRate: row.locationRate || '',
//        priceList: row.priceList || '',
//        weight: num(row.weight),
//        rate: num(row.rate),
//        totalAmount: num(row.totalAmount) || (num(row.weight) * num(row.rate))
//      }));
//    }
//
//    // Update vendor details
//    if (body.vendorDetails) {
//      payment.vendorDetails = {
//        ...payment.vendorDetails,
//        ...body.vendorDetails,
//        rate: num(body.vendorDetails.rate),
//        weight: num(body.vendorDetails.weight),
//        amount: num(body.vendorDetails.amount),
//        advance: num(body.vendorDetails.advance)
//      };
//    }
//
//    // Update additions
//    if (body.additions) {
//      payment.additions = {
//        totalAddition: num(body.additions.totalAddition),
//        items: (body.additions.items || []).map(item => ({
//          _id: item._id && mongoose.Types.ObjectId.isValid(item._id) 
//            ? new mongoose.Types.ObjectId(item._id) 
//            : new mongoose.Types.ObjectId(),
//          description: item.description || 'Addition',
//          amount: num(item.amount)
//        }))
//      };
//    }
//
//    // Update deductions
//    if (body.deductions) {
//      payment.deductions = {
//        totalDeduction: num(body.deductions.totalDeduction),
//        items: (body.deductions.items || []).map(item => ({
//          _id: item._id && mongoose.Types.ObjectId.isValid(item._id) 
//            ? new mongoose.Types.ObjectId(item._id) 
//            : new mongoose.Types.ObjectId(),
//          description: item.description || 'Deduction',
//          amount: num(item.amount)
//        }))
//      };
//    }
//
//    // Update payment details
//    if (body.paymentDetails) {
//      payment.paymentDetails = {
//        ...payment.paymentDetails,
//        ...body.paymentDetails,
//        finalAmount: num(body.paymentDetails.finalAmount),
//        paymentDate: body.paymentDetails.paymentDate ? new Date(body.paymentDetails.paymentDate) : payment.paymentDetails.paymentDate
//      };
//    }
//
//    // Update queue generation
//    if (body.queueGenerated !== undefined) {
//      payment.queueGenerated = body.queueGenerated;
//      if (body.queueGenerated) {
//        payment.queueDate = new Date();
//      }
//    }
//
//    // Update status
//    if (body.status) {
//      payment.status = body.status;
//    }
//
//    // The pre-save hook will recalculate balance
//    await payment.save();
//
//    return NextResponse.json({ 
//      success: true, 
//      message: "Advance payment updated successfully",
//      data: {
//        _id: payment._id,
//        paymentNo: payment.paymentNo,
//        purchaseNo: payment.purchaseNo
//      }
//    }, { status: 200 });
//
//  } catch (error) {
//    console.error("❌ PUT /advance-payment error:", error);
//    return NextResponse.json({ 
//      success: false, 
//      message: error.message || "Failed to update advance payment"
//    }, { status: 500 });
//  }
//}
//
///* ========================================
//   DELETE /api/advance-payment - Delete
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
//    // Find the payment first
//    const payment = await AdvancePayment.findOne({
//      _id: id,
//      companyId: user.companyId
//    });
//
//    if (!payment) {
//      return NextResponse.json({ 
//        success: false, 
//        message: "Advance payment not found" 
//      }, { status: 404 });
//    }
//
//    // Don't allow deletion of paid/completed payments
//    if (payment.paymentDetails?.paymentStatus === 'Paid' || payment.paymentDetails?.paymentStatus === 'Completed') {
//      return NextResponse.json({ 
//        success: false, 
//        message: `Cannot delete ${payment.paymentDetails.paymentStatus} payment` 
//      }, { status: 400 });
//    }
//
//    // Delete the payment
//    await AdvancePayment.deleteOne({
//      _id: id,
//      companyId: user.companyId
//    });
//
//    return NextResponse.json({ 
//      success: true, 
//      message: "Advance payment deleted successfully",
//      data: {
//        paymentNo: payment.paymentNo
//      }
//    }, { status: 200 });
//
//  } catch (error) {
//    console.error("❌ DELETE /advance-payment error:", error);
//    return NextResponse.json({ 
//      success: false, 
//      message: error.message || "Failed to delete advance payment"
//    }, { status: 500 });
//  }
//}
//
///* ========================================
//   PATCH /api/advance-payment - Generate Queue
//======================================== */
//export async function PATCH(req) {
//  try {
//    await connectDb();
//    const { user, error, status } = await validateUser(req);
//    if (error) {
//      return NextResponse.json({ success: false, message: error }, { status });
//    }
//
//    const url = new URL(req.url);
//    const id = url.searchParams.get("id");
//    const action = url.searchParams.get("action");
//    
//    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
//      return NextResponse.json({ 
//        success: false, 
//        message: "Valid ID is required" 
//      }, { status: 400 });
//    }
//
//    const payment = await AdvancePayment.findOne({
//      _id: id,
//      companyId: user.companyId
//    });
//
//    if (!payment) {
//      return NextResponse.json({ 
//        success: false, 
//        message: "Advance payment not found" 
//      }, { status: 404 });
//    }
//
//    if (action === 'generate-queue') {
//      payment.queueGenerated = true;
//      payment.queueDate = new Date();
//      payment.paymentDetails.paymentStatus = 'Paid';
//      await payment.save();
//
//      return NextResponse.json({ 
//        success: true, 
//        message: "Payment queue generated successfully",
//        data: {
//          _id: payment._id,
//          paymentNo: payment.paymentNo,
//          queueGenerated: true,
//          queueDate: payment.queueDate
//        }
//      }, { status: 200 });
//    }
//
//    return NextResponse.json({ 
//      success: false, 
//      message: "Invalid action" 
//    }, { status: 400 });
//
//  } catch (error) {
//    console.error("❌ PATCH /advance-payment error:", error);
//    return NextResponse.json({ 
//      success: false, 
//      message: error.message || "Failed to process request"
//    }, { status: 500 });
//  }
//}
// route.js
import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import AdvancePayment from "./AdvancePayment";
import { getTokenFromHeader, verifyJWT } from "@/lib/auth";
import { getNextAdvancePaymentNumber } from "./AdvancePaymentCounter";
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
    user?.permissions?.includes("advance_payment")
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

/* ========================================
   GET /api/advance-payment
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
    const paymentNo = url.searchParams.get("paymentNo");
    const purchaseNo = url.searchParams.get("purchaseNo");
    const format = url.searchParams.get("format");
    const search = url.searchParams.get("search");
    const fromDate = url.searchParams.get("fromDate");
    const toDate = url.searchParams.get("toDate");
    const statusFilter = url.searchParams.get("status");

    // CASE 1: GET SINGLE BY ID
    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ 
          success: false, 
          message: "Invalid advance payment ID format" 
        }, { status: 400 });
      }

      const payment = await AdvancePayment.findOne({
        _id: id,
        companyId: user.companyId
      }).lean();

      if (!payment) {
        return NextResponse.json({ 
          success: false, 
          message: "Advance payment not found" 
        }, { status: 404 });
      }

      return NextResponse.json({ 
        success: true, 
        data: payment 
      }, { status: 200 });
    }

    // CASE 2: GET BY PAYMENT NUMBER
    if (paymentNo) {
      const payment = await AdvancePayment.findOne({
        paymentNo: paymentNo,
        companyId: user.companyId
      }).lean();

      if (!payment) {
        return NextResponse.json({ 
          success: false, 
          message: "Advance payment not found" 
        }, { status: 404 });
      }

      return NextResponse.json({ 
        success: true, 
        data: payment 
      }, { status: 200 });
    }

    // CASE 3: GET BY PURCHASE NUMBER
if (purchaseNo) {
  console.log(`🔍 Searching for Advance Payment with purchaseNo: "${purchaseNo}"`);
  console.log(`Company ID: ${user.companyId}`);
  
  const payment = await AdvancePayment.findOne({
    purchaseNo: purchaseNo,
    companyId: user.companyId
  }).lean();
  
  console.log("✅ Found payment:", payment ? payment.paymentNo : "NOT FOUND");
  console.log("Payment data:", payment);

  return NextResponse.json({ 
    success: true, 
    data: payment || null,
    exists: !!payment
  }, { status: 200 });
}

    // CASE 4: TABLE FORMAT FOR LIST VIEW
    if (format === 'table') {
      let query = { companyId: user.companyId };

      if (search) {
        query.$or = [
          { paymentNo: { $regex: search, $options: 'i' } },
          { purchaseNo: { $regex: search, $options: 'i' } },
          { pricingSerialNo: { $regex: search, $options: 'i' } },
          { 'vendorDetails.vendorName': { $regex: search, $options: 'i' } },
          { 'vendorDetails.vendorCode': { $regex: search, $options: 'i' } },
          { 'vendorDetails.vehicleNo': { $regex: search, $options: 'i' } }
        ];
      }

      if (statusFilter) {
        query['paymentDetails.paymentStatus'] = statusFilter;
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

      const payments = await AdvancePayment.find(query)
        .sort({ createdAt: -1 })
        .lean();

      const tableData = payments.map(payment => ({
        _id: payment._id,
        date: payment.createdAt ? new Date(payment.createdAt).toLocaleDateString('en-GB') : '',
        paymentNo: payment.paymentNo || 'N/A',
        purchaseNo: payment.purchaseNo || 'N/A',
        pricingSerialNo: payment.pricingSerialNo || 'N/A',
        vendorName: payment.vendorDetails?.vendorName || 'N/A',
        vendorCode: payment.vendorDetails?.vendorCode || 'N/A',
        vehicleNo: payment.vendorDetails?.vehicleNo || 'N/A',
        purchaseAmount: payment.purchaseAmountFromVNN || 0,
        advance: payment.vendorDetails?.advance || 0,
        balance: payment.balance || 0,
        finalAmount: payment.paymentDetails?.finalAmount || 0,
        status: payment.paymentDetails?.paymentStatus || 'Draft',
        queueGenerated: payment.queueGenerated || false
      }));

      return NextResponse.json({
        success: true,
        data: tableData,
        count: tableData.length
      }, { status: 200 });
    }

    // CASE 5: LIST FOR DROPDOWNS
    const payments = await AdvancePayment.find({ 
      companyId: user.companyId 
    })
    .select('paymentNo purchaseNo vendorDetails.vendorName purchaseAmountFromVNN paymentDetails.paymentStatus')
    .sort({ createdAt: -1 })
    .lean();

    return NextResponse.json({
      success: true,
      data: payments
    }, { status: 200 });

  } catch (error) {
    console.error("❌ GET /advance-payment error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to fetch advance payments"
    }, { status: 500 });
  }
}

/* ========================================
   POST /api/advance-payment - Create New
======================================== */
export async function POST(req) {
  try {
    await connectDb();
    const { user, error, status } = await validateUser(req);
    if (error) {
      return NextResponse.json({ success: false, message: error }, { status });
    }

    const body = await req.json();
    
    console.log("📝 Creating new advance payment");

    // Generate payment number
    let paymentNo = await getNextAdvancePaymentNumber(user.companyId);

    // Check if payment for this purchase already exists
    if (body.purchaseNo) {
      const existing = await AdvancePayment.findOne({
        purchaseNo: body.purchaseNo,
        companyId: user.companyId
      });
      
      if (existing) {
        return NextResponse.json({ 
          success: false, 
          message: `Advance payment already exists for Purchase No: ${body.purchaseNo}` 
        }, { status: 400 });
      }
    }

    // Process order rows with all fields
    const processedOrderRows = (body.orderRows || []).map(row => ({
      _id: new mongoose.Types.ObjectId(),
      orderNo: row.orderNo || '',
      partyName: row.partyName || '',
      plantCode: row.plantCode || '',
      plantName: row.plantName || '',
      orderType: row.orderType || 'Sales',
      pinCode: row.pinCode || '',
      state: row.state || '',
      district: row.district || '',
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

    // Process addition items
    const processedAdditionItems = (body.additions?.items || []).map(item => ({
      _id: new mongoose.Types.ObjectId(),
      description: item.description || 'Addition',
      amount: num(item.amount)
    }));

    // Process deduction items
    const processedDeductionItems = (body.deductions?.items || []).map(item => ({
      _id: new mongoose.Types.ObjectId(),
      description: item.description || 'Deduction',
      amount: num(item.amount)
    }));

    // Calculate totals
    const totalOrderAmount = processedOrderRows.reduce((sum, row) => {
      const totalAmount = row.totalAmount || 0;
      const collectionCharges = num(row.collectionCharges);
      const cancellationCharges = num(row.cancellationCharges);
      const loadingCharges = num(row.loadingCharges);
      const otherCharges = num(row.otherCharges);
      return sum + totalAmount + collectionCharges + cancellationCharges + loadingCharges + otherCharges;
    }, 0);
    
    const purchaseAmountFromVNN = num(body.purchaseAmountFromVNN) || num(body.vendorDetails?.amount) || totalOrderAmount;
    const advance = num(body.vendorDetails?.advance);
    const totalAdditions = processedAdditionItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    const totalDeductions = processedDeductionItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    const balance = purchaseAmountFromVNN - advance + totalAdditions - totalDeductions;

    // Handle branch ID
    let branchId = null;
    if (body.header?.branch) {
      if (mongoose.Types.ObjectId.isValid(body.header.branch)) {
        branchId = new mongoose.Types.ObjectId(body.header.branch);
      }
    }

    // Create advance payment
    const advancePayment = new AdvancePayment({
      paymentNo,
      purchaseNo: body.purchaseNo || body.header?.purchaseNo || '',
      purchaseId: body.purchaseDataId || null,
      pricingSerialNo: body.pricingSerialNo || body.header?.pricingSerialNo || '',
      purchaseAmountFromVNN,
      
      header: {
        purchaseNo: body.header?.purchaseNo || '',
        pricingSerialNo: body.header?.pricingSerialNo || '',
        branch: branchId,
        branchName: body.header?.branchName || '',
        branchCode: body.header?.branchCode || '',
        date: body.header?.date ? new Date(body.header.date) : new Date(),
        delivery: body.header?.delivery || 'Normal'
      },
      
      billing: {
        billingType: body.billing?.billingType || 'Multi - Order',
        noOfLoadingPoints: body.billing?.noOfLoadingPoints || '1',
        noOfDroppingPoint: body.billing?.noOfDroppingPoint || '1',
        collectionCharges: body.billing?.collectionCharges || '0',
        cancellationCharges: body.billing?.cancellationCharges || 'Nil',
        loadingCharges: body.billing?.loadingCharges || 'Nil',
        otherCharges: body.billing?.otherCharges || '0'
      },
      
      orderRows: processedOrderRows,
      
      purchaseTerms: {
        purchaseType: body.purchaseTerms?.purchaseType || 'Loading & Unloading',
        rateType: body.purchaseTerms?.rateType || 'Per MT',
        paymentTerms: body.purchaseTerms?.paymentTerms || '80 % Advance'
      },
      
      vendorDetails: {
        vendorStatus: body.vendorDetails?.vendorStatus || 'Active',
        vendorCode: body.vendorDetails?.vendorCode || '',
        vendorName: body.vendorDetails?.vendorName || '',
        vehicleNo: body.vendorDetails?.vehicleNo || '',
        rate: num(body.vendorDetails?.rate),
        weight: num(body.vendorDetails?.weight),
        amount: purchaseAmountFromVNN,
        advance: advance,
        accountNo: body.vendorDetails?.accountNo || body.vendorDetails?.bankAccountNumber || '',
        bankName: body.vendorDetails?.bankName || '',
        ifsc: body.vendorDetails?.ifsc || body.vendorDetails?.ifscCode || '',
        transactionId: body.vendorDetails?.transactionId || ''
      },
      
      additions: {
        totalAddition: totalAdditions,
        items: processedAdditionItems
      },
      
      deductions: {
        totalDeduction: totalDeductions,
        items: processedDeductionItems
      },
      
      paymentDetails: {
        vendorNameDebit: body.paymentDetails?.vendorNameDebit || body.vendorDetails?.vendorName || '',
        accountNoCredit: body.paymentDetails?.accountNoCredit || body.vendorDetails?.accountNo || '',
        finalAmount: num(body.paymentDetails?.finalAmount) || advance,
        remarks: body.paymentDetails?.remarks || 'ADV Payment',
        transactionId: body.paymentDetails?.transactionId || '',
        bankVendorCode: body.paymentDetails?.bankVendorCode || body.vendorDetails?.vendorCode || '',
        paymentDate: body.paymentDetails?.paymentDate ? new Date(body.paymentDetails.paymentDate) : new Date(),
        paymentStatus: body.paymentDetails?.paymentStatus || 'Pending'
      },
      
      memoFile: body.memoFile || null,
      
      balance,
      totalOrderAmount,
      
      status: 'Draft',
      queueGenerated: false,
      
      companyId: user.companyId,
      createdBy: user.id
    });

    await advancePayment.save();

    return NextResponse.json({ 
      success: true, 
      message: "Advance payment created successfully",
      data: {
        _id: advancePayment._id,
        paymentNo: advancePayment.paymentNo,
        purchaseNo: advancePayment.purchaseNo
      }
    }, { status: 201 });

  } catch (error) {
    console.error("❌ POST /advance-payment error:", error);

    if (error.code === 11000) {
      return NextResponse.json({ 
        success: false, 
        message: "Payment number already exists" 
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
      message: error.message || "Failed to create advance payment"
    }, { status: 500 });
  }
}

/* ========================================
   PUT /api/advance-payment - Update
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
        message: "Advance payment ID is required" 
      }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid advance payment ID format" 
      }, { status: 400 });
    }

    const payment = await AdvancePayment.findOne({
      _id: id,
      companyId: user.companyId
    });

    if (!payment) {
      return NextResponse.json({ 
        success: false, 
        message: "Advance payment not found" 
      }, { status: 404 });
    }

    // Check if payment is already completed/paid
    if (payment.paymentDetails?.paymentStatus === 'Paid' || payment.paymentDetails?.paymentStatus === 'Completed') {
      return NextResponse.json({ 
        success: false, 
        message: `Cannot update ${payment.paymentDetails.paymentStatus} payment` 
      }, { status: 400 });
    }

    // Update purchase amount from VNN
    if (body.purchaseAmountFromVNN !== undefined) {
      payment.purchaseAmountFromVNN = num(body.purchaseAmountFromVNN);
    }

    // Update header
    if (body.header) {
      payment.header = {
        ...payment.header,
        ...body.header,
        branch: body.header.branch ? new mongoose.Types.ObjectId(body.header.branch) : payment.header.branch,
        date: body.header.date ? new Date(body.header.date) : payment.header.date
      };
    }

    // Update billing
    if (body.billing) {
      payment.billing = {
        ...payment.billing,
        ...body.billing
      };
    }

    // Update order rows
    if (body.orderRows) {
      payment.orderRows = body.orderRows.map(row => ({
        _id: row._id && mongoose.Types.ObjectId.isValid(row._id) 
          ? new mongoose.Types.ObjectId(row._id) 
          : new mongoose.Types.ObjectId(),
        orderNo: row.orderNo || '',
        partyName: row.partyName || '',
        plantCode: row.plantCode || '',
        plantName: row.plantName || '',
        orderType: row.orderType || 'Sales',
        pinCode: row.pinCode || '',
        state: row.state || '',
        district: row.district || '',
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

    // Update purchase terms
    if (body.purchaseTerms) {
      payment.purchaseTerms = {
        ...payment.purchaseTerms,
        ...body.purchaseTerms
      };
    }

    // Update vendor details
    if (body.vendorDetails) {
      payment.vendorDetails = {
        ...payment.vendorDetails,
        ...body.vendorDetails,
        rate: num(body.vendorDetails.rate),
        weight: num(body.vendorDetails.weight),
        amount: num(body.vendorDetails.amount) || payment.purchaseAmountFromVNN,
        advance: num(body.vendorDetails.advance)
      };
    }

    // Update additions
    if (body.additions) {
      payment.additions = {
        totalAddition: num(body.additions.totalAddition),
        items: (body.additions.items || []).map(item => ({
          _id: item._id && mongoose.Types.ObjectId.isValid(item._id) 
            ? new mongoose.Types.ObjectId(item._id) 
            : new mongoose.Types.ObjectId(),
          description: item.description || 'Addition',
          amount: num(item.amount)
        }))
      };
    }

    // Update deductions
    if (body.deductions) {
      payment.deductions = {
        totalDeduction: num(body.deductions.totalDeduction),
        items: (body.deductions.items || []).map(item => ({
          _id: item._id && mongoose.Types.ObjectId.isValid(item._id) 
            ? new mongoose.Types.ObjectId(item._id) 
            : new mongoose.Types.ObjectId(),
          description: item.description || 'Deduction',
          amount: num(item.amount)
        }))
      };
    }

    // Update payment details
    if (body.paymentDetails) {
      payment.paymentDetails = {
        ...payment.paymentDetails,
        ...body.paymentDetails,
        finalAmount: num(body.paymentDetails.finalAmount),
        paymentDate: body.paymentDetails.paymentDate ? new Date(body.paymentDetails.paymentDate) : payment.paymentDetails.paymentDate
      };
    }

    // Update memo file
    if (body.memoFile !== undefined) {
      payment.memoFile = body.memoFile;
    }

    // Update queue generation
    if (body.queueGenerated !== undefined) {
      payment.queueGenerated = body.queueGenerated;
      if (body.queueGenerated) {
        payment.queueDate = new Date();
      }
    }

    // Update status
    if (body.status) {
      payment.status = body.status;
    }

    // The pre-save hook will recalculate balance
    await payment.save();

    return NextResponse.json({ 
      success: true, 
      message: "Advance payment updated successfully",
      data: {
        _id: payment._id,
        paymentNo: payment.paymentNo,
        purchaseNo: payment.purchaseNo
      }
    }, { status: 200 });

  } catch (error) {
    console.error("❌ PUT /advance-payment error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to update advance payment"
    }, { status: 500 });
  }
}

/* ========================================
   DELETE /api/advance-payment - Delete
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

    const payment = await AdvancePayment.findOne({
      _id: id,
      companyId: user.companyId
    });

    if (!payment) {
      return NextResponse.json({ 
        success: false, 
        message: "Advance payment not found" 
      }, { status: 404 });
    }

    // Don't allow deletion of paid/completed payments
    if (payment.paymentDetails?.paymentStatus === 'Paid' || payment.paymentDetails?.paymentStatus === 'Completed') {
      return NextResponse.json({ 
        success: false, 
        message: `Cannot delete ${payment.paymentDetails.paymentStatus} payment` 
      }, { status: 400 });
    }

    await AdvancePayment.deleteOne({
      _id: id,
      companyId: user.companyId
    });

    return NextResponse.json({ 
      success: true, 
      message: "Advance payment deleted successfully",
      data: {
        paymentNo: payment.paymentNo
      }
    }, { status: 200 });

  } catch (error) {
    console.error("❌ DELETE /advance-payment error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to delete advance payment"
    }, { status: 500 });
  }
}

/* ========================================
   PATCH /api/advance-payment - Generate Queue
======================================== */
export async function PATCH(req) {
  try {
    await connectDb();
    const { user, error, status } = await validateUser(req);
    if (error) {
      return NextResponse.json({ success: false, message: error }, { status });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const action = url.searchParams.get("action");
    
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        message: "Valid ID is required" 
      }, { status: 400 });
    }

    const payment = await AdvancePayment.findOne({
      _id: id,
      companyId: user.companyId
    });

    if (!payment) {
      return NextResponse.json({ 
        success: false, 
        message: "Advance payment not found" 
      }, { status: 404 });
    }

    if (action === 'generate-queue') {
      payment.queueGenerated = true;
      payment.queueDate = new Date();
      payment.paymentDetails.paymentStatus = 'Paid';
      await payment.save();

      return NextResponse.json({ 
        success: true, 
        message: "Payment queue generated successfully",
        data: {
          _id: payment._id,
          paymentNo: payment.paymentNo,
          queueGenerated: true,
          queueDate: payment.queueDate
        }
      }, { status: 200 });
    }

    return NextResponse.json({ 
      success: false, 
      message: "Invalid action" 
    }, { status: 400 });

  } catch (error) {
    console.error("❌ PATCH /advance-payment error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to process request"
    }, { status: 500 });
  }
}