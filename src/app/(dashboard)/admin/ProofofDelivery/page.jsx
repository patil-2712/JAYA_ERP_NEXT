"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PODPanelList() {
  const router = useRouter();
  const [podList, setPodList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    fromDate: "",
    toDate: "",
    podStatus: ""
  });

  useEffect(() => {
    fetchPODList();
  }, []);

  const fetchPODList = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams({ format: 'table' });
      if (filters.search) params.append('search', filters.search);
      if (filters.fromDate) params.append('fromDate', filters.fromDate);
      if (filters.toDate) params.append('toDate', filters.toDate);
      if (filters.podStatus) params.append('podStatus', filters.podStatus);
      
      const res = await fetch(`/api/pod-panel?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = await res.json();
      
      if (data.success) {
        setPodList(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch PODs');
      }
    } catch (err) {
      console.error('Error fetching PODs:', err);
      setError('Failed to load PODs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    fetchPODList();
  };

  const clearFilters = () => {
    setFilters({ search: "", fromDate: "", toDate: "", podStatus: "" });
    setTimeout(() => fetchPODList(), 100);
  };

  const handleDelete = async (podId, podNo) => {
    if (!confirm(`Are you sure you want to delete POD ${podNo}?`)) return;

    setDeleteLoading(podId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/pod-panel?id=${podId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.success) {
        setPodList(podList.filter(item => item._id !== podId));
        alert('✅ POD deleted successfully!');
      } else {
        alert(data.message || 'Failed to delete POD');
      }
    } catch (err) {
      console.error('Error deleting POD:', err);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEdit = (podId) => {
    router.push(`/admin/ProofOfDelivery/${podId}`);
  };

  const handleCreateNew = () => {
    router.push('/admin/ProofOfDelivery/create');
  };

  const handleApprove = (podId) => {
    router.push(`/admin/ProofOfDelivery/approve/${podId}`);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Received': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Partial': return 'bg-orange-100 text-orange-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading PODs...</p>
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
              Proof of Delivery (POD) Management
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Manage all POD entries, track delivery confirmations
            </p>
          </div>

          <button
            onClick={handleCreateNew}
            className="rounded-xl bg-yellow-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-yellow-700 transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New POD
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
          <h2 className="text-sm font-bold text-slate-700 mb-3">Filter PODs</h2>
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12 md:col-span-3">
              <input
                type="text"
                placeholder="Search by POD No, Purchase No, Vendor..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
              />
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
            <div className="col-span-12 md:col-span-2">
              <select
                value={filters.podStatus}
                onChange={(e) => handleFilterChange('podStatus', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Received">Received</option>
                <option value="Partial">Partial</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div className="col-span-12 md:col-span-3 flex gap-2">
              <button
                onClick={applyFilters}
                className="flex-1 rounded-xl bg-yellow-600 px-4 py-2 text-sm font-bold text-white hover:bg-yellow-700 transition"
              >
                Filter
              </button>
              <button
                onClick={clearFilters}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                ✕ Clear
              </button>
            </div>
          </div>
        </div>

        {/* PODs Table - Excel Format */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-yellow-400">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider border border-yellow-500">S.No</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider border border-yellow-500">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider border border-yellow-500">Purchase No</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider border border-yellow-500">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider border border-yellow-500">Party Name</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider border border-yellow-500">Plant Code</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider border border-yellow-500">Order Type</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider border border-yellow-500">Pin Code</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider border border-yellow-500">State</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider border border-yellow-500">District</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider border border-yellow-500">From</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider border border-yellow-500">To</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider border border-yellow-500">Weight</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider border border-yellow-500">Unloading</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider border border-yellow-500">POD - Upload</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider border border-yellow-500">POD - Received</th>
                  <th className="px-4 py-3 text-center text-xs font-extrabold text-slate-900 uppercase tracking-wider border border-yellow-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {podList.length > 0 ? (
                  podList.map((item, index) => (
                    <tr key={item._id} className="hover:bg-yellow-50 transition">
                      <td className="border border-slate-200 px-4 py-3 text-slate-600">{index + 1}</td>
                      <td className="border border-slate-200 px-4 py-3 text-slate-600">{item.date}</td>
                      <td className="border border-slate-200 px-4 py-3 font-medium text-slate-900">{item.purchaseNo}</td>
                      <td className="border border-slate-200 px-4 py-3 text-slate-600">{item.orderNo || '-'}</td>
                      <td className="border border-slate-200 px-4 py-3 text-slate-800">{item.partyName}</td>
                      <td className="border border-slate-200 px-4 py-3 text-slate-600">{item.plantCode}</td>
                      <td className="border border-slate-200 px-4 py-3 text-slate-600">{item.orderType}</td>
                      <td className="border border-slate-200 px-4 py-3 text-slate-600">{item.pinCode}</td>
                      <td className="border border-slate-200 px-4 py-3 text-slate-600">{item.state}</td>
                      <td className="border border-slate-200 px-4 py-3 text-slate-600">{item.district}</td>
                      <td className="border border-slate-200 px-4 py-3 text-slate-600">{item.from}</td>
                      <td className="border border-slate-200 px-4 py-3 text-slate-600">{item.to}</td>
                      <td className="border border-slate-200 px-4 py-3 text-slate-600 text-right">{item.weight}</td>
                      <td className="border border-slate-200 px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.unloading === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {item.unloading || 'Pending'}
                        </span>
                      </td>
                      <td className="border border-slate-200 px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.podUpload === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {item.podUpload || 'Pending'}
                        </span>
                      </td>
                      <td className="border border-slate-200 px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.podReceived)}`}>
                          {item.podReceived || 'Pending'}
                        </span>
                      </td>
                      <td className="border border-slate-200 px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(item._id)}
                            className="p-2 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition"
                            title="Edit POD"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          
                          <button
                            onClick={() => handleApprove(item._id)}
                            className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                            title="Approve POD"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          
                          <button
                            onClick={() => handleDelete(item._id, item.podNo)}
                            disabled={deleteLoading === item._id}
                            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition disabled:opacity-50"
                            title="Delete POD"
                          >
                            {deleteLoading === item._id ? (
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
                    <td colSpan="17" className="border border-slate-200 px-4 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center">
                        <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-lg font-medium mb-2">No PODs found</p>
                        <p className="text-sm mb-4">Get started by creating your first POD entry</p>
                        <button
                          onClick={handleCreateNew}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition text-sm font-bold"
                        >
                          Create New POD
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {podList.length > 0 && (
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-sm text-slate-600">
              Total {podList.length} POD{podList.length !== 1 ? 's' : ''} found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}