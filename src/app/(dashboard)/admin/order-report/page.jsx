"use client";

import { useState, useEffect, useMemo } from "react";

export default function OrderPanelTable() {
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
      const res = await fetch('/api/order-panel', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
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

  // Transform API data to match table structure
// Transform API data to match table structure
const transformedOrders = useMemo(() => {
  return orders.flatMap(order => {
    // If order has plantRows, create a row for each plant
    if (order.plantRows && order.plantRows.length > 0) {
      return order.plantRows.map((row, index) => ({
        id: `${order._id}-${index}`,
        date: order.date ? new Date(order.date).toLocaleDateString('en-GB') : 'N/A',
        orderNo: order.orderPanelNo || 'N/A',
        branchName: order.branchName || order.branch || 'N/A',
        partyName: order.partyName || order.customerName || 'N/A',
        plantCode: row.plantCode || row.plantCodeValue || 'N/A',  // Fixed: try plantCode first
        orderType: row.orderType || 'Sales',
        pinCode: row.pinCode || 'N/A',
        from: row.fromName || row.from || 'N/A',  // Fixed: try fromName first
        to: row.toName || row.to || 'N/A',        // Fixed: try toName first
        district: row.districtName || row.district || 'N/A',  // Fixed: try districtName first
        state: row.stateName || row.state || 'N/A',  // Fixed: try stateName first
        weight: row.weight || 0,
        orderStatus: row.status || 'Open',
        delivery: order.delivery || 'Normal',
        pendingSince: calculatePendingSince(order.date, row.status),
        placement: 'Pending',
        originalOrder: order,
        originalRow: row
      }));
    }
    
    // If no plantRows, create a single row with main order data
    return [{
      id: order._id,
      date: order.date ? new Date(order.date).toLocaleDateString('en-GB') : 'N/A',
      orderNo: order.orderPanelNo || 'N/A',
      branchName: order.branchName || order.branch || 'N/A',
      partyName: order.partyName || order.customerName || 'N/A',
      plantCode: 'N/A',
      orderType: 'Sales',
      pinCode: 'N/A',
      from: 'N/A',
      to: 'N/A',
      district: 'N/A',
      state: 'N/A',
      weight: order.totalWeight || 0,
      orderStatus: order.panelStatus || 'Draft',
      delivery: order.delivery || 'Normal',
      pendingSince: calculatePendingSince(order.date, order.panelStatus),
      placement: 'Pending',
      originalOrder: order
    }];
  });
}, [orders]);

  // Calculate pending days
  function calculatePendingSince(orderDate, status) {
    if (!orderDate || status === 'Completed' || status === 'Cancelled') return '0 Days';
    
    const created = new Date(orderDate);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return `${diffDays} Days`;
  }

  // Filter orders
  const filteredOrders = useMemo(() => {
    return transformedOrders.filter(order => {
      // Search filter
      const searchMatch = searchTerm === "" || 
        order.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.plantCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.to.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const statusMatch = statusFilter === "all" || order.orderStatus === statusFilter;

      // Delivery filter
      const deliveryMatch = deliveryFilter === "all" || order.delivery === deliveryFilter;

      // Date range filter
      let dateMatch = true;
      if (dateFrom || dateTo) {
        const orderDateParts = order.date.split('/');
        if (orderDateParts.length === 3) {
          const orderDateObj = new Date(
            parseInt(orderDateParts[2]), 
            parseInt(orderDateParts[1]) - 1, 
            parseInt(orderDateParts[0])
          );
          
          if (dateFrom) {
            const fromDate = new Date(dateFrom);
            if (orderDateObj < fromDate) dateMatch = false;
          }
          if (dateTo) {
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59);
            if (orderDateObj > toDate) dateMatch = false;
          }
        }
      }

      return searchMatch && statusMatch && deliveryMatch && dateMatch;
    });
  }, [transformedOrders, searchTerm, statusFilter, deliveryFilter, dateFrom, dateTo]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Order Panel Management</h1>
        <p className="text-sm text-slate-600 mt-1">View and manage all order panels</p>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Order No, Party, Plant..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Order Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">All Status</option>
              <option value="Open">Open</option>
              <option value="Hold">Hold</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Delivery Type</label>
            <select
              value={deliveryFilter}
              onChange={(e) => setDeliveryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">All Types</option>
              <option value="Urgent">Urgent</option>
              <option value="Express">Express</option>
              <option value="Normal">Normal</option>
              <option value="Scheduled">Scheduled</option>
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
            Showing {paginatedOrders.length} of {filteredOrders.length} entries
          </div>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-sky-600 text-white text-sm font-semibold rounded-lg hover:bg-sky-700 transition"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto"></div>
            <p className="mt-2 text-sm text-slate-600">Loading orders...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchOrders}
              className="mt-2 px-4 py-2 bg-sky-600 text-white rounded-lg text-sm"
            >
              Retry
            </button>
          </div>
        ) : paginatedOrders.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-600">No orders found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600">Date</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600">Order No</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600">Branch Name</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600">Party Name</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600">Plant Code</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600">Order Type</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600">Pin Code</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600">From</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600">To</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600">District</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600">State</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600">Weight</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600">Order Status</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600">Delivery</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600">Pending Since</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600">Placement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2 text-slate-600">{order.date}</td>
                      <td className="px-3 py-2 font-medium text-slate-900">{order.orderNo}</td>
                      <td className="px-3 py-2 text-slate-600">{order.branchName}</td>
                      <td className="px-3 py-2 text-slate-600">{order.partyName}</td>
                      <td className="px-3 py-2 text-slate-600">{order.plantCode}</td>
                      <td className="px-3 py-2 text-slate-600">{order.orderType}</td>
                      <td className="px-3 py-2 text-slate-600">{order.pinCode}</td>
                      <td className="px-3 py-2 text-slate-600">{order.from}</td>
                      <td className="px-3 py-2 text-slate-600">{order.to}</td>
                      <td className="px-3 py-2 text-slate-600">{order.district}</td>
                      <td className="px-3 py-2 text-slate-600">{order.state}</td>
                      <td className="px-3 py-2 font-medium text-slate-900">{order.weight}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${getDeliveryColor(order.delivery)}`}>
                          {order.delivery}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-600">{order.pendingSince}</td>
                      <td className="px-3 py-2">
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
              <div className="px-4 py-3 border-t border-slate-200 flex justify-between items-center">
                <div className="text-sm text-slate-600">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-slate-300 rounded-lg text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-slate-300 rounded-lg text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-3">
          <div className="text-xs text-slate-600">Total Orders</div>
          <div className="text-xl font-bold text-slate-900">{filteredOrders.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-3">
          <div className="text-xs text-slate-600">Total Weight</div>
          <div className="text-xl font-bold text-slate-900">
            {filteredOrders.reduce((sum, order) => sum + (order.weight || 0), 0).toFixed(2)}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-3">
          <div className="text-xs text-slate-600">Open Orders</div>
          <div className="text-xl font-bold text-green-600">
            {filteredOrders.filter(o => o.orderStatus === 'Open').length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-3">
          <div className="text-xs text-slate-600">Urgent Deliveries</div>
          <div className="text-xl font-bold text-red-600">
            {filteredOrders.filter(o => o.delivery === 'Urgent').length}
          </div>
        </div>
      </div>
    </div>
  );
}