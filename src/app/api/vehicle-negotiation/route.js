import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import VehicleNegotiation from "./VehicleNegotiation";
import { getTokenFromHeader, verifyJWT } from "@/lib/auth";
import { getNextVehicleNegotiationNumber } from "./VehicleNegotiationCounter";
import mongoose from 'mongoose';

// Helper function to format date as DD/MM/YYYY
function formatDateDDMMYYYY(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
}

// Helper function to validate ObjectId
function isValidObjectId(id) {
  return id && mongoose.Types.ObjectId.isValid(id);
}

// Role-based access check
function isAuthorized(user) {
  return (
    user?.type === "company" ||
    user?.role === "Admin" ||
    user?.permissions?.includes("vehicle_negotiation")
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
   GET /api/vehicle-negotiation - Get All Vehicle Negotiations
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
    const vnnNo = url.searchParams.get("vnnNo");
    const format = url.searchParams.get("format");
    
    // CASE 1: GET BY VNN NUMBER
    if (vnnNo) {
      console.log(`📄 GET vehicle negotiation by VNN: ${vnnNo}`);
      
      const vehicleNegotiation = await VehicleNegotiation.findOne({
        vnnNo: vnnNo,
        companyId: user.companyId
      }).lean();

      if (!vehicleNegotiation) {
        return NextResponse.json({ 
          success: false, 
          message: "Vehicle negotiation not found" 
        }, { status: 404 });
      }

      return NextResponse.json({ 
        success: true, 
        data: vehicleNegotiation 
      }, { status: 200 });
    }
    
    // CASE 2: GET BY ID
    if (id) {
      console.log(`📄 GET single vehicle negotiation: ${id}`);
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ 
          success: false, 
          message: "Invalid vehicle negotiation ID format" 
        }, { status: 400 });
      }
      
      const vehicleNegotiation = await VehicleNegotiation.findOne({
        _id: id,
        companyId: user.companyId
      }).lean();

      if (!vehicleNegotiation) {
        return NextResponse.json({ 
          success: false, 
          message: "Vehicle negotiation not found" 
        }, { status: 404 });
      }

      return NextResponse.json({ 
        success: true, 
        data: vehicleNegotiation 
      }, { status: 200 });
    }
    
    // CASE 3: TABLE FORMAT
    if (format === 'table') {
      console.log("📋 Fetching table format data");
      
      const vehicleNegotiations = await VehicleNegotiation.find({
        companyId: user.companyId
      })
        .sort({ date: -1, createdAt: -1 })
        .lean();

      const tableData = [];
      
      vehicleNegotiations.forEach(vn => {
        const formattedDate = vn.date ? formatDateDDMMYYYY(vn.date) : '';
        
        if (vn.orders && vn.orders.length > 0) {
          vn.orders.forEach(order => {
            tableData.push({
              date: formattedDate,
              vnn: vn.vnnNo || '',
              order: order.orderNo || '',
              partyName: order.partyName || vn.customerName || '',
              vendorName: vn.approval?.vendorName || '',
              vendorCode: vn.approval?.vendorCode || '',
              plantCode: order.plantName || order.plantCodeValue || '',
              orderType: order.orderType || '',
              pinCode: order.pinCode || '',
              from: order.fromName || '',
              to: order.toName || '',
              taluka: order.talukaName || order.taluka || '',
              district: order.districtName || '',
              state: order.stateName || '',
              country: order.countryName || '',
              weight: order.weight || 0,
              orderStatus: order.status || '',
              approval: vn.approval?.approvalStatus || 'Pending',
              memo: vn.approval?.memoStatus || 'Pending',
              vnId: vn._id.toString(),
              orderId: order._id ? order._id.toString() : null,
              branchName: vn.branchName || ''
            });
          });
        } else {
          tableData.push({
            date: formattedDate,
            vnn: vn.vnnNo || '',
            order: '',
            partyName: vn.customerName || '',
            vendorCode: vn.approval?.vendorCode || '',
            vendorName: vn.approval?.vendorName || '',
            plantCode: '',
            orderType: '',
            pinCode: '',
            from: '',
            to: '',
            taluka: '',
            district: '',
            state: '',
            country: '',
            weight: 0,
            orderStatus: '',
            approval: vn.approval?.approvalStatus || 'Pending',
            memo: vn.approval?.memoStatus || 'Pending',
            vnId: vn._id.toString(),
            orderId: null,
            branchName: vn.branchName || ''
          });
        }
      });

      return NextResponse.json({
        success: true,
        data: tableData,
        total: tableData.length,
        message: `Found ${tableData.length} order records`
      }, { status: 200 });
    }

    // CASE 4: REGULAR LIST
    const vehicleNegotiations = await VehicleNegotiation.find({
      companyId: user.companyId
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: vehicleNegotiations,
      total: vehicleNegotiations.length
    }, { status: 200 });

  } catch (error) {
    console.error("❌ GET /vehicle-negotiation error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to fetch vehicle negotiations",
      error: error.message 
    }, { status: 500 });
  }
}

/* ========================================
   POST /api/vehicle-negotiation - Create New
======================================== */
export async function POST(req) {
  try {
    await connectDb();
    const { user, error, status } = await validateUser(req);
    if (error) {
      return NextResponse.json({ success: false, message: error }, { status });
    }

    const body = await req.json();
    
    console.log("📝 Creating new vehicle negotiation");
    
    // Generate vehicle negotiation number
    let vnnNo = await getNextVehicleNegotiationNumber(user.companyId);
    
    // Check if VNN number already exists
    const existing = await VehicleNegotiation.findOne({ vnnNo, companyId: user.companyId });
    if (existing) {
      vnnNo = await getNextVehicleNegotiationNumber(user.companyId);
    }

    // Process orders with proper null handling for ObjectId fields
    const processedOrders = (body.orders || []).map(order => ({
      orderNo: order.orderNo || '',
      orderPanelId: order.orderPanelId || '',
      partyName: order.partyName || '',
      customerId: order.customerId && isValidObjectId(order.customerId) ? order.customerId : null,
      customerCode: order.customerCode || '',
      contactPerson: order.contactPerson || '',
      plantCode: order.plantCode && isValidObjectId(order.plantCode) ? order.plantCode : null,
      plantName: order.plantName || '',
      plantCodeValue: order.plantCodeValue || '',
      orderType: order.orderType || 'Sales',
      pinCode: order.pinCode || '',
      from: order.from && isValidObjectId(order.from) ? order.from : null,
      fromName: order.fromName || '',
      to: order.to && isValidObjectId(order.to) ? order.to : null,
      toName: order.toName || '',
      taluka: order.taluka || '',
      talukaName: order.talukaName || '',
      country: order.country || '',
      countryName: order.countryName || '',
      state: order.state || '',
      stateName: order.stateName || '',
      district: order.district || '',
      districtName: order.districtName || '',
      weight: Number(order.weight) || 0,
      status: order.status || 'Open',
      collectionCharges: Number(order.collectionCharges) || 0,
      cancellationCharges: order.cancellationCharges || 'Nil',
      loadingCharges: order.loadingCharges || 'Nil',
      otherCharges: Number(order.otherCharges) || 0
    }));

    // Calculate total weight
    const totalWeight = processedOrders.reduce((sum, order) => sum + (order.weight || 0), 0);

    // Validate delivery value
    const validDeliveryValues = ['Urgent', 'Normal', 'Express', 'Scheduled'];
    let delivery = body.header?.delivery || 'Normal';
    if (!validDeliveryValues.includes(delivery)) {
      delivery = 'Normal';
    }

    // Process selected order panels
    const selectedOrderPanels = (body.selectedOrderPanels || []).map(panel => ({
      _id: panel._id || '',
      orderPanelNo: panel.orderPanelNo || ''
    }));

    // Process vendors with purchase type
    const processedVendors = (body.vendors || []).map(v => ({
      vendorName: v.vendorName || '',
      vendorCode: v.vendorCode || '',
      purchaseType: v.purchaseType || '',
      marketRate: Number(v.marketRate) || 0
    }));

    // Create new vehicle negotiation
    const newVehicleNegotiation = new VehicleNegotiation({
      vnnNo,
      branch: body.header?.branch && isValidObjectId(body.header?.branch) ? body.header?.branch : null,
      branchName: body.header?.branchName || '',
      branchCode: body.header?.branchCode || '',
      delivery: delivery,
      date: body.header?.date ? new Date(body.header.date) : new Date(),
      customerId: body.header?.customerId && isValidObjectId(body.header?.customerId) ? body.header?.customerId : null,
      customerName: body.header?.customerName || '',
      customerCode: body.header?.customerCode || '',
      contactPerson: body.header?.contactPerson || '',
      billingType: body.header?.billingType || 'Multi - Order',
      loadingPoints: Number(body.header?.loadingPoints) || 1,
      dropPoints: Number(body.header?.dropPoints) || 1,
      collectionCharges: Number(body.header?.collectionCharges) || 0,
      cancellationCharges: body.header?.cancellationCharges || 'Nil',
      loadingCharges: body.header?.loadingCharges || 'Nil',
      otherCharges: body.header?.otherCharges || 'Nil',
      selectedOrderPanels: selectedOrderPanels,
      orders: processedOrders,
      totalWeight,
      negotiation: {
        maxRate: Number(body.negotiation?.maxRate) || 0,
        targetRate: Number(body.negotiation?.targetRate) || 0,
        purchaseType: body.negotiation?.purchaseType || 'Loading & Unloading',
        oldRatePercent: body.negotiation?.oldRatePercent || '',
        remarks1: body.negotiation?.remarks1 || '',
        remarks2: body.negotiation?.remarks2 || ''
      },
      vendors: processedVendors,
      voiceNote: body.voiceUrl || '',
      voiceNoteFile: body.voiceFileInfo || null,
      
      // Complete APPROVAL SECTION with ALL fields from frontend
      approval: {
        vendorName: body.approval?.vendorName || '',
        vendorCode: body.approval?.vendorCode || '',
        vendorId: body.approval?.vendorId || null,
        vendorStatus: body.approval?.vendorStatus || 'Active',
        rateType: body.approval?.rateType || 'Per MT',
        finalPerMT: Number(body.approval?.finalPerMT) || 0,
        finalFix: Number(body.approval?.finalFix) || 0,
        vehicleNo: body.approval?.vehicleNo || '',
        vehicleId: body.approval?.vehicleId || '',
        vehicleData: body.approval?.vehicleData || null,
        mobile: body.approval?.mobile || '',
        purchaseType: body.approval?.purchaseType || 'Loading & Unloading',
        paymentTerms: body.approval?.paymentTerms || '80 % Advance',
        approvalStatus: body.approval?.approvalStatus || 'Pending',
        remarks: body.approval?.remarks || '',
        memoStatus: body.approval?.memoStatus || 'Pending',
        memoFile: body.approval?.memoFile || null
      },
      companyId: user.companyId,
      createdBy: user.id,
      panelStatus: 'Draft'
    });

    await newVehicleNegotiation.save();

    return NextResponse.json({ 
      success: true, 
      message: "Vehicle negotiation created successfully",
      data: {
        _id: newVehicleNegotiation._id,
        vnnNo: newVehicleNegotiation.vnnNo
      }
    }, { status: 201 });

  } catch (error) {
    console.error("❌ POST /vehicle-negotiation error:", error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return NextResponse.json({ 
        success: false, 
        message: messages.join(', ') 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to create vehicle negotiation"
    }, { status: 500 });
  }
}

/* ========================================
   PUT /api/vehicle-negotiation - Update
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
        message: "Vehicle negotiation ID is required" 
      }, { status: 400 });
    }

    console.log(`📝 Updating vehicle negotiation: ${id}`);
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid vehicle negotiation ID format" 
      }, { status: 400 });
    }
    
    // Find the vehicle negotiation
    const vehicleNegotiation = await VehicleNegotiation.findOne({
      _id: id,
      companyId: user.companyId
    });

    if (!vehicleNegotiation) {
      return NextResponse.json({ 
        success: false, 
        message: "Vehicle negotiation not found" 
      }, { status: 404 });
    }

    // Update header fields
    if (body.header) {
      vehicleNegotiation.branch = body.header.branch && isValidObjectId(body.header.branch) 
        ? body.header.branch 
        : (vehicleNegotiation.branch || null);
      vehicleNegotiation.branchName = body.header.branchName || vehicleNegotiation.branchName || '';
      vehicleNegotiation.branchCode = body.header.branchCode || vehicleNegotiation.branchCode || '';
      
     // Find this section in your PUT handler:
const validDeliveryValues = ['Urgent', 'Normal', 'Express', 'Scheduled'];  // ✅ UPDATE this line
let delivery = body.header.delivery || vehicleNegotiation.delivery || 'Normal';
if (!validDeliveryValues.includes(delivery)) {
  delivery = 'Normal';
}
      vehicleNegotiation.delivery = delivery;
      
      vehicleNegotiation.date = body.header.date ? new Date(body.header.date) : vehicleNegotiation.date;
      vehicleNegotiation.customerId = body.header.customerId && isValidObjectId(body.header.customerId) 
        ? body.header.customerId 
        : (vehicleNegotiation.customerId || null);
      vehicleNegotiation.customerName = body.header.customerName || vehicleNegotiation.customerName || '';
      vehicleNegotiation.customerCode = body.header.customerCode || vehicleNegotiation.customerCode || '';
      vehicleNegotiation.contactPerson = body.header.contactPerson || vehicleNegotiation.contactPerson || '';
      vehicleNegotiation.billingType = body.header.billingType || vehicleNegotiation.billingType || 'Multi - Order';
      vehicleNegotiation.loadingPoints = Number(body.header.loadingPoints) || vehicleNegotiation.loadingPoints || 1;
      vehicleNegotiation.dropPoints = Number(body.header.dropPoints) || vehicleNegotiation.dropPoints || 1;
      vehicleNegotiation.collectionCharges = Number(body.header.collectionCharges) || vehicleNegotiation.collectionCharges || 0;
      vehicleNegotiation.cancellationCharges = body.header.cancellationCharges || vehicleNegotiation.cancellationCharges || 'Nil';
      vehicleNegotiation.loadingCharges = body.header.loadingCharges || vehicleNegotiation.loadingCharges || 'Nil';
      vehicleNegotiation.otherCharges = body.header.otherCharges || vehicleNegotiation.otherCharges || 'Nil';
    }

    // Update selected order panels
    if (body.selectedOrderPanels) {
      vehicleNegotiation.selectedOrderPanels = body.selectedOrderPanels.map(panel => ({
        _id: panel._id || '',
        orderPanelNo: panel.orderPanelNo || ''
      }));
    }

    // Update orders
    if (body.orders) {
      const processedOrders = body.orders.map(order => ({
        _id: order._id && isValidObjectId(order._id) 
          ? new mongoose.Types.ObjectId(order._id) 
          : new mongoose.Types.ObjectId(),
        orderNo: order.orderNo || '',
        orderPanelId: order.orderPanelId || '',
        partyName: order.partyName || '',
        customerId: order.customerId && isValidObjectId(order.customerId) ? order.customerId : null,
        customerCode: order.customerCode || '',
        contactPerson: order.contactPerson || '',
        plantCode: order.plantCode && isValidObjectId(order.plantCode) ? order.plantCode : null,
        plantName: order.plantName || '',
        plantCodeValue: order.plantCodeValue || '',
        orderType: order.orderType || 'Sales',
        pinCode: order.pinCode || '',
        from: order.from && isValidObjectId(order.from) ? order.from : null,
        fromName: order.fromName || '',
        to: order.to && isValidObjectId(order.to) ? order.to : null,
        toName: order.toName || '',
        taluka: order.taluka || '',
        talukaName: order.talukaName || '',
        country: order.country || '',
        countryName: order.countryName || '',
        state: order.state || '',
        stateName: order.stateName || '',
        district: order.district || '',
        districtName: order.districtName || '',
        weight: Number(order.weight) || 0,
        status: order.status || 'Open',
        collectionCharges: Number(order.collectionCharges) || 0,
        cancellationCharges: order.cancellationCharges || 'Nil',
        loadingCharges: order.loadingCharges || 'Nil',
        otherCharges: Number(order.otherCharges) || 0
      }));
      
      vehicleNegotiation.orders = processedOrders;
      vehicleNegotiation.totalWeight = processedOrders.reduce((sum, order) => sum + (order.weight || 0), 0);
    }

    // Update negotiation
    if (body.negotiation) {
      vehicleNegotiation.negotiation = {
        maxRate: Number(body.negotiation.maxRate) || vehicleNegotiation.negotiation?.maxRate || 0,
        targetRate: Number(body.negotiation.targetRate) || vehicleNegotiation.negotiation?.targetRate || 0,
        purchaseType: body.negotiation.purchaseType || vehicleNegotiation.negotiation?.purchaseType || 'Loading & Unloading',
        oldRatePercent: body.negotiation.oldRatePercent || vehicleNegotiation.negotiation?.oldRatePercent || '',
        remarks1: body.negotiation.remarks1 || vehicleNegotiation.negotiation?.remarks1 || '',
        remarks2: body.negotiation.remarks2 || vehicleNegotiation.negotiation?.remarks2 || ''
      };
    }

    // Update vendors with purchase type
    if (body.vendors) {
      vehicleNegotiation.vendors = body.vendors.map(v => ({
        _id: v._id && isValidObjectId(v._id) 
          ? new mongoose.Types.ObjectId(v._id) 
          : new mongoose.Types.ObjectId(),
        vendorName: v.vendorName || '',
        vendorCode: v.vendorCode || '',
        purchaseType: v.purchaseType || '',
        marketRate: Number(v.marketRate) || 0
      }));
    }

    // Update voice note
    if (body.voiceUrl !== undefined) vehicleNegotiation.voiceNote = body.voiceUrl;
    if (body.voiceFileInfo) vehicleNegotiation.voiceNoteFile = body.voiceFileInfo;

    // Update approval with ALL fields
    if (body.approval) {
      const currentApproval = vehicleNegotiation.approval || {};
      
      const updatedApproval = {
        vendorName: body.approval.vendorName !== undefined ? body.approval.vendorName : (currentApproval.vendorName || ''),
        vendorCode: body.approval.vendorCode !== undefined ? body.approval.vendorCode : (currentApproval.vendorCode || ''),
        vendorId: body.approval.vendorId !== undefined ? body.approval.vendorId : (currentApproval.vendorId || null),
        vendorStatus: body.approval.vendorStatus !== undefined ? body.approval.vendorStatus : (currentApproval.vendorStatus || 'Active'),
        rateType: body.approval.rateType !== undefined ? body.approval.rateType : (currentApproval.rateType || 'Per MT'),
        finalPerMT: body.approval.finalPerMT !== undefined ? Number(body.approval.finalPerMT) : (currentApproval.finalPerMT || 0),
        finalFix: body.approval.finalFix !== undefined ? Number(body.approval.finalFix) : (currentApproval.finalFix || 0),
        vehicleNo: body.approval.vehicleNo !== undefined ? body.approval.vehicleNo : (currentApproval.vehicleNo || ''),
        vehicleId: body.approval.vehicleId !== undefined ? body.approval.vehicleId : (currentApproval.vehicleId || ''),
        vehicleData: body.approval.vehicleData !== undefined ? body.approval.vehicleData : (currentApproval.vehicleData || null),
        mobile: body.approval.mobile !== undefined ? body.approval.mobile : (currentApproval.mobile || ''),
        purchaseType: body.approval.purchaseType !== undefined ? body.approval.purchaseType : (currentApproval.purchaseType || 'Loading & Unloading'),
        paymentTerms: body.approval.paymentTerms !== undefined ? body.approval.paymentTerms : (currentApproval.paymentTerms || '80 % Advance'),
        approvalStatus: body.approval.approvalStatus !== undefined ? body.approval.approvalStatus : (currentApproval.approvalStatus || 'Pending'),
        remarks: body.approval.remarks !== undefined ? body.approval.remarks : (currentApproval.remarks || ''),
        memoStatus: body.approval.memoStatus !== undefined ? body.approval.memoStatus : (currentApproval.memoStatus || 'Pending'),
      };

      // Handle memoFile
      if (body.approval.memoFile !== undefined) {
        if (body.approval.memoFile && typeof body.approval.memoFile === 'object') {
          const hasFileData = body.approval.memoFile.filePath || 
                             body.approval.memoFile.filename || 
                             body.approval.memoFile.originalName;
          
          if (hasFileData) {
            updatedApproval.memoFile = {
              filePath: body.approval.memoFile.filePath || '',
              fullPath: body.approval.memoFile.fullPath || '',
              filename: body.approval.memoFile.filename || '',
              originalName: body.approval.memoFile.originalName || '',
              size: Number(body.approval.memoFile.size) || 0,
              mimeType: body.approval.memoFile.mimeType || '',
              uploadedAt: body.approval.memoFile.uploadedAt || new Date()
            };
          } else {
            updatedApproval.memoFile = null;
          }
        } else if (body.approval.memoFile === null) {
          updatedApproval.memoFile = null;
        } else if (currentApproval.memoFile) {
          updatedApproval.memoFile = currentApproval.memoFile;
        }
      } else if (currentApproval.memoFile) {
        updatedApproval.memoFile = currentApproval.memoFile;
      }

      vehicleNegotiation.approval = updatedApproval;
    }

    // Save the updated vehicle negotiation
    await vehicleNegotiation.save();

    return NextResponse.json({ 
      success: true, 
      message: "Vehicle negotiation updated successfully",
      data: {
        _id: vehicleNegotiation._id,
        vnnNo: vehicleNegotiation.vnnNo
      }
    }, { status: 200 });

  } catch (error) {
    console.error("❌ PUT /vehicle-negotiation error:", error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return NextResponse.json({ 
        success: false, 
        message: messages.join(', ') 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to update vehicle negotiation"
    }, { status: 500 });
  }
}

/* ========================================
   DELETE /api/vehicle-negotiation - Delete
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
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        message: "Vehicle negotiation ID is required" 
      }, { status: 400 });
    }

    console.log(`🗑️ Deleting vehicle negotiation: ${id}`);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid vehicle negotiation ID format" 
      }, { status: 400 });
    }
    
    const result = await VehicleNegotiation.deleteOne({
      _id: id,
      companyId: user.companyId
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "Vehicle negotiation not found" 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Vehicle negotiation deleted successfully" 
    }, { status: 200 });

  } catch (error) {
    console.error("❌ DELETE /vehicle-negotiation error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to delete vehicle negotiation"
    }, { status: 500 });
  }
}

//import { NextResponse } from "next/server";
//import connectDb from "@/lib/db";
//import VehicleNegotiation from "./VehicleNegotiation";
//import { getTokenFromHeader, verifyJWT } from "@/lib/auth";
//import { getNextVehicleNegotiationNumber } from "./VehicleNegotiationCounter";
//import mongoose from 'mongoose';
//
//// Helper function to format date as DD/MM/YYYY
//function formatDateDDMMYYYY(date) {
//  if (!date) return '';
//  const d = new Date(date);
//  if (isNaN(d.getTime())) return '';
//  
//  const day = String(d.getDate()).padStart(2, '0');
//  const month = String(d.getMonth() + 1).padStart(2, '0');
//  const year = d.getFullYear();
//  
//  return `${day}/${month}/${year}`;
//}
//
//// ✅ Helper function to validate ObjectId
//function isValidObjectId(id) {
//  return id && mongoose.Types.ObjectId.isValid(id);
//}
//
//// ✅ Role-based access check
//function isAuthorized(user) {
//  return (
//    user?.type === "company" ||
//    user?.role === "Admin" ||
//    user?.permissions?.includes("vehicle_negotiation")
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
//   GET /api/vehicle-negotiation - Get All Vehicle Negotiations
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
//    const vnnNo = url.searchParams.get("vnnNo");
//    const format = url.searchParams.get("format");
//    
//    // ============ CASE 1: GET BY VNN NUMBER ============
//    if (vnnNo) {
//      console.log(`📄 GET vehicle negotiation by VNN: ${vnnNo}`);
//      
//      const vehicleNegotiation = await VehicleNegotiation.findOne({
//        vnnNo: vnnNo,
//        companyId: user.companyId
//      }).lean();
//
//      if (!vehicleNegotiation) {
//        return NextResponse.json({ 
//          success: false, 
//          message: "Vehicle negotiation not found" 
//        }, { status: 404 });
//      }
//
//      return NextResponse.json({ 
//        success: true, 
//        data: vehicleNegotiation 
//      }, { status: 200 });
//    }
//    
//    // ============ CASE 2: GET BY ID ============
//    if (id) {
//      console.log(`📄 GET single vehicle negotiation: ${id}`);
//      
//      if (!mongoose.Types.ObjectId.isValid(id)) {
//        return NextResponse.json({ 
//          success: false, 
//          message: "Invalid vehicle negotiation ID format" 
//        }, { status: 400 });
//      }
//      
//      const vehicleNegotiation = await VehicleNegotiation.findOne({
//        _id: id,
//        companyId: user.companyId
//      }).lean();
//
//      if (!vehicleNegotiation) {
//        return NextResponse.json({ 
//          success: false, 
//          message: "Vehicle negotiation not found" 
//        }, { status: 404 });
//      }
//
//      return NextResponse.json({ 
//        success: true, 
//        data: vehicleNegotiation 
//      }, { status: 200 });
//    }
//    
//    // ============ CASE 3: TABLE FORMAT ============
//    if (format === 'table') {
//      console.log("📋 Fetching table format data");
//      
//      const vehicleNegotiations = await VehicleNegotiation.find({
//        companyId: user.companyId
//      })
//        .sort({ date: -1, createdAt: -1 })
//        .lean();
//
//      const tableData = [];
//      
//      vehicleNegotiations.forEach(vn => {
//        const formattedDate = vn.date ? formatDateDDMMYYYY(vn.date) : '';
//        
//        if (vn.orders && vn.orders.length > 0) {
//          vn.orders.forEach(order => {
//            tableData.push({
//              date: formattedDate,
//              vnn: vn.vnnNo || '',
//              order: order.orderNo || '',
//              partyName: order.partyName || vn.customerName || '',
//              vendorName: vn.approval?.vendorName || '',
//              vendorCode: vn.approval?.vendorCode || '',
//              plantCode: order.plantName || order.plantCodeValue || '',
//              orderType: order.orderType || '',
//              pinCode: order.pinCode || '',
//              from: order.fromName || '',
//              to: order.toName || '',
//              taluka: order.talukaName || order.taluka || '',
//              district: order.districtName || '',
//              state: order.stateName || '',
//              country: order.countryName || '',
//              weight: order.weight || 0,
//              orderStatus: order.status || '',
//              approval: vn.approval?.approvalStatus || 'Pending',
//              memo: vn.approval?.memoStatus || 'Pending',
//              vnId: vn._id.toString(),
//              orderId: order._id ? order._id.toString() : null,
//              branchName: vn.branchName || ''
//            });
//          });
//        } else {
//          tableData.push({
//            date: formattedDate,
//            vnn: vn.vnnNo || '',
//            order: '',
//            partyName: vn.customerName || '',
//            vendorCode: vn.approval?.vendorCode || '',
//            vendorName: vn.approval?.vendorName || '',
//            plantCode: '',
//            orderType: '',
//            pinCode: '',
//            from: '',
//            to: '',
//            taluka: '',
//            district: '',
//            state: '',
//            country: '',
//            weight: 0,
//            orderStatus: '',
//            approval: vn.approval?.approvalStatus || 'Pending',
//            memo: vn.approval?.memoStatus || 'Pending',
//            vnId: vn._id.toString(),
//            orderId: null,
//            branchName: vn.branchName || ''
//          });
//        }
//      });
//
//      return NextResponse.json({
//        success: true,
//        data: tableData,
//        total: tableData.length,
//        message: `Found ${tableData.length} order records`
//      }, { status: 200 });
//    }
//
//    // ============ CASE 4: REGULAR LIST ============
//    const vehicleNegotiations = await VehicleNegotiation.find({
//      companyId: user.companyId
//    })
//      .sort({ createdAt: -1 })
//      .lean();
//
//    return NextResponse.json({
//      success: true,
//      data: vehicleNegotiations,
//      total: vehicleNegotiations.length
//    }, { status: 200 });
//
//  } catch (error) {
//    console.error("❌ GET /vehicle-negotiation error:", error);
//    return NextResponse.json({ 
//      success: false, 
//      message: "Failed to fetch vehicle negotiations",
//      error: error.message 
//    }, { status: 500 });
//  }
//}
//
///* ========================================
//   POST /api/vehicle-negotiation - Create New
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
//    console.log("📝 Creating new vehicle negotiation");
//    
//    // Generate vehicle negotiation number
//    let vnnNo = await getNextVehicleNegotiationNumber(user.companyId);
//    
//    // Check if VNN number already exists
//    const existing = await VehicleNegotiation.findOne({ vnnNo, companyId: user.companyId });
//    if (existing) {
//      vnnNo = await getNextVehicleNegotiationNumber(user.companyId);
//    }
//
//    // Process orders with proper null handling for ObjectId fields
//    const processedOrders = (body.orders || []).map(order => ({
//      orderNo: order.orderNo || '',
//      orderPanelId: order.orderPanelId || '',
//      partyName: order.partyName || '',
//      customerId: order.customerId && isValidObjectId(order.customerId) ? order.customerId : null,
//      customerCode: order.customerCode || '',
//      contactPerson: order.contactPerson || '',
//      plantCode: order.plantCode && isValidObjectId(order.plantCode) ? order.plantCode : null,
//      plantName: order.plantName || '',
//      plantCodeValue: order.plantCodeValue || '',
//      orderType: order.orderType || 'Sales',
//      pinCode: order.pinCode || '',
//      from: order.from && isValidObjectId(order.from) ? order.from : null,
//      fromName: order.fromName || '',
//      to: order.to && isValidObjectId(order.to) ? order.to : null,
//      toName: order.toName || '',
//      taluka: order.taluka || '',
//      talukaName: order.talukaName || '',
//      country: order.country || '',
//      countryName: order.countryName || '',
//      state: order.state || '',
//      stateName: order.stateName || '',
//      district: order.district || '',
//      districtName: order.districtName || '',
//      weight: Number(order.weight) || 0,
//      status: order.status || 'Open'
//    }));
//
//    // Calculate total weight
//    const totalWeight = processedOrders.reduce((sum, order) => sum + (order.weight || 0), 0);
//
//    // Validate delivery value
//    const validDeliveryValues = ['Urgent', 'Normal'];
//    let delivery = body.header?.delivery || 'Normal';
//    if (!validDeliveryValues.includes(delivery)) {
//      delivery = 'Normal';
//    }
//
//    // Create new vehicle negotiation with COMPLETE approval fields
//    const newVehicleNegotiation = new VehicleNegotiation({
//      vnnNo,
//      branch: body.header?.branch && isValidObjectId(body.header?.branch) ? body.header?.branch : null,
//      branchName: body.header?.branchName || '',
//      branchCode: body.header?.branchCode || '',
//      delivery: delivery,
//      date: body.header?.date ? new Date(body.header.date) : new Date(),
//      customerId: body.header?.customerId && isValidObjectId(body.header?.customerId) ? body.header?.customerId : null,
//      customerName: body.header?.customerName || '',
//      customerCode: body.header?.customerCode || '',
//      contactPerson: body.header?.contactPerson || '',
//      billingType: body.header?.billingType || 'Multi - Order',
//      loadingPoints: Number(body.header?.loadingPoints) || 1,
//      dropPoints: Number(body.header?.dropPoints) || 1,
//      collectionCharges: Number(body.header?.collectionCharges) || 0,
//      cancellationCharges: body.header?.cancellationCharges || 'Nil',
//      loadingCharges: body.header?.loadingCharges || 'Nil',
//      otherCharges: body.header?.otherCharges || 'Nil',
//      orders: processedOrders,
//      totalWeight,
//      negotiation: {
//        maxRate: Number(body.negotiation?.maxRate) || 0,
//        targetRate: Number(body.negotiation?.targetRate) || 0,
//        purchaseType: body.negotiation?.purchaseType || 'Loading & Unloading',
//        oldRatePercent: body.negotiation?.oldRatePercent || '',
//        remarks1: body.negotiation?.remarks1 || '',
//        remarks2: body.negotiation?.remarks2 || ''
//      },
//      vendors: (body.vendors || []).map(v => ({
//        vendorName: v.vendorName || '',
//        vendorCode: v.vendorCode || '',
//        marketRate: Number(v.marketRate) || 0
//      })),
//      voiceNote: body.voiceUrl || '',
//      voiceNoteFile: body.voiceFileInfo || null,
//      
//      // ✅ COMPLETE APPROVAL SECTION with ALL fields from frontend
//      approval: {
//        vendorName: body.approval?.vendorName || '',
//        vendorCode: body.approval?.vendorCode || '',
//        vendorId: body.approval?.vendorId || null,
//        vendorStatus: body.approval?.vendorStatus || 'Active',
//        rateType: body.approval?.rateType || 'Per MT',
//        finalPerMT: Number(body.approval?.finalPerMT) || 0,
//        finalFix: Number(body.approval?.finalFix) || 0,
//        vehicleNo: body.approval?.vehicleNo || '',
//        vehicleId: body.approval?.vehicleId || '',
//        vehicleData: body.approval?.vehicleData || null,
//        mobile: body.approval?.mobile || '',
//        purchaseType: body.approval?.purchaseType || 'Loading & Unloading',
//        paymentTerms: body.approval?.paymentTerms || '80 % Advance',
//        approvalStatus: body.approval?.approvalStatus || 'Pending',
//        remarks: body.approval?.remarks || '',
//        memoStatus: body.approval?.memoStatus || 'Pending',
//        memoFile: body.approval?.memoFile || null
//      },
//      companyId: user.companyId,
//      createdBy: user.id,
//      panelStatus: 'Draft'
//    });
//
//    await newVehicleNegotiation.save();
//
//    return NextResponse.json({ 
//      success: true, 
//      message: "Vehicle negotiation created successfully",
//      data: {
//        _id: newVehicleNegotiation._id,
//        vnnNo: newVehicleNegotiation.vnnNo
//      }
//    }, { status: 201 });
//
//  } catch (error) {
//    console.error("❌ POST /vehicle-negotiation error:", error);
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
//      message: error.message || "Failed to create vehicle negotiation"
//    }, { status: 500 });
//  }
//}
//
///* ========================================
//   PUT /api/vehicle-negotiation - Update
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
//        message: "Vehicle negotiation ID is required" 
//      }, { status: 400 });
//    }
//
//    console.log(`📝 Updating vehicle negotiation: ${id}`);
//    
//    // Validate ID format
//    if (!mongoose.Types.ObjectId.isValid(id)) {
//      return NextResponse.json({ 
//        success: false, 
//        message: "Invalid vehicle negotiation ID format" 
//      }, { status: 400 });
//    }
//    
//    // Find the vehicle negotiation
//    const vehicleNegotiation = await VehicleNegotiation.findOne({
//      _id: id,
//      companyId: user.companyId
//    });
//
//    if (!vehicleNegotiation) {
//      return NextResponse.json({ 
//        success: false, 
//        message: "Vehicle negotiation not found" 
//      }, { status: 404 });
//    }
//
//    // Update header fields with proper null handling
//    if (body.header) {
//      vehicleNegotiation.branch = body.header.branch && isValidObjectId(body.header.branch) 
//        ? body.header.branch 
//        : (vehicleNegotiation.branch || null);
//      vehicleNegotiation.branchName = body.header.branchName || vehicleNegotiation.branchName || '';
//      vehicleNegotiation.branchCode = body.header.branchCode || vehicleNegotiation.branchCode || '';
//      
//      const validDeliveryValues = ['Urgent', 'Normal'];
//      let delivery = body.header.delivery || vehicleNegotiation.delivery || 'Normal';
//      if (!validDeliveryValues.includes(delivery)) {
//        delivery = 'Normal';
//      }
//      vehicleNegotiation.delivery = delivery;
//      
//      vehicleNegotiation.date = body.header.date ? new Date(body.header.date) : vehicleNegotiation.date;
//      vehicleNegotiation.customerId = body.header.customerId && isValidObjectId(body.header.customerId) 
//        ? body.header.customerId 
//        : (vehicleNegotiation.customerId || null);
//      vehicleNegotiation.customerName = body.header.customerName || vehicleNegotiation.customerName || '';
//      vehicleNegotiation.customerCode = body.header.customerCode || vehicleNegotiation.customerCode || '';
//      vehicleNegotiation.contactPerson = body.header.contactPerson || vehicleNegotiation.contactPerson || '';
//      vehicleNegotiation.billingType = body.header.billingType || vehicleNegotiation.billingType || 'Multi - Order';
//      vehicleNegotiation.loadingPoints = Number(body.header.loadingPoints) || vehicleNegotiation.loadingPoints || 1;
//      vehicleNegotiation.dropPoints = Number(body.header.dropPoints) || vehicleNegotiation.dropPoints || 1;
//      vehicleNegotiation.collectionCharges = Number(body.header.collectionCharges) || vehicleNegotiation.collectionCharges || 0;
//      vehicleNegotiation.cancellationCharges = body.header.cancellationCharges || vehicleNegotiation.cancellationCharges || 'Nil';
//      vehicleNegotiation.loadingCharges = body.header.loadingCharges || vehicleNegotiation.loadingCharges || 'Nil';
//      vehicleNegotiation.otherCharges = body.header.otherCharges || vehicleNegotiation.otherCharges || 'Nil';
//    }
//
//    // Update orders - Proper null handling with taluka
//    if (body.orders) {
//      const processedOrders = body.orders.map(order => ({
//        _id: order._id && isValidObjectId(order._id) 
//          ? new mongoose.Types.ObjectId(order._id) 
//          : new mongoose.Types.ObjectId(),
//        orderNo: order.orderNo || '',
//        orderPanelId: order.orderPanelId || '',
//        partyName: order.partyName || '',
//        customerId: order.customerId && isValidObjectId(order.customerId) ? order.customerId : null,
//        customerCode: order.customerCode || '',
//        contactPerson: order.contactPerson || '',
//        plantCode: order.plantCode && isValidObjectId(order.plantCode) ? order.plantCode : null,
//        plantName: order.plantName || '',
//        plantCodeValue: order.plantCodeValue || '',
//        orderType: order.orderType || 'Sales',
//        pinCode: order.pinCode || '',
//        from: order.from && isValidObjectId(order.from) ? order.from : null,
//        fromName: order.fromName || '',
//        to: order.to && isValidObjectId(order.to) ? order.to : null,
//        toName: order.toName || '',
//        taluka: order.taluka || '',
//        talukaName: order.talukaName || '',
//        country: order.country || '',
//        countryName: order.countryName || '',
//        state: order.state || '',
//        stateName: order.stateName || '',
//        district: order.district || '',
//        districtName: order.districtName || '',
//        weight: Number(order.weight) || 0,
//        status: order.status || 'Open'
//      }));
//      
//      vehicleNegotiation.orders = processedOrders;
//      vehicleNegotiation.totalWeight = processedOrders.reduce((sum, order) => sum + (order.weight || 0), 0);
//    }
//
//    // Update negotiation
//    if (body.negotiation) {
//      vehicleNegotiation.negotiation = {
//        maxRate: Number(body.negotiation.maxRate) || vehicleNegotiation.negotiation?.maxRate || 0,
//        targetRate: Number(body.negotiation.targetRate) || vehicleNegotiation.negotiation?.targetRate || 0,
//        purchaseType: body.negotiation.purchaseType || vehicleNegotiation.negotiation?.purchaseType || 'Loading & Unloading',
//        oldRatePercent: body.negotiation.oldRatePercent || vehicleNegotiation.negotiation?.oldRatePercent || '',
//        remarks1: body.negotiation.remarks1 || vehicleNegotiation.negotiation?.remarks1 || '',
//        remarks2: body.negotiation.remarks2 || vehicleNegotiation.negotiation?.remarks2 || ''
//      };
//    }
//
//    // Update vendors
//    if (body.vendors) {
//      vehicleNegotiation.vendors = body.vendors.map(v => ({
//        _id: v._id && isValidObjectId(v._id) 
//          ? new mongoose.Types.ObjectId(v._id) 
//          : new mongoose.Types.ObjectId(),
//        vendorName: v.vendorName || '',
//        vendorCode: v.vendorCode || '',
//        marketRate: Number(v.marketRate) || 0
//      }));
//    }
//
//    // Update voice note
//    if (body.voiceUrl !== undefined) vehicleNegotiation.voiceNote = body.voiceUrl;
//    if (body.voiceFileInfo) vehicleNegotiation.voiceNoteFile = body.voiceFileInfo;
//
//    // ✅ FIXED: Update approval - Include ALL fields from frontend
//    if (body.approval) {
//      // Get current approval or create new object
//      const currentApproval = vehicleNegotiation.approval || {};
//      
//      // Create updated approval object with ALL fields from frontend
//      const updatedApproval = {
//        // Basic vendor info
//        vendorName: body.approval.vendorName !== undefined ? body.approval.vendorName : (currentApproval.vendorName || ''),
//        vendorCode: body.approval.vendorCode !== undefined ? body.approval.vendorCode : (currentApproval.vendorCode || ''),
//        vendorId: body.approval.vendorId !== undefined ? body.approval.vendorId : (currentApproval.vendorId || null),
//        vendorStatus: body.approval.vendorStatus !== undefined ? body.approval.vendorStatus : (currentApproval.vendorStatus || 'Active'),
//        
//        // Rate info
//        rateType: body.approval.rateType !== undefined ? body.approval.rateType : (currentApproval.rateType || 'Per MT'),
//        finalPerMT: body.approval.finalPerMT !== undefined ? Number(body.approval.finalPerMT) : (currentApproval.finalPerMT || 0),
//        finalFix: body.approval.finalFix !== undefined ? Number(body.approval.finalFix) : (currentApproval.finalFix || 0),
//        
//        // Vehicle info
//        vehicleNo: body.approval.vehicleNo !== undefined ? body.approval.vehicleNo : (currentApproval.vehicleNo || ''),
//        vehicleId: body.approval.vehicleId !== undefined ? body.approval.vehicleId : (currentApproval.vehicleId || ''),
//        vehicleData: body.approval.vehicleData !== undefined ? body.approval.vehicleData : (currentApproval.vehicleData || null),
//        mobile: body.approval.mobile !== undefined ? body.approval.mobile : (currentApproval.mobile || ''),
//        
//        // Purchase terms
//        purchaseType: body.approval.purchaseType !== undefined ? body.approval.purchaseType : (currentApproval.purchaseType || 'Loading & Unloading'),
//        paymentTerms: body.approval.paymentTerms !== undefined ? body.approval.paymentTerms : (currentApproval.paymentTerms || '80 % Advance'),
//        
//        // Status
//        approvalStatus: body.approval.approvalStatus !== undefined ? body.approval.approvalStatus : (currentApproval.approvalStatus || 'Pending'),
//        remarks: body.approval.remarks !== undefined ? body.approval.remarks : (currentApproval.remarks || ''),
//        
//        // Memo
//        memoStatus: body.approval.memoStatus !== undefined ? body.approval.memoStatus : (currentApproval.memoStatus || 'Pending'),
//      };
//
//      // Handle memoFile separately - ONLY if it exists and has valid data
//      if (body.approval.memoFile && 
//          typeof body.approval.memoFile === 'object' && 
//          body.approval.memoFile !== null) {
//        
//        const hasFileData = body.approval.memoFile.filePath || 
//                           body.approval.memoFile.filename || 
//                           body.approval.memoFile.originalName;
//        
//        if (hasFileData) {
//          updatedApproval.memoFile = {
//            filePath: body.approval.memoFile.filePath || '',
//            fullPath: body.approval.memoFile.fullPath || '',
//            filename: body.approval.memoFile.filename || '',
//            originalName: body.approval.memoFile.originalName || '',
//            size: Number(body.approval.memoFile.size) || 0,
//            mimeType: body.approval.memoFile.mimeType || '',
//            uploadedAt: body.approval.memoFile.uploadedAt || new Date()
//          };
//        }
//      } else if (currentApproval.memoFile) {
//        // Keep existing memoFile if no new one is provided and it exists
//        updatedApproval.memoFile = currentApproval.memoFile;
//      }
//
//      vehicleNegotiation.approval = updatedApproval;
//    }
//
//    // Save the updated vehicle negotiation
//    await vehicleNegotiation.save();
//
//    return NextResponse.json({ 
//      success: true, 
//      message: "Vehicle negotiation updated successfully",
//      data: {
//        _id: vehicleNegotiation._id,
//        vnnNo: vehicleNegotiation.vnnNo
//      }
//    }, { status: 200 });
//
//  } catch (error) {
//    console.error("❌ PUT /vehicle-negotiation error:", error);
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
//      message: error.message || "Failed to update vehicle negotiation"
//    }, { status: 500 });
//  }
//}
//
///* ========================================
//   DELETE /api/vehicle-negotiation - Delete
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
//    if (!id) {
//      return NextResponse.json({ 
//        success: false, 
//        message: "Vehicle negotiation ID is required" 
//      }, { status: 400 });
//    }
//
//    console.log(`🗑️ Deleting vehicle negotiation: ${id}`);
//    
//    if (!mongoose.Types.ObjectId.isValid(id)) {
//      return NextResponse.json({ 
//        success: false, 
//        message: "Invalid vehicle negotiation ID format" 
//      }, { status: 400 });
//    }
//    
//    const result = await VehicleNegotiation.deleteOne({
//      _id: id,
//      companyId: user.companyId
//    });
//
//    if (result.deletedCount === 0) {
//      return NextResponse.json({ 
//        success: false, 
//        message: "Vehicle negotiation not found" 
//      }, { status: 404 });
//    }
//
//    return NextResponse.json({ 
//      success: true, 
//      message: "Vehicle negotiation deleted successfully" 
//    }, { status: 200 });
//
//  } catch (error) {
//    console.error("❌ DELETE /vehicle-negotiation error:", error);
//    return NextResponse.json({ 
//      success: false, 
//      message: error.message || "Failed to delete vehicle negotiation"
//    }, { status: 500 });
//  }
//}


//import { NextResponse } from "next/server";
//import connectDb from "@/lib/db";
//import VehicleNegotiation from "./VehicleNegotiation";
//import Branch from "../branches/schema";
//import Customer from "@/models/CustomerModel";
//import { getTokenFromHeader, verifyJWT } from "@/lib/auth";
//import { getNextVehicleNegotiationNumber } from "./VehicleNegotiationCounter";
//import mongoose from 'mongoose';
//
//// ✅ Role-based access check
//function isAuthorized(user) {
//  return (
//    user?.type === "company" ||
//    user?.role === "Admin" ||
//    user?.permissions?.includes("vehicle_negotiation")
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
//   SINGLE GET FUNCTION FOR /api/vehicle-negotiation
//======================================== */
//export async function GET(req) {
//  await connectDb();
//  const { user, error, status } = await validateUser(req);
//  if (error) return NextResponse.json({ success: false, message: error }, { status });
//
//  try {
//    const url = new URL(req.url);
//    const id = url.searchParams.get("id");
//    
//    // If ID is provided, return single vehicle negotiation
//    if (id) {
//      console.log(`📄 GET single vehicle negotiation: ${id}`);
//      
//      const vehicleNegotiation = await VehicleNegotiation.findOne({
//        _id: id,
//        companyId: user.companyId
//      })
//      .populate('branch', 'name code')
//      .populate('customerId', 'customerName customerCode contactPersonName')
//      .populate('orders.plantCode', 'name code')
//      .populate('orders.from', 'name code')
//      .populate('orders.to', 'name code')
//      .lean();
//
//      if (!vehicleNegotiation) {
//        return NextResponse.json({ 
//          success: false, 
//          message: "Vehicle negotiation not found" 
//        }, { status: 404 });
//      }
//
//      return NextResponse.json({ 
//        success: true, 
//        data: vehicleNegotiation 
//      }, { status: 200 });
//    }
//    
//    // Otherwise, return list with pagination
//    console.log("📋 GET list of vehicle negotiations");
//    
//    const page = parseInt(url.searchParams.get('page')) || 1;
//    const limit = parseInt(url.searchParams.get('limit')) || 10;
//    const search = url.searchParams.get('search') || '';
//    const statusFilter = url.searchParams.get('status');
//    const fromDate = url.searchParams.get('fromDate');
//    const toDate = url.searchParams.get('toDate');
//    
//    const skip = (page - 1) * limit;
//
//    let query = { companyId: user.companyId };
//    
//    // Search filter
//    if (search) {
//      query.$or = [
//        { vnnNo: { $regex: search, $options: 'i' } },
//        { customerName: { $regex: search, $options: 'i' } },
//        { 'orders.orderNo': { $regex: search, $options: 'i' } },
//        { 'approval.vendorName': { $regex: search, $options: 'i' } }
//      ];
//    }
//    
//    // Status filter
//    if (statusFilter) {
//      query.panelStatus = statusFilter;
//    }
//    
//    // Date range filter
//    if (fromDate || toDate) {
//      query.date = {};
//      if (fromDate) query.date.$gte = new Date(fromDate);
//      if (toDate) query.date.$lte = new Date(toDate);
//    }
//
//    const vehicleNegotiations = await VehicleNegotiation.find(query)
//      .sort({ createdAt: -1 })
//      .skip(skip)
//      .limit(limit)
//      .populate('branch', 'name code')
//      .populate('customerId', 'customerName customerCode')
//      .lean();
//
//    const total = await VehicleNegotiation.countDocuments(query);
//    const totalPages = Math.ceil(total / limit);
//
//    return NextResponse.json({
//      success: true,
//      data: vehicleNegotiations,
//      pagination: {
//        page,
//        limit,
//        total,
//        totalPages,
//        hasNext: page < totalPages,
//        hasPrev: page > 1
//      }
//    }, { status: 200 });
//  } catch (error) {
//    console.error("GET /vehicle-negotiation error:", error);
//    return NextResponse.json({ 
//      success: false, 
//      message: "Failed to fetch vehicle negotiations" 
//    }, { status: 500 });
//  }
//}
//
///* ========================================
//   POST /api/vehicle-negotiation - Create New
//======================================== */
//export async function POST(req) {
//  await connectDb();
//  const { user, error, status } = await validateUser(req);
//  if (error) return NextResponse.json({ success: false, message: error }, { status });
//
//  try {
//    const body = await req.json();
//    
//    console.log("📝 Creating new vehicle negotiation:", JSON.stringify(body, null, 2));
//    
//    // Generate vehicle negotiation number
//    let vnnNo = await getNextVehicleNegotiationNumber(user.companyId);
//    
//    // Check if VNN number already exists
//    const existing = await VehicleNegotiation.findOne({ vnnNo, companyId: user.companyId });
//    if (existing) {
//      vnnNo = await getNextVehicleNegotiationNumber(user.companyId);
//    }
//
//    // Find branch details
//    let branchName = '';
//    let branchCode = '';
//    if (body.header?.branch) {
//      try {
//        const branchFromArray = body.branches?.find(b => b._id === body.header.branch);
//        if (branchFromArray) {
//          branchName = branchFromArray.name || '';
//          branchCode = branchFromArray.code || '';
//        }
//      } catch (err) {
//        console.error("Error fetching branch details:", err);
//      }
//    }
//
//    // Process orders to include names
//    const processedOrders = body.orders?.map(order => {
//      const fromBranch = body.branches?.find(b => b._id === order.from);
//      const toBranch = body.branches?.find(b => b._id === order.to);
//      const plant = body.plants?.find(p => p._id === order.plantCode);
//      const country = body.countries?.find(c => c.code === order.country);
//      const state = body.states?.find(s => s._id === order.state);
//      const district = body.districts?.find(d => d._id === order.district);
//      
//      return {
//        ...order,
//        plantName: plant?.name || order.plantName || '',
//        plantCodeValue: plant?.code || order.plantCodeValue || '',
//        fromName: fromBranch ? `${fromBranch.name} (${fromBranch.code})` : order.fromName || '',
//        toName: toBranch ? `${toBranch.name} (${toBranch.code})` : order.toName || '',
//        countryName: country?.name || order.countryName || '',
//        stateName: state ? `${state.name} (${state.code})` : order.stateName || '',
//        districtName: district ? `${district.name} (${district.code})` : order.districtName || ''
//      };
//    }) || [];
//
//    // Calculate total weight
//    const totalWeight = processedOrders.reduce((sum, order) => sum + (order.weight || 0), 0);
//
//    // Handle customerId
//    let customerId = null;
//    if (body.header?.customerId && body.header.customerId.trim() !== '' && 
//        mongoose.Types.ObjectId.isValid(body.header.customerId)) {
//      customerId = new mongoose.Types.ObjectId(body.header.customerId);
//    }
//
//    // Create report rows
//    const reportRows = processedOrders.map(order => ({
//      date: body.header?.date ? new Date(body.header.date) : new Date(),
//      vnn: vnnNo,
//      order: order.orderNo,
//      partyName: order.partyName || '-',
//      plantCode: order.plantName || '-',
//      orderType: order.orderType,
//      pinCode: order.pinCode || '-',
//      from: order.fromName || '-',
//      to: order.toName || '-',
//      district: order.districtName || '-',
//      state: order.stateName || '-',
//      country: order.countryName || '-',
//      weight: order.weight,
//      orderStatus: order.status,
//      approval: body.approval?.approvalStatus || 'Pending',
//      memo: body.approval?.memoStatus || 'Pending'
//    }));
//
//    // Process voice note file
//    let voiceNoteFile = null;
//    if (body.voiceNote?.file) {
//      voiceNoteFile = {
//        filename: body.voiceNote.filename || '',
//        originalName: body.voiceNote.originalName || '',
//        path: body.voiceNote.path || '',
//        size: body.voiceNote.size || 0,
//        mimeType: body.voiceNote.mimeType || '',
//        uploadedAt: new Date()
//      };
//    }
//
//    // Process memo file
//    let memoFile = null;
//    if (body.approval?.memoFile?.file) {
//      memoFile = {
//        filename: body.approval.memoFile.filename || '',
//        originalName: body.approval.memoFile.originalName || '',
//        path: body.approval.memoFile.path || '',
//        size: body.approval.memoFile.size || 0,
//        mimeType: body.approval.memoFile.mimeType || '',
//        uploadedAt: new Date()
//      };
//    }
//
//    // Create new vehicle negotiation with readonly fields set from order panel
//    const newVehicleNegotiation = new VehicleNegotiation({
//      vnnNo,
//      branch: body.header?.branch || '',
//      branchName,
//      branchCode,
//      delivery: body.header?.delivery || 'Normal',
//      date: body.header?.date ? new Date(body.header.date) : new Date(),
//      customerId,
//      customerName: body.header?.customerName || '',
//      customerCode: body.header?.customerCode || '',
//      contactPerson: body.header?.contactPerson || '',
//      billingType: body.header?.billingType || 'Multi - Order',
//      loadingPoints: body.header?.loadingPoints || 1,
//      dropPoints: body.header?.dropPoints || 1,
//      collectionCharges: body.header?.collectionCharges || 0,
//      cancellationCharges: body.header?.cancellationCharges || 'Nil',
//      loadingCharges: body.header?.loadingCharges || 'Nil',
//      otherCharges: body.header?.otherCharges || 'Nil',
//      orders: processedOrders,
//      totalWeight,
//      negotiation: {
//        maxRate: body.negotiation?.maxRate || 0,
//        targetRate: body.negotiation?.targetRate || 0,
//        purchaseType: body.negotiation?.purchaseType || 'Loading & Unloading',
//        oldRatePercent: body.negotiation?.oldRatePercent || '',
//        remarks1: body.negotiation?.remarks1 || '',
//        remarks2: body.negotiation?.remarks2 || ''
//      },
//      vendors: body.vendors || [],
//      voiceNote: body.voiceUrl || '',
//      voiceNoteFile,
//      approval: {
//        vendorName: body.approval?.vendorName || '',
//        vendorStatus: body.approval?.vendorStatus || 'Active',
//        rateType: body.approval?.rateType || 'Per MT',
//        finalPerMT: body.approval?.finalPerMT || 0,
//        finalFix: body.approval?.finalFix || 0,
//        vehicleNo: body.approval?.vehicleNo || '',
//        mobile: body.approval?.mobile || '',
//        purchaseType: body.approval?.purchaseType || 'Loading & Unloading',
//        paymentTerms: body.approval?.paymentTerms || '80 % Advance',
//        approvalStatus: body.approval?.approvalStatus || 'Pending',
//        remarks: body.approval?.remarks || '',
//        memoStatus: body.approval?.memoStatus || 'Pending',
//        memoFile
//      },
//      purchaseAmount: 0, // Will be calculated by pre-save hook
//      reportRows,
//      companyId: user.companyId,
//      createdBy: user.id,
//      panelStatus: 'Draft'
//    });
//
//    await newVehicleNegotiation.save();
//
//    // Find saved vehicle negotiation with populated data
//    const savedVehicleNegotiation = await VehicleNegotiation.findById(newVehicleNegotiation._id)
//      .populate('branch', 'name code')
//      .populate('customerId', 'customerName customerCode')
//      .populate('orders.plantCode', 'name code')
//      .populate('orders.from', 'name code')
//      .populate('orders.to', 'name code')
//      .lean();
//
//    return NextResponse.json({ 
//      success: true, 
//      message: "Vehicle negotiation created successfully",
//      data: savedVehicleNegotiation 
//    }, { status: 201 });
//  } catch (error) {
//    console.error("POST /vehicle-negotiation error:", error);
//    
//    if (error.code === 11000) {
//      return NextResponse.json({ 
//        success: false, 
//        message: "Vehicle negotiation number already exists" 
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
//    if (error.name === 'CastError') {
//      return NextResponse.json({ 
//        success: false, 
//        message: `Invalid ${error.path} format` 
//      }, { status: 400 });
//    }
//    
//    return NextResponse.json({ 
//      success: false, 
//      message: "Failed to create vehicle negotiation" 
//    }, { status: 500 });
//  }
//}
//
//
