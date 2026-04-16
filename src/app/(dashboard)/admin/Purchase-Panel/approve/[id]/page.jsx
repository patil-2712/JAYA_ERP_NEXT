"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";

/** =========================
 * CONSTANTS
 ========================= */
const APPROVAL_OPTIONS = ["Approved", "Rejected", "Pending"];

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
    { key: "pinCode", label: "Pin Code" },
    { key: "taluka", label: "Taluka" },
    { key: "district", label: "District" },
    { key: "state", label: "State" },
    { key: "country", label: "Country" },
    { key: "from", label: "From" },
    { key: "to", label: "To" },
    { key: "locationRate", label: "Location Rate" },
    { key: "priceList", label: "Price List" },
    { key: "weight", label: "Weight" },
    { key: "rate", label: "Rate" },
    { key: "totalAmount", label: "Total Amount" },
    { key: "collectionCharges", label: "Collection Charges" },
    { key: "cancellationCharges", label: "Cancellation Charges" },
    { key: "loadingCharges", label: "Loading Charges" },
    { key: "otherCharges", label: "Other Charges" },
  ];

  return (
    <div className="overflow-auto rounded-xl border border-yellow-300">
      <table className="min-w-max w-full text-sm">
        <thead className="sticky top-0 bg-yellow-400 z-10">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center min-w-[100px]"
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
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.pinCode || '-'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.taluka || '-'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.district || '-'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.state || '-'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.country || '-'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.from || '-'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.to || '-'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.locationRate || '-'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.priceList || '-'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.weight || '0'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">₹{row.rate || '0'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700 font-medium">₹{row.totalAmount || '0'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">₹{row.collectionCharges || '0'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.cancellationCharges || '-'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.loadingCharges || '-'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">₹{row.otherCharges || '0'}</td>
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
            <th className={`border border-${bgColor}-300 px-3 py-2 text-xs font-bold text-slate-800 text-right`}>Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((row, index) => (
              <tr key={row._id || index} className={`hover:bg-${bgColor}-50`}>
                <td className={`border border-${bgColor}-300 px-2 py-2 text-slate-700`}>{row.description || '-'}</td>
                <td className={`border border-${bgColor}-300 px-2 py-2 text-slate-700 text-right`}>₹{num(row.amount).toLocaleString()}</td>
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
  LOADING EXPENSES TABLE (READ-ONLY)
========================= */
function LoadingExpensesTable({ expenses, vehicleType }) {
  const items = [
    { label: "Loading Charges", value: expenses.loadingCharges },
    { label: "Loading Staff Munshiyana", value: expenses.loadingStaffMunshiyana },
    { label: "Other Expenses", value: expenses.otherExpenses },
    { label: `Vehicle - Floor Tarpaulin (${vehicleType || "Truck"})`, value: expenses.vehicleFloorTarpaulin },
    { label: `Vehicle - Outer Tarpaulin (${vehicleType || "Truck"})`, value: expenses.vehicleOuterTarpaulin },
  ];

  const total = (
    num(expenses.loadingCharges) +
    num(expenses.loadingStaffMunshiyana) +
    num(expenses.otherExpenses) +
    num(expenses.vehicleFloorTarpaulin) +
    num(expenses.vehicleOuterTarpaulin)
  );

  return (
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-slate-800">Deduct at Office</h3>
        <div className="bg-orange-100 text-orange-800 text-xs px-3 py-1 rounded-full font-medium">
          Will be deducted from Total Amount
        </div>
      </div>
      
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center py-1">
            <span className="text-sm text-slate-700">{item.label}:</span>
            <span className="font-medium text-slate-800">₹{num(item.value).toLocaleString()}</span>
          </div>
        ))}
        <div className="flex justify-between items-center pt-2 border-t border-slate-200 mt-2">
          <span className="text-sm font-bold text-slate-800">Total (to be deducted at office):</span>
          <span className="font-bold text-orange-700 text-lg">₹{total.toLocaleString()}</span>
        </div>
      </div>
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

  // State for all data (READ-ONLY)
  const [header, setHeader] = useState({});
  const [billing, setBilling] = useState({});
  const [orderRows, setOrderRows] = useState([]);
  const [purchaseDetails, setPurchaseDetails] = useState({});
  const [loadingExpenses, setLoadingExpenses] = useState({});
  const [additions, setAdditions] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [registeredVehicle, setRegisteredVehicle] = useState({});
  const [arrivalDetails, setArrivalDetails] = useState({});
  const [vnnNo, setVnnNo] = useState("");
  const [selectedVNN, setSelectedVNN] = useState(null);
// Add this with your other state declarations
const [loadingInfoNo, setLoadingInfoNo] = useState("");
  // EDITABLE: Approval State
  const [approval, setApproval] = useState({
    status: "",
    remarks: "",
  });

  // Calculated values
  const totalOrderAmount = useMemo(() => {
    return orderRows.reduce((sum, row) => sum + num(row.totalAmount) + num(row.collectionCharges) + num(row.otherCharges), 0);
  }, [orderRows]);

  const totalAdditions = useMemo(() => {
    return additions.reduce((sum, row) => sum + num(row.amount), 0);
  }, [additions]);

  const totalDeductions = useMemo(() => {
    return deductions.reduce((sum, row) => sum + num(row.amount), 0);
  }, [deductions]);

  const totalLoadingExpenses = useMemo(() => {
    return (
      num(loadingExpenses.loadingCharges) +
      num(loadingExpenses.loadingStaffMunshiyana) +
      num(loadingExpenses.otherExpenses) +
      num(loadingExpenses.vehicleFloorTarpaulin) +
      num(loadingExpenses.vehicleOuterTarpaulin)
    );
  }, [loadingExpenses]);

  const balance = useMemo(() => {
    const totalOrder = totalOrderAmount;
    const advance = num(purchaseDetails.advance);
    return totalOrder - advance;
  }, [totalOrderAmount, purchaseDetails.advance]);

  const netEffect = useMemo(() => {
    const advance = num(purchaseDetails.advance);
    return advance + totalAdditions - totalDeductions - totalLoadingExpenses;
  }, [purchaseDetails.advance, totalAdditions, totalDeductions, totalLoadingExpenses]);

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
    
    // Set loading info - MOVED HERE after purchase is defined
    if (purchase.loadingInfoNo) setLoadingInfoNo(purchase.loadingInfoNo);
    
    // Set reference data
    if (purchase.vnnNo) setVnnNo(purchase.vnnNo);
    if (purchase.vehicleNegotiationId) setSelectedVNN({ _id: purchase.vehicleNegotiationId, vnnNo: purchase.vnnNo });
    
    // Set header data (READ-ONLY)
    setHeader({
      purchaseNo: purchase.purchaseNo || "",
      pricingSerialNo: purchase.pricingSerialNo || purchase.header?.pricingSerialNo || "",
      branch: purchase.header?.branchName || purchase.branchName || "",
      branchCode: purchase.header?.branchCode || purchase.branchCode || "",
      date: purchase.header?.date ? new Date(purchase.header.date).toISOString().split('T')[0] : 
            purchase.date ? new Date(purchase.date).toISOString().split('T')[0] : "",
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
          new Date(purchase.purchaseDetails.purchaseDate).toISOString().split('T')[0] : "",
      });
    }

    // Set loading expenses (READ-ONLY)
    if (purchase.loadingExpenses) {
      setLoadingExpenses({
        loadingCharges: purchase.loadingExpenses.loadingCharges || "",
        loadingStaffMunshiyana: purchase.loadingExpenses.loadingStaffMunshiyana || "",
        otherExpenses: purchase.loadingExpenses.otherExpenses || "",
        vehicleFloorTarpaulin: purchase.loadingExpenses.vehicleFloorTarpaulin || "",
        vehicleOuterTarpaulin: purchase.loadingExpenses.vehicleOuterTarpaulin || "",
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
          new Date(purchase.arrivalDetails.date).toISOString().split('T')[0] : "",
        time: purchase.arrivalDetails.time || "",
      });
    }

    // Set approval (EDITABLE)
    if (purchase.approval) {
      setApproval({
        status: purchase.approval.status || "",
        remarks: purchase.approval.remarks || "",
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
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
                className="text-emerald-600 hover:text-emerald-800 font-medium text-sm flex items-center gap-1"
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
            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
              <span>VNN: {vnnNo || "None"}</span>
              {header.pricingSerialNo && (
                <>
                  <span>|</span>
                  <span className="text-purple-600 font-medium">PSN: {header.pricingSerialNo}</span>
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
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : 'Submit Approval'}
            </button>
          </div>
        </div>
      </div>

      {/* ===== Main Layout ===== */}
      <div className="mx-auto max-w-full p-4 space-y-4">
        
       {/* ===== LOADING INFO SECTION ===== */}
<Card title="Loading Information">
  <div className="grid grid-cols-12 gap-4">
    <div className="col-span-12 md:col-span-4">
      <label className="text-xs font-bold text-slate-600">Loading Info (Vehicle Arrival No)</label>
      <input
        type="text"
        value={loadingInfoNo || ""}
        readOnly
        className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed"
        placeholder="Loading Info"
      />
    </div>
    {selectedVNN && (
      <div className="col-span-12 md:col-span-8">
        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <span className="text-xs font-bold text-slate-600">VNN:</span>
              <span className="ml-2 text-sm font-bold text-green-800">{selectedVNN.vnnNo}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-600">PSN:</span>
              <span className="ml-2 text-sm font-bold text-purple-800">{header.pricingSerialNo || 'Not Found'}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-600">Vendor:</span>
              <span className="ml-2 text-sm text-slate-700">{purchaseDetails.vendorName || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
</Card>

        {/* ===== PART 1: PURCHASE INFORMATION (READ ONLY) ===== */}
        <Card title="Purchase Information (Read Only)">
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Purchase No</label>
              <input type="text" value={header.purchaseNo} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">VNN No</label>
              <input type="text" value={vnnNo} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Pricing Serial No</label>
              <input type="text" value={header.pricingSerialNo} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Branch</label>
              <input type="text" value={`${header.branch} (${header.branchCode})`} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-1">
              <label className="text-xs font-bold text-slate-600">Date</label>
              <input type="text" value={header.date} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Delivery</label>
              <input type="text" value={header.delivery} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed" />
            </div>
          </div>
        </Card>

        {/* ===== BILLING TYPE / CHARGES (READ ONLY) ===== */}
        <Card title="Billing Type / Charges (Read Only)">
          <div className="overflow-auto rounded-xl border border-yellow-300">
            <table className="min-w-full w-full text-sm">
              <thead className="sticky top-0 bg-yellow-400">
                <tr>
                  <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">Billing Type</th>
                  <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">No. of Loading Points</th>
                  <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">No. of Dropping Point</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-yellow-50 even:bg-slate-50">
                  <td className="border border-yellow-300 px-2 py-2 text-slate-700">{billing.billingType || '-'}</td>
                  <td className="border border-yellow-300 px-2 py-2 text-slate-700">{billing.noOfLoadingPoints || '-'}</td>
                  <td className="border border-yellow-300 px-2 py-2 text-slate-700">{billing.noOfDroppingPoint || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* ===== ORDERS TABLE (READ ONLY) ===== */}
        <Card title="Order Details (Read Only)">
          <OrdersTable rows={orderRows} />
          <div className="flex justify-end mt-4">
            <div className="flex items-center gap-3 border border-yellow-300 px-6 py-3 bg-yellow-50 rounded-xl">
              <div className="text-sm font-extrabold text-slate-900">Total Order Amount:</div>
              <div className="text-xl font-extrabold text-emerald-700">₹{totalOrderAmount.toLocaleString()}</div>
            </div>
          </div>
        </Card>

        {/* ===== LOADING CHARGES & EXPENSES (READ ONLY) ===== */}
        <Card title="Loading Charges & Expenses (Read Only)">
          <LoadingExpensesTable expenses={loadingExpenses} vehicleType={purchaseDetails.vehicleType} />
        </Card>

        {/* ===== VEHICLE REGISTRATION (READ ONLY) ===== */}
        <Card title="Vehicle Registration (Read Only)">
          <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-12 md:col-span-5">
              <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-600">Loading Panel Vehicle - Plate</label>
                  <input type="text" value={registeredVehicle.loadingPanelPlate || ""} readOnly className="mt-1 w-full rounded-lg border border-slate-200 bg-blue-100 px-3 py-2 text-sm text-blue-800 font-medium outline-none cursor-not-allowed" />
                </div>
              </div>
            </div>
            <div className="col-span-12 md:col-span-5">
              <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-slate-200">
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-600">Registered Vehicle - Plate</label>
                  <input type="text" value={registeredVehicle.registeredPlate || ""} readOnly className="mt-1 w-full rounded-lg border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed" />
                </div>
              </div>
            </div>
            <div className="col-span-12 md:col-span-2">
              <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200 h-full">
                <div className="flex flex-col items-start">
                  <label className="text-xs font-bold text-slate-600 mb-1">Verification</label>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={registeredVehicle.isRegistered} readOnly className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-not-allowed" />
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

            <div className="col-span-12 md:col-span-4">
              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Tarpaulin Charges</h3>
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
              <div className="mt-2 text-right font-bold text-emerald-700">
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
                  <InfoRow label="Advance Paid" value={`₹${num(purchaseDetails.advance).toLocaleString()}`} />
                  <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                    <span className="text-sm font-bold text-slate-800">Final Balance:</span>
                    <span className="text-xl font-bold text-purple-800">₹{balance.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-12 md:col-span-4">
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-4 rounded-xl border border-amber-200">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Additions & Deductions</h3>
                <div className="space-y-2">
                  <InfoRow label="Advance Paid" value={`₹${num(purchaseDetails.advance).toLocaleString()}`} />
                  <InfoRow label="Deduct at Office" value={`₹${totalLoadingExpenses.toLocaleString()}`} />
                  <InfoRow label="Total Additions (+)" value={`₹${totalAdditions.toLocaleString()}`} />
                  <InfoRow label="Total Deductions (-)" value={`₹${totalDeductions.toLocaleString()}`} />
                  <div className="flex justify-between items-center pt-2 border-t border-amber-200">
                    <span className="text-sm font-bold text-slate-800">Net Effect:</span>
                    <span className={`font-bold ${netEffect >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                      ₹{netEffect.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-12 md:col-span-4">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Payment Info</h3>
                <div className="space-y-2">
                  <InfoRow label="Purchase Amount" value={`₹${num(purchaseDetails.amount).toLocaleString()}`} />
                  <InfoRow label="Balance Due" value={`₹${balance.toLocaleString()}`} />
                  <div className="mt-3 pt-2 border-t border-purple-200">
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 bg-purple-400 rounded-full"></span>
                      JV need for making the payment in Driver or Motor Owner Account.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* ===== ARRIVAL DETAILS (READ ONLY) ===== */}
        <Card title="Arrival Details (Read Only)">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Arrival Date</label>
              <input type="text" value={arrivalDetails.date} readOnly className="mt-1 w-full rounded-lg border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Arrival Time</label>
              <input type="text" value={arrivalDetails.time} readOnly className="mt-1 w-full rounded-lg border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed" />
            </div>
          </div>
        </Card>

        {/* ===== APPROVAL / REJECTION (EDITABLE) ===== */}
        <Card title="Approval / Rejection (Editable)">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-6">
              <div className="bg-white p-4 rounded-xl border border-emerald-200">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Approval Status</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600">Approval Status *</label>
                    <select
                      value={approval.status}
                      onChange={(e) => setApproval({ ...approval, status: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    >
                      <option value="">Select Approval Status</option>
                      {APPROVAL_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-slate-600">Remarks</label>
                    <textarea
                      value={approval.remarks}
                      onChange={(e) => setApproval({ ...approval, remarks: e.target.value })}
                      rows={4}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                      placeholder="Enter approval remarks..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-12 md:col-span-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Approval Instructions</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center mt-0.5">
                      <span className="text-emerald-600 text-xs font-bold">1</span>
                    </div>
                    <p className="text-sm text-slate-600">Select approval status (Approved, Rejected, or Pending)</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center mt-0.5">
                      <span className="text-emerald-600 text-xs font-bold">2</span>
                    </div>
                    <p className="text-sm text-slate-600">Add any relevant remarks or comments</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center mt-0.5">
                      <span className="text-emerald-600 text-xs font-bold">3</span>
                    </div>
                    <p className="text-sm text-slate-600">Click "Submit Approval" to finalize the decision</p>
                  </div>
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-xs text-yellow-800">
                      <span className="font-bold">Note:</span> Once approved, the purchase will be finalized and cannot be edited.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}