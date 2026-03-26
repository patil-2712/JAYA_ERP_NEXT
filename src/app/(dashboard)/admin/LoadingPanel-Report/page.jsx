"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoadingPanelReport() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalRecords: 0,
    totalWeight: 0,
    vbpCompleted: 0,
    vftCompleted: 0,
    votCompleted: 0,
    vlCompleted: 0,
    underLoading: 0,
    cancelled: 0
  });
  const [filters, setFilters] = useState({
    search: "",
    fromDate: "",
    toDate: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      params.append('format', 'table');
      
      if (filters.search) params.append('search', filters.search);
      if (filters.fromDate) params.append('fromDate', filters.fromDate);
      if (filters.toDate) params.append('toDate', filters.toDate);
      
      const token = localStorage.getItem('token');
      console.log("Fetching with params:", params.toString());
      
      const res = await fetch(`/api/loading-panel?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const result = await res.json();
      console.log("API Response:", result);
      
      if (result.success) {
        setData(result.data || []);
        if (result.stats) {
          setStats(result.stats);
        }
      } else {
        setError(result.message || 'Failed to fetch data');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch loading panel data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    fetchData();
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      fromDate: "",
      toDate: ""
    });
    setTimeout(() => fetchData(), 0);
  };

  const handleRowClick = (id) => {
    if (id) {
      router.push(`/loading-panel/${id}`);
    }
  };

  const handleExportCSV = () => {
    if (!data.length) return;
    
    const headers = [
      'Date', 'Vehicle Arrival No', 'Branch', 'Vehicle No', 'Driver No',
      'Supervisor Name', 'Total Weight', 'VBP Status', 'VBP Approval', 
      'VFT Status', 'VFT Approval', 'VL Status', 'VL Approval', 
      'VOT Status', 'VOT Approval', 'FPT Status', 'FPT Approval',
      'Consignment Note', 'Invoice', 'Ewaybill', 'Status'
    ];
    
    const csvContent = [
      headers.join(','),
      ...data.map(row => [
        row.date,
        row.vehicleArrivalNo,
        row.branch,
        row.vehicleNo,
        row.driverNo,
        row.supervisorName,
        row.totalWeight,
        row.vbpStatus,
        row.vbpApproval,
        row.vftStatus,
        row.vftApproval,
        row.vlStatus,
        row.vlApproval,
        row.votStatus,
        row.votApproval,
        row.fptStatus,
        row.fptApproval,
        row.consignmentNote,
        row.invoice,
        row.ewaybill,
        row.panelStatus
      ].map(cell => `"${cell || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `loading_panel_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNewLoading = () => {
    router.push('/loading-panel/new');
  };

  // Get badge color based on status
  const getBadgeColor = (status, approval) => {
    if (approval === 'Approved') return 'bg-yellow-200 text-yellow-800';
    if (status === 'Completed') return 'bg-green-200 text-green-800';
    if (status === 'Pending') return 'bg-red-200 text-red-800';
    return 'bg-gray-200 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-full px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-lg font-extrabold text-slate-900">
              Loading Panel Report
            </div>
            <div className="text-sm text-slate-600">
              Total Records: {stats.totalRecords} | Total Weight: {stats.totalWeight} MT
            </div>
          </div>

          <div className="flex items-center gap-3">
           
            <button
              onClick={handleNewLoading}
              className="rounded-xl bg-yellow-600 px-4 py-2 text-sm font-bold text-white hover:bg-yellow-700 transition"
            >
              + New Loading
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-full p-4">
     

        {/* Filters */}
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Search by Vehicle No, Driver..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-yellow-500"
            />
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
            <button
              onClick={applyFilters}
              className="rounded-lg bg-yellow-600 px-4 py-2 text-sm font-bold text-white hover:bg-yellow-700 transition"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 mb-4 flex gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-200 rounded"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-200 rounded"></div>
            <span>Approved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-200 rounded"></div>
            <span>Pending</span>
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
              ❌ {error}
            </div>
          ) : data.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No records found. Please create a new loading panel.
            </div>
          ) : (
            <div className="overflow-auto max-h-[600px]">
              <table className="min-w-full w-full text-sm">
                <thead className="sticky top-0 bg-yellow-400 z-10">
                  <tr>
                    <th className="border border-yellow-500 px-2 py-2 text-xs font-extrabold text-slate-900">Date</th>
                    <th className="border border-yellow-500 px-2 py-2 text-xs font-extrabold text-slate-900">Vehicle Arrival No</th>
                    <th className="border border-yellow-500 px-2 py-2 text-xs font-extrabold text-slate-900">Branch</th>
                    <th className="border border-yellow-500 px-2 py-2 text-xs font-extrabold text-slate-900">Vehicle No</th>
                    <th className="border border-yellow-500 px-2 py-2 text-xs font-extrabold text-slate-900">Driver No</th>
                    <th className="border border-yellow-500 px-2 py-2 text-xs font-extrabold text-slate-900">Supervisor</th>
                    <th className="border border-yellow-500 px-2 py-2 text-xs font-extrabold text-slate-900">Weight</th>
                    <th className="border border-yellow-500 px-2 py-2 text-xs font-extrabold text-slate-900" colSpan="2">VBP</th>
                    <th className="border border-yellow-500 px-2 py-2 text-xs font-extrabold text-slate-900" colSpan="2">VFT</th>
                    <th className="border border-yellow-500 px-2 py-2 text-xs font-extrabold text-slate-900" colSpan="2">VL</th>
                    <th className="border border-yellow-500 px-2 py-2 text-xs font-extrabold text-slate-900" colSpan="2">VOT</th>
                    <th className="border border-yellow-500 px-2 py-2 text-xs font-extrabold text-slate-900" colSpan="2">FPT</th>
                  </tr>
                  <tr className="bg-yellow-300">
                    <th className="border border-yellow-500 px-2 py-1" colSpan="7"></th>
                    <th className="border border-yellow-500 px-2 py-1 text-xs font-bold">Status</th>
                    <th className="border border-yellow-500 px-2 py-1 text-xs font-bold">Appr</th>
                    <th className="border border-yellow-500 px-2 py-1 text-xs font-bold">Status</th>
                    <th className="border border-yellow-500 px-2 py-1 text-xs font-bold">Appr</th>
                    <th className="border border-yellow-500 px-2 py-1 text-xs font-bold">Status</th>
                    <th className="border border-yellow-500 px-2 py-1 text-xs font-bold">Appr</th>
                    <th className="border border-yellow-500 px-2 py-1 text-xs font-bold">Status</th>
                    <th className="border border-yellow-500 px-2 py-1 text-xs font-bold">Appr</th>
                    <th className="border border-yellow-500 px-2 py-1 text-xs font-bold">Status</th>
                    <th className="border border-yellow-500 px-2 py-1 text-xs font-bold">Appr</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, index) => (
                    <tr 
                      key={row._id || index} 
                      onClick={() => handleRowClick(row._id)}
                      className="hover:bg-yellow-50 even:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="border border-yellow-300 px-2 py-1 text-center">{row.date}</td>
                      <td className="border border-yellow-300 px-2 py-1 font-medium text-yellow-700">{row.vehicleArrivalNo}</td>
                      <td className="border border-yellow-300 px-2 py-1">{row.branch}</td>
                      <td className="border border-yellow-300 px-2 py-1">{row.vehicleNo}</td>
                      <td className="border border-yellow-300 px-2 py-1">{row.driverNo}</td>
                      <td className="border border-yellow-300 px-2 py-1">{row.supervisorName}</td>
                      <td className="border border-yellow-300 px-2 py-1 text-right font-medium">{row.totalWeight}</td>
                      
                      {/* VBP */}
                      <td className={`border border-yellow-300 px-2 py-1 text-center ${getBadgeColor(row.vbpStatus, row.vbpApproval)}`}>
                        {row.vbpStatus}
                      </td>
                      <td className={`border border-yellow-300 px-2 py-1 text-center ${row.vbpApproval === 'Approved' ? 'bg-yellow-200' : ''}`}>
                        {row.vbpApproval}
                      </td>
                      
                      {/* VFT */}
                      <td className={`border border-yellow-300 px-2 py-1 text-center ${getBadgeColor(row.vftStatus, row.vftApproval)}`}>
                        {row.vftStatus}
                      </td>
                      <td className={`border border-yellow-300 px-2 py-1 text-center ${row.vftApproval === 'Approved' ? 'bg-yellow-200' : ''}`}>
                        {row.vftApproval}
                      </td>
                      
                      {/* VL */}
                      <td className={`border border-yellow-300 px-2 py-1 text-center ${getBadgeColor(row.vlStatus, row.vlApproval)}`}>
                        {row.vlStatus}
                      </td>
                      <td className={`border border-yellow-300 px-2 py-1 text-center ${row.vlApproval === 'Approved' ? 'bg-yellow-200' : ''}`}>
                        {row.vlApproval}
                      </td>
                      
                      {/* VOT */}
                      <td className={`border border-yellow-300 px-2 py-1 text-center ${getBadgeColor(row.votStatus, row.votApproval)}`}>
                        {row.votStatus}
                      </td>
                      <td className={`border border-yellow-300 px-2 py-1 text-center ${row.votApproval === 'Approved' ? 'bg-yellow-200' : ''}`}>
                        {row.votApproval}
                      </td>
                      
                      {/* FPT */}
                      <td className={`border border-yellow-300 px-2 py-1 text-center ${getBadgeColor(row.fptStatus, row.fptApproval)}`}>
                        {row.fptStatus}
                      </td>
                      <td className={`border border-yellow-300 px-2 py-1 text-center ${row.fptApproval === 'Approved' ? 'bg-yellow-200' : ''}`}>
                        {row.fptApproval}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Documents Section */}
              {data.length > 0 && (
                <div className="bg-gray-50 p-3 border-t border-yellow-300">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <span className="font-bold text-sm">Consignment Note (LR)</span>
                      <div className="text-xs mt-1 text-gray-600">{data[0]?.consignmentNote}</div>
                    </div>
                    <div className="text-center">
                      <span className="font-bold text-sm">Invoice</span>
                      <div className="text-xs mt-1 text-gray-600">{data[0]?.invoice}</div>
                    </div>
                    <div className="text-center">
                      <span className="font-bold text-sm">Ewaybill</span>
                      <div className="text-xs mt-1 text-gray-600">{data[0]?.ewaybill}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}