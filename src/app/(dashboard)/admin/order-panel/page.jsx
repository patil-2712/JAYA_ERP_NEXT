"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function OrderPanelList() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/order-panel?table=true', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = await res.json();
      
      if (data.success) {
        setOrders(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (orderId, orderNo) => {
    if (!confirm(`Are you sure you want to delete order ${orderNo}?`)) {
      return;
    }

    setDeleteLoading(orderId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/order-panel?id=${orderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.success) {
        // Remove deleted order from list
        setOrders(orders.filter(order => order.originalOrderId !== orderId));
        alert('Order deleted successfully!');
      } else {
        alert(data.message || 'Failed to delete order');
      }
    } catch (err) {
      console.error('Error deleting order:', err);
      alert('Failed to delete order');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEdit = (orderId) => {
    router.push(`/admin/order-panel/${orderId}`);
  };

  const handleCreateNew = () => {
    router.push('/admin/order-panel/create');
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading orders...</p>
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
              Order Panel Management
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Manage all your orders in one place
            </p>
          </div>

          <button
            onClick={handleCreateNew}
            className="rounded-xl bg-yellow-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-yellow-700 transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Order
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

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-yellow-400 border-b border-yellow-500">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider">S.No</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider">Order No</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider">Branch</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider">Party Name</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider">Plant</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider">Order Type</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider">From → To</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider">Weight</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-900 uppercase tracking-wider">Delivery</th>
                  <th className="px-4 py-3 text-center text-xs font-extrabold text-slate-900 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {orders.length > 0 ? (
                  orders.map((order, index) => (
                    <tr key={order._id} className="hover:bg-yellow-50 transition">
                      <td className="px-4 py-3 text-slate-600">{index + 1}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{order.orderNo}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(order.date)}</td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-slate-800">{order.branchName}</div>
                          <div className="text-xs text-slate-500">{order.branchCode}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-slate-800">{order.partyName}</div>
                          <div className="text-xs text-slate-500">{order.customerName}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-slate-800">{order.plantName || 'N/A'}</div>
                          <div className="text-xs text-slate-500">{order.plantCode}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {order.orderType}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <span className="font-medium">{order.from}</span>
                          <span className="mx-1 text-slate-400">→</span>
                          <span className="font-medium">{order.to}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">{order.weight} kg</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'Open' ? 'bg-green-100 text-green-800' :
                          order.status === 'Hold' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.delivery === 'Urgent' ? 'bg-red-100 text-red-800' :
                          order.delivery === 'Express' ? 'bg-purple-100 text-purple-800' :
                          order.delivery === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {order.delivery}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(order.originalOrderId)}
                            className="p-2 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition"
                            title="Edit Order"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(order.originalOrderId, order.orderNo)}
                            disabled={deleteLoading === order.originalOrderId}
                            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition disabled:opacity-50"
                            title="Delete Order"
                          >
                            {deleteLoading === order.originalOrderId ? (
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
                    <td colSpan="12" className="px-4 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center">
                        <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className="text-lg font-medium mb-2">No orders found</p>
                        <p className="text-sm mb-4">Get started by creating your first order</p>
                        <button
                          onClick={handleCreateNew}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition text-sm font-bold"
                        >
                          Create New Order
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {orders.length > 0 && (
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-sm text-slate-600">
              Total {orders.length} order{orders.length !== 1 ? 's' : ''} found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}