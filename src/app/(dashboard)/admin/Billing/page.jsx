//"use client";
//
//import { useState, useEffect, useRef } from "react";
//import { useRouter } from "next/navigation";
//
//function Card({ title, children, className = "" }) {
//  return (
//    <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm mb-6 ${className}`}>
//      <div className="border-b border-slate-100 px-5 py-3">
//        <div className="text-base font-bold text-slate-900">{title}</div>
//      </div>
//      <div className="p-5">{children}</div>
//    </div>
//  );
//}
//
//function FilterSection({ title, children, defaultOpen = true }) {
//  const [isOpen, setIsOpen] = useState(defaultOpen);
//  
//  return (
//    <div className="mb-4 border border-slate-200 rounded-xl overflow-hidden">
//      <button
//        onClick={() => setIsOpen(!isOpen)}
//        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
//      >
//        <span className="font-semibold text-slate-700">{title}</span>
//        <svg
//          className={`w-5 h-5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
//          fill="none"
//          stroke="currentColor"
//          viewBox="0 0 24 24"
//        >
//          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//        </svg>
//      </button>
//      {isOpen && <div className="p-4">{children}</div>}
//    </div>
//  );
//}
//
//// Branch Selector with API data
//function BranchSelector({ value, onChange, label = "Branch", branches = [], loading = false }) {
//  return (
//    <div>
//      <label className="block text-xs font-bold text-slate-600 mb-1">{label}</label>
//      <select
//        value={value}
//        onChange={(e) => onChange(e.target.value)}
//        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
//        disabled={loading}
//      >
//        <option value="">Select Branch</option>
//        {branches.map(branch => (
//          <option key={branch._id} value={branch._id}>
//            {branch.name} {branch.code ? `(${branch.code})` : ''}
//          </option>
//        ))}
//      </select>
//      {loading && <p className="text-xs text-slate-400 mt-1">Loading branches...</p>}
//    </div>
//  );
//}
//
//// Client Selector with API data
//function ClientSelector({ value, onChange, label = "Client Name", clients = [], loading = false }) {
//  return (
//    <div>
//      <label className="block text-xs font-bold text-slate-600 mb-1">{label}</label>
//      <select
//        value={value}
//        onChange={(e) => onChange(e.target.value)}
//        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
//        disabled={loading}
//      >
//        <option value="">Select Client</option>
//        {clients.map(client => (
//          <option key={client._id} value={client._id}>
//            {client.customerName} {client.customerCode ? `(${client.customerCode})` : ''}
//          </option>
//        ))}
//      </select>
//      {loading && <p className="text-xs text-slate-400 mt-1">Loading clients...</p>}
//    </div>
//  );
//}
//
//function MonthSelector({ value, onChange, label = "Month" }) {
//  const months = [
//    "January", "February", "March", "April", "May", "June",
//    "July", "August", "September", "October", "November", "December"
//  ];
//  
//  return (
//    <div>
//      <label className="block text-xs font-bold text-slate-600 mb-1">{label}</label>
//      <select
//        value={value}
//        onChange={(e) => onChange(e.target.value)}
//        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
//      >
//        <option value="">Select Month</option>
//        {months.map(month => (
//          <option key={month} value={month}>{month}</option>
//        ))}
//      </select>
//    </div>
//  );
//}
//
//function OrderTypeSelector({ value, onChange, label = "Order Type" }) {
//  const types = ["Sales", "STO", "NA", "Return"];
//  
//  return (
//    <div>
//      <label className="block text-xs font-bold text-slate-600 mb-1">{label}</label>
//      <select
//        value={value}
//        onChange={(e) => onChange(e.target.value)}
//        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
//      >
//        <option value="">Select Type</option>
//        {types.map(type => (
//          <option key={type} value={type}>{type}</option>
//        ))}
//      </select>
//    </div>
//  );
//}
//
//function ProductCategorySelector({ value, onChange, label = "Product Categories" }) {
//  const categories = [
//    "Biological",
//    "Premium Product",
//    "Standard",
//    "Economy",
//    "Specialty"
//  ];
//  
//  return (
//    <div>
//      <label className="block text-xs font-bold text-slate-600 mb-1">{label}</label>
//      <select
//        value={value}
//        onChange={(e) => onChange(e.target.value)}
//        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
//      >
//        <option value="">Select Category</option>
//        {categories.map(category => (
//          <option key={category} value={category}>{category}</option>
//        ))}
//      </select>
//    </div>
//  );
//}
//
//function PlantCodeSelector({ value, onChange, label = "Plant Code", plants = [], loading = false }) {
//  return (
//    <div>
//      <label className="block text-xs font-bold text-slate-600 mb-1">{label}</label>
//      <select
//        value={value}
//        onChange={(e) => onChange(e.target.value)}
//        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
//        disabled={loading}
//      >
//        <option value="">Select Plant Code</option>
//        {plants.map(plant => (
//          <option key={plant._id} value={plant._id}>
//            {plant.code} - {plant.name}
//          </option>
//        ))}
//      </select>
//      {loading && <p className="text-xs text-slate-400 mt-1">Loading plants...</p>}
//    </div>
//  );
//}
//
//function GenerateButton({ onClick, loading = false, label = "Generate Report" }) {
//  return (
//    <div className="flex items-end">
//      <button
//        onClick={onClick}
//        disabled={loading}
//        className={`w-full rounded-xl px-4 py-2 text-sm font-bold text-white transition ${
//          loading
//            ? 'bg-gray-400 cursor-not-allowed'
//            : 'bg-emerald-600 hover:bg-emerald-700'
//        }`}
//      >
//        {loading ? (
//          <div className="flex items-center justify-center gap-2">
//            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
//              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//            </svg>
//            Generating...
//          </div>
//        ) : (
//          label
//        )}
//      </button>
//    </div>
//  );
//}
//
//// Billing Type Dropdown Component
//function BillingTypeSelector({ value, onChange, label = "Select Billing Type" }) {
//  const billingTypes = [
//    { value: "product-wise", label: "Yara - Product-Wise Billing" },
//    { value: "general", label: "General - Billing" },
//    { value: "detention", label: "Detention - Billing" },
//    { value: "cancellation", label: "Cancellation - Billing" },
//    { value: "other", label: "Other - Billing" }
//  ];
//  
//  return (
//    <div className="mb-6">
//      <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
//      <select
//        value={value}
//        onChange={(e) => onChange(e.target.value)}
//        className="w-full md:w-96 rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 font-medium"
//      >
//        <option value="">-- Select Billing Type --</option>
//        {billingTypes.map(type => (
//          <option key={type.value} value={type.value}>{type.label}</option>
//        ))}
//      </select>
//    </div>
//  );
//}
//
//export default function BillingPage() {
//  const router = useRouter();
//  const [loading, setLoading] = useState(false);
//  const [loadingBranches, setLoadingBranches] = useState(false);
//  const [loadingClients, setLoadingClients] = useState(false);
//  const [loadingPlants, setLoadingPlants] = useState(false);
//  
//  // Selected billing type
//  const [selectedBillingType, setSelectedBillingType] = useState("");
//  
//  // API Data
//  const [branches, setBranches] = useState([]);
//  const [clients, setClients] = useState([]);
//  const [plants, setPlants] = useState([]);
//  
//  // Common state
//  const [branch, setBranch] = useState("");
//  
//  // Product-Wise Billing State
//  const [productWise, setProductWise] = useState({
//    clientId: "",
//    clientName: "",
//    productCategories: "",
//    plantId: "",
//    plantCode: "",
//    month: "",
//    orderType: "Sales",
//    startDate: "",
//    endDate: ""
//  });
//  
//  // General Billing State
//  const [generalBilling, setGeneralBilling] = useState({
//    clientId: "",
//    clientName: "",
//    month: "",
//    orderType: "Sales",
//    startDate: "",
//    endDate: ""
//  });
//  
//  // Detention Billing State
//  const [detentionBilling, setDetentionBilling] = useState({
//    clientId: "",
//    clientName: "",
//    detention: "",
//    month: "",
//    startDate: "",
//    endDate: ""
//  });
//  
//  // Cancellation Billing State
//  const [cancellationBilling, setCancellationBilling] = useState({
//    clientId: "",
//    clientName: "",
//    cancellation: "",
//    month: "",
//    startDate: "",
//    endDate: ""
//  });
//  
//  // Other Billing State
//  const [otherBilling, setOtherBilling] = useState({
//    clientId: "",
//    clientName: "",
//    type: "Cancellation",
//    month: "",
//    startDate: "",
//    endDate: ""
//  });
//  
//  // Fetch Branches
//  const fetchBranches = async () => {
//    setLoadingBranches(true);
//    try {
//      const token = localStorage.getItem('token');
//      const res = await fetch('/api/branches', {
//        headers: { Authorization: `Bearer ${token}` },
//      });
//      const data = await res.json();
//      if (data.success && Array.isArray(data.data)) {
//        setBranches(data.data);
//        // Set default branch if available
//        if (data.data.length > 0 && !branch) {
//          setBranch(data.data[0]._id);
//        }
//      }
//    } catch (error) {
//      console.error('Error fetching branches:', error);
//    } finally {
//      setLoadingBranches(false);
//    }
//  };
//  
//  // Fetch Clients (Customers)
//  const fetchClients = async () => {
//    setLoadingClients(true);
//    try {
//      const token = localStorage.getItem('token');
//      const res = await fetch('/api/customers', {
//        headers: { Authorization: `Bearer ${token}` },
//      });
//      const data = await res.json();
//      if (data.success && Array.isArray(data.data)) {
//        setClients(data.data);
//      }
//    } catch (error) {
//      console.error('Error fetching clients:', error);
//    } finally {
//      setLoadingClients(false);
//    }
//  };
//  
//  // Fetch Plants
//  const fetchPlants = async () => {
//    setLoadingPlants(true);
//    try {
//      const token = localStorage.getItem('token');
//      const res = await fetch('/api/plants', {
//        headers: { Authorization: `Bearer ${token}` },
//      });
//      const data = await res.json();
//      if (data.success && Array.isArray(data.data)) {
//        setPlants(data.data);
//      }
//    } catch (error) {
//      console.error('Error fetching plants:', error);
//    } finally {
//      setLoadingPlants(false);
//    }
//  };
//  
//  // Get client name by ID
//  const getClientName = (clientId) => {
//    const client = clients.find(c => c._id === clientId);
//    return client ? client.customerName : "";
//  };
//  
//  // Get plant code by ID
//  const getPlantCode = (plantId) => {
//    const plant = plants.find(p => p._id === plantId);
//    return plant ? plant.code : "";
//  };
//  
//  // Handle client selection for product wise
//  const handleProductWiseClientChange = (clientId) => {
//    const clientName = getClientName(clientId);
//    setProductWise({
//      ...productWise,
//      clientId: clientId,
//      clientName: clientName
//    });
//  };
//  
//  // Handle client selection for general
//  const handleGeneralClientChange = (clientId) => {
//    const clientName = getClientName(clientId);
//    setGeneralBilling({
//      ...generalBilling,
//      clientId: clientId,
//      clientName: clientName
//    });
//  };
//  
//  // Handle client selection for detention
//  const handleDetentionClientChange = (clientId) => {
//    const clientName = getClientName(clientId);
//    setDetentionBilling({
//      ...detentionBilling,
//      clientId: clientId,
//      clientName: clientName
//    });
//  };
//  
//  // Handle client selection for cancellation
//  const handleCancellationClientChange = (clientId) => {
//    const clientName = getClientName(clientId);
//    setCancellationBilling({
//      ...cancellationBilling,
//      clientId: clientId,
//      clientName: clientName
//    });
//  };
//  
//  // Handle client selection for other
//  const handleOtherClientChange = (clientId) => {
//    const clientName = getClientName(clientId);
//    setOtherBilling({
//      ...otherBilling,
//      clientId: clientId,
//      clientName: clientName
//    });
//  };
//  
//  // Handle plant selection for product wise
//  const handlePlantChange = (plantId) => {
//    const plantCode = getPlantCode(plantId);
//    setProductWise({
//      ...productWise,
//      plantId: plantId,
//      plantCode: plantCode
//    });
//  };
//  
//  // Fetch data on mount
//  useEffect(() => {
//    fetchBranches();
//    fetchClients();
//    fetchPlants();
//    
//    // Set default dates
//    const today = new Date();
//    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
//    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
//    
//    const formatDate = (date) => date.toISOString().split('T')[0];
//    
//    const defaultStartDate = formatDate(firstDayOfMonth);
//    const defaultEndDate = formatDate(lastDayOfMonth);
//    const defaultMonth = today.toLocaleString('default', { month: 'long' });
//    
//    // Set default values
//    setProductWise(prev => ({ ...prev, startDate: defaultStartDate, endDate: defaultEndDate, month: defaultMonth }));
//    setGeneralBilling(prev => ({ ...prev, startDate: defaultStartDate, endDate: defaultEndDate, month: defaultMonth }));
//    setDetentionBilling(prev => ({ ...prev, startDate: defaultStartDate, endDate: defaultEndDate, month: defaultMonth }));
//    setCancellationBilling(prev => ({ ...prev, startDate: defaultStartDate, endDate: defaultEndDate, month: defaultMonth }));
//    setOtherBilling(prev => ({ ...prev, startDate: defaultStartDate, endDate: defaultEndDate, month: defaultMonth }));
//  }, []);
//  
//  const formatDateForDisplay = (dateStr) => {
//    if (!dateStr) return "";
//    const date = new Date(dateStr);
//    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '4-digit' }).replace(/\//g, '.');
//  };
//  
//  const handleGenerateProductWise = async () => {
//    if (!branch) {
//      alert("Please select a branch");
//      return;
//    }
//    if (!productWise.clientId) {
//      alert("Please select a client");
//      return;
//    }
//    
//    setLoading(true);
//    try {
//      const token = localStorage.getItem('token');
//      const payload = {
//        type: 'product-wise',
//        branchId: branch,
//        branchName: branches.find(b => b._id === branch)?.name || '',
//        clientId: productWise.clientId,
//        clientName: productWise.clientName,
//        productCategories: productWise.productCategories,
//        plantId: productWise.plantId,
//        plantCode: productWise.plantCode,
//        month: productWise.month,
//        orderType: productWise.orderType,
//        startDate: productWise.startDate,
//        endDate: productWise.endDate
//      };
//      
//      const response = await fetch('/api/billing/product-wise', {
//        method: 'POST',
//        headers: {
//          'Content-Type': 'application/json',
//          Authorization: `Bearer ${token}`
//        },
//        body: JSON.stringify(payload)
//      });
//      
//      const data = await response.json();
//      
//      if (data.success) {
//        alert(`✅ Product-Wise Billing Report Generated!\nClient: ${productWise.clientName}\nPeriod: ${formatDateForDisplay(productWise.startDate)} to ${formatDateForDisplay(productWise.endDate)}`);
//        if (data.reportUrl) {
//          window.open(data.reportUrl, '_blank');
//        }
//      } else {
//        alert(data.message || 'Failed to generate report');
//      }
//    } catch (error) {
//      console.error('Error:', error);
//      alert('Failed to generate report');
//    } finally {
//      setLoading(false);
//    }
//  };
//  
//  const handleGenerateGeneral = async () => {
//    if (!branch) {
//      alert("Please select a branch");
//      return;
//    }
//    if (!generalBilling.clientId) {
//      alert("Please select a client");
//      return;
//    }
//    
//    setLoading(true);
//    try {
//      const token = localStorage.getItem('token');
//      const payload = {
//        type: 'general',
//        branchId: branch,
//        branchName: branches.find(b => b._id === branch)?.name || '',
//        clientId: generalBilling.clientId,
//        clientName: generalBilling.clientName,
//        month: generalBilling.month,
//        orderType: generalBilling.orderType,
//        startDate: generalBilling.startDate,
//        endDate: generalBilling.endDate
//      };
//      
//      const response = await fetch('/api/billing/general', {
//        method: 'POST',
//        headers: {
//          'Content-Type': 'application/json',
//          Authorization: `Bearer ${token}`
//        },
//        body: JSON.stringify(payload)
//      });
//      
//      const data = await response.json();
//      
//      if (data.success) {
//        alert(`✅ General Billing Report Generated!\nClient: ${generalBilling.clientName}\nOrder Type: ${generalBilling.orderType}\nPeriod: ${formatDateForDisplay(generalBilling.startDate)} to ${formatDateForDisplay(generalBilling.endDate)}`);
//        if (data.reportUrl) {
//          window.open(data.reportUrl, '_blank');
//        }
//      } else {
//        alert(data.message || 'Failed to generate report');
//      }
//    } catch (error) {
//      console.error('Error:', error);
//      alert('Failed to generate report');
//    } finally {
//      setLoading(false);
//    }
//  };
//  
//  const handleGenerateDetention = async () => {
//    if (!branch) {
//      alert("Please select a branch");
//      return;
//    }
//    if (!detentionBilling.clientId) {
//      alert("Please select a client");
//      return;
//    }
//    
//    setLoading(true);
//    try {
//      const token = localStorage.getItem('token');
//      const payload = {
//        type: 'detention',
//        branchId: branch,
//        branchName: branches.find(b => b._id === branch)?.name || '',
//        clientId: detentionBilling.clientId,
//        clientName: detentionBilling.clientName,
//        detention: detentionBilling.detention,
//        month: detentionBilling.month,
//        startDate: detentionBilling.startDate,
//        endDate: detentionBilling.endDate
//      };
//      
//      const response = await fetch('/api/billing/detention', {
//        method: 'POST',
//        headers: {
//          'Content-Type': 'application/json',
//          Authorization: `Bearer ${token}`
//        },
//        body: JSON.stringify(payload)
//      });
//      
//      const data = await response.json();
//      
//      if (data.success) {
//        alert(`✅ Detention Billing Report Generated!\nClient: ${detentionBilling.clientName}\nPeriod: ${formatDateForDisplay(detentionBilling.startDate)} to ${formatDateForDisplay(detentionBilling.endDate)}`);
//        if (data.reportUrl) {
//          window.open(data.reportUrl, '_blank');
//        }
//      } else {
//        alert(data.message || 'Failed to generate report');
//      }
//    } catch (error) {
//      console.error('Error:', error);
//      alert('Failed to generate report');
//    } finally {
//      setLoading(false);
//    }
//  };
//  
//  const handleGenerateCancellation = async () => {
//    if (!branch) {
//      alert("Please select a branch");
//      return;
//    }
//    if (!cancellationBilling.clientId) {
//      alert("Please select a client");
//      return;
//    }
//    
//    setLoading(true);
//    try {
//      const token = localStorage.getItem('token');
//      const payload = {
//        type: 'cancellation',
//        branchId: branch,
//        branchName: branches.find(b => b._id === branch)?.name || '',
//        clientId: cancellationBilling.clientId,
//        clientName: cancellationBilling.clientName,
//        cancellation: cancellationBilling.cancellation,
//        month: cancellationBilling.month,
//        startDate: cancellationBilling.startDate,
//        endDate: cancellationBilling.endDate
//      };
//      
//      const response = await fetch('/api/billing/cancellation', {
//        method: 'POST',
//        headers: {
//          'Content-Type': 'application/json',
//          Authorization: `Bearer ${token}`
//        },
//        body: JSON.stringify(payload)
//      });
//      
//      const data = await response.json();
//      
//      if (data.success) {
//        alert(`✅ Cancellation Billing Report Generated!\nClient: ${cancellationBilling.clientName}\nPeriod: ${formatDateForDisplay(cancellationBilling.startDate)} to ${formatDateForDisplay(cancellationBilling.endDate)}`);
//        if (data.reportUrl) {
//          window.open(data.reportUrl, '_blank');
//        }
//      } else {
//        alert(data.message || 'Failed to generate report');
//      }
//    } catch (error) {
//      console.error('Error:', error);
//      alert('Failed to generate report');
//    } finally {
//      setLoading(false);
//    }
//  };
//  
//  const handleGenerateOther = async () => {
//    if (!branch) {
//      alert("Please select a branch");
//      return;
//    }
//    if (!otherBilling.clientId) {
//      alert("Please select a client");
//      return;
//    }
//    
//    setLoading(true);
//    try {
//      const token = localStorage.getItem('token');
//      const payload = {
//        type: 'other',
//        branchId: branch,
//        branchName: branches.find(b => b._id === branch)?.name || '',
//        clientId: otherBilling.clientId,
//        clientName: otherBilling.clientName,
//        billingType: otherBilling.type,
//        month: otherBilling.month,
//        startDate: otherBilling.startDate,
//        endDate: otherBilling.endDate
//      };
//      
//      const response = await fetch('/api/billing/other', {
//        method: 'POST',
//        headers: {
//          'Content-Type': 'application/json',
//          Authorization: `Bearer ${token}`
//        },
//        body: JSON.stringify(payload)
//      });
//      
//      const data = await response.json();
//      
//      if (data.success) {
//        alert(`✅ Other Billing Report Generated!\nClient: ${otherBilling.clientName}\nType: ${otherBilling.type}\nPeriod: ${formatDateForDisplay(otherBilling.startDate)} to ${formatDateForDisplay(otherBilling.endDate)}`);
//        if (data.reportUrl) {
//          window.open(data.reportUrl, '_blank');
//        }
//      } else {
//        alert(data.message || 'Failed to generate report');
//      }
//    } catch (error) {
//      console.error('Error:', error);
//      alert('Failed to generate report');
//    } finally {
//      setLoading(false);
//    }
//  };
//  
//  // Render selected billing type card
//  const renderSelectedBillingCard = () => {
//    switch(selectedBillingType) {
//      case "product-wise":
//        return (
//          <Card title="Yara - Product-Wise Billing">
//            <div className="grid grid-cols-12 gap-5">
//              <div className="col-span-12 md:col-span-3">
//                <ClientSelector
//                  value={productWise.clientId}
//                  onChange={handleProductWiseClientChange}
//                  clients={clients}
//                  loading={loadingClients}
//                />
//              </div>
//              <div className="col-span-12 md:col-span-3">
//                <BranchSelector
//                  value={branch}
//                  onChange={setBranch}
//                  branches={branches}
//                  loading={loadingBranches}
//                />
//              </div>
//              <div className="col-span-12 md:col-span-6"></div>
//              
//              <div className="col-span-12 md:col-span-2">
//                <ProductCategorySelector
//                  value={productWise.productCategories}
//                  onChange={(val) => setProductWise({ ...productWise, productCategories: val })}
//                />
//              </div>
//              <div className="col-span-12 md:col-span-2">
//                <PlantCodeSelector
//                  value={productWise.plantId}
//                  onChange={handlePlantChange}
//                  plants={plants}
//                  loading={loadingPlants}
//                />
//              </div>
//              <div className="col-span-12 md:col-span-2">
//                <MonthSelector
//                  value={productWise.month}
//                  onChange={(val) => setProductWise({ ...productWise, month: val })}
//                />
//              </div>
//              <div className="col-span-12 md:col-span-2">
//                <OrderTypeSelector
//                  value={productWise.orderType}
//                  onChange={(val) => setProductWise({ ...productWise, orderType: val })}
//                />
//              </div>
//              <div className="col-span-12 md:col-span-2">
//                <input
//                  type="date"
//                  value={productWise.startDate}
//                  onChange={(e) => setProductWise({ ...productWise, startDate: e.target.value })}
//                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
//                />
//                <p className="text-xs text-slate-400 mt-1">Start Date</p>
//              </div>
//              <div className="col-span-12 md:col-span-2">
//                <input
//                  type="date"
//                  value={productWise.endDate}
//                  onChange={(e) => setProductWise({ ...productWise, endDate: e.target.value })}
//                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
//                />
//                <p className="text-xs text-slate-400 mt-1">End Date</p>
//              </div>
//              <div className="col-span-12 md:col-span-2">
//                <GenerateButton
//                  onClick={handleGenerateProductWise}
//                  loading={loading}
//                  label="Generate"
//                />
//              </div>
//            </div>
//          </Card>
//        );
//        
//      case "general":
//        return (
//          <Card title="General - Billing">
//            <div className="grid grid-cols-12 gap-5">
//              <div className="col-span-12 md:col-span-3">
//                <ClientSelector
//                  value={generalBilling.clientId}
//                  onChange={handleGeneralClientChange}
//                  clients={clients}
//                  loading={loadingClients}
//                />
//              </div>
//              <div className="col-span-12 md:col-span-3">
//                <BranchSelector
//                  value={branch}
//                  onChange={setBranch}
//                  branches={branches}
//                  loading={loadingBranches}
//                />
//              </div>
//              <div className="col-span-12 md:col-span-6"></div>
//              
//              <div className="col-span-12 md:col-span-2">
//                <MonthSelector
//                  value={generalBilling.month}
//                  onChange={(val) => setGeneralBilling({ ...generalBilling, month: val })}
//                />
//              </div>
//              <div className="col-span-12 md:col-span-2">
//                <OrderTypeSelector
//                  value={generalBilling.orderType}
//                  onChange={(val) => setGeneralBilling({ ...generalBilling, orderType: val })}
//                />
//              </div>
//              <div className="col-span-12 md:col-span-2">
//                <input
//                  type="date"
//                  value={generalBilling.startDate}
//                  onChange={(e) => setGeneralBilling({ ...generalBilling, startDate: e.target.value })}
//                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
//                />
//                <p className="text-xs text-slate-400 mt-1">Start Date</p>
//              </div>
//              <div className="col-span-12 md:col-span-2">
//                <input
//                  type="date"
//                  value={generalBilling.endDate}
//                  onChange={(e) => setGeneralBilling({ ...generalBilling, endDate: e.target.value })}
//                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
//                />
//                <p className="text-xs text-slate-400 mt-1">End Date</p>
//              </div>
//              <div className="col-span-12 md:col-span-2">
//                <GenerateButton
//                  onClick={handleGenerateGeneral}
//                  loading={loading}
//                  label="Generate"
//                />
//              </div>
//            </div>
//          </Card>
//        );
//        
//      case "detention":
//        return (
//          <Card title="Detention - Billing">
//            <div className="grid grid-cols-12 gap-5">
//              <div className="col-span-12 md:col-span-3">
//                <ClientSelector
//                  value={detentionBilling.clientId}
//                  onChange={handleDetentionClientChange}
//                  clients={clients}
//                  loading={loadingClients}
//                />
//              </div>
//              <div className="col-span-12 md:col-span-3">
//                <BranchSelector
//                  value={branch}
//                  onChange={setBranch}
//                  branches={branches}
//                  loading={loadingBranches}
//                />
//              </div>
//              <div className="col-span-12 md:col-span-6"></div>
//              
//              <div className="col-span-12 md:col-span-2">
//                <label className="block text-xs font-bold text-slate-600 mb-1">Detention</label>
//                <input
//                  type="text"
//                  value={detentionBilling.detention}
//                  onChange={(e) => setDetentionBilling({ ...detentionBilling, detention: e.target.value })}
//                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
//                  placeholder="Detention Type"
//                />
//              </div>
//              <div className="col-span-12 md:col-span-2">
//                <MonthSelector
//                  value={detentionBilling.month}
//                  onChange={(val) => setDetentionBilling({ ...detentionBilling, month: val })}
//                />
//              </div>
//              <div className="col-span-12 md:col-span-2">
//                <input
//                  type="date"
//                  value={detentionBilling.startDate}
//                  onChange={(e) => setDetentionBilling({ ...detentionBilling, startDate: e.target.value })}
//                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
//                />
//                <p className="text-xs text-slate-400 mt-1">Start Date</p>
//              </div>
//              <div className="col-span-12 md:col-span-2">
//                <input
//                  type="date"
//                  value={detentionBilling.endDate}
//                  onChange={(e) => setDetentionBilling({ ...detentionBilling, endDate: e.target.value })}
//                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
//                />
//                <p className="text-xs text-slate-400 mt-1">End Date</p>
//              </div>
//              <div className="col-span-12 md:col-span-2">
//                <GenerateButton
//                  onClick={handleGenerateDetention}
//                  loading={loading}
//                  label="Generate"
//                />
//              </div>
//            </div>
//          </Card>
//        );
//        
//      case "cancellation":
//        return (
//          <Card title="Cancellation - Billing">
//            <div className="grid grid-cols-12 gap-5">
//              <div className="col-span-12 md:col-span-3">
//                <ClientSelector
//                  value={cancellationBilling.clientId}
//                  onChange={handleCancellationClientChange}
//                  clients={clients}
//                  loading={loadingClients}
//                />
//              </div>
//              <div className="col-span-12 md:col-span-3">
//                <BranchSelector
//                  value={branch}
//                  onChange={setBranch}
//                  branches={branches}
//                  loading={loadingBranches}
//                />
//              </div>
//              <div className="col-span-12 md:col-span-6"></div>
//              
//              <div className="col-span-12 md:col-span-2">
//                <label className="block text-xs font-bold text-slate-600 mb-1">Cancellation</label>
//                <input
//                  type="text"
//                  value={cancellationBilling.cancellation}
//                  onChange={(e) => setCancellationBilling({ ...cancellationBilling, cancellation: e.target.value })}
//                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
//                  placeholder="Cancellation Type"
//                />
//              </div>
//              <div className="col-span-12 md:col-span-2">
//                <MonthSelector
//                  value={cancellationBilling.month}
//                  onChange={(val) => setCancellationBilling({ ...cancellationBilling, month: val })}
//                />
//              </div>
//              <div className="col-span-12 md:col-span-2">
//                <input
//                  type="date"
//                  value={cancellationBilling.startDate}
//                  onChange={(e) => setCancellationBilling({ ...cancellationBilling, startDate: e.target.value })}
//                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
//                />
//                <p className="text-xs text-slate-400 mt-1">Start Date</p>
//              </div>
//              <div className="col-span-12 md:col-span-2">
//                <input
//                  type="date"
//                  value={cancellationBilling.endDate}
//                  onChange={(e) => setCancellationBilling({ ...cancellationBilling, endDate: e.target.value })}
//                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
//                />
//                <p className="text-xs text-slate-400 mt-1">End Date</p>
//              </div>
//              <div className="col-span-12 md:col-span-2">
//                <GenerateButton
//                  onClick={handleGenerateCancellation}
//                  loading={loading}
//                  label="Generate"
//                />
//              </div>
//            </div>
//          </Card>
//        );
//        
//      case "other":
//        return (
//          <Card title="Other - Billing">
//            <div className="grid grid-cols-12 gap-5">
//              <div className="col-span-12 md:col-span-3">
//                <ClientSelector
//                  value={otherBilling.clientId}
//                  onChange={handleOtherClientChange}
//                  clients={clients}
//                  loading={loadingClients}
//                />
//              </div>
//              <div className="col-span-12 md:col-span-3">
//                <BranchSelector
//                  value={branch}
//                  onChange={setBranch}
//                  branches={branches}
//                  loading={loadingBranches}
//                />
//              </div>
//              <div className="col-span-12 md:col-span-6"></div>
//              
//              <div className="col-span-12 md:col-span-2">
//                <label className="block text-xs font-bold text-slate-600 mb-1">Type</label>
//                <select
//                  value={otherBilling.type}
//                  onChange={(e) => setOtherBilling({ ...otherBilling, type: e.target.value })}
//                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
//                >
//                  <option value="Cancellation">Cancellation</option>
//                  <option value="Detention">Detention</option>
//                  <option value="Demurrage">Demurrage</option>
//                  <option value="Other Charges">Other Charges</option>
//                </select>
//              </div>
//              <div className="col-span-12 md:col-span-2">
//                <MonthSelector
//                  value={otherBilling.month}
//                  onChange={(val) => setOtherBilling({ ...otherBilling, month: val })}
//                />
//              </div>
//              <div className="col-span-12 md:col-span-2">
//                <input
//                  type="date"
//                  value={otherBilling.startDate}
//                  onChange={(e) => setOtherBilling({ ...otherBilling, startDate: e.target.value })}
//                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
//                />
//                <p className="text-xs text-slate-400 mt-1">Start Date</p>
//              </div>
//              <div className="col-span-12 md:col-span-2">
//                <input
//                  type="date"
//                  value={otherBilling.endDate}
//                  onChange={(e) => setOtherBilling({ ...otherBilling, endDate: e.target.value })}
//                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
//                />
//                <p className="text-xs text-slate-400 mt-1">End Date</p>
//              </div>
//              <div className="col-span-12 md:col-span-2">
//                <GenerateButton
//                  onClick={handleGenerateOther}
//                  loading={loading}
//                  label="Generate"
//                />
//              </div>
//            </div>
//          </Card>
//        );
//        
//      default:
//        return (
//          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
//            <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//            </svg>
//            <p className="text-slate-500 text-lg">Please select a billing type from the dropdown above</p>
//            <p className="text-slate-400 text-sm mt-2">Choose Yara Product-Wise, General, Detention, Cancellation, or Other Billing</p>
//          </div>
//        );
//    }
//  };
//  
//  return (
//    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
//      {/* Header */}
//      <div className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
//        <div className="mx-auto max-w-full px-6 py-4">
//          <div className="flex items-center gap-3">
//            <button
//              onClick={() => router.push('/admin/dashboard')}
//              className="text-emerald-600 hover:text-emerald-800 font-medium text-sm flex items-center gap-1"
//            >
//              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//              </svg>
//              Back to Dashboard
//            </button>
//            <div className="text-xl font-extrabold text-slate-900">Billing Reports</div>
//          </div>
//        </div>
//      </div>
//      
//      <div className="mx-auto max-w-7xl p-6">
//        
//        {/* Billing Type Dropdown */}
//        <BillingTypeSelector 
//          value={selectedBillingType} 
//          onChange={setSelectedBillingType} 
//        />
//        
//        {/* Selected Billing Card */}
//        {renderSelectedBillingCard()}
//        
//      </div>
//    </div>
//  );
//}
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

// Billing Type Dropdown Component (UPDATED with General Bill option)
function BillingTypeSelector({ value, onChange, label = "Select Billing Type" }) {
  const billingTypes = [
    { value: "product-wise", label: "Yara - Product-Wise Billing" },
    { value: "general", label: "General - Billing" },
    { value: "detention", label: "Detention - Billing" },
    { value: "cancellation", label: "Cancellation - Billing" },
    { value: "other", label: "Other - Billing" },
    { value: "general-bill", label: "General Bill (Consignment Note)" }  // NEW OPTION
  ];
  
  return (
    <div className="mb-6">
      <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full md:w-96 rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 font-medium"
      >
        <option value="">-- Select Billing Type --</option>
        {billingTypes.map(type => (
          <option key={type.value} value={type.value}>{type.label}</option>
        ))}
      </select>
    </div>
  );
}


// Complete Fixed GeneralBillComponent
function GeneralBillComponent({ branches, clients, loadingBranches, loadingClients }) {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [billData, setBillData] = useState([]);
  const [orderType, setOrderType] = useState(""); // Empty string = NA (All Types)
  const [totalSummary, setTotalSummary] = useState({
    totalWeight: 0,
    totalAmount: 0,
    totalRecords: 0
  });
  
  const [filters, setFilters] = useState({
    branchId: "",
    branchName: "",
    clientId: "",
    clientName: "",
    status: "",
    startDate: "",
    endDate: ""
  });

  // Set default dates - FROM APRIL 1, 2026 TO TODAY (to catch all notes)
  useEffect(() => {
    const today = new Date();
    // Start from April 1, 2026 to catch all existing notes
    const startDate = new Date(2026, 3, 1); // April 1, 2026
    
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    setFilters(prev => ({
      ...prev,
      startDate: formatDate(startDate),
      endDate: formatDate(today)
    }));
  }, []);

  // Handle Branch Change
  const handleBranchChange = (branchId) => {
    const branchObj = branches.find(b => b._id === branchId);
    setFilters(prev => ({
      ...prev,
      branchId: branchId,
      branchName: branchObj?.name || ''
    }));
  };

  // Handle Client Change
  const handleClientChange = (clientId) => {
    const client = clients.find(c => c._id === clientId);
    setFilters(prev => ({
      ...prev,
      clientId: clientId,
      clientName: client?.customerName || ''
    }));
  };

  // Extract products from consignment note
  const extractProductsFromNote = (note) => {
    const products = [];
    let rate = 3050;
    
    if (note.rate) rate = note.rate;
    
    if (note.packData) {
      if (note.packData.PALLETIZATION && note.packData.PALLETIZATION.length > 0) {
        note.packData.PALLETIZATION.forEach(row => {
          if (row.productName || (row.actualWt && parseFloat(row.actualWt) > 0)) {
            products.push({
              productName: row.productName || 'Palletized Cargo',
              actualWt: parseFloat(row.actualWt) || 0,
              billedWt: parseFloat(row.chargedWt) || parseFloat(row.actualWt) || 0,
              rate: rate
            });
          }
        });
      }
      
      if (note.packData['UNIFORM - BAGS/BOXES'] && note.packData['UNIFORM - BAGS/BOXES'].length > 0) {
        note.packData['UNIFORM - BAGS/BOXES'].forEach(row => {
          if (row.productName || (row.actualWt && parseFloat(row.actualWt) > 0)) {
            products.push({
              productName: row.productName || 'Uniform Cargo',
              actualWt: parseFloat(row.actualWt) || 0,
              billedWt: parseFloat(row.chargedWt) || parseFloat(row.actualWt) || 0,
              rate: rate
            });
          }
        });
      }
      
      if (note.packData['LOOSE - CARGO'] && note.packData['LOOSE - CARGO'].length > 0) {
        note.packData['LOOSE - CARGO'].forEach(row => {
          if (row.productName || (row.actualWt && parseFloat(row.actualWt) > 0)) {
            products.push({
              productName: row.productName || 'Loose Cargo',
              actualWt: parseFloat(row.actualWt) || 0,
              billedWt: parseFloat(row.chargedWt) || parseFloat(row.actualWt) || 0,
              rate: rate
            });
          }
        });
      }
      
      if (note.packData['NON-UNIFORM - GENERAL CARGO'] && note.packData['NON-UNIFORM - GENERAL CARGO'].length > 0) {
        note.packData['NON-UNIFORM - GENERAL CARGO'].forEach(row => {
          if (row.productName || (row.actualWt && parseFloat(row.actualWt) > 0)) {
            products.push({
              productName: row.productName || 'General Cargo',
              actualWt: parseFloat(row.actualWt) || 0,
              billedWt: parseFloat(row.chargedWt) || parseFloat(row.actualWt) || 0,
              rate: rate
            });
          }
        });
      }
    }
    
    if (products.length === 0 && note.totalWeight) {
      products.push({
        productName: 'General Cargo',
        actualWt: note.totalWeight || 0,
        billedWt: note.totalWeight || 0,
        rate: rate
      });
    }
    
    return products;
  };

  // Safe date formatter
  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      }).replace(/\//g, '.');
    } catch (error) {
      console.error("Date formatting error:", error);
      return dateStr;
    }
  };

  // Generate Bill
  const generateBill = async () => {
    if (!filters.startDate || !filters.endDate) {
      alert("Please select date range");
      return;
    }
    
    setGenerating(true);
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const payload = {
        type: 'general',
        branchId: filters.branchId,
        branchName: filters.branchName,
        clientId: filters.clientId,
        clientName: filters.clientName,
        status: filters.status,
        startDate: filters.startDate,
        endDate: filters.endDate,
        orderType: orderType
      };
      
      console.log("Calling API:", '/api/billing/general');
      console.log("Payload:", payload);
      
      const res = await fetch('/api/billing/general', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      console.log("API Response:", data);
      
      if (data.success) {
        setBillData(data.data || []);
        setTotalSummary({
          totalWeight: data.summary?.totalWeight || 0,
          totalAmount: data.summary?.totalAmount || 0,
          totalRecords: data.summary?.totalRecords || 0
        });
        
        if (data.data?.length === 0) {
          alert(`No consignment notes found for period ${filters.startDate} to ${filters.endDate}\nTry expanding your date range.`);
        } else {
          alert(`✅ Found ${data.data.length} records!\nTotal Weight: ${(data.summary?.totalWeight || 0).toFixed(2)} MT\nTotal Amount: ₹ ${(data.summary?.totalAmount || 0).toFixed(2)}`);
        }
      } else {
        setBillData([]);
        alert(data.message || "No data found");
      }
    } catch (error) {
      console.error('Error generating bill:', error);
      alert(`Failed to generate bill: ${error.message}`);
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  };

  // Print Bill
  const printBill = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow popups to print");
      return;
    }
    
    const currentDate = new Date().toLocaleString();
    const displayOrderType = orderType === "" ? "All Types (NA)" : orderType;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>General Bill</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Courier New', Courier, monospace; background: #fff; padding: 20px; font-size: 12px; }
          .container { max-width: 1200px; margin: 0 auto; }
          @media print { body { padding: 0; margin: 0; } }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #000; padding: 6px; text-align: left; }
          th { background: #f0f0f0; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="text-center mb-4">
            <h2>Jaya Global Logistics</h2>
            <h3 style="color: #2d6a4f; margin-top: 10px;">GENERAL BILL</h3>
            <div style="display: flex; justify-content: space-between; margin-top: 15px;">
              <div>
                <p><strong>Period:</strong> ${filters.startDate} to ${filters.endDate}</p>
                <p><strong>Branch:</strong> ${filters.branchName || 'All Branches'}</p>
                <p><strong>Order Type:</strong> ${displayOrderType}</p>
              </div>
              <div>
                <p><strong>Customer:</strong> ${filters.clientName || 'All Customers'}</p>
                <p><strong>Status:</strong> ${filters.status || 'All'}</p>
              </div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr><th>S.No</th><th>Date</th><th>LR No</th><th>Vehicle No</th><th>From</th><th>To</th><th>Party Name</th><th>Product</th><th class="text-right">Act. WT</th><th class="text-right">Billed WT</th><th class="text-right">Rate</th><th class="text-right">Amount</th></tr>
            </thead>
            <tbody>
              ${billData.map((item, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td>${item.date || ''}</td>
                  <td>${item.lrNo || ''}</td>
                  <td>${item.vehicleNo || ''}</td>
                  <td>${item.from || ''}</td>
                  <td>${item.to || ''}</td>
                  <td>${item.partyName || ''}</td>
                  <td>${item.productName || '-'}</td>
                  <td class="text-right">${(item.actualWt || 0).toFixed(2)}</td>
                  <td class="text-right">${(item.billedWt || 0).toFixed(2)}</td>
                  <td class="text-right">${(item.rate || 0).toFixed(2)}</td>
                  <td class="text-right">₹ ${(item.amount || 0).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr style="background: #f0f0f0;">
                <td colspan="8" class="text-right"><strong>TOTAL</strong></td>
                <td class="text-right"><strong>${totalSummary.totalWeight.toFixed(2)}</strong></td>
                <td class="text-right"><strong>${totalSummary.totalWeight.toFixed(2)}</strong></td>
                <td class="text-right"></td>
                <td class="text-right"><strong>₹ ${totalSummary.totalAmount.toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </table>
          
          <div style="margin-top: 20px; display: flex; justify-content: space-between;">
            <div><p><strong>For Jaya Global Logistics</strong></p><div style="margin-top: 40px;"><p>Authorised Signatory</p></div></div>
            <div class="text-center"><p style="font-size: 10px;">System generated document</p></div>
            <div class="text-right"><p><strong>Receiver's Signature</strong></p><div style="margin-top: 40px;"><p>(Not required for e-waybill)</p></div></div>
          </div>
          <div style="margin-top: 20px; font-size: 10px; text-align: center;">Generated on: ${currentDate}</div>
        </div>
        <script>window.onload = function() { window.print(); setTimeout(() => window.close(), 100); }</script>
      </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
  };

  // Export to CSV
  const exportToExcel = () => {
    if (billData.length === 0) {
      alert("No data to export");
      return;
    }
    
    const headers = ["S.No", "Date", "LR No", "Vehicle No", "From", "To", "Party Name", "Product", "Actual WT (MT)", "Billed WT (MT)", "Rate (₹)", "Amount (₹)"];
    const rows = billData.map((item, idx) => [
      idx + 1, item.date, item.lrNo, item.vehicleNo, item.from, item.to,
      item.partyName, item.productName, (item.actualWt || 0).toFixed(2),
      (item.billedWt || 0).toFixed(2), (item.rate || 0).toFixed(2),
      (item.amount || 0).toFixed(2)
    ]);
    
    rows.push(["", "", "", "", "", "", "", "TOTAL", totalSummary.totalWeight.toFixed(2), totalSummary.totalWeight.toFixed(2), "", totalSummary.totalAmount.toFixed(2)]);
    
    const csvContent = [headers.join(","), ...rows.map(row => row.map(cell => `"${cell || ''}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", `General_Bill_${filters.startDate}_to_${filters.endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card title="General Bill (Consignment Note)">
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 md:col-span-3">
          <ClientSelector
            value={filters.clientId}
            onChange={handleClientChange}
            clients={clients}
            loading={loadingClients}
          />
        </div>
        <div className="col-span-12 md:col-span-3">
          <BranchSelector
            value={filters.branchId}
            onChange={handleBranchChange}
            branches={branches}
            loading={loadingBranches}
          />
        </div>
        <div className="col-span-12 md:col-span-2">
          <label className="block text-xs font-bold text-slate-600 mb-1">Order Type</label>
          <select
            value={orderType}
            onChange={(e) => setOrderType(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          >
            <option value="">NA (All Types)</option>
            <option value="Sales">Sales</option>
            <option value="STO">STO</option>
            <option value="Purchase">Purchase</option>
            <option value="Return">Return</option>
          </select>
        </div>
        <div className="col-span-12 md:col-span-2">
          <label className="block text-xs font-bold text-slate-600 mb-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Completed">Completed</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
        <div className="col-span-12 md:col-span-2">
          <label className="block text-xs font-bold text-slate-600 mb-1">From Date</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />
        </div>
        <div className="col-span-12 md:col-span-2">
          <label className="block text-xs font-bold text-slate-600 mb-1">To Date</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-12 gap-5 mt-4">
        <div className="col-span-12 md:col-span-12 flex gap-3">
          <GenerateButton onClick={generateBill} loading={generating} label="Show Bill" />
          {billData.length > 0 && (
            <>
              <button
                onClick={printBill}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 transition"
              >
                🖨️ Print
              </button>
              <button
                onClick={exportToExcel}
                className="rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700 transition"
              >
                📊 Export
              </button>
            </>
          )}
        </div>
      </div>

      {/* Bill Table Display */}
      {loading ? (
        <div className="text-center py-8 mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-2 text-slate-500">Loading consignment notes...</p>
        </div>
      ) : billData.length > 0 ? (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border border-slate-200">
            <thead className="bg-emerald-50">
              <tr>
                <th className="px-3 py-2 border text-left text-xs font-bold">S.No</th>
                <th className="px-3 py-2 border text-left text-xs font-bold">Date</th>
                <th className="px-3 py-2 border text-left text-xs font-bold">LR No</th>
                <th className="px-3 py-2 border text-left text-xs font-bold">Vehicle No</th>
                <th className="px-3 py-2 border text-left text-xs font-bold">From</th>
                <th className="px-3 py-2 border text-left text-xs font-bold">To</th>
                <th className="px-3 py-2 border text-left text-xs font-bold">Party Name</th>
                <th className="px-3 py-2 border text-left text-xs font-bold">Product</th>
                <th className="px-3 py-2 border text-right text-xs font-bold">Act. WT (MT)</th>
                <th className="px-3 py-2 border text-right text-xs font-bold">Billed WT (MT)</th>
                <th className="px-3 py-2 border text-right text-xs font-bold">Rate (₹)</th>
                <th className="px-3 py-2 border text-right text-xs font-bold">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {billData.map((item, idx) => (
                <tr key={item._id} className="hover:bg-slate-50">
                  <td className="px-3 py-2 border text-sm">{idx + 1}</td>
                  <td className="px-3 py-2 border text-sm">{item.date}</td>
                  <td className="px-3 py-2 border text-sm font-medium">{item.lrNo}</td>
                  <td className="px-3 py-2 border text-sm">{item.vehicleNo}</td>
                  <td className="px-3 py-2 border text-sm">{item.from}</td>
                  <td className="px-3 py-2 border text-sm">{item.to}</td>
                  <td className="px-3 py-2 border text-sm">{item.partyName}</td>
                  <td className="px-3 py-2 border text-sm">{item.productName}</td>
                  <td className="px-3 py-2 border text-sm text-right">{item.actualWt.toFixed(2)}</td>
                  <td className="px-3 py-2 border text-sm text-right">{item.billedWt.toFixed(2)}</td>
                  <td className="px-3 py-2 border text-sm text-right">{item.rate.toFixed(2)}</td>
                  <td className="px-3 py-2 border text-sm text-right font-medium">₹ {item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-emerald-100 font-bold">
              <tr>
                <td colSpan="8" className="px-3 py-2 border text-right">TOTAL</td>
                <td className="px-3 py-2 border text-right">{totalSummary.totalWeight.toFixed(2)}</td>
                <td className="px-3 py-2 border text-right">{totalSummary.totalWeight.toFixed(2)}</td>
                <td className="px-3 py-2 border text-right"></td>
                <td className="px-3 py-2 border text-right">₹ {totalSummary.totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          
          {/* Summary Cards */}
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <p className="text-xs text-blue-600">Total Records</p>
              <p className="text-xl font-bold text-blue-800">{totalSummary.totalRecords}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <p className="text-xs text-blue-600">Total Weight (MT)</p>
              <p className="text-xl font-bold text-blue-800">{totalSummary.totalWeight.toFixed(2)}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <p className="text-xs text-blue-600">Total Amount (₹)</p>
              <p className="text-xl font-bold text-blue-800">₹ {totalSummary.totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500 mt-4">
          No bill generated yet. Select filters and click "Show Bill".
        </div>
      )}
    </Card>
  );
}
export default function BillingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingPlants, setLoadingPlants] = useState(false);
  
  // Selected billing type
  const [selectedBillingType, setSelectedBillingType] = useState("");
  
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
  
  // Fetch Clients
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
  
  const getClientName = (clientId) => {
    const client = clients.find(c => c._id === clientId);
    return client ? client.customerName : "";
  };
  
  const getPlantCode = (plantId) => {
    const plant = plants.find(p => p._id === plantId);
    return plant ? plant.code : "";
  };
  
  const handleProductWiseClientChange = (clientId) => {
    const clientName = getClientName(clientId);
    setProductWise({ ...productWise, clientId: clientId, clientName: clientName });
  };
  
  const handleGeneralClientChange = (clientId) => {
    const clientName = getClientName(clientId);
    setGeneralBilling({ ...generalBilling, clientId: clientId, clientName: clientName });
  };
  
  const handleDetentionClientChange = (clientId) => {
    const clientName = getClientName(clientId);
    setDetentionBilling({ ...detentionBilling, clientId: clientId, clientName: clientName });
  };
  
  const handleCancellationClientChange = (clientId) => {
    const clientName = getClientName(clientId);
    setCancellationBilling({ ...cancellationBilling, clientId: clientId, clientName: clientName });
  };
  
  const handleOtherClientChange = (clientId) => {
    const clientName = getClientName(clientId);
    setOtherBilling({ ...otherBilling, clientId: clientId, clientName: clientName });
  };
  
  const handlePlantChange = (plantId) => {
    const plantCode = getPlantCode(plantId);
    setProductWise({ ...productWise, plantId: plantId, plantCode: plantCode });
  };
  
  useEffect(() => {
    fetchBranches();
    fetchClients();
    fetchPlants();
    
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const formatDate = (date) => date.toISOString().split('T')[0];
    const defaultStartDate = formatDate(firstDayOfMonth);
    const defaultEndDate = formatDate(lastDayOfMonth);
    const defaultMonth = today.toLocaleString('default', { month: 'long' });
    
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
    if (!branch) { alert("Please select a branch"); return; }
    if (!productWise.clientId) { alert("Please select a client"); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = { type: 'product-wise', branchId: branch, branchName: branches.find(b => b._id === branch)?.name || '', clientId: productWise.clientId, clientName: productWise.clientName, productCategories: productWise.productCategories, plantId: productWise.plantId, plantCode: productWise.plantCode, month: productWise.month, orderType: productWise.orderType, startDate: productWise.startDate, endDate: productWise.endDate };
      const response = await fetch('/api/billing/product-wise', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (data.success) {
        alert(`✅ Product-Wise Billing Report Generated!\nClient: ${productWise.clientName}\nPeriod: ${formatDateForDisplay(productWise.startDate)} to ${formatDateForDisplay(productWise.endDate)}`);
        if (data.reportUrl) window.open(data.reportUrl, '_blank');
      } else { alert(data.message || 'Failed to generate report'); }
    } catch (error) { console.error('Error:', error); alert('Failed to generate report'); } finally { setLoading(false); }
  };
  
  const handleGenerateGeneral = async () => {
    if (!branch) { alert("Please select a branch"); return; }
    if (!generalBilling.clientId) { alert("Please select a client"); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = { type: 'general', branchId: branch, branchName: branches.find(b => b._id === branch)?.name || '', clientId: generalBilling.clientId, clientName: generalBilling.clientName, month: generalBilling.month, orderType: generalBilling.orderType, startDate: generalBilling.startDate, endDate: generalBilling.endDate };
      const response = await fetch('/api/billing/general', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (data.success) {
        alert(`✅ General Billing Report Generated!\nClient: ${generalBilling.clientName}\nOrder Type: ${generalBilling.orderType}\nPeriod: ${formatDateForDisplay(generalBilling.startDate)} to ${formatDateForDisplay(generalBilling.endDate)}`);
        if (data.reportUrl) window.open(data.reportUrl, '_blank');
      } else { alert(data.message || 'Failed to generate report'); }
    } catch (error) { console.error('Error:', error); alert('Failed to generate report'); } finally { setLoading(false); }
  };
  
  const handleGenerateDetention = async () => {
    if (!branch) { alert("Please select a branch"); return; }
    if (!detentionBilling.clientId) { alert("Please select a client"); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = { type: 'detention', branchId: branch, branchName: branches.find(b => b._id === branch)?.name || '', clientId: detentionBilling.clientId, clientName: detentionBilling.clientName, detention: detentionBilling.detention, month: detentionBilling.month, startDate: detentionBilling.startDate, endDate: detentionBilling.endDate };
      const response = await fetch('/api/billing/detention', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (data.success) {
        alert(`✅ Detention Billing Report Generated!\nClient: ${detentionBilling.clientName}\nPeriod: ${formatDateForDisplay(detentionBilling.startDate)} to ${formatDateForDisplay(detentionBilling.endDate)}`);
        if (data.reportUrl) window.open(data.reportUrl, '_blank');
      } else { alert(data.message || 'Failed to generate report'); }
    } catch (error) { console.error('Error:', error); alert('Failed to generate report'); } finally { setLoading(false); }
  };
  
  const handleGenerateCancellation = async () => {
    if (!branch) { alert("Please select a branch"); return; }
    if (!cancellationBilling.clientId) { alert("Please select a client"); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = { type: 'cancellation', branchId: branch, branchName: branches.find(b => b._id === branch)?.name || '', clientId: cancellationBilling.clientId, clientName: cancellationBilling.clientName, cancellation: cancellationBilling.cancellation, month: cancellationBilling.month, startDate: cancellationBilling.startDate, endDate: cancellationBilling.endDate };
      const response = await fetch('/api/billing/cancellation', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (data.success) {
        alert(`✅ Cancellation Billing Report Generated!\nClient: ${cancellationBilling.clientName}\nPeriod: ${formatDateForDisplay(cancellationBilling.startDate)} to ${formatDateForDisplay(cancellationBilling.endDate)}`);
        if (data.reportUrl) window.open(data.reportUrl, '_blank');
      } else { alert(data.message || 'Failed to generate report'); }
    } catch (error) { console.error('Error:', error); alert('Failed to generate report'); } finally { setLoading(false); }
  };
  
  const handleGenerateOther = async () => {
    if (!branch) { alert("Please select a branch"); return; }
    if (!otherBilling.clientId) { alert("Please select a client"); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = { type: 'other', branchId: branch, branchName: branches.find(b => b._id === branch)?.name || '', clientId: otherBilling.clientId, clientName: otherBilling.clientName, billingType: otherBilling.type, month: otherBilling.month, startDate: otherBilling.startDate, endDate: otherBilling.endDate };
      const response = await fetch('/api/billing/other', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (data.success) {
        alert(`✅ Other Billing Report Generated!\nClient: ${otherBilling.clientName}\nType: ${otherBilling.type}\nPeriod: ${formatDateForDisplay(otherBilling.startDate)} to ${formatDateForDisplay(otherBilling.endDate)}`);
        if (data.reportUrl) window.open(data.reportUrl, '_blank');
      } else { alert(data.message || 'Failed to generate report'); }
    } catch (error) { console.error('Error:', error); alert('Failed to generate report'); } finally { setLoading(false); }
  };
  
  const renderSelectedBillingCard = () => {
    switch(selectedBillingType) {
      case "product-wise":
        return (
          <Card title="Yara - Product-Wise Billing">
            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 md:col-span-3"><ClientSelector value={productWise.clientId} onChange={handleProductWiseClientChange} clients={clients} loading={loadingClients} /></div>
              <div className="col-span-12 md:col-span-3"><BranchSelector value={branch} onChange={setBranch} branches={branches} loading={loadingBranches} /></div>
              <div className="col-span-12 md:col-span-6"></div>
              <div className="col-span-12 md:col-span-2"><ProductCategorySelector value={productWise.productCategories} onChange={(val) => setProductWise({ ...productWise, productCategories: val })} /></div>
              <div className="col-span-12 md:col-span-2"><PlantCodeSelector value={productWise.plantId} onChange={handlePlantChange} plants={plants} loading={loadingPlants} /></div>
              <div className="col-span-12 md:col-span-2"><MonthSelector value={productWise.month} onChange={(val) => setProductWise({ ...productWise, month: val })} /></div>
              <div className="col-span-12 md:col-span-2"><OrderTypeSelector value={productWise.orderType} onChange={(val) => setProductWise({ ...productWise, orderType: val })} /></div>
              <div className="col-span-12 md:col-span-2"><input type="date" value={productWise.startDate} onChange={(e) => setProductWise({ ...productWise, startDate: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200" /><p className="text-xs text-slate-400 mt-1">Start Date</p></div>
              <div className="col-span-12 md:col-span-2"><input type="date" value={productWise.endDate} onChange={(e) => setProductWise({ ...productWise, endDate: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200" /><p className="text-xs text-slate-400 mt-1">End Date</p></div>
              <div className="col-span-12 md:col-span-2"><GenerateButton onClick={handleGenerateProductWise} loading={loading} label="Generate" /></div>
            </div>
          </Card>
        );
      case "general":
        return (
          <Card title="General - Billing">
            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 md:col-span-3"><ClientSelector value={generalBilling.clientId} onChange={handleGeneralClientChange} clients={clients} loading={loadingClients} /></div>
              <div className="col-span-12 md:col-span-3"><BranchSelector value={branch} onChange={setBranch} branches={branches} loading={loadingBranches} /></div>
              <div className="col-span-12 md:col-span-6"></div>
              <div className="col-span-12 md:col-span-2"><MonthSelector value={generalBilling.month} onChange={(val) => setGeneralBilling({ ...generalBilling, month: val })} /></div>
              <div className="col-span-12 md:col-span-2"><OrderTypeSelector value={generalBilling.orderType} onChange={(val) => setGeneralBilling({ ...generalBilling, orderType: val })} /></div>
              <div className="col-span-12 md:col-span-2"><input type="date" value={generalBilling.startDate} onChange={(e) => setGeneralBilling({ ...generalBilling, startDate: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200" /><p className="text-xs text-slate-400 mt-1">Start Date</p></div>
              <div className="col-span-12 md:col-span-2"><input type="date" value={generalBilling.endDate} onChange={(e) => setGeneralBilling({ ...generalBilling, endDate: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200" /><p className="text-xs text-slate-400 mt-1">End Date</p></div>
              <div className="col-span-12 md:col-span-2"><GenerateButton onClick={handleGenerateGeneral} loading={loading} label="Generate" /></div>
            </div>
          </Card>
        );
      case "detention":
        return (
          <Card title="Detention - Billing">
            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 md:col-span-3"><ClientSelector value={detentionBilling.clientId} onChange={handleDetentionClientChange} clients={clients} loading={loadingClients} /></div>
              <div className="col-span-12 md:col-span-3"><BranchSelector value={branch} onChange={setBranch} branches={branches} loading={loadingBranches} /></div>
              <div className="col-span-12 md:col-span-6"></div>
              <div className="col-span-12 md:col-span-2"><label className="block text-xs font-bold text-slate-600 mb-1">Detention</label><input type="text" value={detentionBilling.detention} onChange={(e) => setDetentionBilling({ ...detentionBilling, detention: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200" placeholder="Detention Type" /></div>
              <div className="col-span-12 md:col-span-2"><MonthSelector value={detentionBilling.month} onChange={(val) => setDetentionBilling({ ...detentionBilling, month: val })} /></div>
              <div className="col-span-12 md:col-span-2"><input type="date" value={detentionBilling.startDate} onChange={(e) => setDetentionBilling({ ...detentionBilling, startDate: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200" /><p className="text-xs text-slate-400 mt-1">Start Date</p></div>
              <div className="col-span-12 md:col-span-2"><input type="date" value={detentionBilling.endDate} onChange={(e) => setDetentionBilling({ ...detentionBilling, endDate: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200" /><p className="text-xs text-slate-400 mt-1">End Date</p></div>
              <div className="col-span-12 md:col-span-2"><GenerateButton onClick={handleGenerateDetention} loading={loading} label="Generate" /></div>
            </div>
          </Card>
        );
      case "cancellation":
        return (
          <Card title="Cancellation - Billing">
            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 md:col-span-3"><ClientSelector value={cancellationBilling.clientId} onChange={handleCancellationClientChange} clients={clients} loading={loadingClients} /></div>
              <div className="col-span-12 md:col-span-3"><BranchSelector value={branch} onChange={setBranch} branches={branches} loading={loadingBranches} /></div>
              <div className="col-span-12 md:col-span-6"></div>
              <div className="col-span-12 md:col-span-2"><label className="block text-xs font-bold text-slate-600 mb-1">Cancellation</label><input type="text" value={cancellationBilling.cancellation} onChange={(e) => setCancellationBilling({ ...cancellationBilling, cancellation: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200" placeholder="Cancellation Type" /></div>
              <div className="col-span-12 md:col-span-2"><MonthSelector value={cancellationBilling.month} onChange={(val) => setCancellationBilling({ ...cancellationBilling, month: val })} /></div>
              <div className="col-span-12 md:col-span-2"><input type="date" value={cancellationBilling.startDate} onChange={(e) => setCancellationBilling({ ...cancellationBilling, startDate: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200" /><p className="text-xs text-slate-400 mt-1">Start Date</p></div>
              <div className="col-span-12 md:col-span-2"><input type="date" value={cancellationBilling.endDate} onChange={(e) => setCancellationBilling({ ...cancellationBilling, endDate: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200" /><p className="text-xs text-slate-400 mt-1">End Date</p></div>
              <div className="col-span-12 md:col-span-2"><GenerateButton onClick={handleGenerateCancellation} loading={loading} label="Generate" /></div>
            </div>
          </Card>
        );
      case "other":
        return (
          <Card title="Other - Billing">
            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 md:col-span-3"><ClientSelector value={otherBilling.clientId} onChange={handleOtherClientChange} clients={clients} loading={loadingClients} /></div>
              <div className="col-span-12 md:col-span-3"><BranchSelector value={branch} onChange={setBranch} branches={branches} loading={loadingBranches} /></div>
              <div className="col-span-12 md:col-span-6"></div>
              <div className="col-span-12 md:col-span-2"><label className="block text-xs font-bold text-slate-600 mb-1">Type</label><select value={otherBilling.type} onChange={(e) => setOtherBilling({ ...otherBilling, type: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"><option value="Cancellation">Cancellation</option><option value="Detention">Detention</option><option value="Demurrage">Demurrage</option><option value="Other Charges">Other Charges</option></select></div>
              <div className="col-span-12 md:col-span-2"><MonthSelector value={otherBilling.month} onChange={(val) => setOtherBilling({ ...otherBilling, month: val })} /></div>
              <div className="col-span-12 md:col-span-2"><input type="date" value={otherBilling.startDate} onChange={(e) => setOtherBilling({ ...otherBilling, startDate: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200" /><p className="text-xs text-slate-400 mt-1">Start Date</p></div>
              <div className="col-span-12 md:col-span-2"><input type="date" value={otherBilling.endDate} onChange={(e) => setOtherBilling({ ...otherBilling, endDate: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200" /><p className="text-xs text-slate-400 mt-1">End Date</p></div>
              <div className="col-span-12 md:col-span-2"><GenerateButton onClick={handleGenerateOther} loading={loading} label="Generate" /></div>
            </div>
          </Card>
        );
      case "general-bill":
        return (
          <GeneralBillComponent 
            branches={branches} 
            clients={clients} 
            plants={plants} 
            loadingBranches={loadingBranches}
            loadingClients={loadingClients}
            loadingPlants={loadingPlants}
          />
        );
      default:
        return (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-slate-500 text-lg">Please select a billing type from the dropdown above</p>
            <p className="text-slate-400 text-sm mt-2">Choose Yara Product-Wise, General, Detention, Cancellation, Other Billing, or General Bill</p>
          </div>
        );
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-full px-6 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/admin/dashboard')} className="text-emerald-600 hover:text-emerald-800 font-medium text-sm flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to Dashboard
            </button>
            <div className="text-xl font-extrabold text-slate-900">Billing Reports</div>
          </div>
        </div>
      </div>
      
      <div className="mx-auto max-w-7xl p-6">
        <BillingTypeSelector value={selectedBillingType} onChange={setSelectedBillingType} />
        {renderSelectedBillingCard()}
      </div>
    </div>
  );
}