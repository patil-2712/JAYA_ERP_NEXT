"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

export default function OrderPanelTable() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deliveryFilter, setDeliveryFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Use the table=true parameter to get flattened data
      const res = await fetch('/api/order-panel?table=true', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      console.log('API Response:', data); // For debugging
      
      if (data.success && Array.isArray(data.data)) {
        setOrders(data.data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Search filter
      const searchMatch = searchTerm === "" || 
        order.orderNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.partyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.plantCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.from && order.from.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.to && order.to.toLowerCase().includes(searchTerm.toLowerCase()));

      // Status filter
      const statusMatch = statusFilter === "all" || order.status === statusFilter || order.panelStatus === statusFilter;

      // Delivery filter
      const deliveryMatch = deliveryFilter === "all" || order.delivery === deliveryFilter;

      // Date range filter
      let dateMatch = true;
      if (dateFrom || dateTo) {
        const orderDate = new Date(order.date);
        
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

      return searchMatch && statusMatch && deliveryMatch && dateMatch;
    });
  }, [orders, searchTerm, statusFilter, deliveryFilter, dateFrom, dateTo]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage]);

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'Open': 'bg-green-100 text-green-800',
      'Hold': 'bg-yellow-100 text-yellow-800',
      'Cancelled': 'bg-red-100 text-red-800',
      'Completed': 'bg-purple-100 text-purple-800',
      'Draft': 'bg-gray-100 text-gray-800',
      'Submitted': 'bg-blue-100 text-blue-800',
      'Approved': 'bg-emerald-100 text-emerald-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Get delivery color
  const getDeliveryColor = (delivery) => {
    const colors = {
      'Urgent': 'bg-red-100 text-red-800',
      'Express': 'bg-orange-100 text-orange-800',
      'Normal': 'bg-blue-100 text-blue-800',
      'Scheduled': 'bg-purple-100 text-purple-800'
    };
    return colors[delivery] || 'bg-gray-100 text-gray-800';
  };

  const handleViewOrder = (orderId) => {
    // Extract the original order ID (remove the -index suffix)
    const originalId = orderId.split('-')[0];
    router.push(`/admin/order-panel/${originalId}`);
  };

  const handleCreateNew = () => {
    router.push('/admin/order-panel');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* ===== Sticky Top Bar with Yellow Theme ===== */}
      <div className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-full px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-lg font-extrabold text-slate-900">
              Order Panel Management
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              View and manage all order panels
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCreateNew}
              className="rounded-xl bg-yellow-400 px-5 py-2 text-sm font-bold text-slate-900 hover:bg-yellow-500 transition"
            >
              + Create New Order
            </button>
            <button
              onClick={fetchOrders}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              ↻ Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ===== Main Content ===== */}
      <div className="mx-auto max-w-full p-4">
        {/* Filters Card */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm mb-4">
          <div className="border-b border-slate-100 px-4 py-3">
            <div className="text-sm font-extrabold text-slate-900">Filters</div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Search</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Order No, Party, Plant..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Order Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                >
                  <option value="all">All Status</option>
                  <option value="Open">Open</option>
                  <option value="Hold">Hold</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Completed">Completed</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Delivery Type</label>
                <select
                  value={deliveryFilter}
                  onChange={(e) => setDeliveryFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                >
                  <option value="all">All Types</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Express">Express</option>
                  <option value="Normal">Normal</option>
                  <option value="Scheduled">Scheduled</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Date From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Date To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-slate-600">
                Showing {paginatedOrders.length} of {filteredOrders.length} entries
              </div>
            </div>
          </div>
        </div>

        {/* Table Card with Yellow Theme */}
        <div className="rounded-2xl border border-yellow-300 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
              <p className="mt-3 text-sm text-slate-600">Loading orders...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-red-600 font-medium">{error}</p>
              <button
                onClick={fetchOrders}
                className="mt-3 rounded-xl bg-yellow-400 px-4 py-2 text-sm font-bold text-slate-900 hover:bg-yellow-500 transition"
              >
                Retry
              </button>
            </div>
          ) : paginatedOrders.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-slate-600">No orders found</p>
              <button
                onClick={handleCreateNew}
                className="mt-3 rounded-xl bg-yellow-400 px-4 py-2 text-sm font-bold text-slate-900 hover:bg-yellow-500 transition"
              >
                Create Your First Order
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-yellow-400 sticky top-0 z-10">
                    <tr>
                      <th className="border border-yellow-500 px-3 py-3 text-left text-xs font-extrabold text-slate-900">Date</th>
                      <th className="border border-yellow-500 px-3 py-3 text-left text-xs font-extrabold text-slate-900">Order No</th>
                      <th className="border border-yellow-500 px-3 py-3 text-left text-xs font-extrabold text-slate-900">Branch</th>
                      <th className="border border-yellow-500 px-3 py-3 text-left text-xs font-extrabold text-slate-900">Party Name</th>
                      <th className="border border-yellow-500 px-3 py-3 text-left text-xs font-extrabold text-slate-900">Plant</th>
                      <th className="border border-yellow-500 px-3 py-3 text-left text-xs font-extrabold text-slate-900">Type</th>
                      <th className="border border-yellow-500 px-3 py-3 text-left text-xs font-extrabold text-slate-900">Pin</th>
                      <th className="border border-yellow-500 px-3 py-3 text-left text-xs font-extrabold text-slate-900">From</th>
                      <th className="border border-yellow-500 px-3 py-3 text-left text-xs font-extrabold text-slate-900">To</th>
                      <th className="border border-yellow-500 px-3 py-3 text-left text-xs font-extrabold text-slate-900">District</th>
                      <th className="border border-yellow-500 px-3 py-3 text-left text-xs font-extrabold text-slate-900">State</th>
                      <th className="border border-yellow-500 px-3 py-3 text-left text-xs font-extrabold text-slate-900">Weight</th>
                      <th className="border border-yellow-500 px-3 py-3 text-left text-xs font-extrabold text-slate-900">Status</th>
                      <th className="border border-yellow-500 px-3 py-3 text-left text-xs font-extrabold text-slate-900">Delivery</th>
                      <th className="border border-yellow-500 px-3 py-3 text-left text-xs font-extrabold text-slate-900">Pending</th>
                      <th className="border border-yellow-500 px-3 py-3 text-left text-xs font-extrabold text-slate-900">Placement</th>
                      
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-yellow-100">
                    {paginatedOrders.map((order, index) => (
                      <tr 
                        key={order._id} 
                        className={`hover:bg-yellow-50 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                      >
                        <td className="border border-yellow-300 px-3 py-2 text-slate-600">
                          {new Date(order.date).toLocaleDateString('en-GB')}
                        </td>
                        <td className="border border-yellow-300 px-3 py-2 font-medium text-slate-900">{order.orderNo}</td>
                        <td className="border border-yellow-300 px-3 py-2 text-slate-600">{order.branchName}</td>
                        <td className="border border-yellow-300 px-3 py-2 text-slate-600">{order.partyName}</td>
                        <td className="border border-yellow-300 px-3 py-2 text-slate-600">{order.plantCode}</td>
                        <td className="border border-yellow-300 px-3 py-2 text-slate-600">{order.orderType}</td>
                        <td className="border border-yellow-300 px-3 py-2 text-slate-600">{order.pinCode}</td>
                        <td className="border border-yellow-300 px-3 py-2 text-slate-600">{order.from}</td>
                        <td className="border border-yellow-300 px-3 py-2 text-slate-600">{order.to}</td>
                        <td className="border border-yellow-300 px-3 py-2 text-slate-600">{order.district}</td>
                        <td className="border border-yellow-300 px-3 py-2 text-slate-600">{order.state}</td>
                        <td className="border border-yellow-300 px-3 py-2 font-medium text-slate-900">{order.weight}</td>
                        <td className="border border-yellow-300 px-3 py-2">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status || order.panelStatus)}`}>
                            {order.status || order.panelStatus}
                          </span>
                        </td>
                        <td className="border border-yellow-300 px-3 py-2">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${getDeliveryColor(order.delivery)}`}>
                            {order.delivery}
                          </span>
                        </td>
                        <td className="border border-yellow-300 px-3 py-2 text-slate-600">{order.pendingSince}</td>
                        <td className="border border-yellow-300 px-3 py-2">
                          <span className="inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                            {order.placement}
                          </span>
                        </td>
                       
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="border-t border-yellow-300 px-4 py-3 flex justify-between items-center bg-white">
                  <div className="text-sm text-slate-600">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="rounded-lg border border-yellow-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-yellow-50 disabled:opacity-50 disabled:hover:bg-white transition"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="rounded-lg border border-yellow-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-yellow-50 disabled:opacity-50 disabled:hover:bg-white transition"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      
      </div>
    </div>
  );
}