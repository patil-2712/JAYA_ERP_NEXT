"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdvancePaymentList() {
  const router = useRouter();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [queueLoading, setQueueLoading] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    fromDate: "",
    toDate: "",
    status: ""
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams({ format: 'table' });
      if (filters.search) params.append('search', filters.search);
      if (filters.fromDate) params.append('fromDate', filters.fromDate);
      if (filters.toDate) params.append('toDate', filters.toDate);
      if (filters.status) params.append('status', filters.status);
      
      const res = await fetch(`/api/Advance-Payment?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.success) {
        setPayments(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch advance payments');
      }
    } catch (err) {
      console.error('Error fetching advance payments:', err);
      setError('Failed to load advance payments');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    fetchPayments();
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      fromDate: "",
      toDate: "",
      status: ""
    });
    setTimeout(() => fetchPayments(), 100);
  };

  const handleDelete = async (paymentId, paymentNo) => {
    if (!confirm(`Are you sure you want to delete Advance Payment ${paymentNo}?`)) {
      return;
    }

    setDeleteLoading(paymentId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/Advance-Payment?id=${paymentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.success) {
        setPayments(payments.filter(item => item._id !== paymentId));
        alert('✅ Advance Payment deleted successfully!');
      } else {
        alert(data.message || 'Failed to delete advance payment');
      }
    } catch (err) {
      console.error('Error deleting advance payment:', err);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleGenerateQueue = async (paymentId, paymentNo) => {
    if (!confirm(`Generate payment queue for ${paymentNo}?`)) {
      return;
    }

    setQueueLoading(paymentId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/Advance-Payment?id=${paymentId}&action=generate-queue`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.success) {
        // Update the payment in the list
        setPayments(payments.map(item => 
          item._id === paymentId 
            ? { ...item, queueGenerated: true, status: 'Paid' } 
            : item
        ));
        alert('✅ Payment queue generated successfully!');
      } else {
        alert(data.message || 'Failed to generate queue');
      }
    } catch (err) {
      console.error('Error generating queue:', err);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setQueueLoading(null);
    }
  };

  const handleEdit = (paymentId) => {
    router.push(`/admin/Advance-Payment/${paymentId}`);
  };
  
  const handleApprove = (paymentId) => {
    router.push(`/admin/Advance-Payment/approve/${paymentId}`);
  };
  
  const handleCreateNew = () => {
    router.push('/admin/Advance-Payment/create');
  };

  const handleView = (paymentId) => {
    router.push(`/admin/Advance-Payment/view/${paymentId}`);
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading advance payments...</p>
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
              Advance Payment Management
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Manage all advance payments in one place
            </p>
          </div>

          <button
            onClick={handleCreateNew}
            className="rounded-xl bg-yellow-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-yellow-700 transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Payment
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
          <h2 className="text-sm font-bold text-slate-700 mb-3">Filter Payments</h2>
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12 md:col-span-3">
              <input
                type="text"
                placeholder="Search by Payment No, Purchase No, Vendor..."
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
                placeholder="From Date"
              />
            </div>
            <div className="col-span-12 md:col-span-2">
              <input
                type="date"
                value={filters.toDate}
                onChange={(e) => handleFilterChange('toDate', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
                placeholder="To Date"
              />
            </div>
            <div className="col-span-12 md:col-span-2">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Paid">Paid</option>
                <option value="Completed">Completed</option>
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
                title="Clear Filters"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-yellow-400 border-b border-yellow-500">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider">S.No</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider">Payment No</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider">Purchase No</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider">Vendor</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider">Vehicle</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider">Advance</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider">Balance</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider">Final</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider">Queue</th>
                  <th className="px-4 py-3 text-center text-xs font-extrabold text-slate-900 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {payments.length > 0 ? (
                  payments.map((item, index) => (
                    <tr key={item._id} className="hover:bg-yellow-50 transition">
                      <td className="px-4 py-3 text-slate-600">{index + 1}</td>
                      <td className="px-4 py-3 text-slate-600">{item.date}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{item.paymentNo}</td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-slate-800">{item.purchaseNo}</div>
                          <div className="text-xs text-slate-500">{item.pricingSerialNo}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-slate-800">{item.vendorName}</div>
                          <div className="text-xs text-slate-500">{item.vendorCode}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">{item.vehicleNo}</td>
                      <td className="px-4 py-3 font-medium">{formatCurrency(item.amount)}</td>
                      <td className="px-4 py-3 font-medium text-blue-600">{formatCurrency(item.advance)}</td>
                      <td className="px-4 py-3 font-medium text-purple-600">{formatCurrency(item.balance)}</td>
                      <td className="px-4 py-3 font-bold text-emerald-600">{formatCurrency(item.finalAmount)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {item.queueGenerated ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            ✓ Generated
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(item._id)}
                            className="p-2 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition"
                            title="Edit Payment"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleApprove(item._id)}
                            className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                            title="Approve Payment"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(item._id, item.paymentNo)}
                            disabled={deleteLoading === item._id || item.status === 'Paid' || item.status === 'Completed'}
                            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition disabled:opacity-50"
                            title="Delete Payment"
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
                    <td colSpan="13" className="px-4 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center">
                        <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-lg font-medium mb-2">No advance payments found</p>
                        <p className="text-sm mb-4">Get started by creating your first advance payment</p>
                        <button
                          onClick={handleCreateNew}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition text-sm font-bold"
                        >
                          Create New Payment
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {payments.length > 0 && (
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-sm text-slate-600">
              Total {payments.length} advance payment{payments.length !== 1 ? 's' : ''} found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}