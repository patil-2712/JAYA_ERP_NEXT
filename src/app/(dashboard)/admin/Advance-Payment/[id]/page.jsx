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
      const res = await fetch('/api/suppliers', {
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
    collectionCharges: "0",
    cancellationCharges: "Nil",
    loadingCharges: "Nil",
    otherCharges: "0",
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

  // Purchase Amount from VNN
  const [purchaseAmountFromVNN, setPurchaseAmountFromVNN] = useState(0);
  const [memoFileInfo, setMemoFileInfo] = useState(null);

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

  // Purchase Terms - READ ONLY
  const [purchaseTerms, setPurchaseTerms] = useState({
    purchaseType: "Loading & Unloading",
    rateType: "Per MT",
    paymentTerms: "80 % Advance",
  });

  const [vendorDetails, setVendorDetails] = useState({
    vendorStatus: "Active",
    vendorCode: "",
    vendorName: "",
    vehicleNo: "",
    rate: "",
    weight: "",
    amount: "",
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
    { key: "noOfDroppingPoint", label: "No. of Dropping Point", type: "number" },
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
      
      // Set Purchase Amount from VNN
      if (payment.purchaseAmountFromVNN) {
        setPurchaseAmountFromVNN(payment.purchaseAmountFromVNN);
      }
      
      // Set Memo File
      if (payment.memoFile) {
        setMemoFileInfo(payment.memoFile);
      }
      
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

      // Set purchase terms
      if (payment.purchaseTerms) {
        setPurchaseTerms({
          purchaseType: payment.purchaseTerms.purchaseType || "Loading & Unloading",
          rateType: payment.purchaseTerms.rateType || "Per MT",
          paymentTerms: payment.purchaseTerms.paymentTerms || "80 % Advance",
        });
      }

      // Set order rows with all fields
      if (payment.orderRows && payment.orderRows.length > 0) {
        const processedRows = payment.orderRows.map(row => ({
          _id: row._id || uid(),
          orderNo: row.orderNo || "",
          partyName: row.partyName || "",
          plantCode: row.plantCode || "",
          plantName: row.plantName || "",
          orderType: row.orderType || "",
          pinCode: row.pinCode || "",
          state: row.state || "",
          district: row.district || "",
          from: row.from || "",
          to: row.to || "",
          locationRate: row.locationRate?.toString() || "",
          priceList: row.priceList || "",
          weight: row.weight?.toString() || "",
          rate: row.rate?.toString() || "",
          totalAmount: row.totalAmount?.toString() || "",
          collectionCharges: row.collectionCharges?.toString() || "0",
          cancellationCharges: row.cancellationCharges || "Nil",
          loadingCharges: row.loadingCharges || "Nil",
          otherCharges: row.otherCharges?.toString() || "0",
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
          rate: vd.rate?.toString() || "",
          weight: vd.weight?.toString() || "",
          amount: vd.amount?.toString() || "",
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
        accountNo: vendor.accountNo || vendor.bankAccountNumber || "",
        bankName: vendor.bankName || "",
        ifsc: vendor.ifsc || vendor.ifscCode || "",
      });
      setPaymentDetails({
        ...paymentDetails,
        vendorNameDebit: vendor.supplierName || vendor.name || "",
        accountNoCredit: vendor.accountNo || vendor.bankAccountNumber || "",
        bankVendorCode: vendor.supplierCode || vendor.code || "",
      });
    }
  };

  const calculateTotalOrderAmount = () => {
    return orderRows.reduce((sum, row) => {
      const totalAmount = num(row.totalAmount);
      const collectionCharges = num(row.collectionCharges);
      const cancellationCharges = num(row.cancellationCharges);
      const loadingCharges = num(row.loadingCharges);
      const otherCharges = num(row.otherCharges);
      return sum + totalAmount + collectionCharges + cancellationCharges + loadingCharges + otherCharges;
    }, 0);
  };

  const calculateBalance = () => {
    const amount = purchaseAmountFromVNN;
    const advance = num(vendorDetails.advance);
    const totalAdditions = num(additions.totalAddition);
    const totalDeductions = num(deductions.totalDeduction);
    return (amount - advance + totalAdditions - totalDeductions).toFixed(2);
  };

  const handleGenerateQueue = () => {
    if (queueGenerated) {
      alert("Queue already generated for this payment");
      return;
    }
    
    const finalAmount = calculateBalance();
    alert(`✅ Payment queue ready to generate for ${paymentDetails.vendorNameDebit}\nAmount: ₹${num(finalAmount).toLocaleString()}`);
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
        purchaseTerms,
        vendorDetails: {
          ...vendorDetails,
          rate: num(vendorDetails.rate),
          weight: num(vendorDetails.weight),
          amount: purchaseAmountFromVNN,
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
          finalAmount: num(calculateBalance()),
        },
        purchaseAmountFromVNN,
        memoFile: memoFileInfo,
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
        {/* Header Information - READ ONLY */}
        <Card title="Purchase Information">
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Purchase No</label>
              <input
                type="text"
                value={header.purchaseNo}
                readOnly
                className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed"
              />
            </div>

            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Pricing Serial No</label>
              <input
                type="text"
                value={header.pricingSerialNo}
                readOnly
                className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed"
              />
            </div>

            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Branch *</label>
              <input
                type="text"
                value={`${header.branchName} (${header.branchCode})`}
                readOnly
                className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed"
              />
            </div>

            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Date</label>
              <input
                type="text"
                value={header.date}
                readOnly
                className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed"
              />
            </div>

            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Delivery</label>
              <input
                type="text"
                value={header.delivery}
                readOnly
                className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed"
              />
            </div>
          </div>
        </Card>

        {/* Billing Type / Charges Table - READ ONLY */}
        <div className="mt-4">
          <Card title="Billing Type / Charges (Read Only)">
            <div className="overflow-auto rounded-xl border border-yellow-300">
              <table className="min-w-full w-full text-sm">
                <thead className="sticky top-0 bg-yellow-400">
                  <tr>
                    {billingColumns.map((col) => (
                      <th key={col.key} className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-yellow-50 even:bg-slate-50">
                    {billingColumns.map((col) => (
                      <td key={col.key} className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={billing[col.key] || ""}
                          readOnly
                          className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm outline-none cursor-not-allowed"
                        />
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Orders Table - READ ONLY with all charge columns */}
        <div className="mt-4">
          <Card title="Order Details (Read Only)">
            <div className="overflow-auto rounded-xl border border-yellow-300 max-h-[500px] overflow-y-auto">
              <table className="min-w-max w-full text-sm">
                <thead className="sticky top-0 bg-yellow-400 z-10">
                  <tr>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold min-w-[120px]">Order No</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold min-w-[150px]">Party Name</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold min-w-[120px]">Plant</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold min-w-[100px]">Order Type</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold min-w-[100px]">Pin Code</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold min-w-[120px]">State</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold min-w-[120px]">District</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold min-w-[120px]">From</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold min-w-[120px]">To</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold min-w-[100px]">Location Rate</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold min-w-[100px]">Price List</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold min-w-[80px]">Weight (MT)</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold min-w-[80px]">Rate (₹)</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold min-w-[100px]">Total Amount</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold min-w-[130px]">Collection Charges</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold min-w-[140px]">Cancellation Charges</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold min-w-[130px]">Loading Charges</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold min-w-[130px]">Other Charges</th>
                  </tr>
                </thead>
                <tbody>
                  {orderRows.map((row) => (
                    <tr key={row._id} className="hover:bg-yellow-50 even:bg-slate-50">
                      <td className="border border-yellow-300 px-2 py-2">
                        <input type="text" value={row.orderNo || ""} readOnly className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm cursor-not-allowed" placeholder="Order No" />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input type="text" value={row.partyName || ""} readOnly className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm cursor-not-allowed" placeholder="Party Name" />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input type="text" value={row.plantName || row.plantCode || ""} readOnly className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm cursor-not-allowed" placeholder="Plant" />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input type="text" value={row.orderType || ""} readOnly className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm cursor-not-allowed" placeholder="Order Type" />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input type="text" value={row.pinCode || ""} readOnly className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm cursor-not-allowed" placeholder="Pin Code" />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input type="text" value={row.state || ""} readOnly className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm cursor-not-allowed" placeholder="State" />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input type="text" value={row.district || ""} readOnly className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm cursor-not-allowed" placeholder="District" />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input type="text" value={row.from || ""} readOnly className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm cursor-not-allowed" placeholder="From" />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input type="text" value={row.to || ""} readOnly className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm cursor-not-allowed" placeholder="To" />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input type="text" value={row.locationRate || ""} readOnly className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm cursor-not-allowed" placeholder="Location Rate" />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input type="text" value={row.priceList || ""} readOnly className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm cursor-not-allowed" placeholder="Price List" />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input type="number" value={row.weight || ""} readOnly className="w-20 rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm cursor-not-allowed" placeholder="0" />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input type="number" value={row.rate || ""} readOnly className="w-20 rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm cursor-not-allowed" placeholder="0" />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input type="number" value={row.totalAmount || ""} readOnly className="w-24 rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm font-bold text-emerald-700 cursor-not-allowed" placeholder="Auto" />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input type="number" value={row.collectionCharges || "0"} readOnly className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm cursor-not-allowed" placeholder="Collection Charges" />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input type="text" value={row.cancellationCharges || "Nil"} readOnly className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm cursor-not-allowed" placeholder="Cancellation Charges" />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input type="text" value={row.loadingCharges || "Nil"} readOnly className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm cursor-not-allowed" placeholder="Loading Charges" />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input type="number" value={row.otherCharges || "0"} readOnly className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm cursor-not-allowed" placeholder="Other Charges" />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-yellow-100">
                  <tr>
                    <td colSpan="13" className="border border-yellow-300 px-3 py-2 text-right font-bold">Total Order Amount:</td>
                    <td className="border border-yellow-300 px-3 py-2 font-bold text-emerald-800" colSpan="5">₹{calculateTotalOrderAmount().toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </div>

        {/* Purchase Terms - READ ONLY */}
        <div className="mt-4">
          <Card title="Purchase Terms (Read Only)">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-4">
                <label className="text-xs font-bold text-slate-600">Purchase - Type</label>
                <input type="text" value={purchaseTerms.purchaseType} readOnly className="mt-1 w-full rounded-lg border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed" />
              </div>
              <div className="col-span-12 md:col-span-4">
                <label className="text-xs font-bold text-slate-600">Rate - Type</label>
                <input type="text" value={purchaseTerms.rateType} readOnly className="mt-1 w-full rounded-lg border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed" />
              </div>
              <div className="col-span-12 md:col-span-4">
                <label className="text-xs font-bold text-slate-600">Payment Terms</label>
                <input type="text" value={purchaseTerms.paymentTerms} readOnly className="mt-1 w-full rounded-lg border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed" />
              </div>
            </div>
          </Card>
        </div>

        {/* Advance Payment Panel */}
        <div className="mt-4">
          <Card title="Advance Payment - Panel">
            <div className="grid grid-cols-12 gap-4">
              {/* Vendor Information - READ ONLY */}
              <div className="col-span-12 md:col-span-4">
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 h-full">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Vendor Information</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600">Vendor Status</label>
                      <input type="text" value={vendorDetails.vendorStatus} readOnly className="mt-1 w-full rounded-lg border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed" />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600">Vendor Code</label>
                      <input type="text" value={vendorDetails.vendorCode} readOnly className="mt-1 w-full rounded-lg border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed" />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600">Vendor Name *</label>
                      <input type="text" value={vendorDetails.vendorName} readOnly className="mt-1 w-full rounded-lg border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed" />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600">Vehicle No</label>
                      <input type="text" value={vendorDetails.vehicleNo} readOnly className="mt-1 w-full rounded-lg border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed" />
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <label className="text-xs font-bold text-slate-600">Rate (₹)</label>
                        <input type="number" value={vendorDetails.rate} readOnly className="mt-1 w-full rounded-lg border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed" placeholder="0" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-600">Weight (MT)</label>
                        <input type="number" value={vendorDetails.weight} readOnly className="mt-1 w-full rounded-lg border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed" placeholder="0" />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600">Amount (₹)</label>
                      <input type="number" value={purchaseAmountFromVNN} readOnly className="mt-1 w-full rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-sm font-bold text-purple-700 cursor-not-allowed" />
                      <p className="text-xs text-purple-600 mt-1">Auto-filled from Purchase (A x B)</p>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600">Advance (₹)</label>
                      <input type="number" value={vendorDetails.advance} readOnly className="mt-1 w-full rounded-lg border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed" />
                    </div>
                  </div>
                </div>
              </div>

              {/* MEMO from Vehicle Negotiation */}
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
                      onClick={() => { if (memoFileInfo.filePath) window.open(memoFileInfo.filePath, '_blank'); }}
                    >
                      <div className="relative w-full min-h-[200px] bg-gray-100">
                        {memoFileInfo.mimeType?.includes('image') ? (
                          <img src={memoFileInfo.filePath} alt={memoFileInfo.originalName} className="w-full h-full min-h-[200px] object-contain" />
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

              {/* Bank Details - READ ONLY */}
              <div className="col-span-12 md:col-span-4">
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 h-full">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Bank Details</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600">Account Number</label>
                      <input type="text" value={vendorDetails.accountNo} readOnly className="mt-1 w-full rounded-lg border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed" />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600">Bank Name</label>
                      <input type="text" value={vendorDetails.bankName} readOnly className="mt-1 w-full rounded-lg border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed" />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600">IFSC Code</label>
                      <input type="text" value={vendorDetails.ifsc} readOnly className="mt-1 w-full rounded-lg border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed" />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600">Transaction ID</label>
                      <input type="text" value={vendorDetails.transactionId} readOnly className="mt-1 w-full rounded-lg border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Additions Section - EDITABLE */}
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

        {/* Deductions Section - EDITABLE */}
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

        {/* Balance & Final Amount */}
        <div className="mt-4">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-6">
              <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                <h3 className="text-sm font-bold text-purple-800 mb-3">Balance Calculation</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Purchase Amount (A x B):</span>
                    <span className="font-bold text-purple-800">₹{purchaseAmountFromVNN.toLocaleString()}</span>
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

            <div className="col-span-12 md:col-span-6">
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 h-full flex items-center justify-center">
                <div className="text-center w-full">
                  <h3 className="text-sm font-bold text-blue-800 mb-2">Final Payment Amount</h3>
                  <div className="text-4xl font-bold text-blue-700 bg-white border border-blue-300 rounded-lg px-4 py-4 text-center">
                    ₹{calculateBalance().toLocaleString()}
                  </div>
                  <p className="text-xs text-blue-600 mt-2">Balance amount to be paid after adjustments</p>
                  <p className="text-xs text-slate-500 mt-1">
                    (Purchase Amount - Advance + Additions - Deductions)
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

        {/* Payment Transaction Details - EDITABLE (except Payment Status & Remarks) */}
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
          className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed"
          disabled
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
          readOnly
          className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed"
          placeholder="ADV Payment"
        />
      </div>

      <div className="col-span-12 md:col-span-3">
        <label className="text-xs font-bold text-slate-600">Transaction ID</label>
        <input
          type="text"
          value={paymentDetails.transactionId || vendorDetails.transactionId}
          onChange={(e) => setPaymentDetails({ ...paymentDetails, transactionId: e.target.value })}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
          placeholder="Transaction ID"
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