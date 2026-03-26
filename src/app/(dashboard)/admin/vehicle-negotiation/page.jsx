"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VehicleNegotiationList() {
  const router = useRouter();
  const [negotiations, setNegotiations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    approvalStatus: "",
    memoStatus: "",
    fromDate: "",
    toDate: ""
  });

  // Fetch negotiations on component mount
  useEffect(() => {
    fetchNegotiations();
  }, []);

  const fetchNegotiations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Build query string with filters
      const params = new URLSearchParams({ format: 'table' });
      if (filters.search) params.append('search', filters.search);
      if (filters.approvalStatus) params.append('approvalStatus', filters.approvalStatus);
      if (filters.memoStatus) params.append('memoStatus', filters.memoStatus);
      if (filters.fromDate) params.append('fromDate', filters.fromDate);
      if (filters.toDate) params.append('toDate', filters.toDate);
      
      const res = await fetch(`/api/vehicle-negotiation?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = await res.json();
      
      if (data.success) {
        // Group by VNN to show unique VNN numbers
        const groupedData = groupByVNN(data.data || []);
        setNegotiations(groupedData);
      } else {
        setError(data.message || 'Failed to fetch vehicle negotiations');
      }
    } catch (err) {
      console.error('Error fetching vehicle negotiations:', err);
      setError('Failed to load vehicle negotiations');
    } finally {
      setLoading(false);
    }
  };

  // Group data by VNN number to show unique VNN rows
  const groupByVNN = (data) => {
    const vnnMap = new Map();
    
    data.forEach(item => {
      if (!vnnMap.has(item.vnn)) {
        vnnMap.set(item.vnn, {
          ...item,
          orderCount: 1,
          totalWeight: item.weight || 0,
          orders: [item]
        });
      } else {
        const existing = vnnMap.get(item.vnn);
        existing.orderCount += 1;
        existing.totalWeight += (item.weight || 0);
        existing.orders.push(item);
        
        if (!existing.order && item.order) existing.order = item.order;
        if (!existing.from && item.from) existing.from = item.from;
        if (!existing.to && item.to) existing.to = item.to;
      }
    });
    
    return Array.from(vnnMap.values());
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    fetchNegotiations();
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      approvalStatus: "",
      memoStatus: "",
      fromDate: "",
      toDate: ""
    });
    setTimeout(() => fetchNegotiations(), 100);
  };

  const handleDelete = async (vnId, vnnNo) => {
    if (!confirm(`Are you sure you want to delete Vehicle Negotiation ${vnnNo}?`)) {
      return;
    }

    setDeleteLoading(vnId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/vehicle-negotiation?id=${vnId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.success) {
        setNegotiations(negotiations.filter(item => item.vnId !== vnId));
        alert('Vehicle Negotiation deleted successfully!');
      } else {
        alert(data.message || 'Failed to delete vehicle negotiation');
      }
    } catch (err) {
      console.error('Error deleting vehicle negotiation:', err);
      alert('Failed to delete vehicle negotiation');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEdit = (vnId) => {
    router.push(`/admin/vehicle-negotiation/${vnId}`);
  };

  const handleApprove = (vnId) => {
    router.push(`/admin/vehicle-negotiation/approve/${vnId}`);
  };

  const handleCreateNew = () => {
    router.push('/admin/vehicle-negotiation/create');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading vehicle negotiations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-full px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Vehicle Negotiation Management
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Manage all vehicle negotiations in one place
            </p>
          </div>

          <button
            onClick={handleCreateNew}
            className="rounded-xl bg-yellow-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-yellow-700 transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Negotiation
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-full p-6">
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 bg-white rounded-xl border border-slate-200 p-4">
          <h2 className="text-sm font-bold text-slate-700 mb-3">Filter Negotiations</h2>
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12 md:col-span-3">
              <input
                type="text"
                placeholder="Search by VNN, Party, Vendor..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
              />
            </div>
            <div className="col-span-12 md:col-span-2">
              <select
                value={filters.approvalStatus}
                onChange={(e) => handleFilterChange('approvalStatus', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
              >
                <option value="">All Approval Status</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Reject">Reject</option>
              </select>
            </div>
            <div className="col-span-12 md:col-span-2">
              <select
                value={filters.memoStatus}
                onChange={(e) => handleFilterChange('memoStatus', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
              >
                <option value="">All Memo Status</option>
                <option value="Uploaded">Uploaded</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div className="col-span-12 md:col-span-2">
              <input
                type="date"
                value={filters.fromDate}
                onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
              />
            </div>
            <div className="col-span-12 md:col-span-2">
              <input
                type="date"
                value={filters.toDate}
                onChange={(e) => handleFilterChange('toDate', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
              />
            </div>
            <div className="col-span-12 md:col-span-1 flex gap-2">
              <button
                onClick={applyFilters}
                className="flex-1 rounded-xl bg-yellow-600 px-4 py-2 text-sm font-bold text-white hover:bg-yellow-700 transition"
              >
                Filter
              </button>
              <button
                onClick={clearFilters}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
                title="Clear Filters"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Negotiations Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-yellow-400 border-b border-yellow-500">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider">S.No</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider">VNN No</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider">Orders</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider">Party Name</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider">Supplier</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider">From → To</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider">Total Weight</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider">Approval</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider">Memo</th>
                  <th className="px-4 py-3 text-center text-xs font-extrabold text-slate-900 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {negotiations.length > 0 ? (
                  negotiations.map((item, index) => (
                    <tr key={item.vnId} className="hover:bg-yellow-50 transition">
                      <td className="px-4 py-3 text-slate-600">{index + 1}</td>
                      <td className="px-4 py-3 text-slate-600">{item.date}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{item.vnn}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {item.orderCount} order{item.orderCount !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{item.partyName}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-slate-600">{item.vendorName || '-'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <span>{item.from || '-'}</span>
                          <span className="mx-1 text-slate-400">→</span>
                          <span>{item.to || '-'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">{item.totalWeight} kg</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.approval === 'Approved' ? 'bg-green-100 text-green-800' :
                          item.approval === 'Reject' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.approval}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.memo === 'Uploaded' ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.memo}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          {/* Edit Button */}
                          <button
                            onClick={() => handleEdit(item.vnId)}
                            className="p-2 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition"
                            title="Edit Vehicle Negotiation"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          
                          {/* Approve Button - Shows for ALL negotiations regardless of status */}
                          <button
                            onClick={() => handleApprove(item.vnId)}
                            className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                            title="Approve/Review Vehicle Negotiation"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          
                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(item.vnId, item.vnn)}
                            disabled={deleteLoading === item.vnId}
                            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition disabled:opacity-50"
                            title="Delete Vehicle Negotiation"
                          >
                            {deleteLoading === item.vnId ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700"></div>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" className="px-4 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center">
                        <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <p className="text-lg font-medium mb-2">No vehicle negotiations found</p>
                        <p className="text-sm mb-4">Get started by creating your first vehicle negotiation</p>
                        <button
                          onClick={handleCreateNew}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition text-sm font-bold"
                        >
                          Create New Negotiation
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {negotiations.length > 0 && (
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-sm text-slate-600">
              Total {negotiations.length} negotiation{negotiations.length !== 1 ? 's' : ''} found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}