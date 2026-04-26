"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

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

// POD Dropdown Component
function PODDropdown({ onSelect, selectedPodNo }) {
  const [searchQuery, setSearchQuery] = useState(selectedPodNo || "");
  const [showDropdown, setShowDropdown] = useState(false);
  const [podList, setPodList] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    fetchPODs();
  }, []);

  const fetchPODs = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const filteredPODs = podList.filter(pod =>
    pod.podNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pod.purchaseNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pod.vendorName?.toLowerCase().includes(searchQuery.toLowerCase())
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

  useEffect(() => {
    const handleScroll = () => {
      if (showDropdown && inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width
        });
      }
    };
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [showDropdown]);

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
      {showDropdown && (
        <div
          ref={dropdownRef}
          style={{ 
            position: 'fixed', 
            top: dropdownPosition.top, 
            left: dropdownPosition.left, 
            width: dropdownPosition.width, 
            zIndex: 9999, 
            maxHeight: '300px' 
          }}
          className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-y-auto"
        >
          {loading ? (
            <div className="p-4 text-center text-sm text-slate-500">Loading...</div>
          ) : filteredPODs.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filteredPODs.map(pod => (
                <div 
                  key={pod._id} 
                  onMouseDown={() => handleSelect(pod)} 
                  className="p-3 hover:bg-emerald-50 cursor-pointer"
                >
                  <div className="font-medium text-slate-800">{pod.podNo}</div>
                  <div className="text-xs text-slate-500">Purchase: {pod.purchaseNo} | Vendor: {pod.vendorName}</div>
                  <div className="text-xs text-slate-400">Total: ₹{pod.totalAmount?.toLocaleString()} | Balance: ₹{pod.finalBalance?.toLocaleString()}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-slate-500">No PODs found</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CreateBalancePayment() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  
  // Auto-generated payment number
  const [balancePaymentNo, setBalancePaymentNo] = useState("");
  
  // Basic Info
  const [branch, setBranch] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [vendorName, setVendorName] = useState("");
  const [podNo, setPodNo] = useState("");
  const [purchaseNo, setPurchaseNo] = useState("");

  // Order Rows
  const [orderRows, setOrderRows] = useState([]);

  // Balance Payment Panel Fields
  const [vendorStatus, setVendorStatus] = useState("Active");
  const [vendorCode, setVendorCode] = useState("");
  const [vendorNamePayment, setVendorNamePayment] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [purchaseType, setPurchaseType] = useState("Loading & Unloading");
  const [rateType, setRateType] = useState("Per MT");
  const [rate, setRate] = useState("");
  const [weight, setWeight] = useState("");
  const [amount, setAmount] = useState("");
  const [advance, setAdvance] = useState("");
  const [totalAddition, setTotalAddition] = useState("");
  const [totalDeduction, setTotalDeduction] = useState("");
  const [balance, setBalance] = useState("");

  // Financial Summary Fields
  const [poAddition, setPoAddition] = useState("");
  const [poDeduction, setPoDeduction] = useState("");
  const [podDeduction, setPodDeduction] = useState("");
  const [finalBalance, setFinalBalance] = useState("");
  const [dueDate, setDueDate] = useState("");

  // Payment Transaction Details
  const [vendorNameDebit, setVendorNameDebit] = useState("");
  const [accountNoCredit, setAccountNoCredit] = useState("");
  const [finalAmount, setFinalAmount] = useState("");
  const [remarks, setRemarks] = useState("Balance Payment");
  const [transactionId, setTransactionId] = useState("");
  const [bankVendorCode, setBankVendorCode] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("Pending");

  const defaultOrderRow = () => ({
    _id: uid(),
    orderNo: "",
    partyName: "",
    plantCode: "",
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
    totalAmount: ""
  });

  useEffect(() => {
    fetchAutoPaymentNumber();
    setOrderRows([defaultOrderRow()]);
  }, []);

  const fetchAutoPaymentNumber = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/balance-payment/generate-number', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setBalancePaymentNo(data.paymentNo);
      }
    } catch (error) {
      console.error('Error fetching payment number:', error);
    }
  };

  // Handle POD Selection - Load data from POD directly
  const handlePODSelect = async (pod) => {
    setLoadingData(true);
    setPodNo(pod.podNo);
    setPurchaseNo(pod.purchaseNo);
    
    try {
      const token = localStorage.getItem('token');
      
      // Fetch full POD data
      const podRes = await fetch(`/api/pod-panel?podNo=${pod.podNo}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const podData = await podRes.json();
      
      console.log("📦 Full POD Data:", podData);
      
      if (podData.success && podData.data) {
        const pd = podData.data;
        
        // Extract data from POD structure
        const headerData = pd.header || {};
        const vendorFinancial = pd.vendorFinancial || {};
        const purchaseOrders = pd.purchaseOrders || [];
        const firstOrder = purchaseOrders[0] || {};
        const podStatusSection = pd.podStatusSection || {};
        
        // Basic Info
        setBranch(headerData.branch || headerData.branchName || "");
        setDate(headerData.date ? new Date(headerData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
        setVendorName(vendorFinancial.vendorName || pod.vendorName || "");
        setPurchaseNo(pd.purchaseNo || pod.purchaseNo || "");
        
        // Purchase Details
        setVendorStatus(vendorFinancial.vendorStatus || "Active");
        setVendorCode(vendorFinancial.vendorCode || "");
        setVendorNamePayment(vendorFinancial.vendorName || pod.vendorName || "");
        setVehicleNo(firstOrder.vehicleNo || vendorFinancial.vehicleNo || "");
        setPurchaseType(pd.purchaseType || "Loading & Unloading");
        setRateType(pd.rateType || "Per MT");
        setRate(vendorFinancial.rate?.toString() || firstOrder.rate?.toString() || "");
        setWeight(firstOrder.weight?.toString() || vendorFinancial.weight?.toString() || "");
        
        // Financial Values from Vendor Financial
        const totalAmount = vendorFinancial.total || vendorFinancial.amount || 0;
        const advanceAmount = vendorFinancial.advance || 0;
        const totalAdditionsValue = vendorFinancial.totalAdditions || 0;
        const totalDeductionsValue = vendorFinancial.totalDeductions || 0;
        const poDeductionValue = vendorFinancial.poDeduction || 0;
        const podDeductionValue = vendorFinancial.podDeduction || 0;
        const finalBalanceValue = vendorFinancial.finalBalance || (totalAmount - advanceAmount - poDeductionValue - podDeductionValue);
        const dueDateValue = podStatusSection.dueDate || "";
        
        setAmount(totalAmount.toString());
        setAdvance(advanceAmount.toString());
        setTotalAddition(totalAdditionsValue.toString());
        setTotalDeduction(totalDeductionsValue.toString());
        setPoAddition("0");
        setPoDeduction(poDeductionValue.toString());
        setPodDeduction(podDeductionValue.toString());
        setFinalBalance(finalBalanceValue.toString());
        setDueDate(dueDateValue);
        
        const calculatedBalance = totalAmount - advanceAmount;
        setBalance(calculatedBalance.toFixed(2));
        setFinalAmount(finalBalanceValue.toString());
        
        // Set Order Rows from purchaseOrders
        if (purchaseOrders.length > 0) {
          const mappedOrders = purchaseOrders.map(order => ({
            _id: uid(),
            orderNo: order.orderNo || "",
            partyName: order.partyName || "",
            plantCode: order.plantCode || "",
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
        }
        
        // Set Payment Details from Advance Payment if available
        let paymentDetailsAdv = {};
        let vendorDetailsAdv = {};
        
        try {
          const advanceRes = await fetch(`/api/Advance-Payment?purchaseNo=${pd.purchaseNo || pod.purchaseNo}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const advanceData = await advanceRes.json();
          
          if (advanceData && advanceData.success && advanceData.data) {
            const advPayment = advanceData.data;
            paymentDetailsAdv = advPayment.paymentDetails || {};
            vendorDetailsAdv = advPayment.vendorDetails || {};
          }
        } catch (err) {
          console.log("No advance payment found");
        }
        
        setVendorNameDebit(paymentDetailsAdv.vendorNameDebit || vendorFinancial.vendorName || "");
        setAccountNoCredit(paymentDetailsAdv.accountNoCredit || vendorDetailsAdv.accountNo || "");
        setTransactionId(paymentDetailsAdv.transactionId || vendorDetailsAdv.transactionId || "");
        setBankVendorCode(paymentDetailsAdv.bankVendorCode || vendorDetailsAdv.vendorCode || vendorFinancial.vendorCode || "");
        setRemarks(paymentDetailsAdv.remarks || "Balance Payment");
        
        alert(`✅ Loaded POD: ${pd.podNo || pod.podNo}\n✅ Purchase: ${pd.purchaseNo || pod.purchaseNo}\n💰 Total Amount: ₹${totalAmount.toLocaleString()}\n💵 Advance: ₹${advanceAmount.toLocaleString()}\n📊 Balance: ₹${calculatedBalance.toLocaleString()}\n📉 PO Deduction: ₹${poDeductionValue.toLocaleString()}\n🏦 POD Deduction: ₹${podDeductionValue.toLocaleString()}\n💎 Final Balance: ₹${finalBalanceValue.toLocaleString()}\n📅 Due Date: ${dueDateValue || 'N/A'}`);
        
      } else {
        alert(`⚠️ POD data not found for POD No: ${pod.podNo}`);
      }
    } catch (error) {
      console.error('Error loading POD data:', error);
      alert('Failed to load POD details');
    } finally {
      setLoadingData(false);
    }
  };

  // Recalculate final balance when related fields change
  useEffect(() => {
    const amountValue = num(amount);
    const advanceValue = num(advance);
    const poAdditionValue = num(poAddition);
    const poDeductionValue = num(poDeduction);
    const podDeductionValue = num(podDeduction);
    
    const calculatedBalance = amountValue - advanceValue + num(totalAddition) - num(totalDeduction);
    setBalance(calculatedBalance.toFixed(2));
    
    const calculatedFinalBalance = amountValue - advanceValue - poDeductionValue - podDeductionValue + poAdditionValue;
    setFinalBalance(calculatedFinalBalance.toFixed(2));
    setFinalAmount(calculatedFinalBalance.toFixed(2));
  }, [amount, advance, totalAddition, totalDeduction, poAddition, poDeduction, podDeduction]);

  const updateOrderRow = (rowId, key, value) => {
    setOrderRows((prev) =>
      prev.map((r) => {
        if (r._id === rowId) {
          const updatedRow = { ...r, [key]: value };
          if (key === "weight" || key === "rate") {
            const weightVal = num(updatedRow.weight);
            const rateVal = num(updatedRow.rate);
            updatedRow.totalAmount = (weightVal * rateVal).toString();
          }
          return updatedRow;
        }
        return r;
      })
    );
  };

  const addOrderRow = () => {
    setOrderRows([...orderRows, defaultOrderRow()]);
  };

  const removeOrderRow = (rowId) => {
    if (orderRows.length > 1) {
      setOrderRows((prev) => prev.filter((r) => r._id !== rowId));
    }
  };

  const calculateTotalOrderAmount = () => {
    return orderRows.reduce((sum, row) => sum + num(row.totalAmount), 0);
  };

  const handleSave = async () => {
    if (!podNo) {
      alert("Please select a POD No");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        branch,
        date,
        vendorName,
        podNo,
        purchaseNo,
        orderRows,
        vendorStatus,
        vendorCode,
        vendorNamePayment,
        vehicleNo,
        purchaseType,
        rateType,
        rate: num(rate),
        weight: num(weight),
        amount: num(amount),
        advance: num(advance),
        totalAddition: num(totalAddition),
        totalDeduction: num(totalDeduction),
        poAddition: num(poAddition),
        poDeduction: num(poDeduction),
        podDeduction: num(podDeduction),
        finalBalance: num(finalBalance),
        dueDate: dueDate,
        vendorNameDebit,
        accountNoCredit,
        finalAmount: num(finalAmount),
        remarks,
        transactionId,
        bankVendorCode,
        paymentStatus,
        paymentDate: new Date().toISOString().split('T')[0]
      };

      console.log("Saving payload:", payload);

      const res = await fetch('/api/balance-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        alert(`✅ Balance Payment saved successfully!\nPayment No: ${data.data.balancePaymentNo}`);
        router.push('/admin/Balance-Payment');
      } else {
        alert(data.message || 'Failed to save balance payment');
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setBranch("");
    setDate(new Date().toISOString().split('T')[0]);
    setVendorName("");
    setPodNo("");
    setPurchaseNo("");
    setOrderRows([defaultOrderRow()]);
    setVendorStatus("Active");
    setVendorCode("");
    setVendorNamePayment("");
    setVehicleNo("");
    setPurchaseType("Loading & Unloading");
    setRateType("Per MT");
    setRate("");
    setWeight("");
    setAmount("");
    setAdvance("");
    setTotalAddition("");
    setTotalDeduction("");
    setBalance("");
    setPoAddition("");
    setPoDeduction("");
    setPodDeduction("");
    setFinalBalance("");
    setDueDate("");
    setVendorNameDebit("");
    setAccountNoCredit("");
    setFinalAmount("");
    setRemarks("Balance Payment");
    setTransactionId("");
    setBankVendorCode("");
    setPaymentStatus("Pending");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-full px-4 py-3 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <button onClick={() => router.push('/admin/Balance-Payment')} className="text-emerald-600 hover:text-emerald-800 font-medium text-sm flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to List
              </button>
              <div className="text-lg font-extrabold text-slate-900">Create Balance Payment</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={resetForm} className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 transition">Reset</button>
            <button onClick={handleSave} disabled={saving} className={`rounded-xl px-5 py-2 text-sm font-bold text-white transition ${saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
              {saving ? 'Saving...' : 'Save Payment'}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-full p-4">
        {/* Balance Payment Number - Auto Generated */}
        <Card title="Balance Payment Information">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Balance Payment No</label>
              <input type="text" value={balancePaymentNo} readOnly className="mt-1 w-full rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700" />
              <p className="text-xs text-slate-400 mt-1">Auto-generated</p>
            </div>
            <div className="col-span-12 md:col-span-9">
              <label className="text-xs font-bold text-slate-600">Select POD No *</label>
              <PODDropdown onSelect={handlePODSelect} selectedPodNo={podNo} />
              <p className="text-xs text-slate-400 mt-1">Select a POD to auto-fill all details</p>
            </div>
          </div>
          {loadingData && (
            <div className="mt-3 p-3 bg-emerald-50 rounded-lg text-emerald-600 text-sm">
              <svg className="animate-spin h-4 w-4 inline mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading details...
            </div>
          )}
        </Card>

        {/* Basic Information - READ ONLY */}
        <Card title="Basic Information">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Branch</label>
              <input type="text" value={branch} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Date</label>
              <input type="date" value={date} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Vendor Name</label>
              <input type="text" value={vendorName} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Purchase No</label>
              <input type="text" value={purchaseNo} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
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
                  <th className="border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700">Actions</th>
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
                    <td className="border border-slate-200 px-2 py-1 text-center">
                      <button onClick={() => removeOrderRow(row._id)} className="text-red-600 hover:text-red-800">✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100">
                <tr>
                  <td colSpan="14" className="border border-slate-200 px-3 py-2 text-right font-bold">Total Order Amount:</td>
                  <td className="border border-slate-200 px-3 py-2 font-bold text-emerald-800">
                    ₹{calculateTotalOrderAmount().toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>

        {/* Balance Payment Panel */}
        <Card title="Balance Payment - Panel">
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Vendor Status</label>
              <input type="text" value={vendorStatus} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Vendor Code</label>
              <input type="text" value={vendorCode} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Vendor Name</label>
              <input type="text" value={vendorNamePayment} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Vehicle No</label>
              <input type="text" value={vehicleNo} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Purchase - Type</label>
              <input type="text" value={purchaseType} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Rate - Type</label>
              <input type="text" value={rateType} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Rate (₹)</label>
              <input type="text" value={rate} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm text-right cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Weight (MT)</label>
              <input type="text" value={weight} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm text-right cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Amount (A x B)</label>
              <input type="text" value={`₹${num(amount).toLocaleString()}`} readOnly className="mt-1 w-full rounded-xl border border-purple-200 bg-purple-50 px-3 py-2 text-sm font-bold text-purple-700 cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Advance</label>
              <input type="text" value={advance} onChange={(e) => setAdvance(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500" />
              <p className="text-xs text-blue-500 mt-1">Editable</p>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-4">
              <label className="text-xs font-bold text-slate-600">Total - Addition</label>
              <input type="number" value={totalAddition} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-4">
              <label className="text-xs font-bold text-slate-600">Total - Deduction</label>
              <input type="number" value={totalDeduction} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-4">
              <label className="text-xs font-bold text-slate-600">Balance</label>
              <input type="text" value={`₹${num(balance).toLocaleString()}`} readOnly className="mt-1 w-full rounded-xl border border-purple-200 bg-purple-50 px-3 py-2 text-sm font-bold text-purple-700 cursor-not-allowed" />
            </div>
          </div>
        </Card>

        {/* Financial Summary Section - Editable */}
        <Card title="Financial Summary">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">PO - Addition (₹)</label>
              <input 
                type="number" 
                value={poAddition} 
                onChange={(e) => setPoAddition(e.target.value)} 
                className="mt-1 w-full rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm focus:border-emerald-500"
                placeholder="PO Addition"
              />
            </div>
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">PO - Deduction (₹)</label>
              <input 
                type="number" 
                value={poDeduction} 
                onChange={(e) => setPoDeduction(e.target.value)} 
                className="mt-1 w-full rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm focus:border-emerald-500"
                placeholder="PO Deduction"
              />
            </div>
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">POD - Deduction (₹)</label>
              <input 
                type="number" 
                value={podDeduction} 
                onChange={(e) => setPodDeduction(e.target.value)} 
                className="mt-1 w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm focus:border-emerald-500"
                placeholder="POD Deduction"
              />
            </div>
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Due Date</label>
              <input 
                type="date" 
                value={dueDate} 
                onChange={(e) => setDueDate(e.target.value)} 
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500"
              />
            </div>
          </div>
        </Card>

        {/* Payment Transaction Details */}
        <Card title="Payment Transaction Details">
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Vendor Name (Debit)</label>
              <input type="text" value={vendorNameDebit} onChange={(e) => setVendorNameDebit(e.target.value)} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Account No (Credit)</label>
              <input type="text" value={accountNoCredit} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Final Amount</label>
              <input type="number" value={finalAmount} onChange={(e) => setFinalAmount(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-emerald-700 focus:border-emerald-500" />
              <p className="text-xs text-blue-500 mt-1">Editable</p>
            </div>
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Remarks</label>
              <input type="text" value={remarks} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-4">
              <label className="text-xs font-bold text-slate-600">Transaction ID</label>
              <input type="text" value={transactionId} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-4">
              <label className="text-xs font-bold text-slate-600">Bank Vendor Code</label>
              <input type="text" value={bankVendorCode} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-4">
              <label className="text-xs font-bold text-slate-600">Payment Status</label>
              <select value={paymentStatus} disabled className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed">
                <option value="Pending">Pending</option>
                <option value="Queued">Queued</option>
                <option value="Completed">Completed</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Summary Table as per Image */}
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
              <div className="text-xl font-bold text-emerald-700">₹{num(amount).toLocaleString()}</div>
            </div>
            <div className="px-4 py-4 text-center border-r border-slate-200">
              <div className="text-xl font-bold text-blue-700">₹{num(advance).toLocaleString()}</div>
            </div>
            <div className="px-4 py-4 text-center border-r border-slate-200">
              <div className="text-xl font-bold text-orange-600">₹{num(totalAddition).toLocaleString()}</div>
            </div>
            <div className="px-4 py-4 text-center border-r border-slate-200">
              <div className="text-xl font-bold text-red-600">₹{num(totalDeduction).toLocaleString()}</div>
            </div>
            <div className="px-4 py-4 text-center">
              <div className="text-xl font-bold text-purple-700">₹{num(balance).toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Balance Breakdown Table as per Image */}
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
              <div className="text-xl font-bold text-emerald-700">₹{num(balance).toLocaleString()}</div>
            </div>
            <div className="px-4 py-4 text-center border-r border-slate-200">
              <div className="text-xl font-bold text-orange-600">₹{num(poAddition).toLocaleString()}</div>
            </div>
            <div className="px-4 py-4 text-center border-r border-slate-200">
              <div className="text-xl font-bold text-red-600">₹{num(poDeduction).toLocaleString()}</div>
            </div>
            <div className="px-4 py-4 text-center">
              <div className="text-xl font-bold text-purple-700">₹{num(finalBalance).toLocaleString()}</div>
            </div>
          </div>
        </div>
       
      </div>
    </div>
  );
}