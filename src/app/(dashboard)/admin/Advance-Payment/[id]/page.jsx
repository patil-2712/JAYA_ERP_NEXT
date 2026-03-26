"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";

/** =========================
 * CONSTANTS
 ========================= */
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
const ADVANCE_STATUS_OPTIONS = ["Pending", "Approved", "Rejected", "Paid", "Completed"];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function useVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/vendors', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setVendors(data.data);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  return { vendors, loading, fetchVendors };
}

function defaultOrderRow() {
  return {
    _id: uid(),
    orderNo: "",
    partyName: "",
    plantCode: "",
    plantName: "",
    orderType: "",
    pinCode: "",
    state: "",
    district: "",
    from: "",
    to: "",
    locationRate: "",
    priceList: "",
    weight: "",
    rate: "",
    totalAmount: "",
  };
}

function defaultAdditionItem() {
  return {
    _id: uid(),
    description: "Loading Charges",
    amount: "0",
  };
}

function defaultDeductionItem() {
  return {
    _id: uid(),
    description: "Detention Charges",
    amount: "0",
  };
}

export default function EditAdvancePayment() {
  const router = useRouter();
  const params = useParams();
  const paymentId = params.id;

  const vendorHook = useVendors();

  const [branches, setBranches] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState(null);

  const [header, setHeader] = useState({
    purchaseNo: "",
    pricingSerialNo: "",
    branch: "",
    branchName: "",
    branchCode: "",
    date: new Date().toISOString().split('T')[0],
    delivery: "Normal",
  });

  const [billing, setBilling] = useState({
    billingType: "Multi - Order",
    noOfLoadingPoints: "1",
    noOfDroppingPoint: "1",
    collectionCharges: "0",
    cancellationCharges: "Nil",
    loadingCharges: "Nil",
    otherCharges: "0",
  });

  const [orderRows, setOrderRows] = useState([]);

  const [vendorDetails, setVendorDetails] = useState({
    vendorStatus: "Active",
    vendorCode: "",
    vendorName: "",
    vehicleNo: "",
    purchaseType: "Loading & Unloading",
    rate: "",
    weight: "",
    amount: "",
    rateType: "Per MT",
    paymentTerms: "80 % Advance",
    advance: "",
    accountNo: "",
    bankName: "",
    ifsc: "",
    transactionId: "",
  });

  const [additions, setAdditions] = useState({
    totalAddition: "0",
    items: []
  });

  const [deductions, setDeductions] = useState({
    totalDeduction: "0",
    items: []
  });

  const [paymentDetails, setPaymentDetails] = useState({
    vendorNameDebit: "",
    accountNoCredit: "",
    finalAmount: "",
    remarks: "ADV Payment",
    transactionId: "",
    bankVendorCode: "",
    paymentDate: new Date().toISOString().split('T')[0],
    paymentStatus: "Pending"
  });

  const [queueGenerated, setQueueGenerated] = useState(false);
  const [paymentNo, setPaymentNo] = useState("");

  const billingColumns = [
    { key: "billingType", label: "Billing Type", options: BILLING_TYPES },
    { key: "noOfLoadingPoints", label: "No. of Loading Points", type: "number" },
    { key: "noOfDroppingPoint", label: "No. of Droping Point", type: "number" },
    { key: "collectionCharges", label: "Collection Charges", type: "number" },
    { key: "cancellationCharges", label: "Cancellation Charges", type: "text" },
    { key: "loadingCharges", label: "Loading Charges", type: "text" },
    { key: "otherCharges", label: "Other Charges", type: "number" },
  ];

  useEffect(() => {
    if (paymentId) {
      fetchPaymentData();
    }
    fetchData();
  }, [paymentId]);

  const fetchPaymentData = async () => {
    setFetchLoading(true);
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
      console.log("📦 Payment Data:", payment);
      
      setPaymentNo(payment.paymentNo || "");
      setQueueGenerated(payment.queueGenerated || false);
      
      // Set header
      if (payment.header) {
        setHeader({
          purchaseNo: payment.header.purchaseNo || payment.purchaseNo || "",
          pricingSerialNo: payment.header.pricingSerialNo || payment.pricingSerialNo || "",
          branch: payment.header.branch || "",
          branchName: payment.header.branchName || "",
          branchCode: payment.header.branchCode || "",
          date: payment.header.date ? new Date(payment.header.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          delivery: payment.header.delivery || "Normal",
        });
      }

      // Set billing
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

      // Set order rows
      if (payment.orderRows && payment.orderRows.length > 0) {
        const processedRows = payment.orderRows.map(row => ({
          ...row,
          _id: row._id || uid(),
          weight: row.weight?.toString() || "",
          rate: row.rate?.toString() || "",
          totalAmount: row.totalAmount?.toString() || "",
          locationRate: row.locationRate?.toString() || "",
        }));
        setOrderRows(processedRows);
      } else {
        setOrderRows([defaultOrderRow()]);
      }

      // Set vendor details
      if (payment.vendorDetails) {
        const vd = payment.vendorDetails;
        setVendorDetails({
          vendorStatus: vd.vendorStatus || "Active",
          vendorCode: vd.vendorCode || "",
          vendorName: vd.vendorName || "",
          vehicleNo: vd.vehicleNo || "",
          purchaseType: vd.purchaseType || "Loading & Unloading",
          rate: vd.rate?.toString() || "",
          weight: vd.weight?.toString() || "",
          amount: vd.amount?.toString() || "",
          rateType: vd.rateType || "Per MT",
          paymentTerms: vd.paymentTerms || "80 % Advance",
          advance: vd.advance?.toString() || "",
          accountNo: vd.accountNo || "",
          bankName: vd.bankName || "",
          ifsc: vd.ifsc || "",
          transactionId: vd.transactionId || "",
        });
      }

      // Set additions
      if (payment.additions) {
        setAdditions({
          totalAddition: payment.additions.totalAddition?.toString() || "0",
          items: (payment.additions.items || []).map(item => ({
            _id: item._id || uid(),
            description: item.description || "Addition",
            amount: item.amount?.toString() || "0"
          }))
        });
      }

      // Set deductions
      if (payment.deductions) {
        setDeductions({
          totalDeduction: payment.deductions.totalDeduction?.toString() || "0",
          items: (payment.deductions.items || []).map(item => ({
            _id: item._id || uid(),
            description: item.description || "Deduction",
            amount: item.amount?.toString() || "0"
          }))
        });
      }

      // Set payment details
      if (payment.paymentDetails) {
        const pd = payment.paymentDetails;
        setPaymentDetails({
          vendorNameDebit: pd.vendorNameDebit || "",
          accountNoCredit: pd.accountNoCredit || "",
          finalAmount: pd.finalAmount?.toString() || "",
          remarks: pd.remarks || "ADV Payment",
          transactionId: pd.transactionId || "",
          bankVendorCode: pd.bankVendorCode || "",
          paymentDate: pd.paymentDate ? new Date(pd.paymentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          paymentStatus: pd.paymentStatus || "Pending",
        });
      }

    } catch (error) {
      console.error('Error fetching payment:', error);
      setApiError(error.message);
      alert(`❌ Failed to load payment: ${error.message}`);
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        vendorHook.fetchVendors(),
        fetchBranches()
      ]);
      
      setVendors(vendorHook.vendors);
    } catch (error) {
      console.error('Error fetching data:', error);
      setApiError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const res = await fetch('/api/branches', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setBranches(data.data);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const addOrderRow = () => setOrderRows([...orderRows, defaultOrderRow()]);

  const updateOrderRow = (rowId, key, value) => {
    setOrderRows((prev) =>
      prev.map((r) => {
        if (r._id === rowId) {
          const updatedRow = { ...r, [key]: value };
          
          if (key === "weight" || key === "rate") {
            const weight = num(updatedRow.weight);
            const rate = num(updatedRow.rate);
            updatedRow.totalAmount = (weight * rate).toString();
          }
          
          return updatedRow;
        }
        return r;
      })
    );
  };

  const removeOrderRow = (rowId) => {
    if (orderRows.length > 1) {
      setOrderRows((prev) => prev.filter((r) => r._id !== rowId));
    } else {
      alert("At least one order row is required");
    }
  };

  const duplicateOrderRow = (rowId) => {
    const row = orderRows.find((r) => r._id === rowId);
    if (!row) return;
    setOrderRows([...orderRows, { ...row, _id: uid(), orderNo: "" }]);
  };

  const addAdditionItem = () => {
    setAdditions({
      ...additions,
      items: [...additions.items, defaultAdditionItem()]
    });
  };

  const updateAdditionItem = (itemId, key, value) => {
    const updatedItems = additions.items.map(item => 
      item._id === itemId ? { ...item, [key]: value } : item
    );
    
    const totalAddition = updatedItems.reduce((sum, item) => sum + num(item.amount), 0);
    
    setAdditions({
      totalAddition: totalAddition.toString(),
      items: updatedItems
    });
  };

  const removeAdditionItem = (itemId) => {
    if (additions.items.length > 1) {
      const updatedItems = additions.items.filter(item => item._id !== itemId);
      const totalAddition = updatedItems.reduce((sum, item) => sum + num(item.amount), 0);
      
      setAdditions({
        totalAddition: totalAddition.toString(),
        items: updatedItems
      });
    } else {
      alert("At least one addition item is required");
    }
  };

  const addDeductionItem = () => {
    setDeductions({
      ...deductions,
      items: [...deductions.items, defaultDeductionItem()]
    });
  };

  const updateDeductionItem = (itemId, key, value) => {
    const updatedItems = deductions.items.map(item => 
      item._id === itemId ? { ...item, [key]: value } : item
    );
    
    const totalDeduction = updatedItems.reduce((sum, item) => sum + num(item.amount), 0);
    
    setDeductions({
      totalDeduction: totalDeduction.toString(),
      items: updatedItems
    });
  };

  const removeDeductionItem = (itemId) => {
    if (deductions.items.length > 1) {
      const updatedItems = deductions.items.filter(item => item._id !== itemId);
      const totalDeduction = updatedItems.reduce((sum, item) => sum + num(item.amount), 0);
      
      setDeductions({
        totalDeduction: totalDeduction.toString(),
        items: updatedItems
      });
    } else {
      alert("At least one deduction item is required");
    }
  };

  const handleBillingTypeChange = (value) => {
    setBilling((prev) => ({ ...prev, billingType: value }));
  };

  const handleVendorSelect = (vendor) => {
    if (vendor) {
      setVendorDetails({
        ...vendorDetails,
        vendorName: vendor.supplierName || vendor.name || "",
        vendorCode: vendor.supplierCode || vendor.code || "",
        accountNo: vendor.accountNo || "",
        bankName: vendor.bankName || "",
        ifsc: vendor.ifsc || "",
      });
      setPaymentDetails({
        ...paymentDetails,
        vendorNameDebit: vendor.supplierName || vendor.name || "",
        accountNoCredit: vendor.accountNo || "",
        bankVendorCode: vendor.supplierCode || vendor.code || "",
      });
    }
  };

  const calculateBalance = () => {
    const amount = num(vendorDetails.amount);
    const advance = num(vendorDetails.advance);
    const totalAdditions = num(additions.totalAddition);
    const totalDeductions = num(deductions.totalDeduction);
    return (amount - advance - totalDeductions + totalAdditions).toFixed(2);
  };

  const calculateTotalOrderAmount = () => {
    return orderRows.reduce((sum, row) => sum + num(row.totalAmount), 0);
  };

  const handleGenerateQueue = () => {
    if (queueGenerated) {
      alert("Queue already generated for this payment");
      return;
    }
    
    const finalAmount = calculateBalance();
    alert(`✅ Payment queue ready to generate for ${paymentDetails.vendorNameDebit}\nAmount: ₹${num(finalAmount).toLocaleString()}`);
    
    // In a real app, you would call an API here
    setQueueGenerated(true);
  };

  const handleUpdate = async () => {
    if (!header.branch) {
      alert("Please select a branch");
      return;
    }

    if (!vendorDetails.vendorName) {
      alert("Please select a vendor");
      return;
    }

    if (queueGenerated) {
      alert("Cannot update payment after queue generation");
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      
      const payload = {
        id: paymentId,
        header,
        billing,
        orderRows,
        vendorDetails: {
          ...vendorDetails,
          rate: num(vendorDetails.rate),
          weight: num(vendorDetails.weight),
          amount: num(vendorDetails.amount),
          advance: num(vendorDetails.advance),
        },
        additions: {
          totalAddition: num(additions.totalAddition),
          items: additions.items.map(item => ({
            _id: item._id,
            description: item.description,
            amount: num(item.amount)
          }))
        },
        deductions: {
          totalDeduction: num(deductions.totalDeduction),
          items: deductions.items.map(item => ({
            _id: item._id,
            description: item.description,
            amount: num(item.amount)
          }))
        },
        paymentDetails: {
          ...paymentDetails,
          finalAmount: num(calculateBalance()), // Set final amount to balance
        },
        balance: calculateBalance(),
        totalOrderAmount: calculateTotalOrderAmount(),
        queueGenerated,
      };

      console.log("Updating advance payment:", payload);

      const res = await fetch('/api/Advance-Payment', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: `HTTP error! status: ${res.status}` }));
        throw new Error(errorData.message || 'Failed to update advance payment');
      }

      const data = await res.json();
      alert(`✅ Advance Payment updated successfully!\nPayment No: ${paymentNo}`);
      
      router.push('/admin/Advance-Payment');
      
    } catch (error) {
      console.error('Error updating advance payment:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading advance payment...</p>
          </div>
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
                onClick={() => router.push('/admin/Advance-Payment')}
                className="text-emerald-600 hover:text-emerald-800 font-medium text-sm flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to List
              </button>
              <div className="text-lg font-extrabold text-slate-900">
                Edit Advance Payment: {paymentNo}
              </div>
            </div>
            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
              <span>Purchase No: {header.purchaseNo || "N/A"}</span>
              {header.pricingSerialNo && (
                <>
                  <span>|</span>
                  <span className="text-purple-600">PSN: {header.pricingSerialNo}</span>
                </>
              )}
              {queueGenerated && (
                <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-xs">
                  ✓ Queue Generated
                </span>
              )}
              {apiError && (
                <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full text-xs">
                  ⚠️ {apiError}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!queueGenerated && (
              <button
                onClick={handleUpdate}
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
                    Updating...
                  </span>
                ) : 'Update Payment'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-full p-4">
        {/* Header Information */}
        <Card title="Purchase Information">
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Purchase No</label>
              <input
                type="text"
                value={header.purchaseNo}
                onChange={(e) => setHeader({ ...header, purchaseNo: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                readOnly={queueGenerated}
              />
            </div>

            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Pricing Serial No</label>
              <input
                type="text"
                value={header.pricingSerialNo}
                onChange={(e) => setHeader({ ...header, pricingSerialNo: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                readOnly={queueGenerated}
              />
            </div>

            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Branch *</label>
              <SearchableDropdown
                items={branches}
                selectedId={header.branch}
                onSelect={(branch) => setHeader({ 
                  ...header, 
                  branch: branch?._id || '',
                  branchName: branch?.name || '',
                  branchCode: branch?.code || ''
                })}
                placeholder="Search branch..."
                displayField="name"
                codeField="code"
                disabled={queueGenerated}
              />
            </div>

            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Date</label>
              <input
                type="date"
                value={header.date}
                onChange={(e) => setHeader({ ...header, date: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                disabled={queueGenerated}
              />
            </div>

            <div className="col-span-12 md:col-span-2">
              <Select
                label="Delivery"
                value={header.delivery}
                onChange={(v) => setHeader({ ...header, delivery: v })}
                options={DELIVERY_OPTIONS}
                disabled={queueGenerated}
              />
            </div>
          </div>
        </Card>

        {/* Billing Type / Charges Table */}
        <div className="mt-4">
          <Card title="Billing Type / Charges">
            <div className="overflow-auto rounded-xl border border-yellow-300">
              <table className="min-w-full w-full text-sm">
                <thead className="sticky top-0 bg-yellow-400">
                  <tr>
                    {billingColumns.map((col) => (
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
                  <tr className="hover:bg-yellow-50 even:bg-slate-50">
                    {billingColumns.map((col) => (
                      <td key={col.key} className="border border-yellow-300 px-2 py-2">
                        {col.options ? (
                          <select
                            value={billing[col.key] || ""}
                            onChange={(e) => {
                              if (col.key === "billingType") {
                                handleBillingTypeChange(e.target.value);
                              } else {
                                setBilling(prev => ({ ...prev, [col.key]: e.target.value }));
                              }
                            }}
                            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
                            disabled={queueGenerated}
                          >
                            <option value="">Select {col.label}</option>
                            {col.options.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={col.type || "text"}
                            value={billing[col.key] || ""}
                            onChange={(e) => setBilling(prev => ({ ...prev, [col.key]: e.target.value }))}
                            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
                            placeholder={`Enter ${col.label}`}
                            disabled={queueGenerated}
                          />
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Orders Table */}
        <div className="mt-4">
          <Card 
            title="Order Details"
            right={
              !queueGenerated && (
                <div className="flex gap-2">
                  <button
                    onClick={addOrderRow}
                    className="rounded-xl bg-yellow-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-yellow-700 transition"
                  >
                    + Add Order
                  </button>
                </div>
              )
            }
          >
            <div className="overflow-auto rounded-xl border border-yellow-300">
              <table className="min-w-full w-full text-sm">
                <thead className="sticky top-0 bg-yellow-400 z-10">
                  <tr>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold">Order No</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold">Party Name</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold">Plant</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold">Order Type</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold">Pin Code</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold">State</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold">District</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold">From</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold">To</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold">Location Rate</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold">Price List</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold">Weight</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold">Rate</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold">Total Amount</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orderRows.map((row) => (
                    <tr key={row._id} className="hover:bg-yellow-50 even:bg-slate-50">
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          value={row.orderNo || ""}
                          onChange={(e) => updateOrderRow(row._id, 'orderNo', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                          placeholder="Order No"
                          disabled={queueGenerated}
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          value={row.partyName || ""}
                          onChange={(e) => updateOrderRow(row._id, 'partyName', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                          placeholder="Party Name"
                          disabled={queueGenerated}
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          value={row.plantName || row.plantCode || ""}
                          onChange={(e) => updateOrderRow(row._id, 'plantName', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                          placeholder="Plant"
                          disabled={queueGenerated}
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <select
                          value={row.orderType || ""}
                          onChange={(e) => updateOrderRow(row._id, 'orderType', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm"
                          disabled={queueGenerated}
                        >
                          <option value="">Select</option>
                          {ORDER_TYPES.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          value={row.pinCode || ""}
                          onChange={(e) => updateOrderRow(row._id, 'pinCode', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                          placeholder="Pin Code"
                          disabled={queueGenerated}
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          value={row.state || ""}
                          onChange={(e) => updateOrderRow(row._id, 'state', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                          placeholder="State"
                          disabled={queueGenerated}
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          value={row.district || ""}
                          onChange={(e) => updateOrderRow(row._id, 'district', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                          placeholder="District"
                          disabled={queueGenerated}
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          value={row.from || ""}
                          onChange={(e) => updateOrderRow(row._id, 'from', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                          placeholder="From"
                          disabled={queueGenerated}
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          value={row.to || ""}
                          onChange={(e) => updateOrderRow(row._id, 'to', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                          placeholder="To"
                          disabled={queueGenerated}
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          value={row.locationRate || ""}
                          onChange={(e) => updateOrderRow(row._id, 'locationRate', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                          placeholder="Location Rate"
                          disabled={queueGenerated}
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          value={row.priceList || ""}
                          onChange={(e) => updateOrderRow(row._id, 'priceList', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                          placeholder="Price List"
                          disabled={queueGenerated}
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="number"
                          value={row.weight || ""}
                          onChange={(e) => updateOrderRow(row._id, 'weight', e.target.value)}
                          className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                          placeholder="0"
                          disabled={queueGenerated}
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="number"
                          value={row.rate || ""}
                          onChange={(e) => updateOrderRow(row._id, 'rate', e.target.value)}
                          className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                          placeholder="0"
                          disabled={queueGenerated}
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="number"
                          value={row.totalAmount || (num(row.weight) * num(row.rate)).toString()}
                          readOnly
                          className="w-24 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm font-bold text-emerald-700"
                          disabled={queueGenerated}
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        {!queueGenerated && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => duplicateOrderRow(row._id)}
                              className="rounded-lg border border-yellow-500 bg-yellow-100 px-2 py-1.5 text-xs font-bold text-yellow-800 hover:bg-yellow-200"
                              title="Duplicate"
                            >
                              Dup
                            </button>
                            <button
                              onClick={() => removeOrderRow(row._id)}
                              className="rounded-lg bg-red-500 px-2 py-1.5 text-xs font-bold text-white hover:bg-red-600"
                              title="Remove"
                            >
                              Del
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-yellow-100">
                  <tr>
                    <td colSpan="13" className="border border-yellow-300 px-3 py-2 text-right font-bold">
                      Total Order Amount:
                    </td>
                    <td className="border border-yellow-300 px-3 py-2 font-bold text-emerald-800">
                      ₹{calculateTotalOrderAmount().toLocaleString()}
                    </td>
                    <td className="border border-yellow-300 px-3 py-2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </div>

        {/* Advance Payment Panel */}
        <div className="mt-4">
          <Card title="Advance Payment - Panel">
            <div className="grid grid-cols-12 gap-4">
              {/* Vendor Information */}
              <div className="col-span-12 md:col-span-4">
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 h-full">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Vendor Information</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600">Vendor Status</label>
                      <select
                        value={vendorDetails.vendorStatus}
                        onChange={(e) => setVendorDetails({ ...vendorDetails, vendorStatus: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                        disabled={queueGenerated}
                      >
                        {VENDOR_STATUS_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600">Vendor Code</label>
                      <input
                        type="text"
                        value={vendorDetails.vendorCode}
                        onChange={(e) => setVendorDetails({ ...vendorDetails, vendorCode: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                        readOnly
                        disabled={queueGenerated}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600">Vendor Name *</label>
                      <SearchableDropdown
                        items={vendors}
                        selectedId={vendorDetails.vendorName}
                        onSelect={handleVendorSelect}
                        placeholder="Search vendor..."
                        displayField="supplierName"
                        codeField="supplierCode"
                        disabled={queueGenerated}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600">Vehicle No</label>
                      <input
                        type="text"
                        value={vendorDetails.vehicleNo}
                        onChange={(e) => setVendorDetails({ ...vendorDetails, vehicleNo: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                        placeholder="HR38X8960"
                        disabled={queueGenerated}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600">Purchase - Type</label>
                      <select
                        value={vendorDetails.purchaseType}
                        onChange={(e) => setVendorDetails({ ...vendorDetails, purchaseType: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                        disabled={queueGenerated}
                      >
                        {PURCHASE_TYPE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Calculation */}
              <div className="col-span-12 md:col-span-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 h-full">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Payment Calculation</h3>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-bold text-slate-600">Rate (₹)</label>
                        <input
                          type="number"
                          value={vendorDetails.rate}
                          onChange={(e) => {
                            const rate = e.target.value;
                            const amount = num(rate) * num(vendorDetails.weight);
                            setVendorDetails({ 
                              ...vendorDetails, 
                              rate,
                              amount: amount.toString()
                            });
                          }}
                          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                          disabled={queueGenerated}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-600">Weight (MT)</label>
                        <input
                          type="number"
                          value={vendorDetails.weight}
                          onChange={(e) => {
                            const weight = e.target.value;
                            const amount = num(vendorDetails.rate) * num(weight);
                            setVendorDetails({ 
                              ...vendorDetails, 
                              weight,
                              amount: amount.toString()
                            });
                          }}
                          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                          disabled={queueGenerated}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600">Amount (₹)</label>
                      <input
                        type="number"
                        value={vendorDetails.amount}
                        readOnly
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-bold text-emerald-700"
                        disabled={queueGenerated}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600">Rate - Type</label>
                      <select
                        value={vendorDetails.rateType}
                        onChange={(e) => setVendorDetails({ ...vendorDetails, rateType: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                        disabled={queueGenerated}
                      >
                        {RATE_TYPE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600">Payment Terms</label>
                      <select
                        value={vendorDetails.paymentTerms}
                        onChange={(e) => setVendorDetails({ ...vendorDetails, paymentTerms: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                        disabled={queueGenerated}
                      >
                        {PAYMENT_TERMS_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600">Advance (₹)</label>
                      <input
                        type="number"
                        value={vendorDetails.advance}
                        onChange={(e) => {
                          const advance = e.target.value;
                          setVendorDetails({ ...vendorDetails, advance });
                          setPaymentDetails(prev => ({
                            ...prev,
                            finalAmount: advance
                          }));
                        }}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                        disabled={queueGenerated}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="col-span-12 md:col-span-4">
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 h-full">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Bank Details</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600">Account No (Credit)</label>
                      <input
                        type="text"
                        value={vendorDetails.accountNo}
                        onChange={(e) => setVendorDetails({ ...vendorDetails, accountNo: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                        placeholder="ICICI3642"
                        disabled={queueGenerated}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600">Bank Name</label>
                      <input
                        type="text"
                        value={vendorDetails.bankName}
                        onChange={(e) => setVendorDetails({ ...vendorDetails, bankName: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                        placeholder="ICICI Bank"
                        disabled={queueGenerated}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600">IFSC Code</label>
                      <input
                        type="text"
                        value={vendorDetails.ifsc}
                        onChange={(e) => setVendorDetails({ ...vendorDetails, ifsc: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                        placeholder="ICIC0003642"
                        disabled={queueGenerated}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600">Transaction ID</label>
                      <input
                        type="text"
                        value={vendorDetails.transactionId}
                        onChange={(e) => setVendorDetails({ ...vendorDetails, transactionId: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                        placeholder="6412878541272"
                        disabled={queueGenerated}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Additions Section */}
        <div className="mt-4">
          <Card 
            title="Additions (+) - Extra Charges"
            right={
              !queueGenerated && (
                <button
                  onClick={addAdditionItem}
                  className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700"
                >
                  + Add Addition
                </button>
              )
            }
          >
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <h4 className="text-sm font-bold text-green-800 mb-3">Addition Items</h4>
                  
                  {additions.items.length === 0 ? (
                    <div className="text-center py-4 text-slate-500 border-2 border-dashed border-green-200 rounded-lg">
                      <p>No additions added.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {additions.items.map((item) => (
                        <div key={item._id} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateAdditionItem(item._id, 'description', e.target.value)}
                            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-green-500"
                            placeholder="Description"
                            disabled={queueGenerated}
                          />
                          <input
                            type="number"
                            value={item.amount}
                            onChange={(e) => updateAdditionItem(item._id, 'amount', e.target.value)}
                            className="w-32 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-green-500 text-right"
                            placeholder="Amount"
                            disabled={queueGenerated}
                          />
                          {!queueGenerated && (
                            <button
                              onClick={() => removeAdditionItem(item._id)}
                              className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                              title="Remove"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="col-span-12 md:col-span-6">
                <div className="bg-green-100 p-4 rounded-xl border border-green-300 h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-sm font-bold text-green-800 mb-2">Total Additions</div>
                    <div className="text-3xl font-bold text-green-700">
                      ₹{num(additions.totalAddition).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Deductions Section */}
        <div className="mt-4">
          <Card 
            title="Deductions (-) - Adjustments"
            right={
              !queueGenerated && (
                <button
                  onClick={addDeductionItem}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700"
                >
                  + Add Deduction
                </button>
              )
            }
          >
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
                <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                  <h4 className="text-sm font-bold text-red-800 mb-3">Deduction Items</h4>
                  
                  {deductions.items.length === 0 ? (
                    <div className="text-center py-4 text-slate-500 border-2 border-dashed border-red-200 rounded-lg">
                      <p>No deductions added.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {deductions.items.map((item) => (
                        <div key={item._id} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateDeductionItem(item._id, 'description', e.target.value)}
                            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-red-500"
                            placeholder="Description"
                            disabled={queueGenerated}
                          />
                          <input
                            type="number"
                            value={item.amount}
                            onChange={(e) => updateDeductionItem(item._id, 'amount', e.target.value)}
                            className="w-32 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-red-500 text-right"
                            placeholder="Amount"
                            disabled={queueGenerated}
                          />
                          {!queueGenerated && (
                            <button
                              onClick={() => removeDeductionItem(item._id)}
                              className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                              title="Remove"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="col-span-12 md:col-span-6">
                <div className="bg-red-100 p-4 rounded-xl border border-red-300 h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-sm font-bold text-red-800 mb-2">Total Deductions</div>
                    <div className="text-3xl font-bold text-red-700">
                      ₹{num(deductions.totalDeduction).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* ===== Balance & Final Amount ===== */}
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

            {/* Final Payment Amount - Shows Balance */}
            <div className="col-span-12 md:col-span-6">
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 h-full flex items-center justify-center">
                <div className="text-center w-full">
                  <h3 className="text-sm font-bold text-blue-800 mb-2">Final Payment Amount</h3>
                  <div className="text-4xl font-bold text-blue-700 bg-white border border-blue-300 rounded-lg px-4 py-4 text-center">
                    ₹{calculateBalance().toLocaleString()}
                  </div>
                  <p className="text-xs text-blue-600 mt-2">Balance amount to be paid after adjustments</p>
                  <p className="text-xs text-slate-500 mt-1">
                    (Amount - Advance - Deductions + Additions)
                  </p>
                  {queueGenerated && (
                    <p className="text-xs text-green-600 mt-2 font-bold">
                      ✓ Queue Generated - Payment Locked
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Transaction Details */}
        <div className="mt-4">
          <Card title="Payment Transaction Details">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-3">
                <label className="text-xs font-bold text-slate-600">Vendor Name (Debit)</label>
                <input
                  type="text"
                  value={paymentDetails.vendorNameDebit || vendorDetails.vendorName}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, vendorNameDebit: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  disabled={queueGenerated}
                />
              </div>

              <div className="col-span-12 md:col-span-3">
                <label className="text-xs font-bold text-slate-600">Account No (Credit)</label>
                <input
                  type="text"
                  value={paymentDetails.accountNoCredit || vendorDetails.accountNo}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, accountNoCredit: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  disabled={queueGenerated}
                />
              </div>

              <div className="col-span-12 md:col-span-2">
                <label className="text-xs font-bold text-slate-600">Final Amount</label>
                <input
                  type="number"
                  value={calculateBalance()}
                  readOnly
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700 outline-none cursor-not-allowed"
                  disabled={queueGenerated}
                />
              </div>

              <div className="col-span-12 md:col-span-2">
                <label className="text-xs font-bold text-slate-600">Payment Date</label>
                <input
                  type="date"
                  value={paymentDetails.paymentDate}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, paymentDate: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  disabled={queueGenerated}
                />
              </div>

              <div className="col-span-12 md:col-span-2">
                <label className="text-xs font-bold text-slate-600">Payment Status</label>
                <select
                  value={paymentDetails.paymentStatus}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, paymentStatus: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  disabled={queueGenerated}
                >
                  {ADVANCE_STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-12 md:col-span-3">
                <label className="text-xs font-bold text-slate-600">Remarks</label>
                <input
                  type="text"
                  value={paymentDetails.remarks}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, remarks: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  placeholder="ADV Payment"
                  disabled={queueGenerated}
                />
              </div>

              <div className="col-span-12 md:col-span-3">
                <label className="text-xs font-bold text-slate-600">Transaction ID</label>
                <input
                  type="text"
                  value={paymentDetails.transactionId || vendorDetails.transactionId}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, transactionId: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  placeholder="6412878541272"
                  disabled={queueGenerated}
                />
              </div>

              <div className="col-span-12 md:col-span-3">
                <label className="text-xs font-bold text-slate-600">Bank Vendor Code</label>
                <input
                  type="text"
                  value={paymentDetails.bankVendorCode || vendorDetails.vendorCode}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, bankVendorCode: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  placeholder="Bank vendor code"
                  disabled={queueGenerated}
                />
              </div>

              <div className="col-span-12 md:col-span-2">
                <label className="text-xs font-bold text-slate-600">Generate Queue</label>
                <button
                  onClick={handleGenerateQueue}
                  disabled={queueGenerated}
                  className={`mt-1 w-full rounded-xl px-4 py-2 text-sm font-bold text-white transition ${
                    queueGenerated 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {queueGenerated ? 'Queue Generated' : 'Generate Queue'}
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Reusable Components
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

function Select({ label, value, onChange, options = [], col = "", disabled = false }) {
  return (
    <div className={col}>
      <label className="text-xs font-bold text-slate-600">{label}</label>
      <select
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
        disabled={disabled}
      >
        <option value="">Select {label}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function SearchableDropdown({ 
  items, 
  selectedId, 
  onSelect, 
  placeholder = "Search...",
  displayField = 'name',
  codeField = 'code',
  disabled = false
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setFilteredItems(items || []);
    if (selectedId && items?.length > 0) {
      const item = items.find(i => i[displayField] === selectedId || i._id === selectedId);
      if (item) {
        setSearchQuery(getDisplayValue(item));
      }
    }
  }, [items, selectedId]);

  const getDisplayValue = (item) => {
    if (!item) return "";
    const display = item[displayField] || "";
    const code = item[codeField] ? `(${item[codeField]})` : "";
    return `${display} ${code}`.trim();
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredItems(items || []);
    } else {
      const filtered = (items || []).filter(item =>
        (item[displayField]?.toLowerCase().includes(query.toLowerCase())) ||
        (item[codeField]?.toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredItems(filtered);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => !disabled && setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
      />
      {showDropdown && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {filteredItems?.length > 0 ? (
            filteredItems.map((item) => (
              <div
                key={item._id}
                onMouseDown={() => {
                  onSelect?.(item);
                  setSearchQuery(getDisplayValue(item));
                  setShowDropdown(false);
                }}
                className="p-2 hover:bg-emerald-50 cursor-pointer border-b border-slate-100"
              >
                <div className="font-medium text-slate-800 text-sm">
                  {item[displayField]}
                </div>
                {item[codeField] && (
                  <div className="text-xs text-slate-500">Code: {item[codeField]}</div>
                )}
              </div>
            ))
          ) : (
            <div className="p-2 text-center text-sm text-slate-500">No items found</div>
          )}
        </div>
      )}
    </div>
  );
}