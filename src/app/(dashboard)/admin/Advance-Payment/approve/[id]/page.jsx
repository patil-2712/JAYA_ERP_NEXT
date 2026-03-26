"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

/** =========================
 * CONSTANTS
 ========================= */
const ADVANCE_STATUS_OPTIONS = ["Pending", "Approved", "Rejected", "Paid", "Completed"];
const QUEUE_STATUS_OPTIONS = ["Pending", "Generated"];
const DELIVERY_OPTIONS = ["Urgent", "Normal", "Express", "Scheduled"];
const ORDER_TYPES = ["Sales", "STO Order", "Export", "Import"];
const BILLING_TYPES = ["Single - Order", "Multi - Order"];
const PURCHASE_TYPE_OPTIONS = ["Loading & Unloading", "Unloading Only", "Safi Vehicle"];
const PAYMENT_TERMS_OPTIONS = [
  "80 % Advance", 
  "90 % Advance", 
  "Rs.10,000/- Balance Only", 
  "Rs. 5000/- Balance Only", 
  "Full Payment after Delivery"
];
const RATE_TYPE_OPTIONS = ["Per MT", "Fixed"];
const VENDOR_STATUS_OPTIONS = ["Active", "Blacklisted"];

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
                <td className="border border-yellow-300 px-2 py-2 text-slate-700 text-right">{row.weight || '0'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700 text-right">₹{row.rate || '0'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700 text-right font-medium">₹{row.totalAmount || '0'}</td>
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
export default function ApproveAdvancePayment() {
  const router = useRouter();
  const params = useParams();
  const paymentId = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // State for all data (READ-ONLY except payment status and queue status)
  const [paymentNo, setPaymentNo] = useState("");
  const [header, setHeader] = useState({});
  const [billing, setBilling] = useState({});
  const [orderRows, setOrderRows] = useState([]);
  const [vendorDetails, setVendorDetails] = useState({});
  const [additions, setAdditions] = useState({ items: [], totalAddition: "0" });
  const [deductions, setDeductions] = useState({ items: [], totalDeduction: "0" });
  const [paymentDetails, setPaymentDetails] = useState({});

  // EDITABLE: Payment Status and Queue Status
  const [paymentStatus, setPaymentStatus] = useState("Pending");
  const [queueStatus, setQueueStatus] = useState("Pending");
  const [queueGenerated, setQueueGenerated] = useState(false);

  // Fetch payment data
  useEffect(() => {
    if (paymentId) {
      fetchPaymentData();
    }
  }, [paymentId]);

  const fetchPaymentData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch(`/api/Advance-Payment?id=${paymentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch advance payment');
      }

      const payment = data.data;
      console.log("📦 Payment Data for Approval:", payment);
      
      setPaymentNo(payment.paymentNo || "");
      setQueueGenerated(payment.queueGenerated || false);
      
      // Set header (READ-ONLY)
      if (payment.header) {
        setHeader({
          purchaseNo: payment.header.purchaseNo || payment.purchaseNo || "",
          pricingSerialNo: payment.header.pricingSerialNo || payment.pricingSerialNo || "",
          branch: payment.header.branchName || payment.header.branch || "",
          branchCode: payment.header.branchCode || "",
          date: payment.header.date ? new Date(payment.header.date).toLocaleDateString('en-GB') : "",
          delivery: payment.header.delivery || "Normal",
        });
      }

      // Set billing (READ-ONLY)
      if (payment.billing) {
        setBilling({
          billingType: payment.billing.billingType || "Multi - Order",
          noOfLoadingPoints: payment.billing.noOfLoadingPoints || "1",
          noOfDroppingPoint: payment.billing.noOfDroppingPoint || "1",
          collectionCharges: payment.billing.collectionCharges || "0",
          cancellationCharges: payment.billing.cancellationCharges || "Nil",
          loadingCharges: payment.billing.loadingCharges || "Nil",
          otherCharges: payment.billing.otherCharges || "0",
        });
      }

      // Set order rows (READ-ONLY)
      if (payment.orderRows && payment.orderRows.length > 0) {
        setOrderRows(payment.orderRows);
      }

      // Set vendor details (READ-ONLY)
      if (payment.vendorDetails) {
        const vd = payment.vendorDetails;
        setVendorDetails({
          vendorStatus: vd.vendorStatus || "Active",
          vendorCode: vd.vendorCode || "",
          vendorName: vd.vendorName || "",
          vehicleNo: vd.vehicleNo || "",
          purchaseType: vd.purchaseType || "Loading & Unloading",
          rate: vd.rate || "",
          weight: vd.weight || "",
          amount: vd.amount || "",
          rateType: vd.rateType || "Per MT",
          paymentTerms: vd.paymentTerms || "80 % Advance",
          advance: vd.advance || "",
          accountNo: vd.accountNo || "",
          bankName: vd.bankName || "",
          ifsc: vd.ifsc || "",
          transactionId: vd.transactionId || "",
        });
      }

      // Set additions (READ-ONLY)
      if (payment.additions) {
        setAdditions({
          totalAddition: payment.additions.totalAddition?.toString() || "0",
          items: payment.additions.items || []
        });
      }

      // Set deductions (READ-ONLY)
      if (payment.deductions) {
        setDeductions({
          totalDeduction: payment.deductions.totalDeduction?.toString() || "0",
          items: payment.deductions.items || []
        });
      }

      // Set payment details (READ-ONLY)
      if (payment.paymentDetails) {
        const pd = payment.paymentDetails;
        setPaymentDetails({
          vendorNameDebit: pd.vendorNameDebit || "",
          accountNoCredit: pd.accountNoCredit || "",
          finalAmount: pd.finalAmount || "",
          remarks: pd.remarks || "ADV Payment",
          transactionId: pd.transactionId || "",
          bankVendorCode: pd.bankVendorCode || "",
          paymentDate: pd.paymentDate ? new Date(pd.paymentDate).toLocaleDateString('en-GB') : "",
        });
        
        // Set payment status (EDITABLE)
        setPaymentStatus(pd.paymentStatus || "Pending");
      }

      // Set queue status (EDITABLE)
      setQueueStatus(payment.queueGenerated ? "Generated" : "Pending");

    } catch (error) {
      console.error('Error fetching payment:', error);
      setError(error.message);
      alert(`❌ Failed to load payment: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!paymentStatus) {
      alert("Please select payment status");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch current data first
      const fetchRes = await fetch(`/api/Advance-Payment?id=${paymentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const fetchData = await fetchRes.json();
      
      if (!fetchData.success) {
        throw new Error('Failed to fetch payment data');
      }
      
      const currentData = fetchData.data;
      
      // Calculate queueGenerated boolean from queueStatus
      const isQueueGenerated = queueStatus === "Generated";
      
      // Update payment status and queue status
      const updatedData = {
        ...currentData,
        paymentDetails: {
          ...currentData.paymentDetails,
          paymentStatus: paymentStatus
        },
        queueGenerated: isQueueGenerated
      };
      
      // Send update
      const res = await fetch('/api/Advance-Payment', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: paymentId,
          ...updatedData
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert(`✅ Payment status updated to ${paymentStatus} and Queue status updated to ${queueStatus} successfully!`);
        router.push('/admin/Advance-Payment');
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

  // Calculate balance
  const calculateBalance = () => {
    const amount = num(vendorDetails.amount);
    const advance = num(vendorDetails.advance);
    const totalAdditions = num(additions.totalAddition);
    const totalDeductions = num(deductions.totalDeduction);
    return (amount - advance - totalDeductions + totalAdditions).toFixed(2);
  };

  // Calculate total order amount
  const calculateTotalOrderAmount = () => {
    return orderRows.reduce((sum, row) => sum + num(row.totalAmount), 0);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading advance payment...</p>
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
                onClick={() => router.push('/admin/Advance-Payment')}
                className="text-yellow-600 hover:text-yellow-800 font-medium text-sm flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to List
              </button>
              <div className="text-lg font-extrabold text-slate-900">
                Approve Advance Payment: {paymentNo}
              </div>
            </div>
            <div className="text-xs text-yellow-600 mt-1 font-medium">
              ⓘ Only Payment Status and Queue Status are editable. All other fields are read-only.
            </div>
            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
              <span>Purchase No: {header.purchaseNo || "N/A"}</span>
              {header.pricingSerialNo && (
                <>
                  <span>|</span>
                  <span className="text-purple-600">PSN: {header.pricingSerialNo}</span>
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
        
        {/* ===== HEADER INFORMATION (READ ONLY) ===== */}
        <Card title="Purchase Information (Read Only)">
          <div className="grid grid-cols-12 gap-3">
            <Input col="col-span-12 md:col-span-2" label="Purchase No" value={header.purchaseNo} readOnly={true} />
            <Input col="col-span-12 md:col-span-2" label="Pricing Serial No" value={header.pricingSerialNo} readOnly={true} />
            <Input col="col-span-12 md:col-span-2" label="Branch" value={header.branch} readOnly={true} />
            <Input col="col-span-12 md:col-span-2" label="Date" value={header.date} readOnly={true} />
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
              <div className="text-xl font-extrabold text-yellow-700">₹{calculateTotalOrderAmount().toLocaleString()}</div>
            </div>
          </div>
        </Card>

        {/* ===== ADVANCE PAYMENT PANEL ===== */}
        <Card title="Advance Payment Details (Read Only)">
          <div className="grid grid-cols-12 gap-4">
            {/* Vendor Information */}
            <div className="col-span-12 md:col-span-4">
              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Vendor Information</h3>
                <div className="space-y-3">
                  <InfoRow label="Vendor Status" value={vendorDetails.vendorStatus} />
                  <InfoRow label="Vendor Code" value={vendorDetails.vendorCode} />
                  <InfoRow label="Vendor Name" value={vendorDetails.vendorName} />
                  <InfoRow label="Vehicle No" value={vendorDetails.vehicleNo} />
                  <InfoRow label="Purchase Type" value={vendorDetails.purchaseType} />
                </div>
              </div>
            </div>

            {/* Payment Calculation */}
            <div className="col-span-12 md:col-span-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Payment Calculation</h3>
                <div className="space-y-3">
                  <InfoRow label="Rate (₹)" value={`₹${vendorDetails.rate}`} />
                  <InfoRow label="Weight (MT)" value={vendorDetails.weight} />
                  <InfoRow label="Amount (₹)" value={`₹${vendorDetails.amount}`} />
                  <InfoRow label="Rate Type" value={vendorDetails.rateType} />
                  <InfoRow label="Payment Terms" value={vendorDetails.paymentTerms} />
                  <InfoRow label="Advance (₹)" value={`₹${vendorDetails.advance}`} />
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="col-span-12 md:col-span-4">
              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Bank Details</h3>
                <div className="space-y-3">
                  <InfoRow label="Account No" value={vendorDetails.accountNo} />
                  <InfoRow label="Bank Name" value={vendorDetails.bankName} />
                  <InfoRow label="IFSC Code" value={vendorDetails.ifsc} />
                  <InfoRow label="Transaction ID" value={vendorDetails.transactionId} />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* ===== ADDITIONS & DEDUCTIONS (READ ONLY) ===== */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-6">
            <Card title="Additions (+) - Extra Charges (Read Only)">
              <ChargesTable rows={additions.items} type="addition" />
              <div className="mt-2 text-right font-bold text-green-700">
                Total Additions: ₹{num(additions.totalAddition).toLocaleString()}
              </div>
            </Card>
          </div>

          <div className="col-span-12 md:col-span-6">
            <Card title="Deductions (-) - Adjustments (Read Only)">
              <ChargesTable rows={deductions.items} type="deduction" />
              <div className="mt-2 text-right font-bold text-red-700">
                Total Deductions: ₹{num(deductions.totalDeduction).toLocaleString()}
              </div>
            </Card>
          </div>
        </div>

        {/* ===== BALANCE & FINAL AMOUNT (READ ONLY) ===== */}
        <div className="mt-4">
          <div className="grid grid-cols-12 gap-4">
            {/* Balance Calculation Details */}
            <div className="col-span-12 md:col-span-6">
              <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                <h3 className="text-sm font-bold text-purple-800 mb-3">Balance Calculation</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Total Amount:</span>
                    <span className="font-bold">₹{num(vendorDetails.amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Advance Payment:</span>
                    <span className="font-bold text-blue-600">- ₹{num(vendorDetails.advance).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Total Additions:</span>
                    <span className="font-bold text-green-600">+ ₹{num(additions.totalAddition).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Total Deductions:</span>
                    <span className="font-bold text-red-600">- ₹{num(deductions.totalDeduction).toLocaleString()}</span>
                  </div>
                  <div className="border-t border-purple-200 pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span className="text-purple-800">Calculated Balance:</span>
                      <span className="text-xl text-purple-700">₹{calculateBalance().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Final Payment Amount */}
            <div className="col-span-12 md:col-span-6">
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 h-full flex items-center justify-center">
                <div className="text-center w-full">
                  <h3 className="text-sm font-bold text-blue-800 mb-2">Final Payment Amount</h3>
                  <div className="text-4xl font-bold text-blue-700 bg-white border border-blue-300 rounded-lg px-4 py-4 text-center">
                    {formatCurrency(calculateBalance())}
                  </div>
                  <p className="text-xs text-blue-600 mt-2">Balance amount to be paid after adjustments</p>
                  <p className="text-xs text-slate-500 mt-1">
                    (Amount - Advance - Deductions + Additions)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== PAYMENT TRANSACTION DETAILS ===== */}
        <Card title="Payment Transaction Details">
          <div className="grid grid-cols-12 gap-4">
            <Input col="col-span-12 md:col-span-3" label="Vendor Name (Debit)" value={paymentDetails.vendorNameDebit} readOnly={true} />
            <Input col="col-span-12 md:col-span-3" label="Account No (Credit)" value={paymentDetails.accountNoCredit} readOnly={true} />
            <Input col="col-span-12 md:col-span-2" label="Final Amount" value={formatCurrency(calculateBalance())} readOnly={true} />
            <Input col="col-span-12 md:col-span-2" label="Payment Date" value={paymentDetails.paymentDate} readOnly={true} />
            
            {/* Payment Status - EDITABLE */}
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Payment Status *</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
              >
                {ADVANCE_STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <Input col="col-span-12 md:col-span-3" label="Remarks" value={paymentDetails.remarks} readOnly={true} />
            <Input col="col-span-12 md:col-span-3" label="Transaction ID" value={paymentDetails.transactionId} readOnly={true} />
            <Input col="col-span-12 md:col-span-3" label="Bank Vendor Code" value={paymentDetails.bankVendorCode} readOnly={true} />
            
            {/* Queue Status - EDITABLE */}
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Queue Status *</label>
              <select
                value={queueStatus}
                onChange={(e) => setQueueStatus(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
              >
                {QUEUE_STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
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
                  <InfoRow label="Purchase No" value={header.purchaseNo} />
                  <InfoRow label="Total Orders" value={orderRows.length} />
                  <InfoRow label="Total Amount" value={formatCurrency(calculateTotalOrderAmount())} />
                </div>
              </div>
            </div>

            <div className="col-span-12 md:col-span-4">
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-4 rounded-xl border border-amber-200">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Vendor Summary</h3>
                <div className="space-y-2">
                  <InfoRow label="Vendor Name" value={vendorDetails.vendorName} />
                  <InfoRow label="Vehicle No" value={vendorDetails.vehicleNo} />
                  <InfoRow label="Advance Amount" value={formatCurrency(vendorDetails.advance)} />
                </div>
              </div>
            </div>

            <div className="col-span-12 md:col-span-4">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Status Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Payment Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      paymentStatus === 'Approved' ? 'bg-green-100 text-green-800' :
                      paymentStatus === 'Rejected' ? 'bg-red-100 text-red-800' :
                      paymentStatus === 'Paid' ? 'bg-blue-100 text-blue-800' :
                      paymentStatus === 'Completed' ? 'bg-purple-100 text-purple-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {paymentStatus}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Queue Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      queueStatus === 'Generated' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {queueStatus}
                    </span>
                  </div>
                  <InfoRow label="Balance Amount" value={formatCurrency(calculateBalance())} />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}