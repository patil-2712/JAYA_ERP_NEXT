"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function Card({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm mb-4">
      <div className="border-b border-slate-100 px-4 py-3">
        <div className="text-sm font-extrabold text-slate-900">{title}</div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export default function ApproveBalancePayment() {
  const router = useRouter();
  const params = useParams();
  const paymentId = params.id;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orderRows, setOrderRows] = useState([]);
  const [formData, setFormData] = useState({
    balancePaymentNo: "",
    branch: "",
    date: "",
    podNo: "",
    purchaseNo: "",
    vendorName: "",
    vendorCode: "",
    from: "",
    to: "",
    weight: 0,
    total: 0,
    advance: 0,
    poAddition: 0,
    poDeduction: 0,
    podDeduction: 0,
    finalBalance: 0,
    dueDate: "",
    transactionId: "",
    paymentDate: "",
    paymentStatus: "Pending",
    remarks: "",
    vendorStatus: "Active",
    vendorNamePayment: "",
    vehicleNo: "",
    purchaseType: "Loading & Unloading",
    rateType: "Per MT",
    rate: 0,
    amount: 0,
    totalAddition: 0,
    totalDeduction: 0,
    balance: 0,
    vendorNameDebit: "",
    accountNoCredit: "",
    finalAmount: 0,
    bankVendorCode: "",
    delivery: "Normal",
    pricingSerialNo: ""
  });

  // Fetch Balance Payment data
  const fetchBalancePayment = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/balance-payment?id=${paymentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (data.success && data.data) {
        const payment = data.data;
        
        setFormData({
          balancePaymentNo: payment.balancePaymentNo || "",
          branch: payment.branch || "",
          date: payment.date ? new Date(payment.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          podNo: payment.podNo || "",
          purchaseNo: payment.purchaseNo || "",
          vendorName: payment.vendorName || payment.vendorNamePayment || "",
          vendorCode: payment.vendorCode || "",
          from: payment.from || "",
          to: payment.to || "",
          weight: payment.weight || 0,
          total: payment.total || payment.amount || 0,
          advance: payment.advance || 0,
          poAddition: payment.poAddition || payment.totalAddition || 0,
          poDeduction: payment.poDeduction || payment.totalDeduction || 0,
          podDeduction: payment.podDeduction || 0,
          finalBalance: payment.finalBalance || payment.balance || 0,
          dueDate: payment.dueDate || "",
          transactionId: payment.transactionId || "",
          paymentDate: payment.paymentDate || "",
          paymentStatus: payment.paymentStatus || "Pending",
          remarks: payment.remarks || "",
          vendorStatus: payment.vendorStatus || "Active",
          vendorNamePayment: payment.vendorNamePayment || payment.vendorName || "",
          vehicleNo: payment.vehicleNo || "",
          purchaseType: payment.purchaseType || "Loading & Unloading",
          rateType: payment.rateType || "Per MT",
          rate: payment.rate || 0,
          amount: payment.amount || 0,
          totalAddition: payment.totalAddition || 0,
          totalDeduction: payment.totalDeduction || 0,
          balance: payment.balance || 0,
          vendorNameDebit: payment.vendorNameDebit || "",
          accountNoCredit: payment.accountNoCredit || "",
          finalAmount: payment.finalAmount || 0,
          bankVendorCode: payment.bankVendorCode || "",
          delivery: payment.delivery || "Normal",
          pricingSerialNo: payment.pricingSerialNo || ""
        });
        
        // Set order rows
        if (payment.orderRows && payment.orderRows.length > 0) {
          setOrderRows(payment.orderRows);
        }
      }
    } catch (error) {
      console.error('Error fetching balance payment:', error);
      alert('Failed to load balance payment data');
    } finally {
      setLoading(false);
    }
  };

  // Update payment status only
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle Approve/Reject
  const handleApprove = async () => {
    if (!formData.paymentStatus) {
      alert("Please select a payment status");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      
      const payload = {
        id: paymentId,
        paymentStatus: formData.paymentStatus
      };

      const res = await fetch('/api/balance-payment', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        alert(`✅ Balance Payment ${formData.paymentStatus === 'Approved' ? 'Approved' : formData.paymentStatus === 'Rejected' ? 'Rejected' : 'Updated'} successfully!`);
        router.push('/admin/Balance-Payment');
      } else {
        alert(data.message || 'Failed to update payment status');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.push('/admin/Balance-Payment');
  };

  useEffect(() => {
    if (paymentId) {
      fetchBalancePayment();
    }
  }, [paymentId]);

  const calculateTotalOrderAmount = () => {
    return orderRows.reduce((sum, row) => sum + num(row.totalAmount), 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading payment details...</p>
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
                onClick={handleBack}
                className="text-emerald-600 hover:text-emerald-800 font-medium text-sm flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to List
              </button>
              <div className="text-lg font-extrabold text-slate-900">Approve Balance Payment: {formData.balancePaymentNo}</div>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Review all details before approving/rejecting
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleApprove}
              disabled={saving}
              className={`rounded-xl px-5 py-2 text-sm font-bold text-white transition ${
                saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {saving ? 'Processing...' : 'Update Status'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-full p-4">
        
        {/* Approval Status Section - Only editable field */}
        <div className="bg-yellow-50 rounded-2xl border-2 border-yellow-400 shadow-sm mb-4">
          <div className="border-b-2 border-yellow-400 px-4 py-3 bg-yellow-100">
            <div className="text-sm font-extrabold text-yellow-800">Approval Status</div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-4">
                <label className="text-xs font-bold text-slate-600">Payment Status *</label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => updateField('paymentStatus', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-yellow-400 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                >
                  <option value="Pending">Pending</option>
                  <option value="Queued">Queued</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Completed">Completed</option>
                  <option value="Paid">Paid</option>
                </select>
                <p className="text-xs text-blue-500 mt-1">Only this field is editable for approval</p>
              </div>
           
            </div>
          </div>
        </div>

        {/* Balance Payment Information - READ ONLY */}
        <Card title="Balance Payment Information">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Balance Payment No</label>
              <input type="text" value={formData.balancePaymentNo} readOnly className="mt-1 w-full rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700 cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Pricing Serial No</label>
              <input type="text" value={formData.pricingSerialNo} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-7">
              <label className="text-xs font-bold text-slate-600">POD No</label>
              <input type="text" value={formData.podNo} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
          </div>
        </Card>

        {/* Basic Information - READ ONLY */}
        <Card title="Basic Information">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Branch</label>
              <input type="text" value={formData.branch} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Date</label>
              <input type="date" value={formData.date} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Vendor Name</label>
              <input type="text" value={formData.vendorName} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Delivery</label>
              <input type="text" value={formData.delivery} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Purchase No</label>
              <input type="text" value={formData.purchaseNo} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
          </div>
        </Card>

        {/* Vendor Details - READ ONLY */}
        <Card title="Vendor Details">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Vendor Code</label>
              <input type="text" value={formData.vendorCode} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">From</label>
              <input type="text" value={formData.from} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">To</label>
              <input type="text" value={formData.to} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Vehicle No</label>
              <input type="text" value={formData.vehicleNo} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
          </div>
        </Card>

        {/* Orders Table - READ ONLY */}
        <Card title="Order Details">
          <div className="overflow-auto rounded-xl border border-slate-200">
            <table className="min-w-max w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700">Order No</th>
                  <th className="border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700">Party Name</th>
                  <th className="border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700">Plant Code</th>
                  <th className="border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700">Order Type</th>
                  <th className="border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700">Pin Code</th>
                  <th className="border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700">State</th>
                  <th className="border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700">District</th>
                  <th className="border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700">From</th>
                  <th className="border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700">To</th>
                  <th className="border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700">Location Rate</th>

                  <th className="border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700">Weight</th>
                  <th className="border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700">Rate</th>
                  <th className="border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {orderRows.map((row) => (
                  <tr key={row._id} className="hover:bg-slate-50">
                    <td className="border border-slate-200 px-2 py-1"><input type="text" value={row.orderNo} readOnly className="w-full px-2 py-1 border rounded bg-gray-100" /></td>
                    <td className="border border-slate-200 px-2 py-1"><input type="text" value={row.partyName} readOnly className="w-full px-2 py-1 border rounded bg-gray-100" /></td>
                    <td className="border border-slate-200 px-2 py-1"><input type="text" value={row.plantCode} readOnly className="w-full px-2 py-1 border rounded bg-gray-100" /></td>
                    <td className="border border-slate-200 px-2 py-1"><input type="text" value={row.orderType} readOnly className="w-full px-2 py-1 border rounded bg-gray-100" /></td>
                    <td className="border border-slate-200 px-2 py-1"><input type="text" value={row.pinCode} readOnly className="w-full px-2 py-1 border rounded bg-gray-100" /></td>
                    <td className="border border-slate-200 px-2 py-1"><input type="text" value={row.state} readOnly className="w-full px-2 py-1 border rounded bg-gray-100" /></td>
                    <td className="border border-slate-200 px-2 py-1"><input type="text" value={row.district} readOnly className="w-full px-2 py-1 border rounded bg-gray-100" /></td>
                    <td className="border border-slate-200 px-2 py-1"><input type="text" value={row.from} readOnly className="w-full px-2 py-1 border rounded bg-gray-100" /></td>
                    <td className="border border-slate-200 px-2 py-1"><input type="text" value={row.to} readOnly className="w-full px-2 py-1 border rounded bg-gray-100" /></td>
                    <td className="border border-slate-200 px-2 py-1"><input type="text" value={row.locationRate} readOnly className="w-full px-2 py-1 border rounded bg-gray-100" /></td>

                    <td className="border border-slate-200 px-2 py-1"><input type="number" value={row.weight} readOnly className="w-20 px-2 py-1 border rounded bg-gray-100" /></td>
                    <td className="border border-slate-200 px-2 py-1"><input type="number" value={row.rate} readOnly className="w-20 px-2 py-1 border rounded bg-gray-100" /></td>
                    <td className="border border-slate-200 px-2 py-1"><input type="number" value={row.totalAmount} readOnly className="w-24 px-2 py-1 bg-gray-100 rounded font-bold text-emerald-700" /></td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100">
                <tr>
                  <td colSpan="13" className="border border-slate-200 px-3 py-2 text-right font-bold">Total Order Amount:</td>
                  <td className="border border-slate-200 px-3 py-2 font-bold text-emerald-800">
                    ₹{calculateTotalOrderAmount().toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>

        {/* Purchase Details - READ ONLY */}
        <Card title="Purchase Details">
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Vendor Status</label>
              <input type="text" value={formData.vendorStatus} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Purchase - Type</label>
              <input type="text" value={formData.purchaseType} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Rate - Type</label>
              <input type="text" value={formData.rateType} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Rate (₹)</label>
              <input type="text" value={formData.rate} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Weight (MT)</label>
              <input type="text" value={formData.weight} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Due Date</label>
              <input type="date" value={formData.dueDate} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Amount (A x B)</label>
              <input type="text" value={`₹${num(formData.amount).toLocaleString()}`} readOnly className="mt-1 w-full rounded-xl border border-purple-200 bg-purple-50 px-3 py-2 text-sm font-bold text-purple-700 cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Advance</label>
              <input type="text" value={`₹${num(formData.advance).toLocaleString()}`} readOnly className="mt-1 w-full rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700 cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Total - Addition</label>
              <input type="text" value={`₹${num(formData.totalAddition).toLocaleString()}`} readOnly className="mt-1 w-full rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm font-bold text-green-700 cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Total - Deduction</label>
              <input type="text" value={`₹${num(formData.totalDeduction).toLocaleString()}`} readOnly className="mt-1 w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700 cursor-not-allowed" />
            </div>
          </div>
        </Card>

        {/* Financial Summary - READ ONLY */}
        <Card title="Financial Summary">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">PO - Addition (₹)</label>
              <input type="text" value={`₹${num(formData.poAddition).toLocaleString()}`} readOnly className="mt-1 w-full rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm font-bold text-green-700 cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">PO - Deduction (₹)</label>
              <input type="text" value={`₹${num(formData.poDeduction).toLocaleString()}`} readOnly className="mt-1 w-full rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-bold text-orange-700 cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">POD - Deduction (₹)</label>
              <input type="text" value={`₹${num(formData.podDeduction).toLocaleString()}`} readOnly className="mt-1 w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700 cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Normal Balance (₹)</label>
              <input type="text" value={`₹${num(formData.finalBalance).toLocaleString()}`} readOnly className="mt-1 w-full rounded-xl border border-purple-200 bg-purple-50 px-3 py-2 text-sm font-bold text-purple-700 cursor-not-allowed" />
              <p className="text-xs text-purple-500 mt-1">Total - Advance - PO Deduction - POD Deduction + PO Addition</p>
            </div>
          </div>
        </Card>

        {/* Payment Transaction Details - READ ONLY */}
        <Card title="Payment Transaction Details">
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Vendor Name (Debit)</label>
              <input type="text" value={formData.vendorNameDebit} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Account No (Credit)</label>
              <input type="text" value={formData.accountNoCredit} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Normal Amount (₹)</label>
              <input type="text" value={`₹${num(formData.finalAmount).toLocaleString()}`} readOnly className="mt-1 w-full rounded-xl border border-purple-200 bg-purple-50 px-3 py-2 text-sm font-bold text-purple-700 cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Payment Date</label>
              <input type="date" value={formData.paymentDate} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-4">
              <label className="text-xs font-bold text-slate-600">Transaction ID</label>
              <input type="text" value={formData.transactionId} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-4">
              <label className="text-xs font-bold text-slate-600">Bank Vendor Code</label>
              <input type="text" value={formData.bankVendorCode} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-4">
              <label className="text-xs font-bold text-slate-600">Remarks</label>
              <input type="text" value={formData.remarks} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
          </div>
        </Card>

              {/* Summary Tables as per Image - READ ONLY */}
        <div className="overflow-hidden rounded-xl border border-slate-200 mb-4">
          <div className="grid grid-cols-5 bg-slate-100 border-b border-slate-200">
            <div className="px-4 py-3 text-center">
              <div className="text-xs font-bold text-slate-600">Total Amount</div>
            </div>
            <div className="px-4 py-3 text-center">
              <div className="text-xs font-bold text-slate-600">Advance</div>
            </div>
            <div className="px-4 py-3 text-center">
              <div className="text-xs font-bold text-slate-600">Total - Addition</div>
            </div>
            <div className="px-4 py-3 text-center">
              <div className="text-xs font-bold text-slate-600">Total - Deduction</div>
            </div>
            <div className="px-4 py-3 text-center">
              <div className="text-xs font-bold text-slate-600">Balance</div>
            </div>
          </div>
          <div className="grid grid-cols-5 bg-white">
            <div className="px-4 py-4 text-center border-r border-slate-200">
              <div className="text-xl font-bold text-emerald-700">₹{num(formData.amount).toLocaleString()}</div>
            </div>
            <div className="px-4 py-4 text-center border-r border-slate-200">
              <div className="text-xl font-bold text-blue-700">₹{num(formData.advance).toLocaleString()}</div>
            </div>
            <div className="px-4 py-4 text-center border-r border-slate-200">
              <div className="text-xl font-bold text-orange-600">₹{num(formData.totalAddition).toLocaleString()}</div>
            </div>
            <div className="px-4 py-4 text-center border-r border-slate-200">
              <div className="text-xl font-bold text-red-600">₹{num(formData.totalDeduction).toLocaleString()}</div>
            </div>
            <div className="px-4 py-4 text-center">
              <div className="text-xl font-bold text-purple-700">₹{num(formData.balance).toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Balance Breakdown Table as per Image - READ ONLY */}
        <div className="overflow-hidden rounded-xl border border-slate-200 mb-4">
          <div className="grid grid-cols-4 bg-slate-100 border-b border-slate-200">
            <div className="px-4 py-3 text-center">
              <div className="text-xs font-bold text-slate-600">Balance to be Paid</div>
            </div>
            <div className="px-4 py-3 text-center">
              <div className="text-xs font-bold text-slate-600">PO - Addition</div>
            </div>
            <div className="px-4 py-3 text-center">
              <div className="text-xs font-bold text-slate-600">PO - Deduction</div>
            </div>
            <div className="px-4 py-3 text-center">
              <div className="text-xs font-bold text-slate-600">Final - Balance</div>
            </div>
          </div>
          <div className="grid grid-cols-4 bg-white">
            <div className="px-4 py-4 text-center border-r border-slate-200">
              <div className="text-xl font-bold text-emerald-700">₹{num(formData.balance).toLocaleString()}</div>
            </div>
            <div className="px-4 py-4 text-center border-r border-slate-200">
              <div className="text-xl font-bold text-orange-600">₹{num(formData.poAddition).toLocaleString()}</div>
            </div>
            <div className="px-4 py-4 text-center border-r border-slate-200">
              <div className="text-xl font-bold text-red-600">₹{num(formData.poDeduction).toLocaleString()}</div>
            </div>
            <div className="px-4 py-4 text-center">
              <div className="text-xl font-bold text-purple-700">₹{num(formData.finalBalance).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}