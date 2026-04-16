'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditRateMasterPage() {
  const router = useRouter();
  const params = useParams();
  
  // Form state
  const [title, setTitle] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [weightRule, setWeightRule] = useState('all_weights');
  const [approvalOption, setApprovalOption] = useState('contract_rate');
  
  // Data state
  const [customers, setCustomers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch Rate Master Details
  const fetchRateMaster = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/rate-master?id=${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (data.success && data.data) {
        setTitle(data.data.title);
        setCustomerId(data.data.customerId);
        setBranchId(data.data.branchId);
        setWeightRule(data.data.weightRule || 'all_weights');
        setApprovalOption(data.data.approvalOption || 'contract_rate');
      } else {
        setError('Rate master not found');
      }
    } catch (error) {
      console.error('Error fetching rate master:', error);
      setError('Failed to load rate master');
    } finally {
      setFetching(false);
    }
  };

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

  useEffect(() => {
    if (params.id) {
      fetchRateMaster();
      fetchCustomers();
      fetchBranches();
    }
  }, [params.id]);

  // Update Rate Master
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
      };
      
      const res = await fetch(`/api/rate-master?id=${params.id}`, {
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
      
      setTimeout(() => {
        router.push('/admin/rate-master/list');
      }, 1500);
      
    } catch (error) {
      console.error('Error updating rate master:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-8">Loading rate master details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Edit Rate Master</h1>
              <p className="text-gray-600">Update basic information</p>
            </div>
            <button
              onClick={() => router.push('/admin/rate-master/list')}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              ← Back to List
            </button>
          </div>
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
        
        <form onSubmit={handleSubmit}>
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
              {loading ? 'Updating...' : 'Update Rate Master'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/rate-master/list')}
              className="px-6 py-2 rounded text-gray-700 bg-gray-200 hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}