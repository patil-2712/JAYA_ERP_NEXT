'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RateMasterPage() {
  const router = useRouter();
  
  // Form state
  const [title, setTitle] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [weightRule, setWeightRule] = useState('all_weights');
  const [approvalOption, setApprovalOption] = useState('contract_rate');
  
  // Edit mode state
  const [editingId, setEditingId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Data state
  const [customers, setCustomers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [rateMasters, setRateMasters] = useState([]);
  const [filteredMasters, setFilteredMasters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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
        setFilteredMasters(data.data);
      } else {
        setRateMasters([]);
        setFilteredMasters([]);
      }
    } catch (error) {
      console.error('Error fetching rate masters:', error);
      setError('Failed to load rate masters');
    } finally {
      setLoading(false);
    }
  };

  // Search filter
  useEffect(() => {
    if (searchTerm) {
      const filtered = rateMasters.filter(master =>
        master.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMasters(filtered);
    } else {
      setFilteredMasters(rateMasters);
    }
  }, [searchTerm, rateMasters]);

  useEffect(() => {
    fetchCustomers();
    fetchBranches();
    fetchRateMasters();
  }, []);

  // Reset form
  const resetForm = () => {
    setTitle('');
    setCustomerId('');
    setBranchId('');
    setWeightRule('all_weights');
    setApprovalOption('contract_rate');
    setEditingId(null);
    setIsEditing(false);
    setError(null);
  };

  // Edit Rate Master - Load data into form
  const handleEdit = (master) => {
    setEditingId(master._id);
    setTitle(master.title);
    setCustomerId(master.customerId);
    setBranchId(master.branchId);
    setWeightRule(master.weightRule || 'all_weights');
    setApprovalOption(master.approvalOption || 'contract_rate');
    setIsEditing(true);
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Update Rate Master
  const handleUpdate = async (e) => {
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
    if (!approvalOption) {
      setError('Please select approval option');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const payload = {
        title: title.trim(),
        customerId: customerId,
        branchId: branchId,
        weightRule: weightRule,
        approvalOption: approvalOption,
      };
      
      const res = await fetch(`/api/rate-master?id=${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update rate master');
      }
      
      setSuccess('Rate master updated successfully!');
      resetForm();
      fetchRateMasters();
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
    } catch (error) {
      console.error('Error updating rate master:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Create Rate Master
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
    if (!approvalOption) {
      setError('Please select approval option');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const payload = {
        title: title.trim(),
        customerId: customerId,
        branchId: branchId,
        weightRule: weightRule,
        approvalOption: approvalOption,
        locationRates: []
      };
      
      const res = await fetch('/api/rate-master', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create rate master');
      }
      
      setSuccess('Rate master created successfully!');
      resetForm();
      fetchRateMasters();
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
    } catch (error) {
      console.error('Error creating rate master:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
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

  // Helper function to get weight rule label
  const getWeightRuleLabel = (rule) => {
    return rule === 'above_25' ? 'Above 25 kg' : 'All Weights';
  };

  // Helper function to get approval option label
  const getApprovalLabel = (option) => {
    return option === 'contract_rate' ? 'Contract Rate' : 'Mail Approval';
  };

  return (
    <div className="container mx-auto p-4">
      {/* Create/Edit Form Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            {isEditing ? 'Edit Rate Master' : 'Create Rate Master'}
          </h1>
          <p className="text-gray-600">
            {isEditing ? 'Update rate master information' : 'Enter basic information'}
          </p>
        </div>
        
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
        
        <form onSubmit={isEditing ? handleUpdate : handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title Field */}
            <div>
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
                autoFocus
              />
            </div>

            {/* Customer Name Field */}
            <div>
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

            {/* Branch Field */}
            <div>
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

            {/* Weight Rule Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight Rule <span className="text-red-500">*</span>
              </label>
              <select
                value={weightRule}
                onChange={(e) => setWeightRule(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="all_weights">All Weights</option>
                <option value="above_25">Above 25 kg</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {weightRule === 'above_25' 
                  ? 'Only applicable for weights above 25 kg (25, 26, 27...)' 
                  : 'Applicable for all weight ranges'}
              </p>
            </div>

            {/* Approval Option Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Approval Option <span className="text-red-500">*</span>
              </label>
              <select
                value={approvalOption}
                onChange={(e) => setApprovalOption(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="contract_rate">Contract Rate</option>
                <option value="mail_approval">Mail Approval</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {approvalOption === 'contract_rate' 
                  ? 'Standard contract rate applies' 
                  : 'Requires mail approval for this rate'}
              </p>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded text-white ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Rate Master' : 'Create Rate Master')}
            </button>
            
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 rounded text-gray-700 bg-gray-200 hover:bg-gray-300"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold">Rate Masters List</h2>
          <p className="text-gray-600">All created rate masters</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search by Title
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Type title to search..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading ? (
          <div className="text-center py-8">Loading rate masters...</div>
        ) : filteredMasters.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No rate masters found matching your search' : 'No rate masters found. Create your first rate master!'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 border text-left text-sm font-semibold">S.No</th>
                  <th className="px-4 py-3 border text-left text-sm font-semibold">Title</th>
                  <th className="px-4 py-3 border text-left text-sm font-semibold">Customer</th>
                  <th className="px-4 py-3 border text-left text-sm font-semibold">Branch</th>
                  <th className="px-4 py-3 border text-left text-sm font-semibold">Weight Rule</th>
                  <th className="px-4 py-3 border text-left text-sm font-semibold">Approval</th>
                  <th className="px-4 py-3 border text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 border text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMasters.map((master, index) => (
                  <tr key={master._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border text-sm">{index + 1}</td>
                    <td className="px-4 py-2 border text-sm font-medium">{master.title}</td>
                    <td className="px-4 py-2 border text-sm">{master.customerName}</td>
                    <td className="px-4 py-2 border text-sm">{master.branchName}</td>
                    <td className="px-4 py-2 border text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${
                        master.weightRule === 'above_25' 
                          ? 'bg-orange-100 text-orange-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {getWeightRuleLabel(master.weightRule)}
                      </span>
                    </td>
                    <td className="px-4 py-2 border text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${
                        master.approvalOption === 'contract_rate' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {getApprovalLabel(master.approvalOption)}
                      </span>
                    </td>
                    <td className="px-4 py-2 border text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${
                        master.locationRates?.length > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {master.locationRates?.length || 0} Locations Added
                      </span>
                    </td>
                    <td className="px-4 py-2 border text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/admin/rate-master/rates/${master._id}`)}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-xs"
                        >
                          Add/View Rates
                        </button>
                        <button
                          onClick={() => handleEdit(master)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteRateMaster(master._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}