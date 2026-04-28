"use client";

import { useState, useEffect, useRef } from "react";
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

// Branch Selector with API data
function BranchSelector({ value, onChange, label = "Branch", branches = [], loading = false }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
        disabled={loading}
      >
        <option value="">Select Branch</option>
        {branches.map(branch => (
          <option key={branch._id} value={branch._id}>
            {branch.name} {branch.code ? `(${branch.code})` : ''}
          </option>
        ))}
      </select>
      {loading && <p className="text-xs text-slate-400 mt-1">Loading branches...</p>}
    </div>
  );
}

// Client Selector with API data
function ClientSelector({ value, onChange, label = "Client Name", clients = [], loading = false }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
        disabled={loading}
      >
        <option value="">Select Client</option>
        {clients.map(client => (
          <option key={client._id} value={client._id}>
            {client.customerName} {client.customerCode ? `(${client.customerCode})` : ''}
          </option>
        ))}
      </select>
      {loading && <p className="text-xs text-slate-400 mt-1">Loading clients...</p>}
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

function PlantCodeSelector({ value, onChange, label = "Plant Code", plants = [], loading = false }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
        disabled={loading}
      >
        <option value="">Select Plant Code</option>
        {plants.map(plant => (
          <option key={plant._id} value={plant._id}>
            {plant.code} - {plant.name}
          </option>
        ))}
      </select>
      {loading && <p className="text-xs text-slate-400 mt-1">Loading plants...</p>}
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
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingPlants, setLoadingPlants] = useState(false);
  
  // API Data
  const [branches, setBranches] = useState([]);
  const [clients, setClients] = useState([]);
  const [plants, setPlants] = useState([]);
  
  // Common state
  const [branch, setBranch] = useState("");
  
  // Product-Wise Billing State
  const [productWise, setProductWise] = useState({
    clientId: "",
    clientName: "",
    productCategories: "",
    plantId: "",
    plantCode: "",
    month: "",
    orderType: "Sales",
    startDate: "",
    endDate: ""
  });
  
  // General Billing State
  const [generalBilling, setGeneralBilling] = useState({
    clientId: "",
    clientName: "",
    month: "",
    orderType: "Sales",
    startDate: "",
    endDate: ""
  });
  
  // Detention Billing State
  const [detentionBilling, setDetentionBilling] = useState({
    clientId: "",
    clientName: "",
    detention: "",
    month: "",
    startDate: "",
    endDate: ""
  });
  
  // Cancellation Billing State
  const [cancellationBilling, setCancellationBilling] = useState({
    clientId: "",
    clientName: "",
    cancellation: "",
    month: "",
    startDate: "",
    endDate: ""
  });
  
  // Other Billing State
  const [otherBilling, setOtherBilling] = useState({
    clientId: "",
    clientName: "",
    type: "Cancellation",
    month: "",
    startDate: "",
    endDate: ""
  });
  
  // Fetch Branches
  const fetchBranches = async () => {
    setLoadingBranches(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/branches', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setBranches(data.data);
        // Set default branch if available
        if (data.data.length > 0 && !branch) {
          setBranch(data.data[0]._id);
        }
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    } finally {
      setLoadingBranches(false);
    }
  };
  
  // Fetch Clients (Customers)
  const fetchClients = async () => {
    setLoadingClients(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/customers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setClients(data.data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoadingClients(false);
    }
  };
  
  // Fetch Plants
  const fetchPlants = async () => {
    setLoadingPlants(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/plants', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setPlants(data.data);
      }
    } catch (error) {
      console.error('Error fetching plants:', error);
    } finally {
      setLoadingPlants(false);
    }
  };
  
  // Get client name by ID
  const getClientName = (clientId) => {
    const client = clients.find(c => c._id === clientId);
    return client ? client.customerName : "";
  };
  
  // Get plant code by ID
  const getPlantCode = (plantId) => {
    const plant = plants.find(p => p._id === plantId);
    return plant ? plant.code : "";
  };
  
  // Handle client selection for product wise
  const handleProductWiseClientChange = (clientId) => {
    const clientName = getClientName(clientId);
    setProductWise({
      ...productWise,
      clientId: clientId,
      clientName: clientName
    });
  };
  
  // Handle client selection for general
  const handleGeneralClientChange = (clientId) => {
    const clientName = getClientName(clientId);
    setGeneralBilling({
      ...generalBilling,
      clientId: clientId,
      clientName: clientName
    });
  };
  
  // Handle client selection for detention
  const handleDetentionClientChange = (clientId) => {
    const clientName = getClientName(clientId);
    setDetentionBilling({
      ...detentionBilling,
      clientId: clientId,
      clientName: clientName
    });
  };
  
  // Handle client selection for cancellation
  const handleCancellationClientChange = (clientId) => {
    const clientName = getClientName(clientId);
    setCancellationBilling({
      ...cancellationBilling,
      clientId: clientId,
      clientName: clientName
    });
  };
  
  // Handle client selection for other
  const handleOtherClientChange = (clientId) => {
    const clientName = getClientName(clientId);
    setOtherBilling({
      ...otherBilling,
      clientId: clientId,
      clientName: clientName
    });
  };
  
  // Handle plant selection for product wise
  const handlePlantChange = (plantId) => {
    const plantCode = getPlantCode(plantId);
    setProductWise({
      ...productWise,
      plantId: plantId,
      plantCode: plantCode
    });
  };
  
  // Fetch data on mount
  useEffect(() => {
    fetchBranches();
    fetchClients();
    fetchPlants();
    
    // Set default dates
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    const defaultStartDate = formatDate(firstDayOfMonth);
    const defaultEndDate = formatDate(lastDayOfMonth);
    const defaultMonth = today.toLocaleString('default', { month: 'long' });
    
    // Set default values
    setProductWise(prev => ({ ...prev, startDate: defaultStartDate, endDate: defaultEndDate, month: defaultMonth }));
    setGeneralBilling(prev => ({ ...prev, startDate: defaultStartDate, endDate: defaultEndDate, month: defaultMonth }));
    setDetentionBilling(prev => ({ ...prev, startDate: defaultStartDate, endDate: defaultEndDate, month: defaultMonth }));
    setCancellationBilling(prev => ({ ...prev, startDate: defaultStartDate, endDate: defaultEndDate, month: defaultMonth }));
    setOtherBilling(prev => ({ ...prev, startDate: defaultStartDate, endDate: defaultEndDate, month: defaultMonth }));
  }, []);
  
  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '4-digit' }).replace(/\//g, '.');
  };
  
  const handleGenerateProductWise = async () => {
    if (!branch) {
      alert("Please select a branch");
      return;
    }
    if (!productWise.clientId) {
      alert("Please select a client");
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        type: 'product-wise',
        branchId: branch,
        branchName: branches.find(b => b._id === branch)?.name || '',
        clientId: productWise.clientId,
        clientName: productWise.clientName,
        productCategories: productWise.productCategories,
        plantId: productWise.plantId,
        plantCode: productWise.plantCode,
        month: productWise.month,
        orderType: productWise.orderType,
        startDate: productWise.startDate,
        endDate: productWise.endDate
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
    if (!branch) {
      alert("Please select a branch");
      return;
    }
    if (!generalBilling.clientId) {
      alert("Please select a client");
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        type: 'general',
        branchId: branch,
        branchName: branches.find(b => b._id === branch)?.name || '',
        clientId: generalBilling.clientId,
        clientName: generalBilling.clientName,
        month: generalBilling.month,
        orderType: generalBilling.orderType,
        startDate: generalBilling.startDate,
        endDate: generalBilling.endDate
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
    if (!branch) {
      alert("Please select a branch");
      return;
    }
    if (!detentionBilling.clientId) {
      alert("Please select a client");
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        type: 'detention',
        branchId: branch,
        branchName: branches.find(b => b._id === branch)?.name || '',
        clientId: detentionBilling.clientId,
        clientName: detentionBilling.clientName,
        detention: detentionBilling.detention,
        month: detentionBilling.month,
        startDate: detentionBilling.startDate,
        endDate: detentionBilling.endDate
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
    if (!branch) {
      alert("Please select a branch");
      return;
    }
    if (!cancellationBilling.clientId) {
      alert("Please select a client");
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        type: 'cancellation',
        branchId: branch,
        branchName: branches.find(b => b._id === branch)?.name || '',
        clientId: cancellationBilling.clientId,
        clientName: cancellationBilling.clientName,
        cancellation: cancellationBilling.cancellation,
        month: cancellationBilling.month,
        startDate: cancellationBilling.startDate,
        endDate: cancellationBilling.endDate
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
    if (!branch) {
      alert("Please select a branch");
      return;
    }
    if (!otherBilling.clientId) {
      alert("Please select a client");
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        type: 'other',
        branchId: branch,
        branchName: branches.find(b => b._id === branch)?.name || '',
        clientId: otherBilling.clientId,
        clientName: otherBilling.clientName,
        billingType: otherBilling.type,
        month: otherBilling.month,
        startDate: otherBilling.startDate,
        endDate: otherBilling.endDate
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
                value={productWise.clientId}
                onChange={handleProductWiseClientChange}
                clients={clients}
                loading={loadingClients}
              />
            </div>
            <div className="col-span-12 md:col-span-3">
              <BranchSelector
                value={branch}
                onChange={setBranch}
                branches={branches}
                loading={loadingBranches}
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
                value={productWise.plantId}
                onChange={handlePlantChange}
                plants={plants}
                loading={loadingPlants}
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
                value={generalBilling.clientId}
                onChange={handleGeneralClientChange}
                clients={clients}
                loading={loadingClients}
              />
            </div>
            <div className="col-span-12 md:col-span-3">
              <BranchSelector
                value={branch}
                onChange={setBranch}
                branches={branches}
                loading={loadingBranches}
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
                value={detentionBilling.clientId}
                onChange={handleDetentionClientChange}
                clients={clients}
                loading={loadingClients}
              />
            </div>
            <div className="col-span-12 md:col-span-3">
              <BranchSelector
                value={branch}
                onChange={setBranch}
                branches={branches}
                loading={loadingBranches}
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
                value={cancellationBilling.clientId}
                onChange={handleCancellationClientChange}
                clients={clients}
                loading={loadingClients}
              />
            </div>
            <div className="col-span-12 md:col-span-3">
              <BranchSelector
                value={branch}
                onChange={setBranch}
                branches={branches}
                loading={loadingBranches}
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
                value={otherBilling.clientId}
                onChange={handleOtherClientChange}
                clients={clients}
                loading={loadingClients}
              />
            </div>
            <div className="col-span-12 md:col-span-3">
              <BranchSelector
                value={branch}
                onChange={setBranch}
                branches={branches}
                loading={loadingBranches}
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
        
      </div>
    </div>
  );
}