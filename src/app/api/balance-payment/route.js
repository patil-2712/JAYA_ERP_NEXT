import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import BalancePayment from "./BalancePayment";
import { getNextBalancePaymentNumber } from "./BalancePaymentCounter";
import { getTokenFromHeader, verifyJWT } from "@/lib/auth";
import mongoose from 'mongoose';

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function isAuthorized(user) {
  return user?.type === "company" || user?.role === "Admin" || user?.permissions?.includes("balance_payment");
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
    return { error: "Invalid token", status: 401 };
  }
}

// GET - Fetch balance payments
export async function GET(req) {
  try {
    await connectDb();
    const { user, error, status } = await validateUser(req);
    if (error) return NextResponse.json({ success: false, message: error }, { status });

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const format = url.searchParams.get("format");
    const search = url.searchParams.get("search");
    const fromDate = url.searchParams.get("fromDate");
    const toDate = url.searchParams.get("toDate");
    const paymentStatus = url.searchParams.get("paymentStatus");

    // Get single by ID
    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
      }
      const payment = await BalancePayment.findOne({ _id: id, companyId: user.companyId }).lean();
      if (!payment) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
      return NextResponse.json({ success: true, data: payment });
    }

    // Table format for list view
    if (format === 'table') {
      let query = { companyId: user.companyId };
      
      if (search) {
        query.$or = [
          { balancePaymentNo: { $regex: search, $options: 'i' } },
          { purchaseNo: { $regex: search, $options: 'i' } },
          { vendorName: { $regex: search, $options: 'i' } },
          { vendorNamePayment: { $regex: search, $options: 'i' } },
          { podNo: { $regex: search, $options: 'i' } }
        ];
      }
      
      if (paymentStatus) query.paymentStatus = paymentStatus;
      
      if (fromDate || toDate) {
        query.createdAt = {};
        if (fromDate) query.createdAt.$gte = new Date(fromDate);
        if (toDate) query.createdAt.$lte = new Date(toDate + 'T23:59:59');
      }
      
      const payments = await BalancePayment.find(query).sort({ createdAt: -1 }).lean();
      
      const tableData = payments.map(p => ({
        _id: p._id,
        balancePaymentNo: p.balancePaymentNo,
        branch: p.branch,
        date: p.date,
        purchaseNo: p.purchaseNo,
        vendorName: p.vendorName || p.vendorNamePayment,
        vendorCode: p.vendorCode,
        from: p.from || p.orderRows?.[0]?.from || '',
        to: p.to || p.orderRows?.[0]?.to || '',
        weight: p.weight,
        total: p.amount,
        advance: p.advance,
        poAddition: p.poAddition || 0,
        poDeduction: p.poDeduction || 0,
        podDeduction: p.podDeduction || 0,
        finalBalance: p.finalBalance || p.balance || 0,
        dueDate: p.dueDate || '',
        transactionId: p.transactionId,
        paymentDate: p.paymentDate ? new Date(p.paymentDate).toISOString().split('T')[0] : '',
        paymentStatus: p.paymentStatus,
        podNo: p.podNo
      }));
      
      return NextResponse.json({ success: true, data: tableData, count: tableData.length });
    }

    // List for dropdown
    const payments = await BalancePayment.find({ companyId: user.companyId })
      .select('balancePaymentNo purchaseNo paymentStatus')
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json({ success: true, data: payments });

  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST - Create new balance payment
export async function POST(req) {
  try {
    await connectDb();
    const { user, error, status } = await validateUser(req);
    if (error) return NextResponse.json({ success: false, message: error }, { status });

    const body = await req.json();
    
    console.log("📝 Creating Balance Payment with body:", body);
    
    // Generate payment number
    const balancePaymentNo = await getNextBalancePaymentNumber(user.companyId);
    
    // Calculate values
    const amount = num(body.amount);
    const advance = num(body.advance);
    const totalAddition = num(body.totalAddition);
    const totalDeduction = num(body.totalDeduction);
    const poAddition = num(body.poAddition) || totalAddition;
    const poDeduction = num(body.poDeduction) || totalDeduction;
    const podDeduction = num(body.podDeduction) || 0;
    const balance = amount - advance + totalAddition - totalDeduction;
    const finalBalance = amount - advance - poDeduction - podDeduction + poAddition;
    
    const payment = new BalancePayment({
      balancePaymentNo,
      branch: body.branch || '',
      date: body.date || new Date().toISOString().split('T')[0],
      vendorName: body.vendorName || '',
      podNo: body.podNo || '',
      purchaseNo: body.purchaseNo || '',
      orderRows: (body.orderRows || []).map(row => ({
        _id: row._id,
        orderNo: row.orderNo || '',
        partyName: row.partyName || '',
        plantCode: row.plantCode || '',
        orderType: row.orderType || '',
        pinCode: row.pinCode || '',
        state: row.state || '',
        district: row.district || '',
        from: row.from || '',
        to: row.to || '',
        locationRate: row.locationRate || '',
        priceList: row.priceList || '',
        weight: row.weight || '0',
        rate: row.rate || '0',
        totalAmount: row.totalAmount || '0'
      })),
      vendorStatus: body.vendorStatus || 'Active',
      vendorCode: body.vendorCode || '',
      vendorNamePayment: body.vendorNamePayment || '',
      vehicleNo: body.vehicleNo || '',
      purchaseType: body.purchaseType || 'Safi Vehicle',
      rateType: body.rateType || 'Per MT',
      rate: num(body.rate),
      weight: num(body.weight),
      amount: amount,
      advance: advance,
      totalAddition: totalAddition,
      totalDeduction: totalDeduction,
      balance: balance,
      poAddition: poAddition,
      poDeduction: poDeduction,
      podDeduction: podDeduction,
      finalBalance: finalBalance,
      dueDate: body.dueDate || '',
      vendorNameDebit: body.vendorNameDebit || '',
      accountNoCredit: body.accountNoCredit || '',
      finalAmount: num(body.finalAmount),
      remarks: body.remarks || 'Balance Payment',
      transactionId: body.transactionId || '',
      bankVendorCode: body.bankVendorCode || '',
      paymentStatus: body.paymentStatus || 'Pending',
      paymentDate: body.paymentDate ? new Date(body.paymentDate) : new Date(),
      companyId: user.companyId,
      createdBy: user.id
    });
    
    await payment.save();
    
    console.log("✅ Balance Payment saved:", payment.balancePaymentNo);
    
    return NextResponse.json({ 
      success: true, 
      message: "Balance Payment created successfully",
      data: { _id: payment._id, balancePaymentNo: payment.balancePaymentNo, purchaseNo: payment.purchaseNo }
    }, { status: 201 });
    
  } catch (error) {
    console.error("POST Error:", error);
    if (error.code === 11000) {
      return NextResponse.json({ success: false, message: "Payment number already exists" }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PUT - Update balance payment
export async function PUT(req) {
  try {
    await connectDb();
    const { user, error, status } = await validateUser(req);
    if (error) return NextResponse.json({ success: false, message: error }, { status });

    const body = await req.json();
    const { id } = body;
    
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
    }
    
    const payment = await BalancePayment.findOne({ _id: id, companyId: user.companyId });
    if (!payment) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    
    // Update all fields
    payment.branch = body.branch || payment.branch;
    payment.date = body.date || payment.date;
    payment.vendorName = body.vendorName || payment.vendorName;
    payment.podNo = body.podNo || payment.podNo;
    payment.purchaseNo = body.purchaseNo || payment.purchaseNo;
    
    if (body.orderRows) {
      payment.orderRows = body.orderRows.map(row => ({
        _id: row._id,
        orderNo: row.orderNo || '',
        partyName: row.partyName || '',
        plantCode: row.plantCode || '',
        orderType: row.orderType || '',
        pinCode: row.pinCode || '',
        state: row.state || '',
        district: row.district || '',
        from: row.from || '',
        to: row.to || '',
        locationRate: row.locationRate || '',
        priceList: row.priceList || '',
        weight: row.weight || '0',
        rate: row.rate || '0',
        totalAmount: row.totalAmount || '0'
      }));
    }
    
    payment.vendorStatus = body.vendorStatus || payment.vendorStatus;
    payment.vendorCode = body.vendorCode || payment.vendorCode;
    payment.vendorNamePayment = body.vendorNamePayment || payment.vendorNamePayment;
    payment.vehicleNo = body.vehicleNo || payment.vehicleNo;
    payment.purchaseType = body.purchaseType || payment.purchaseType;
    payment.rateType = body.rateType || payment.rateType;
    payment.rate = num(body.rate);
    payment.weight = num(body.weight);
    payment.amount = num(body.amount);
    payment.advance = num(body.advance);
    payment.totalAddition = num(body.totalAddition);
    payment.totalDeduction = num(body.totalDeduction);
    payment.poAddition = num(body.poAddition) || payment.poAddition;
    payment.poDeduction = num(body.poDeduction) || payment.poDeduction;
    payment.podDeduction = num(body.podDeduction) || payment.podDeduction;
    payment.finalBalance = num(body.finalBalance) || payment.finalBalance;
    payment.dueDate = body.dueDate || payment.dueDate;
    payment.balance = payment.amount - payment.advance + payment.totalAddition - payment.totalDeduction;
    payment.vendorNameDebit = body.vendorNameDebit || payment.vendorNameDebit;
    payment.accountNoCredit = body.accountNoCredit || payment.accountNoCredit;
    payment.finalAmount = num(body.finalAmount);
    payment.remarks = body.remarks || payment.remarks;
    payment.transactionId = body.transactionId || payment.transactionId;
    payment.bankVendorCode = body.bankVendorCode || payment.bankVendorCode;
    payment.paymentStatus = body.paymentStatus || payment.paymentStatus;
    
    if (body.paymentDate) payment.paymentDate = new Date(body.paymentDate);
    
    await payment.save();
    
    return NextResponse.json({ 
      success: true, 
      message: "Balance Payment updated successfully",
      data: { _id: payment._id, balancePaymentNo: payment.balancePaymentNo }
    });
    
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE - Delete balance payment
export async function DELETE(req) {
  try {
    await connectDb();
    const { user, error, status } = await validateUser(req);
    if (error) return NextResponse.json({ success: false, message: error }, { status });

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
    }
    
    const payment = await BalancePayment.findOne({ _id: id, companyId: user.companyId });
    if (!payment) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    
    await BalancePayment.deleteOne({ _id: id, companyId: user.companyId });
    
    return NextResponse.json({ success: true, message: "Balance Payment deleted successfully" });
    
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}