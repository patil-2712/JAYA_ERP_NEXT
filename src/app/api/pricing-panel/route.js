// /app/api/pricing-panel/route.js
import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import PricingPanel from "./PricingPanel";
import { getTokenFromHeader, verifyJWT } from "@/lib/auth";
import { getNextPricingSerialNumber } from "./PricingCounter";
import mongoose from 'mongoose';

// ✅ Role-based access check
function isAuthorized(user) {
  return (
    user?.type === "company" ||
    user?.role === "Admin" ||
    user?.permissions?.includes("pricing_panel")
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
   POST /api/pricing-panel - Create New Pricing Panel
======================================== */
export async function POST(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    const body = await req.json();
    
    console.log("📝 Creating new pricing panel");
    
    // ✅ Generate Pricing Serial Number
    let pricingSerialNo = await getNextPricingSerialNumber(user.companyId);
    
    // Check if Pricing Serial Number already exists
    const existing = await PricingPanel.findOne({ pricingSerialNo, companyId: user.companyId });
    if (existing) {
      pricingSerialNo = await getNextPricingSerialNumber(user.companyId);
    }

    // ✅ Handle branch - it could be an ID string or an object from frontend
    let branchId = null;
    let branchName = '';
    let branchCode = '';
    
    if (body.header?.branch) {
      if (typeof body.header.branch === 'object' && body.header.branch !== null) {
        branchId = body.header.branch._id || null;
        branchName = body.header.branch.name || body.header.branchName || '';
        branchCode = body.header.branch.code || body.header.branchCode || '';
      } else {
        branchId = body.header.branch;
        if (body.branches && Array.isArray(body.branches)) {
          const branchFromArray = body.branches.find(b => b._id === branchId);
          if (branchFromArray) {
            branchName = branchFromArray.name || '';
            branchCode = branchFromArray.code || '';
          }
        }
      }
    }

    // ✅ Helper function to validate ObjectId
    function isValidObjectId(id) {
      return id && mongoose.Types.ObjectId.isValid(id);
    }

    // ✅ Validate and process orders from the 'orders' array
    const orders = [];
    
    if (body.orders && Array.isArray(body.orders)) {
      console.log(`Processing ${body.orders.length} orders from frontend`);
      
      for (const order of body.orders) {
        if (!order.orderNo || order.orderNo.trim() === "") {
          console.log("Skipping empty order row");
          continue;
        }
        
        // ✅ Handle vehicleNegotiationId properly
        let vehicleNegotiationId = null;
        if (order.vehicleNegotiationId) {
          if (typeof order.vehicleNegotiationId === 'object' && order.vehicleNegotiationId !== null) {
            vehicleNegotiationId = order.vehicleNegotiationId._id || null;
          } else if (typeof order.vehicleNegotiationId === 'string') {
            if (isValidObjectId(order.vehicleNegotiationId)) {
              vehicleNegotiationId = new mongoose.Types.ObjectId(order.vehicleNegotiationId);
            } else {
              vehicleNegotiationId = order.vehicleNegotiationId;
            }
          }
        }
        
        // Find related data from reference arrays
        const fromBranch = body.branches?.find(b => b._id === order.from);
        const toBranch = body.branches?.find(b => b._id === order.to);
        const plant = body.plants?.find(p => p._id === order.plantCode);
        const country = body.countries?.find(c => c.code === order.country);
        const state = body.states?.find(s => s._id === order.stateId);
        const district = body.districts?.find(d => d._id === order.districtId);
        const taluka = body.talukas?.find(t => t._id === order.talukaId);
        
        orders.push({
          orderNo: order.orderNo,
          vehicleNegotiationId: vehicleNegotiationId,
          partyName: order.partyName || body.header?.partyName || '',
          customerId: order.customerId || body.header?.customerId || null,
          customerCode: order.customerCode || '',
          contactPerson: order.contactPerson || '',
          plantCode: order.plantCode || null,
          plantName: order.plantName || (plant ? `${plant.name} (${plant.code})` : ''),
          plantCodeValue: order.plantCodeValue || '',
          orderType: order.orderType || 'Sales',
          pinCode: order.pinCode || '',
          country: order.country || '',
          countryName: country?.name || order.countryName || '',
          state: order.state || '',
          stateName: state ? state.name : order.stateName || '',
          stateId: order.stateId || null,
          district: order.district || '',
          districtName: district ? district.name : order.districtName || '',
          districtId: order.districtId || null,
          // TALUKA FIELDS - Properly mapped
          taluka: order.taluka || '',
          talukaName: taluka ? taluka.name : (order.talukaName || order.taluka || ''),
          talukaId: order.talukaId || null,
          from: order.from || null,
          fromName: fromBranch ? fromBranch.name : order.fromName || '',
          to: order.to || null,
          toName: toBranch ? toBranch.name : order.toName || '',
          locationRate: order.locationRate || '',  // Store as string, not number
          priceList: order.priceList || '',
          weight: parseFloat(order.weight) || 0,
          rate: parseFloat(order.rate) || 0,
          totalAmount: (parseFloat(order.weight) || 0) * (parseFloat(order.rate) || 0)
        });
      }
    }
    
    // ✅ Check if we have at least one valid order
    if (orders.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "At least one valid order is required" 
      }, { status: 400 });
    }

    // ✅ Calculate totals
    const totalAmount = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalWeight = orders.reduce((sum, order) => sum + (order.weight || 0), 0);

    // ✅ Handle customerId
    let customerId = null;
    if (body.header?.customerId) {
      if (typeof body.header.customerId === 'object' && body.header.customerId !== null && body.header.customerId._id) {
        customerId = new mongoose.Types.ObjectId(body.header.customerId._id);
      } else if (typeof body.header.customerId === 'string' && 
                 body.header.customerId.trim() !== '' && 
                 mongoose.Types.ObjectId.isValid(body.header.customerId)) {
        customerId = new mongoose.Types.ObjectId(body.header.customerId);
      }
    }

    // ✅ Create pricing report rows - WITH TALUKA
    const reportRows = orders.map(order => ({
      date: body.header?.date ? new Date(body.header.date) : new Date(),
      pricingSerialNo: pricingSerialNo,
      order: order.orderNo,
      partyName: order.partyName || '-',
      plantCode: order.plantName || '-',
      orderType: order.orderType || 'Sales',
      pinCode: order.pinCode || '-',
      taluka: order.talukaName || order.taluka || '-',
      state: order.stateName || '-',
      district: order.districtName || '-',
      from: order.fromName || '-',
      to: order.toName || '-',
      weight: order.weight || 0,
      pricing: 'Pending',
      approval: body.rateApproval?.approvalStatus || 'Pending'
    }));

    // ✅ Handle billing charges - convert to appropriate types
    const cancellationCharges = typeof body.billing?.cancellationCharges === 'number' 
      ? body.billing.cancellationCharges.toString() 
      : (body.billing?.cancellationCharges || 'Nil');
      
    const loadingCharges = typeof body.billing?.loadingCharges === 'number'
      ? body.billing.loadingCharges.toString()
      : (body.billing?.loadingCharges || 'Nil');
      
    const otherCharges = typeof body.billing?.otherCharges === 'number'
      ? body.billing.otherCharges.toString()
      : (body.billing?.otherCharges || 'Nil');

    // ✅ Create new pricing panel document
    const newPricingPanel = new PricingPanel({
      pricingSerialNo,
      branch: branchId,
      branchName: branchName || body.header?.branchName || '',
      branchCode: branchCode || body.header?.branchCode || '',
      delivery: body.header?.delivery || 'Normal',
      date: body.header?.date ? new Date(body.header.date) : new Date(),
      customerId,
      partyName: body.header?.partyName || '',
      
      // Billing Information
      billingType: body.billing?.billingType || 'Multi - Order',
      loadingPoints: parseInt(body.billing?.loadingPoints) || 1,
      dropPoints: parseInt(body.billing?.dropPoints) || 1,
      collectionCharges: parseFloat(body.billing?.collectionCharges) || 0,
      cancellationCharges: cancellationCharges,
      loadingCharges: loadingCharges,
      otherCharges: otherCharges,
      
      // Orders
      orders: orders,
      totalWeight,
      totalAmount,
      
      // Rate Approval
      rateApproval: {
        approvalType: body.rateApproval?.approvalType || 'Contract Rates',
        uploadFile: body.rateApproval?.uploadFileName || '',
        approvalStatus: body.rateApproval?.approvalStatus || 'Pending'
      },
      
      // Report Data
      reportRows,
      
      // Company & User Tracking
      companyId: user.companyId,
      createdBy: user.id,
      panelStatus: 'Draft',
      status: 'Active'
    });

    await newPricingPanel.save();

    return NextResponse.json({ 
      success: true, 
      message: "Pricing panel created successfully",
      data: {
        _id: newPricingPanel._id,
        pricingSerialNo: newPricingPanel.pricingSerialNo
      }
    }, { status: 201 });

  } catch (error) {
    console.error("❌ POST /pricing-panel error:", error);
    
    if (error.code === 11000) {
      return NextResponse.json({ 
        success: false, 
        message: "Pricing serial number already exists" 
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
      message: error.message || "Failed to create pricing panel"
    }, { status: 500 });
  }
}

/* ========================================
   PUT /api/pricing-panel - Update Pricing Panel
======================================== */
export async function PUT(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) return NextResponse.json({ success: false, message: error }, { status });

  try {
    const body = await req.json();
    const { id } = body;
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        message: "Pricing panel ID is required" 
      }, { status: 400 });
    }

    console.log(`📝 Updating pricing panel: ${id}`);
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid pricing panel ID format" 
      }, { status: 400 });
    }
    
    // Find the pricing panel
    const pricingPanel = await PricingPanel.findOne({
      _id: id,
      companyId: user.companyId
    });

    if (!pricingPanel) {
      return NextResponse.json({ 
        success: false, 
        message: "Pricing panel not found" 
      }, { status: 404 });
    }

    // Update header
    if (body.header) {
      pricingPanel.branch = body.header.branch || pricingPanel.branch;
      pricingPanel.branchName = body.header.branchName || pricingPanel.branchName;
      pricingPanel.branchCode = body.header.branchCode || pricingPanel.branchCode;
      pricingPanel.delivery = body.header.delivery || pricingPanel.delivery;
      pricingPanel.date = body.header.date ? new Date(body.header.date) : pricingPanel.date;
      pricingPanel.customerId = body.header.customerId || pricingPanel.customerId;
      pricingPanel.partyName = body.header.partyName || pricingPanel.partyName;
    }

    // Update billing
    if (body.billing) {
      pricingPanel.billingType = body.billing.billingType || pricingPanel.billingType;
      pricingPanel.loadingPoints = parseInt(body.billing.loadingPoints) || pricingPanel.loadingPoints;
      pricingPanel.dropPoints = parseInt(body.billing.dropPoints) || pricingPanel.dropPoints;
      pricingPanel.collectionCharges = parseFloat(body.billing.collectionCharges) || pricingPanel.collectionCharges;
      
      if (body.billing.cancellationCharges !== undefined) {
        pricingPanel.cancellationCharges = typeof body.billing.cancellationCharges === 'number' 
          ? body.billing.cancellationCharges.toString() 
          : body.billing.cancellationCharges;
      }
      
      if (body.billing.loadingCharges !== undefined) {
        pricingPanel.loadingCharges = typeof body.billing.loadingCharges === 'number' 
          ? body.billing.loadingCharges.toString() 
          : body.billing.loadingCharges;
      }
      
      if (body.billing.otherCharges !== undefined) {
        pricingPanel.otherCharges = typeof body.billing.otherCharges === 'number' 
          ? body.billing.otherCharges.toString() 
          : body.billing.otherCharges;
      }
    }

    // Update orders - WITH COMPLETE TALUKA FIELDS
    if (body.orders) {
      const processedOrders = body.orders.map(order => ({
        _id: order._id && mongoose.Types.ObjectId.isValid(order._id) 
          ? new mongoose.Types.ObjectId(order._id) 
          : new mongoose.Types.ObjectId(),
        orderNo: order.orderNo || '',
        vehicleNegotiationId: order.vehicleNegotiationId || null,
        partyName: order.partyName || '',
        customerId: order.customerId || null,
        customerCode: order.customerCode || '',
        contactPerson: order.contactPerson || '',
        plantCode: order.plantCode || null,
        plantName: order.plantName || '',
        plantCodeValue: order.plantCodeValue || '',
        orderType: order.orderType || 'Sales',
        pinCode: order.pinCode || '',
        country: order.country || '',
        countryName: order.countryName || '',
        state: order.state || '',
        stateName: order.stateName || '',
        stateId: order.stateId || null,
        district: order.district || '',
        districtName: order.districtName || '',
        districtId: order.districtId || null,
        // TALUKA FIELDS - Properly mapped
        taluka: order.taluka || '',
        talukaName: order.talukaName || order.taluka || '',
        talukaId: order.talukaId || null,
        from: order.from || null,
        fromName: order.fromName || '',
        to: order.to || null,
        toName: order.toName || '',
       locationRate: order.locationRate || '',  // Store as string
        priceList: order.priceList || '',
        weight: parseFloat(order.weight) || 0,
        rate: parseFloat(order.rate) || 0,
        totalAmount: (parseFloat(order.weight) || 0) * (parseFloat(order.rate) || 0)
      }));
      
      pricingPanel.orders = processedOrders;
    }

    // Update rate approval
    if (body.rateApproval) {
      pricingPanel.rateApproval = {
        approvalType: body.rateApproval.approvalType || pricingPanel.rateApproval?.approvalType || 'Contract Rates',
        uploadFile: body.rateApproval.uploadFile || pricingPanel.rateApproval?.uploadFile || '',
        approvalStatus: body.rateApproval.approvalStatus || pricingPanel.rateApproval?.approvalStatus || 'Pending'
      };
    }

    // Save the updated pricing panel (this will trigger pre-save hooks)
    await pricingPanel.save();

    console.log(`✅ Pricing panel updated successfully: ${id}`);

    return NextResponse.json({ 
      success: true, 
      message: "Pricing panel updated successfully",
      data: {
        _id: pricingPanel._id,
        pricingSerialNo: pricingPanel.pricingSerialNo
      }
    }, { status: 200 });

  } catch (error) {
    console.error("❌ PUT /pricing-panel error:", error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return NextResponse.json({ 
        success: false, 
        message: messages.join(', ') 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to update pricing panel"
    }, { status: 500 });
  }
}

/* ========================================
   GET /api/pricing-panel - Get Pricing Panels
======================================== */
export async function GET(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) {
    return NextResponse.json({ 
      success: false, 
      message: error 
    }, { status });
  }

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const format = url.searchParams.get("format");
    
    // ============ CASE 1: GET SINGLE PRICING PANEL BY ID ============
    if (id) {
      console.log(`📄 Fetching pricing panel by ID: ${id}`);
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ 
          success: false, 
          message: "Invalid pricing panel ID format" 
        }, { status: 400 });
      }
      
      const pricingPanel = await PricingPanel.findOne({
        _id: id,
        companyId: user.companyId
      }).lean();

      if (!pricingPanel) {
        return NextResponse.json({ 
          success: false, 
          message: "Pricing panel not found" 
        }, { status: 404 });
      }

      return NextResponse.json({ 
        success: true, 
        data: pricingPanel 
      }, { status: 200 });
    }
    
    // ============ CASE 2: TABLE FORMAT FOR REPORT ============
    if (format === 'table') {
      console.log("📋 Fetching pricing panels for table report");
      
      let query = { 
        companyId: user.companyId,
        status: 'Active'
      };

      // Apply filters from query params
      if (url.searchParams.get("search")) {
        const search = url.searchParams.get("search");
        query.$or = [
          { pricingSerialNo: { $regex: search, $options: 'i' } },
          { partyName: { $regex: search, $options: 'i' } },
          { branchName: { $regex: search, $options: 'i' } }
        ];
      }
      
      if (url.searchParams.get("pricingStatus")) {
        // This would need to be handled in reportRows
      }
      
      if (url.searchParams.get("approvalStatus")) {
        query['rateApproval.approvalStatus'] = url.searchParams.get("approvalStatus");
      }
      
      if (url.searchParams.get("fromDate")) {
        query.date = { $gte: new Date(url.searchParams.get("fromDate")) };
      }
      
      if (url.searchParams.get("toDate")) {
        query.date = { ...query.date, $lte: new Date(url.searchParams.get("toDate")) };
      }

      const pricingPanels = await PricingPanel.find(query)
        .sort({ date: -1, createdAt: -1 })
        .lean();

      console.log(`Found ${pricingPanels.length} pricing panels`);

      const formatDateDDMMYYYY = (date) => {
        if (!date) return '';
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
      };

      const getVNNNumber = async (vehicleNegotiationId) => {
        if (!vehicleNegotiationId) return null;
        try {
          const VehicleNegotiation = mongoose.models.VehicleNegotiation;
          if (VehicleNegotiation) {
            const vn = await VehicleNegotiation.findById(vehicleNegotiationId).select('vnnNo').lean();
            return vn?.vnnNo || null;
          }
        } catch (err) {
          console.error('Error fetching VNN:', err);
        }
        return null;
      };

      const tableData = [];
      
      for (const panel of pricingPanels) {
        const formattedDate = panel.date ? formatDateDDMMYYYY(panel.date) : '';
        
        if (panel.orders && panel.orders.length > 0) {
          for (const order of panel.orders) {
            const reportRow = panel.reportRows?.find(r => r.order === order.orderNo);
            
            let vnnNumber = null;
            if (order.vehicleNegotiationId) {
              vnnNumber = await getVNNNumber(order.vehicleNegotiationId);
            }
            
            tableData.push({
              panelId: panel._id.toString(),
              date: formattedDate,
              pricingSerialNo: panel.pricingSerialNo || '',
              vnn: vnnNumber || '-',
              orderNo: order.orderNo || '',
              partyName: order.partyName || panel.partyName || '',
              plantCode: order.plantName || '',
              orderType: order.orderType || '',
              pinCode: order.pinCode || '',
              taluka: order.talukaName || order.taluka || '-',
              state: order.stateName || '',
              district: order.districtName || '',
              from: order.fromName || '',
              to: order.toName || '',
              weight: order.weight || 0,
              pricing: reportRow?.pricing || panel.reportRows?.[0]?.pricing || 'Pending',
              approval: panel.rateApproval?.approvalStatus || 'Pending',
              branchName: panel.branchName || ''
            });
          }
        } else {
          tableData.push({
            panelId: panel._id.toString(),
            date: formattedDate,
            pricingSerialNo: panel.pricingSerialNo || '',
            vnn: '-',
            orderNo: '',
            partyName: panel.partyName || '',
            plantCode: '',
            orderType: '',
            pinCode: '',
            taluka: '-',
            state: '',
            district: '',
            from: '',
            to: '',
            weight: 0,
            pricing: panel.reportRows?.[0]?.pricing || 'Pending',
            approval: panel.rateApproval?.approvalStatus || 'Pending',
            branchName: panel.branchName || ''
          });
        }
      }

      return NextResponse.json({
        success: true,
        data: tableData,
        message: `Found ${tableData.length} order records`
      }, { status: 200 });
    }
    
    // ============ CASE 3: GET LIST OF PRICING PANELS ============
    console.log("📋 Fetching pricing panel list");
    
    const pricingPanels = await PricingPanel.find({ 
      companyId: user.companyId,
      status: 'Active'
    })
    .select('pricingSerialNo date branchName partyName totalWeight totalAmount rateApproval.approvalStatus orders')
    .sort({ createdAt: -1 })
    .lean();

    const formattedPanels = pricingPanels.map(panel => {
      const vnns = new Set();
      if (panel.orders && panel.orders.length > 0) {
        panel.orders.forEach(order => {
          if (order.vehicleNegotiationId) {
            vnns.add(order.vehicleNegotiationId.toString().slice(-6));
          }
        });
      }

      return {
        _id: panel._id,
        pricingSerialNo: panel.pricingSerialNo,
        date: panel.date ? new Date(panel.date).toISOString().split('T')[0] : '',
        branchName: panel.branchName || 'N/A',
        partyName: panel.partyName || 'N/A',
        totalWeight: panel.totalWeight || 0,
        totalAmount: panel.totalAmount || 0,
        approvalStatus: panel.rateApproval?.approvalStatus || 'Pending',
        vnnCount: vnns.size,
        vnnList: Array.from(vnns)
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedPanels
    }, { status: 200 });

  } catch (error) {
    console.error("❌ GET /pricing-panel error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to fetch pricing panels",
      error: error.message 
    }, { status: 500 });
  }
}

/* ========================================
   DELETE /api/pricing-panel - Delete Pricing Panel
======================================== */
export async function DELETE(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) {
    return NextResponse.json({ 
      success: false, 
      message: error 
    }, { status });
  }

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        message: "Pricing panel ID is required" 
      }, { status: 400 });
    }

    console.log(`🗑️ Deleting pricing panel: ${id}`);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid pricing panel ID format" 
      }, { status: 400 });
    }
    
    const pricingPanel = await PricingPanel.findOne({
      _id: id,
      companyId: user.companyId
    });

    if (!pricingPanel) {
      return NextResponse.json({ 
        success: false, 
        message: "Pricing panel not found" 
      }, { status: 404 });
    }

    const result = await PricingPanel.deleteOne({
      _id: id,
      companyId: user.companyId
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "Failed to delete pricing panel" 
      }, { status: 500 });
    }

    console.log(`✅ Pricing panel deleted successfully: ${id}`);

    return NextResponse.json({ 
      success: true, 
      message: "Pricing panel deleted successfully" 
    }, { status: 200 });

  } catch (error) {
    console.error("❌ DELETE /pricing-panel error:", error);
    
    if (error.name === 'CastError') {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid pricing panel ID format" 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to delete pricing panel"
    }, { status: 500 });
  }
}

//import { NextResponse } from "next/server";
//import connectDb from "@/lib/db";
//import PricingPanel from "./PricingPanel";
//import { getTokenFromHeader, verifyJWT } from "@/lib/auth";
//import { getNextPricingSerialNumber } from "./PricingCounter";
//import mongoose from 'mongoose';
//
//// ✅ Role-based access check
//function isAuthorized(user) {
//  return (
//    user?.type === "company" ||
//    user?.role === "Admin" ||
//    user?.permissions?.includes("pricing_panel")
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
//   POST /api/pricing-panel - Create New Pricing Panel
//======================================== */
//export async function POST(req) {
//  await connectDb();
//  const { user, error, status } = await validateUser(req);
//  if (error) return NextResponse.json({ success: false, message: error }, { status });
//
//  try {
//    const body = await req.json();
//    
//    console.log("📝 Creating new pricing panel:", JSON.stringify(body, null, 2));
//    
//    // ✅ Generate Pricing Serial Number
//    let pricingSerialNo = await getNextPricingSerialNumber(user.companyId);
//    
//    // Check if Pricing Serial Number already exists
//    const existing = await PricingPanel.findOne({ pricingSerialNo, companyId: user.companyId });
//    if (existing) {
//      pricingSerialNo = await getNextPricingSerialNumber(user.companyId);
//    }
//
//    // ✅ Handle branch - it could be an ID string or an object from frontend
//    let branchId = null;
//    let branchName = '';
//    let branchCode = '';
//    
//    if (body.header?.branch) {
//      // Check if branch is an object with _id or just a string
//      if (typeof body.header.branch === 'object') {
//        // It's an object (like from frontend)
//        branchId = body.header.branch._id || null;
//        branchName = body.header.branch.name || body.header.branchName || '';
//        branchCode = body.header.branch.code || body.header.branchCode || '';
//      } else {
//        // It's a string ID
//        branchId = body.header.branch;
//        
//        // Try to find branch details from the branches array
//        if (body.branches && Array.isArray(body.branches)) {
//          const branchFromArray = body.branches.find(b => b._id === branchId);
//          if (branchFromArray) {
//            branchName = branchFromArray.name || '';
//            branchCode = branchFromArray.code || '';
//          }
//        }
//      }
//    }
//
//    // ✅ Validate and process orders from the 'orders' array
//    const orders = [];
//    
//    if (body.orders && Array.isArray(body.orders)) {
//      console.log(`Processing ${body.orders.length} orders from frontend`);
//      
//      body.orders.forEach(order => {
//        // Skip empty rows
//        if (!order.orderNo || order.orderNo.trim() === "") {
//          console.log("Skipping empty order row");
//          return;
//        }
//        
//        const fromBranch = body.branches?.find(b => b._id === order.from);
//        const toBranch = body.branches?.find(b => b._id === order.to);
//        const plant = body.plants?.find(p => p._id === order.plantCode);
//        const country = body.countries?.find(c => c.code === order.country);
//        const state = body.states?.find(s => s._id === order.state);
//        const district = body.districts?.find(d => d._id === order.district);
//        
//        orders.push({
//          orderNo: order.orderNo,
//          orderPanelId: order.orderPanelId || null,
//          partyName: order.partyName || body.header?.partyName || '',
//          customerId: order.customerId || body.header?.customerId || null,
//          customerCode: order.customerCode || '',
//          contactPerson: order.contactPerson || '',
//          plantCode: order.plantCode || null,
//          plantName: order.plantName || (plant ? `${plant.name} (${plant.code})` : ''),
//          plantCodeValue: order.plantCodeValue || '',
//          orderType: order.orderType || 'Sales',
//          pinCode: order.pinCode || '',
//          country: order.country || '',
//          countryName: country?.name || order.countryName || '',
//          state: order.state || '',
//          stateName: state ? `${state.name} (${state.code})` : order.stateName || '',
//          district: order.district || '',
//          districtName: district ? `${district.name} (${district.code})` : order.districtName || '',
//          from: order.from || null,
//          fromName: fromBranch ? `${fromBranch.name} (${fromBranch.code})` : order.fromName || '',
//          to: order.to || null,
//          toName: toBranch ? `${toBranch.name} (${toBranch.code})` : order.toName || '',
//          locationRate: parseFloat(order.locationRate) || 0,
//          priceList: order.priceList || '',
//          weight: parseFloat(order.weight) || 0,
//          rate: parseFloat(order.rate) || 0,
//          totalAmount: (parseFloat(order.weight) || 0) * (parseFloat(order.rate) || 0)
//        });
//      });
//    }
//    
//    // ✅ Check if we have at least one valid order
//    if (orders.length === 0) {
//      return NextResponse.json({ 
//        success: false, 
//        message: "At least one valid order is required" 
//      }, { status: 400 });
//    }
//
//    // ✅ Calculate totals
//    const totalAmount = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
//    const totalWeight = orders.reduce((sum, order) => sum + (order.weight || 0), 0);
//
//    // ✅ Handle customerId
//    let customerId = null;
//    if (body.header?.customerId) {
//      if (typeof body.header.customerId === 'object' && body.header.customerId._id) {
//        customerId = new mongoose.Types.ObjectId(body.header.customerId._id);
//      } else if (typeof body.header.customerId === 'string' && 
//                 body.header.customerId.trim() !== '' && 
//                 mongoose.Types.ObjectId.isValid(body.header.customerId)) {
//        customerId = new mongoose.Types.ObjectId(body.header.customerId);
//      }
//    }
//
//    // ✅ Create pricing report rows
//    const reportRows = orders.map(order => ({
//      date: body.header?.date ? new Date(body.header.date) : new Date(),
//      pricingSerialNo: pricingSerialNo,
//      order: order.orderNo,
//      partyName: order.partyName || '-',
//      plantCode: order.plantName || '-',
//      orderType: order.orderType || 'Sales',
//      pinCode: order.pinCode || '-',
//      state: order.stateName || '-',
//      district: order.districtName || '-',
//      from: order.fromName || '-',
//      to: order.toName || '-',
//      weight: order.weight || 0,
//      pricing: 'Pending',
//      approval: body.rateApproval?.approvalStatus || 'Pending'
//    }));
//
//    // ✅ Handle billing charges - convert to appropriate types
//    const cancellationCharges = typeof body.billing?.cancellationCharges === 'number' 
//      ? body.billing.cancellationCharges.toString() 
//      : (body.billing?.cancellationCharges || 'Nil');
//      
//    const loadingCharges = typeof body.billing?.loadingCharges === 'number'
//      ? body.billing.loadingCharges.toString()
//      : (body.billing?.loadingCharges || 'Nil');
//      
//    const otherCharges = typeof body.billing?.otherCharges === 'number'
//      ? body.billing.otherCharges.toString()
//      : (body.billing?.otherCharges || 'Nil');
//
//    // ✅ Create new pricing panel document
//    const newPricingPanel = new PricingPanel({
//      pricingSerialNo,
//      branch: branchId,
//      branchName: branchName || body.header?.branchName || '',
//      branchCode: branchCode || body.header?.branchCode || '',
//      delivery: body.header?.delivery || 'Normal',
//      date: body.header?.date ? new Date(body.header.date) : new Date(),
//      customerId,
//      partyName: body.header?.partyName || '',
//      
//      // Billing Information
//      billingType: body.billing?.billingType || 'Multi - Order',
//      loadingPoints: parseInt(body.billing?.loadingPoints) || 1,
//      dropPoints: parseInt(body.billing?.dropPoints) || 1,
//      collectionCharges: parseFloat(body.billing?.collectionCharges) || 0,
//      cancellationCharges: cancellationCharges,
//      loadingCharges: loadingCharges,
//      otherCharges: otherCharges,
//      
//      // Orders
//      orders: orders,
//      totalWeight,
//      totalAmount,
//      
//      // Rate Approval
//      rateApproval: {
//        approvalType: body.rateApproval?.approvalType || 'Contract Rates',
//        uploadFile: body.rateApproval?.uploadFile || '',
//        approvalStatus: body.rateApproval?.approvalStatus || 'Pending'
//      },
//      
//      // Report Data
//      reportRows,
//      
//      // Company & User Tracking
//      companyId: user.companyId,
//      createdBy: user.id,
//      panelStatus: 'Draft',
//      status: 'Active'
//    });
//
//    await newPricingPanel.save();
//
//    // ✅ Find saved pricing panel with populated data
//    const savedPricingPanel = await PricingPanel.findById(newPricingPanel._id)
//      .populate('branch', 'name code')
//      .populate('orders.plantCode', 'name code')
//      .populate('orders.from', 'name code')
//      .populate('orders.to', 'name code')
//      .lean();
//
//    return NextResponse.json({ 
//      success: true, 
//      message: "Pricing panel created successfully",
//      data: savedPricingPanel 
//    }, { status: 201 });
//  } catch (error) {
//    console.error("POST /pricing-panel error:", error);
//    
//    if (error.code === 11000) {
//      return NextResponse.json({ 
//        success: false, 
//        message: "Pricing serial number already exists" 
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
//        message: `Invalid ${error.path} format: ${error.value}` 
//      }, { status: 400 });
//    }
//    
//    return NextResponse.json({ 
//      success: false, 
//      message: "Failed to create pricing panel" 
//    }, { status: 500 });
//  }
//}
//// Add this to your existing GET method in pricing-panel route.js
//
//export async function GET(req) {
//  await connectDb();
//  const { user, error, status } = await validateUser(req);
//  if (error) {
//    return NextResponse.json({ 
//      success: false, 
//      message: error 
//    }, { status });
//  }
//
//  try {
//    const url = new URL(req.url);
//    const id = url.searchParams.get("id");
//    const pricingSerialNo = url.searchParams.get("pricingSerialNo");
//    const action = url.searchParams.get("action");
//    
//    // ============ CASE 1: GET SINGLE PRICING PANEL BY SERIAL NUMBER WITH ORDER DETAILS ============
//    if (pricingSerialNo && action === 'getOrderDetails') {
//      console.log(`📄 Fetching pricing panel: ${pricingSerialNo} with order details`);
//      
//      // Find pricing panel by serial number
//      const pricingPanel = await PricingPanel.findOne({
//        pricingSerialNo,
//        companyId: user.companyId,
//        status: 'Active'
//      }).lean();
//
//      if (!pricingPanel) {
//        return NextResponse.json({ 
//          success: false, 
//          message: "Pricing panel not found" 
//        }, { status: 404 });
//      }
//
//      // Get order numbers from pricing panel
//      const orderNos = pricingPanel.orders.map(order => order.orderNo);
//      
//      // Fetch corresponding order panels to get pack data
//      const OrderPanel = mongoose.models.OrderPanel;
//      const orderPanels = await OrderPanel.find({
//        orderPanelNo: { $in: orderNos },
//        companyId: user.companyId
//      }).lean();
//
//      // Create a map of orderNo to packData
//      const packDataMap = {};
//      orderPanels.forEach(orderPanel => {
//        packDataMap[orderPanel.orderPanelNo] = orderPanel.packData;
//      });
//
//      // Format the response
//      const formattedData = {
//        header: {
//          pricingSerialNo: pricingPanel.pricingSerialNo,
//          branch: pricingPanel.branch,
//          branchName: pricingPanel.branchName,
//          branchCode: pricingPanel.branchCode,
//          delivery: pricingPanel.delivery,
//          date: pricingPanel.date ? new Date(pricingPanel.date).toISOString().split('T')[0] : '',
//          customerId: pricingPanel.customerId,
//          partyName: pricingPanel.partyName,
//        },
//        billing: {
//          billingType: pricingPanel.billingType || 'Multi - Order',
//          loadingPoints: pricingPanel.loadingPoints || 1,
//          dropPoints: pricingPanel.dropPoints || 1,
//          collectionCharges: pricingPanel.collectionCharges || 0,
//          cancellationCharges: pricingPanel.cancellationCharges || 'Nil',
//          loadingCharges: pricingPanel.loadingCharges || 'Nil',
//          otherCharges: pricingPanel.otherCharges || 'Nil',
//        },
//        orders: pricingPanel.orders.map(order => ({
//          _id: order._id,
//          orderNo: order.orderNo,
//          partyName: order.partyName,
//          customerId: order.customerId,
//          customerCode: order.customerCode,
//          contactPerson: order.contactPerson,
//          plantCode: order.plantCode,
//          plantName: order.plantName,
//          orderType: order.orderType,
//          pinCode: order.pinCode,
//          country: order.country,
//          countryName: order.countryName,
//          state: order.state,
//          stateName: order.stateName,
//          district: order.district,
//          districtName: order.districtName,
//          from: order.from,
//          fromName: order.fromName,
//          to: order.to,
//          toName: order.toName,
//          locationRate: order.locationRate || 0,
//          priceList: order.priceList || '',
//          weight: order.weight || 0,
//          rate: order.rate || 0,
//          totalAmount: order.totalAmount || 0,
//          // Include pack data from order panel
//          packData: packDataMap[order.orderNo] || {
//            PALLETIZATION: [],
//            'UNIFORM - BAGS/BOXES': [],
//            'LOOSE - CARGO': []
//          }
//        })),
//        totalWeight: pricingPanel.totalWeight || 0,
//        totalAmount: pricingPanel.totalAmount || 0,
//        rateApproval: pricingPanel.rateApproval || {
//          approvalType: 'Contract Rates',
//          approvalStatus: 'Pending'
//        },
//        reportRows: pricingPanel.reportRows || []
//      };
//
//      return NextResponse.json({ 
//        success: true, 
//        data: formattedData 
//      }, { status: 200 });
//    }
//    
//    // ============ CASE 2: GET SINGLE PRICING PANEL BY ID ============
//    if (id) {
//      console.log(`📄 Fetching pricing panel by ID: ${id}`);
//      
//      if (!mongoose.Types.ObjectId.isValid(id)) {
//        return NextResponse.json({ 
//          success: false, 
//          message: "Invalid pricing panel ID format" 
//        }, { status: 400 });
//      }
//      
//      const pricingPanel = await PricingPanel.findOne({
//        _id: id,
//        companyId: user.companyId
//      }).lean();
//
//      if (!pricingPanel) {
//        return NextResponse.json({ 
//          success: false, 
//          message: "Pricing panel not found" 
//        }, { status: 404 });
//      }
//
//      return NextResponse.json({ 
//        success: true, 
//        data: pricingPanel 
//      }, { status: 200 });
//    }
//    
//    // ============ CASE 3: GET LIST OF PRICING PANELS FOR DROPDOWN ============
//    console.log("📋 Fetching pricing panel list for dropdown");
//    
//    const pricingPanels = await PricingPanel.find({ 
//      companyId: user.companyId,
//      status: 'Active'
//    })
//    .select('pricingSerialNo date branchName partyName totalWeight totalAmount')
//    .sort({ createdAt: -1 })
//    .lean();
//
//    const formattedPanels = pricingPanels.map(panel => ({
//      _id: panel._id,
//      pricingSerialNo: panel.pricingSerialNo,
//      date: panel.date ? new Date(panel.date).toISOString().split('T')[0] : '',
//      branchName: panel.branchName || 'N/A',
//      partyName: panel.partyName || 'N/A',
//      totalWeight: panel.totalWeight || 0,
//      totalAmount: panel.totalAmount || 0
//    }));
//
//    return NextResponse.json({
//      success: true,
//      data: formattedPanels
//    }, { status: 200 });
//
//  } catch (error) {
//    console.error("❌ GET /pricing-panel error:", error);
//    return NextResponse.json({ 
//      success: false, 
//      message: "Failed to fetch pricing panels",
//      error: error.message 
//    }, { status: 500 });
//  }
//}