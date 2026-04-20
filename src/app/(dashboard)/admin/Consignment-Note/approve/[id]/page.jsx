"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

/** =========================
 * CONSTANTS
 ========================= */
const ORDER_TYPES = ["Sales", "STO Order", "Export", "Import"];
const HIRED_OWNED_OPTIONS = ["Hired", "Owned"];
const UNIT_OPTIONS = ["MT", "KG", "LTR", "TON", "M3", "PCS"];
const PKGS_TYPE_OPTIONS = ["Drum", "Boxes", "Bags", "Cartons", "Crates", "Pallets", "Box"];
const UOM_OPTIONS = ["KG", "LTR", "TON", "M3", "PCS", "Kgs", "Ltr", "MT"];
const BOE_INVOICE_OPTIONS = ["As Per Invoice", "As Per Bill Of Entry", "NA"];
const STATUS_OPTIONS = ["Pending", "Approved", "Rejected", "Completed", "Draft"];

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/* =======================
  UI COMPONENTS
========================= */
function Card({ title, right, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm mb-4">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="text-sm font-extrabold text-slate-900">{title}</div>
        {right || null}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Input({ label, value, col = "", type = "text", readOnly = false }) {
  return (
    <div className={col}>
      <label className="text-xs font-bold text-slate-600">{label}</label>
      <input
        type={type}
        value={value || ""}
        readOnly={readOnly}
        className={`mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ${
          readOnly ? 'bg-slate-50 cursor-not-allowed' : 'bg-white focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200'
        }`}
      />
    </div>
  );
}

function Select({ label, value, onChange, options = [], col = "", readOnly = false }) {
  return (
    <div className={col}>
      <label className="text-xs font-bold text-slate-600">{label}</label>
      <select
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={readOnly}
        className={`mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ${
          readOnly ? 'bg-slate-50 cursor-not-allowed' : 'bg-white focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200'
        }`}
      >
        <option value="">Select {label}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center py-2 border-b border-slate-100">
      <span className="text-xs font-bold text-slate-600 w-1/3">{label}</span>
      <span className="text-sm text-slate-800 w-2/3">{value || '-'}</span>
    </div>
  );
}

/* =======================
  PACK DATA TABLES (READ-ONLY)
========================= */
function PalletizationTable({ rows }) {
  if (!rows || rows.length === 0 || (rows.length === 1 && !rows[0].noOfPallets && !rows[0].productName)) {
    return <div className="text-center py-4 text-slate-400">No palletization data available</div>;
  }

  return (
    <div className="overflow-auto rounded-xl border border-yellow-300">
      <table className="min-w-full w-full text-sm">
        <thead className="sticky top-0 bg-yellow-400">
          <tr>
            <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">NO OF PALLETS</th>
            <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">UNIT PER PALLETS</th>
            <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">TOTAL PKGS</th>
            <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">PKG TYPE</th>
            <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">UOM</th>
            <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">SKU - SIZE</th>
            <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">PACK - WEIGHT</th>
            <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">PRODUCT NAME</th>
            <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">ACTUAL - WT</th>
            <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">CHARGED - WT</th>
            <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">WT UOM</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row._id || index} className="hover:bg-yellow-50 even:bg-slate-50">
              <td className="border border-yellow-300 px-2 py-2 text-slate-700 text-center">{row.noOfPallets || '-'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700 text-center">{row.unitPerPallets || '-'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700 text-center">{row.totalPkgs || '-'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700 text-center">{row.pkgsType || '-'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700 text-center">{row.uom || '-'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700 text-center">{row.skuSize || '-'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700 text-center">{row.packWeight || '-'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.productName || '-'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700 text-right">{row.actualWt || '0'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700 text-right">{row.chargedWt || '0'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700 text-center">{row.wtUom || 'MT'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UniformTable({ rows }) {
  if (!rows || rows.length === 0 || (rows.length === 1 && !rows[0].totalPkgs && !rows[0].productName)) {
    return <div className="text-center py-4 text-slate-400">No uniform data available</div>;
  }

  return (
    <div className="overflow-auto rounded-xl border border-yellow-300">
      <table className="min-w-full w-full text-sm">
        <thead className="sticky top-0 bg-yellow-400">
          <tr>
            <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">TOTAL PKGS</th>
            <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">PKG TYPE</th>
            <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">UOM</th>
            <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">SKU - SIZE</th>
            <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">PACK - WEIGHT</th>
            <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">PRODUCT NAME</th>
            <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">ACTUAL - WT</th>
            <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">CHARGED - WT</th>
            <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">WT UOM</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row._id || index} className="hover:bg-yellow-50 even:bg-slate-50">
              <td className="border border-yellow-300 px-2 py-2 text-slate-700 text-center">{row.totalPkgs || '-'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700 text-center">{row.pkgsType || '-'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700 text-center">{row.uom || '-'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700 text-center">{row.skuSize || '-'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700 text-center">{row.packWeight || '-'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.productName || '-'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700 text-right">{row.actualWt || '0'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700 text-right">{row.chargedWt || '0'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700 text-center">{row.wtUom || 'MT'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LooseCargoTable({ rows }) {
  if (!rows || rows.length === 0 || (rows.length === 1 && !rows[0].actualWt && !rows[0].productName)) {
    return <div className="text-center py-4 text-slate-400">No loose cargo data available</div>;
  }

  return (
    <div className="overflow-auto rounded-xl border border-yellow-300">
      <table className="min-w-full w-full text-sm">
        <thead className="sticky top-0 bg-yellow-400">
          <tr>
            <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">UOM</th>
            <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">PRODUCT NAME</th>
            <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">ACTUAL - WT</th>
            <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">CHARGED - WT</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row._id || index} className="hover:bg-yellow-50 even:bg-slate-50">
              <td className="border border-yellow-300 px-2 py-2 text-slate-700 text-center">{row.uom || '-'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.productName || '-'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700 text-right">{row.actualWt || '0'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700 text-right">{row.chargedWt || '0'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function NonUniformTable({ rows }) {
  if (!rows || rows.length === 0 || (rows.length === 1 && !rows[0].nos && !rows[0].productName)) {
    return <div className="text-center py-4 text-slate-400">No non-uniform cargo data available</div>;
  }

  return (
    <div className="overflow-auto rounded-xl border border-yellow-300">
      <table className="min-w-full w-full text-sm">
        <thead className="sticky top-0 bg-yellow-400">
          <tr>
            <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">NOS</th>
            <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">PRODUCT NAME</th>
            <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">UOM</th>
            <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">LENGTH</th>
            <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">WIDTH</th>
            <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">HEIGHT</th>
            <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">ACTUAL - WT</th>
            <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">CHARGED - WT</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row._id || index} className="hover:bg-yellow-50 even:bg-slate-50">
              <td className="border border-yellow-300 px-2 py-2 text-slate-700 text-center">{row.nos || '-'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.productName || '-'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700 text-center">{row.uom || '-'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700 text-center">{row.length || '-'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700 text-center">{row.width || '-'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700 text-center">{row.height || '-'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700 text-right">{row.actualWt || '0'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700 text-right">{row.chargedWt || '0'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* =======================
  MAIN APPROVE PAGE
========================= */
export default function ApproveConsignmentNote() {
  const router = useRouter();
  const params = useParams();
  const noteId = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // State for all data (READ-ONLY except status)
  const [header, setHeader] = useState({
    partyName: "",
    orderNo: "",
    orderType: "Sales",
    plantCode: "",
    plantName: "",
    hiredOwned: "Hired",
    vendorCode: "",
    vendorName: "",
    from: "",
    to: "",
    taluka: "",
    district: "",
    state: "",
    vehicleNo: "",
    partyNo: "",
    lrNo: "",
    lrDate: "",
    unit: "MT",
    status: "Pending"
  });

  const [consignor, setConsignor] = useState({
    name: "",
    address: "",
    customerId: "",
    selectedAddressTitle: ""
  });

  const [consignee, setConsignee] = useState({
    name: "",
    address: "",
    customerId: "",
    selectedAddressTitle: ""
  });

  const [invoice, setInvoice] = useState({
    boeInvoice: "As Per Invoice",
    boeInvoiceNo: "",
    boeInvoiceDate: "",
    invoiceValue: "",
  });

  const [ewaybill, setEwaybill] = useState({
    ewaybillNo: "",
    expiryDate: "",
    containerNo: "",
  });

  // Pack data states
  const [palletizationRows, setPalletizationRows] = useState([]);
  const [uniformRows, setUniformRows] = useState([]);
  const [looseCargoRows, setLooseCargoRows] = useState([]);
  const [nonUniformRows, setNonUniformRows] = useState([]);
  
  const [loadingInfoNo, setLoadingInfoNo] = useState("");
  const [vnnNo, setVnnNo] = useState("");
  const [vehicleNegotiationId, setVehicleNegotiationId] = useState("");

  // Fetch consignment note data
  useEffect(() => {
    if (noteId) {
      fetchConsignmentNote();
    }
  }, [noteId]);

  const fetchConsignmentNote = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch(`/api/consignment-note?id=${noteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch consignment note');
      }

      const note = data.data;
      console.log("📦 Consignment Note Data for Approval:", note);
      
      // Set reference fields
      if (note.vnnNo) setVnnNo(note.vnnNo);
      if (note.vehicleNegotiationId) setVehicleNegotiationId(note.vehicleNegotiationId);
      if (note.loadingInfoNo) setLoadingInfoNo(note.loadingInfoNo);
      
      // Set header data (STATUS IS EDITABLE, others read-only)
      setHeader({
        partyName: note.header?.partyName || "",
        orderNo: note.header?.orderNo || "",
        orderType: note.header?.orderType || "Sales",
        plantCode: note.header?.plantCode || "",
        plantName: note.header?.plantName || "",
        hiredOwned: note.header?.hiredOwned || "Hired",
        vendorCode: note.header?.vendorCode || "",
        vendorName: note.header?.vendorName || "",
        from: note.header?.from || "",
        to: note.header?.to || "",
        taluka: note.header?.taluka || "",
        district: note.header?.district || "",
        state: note.header?.state || "",
        vehicleNo: note.header?.vehicleNo || "",
        partyNo: note.header?.partyNo || "",
        lrNo: note.lrNo || "",
        lrDate: note.header?.lrDate || "",
        unit: note.header?.unit || "MT",
        status: note.header?.status || "Pending"
      });

      // Set consignor (READ-ONLY)
      setConsignor({
        name: note.consignor?.name || "",
        address: note.consignor?.address || "",
        customerId: note.consignor?.customerId || "",
        selectedAddressTitle: note.consignor?.selectedAddressTitle || ""
      });

      // Set consignee (READ-ONLY)
      setConsignee({
        name: note.consignee?.name || "",
        address: note.consignee?.address || "",
        customerId: note.consignee?.customerId || "",
        selectedAddressTitle: note.consignee?.selectedAddressTitle || ""
      });

      // Set invoice (READ-ONLY)
      setInvoice({
        boeInvoice: note.invoice?.boeInvoice || "As Per Invoice",
        boeInvoiceNo: note.invoice?.boeInvoiceNo || "",
        boeInvoiceDate: note.invoice?.boeInvoiceDate || "",
        invoiceValue: note.invoice?.invoiceValue || ""
      });

      // Set ewaybill (READ-ONLY)
      setEwaybill({
        ewaybillNo: note.ewaybill?.ewaybillNo || "",
        expiryDate: note.ewaybill?.expiryDate || "",
        containerNo: note.ewaybill?.containerNo || ""
      });

      // Set pack data from note
      if (note.packData) {
        // Palletization
        if (note.packData.PALLETIZATION && note.packData.PALLETIZATION.length > 0) {
          setPalletizationRows(note.packData.PALLETIZATION);
        }

        // Uniform
        if (note.packData['UNIFORM - BAGS/BOXES'] && note.packData['UNIFORM - BAGS/BOXES'].length > 0) {
          setUniformRows(note.packData['UNIFORM - BAGS/BOXES']);
        }

        // Loose Cargo
        if (note.packData['LOOSE - CARGO'] && note.packData['LOOSE - CARGO'].length > 0) {
          setLooseCargoRows(note.packData['LOOSE - CARGO']);
        }

        // Non-Uniform
        if (note.packData['NON-UNIFORM - GENERAL CARGO'] && note.packData['NON-UNIFORM - GENERAL CARGO'].length > 0) {
          setNonUniformRows(note.packData['NON-UNIFORM - GENERAL CARGO']);
        }
      }

    } catch (error) {
      console.error('Error fetching consignment note:', error);
      setError(error.message);
      alert(`❌ Failed to load consignment note: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!header.status) {
      alert("Please select status");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      
      // Prepare update payload - only update status
      const payload = {
        id: noteId,
        header: {
          status: header.status
        }
      };
      
      // Send update
      const res = await fetch('/api/consignment-note', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        alert(`✅ Consignment Note status updated to ${header.status} successfully!`);
        router.push('/admin/Consignment-Note');
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Calculate total weight from all pack types
  const calculateTotalActualWt = () => {
    let total = 0;
    palletizationRows.forEach(row => total += num(row.actualWt));
    uniformRows.forEach(row => total += num(row.actualWt));
    looseCargoRows.forEach(row => total += num(row.actualWt));
    nonUniformRows.forEach(row => total += num(row.actualWt));
    return total;
  };

  const totalWeight = calculateTotalActualWt();

  // Check if any product data exists
  const hasProductData = palletizationRows.length > 0 || uniformRows.length > 0 || looseCargoRows.length > 0 || nonUniformRows.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading consignment note...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* ===== Top Bar ===== */}
      <div className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-full px-4 py-3 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/admin/Consignment-Note')}
                className="text-yellow-600 hover:text-yellow-800 font-medium text-sm flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to List
              </button>
              <div className="text-lg font-extrabold text-slate-900">
                Approve Consignment Note: {header.lrNo}
              </div>
            </div>
            <div className="text-xs text-yellow-600 mt-1 font-medium">
              ⓘ Only Status field is editable. All other fields are read-only.
            </div>
            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
              {loadingInfoNo && (
                <>
                  <span>Loading Info: {loadingInfoNo}</span>
                  <span>|</span>
                </>
              )}
              {vnnNo && (
                <>
                  <span>VNN: {vnnNo}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleApprove}
              disabled={saving}
              className={`rounded-xl px-5 py-2 text-sm font-bold text-white transition ${
                saving
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-yellow-600 hover:bg-yellow-700'
              }`}
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </span>
              ) : 'Update Status'}
            </button>
          </div>
        </div>
      </div>

      {/* ===== Main Layout ===== */}
      <div className="mx-auto max-w-full p-4 space-y-4">
        
        {/* ===== PARTY INFORMATION ===== */}
        <Card title="Party Information - Read Only (Except Status)">
          <div className="grid grid-cols-12 gap-4">
            <Input col="col-span-12 md:col-span-3" label="Party Name" value={header.partyName} readOnly={true} />
            <Input col="col-span-12 md:col-span-2" label="Order No" value={header.orderNo} readOnly={true} />
            <Input col="col-span-12 md:col-span-2" label="Order Type" value={header.orderType} readOnly={true} />
            <Input col="col-span-12 md:col-span-2" label="Plant Code" value={header.plantCode} readOnly={true} />
            
            <div className="col-span-12 md:col-span-1">
              <label className="text-xs font-bold text-slate-600">Hired/Owned</label>
              <input
                type="text"
                value={header.hiredOwned}
                readOnly
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm cursor-not-allowed"
              />
            </div>

            <Input col="col-span-12 md:col-span-2" label="Vendor Code" value={header.vendorCode} readOnly={true} />
            <Input col="col-span-12 md:col-span-2" label="Vendor Name" value={header.vendorName} readOnly={true} />
            <Input col="col-span-12 md:col-span-2" label="From" value={header.from} readOnly={true} />
            <Input col="col-span-12 md:col-span-2" label="To" value={header.to} readOnly={true} />
            <Input col="col-span-12 md:col-span-1" label="Taluka" value={header.taluka} readOnly={true} />
            <Input col="col-span-12 md:col-span-1" label="District" value={header.district} readOnly={true} />
            <Input col="col-span-12 md:col-span-1" label="State" value={header.state} readOnly={true} />
            <Input col="col-span-12 md:col-span-2" label="Vehicle No" value={header.vehicleNo} readOnly={true} />
            <Input col="col-span-12 md:col-span-2" label="Party/Mobile No" value={header.partyNo} readOnly={true} />
            <Input col="col-span-12 md:col-span-2" label="LR No" value={header.lrNo} readOnly={true} />
            <Input col="col-span-12 md:col-span-2" label="LR Date" value={header.lrDate} readOnly={true} />
            <Input col="col-span-12 md:col-span-1" label="Unit" value={header.unit} readOnly={true} />
            
            {/* Status is EDITABLE */}
            <div className="col-span-12 md:col-span-1">
              <label className="text-xs font-bold text-slate-600">Status *</label>
              <select
                value={header.status}
                onChange={(e) => setHeader({ ...header, status: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* ===== CONSIGNOR & CONSIGNEE (READ ONLY) ===== */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-6">
            <Card title="Consignor (Sender) - Read Only">
              <div className="space-y-3">
                <InfoRow label="Consignor Name" value={consignor.name} />
                {consignor.selectedAddressTitle && (
                  <InfoRow label="Address Title" value={consignor.selectedAddressTitle} />
                )}
                <div>
                  <label className="text-xs font-bold text-slate-600">Consignor Address</label>
                  <div className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 whitespace-pre-wrap">
                    {consignor.address || '-'}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="col-span-12 md:col-span-6">
            <Card title="Consignee (Receiver) - Read Only">
              <div className="space-y-3">
                <InfoRow label="Consignee Name" value={consignee.name} />
                {consignee.selectedAddressTitle && (
                  <InfoRow label="Address Title" value={consignee.selectedAddressTitle} />
                )}
                <div>
                  <label className="text-xs font-bold text-slate-600">Consignee Address</label>
                  <div className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 whitespace-pre-wrap">
                    {consignee.address || '-'}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* ===== BOE / INVOICE INFORMATION (READ ONLY) ===== */}
        <Card title="BOE / Invoice Details - Read Only">
          <div className="grid grid-cols-12 gap-4">
            <Input col="col-span-12 md:col-span-3" label="BOE / INV" value={invoice.boeInvoice} readOnly={true} />
            <Input col="col-span-12 md:col-span-3" label="BOE / Invoice No" value={invoice.boeInvoiceNo} readOnly={true} />
            <Input col="col-span-12 md:col-span-3" label="BOE / Invoice Date" value={invoice.boeInvoiceDate} readOnly={true} />
            <Input col="col-span-12 md:col-span-3" label="Invoice Value" value={invoice.invoiceValue} readOnly={true} />
          </div>
        </Card>

        {/* ===== E-WAYBILL & CONTAINER (READ ONLY) ===== */}
        <Card title="E-waybill & Container Details - Read Only">
          <div className="grid grid-cols-12 gap-4">
            <Input col="col-span-12 md:col-span-4" label="E-waybill No" value={ewaybill.ewaybillNo} readOnly={true} />
            <Input col="col-span-12 md:col-span-4" label="Expiry Date" value={ewaybill.expiryDate} readOnly={true} />
            <Input col="col-span-12 md:col-span-4" label="Container No" value={ewaybill.containerNo} readOnly={true} />
          </div>
        </Card>

        {/* ===== PRODUCT DETAILS - ALL PACK TYPES (READ ONLY) ===== */}
        <Card title="Product Details - Read Only">
          {/* Palletization Section */}
          {(palletizationRows.length > 0 && palletizationRows[0]?.productName) && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-800 mb-2 bg-yellow-100 inline-block px-3 py-1 rounded-full">Palletization</h3>
              <PalletizationTable rows={palletizationRows} />
            </div>
          )}

          {/* Uniform Section */}
          {(uniformRows.length > 0 && uniformRows[0]?.productName) && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-800 mb-2 bg-yellow-100 inline-block px-3 py-1 rounded-full">Uniform - Bags/Boxes</h3>
              <UniformTable rows={uniformRows} />
            </div>
          )}

          {/* Loose Cargo Section */}
          {(looseCargoRows.length > 0 && looseCargoRows[0]?.productName) && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-800 mb-2 bg-yellow-100 inline-block px-3 py-1 rounded-full">Loose - Cargo</h3>
              <LooseCargoTable rows={looseCargoRows} />
            </div>
          )}

          {/* Non-Uniform Section */}
          {(nonUniformRows.length > 0 && nonUniformRows[0]?.productName) && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-800 mb-2 bg-yellow-100 inline-block px-3 py-1 rounded-full">Non-uniform - General Cargo</h3>
              <NonUniformTable rows={nonUniformRows} />
            </div>
          )}

          {!hasProductData && (
            <div className="text-center py-8 text-slate-400">No product data available</div>
          )}

          <div className="flex justify-end mt-4">
            <div className="flex items-center gap-3 border border-yellow-300 px-6 py-3 bg-yellow-50 rounded-xl">
              <div className="text-sm font-extrabold text-slate-900">Total Actual Weight:</div>
              <div className="text-xl font-extrabold text-yellow-700">
                {totalWeight.toFixed(2)} {header.unit}
              </div>
            </div>
          </div>
        </Card>

        {/* ===== SUMMARY CARD ===== */}
        <Card title="Summary">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Order Summary</h3>
                <div className="space-y-2">
                  <InfoRow label="Order No" value={header.orderNo} />
                  <InfoRow label="Party Name" value={header.partyName} />
                  <InfoRow label="From - To" value={`${header.from} → ${header.to}`} />
                </div>
              </div>
            </div>

            <div className="col-span-12 md:col-span-4">
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-4 rounded-xl border border-amber-200">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Vehicle Summary</h3>
                <div className="space-y-2">
                  <InfoRow label="Vehicle No" value={header.vehicleNo} />
                  <InfoRow label="Vendor" value={header.vendorName} />
                  <InfoRow label="Mobile No" value={header.partyNo} />
                </div>
              </div>
            </div>

            <div className="col-span-12 md:col-span-4">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Weight Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Total Weight:</span>
                    <span className="text-xl font-bold text-purple-800">{totalWeight.toFixed(2)} {header.unit}</span>
                  </div>
                  <InfoRow label="Current Status" value={header.status} />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}