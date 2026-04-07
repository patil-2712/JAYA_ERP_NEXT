'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RateMasterPage() {
  const router = useRouter();
  
  // State for form data
  const [title, setTitle] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [rateSlabs, setRateSlabs] = useState([
    { id: Date.now(), fromQty: '', toQty: '', rate: '' }
  ]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Data from APIs
  const [customers, setCustomers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [locations, setLocations] = useState([]);
  const [rateMasters, setRateMasters] = useState([]);

  // Fetch Customers
  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/customers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCustomers(data.data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  // Fetch Branches
  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/branches', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setBranches(data.data);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  // Fetch Locations
  const fetchLocations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/locations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setLocations(data.data);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  // Fetch Rate Masters
  const fetchRateMasters = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/rate-master', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setRateMasters(data.data);
      }
    } catch (error) {
      console.error('Error fetching rate masters:', error);
      setError('Failed to load rate masters');
    } finally {
      setLoading(false);
    }
  };

  // Add new rate slab
  const addRateSlab = () => {
    setRateSlabs([
      ...rateSlabs,
      { id: Date.now(), fromQty: '', toQty: '', rate: '' }
    ]);
  };

  // Remove rate slab
  const removeRateSlab = (id) => {
    if (rateSlabs.length > 1) {
      setRateSlabs(rateSlabs.filter(slab => slab.id !== id));
    } else {
      alert("At least one rate slab is required");
    }
  };

  // Update rate slab
  const updateRateSlab = (id, field, value) => {
    setRateSlabs(rateSlabs.map(slab => 
      slab.id === id ? { ...slab, [field]: value } : slab
    ));
  };

  // Reset form
  const resetForm = () => {
    setTitle('');
    setCustomerId('');
    setBranchId('');
    setLocationId('');
    setRateSlabs([{ id: Date.now(), fromQty: '', toQty: '', rate: '' }]);
    setEditingId(null);
    setError(null);
    setSuccess(null);
  };

  // Check for overlaps in real-time
  const checkForOverlaps = () => {
    const sorted = [...rateSlabs].sort((a, b) => parseFloat(a.fromQty || 0) - parseFloat(b.fromQty || 0));
    
    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];
      
      if (current.fromQty && current.toQty && next.fromQty && next.toQty) {
        if (parseFloat(current.toQty) >= parseFloat(next.fromQty)) {
          return `⚠️ Warning: Range ${current.fromQty}-${current.toQty} overlaps with ${next.fromQty}-${next.toQty}`;
        }
      }
    }
    return null;
  };

  const overlapWarning = checkForOverlaps();

  // Handle Submit (Create/Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Please enter rate master title');
      return;
    }
    
    if (!customerId) {
      setError('Please select a customer');
      return;
    }
    
    if (!branchId) {
      setError('Please select a branch');
      return;
    }
    
    if (!locationId) {
      setError('Please select a location');
      return;
    }
    
    // Validate rate slabs - check for empty values
    for (let slab of rateSlabs) {
      if (!slab.fromQty || !slab.toQty || !slab.rate) {
        setError('Please fill all rate slab fields');
        return;
      }
      if (parseFloat(slab.fromQty) >= parseFloat(slab.toQty)) {
        setError('From quantity must be less than To quantity');
        return;
      }
      if (parseFloat(slab.fromQty) < 0 || parseFloat(slab.toQty) < 0) {
        setError('Quantities cannot be negative');
        return;
      }
    }
    
    // Check for overlapping ranges
    const sortedSlabs = [...rateSlabs].sort((a, b) => parseFloat(a.fromQty) - parseFloat(b.fromQty));
    
    for (let i = 0; i < sortedSlabs.length - 1; i++) {
      const current = sortedSlabs[i];
      const next = sortedSlabs[i + 1];
      
      if (parseFloat(current.toQty) >= parseFloat(next.fromQty)) {
        setError(`Rate slabs overlap: Range ${current.fromQty} - ${current.toQty} overlaps with ${next.fromQty} - ${next.toQty}`);
        return;
      }
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const url = editingId ? `/api/rate-master?id=${editingId}` : '/api/rate-master';
      const method = editingId ? 'PUT' : 'POST';
      
      const payload = {
        title: title.trim(),
        customerId,
        branchId,
        locationId,
        rateSlabs: rateSlabs.map(slab => ({
          fromQty: parseFloat(slab.fromQty),
          toQty: parseFloat(slab.toQty),
          rate: parseFloat(slab.rate)
        }))
      };
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || `Failed to ${editingId ? 'update' : 'create'} rate master`);
      }
      
      setSuccess(`Rate master ${editingId ? 'updated' : 'created'} successfully!`);
      resetForm();
      fetchRateMasters();
      
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (error) {
      console.error('Error saving rate master:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Edit Rate Master
  const editRateMaster = (rateMaster) => {
    setTitle(rateMaster.title);
    setCustomerId(rateMaster.customerId);
    setBranchId(rateMaster.branchId);
    setLocationId(rateMaster.locationId);
    setRateSlabs(rateMaster.rateSlabs.map(slab => ({
      id: Date.now() + Math.random(),
      fromQty: slab.fromQty.toString(),
      toQty: slab.toQty.toString(),
      rate: slab.rate.toString()
    })));
    setEditingId(rateMaster._id);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete Rate Master
  const deleteRateMaster = async (id) => {
    if (!confirm('Are you sure you want to delete this rate master?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/rate-master?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete rate master');
      }
      fetchRateMasters();
      setSuccess('Rate master deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error deleting rate master:', error);
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchBranches();
    fetchLocations();
    fetchRateMasters();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Rate Master</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}
      
      {/* Add/Edit Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? 'Edit Rate Master' : 'Create New Rate Master'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter rate master title"
                required
              />
            </div>
            
            {/* Customer Dropdown */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Customer</option>
                {customers.map((customer) => (
                  <option key={customer._id} value={customer._id}>
                    {customer.customerName} ({customer.customerCode})
                  </option>
                ))}
              </select>
            </div>
            
            {/* Branch Dropdown */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Branch <span className="text-red-500">*</span>
              </label>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Branch</option>
                {branches.map((branch) => (
                  <option key={branch._id} value={branch._id}>
                    {branch.name} ({branch.code})
                  </option>
                ))}
              </select>
            </div>
            
            {/* Location Dropdown */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Location</option>
                {locations.map((location) => (
                  <option key={location._id} value={location._id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Rate Slabs Section */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rate Slabs <span className="text-red-500">*</span>
            </label>
            
            {overlapWarning && (
              <div className="mb-3 p-2 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded text-sm">
                {overlapWarning}
              </div>
            )}
            
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 border text-left text-sm font-medium text-gray-700">
                      From Weight
                    </th>
                    <th className="px-4 py-2 border text-left text-sm font-medium text-gray-700">
                      To Weight
                    </th>
                    <th className="px-4 py-2 border text-left text-sm font-medium text-gray-700">
                      Rate
                    </th>
                    <th className="px-4 py-2 border text-left text-sm font-medium text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rateSlabs.map((slab) => (
                    <tr key={slab.id}>
                      <td className="px-4 py-2 border">
                        <input
                          type="number"
                          value={slab.fromQty}
                          onChange={(e) => updateRateSlab(slab.id, 'fromQty', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="From"
                          step="1"
                          min="0"
                          required
                        />
                      </td>
                      <td className="px-4 py-2 border">
                        <input
                          type="number"
                          value={slab.toQty}
                          onChange={(e) => updateRateSlab(slab.id, 'toQty', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="To"
                          step="1"
                          min="0"
                          required
                        />
                      </td>
                      <td className="px-4 py-2 border">
                        <input
                          type="number"
                          value={slab.rate}
                          onChange={(e) => updateRateSlab(slab.id, 'rate', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Rate"
                          step="0.01"
                          min="0"
                          required
                        />
                      </td>
                      <td className="px-4 py-2 border text-center">
                        <button
                          type="button"
                          onClick={() => removeRateSlab(slab.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <button
              type="button"
              onClick={addRateSlab}
              className="mt-3 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm"
            >
              + Add 
            </button>
            
            <p className="text-xs text-gray-500 mt-2">
              Tip: Weight ranges should not overlap (e.g., 0-100, 101-500, 501-1000)
            </p>
          </div>
          
          {/* Form Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded text-white ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {loading ? 'Saving...' : (editingId ? 'Update Rate Master' : 'Create Rate Master')}
            </button>
            
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      
      {/* Rate Masters List - Table Format */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Rate Masters List</h2>
        
        {loading ? (
          <div className="text-center py-4">Loading rate masters...</div>
        ) : rateMasters.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No rate masters found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 border text-left text-sm font-semibold text-gray-700">S.No</th>
                  <th className="px-4 py-3 border text-left text-sm font-semibold text-gray-700">Title</th>
                  <th className="px-4 py-3 border text-left text-sm font-semibold text-gray-700">Customer Name</th>
                  <th className="px-4 py-3 border text-left text-sm font-semibold text-gray-700">Branch</th>
                  <th className="px-4 py-3 border text-left text-sm font-semibold text-gray-700">Location</th>
                  <th className="px-4 py-3 border text-left text-sm font-semibold text-gray-700">From Weight</th>
                  <th className="px-4 py-3 border text-left text-sm font-semibold text-gray-700">To Weight</th>
                  <th className="px-4 py-3 border text-left text-sm font-semibold text-gray-700">Rate</th>
                  <th className="px-4 py-3 border text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rateMasters.map((rateMaster, index) => (
                  <React.Fragment key={rateMaster._id}>
                    {/* Main row for Title, Customer, Branch, Location */}
                    <tr className="hover:bg-gray-50">
                      <td rowSpan={rateMaster.rateSlabs.length} className="px-4 py-2 border align-top text-sm">
                        {index + 1}
                       </td>
                      <td rowSpan={rateMaster.rateSlabs.length} className="px-4 py-2 border align-top text-sm font-medium">
                        {rateMaster.title}
                       </td>
                      <td rowSpan={rateMaster.rateSlabs.length} className="px-4 py-2 border align-top text-sm">
                        {rateMaster.customerName || '-'}
                       </td>
                      <td rowSpan={rateMaster.rateSlabs.length} className="px-4 py-2 border align-top text-sm">
                        {rateMaster.branchName || '-'}
                       </td>
                      <td rowSpan={rateMaster.rateSlabs.length} className="px-4 py-2 border align-top text-sm">
                        {rateMaster.locationName || '-'}
                       </td>
                      {/* First rate slab row */}
                      <td className="px-4 py-2 border text-sm text-center">
                        {rateMaster.rateSlabs[0]?.fromQty}
                       </td>
                      <td className="px-4 py-2 border text-sm text-center">
                        {rateMaster.rateSlabs[0]?.toQty}
                       </td>
                      <td className="px-4 py-2 border text-sm text-center">
                        {rateMaster.rateSlabs[0]?.rate}
                       </td>
                      <td rowSpan={rateMaster.rateSlabs.length} className="px-4 py-2 border align-top text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => editRateMaster(rateMaster)}
                            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteRateMaster(rateMaster._id)}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                       </td>
                    </tr>
                    {/* Additional rate slab rows */}
                    {rateMaster.rateSlabs.slice(1).map((slab, slabIndex) => (
                      <tr key={`${rateMaster._id}-slab-${slabIndex}`} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border text-sm text-center">{slab.fromQty}</td>
                        <td className="px-4 py-2 border text-sm text-center">{slab.toQty}</td>
                        <td className="px-4 py-2 border text-sm text-center">{slab.rate}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Add React import for Fragment
import React from 'react';