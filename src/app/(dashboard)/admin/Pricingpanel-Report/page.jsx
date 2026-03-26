"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PricingPanelReport() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    pricingStatus: "",
    approvalStatus: "",
    fromDate: "",
    toDate: ""
  });
  const [stats, setStats] = useState({
    totalRecords: 0,
    totalWeight: 0,
    completedPricing: 0,
    pendingPricing: 0,
    approvedCount: 0,
    pendingApproval: 0
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
      if (filters.pricingStatus) params.append('pricingStatus', filters.pricingStatus);
      if (filters.approvalStatus) params.append('approvalStatus', filters.approvalStatus);
      if (filters.fromDate) params.append('fromDate', filters.fromDate);
      if (filters.toDate) params.append('toDate', filters.toDate);
      
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/pricing-panel?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const result = await res.json();
      
      if (result.success) {
        setData(result.data);
        if (result.stats) {
          setStats(result.stats);
        } else {
          calculateStats(result.data);
        }
      } else {
        setError(result.message || 'Failed to fetch data');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch pricing panel data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const totalWeight = data.reduce((sum, row) => sum + (row.weight || 0), 0);
    const completedPricing = data.filter(row => row.pricing === 'Completed').length;
    const pendingPricing = data.filter(row => row.pricing === 'Pending').length;
    const approvedCount = data.filter(row => row.approval === 'Approved').length;
    const pendingApproval = data.filter(row => row.approval === 'Pending').length;
    
    setStats({
      totalRecords: data.length,
      totalWeight,
      completedPricing,
      pendingPricing,
      approvedCount,
      pendingApproval
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      pricingStatus: "",
      approvalStatus: "",
      fromDate: "",
      toDate: ""
    });
  };

  const handleRowClick = (panelId) => {
    if (panelId) {
      router.push(`/pricing-panel/${panelId}`);
    }
  };

  const handleExportCSV = () => {
    if (!data.length) return;
    
    // Create CSV content
    const headers = ['Date', 'Pricing Serial No', 'Order', 'Party Name', 'Plant Code', 'Order Type', 'Pin Code', 'State', 'District', 'From', 'To', 'Weight', 'Pricing', 'Approval'];
    
    const csvContent = [
      headers.join(','),
      ...data.map(row => [
        row.date || '',
        row.pricingSerialNo || '',
        `"${(row.order || '').replace(/"/g, '""')}"`,
        `"${(row.partyName || '').replace(/"/g, '""')}"`,
        row.plantCode || '',
        row.orderType || '',
        row.pinCode || '',
        row.state || '',
        row.district || '',
        row.from || '',
        row.to || '',
        row.weight || 0,
        row.pricing || '',
        row.approval || ''
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `pricing_panel_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleNewPricing = () => {
    router.push('/pricing-panel/new');
  };

  // Get status badge color - matching vehicle page style
  const getPricingBadgeColor = (status) => {
    switch(status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getApprovalBadgeColor = (status) => {
    switch(status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header - matching vehicle page style */}
      <div className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-full px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-lg font-extrabold text-slate-900">
              Pricing Panel Records
            </div>
            <div className="text-sm text-slate-600">
              Total Records: {stats.totalRecords} | Total Weight: {stats.totalWeight} MT
            </div>
          </div>

          <div className="flex items-center gap-3">
           
            <button
              onClick={handleNewPricing}
              className="rounded-xl bg-yellow-600 px-4 py-2 text-sm font-bold text-white hover:bg-yellow-700 transition"
            >
              + New Pricing
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-full p-4">
        {/* Stats Cards - matching vehicle page style with 6 cards */}
       

        {/* Filters - matching vehicle page style */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-bold text-slate-700">Filters</div>
            <button
              onClick={clearFilters}
              className="text-xs text-yellow-600 hover:text-yellow-800"
            >
              Clear Filters
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <input
              type="text"
              placeholder="Search by PSN, Order, Party..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-yellow-500"
            />
            <select
              value={filters.pricingStatus}
              onChange={(e) => handleFilterChange('pricingStatus', e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-yellow-500"
            >
              <option value="">All Pricing Status</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>
            <select
              value={filters.approvalStatus}
              onChange={(e) => handleFilterChange('approvalStatus', e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-yellow-500"
            >
              <option value="">All Approval Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Completed">Completed</option>
            </select>
            <input
              type="date"
              placeholder="From Date"
              value={filters.fromDate}
              onChange={(e) => handleFilterChange('fromDate', e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-yellow-500"
            />
            <input
              type="date"
              placeholder="To Date"
              value={filters.toDate}
              onChange={(e) => handleFilterChange('toDate', e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-yellow-500"
            />
          </div>
        </div>

        {/* Table - matching vehicle page style with yellow theme */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
              <span className="ml-3 text-slate-600">Loading data...</span>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">
              ❌ {error}
            </div>
          ) : data.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No records found
            </div>
          ) : (
            <div className="overflow-auto max-h-[600px]">
              <table className="min-w-full w-full text-sm">
                <thead className="sticky top-0 bg-yellow-400 z-10">
                  <tr>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">Date</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">PSN</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">Order</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">Party Name</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">Plant Code</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">Order Type</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">Pin Code</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">State</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">District</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">From</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">To</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">Weight</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">Pricing</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">Approval</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, index) => (
                    <tr 
                      key={`${row.panelId}-${index}`} 
                      onClick={() => handleRowClick(row.panelId)}
                      className="hover:bg-yellow-50 even:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="border border-yellow-300 px-3 py-2 text-center">{row.date}</td>
                      <td className="border border-yellow-300 px-3 py-2 font-medium text-yellow-700">{row.pricingSerialNo}</td>
                      <td className="border border-yellow-300 px-3 py-2">{row.order}</td>
                      <td className="border border-yellow-300 px-3 py-2">{row.partyName}</td>
                      <td className="border border-yellow-300 px-3 py-2">{row.plantCode}</td>
                      <td className="border border-yellow-300 px-3 py-2">{row.orderType}</td>
                      <td className="border border-yellow-300 px-3 py-2">{row.pinCode}</td>
                      <td className="border border-yellow-300 px-3 py-2">{row.state}</td>
                      <td className="border border-yellow-300 px-3 py-2">{row.district}</td>
                      <td className="border border-yellow-300 px-3 py-2">{row.from}</td>
                      <td className="border border-yellow-300 px-3 py-2">{row.to}</td>
                      <td className="border border-yellow-300 px-3 py-2 text-right font-medium">{row.weight}</td>
                      <td className="border border-yellow-300 px-3 py-2 text-center">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${getPricingBadgeColor(row.pricing)}`}>
                          {row.pricing}
                        </span>
                      </td>
                      <td className="border border-yellow-300 px-3 py-2 text-center">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${getApprovalBadgeColor(row.approval)}`}>
                          {row.approval}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary - matching vehicle page style */}
        {!loading && !error && data.length > 0 && (
          <div className="mt-4 text-sm text-slate-600 flex justify-between items-center">
            <div>
              Showing {data.length} records
            </div>
           
          </div>
        )}
      </div>
    </div>
  );
}