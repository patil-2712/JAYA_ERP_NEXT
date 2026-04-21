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

function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN');
}

function formatTime(timeString) {
  if (!timeString) return '-';
  return timeString;
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

function InfoRow({ label, value, highlight = false }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-100">
      <span className="text-xs font-bold text-slate-600">{label}</span>
      <span className={`text-sm ${highlight ? 'font-bold text-purple-800' : 'text-slate-800'}`}>
        {value || '-'}
      </span>
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
    { key: "weight", label: "Weight (MT)" },
    { key: "rate", label: "Rate (₹)" },
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
                <td className="border border-yellow-300 px-2 py-2 text-slate-700 text-right">{row.weight || '0'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700 text-right">₹{num(row.rate).toLocaleString()}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700 text-right font-medium">₹{num(row.totalAmount).toLocaleString()}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700 text-right">₹{num(row.collectionCharges).toLocaleString()}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.cancellationCharges || '-'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.loadingCharges || '-'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700 text-right">₹{num(row.otherCharges).toLocaleString()}</td>
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
  const total = rows.reduce((sum, row) => sum + num(row.amount), 0);
  
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
          <tr className={`bg-${bgColor}-100 font-bold`}>
            <td className={`border border-${bgColor}-300 px-3 py-2 text-right`}>Total {type === 'addition' ? 'Additions' : 'Deductions'}:</td>
            <td className={`border border-${bgColor}-300 px-3 py-2 text-right ${isAddition ? 'text-emerald-700' : 'text-red-700'}`}>
              ₹{total.toLocaleString()}
            </td>
          </tr>
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

  // State for all data (READ-ONLY)
  const [header, setHeader] = useState({});
  const [billing, setBilling] = useState({});
  const [orderRows, setOrderRows] = useState([]);
  const [purchaseDetails, setPurchaseDetails] = useState({});
  const [loadingExpenses, setLoadingExpenses] = useState({});
  const [warehouseExpenses, setWarehouseExpenses] = useState({});
  const [additions, setAdditions] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [registeredVehicle, setRegisteredVehicle] = useState({});
  const [arrivalDetails, setArrivalDetails] = useState({});
  const [vnnNo, setVnnNo] = useState("");
  const [selectedVNN, setSelectedVNN] = useState(null);
  const [loadingInfoNo, setLoadingInfoNo] = useState("");
  const [purchaseAmountFromVNN, setPurchaseAmountFromVNN] = useState(0);
  const [memoFileInfo, setMemoFileInfo] = useState(null);
  
  // EDITABLE: Approval State
  const [approval, setApproval] = useState({
    status: "",
    remarks: "",
  });

  // Calculated values
  const totalOrderAmount = useMemo(() => {
    return orderRows.reduce((sum, row) => {
      const totalAmount = num(row.totalAmount);
      const collectionCharges = num(row.collectionCharges);
      const cancellationCharges = num(row.cancellationCharges);
      const loadingCharges = num(row.loadingCharges);
      const otherCharges = num(row.otherCharges);
      return sum + totalAmount + collectionCharges + cancellationCharges + loadingCharges + otherCharges;
    }, 0);
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

  const totalWarehouseExpenses = useMemo(() => {
    return (
      num(warehouseExpenses.wVehicleFloorTarpaulin) +
      num(warehouseExpenses.wVehicleOuterTarpaulin)
    );
  }, [warehouseExpenses]);

  const balance = useMemo(() => {
    return purchaseAmountFromVNN - num(purchaseDetails.advance);
  }, [purchaseAmountFromVNN, purchaseDetails.advance]);

  const netEffect = useMemo(() => {
    const advance = num(purchaseDetails.advance);
    return advance + totalAdditions - totalDeductions - totalLoadingExpenses - totalWarehouseExpenses;
  }, [purchaseDetails.advance, totalAdditions, totalDeductions, totalLoadingExpenses, totalWarehouseExpenses]);

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
      
      // Set loading info
      if (purchase.loadingInfoNo) setLoadingInfoNo(purchase.loadingInfoNo);
      
      // Set reference data
      if (purchase.vnnNo) setVnnNo(purchase.vnnNo);
      if (purchase.vehicleNegotiationId) setSelectedVNN({ _id: purchase.vehicleNegotiationId, vnnNo: purchase.vnnNo });
      
      // Set purchase amount from VNN
      if (purchase.purchaseAmountFromVNN) {
        setPurchaseAmountFromVNN(purchase.purchaseAmountFromVNN);
      } else if (purchase.purchaseDetails?.amount) {
        setPurchaseAmountFromVNN(num(purchase.purchaseDetails.amount));
      }
      
      // Set header data
      setHeader({
        purchaseNo: purchase.purchaseNo || "",
        pricingSerialNo: purchase.pricingSerialNo || purchase.header?.pricingSerialNo || "",
        branch: purchase.header?.branchName || purchase.branchName || "",
        branchCode: purchase.header?.branchCode || purchase.branchCode || "",
        date: purchase.header?.date ? new Date(purchase.header.date).toISOString().split('T')[0] : 
              purchase.date ? new Date(purchase.date).toISOString().split('T')[0] : "",
        delivery: purchase.header?.delivery || purchase.delivery || "",
      });

      // Set billing data
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

      // Set order rows
      if (purchase.orderRows && purchase.orderRows.length > 0) {
        setOrderRows(purchase.orderRows);
      }

      // Set purchase details
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

      // Set loading expenses
      if (purchase.loadingExpenses) {
        setLoadingExpenses({
          loadingCharges: purchase.loadingExpenses.loadingCharges || "",
          loadingStaffMunshiyana: purchase.loadingExpenses.loadingStaffMunshiyana || "",
          otherExpenses: purchase.loadingExpenses.otherExpenses || "",
          vehicleFloorTarpaulin: purchase.loadingExpenses.vehicleFloorTarpaulin || "",
          vehicleOuterTarpaulin: purchase.loadingExpenses.vehicleOuterTarpaulin || "",
        });
      }

      // Set warehouse expenses
      if (purchase.warehouseExpenses) {
        setWarehouseExpenses({
          wVehicleFloorTarpaulin: purchase.warehouseExpenses.wVehicleFloorTarpaulin || "",
          wVehicleOuterTarpaulin: purchase.warehouseExpenses.wVehicleOuterTarpaulin || "",
        });
      }

      // Set additions
      if (purchase.additions && purchase.additions.length > 0) {
        setAdditions(purchase.additions);
      }

      // Set deductions
      if (purchase.deductions && purchase.deductions.length > 0) {
        setDeductions(purchase.deductions);
      }

      // Set registered vehicle
      if (purchase.registeredVehicle) {
        setRegisteredVehicle({
          loadingPanelPlate: purchase.registeredVehicle.vehiclePlate || purchase.purchaseDetails?.vehicleNo || "",
          registeredPlate: purchase.registeredVehicle.vehiclePlate || "",
          isRegistered: purchase.registeredVehicle.isRegistered || false,
        });
      }

      // Set arrival details with new fields
      if (purchase.arrivalDetails) {
        setArrivalDetails({
          inDate: purchase.arrivalDetails.inDate ? 
            new Date(purchase.arrivalDetails.inDate).toISOString().split('T')[0] : "",
          inTime: purchase.arrivalDetails.inTime || "",
          outDate: purchase.arrivalDetails.outDate ? 
            new Date(purchase.arrivalDetails.outDate).toISOString().split('T')[0] : "",
          outTime: purchase.arrivalDetails.outTime || "",
          remarks: purchase.arrivalDetails.remarks || "",
          detentionDays: purchase.arrivalDetails.detentionDays || "",
          detentionAmount: purchase.arrivalDetails.detentionAmount || "",
        });
      }

      // Set memo file
      if (purchase.memoFile) {
        setMemoFileInfo(purchase.memoFile);
      }

      // Set approval
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
      
      const res = await fetch('/api/purchase-panel', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: purchaseId,
          approval: {
            status: approval.status,
            remarks: approval.remarks,
          }
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading purchase data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Sticky Top Bar */}
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

      {/* Main Content */}
      <div className="mx-auto max-w-full p-4">
        
        {/* Loading Info Section */}
        <div className="mb-4">
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
        </div>

        {/* Header Information */}
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
              <label className="text-xs font-bold text-slate-600">Branch *</label>
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

        {/* Billing Type / Charges */}
        <div className="mt-4">
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
        </div>

        {/* Orders Table */}
        <div className="mt-4">
          <Card title="Order Details (Read Only)">
            <OrdersTable rows={orderRows} />
            <div className="flex justify-end mt-4">
              <div className="flex items-center gap-3 border border-yellow-300 px-6 py-3 bg-yellow-50 rounded-xl">
                <div className="text-sm font-extrabold text-slate-900">Total Order Amount:</div>
                <div className="text-xl font-extrabold text-emerald-700">₹{totalOrderAmount.toLocaleString()}</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Purchase Details Section */}
        <div className="mt-4">
          <Card title="Purchase Details (Read Only)">
            <div className="grid grid-cols-12 gap-4">
              {/* Left Column - Vendor Info */}
              <div className="col-span-12 md:col-span-4">
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 h-full">
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
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 h-full">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Purchase Terms (Auto-filled from VNN)</h3>
                  <div className="space-y-3">
                    <InfoRow label="Purchase Type" value={purchaseDetails.purchaseType} />
                    <InfoRow label="Payment Terms" value={purchaseDetails.paymentTerms} />
                    <InfoRow label="Rate Type" value={purchaseDetails.rateType} />
                    <InfoRow label="Rate (₹)" value={`₹${num(purchaseDetails.rate).toLocaleString()}`} />
                    <InfoRow label="Weight (MT)" value={purchaseDetails.weight} />
                    
                    {/* Purchase Amount from VNN */}
                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-purple-700">Purchase Amount (A x B) from VNN</span>
                        <span className="text-xl font-bold text-purple-800">₹{purchaseAmountFromVNN.toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-purple-600 mt-1">Auto-calculated from Vehicle Negotiation</p>
                    </div>
                    
                    <InfoRow label="Advance (₹)" value={`₹${num(purchaseDetails.advance).toLocaleString()}`} />
                  </div>
                </div>
              </div>

              {/* Right Column - MEMO Display */}
              <div className="col-span-12 md:col-span-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200 h-full">
                  <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    MEMO from Vehicle Negotiation
                  </h3>
                  
                  {memoFileInfo ? (
                    <div 
                      className="relative group cursor-pointer overflow-hidden rounded-xl border-2 border-green-300 bg-white shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={() => {
                        if (memoFileInfo.filePath) {
                          window.open(memoFileInfo.filePath, '_blank');
                        }
                      }}
                    >
                      <div className="relative w-full min-h-[200px] bg-gray-100">
                        {memoFileInfo.mimeType?.includes('image') ? (
                          <img 
                            src={memoFileInfo.filePath} 
                            alt={memoFileInfo.originalName}
                            className="w-full h-full min-h-[200px] object-contain transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : memoFileInfo.mimeType?.includes('pdf') ? (
                          <div className="flex flex-col items-center justify-center min-h-[200px] bg-red-50">
                            <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-600 mt-2">{memoFileInfo.originalName}</span>
                            <span className="text-xs text-gray-500 mt-1">Click to view PDF</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center min-h-[200px] bg-gray-100">
                            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-600 mt-2">{memoFileInfo.originalName}</span>
                            <span className="text-xs text-gray-500 mt-1">Click to download</span>
                          </div>
                        )}
                      </div>
                      <div className="p-2 bg-white border-t border-green-100">
                        <p className="text-xs font-medium text-slate-700 truncate">{memoFileInfo.originalName}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center min-h-[200px] bg-white rounded-xl border-2 border-dashed border-green-300">
                      <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-sm text-slate-500">No MEMO available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Loading Charges & Expenses - Deduct at Office */}
        <div className="mt-4">
          <Card title="Loading Charges & Expenses - Deduct at Office (Read Only)">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-800">Deduct at Office</h3>
                <div className="bg-orange-100 text-orange-800 text-xs px-3 py-1 rounded-full font-medium">
                  Will be deducted from Total Amount
                </div>
              </div>
              
              <div className="space-y-3">
                <InfoRow label="Loading Charges" value={`₹${num(loadingExpenses.loadingCharges).toLocaleString()}`} />
                <InfoRow label="Loading Staff Munshiyana" value={`₹${num(loadingExpenses.loadingStaffMunshiyana).toLocaleString()}`} />
                <InfoRow label="Other Expenses" value={`₹${num(loadingExpenses.otherExpenses).toLocaleString()}`} />
                <InfoRow label={`Vehicle - Floor Tarpaulin (${purchaseDetails.vehicleType || "Truck"})`} value={`₹${num(loadingExpenses.vehicleFloorTarpaulin).toLocaleString()}`} />
                <InfoRow label={`Vehicle - Outer Tarpaulin (${purchaseDetails.vehicleType || "Truck"})`} value={`₹${num(loadingExpenses.vehicleOuterTarpaulin).toLocaleString()}`} />
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 mt-2">
                  <span className="text-sm font-bold text-slate-800">Total Deduct at Office:</span>
                  <span className="font-bold text-orange-700 text-lg">₹{totalLoadingExpenses.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Warehouse Charges & Expenses - Deduct at Warehouse */}
        <div className="mt-4">
          <Card title="Warehouse Charges & Expenses - Deduct at Warehouse (Read Only)">
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-800">Deduct at Warehouse</h3>
                <div className="bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full font-medium">
                  Will be deducted at Warehouse
                </div>
              </div>
              
              <div className="space-y-3">
                <InfoRow label={`W-Vehicle - Floor Tarpaulin (${purchaseDetails.vehicleType || "Truck"})`} value={`₹${num(warehouseExpenses.wVehicleFloorTarpaulin).toLocaleString()}`} />
                <InfoRow label={`W-Vehicle - Outer Tarpaulin (${purchaseDetails.vehicleType || "Truck"})`} value={`₹${num(warehouseExpenses.wVehicleOuterTarpaulin).toLocaleString()}`} />
                <div className="flex justify-between items-center pt-2 border-t border-indigo-200 mt-2">
                  <span className="text-sm font-bold text-slate-800">Total Deduct at Warehouse:</span>
                  <span className="font-bold text-indigo-700 text-lg">₹{totalWarehouseExpenses.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Vehicle Registration Section */}
        <div className="mt-4">
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
                      <input type="checkbox" checked={registeredVehicle.isRegistered} readOnly className="h-5 w-5 rounded border-slate-300 text-emerald-600 cursor-not-allowed" />
                      <label className="text-sm font-medium text-slate-700">Verified Registered</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {registeredVehicle.loadingPanelPlate && registeredVehicle.registeredPlate && (
              <div className="mt-3 px-3">
                {registeredVehicle.loadingPanelPlate === registeredVehicle.registeredPlate ? (
                  <div className="text-xs text-green-600 bg-green-50 p-2 rounded-lg inline-flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    ✓ Plates match - Verified
                  </div>
                ) : (
                  <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg inline-flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    ⚠️ Different plate entered - Manual verification required
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Additions & Deductions Section */}
        <div className="mt-4">
          <div className="grid grid-cols-12 gap-4">
            {/* Advance + Deduct at Office + Deduct at Warehouse Summary */}
            <div className="col-span-12">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 mb-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-xs text-slate-500">Advance Paid</div>
                    <div className="text-2xl font-bold text-emerald-700">₹{num(purchaseDetails.advance).toLocaleString()}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-slate-500">Deduct at Office</div>
                    <div className="text-2xl font-bold text-orange-700">₹{totalLoadingExpenses.toLocaleString()}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-slate-500">Deduct at Warehouse</div>
                    <div className="text-2xl font-bold text-indigo-700">₹{totalWarehouseExpenses.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Deductions Column */}
            <div className="col-span-12 md:col-span-6">
              <Card title="Deductions (-) - Adjustments (Read Only)">
                <ChargesTable rows={deductions} type="deduction" />
              </Card>
            </div>

            {/* Additions Column */}
            <div className="col-span-12 md:col-span-6">
              <Card title="Additions (+) - Extra Charges (Read Only)">
                <ChargesTable rows={additions} type="addition" />
              </Card>
            </div>
          </div>

          {/* Final Summary & Balance */}
          <div className="mt-4">
            <Card title="Purchase Summary & Balance (Read Only)">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-4">
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-200">
                    <h3 className="text-sm font-bold text-slate-800 mb-3">Purchase Summary</h3>
                    <div className="space-y-2">
                      <InfoRow label="Purchase Amount (A x B)" value={`₹${purchaseAmountFromVNN.toLocaleString()}`} highlight />
                      <InfoRow label="Advance Paid" value={`₹${num(purchaseDetails.advance).toLocaleString()}`} />
                      <div className="flex justify-between items-center pt-2 border-t border-purple-200">
                        <span className="text-sm font-bold text-slate-800">Final Balance:</span>
                        <span className="text-xl font-bold text-purple-800">₹{balance.toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Formula: Purchase Amount (from VNN) - Advance Paid</p>
                    </div>
                  </div>
                </div>

                <div className="col-span-12 md:col-span-4">
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-4 rounded-xl border border-amber-200">
                    <h3 className="text-sm font-bold text-slate-800 mb-3">Additions & Deductions</h3>
                    <div className="space-y-2">
                      <InfoRow label="Advance Paid" value={`₹${num(purchaseDetails.advance).toLocaleString()}`} />
                      <InfoRow label="Deduct at Office" value={`₹${totalLoadingExpenses.toLocaleString()}`} />
                      <InfoRow label="Deduct at Warehouse" value={`₹${totalWarehouseExpenses.toLocaleString()}`} />
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
                      <InfoRow label="Purchase Amount" value={`₹${purchaseAmountFromVNN.toLocaleString()}`} />
                      <InfoRow label="Balance Due" value={`₹${balance.toLocaleString()}`} />
                      <div className="mt-3 pt-2 border-t border-purple-200">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-600">JV Entry Required:</span>
                          <span className="font-bold text-purple-700">Dr. / Cr.</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <span className="inline-block w-1 h-1 bg-purple-400 rounded-full"></span>
                          JV need for making the payment in Driver or Motor Owner Account.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Arrival Details with all fields */}
          <div className="mt-4">
            <Card title="Arrival Details (Read Only)">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-3">
                  <label className="text-xs font-bold text-slate-600">Arrival In Date</label>
                  <input type="text" value={arrivalDetails.inDate || '-'} readOnly className="mt-1 w-full rounded-lg border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed" />
                </div>
                <div className="col-span-12 md:col-span-3">
                  <label className="text-xs font-bold text-slate-600">Arrival In Time</label>
                  <input type="text" value={arrivalDetails.inTime || '-'} readOnly className="mt-1 w-full rounded-lg border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed" />
                </div>
                <div className="col-span-12 md:col-span-3">
                  <label className="text-xs font-bold text-slate-600">Departure Out Date</label>
                  <input type="text" value={arrivalDetails.outDate || '-'} readOnly className="mt-1 w-full rounded-lg border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed" />
                </div>
                <div className="col-span-12 md:col-span-3">
                  <label className="text-xs font-bold text-slate-600">Departure Out Time</label>
                  <input type="text" value={arrivalDetails.outTime || '-'} readOnly className="mt-1 w-full rounded-lg border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed" />
                </div>
                <div className="col-span-12 md:col-span-3">
                  <label className="text-xs font-bold text-slate-600">Detention Days</label>
                  <input type="text" value={arrivalDetails.detentionDays || '-'} readOnly className="mt-1 w-full rounded-lg border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed" />
                </div>
                <div className="col-span-12 md:col-span-3">
                  <label className="text-xs font-bold text-slate-600">Detention Amount</label>
                  <input type="text" value={arrivalDetails.detentionAmount ? `₹${num(arrivalDetails.detentionAmount).toLocaleString()}` : '-'} readOnly className="mt-1 w-full rounded-lg border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed" />
                </div>
                <div className="col-span-12">
                  <label className="text-xs font-bold text-slate-600">Remarks</label>
                  <textarea value={arrivalDetails.remarks || '-'} readOnly rows={2} className="mt-1 w-full rounded-lg border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed" />
                </div>
              </div>
            </Card>
          </div>

          {/* Approval Section - EDITABLE */}
          <div className="mt-4">
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
      </div>
    </div>
  );
}