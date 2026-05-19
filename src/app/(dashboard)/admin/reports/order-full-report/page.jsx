// // /app/admin/reports/order-full-report/page.js
// 'use client';

// import { useState, useEffect, useCallback } from 'react';
// import { useRouter } from 'next/navigation';

// export default function OrderFullReport() {
//   const router = useRouter();
//   const [reportData, setReportData] = useState([]);
//   const [summary, setSummary] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [filters, setFilters] = useState({
//     orderNo: '',
//     fromDate: '',
//     toDate: '',
//     partyName: '',
//     podStatus: '',
//     orderStatus: ''
//   });
  
//   const fetchReport = useCallback(async () => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem('token');
//       const params = new URLSearchParams();
//       if (filters.orderNo) params.append('orderNo', filters.orderNo);
//       if (filters.fromDate) params.append('fromDate', filters.fromDate);
//       if (filters.toDate) params.append('toDate', filters.toDate);
//       if (filters.partyName) params.append('partyName', filters.partyName);
//       if (filters.podStatus) params.append('podStatus', filters.podStatus);
//       if (filters.orderStatus) params.append('orderStatus', filters.orderStatus);
      
//       const res = await fetch(`/api/reports/order-full-report?${params.toString()}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       const data = await res.json();
      
//       if (data.success) {
//         setReportData(data.data);
//         setSummary(data.summary);
//       } else {
//         console.error('Error:', data.message);
//       }
//     } catch (error) {
//       console.error('Error fetching report:', error);
//     } finally {
//       setLoading(false);
//     }
//   }, [filters]);
  
//   useEffect(() => {
//     fetchReport();
//   }, [fetchReport]);
  
//   const handleFilterChange = (field, value) => {
//     setFilters(prev => ({ ...prev, [field]: value }));
//   };
  
//   const handleSearch = () => {
//     fetchReport();
//   };
  
//   const handleReset = () => {
//     setFilters({
//       orderNo: '',
//       fromDate: '',
//       toDate: '',
//       partyName: '',
//       podStatus: '',
//       orderStatus: ''
//     });
//   };
  
//   const exportToCSV = () => {
//     const headers = [
//       'Party Name', 'Company', 'Vendor Name', 'Order No', 'Order Received Date',
//       'Order Placed', 'Order Age (days)', 'Location (To)', 'Weight (MT)',
//       'Other Charges', 'Total Amount', 'LR No', 'Invoice No', 'Vehicle Placed Date',
//       'Vehicle Left Warehouse', 'Adv Amount', 'Status (Ad amt)', 'Additional Charges',
//       'Balance', 'Status (Balance)', 'POD Status', 'POD Remark', 'Order Status'
//     ];
    
//     const csvRows = [headers];
    
//     reportData.forEach(item => {
//       csvRows.push([
//         `"${item.partyName}"`,
//         `"${item.company}"`,
//         `"${item.vendorName}"`,
//         `"${item.orderNo}"`,
//         item.orderReceivedDate,
//         item.orderPlaced,
//         item.orderAgeDays,
//         `"${item.locationTo}"`,
//         item.weightMT,
//         item.otherCharges,
//         item.totalAmount,
//         `"${item.lrNo}"`,
//         `"${item.invoiceNo}"`,
//         item.vehiclePlacedDate,
//         item.vehicleLeftWarehouse,
//         item.advAmount,
//         `"${item.statusAdAmt}"`,
//         item.additionalCharges,
//         item.balance,
//         `"${item.statusBalance}"`,
//         `"${item.podStatus}"`,
//         `"${item.podRemark}"`,
//         `"${item.orderStatus}"`
//       ]);
//     });
    
//     const csvContent = csvRows.map(row => row.join(',')).join('\n');
//     const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `order_report_${new Date().toISOString().split('T')[0]}.csv`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };
  
//   const getStatusBadge = (status) => {
//     const colors = {
//       'Pending': 'bg-yellow-100 text-yellow-800',
//       'Partial': 'bg-orange-100 text-orange-800',
//       'Completed': 'bg-green-100 text-green-800',
//       'Cleared': 'bg-green-100 text-green-800',
//       'Received': 'bg-blue-100 text-blue-800',
//       'Rejected': 'bg-red-100 text-red-800',
//       'Draft': 'bg-gray-100 text-gray-800',
//       'Submitted': 'bg-purple-100 text-purple-800',
//       'Approved': 'bg-teal-100 text-teal-800',
//       'Cancelled': 'bg-red-100 text-red-800'
//     };
//     return colors[status] || 'bg-gray-100 text-gray-800';
//   };
  
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
//       {/* Header */}
//       <div className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
//         <div className="mx-auto max-w-full px-4 py-3">
//           <button
//             onClick={() => router.push('/admin/dashboard')}
//             className="text-sky-600 hover:text-sky-800 font-medium text-sm flex items-center gap-1 mb-2"
//           >
//             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//             </svg>
//             Back to Dashboard
//           </button>
//           <div className="flex justify-between items-center">
//             <div>
//               <h1 className="text-2xl font-bold text-slate-900">Order Full Report</h1>
//               <p className="text-sm text-slate-500 mt-1">Complete order lifecycle report with LR, POD, and payment status</p>
//             </div>
//             <button
//               onClick={exportToCSV}
//               disabled={reportData.length === 0}
//               className={`rounded-xl px-4 py-2 text-sm font-bold transition flex items-center gap-2 ${
//                 reportData.length === 0 
//                   ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
//                   : 'bg-emerald-600 hover:bg-emerald-700 text-white'
//               }`}
//             >
//               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
//               </svg>
//               Export to CSV
//             </button>
//           </div>
//         </div>
//       </div>
      
//       <div className="mx-auto max-w-full p-4">
//         {/* Summary Cards */}
//         {summary && (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
//             <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
//               <div className="text-sm text-slate-500">Total Orders</div>
//               <div className="text-2xl font-bold text-slate-900">{summary.totalOrders}</div>
//             </div>
//             <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
//               <div className="text-sm text-slate-500">Total Weight (MT)</div>
//               <div className="text-2xl font-bold text-slate-900">{summary.totalWeight.toFixed(2)}</div>
//             </div>
//             <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
//               <div className="text-sm text-slate-500">Total Amount (₹)</div>
//               <div className="text-2xl font-bold text-emerald-600">₹{summary.totalAmount.toLocaleString('en-IN')}</div>
//             </div>
//             <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
//               <div className="text-sm text-slate-500">Total Advance (₹)</div>
//               <div className="text-2xl font-bold text-blue-600">₹{summary.totalAdvAmount.toLocaleString('en-IN')}</div>
//             </div>
//             <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
//               <div className="text-sm text-slate-500">Total Balance (₹)</div>
//               <div className="text-2xl font-bold text-orange-600">₹{summary.totalBalance.toLocaleString('en-IN')}</div>
//             </div>
//           </div>
//         )}
        
//         {/* Filters */}
//         <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
//           <div className="border-b border-slate-100 px-4 py-3">
//             <h2 className="text-sm font-bold text-slate-900">Filters</h2>
//           </div>
//           <div className="p-4">
//             <div className="grid grid-cols-12 gap-3">
//               <div className="col-span-12 md:col-span-3">
//                 <label className="text-xs font-bold text-slate-600">Order No</label>
//                 <input
//                   type="text"
//                   value={filters.orderNo}
//                   onChange={(e) => handleFilterChange('orderNo', e.target.value)}
//                   className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
//                   placeholder="Search by order number..."
//                 />
//               </div>
//               <div className="col-span-12 md:col-span-2">
//                 <label className="text-xs font-bold text-slate-600">From Date</label>
//                 <input
//                   type="date"
//                   value={filters.fromDate}
//                   onChange={(e) => handleFilterChange('fromDate', e.target.value)}
//                   className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
//                 />
//               </div>
//               <div className="col-span-12 md:col-span-2">
//                 <label className="text-xs font-bold text-slate-600">To Date</label>
//                 <input
//                   type="date"
//                   value={filters.toDate}
//                   onChange={(e) => handleFilterChange('toDate', e.target.value)}
//                   className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
//                 />
//               </div>
//               <div className="col-span-12 md:col-span-2">
//                 <label className="text-xs font-bold text-slate-600">Party Name</label>
//                 <input
//                   type="text"
//                   value={filters.partyName}
//                   onChange={(e) => handleFilterChange('partyName', e.target.value)}
//                   className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
//                   placeholder="Party name..."
//                 />
//               </div>
//               <div className="col-span-12 md:col-span-2">
//                 <label className="text-xs font-bold text-slate-600">POD Status</label>
//                 <select
//                   value={filters.podStatus}
//                   onChange={(e) => handleFilterChange('podStatus', e.target.value)}
//                   className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
//                 >
//                   <option value="">All</option>
//                   <option value="Pending">Pending</option>
//                   <option value="Received">Received</option>
//                   <option value="Partial">Partial</option>
//                   <option value="Rejected">Rejected</option>
//                 </select>
//               </div>
//               <div className="col-span-12 md:col-span-2">
//                 <label className="text-xs font-bold text-slate-600">Order Status</label>
//                 <select
//                   value={filters.orderStatus}
//                   onChange={(e) => handleFilterChange('orderStatus', e.target.value)}
//                   className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
//                 >
//                   <option value="">All</option>
//                   <option value="Draft">Draft</option>
//                   <option value="Submitted">Submitted</option>
//                   <option value="Approved">Approved</option>
//                   <option value="Completed">Completed</option>
//                   <option value="Cancelled">Cancelled</option>
//                 </select>
//               </div>
//             </div>
//             <div className="flex justify-end gap-2 mt-4">
//               <button
//                 onClick={handleReset}
//                 className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
//               >
//                 Reset
//               </button>
//               <button
//                 onClick={handleSearch}
//                 className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-bold text-white hover:bg-sky-700 transition"
//               >
//                 Search
//               </button>
//             </div>
//           </div>
//         </div>
        
//         {/* Report Table */}
//         <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
//           <div className="border-b border-slate-100 px-4 py-3 flex justify-between items-center">
//             <h2 className="text-sm font-bold text-slate-900">Order Details</h2>
//             <div className="text-xs text-slate-500">
//               {loading ? 'Loading...' : `${reportData.length} orders found`}
//             </div>
//           </div>
          
//           {loading ? (
//             <div className="flex justify-center items-center py-20">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
//             </div>
//           ) : reportData.length === 0 ? (
//             <div className="text-center py-20 text-slate-400">
//               <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//               </svg>
//               <p>No orders found matching the criteria</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="min-w-max w-full text-sm">
//                 <thead className="sticky top-0 bg-slate-100 z-10">
//                   <tr>
//                     <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-bold text-slate-700">Party Name</th>
//                     <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-bold text-slate-700">Company</th>
//                     <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-bold text-slate-700">Vendor Name</th>
//                     <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-bold text-slate-700">Order No</th>
//                     <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-bold text-slate-700">Order Received Date</th>
//                     <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-bold text-slate-700">Order Placed</th>
//                     <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-bold text-slate-700">Order Age (days)</th>
//                     <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-bold text-slate-700">Location (To)</th>
//                     <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-bold text-slate-700">Weight (MT)</th>
//                     <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-bold text-slate-700">Other Charges</th>
//                     <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-bold text-slate-700">Total Amount</th>
//                     <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-bold text-slate-700">LR No</th>
//                     <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-bold text-slate-700">Invoice No</th>
//                     <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-bold text-slate-700">Vehicle Placed Date</th>
//                     <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-bold text-slate-700">Vehicle Left Warehouse</th>
//                     <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-bold text-slate-700">Adv Amount</th>
//                     <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-bold text-slate-700">Status (Ad amt)</th>
//                     <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-bold text-slate-700">Additional Charges</th>
//                     <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-bold text-slate-700">Balance</th>
//                     <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-bold text-slate-700">Status (Balance)</th>
//                     <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-bold text-slate-700">POD Status</th>
//                     <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-bold text-slate-700">POD Remark</th>
//                     <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-bold text-slate-700">Order Status</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {reportData.map((row, idx) => (
//                     <tr key={idx} className="hover:bg-slate-50 transition-colors">
//                       <td className="border-b border-slate-100 px-3 py-2 text-slate-700">{row.partyName}</td>
//                       <td className="border-b border-slate-100 px-3 py-2 text-slate-700">{row.company}</td>
//                       <td className="border-b border-slate-100 px-3 py-2 text-slate-700">{row.vendorName}</td>
//                       <td className="border-b border-slate-100 px-3 py-2 font-mono text-xs font-bold text-sky-600">{row.orderNo}</td>
//                       <td className="border-b border-slate-100 px-3 py-2 text-slate-700">{row.orderReceivedDate}</td>
//                       <td className="border-b border-slate-100 px-3 py-2 text-slate-700">{row.orderPlaced}</td>
//                       <td className="border-b border-slate-100 px-3 py-2 text-center">
//                         <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
//                           row.orderAgeDays > 30 ? 'bg-red-100 text-red-800' : 
//                           row.orderAgeDays > 15 ? 'bg-orange-100 text-orange-800' : 
//                           'bg-green-100 text-green-800'
//                         }`}>
//                           {row.orderAgeDays} days
//                         </span>
//                       </td>
//                       <td className="border-b border-slate-100 px-3 py-2 text-slate-700 max-w-[150px] truncate" title={row.locationTo}>{row.locationTo}</td>
//                       <td className="border-b border-slate-100 px-3 py-2 text-right text-slate-700">{row.weightMT.toFixed(2)}</td>
//                       <td className="border-b border-slate-100 px-3 py-2 text-right text-slate-700">₹{row.otherCharges.toLocaleString('en-IN')}</td>
//                       <td className="border-b border-slate-100 px-3 py-2 text-right font-semibold text-emerald-600">₹{row.totalAmount.toLocaleString('en-IN')}</td>
//                       <td className="border-b border-slate-100 px-3 py-2 font-mono text-xs text-slate-600">{row.lrNo}</td>
//                       <td className="border-b border-slate-100 px-3 py-2 font-mono text-xs text-slate-600">{row.invoiceNo}</td>
//                       <td className="border-b border-slate-100 px-3 py-2 text-slate-700">{row.vehiclePlacedDate || '-'}</td>
//                       <td className="border-b border-slate-100 px-3 py-2 text-slate-700">{row.vehicleLeftWarehouse || '-'}</td>
//                       <td className="border-b border-slate-100 px-3 py-2 text-right text-blue-600">₹{row.advAmount.toLocaleString('en-IN')}</td>
//                       <td className="border-b border-slate-100 px-3 py-2">
//                         <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(row.statusAdAmt)}`}>
//                           {row.statusAdAmt}
//                         </span>
//                       </td>
//                       <td className="border-b border-slate-100 px-3 py-2 text-right text-orange-600">₹{row.additionalCharges.toLocaleString('en-IN')}</td>
//                       <td className="border-b border-slate-100 px-3 py-2 text-right font-semibold">₹{row.balance.toLocaleString('en-IN')}</td>
//                       <td className="border-b border-slate-100 px-3 py-2">
//                         <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(row.statusBalance)}`}>
//                           {row.statusBalance}
//                         </span>
//                       </td>
//                       <td className="border-b border-slate-100 px-3 py-2">
//                         <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(row.podStatus)}`}>
//                           {row.podStatus}
//                         </span>
//                       </td>
//                       <td className="border-b border-slate-100 px-3 py-2 text-slate-500 max-w-[200px] truncate" title={row.podRemark}>{row.podRemark || '-'}</td>
//                       <td className="border-b border-slate-100 px-3 py-2">
//                         <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(row.orderStatus)}`}>
//                           {row.orderStatus}
//                         </span>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// /app/admin/reports/order-full-report/page.js
'use client';

import { useState, useEffect, useMemo } from 'react';

export default function OrderFullReport() {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [podStatusFilter, setPodStatusFilter] = useState("all");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/reports/order-full-report', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (data.success && Array.isArray(data.data)) {
        setReportData(data.data);
        setSummary(data.summary);
      } else {
        setReportData([]);
        setError(data.message || 'No data found');
      }
    } catch (err) {
      console.error('Error fetching report:', err);
      setError('Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  // Filter report data
  const filteredData = useMemo(() => {
    return reportData.filter(item => {
      // Search filter
      const searchMatch = searchTerm === "" || 
        item.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.lrNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.locationTo.toLowerCase().includes(searchTerm.toLowerCase());

      // POD Status filter
      const podMatch = podStatusFilter === "all" || item.podStatus === podStatusFilter;

      // Order Status filter
      const orderMatch = orderStatusFilter === "all" || item.orderStatus === orderStatusFilter;

      // Date range filter
      let dateMatch = true;
      if (dateFrom || dateTo) {
        const orderDate = new Date(item.orderReceivedDate);
        
        if (dateFrom) {
          const fromDate = new Date(dateFrom);
          if (orderDate < fromDate) dateMatch = false;
        }
        if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59);
          if (orderDate > toDate) dateMatch = false;
        }
      }

      return searchMatch && podMatch && orderMatch && dateMatch;
    });
  }, [reportData, searchTerm, podStatusFilter, orderStatusFilter, dateFrom, dateTo]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Partial': 'bg-orange-100 text-orange-800',
      'Completed': 'bg-green-100 text-green-800',
      'Cleared': 'bg-green-100 text-green-800',
      'Received': 'bg-blue-100 text-blue-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Draft': 'bg-gray-100 text-gray-800',
      'Submitted': 'bg-purple-100 text-purple-800',
      'Approved': 'bg-emerald-100 text-emerald-800',
      'Open': 'bg-green-100 text-green-800',
      'Hold': 'bg-yellow-100 text-yellow-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Get age color
  const getAgeColor = (days) => {
    if (days > 30) return 'bg-red-100 text-red-800';
    if (days > 15) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'Party Name', 'Company', 'Vendor Name', 'Order No', 'Order Received Date',
      'Order Placed', 'Order Age (days)', 'Location (To)', 'Weight (MT)',
      'Other Charges', 'Total Amount', 'LR No', 'Invoice No', 'Vehicle Placed Date',
      'Vehicle Left Warehouse', 'Adv Amount', 'Status (Ad amt)', 'Additional Charges',
      'Balance', 'Status (Balance)', 'POD Status', 'POD Remark', 'Order Status'
    ];
    
    const csvRows = [headers];
    
    filteredData.forEach(item => {
      csvRows.push([
        `"${item.partyName}"`,
        `"${item.company}"`,
        `"${item.vendorName}"`,
        `"${item.orderNo}"`,
        item.orderReceivedDate,
        item.orderPlaced,
        item.orderAgeDays,
        `"${item.locationTo}"`,
        item.weightMT,
        item.otherCharges,
        item.totalAmount,
        `"${item.lrNo}"`,
        `"${item.invoiceNo}"`,
        item.vehiclePlacedDate || '-',
        item.vehicleLeftWarehouse || '-',
        item.advAmount,
        `"${item.statusAdAmt}"`,
        item.additionalCharges,
        item.balance,
        `"${item.statusBalance}"`,
        `"${item.podStatus}"`,
        `"${item.podRemark}"`,
        `"${item.orderStatus}"`
      ]);
    });
    
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order_full_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Order Full Report</h1>
        <p className="text-sm text-slate-600 mt-1">Complete order lifecycle report with LR, POD, and payment status</p>
      </div>

      {/* Summary Stats Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="text-xs text-slate-600">Total Orders</div>
            <div className="text-2xl font-bold text-slate-900">{summary.totalOrders}</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="text-xs text-slate-600">Total Weight (MT)</div>
            <div className="text-2xl font-bold text-slate-900">{summary.totalWeight?.toFixed(2) || 0}</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="text-xs text-slate-600">Total Amount (₹)</div>
            <div className="text-2xl font-bold text-emerald-600">₹{summary.totalAmount?.toLocaleString('en-IN') || 0}</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="text-xs text-slate-600">Total Balance (₹)</div>
            <div className="text-2xl font-bold text-orange-600">₹{summary.totalBalance?.toLocaleString('en-IN') || 0}</div>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Order No, Party, LR No..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">POD Status</label>
            <select
              value={podStatusFilter}
              onChange={(e) => setPodStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Received">Received</option>
              <option value="Partial">Partial</option>
              <option value="Rejected">Rejected</option>
              <option value="Clear & Ok">Clear & Ok</option>
              <option value="Deductions">Deductions</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Order Status</label>
            <select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">All Status</option>
              <option value="Draft">Draft</option>
              <option value="Submitted">Submitted</option>
              <option value="Approved">Approved</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-slate-600">
            Showing {paginatedData.length} of {filteredData.length} entries
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportToCSV}
              disabled={filteredData.length === 0}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition flex items-center gap-2 ${
                filteredData.length === 0 
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </button>
            <button
              onClick={fetchReport}
              className="px-4 py-2 bg-sky-600 text-white text-sm font-semibold rounded-lg hover:bg-sky-700 transition"
            >
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto"></div>
            <p className="mt-2 text-sm text-slate-600">Loading report data...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchReport}
              className="mt-2 px-4 py-2 bg-sky-600 text-white rounded-lg text-sm"
            >
              Retry
            </button>
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-600">No data found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600">Order No</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600">Party Name</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600">Company</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600">Vendor Name</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600">Order Date</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600">Order Age</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600">Location (To)</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600">Weight (MT)</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600">Total Amount</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600">LR No</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600">Invoice No</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600">Adv Amount</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600">Adv Status</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600">Add. Charges</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600">Balance</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600">Balance Status</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600">POD Status</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600">POD Remark</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600">Order Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-2 font-mono text-xs font-bold text-sky-600">{row.orderNo}</td>
                      <td className="px-3 py-2 text-slate-700">{row.partyName}</td>
                      <td className="px-3 py-2 text-slate-700">{row.company}</td>
                      <td className="px-3 py-2 text-slate-700">{row.vendorName}</td>
                      <td className="px-3 py-2 text-slate-600">{row.orderReceivedDate}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${getAgeColor(row.orderAgeDays)}`}>
                          {row.orderAgeDays} days
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-600 max-w-[150px] truncate" title={row.locationTo}>{row.locationTo}</td>
                      <td className="px-3 py-2 text-right font-medium text-slate-900">{row.weightMT?.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right font-semibold text-emerald-600">₹{row.totalAmount?.toLocaleString('en-IN')}</td>
                      <td className="px-3 py-2 font-mono text-xs text-slate-600">{row.lrNo}</td>
                      <td className="px-3 py-2 font-mono text-xs text-slate-600">{row.invoiceNo}</td>
                      <td className="px-3 py-2 text-right text-blue-600">₹{row.advAmount?.toLocaleString('en-IN')}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(row.statusAdAmt)}`}>
                          {row.statusAdAmt}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right text-orange-600">₹{row.additionalCharges?.toLocaleString('en-IN')}</td>
                      <td className="px-3 py-2 text-right font-semibold">₹{row.balance?.toLocaleString('en-IN')}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(row.statusBalance)}`}>
                          {row.statusBalance}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(row.podStatus)}`}>
                          {row.podStatus}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-500 max-w-[200px] truncate" title={row.podRemark}>{row.podRemark || '-'}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(row.orderStatus)}`}>
                          {row.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-slate-200 flex justify-between items-center">
                <div className="text-sm text-slate-600">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-slate-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-slate-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Summary Stats Bottom */}
      {summary && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <div className="text-xs text-slate-600">Orders by Status</div>
            <div className="mt-1 space-y-1">
              <div className="flex justify-between text-xs">
                <span>Draft:</span>
                <span className="font-semibold">{summary.ordersByStatus?.Draft || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Submitted:</span>
                <span className="font-semibold">{summary.ordersByStatus?.Submitted || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Approved:</span>
                <span className="font-semibold">{summary.ordersByStatus?.Approved || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Completed:</span>
                <span className="font-semibold">{summary.ordersByStatus?.Completed || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Cancelled:</span>
                <span className="font-semibold">{summary.ordersByStatus?.Cancelled || 0}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <div className="text-xs text-slate-600">POD Status Summary</div>
            <div className="mt-1 space-y-1">
              <div className="flex justify-between text-xs">
                <span>Pending:</span>
                <span className="font-semibold">{summary.podStatusSummary?.Pending || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Received:</span>
                <span className="font-semibold">{summary.podStatusSummary?.Received || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Partial:</span>
                <span className="font-semibold">{summary.podStatusSummary?.Partial || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Clear & Ok:</span>
                <span className="font-semibold">{summary.podStatusSummary?.['Clear & Ok'] || 0}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <div className="text-xs text-slate-600">Advance Payment Status</div>
            <div className="mt-1 space-y-1">
              <div className="flex justify-between text-xs">
                <span>Pending:</span>
                <span className="font-semibold">{summary.paymentStatusSummary?.Pending || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Partial:</span>
                <span className="font-semibold">{summary.paymentStatusSummary?.Partial || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Completed:</span>
                <span className="font-semibold">{summary.paymentStatusSummary?.Completed || 0}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <div className="text-xs text-slate-600">Balance Status</div>
            <div className="mt-1 space-y-1">
              <div className="flex justify-between text-xs">
                <span>Pending:</span>
                <span className="font-semibold">{summary.balanceStatusSummary?.Pending || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Partial:</span>
                <span className="font-semibold">{summary.balanceStatusSummary?.Partial || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Cleared:</span>
                <span className="font-semibold">{summary.balanceStatusSummary?.Cleared || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}