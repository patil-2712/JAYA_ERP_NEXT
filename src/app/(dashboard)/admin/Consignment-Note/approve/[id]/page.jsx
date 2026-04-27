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
  const [generatingLR, setGeneratingLR] = useState(false);
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

  // ======================= GENERATE LR (CONSIGNMENT NOTE STYLE) =======================
  const handleGenerateLR = async () => {
    setGeneratingLR(true);
    try {
      // Get token for API calls if needed for logo/business info
      const token = localStorage.getItem('token');
      
      // Fetch company/business info (optional, for logo and GST etc.)
      let businessInfo = {
        companyName: "Jaya Logistics",
        address: "Office - 404, A - Wing 4th Floor, Shelton Sapphire, Sector - 15, Belapur Navi Mumbai - 400614",
        phone: "Tel - 022 27578844",
        fax: "Fax - 022 27570044",
        gst: "GST NO - 27CDHPS2205M12A",
        pan: "PAN: CDHPS2205M",
        transportGst: "27AAMFS9446C1ZU",
        emergencyContact: "9653489852 9004645555"
      };
      
      try {
        const bizRes = await fetch('/api/business-info', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (bizRes.ok) {
          const bizData = await bizRes.json();
          if (bizData.success && bizData.data) {
            businessInfo = { ...businessInfo, ...bizData.data };
          }
        }
      } catch (err) {
        console.warn("Could not fetch business info, using defaults", err);
      }

      // Prepare product data display
      const allProducts = [];
      let totalPackages = 0;
      let totalActualWeight = 0;
      let totalChargedWeight = 0;

      // Process palletization rows
      palletizationRows.forEach(row => {
        if (row.productName) {
          allProducts.push({
            description: `${row.productName}${row.skuSize ? ` (${row.skuSize})` : ''}${row.pkgsType ? ` - ${row.pkgsType}` : ''}`,
            packages: row.totalPkgs || row.noOfPallets * (row.unitPerPallets || 1) || 0,
            actualWeight: num(row.actualWt),
            chargedWeight: num(row.chargedWt)
          });
          totalPackages += row.totalPkgs || row.noOfPallets * (row.unitPerPallets || 1) || 0;
          totalActualWeight += num(row.actualWt);
          totalChargedWeight += num(row.chargedWt);
        }
      });

      // Process uniform rows
      uniformRows.forEach(row => {
        if (row.productName) {
          allProducts.push({
            description: `${row.productName}${row.skuSize ? ` (${row.skuSize})` : ''}${row.pkgsType ? ` - ${row.pkgsType}` : ''}`,
            packages: row.totalPkgs || 0,
            actualWeight: num(row.actualWt),
            chargedWeight: num(row.chargedWt)
          });
          totalPackages += row.totalPkgs || 0;
          totalActualWeight += num(row.actualWt);
          totalChargedWeight += num(row.chargedWt);
        }
      });

      // Process loose cargo rows
      looseCargoRows.forEach(row => {
        if (row.productName) {
          allProducts.push({
            description: `${row.productName} (Loose Cargo)`,
            packages: 0,
            actualWeight: num(row.actualWt),
            chargedWeight: num(row.chargedWt)
          });
          totalActualWeight += num(row.actualWt);
          totalChargedWeight += num(row.chargedWt);
        }
      });

      // Process non-uniform rows
      nonUniformRows.forEach(row => {
        if (row.productName) {
          allProducts.push({
            description: `${row.productName}${row.length && row.width && row.height ? ` (${row.length}x${row.width}x${row.height})` : ''}`,
            packages: row.nos || 0,
            actualWeight: num(row.actualWt),
            chargedWeight: num(row.chargedWt)
          });
          totalPackages += row.nos || 0;
          totalActualWeight += num(row.actualWt);
          totalChargedWeight += num(row.chargedWt);
        }
      });

      const currentDate = new Date().toLocaleDateString('en-GB');
      const currentDateTime = new Date().toLocaleString();

      // Build an HTML string that looks like the PDF/Consignment Note
      const lrHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>LR - ${header.lrNo || 'Consignment Note'}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Courier New', Courier, monospace;
              background: #fff;
              padding: 20px;
              font-size: 12px;
            }
            .container {
              max-width: 900px;
              margin: 0 auto;
              border: 1px solid #000;
              padding: 10px;
            }
            .header-top {
              display: flex;
              justify-content: space-between;
              border-bottom: 1px solid #000;
              padding-bottom: 5px;
              margin-bottom: 10px;
            }
            .company-name {
              font-size: 18px;
              font-weight: bold;
            }
            .jurisdiction {
              font-size: 10px;
              font-weight: bold;
              border: 1px solid #000;
              padding: 2px 5px;
            }
            .terms-box {
              font-size: 8px;
              border: 1px solid #000;
              padding: 5px;
              margin: 5px 0;
              text-align: center;
            }
            .risk-note {
              font-size: 8px;
              font-weight: bold;
              text-align: center;
              margin: 3px 0;
            }
            .party-details {
              display: flex;
              justify-content: space-between;
              margin: 10px 0;
              border: 1px solid #000;
              padding: 5px;
            }
            .party-box {
              width: 48%;
            }
            .section-title {
              font-weight: bold;
              border-bottom: 1px solid #000;
              margin-bottom: 5px;
              font-size: 11px;
            }
            .info-row {
              display: flex;
              margin: 2px 0;
              font-size: 9px;
            }
            .info-label {
              width: 100px;
              font-weight: bold;
            }
            .info-value {
              flex: 1;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 10px 0;
              font-size: 9px;
            }
            th, td {
              border: 1px solid #000;
              padding: 4px;
              text-align: left;
              vertical-align: top;
            }
            th {
              background: #f0f0f0;
              font-weight: bold;
            }
            .text-center {
              text-align: center;
            }
            .text-right {
              text-align: right;
            }
            .footer {
              margin-top: 15px;
              display: flex;
              justify-content: space-between;
              border-top: 1px solid #000;
              padding-top: 10px;
              font-size: 9px;
            }
            .signature-box {
              width: 45%;
            }
            .declaration {
              font-size: 8px;
              margin: 5px 0;
              font-style: italic;
            }
            .ewb-container {
              font-size: 9px;
              font-weight: bold;
              background: #f9f9f9;
              padding: 5px;
              margin: 5px 0;
            }
            @media print {
              body {
                padding: 0;
                margin: 0;
              }
              .container {
                max-width: 100%;
                margin: 0;
                border: none;
              }
              .no-break {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header Section -->
            <div class="header-top">
              <div>
                <div class="company-name">${businessInfo.companyName || 'Jaya Logistics'}</div>
                <div style="font-size: 8px;">${businessInfo.address || 'Office - 404, A - Wing 4th Floor, Shelton Sapphire, Sector - 15, Belapur Navi Mumbai - 400614'}</div>
                <div style="font-size: 8px;">${businessInfo.phone || 'Tel - 022 27578844'} | ${businessInfo.fax || 'Fax - 022 27570044'}</div>
                <div style="font-size: 8px;">${businessInfo.gst || 'GST NO - 27CDHPS2205M12A'}</div>
              </div>
              <div class="jurisdiction">SUBJECT TO MUMBAI JURISDICTION ONLY</div>
            </div>

            <!-- Terms and Conditions -->
            <div class="terms-box">
              This consignment will not be detained, re routed or re-booked without Consignor's written permission. 
              It will be delivered at the destination. NOT RESPONSIBLE FOR ANY LEAKAGE, BREAKAGE, DAMAGE, FIRE &amp; RIOTS
            </div>

            <div class="risk-note">
              AT OWNER'S RISK - The customer has stated that: He has not insured the consignment
            </div>

            <!-- Emergency Contact & Vehicle -->
            <div class="info-row">
              <span class="info-label">Vehicle No:</span>
              <span class="info-value"><strong>${header.vehicleNo || 'MH17BY9912'}</strong></span>
              <span class="info-label">Emergency Contact:</span>
              <span class="info-value">${businessInfo.emergencyContact || '9653489852 9004645555'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Transport GST:</span>
              <span class="info-value">${businessInfo.transportGst || '27AAMFS9446C1ZU'}</span>
              <span class="info-label">E-Way Bill No:</span>
              <span class="info-value">${ewaybill.ewaybillNo || '202184919358'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Container No:</span>
              <span class="info-value">${ewaybill.containerNo || ''}</span>
            </div>

            <!-- From / To -->
            <div class="info-row">
              <span class="info-label">From:</span>
              <span class="info-value"><strong>${header.from || 'DIGHODE'}</strong></span>
              <span class="info-label">To:</span>
              <span class="info-value"><strong>${header.to || 'DHULE'}</strong></span>
            </div>

            <!-- Consignor / Consignee -->
            <div class="party-details">
              <div class="party-box">
                <div class="section-title">CONSIGNOR</div>
                <div><strong>${consignor.name || ''}</strong></div>
                <div style="font-size: 8px;">${consignor.address || ''}</div>
                ${consignor.selectedAddressTitle ? `<div style="font-size: 8px;">${consignor.selectedAddressTitle}</div>` : ''}
              </div>
              <div class="party-box">
                <div class="section-title">CONSIGNEE</div>
                <div><strong>${consignee.name || ''}</strong></div>
                <div style="font-size: 8px;">${consignee.address || ''}</div>
                ${consignee.selectedAddressTitle ? `<div style="font-size: 8px;">${consignee.selectedAddressTitle}</div>` : ''}
              </div>
            </div>

            <!-- Goods Details -->
            <div class="section-title">GOODS DESCRIPTION</div>
            <table>
              <thead>
                <tr>
                  <th width="5%">#</th>
                  <th width="40%">DESCRIPTION (Said to contain)</th>
                  <th width="10%">PKGS</th>
                  <th width="10%">ACTUAL WT</th>
                  <th width="10%">CHARGED WT</th>
                  <th width="10%">UOM</th>
                </tr>
              </thead>
              <tbody>
                ${allProducts.map((prod, idx) => `
                  <tr>
                    <td class="text-center">${idx + 1}</td>
                    <td>${prod.description}</td>
                    <td class="text-center">${prod.packages || '-'}</td>
                    <td class="text-right">${prod.actualWeight.toFixed(2)}</td>
                    <td class="text-right">${prod.chargedWeight.toFixed(2)}</td>
                    <td class="text-center">${header.unit || 'MT'}</td>
                  </tr>
                `).join('')}
                ${allProducts.length === 0 ? `
                  <tr>
                    <td colspan="6" class="text-center">- No product details available -</td>
                  </tr>
                ` : ''}
              </tbody>
              <tfoot>
                <tr style="background: #f5f5f5;">
                  <td colspan="2" class="text-right"><strong>TOTAL</strong></td>
                  <td class="text-center"><strong>${totalPackages || '-'}</strong></td>
                  <td class="text-right"><strong>${totalActualWeight.toFixed(2)}</strong></td>
                  <td class="text-right"><strong>${totalChargedWeight.toFixed(2)}</strong></td>
                  <td class="text-center"><strong>${header.unit || 'MT'}</strong></td>
                </tr>
              </tfoot>
            </table>

            <!-- Invoice / BOE Details -->
            <div class="info-row">
              <span class="info-label">BOE/INV:</span>
              <span class="info-value">${invoice.boeInvoice || 'As Per Invoice'}</span>
              <span class="info-label">No:</span>
              <span class="info-value">${invoice.boeInvoiceNo || ''}</span>
              <span class="info-label">Date:</span>
              <span class="info-value">${invoice.boeInvoiceDate || ''}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Value:</span>
              <span class="info-value">${invoice.invoiceValue || 'AS PER INVOICE'}</span>
            </div>

            <!-- Additional Info -->
            <div class="info-row">
              <span class="info-label">LR No:</span>
              <span class="info-value"><strong>${header.lrNo || ''}</strong></span>
              <span class="info-label">LR Date:</span>
              <span class="info-value">${header.lrDate || currentDate}</span>
              <span class="info-label">Party No:</span>
              <span class="info-value">${header.partyNo || ''}</span>
            </div>

            ${loadingInfoNo ? `
            <div class="info-row">
              <span class="info-label">Loading Info No:</span>
              <span class="info-value">${loadingInfoNo}</span>
            </div>
            ` : ''}

            <div class="declaration">
              We hereby certify that we have not availed credit of GST paid on inward supplies under the provision of sec 16 of GST ACT 2017.
              Agreed with the conditions given overleaf. This consignment is at Owner's Risk.
            </div>

            <!-- Footer Signatures -->
            <div class="footer">
              <div class="signature-box">
                <div class="section-title">FOR ${businessInfo.companyName || 'Jaya Logistics'}</div>
                <div style="margin-top: 20px;">Authorised Signatory</div>
              </div>
              <div class="signature-box">
                <div class="section-title">CONSIGNOR'S SIGNATURE</div>
                <div style="margin-top: 20px;">_________________________</div>
              </div>
              <div class="signature-box">
                <div class="section-title">CONSIGNEE'S STAMP & SIGN</div>
                <div style="margin-top: 20px;">_________________________</div>
              </div>
            </div>

            <div style="margin-top: 8px; font-size: 7px; text-align: center; border-top: 1px dashed #ccc; padding-top: 5px;">
              Generated on: ${currentDateTime} | This is a system generated LR Document
            </div>
          </div>
        </body>
        </html>
      `;

      // Open in new window for print / save as PDF
      const win = window.open();
      if (win) {
        win.document.write(lrHtml);
        win.document.close();
        win.print();
      } else {
        throw new Error("Please allow popups to generate LR");
      }

    } catch (error) {
      console.error("Error generating LR:", error);
      alert(`❌ Failed to generate LR: ${error.message}`);
    } finally {
      setGeneratingLR(false);
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
              onClick={handleGenerateLR}
              disabled={generatingLR}
              className={`rounded-xl px-5 py-2 text-sm font-bold text-white transition ${
                generatingLR
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {generatingLR ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating LR...
                </span>
              ) : '📄 Generate LR'}
            </button>
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