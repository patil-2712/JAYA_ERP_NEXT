"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function Card({ title, children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm mb-6 ${className}`}>
      <div className="border-b border-slate-100 px-5 py-3">
        <div className="text-base font-bold text-slate-900">{title}</div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function FilterSection({ title, children, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="mb-4 border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <span className="font-semibold text-slate-700">{title}</span>
        <svg
          className={`w-5 h-5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="p-4">{children}</div>}
    </div>
  );
}

function BranchSelector({ value, onChange, label = "Branch" }) {
  const branches = ["Mumbai", "Delhi", "Kolkata", "Chennai", "Bangalore", "Hyderabad"];
  
  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
      >
        <option value="">Select Branch</option>
        {branches.map(branch => (
          <option key={branch} value={branch}>{branch}</option>
        ))}
      </select>
    </div>
  );
}

function ClientSelector({ value, onChange, label = "Client Name" }) {
  const clients = [
    "Yara Fertilizers India Pvt Ltd",
    "ICL Management Pvt Ltd",
    "Coromandel International Ltd",
    "Deepak Fertilizers Ltd",
    "Gujarat State Fertilizers & Chemicals"
  ];
  
  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
      >
        <option value="">Select Client</option>
        {clients.map(client => (
          <option key={client} value={client}>{client}</option>
        ))}
      </select>
    </div>
  );
}

function MonthSelector({ value, onChange, label = "Month" }) {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
      >
        <option value="">Select Month</option>
        {months.map(month => (
          <option key={month} value={month}>{month}</option>
        ))}
      </select>
    </div>
  );
}

function OrderTypeSelector({ value, onChange, label = "Order Type" }) {
  const types = ["Sales", "STO", "Purchase", "Return"];
  
  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
      >
        <option value="">Select Type</option>
        {types.map(type => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>
    </div>
  );
}

function ProductCategorySelector({ value, onChange, label = "Product Categories" }) {
  const categories = [
    "Biological",
    "Premium Product",
    "Standard",
    "Economy",
    "Specialty"
  ];
  
  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
      >
        <option value="">Select Category</option>
        {categories.map(category => (
          <option key={category} value={category}>{category}</option>
        ))}
      </select>
    </div>
  );
}

function PlantCodeSelector({ value, onChange, label = "Plant Code" }) {
  const plantCodes = ["9009", "9010", "9011", "9012", "9013"];
  
  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
      >
        <option value="">Select Plant Code</option>
        {plantCodes.map(code => (
          <option key={code} value={code}>{code}</option>
        ))}
      </select>
    </div>
  );
}

function DateRangePicker({ startDate, endDate, onStartChange, onEndChange, label = "Date Range" }) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-slate-600 mb-1">{label}</label>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            placeholder="Start Date"
          />
          <p className="text-xs text-slate-400 mt-1">Start Date</p>
        </div>
        <div>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            placeholder="End Date"
          />
          <p className="text-xs text-slate-400 mt-1">End Date</p>
        </div>
      </div>
    </div>
  );
}

function GenerateButton({ onClick, loading = false, label = "Generate Report" }) {
  return (
    <div className="flex items-end">
      <button
        onClick={onClick}
        disabled={loading}
        className={`w-full rounded-xl px-4 py-2 text-sm font-bold text-white transition ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-emerald-600 hover:bg-emerald-700'
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Generating...
          </div>
        ) : (
          label
        )}
      </button>
    </div>
  );
}

export default function BillingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Common state
  const [branch, setBranch] = useState("Mumbai");
  
  // Product-Wise Billing State
  const [productWise, setProductWise] = useState({
    clientName: "Yara Fertilizers India Pvt Ltd",
    productCategories: "",
    plantCode: "9009",
    month: "April",
    orderType: "Sales",
    startDate: "2026-04-01",
    endDate: "2026-04-30"
  });
  
  // General Billing State
  const [generalBilling, setGeneralBilling] = useState({
    clientName: "ICL Management Pvt Ltd",
    month: "April",
    orderType: "Sales",
    startDate: "2026-04-01",
    endDate: "2026-04-30"
  });
  
  // Detention Billing State
  const [detentionBilling, setDetentionBilling] = useState({
    clientName: "ICL Management Pvt Ltd",
    detention: "",
    month: "April",
    startDate: "2026-04-01",
    endDate: "2026-04-30"
  });
  
  // Cancellation Billing State
  const [cancellationBilling, setCancellationBilling] = useState({
    clientName: "ICL Management Pvt Ltd",
    cancellation: "",
    month: "April",
    startDate: "2026-04-01",
    endDate: "2026-04-30"
  });
  
  // Other Billing State
  const [otherBilling, setOtherBilling] = useState({
    clientName: "ICL Management Pvt Ltd",
    type: "Cancellation",
    month: "April",
    startDate: "2026-04-01",
    endDate: "2026-04-30"
  });
  
  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '4-digit' }).replace(/\//g, '.');
  };
  
  const handleGenerateProductWise = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        type: 'product-wise',
        branch,
        ...productWise
      };
      
      const response = await fetch('/api/billing/product-wise', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`✅ Product-Wise Billing Report Generated!\nClient: ${productWise.clientName}\nPeriod: ${formatDateForDisplay(productWise.startDate)} to ${formatDateForDisplay(productWise.endDate)}`);
        // Open report in new tab or download
        if (data.reportUrl) {
          window.open(data.reportUrl, '_blank');
        }
      } else {
        alert(data.message || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };
  
  const handleGenerateGeneral = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        type: 'general',
        branch,
        ...generalBilling
      };
      
      const response = await fetch('/api/billing/general', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`✅ General Billing Report Generated!\nClient: ${generalBilling.clientName}\nOrder Type: ${generalBilling.orderType}\nPeriod: ${formatDateForDisplay(generalBilling.startDate)} to ${formatDateForDisplay(generalBilling.endDate)}`);
        if (data.reportUrl) {
          window.open(data.reportUrl, '_blank');
        }
      } else {
        alert(data.message || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };
  
  const handleGenerateDetention = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        type: 'detention',
        branch,
        ...detentionBilling
      };
      
      const response = await fetch('/api/billing/detention', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`✅ Detention Billing Report Generated!\nClient: ${detentionBilling.clientName}\nPeriod: ${formatDateForDisplay(detentionBilling.startDate)} to ${formatDateForDisplay(detentionBilling.endDate)}`);
        if (data.reportUrl) {
          window.open(data.reportUrl, '_blank');
        }
      } else {
        alert(data.message || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };
  
  const handleGenerateCancellation = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        type: 'cancellation',
        branch,
        ...cancellationBilling
      };
      
      const response = await fetch('/api/billing/cancellation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`✅ Cancellation Billing Report Generated!\nClient: ${cancellationBilling.clientName}\nPeriod: ${formatDateForDisplay(cancellationBilling.startDate)} to ${formatDateForDisplay(cancellationBilling.endDate)}`);
        if (data.reportUrl) {
          window.open(data.reportUrl, '_blank');
        }
      } else {
        alert(data.message || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };
  
  const handleGenerateOther = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        type: 'other',
        branch,
        ...otherBilling
      };
      
      const response = await fetch('/api/billing/other', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`✅ Other Billing Report Generated!\nClient: ${otherBilling.clientName}\nType: ${otherBilling.type}\nPeriod: ${formatDateForDisplay(otherBilling.startDate)} to ${formatDateForDisplay(otherBilling.endDate)}`);
        if (data.reportUrl) {
          window.open(data.reportUrl, '_blank');
        }
      } else {
        alert(data.message || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-full px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="text-emerald-600 hover:text-emerald-800 font-medium text-sm flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>
            <div className="text-xl font-extrabold text-slate-900">Billing Reports</div>
          </div>
        </div>
      </div>
      
      <div className="mx-auto max-w-7xl p-6">
        
        {/* Yara - Product-Wise Billing */}
        <Card title="Yara - Product-Wise Billing">
          <div className="grid grid-cols-12 gap-5">
            <div className="col-span-12 md:col-span-3">
              <ClientSelector
                value={productWise.clientName}
                onChange={(val) => setProductWise({ ...productWise, clientName: val })}
              />
            </div>
            <div className="col-span-12 md:col-span-3">
              <BranchSelector
                value={branch}
                onChange={setBranch}
              />
            </div>
            <div className="col-span-12 md:col-span-6"></div>
            
            <div className="col-span-12 md:col-span-2">
              <ProductCategorySelector
                value={productWise.productCategories}
                onChange={(val) => setProductWise({ ...productWise, productCategories: val })}
              />
            </div>
            <div className="col-span-12 md:col-span-2">
              <PlantCodeSelector
                value={productWise.plantCode}
                onChange={(val) => setProductWise({ ...productWise, plantCode: val })}
              />
            </div>
            <div className="col-span-12 md:col-span-2">
              <MonthSelector
                value={productWise.month}
                onChange={(val) => setProductWise({ ...productWise, month: val })}
              />
            </div>
            <div className="col-span-12 md:col-span-2">
              <OrderTypeSelector
                value={productWise.orderType}
                onChange={(val) => setProductWise({ ...productWise, orderType: val })}
              />
            </div>
            <div className="col-span-12 md:col-span-2">
              <input
                type="date"
                value={productWise.startDate}
                onChange={(e) => setProductWise({ ...productWise, startDate: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              />
              <p className="text-xs text-slate-400 mt-1">Start Date</p>
            </div>
            <div className="col-span-12 md:col-span-2">
              <input
                type="date"
                value={productWise.endDate}
                onChange={(e) => setProductWise({ ...productWise, endDate: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              />
              <p className="text-xs text-slate-400 mt-1">End Date</p>
            </div>
            <div className="col-span-12 md:col-span-2">
              <GenerateButton
                onClick={handleGenerateProductWise}
                loading={loading}
                label="Generate"
              />
            </div>
          </div>
        </Card>
        
        {/* General - Billing */}
        <Card title="General - Billing">
          <div className="grid grid-cols-12 gap-5">
            <div className="col-span-12 md:col-span-3">
              <ClientSelector
                value={generalBilling.clientName}
                onChange={(val) => setGeneralBilling({ ...generalBilling, clientName: val })}
              />
            </div>
            <div className="col-span-12 md:col-span-3">
              <BranchSelector
                value={branch}
                onChange={setBranch}
              />
            </div>
            <div className="col-span-12 md:col-span-6"></div>
            
            <div className="col-span-12 md:col-span-2">
              <MonthSelector
                value={generalBilling.month}
                onChange={(val) => setGeneralBilling({ ...generalBilling, month: val })}
              />
            </div>
            <div className="col-span-12 md:col-span-2">
              <OrderTypeSelector
                value={generalBilling.orderType}
                onChange={(val) => setGeneralBilling({ ...generalBilling, orderType: val })}
              />
            </div>
            <div className="col-span-12 md:col-span-2">
              <input
                type="date"
                value={generalBilling.startDate}
                onChange={(e) => setGeneralBilling({ ...generalBilling, startDate: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              />
              <p className="text-xs text-slate-400 mt-1">Start Date</p>
            </div>
            <div className="col-span-12 md:col-span-2">
              <input
                type="date"
                value={generalBilling.endDate}
                onChange={(e) => setGeneralBilling({ ...generalBilling, endDate: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              />
              <p className="text-xs text-slate-400 mt-1">End Date</p>
            </div>
            <div className="col-span-12 md:col-span-2">
              <GenerateButton
                onClick={handleGenerateGeneral}
                loading={loading}
                label="Generate"
              />
            </div>
          </div>
        </Card>
        
        {/* Detention - Billing */}
        <Card title="Detention - Billing">
          <div className="grid grid-cols-12 gap-5">
            <div className="col-span-12 md:col-span-3">
              <ClientSelector
                value={detentionBilling.clientName}
                onChange={(val) => setDetentionBilling({ ...detentionBilling, clientName: val })}
              />
            </div>
            <div className="col-span-12 md:col-span-3">
              <BranchSelector
                value={branch}
                onChange={setBranch}
              />
            </div>
            <div className="col-span-12 md:col-span-6"></div>
            
            <div className="col-span-12 md:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1">Detention</label>
              <input
                type="text"
                value={detentionBilling.detention}
                onChange={(e) => setDetentionBilling({ ...detentionBilling, detention: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                placeholder="Detention Type"
              />
            </div>
            <div className="col-span-12 md:col-span-2">
              <MonthSelector
                value={detentionBilling.month}
                onChange={(val) => setDetentionBilling({ ...detentionBilling, month: val })}
              />
            </div>
            <div className="col-span-12 md:col-span-2">
              <input
                type="date"
                value={detentionBilling.startDate}
                onChange={(e) => setDetentionBilling({ ...detentionBilling, startDate: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              />
              <p className="text-xs text-slate-400 mt-1">Start Date</p>
            </div>
            <div className="col-span-12 md:col-span-2">
              <input
                type="date"
                value={detentionBilling.endDate}
                onChange={(e) => setDetentionBilling({ ...detentionBilling, endDate: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              />
              <p className="text-xs text-slate-400 mt-1">End Date</p>
            </div>
            <div className="col-span-12 md:col-span-2">
              <GenerateButton
                onClick={handleGenerateDetention}
                loading={loading}
                label="Generate"
              />
            </div>
          </div>
        </Card>
        
        {/* Cancellation - Billing */}
        <Card title="Cancellation - Billing">
          <div className="grid grid-cols-12 gap-5">
            <div className="col-span-12 md:col-span-3">
              <ClientSelector
                value={cancellationBilling.clientName}
                onChange={(val) => setCancellationBilling({ ...cancellationBilling, clientName: val })}
              />
            </div>
            <div className="col-span-12 md:col-span-3">
              <BranchSelector
                value={branch}
                onChange={setBranch}
              />
            </div>
            <div className="col-span-12 md:col-span-6"></div>
            
            <div className="col-span-12 md:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1">Cancellation</label>
              <input
                type="text"
                value={cancellationBilling.cancellation}
                onChange={(e) => setCancellationBilling({ ...cancellationBilling, cancellation: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                placeholder="Cancellation Type"
              />
            </div>
            <div className="col-span-12 md:col-span-2">
              <MonthSelector
                value={cancellationBilling.month}
                onChange={(val) => setCancellationBilling({ ...cancellationBilling, month: val })}
              />
            </div>
            <div className="col-span-12 md:col-span-2">
              <input
                type="date"
                value={cancellationBilling.startDate}
                onChange={(e) => setCancellationBilling({ ...cancellationBilling, startDate: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              />
              <p className="text-xs text-slate-400 mt-1">Start Date</p>
            </div>
            <div className="col-span-12 md:col-span-2">
              <input
                type="date"
                value={cancellationBilling.endDate}
                onChange={(e) => setCancellationBilling({ ...cancellationBilling, endDate: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              />
              <p className="text-xs text-slate-400 mt-1">End Date</p>
            </div>
            <div className="col-span-12 md:col-span-2">
              <GenerateButton
                onClick={handleGenerateCancellation}
                loading={loading}
                label="Generate"
              />
            </div>
          </div>
        </Card>
        
        {/* Other - Billing */}
        <Card title="Other - Billing">
          <div className="grid grid-cols-12 gap-5">
            <div className="col-span-12 md:col-span-3">
              <ClientSelector
                value={otherBilling.clientName}
                onChange={(val) => setOtherBilling({ ...otherBilling, clientName: val })}
              />
            </div>
            <div className="col-span-12 md:col-span-3">
              <BranchSelector
                value={branch}
                onChange={setBranch}
              />
            </div>
            <div className="col-span-12 md:col-span-6"></div>
            
            <div className="col-span-12 md:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1">Type</label>
              <select
                value={otherBilling.type}
                onChange={(e) => setOtherBilling({ ...otherBilling, type: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              >
                <option value="Cancellation">Cancellation</option>
                <option value="Detention">Detention</option>
                <option value="Demurrage">Demurrage</option>
                <option value="Other Charges">Other Charges</option>
              </select>
            </div>
            <div className="col-span-12 md:col-span-2">
              <MonthSelector
                value={otherBilling.month}
                onChange={(val) => setOtherBilling({ ...otherBilling, month: val })}
              />
            </div>
            <div className="col-span-12 md:col-span-2">
              <input
                type="date"
                value={otherBilling.startDate}
                onChange={(e) => setOtherBilling({ ...otherBilling, startDate: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              />
              <p className="text-xs text-slate-400 mt-1">Start Date</p>
            </div>
            <div className="col-span-12 md:col-span-2">
              <input
                type="date"
                value={otherBilling.endDate}
                onChange={(e) => setOtherBilling({ ...otherBilling, endDate: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              />
              <p className="text-xs text-slate-400 mt-1">End Date</p>
            </div>
            <div className="col-span-12 md:col-span-2">
              <GenerateButton
                onClick={handleGenerateOther}
                loading={loading}
                label="Generate"
              />
            </div>
          </div>
        </Card>
        
        {/* Additional Information Section */}
        {/*<Card title="Billing Instructions" className="bg-amber-50 border-amber-200">
          <div className="text-sm text-slate-600 space-y-2">
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              Select branch and client before generating any billing report
            </p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              Date range can be customized for all billing types
            </p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              Product-Wise billing includes additional filters for categories and plant codes
            </p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              Generated reports will open in a new tab as PDF/Excel format
            </p>
          </div>
        </Card>*/}
      </div>
    </div>
  );
}