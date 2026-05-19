

// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";

// function Card({ title, children, className = "" }) {
//   return (
//     <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm mb-6 ${className}`}>
//       <div className="border-b border-slate-100 px-5 py-3">
//         <div className="text-base font-bold text-slate-900">{title}</div>
//       </div>
//       <div className="p-5">{children}</div>
//     </div>
//   );
// }

// // Branch Selector
// function BranchSelector({ value, onChange, label = "Branch", branches = [], loading = false }) {
//   return (
//     <div>
//       <label className="block text-xs font-bold text-slate-600 mb-1">{label}</label>
//       <select
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
//         disabled={loading}
//       >
//         <option value="">Select Branch</option>
//         {branches.map(branch => (
//           <option key={branch._id} value={branch._id}>
//             {branch.name} {branch.code ? `(${branch.code})` : ''}
//           </option>
//         ))}
//       </select>
//     </div>
//   );
// }

// // Client Selector
// function ClientSelector({ value, onChange, label = "Client Name", clients = [], loading = false }) {
//   return (
//     <div>
//       <label className="block text-xs font-bold text-slate-600 mb-1">{label}</label>
//       <select
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
//         disabled={loading}
//       >
//         <option value="">Select Client</option>
//         {clients.map(client => (
//           <option key={client._id} value={client._id}>
//             {client.customerName} {client.customerCode ? `(${client.customerCode})` : ''}
//           </option>
//         ))}
//       </select>
//     </div>
//   );
// }

// function MonthSelector({ value, onChange, label = "Month" }) {
//   const months = [
//     "January", "February", "March", "April", "May", "June",
//     "July", "August", "September", "October", "November", "December"
//   ];
  
//   return (
//     <div>
//       <label className="block text-xs font-bold text-slate-600 mb-1">{label}</label>
//       <select
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
//       >
//         <option value="">Select Month</option>
//         {months.map(month => (
//           <option key={month} value={month}>{month}</option>
//         ))}
//       </select>
//     </div>
//   );
// }

// function OrderTypeSelector({ value, onChange, label = "Order Type" }) {
//   const types = ["Sales", "STO Order", "Export", "Import", "Purchase", "Return"];
  
//   return (
//     <div>
//       <label className="block text-xs font-bold text-slate-600 mb-1">{label}</label>
//       <select
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
//       >
//         <option value="">All Order Types</option>
//         {types.map(type => (
//           <option key={type} value={type}>{type}</option>
//         ))}
//       </select>
//     </div>
//   );
// }

// function ProductCategorySelector({ value, onChange, label = "Product Categories" }) {
//   const categories = [
//     "Biological",
//     "Premium Product",
//     "Standard",
//     "Economy",
//     "Specialty"
//   ];
  
//   return (
//     <div>
//       <label className="block text-xs font-bold text-slate-600 mb-1">{label}</label>
//       <select
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
//       >
//         <option value="">Select Category</option>
//         {categories.map(category => (
//           <option key={category} value={category}>{category}</option>
//         ))}
//       </select>
//     </div>
//   );
// }

// function PlantCodeSelector({ value, onChange, label = "Plant Code", plants = [], loading = false }) {
//   return (
//     <div>
//       <label className="block text-xs font-bold text-slate-600 mb-1">{label}</label>
//       <select
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
//         disabled={loading}
//       >
//         <option value="">Select Plant Code</option>
//         {plants.map(plant => (
//           <option key={plant._id} value={plant._id}>
//             {plant.code} - {plant.name}
//           </option>
//         ))}
//       </select>
//     </div>
//   );
// }

// // Billing Type Dropdown Component
// function BillingTypeSelector({ value, onChange, label = "Select Billing Type" }) {
//   const billingTypes = [
//     { value: "product-wise", label: "Yara - Product-Wise Billing" },
//     { value: "general", label: "General - Billing" },
//     { value: "detention", label: "Detention - Billing" },
//     { value: "cancellation", label: "Cancellation - Billing" },
//     { value: "other", label: "Other - Billing" }
//   ];
  
//   return (
//     <div className="mb-6">
//       <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
//       <select
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         className="w-full md:w-96 rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 font-medium"
//       >
//         <option value="">-- Select Billing Type --</option>
//         {billingTypes.map(type => (
//           <option key={type.value} value={type.value}>{type.label}</option>
//         ))}
//       </select>
//     </div>
//   );
// }

// // Safe date formatter
// function safeFormatDate(dateStr) {
//   if (!dateStr) return "";
//   try {
//     const date = new Date(dateStr);
//     if (isNaN(date.getTime())) return dateStr;
//     const day = String(date.getDate()).padStart(2, '0');
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const year = date.getFullYear();
//     return `${day}.${month}.${year}`;
//   } catch (error) {
//     return dateStr;
//   }
// }

// // Save report to backend and generate PDF
// async function generateAndSaveReport(reportData, type) {
//   try {
//     const token = localStorage.getItem('token');
    
//     // First save to backend
//     const saveResponse = await fetch('/api/saved-reports', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${token}`
//       },
//       body: JSON.stringify(reportData)
//     });
//     const saveData = await saveResponse.json();
    
//     if (!saveData.success) {
//       alert("Failed to save report");
//       return false;
//     }
    
//     // Generate PDF
//     const currentDate = new Date().toLocaleString();
//     const html = generatePDFHTML(reportData, currentDate, type);
    
//     const printWindow = window.open('', '_blank');
//     printWindow.document.write(html);
//     printWindow.document.close();
//     printWindow.print();
    
//     alert(`✅ Report saved successfully and PDF generated!\nSaved ${reportData.selectedRecords} records`);
//     return true;
//   } catch (error) {
//     console.error('Error:', error);
//     alert("Failed to generate report");
//     return false;
//   }
// }

// function generatePDFHTML(reportData, currentDate, type) {
//   let title = "";
//   let headers = [];
//   let rows = [];
  
//   switch(type) {
//     case "product-wise":
//       title = "Yara - Product-Wise Billing Report";
//       headers = ["S.No", "Date", "LR No", "Vehicle No", "From", "To", "Invoice No", "Ewaybill No", "Product", "Weight (MT)", "Rate (₹)", "Amount (₹)"];
//       rows = reportData.data.map((item, idx) => [
//         idx + 1,
//         safeFormatDate(item.date),
//         item.lrNo || '-',
//         item.vehicleNo || '-',
//         item.fromLocation || '-',
//         item.toLocation || '-',
//         item.invoiceNo || '-',
//         item.ewaybillNo || '-',
//         item.productName || '-',
//         (item.weight || 0).toFixed(2),
//         (item.rate || 0).toFixed(2),
//         (item.amount || 0).toFixed(2)
//       ]);
//       break;
//     case "general":
//       title = "General Billing Report";
//       headers = ["S.No", "Date", "LR No", "Vehicle No", "From", "To", "Party Name", "Product", "Weight (MT)", "Rate (₹)", "Amount (₹)"];
//       rows = reportData.data.map((item, idx) => [
//         idx + 1,
//         safeFormatDate(item.date),
//         item.lrNo || '-',
//         item.vehicleNo || '-',
//         item.from || '-',
//         item.to || '-',
//         item.partyName || '-',
//         item.productName || '-',
//         (item.weight || 0).toFixed(2),
//         (item.rate || 0).toFixed(2),
//         (item.amount || 0).toFixed(2)
//       ]);
//       break;
//     case "detention":
//       title = "Detention Billing Report";
//       headers = ["S.No", "Date", "LR No", "Vehicle No", "From", "To", "Detention Type", "Amount (₹)"];
//       rows = reportData.data.map((item, idx) => [
//         idx + 1,
//         safeFormatDate(item.date),
//         item.lrNo || '-',
//         item.vehicleNo || '-',
//         item.from || '-',
//         item.to || '-',
//         item.detentionType || '-',
//         (item.amount || 0).toFixed(2)
//       ]);
//       break;
//     case "cancellation":
//       title = "Cancellation Billing Report";
//       headers = ["S.No", "Date", "LR No", "Vehicle No", "From", "To", "Cancellation Type", "Amount (₹)"];
//       rows = reportData.data.map((item, idx) => [
//         idx + 1,
//         safeFormatDate(item.date),
//         item.lrNo || '-',
//         item.vehicleNo || '-',
//         item.from || '-',
//         item.to || '-',
//         item.cancellationType || '-',
//         (item.amount || 0).toFixed(2)
//       ]);
//       break;
//     case "other":
//       title = "Other Billing Report";
//       headers = ["S.No", "Date", "LR No", "Vehicle No", "From", "To", "Bill Type", "Amount (₹)"];
//       rows = reportData.data.map((item, idx) => [
//         idx + 1,
//         safeFormatDate(item.date),
//         item.lrNo || '-',
//         item.vehicleNo || '-',
//         item.from || '-',
//         item.to || '-',
//         item.billingType || '-',
//         (item.amount || 0).toFixed(2)
//       ]);
//       break;
//     default:
//       title = "Billing Report";
//       headers = ["S.No", "Date", "LR No", "Vehicle No", "Amount (₹)"];
//       rows = reportData.data.map((item, idx) => [
//         idx + 1,
//         safeFormatDate(item.date),
//         item.lrNo || '-',
//         item.vehicleNo || '-',
//         (item.amount || 0).toFixed(2)
//       ]);
//   }
  
//   const totalAmount = reportData.summary.totalAmount;
  
//   return `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="UTF-8">
//       <title>${title}</title>
//       <style>
//         body { font-family: Arial, Helvetica, sans-serif; padding: 20px; }
//         .header { text-align: center; margin-bottom: 30px; }
//         .header h1 { color: #2d3748; margin-bottom: 5px; }
//         .header h2 { color: #4a5568; margin-top: 0; font-size: 18px; }
//         .header p { color: #718096; margin: 5px 0; }
//         .filters { margin-bottom: 20px; padding: 10px; background: #f7fafc; border-radius: 8px; font-size: 12px; }
//         .filters p { margin: 5px 0; }
//         table { width: 100%; border-collapse: collapse; margin-top: 20px; }
//         th, td { border: 1px solid #cbd5e0; padding: 10px; text-align: left; font-size: 12px; }
//         th { background-color: #48bb78; color: white; font-weight: bold; }
//         .text-right { text-align: right; }
//         .text-center { text-align: center; }
//         .total-row { background-color: #f0fff4; font-weight: bold; }
//         .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #a0aec0; }
//       </style>
//     </head>
//     <body>
//       <div class="header">
//         <h1>Jaya Global Logistics</h1>
//         <h2>${title}</h2>
//         <p>Generated: ${currentDate}</p>
//       </div>
      
//       <div class="filters">
//         <p><strong>Filters Applied:</strong></p>
//         <p>Client: ${reportData.filters.clientName || 'N/A'} | Branch: ${reportData.filters.branchName || 'N/A'} | Period: ${reportData.filters.startDate || 'N/A'} to ${reportData.filters.endDate || 'N/A'}</p>
//         ${reportData.filters.orderType ? `<p>Order Type: ${reportData.filters.orderType}</p>` : ''}
//         ${reportData.filters.productCategories ? `<p>Product Category: ${reportData.filters.productCategories}</p>` : ''}
//       </div>
      
//       <table>
//         <thead>
//           <tr>
//             ${headers.map(h => `<th>${h}</th>`).join('')}
//           </tr>
//         </thead>
//         <tbody>
//           ${rows.map(row => `
//             <tr>
//               ${row.map(cell => `<td>${cell}</td>`).join('')}
//             </tr>
//           `).join('')}
//         </tbody>
//         <tfoot>
//           <tr class="total-row">
//             <td colspan="${headers.length - 1}" class="text-right"><strong>TOTAL AMOUNT</strong></td>
//             <td class="text-right"><strong>₹ ${totalAmount.toFixed(2)}</strong></td>
//           </tr>
//         </tfoot>
//       </table>
      
//       <div class="footer">
//         <p>This is a system generated report. Total Records: ${reportData.selectedRecords} | Total Amount: ₹ ${totalAmount.toFixed(2)}</p>
//       </div>
//     </body>
//     </html>
//   `;
// }

// // ==================== PRODUCT WISE BILLING COMPONENT ====================
// function ProductWiseBillingComponent({ branches, clients, plants, loadingBranches, loadingClients, loadingPlants }) {
//   const [loading, setLoading] = useState(false);
//   const [billData, setBillData] = useState([]);
//   const [summary, setSummary] = useState({ totalWeight: 0, totalAmount: 0, totalRecords: 0 });
//   const [selectedRows, setSelectedRows] = useState({});
//   const [selectAll, setSelectAll] = useState(false);
//   const [showSavedReports, setShowSavedReports] = useState(false);
//   const [savedReports, setSavedReports] = useState([]);
//   const [generating, setGenerating] = useState(false);
  
//   const [filters, setFilters] = useState({
//     branchId: "",
//     clientId: "",
//     productCategories: "",
//     plantId: "",
//     orderType: "Sales",
//     startDate: "",
//     endDate: ""
//   });

//   useEffect(() => {
//     const today = new Date();
//     const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
//     const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
//     const formatDate = (date) => date.toISOString().split('T')[0];
//     setFilters(prev => ({
//       ...prev,
//       startDate: formatDate(firstDayOfMonth),
//       endDate: formatDate(lastDayOfMonth)
//     }));
//     loadSavedReports();
//   }, []);

//   useEffect(() => {
//     if (filters.clientId && filters.startDate && filters.endDate) {
//       fetchData();
//     }
//   }, [filters.clientId, filters.branchId, filters.productCategories, filters.plantId, filters.orderType, filters.startDate, filters.endDate]);

//   const loadSavedReports = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch('/api/saved-reports?type=product-wise', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       const data = await response.json();
//       if (data.success) setSavedReports(data.data);
//     } catch (error) {
//       console.error('Error loading reports:', error);
//     }
//   };

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem('token');
//       const payload = {
//         type: 'product-wise',
//         branchId: filters.branchId,
//         branchName: branches.find(b => b._id === filters.branchId)?.name || '',
//         clientId: filters.clientId,
//         clientName: clients.find(c => c._id === filters.clientId)?.customerName || '',
//         productCategories: filters.productCategories,
//         plantId: filters.plantId,
//         plantCode: plants.find(p => p._id === filters.plantId)?.code || '',
//         orderType: filters.orderType,
//         startDate: filters.startDate,
//         endDate: filters.endDate
//       };
      
//       const response = await fetch('/api/billing/product-wise', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
//         body: JSON.stringify(payload)
//       });
//       const data = await response.json();
//       if (data.success) {
//         setBillData(data.data || []);
//         setSummary({
//           totalWeight: data.summary?.totalWeight || 0,
//           totalAmount: data.summary?.totalAmount || 0,
//           totalRecords: data.summary?.totalRecords || 0
//         });
//         setSelectedRows({});
//         setSelectAll(false);
//       }
//     } catch (error) {
//       console.error('Error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSelectRow = (index) => {
//     setSelectedRows(prev => ({ ...prev, [index]: !prev[index] }));
//   };

//   const handleSelectAll = () => {
//     if (selectAll) {
//       setSelectedRows({});
//     } else {
//       const newSelected = {};
//       billData.forEach((_, idx) => { newSelected[idx] = true; });
//       setSelectedRows(newSelected);
//     }
//     setSelectAll(!selectAll);
//   };

//   const getSelectedData = () => billData.filter((_, idx) => selectedRows[idx]);
  
//   const getSelectedSummary = () => {
//     const selected = getSelectedData();
//     const totalWeight = selected.reduce((sum, item) => sum + (item.weight || 0), 0);
//     const totalAmount = selected.reduce((sum, item) => sum + (item.amount || 0), 0);
//     return { totalWeight, totalAmount, totalRecords: selected.length };
//   };

//   const handleGenerateReport = async () => {
//     const selected = getSelectedData();
//     if (selected.length === 0) {
//       alert("Please select at least one record to generate report");
//       return;
//     }
//     setGenerating(true);
//     const selectedSummary = getSelectedSummary();
//     const reportData = {
//       reportId: `RPT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
//       type: 'product-wise',
//       filters: {
//         clientName: clients.find(c => c._id === filters.clientId)?.customerName || 'N/A',
//         branchName: branches.find(b => b._id === filters.branchId)?.name || 'N/A',
//         startDate: filters.startDate,
//         endDate: filters.endDate,
//         orderType: filters.orderType,
//         productCategories: filters.productCategories
//       },
//       data: selected,
//       summary: selectedSummary,
//       totalRecords: billData.length,
//       selectedRecords: selected.length
//     };
//     await generateAndSaveReport(reportData, 'product-wise');
//     await loadSavedReports();
//     setGenerating(false);
//   };

//   const selectedCount = Object.keys(selectedRows).filter(key => selectedRows[key]).length;

//   return (
//     <Card title="Yara - Product-Wise Billing">
//       <div className="grid grid-cols-12 gap-5">
//         <div className="col-span-12 md:col-span-3">
//           <ClientSelector value={filters.clientId} onChange={(val) => setFilters(prev => ({ ...prev, clientId: val }))} clients={clients} loading={loadingClients} />
//         </div>
//         <div className="col-span-12 md:col-span-3">
//           <BranchSelector value={filters.branchId} onChange={(val) => setFilters(prev => ({ ...prev, branchId: val }))} branches={branches} loading={loadingBranches} />
//         </div>
//         <div className="col-span-12 md:col-span-2">
//           <ProductCategorySelector value={filters.productCategories} onChange={(val) => setFilters(prev => ({ ...prev, productCategories: val }))} />
//         </div>
//         <div className="col-span-12 md:col-span-2">
//           <PlantCodeSelector value={filters.plantId} onChange={(val) => setFilters(prev => ({ ...prev, plantId: val }))} plants={plants} loading={loadingPlants} />
//         </div>
//         <div className="col-span-12 md:col-span-2">
//           <MonthSelector value={""} onChange={() => {}} />
//         </div>
//         <div className="col-span-12 md:col-span-2">
//           <OrderTypeSelector value={filters.orderType} onChange={(val) => setFilters(prev => ({ ...prev, orderType: val }))} />
//         </div>
//         <div className="col-span-12 md:col-span-2">
//           <input type="date" value={filters.startDate} onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))} className="rounded-xl border p-2 w-full"/>
//           <p className="text-xs mt-1">Start Date</p>
//         </div>
//         <div className="col-span-12 md:col-span-2">
//           <input type="date" value={filters.endDate} onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))} className="rounded-xl border p-2 w-full"/>
//           <p className="text-xs mt-1">End Date</p>
//         </div>
//       </div>

//       {billData.length > 0 && (
//         <div className="mt-4">
//           <button 
//             onClick={handleGenerateReport} 
//             disabled={generating || selectedCount === 0} 
//             className={`bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition ${(generating || selectedCount === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
//           >
//             {generating ? "Generating..." : `📄 Generate Report (${selectedCount} Selected)`}
//           </button>
//           <button 
//             onClick={() => setShowSavedReports(!showSavedReports)} 
//             className="ml-3 bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-amber-700 transition"
//           >
//             📁 Saved Reports ({savedReports.length})
//           </button>
//         </div>
//       )}

//       {showSavedReports && savedReports.length > 0 && (
//         <div className="mt-4 border border-amber-200 rounded-xl max-h-60 overflow-y-auto">
//           <div className="bg-amber-50 px-4 py-2 font-bold">Saved Reports</div>
//           {savedReports.map((report) => (
//             <div key={report.reportId} className="border-t p-3 flex justify-between items-center">
//               <div><p className="font-medium">{safeFormatDate(report.generatedAt)}</p><p className="text-xs">Records: {report.selectedRecords} | Amount: ₹ {report.summary.totalAmount.toFixed(2)}</p></div>
//               <button onClick={async () => { setBillData(report.data); setSummary(report.summary); setShowSavedReports(false); alert("Report loaded"); }} className="text-blue-600">Load</button>
//             </div>
//           ))}
//         </div>
//       )}

//       {loading && <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div><p>Loading...</p></div>}
      
//       {!loading && billData.length > 0 && (
//         <div className="mt-6 overflow-x-auto">
//           <div className="mb-2 flex justify-between"><span>✅ {summary.totalRecords} records</span><span className="text-blue-600">Selected: {selectedCount}</span></div>
//           <table className="min-w-full border">
//             <thead className="bg-emerald-50">
//               <tr>
//                 <th className="px-3 py-2 border w-10"><input type="checkbox" checked={selectAll} onChange={handleSelectAll} /></th>
//                 <th className="px-3 py-2 border">S.No</th>
//                 <th className="px-3 py-2 border">Date</th>
//                 <th className="px-3 py-2 border">LR No</th>
//                 <th className="px-3 py-2 border">Vehicle No</th>
//                 <th className="px-3 py-2 border">From</th>
//                 <th className="px-3 py-2 border">To</th>
//                 <th className="px-3 py-2 border">Invoice No</th>
//                 <th className="px-3 py-2 border">Ewaybill No</th>
//                 <th className="px-3 py-2 border">Product</th>
//                 <th className="px-3 py-2 border text-right">Weight</th>
//                 <th className="px-3 py-2 border text-right">Rate</th>
//                 <th className="px-3 py-2 border text-right">Amount</th>
//               </tr>
//             </thead>
//             <tbody>
//               {billData.map((item, idx) => (
//                 <tr key={idx} className={selectedRows[idx] ? 'bg-blue-50' : ''}>
//                   <td className="px-3 py-2 border text-center"><input type="checkbox" checked={!!selectedRows[idx]} onChange={() => handleSelectRow(idx)} /></td>
//                   <td className="px-3 py-2 border">{idx+1}</td>
//                   <td className="px-3 py-2 border">{safeFormatDate(item.date)}</td>
//                   <td className="px-3 py-2 border font-medium text-emerald-700">{item.lrNo || '-'}</td>
//                   <td className="px-3 py-2 border">{item.vehicleNo || '-'}</td>
//                   <td className="px-3 py-2 border">{item.fromLocation || '-'}</td>
//                   <td className="px-3 py-2 border">{item.toLocation || '-'}</td>
//                   <td className="px-3 py-2 border">{item.invoiceNo || '-'}</td>
//                   <td className="px-3 py-2 border">{item.ewaybillNo || '-'}</td>
//                   <td className="px-3 py-2 border">{item.productName || '-'}</td>
//                   <td className="px-3 py-2 border text-right">{item.weight?.toFixed(2) || '0.00'}</td>
//                   <td className="px-3 py-2 border text-right">{item.rate?.toFixed(2) || '0.00'}</td>
//                   <td className="px-3 py-2 border text-right">₹ {item.amount?.toFixed(2) || '0.00'}</td>
//                 </tr>
//               ))}
//             </tbody>
//             <tfoot className="bg-emerald-100 font-bold">
//               <tr>
//                 <td colSpan="10" className="px-3 py-2 border text-right">TOTAL</td>
//                 <td className="px-3 py-2 border text-right">{summary.totalWeight.toFixed(2)}</td>
//                 <td className="px-3 py-2 border text-right">₹ {summary.totalAmount.toFixed(2)}</td>
//               </tr>
//             </tfoot>
//           </table>
//         </div>
//       )}
      
//       {!loading && !filters.clientId && <div className="text-center py-8">Select a client to view data</div>}
//       {!loading && filters.clientId && billData.length === 0 && <div className="text-center py-8">No data found</div>}
//     </Card>
//   );
// }

// // ==================== GENERAL BILLING COMPONENT ====================
// function GeneralBillingComponent({ branches, clients, loadingBranches, loadingClients }) {
//   const [loading, setLoading] = useState(false);
//   const [billData, setBillData] = useState([]);
//   const [summary, setSummary] = useState({ totalWeight: 0, totalAmount: 0, totalRecords: 0 });
//   const [selectedRows, setSelectedRows] = useState({});
//   const [selectAll, setSelectAll] = useState(false);
//   const [generating, setGenerating] = useState(false);
  
//   const [filters, setFilters] = useState({
//     branchId: "",
//     clientId: "",
//     orderType: "Sales",
//     startDate: "",
//     endDate: ""
//   });

//   useEffect(() => {
//     const today = new Date();
//     const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
//     const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
//     const formatDate = (date) => date.toISOString().split('T')[0];
//     setFilters(prev => ({ ...prev, startDate: formatDate(firstDayOfMonth), endDate: formatDate(lastDayOfMonth) }));
//   }, []);

//   useEffect(() => {
//     if (filters.clientId && filters.startDate && filters.endDate) fetchData();
//   }, [filters.clientId, filters.branchId, filters.orderType, filters.startDate, filters.endDate]);

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem('token');
//       const payload = { type: 'general', branchId: filters.branchId, branchName: branches.find(b => b._id === filters.branchId)?.name || '', clientId: filters.clientId, clientName: clients.find(c => c._id === filters.clientId)?.customerName || '', orderType: filters.orderType, startDate: filters.startDate, endDate: filters.endDate };
//       const response = await fetch('/api/billing/general', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
//       const data = await response.json();
//       if (data.success) { 
//         setBillData(data.data || []); 
//         setSummary({ totalWeight: data.summary?.totalWeight || 0, totalAmount: data.summary?.totalAmount || 0, totalRecords: data.summary?.totalRecords || 0 }); 
//         setSelectedRows({}); 
//         setSelectAll(false); 
//       }
//     } catch (error) { console.error('Error:', error); } finally { setLoading(false); }
//   };

//   const handleSelectRow = (index) => setSelectedRows(prev => ({ ...prev, [index]: !prev[index] }));
//   const handleSelectAll = () => { if (selectAll) setSelectedRows({}); else { const newSelected = {}; billData.forEach((_, idx) => newSelected[idx] = true); setSelectedRows(newSelected); } setSelectAll(!selectAll); };
//   const getSelectedData = () => billData.filter((_, idx) => selectedRows[idx]);
//   const getSelectedSummary = () => { const selected = getSelectedData(); return { totalWeight: selected.reduce((s, i) => s + (i.weight || 0), 0), totalAmount: selected.reduce((s, i) => s + (i.amount || 0), 0), totalRecords: selected.length }; };

//   const handleGenerateReport = async () => {
//     const selected = getSelectedData();
//     if (selected.length === 0) return alert("Please select at least one record to generate report");
//     setGenerating(true);
//     const selectedSummary = getSelectedSummary();
//     const reportData = { 
//       reportId: `RPT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, 
//       type: 'general', 
//       filters: { 
//         clientName: clients.find(c => c._id === filters.clientId)?.customerName || 'N/A', 
//         branchName: branches.find(b => b._id === filters.branchId)?.name || 'N/A', 
//         startDate: filters.startDate, 
//         endDate: filters.endDate, 
//         orderType: filters.orderType 
//       }, 
//       data: selected, 
//       summary: selectedSummary, 
//       totalRecords: billData.length, 
//       selectedRecords: selected.length 
//     };
//     await generateAndSaveReport(reportData, 'general');
//     setGenerating(false);
//   };

//   const selectedCount = Object.keys(selectedRows).filter(k => selectedRows[k]).length;

//   return (
//     <Card title="General - Billing">
//       <div className="grid grid-cols-12 gap-5">
//         <div className="col-span-12 md:col-span-3"><ClientSelector value={filters.clientId} onChange={(val) => setFilters(prev => ({ ...prev, clientId: val }))} clients={clients} loading={loadingClients} /></div>
//         <div className="col-span-12 md:col-span-3"><BranchSelector value={filters.branchId} onChange={(val) => setFilters(prev => ({ ...prev, branchId: val }))} branches={branches} loading={loadingBranches} /></div>
//         <div className="col-span-12 md:col-span-2"><MonthSelector value={""} onChange={() => {}} /></div>
//         <div className="col-span-12 md:col-span-2"><OrderTypeSelector value={filters.orderType} onChange={(val) => setFilters(prev => ({ ...prev, orderType: val }))} /></div>
//         <div className="col-span-12 md:col-span-2"><input type="date" value={filters.startDate} onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))} className="rounded-xl border p-2 w-full"/><p className="text-xs mt-1">Start Date</p></div>
//         <div className="col-span-12 md:col-span-2"><input type="date" value={filters.endDate} onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))} className="rounded-xl border p-2 w-full"/><p className="text-xs mt-1">End Date</p></div>
//       </div>

//       {billData.length > 0 && (
//         <div className="mt-4">
//           <button onClick={handleGenerateReport} disabled={generating || selectedCount === 0} className={`bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition ${(generating || selectedCount === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}>
//             {generating ? "Generating..." : `📄 Generate Report (${selectedCount} Selected)`}
//           </button>
//         </div>
//       )}

//       {loading && <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div><p>Loading...</p></div>}
      
//       {!loading && billData.length > 0 && (
//         <div className="mt-6 overflow-x-auto">
//           <div className="mb-2 flex justify-between"><span>✅ {summary.totalRecords} records</span><span className="text-blue-600">Selected: {selectedCount}</span></div>
//           <table className="min-w-full border">
//             <thead className="bg-emerald-50">
//               <tr>
//                 <th className="px-3 py-2 border w-10"><input type="checkbox" checked={selectAll} onChange={handleSelectAll} /></th>
//                 <th className="px-3 py-2 border">S.No</th>
//                 <th className="px-3 py-2 border">Date</th>
//                 <th className="px-3 py-2 border">LR No</th>
//                 <th className="px-3 py-2 border">Vehicle No</th>
//                 <th className="px-3 py-2 border">From</th>
//                 <th className="px-3 py-2 border">To</th>
//                 <th className="px-3 py-2 border">Party Name</th>
//                 <th className="px-3 py-2 border">Product</th>
//                 <th className="px-3 py-2 border text-right">Weight</th>
//                 <th className="px-3 py-2 border text-right">Rate</th>
//                 <th className="px-3 py-2 border text-right">Amount</th>
//               </tr>
//             </thead>
//             <tbody>
//               {billData.map((item, idx) => (
//                 <tr key={idx} className={selectedRows[idx] ? 'bg-blue-50' : ''}>
//                   <td className="px-3 py-2 border text-center"><input type="checkbox" checked={!!selectedRows[idx]} onChange={() => handleSelectRow(idx)} /></td>
//                   <td className="px-3 py-2 border">{idx+1}</td>
//                   <td className="px-3 py-2 border">{safeFormatDate(item.date)}</td>
//                   <td className="px-3 py-2 border font-medium text-emerald-700">{item.lrNo || '-'}</td>
//                   <td className="px-3 py-2 border">{item.vehicleNo || '-'}</td>
//                   <td className="px-3 py-2 border">{item.from || '-'}</td>
//                   <td className="px-3 py-2 border">{item.to || '-'}</td>
//                   <td className="px-3 py-2 border">{item.partyName || '-'}</td>
//                   <td className="px-3 py-2 border">{item.productName || '-'}</td>
//                   <td className="px-3 py-2 border text-right">{item.weight?.toFixed(2) || '0.00'}</td>
//                   <td className="px-3 py-2 border text-right">{item.rate?.toFixed(2) || '0.00'}</td>
//                   <td className="px-3 py-2 border text-right">₹ {item.amount?.toFixed(2) || '0.00'}</td>
//                 </tr>
//               ))}
//             </tbody>
//             <tfoot className="bg-emerald-100 font-bold">
//               <tr>
//                 <td colSpan="9" className="px-3 py-2 border text-right">TOTAL</td>
//                 <td className="px-3 py-2 border text-right">{summary.totalWeight.toFixed(2)}</td>
//                 <td className="px-3 py-2 border text-right">₹ {summary.totalAmount.toFixed(2)}</td>
//               </tr>
//             </tfoot>
//           </table>
//         </div>
//       )}
//       {!loading && !filters.clientId && <div className="text-center py-8">Select a client to view data</div>}
//       {!loading && filters.clientId && billData.length === 0 && <div className="text-center py-8">No data found</div>}
//     </Card>
//   );
// }

// // ==================== DETENTION BILLING COMPONENT ====================
// function DetentionBillingComponent({ branches, clients, loadingBranches, loadingClients }) {
//   const [loading, setLoading] = useState(false);
//   const [billData, setBillData] = useState([]);
//   const [summary, setSummary] = useState({ totalWeight: 0, totalAmount: 0, totalRecords: 0 });
//   const [selectedRows, setSelectedRows] = useState({});
//   const [selectAll, setSelectAll] = useState(false);
//   const [generating, setGenerating] = useState(false);
  
//   const [filters, setFilters] = useState({ branchId: "", clientId: "", detention: "", startDate: "", endDate: "" });

//   useEffect(() => {
//     const today = new Date();
//     const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
//     const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
//     const formatDate = (date) => date.toISOString().split('T')[0];
//     setFilters(prev => ({ ...prev, startDate: formatDate(firstDayOfMonth), endDate: formatDate(lastDayOfMonth) }));
//   }, []);

//   useEffect(() => { if (filters.clientId && filters.startDate && filters.endDate) fetchData(); }, [filters.clientId, filters.branchId, filters.detention, filters.startDate, filters.endDate]);

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem('token');
//       const payload = { type: 'detention', branchId: filters.branchId, branchName: branches.find(b => b._id === filters.branchId)?.name || '', clientId: filters.clientId, clientName: clients.find(c => c._id === filters.clientId)?.customerName || '', detention: filters.detention, startDate: filters.startDate, endDate: filters.endDate };
//       const response = await fetch('/api/billing/detention', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
//       const data = await response.json();
//       if (data.success) { setBillData(data.data || []); setSummary({ totalWeight: data.summary?.totalWeight || 0, totalAmount: data.summary?.totalAmount || 0, totalRecords: data.summary?.totalRecords || 0 }); setSelectedRows({}); setSelectAll(false); }
//     } catch (error) { console.error('Error:', error); } finally { setLoading(false); }
//   };

//   const handleSelectRow = (index) => setSelectedRows(prev => ({ ...prev, [index]: !prev[index] }));
//   const handleSelectAll = () => { if (selectAll) setSelectedRows({}); else { const newSelected = {}; billData.forEach((_, idx) => newSelected[idx] = true); setSelectedRows(newSelected); } setSelectAll(!selectAll); };
//   const getSelectedData = () => billData.filter((_, idx) => selectedRows[idx]);
//   const getSelectedSummary = () => { const selected = getSelectedData(); return { totalAmount: selected.reduce((s, i) => s + (i.amount || 0), 0), totalRecords: selected.length }; };

//   const handleGenerateReport = async () => {
//     const selected = getSelectedData();
//     if (selected.length === 0) return alert("Please select at least one record to generate report");
//     setGenerating(true);
//     const selectedSummary = getSelectedSummary();
//     const reportData = { 
//       reportId: `RPT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, 
//       type: 'detention', 
//       filters: { 
//         clientName: clients.find(c => c._id === filters.clientId)?.customerName || 'N/A', 
//         branchName: branches.find(b => b._id === filters.branchId)?.name || 'N/A', 
//         startDate: filters.startDate, 
//         endDate: filters.endDate, 
//         detention: filters.detention 
//       }, 
//       data: selected, 
//       summary: selectedSummary, 
//       totalRecords: billData.length, 
//       selectedRecords: selected.length 
//     };
//     await generateAndSaveReport(reportData, 'detention');
//     setGenerating(false);
//   };

//   const selectedCount = Object.keys(selectedRows).filter(k => selectedRows[k]).length;

//   return (
//     <Card title="Detention - Billing">
//       <div className="grid grid-cols-12 gap-5">
//         <div className="col-span-12 md:col-span-3"><ClientSelector value={filters.clientId} onChange={(val) => setFilters(prev => ({ ...prev, clientId: val }))} clients={clients} loading={loadingClients} /></div>
//         <div className="col-span-12 md:col-span-3"><BranchSelector value={filters.branchId} onChange={(val) => setFilters(prev => ({ ...prev, branchId: val }))} branches={branches} loading={loadingBranches} /></div>
//         <div className="col-span-12 md:col-span-2"><label className="block text-xs font-bold mb-1">Detention</label><input type="text" value={filters.detention} onChange={(e) => setFilters(prev => ({ ...prev, detention: e.target.value }))} className="rounded-xl border p-2 w-full" placeholder="Detention Type"/></div>
//         <div className="col-span-12 md:col-span-2"><MonthSelector value={""} onChange={() => {}} /></div>
//         <div className="col-span-12 md:col-span-2"><input type="date" value={filters.startDate} onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))} className="rounded-xl border p-2 w-full"/><p className="text-xs mt-1">Start Date</p></div>
//         <div className="col-span-12 md:col-span-2"><input type="date" value={filters.endDate} onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))} className="rounded-xl border p-2 w-full"/><p className="text-xs mt-1">End Date</p></div>
//       </div>

//       {billData.length > 0 && (
//         <div className="mt-4">
//           <button onClick={handleGenerateReport} disabled={generating || selectedCount === 0} className={`bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition ${(generating || selectedCount === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}>
//             {generating ? "Generating..." : `📄 Generate Report (${selectedCount} Selected)`}
//           </button>
//         </div>
//       )}

//       {loading && <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div><p>Loading...</p></div>}
      
//       {!loading && billData.length > 0 && (
//         <div className="mt-6 overflow-x-auto">
//           <div className="mb-2 flex justify-between"><span>✅ {summary.totalRecords} records</span><span className="text-blue-600">Selected: {selectedCount}</span></div>
//           <table className="min-w-full border">
//             <thead className="bg-emerald-50">
//               <tr>
//                 <th className="px-3 py-2 border w-10"><input type="checkbox" checked={selectAll} onChange={handleSelectAll} /></th>
//                 <th className="px-3 py-2 border">S.No</th>
//                 <th className="px-3 py-2 border">Date</th>
//                 <th className="px-3 py-2 border">LR No</th>
//                 <th className="px-3 py-2 border">Vehicle No</th>
//                 <th className="px-3 py-2 border">From</th>
//                 <th className="px-3 py-2 border">To</th>
//                 <th className="px-3 py-2 border">Detention Type</th>
//                 <th className="px-3 py-2 border text-right">Amount</th>
//               </tr>
//             </thead>
//             <tbody>
//               {billData.map((item, idx) => (
//                 <tr key={idx} className={selectedRows[idx] ? 'bg-blue-50' : ''}>
//                   <td className="px-3 py-2 border text-center"><input type="checkbox" checked={!!selectedRows[idx]} onChange={() => handleSelectRow(idx)} /></td>
//                   <td className="px-3 py-2 border">{idx+1}</td>
//                   <td className="px-3 py-2 border">{safeFormatDate(item.date)}</td>
//                   <td className="px-3 py-2 border font-medium text-emerald-700">{item.lrNo || '-'}</td>
//                   <td className="px-3 py-2 border">{item.vehicleNo || '-'}</td>
//                   <td className="px-3 py-2 border">{item.from || '-'}</td>
//                   <td className="px-3 py-2 border">{item.to || '-'}</td>
//                   <td className="px-3 py-2 border">{item.detentionType || filters.detention || '-'}</td>
//                   <td className="px-3 py-2 border text-right">₹ {item.amount?.toFixed(2) || '0.00'}</td>
//                 </tr>
//               ))}
//             </tbody>
//             <tfoot className="bg-emerald-100 font-bold">
//               <tr>
//                 <td colSpan="8" className="px-3 py-2 border text-right">TOTAL</td>
//                 <td className="px-3 py-2 border text-right">₹ {summary.totalAmount.toFixed(2)}</td>
//               </tr>
//             </tfoot>
//           </table>
//         </div>
//       )}
//       {!loading && !filters.clientId && <div className="text-center py-8">Select a client to view data</div>}
//       {!loading && filters.clientId && billData.length === 0 && <div className="text-center py-8">No data found</div>}
//     </Card>
//   );
// }

// // ==================== CANCELLATION BILLING COMPONENT ====================
// function CancellationBillingComponent({ branches, clients, loadingBranches, loadingClients }) {
//   const [loading, setLoading] = useState(false);
//   const [billData, setBillData] = useState([]);
//   const [summary, setSummary] = useState({ totalWeight: 0, totalAmount: 0, totalRecords: 0 });
//   const [selectedRows, setSelectedRows] = useState({});
//   const [selectAll, setSelectAll] = useState(false);
//   const [generating, setGenerating] = useState(false);
  
//   const [filters, setFilters] = useState({ branchId: "", clientId: "", cancellation: "", startDate: "", endDate: "" });

//   useEffect(() => {
//     const today = new Date();
//     const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
//     const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
//     const formatDate = (date) => date.toISOString().split('T')[0];
//     setFilters(prev => ({ ...prev, startDate: formatDate(firstDayOfMonth), endDate: formatDate(lastDayOfMonth) }));
//   }, []);

//   useEffect(() => { if (filters.clientId && filters.startDate && filters.endDate) fetchData(); }, [filters.clientId, filters.branchId, filters.cancellation, filters.startDate, filters.endDate]);

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem('token');
//       const payload = { type: 'cancellation', branchId: filters.branchId, branchName: branches.find(b => b._id === filters.branchId)?.name || '', clientId: filters.clientId, clientName: clients.find(c => c._id === filters.clientId)?.customerName || '', cancellation: filters.cancellation, startDate: filters.startDate, endDate: filters.endDate };
//       const response = await fetch('/api/billing/cancellation', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
//       const data = await response.json();
//       if (data.success) { setBillData(data.data || []); setSummary({ totalWeight: data.summary?.totalWeight || 0, totalAmount: data.summary?.totalAmount || 0, totalRecords: data.summary?.totalRecords || 0 }); setSelectedRows({}); setSelectAll(false); }
//     } catch (error) { console.error('Error:', error); } finally { setLoading(false); }
//   };

//   const handleSelectRow = (index) => setSelectedRows(prev => ({ ...prev, [index]: !prev[index] }));
//   const handleSelectAll = () => { if (selectAll) setSelectedRows({}); else { const newSelected = {}; billData.forEach((_, idx) => newSelected[idx] = true); setSelectedRows(newSelected); } setSelectAll(!selectAll); };
//   const getSelectedData = () => billData.filter((_, idx) => selectedRows[idx]);
//   const getSelectedSummary = () => { const selected = getSelectedData(); return { totalAmount: selected.reduce((s, i) => s + (i.amount || 0), 0), totalRecords: selected.length }; };

//   const handleGenerateReport = async () => {
//     const selected = getSelectedData();
//     if (selected.length === 0) return alert("Please select at least one record to generate report");
//     setGenerating(true);
//     const selectedSummary = getSelectedSummary();
//     const reportData = { 
//       reportId: `RPT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, 
//       type: 'cancellation', 
//       filters: { 
//         clientName: clients.find(c => c._id === filters.clientId)?.customerName || 'N/A', 
//         branchName: branches.find(b => b._id === filters.branchId)?.name || 'N/A', 
//         startDate: filters.startDate, 
//         endDate: filters.endDate, 
//         cancellation: filters.cancellation 
//       }, 
//       data: selected, 
//       summary: selectedSummary, 
//       totalRecords: billData.length, 
//       selectedRecords: selected.length 
//     };
//     await generateAndSaveReport(reportData, 'cancellation');
//     setGenerating(false);
//   };

//   const selectedCount = Object.keys(selectedRows).filter(k => selectedRows[k]).length;

//   return (
//     <Card title="Cancellation - Billing">
//       <div className="grid grid-cols-12 gap-5">
//         <div className="col-span-12 md:col-span-3"><ClientSelector value={filters.clientId} onChange={(val) => setFilters(prev => ({ ...prev, clientId: val }))} clients={clients} loading={loadingClients} /></div>
//         <div className="col-span-12 md:col-span-3"><BranchSelector value={filters.branchId} onChange={(val) => setFilters(prev => ({ ...prev, branchId: val }))} branches={branches} loading={loadingBranches} /></div>
//         <div className="col-span-12 md:col-span-2"><label className="block text-xs font-bold mb-1">Cancellation</label><input type="text" value={filters.cancellation} onChange={(e) => setFilters(prev => ({ ...prev, cancellation: e.target.value }))} className="rounded-xl border p-2 w-full" placeholder="Cancellation Type"/></div>
//         <div className="col-span-12 md:col-span-2"><MonthSelector value={""} onChange={() => {}} /></div>
//         <div className="col-span-12 md:col-span-2"><input type="date" value={filters.startDate} onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))} className="rounded-xl border p-2 w-full"/><p className="text-xs mt-1">Start Date</p></div>
//         <div className="col-span-12 md:col-span-2"><input type="date" value={filters.endDate} onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))} className="rounded-xl border p-2 w-full"/><p className="text-xs mt-1">End Date</p></div>
//       </div>

//       {billData.length > 0 && (
//         <div className="mt-4">
//           <button onClick={handleGenerateReport} disabled={generating || selectedCount === 0} className={`bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition ${(generating || selectedCount === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}>
//             {generating ? "Generating..." : `📄 Generate Report (${selectedCount} Selected)`}
//           </button>
//         </div>
//       )}

//       {loading && <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div><p>Loading...</p></div>}
      
//       {!loading && billData.length > 0 && (
//         <div className="mt-6 overflow-x-auto">
//           <div className="mb-2 flex justify-between"><span>✅ {summary.totalRecords} records</span><span className="text-blue-600">Selected: {selectedCount}</span></div>
//           <table className="min-w-full border">
//             <thead className="bg-emerald-50">
//               <tr>
//                 <th className="px-3 py-2 border w-10"><input type="checkbox" checked={selectAll} onChange={handleSelectAll} /></th>
//                 <th className="px-3 py-2 border">S.No</th>
//                 <th className="px-3 py-2 border">Date</th>
//                 <th className="px-3 py-2 border">LR No</th>
//                 <th className="px-3 py-2 border">Vehicle No</th>
//                 <th className="px-3 py-2 border">From</th>
//                 <th className="px-3 py-2 border">To</th>
//                 <th className="px-3 py-2 border">Cancellation Type</th>
//                 <th className="px-3 py-2 border text-right">Amount</th>
//               </tr>
//             </thead>
//             <tbody>
//               {billData.map((item, idx) => (
//                 <tr key={idx} className={selectedRows[idx] ? 'bg-blue-50' : ''}>
//                   <td className="px-3 py-2 border text-center"><input type="checkbox" checked={!!selectedRows[idx]} onChange={() => handleSelectRow(idx)} /></td>
//                   <td className="px-3 py-2 border">{idx+1}</td>
//                   <td className="px-3 py-2 border">{safeFormatDate(item.date)}</td>
//                   <td className="px-3 py-2 border font-medium text-emerald-700">{item.lrNo || '-'}</td>
//                   <td className="px-3 py-2 border">{item.vehicleNo || '-'}</td>
//                   <td className="px-3 py-2 border">{item.from || '-'}</td>
//                   <td className="px-3 py-2 border">{item.to || '-'}</td>
//                   <td className="px-3 py-2 border">{item.cancellationType || filters.cancellation || '-'}</td>
//                   <td className="px-3 py-2 border text-right">₹ {item.amount?.toFixed(2) || '0.00'}</td>
//                 </tr>
//               ))}
//             </tbody>
//             <tfoot className="bg-emerald-100 font-bold">
//               <tr>
//                 <td colSpan="8" className="px-3 py-2 border text-right">TOTAL</td>
//                 <td className="px-3 py-2 border text-right">₹ {summary.totalAmount.toFixed(2)}</td>
//               </tr>
//             </tfoot>
//           </table>
//         </div>
//       )}
//       {!loading && !filters.clientId && <div className="text-center py-8">Select a client to view data</div>}
//       {!loading && filters.clientId && billData.length === 0 && <div className="text-center py-8">No data found</div>}
//     </Card>
//   );
// }

// // ==================== OTHER BILLING COMPONENT ====================
// function OtherBillingComponent({ branches, clients, loadingBranches, loadingClients }) {
//   const [loading, setLoading] = useState(false);
//   const [billData, setBillData] = useState([]);
//   const [summary, setSummary] = useState({ totalWeight: 0, totalAmount: 0, totalRecords: 0 });
//   const [selectedRows, setSelectedRows] = useState({});
//   const [selectAll, setSelectAll] = useState(false);
//   const [generating, setGenerating] = useState(false);
  
//   const [filters, setFilters] = useState({ branchId: "", clientId: "", type: "Cancellation", startDate: "", endDate: "" });

//   useEffect(() => {
//     const today = new Date();
//     const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
//     const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
//     const formatDate = (date) => date.toISOString().split('T')[0];
//     setFilters(prev => ({ ...prev, startDate: formatDate(firstDayOfMonth), endDate: formatDate(lastDayOfMonth) }));
//   }, []);

//   useEffect(() => { if (filters.clientId && filters.startDate && filters.endDate) fetchData(); }, [filters.clientId, filters.branchId, filters.type, filters.startDate, filters.endDate]);

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem('token');
//       const payload = { type: 'other', branchId: filters.branchId, branchName: branches.find(b => b._id === filters.branchId)?.name || '', clientId: filters.clientId, clientName: clients.find(c => c._id === filters.clientId)?.customerName || '', billingType: filters.type, startDate: filters.startDate, endDate: filters.endDate };
//       const response = await fetch('/api/billing/other', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
//       const data = await response.json();
//       if (data.success) { setBillData(data.data || []); setSummary({ totalWeight: data.summary?.totalWeight || 0, totalAmount: data.summary?.totalAmount || 0, totalRecords: data.summary?.totalRecords || 0 }); setSelectedRows({}); setSelectAll(false); }
//     } catch (error) { console.error('Error:', error); } finally { setLoading(false); }
//   };

//   const handleSelectRow = (index) => setSelectedRows(prev => ({ ...prev, [index]: !prev[index] }));
//   const handleSelectAll = () => { if (selectAll) setSelectedRows({}); else { const newSelected = {}; billData.forEach((_, idx) => newSelected[idx] = true); setSelectedRows(newSelected); } setSelectAll(!selectAll); };
//   const getSelectedData = () => billData.filter((_, idx) => selectedRows[idx]);
//   const getSelectedSummary = () => { const selected = getSelectedData(); return { totalAmount: selected.reduce((s, i) => s + (i.amount || 0), 0), totalRecords: selected.length }; };

//   const handleGenerateReport = async () => {
//     const selected = getSelectedData();
//     if (selected.length === 0) return alert("Please select at least one record to generate report");
//     setGenerating(true);
//     const selectedSummary = getSelectedSummary();
//     const reportData = { 
//       reportId: `RPT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, 
//       type: 'other', 
//       filters: { 
//         clientName: clients.find(c => c._id === filters.clientId)?.customerName || 'N/A', 
//         branchName: branches.find(b => b._id === filters.branchId)?.name || 'N/A', 
//         startDate: filters.startDate, 
//         endDate: filters.endDate, 
//         billingType: filters.type 
//       }, 
//       data: selected, 
//       summary: selectedSummary, 
//       totalRecords: billData.length, 
//       selectedRecords: selected.length 
//     };
//     await generateAndSaveReport(reportData, 'other');
//     setGenerating(false);
//   };

//   const selectedCount = Object.keys(selectedRows).filter(k => selectedRows[k]).length;

//   return (
//     <Card title="Other - Billing">
//       <div className="grid grid-cols-12 gap-5">
//         <div className="col-span-12 md:col-span-3"><ClientSelector value={filters.clientId} onChange={(val) => setFilters(prev => ({ ...prev, clientId: val }))} clients={clients} loading={loadingClients} /></div>
//         <div className="col-span-12 md:col-span-3"><BranchSelector value={filters.branchId} onChange={(val) => setFilters(prev => ({ ...prev, branchId: val }))} branches={branches} loading={loadingBranches} /></div>
//         <div className="col-span-12 md:col-span-2"><label className="block text-xs font-bold mb-1">Type</label><select value={filters.type} onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))} className="rounded-xl border p-2 w-full"><option value="Cancellation">Cancellation</option><option value="Detention">Detention</option><option value="Demurrage">Demurrage</option><option value="Other Charges">Other Charges</option></select></div>
//         <div className="col-span-12 md:col-span-2"><MonthSelector value={""} onChange={() => {}} /></div>
//         <div className="col-span-12 md:col-span-2"><input type="date" value={filters.startDate} onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))} className="rounded-xl border p-2 w-full"/><p className="text-xs mt-1">Start Date</p></div>
//         <div className="col-span-12 md:col-span-2"><input type="date" value={filters.endDate} onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))} className="rounded-xl border p-2 w-full"/><p className="text-xs mt-1">End Date</p></div>
//       </div>

//       {billData.length > 0 && (
//         <div className="mt-4">
//           <button onClick={handleGenerateReport} disabled={generating || selectedCount === 0} className={`bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition ${(generating || selectedCount === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}>
//             {generating ? "Generating..." : `📄 Generate Report (${selectedCount} Selected)`}
//           </button>
//         </div>
//       )}

//       {loading && <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div><p>Loading...</p></div>}
      
//       {!loading && billData.length > 0 && (
//         <div className="mt-6 overflow-x-auto">
//           <div className="mb-2 flex justify-between"><span>✅ {summary.totalRecords} records</span><span className="text-blue-600">Selected: {selectedCount}</span></div>
//           <table className="min-w-full border">
//             <thead className="bg-emerald-50">
//               <tr>
//                 <th className="px-3 py-2 border w-10"><input type="checkbox" checked={selectAll} onChange={handleSelectAll} /></th>
//                 <th className="px-3 py-2 border">S.No</th>
//                 <th className="px-3 py-2 border">Date</th>
//                 <th className="px-3 py-2 border">LR No</th>
//                 <th className="px-3 py-2 border">Vehicle No</th>
//                 <th className="px-3 py-2 border">From</th>
//                 <th className="px-3 py-2 border">To</th>
//                 <th className="px-3 py-2 border">Bill Type</th>
//                 <th className="px-3 py-2 border text-right">Amount</th>
//               </tr>
//             </thead>
//             <tbody>
//               {billData.map((item, idx) => (
//                 <tr key={idx} className={selectedRows[idx] ? 'bg-blue-50' : ''}>
//                   <td className="px-3 py-2 border text-center"><input type="checkbox" checked={!!selectedRows[idx]} onChange={() => handleSelectRow(idx)} /></td>
//                   <td className="px-3 py-2 border">{idx+1}</td>
//                   <td className="px-3 py-2 border">{safeFormatDate(item.date)}</td>
//                   <td className="px-3 py-2 border font-medium text-emerald-700">{item.lrNo || '-'}</td>
//                   <td className="px-3 py-2 border">{item.vehicleNo || '-'}</td>
//                   <td className="px-3 py-2 border">{item.from || '-'}</td>
//                   <td className="px-3 py-2 border">{item.to || '-'}</td>
//                   <td className="px-3 py-2 border">{item.billingType || filters.type || '-'}</td>
//                   <td className="px-3 py-2 border text-right">₹ {item.amount?.toFixed(2) || '0.00'}</td>
//                 </tr>
//               ))}
//             </tbody>
//             <tfoot className="bg-emerald-100 font-bold">
//               <tr>
//                 <td colSpan="8" className="px-3 py-2 border text-right">TOTAL</td>
//                 <td className="px-3 py-2 border text-right">₹ {summary.totalAmount.toFixed(2)}</td>
//               </tr>
//             </tfoot>
//           </table>
//         </div>
//       )}
//       {!loading && !filters.clientId && <div className="text-center py-8">Select a client to view data</div>}
//       {!loading && filters.clientId && billData.length === 0 && <div className="text-center py-8">No data found</div>}
//     </Card>
//   );
// }

// // ==================== MAIN BILLING PAGE ====================
// export default function BillingPage() {
//   const router = useRouter();
//   const [loadingBranches, setLoadingBranches] = useState(false);
//   const [loadingClients, setLoadingClients] = useState(false);
//   const [loadingPlants, setLoadingPlants] = useState(false);
//   const [selectedBillingType, setSelectedBillingType] = useState("");
//   const [branches, setBranches] = useState([]);
//   const [clients, setClients] = useState([]);
//   const [plants, setPlants] = useState([]);
  
//   const fetchBranches = async () => {
//     setLoadingBranches(true);
//     try {
//       const token = localStorage.getItem('token');
//       const res = await fetch('/api/branches', { headers: { Authorization: `Bearer ${token}` } });
//       const data = await res.json();
//       if (data.success && Array.isArray(data.data)) setBranches(data.data);
//     } catch (error) { console.error(error); } finally { setLoadingBranches(false); }
//   };
  
//   const fetchClients = async () => {
//     setLoadingClients(true);
//     try {
//       const token = localStorage.getItem('token');
//       const res = await fetch('/api/customers', { headers: { Authorization: `Bearer ${token}` } });
//       const data = await res.json();
//       if (data.success && Array.isArray(data.data)) setClients(data.data);
//     } catch (error) { console.error(error); } finally { setLoadingClients(false); }
//   };
  
//   const fetchPlants = async () => {
//     setLoadingPlants(true);
//     try {
//       const token = localStorage.getItem('token');
//       const res = await fetch('/api/plants', { headers: { Authorization: `Bearer ${token}` } });
//       const data = await res.json();
//       if (data.success && Array.isArray(data.data)) setPlants(data.data);
//     } catch (error) { console.error(error); } finally { setLoadingPlants(false); }
//   };
  
//   useEffect(() => { fetchBranches(); fetchClients(); fetchPlants(); }, []);
  
//   const renderSelectedBillingCard = () => {
//     switch(selectedBillingType) {
//       case "product-wise": return <ProductWiseBillingComponent branches={branches} clients={clients} plants={plants} loadingBranches={loadingBranches} loadingClients={loadingClients} loadingPlants={loadingPlants} />;
//       case "general": return <GeneralBillingComponent branches={branches} clients={clients} loadingBranches={loadingBranches} loadingClients={loadingClients} />;
//       case "detention": return <DetentionBillingComponent branches={branches} clients={clients} loadingBranches={loadingBranches} loadingClients={loadingClients} />;
//       case "cancellation": return <CancellationBillingComponent branches={branches} clients={clients} loadingBranches={loadingBranches} loadingClients={loadingClients} />;
//       case "other": return <OtherBillingComponent branches={branches} clients={clients} loadingBranches={loadingBranches} loadingClients={loadingClients} />;
//       default: return (
//         <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
//           <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//           </svg>
//           <p className="text-slate-500 text-lg">Please select a billing type from the dropdown above</p>
//           <p className="text-slate-400 text-sm mt-2">Choose Yara Product-Wise, General, Detention, Cancellation, or Other Billing</p>
//         </div>
//       );
//     }
//   };
  
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
//       <div className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
//         <div className="mx-auto max-w-full px-6 py-4">
//           <div className="flex items-center gap-3">
//             <button onClick={() => router.push('/admin/dashboard')} className="text-emerald-600 hover:text-emerald-800 font-medium text-sm flex items-center gap-1">
//               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
//               Back to Dashboard
//             </button>
//             <div className="text-xl font-extrabold text-slate-900">Billing Reports</div>
//           </div>
//         </div>
//       </div>
//       <div className="mx-auto max-w-7xl p-6">
//         <BillingTypeSelector value={selectedBillingType} onChange={setSelectedBillingType} />
//         {renderSelectedBillingCard()}
//       </div>
//     </div>
//   );
// }
"use client";

import { useState, useEffect } from "react";
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

// Branch Selector
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
        {branches.map((branch) => (
          <option key={branch._id} value={branch._id}>
            {branch.name} {branch.code ? `(${branch.code})` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}

// Client Selector
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
        {clients.map((client) => (
          <option key={client._id} value={client._id}>
            {client.customerName} {client.customerCode ? `(${client.customerCode})` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}

function MonthSelector({ value, onChange, label = "Month" }) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
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
        {months.map((month) => (
          <option key={month} value={month}>
            {month}
          </option>
        ))}
      </select>
    </div>
  );
}

function OrderTypeSelector({ value, onChange, label = "Order Type" }) {
  const types = ["Sales", "STO Order", "Export", "Import", "Purchase", "Return"];

  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
      >
        <option value="">All Order Types</option>
        {types.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
    </div>
  );
}

function ProductCategorySelector({ value, onChange, label = "Product Categories" }) {
  const categories = ["Biological", "Premium Product", "Standard", "Economy", "Specialty"];

  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
      >
        <option value="">Select Category</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
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
        {plants.map((plant) => (
          <option key={plant._id} value={plant._id}>
            {plant.code} - {plant.name}
          </option>
        ))}
      </select>
    </div>
  );
}

// Billing Type Dropdown Component
function BillingTypeSelector({ value, onChange, label = "Select Billing Type" }) {
  const billingTypes = [
    { value: "product-wise", label: "Yara - Product-Wise Billing" },
    { value: "general", label: "General - Billing" },
    { value: "detention", label: "Detention - Billing" },
    { value: "cancellation", label: "Cancellation - Billing" },
    { value: "other", label: "Other - Billing" },
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
        {billingTypes.map((type) => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// Safe date formatter
function safeFormatDate(dateStr) {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  } catch (error) {
    return dateStr;
  }
}

// Save report to backend and generate PDF
async function generateAndSaveReport(reportData, type, filters, onSuccess) {
  try {
    const token = localStorage.getItem("token");

    const saveResponse = await fetch("/api/saved-reports", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(reportData),
    });
    const saveData = await saveResponse.json();

    if (!saveData.success) {
      alert("Failed to save report");
      return false;
    }

    const currentDate = new Date().toLocaleString();
    const billNumber = `BILL/${Date.now()}/${Math.floor(Math.random() * 1000)}`;
    const html = generatePDFHTML(reportData, currentDate, type, filters, billNumber);

    const printWindow = window.open("", "_blank");
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();

    alert(`✅ Bill generated successfully!\nBill No: ${billNumber}\nSaved ${reportData.selectedRecords} records`);

    if (onSuccess) onSuccess();
    return true;
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to generate report");
    return false;
  }
}

function generatePDFHTML(reportData, currentDate, type, filters, billNumber) {
  let title = "";
  let headers = [];
  let rows = [];
  let totalAmount = reportData.summary.totalAmount;
  let totalWeight = reportData.summary.totalWeight || 0;

  const clientName = filters.clientName || "Client Name";
  const clientGST = filters.clientGST || "GST Number";
  const clientState = filters.clientState || "State";
  const clientStateCode = filters.clientStateCode || "Code";

  switch (type) {
    case "product-wise":
      title = "Yara - Product-Wise Billing Report";
      headers = ["S.No", "LR No", "Date", "Vehicle No", "From", "To", "Product", "Weight (MT)", "Rate (₹)", "Amount (₹)"];
      rows = reportData.data.map((item, idx) => [
        idx + 1,
        item.lrNo || "-",
        safeFormatDate(item.date),
        item.vehicleNo || "-",
        item.fromLocation || item.from || "-",
        item.toLocation || item.to || "-",
        item.productName || "-",
        (item.weight || 0).toFixed(2),
        (item.rate || 0).toFixed(2),
        (item.amount || 0).toFixed(2),
      ]);
      break;
    case "general":
      title = "General Billing Report";
      headers = ["S.No", "LR No", "Date", "Vehicle No", "From", "To", "Product", "Weight (MT)", "Rate (₹)", "Amount (₹)"];
      rows = reportData.data.map((item, idx) => [
        idx + 1,
        item.lrNo || "-",
        safeFormatDate(item.date),
        item.vehicleNo || "-",
        item.from || "-",
        item.to || "-",
        item.productName || "-",
        (item.weight || 0).toFixed(2),
        (item.rate || 0).toFixed(2),
        (item.amount || 0).toFixed(2),
      ]);
      break;
    case "detention":
      title = "Detention Billing Report";
      headers = ["S.No", "LR No", "Date", "Vehicle No", "From", "To", "Detention Type", "Amount (₹)"];
      rows = reportData.data.map((item, idx) => [
        idx + 1,
        item.lrNo || "-",
        safeFormatDate(item.date),
        item.vehicleNo || "-",
        item.from || "-",
        item.to || "-",
        item.detentionType || "-",
        (item.amount || 0).toFixed(2),
      ]);
      break;
    case "cancellation":
      title = "Cancellation Billing Report";
      headers = ["S.No", "LR No", "Date", "Vehicle No", "From", "To", "Cancellation Type", "Amount (₹)"];
      rows = reportData.data.map((item, idx) => [
        idx + 1,
        item.lrNo || "-",
        safeFormatDate(item.date),
        item.vehicleNo || "-",
        item.from || "-",
        item.to || "-",
        item.cancellationType || "-",
        (item.amount || 0).toFixed(2),
      ]);
      break;
    default:
      title = "Billing Report";
      headers = ["S.No", "LR No", "Date", "Vehicle No", "Amount (₹)"];
      rows = reportData.data.map((item, idx) => [
        idx + 1,
        item.lrNo || "-",
        safeFormatDate(item.date),
        item.vehicleNo || "-",
        (item.amount || 0).toFixed(2),
      ]);
  }

  const periodText = filters.startDate && filters.endDate ? `${filters.startDate} to ${filters.endDate}` : "Selected Period";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Times New Roman', Arial, sans-serif; padding: 20px; background: white; font-size: 12px; }
        .bill-container { max-width: 1100px; margin: 0 auto; background: white; }
        .header-section { display: flex; justify-content: space-between; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #000; }
        .company-details { flex: 1; }
        .company-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
        .company-address { font-size: 10px; line-height: 1.4; color: #333; }
        .bill-details { text-align: right; flex: 1; }
        .bill-title { font-size: 16px; font-weight: bold; margin-bottom: 5px; }
        .party-section { display: flex; justify-content: space-between; margin-bottom: 20px; padding: 10px; background: #f9fafb; border: 1px solid #e5e7eb; }
        .bill-to, .ship-to { flex: 1; }
        .section-title { font-weight: bold; margin-bottom: 5px; font-size: 12px; }
        .party-address { font-size: 10px; line-height: 1.4; }
        .terms-section { margin: 15px 0; padding: 8px; background: #fef3c7; border: 1px solid #f59e0b; font-size: 10px; }
        .terms-title { font-weight: bold; margin-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { border: 1px solid #000; padding: 6px; text-align: left; font-size: 10px; }
        th { background-color: #d1fae5; font-weight: bold; text-align: center; }
        .text-right { text-align: right; }
        .total-row { background-color: #fef3c7; font-weight: bold; }
        .footer { margin-top: 20px; padding-top: 10px; border-top: 1px solid #ccc; font-size: 9px; text-align: center; }
        .amount-in-words { margin-top: 10px; font-size: 10px; font-weight: bold; }
        @media print { body { padding: 0; margin: 0; } }
      </style>
    </head>
    <body>
      <div class="bill-container">
        <div class="header-section">
          <div class="company-details">
            <div class="company-name">JAYA GLOBAL LOGISTICS</div>
            <div class="company-address">
              Office - 404, A - Wing 4th Floor,<br>
              Shelton Sapphire, Sector - 15<br>
              Belapur Navi Mumbai - 400614.<br>
              GSTIN/UIN: 27HEVPS8463H1ZC<br>
              State Name: Maharashtra, Code: 27<br>
              E-Mail: jayagloballogistics@gmail.com<br>
              PAN No: HEVPS8463H
            </div>
          </div>
          <div class="bill-details">
            <div class="bill-title">TAX INVOICE</div>
            <div class="bill-no"><strong>BILL No:</strong> ${billNumber}</div>
            <div class="bill-no"><strong>BILL DATE:</strong> ${currentDate.split(",")[0]}</div>
            <div class="bill-no"><strong>Period:</strong> ${periodText}</div>
          </div>
        </div>
        
        <div class="party-section">
          <div class="bill-to">
            <div class="section-title">Bill To:</div>
            <div class="party-address">
              ${clientName}<br>
              ${filters.clientAddress || "Warehousing complex, Chukkavanipalem Village"}<br>
              ${filters.clientCity || "Visakhapatnam, Andhra Pradesh, 530012"}<br>
              GST No: ${clientGST}<br>
              ${clientState}, Code: ${clientStateCode}
            </div>
          </div>
          <div class="ship-to">
            <div class="section-title">Ship To:</div>
            <div class="party-address">Same as Bill To</div>
          </div>
        </div>
        
        <div class="terms-section">
          <div class="terms-title">Terms of Payment:</div>
          <div>Within 30 Days of receiving Invoice</div>
          <div style="margin-top: 5px;"><strong>Note:</strong></div>
          <div>1) Please pay by A/c Payee Cheque / DD favouring 'JAYA LOGISTICS' Only.</div>
          <div>2) 18% interest will be charged, if the bill is not settled within 30 Days.</div>
        </div>
        
        <table>
          <thead>
            <tr>
              ${headers.map((h) => `<th>${h}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${rows.map(
              (row) => `
              <tr>
                ${row.map((cell) => `<td>${cell}</td>`).join("")}
              </tr>
            `
            ).join("")}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="${headers.length - 1}" class="text-right"><strong>TOTAL AMOUNT</strong></td>
              <td class="text-right"><strong>₹ ${totalAmount.toFixed(2)}</strong></td>
            </tr>
          </tfoot>
        </table>
        
        <div class="amount-in-words">
          <strong>Amount in Words:</strong> Rupees ${Math.floor(totalAmount).toLocaleString()} Only
        </div>
        <div class="footer">
          <p>This is a computer generated invoice - No signature required</p>
          <p>For JAYA GLOBAL LOGISTICS</p>
          <p style="margin-top: 30px;">Authorized Signatory</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Get already generated LR numbers from saved reports
async function getGeneratedLRNumbers() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch("/api/saved-reports", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (data.success && data.data) {
      const lrNumbers = new Set();
      data.data.forEach((report) => {
        if (report.data && Array.isArray(report.data)) {
          report.data.forEach((item) => {
            if (item.lrNo) {
              lrNumbers.add(item.lrNo);
            }
          });
        }
      });
      return Array.from(lrNumbers);
    }
    return [];
  } catch (error) {
    console.error("Error fetching generated LR numbers:", error);
    return [];
  }
}

// ==================== PRODUCT WISE BILLING COMPONENT ====================
function ProductWiseBillingComponent({ branches, clients, plants, loadingBranches, loadingClients, loadingPlants }) {
  const [loading, setLoading] = useState(false);
  const [billData, setBillData] = useState([]);
  const [summary, setSummary] = useState({ totalWeight: 0, totalAmount: 0, totalRecords: 0 });
  const [selectedRows, setSelectedRows] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedLRs, setGeneratedLRs] = useState([]);

  const [filters, setFilters] = useState({
    branchId: "",
    clientId: "",
    clientName: "",
    clientGST: "",
    clientState: "",
    clientStateCode: "",
    clientAddress: "",
    clientCity: "",
    productCategories: "",
    plantId: "",
    orderType: "Sales",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const formatDate = (date) => date.toISOString().split("T")[0];
    setFilters((prev) => ({
      ...prev,
      startDate: formatDate(firstDayOfMonth),
      endDate: formatDate(lastDayOfMonth),
    }));
    loadGeneratedLRs();
  }, []);

  useEffect(() => {
    if (filters.clientId && filters.startDate && filters.endDate) {
      fetchData();
    }
  }, [filters.clientId, filters.branchId, filters.productCategories, filters.plantId, filters.orderType, filters.startDate, filters.endDate]);

  const loadGeneratedLRs = async () => {
    const lrs = await getGeneratedLRNumbers();
    setGeneratedLRs(lrs);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        type: "product-wise",
        branchId: filters.branchId,
        branchName: branches.find((b) => b._id === filters.branchId)?.name || "",
        clientId: filters.clientId,
        clientName: filters.clientName,
        productCategories: filters.productCategories,
        plantId: filters.plantId,
        plantCode: plants.find((p) => p._id === filters.plantId)?.code || "",
        orderType: filters.orderType,
        startDate: filters.startDate,
        endDate: filters.endDate,
        excludeLRs: generatedLRs,
      };

      const response = await fetch("/api/billing/product-wise", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.success) {
        const filteredData = (data.data || []).filter((item) => !generatedLRs.includes(item.lrNo));
        setBillData(filteredData);
        setSummary({
          totalWeight: filteredData.reduce((sum, item) => sum + (item.weight || 0), 0),
          totalAmount: filteredData.reduce((sum, item) => sum + (item.amount || 0), 0),
          totalRecords: filteredData.length,
        });
        setSelectedRows({});
        setSelectAll(false);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRow = (index) => {
    setSelectedRows((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows({});
    } else {
      const newSelected = {};
      billData.forEach((_, idx) => {
        newSelected[idx] = true;
      });
      setSelectedRows(newSelected);
    }
    setSelectAll(!selectAll);
  };

  const getSelectedData = () => billData.filter((_, idx) => selectedRows[idx]);

  const getSelectedSummary = () => {
    const selected = getSelectedData();
    const totalWeight = selected.reduce((sum, item) => sum + (item.weight || 0), 0);
    const totalAmount = selected.reduce((sum, item) => sum + (item.amount || 0), 0);
    return { totalWeight, totalAmount, totalRecords: selected.length };
  };

  const handleGenerateReport = async () => {
    const selected = getSelectedData();
    if (selected.length === 0) {
      alert("Please select at least one record to generate report");
      return;
    }
    setGenerating(true);
    const selectedSummary = getSelectedSummary();
    const reportData = {
      reportId: `RPT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "product-wise",
      filters: {
        clientName: filters.clientName,
        clientGST: filters.clientGST,
        clientState: filters.clientState,
        clientStateCode: filters.clientStateCode,
        clientAddress: filters.clientAddress,
        clientCity: filters.clientCity,
        branchName: branches.find((b) => b._id === filters.branchId)?.name || "N/A",
        startDate: filters.startDate,
        endDate: filters.endDate,
        orderType: filters.orderType,
        productCategories: filters.productCategories,
      },
      data: selected,
      summary: selectedSummary,
      totalRecords: billData.length,
      selectedRecords: selected.length,
    };
    await generateAndSaveReport(reportData, "product-wise", filters, async () => {
      await loadGeneratedLRs();
      await fetchData();
    });
    setGenerating(false);
  };

  const handleClientChange = (clientId) => {
    const selectedClient = clients.find((c) => c._id === clientId);
    setFilters((prev) => ({
      ...prev,
      clientId: clientId,
      clientName: selectedClient?.customerName || "",
      clientGST: selectedClient?.gstNumber || "",
      clientState: selectedClient?.state || "",
      clientStateCode: selectedClient?.stateCode || "",
      clientAddress: selectedClient?.address || "",
      clientCity: selectedClient?.city || "",
    }));
  };

  const selectedCount = Object.keys(selectedRows).filter((key) => selectedRows[key]).length;

  return (
    <Card title="Yara - Product-Wise Billing">
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 md:col-span-3">
          <ClientSelector value={filters.clientId} onChange={handleClientChange} clients={clients} loading={loadingClients} />
        </div>
        <div className="col-span-12 md:col-span-3">
          <BranchSelector value={filters.branchId} onChange={(val) => setFilters((prev) => ({ ...prev, branchId: val }))} branches={branches} loading={loadingBranches} />
        </div>
        <div className="col-span-12 md:col-span-2">
          <ProductCategorySelector value={filters.productCategories} onChange={(val) => setFilters((prev) => ({ ...prev, productCategories: val }))} />
        </div>
        <div className="col-span-12 md:col-span-2">
          <PlantCodeSelector value={filters.plantId} onChange={(val) => setFilters((prev) => ({ ...prev, plantId: val }))} plants={plants} loading={loadingPlants} />
        </div>
        <div className="col-span-12 md:col-span-2">
          <MonthSelector value={""} onChange={() => {}} />
        </div>
        <div className="col-span-12 md:col-span-2">
          <OrderTypeSelector value={filters.orderType} onChange={(val) => setFilters((prev) => ({ ...prev, orderType: val }))} />
        </div>
        <div className="col-span-12 md:col-span-2">
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
            className="rounded-xl border p-2 w-full"
          />
          <p className="text-xs mt-1">Start Date</p>
        </div>
        <div className="col-span-12 md:col-span-2">
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
            className="rounded-xl border p-2 w-full"
          />
          <p className="text-xs mt-1">End Date</p>
        </div>
      </div>

      {generatedLRs.length > 0 && (
        <div className="mt-3 p-2 bg-blue-50 rounded-lg text-xs text-blue-700">
          ℹ️ Already billed LR numbers: {generatedLRs.slice(0, 10).join(", ")}
          {generatedLRs.length > 10 ? ` and ${generatedLRs.length - 10} more` : ""}
        </div>
      )}

      {billData.length > 0 && (
        <div className="mt-4">
          <button
            onClick={handleGenerateReport}
            disabled={generating || selectedCount === 0}
            className={`bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition ${
              generating || selectedCount === 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {generating ? "Generating..." : `📄 Generate Bill (${selectedCount} Selected)`}
          </button>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
          <p>Loading...</p>
        </div>
      )}

      {!loading && billData.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <div className="mb-2 flex justify-between">
            <span>✅ {summary.totalRecords} records</span>
            <span className="text-blue-600">Selected: {selectedCount}</span>
          </div>
          <table className="min-w-full border">
            <thead className="bg-emerald-50">
              <tr>
                <th className="px-3 py-2 border w-10">
                  <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
                </th>
                <th className="px-3 py-2 border">S.No</th>
                <th className="px-3 py-2 border">Date</th>
                <th className="px-3 py-2 border">LR No</th>
                <th className="px-3 py-2 border">Vehicle No</th>
                <th className="px-3 py-2 border">From</th>
                <th className="px-3 py-2 border">To</th>
                <th className="px-3 py-2 border">Product</th>
                <th className="px-3 py-2 border text-right">Weight</th>
                <th className="px-3 py-2 border text-right">Rate</th>
                <th className="px-3 py-2 border text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {billData.map((item, idx) => (
                <tr key={idx} className={selectedRows[idx] ? "bg-blue-50" : ""}>
                  <td className="px-3 py-2 border text-center">
                    <input type="checkbox" checked={!!selectedRows[idx]} onChange={() => handleSelectRow(idx)} />
                  </td>
                  <td className="px-3 py-2 border">{idx + 1}</td>
                  <td className="px-3 py-2 border">{safeFormatDate(item.date)}</td>
                  <td className="px-3 py-2 border font-medium text-emerald-700">{item.lrNo || "-"}</td>
                  <td className="px-3 py-2 border">{item.vehicleNo || "-"}</td>
                  <td className="px-3 py-2 border">{item.from || "-"}</td>
                  <td className="px-3 py-2 border">{item.to || "-"}</td>
                  <td className="px-3 py-2 border">{item.productName || "-"}</td>
                  <td className="px-3 py-2 border text-right">{item.weight?.toFixed(2) || "0.00"}</td>
                  <td className="px-3 py-2 border text-right">{item.rate?.toFixed(2) || "0.00"}</td>
                  <td className="px-3 py-2 border text-right">₹ {item.amount?.toFixed(2) || "0.00"}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-emerald-100 font-bold">
              <tr>
                <td colSpan="8" className="px-3 py-2 border text-right">
                  TOTAL
                </td>
                <td className="px-3 py-2 border text-right">{summary.totalWeight.toFixed(2)}</td>
                <td className="px-3 py-2 border text-right"></td>
                <td className="px-3 py-2 border text-right">₹ {summary.totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {!loading && !filters.clientId && <div className="text-center py-8">Select a client to view data</div>}
      {!loading && filters.clientId && billData.length === 0 && (
        <div className="text-center py-8">
          <p>No pending records found</p>
          {generatedLRs.length > 0 && <p className="text-sm text-gray-500 mt-2">All LR numbers have been billed already</p>}
        </div>
      )}
    </Card>
  );
}

// ==================== GENERAL BILLING COMPONENT ====================
function GeneralBillingComponent({ branches, clients, loadingBranches, loadingClients }) {
  const [loading, setLoading] = useState(false);
  const [billData, setBillData] = useState([]);
  const [summary, setSummary] = useState({ totalWeight: 0, totalAmount: 0, totalRecords: 0 });
  const [selectedRows, setSelectedRows] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedLRs, setGeneratedLRs] = useState([]);

  const [filters, setFilters] = useState({
    branchId: "",
    clientId: "",
    clientName: "",
    clientGST: "",
    clientState: "",
    clientStateCode: "",
    clientAddress: "",
    clientCity: "",
    orderType: "Sales",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const formatDate = (date) => date.toISOString().split("T")[0];
    setFilters((prev) => ({ ...prev, startDate: formatDate(firstDayOfMonth), endDate: formatDate(lastDayOfMonth) }));
    loadGeneratedLRs();
  }, []);

  useEffect(() => {
    if (filters.clientId && filters.startDate && filters.endDate) fetchData();
  }, [filters.clientId, filters.branchId, filters.orderType, filters.startDate, filters.endDate]);

  const loadGeneratedLRs = async () => {
    const lrs = await getGeneratedLRNumbers();
    setGeneratedLRs(lrs);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        type: "general",
        branchId: filters.branchId,
        branchName: branches.find((b) => b._id === filters.branchId)?.name || "",
        clientId: filters.clientId,
        clientName: filters.clientName,
        orderType: filters.orderType,
        startDate: filters.startDate,
        endDate: filters.endDate,
        excludeLRs: generatedLRs,
      };
      const response = await fetch("/api/billing/general", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.success) {
        const filteredData = (data.data || []).filter((item) => !generatedLRs.includes(item.lrNo));
        setBillData(filteredData);
        setSummary({
          totalWeight: filteredData.reduce((s, i) => s + (i.weight || 0), 0),
          totalAmount: filteredData.reduce((s, i) => s + (i.amount || 0), 0),
          totalRecords: filteredData.length,
        });
        setSelectedRows({});
        setSelectAll(false);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRow = (index) => setSelectedRows((prev) => ({ ...prev, [index]: !prev[index] }));
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows({});
    } else {
      const newSelected = {};
      billData.forEach((_, idx) => (newSelected[idx] = true));
      setSelectedRows(newSelected);
    }
    setSelectAll(!selectAll);
  };
  const getSelectedData = () => billData.filter((_, idx) => selectedRows[idx]);
  const getSelectedSummary = () => {
    const selected = getSelectedData();
    return {
      totalWeight: selected.reduce((s, i) => s + (i.weight || 0), 0),
      totalAmount: selected.reduce((s, i) => s + (i.amount || 0), 0),
      totalRecords: selected.length,
    };
  };

  const handleClientChange = (clientId) => {
    const selectedClient = clients.find((c) => c._id === clientId);
    setFilters((prev) => ({
      ...prev,
      clientId: clientId,
      clientName: selectedClient?.customerName || "",
      clientGST: selectedClient?.gstNumber || "",
      clientState: selectedClient?.state || "",
      clientStateCode: selectedClient?.stateCode || "",
      clientAddress: selectedClient?.address || "",
      clientCity: selectedClient?.city || "",
    }));
  };

  const handleGenerateReport = async () => {
    const selected = getSelectedData();
    if (selected.length === 0) return alert("Please select at least one record to generate report");
    setGenerating(true);
    const selectedSummary = getSelectedSummary();
    const reportData = {
      reportId: `RPT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "general",
      filters: {
        clientName: filters.clientName,
        clientGST: filters.clientGST,
        clientState: filters.clientState,
        clientStateCode: filters.clientStateCode,
        clientAddress: filters.clientAddress,
        clientCity: filters.clientCity,
        branchName: branches.find((b) => b._id === filters.branchId)?.name || "N/A",
        startDate: filters.startDate,
        endDate: filters.endDate,
        orderType: filters.orderType,
      },
      data: selected,
      summary: selectedSummary,
      totalRecords: billData.length,
      selectedRecords: selected.length,
    };
    await generateAndSaveReport(reportData, "general", filters, async () => {
      await loadGeneratedLRs();
      await fetchData();
    });
    setGenerating(false);
  };

  const selectedCount = Object.keys(selectedRows).filter((k) => selectedRows[k]).length;

  return (
    <Card title="General - Billing">
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 md:col-span-3">
          <ClientSelector value={filters.clientId} onChange={handleClientChange} clients={clients} loading={loadingClients} />
        </div>
        <div className="col-span-12 md:col-span-3">
          <BranchSelector value={filters.branchId} onChange={(val) => setFilters((prev) => ({ ...prev, branchId: val }))} branches={branches} loading={loadingBranches} />
        </div>
        <div className="col-span-12 md:col-span-2">
          <MonthSelector value={""} onChange={() => {}} />
        </div>
        <div className="col-span-12 md:col-span-2">
          <OrderTypeSelector value={filters.orderType} onChange={(val) => setFilters((prev) => ({ ...prev, orderType: val }))} />
        </div>
        <div className="col-span-12 md:col-span-2">
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
            className="rounded-xl border p-2 w-full"
          />
          <p className="text-xs mt-1">Start Date</p>
        </div>
        <div className="col-span-12 md:col-span-2">
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
            className="rounded-xl border p-2 w-full"
          />
          <p className="text-xs mt-1">End Date</p>
        </div>
      </div>

      {generatedLRs.length > 0 && (
        <div className="mt-3 p-2 bg-blue-50 rounded-lg text-xs text-blue-700">
          ℹ️ Already billed LR numbers: {generatedLRs.slice(0, 10).join(", ")}
          {generatedLRs.length > 10 ? ` and ${generatedLRs.length - 10} more` : ""}
        </div>
      )}

      {billData.length > 0 && (
        <div className="mt-4">
          <button
            onClick={handleGenerateReport}
            disabled={generating || selectedCount === 0}
            className={`bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition ${
              generating || selectedCount === 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {generating ? "Generating..." : `📄 Generate Bill (${selectedCount} Selected)`}
          </button>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
          <p>Loading...</p>
        </div>
      )}

      {!loading && billData.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <div className="mb-2 flex justify-between">
            <span>✅ {summary.totalRecords} records</span>
            <span className="text-blue-600">Selected: {selectedCount}</span>
          </div>
          <table className="min-w-full border">
            <thead className="bg-emerald-50">
              <tr>
                <th className="px-3 py-2 border w-10">
                  <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
                </th>
                <th className="px-3 py-2 border">S.No</th>
                <th className="px-3 py-2 border">Date</th>
                <th className="px-3 py-2 border">LR No</th>
                <th className="px-3 py-2 border">Vehicle No</th>
                <th className="px-3 py-2 border">From</th>
                <th className="px-3 py-2 border">To</th>
                <th className="px-3 py-2 border">Product</th>
                <th className="px-3 py-2 border text-right">Weight</th>
                <th className="px-3 py-2 border text-right">Rate</th>
                <th className="px-3 py-2 border text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {billData.map((item, idx) => (
                <tr key={idx} className={selectedRows[idx] ? "bg-blue-50" : ""}>
                  <td className="px-3 py-2 border text-center">
                    <input type="checkbox" checked={!!selectedRows[idx]} onChange={() => handleSelectRow(idx)} />
                  </td>
                  <td className="px-3 py-2 border">{idx + 1}</td>
                  <td className="px-3 py-2 border">{safeFormatDate(item.date)}</td>
                  <td className="px-3 py-2 border font-medium text-emerald-700">{item.lrNo || "-"}</td>
                  <td className="px-3 py-2 border">{item.vehicleNo || "-"}</td>
                  <td className="px-3 py-2 border">{item.from || "-"}</td>
                  <td className="px-3 py-2 border">{item.to || "-"}</td>
                  <td className="px-3 py-2 border">{item.productName || "-"}</td>
                  <td className="px-3 py-2 border text-right">{item.weight?.toFixed(2) || "0.00"}</td>
                  <td className="px-3 py-2 border text-right">{item.rate?.toFixed(2) || "0.00"}</td>
                  <td className="px-3 py-2 border text-right">₹ {item.amount?.toFixed(2) || "0.00"}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-emerald-100 font-bold">
              <tr>
                <td colSpan="8" className="px-3 py-2 border text-right">
                  TOTAL
                </td>
                <td className="px-3 py-2 border text-right">{summary.totalWeight.toFixed(2)}</td>
                <td className="px-3 py-2 border text-right"></td>
                <td className="px-3 py-2 border text-right">₹ {summary.totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
      {!loading && !filters.clientId && <div className="text-center py-8">Select a client to view data</div>}
      {!loading && filters.clientId && billData.length === 0 && (
        <div className="text-center py-8">
          <p>No pending records found</p>
          {generatedLRs.length > 0 && <p className="text-sm text-gray-500 mt-2">All LR numbers have been billed already</p>}
        </div>
      )}
    </Card>
  );
}

// ==================== DETENTION BILLING COMPONENT ====================
function DetentionBillingComponent({ branches, clients, loadingBranches, loadingClients }) {
  const [loading, setLoading] = useState(false);
  const [billData, setBillData] = useState([]);
  const [summary, setSummary] = useState({ totalAmount: 0, totalRecords: 0 });
  const [selectedRows, setSelectedRows] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedLRs, setGeneratedLRs] = useState([]);

  const [filters, setFilters] = useState({
    branchId: "",
    clientId: "",
    clientName: "",
    clientGST: "",
    clientState: "",
    clientStateCode: "",
    clientAddress: "",
    clientCity: "",
    detention: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const formatDate = (date) => date.toISOString().split("T")[0];
    setFilters((prev) => ({ ...prev, startDate: formatDate(firstDayOfMonth), endDate: formatDate(lastDayOfMonth) }));
    loadGeneratedLRs();
  }, []);

  useEffect(() => {
    if (filters.clientId && filters.startDate && filters.endDate) fetchData();
  }, [filters.clientId, filters.branchId, filters.detention, filters.startDate, filters.endDate]);

  const loadGeneratedLRs = async () => {
    const lrs = await getGeneratedLRNumbers();
    setGeneratedLRs(lrs);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        type: "detention",
        branchId: filters.branchId,
        branchName: branches.find((b) => b._id === filters.branchId)?.name || "",
        clientId: filters.clientId,
        clientName: filters.clientName,
        detention: filters.detention,
        startDate: filters.startDate,
        endDate: filters.endDate,
        excludeLRs: generatedLRs,
      };
      const response = await fetch("/api/billing/detention", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.success) {
        const filteredData = (data.data || []).filter((item) => !generatedLRs.includes(item.lrNo));
        setBillData(filteredData);
        setSummary({
          totalAmount: filteredData.reduce((s, i) => s + (i.amount || 0), 0),
          totalRecords: filteredData.length,
        });
        setSelectedRows({});
        setSelectAll(false);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRow = (index) => setSelectedRows((prev) => ({ ...prev, [index]: !prev[index] }));
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows({});
    } else {
      const newSelected = {};
      billData.forEach((_, idx) => (newSelected[idx] = true));
      setSelectedRows(newSelected);
    }
    setSelectAll(!selectAll);
  };
  const getSelectedData = () => billData.filter((_, idx) => selectedRows[idx]);
  const getSelectedSummary = () => {
    const selected = getSelectedData();
    return {
      totalAmount: selected.reduce((s, i) => s + (i.amount || 0), 0),
      totalRecords: selected.length,
    };
  };

  const handleClientChange = (clientId) => {
    const selectedClient = clients.find((c) => c._id === clientId);
    setFilters((prev) => ({
      ...prev,
      clientId: clientId,
      clientName: selectedClient?.customerName || "",
      clientGST: selectedClient?.gstNumber || "",
      clientState: selectedClient?.state || "",
      clientStateCode: selectedClient?.stateCode || "",
      clientAddress: selectedClient?.address || "",
      clientCity: selectedClient?.city || "",
    }));
  };

  const handleGenerateReport = async () => {
    const selected = getSelectedData();
    if (selected.length === 0) return alert("Please select at least one record to generate report");
    setGenerating(true);
    const selectedSummary = getSelectedSummary();
    const reportData = {
      reportId: `RPT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "detention",
      filters: {
        clientName: filters.clientName,
        clientGST: filters.clientGST,
        clientState: filters.clientState,
        clientStateCode: filters.clientStateCode,
        clientAddress: filters.clientAddress,
        clientCity: filters.clientCity,
        branchName: branches.find((b) => b._id === filters.branchId)?.name || "N/A",
        startDate: filters.startDate,
        endDate: filters.endDate,
        detention: filters.detention,
      },
      data: selected,
      summary: selectedSummary,
      totalRecords: billData.length,
      selectedRecords: selected.length,
    };
    await generateAndSaveReport(reportData, "detention", filters, async () => {
      await loadGeneratedLRs();
      await fetchData();
    });
    setGenerating(false);
  };

  const selectedCount = Object.keys(selectedRows).filter((k) => selectedRows[k]).length;

  return (
    <Card title="Detention - Billing">
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 md:col-span-3">
          <ClientSelector value={filters.clientId} onChange={handleClientChange} clients={clients} loading={loadingClients} />
        </div>
        <div className="col-span-12 md:col-span-3">
          <BranchSelector value={filters.branchId} onChange={(val) => setFilters((prev) => ({ ...prev, branchId: val }))} branches={branches} loading={loadingBranches} />
        </div>
        <div className="col-span-12 md:col-span-2">
          <label className="block text-xs font-bold mb-1">Detention</label>
          <input
            type="text"
            value={filters.detention}
            onChange={(e) => setFilters((prev) => ({ ...prev, detention: e.target.value }))}
            className="rounded-xl border p-2 w-full"
            placeholder="Detention Type"
          />
        </div>
        <div className="col-span-12 md:col-span-2">
          <MonthSelector value={""} onChange={() => {}} />
        </div>
        <div className="col-span-12 md:col-span-2">
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
            className="rounded-xl border p-2 w-full"
          />
          <p className="text-xs mt-1">Start Date</p>
        </div>
        <div className="col-span-12 md:col-span-2">
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
            className="rounded-xl border p-2 w-full"
          />
          <p className="text-xs mt-1">End Date</p>
        </div>
      </div>

      {billData.length > 0 && (
        <div className="mt-4">
          <button
            onClick={handleGenerateReport}
            disabled={generating || selectedCount === 0}
            className={`bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition ${
              generating || selectedCount === 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {generating ? "Generating..." : `📄 Generate Bill (${selectedCount} Selected)`}
          </button>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
          <p>Loading...</p>
        </div>
      )}

      {!loading && billData.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <div className="mb-2 flex justify-between">
            <span>✅ {summary.totalRecords} records</span>
            <span className="text-blue-600">Selected: {selectedCount}</span>
          </div>
          <table className="min-w-full border">
            <thead className="bg-emerald-50">
              <tr>
                <th className="px-3 py-2 border w-10">
                  <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
                </th>
                <th className="px-3 py-2 border">S.No</th>
                <th className="px-3 py-2 border">Date</th>
                <th className="px-3 py-2 border">LR No</th>
                <th className="px-3 py-2 border">Vehicle No</th>
                <th className="px-3 py-2 border">From</th>
                <th className="px-3 py-2 border">To</th>
                <th className="px-3 py-2 border">Detention Type</th>
                <th className="px-3 py-2 border text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {billData.map((item, idx) => (
                <tr key={idx} className={selectedRows[idx] ? "bg-blue-50" : ""}>
                  <td className="px-3 py-2 border text-center">
                    <input type="checkbox" checked={!!selectedRows[idx]} onChange={() => handleSelectRow(idx)} />
                  </td>
                  <td className="px-3 py-2 border">{idx + 1}</td>
                  <td className="px-3 py-2 border">{safeFormatDate(item.date)}</td>
                  <td className="px-3 py-2 border font-medium text-emerald-700">{item.lrNo || "-"}</td>
                  <td className="px-3 py-2 border">{item.vehicleNo || "-"}</td>
                  <td className="px-3 py-2 border">{item.from || "-"}</td>
                  <td className="px-3 py-2 border">{item.to || "-"}</td>
                  <td className="px-3 py-2 border">{item.detentionType || filters.detention || "-"}</td>
                  <td className="px-3 py-2 border text-right">₹ {item.amount?.toFixed(2) || "0.00"}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-emerald-100 font-bold">
              <tr>
                <td colSpan="8" className="px-3 py-2 border text-right">
                  TOTAL
                </td>
                <td className="px-3 py-2 border text-right">₹ {summary.totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
      {!loading && !filters.clientId && <div className="text-center py-8">Select a client to view data</div>}
      {!loading && filters.clientId && billData.length === 0 && (
        <div className="text-center py-8">
          <p>No pending records found</p>
          {generatedLRs.length > 0 && <p className="text-sm text-gray-500 mt-2">All LR numbers have been billed already</p>}
        </div>
      )}
    </Card>
  );
}

// ==================== CANCELLATION BILLING COMPONENT ====================
function CancellationBillingComponent({ branches, clients, loadingBranches, loadingClients }) {
  const [loading, setLoading] = useState(false);
  const [billData, setBillData] = useState([]);
  const [summary, setSummary] = useState({ totalAmount: 0, totalRecords: 0 });
  const [selectedRows, setSelectedRows] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedLRs, setGeneratedLRs] = useState([]);

  const [filters, setFilters] = useState({
    branchId: "",
    clientId: "",
    clientName: "",
    clientGST: "",
    clientState: "",
    clientStateCode: "",
    clientAddress: "",
    clientCity: "",
    cancellation: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const formatDate = (date) => date.toISOString().split("T")[0];
    setFilters((prev) => ({ ...prev, startDate: formatDate(firstDayOfMonth), endDate: formatDate(lastDayOfMonth) }));
    loadGeneratedLRs();
  }, []);

  useEffect(() => {
    if (filters.clientId && filters.startDate && filters.endDate) fetchData();
  }, [filters.clientId, filters.branchId, filters.cancellation, filters.startDate, filters.endDate]);

  const loadGeneratedLRs = async () => {
    const lrs = await getGeneratedLRNumbers();
    setGeneratedLRs(lrs);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        type: "cancellation",
        branchId: filters.branchId,
        branchName: branches.find((b) => b._id === filters.branchId)?.name || "",
        clientId: filters.clientId,
        clientName: filters.clientName,
        cancellation: filters.cancellation,
        startDate: filters.startDate,
        endDate: filters.endDate,
        excludeLRs: generatedLRs,
      };
      const response = await fetch("/api/billing/cancellation", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.success) {
        const filteredData = (data.data || []).filter((item) => !generatedLRs.includes(item.lrNo));
        setBillData(filteredData);
        setSummary({
          totalAmount: filteredData.reduce((s, i) => s + (i.amount || 0), 0),
          totalRecords: filteredData.length,
        });
        setSelectedRows({});
        setSelectAll(false);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRow = (index) => setSelectedRows((prev) => ({ ...prev, [index]: !prev[index] }));
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows({});
    } else {
      const newSelected = {};
      billData.forEach((_, idx) => (newSelected[idx] = true));
      setSelectedRows(newSelected);
    }
    setSelectAll(!selectAll);
  };
  const getSelectedData = () => billData.filter((_, idx) => selectedRows[idx]);
  const getSelectedSummary = () => {
    const selected = getSelectedData();
    return {
      totalAmount: selected.reduce((s, i) => s + (i.amount || 0), 0),
      totalRecords: selected.length,
    };
  };

  const handleClientChange = (clientId) => {
    const selectedClient = clients.find((c) => c._id === clientId);
    setFilters((prev) => ({
      ...prev,
      clientId: clientId,
      clientName: selectedClient?.customerName || "",
      clientGST: selectedClient?.gstNumber || "",
      clientState: selectedClient?.state || "",
      clientStateCode: selectedClient?.stateCode || "",
      clientAddress: selectedClient?.address || "",
      clientCity: selectedClient?.city || "",
    }));
  };

  const handleGenerateReport = async () => {
    const selected = getSelectedData();
    if (selected.length === 0) return alert("Please select at least one record to generate report");
    setGenerating(true);
    const selectedSummary = getSelectedSummary();
    const reportData = {
      reportId: `RPT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "cancellation",
      filters: {
        clientName: filters.clientName,
        clientGST: filters.clientGST,
        clientState: filters.clientState,
        clientStateCode: filters.clientStateCode,
        clientAddress: filters.clientAddress,
        clientCity: filters.clientCity,
        branchName: branches.find((b) => b._id === filters.branchId)?.name || "N/A",
        startDate: filters.startDate,
        endDate: filters.endDate,
        cancellation: filters.cancellation,
      },
      data: selected,
      summary: selectedSummary,
      totalRecords: billData.length,
      selectedRecords: selected.length,
    };
    await generateAndSaveReport(reportData, "cancellation", filters, async () => {
      await loadGeneratedLRs();
      await fetchData();
    });
    setGenerating(false);
  };

  const selectedCount = Object.keys(selectedRows).filter((k) => selectedRows[k]).length;

  return (
    <Card title="Cancellation - Billing">
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 md:col-span-3">
          <ClientSelector value={filters.clientId} onChange={handleClientChange} clients={clients} loading={loadingClients} />
        </div>
        <div className="col-span-12 md:col-span-3">
          <BranchSelector value={filters.branchId} onChange={(val) => setFilters((prev) => ({ ...prev, branchId: val }))} branches={branches} loading={loadingBranches} />
        </div>
        <div className="col-span-12 md:col-span-2">
          <label className="block text-xs font-bold mb-1">Cancellation</label>
          <input
            type="text"
            value={filters.cancellation}
            onChange={(e) => setFilters((prev) => ({ ...prev, cancellation: e.target.value }))}
            className="rounded-xl border p-2 w-full"
            placeholder="Cancellation Type"
          />
        </div>
        <div className="col-span-12 md:col-span-2">
          <MonthSelector value={""} onChange={() => {}} />
        </div>
        <div className="col-span-12 md:col-span-2">
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
            className="rounded-xl border p-2 w-full"
          />
          <p className="text-xs mt-1">Start Date</p>
        </div>
        <div className="col-span-12 md:col-span-2">
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
            className="rounded-xl border p-2 w-full"
          />
          <p className="text-xs mt-1">End Date</p>
        </div>
      </div>

      {billData.length > 0 && (
        <div className="mt-4">
          <button
            onClick={handleGenerateReport}
            disabled={generating || selectedCount === 0}
            className={`bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition ${
              generating || selectedCount === 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {generating ? "Generating..." : `📄 Generate Bill (${selectedCount} Selected)`}
          </button>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
          <p>Loading...</p>
        </div>
      )}

      {!loading && billData.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <div className="mb-2 flex justify-between">
            <span>✅ {summary.totalRecords} records</span>
            <span className="text-blue-600">Selected: {selectedCount}</span>
          </div>
          <table className="min-w-full border">
            <thead className="bg-emerald-50">
              <tr>
                <th className="px-3 py-2 border w-10">
                  <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
                </th>
                <th className="px-3 py-2 border">S.No</th>
                <th className="px-3 py-2 border">Date</th>
                <th className="px-3 py-2 border">LR No</th>
                <th className="px-3 py-2 border">Vehicle No</th>
                <th className="px-3 py-2 border">From</th>
                <th className="px-3 py-2 border">To</th>
                <th className="px-3 py-2 border">Cancellation Type</th>
                <th className="px-3 py-2 border text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {billData.map((item, idx) => (
                <tr key={idx} className={selectedRows[idx] ? "bg-blue-50" : ""}>
                  <td className="px-3 py-2 border text-center">
                    <input type="checkbox" checked={!!selectedRows[idx]} onChange={() => handleSelectRow(idx)} />
                  </td>
                  <td className="px-3 py-2 border">{idx + 1}</td>
                  <td className="px-3 py-2 border">{safeFormatDate(item.date)}</td>
                  <td className="px-3 py-2 border font-medium text-emerald-700">{item.lrNo || "-"}</td>
                  <td className="px-3 py-2 border">{item.vehicleNo || "-"}</td>
                  <td className="px-3 py-2 border">{item.from || "-"}</td>
                  <td className="px-3 py-2 border">{item.to || "-"}</td>
                  <td className="px-3 py-2 border">{item.cancellationType || filters.cancellation || "-"}</td>
                  <td className="px-3 py-2 border text-right">₹ {item.amount?.toFixed(2) || "0.00"}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-emerald-100 font-bold">
              <tr>
                <td colSpan="8" className="px-3 py-2 border text-right">
                  TOTAL
                </td>
                <td className="px-3 py-2 border text-right">₹ {summary.totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
      {!loading && !filters.clientId && <div className="text-center py-8">Select a client to view data</div>}
      {!loading && filters.clientId && billData.length === 0 && (
        <div className="text-center py-8">
          <p>No pending records found</p>
          {generatedLRs.length > 0 && <p className="text-sm text-gray-500 mt-2">All LR numbers have been billed already</p>}
        </div>
      )}
    </Card>
  );
}

// ==================== OTHER BILLING COMPONENT ====================
function OtherBillingComponent({ branches, clients, loadingBranches, loadingClients }) {
  const [loading, setLoading] = useState(false);
  const [billData, setBillData] = useState([]);
  const [summary, setSummary] = useState({ totalAmount: 0, totalRecords: 0 });
  const [selectedRows, setSelectedRows] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedLRs, setGeneratedLRs] = useState([]);

  const [filters, setFilters] = useState({
    branchId: "",
    clientId: "",
    clientName: "",
    clientGST: "",
    clientState: "",
    clientStateCode: "",
    clientAddress: "",
    clientCity: "",
    type: "Cancellation",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const formatDate = (date) => date.toISOString().split("T")[0];
    setFilters((prev) => ({ ...prev, startDate: formatDate(firstDayOfMonth), endDate: formatDate(lastDayOfMonth) }));
    loadGeneratedLRs();
  }, []);

  useEffect(() => {
    if (filters.clientId && filters.startDate && filters.endDate) fetchData();
  }, [filters.clientId, filters.branchId, filters.type, filters.startDate, filters.endDate]);

  const loadGeneratedLRs = async () => {
    const lrs = await getGeneratedLRNumbers();
    setGeneratedLRs(lrs);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        type: "other",
        branchId: filters.branchId,
        branchName: branches.find((b) => b._id === filters.branchId)?.name || "",
        clientId: filters.clientId,
        clientName: filters.clientName,
        billingType: filters.type,
        startDate: filters.startDate,
        endDate: filters.endDate,
        excludeLRs: generatedLRs,
      };
      const response = await fetch("/api/billing/other", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.success) {
        const filteredData = (data.data || []).filter((item) => !generatedLRs.includes(item.lrNo));
        setBillData(filteredData);
        setSummary({
          totalAmount: filteredData.reduce((s, i) => s + (i.amount || 0), 0),
          totalRecords: filteredData.length,
        });
        setSelectedRows({});
        setSelectAll(false);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRow = (index) => setSelectedRows((prev) => ({ ...prev, [index]: !prev[index] }));
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows({});
    } else {
      const newSelected = {};
      billData.forEach((_, idx) => (newSelected[idx] = true));
      setSelectedRows(newSelected);
    }
    setSelectAll(!selectAll);
  };
  const getSelectedData = () => billData.filter((_, idx) => selectedRows[idx]);
  const getSelectedSummary = () => {
    const selected = getSelectedData();
    return {
      totalAmount: selected.reduce((s, i) => s + (i.amount || 0), 0),
      totalRecords: selected.length,
    };
  };

  const handleClientChange = (clientId) => {
    const selectedClient = clients.find((c) => c._id === clientId);
    setFilters((prev) => ({
      ...prev,
      clientId: clientId,
      clientName: selectedClient?.customerName || "",
      clientGST: selectedClient?.gstNumber || "",
      clientState: selectedClient?.state || "",
      clientStateCode: selectedClient?.stateCode || "",
      clientAddress: selectedClient?.address || "",
      clientCity: selectedClient?.city || "",
    }));
  };

  const handleGenerateReport = async () => {
    const selected = getSelectedData();
    if (selected.length === 0) return alert("Please select at least one record to generate report");
    setGenerating(true);
    const selectedSummary = getSelectedSummary();
    const reportData = {
      reportId: `RPT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "other",
      filters: {
        clientName: filters.clientName,
        clientGST: filters.clientGST,
        clientState: filters.clientState,
        clientStateCode: filters.clientStateCode,
        clientAddress: filters.clientAddress,
        clientCity: filters.clientCity,
        branchName: branches.find((b) => b._id === filters.branchId)?.name || "N/A",
        startDate: filters.startDate,
        endDate: filters.endDate,
        billingType: filters.type,
      },
      data: selected,
      summary: selectedSummary,
      totalRecords: billData.length,
      selectedRecords: selected.length,
    };
    await generateAndSaveReport(reportData, "other", filters, async () => {
      await loadGeneratedLRs();
      await fetchData();
    });
    setGenerating(false);
  };

  const selectedCount = Object.keys(selectedRows).filter((k) => selectedRows[k]).length;

  return (
    <Card title="Other - Billing">
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 md:col-span-3">
          <ClientSelector value={filters.clientId} onChange={handleClientChange} clients={clients} loading={loadingClients} />
        </div>
        <div className="col-span-12 md:col-span-3">
          <BranchSelector value={filters.branchId} onChange={(val) => setFilters((prev) => ({ ...prev, branchId: val }))} branches={branches} loading={loadingBranches} />
        </div>
        <div className="col-span-12 md:col-span-2">
          <label className="block text-xs font-bold mb-1">Type</label>
          <select
            value={filters.type}
            onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
            className="rounded-xl border p-2 w-full"
          >
            <option value="Cancellation">Cancellation</option>
            <option value="Detention">Detention</option>
            <option value="Demurrage">Demurrage</option>
            <option value="Other Charges">Other Charges</option>
          </select>
        </div>
        <div className="col-span-12 md:col-span-2">
          <MonthSelector value={""} onChange={() => {}} />
        </div>
        <div className="col-span-12 md:col-span-2">
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
            className="rounded-xl border p-2 w-full"
          />
          <p className="text-xs mt-1">Start Date</p>
        </div>
        <div className="col-span-12 md:col-span-2">
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
            className="rounded-xl border p-2 w-full"
          />
          <p className="text-xs mt-1">End Date</p>
        </div>
      </div>

      {billData.length > 0 && (
        <div className="mt-4">
          <button
            onClick={handleGenerateReport}
            disabled={generating || selectedCount === 0}
            className={`bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition ${
              generating || selectedCount === 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {generating ? "Generating..." : `📄 Generate Bill (${selectedCount} Selected)`}
          </button>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
          <p>Loading...</p>
        </div>
      )}

      {!loading && billData.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <div className="mb-2 flex justify-between">
            <span>✅ {summary.totalRecords} records</span>
            <span className="text-blue-600">Selected: {selectedCount}</span>
          </div>
          <table className="min-w-full border">
            <thead className="bg-emerald-50">
              <tr>
                <th className="px-3 py-2 border w-10">
                  <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
                </th>
                <th className="px-3 py-2 border">S.No</th>
                <th className="px-3 py-2 border">Date</th>
                <th className="px-3 py-2 border">LR No</th>
                <th className="px-3 py-2 border">Vehicle No</th>
                <th className="px-3 py-2 border">From</th>
                <th className="px-3 py-2 border">To</th>
                <th className="px-3 py-2 border">Bill Type</th>
                <th className="px-3 py-2 border text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {billData.map((item, idx) => (
                <tr key={idx} className={selectedRows[idx] ? "bg-blue-50" : ""}>
                  <td className="px-3 py-2 border text-center">
                    <input type="checkbox" checked={!!selectedRows[idx]} onChange={() => handleSelectRow(idx)} />
                  </td>
                  <td className="px-3 py-2 border">{idx + 1}</td>
                  <td className="px-3 py-2 border">{safeFormatDate(item.date)}</td>
                  <td className="px-3 py-2 border font-medium text-emerald-700">{item.lrNo || "-"}</td>
                  <td className="px-3 py-2 border">{item.vehicleNo || "-"}</td>
                  <td className="px-3 py-2 border">{item.from || "-"}</td>
                  <td className="px-3 py-2 border">{item.to || "-"}</td>
                  <td className="px-3 py-2 border">{item.billingType || filters.type || "-"}</td>
                  <td className="px-3 py-2 border text-right">₹ {item.amount?.toFixed(2) || "0.00"}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-emerald-100 font-bold">
              <tr>
                <td colSpan="8" className="px-3 py-2 border text-right">
                  TOTAL
                </td>
                <td className="px-3 py-2 border text-right">₹ {summary.totalAmount.toFixed(2)}</td>
                </tr>
                            </tfoot>
            <tfoot className="bg-emerald-100 font-bold">
              <tr>
                <td colSpan="8" className="px-3 py-2 border text-right">
                  TOTAL
                </td>
                <td className="px-3 py-2 border text-right">₹ {summary.totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
      {!loading && !filters.clientId && <div className="text-center py-8">Select a client to view data</div>}
      {!loading && filters.clientId && billData.length === 0 && (
        <div className="text-center py-8">
          <p>No pending records found</p>
          {generatedLRs.length > 0 && <p className="text-sm text-gray-500 mt-2">All LR numbers have been billed already</p>}
        </div>
      )}
    </Card>
  );
}

// ==================== MAIN BILLING PAGE ====================
export default function BillingPage() {
  const router = useRouter();
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingPlants, setLoadingPlants] = useState(false);
  const [selectedBillingType, setSelectedBillingType] = useState("");
  const [branches, setBranches] = useState([]);
  const [clients, setClients] = useState([]);
  const [plants, setPlants] = useState([]);
  
  const fetchBranches = async () => {
    setLoadingBranches(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/branches', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) setBranches(data.data);
    } catch (error) { console.error(error); } finally { setLoadingBranches(false); }
  };
  
  const fetchClients = async () => {
    setLoadingClients(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/customers', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) setClients(data.data);
    } catch (error) { console.error(error); } finally { setLoadingClients(false); }
  };
  
  const fetchPlants = async () => {
    setLoadingPlants(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/plants', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) setPlants(data.data);
    } catch (error) { console.error(error); } finally { setLoadingPlants(false); }
  };
  
  useEffect(() => { fetchBranches(); fetchClients(); fetchPlants(); }, []);
  
  const renderSelectedBillingCard = () => {
    switch(selectedBillingType) {
      case "product-wise": 
        return <ProductWiseBillingComponent branches={branches} clients={clients} plants={plants} loadingBranches={loadingBranches} loadingClients={loadingClients} loadingPlants={loadingPlants} />;
      case "general": 
        return <GeneralBillingComponent branches={branches} clients={clients} loadingBranches={loadingBranches} loadingClients={loadingClients} />;
      case "detention": 
        return <DetentionBillingComponent branches={branches} clients={clients} loadingBranches={loadingBranches} loadingClients={loadingClients} />;
      case "cancellation": 
        return <CancellationBillingComponent branches={branches} clients={clients} loadingBranches={loadingBranches} loadingClients={loadingClients} />;
      case "other": 
        return <OtherBillingComponent branches={branches} clients={clients} loadingBranches={loadingBranches} loadingClients={loadingClients} />;
      default: 
        return (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-slate-500 text-lg">Please select a billing type from the dropdown above</p>
            <p className="text-slate-400 text-sm mt-2">Choose Yara Product-Wise, General, Detention, Cancellation, or Other Billing</p>
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
        <BillingTypeSelector value={selectedBillingType} onChange={setSelectedBillingType} />
        {renderSelectedBillingCard()}
      </div>
    </div>
  );
}