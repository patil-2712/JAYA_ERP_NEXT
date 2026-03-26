import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import LoadingPanel from "./LoadingPanel";
import { getNextLoadingNumber } from "./LoadingCounter";
import mongoose from 'mongoose';
import { getTokenFromHeader, verifyJWT } from "@/lib/auth";

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
    user?.permissions?.includes("loading_panel")
  );
}

// Validate user from JWT token
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
   GET /api/loading-panel 
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
    const vehicleArrivalNo = url.searchParams.get("vehicleArrivalNo");
    const format = url.searchParams.get("format");
    const search = url.searchParams.get("search");
    const fromDate = url.searchParams.get("fromDate");
    const toDate = url.searchParams.get("toDate");
    
    // ============ CASE 1: GET SINGLE LOADING PANEL ============
    if (id || vehicleArrivalNo) {
      console.log(`📄 Fetching loading panel: ${id || vehicleArrivalNo}`);
      
      let query = { companyId: user.companyId };
      
      if (id && mongoose.Types.ObjectId.isValid(id)) {
        query._id = id;
      } else if (vehicleArrivalNo) {
        query.vehicleArrivalNo = vehicleArrivalNo;
      } else {
        return NextResponse.json({ 
          success: false, 
          message: "Invalid ID format" 
        }, { status: 400 });
      }
      
      const loadingPanel = await LoadingPanel.findOne(query).lean();

      if (!loadingPanel) {
        return NextResponse.json({ 
          success: false, 
          message: "Loading panel not found" 
        }, { status: 404 });
      }

      // Format dates for frontend
      const formattedPanel = {
        ...loadingPanel,
        date: loadingPanel.date ? new Date(loadingPanel.date).toISOString().split('T')[0] : '',
        arrivalDetails: {
          ...loadingPanel.arrivalDetails,
          date: loadingPanel.arrivalDetails?.date ? 
            new Date(loadingPanel.arrivalDetails.date).toISOString().split('T')[0] : ''
        }
      };

      return NextResponse.json({ 
        success: true, 
        data: formattedPanel 
      }, { status: 200 });
    }
    
    // ============ CASE 2: GET LIST OF LOADING PANELS ============
    console.log("📋 Fetching loading panel list");
    
    // Build query with filters
    let query = { companyId: user.companyId };
    
    // Add search filter
    if (search) {
      query.$or = [
        { vehicleArrivalNo: { $regex: search, $options: 'i' } },
        { vehicleNegotiationNo: { $regex: search, $options: 'i' } },
        { 'vehicleInfo.vehicleNo': { $regex: search, $options: 'i' } },
        { 'vehicleInfo.driverMobileNo': { $regex: search, $options: 'i' } },
        { 'vehicleInfo.driverName': { $regex: search, $options: 'i' } },
        { branchName: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add date filters
    if (fromDate || toDate) {
      query.date = {};
      if (fromDate) {
        query.date.$gte = new Date(fromDate);
      }
      if (toDate) {
        query.date.$lte = new Date(toDate + 'T23:59:59');
      }
    }
    
    const loadingPanels = await LoadingPanel.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Check if this is for the table report format
    if (format === 'table') {
      const formattedPanels = loadingPanels.map(panel => {
        return {
          _id: panel._id,
          date: panel.date ? new Date(panel.date).toISOString().split('T')[0] : '',
          vehicleArrivalNo: panel.vehicleArrivalNo || 'N/A',
          vehicleNegotiationNo: panel.vehicleNegotiationNo || 'N/A',
          branch: panel.branchName || panel.branchCode || 'N/A',
          vehicleNo: panel.vehicleInfo?.vehicleNo || 'N/A',
          driverNo: panel.vehicleInfo?.driverMobileNo || 'N/A',
          supervisorName: panel.vehicleInfo?.driverName || 'N/A',
          totalWeight: panel.totalWeight || 0,
          
          // Show actual approval values
          vbpStatus: panel.vbpUploads?.approval || 'Not Set',
          vbpApproval: panel.vbpUploads?.approval || 'Not Set',
          vbpRemark: panel.vbpUploads?.remark || '',
          
          vftStatus: panel.vftUploads?.approval || 'Not Set',
          vftApproval: panel.vftUploads?.approval || 'Not Set',
          
          vlStatus: panel.vlUploads?.approval || 'Not Set',
          vlApproval: panel.vlUploads?.approval || 'Not Set',
          vlLoadingStatus: panel.vlUploads?.loadingStatus || 'Not Set',
          
          votStatus: panel.votUploads?.approval || 'Not Set',
          votApproval: panel.votUploads?.approval || 'Not Set',
          
          weighmentApproval: panel.loadedWeighment?.approval || 'Not Set',
          
          // Document fields
          consignmentNote: panel.consignmentNote || '',
          invoice: panel.invoice || '',
          ewaybill: panel.ewaybill || '',
          
          panelStatus: panel.panelStatus || 'Draft'
        };
      });

      return NextResponse.json({
        success: true,
        data: formattedPanels
      }, { status: 200 });
    }

    // Default format (simple list)
    const formattedPanels = loadingPanels.map(panel => ({
      _id: panel._id,
      vehicleArrivalNo: panel.vehicleArrivalNo || 'N/A',
      vehicleNegotiationNo: panel.vehicleNegotiationNo || 'N/A',
      branchName: panel.branchName || 'N/A',
      vehicleNo: panel.vehicleInfo?.vehicleNo || 'N/A',
      totalWeight: panel.totalWeight || 0,
      panelStatus: panel.panelStatus || 'Draft',
      createdAt: panel.createdAt ? new Date(panel.createdAt).toISOString().split('T')[0] : ''
    }));

    return NextResponse.json({
      success: true,
      data: formattedPanels
    }, { status: 200 });

  } catch (error) {
    console.error("❌ GET /loading-panel error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to fetch loading panels",
      error: error.message 
    }, { status: 500 });
  }
}

/* ========================================
   POST /api/loading-panel - Create New Loading Panel
======================================== */
export async function POST(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) {
    return NextResponse.json({ success: false, message: error }, { status });
  }

  try {
    const body = await req.json();
    
    console.log("📝 Creating new loading panel");
    
    // Generate vehicle arrival number
    let vehicleArrivalNo = await getNextLoadingNumber(user.companyId);
    
    // Check if vehicle arrival number already exists
    const existing = await LoadingPanel.findOne({ 
      vehicleArrivalNo, 
      companyId: user.companyId 
    });
    
    if (existing) {
      vehicleArrivalNo = `LD-${Date.now().toString().slice(-8)}`;
    }

    // Process order rows
    const processedOrderRows = (body.orderRows || []).map(row => ({
      _id: new mongoose.Types.ObjectId(),
      orderNo: row.orderNo || '',
      partyName: row.partyName || '',
      plantCode: row.plantCode || '',
      plantName: row.plantName || '',
      orderType: row.orderType || '',
      pinCode: row.pinCode || '',
      state: row.state || '',
      district: row.district || '',
      from: row.from || '',
      to: row.to || '',
      weight: num(row.weight)
    }));

    // Process pack data
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
          wtUom: item.wtUom || '',
          isUniform: item.isUniform || false
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

    // Process deduction rows
    const processedDeductionRows = (body.deductionRows || []).map(row => ({
      _id: new mongoose.Types.ObjectId(),
      description: row.description || '',
      amount: num(row.amount)
    }));

    // Calculate totals
    const totalWeight = processedOrderRows.reduce((sum, row) => sum + row.weight, 0);
    const totalActualWeight = body.totalActualWeight || 0;
    const totalCharges = body.totalCharges || 0;

    // Handle branch ID
    let branchId = null;
    if (body.header?.branch) {
      if (mongoose.Types.ObjectId.isValid(body.header.branch)) {
        branchId = new mongoose.Types.ObjectId(body.header.branch);
      }
    }

    // Create loading panel document
    const loadingPanelData = {
      vehicleArrivalNo,
      vehicleNegotiationNo: body.vehicleNegotiationNo || body.header?.vehicleNegotiationNo || '',
      
      // Header
      branch: branchId,
      branchName: body.header?.branchName || '',
      branchCode: body.header?.branchCode || '',
      date: body.header?.date ? new Date(body.header.date) : new Date(),
      delivery: body.header?.delivery || 'Normal',
      
      // Billing
      billingType: body.header?.billingType || 'Multi - Order',
      noOfLoadingPoints: parseInt(body.header?.noOfLoadingPoints) || 0,
      noOfDroppingPoint: parseInt(body.header?.noOfDroppingPoint) || 0,
      collectionCharges: body.header?.collectionCharges || '',
      cancellationCharges: body.header?.cancellationCharges || '',
      loadingCharges: body.header?.loadingCharges || '',
      otherCharges: body.header?.otherCharges || '',
      
      // Orders
      orderRows: processedOrderRows,
      
      // Vehicle Info
      vehicleInfo: {
        vehicleNo: body.vehicleInfo?.vehicleNo || '',
        driverMobileNo: body.vehicleInfo?.driverMobileNo || '',
        driverName: body.vehicleInfo?.driverName || '',
        drivingLicense: body.vehicleInfo?.drivingLicense || '',
        vehicleWeight: num(body.vehicleInfo?.vehicleWeight),
        vehicleOwnerName: body.vehicleInfo?.vehicleOwnerName || '',
        vehicleOwnerRC: body.vehicleInfo?.vehicleOwnerRC || '',
        ownerPanCard: body.vehicleInfo?.ownerPanCard || '',
        verified: body.vehicleInfo?.verified || false,
        vehicleType: body.vehicleInfo?.vehicleType || '',
        message: body.vehicleInfo?.message || '',
        remarks: body.vehicleInfo?.remarks || '',
        vehicleId: body.vehicleInfo?.vehicleId || '',
        insuranceNumber: body.vehicleInfo?.insuranceNumber || '',
        chasisNumber: body.vehicleInfo?.chasisNumber || '',
        fitnessNumber: body.vehicleInfo?.fitnessNumber || '',
        pucNumber: body.vehicleInfo?.pucNumber || '',
        
        // File paths
        rcDocument: body.vehicleInfo?.rcDocument || '',
        panDocument: body.vehicleInfo?.panDocument || '',
        licenseDocument: body.vehicleInfo?.licenseDocument || '',
        driverPhoto: body.vehicleInfo?.driverPhoto || ''
      },
      
      // Pack Data
      packData: processPackData(body.packData),
      activePack: body.activePack || 'PALLETIZATION',
      
      // Deductions
      deductionRows: processedDeductionRows,
      totalQuantity: body.totalQuantity || '',
      
      // Upload sections
      vbpUploads: body.vbpUploads || { approval: '', remark: '' },
      vftUploads: body.vftUploads || { approval: '' },
      votUploads: body.votUploads || { approval: '' },
      vlUploads: body.vlUploads || { approval: '', loadingStatus: '' },
      
      // Loaded weighment
      loadedWeighment: {
        weighSlip: body.loadedWeighment?.weighSlip || '',
        approval: body.loadedWeighment?.approval || '',
        loadingCharges: num(body.loadedWeighment?.loadingCharges),
        loadingStaffMunshiyana: num(body.loadedWeighment?.loadingStaffMunshiyana),
        otherExpenses: num(body.loadedWeighment?.otherExpenses),
        vehicleFloorTarpaulin: num(body.loadedWeighment?.vehicleFloorTarpaulin),
        vehicleOuterTarpaulin: num(body.loadedWeighment?.vehicleOuterTarpaulin)
      },
      
      // GPS Tracking
      gpsTracking: {
        driverMobileNumber: body.gpsTracking?.driverMobileNumber || '',
        isTrackingActive: body.gpsTracking?.isTrackingActive || false
      },
      
      // Arrival details
      arrivalDetails: {
        date: body.arrivalDetails?.date ? new Date(body.arrivalDetails.date) : null,
        time: body.arrivalDetails?.time || ''
      },
      
      // Totals
      totalWeight,
      totalActualWeight,
      totalCharges,
      
      // Document fields
      consignmentNote: body.consignmentNote || '',
      invoice: body.invoice || '',
      ewaybill: body.ewaybill || '',
      
      // Company & User
      companyId: new mongoose.Types.ObjectId(user.companyId),
      createdBy: new mongoose.Types.ObjectId(user.id),
      panelStatus: 'Draft'
    };

    // Create and save
    const newLoadingPanel = new LoadingPanel(loadingPanelData);
    const savedPanel = await newLoadingPanel.save();
    
    console.log("✅ Loading panel saved successfully, ID:", savedPanel._id);

    return NextResponse.json({ 
      success: true, 
      message: "Loading panel created successfully",
      data: {
        _id: savedPanel._id,
        vehicleArrivalNo: savedPanel.vehicleArrivalNo
      }
    }, { status: 201 });

  } catch (error) {
    console.error("❌ POST /loading-panel error:", error);
    
    if (error.code === 11000) {
      return NextResponse.json({ 
        success: false, 
        message: "Vehicle arrival number already exists. Please try again." 
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
      message: `Failed to create loading panel: ${error.message}` 
    }, { status: 500 });
  }
}

/* ========================================
   PUT /api/loading-panel - Update Loading Panel
======================================== */
export async function PUT(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) {
    return NextResponse.json({ success: false, message: error }, { status });
  }

  try {
    const body = await req.json();
    const { id, ...updateData } = body;
    
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        message: "Valid ID is required" 
      }, { status: 400 });
    }

    // Check if loading panel exists and belongs to company
    const existingPanel = await LoadingPanel.findOne({
      _id: id,
      companyId: user.companyId
    });

    if (!existingPanel) {
      return NextResponse.json({ 
        success: false, 
        message: "Loading panel not found" 
      }, { status: 404 });
    }

    // Process order rows if present
    if (updateData.orderRows) {
      updateData.orderRows = updateData.orderRows.map(row => ({
        _id: row._id && mongoose.Types.ObjectId.isValid(row._id) 
          ? new mongoose.Types.ObjectId(row._id) 
          : new mongoose.Types.ObjectId(),
        orderNo: row.orderNo || '',
        partyName: row.partyName || '',
        plantCode: row.plantCode || '',
        plantName: row.plantName || '',
        orderType: row.orderType || '',
        pinCode: row.pinCode || '',
        state: row.state || '',
        district: row.district || '',
        from: row.from || '',
        to: row.to || '',
        weight: num(row.weight)
      }));

      // Recalculate total weight
      updateData.totalWeight = updateData.orderRows.reduce((sum, row) => sum + row.weight, 0);
    }

    // Remove _id from update data if present
    delete updateData._id;
    delete updateData.__v;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    updateData.updatedAt = new Date();

    const updatedPanel = await LoadingPanel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return NextResponse.json({ 
      success: true, 
      message: "Loading panel updated successfully",
      data: {
        _id: updatedPanel._id,
        vehicleArrivalNo: updatedPanel.vehicleArrivalNo
      }
    }, { status: 200 });

  } catch (error) {
    console.error("❌ PUT /loading-panel error:", error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return NextResponse.json({ 
        success: false, 
        message: messages.join(', ') 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: false, 
      message: `Failed to update loading panel: ${error.message}` 
    }, { status: 500 });
  }
}

/* ========================================
   DELETE /api/loading-panel - Delete Loading Panel
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
    
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        message: "Valid ID is required" 
      }, { status: 400 });
    }

    const deletedPanel = await LoadingPanel.findOneAndDelete({
      _id: id,
      companyId: user.companyId
    });

    if (!deletedPanel) {
      return NextResponse.json({ 
        success: false, 
        message: "Loading panel not found" 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Loading panel deleted successfully" 
    }, { status: 200 });

  } catch (error) {
    console.error("❌ DELETE /loading-panel error:", error);
    return NextResponse.json({ 
      success: false, 
      message: `Failed to delete loading panel: ${error.message}` 
    }, { status: 500 });
  }
}