import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import OrderPanel from "./OrderPanel";
import OrderPanelCounter from "./OrderCounter";
import mongoose from 'mongoose';
import { getTokenFromHeader, verifyJWT } from "@/lib/auth";
import { getNextOrderPanelNumber } from "./OrderCounter";

// ✅ Helper function to convert to number
function num(value) {
  if (value === null || value === undefined || value === '') return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

// ✅ Role-based access check
function isAuthorized(user) {
  return (
    user?.type === "company" ||
    user?.role === "Admin" ||
    user?.permissions?.includes("order_panel")
  );
}

// ✅ Validate user from JWT token
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

// Helper function to calculate pending days
function calculatePendingDays(orderDate, status) {
  if (!orderDate || status === 'Completed' || status === 'Cancelled' || status === 'Draft') return '0 Days';
  
  const created = new Date(orderDate);
  const now = new Date();
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return `${diffDays} Days`;
}

/* ========================================
   GET /api/order-panel 
   - With ID: Returns SINGLE order with COMPLETE details
   - With table=true: Returns FLATTENED list for table display
   - Without params: Returns LIST of orders (summary only)
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
    const isTable = url.searchParams.get("table") === "true";
    
    // ============ CASE 1: GET SINGLE ORDER WITH FULL DETAILS ============
    if (id) {
      console.log(`📄 Fetching single order panel: ${id}`);
      
      // Validate ID format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ 
          success: false, 
          message: "Invalid order panel ID format" 
        }, { status: 400 });
      }
      
      const orderPanel = await OrderPanel.findOne({
        _id: id,
        companyId: user.companyId
      }).lean();

      if (!orderPanel) {
        return NextResponse.json({ 
          success: false, 
          message: "Order panel not found" 
        }, { status: 404 });
      }

      // Format single order panel with all details
      const formattedOrder = {
        _id: orderPanel._id,
        orderPanelNo: orderPanel.orderPanelNo || 'N/A',
        date: orderPanel.date ? new Date(orderPanel.date).toISOString() : '',
        branchName: orderPanel.branchName || 'N/A',
        branchCode: orderPanel.branchCode || '',
        customerName: orderPanel.customerName || 'N/A',
        partyName: orderPanel.partyName || orderPanel.customerName || 'N/A',
        totalWeight: orderPanel.totalWeight || 0,
        panelStatus: orderPanel.panelStatus || 'Draft',
        delivery: orderPanel.delivery || 'Normal',
        plantRows: orderPanel.plantRows || [],
        collectionCharges: orderPanel.collectionCharges || 0,
        cancellationCharges: orderPanel.cancellationCharges || 'Nil',
        loadingCharges: orderPanel.loadingCharges || 'Nil',
        otherCharges: orderPanel.otherCharges || 0,
        customerId: orderPanel.customerId,
        customerCode: orderPanel.customerCode || '',
        contactPerson: orderPanel.contactPerson || '',
        branch: orderPanel.branch,
        packData: orderPanel.packData || {}
      };

      return NextResponse.json({ 
        success: true, 
        data: formattedOrder 
      }, { status: 200 });
    }
    
    // ============ CASE 2: GET FLATTENED DATA FOR TABLE VIEW ============
    if (isTable) {
      console.log("📋 Fetching flattened order panel data for table");
      
      // Build query - only get orders for this company
      let query = { companyId: user.companyId };
      
      // Get all order panels with all fields needed for table
      const orderPanels = await OrderPanel.find(query)
        .sort({ createdAt: -1 })
        .select('orderPanelNo date branchName branchCode customerName partyName totalWeight panelStatus createdAt plantRows delivery collectionCharges cancellationCharges loadingCharges otherCharges')
        .lean();

      // Flatten the data - create one row per plant row
      const flattenedRows = [];
      
      orderPanels.forEach(order => {
        // If order has plantRows, create a row for each plant
        if (order.plantRows && order.plantRows.length > 0) {
          order.plantRows.forEach((row, index) => {
           // In the GET function, when creating flattenedRows for table view:

flattenedRows.push({
  _id: `${order._id}-${index}`,
  originalOrderId: order._id,
  originalRowId: row._id,
  date: order.date ? new Date(order.date).toISOString().split('T')[0] : '',
  orderNo: order.orderPanelNo || 'N/A',
  branchName: order.branchName || 'N/A',
  branchCode: order.branchCode || '',
  partyName: order.partyName || order.customerName || 'N/A',
  customerName: order.customerName || 'N/A',
  
  // Plant-specific fields from plantRows
  plantCode: row.plantCodeValue || row.plantCode || 'N/A',
  plantName: row.plantName || '',
  orderType: row.orderType || 'Sales',
  pinCode: row.pinCode || '',
  from: row.fromName || row.from || '',
  to: row.toName || row.to || '',
  // TALUKA FIELDS - add these
  taluka: row.talukaName || row.taluka || '',
  district: row.districtName || row.district || '',
  state: row.stateName || row.state || '',
  country: row.countryName || row.country || '',
  weight: row.weight || 0,
  status: row.status || 'Open',
  
  // Order-level fields
  delivery: order.delivery || 'Normal',
  panelStatus: order.panelStatus || 'Draft',
  collectionCharges: order.collectionCharges || 0,
  cancellationCharges: order.cancellationCharges || 'Nil',
  loadingCharges: order.loadingCharges || 'Nil',
  otherCharges: order.otherCharges || 0,
  
  // Metadata
  pendingSince: calculatePendingDays(order.date, row.status),
  placement: 'Pending'
});
          });
        } else {
          // If no plantRows, create a single row with default values
          flattenedRows.push({
            _id: order._id,
            originalOrderId: order._id,
            date: order.date ? new Date(order.date).toISOString().split('T')[0] : '',
            orderNo: order.orderPanelNo || 'N/A',
            branchName: order.branchName || 'N/A',
            branchCode: order.branchCode || '',
            partyName: order.partyName || order.customerName || 'N/A',
            customerName: order.customerName || 'N/A',
            
            // Default plant values
            plantCode: 'N/A',
            plantName: 'N/A',
            orderType: 'Sales',
            pinCode: 'N/A',
            from: 'N/A',
            to: 'N/A',
            district: 'N/A',
            state: 'N/A',
            country: 'N/A',
            weight: order.totalWeight || 0,
            status: order.panelStatus || 'Draft',
            
            // Order-level fields
            delivery: order.delivery || 'Normal',
            panelStatus: order.panelStatus || 'Draft',
            collectionCharges: order.collectionCharges || 0,
            cancellationCharges: order.cancellationCharges || 'Nil',
            loadingCharges: order.loadingCharges || 'Nil',
            otherCharges: order.otherCharges || 0,
            
            // Metadata
            pendingSince: calculatePendingDays(order.date, order.panelStatus),
            placement: 'Pending'
          });
        }
      });

      console.log(`✅ Found ${flattenedRows.length} flattened rows`);

      return NextResponse.json({
        success: true,
        data: flattenedRows
      }, { status: 200 });
    }
    
    // ============ CASE 3: GET LIST OF ORDERS (SUMMARY ONLY) ============
    console.log("📋 Fetching order panel list for company:", user.companyId);
    
    // Build query - only get orders for this company
    let query = { companyId: user.companyId };
    
    const orderPanels = await OrderPanel.find(query)
      .sort({ createdAt: -1 })
      .select('orderPanelNo date branchName branchCode customerName partyName totalWeight panelStatus createdAt plantRows delivery')
      .lean();

    // Format each order for list view - use stored strings
    const formattedOrders = orderPanels.map(order => ({
      _id: order._id,
      orderPanelNo: order.orderPanelNo || 'N/A',
      date: order.date ? new Date(order.date).toISOString().split('T')[0] : '',
      branch: order.branchName || 'N/A',
      branchCode: order.branchCode || '',
      customerName: order.customerName || 'N/A',
      partyName: order.partyName || order.customerName || 'N/A',
      totalWeight: order.totalWeight || 0,
      panelStatus: order.panelStatus || 'Draft',
      createdAt: order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : ''
    }));

    console.log(`✅ Found ${formattedOrders.length} orders`);

    return NextResponse.json({
      success: true,
      data: formattedOrders
    }, { status: 200 });

  } catch (error) {
    console.error("❌ GET /order-panel error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to fetch order panels",
      error: error.message 
    }, { status: 500 });
  }
}

/* ========================================
   POST /api/order-panel - Create New Order Panel - FIXED
======================================== */
export async function POST(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) {
    return NextResponse.json({ success: false, message: error }, { status });
  }

  try {
    const body = await req.json();
    
    console.log("📝 Creating new order panel");
    
    // Generate order panel number
    let orderPanelNo = await getNextOrderPanelNumber(user.companyId);
    
    // Check if order panel number already exists
    const existingOrderPanel = await OrderPanel.findOne({ 
      orderPanelNo, 
      companyId: user.companyId 
    });
    
    if (existingOrderPanel) {
      orderPanelNo = `OP-${Date.now().toString().slice(-6)}`;
    }

    // Get branch details
    let branchName = '';
    let branchCode = '';
    if (body.branchName) {
      branchName = body.branchName;
      branchCode = body.branchCode || '';
    }

  

// Process plantRows - FIXED to handle taluka fields properly
const processedPlantRows = (body.plantRows || []).map((row) => {
  const weight = num(row.weight);
  const rate = num(row.rate);
  
  // Handle 'from' field - should be ObjectId or null
  let fromField = null;
  if (row.from && mongoose.Types.ObjectId.isValid(row.from)) {
    fromField = new mongoose.Types.ObjectId(row.from);
  }
  
  // Handle 'to' field - should be ObjectId or null
  let toField = null;
  if (row.to && mongoose.Types.ObjectId.isValid(row.to)) {
    toField = new mongoose.Types.ObjectId(row.to);
  }
  
  return {
    _id: new mongoose.Types.ObjectId(),
    plantCode: row.plantCode || '',
    plantName: row.plantName || '',
    plantCodeValue: row.plantCodeValue || '',
    orderType: row.orderType || "Sales",
    pinCode: row.pinCode || "",
    from: fromField,
    fromName: row.fromName || '',
    to: toField,
    toName: row.toName || '',
    // TALUKA FIELDS - properly mapped
    taluka: row.taluka || "",
    talukaName: row.talukaName || row.taluka || '',
    district: row.district || "",
    districtName: row.districtName || row.district || '',
    state: row.state || "",
    stateName: row.stateName || row.state || '',
    country: row.country || "",
    countryName: row.countryName || row.country || '',
    weight,
    status: row.status || "Open",
    rate: rate,
    locationRate: num(row.locationRate),
    totalAmount: weight * rate
  };
});
    // Calculate totals
    const totalWeight = processedPlantRows.reduce((sum, row) => sum + row.weight, 0);
    const totalAmount = processedPlantRows.reduce((sum, row) => sum + row.totalAmount, 0);

    // Handle customerId
    let customerId = null;
    if (body.customerId && body.customerId.trim() !== '') {
      if (mongoose.Types.ObjectId.isValid(body.customerId)) {
        customerId = new mongoose.Types.ObjectId(body.customerId);
      } else {
        customerId = body.customerId;
      }
    }

    // Process packData
    const processPackData = (packData) => {
      const result = {
        PALLETIZATION: [],
        'UNIFORM - BAGS/BOXES': [],
        'LOOSE - CARGO': []
      };

      if (!packData) return result;

      // Process PALLETIZATION
      if (packData.PALLETIZATION && Array.isArray(packData.PALLETIZATION)) {
        result.PALLETIZATION = packData.PALLETIZATION.map(item => ({
          _id: new mongoose.Types.ObjectId(),
          noOfPallets: num(item.noOfPallets),
          unitPerPallets: num(item.unitPerPallets),
          totalPkgs: num(item.totalPkgs),
          pkgsType: item.pkgsType || '',
          uom: item.uom || '',
          skuSize: item.skuSize || '',
          packWeight: num(item.packWeight),
          productName: item.productName || '',
          wtLtr: num(item.wtLtr),
          actualWt: num(item.actualWt),
          chargedWt: num(item.chargedWt),
          wtUom: item.wtUom || ''
        }));
      }

      // Process UNIFORM - BAGS/BOXES
      if (packData['UNIFORM - BAGS/BOXES'] && Array.isArray(packData['UNIFORM - BAGS/BOXES'])) {
        result['UNIFORM - BAGS/BOXES'] = packData['UNIFORM - BAGS/BOXES'].map(item => ({
          _id: new mongoose.Types.ObjectId(),
          totalPkgs: num(item.totalPkgs),
          pkgsType: item.pkgsType || '',
          uom: item.uom || '',
          skuSize: item.skuSize || '',
          packWeight: num(item.packWeight),
          productName: item.productName || '',
          wtLtr: num(item.wtLtr),
          actualWt: num(item.actualWt),
          chargedWt: num(item.chargedWt),
          wtUom: item.wtUom || ''
        }));
      }

      // Process LOOSE - CARGO
      if (packData['LOOSE - CARGO'] && Array.isArray(packData['LOOSE - CARGO'])) {
        result['LOOSE - CARGO'] = packData['LOOSE - CARGO'].map(item => ({
          _id: new mongoose.Types.ObjectId(),
          uom: item.uom || '',
          productName: item.productName || '',
          actualWt: num(item.actualWt),
          chargedWt: num(item.chargedWt)
        }));
      }

      return result;
    };

    // Create the order panel document
    const orderPanelData = {
      orderPanelNo,
      branch: body.branch || null,
      branchName: branchName || body.branchName || '',
      branchCode: branchCode || body.branchCode || '',
      delivery: body.delivery || 'Normal',
      date: body.date ? new Date(body.date) : new Date(),
      customerId,
      customerCode: body.customerCode || '',
      customerName: body.customerName || '',
      contactPerson: body.contactPerson || '',
      partyName: body.partyName || '',
      collectionCharges: num(body.collectionCharges),
      cancellationCharges: body.cancellationCharges || 'Nil',
      loadingCharges: body.loadingCharges || 'Nil',
      otherCharges: num(body.otherCharges),
      plantRows: processedPlantRows,
      packData: processPackData(body.packData),
      totalWeight,
      totalAmount,
      companyId: new mongoose.Types.ObjectId(user.companyId),
      createdBy: new mongoose.Types.ObjectId(user.id),
      panelStatus: 'Draft'
    };

    // Create and save the order panel
    const newOrderPanel = new OrderPanel(orderPanelData);
    const savedOrderPanel = await newOrderPanel.save();
    
    console.log("✅ Order panel saved successfully, ID:", savedOrderPanel._id);

    return NextResponse.json({ 
      success: true, 
      message: "Order panel created successfully",
      data: {
        _id: savedOrderPanel._id,
        orderPanelNo: savedOrderPanel.orderPanelNo
      }
    }, { status: 201 });

  } catch (error) {
    console.error("❌ POST /order-panel error:", error);
    
    if (error.code === 11000) {
      return NextResponse.json({ 
        success: false, 
        message: "Order panel number already exists. Please try again." 
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
      message: `Failed to create order panel: ${error.message}` 
    }, { status: 500 });
  }
}

/* ========================================
   PUT /api/order-panel - Update Order Panel - FIXED
======================================== */
export async function PUT(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) {
    return NextResponse.json({ success: false, message: error }, { status });
  }

  try {
    const body = await req.json();
    const { id } = body;
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        message: "Order panel ID is required" 
      }, { status: 400 });
    }

    console.log(`📝 Updating order panel: ${id}`);
    
    // Find the order panel
    const orderPanel = await OrderPanel.findOne({
      _id: id,
      companyId: user.companyId
    });

    if (!orderPanel) {
      return NextResponse.json({ 
        success: false, 
        message: "Order panel not found" 
      }, { status: 404 });
    }

    // Update fields
    if (body.branchName) orderPanel.branchName = body.branchName;
    if (body.branchCode) orderPanel.branchCode = body.branchCode;
    if (body.delivery) orderPanel.delivery = body.delivery;
    if (body.date) orderPanel.date = new Date(body.date);
    if (body.customerName) orderPanel.customerName = body.customerName;
    if (body.partyName) orderPanel.partyName = body.partyName;
    if (body.collectionCharges !== undefined) orderPanel.collectionCharges = num(body.collectionCharges);
    if (body.cancellationCharges !== undefined) orderPanel.cancellationCharges = body.cancellationCharges;
    if (body.loadingCharges !== undefined) orderPanel.loadingCharges = body.loadingCharges;
    if (body.otherCharges !== undefined) orderPanel.otherCharges = num(body.otherCharges);
    if (body.panelStatus) orderPanel.panelStatus = body.panelStatus;

    // Update plantRows if provided - FIXED to handle null values
    if (body.plantRows && Array.isArray(body.plantRows)) {
     // In the PUT function, update the processedPlantRows section:

const processedPlantRows = body.plantRows.map((row) => {
  const weight = num(row.weight);
  const rate = num(row.rate);
  
  // Handle 'from' field - should be ObjectId or null
  let fromField = null;
  if (row.from && mongoose.Types.ObjectId.isValid(row.from)) {
    fromField = new mongoose.Types.ObjectId(row.from);
  }
  
  // Handle 'to' field - should be ObjectId or null
  let toField = null;
  if (row.to && mongoose.Types.ObjectId.isValid(row.to)) {
    toField = new mongoose.Types.ObjectId(row.to);
  }
  
  return {
    _id: row._id ? (mongoose.Types.ObjectId.isValid(row._id) ? new mongoose.Types.ObjectId(row._id) : new mongoose.Types.ObjectId()) : new mongoose.Types.ObjectId(),
    plantCode: row.plantCode || '',
    plantName: row.plantName || '',
    plantCodeValue: row.plantCodeValue || '',
    orderType: row.orderType || "Sales",
    pinCode: row.pinCode || "",
    from: fromField,
    fromName: row.fromName || '',
    to: toField,
    toName: row.toName || '',
    // TALUKA FIELDS - properly mapped
    taluka: row.taluka || "",
    talukaName: row.talukaName || row.taluka || '',
    district: row.district || "",
    districtName: row.districtName || row.district || '',
    state: row.state || "",
    stateName: row.stateName || row.state || '',
    country: row.country || "",
    countryName: row.countryName || row.country || '',
    weight,
    status: row.status || "Open",
    rate: rate,
    locationRate: num(row.locationRate),
    totalAmount: weight * rate
  };
});
      
      orderPanel.plantRows = processedPlantRows;
      
      // Recalculate totals
      orderPanel.totalWeight = processedPlantRows.reduce((sum, row) => sum + row.weight, 0);
      orderPanel.totalAmount = processedPlantRows.reduce((sum, row) => sum + row.totalAmount, 0);
    }

    // Save the updated order panel
    await orderPanel.save();
    
    console.log("✅ Order panel updated successfully");

    return NextResponse.json({ 
      success: true, 
      message: "Order panel updated successfully",
      data: {
        _id: orderPanel._id,
        orderPanelNo: orderPanel.orderPanelNo
      }
    }, { status: 200 });

  } catch (error) {
    console.error("❌ PUT /order-panel error:", error);
    return NextResponse.json({ 
      success: false, 
      message: `Failed to update order panel: ${error.message}` 
    }, { status: 500 });
  }
}

/* ========================================
   DELETE /api/order-panel - Delete Order Panel
======================================== */
export async function DELETE(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) {
    return NextResponse.json({ success: false, message: error }, { status });
  }

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        message: "Order panel ID is required" 
      }, { status: 400 });
    }

    console.log(`🗑️ Deleting order panel: ${id}`);
    
    // Delete the order panel
    const result = await OrderPanel.deleteOne({
      _id: id,
      companyId: user.companyId
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "Order panel not found" 
      }, { status: 404 });
    }

    console.log("✅ Order panel deleted successfully");

    return NextResponse.json({ 
      success: true, 
      message: "Order panel deleted successfully" 
    }, { status: 200 });

  } catch (error) {
    console.error("❌ DELETE /order-panel error:", error);
    return NextResponse.json({ 
      success: false, 
      message: `Failed to delete order panel: ${error.message}` 
    }, { status: 500 });
  }
}