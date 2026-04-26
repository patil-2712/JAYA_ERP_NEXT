"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

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

function PODDropdown({ onSelect, podList, selectedPodNo }) {
  const [searchQuery, setSearchQuery] = useState(selectedPodNo || "");
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  const filteredPODs = podList.filter(p =>
    p.podNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.purchaseNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.vendorName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (pod) => {
    setSearchQuery(pod.podNo);
    setShowDropdown(false);
    onSelect(pod);
  };

  const handleInputFocus = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
    setShowDropdown(true);
  };

  const handleInputBlur = () => {
    setTimeout(() => setShowDropdown(false), 200);
  };

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
        placeholder="Search POD No, Purchase No, or Vendor..."
      />
      {showDropdown && filteredPODs.length > 0 && (
        <div
          ref={dropdownRef}
          style={{ position: 'fixed', top: dropdownPosition.top, left: dropdownPosition.left, width: dropdownPosition.width, zIndex: 9999, maxHeight: '300px' }}
          className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-y-auto"
        >
          {filteredPODs.map(p => (
            <div key={p._id} onMouseDown={() => handleSelect(p)} className="p-3 hover:bg-emerald-50 cursor-pointer border-b border-slate-100">
              <div className="font-medium text-slate-800">{p.podNo}</div>
              <div className="text-xs text-slate-500">Purchase: {p.purchaseNo} | Vendor: {p.vendorName || p.vendorFinancial?.vendorName}</div>
              <div className="text-xs text-slate-400">Total: ₹{num(p.totalAmount || p.vendorFinancial?.total).toLocaleString()} | Balance: ₹{num(p.finalBalance || p.vendorFinancial?.finalBalance).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function EditBalancePayment() {
  const router = useRouter();
  const params = useParams();
  const paymentId = params.id;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [podList, setPodList] = useState([]);
  const [selectedPOD, setSelectedPOD] = useState(null);
  const [loadingPOD, setLoadingPOD] = useState(false);
  const [orderRows, setOrderRows] = useState([]);

  // Form State
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

  // Fetch PODs
  useEffect(() => {
    fetchPODs();
  }, []);

  const fetchPODs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/pod-panel?format=table', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPodList(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching PODs:', error);
    }
  };

  // Fetch existing Balance Payment
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
        
        // Set order rows if they exist
        if (payment.orderRows && payment.orderRows.length > 0) {
          setOrderRows(payment.orderRows);
        }
        
        if (payment.podId) {
          setSelectedPOD({ _id: payment.podId });
        }
      }
    } catch (error) {
      console.error('Error fetching balance payment:', error);
      alert('Failed to load balance payment data');
    } finally {
      setLoading(false);
    }
  };

  // Handle POD Selection - Load new data and update all fields
  const handlePODSelect = async (pod) => {
    setSelectedPOD(pod);
    setLoadingPOD(true);

    try {
      const token = localStorage.getItem('token');
      
      // Fetch full POD data
      const podRes = await fetch(`/api/pod-panel?podNo=${pod.podNo}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const podData = await podRes.json();
      
      if (podData.success && podData.data) {
        const pd = podData.data;
        const vendorFinancial = pd.vendorFinancial || {};
        const headerData = pd.header || {};
        const purchaseOrders = pd.purchaseOrders || [];
        const firstOrder = purchaseOrders[0] || {};
        const podStatusSection = pd.podStatusSection || {};
        
        const totalAmount = vendorFinancial.total || vendorFinancial.amount || 0;
        const advanceAmount = vendorFinancial.advance || 0;
        const poDeductionValue = vendorFinancial.poDeduction || 0;
        const podDeductionValue = vendorFinancial.podDeduction || 0;
        const dueDateValue = podStatusSection.dueDate || "";
        const finalBalanceValue = totalAmount - advanceAmount - poDeductionValue - podDeductionValue;
        
        // Map order rows
        const mappedOrders = purchaseOrders.map(order => ({
          _id: order._id || uid(),
          orderNo: order.orderNo || "",
          partyName: order.partyName || "",
          plantCode: order.plantCode || "",
          plantName: order.plantName || "",
          orderType: order.orderType || "Sales",
          pinCode: order.pinCode || "",
          state: order.state || "",
          district: order.district || "",
          from: order.from || "",
          to: order.to || "",
          locationRate: order.locationRate || "",
          priceList: order.priceList || "",
          weight: order.weight?.toString() || "0",
          rate: order.rate?.toString() || "0",
          totalAmount: order.totalAmount?.toString() || ((order.weight || 0) * (order.rate || 0)).toString()
        }));
        setOrderRows(mappedOrders);
        
        setFormData(prev => ({
          ...prev,
          branch: headerData.branch || headerData.branchName || "",
          date: headerData.date ? new Date(headerData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          delivery: headerData.delivery || "Normal",
          pricingSerialNo: pd.pricingSerialNo || "",
          podNo: pod.podNo,
          purchaseNo: pd.purchaseNo || pod.purchaseNo || "",
          vendorName: vendorFinancial.vendorName || "",
          vendorCode: vendorFinancial.vendorCode || "",
          from: firstOrder.from || "",
          to: firstOrder.to || "",
          weight: firstOrder.weight || 0,
          total: totalAmount,
          amount: totalAmount,
          advance: advanceAmount,
          poAddition: 0,
          poDeduction: poDeductionValue,
          podDeduction: podDeductionValue,
          finalBalance: finalBalanceValue,
          dueDate: dueDateValue,
          vendorStatus: vendorFinancial.vendorStatus || "Active",
          vendorNamePayment: vendorFinancial.vendorName || "",
          vehicleNo: firstOrder.vehicleNo || "",
          purchaseType: pd.purchaseType || "Loading & Unloading",
          rateType: pd.rateType || "Per MT",
          rate: vendorFinancial.rate || 0,
          totalAddition: 0,
          totalDeduction: poDeductionValue,
          balance: totalAmount - advanceAmount,
          finalAmount: finalBalanceValue
        }));
        
        alert(`✅ Loaded POD: ${pod.podNo}\n💰 Total Amount: ₹${totalAmount.toLocaleString()}\n💵 Advance: ₹${advanceAmount.toLocaleString()}\n📊 Balance: ₹${(totalAmount - advanceAmount).toLocaleString()}\n📉 PO Deduction: ₹${poDeductionValue.toLocaleString()}\n🏦 POD Deduction: ₹${podDeductionValue.toLocaleString()}\n💎 Final Balance: ₹${finalBalanceValue.toLocaleString()}\n📅 Due Date: ${dueDateValue || 'N/A'}`);
      }
    } catch (error) {
      console.error('Error loading POD:', error);
      alert('Failed to load POD details');
    } finally {
      setLoadingPOD(false);
    }
  };

  // Handle Update
  const handleUpdate = async () => {
    if (!formData.podNo) {
      alert("Please select a POD No");
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      
      const payload = {
        id: paymentId,
        branch: formData.branch,
        date: formData.date,
        vendorName: formData.vendorName,
        podNo: formData.podNo,
        purchaseNo: formData.purchaseNo,
        orderRows: orderRows,
        vendorStatus: formData.vendorStatus,
        vendorCode: formData.vendorCode,
        vendorNamePayment: formData.vendorNamePayment,
        vehicleNo: formData.vehicleNo,
        purchaseType: formData.purchaseType,
        rateType: formData.rateType,
        rate: num(formData.rate),
        weight: num(formData.weight),
        amount: num(formData.amount),
        advance: num(formData.advance),
        totalAddition: num(formData.totalAddition),
        totalDeduction: num(formData.totalDeduction),
        poAddition: num(formData.poAddition),
        poDeduction: num(formData.poDeduction),
        podDeduction: num(formData.podDeduction),
        finalBalance: num(formData.finalBalance),
        dueDate: formData.dueDate,
        vendorNameDebit: formData.vendorNameDebit,
        accountNoCredit: formData.accountNoCredit,
        finalAmount: num(formData.finalAmount),
        remarks: formData.remarks,
        transactionId: formData.transactionId,
        bankVendorCode: formData.bankVendorCode,
        paymentStatus: formData.paymentStatus,
        paymentDate: formData.paymentDate,
        balance: num(formData.balance),
        delivery: formData.delivery,
        pricingSerialNo: formData.pricingSerialNo,
        from: formData.from,
        to: formData.to,
        podId: selectedPOD?._id
      };

      console.log("Updating with payload:", payload);

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
        alert(`✅ Balance Payment updated successfully!`);
        router.push('/admin/Balance-Payment');
      } else {
        alert(data.message || 'Failed to update balance payment');
      }
    } catch (error) {
      console.error('Error updating balance payment:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Load existing data
  useEffect(() => {
    if (paymentId) {
      fetchBalancePayment();
    }
  }, [paymentId]);

  if (loading && !formData.balancePaymentNo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
        <p className="mt-4 text-slate-600 ml-3">Loading payment data...</p>
      </div>
    );
  }

  const calculateTotalOrderAmount = () => {
    return orderRows.reduce((sum, row) => sum + num(row.totalAmount), 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-full px-4 py-3 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/admin/Balance-Payment')}
                className="text-emerald-600 hover:text-emerald-800 font-medium text-sm flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to List
              </button>
              <div className="text-lg font-extrabold text-slate-900">Edit Balance Payment: {formData.balancePaymentNo}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleUpdate}
              disabled={saving}
              className={`rounded-xl px-5 py-2 text-sm font-bold text-white transition ${
                saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {saving ? 'Updating...' : 'Update Payment'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-full p-4">
        
        {/* Balance Payment Information */}
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
              <label className="text-xs font-bold text-slate-600">Select POD No *</label>
              <PODDropdown 
                onSelect={handlePODSelect} 
                podList={podList} 
                selectedPodNo={formData.podNo}
              />
              <p className="text-xs text-blue-500 mt-1">Only this field is editable - Select a different POD to update all details</p>
            </div>
          </div>
          {loadingPOD && (
            <div className="mt-3 p-3 bg-emerald-50 rounded-lg text-emerald-600 text-sm">
              <svg className="animate-spin h-4 w-4 inline mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading POD details...
            </div>
          )}
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

                    <td className="border border-slate-200 px-2 py-1"><input type="number" value={row.weight} readOnly className="w-20 px-2 py-1 border rounded bg-gray-100" /></td>
                    <td className="border border-slate-200 px-2 py-1"><input type="number" value={row.rate} readOnly className="w-20 px-2 py-1 border rounded bg-gray-100" /></td>
                    <td className="border border-slate-200 px-2 py-1"><input type="number" value={row.totalAmount} readOnly className="w-24 px-2 py-1 bg-gray-100 rounded font-bold text-emerald-700" /></td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100">
                <tr>
                  <td colSpan="13" className="border border-slate-200 px-3 py-2 text-right font-bold">Total Order Amount:</td>
                  <td className="border border-slate-200 px-3 py-2 font-bold text-emerald-800" colSpan="1">
                    ₹{calculateTotalOrderAmount().toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>

        {/* Balance Payment Panel - READ ONLY */}
        <Card title="Balance Payment - Panel">
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Vendor Status</label>
              <input type="text" value={formData.vendorStatus} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Vendor Code</label>
              <input type="text" value={formData.vendorCode} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Vendor Name</label>
              <input type="text" value={formData.vendorNamePayment} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Vehicle No</label>
              <input type="text" value={formData.vehicleNo} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Purchase - Type</label>
              <input type="text" value={formData.purchaseType} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 mb-4">
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
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Amount (A x B)</label>
              <input type="text" value={`₹${num(formData.amount).toLocaleString()}`} readOnly className="mt-1 w-full rounded-xl border border-purple-200 bg-purple-50 px-3 py-2 text-sm font-bold text-purple-700 cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Advance</label>
              <input type="number" value={formData.advance} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-4">
              <label className="text-xs font-bold text-slate-600">Total - Addition</label>
              <input type="number" value={formData.totalAddition} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-4">
              <label className="text-xs font-bold text-slate-600">Total - Deduction</label>
              <input type="number" value={formData.totalDeduction} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-4">
              <label className="text-xs font-bold text-slate-600">Balance</label>
              <input type="text" value={`₹${num(formData.balance).toLocaleString()}`} readOnly className="mt-1 w-full rounded-xl border border-purple-200 bg-purple-50 px-3 py-2 text-sm font-bold text-purple-700 cursor-not-allowed" />
            </div>
          </div>
        </Card>

        {/* Financial Summary - READ ONLY */}
        <Card title="Financial Summary">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">PO - Addition (₹)</label>
              <input type="number" value={formData.poAddition} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">PO - Deduction (₹)</label>
              <input type="number" value={formData.poDeduction} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">POD - Deduction (₹)</label>
              <input type="number" value={formData.podDeduction} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Due Date</label>
              <input type="date" value={formData.dueDate} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
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
              <label className="text-xs font-bold text-slate-600">Final Amount</label>
              <input type="number" value={formData.finalAmount} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Payment Status</label>
              <select value={formData.paymentStatus} disabled className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed">
                <option value="Pending">Pending</option>
                <option value="Queued">Queued</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Completed">Completed</option>
                <option value="Paid">Paid</option>
              </select>
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
              <label className="text-xs font-bold text-slate-600">Payment Date</label>
              <input type="date" value={formData.paymentDate} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
          </div>

          <div className="mt-4">
            <label className="text-xs font-bold text-slate-600">Remarks / Notes</label>
            <textarea 
              value={formData.remarks} 
              readOnly
              rows={2} 
              className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" 
            />
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