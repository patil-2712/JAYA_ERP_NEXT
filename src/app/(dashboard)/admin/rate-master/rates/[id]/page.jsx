'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UnifiedRateMasterPage() {
  const router = useRouter();
  
  // Data state
  const [rateMasters, setRateMasters] = useState([]);
  const [filteredMasters, setFilteredMasters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Add Rate State
  const [expandedMasterId, setExpandedMasterId] = useState(null);
  const [locations, setLocations] = useState([]);
  const [sortedLocations, setSortedLocations] = useState([]);
  const [locationRows, setLocationRows] = useState({});
  const [addingRates, setAddingRates] = useState(false);
  const [editingRate, setEditingRate] = useState(null);

  // Fetch all Rate Masters with their location rates
  const fetchAllRateMasters = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/rate-master', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (data.success && Array.isArray(data.data)) {
        const sortedData = [...data.data].sort((a, b) => 
          (a.title || '').toLowerCase().localeCompare((b.title || '').toLowerCase())
        );
        setRateMasters(sortedData);
        setFilteredMasters(sortedData);
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

  // Fetch Locations
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

  // Search filter
  useEffect(() => {
    if (searchTerm) {
      const filtered = rateMasters.filter(master =>
        master.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        master.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        master.branchName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMasters(filtered);
    } else {
      setFilteredMasters(rateMasters);
    }
  }, [searchTerm, rateMasters]);

  useEffect(() => {
    fetchAllRateMasters();
    fetchLocations();
  }, []);

  // Function to check for overlaps
  const checkOverlaps = (existingRates, newRates) => {
    const allRates = [...existingRates, ...newRates];
    const ratesByLocation = {};
    
    allRates.forEach(rate => {
      if (!ratesByLocation[rate.locationId]) {
        ratesByLocation[rate.locationId] = [];
      }
      ratesByLocation[rate.locationId].push({
        fromQty: parseFloat(rate.fromQty),
        toQty: parseFloat(rate.toQty),
        locationName: rate.locationName || 'Unknown'
      });
    });
    
    for (const [locationId, ranges] of Object.entries(ratesByLocation)) {
      ranges.sort((a, b) => a.fromQty - b.fromQty);
      
      for (let i = 0; i < ranges.length - 1; i++) {
        if (ranges[i].toQty >= ranges[i + 1].fromQty) {
          return {
            hasOverlap: true,
            message: `Weight range ${ranges[i].fromQty}-${ranges[i].toQty} overlaps with ${ranges[i+1].fromQty}-${ranges[i+1].toQty} for this location. Ranges cannot overlap.`
          };
        }
      }
    }
    
    return { hasOverlap: false };
  };

  const addLocationRow = (masterId) => {
    setLocationRows({
      ...locationRows,
      [masterId]: [
        ...(locationRows[masterId] || []),
        { id: Date.now(), locationId: '', fromQty: '', toQty: '', rate: '' }
      ]
    });
  };

  const removeLocationRow = (masterId, rowId) => {
    const currentRows = locationRows[masterId] || [];
    if (currentRows.length > 1) {
      setLocationRows({
        ...locationRows,
        [masterId]: currentRows.filter(row => row.id !== rowId)
      });
    } else {
      setError("At least one location is required");
      setTimeout(() => setError(null), 3000);
    }
  };

  const updateLocationRow = (masterId, rowId, field, value) => {
    const currentRows = locationRows[masterId] || [];
    setLocationRows({
      ...locationRows,
      [masterId]: currentRows.map(row => 
        row.id === rowId ? { ...row, [field]: value } : row
      )
    });
  };

  // Validate weight based on weight rule
  const validateWeightByRule = (fromQty, toQty, weightRule) => {
    if (weightRule === 'above_25') {
      if (fromQty < 25) {
        return {
          valid: false,
          message: `Weight must start from 25 kg or above. Current from weight: ${fromQty} kg`
        };
      }
    }
    return { valid: true };
  };

  // Submit New Location Rates
  const handleAddRates = async (master) => {
    const rows = locationRows[master._id] || [];
    const validRows = rows.filter(row => row.locationId && row.fromQty && row.toQty && row.rate);
    
    if (validRows.length === 0) {
      setError('Please add at least one location with complete details');
      return;
    }
    
    const newRatesForValidation = [];
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
      
      const weightValidation = validateWeightByRule(fromQty, toQty, master.weightRule);
      if (!weightValidation.valid) {
        setError(weightValidation.message);
        return;
      }
      
      const location = locations.find(l => l._id === row.locationId);
      newRatesForValidation.push({
        locationId: row.locationId,
        fromQty,
        toQty,
        rate,
        locationName: location?.name || 'Unknown'
      });
    }
    
    const existingRates = (master.locationRates || []).map(rate => ({
      locationId: rate.locationId,
      fromQty: rate.fromQty,
      toQty: rate.toQty,
      locationName: rate.locationName
    }));
    
    const overlapCheck = checkOverlaps(existingRates, newRatesForValidation);
    
    if (overlapCheck.hasOverlap) {
      setError(overlapCheck.message);
      setTimeout(() => setError(null), 5000);
      return;
    }
    
    setAddingRates(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const existingRatesData = master.locationRates || [];
      const newRates = newRatesForValidation.map(row => ({
        locationId: row.locationId,
        fromQty: row.fromQty,
        toQty: row.toQty,
        rate: row.rate
      }));
      
      const allRates = [...existingRatesData, ...newRates];
      
      const payload = {
        title: master.title,
        customerId: master.customerId,
        branchId: master.branchId,
        weightRule: master.weightRule,
        approvalOption: master.approvalOption,
        locationRates: allRates
      };
      
      const res = await fetch(`/api/rate-master?id=${master._id}`, {
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
      
      // Clear rows for this master and collapse
      setLocationRows({
        ...locationRows,
        [master._id]: []
      });
      setExpandedMasterId(null);
      await fetchAllRateMasters();
      
    } catch (error) {
      console.error('Error adding location rates:', error);
      setError(error.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setAddingRates(false);
    }
  };

  // Update existing location rate
  const handleUpdateRate = async (masterId, rateId, field, value) => {
    const master = rateMasters.find(m => m._id === masterId);
    if (!master) return;
    
    setAddingRates(true);
    try {
      const token = localStorage.getItem('token');
      const updatedRates = master.locationRates.map(rate => 
        rate._id === rateId ? { ...rate, [field]: parseFloat(value) } : rate
      );
      
      const ratesToCheck = updatedRates.map(r => ({
        locationId: r.locationId,
        fromQty: r.fromQty,
        toQty: r.toQty,
        locationName: r.locationName
      }));
      
      const overlapCheck = checkOverlaps([], ratesToCheck);
      if (overlapCheck.hasOverlap) {
        setError(overlapCheck.message);
        setTimeout(() => setError(null), 5000);
        setAddingRates(false);
        return;
      }
      
      const payload = {
        title: master.title,
        customerId: master.customerId,
        branchId: master.branchId,
        weightRule: master.weightRule,
        approvalOption: master.approvalOption,
        locationRates: updatedRates.map(r => ({
          locationId: r.locationId,
          fromQty: r.fromQty,
          toQty: r.toQty,
          rate: r.rate
        }))
      };
      
      const res = await fetch(`/api/rate-master?id=${masterId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update location rate');
      }
      
      setSuccess('Location rate updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
      setEditingRate(null);
      await fetchAllRateMasters();
      
    } catch (error) {
      console.error('Error updating location rate:', error);
      setError(error.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setAddingRates(false);
    }
  };

  // Delete a location rate
  const handleDeleteRate = async (masterId, rateId) => {
    if (!confirm('Are you sure you want to remove this location rate?')) return;
    
    const master = rateMasters.find(m => m._id === masterId);
    if (!master) return;
    
    setAddingRates(true);
    try {
      const token = localStorage.getItem('token');
      const remainingRates = master.locationRates.filter(rate => rate._id !== rateId);
      
      const payload = {
        title: master.title,
        customerId: master.customerId,
        branchId: master.branchId,
        weightRule: master.weightRule,
        approvalOption: master.approvalOption,
        locationRates: remainingRates.map(r => ({
          locationId: r.locationId,
          fromQty: r.fromQty,
          toQty: r.toQty,
          rate: r.rate
        }))
      };
      
      const res = await fetch(`/api/rate-master?id=${masterId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete location rate');
      }
      
      setSuccess('Location rate removed successfully!');
      setTimeout(() => setSuccess(null), 3000);
      await fetchAllRateMasters();
      
    } catch (error) {
      console.error('Error deleting location rate:', error);
      setError(error.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setAddingRates(false);
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

  // Open add rates form for a specific master
  const openAddRatesForm = (masterId) => {
    if (expandedMasterId === masterId) {
      setExpandedMasterId(null);
      setLocationRows({ ...locationRows, [masterId]: [] });
    } else {
      setExpandedMasterId(masterId);
      if (!locationRows[masterId]) {
        setLocationRows({
          ...locationRows,
          [masterId]: [{ id: Date.now(), locationId: '', fromQty: '', toQty: '', rate: '' }]
        });
      }
    }
    setEditingRate(null);
  };

  return (
    <div className="container mx-auto p-4">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Rate Master Management</h1>
            <p className="text-gray-600">Manage location rates for all rate masters</p>
          </div>
          <button
            onClick={() => router.push('/admin/rate-master/create')}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            + Create New Rate Master
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Search Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search by Title, Customer or Branch
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Type to search..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          />
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

        {loading ? (
          <div className="text-center py-8">Loading rate masters...</div>
        ) : filteredMasters.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No rate masters found matching your search' : 'No rate masters found. Create your first rate master!'}
          </div>
        ) : (
          <div className="space-y-8">
            {filteredMasters.map((master) => (
              <div key={master._id} className="border rounded-lg overflow-hidden shadow-sm">
                {/* Rate Master Header */}
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold">{master.title}</h2>
                      <p className="text-sm text-gray-300 mt-1">
                        Customer: {master.customerName} | Branch: {master.branchName}
                      </p>
                      <div className="flex gap-3 mt-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          master.weightRule === 'above_25' 
                            ? 'bg-orange-600 text-white' 
                            : 'bg-green-600 text-white'
                        }`}>
                          {getWeightRuleLabel(master.weightRule)}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          master.approvalOption === 'contract_rate' 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-pink-600 text-white'
                        }`}>
                          {getApprovalLabel(master.approvalOption)}
                        </span>
                        <span className="px-2 py-1 rounded text-xs bg-yellow-600 text-white">
                          {master.locationRates?.length || 0} Rates Added
                        </span>
                      </div>
                      {master.weightRule === 'above_25' && (
                        <div className="mt-2 p-2 bg-blue-900/30 rounded text-xs text-blue-200">
                          ⚠️ <strong>Above 25 kg Rule:</strong> From weight must be 25 kg or above.
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openAddRatesForm(master._id)}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm font-medium"
                      >
                        {expandedMasterId === master._id ? 'Cancel' : '+ Add Rates'}
                      </button>
                      <button
                        onClick={() => router.push(`/admin/rate-master/edit/${master._id}`)}
                        className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 text-sm"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>

                {/* Add Rates Form - Shown only when expanded */}
                {expandedMasterId === master._id && (
                  <div className="p-4 border-b bg-gray-50">
                    <h3 className="text-md font-semibold mb-3 text-gray-800">Add New Location Rates</h3>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-gray-200 bg-white">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 border text-left text-sm font-semibold">Location *</th>
                            <th className="px-4 py-2 border text-left text-sm font-semibold">From Weight (kg) *</th>
                            <th className="px-4 py-2 border text-left text-sm font-semibold">To Weight (kg) *</th>
                            <th className="px-4 py-2 border text-left text-sm font-semibold">Rate (₹) *</th>
                            <th className="px-4 py-2 border text-left text-sm font-semibold">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(locationRows[master._id] || []).map((row) => (
                            <tr key={row.id}>
                              <td className="px-4 py-2 border">
                                <select
                                  value={row.locationId}
                                  onChange={(e) => updateLocationRow(master._id, row.id, 'locationId', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded"
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
                                  onChange={(e) => updateLocationRow(master._id, row.id, 'fromQty', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded"
                                  placeholder={master.weightRule === 'above_25' ? "25.00" : "0.00"}
                                  min={master.weightRule === 'above_25' ? 25 : 0}
                                />
                              </td>
                              <td className="px-4 py-2 border">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={row.toQty}
                                  onChange={(e) => updateLocationRow(master._id, row.id, 'toQty', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded"
                                  placeholder="100.00"
                                  min={master.weightRule === 'above_25' ? 26 : 0}
                                />
                              </td>
                              <td className="px-4 py-2 border">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={row.rate}
                                  onChange={(e) => updateLocationRow(master._id, row.id, 'rate', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded"
                                  placeholder="0.00"
                                  min="0"
                                />
                              </td>
                              <td className="px-4 py-2 border text-center">
                                <button
                                  type="button"
                                  onClick={() => removeLocationRow(master._id, row.id)}
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
                        onClick={() => addLocationRow(master._id)}
                        className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
                      >
                        + Add Another Location
                      </button>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openAddRatesForm(master._id)}
                          className="px-4 py-2 rounded text-gray-700 bg-gray-200 hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddRates(master)}
                          disabled={addingRates}
                          className={`px-6 py-2 rounded text-white ${
                            addingRates ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          {addingRates ? 'Saving...' : 'Save Location Rates'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Location Rates Table */}
                {master.locationRates && master.locationRates.length > 0 ? (
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Location-wise Price List</h3>
                    
                    {/* Group rates by location */}
                    {(() => {
                      const ratesByLocation = {};
                      master.locationRates.forEach(rate => {
                        if (!ratesByLocation[rate.locationId]) {
                          ratesByLocation[rate.locationId] = {
                            locationName: rate.locationName,
                            locationId: rate.locationId,
                            rates: []
                          };
                        }
                        ratesByLocation[rate.locationId].rates.push(rate);
                      });
                      
                      const sortedLocationGroups = Object.values(ratesByLocation).sort((a, b) => 
                        (a.locationName || '').toLowerCase().localeCompare((b.locationName || '').toLowerCase())
                      );
                      
                      return (
                        <div className="space-y-4">
                          {sortedLocationGroups.map((locationGroup) => (
                            <div key={locationGroup.locationId} className="border rounded-lg overflow-hidden">
                              {/* Location Header */}
                              <div className="bg-gray-100 px-4 py-2 border-b">
                                <h4 className="font-semibold text-gray-800">
                                  📍 {locationGroup.locationName}
                                </h4>
                              </div>
                              
                              {/* Rates Table for this Location */}
                              <div className="overflow-x-auto">
                                <table className="min-w-full">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-4 py-2 border text-left text-sm font-semibold">#</th>
                                      <th className="px-4 py-2 border text-left text-sm font-semibold">From Weight (kg)</th>
                                      <th className="px-4 py-2 border text-left text-sm font-semibold">To Weight (kg)</th>
                                      <th className="px-4 py-2 border text-left text-sm font-semibold">Rate (₹)</th>
                                      <th className="px-4 py-2 border text-left text-sm font-semibold">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {locationGroup.rates
                                      .sort((a, b) => a.fromQty - b.fromQty)
                                      .map((rate, idx) => (
                                        <tr key={rate._id || idx} className="hover:bg-gray-50">
                                          <td className="px-4 py-2 border text-sm">{idx + 1}</td>
                                          <td className="px-4 py-2 border text-sm">
                                            {editingRate === rate._id ? (
                                              <input
                                                type="number"
                                                step="0.01"
                                                defaultValue={rate.fromQty}
                                                onBlur={(e) => handleUpdateRate(master._id, rate._id, 'fromQty', e.target.value)}
                                                className="w-24 px-2 py-1 border rounded"
                                                min={master.weightRule === 'above_25' ? 25 : 0}
                                                autoFocus
                                              />
                                            ) : (
                                              rate.fromQty
                                            )}
                                          </td>
                                          <td className="px-4 py-2 border text-sm">
                                            {editingRate === rate._id ? (
                                              <input
                                                type="number"
                                                step="0.01"
                                                defaultValue={rate.toQty}
                                                onBlur={(e) => handleUpdateRate(master._id, rate._id, 'toQty', e.target.value)}
                                                className="w-24 px-2 py-1 border rounded"
                                              />
                                            ) : (
                                              rate.toQty
                                            )}
                                          </td>
                                          <td className="px-4 py-2 border text-sm">
                                            {editingRate === rate._id ? (
                                              <input
                                                type="number"
                                                step="0.01"
                                                defaultValue={rate.rate}
                                                onBlur={(e) => handleUpdateRate(master._id, rate._id, 'rate', e.target.value)}
                                                className="w-24 px-2 py-1 border rounded"
                                                min="0"
                                              />
                                            ) : (
                                              <span className="font-medium text-green-600">₹ {rate.rate}</span>
                                            )}
                                           </td>
                                          <td className="px-4 py-2 border text-sm">
                                            {editingRate === rate._id ? (
                                              <button
                                                onClick={() => setEditingRate(null)}
                                                className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                                              >
                                                Done
                                              </button>
                                            ) : (
                                              <div className="flex gap-1">
                                                <button
                                                  onClick={() => setEditingRate(rate._id)}
                                                  className="bg-yellow-600 text-white px-2 py-1 rounded text-xs hover:bg-yellow-700"
                                                >
                                                  Edit
                                                </button>
                                                <button
                                                  onClick={() => handleDeleteRate(master._id, rate._id)}
                                                  className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                                                >
                                                  Delete
                                                </button>
                                              </div>
                                            )}
                                           </td>
                                        </tr>
                                      ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    No location rates added for this rate master yet.
                    <button
                      onClick={() => openAddRatesForm(master._id)}
                      className="ml-2 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Click here to add rates →
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}