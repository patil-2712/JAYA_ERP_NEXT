import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import mongoose from "mongoose";
import { getTokenFromHeader, verifyJWT } from "@/lib/auth";

// Saved Report Schema
const savedReportSchema = new mongoose.Schema({
  reportId: { type: String, required: true, unique: true },
  type: { type: String, required: true }, // product-wise, general, detention, cancellation, other
  filters: { type: Object, required: true },
  data: { type: Array, required: true },
  summary: { type: Object, required: true },
  totalRecords: { type: Number, default: 0 },
  selectedRecords: { type: Number, default: 0 },
  generatedAt: { type: Date, default: Date.now },
  generatedBy: { type: String, default: "" },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "CompanyUser" }
});

const SavedReport = mongoose.models.SavedReport || mongoose.model("SavedReport", savedReportSchema);

// GET - Fetch saved reports
export async function GET(req) {
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
    
    const url = new URL(req.url);
    const type = url.searchParams.get("type");
    
    let query = { companyId: user.companyId };
    if (type) query.type = type;
    
    const reports = await SavedReport.find(query).sort({ generatedAt: -1 }).lean();
    
    return NextResponse.json({ success: true, data: reports }, { status: 200 });
    
  } catch (error) {
    console.error("Error fetching saved reports:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST - Save a new report
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
    const { reportId, type, filters, data, summary, totalRecords, selectedRecords } = body;
    
    const savedReport = new SavedReport({
      reportId: reportId || `RPT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      filters,
      data,
      summary,
      totalRecords,
      selectedRecords,
      generatedBy: user.email || user.name || "Admin",
      companyId: user.companyId,
      createdBy: user.id
    });
    
    await savedReport.save();
    
    return NextResponse.json({ 
      success: true, 
      message: "Report saved successfully",
      data: savedReport 
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error saving report:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE - Delete a saved report
export async function DELETE(req) {
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
    
    const url = new URL(req.url);
    const reportId = url.searchParams.get("reportId");
    
    if (!reportId) {
      return NextResponse.json({ success: false, message: "Report ID required" }, { status: 400 });
    }
    
    await SavedReport.deleteOne({ reportId, companyId: user.companyId });
    
    return NextResponse.json({ success: true, message: "Report deleted successfully" }, { status: 200 });
    
  } catch (error) {
    console.error("Error deleting report:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}