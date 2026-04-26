"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BalancePaymentList() {
  const router = useRouter();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
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
      
      const res = await fetch(`/api/balance-payment?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = await res.json();
      
      if (data.success) {
        setPayments(data.data || []);
        console.log("Balance Payments:", data.data);
      } else {
        setError(data.message || 'Failed to fetch balance payments');
      }
    } catch (err) {
      console.error('Error fetching balance payments:', err);
      setError('Failed to load balance payments');
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
    setFilters({ search: "", fromDate: "", toDate: "", status: "" });
    setTimeout(() => fetchPayments(), 100);
  };

  const handleDelete = async (paymentId, paymentNo) => {
    if (!confirm(`Are you sure you want to delete Balance Payment ${paymentNo}?`)) {
      return;
    }

    setDeleteLoading(paymentId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/balance-payment?id=${paymentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.success) {
        setPayments(payments.filter(item => item._id !== paymentId));
        alert('✅ Balance Payment deleted successfully!');
      } else {
        alert(data.message || 'Failed to delete');
      }
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEdit = (paymentId) => {
    router.push(`/admin/Balance-Payment/${paymentId}`);
  };

  const handleApprove = (paymentId) => {
    router.push(`/admin/Balance-Payment/approve/${paymentId}`);
  };

  const handleCreateNew = () => {
    router.push('/admin/Balance-Payment/create');
  };

  const getStatusColor = (status) => {
    if (status === 'Completed' || status === 'Paid') return 'bg-green-100 text-green-800';
    if (status === 'Queued') return 'bg-blue-100 text-blue-800';
    if (status === 'Approved') return 'bg-purple-100 text-purple-800';
    if (status === 'Rejected') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
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
            <p className="mt-4 text-slate-600">Loading balance payments...</p>
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
            <h1 className="text-2xl font-extrabold text-slate-900">Balance Payment Management</h1>
            <p className="text-sm text-slate-600 mt-1">Manage all balance payments in one place</p>
          </div>
          <button onClick={handleCreateNew} className="rounded-xl bg-yellow-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-yellow-700 transition flex items-center gap-2">
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
            <div className="col-span-12 md:col-span-4">
              <input type="text" placeholder="Search by Payment No, Purchase No, Vendor..." value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200" />
            </div>
            <div className="col-span-12 md:col-span-2">
              <input type="date" value={filters.fromDate} onChange={(e) => handleFilterChange('fromDate', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200" />
            </div>
            <div className="col-span-12 md:col-span-2">
              <input type="date" value={filters.toDate} onChange={(e) => handleFilterChange('toDate', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200" />
            </div>
            <div className="col-span-12 md:col-span-2">
              <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200">
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Queued">Queued</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Completed">Completed</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
            <div className="col-span-12 md:col-span-2 flex gap-2">
              <button onClick={applyFilters} className="flex-1 rounded-xl bg-yellow-600 px-4 py-2 text-sm font-bold text-white hover:bg-yellow-700 transition">Filter</button>
              <button onClick={clearFilters} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 transition">✕ Clear</button>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-2xl border border-yellow-400 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-yellow-400 border-b-2 border-yellow-500">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-extrabold text-slate-900">S.No</th>
                  <th className="px-3 py-3 text-left text-xs font-extrabold text-slate-900">Payment No</th>
                  <th className="px-3 py-3 text-left text-xs font-extrabold text-slate-900">Date</th>
                  <th className="px-3 py-3 text-left text-xs font-extrabold text-slate-900">Branch</th>
                  <th className="px-3 py-3 text-left text-xs font-extrabold text-slate-900">POD No</th>
                  <th className="px-3 py-3 text-left text-xs font-extrabold text-slate-900">Purchase No</th>
                  <th className="px-3 py-3 text-left text-xs font-extrabold text-slate-900">Vendor Name</th>
                  <th className="px-3 py-3 text-left text-xs font-extrabold text-slate-900">Vendor Code</th>
                  <th className="px-3 py-3 text-left text-xs font-extrabold text-slate-900">From</th>
                  <th className="px-3 py-3 text-left text-xs font-extrabold text-slate-900">To</th>
                  <th className="px-3 py-3 text-right text-xs font-extrabold text-slate-900">Weight</th>
                  <th className="px-3 py-3 text-right text-xs font-extrabold text-slate-900">Total</th>
                  <th className="px-3 py-3 text-right text-xs font-extrabold text-slate-900">Advance</th>
                  <th className="px-3 py-3 text-right text-xs font-extrabold text-slate-900">PO - Addition</th>
                  <th className="px-3 py-3 text-right text-xs font-extrabold text-slate-900">PO - Deduction</th>
                  <th className="px-3 py-3 text-right text-xs font-extrabold text-slate-900">POD - Deductions</th>
                  <th className="px-3 py-3 text-right text-xs font-extrabold text-slate-900">Normal - Balance</th>
                  <th className="px-3 py-3 text-left text-xs font-extrabold text-slate-900">Due - Date</th>
                  <th className="px-3 py-3 text-left text-xs font-extrabold text-slate-900">Transaction ID</th>
                  <th className="px-3 py-3 text-left text-xs font-extrabold text-slate-900">Payment - Date</th>
                  <th className="px-3 py-3 text-center text-xs font-extrabold text-slate-900">Payment</th>
                  <th className="px-3 py-3 text-center text-xs font-extrabold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-yellow-200">
                {payments.length > 0 ? (
                  payments.map((item, index) => (
                    <tr key={item._id} className="hover:bg-yellow-50 transition">
                      <td className="px-3 py-3 text-slate-600">{index + 1}</td>
                      <td className="px-3 py-3 font-medium text-slate-900">{item.balancePaymentNo || '-'}</td>
                      <td className="px-3 py-3 text-slate-600">{item.date || '-'}</td>
                      <td className="px-3 py-3 text-slate-600">{item.branch || '-'}</td>
                      <td className="px-3 py-3 text-slate-600">{item.podNo || '-'}</td>
                      <td className="px-3 py-3 font-medium text-slate-900">{item.purchaseNo || '-'}</td>
                      <td className="px-3 py-3 text-slate-800">{item.vendorName || '-'}</td>
                      <td className="px-3 py-3 text-slate-600">{item.vendorCode || '-'}</td>
                      <td className="px-3 py-3 text-slate-600">{item.from || '-'}</td>
                      <td className="px-3 py-3 text-slate-600">{item.to || '-'}</td>
                      <td className="px-3 py-3 text-right text-slate-600">{item.weight || 0}</td>
                      <td className="px-3 py-3 text-right font-bold text-emerald-700">{formatCurrency(item.amount)}</td>
                      <td className="px-3 py-3 text-right text-blue-600">{formatCurrency(item.advance)}</td>
                      <td className="px-3 py-3 text-right text-green-600">{formatCurrency(item.poAddition || item.totalAddition || 0)}</td>
                      <td className="px-3 py-3 text-right text-orange-600">{formatCurrency(item.poDeduction || item.totalDeduction || 0)}</td>
                      <td className="px-3 py-3 text-right text-red-600">{formatCurrency(item.podDeduction || 0)}</td>
                      <td className="px-3 py-3 text-right font-extrabold text-purple-700">{formatCurrency(item.finalBalance || item.balance || 0)}</td>
                      <td className="px-3 py-3 text-slate-600">{item.dueDate || '-'}</td>
                      <td className="px-3 py-3 font-mono text-xs text-slate-600">{item.transactionId || '-'}</td>
                      <td className="px-3 py-3 text-slate-600">{item.paymentDate || '-'}</td>
                      <td className="px-3 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.paymentStatus)}`}>
                          {item.paymentStatus || 'Pending'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* Edit Button - Sky Blue (same as Pricing Panel) */}
                          <button 
                            onClick={() => handleEdit(item._id)} 
                            className="p-2 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition" 
                            title="Edit Payment"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          
                          {/* Approve Button - Green (same as Pricing Panel) */}
                          <button 
                            onClick={() => handleApprove(item._id)} 
                            className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition" 
                            title="Approve/Review Payment"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          
                          {/* Delete Button - Red (same as Pricing Panel) */}
                          <button 
                            onClick={() => handleDelete(item._id, item.balancePaymentNo)} 
                            disabled={deleteLoading === item._id || item.paymentStatus === 'Completed' || item.paymentStatus === 'Paid'} 
                            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition disabled:opacity-50" 
                            title="Delete Payment"
                          >
                            {deleteLoading === item._id ? 
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700"></div> : 
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            }
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="22" className="px-4 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center">
                        <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-lg font-medium mb-2">No balance payments found</p>
                        <p className="text-sm mb-4">Get started by creating your first balance payment</p>
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
          {payments.length > 0 && (
            <div className="px-4 py-3 bg-yellow-50 border-t border-yellow-200 text-sm text-slate-600">
              Total {payments.length} balance payment{payments.length !== 1 ? 's' : ''} found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}