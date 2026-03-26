"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";

/** =========================
 * CONSTANTS
 ========================= */
const APPROVAL_OPTIONS = ["Approved", "Rejected", "Pending"];
const MEMO_STATUS = ["Uploaded", "Pending"];

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
  ORDERS TABLE (READ-ONLY)
========================= */
function OrdersTable({ rows }) {
  const columns = [
    { key: "orderNo", label: "Order No" },
    { key: "partyName", label: "Party Name" },
    { key: "plantName", label: "Plant" },
    { key: "orderType", label: "Order Type" },
    { key: "from", label: "From" },
    { key: "to", label: "To" },
    { key: "weight", label: "Weight" },
    { key: "rate", label: "Rate" },
    { key: "totalAmount", label: "Total Amount" },
  ];

  return (
    <div className="overflow-auto rounded-xl border border-yellow-300">
      <table className="min-w-full w-full text-sm">
        <thead className="sticky top-0 bg-yellow-400">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.length > 0 ? (
            rows.map((row, index) => (
              <tr key={row._id || index} className="hover:bg-yellow-50 even:bg-slate-50">
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.orderNo || '-'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.partyName || '-'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.plantName || '-'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.orderType || '-'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.from || '-'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.to || '-'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.weight || '0'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">₹{row.rate || '0'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700 font-medium">₹{row.totalAmount || '0'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="border border-yellow-300 px-4 py-8 text-center text-slate-400">
                No orders added.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* =======================
  ADDITIONS/DEDUCTIONS TABLE (READ-ONLY)
========================= */
function ChargesTable({ rows, type }) {
  const isAddition = type === 'addition';
  const bgColor = isAddition ? 'green' : 'red';
  
  return (
    <div className={`overflow-auto rounded-xl border border-${bgColor}-300`}>
      <table className="min-w-full w-full text-sm">
        <thead className={`sticky top-0 bg-${bgColor}-100`}>
          <tr>
            <th className={`border border-${bgColor}-300 px-3 py-2 text-xs font-bold text-slate-800`}>Description</th>
            <th className={`border border-${bgColor}-300 px-3 py-2 text-xs font-bold text-slate-800`}>Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((row, index) => (
              <tr key={row._id || index} className={`hover:bg-${bgColor}-50`}>
                <td className={`border border-${bgColor}-300 px-2 py-2 text-slate-700`}>{row.description || '-'}</td>
                <td className={`border border-${bgColor}-300 px-2 py-2 text-slate-700 text-right`}>₹{row.amount || '0'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2" className={`border border-${bgColor}-300 px-4 py-4 text-center text-slate-400`}>
                No {type}s added.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* =======================
  MAIN APPROVE PAGE
========================= */
export default function ApprovePurchasePanel() {
  const router = useRouter();
  const params = useParams();
  const purchaseId = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // State for all data (READ-ONLY)
  const [header, setHeader] = useState({});
  const [billing, setBilling] = useState({});
  const [orderRows, setOrderRows] = useState([]);
  const [purchaseDetails, setPurchaseDetails] = useState({});
  const [additions, setAdditions] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [registeredVehicle, setRegisteredVehicle] = useState({});
  const [arrivalDetails, setArrivalDetails] = useState({});
  const [vnnNo, setVnnNo] = useState("");

  // EDITABLE: Approval State
  const [approval, setApproval] = useState({
    status: "",
    remarks: "",
    memoStatus: "Pending",
    memoFile: null
  });

  // Calculated values
  const totalOrderAmount = useMemo(() => {
    return orderRows.reduce((sum, row) => sum + num(row.totalAmount), 0);
  }, [orderRows]);

  const totalAdditions = useMemo(() => {
    return additions.reduce((sum, row) => sum + num(row.amount), 0);
  }, [additions]);

  const totalDeductions = useMemo(() => {
    return deductions.reduce((sum, row) => sum + num(row.amount), 0);
  }, [deductions]);

  const balance = useMemo(() => {
    const amount = num(purchaseDetails.amount);
    const advance = num(purchaseDetails.advance);
    return amount - advance - totalDeductions + totalAdditions;
  }, [purchaseDetails, totalAdditions, totalDeductions]);

  // Fetch purchase data
  useEffect(() => {
    if (purchaseId) {
      fetchPurchaseData();
    }
  }, [purchaseId]);

  const fetchPurchaseData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch(`/api/purchase-panel?id=${purchaseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch purchase');
      }

      const purchase = data.data;
      console.log("📦 Purchase Data for Approval:", purchase);
      
      // Set reference data
      if (purchase.vnnNo) setVnnNo(purchase.vnnNo);
      
      // Set header data (READ-ONLY)
      setHeader({
        purchaseNo: purchase.purchaseNo || "",
        pricingSerialNo: purchase.pricingSerialNo || purchase.header?.pricingSerialNo || "",
        branch: purchase.header?.branchName || purchase.branchName || "",
        branchCode: purchase.header?.branchCode || purchase.branchCode || "",
        date: purchase.header?.date ? new Date(purchase.header.date).toLocaleDateString('en-GB') : 
              purchase.date ? new Date(purchase.date).toLocaleDateString('en-GB') : "",
        delivery: purchase.header?.delivery || purchase.delivery || "",
      });

      // Set billing data (READ-ONLY)
      if (purchase.billing) {
        setBilling({
          billingType: purchase.billing.billingType || "",
          noOfLoadingPoints: purchase.billing.noOfLoadingPoints || "",
          noOfDroppingPoint: purchase.billing.noOfDroppingPoint || "",
          collectionCharges: purchase.billing.collectionCharges || "",
          cancellationCharges: purchase.billing.cancellationCharges || "",
          loadingCharges: purchase.billing.loadingCharges || "",
          otherCharges: purchase.billing.otherCharges || "",
        });
      }

      // Set order rows (READ-ONLY)
      if (purchase.orderRows && purchase.orderRows.length > 0) {
        setOrderRows(purchase.orderRows);
      }

      // Set purchase details (READ-ONLY)
      if (purchase.purchaseDetails) {
        setPurchaseDetails({
          vendorStatus: purchase.purchaseDetails.vendorStatus || "",
          vendorName: purchase.purchaseDetails.vendorName || "",
          vendorCode: purchase.purchaseDetails.vendorCode || "",
          vehicleNo: purchase.purchaseDetails.vehicleNo || "",
          purchaseType: purchase.purchaseDetails.purchaseType || "",
          paymentTerms: purchase.purchaseDetails.paymentTerms || "",
          rateType: purchase.purchaseDetails.rateType || "",
          rate: purchase.purchaseDetails.rate || "",
          weight: purchase.purchaseDetails.weight || "",
          amount: purchase.purchaseDetails.amount || "",
          advance: purchase.purchaseDetails.advance || "",
          vehicleFloorTarpaulin: purchase.purchaseDetails.vehicleFloorTarpaulin || "",
          vehicleOuterTarpaulin: purchase.purchaseDetails.vehicleOuterTarpaulin || "",
          vehicleType: purchase.purchaseDetails.vehicleType || "",
          driverMobileNo: purchase.purchaseDetails.driverMobileNo || "",
          purchaseDate: purchase.purchaseDetails.purchaseDate ? 
            new Date(purchase.purchaseDetails.purchaseDate).toLocaleDateString('en-GB') : "",
        });
      }

      // Set additions (READ-ONLY)
      if (purchase.additions && purchase.additions.length > 0) {
        setAdditions(purchase.additions);
      }

      // Set deductions (READ-ONLY)
      if (purchase.deductions && purchase.deductions.length > 0) {
        setDeductions(purchase.deductions);
      }

      // Set registered vehicle (READ-ONLY)
      if (purchase.registeredVehicle) {
        setRegisteredVehicle({
          loadingPanelPlate: purchase.registeredVehicle.vehiclePlate || purchase.purchaseDetails?.vehicleNo || "",
          registeredPlate: purchase.registeredVehicle.vehiclePlate || "",
          isRegistered: purchase.registeredVehicle.isRegistered || false,
        });
      }

      // Set arrival details (READ-ONLY)
      if (purchase.arrivalDetails) {
        setArrivalDetails({
          date: purchase.arrivalDetails.date ? 
            new Date(purchase.arrivalDetails.date).toLocaleDateString('en-GB') : "",
          time: purchase.arrivalDetails.time || "",
        });
      }

      // Set approval (EDITABLE)
      if (purchase.approval) {
        setApproval({
          status: purchase.approval.status || "",
          remarks: purchase.approval.remarks || "",
          memoStatus: purchase.approval.memoStatus || "Pending",
          memoFile: purchase.approval.memoFile || null
        });
      }

    } catch (error) {
      console.error('Error fetching purchase:', error);
      setError(error.message);
      alert(`❌ Failed to load purchase: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMemoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      alert("❌ Please upload only PDF or image files (JPEG, PNG)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("❌ File size should be less than 5MB");
      return;
    }

    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/upload/excel', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      
      const data = await res.json();
      
      if (data.success) {
        setApproval((prev) => ({ 
          ...prev, 
          memoStatus: "Uploaded",
          memoFile: {
            filePath: data.filePath,
            fullPath: data.fullPath,
            filename: data.filename,
            originalName: file.name,
            size: file.size,
            mimeType: file.type
          }
        }));
        alert("✅ Memo uploaded successfully!");
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (error) {
      console.error("Error uploading memo:", error);
      alert("❌ Failed to upload memo. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleApprove = async () => {
    if (!approval.status) {
      alert("Please select approval status");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch current data first
      const fetchRes = await fetch(`/api/purchase-panel?id=${purchaseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const fetchData = await fetchRes.json();
      
      if (!fetchData.success) {
        throw new Error('Failed to fetch purchase data');
      }
      
      const currentData = fetchData.data;
      
      // Update only the approval section
      const updatedData = {
        ...currentData,
        approval: {
          status: approval.status,
          remarks: approval.remarks,
          memoStatus: approval.memoStatus,
          memoFile: approval.memoFile
        }
      };
      
      // Send update
      const res = await fetch('/api/purchase-panel', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: purchaseId,
          ...updatedData
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert(`✅ Purchase ${approval.status} successfully!`);
        router.push('/admin/Purchase-Panel');
      } else {
        alert(data.message || 'Failed to update approval');
      }
    } catch (error) {
      console.error('Error updating approval:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading purchase data...</p>
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
                onClick={() => router.push('/admin/Purchase-Panel')}
                className="text-yellow-600 hover:text-yellow-800 font-medium text-sm flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to List
              </button>
              <div className="text-lg font-extrabold text-slate-900">
                Approve Purchase: {header.purchaseNo}
              </div>
            </div>
            <div className="text-xs text-yellow-600 mt-1 font-medium">
              ⓘ Only Approval section is editable. All other sections are read-only.
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleApprove}
              disabled={saving || uploading}
              className={`rounded-xl px-5 py-2 text-sm font-bold text-white transition ${
                saving || uploading
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-yellow-600 hover:bg-yellow-700'
              }`}
            >
              {saving || uploading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {uploading ? 'Uploading...' : 'Saving...'}
                </span>
              ) : 'Submit Approval'}
            </button>
          </div>
        </div>
      </div>

      {/* ===== Main Layout ===== */}
      <div className="mx-auto max-w-full p-4 space-y-4">
        
        {/* ===== PART 1: PURCHASE INFORMATION (READ ONLY) ===== */}
        <Card title="Purchase Information (Read Only)">
          <div className="grid grid-cols-12 gap-3">
            <Input col="col-span-12 md:col-span-2" label="Purchase No" value={header.purchaseNo} readOnly={true} />
            <Input col="col-span-12 md:col-span-2" label="VNN No" value={vnnNo} readOnly={true} />
            <Input col="col-span-12 md:col-span-2" label="Pricing Serial No" value={header.pricingSerialNo} readOnly={true} />
            <Input col="col-span-12 md:col-span-3" label="Branch" value={header.branch} readOnly={true} />
            <Input col="col-span-12 md:col-span-1" label="Date" value={header.date} readOnly={true} />
            <Input col="col-span-12 md:col-span-2" label="Delivery" value={header.delivery} readOnly={true} />
          </div>
        </Card>

        {/* ===== BILLING TYPE / CHARGES (READ ONLY) ===== */}
        <Card title="Billing Type / Charges (Read Only)">
          <div className="grid grid-cols-12 gap-3">
            <Input col="col-span-12 md:col-span-2" label="Billing Type" value={billing.billingType} readOnly={true} />
            <Input col="col-span-12 md:col-span-2" label="No. of Loading Points" value={billing.noOfLoadingPoints} readOnly={true} />
            <Input col="col-span-12 md:col-span-2" label="No. of Dropping Point" value={billing.noOfDroppingPoint} readOnly={true} />
            <Input col="col-span-12 md:col-span-2" label="Collection Charges" value={billing.collectionCharges} readOnly={true} />
            <Input col="col-span-12 md:col-span-2" label="Cancellation Charges" value={billing.cancellationCharges} readOnly={true} />
            <Input col="col-span-12 md:col-span-1" label="Loading Charges" value={billing.loadingCharges} readOnly={true} />
            <Input col="col-span-12 md:col-span-1" label="Other Charges" value={billing.otherCharges} readOnly={true} />
          </div>
        </Card>

        {/* ===== ORDERS TABLE (READ ONLY) ===== */}
        <Card title="Order Details (Read Only)">
          <OrdersTable rows={orderRows} />
          <div className="flex justify-end mt-4">
            <div className="flex items-center gap-3 border border-yellow-300 px-6 py-3 bg-yellow-50 rounded-xl">
              <div className="text-sm font-extrabold text-slate-900">Total Order Amount:</div>
              <div className="text-xl font-extrabold text-yellow-700">₹{totalOrderAmount.toLocaleString()}</div>
            </div>
          </div>
        </Card>

        {/* ===== VEHICLE REGISTRATION (READ ONLY) ===== */}
        <Card title="Vehicle Registration (Read Only)">
          <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-12 md:col-span-5">
              <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-600">Loading Panel Vehicle - Plate</label>
                  <input
                    type="text"
                    value={registeredVehicle.loadingPanelPlate || ""}
                    readOnly
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-blue-100 px-3 py-2 text-sm text-blue-800 font-medium outline-none cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="col-span-12 md:col-span-5">
              <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-slate-200">
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-600">Registered Vehicle - Plate</label>
                  <input
                    type="text"
                    value={registeredVehicle.registeredPlate || ""}
                    readOnly
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="col-span-12 md:col-span-2">
              <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200 h-full">
                <div className="flex flex-col items-start">
                  <label className="text-xs font-bold text-slate-600 mb-1">Verification</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={registeredVehicle.isRegistered}
                      readOnly
                      className="h-5 w-5 rounded border-slate-300 text-yellow-600 focus:ring-yellow-500 cursor-not-allowed"
                    />
                    <label className="text-sm font-medium text-slate-700">Verified Registered</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* ===== PURCHASE DETAILS (READ ONLY) ===== */}
        <Card title="Purchase Details (Read Only)">
          <div className="grid grid-cols-12 gap-4">
            {/* Left Column - Vendor Info */}
            <div className="col-span-12 md:col-span-4">
              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Vendor Information</h3>
                <div className="space-y-3">
                  <InfoRow label="Vendor Status" value={purchaseDetails.vendorStatus} />
                  <InfoRow label="Vendor Name" value={purchaseDetails.vendorName} />
                  <InfoRow label="Vendor Code" value={purchaseDetails.vendorCode} />
                  <InfoRow label="Vehicle No" value={purchaseDetails.vehicleNo} />
                  <InfoRow label="Vehicle Type" value={purchaseDetails.vehicleType} />
                  <InfoRow label="Driver Mobile No" value={purchaseDetails.driverMobileNo} />
                  <InfoRow label="Purchase Date" value={purchaseDetails.purchaseDate} />
                </div>
              </div>
            </div>

            {/* Middle Column - Purchase Terms */}
            <div className="col-span-12 md:col-span-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Purchase Terms</h3>
                <div className="space-y-3">
                  <InfoRow label="Purchase Type" value={purchaseDetails.purchaseType} />
                  <InfoRow label="Payment Terms" value={purchaseDetails.paymentTerms} />
                  <InfoRow label="Rate Type" value={purchaseDetails.rateType} />
                  <InfoRow label="Rate (₹)" value={`₹${purchaseDetails.rate}`} />
                  <InfoRow label="Weight (MT)" value={purchaseDetails.weight} />
                  <InfoRow label="Amount (₹)" value={`₹${purchaseDetails.amount}`} />
                  <InfoRow label="Advance (₹)" value={`₹${purchaseDetails.advance}`} />
                </div>
              </div>
            </div>

            {/* Right Column - Tarpaulin Charges */}
            <div className="col-span-12 md:col-span-4">
              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Vehicle Tarpaulin Charges</h3>
                <div className="space-y-3">
                  <InfoRow label="Floor Tarpaulin" value={`₹${purchaseDetails.vehicleFloorTarpaulin}`} />
                  <InfoRow label="Outer Tarpaulin" value={`₹${purchaseDetails.vehicleOuterTarpaulin}`} />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* ===== ADDITIONS & DEDUCTIONS (READ ONLY) ===== */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-6">
            <Card title="Additions (+) - Extra Charges (Read Only)">
              <ChargesTable rows={additions} type="addition" />
              <div className="mt-2 text-right font-bold text-green-700">
                Total Additions: ₹{totalAdditions.toLocaleString()}
              </div>
            </Card>
          </div>

          <div className="col-span-12 md:col-span-6">
            <Card title="Deductions (-) - Adjustments (Read Only)">
              <ChargesTable rows={deductions} type="deduction" />
              <div className="mt-2 text-right font-bold text-red-700">
                Total Deductions: ₹{totalDeductions.toLocaleString()}
              </div>
            </Card>
          </div>
        </div>

        {/* ===== FINAL SUMMARY (READ ONLY) ===== */}
        <Card title="Purchase Summary (Read Only)">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Order Summary</h3>
                <div className="space-y-2">
                  <InfoRow label="Total Order Amount" value={`₹${totalOrderAmount.toLocaleString()}`} />
                  <InfoRow label="Purchase Amount" value={`₹${num(purchaseDetails.amount).toLocaleString()}`} />
                  <InfoRow label="Advance Paid" value={`₹${num(purchaseDetails.advance).toLocaleString()}`} />
                </div>
              </div>
            </div>

            <div className="col-span-12 md:col-span-4">
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-4 rounded-xl border border-amber-200">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Additions & Deductions</h3>
                <div className="space-y-2">
                  <InfoRow label="Total Additions" value={`+₹${totalAdditions.toLocaleString()}`} />
                  <InfoRow label="Total Deductions" value={`-₹${totalDeductions.toLocaleString()}`} />
                  <InfoRow label="Net Effect" value={`₹${(totalAdditions - totalDeductions).toLocaleString()}`} />
                </div>
              </div>
            </div>

            <div className="col-span-12 md:col-span-4">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Final Balance</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Balance Amount:</span>
                    <span className="text-2xl font-bold text-purple-800">₹{balance.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* ===== ARRIVAL DETAILS (READ ONLY) ===== */}
        <Card title="Arrival Details (Read Only)">
          <div className="grid grid-cols-12 gap-4">
            <Input col="col-span-12 md:col-span-3" label="Arrival Date" value={arrivalDetails.date} readOnly={true} />
            <Input col="col-span-12 md:col-span-3" label="Arrival Time" value={arrivalDetails.time} readOnly={true} />
          </div>
        </Card>

        {/* ===== PART 3: APPROVAL / REJECTION (EDITABLE) ===== */}
        <Card title="Approval / Rejection (Editable)">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-6">
              <div className="bg-white p-4 rounded-xl border border-yellow-200">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Approval Status</h3>
                <div className="space-y-4">
                  <Select
                    label="Approval Status"
                    value={approval.status}
                    onChange={(v) => setApproval({ ...approval, status: v })}
                    options={APPROVAL_OPTIONS}
                  />
                  
                  <div>
                    <label className="text-xs font-bold text-slate-600">Remarks</label>
                    <textarea
                      value={approval.remarks}
                      onChange={(e) => setApproval({ ...approval, remarks: e.target.value })}
                      rows={3}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
                      placeholder="Enter approval remarks..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ===== MEMO UPLOAD (EDITABLE) ===== */}
            <div className="col-span-12 md:col-span-6">
              <div className="bg-white p-4 rounded-xl border border-yellow-200">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Memo Upload</h3>
                
                <div className="space-y-4">
                  <Select
                    label="Memo Status"
                    value={approval.memoStatus}
                    onChange={(v) => setApproval({ ...approval, memoStatus: v })}
                    options={MEMO_STATUS}
                  />

                  <div>
                    <label className="text-xs font-bold text-slate-600">Upload Memo</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleMemoUpload}
                      disabled={uploading}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 disabled:opacity-50"
                    />
                  </div>

                  {uploading && (
                    <div className="text-sm text-blue-600 flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading memo...
                    </div>
                  )}

                  {approval.memoFile && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm font-medium text-green-800">Uploaded File:</p>
                      <p className="text-sm text-green-700 mt-1">{approval.memoFile.originalName}</p>
                      <p className="text-xs text-green-600 mt-0.5">Size: {(approval.memoFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}