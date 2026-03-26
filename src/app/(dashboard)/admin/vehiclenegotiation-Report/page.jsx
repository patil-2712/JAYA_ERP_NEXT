"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VehicleNegotiationList() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    approvalStatus: "",
    memoStatus: "",
    fromDate: "",
    toDate: ""
  });
  const [stats, setStats] = useState({
    totalRecords: 0,
    totalWeight: 0,
    approvedCount: 0,
    pendingCount: 0,
    rejectedCount: 0,
    uploadedMemo: 0,
    pendingMemo: 0
  });

  // Fetch data on component mount and when filters change
  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Build query string
      const params = new URLSearchParams();
      params.append('format', 'table');
      
      if (filters.search) params.append('search', filters.search);
      if (filters.approvalStatus) params.append('approvalStatus', filters.approvalStatus);
      if (filters.memoStatus) params.append('memoStatus', filters.memoStatus);
      if (filters.fromDate) params.append('fromDate', filters.fromDate);
      if (filters.toDate) params.append('toDate', filters.toDate);
      
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/vehicle-negotiation?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const result = await res.json();
      
      if (result.success) {
        setData(result.data);
        calculateStats(result.data);
      } else {
        setError(result.message || 'Failed to fetch data');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch vehicle negotiation data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const totalWeight = data.reduce((sum, row) => sum + (parseFloat(row.weight) || 0), 0);
    const approvedCount = data.filter(row => row.approval === 'Approved').length;
    const pendingCount = data.filter(row => row.approval === 'Pending').length;
    const rejectedCount = data.filter(row => row.approval === 'Reject').length;
    const uploadedMemo = data.filter(row => row.memo === 'Uploaded').length;
    const pendingMemo = data.filter(row => row.memo === 'Pending').length;
    
    setStats({
      totalRecords: data.length,
      totalWeight: totalWeight.toFixed(2),
      approvedCount,
      pendingCount,
      rejectedCount,
      uploadedMemo,
      pendingMemo
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      approvalStatus: "",
      memoStatus: "",
      fromDate: "",
      toDate: ""
    });
  };

  const handleRowClick = (vnId) => {
    router.push(`/vehicle-negotiation/${vnId}`);
  };

  const handleExportCSV = () => {
    // Create CSV content
    const headers = ['Date', 'VNN', 'Order', 'Party Name', 'Plant Code', 'Order Type', 'Pin Code', 'From', 'To', 'District', 'State', 'Country', 'Weight', 'Order Status', 'Approval', 'Memo'];
    
    const csvContent = [
      headers.join(','),
      ...data.map(row => [
        formatDate(row.date),
        row.vnn || row.vehicleNegotiationNo || '',
        row.order || row.orderNo || '',
        `"${row.partyName || row.customerName || ''}"`,
        row.plantCode || row.plant || '',
        row.orderType || '',
        row.pinCode || row.pincode || '',
        getLocationDisplay(row.from),
        getLocationDisplay(row.to),
        getLocationDisplay(row.district),
        getLocationDisplay(row.state),
        getLocationDisplay(row.country),
        row.weight || '0',
        row.orderStatus || 'Open',
        row.approval || 'Pending',
        row.memo || 'Pending'
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `vehicle_negotiation_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format date to DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Get display name for location
  const getLocationDisplay = (location) => {
    if (!location) return "-";
    if (typeof location === 'object' && location !== null) {
      return location.name || location.city || "-";
    }
    return location;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-full px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-lg font-extrabold text-slate-900">
              Vehicle Negotiation Records
            </div>
            <div className="text-sm text-slate-600">
              Total Records: {stats.totalRecords} | Total Weight: {stats.totalWeight} MT
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700 transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </button>
            <button
              onClick={() => router.push('/vehicle-negotiation/new')}
              className="rounded-xl bg-yellow-600 px-4 py-2 text-sm font-bold text-white hover:bg-yellow-700 transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Negotiation
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-full p-4">
      

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </div>
            <button
              onClick={clearFilters}
              className="text-xs text-sky-600 hover:text-sky-800 flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear Filters
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by VNN, Order, Party..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-2 text-sm outline-none focus:border-sky-500"
              />
              <svg className="w-4 h-4 absolute left-2 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <select
              value={filters.approvalStatus}
              onChange={(e) => handleFilterChange('approvalStatus', e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500"
            >
              <option value="">All Approval Status</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Reject">Reject</option>
            </select>
            <select
              value={filters.memoStatus}
              onChange={(e) => handleFilterChange('memoStatus', e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500"
            >
              <option value="">All Memo Status</option>
              <option value="Uploaded">Uploaded</option>
              <option value="Pending">Pending</option>
            </select>
            <div className="relative">
              <input
                type="date"
                value={filters.fromDate}
                onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500"
              />
            </div>
            <div className="relative">
              <input
                type="date"
                value={filters.toDate}
                onChange={(e) => handleFilterChange('toDate', e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
              <span className="ml-3 text-slate-600">Loading data...</span>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">
              <svg className="w-12 h-12 mx-auto mb-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ❌ {error}
            </div>
          ) : data.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <svg className="w-16 h-16 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium">No records found</p>
              <p className="text-sm mt-1">Try adjusting your filters or create a new negotiation</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-20">
                  <thead className="bg-yellow-400">
                    <tr>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider whitespace-nowrap border-r border-yellow-500">Date</th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider whitespace-nowrap border-r border-yellow-500">VNN</th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider whitespace-nowrap border-r border-yellow-500">Order</th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider whitespace-nowrap border-r border-yellow-500">Party Name</th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider whitespace-nowrap border-r border-yellow-500">Plant</th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider whitespace-nowrap border-r border-yellow-500">Order Type</th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider whitespace-nowrap border-r border-yellow-500">Pin</th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider whitespace-nowrap border-r border-yellow-500">From</th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider whitespace-nowrap border-r border-yellow-500">To</th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider whitespace-nowrap border-r border-yellow-500">District</th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider whitespace-nowrap border-r border-yellow-500">State</th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider whitespace-nowrap border-r border-yellow-500">Country</th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider whitespace-nowrap border-r border-yellow-500">Weight</th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider whitespace-nowrap border-r border-yellow-500">Status</th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider whitespace-nowrap border-r border-yellow-500">Approval</th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider whitespace-nowrap">Memo</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((row, index) => (
                      <tr 
                        key={`${row.vnId || index}-${index}`} 
                        onClick={() => handleRowClick(row.vnId)}
                        className="hover:bg-yellow-50 cursor-pointer transition-colors group"
                      >
                        <td className="px-3 py-2 text-sm whitespace-nowrap border-r border-yellow-300 group-hover:font-medium">
                          {formatDate(row.date)}
                        </td>
                        <td className="px-3 py-2 text-sm font-medium text-sky-700 whitespace-nowrap border-r border-yellow-300">
                          {row.vnn || row.vehicleNegotiationNo || '-'}
                        </td>
                        <td className="px-3 py-2 text-sm whitespace-nowrap border-r border-yellow-300">
                          {row.order || row.orderNo || '-'}
                        </td>
                        <td className="px-3 py-2 text-sm whitespace-nowrap border-r border-yellow-300">
                          {row.partyName || row.customerName || '-'}
                        </td>
                        <td className="px-3 py-2 text-sm whitespace-nowrap border-r border-yellow-300">
                          {row.plantCode || row.plant || '-'}
                        </td>
                        <td className="px-3 py-2 text-sm whitespace-nowrap border-r border-yellow-300">
                          {row.orderType || '-'}
                        </td>
                        <td className="px-3 py-2 text-sm whitespace-nowrap border-r border-yellow-300">
                          {row.pinCode || row.pincode || '-'}
                        </td>
                        <td className="px-3 py-2 text-sm whitespace-nowrap border-r border-yellow-300">
                          {getLocationDisplay(row.from)}
                        </td>
                        <td className="px-3 py-2 text-sm whitespace-nowrap border-r border-yellow-300">
                          {getLocationDisplay(row.to)}
                        </td>
                        <td className="px-3 py-2 text-sm whitespace-nowrap border-r border-yellow-300">
                          {getLocationDisplay(row.district)}
                        </td>
                        <td className="px-3 py-2 text-sm whitespace-nowrap border-r border-yellow-300">
                          {getLocationDisplay(row.state)}
                        </td>
                        <td className="px-3 py-2 text-sm whitespace-nowrap border-r border-yellow-300">
                          {getLocationDisplay(row.country)}
                        </td>
                        <td className="px-3 py-2 text-sm font-medium whitespace-nowrap border-r border-yellow-300 text-right">
                          {row.weight ? parseFloat(row.weight).toFixed(2) : '0.00'}
                        </td>
                        <td className="px-3 py-2 text-sm whitespace-nowrap border-r border-yellow-300">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold
                            ${row.orderStatus === 'Open' ? 'bg-green-100 text-green-800' : 
                              row.orderStatus === 'Hold' ? 'bg-yellow-100 text-yellow-800' : 
                              row.orderStatus === 'Completed' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'}`}>
                            {row.orderStatus || 'Open'}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-sm whitespace-nowrap border-r border-yellow-300">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold
                            ${row.approval === 'Approved' ? 'bg-green-100 text-green-800' : 
                              row.approval === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                              row.approval === 'Reject' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'}`}>
                            {row.approval || 'Pending'}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-sm whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold
                            ${row.memo === 'Uploaded' ? 'bg-blue-100 text-blue-800' : 
                              row.memo === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'}`}>
                            {row.memo || 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Table Footer with Pagination Info */}
              <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <div>
                  Showing {data.length} records
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-slate-500">
                    Page 1 of 1
                  </span>
                  <div className="flex items-center gap-1">
                    <button className="p-1 rounded hover:bg-slate-200 disabled:opacity-50" disabled>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button className="p-1 rounded hover:bg-slate-200 disabled:opacity-50" disabled>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

       
      </div>
    </div>
  );
}