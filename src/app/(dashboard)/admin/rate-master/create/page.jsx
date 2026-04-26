'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RateMasterManagePage() {
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [weightRule, setWeightRule] = useState('all_weights');
  const [approvalOption, setApprovalOption] = useState('contract_rate');
  
  const [customers, setCustomers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [rateMasters, setRateMasters] = useState([]);
  const [filteredMasters, setFilteredMasters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [locations, setLocations] = useState([]);
  const [sortedLocations, setSortedLocations] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  
  const [selectedMasterId, setSelectedMasterId] = useState(null);
  const [selectedMaster, setSelectedMaster] = useState(null);
  const [locationRows, setLocationRows] = useState([]);
  const [addingRates, setAddingRates] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [locationFilterTerm, setLocationFilterTerm] = useState('');
  
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionRate, setRevisionRate] = useState(null);
  const [revisionFromQty, setRevisionFromQty] = useState('');
  const [revisionToQty, setRevisionToQty] = useState('');
  const [revisionRateValue, setRevisionRateValue] = useState('');
  
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [selectedHistoryLocation, setSelectedHistoryLocation] = useState(null);

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

  const fetchLocations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/locations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const sorted = [...data.data].sort((a, b) => 
          a.name?.toLowerCase().localeCompare(b.name?.toLowerCase())
        );
        setLocations(data.data);
        setSortedLocations(sorted);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

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

  const fetchSingleRateMaster = async (masterId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/rate-master?id=${masterId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (data.success && data.data) {
        setSelectedMaster(data.data);
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching rate master:', error);
      setError('Failed to load rate master details');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (masterId, locationId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/rate-master?id=${masterId}&history=true&locationId=${locationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (data.success) {
        setHistoryData(data.data);
        setShowHistory(true);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      setError('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setFormError('Please enter rate master title');
      return;
    }
    if (!customerId) {
      setFormError('Please select a customer');
      return;
    }
    if (!branchId) {
      setFormError('Please select a branch');
      return;
    }
    if (!approvalOption) {
      setFormError('Please select approval option');
      return;
    }
    
    setLoading(true);
    setFormError(null);
    
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
      
      setFormSuccess('Rate master created successfully!');
      
      setTitle('');
      setCustomerId('');
      setBranchId('');
      setWeightRule('all_weights');
      setApprovalOption('contract_rate');
      
      fetchRateMasters();
      
      setTimeout(() => {
        setFormSuccess(null);
      }, 3000);
      
    } catch (error) {
      console.error('Error creating rate master:', error);
      setFormError(error.message);
      setTimeout(() => setFormError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

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
      
      if (selectedMasterId === id) {
        setSelectedMasterId(null);
        setSelectedMaster(null);
        setShowAddForm(false);
      }
      
      fetchRateMasters();
      setSuccess('Rate master deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error deleting rate master:', error);
      setError(error.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const deleteSingleRate = async (rateId) => {
    if (!confirm('Are you sure you want to delete this rate?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/rate-master?id=${selectedMaster._id}&rateId=${rateId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete rate');
      }
      
      setSuccess('Rate deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
      await fetchSingleRateMaster(selectedMaster._id);
      await fetchRateMasters();
      
    } catch (error) {
      console.error('Error deleting rate:', error);
      setError(error.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const openRevisionModal = (rate) => {
    setRevisionRate(rate);
    setRevisionFromQty(rate.fromQty);
    setRevisionToQty(rate.toQty);
    setRevisionRateValue(rate.rate);
    setShowRevisionModal(true);
  };

  const submitRevision = async () => {
    if (!revisionRate) return;
    
    const fromQty = parseFloat(revisionFromQty);
    const toQty = parseFloat(revisionToQty);
    const rate = parseFloat(revisionRateValue);
    
    if (isNaN(fromQty) || isNaN(toQty) || isNaN(rate)) {
      setError('Please enter valid numbers');
      return;
    }
    
    if (fromQty >= toQty) {
      setError('From quantity must be less than To quantity');
      return;
    }
    
    if (fromQty < 0 || toQty < 0 || rate < 0) {
      setError('Values cannot be negative');
      return;
    }
    
    if (selectedMaster.weightRule === 'above_25' && fromQty < 25) {
      setError(`Weight must start from 25 kg or above`);
      return;
    }
    
    setAddingRates(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      const payload = {
        title: selectedMaster.title,
        customerId: selectedMaster.customerId,
        branchId: selectedMaster.branchId,
        weightRule: selectedMaster.weightRule,
        approvalOption: selectedMaster.approvalOption,
        rateId: revisionRate._id,
        locationRates: [{
          locationId: revisionRate.locationId,
          fromQty: fromQty,
          toQty: toQty,
          rate: rate
        }]
      };
      
      const res = await fetch(`/api/rate-master?id=${selectedMaster._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to revise rate');
      }
      
      setSuccess(`Rate revised successfully! Old rate moved to history.`);
      setTimeout(() => setSuccess(null), 3000);
      
      setShowRevisionModal(false);
      setRevisionRate(null);
      await fetchSingleRateMaster(selectedMaster._id);
      await fetchRateMasters();
      
    } catch (error) {
      console.error('Error revising rate:', error);
      setError(error.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setAddingRates(false);
    }
  };

  const getWeightRuleLabel = (rule) => {
    return rule === 'above_25' ? 'Above 25 kg' : 'All Weights';
  };

  const getApprovalLabel = (option) => {
    return option === 'contract_rate' ? 'Contract Rate' : 'Mail Approval';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const addLocationRow = () => {
    setLocationRows([
      ...locationRows,
      { id: Date.now(), locationId: '', fromQty: '', toQty: '', rate: '' }
    ]);
  };

  const removeLocationRow = (rowId) => {
    if (locationRows.length > 1) {
      setLocationRows(locationRows.filter(row => row.id !== rowId));
    } else {
      setError("At least one location is required");
      setTimeout(() => setError(null), 3000);
    }
  };

  const updateLocationRow = (rowId, field, value) => {
    setLocationRows(locationRows.map(row => 
      row.id === rowId ? { ...row, [field]: value } : row
    ));
  };

  const handleAddRates = async () => {
    if (!selectedMaster) return;
    
    const validRows = locationRows.filter(row => row.locationId && row.fromQty && row.toQty && row.rate);
    
    if (validRows.length === 0) {
      setError('Please add at least one location with complete details');
      return;
    }
    
    const newRates = [];
    for (let row of validRows) {
      const fromQty = parseFloat(row.fromQty);
      const toQty = parseFloat(row.toQty);
      const rate = parseFloat(row.rate);
      
      if (isNaN(fromQty) || isNaN(toQty) || isNaN(rate)) {
        setError('Please enter valid numbers for quantity and rate');
        return;
      }
      
      if (fromQty >= toQty) {
        setError(`From quantity (${fromQty}) must be less than To quantity (${toQty})`);
        return;
      }
      
      if (fromQty < 0 || toQty < 0 || rate < 0) {
        setError('Quantities and rate cannot be negative');
        return;
      }
      
      if (selectedMaster.weightRule === 'above_25' && fromQty < 25) {
        setError(`Weight must start from 25 kg or above. Current from weight: ${fromQty} kg`);
        return;
      }
      
      const location = locations.find(l => l._id === row.locationId);
      newRates.push({
        locationId: row.locationId,
        fromQty,
        toQty,
        rate,
        locationName: location?.name || 'Unknown',
        isActive: true,
        version: 1
      });
    }
    
    setAddingRates(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const existingRates = selectedMaster.locationRates || [];
      const allRates = [...existingRates, ...newRates];
      
      const payload = {
        title: selectedMaster.title,
        customerId: selectedMaster.customerId,
        branchId: selectedMaster.branchId,
        weightRule: selectedMaster.weightRule,
        approvalOption: selectedMaster.approvalOption,
        locationRates: allRates.map(r => ({
          locationId: r.locationId,
          fromQty: r.fromQty,
          toQty: r.toQty,
          rate: r.rate,
          isActive: r.isActive !== undefined ? r.isActive : true,
          version: r.version || 1
        }))
      };
      
      const res = await fetch(`/api/rate-master?id=${selectedMaster._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to add location rates');
      }
      
      setSuccess('Location rates added successfully!');
      setTimeout(() => setSuccess(null), 3000);
      
      setLocationRows([]);
      setShowAddForm(false);
      await fetchSingleRateMaster(selectedMaster._id);
      await fetchRateMasters();
      
    } catch (error) {
      console.error('Error adding location rates:', error);
      setError(error.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setAddingRates(false);
    }
  };

  const viewHistory = async (locationId, locationName) => {
    setSelectedHistoryLocation(locationName);
    await fetchHistory(selectedMaster._id, locationId);
  };

  const handleViewRates = async (masterId) => {
    if (selectedMasterId === masterId) {
      setSelectedMasterId(null);
      setSelectedMaster(null);
      setShowAddForm(false);
      setLocationRows([]);
      setLocationFilterTerm('');
      setShowHistory(false);
    } else {
      setSelectedMasterId(masterId);
      await fetchSingleRateMaster(masterId);
      setShowAddForm(false);
      setLocationRows([]);
      setLocationFilterTerm('');
      setShowHistory(false);
    }
  };

  const handleBackToList = () => {
    setSelectedMasterId(null);
    setSelectedMaster(null);
    setShowAddForm(false);
    setLocationRows([]);
    setLocationFilterTerm('');
    setShowHistory(false);
  };

  useEffect(() => {
    if (rateMasters.length === 0) return;
    
    let filtered = [...rateMasters];
    
    if (searchTerm) {
      filtered = filtered.filter(master =>
        master.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        master.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        master.branchName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredMasters(filtered);
  }, [searchTerm, rateMasters]);

  useEffect(() => {
    fetchCustomers();
    fetchBranches();
    fetchLocations();
    fetchRateMasters();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Rate Master Management</h1>
            <p className="text-gray-600">
              {selectedMasterId ? `Viewing: ${selectedMaster?.title}` : 'Create and manage rate masters'}
            </p>
          </div>
          <div className="flex gap-2">
            {selectedMasterId && (
              <button
                onClick={handleBackToList}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                ← Back to List
              </button>
            )}
            <button
              onClick={() => router.push('/admin/rate-master/create')}
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
            >
              + Create New Rate Master
            </button>
          </div>
        </div>
      </div>

      {formError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {formError}
        </div>
      )}
      
      {formSuccess && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {formSuccess}
        </div>
      )}
      
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

      {!selectedMasterId && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold">Create New Rate Master</h2>
            <p className="text-gray-600">Enter basic information</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    ? 'Only applicable for weights above 25 kg' 
                    : 'Applicable for all weight ranges'}
                </p>
              </div>

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
                {loading ? 'Creating...' : 'Create Rate Master'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTitle('');
                  setCustomerId('');
                  setBranchId('');
                  setWeightRule('all_weights');
                  setApprovalOption('contract_rate');
                }}
                className="px-6 py-2 rounded text-gray-700 bg-gray-200 hover:bg-gray-300"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      )}

      {!selectedMasterId && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold">Rate Masters List</h2>
            <p className="text-gray-600">Click "Add/View Rates" to manage location rates</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search by Title, Customer or Branch
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type title, customer or branch to search..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {loading && rateMasters.length === 0 ? (
            <div className="text-center py-8">Loading rate masters...</div>
          ) : filteredMasters.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm 
                ? `No rate masters found matching your search: "${searchTerm}"`
                : 'No rate masters found. Create your first rate master!'}
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
                        <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                          {master.locationRates?.filter(r => r.isActive !== false).length || 0} Active | {master.locationRates?.filter(r => r.isActive === false).length || 0} History
                        </span>
                       </td>
                      <td className="px-4 py-2 border text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewRates(master._id)}
                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-xs whitespace-nowrap"
                          >
                            Add/View Rates
                          </button>
                          <button
                            onClick={() => router.push(`/admin/rate-master/edit/${master._id}`)}
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
        )}

      {selectedMasterId && selectedMaster && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg p-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">{selectedMaster.title}</h2>
                <p className="text-sm text-gray-300 mt-1">
                  Customer: {selectedMaster.customerName} | Branch: {selectedMaster.branchName}
                </p>
                <div className="flex gap-3 mt-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    selectedMaster.weightRule === 'above_25' 
                      ? 'bg-orange-600 text-white' 
                      : 'bg-green-600 text-white'
                  }`}>
                    {getWeightRuleLabel(selectedMaster.weightRule)}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    selectedMaster.approvalOption === 'contract_rate' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-pink-600 text-white'
                  }`}>
                    {getApprovalLabel(selectedMaster.approvalOption)}
                  </span>
                  <span className="px-2 py-1 rounded text-xs bg-yellow-600 text-white">
                    {selectedMaster.locationRates?.filter(r => r.isActive !== false).length || 0} Active | {selectedMaster.locationRates?.filter(r => r.isActive === false).length || 0} History
                  </span>
                </div>
                {selectedMaster.weightRule === 'above_25' && (
                  <div className="mt-3 p-2 bg-blue-900/30 rounded text-xs text-blue-200">
                    ⚠️ <strong>Above 25 kg Rule:</strong> From weight must be 25 kg or above.
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm font-medium"
                >
                  {showAddForm ? 'Cancel' : '+ Add New Location'}
                </button>
                <button
                  onClick={() => router.push(`/admin/rate-master/edit/${selectedMaster._id}`)}
                  className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 text-sm"
                >
                  Edit Master
                </button>
              </div>
            </div>
          </div>

          {showAddForm && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="text-md font-semibold mb-3 text-gray-800">Add New Location Rates</h3>
              <p className="text-sm text-gray-600 mb-3">⚠️ Weight ranges should not overlap with existing active rates.</p>
              
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 bg-white">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 border text-left text-sm font-semibold">Location *</th>
                      <th className="px-4 py-2 border text-left text-sm font-semibold">From Weight (kg)</th>
                      <th className="px-4 py-2 border text-left text-sm font-semibold">To Weight (kg)</th>
                      <th className="px-4 py-2 border text-left text-sm font-semibold">Rate (₹)</th>
                      <th className="px-4 py-2 border text-left text-sm font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {locationRows.map((row) => (
                      <tr key={row.id}>
                        <td className="px-4 py-2 border">
                          <select
                            value={row.locationId}
                            onChange={(e) => updateLocationRow(row.id, 'locationId', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Location</option>
                            {sortedLocations.map((location) => (
                              <option key={location._id} value={location._id}>
                                {location.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-2 border">
                          <input
                            type="number"
                            step="0.01"
                            value={row.fromQty}
                            onChange={(e) => updateLocationRow(row.id, 'fromQty', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0.00"
                          />
                        </td>
                        <td className="px-4 py-2 border">
                          <input
                            type="number"
                            step="0.01"
                            value={row.toQty}
                            onChange={(e) => updateLocationRow(row.id, 'toQty', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="100.00"
                          />
                        </td>
                        <td className="px-4 py-2 border">
                          <input
                            type="number"
                            step="0.01"
                            value={row.rate}
                            onChange={(e) => updateLocationRow(row.id, 'rate', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0.00"
                            min="0"
                          />
                        </td>
                        <td className="px-4 py-2 border text-center">
                          <button
                            type="button"
                            onClick={() => removeLocationRow(row.id)}
                            className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={addLocationRow}
                  className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
                >
                  + Add Another Location
                </button>
                <button
                  type="button"
                  onClick={handleAddRates}
                  disabled={addingRates}
                  className={`px-6 py-2 rounded text-white ${
                    addingRates ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {addingRates ? 'Saving...' : 'Save Location Rates'}
                </button>
              </div>
            </div>
          )}

          {/* Revision Modal */}
          {showRevisionModal && revisionRate && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl w-96 max-w-md">
                <div className="bg-orange-600 text-white px-6 py-3 rounded-t-lg flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Revise Rate</h3>
                  <button
                    onClick={() => {
                      setShowRevisionModal(false);
                      setRevisionRate(null);
                    }}
                    className="text-white hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-600 mb-4">
                    Current Rate: {revisionRate.fromQty} - {revisionRate.toQty} kg → ₹{revisionRate.rate}
                  </p>
                  <p className="text-sm text-red-500 mb-4">
                    ⚠️ Old rate will be moved to HISTORY under this location
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        From Weight (kg)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={revisionFromQty}
                        onChange={(e) => setRevisionFromQty(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        To Weight (kg)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={revisionToQty}
                        onChange={(e) => setRevisionToQty(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rate (₹)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={revisionRateValue}
                        onChange={(e) => setRevisionRateValue(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => {
                        setShowRevisionModal(false);
                        setRevisionRate(null);
                      }}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submitRevision}
                      disabled={addingRates}
                      className={`flex-1 px-4 py-2 rounded text-white ${
                        addingRates ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'
                      }`}
                    >
                      {addingRates ? 'Saving...' : 'Save Revision'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* History Modal */}
          {showHistory && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-4xl max-h-[80vh] overflow-auto">
                <div className="bg-gray-800 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Rate History - {selectedHistoryLocation}</h3>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="text-white hover:text-gray-300"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-6">
                  {historyData.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No history found for this location</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 border text-left text-sm font-semibold">Date</th>
                            <th className="px-4 py-2 border text-left text-sm font-semibold">Version</th>
                            <th className="px-4 py-2 border text-left text-sm font-semibold">From (kg)</th>
                            <th className="px-4 py-2 border text-left text-sm font-semibold">To (kg)</th>
                            <th className="px-4 py-2 border text-left text-sm font-semibold">Rate (₹)</th>
                            <th className="px-4 py-2 border text-left text-sm font-semibold">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {historyData.map((item, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-2 border text-sm">{formatDate(item.revisedAt)}</td>
                              <td className="px-4 py-2 border text-sm">
                                <span className="px-2 py-1 bg-gray-100 rounded text-xs">v{item.version}</span>
                              </td>
                              <td className="px-4 py-2 border text-sm">{item.fromQty}</td>
                              <td className="px-4 py-2 border text-sm">{item.toQty}</td>
                              <td className="px-4 py-2 border text-sm">
                                <span className="font-medium">₹ {item.rate}</span>
                              </td>
                              <td className="px-4 py-2 border text-sm">
                                <span className={`px-2 py-1 rounded text-xs ${
                                  item.action === 'CREATED' ? 'bg-green-100 text-green-800' :
                                  item.action === 'REVISED' ? 'bg-orange-100 text-orange-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {item.action}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Location Filter */}
          {(selectedMaster.locationRates && selectedMaster.locationRates.length > 0) && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔍 Filter by Location Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={locationFilterTerm}
                  onChange={(e) => setLocationFilterTerm(e.target.value)}
                  placeholder="Type location name to filter..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {locationFilterTerm && (
                  <button
                    onClick={() => setLocationFilterTerm('')}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Display Rates Grouped by Location */}
          {selectedMaster.locationRates && selectedMaster.locationRates.length > 0 ? (
            <div>
              {(() => {
                // Group rates by location
                const locationsMap = new Map();
                
                selectedMaster.locationRates.forEach(rate => {
                  if (!locationsMap.has(rate.locationId)) {
                    locationsMap.set(rate.locationId, {
                      locationId: rate.locationId,
                      locationName: rate.locationName,
                      activeRates: [],
                      inactiveRates: []
                    });
                  }
                  
                  const locationData = locationsMap.get(rate.locationId);
                  if (rate.isActive !== false) {
                    locationData.activeRates.push(rate);
                  } else {
                    locationData.inactiveRates.push(rate);
                  }
                });
                
                // Convert to array and filter
                let allLocations = Array.from(locationsMap.values())
                  .sort((a, b) => a.locationName.localeCompare(b.locationName));
                
                if (locationFilterTerm && locationFilterTerm.trim() !== '') {
                  allLocations = allLocations.filter(loc =>
                    loc.locationName?.toLowerCase().includes(locationFilterTerm.toLowerCase())
                  );
                }
                
                return allLocations.map((location) => (
                  <div key={location.locationId} className="mb-8 border rounded-lg overflow-hidden">
                    {/* Location Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-4 py-3">
                      <h3 className="text-lg font-semibold">📍 {location.locationName}</h3>
                    </div>
                    
                    {/* Active Rates Table */}
                    {location.activeRates.length > 0 && (
                      <div className="p-4">
                        <h4 className="text-md font-semibold text-green-700 mb-3">✅ Active Rates</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full border border-gray-200">
                            <thead className="bg-green-50">
                              <tr>
                                <th className="px-4 py-2 border text-left text-sm font-semibold">Date</th>
                                <th className="px-4 py-2 border text-left text-sm font-semibold">Version</th>
                                <th className="px-4 py-2 border text-left text-sm font-semibold">From Weight (kg)</th>
                                <th className="px-4 py-2 border text-left text-sm font-semibold">To Weight (kg)</th>
                                <th className="px-4 py-2 border text-left text-sm font-semibold">Rate (₹)</th>
                                <th className="px-4 py-2 border text-left text-sm font-semibold">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {location.activeRates
                                .sort((a, b) => a.fromQty - b.fromQty)
                                .map((rate) => (
                                  <tr key={rate._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 border text-sm">{formatDate(rate.createdAt)}</td>
                                    <td className="px-4 py-2 border text-sm">
                                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">v{rate.version || 1}</span>
                                    </td>
                                    <td className="px-4 py-2 border text-sm">{rate.fromQty}</td>
                                    <td className="px-4 py-2 border text-sm">{rate.toQty}</td>
                                    <td className="px-4 py-2 border text-sm">
                                      <span className="font-medium text-green-600">₹ {rate.rate}</span>
                                    </td>
                                    <td className="px-4 py-2 border text-sm">
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => openRevisionModal(rate)}
                                          className="bg-orange-500 text-white px-2 py-1 rounded text-xs hover:bg-orange-600"
                                        >
                                          Revise
                                        </button>
                                        <button
                                          onClick={() => deleteSingleRate(rate._id)}
                                          className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
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
                        <button
                          onClick={() => viewHistory(location.locationId, location.locationName)}
                          className="mt-3 bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
                        >
                          View Full History
                        </button>
                      </div>
                    )}
                    
                    {/* Inactive/History Rates Table for this location only */}
                    {location.inactiveRates.length > 0 && (
                      <div className="p-4 bg-gray-50 border-t">
                        <h4 className="text-md font-semibold text-gray-600 mb-3">📜 Rate History (Replaced/Inactive)</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full border border-gray-300 bg-gray-100">
                            <thead className="bg-gray-300">
                              <tr>
                                <th className="px-4 py-2 border text-left text-sm font-semibold">Date</th>
                                <th className="px-4 py-2 border text-left text-sm font-semibold">Version</th>
                                <th className="px-4 py-2 border text-left text-sm font-semibold">From Weight (kg)</th>
                                <th className="px-4 py-2 border text-left text-sm font-semibold">To Weight (kg)</th>
                                <th className="px-4 py-2 border text-left text-sm font-semibold">Rate (₹)</th>
                                <th className="px-4 py-2 border text-left text-sm font-semibold">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {location.inactiveRates
                                .sort((a, b) => b.createdAt - a.createdAt)
                                .map((rate) => (
                                  <tr key={rate._id} className="bg-gray-100">
                                    <td className="px-4 py-2 border text-sm text-gray-500">{formatDate(rate.createdAt)}</td>
                                    <td className="px-4 py-2 border text-sm text-gray-500">
                                      <span className="px-2 py-1 bg-gray-400 text-gray-700 rounded text-xs">v{rate.version || 1}</span>
                                    </td>
                                    <td className="px-4 py-2 border text-sm text-gray-500">{rate.fromQty}</td>
                                    <td className="px-4 py-2 border text-sm text-gray-500">{rate.toQty}</td>
                                    <td className="px-4 py-2 border text-sm">
                                      <span className="font-medium text-gray-500 line-through">₹ {rate.rate}</span>
                                    </td>
                                    <td className="px-4 py-2 border text-sm">
                                      <span className="px-2 py-1 bg-gray-500 text-white rounded text-xs">Inactive</span>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    
                    {location.activeRates.length === 0 && location.inactiveRates.length === 0 && (
                      <div className="p-4 text-center text-gray-500">
                        No rates available for this location
                      </div>
                    )}
                  </div>
                ));
              })()}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              No location rates added for this rate master yet.
              <button
                onClick={() => setShowAddForm(true)}
                className="ml-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                Click here to add rates →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}