import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import ConsignmentNote from "./ConsignmentNote";
import { getTokenFromHeader, verifyJWT } from "@/lib/auth";
import { getNextLRNumber } from "./ConsignmentCounter";
import mongoose from 'mongoose';

// Helper function to convert to number
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
    user?.permissions?.includes("consignment_note")
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
   GET /api/consignment-note - Get All Consignment Notes
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
    const lrNo = url.searchParams.get("lrNo");
    const format = url.searchParams.get("format");
    const search = url.searchParams.get("search");
    const fromDate = url.searchParams.get("fromDate");
    const toDate = url.searchParams.get("toDate");
    const statusFilter = url.searchParams.get("status");

    // ============ CASE 1: GET SINGLE BY ID ============
    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ 
          success: false, 
          message: "Invalid consignment note ID format" 
        }, { status: 400 });
      }

      const note = await ConsignmentNote.findOne({
        _id: id,
        companyId: user.companyId
      }).lean();

      if (!note) {
        return NextResponse.json({ 
          success: false, 
          message: "Consignment note not found" 
        }, { status: 404 });
      }

      return NextResponse.json({ 
        success: true, 
        data: note 
      }, { status: 200 });
    }

    // ============ CASE 2: GET SINGLE BY LR NUMBER ============
    if (lrNo) {
      const note = await ConsignmentNote.findOne({
        lrNo: lrNo,
        companyId: user.companyId
      }).lean();

      if (!note) {
        return NextResponse.json({ 
          success: false, 
          message: "Consignment note not found" 
        }, { status: 404 });
      }

      return NextResponse.json({ 
        success: true, 
        data: note 
      }, { status: 200 });
    }

    // ============ CASE 3: CHECK IF LOADING INFO IS USED ============
    const loadingInfoNo = url.searchParams.get("loadingInfoNo");
    if (loadingInfoNo) {
      const existing = await ConsignmentNote.findOne({
        loadingInfoNo: loadingInfoNo,
        companyId: user.companyId
      }).select('lrNo').lean();

      return NextResponse.json({
        success: true,
        isUsed: !!existing,
        usedIn: existing?.lrNo || null
      }, { status: 200 });
    }

    // ============ CASE 4: TABLE FORMAT FOR LIST VIEW ============
    if (format === 'table') {
      let query = { companyId: user.companyId };

      // Search filter
      if (search) {
        query.$or = [
          { lrNo: { $regex: search, $options: 'i' } },
          { loadingInfoNo: { $regex: search, $options: 'i' } },
          { vnnNo: { $regex: search, $options: 'i' } },
          { 'header.partyName': { $regex: search, $options: 'i' } },
          { 'header.orderNo': { $regex: search, $options: 'i' } },
          { 'header.vendorName': { $regex: search, $options: 'i' } },
          { 'header.vehicleNo': { $regex: search, $options: 'i' } }
        ];
      }

      // Status filter
      if (statusFilter) {
        query['header.status'] = statusFilter;
      }

      // Date range filter
      if (fromDate || toDate) {
        query.createdAt = {};
        if (fromDate) {
          query.createdAt.$gte = new Date(fromDate);
        }
        if (toDate) {
          query.createdAt.$lte = new Date(toDate + 'T23:59:59');
        }
      }

      const notes = await ConsignmentNote.find(query)
        .sort({ createdAt: -1 })
        .lean();

      const tableData = notes.map(note => ({
        _id: note._id,
        date: note.createdAt ? new Date(note.createdAt).toLocaleDateString('en-GB').replace(/\//g, '.') : '',
        lrNo: note.lrNo || 'N/A',
        loadingInfoNo: note.loadingInfoNo || '',
        vnnNo: note.vnnNo || '',
        partyName: note.header?.partyName || 'N/A',
        orderNo: note.header?.orderNo || 'N/A',
        vendorName: note.header?.vendorName || 'N/A',
        vendorCode: note.header?.vendorCode || 'N/A',
        from: note.header?.from || 'N/A',
        to: note.header?.to || 'N/A',
        vehicleNo: note.header?.vehicleNo || 'N/A',
        totalWeight: note.totalWeight || 0,
        unit: note.header?.unit || 'MT',
        status: note.header?.status || 'Draft'
      }));

      return NextResponse.json({
        success: true,
        data: tableData,
        count: tableData.length
      }, { status: 200 });
    }

    // ============ CASE 5: LIST FOR DROPDOWNS ============
    const notes = await ConsignmentNote.find({ 
      companyId: user.companyId 
    })
    .select('lrNo loadingInfoNo vnnNo header.partyName header.orderNo header.status')
    .sort({ createdAt: -1 })
    .lean();

    return NextResponse.json({
      success: true,
      data: notes
    }, { status: 200 });

  } catch (error) {
    console.error("❌ GET /consignment-note error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to fetch consignment notes"
    }, { status: 500 });
  }
}

/* ========================================
   POST /api/consignment-note - Create New
======================================== */
export async function POST(req) {
  try {
    await connectDb();
    const { user, error, status } = await validateUser(req);
    if (error) {
      return NextResponse.json({ success: false, message: error }, { status });
    }

    const body = await req.json();
    
    console.log("📝 Creating new consignment note");

    // Generate LR number if not provided
    let lrNo = body.header?.lrNo || await getNextLRNumber(user.companyId);

    // Check if loadingInfoNo is already used
    if (body.loadingInfoNo) {
      const existing = await ConsignmentNote.findOne({
        loadingInfoNo: body.loadingInfoNo,
        companyId: user.companyId
      });
      
      if (existing) {
        return NextResponse.json({ 
          success: false, 
          message: `Loading Info ${body.loadingInfoNo} is already used in consignment note ${existing.lrNo}` 
        }, { status: 400 });
      }
    }

    // Process product rows
    const processedProductRows = (body.productRows || []).map(row => ({
      _id: new mongoose.Types.ObjectId(),
      totalPkgs: row.totalPkgs || '',
      pkgsType: row.pkgsType || '',
      uom: row.uom || '',
      packSize: row.packSize || '',
      skuSize: row.skuSize || '',
      productName: row.productName || '',
      wtLtr: parseFloat(row.wtLtr) || 0,
      actualWt: parseFloat(row.actualWt) || 0,
      chargedWt: parseFloat(row.chargedWt) || 0,
      wtUom: row.wtUom || 'MT'
    }));

    // Calculate total weight
    const totalWeight = processedProductRows.reduce((sum, row) => 
      sum + (parseFloat(row.actualWt) || 0), 0
    );

    // Create consignment note
    const consignmentNote = new ConsignmentNote({
      lrNo,
      vnnNo: body.vnnNo || '',
      vehicleNegotiationId: body.vehicleNegotiationId || null,
      loadingInfoNo: body.loadingInfoNo || '',
     // In the POST function, when creating the consignment note:
header: {
  partyName: body.header?.partyName || '',
  orderNo: body.header?.orderNo || '',
  orderType: body.header?.orderType || 'Sales',
  plantCode: body.header?.plantCode || '',
  plantName: body.header?.plantName || '',
  hiredOwned: body.header?.hiredOwned || 'Hired',
  vendorCode: body.header?.vendorCode || '',
  vendorName: body.header?.vendorName || '',
  from: body.header?.from || '',
  to: body.header?.to || '',
  district: body.header?.district || '',
  state: body.header?.state || '',
  vehicleNo: body.header?.vehicleNo || '',
  partyNo: body.header?.partyNo || '',
  lrDate: body.header?.lrDate || '',
  unit: body.header?.unit || 'MT',
  status: body.header?.status || 'Pending' // ✅ Ensure 'Pending' is used
},
      consignor: {
        name: body.consignor?.name || '',
        address: body.consignor?.address || ''
      },
      consignee: {
        name: body.consignee?.name || '',
        address: body.consignee?.address || ''
      },
      invoice: {
        boeInvoice: body.invoice?.boeInvoice || 'As Per Invoice',
        boeInvoiceNo: body.invoice?.boeInvoiceNo || '',
        boeInvoiceDate: body.invoice?.boeInvoiceDate || '',
        invoiceValue: body.invoice?.invoiceValue || ''
      },
      ewaybill: {
        ewaybillNo: body.ewaybill?.ewaybillNo || '',
        expiryDate: body.ewaybill?.expiryDate || '',
        containerNo: body.ewaybill?.containerNo || ''
      },
      productRows: processedProductRows,
      totalWeight,
      companyId: user.companyId,
      createdBy: user.id
    });

    await consignmentNote.save();

    return NextResponse.json({ 
      success: true, 
      message: "Consignment note created successfully",
      data: {
        _id: consignmentNote._id,
        lrNo: consignmentNote.lrNo,
        loadingInfoNo: consignmentNote.loadingInfoNo
      }
    }, { status: 201 });

  } catch (error) {
    console.error("❌ POST /consignment-note error:", error);

    if (error.code === 11000) {
      return NextResponse.json({ 
        success: false, 
        message: "LR number already exists" 
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
      message: error.message || "Failed to create consignment note"
    }, { status: 500 });
  }
}

/* ========================================
   PUT /api/consignment-note - Update
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
        message: "Consignment note ID is required" 
      }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid consignment note ID format" 
      }, { status: 400 });
    }

    const note = await ConsignmentNote.findOne({
      _id: id,
      companyId: user.companyId
    });

    if (!note) {
      return NextResponse.json({ 
        success: false, 
        message: "Consignment note not found" 
      }, { status: 404 });
    }

    // Check if loadingInfoNo is being changed and if new one is already used
    if (body.loadingInfoNo && body.loadingInfoNo !== note.loadingInfoNo) {
      const existing = await ConsignmentNote.findOne({
        loadingInfoNo: body.loadingInfoNo,
        companyId: user.companyId,
        _id: { $ne: id } // Exclude current note
      });
      
      if (existing) {
        return NextResponse.json({ 
          success: false, 
          message: `Loading Info ${body.loadingInfoNo} is already used in consignment note ${existing.lrNo}` 
        }, { status: 400 });
      }
    }

    // Update reference fields
    if (body.vnnNo !== undefined) note.vnnNo = body.vnnNo;
    if (body.vehicleNegotiationId) note.vehicleNegotiationId = body.vehicleNegotiationId;
    if (body.loadingInfoNo !== undefined) note.loadingInfoNo = body.loadingInfoNo;

    // Update header
    if (body.header) {
      note.header = {
        ...note.header,
        ...body.header
      };
    }

    // Update consignor
    if (body.consignor) {
      note.consignor = {
        ...note.consignor,
        ...body.consignor
      };
    }

    // Update consignee
    if (body.consignee) {
      note.consignee = {
        ...note.consignee,
        ...body.consignee
      };
    }

    // Update invoice
    if (body.invoice) {
      note.invoice = {
        ...note.invoice,
        ...body.invoice
      };
    }

    // Update ewaybill
    if (body.ewaybill) {
      note.ewaybill = {
        ...note.ewaybill,
        ...body.ewaybill
      };
    }

    // Update product rows
    if (body.productRows) {
      note.productRows = body.productRows.map(row => ({
        _id: row._id && mongoose.Types.ObjectId.isValid(row._id) 
          ? new mongoose.Types.ObjectId(row._id) 
          : new mongoose.Types.ObjectId(),
        totalPkgs: row.totalPkgs || '',
        pkgsType: row.pkgsType || '',
        uom: row.uom || '',
        packSize: row.packSize || '',
        skuSize: row.skuSize || '',
        productName: row.productName || '',
        wtLtr: parseFloat(row.wtLtr) || 0,
        actualWt: parseFloat(row.actualWt) || 0,
        chargedWt: parseFloat(row.chargedWt) || 0,
        wtUom: row.wtUom || 'MT'
      }));

      // Recalculate total weight
      note.totalWeight = note.productRows.reduce((sum, row) => 
        sum + (parseFloat(row.actualWt) || 0), 0
      );
    }

    note.updatedAt = Date.now();
    await note.save();

    return NextResponse.json({ 
      success: true, 
      message: "Consignment note updated successfully",
      data: {
        _id: note._id,
        lrNo: note.lrNo,
        loadingInfoNo: note.loadingInfoNo
      }
    }, { status: 200 });

  } catch (error) {
    console.error("❌ PUT /consignment-note error:", error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return NextResponse.json({ 
        success: false, 
        message: messages.join(', ') 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to update consignment note"
    }, { status: 500 });
  }
}

/* ========================================
   DELETE /api/consignment-note - Delete
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
        message: "Consignment note ID is required" 
      }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid consignment note ID format" 
      }, { status: 400 });
    }

    // Find the note first to check if it exists
    const note = await ConsignmentNote.findOne({
      _id: id,
      companyId: user.companyId
    });

    if (!note) {
      return NextResponse.json({ 
        success: false, 
        message: "Consignment note not found" 
      }, { status: 404 });
    }

    // Optional: Add validation - don't delete approved/completed notes
    if (note.header?.status === 'Approved' || note.header?.status === 'Completed') {
      return NextResponse.json({ 
        success: false, 
        message: `Cannot delete ${note.header.status} consignment note` 
      }, { status: 400 });
    }

    // Delete the note
    await ConsignmentNote.deleteOne({
      _id: id,
      companyId: user.companyId
    });

    console.log(`✅ Consignment note deleted: ${note.lrNo}`);

    return NextResponse.json({ 
      success: true, 
      message: "Consignment note deleted successfully",
      data: {
        lrNo: note.lrNo,
        loadingInfoNo: note.loadingInfoNo
      }
    }, { status: 200 });

  } catch (error) {
    console.error("❌ DELETE /consignment-note error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to delete consignment note"
    }, { status: 500 });
  }
}