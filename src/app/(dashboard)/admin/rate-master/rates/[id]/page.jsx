'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function RateMasterRates() {
  const router = useRouter();
  const params = useParams();
  const [rateMaster, setRateMaster] = useState(null);
  const [locations, setLocations] = useState([]);
  const [locationRows, setLocationRows] = useState([
    { id: Date.now(), locationId: '', fromQty: '', toQty: '', rate: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch Rate Master Details
  const fetchRateMaster = async () => {
    setFetching(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/rate-master?id=${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (data.success && data.data) {
        setRateMaster(data.data);
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

  useEffect(() => {
    if (params.id) {
      fetchRateMaster();
      fetchLocations();
    }
  }, [params.id]);

  // Function to check for overlaps in the new rates being added
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
        if (ranges[i].toQty > ranges[i + 1].fromQty) {
          return {
            hasOverlap: true,
            message: `Weight range ${ranges[i].fromQty}-${ranges[i].toQty} overlaps with ${ranges[i+1].fromQty}-${ranges[i+1].toQty} for this location. Ranges cannot overlap for the same location.`
          };
        }
      }
    }
    
    return { hasOverlap: false };
  };

  const addLocationRow = () => {
    setLocationRows([
      ...locationRows,
      { id: Date.now(), locationId: '', fromQty: '', toQty: '', rate: '' }
    ]);
  };

  const removeLocationRow = (id) => {
    if (locationRows.length > 1) {
      setLocationRows(locationRows.filter(row => row.id !== id));
    } else {
      setError("At least one location is required");
      setTimeout(() => setError(null), 3000);
    }
  };

  const updateLocationRow = (id, field, value) => {
    setLocationRows(locationRows.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  // Validate weight based on weight rule
  const validateWeightByRule = (fromQty, toQty) => {
    if (rateMaster?.weightRule === 'above_25') {
      if (fromQty < 25) {
        return {
          valid: false,
          message: `For this rate master, weight must start from 25 kg or above. Current from weight: ${fromQty} kg`
        };
      }
    }
    return { valid: true };
  };

  // Submit New Location Rates
  const handleSubmit = async () => {
    const validRows = locationRows.filter(row => row.locationId && row.fromQty && row.toQty && row.rate);
    
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
      
      const weightValidation = validateWeightByRule(fromQty, toQty);
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
    
    const existingRates = (rateMaster.locationRates || []).map(rate => ({
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
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const existingRatesData = rateMaster.locationRates || [];
      const newRates = newRatesForValidation.map(row => ({
        locationId: row.locationId,
        fromQty: row.fromQty,
        toQty: row.toQty,
        rate: row.rate
      }));
      
      const allRates = [...existingRatesData, ...newRates];
      
      const payload = {
        title: rateMaster.title,
        customerId: rateMaster.customerId,
        branchId: rateMaster.branchId,
        weightRule: rateMaster.weightRule,
        approvalOption: rateMaster.approvalOption,
        locationRates: allRates
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
        throw new Error(data.message || 'Failed to add location rates');
      }
      
      setSuccess('Location rates added successfully!');
      setTimeout(() => setSuccess(null), 3000);
      
      setLocationRows([{ id: Date.now(), locationId: '', fromQty: '', toQty: '', rate: '' }]);
      await fetchRateMaster();
      
    } catch (error) {
      console.error('Error adding location rates:', error);
      setError(error.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Delete a specific location rate
  const deleteLocationRate = async (locationRateId) => {
    if (!confirm('Are you sure you want to remove this location rate?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const remainingRates = (rateMaster.locationRates || []).filter(rate => rate._id !== locationRateId);
      
      const payload = {
        title: rateMaster.title,
        customerId: rateMaster.customerId,
        branchId: rateMaster.branchId,
        weightRule: rateMaster.weightRule,
        approvalOption: rateMaster.approvalOption,
        locationRates: remainingRates
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
        throw new Error(data.message || 'Failed to delete location rate');
      }
      
      setSuccess('Location rate removed successfully!');
      setTimeout(() => setSuccess(null), 3000);
      await fetchRateMaster();
      
    } catch (error) {
      console.error('Error deleting location rate:', error);
      setError(error.message);
      setTimeout(() => setError(null), 3000);
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

  if (!rateMaster) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-8 text-red-500">Rate master not found</div>
          <div className="text-center">
            <button
              onClick={() => router.push('/admin/rate-master/list')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Back to List
            </button>
          </div>
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
              <h1 className="text-2xl font-bold">Location Rates</h1>
              <p className="text-gray-600">
                {rateMaster.title} | Customer: {rateMaster.customerName} | Branch: {rateMaster.branchName}
              </p>
              <div className="flex gap-4 mt-2">
                <p className="text-sm">
                  <span className="font-semibold">Weight Rule:</span>{' '}
                  <span className={`px-2 py-1 rounded text-xs ${
                    rateMaster.weightRule === 'above_25' 
                      ? 'bg-orange-100 text-orange-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {rateMaster.weightRule === 'above_25' ? 'Above 25 kg' : 'All Weights'}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Approval Option:</span>{' '}
                  <span className={`px-2 py-1 rounded text-xs ${
                    rateMaster.approvalOption === 'contract_rate' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {rateMaster.approvalOption === 'contract_rate' ? 'Contract Rate' : 'Mail Approval'}
                  </span>
                </p>
              </div>
              {rateMaster.weightRule === 'above_25' && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-800">
                    ⚠️ <strong>Above 25 kg Rule:</strong> From weight must be 25 kg or above.
                  </p>
                </div>
              )}
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

        {/* Existing Location Rates Table */}
        {rateMaster.locationRates && rateMaster.locationRates.length > 0 ? (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3">
              Existing Location Rates ({rateMaster.locationRates.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 border text-left text-sm font-semibold">S.No</th>
                    <th className="px-4 py-2 border text-left text-sm font-semibold">Location</th>
                    <th className="px-4 py-2 border text-left text-sm font-semibold">From Weight (kg)</th>
                    <th className="px-4 py-2 border text-left text-sm font-semibold">To Weight (kg)</th>
                    <th className="px-4 py-2 border text-left text-sm font-semibold">Rate (₹)</th>
                    <th className="px-4 py-2 border text-left text-sm font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rateMaster.locationRates.map((rate, idx) => (
                    <tr key={rate._id || idx} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border text-sm">{idx + 1}</td>
                      <td className="px-4 py-2 border text-sm font-medium">{rate.locationName || 'Unknown Location'}</td>
                      <td className="px-4 py-2 border text-sm">{rate.fromQty}</td>
                      <td className="px-4 py-2 border text-sm">{rate.toQty}</td>
                      <td className="px-4 py-2 border text-sm">₹ {rate.rate}</td>
                      <td className="px-4 py-2 border text-sm">
                        <button
                          onClick={() => deleteLocationRate(rate._id)}
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-xs"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-yellow-800">No location rates added yet. Use the form below to add location rates.</p>
          </div>
        )}

        {/* Add New Location Rates Form */}
        <div className={rateMaster.locationRates && rateMaster.locationRates.length > 0 ? "border-t pt-6" : ""}>
          <h2 className="text-lg font-semibold mb-3">Add New Location Rates</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 border text-left text-sm font-semibold">
                    Location <span className="text-red-500">*</span>
                  </th>
                  <th className="px-4 py-2 border text-left text-sm font-semibold">
                    From Weight (kg) <span className="text-red-500">*</span>
                  </th>
                  <th className="px-4 py-2 border text-left text-sm font-semibold">
                    To Weight (kg) <span className="text-red-500">*</span>
                  </th>
                  <th className="px-4 py-2 border text-left text-sm font-semibold">
                    Rate (₹) <span className="text-red-500">*</span>
                  </th>
                  <th className="px-4 py-2 border text-left text-sm font-semibold">
                    Action
                  </th>
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
                        required
                      >
                        <option value="">Select Location</option>
                        {locations.map((location) => (
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
                        placeholder={rateMaster?.weightRule === 'above_25' ? "25.00" : "0.00"}
                        min={rateMaster?.weightRule === 'above_25' ? "25" : "0"}
                        required
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
                        min={rateMaster?.weightRule === 'above_25' ? "26" : "0"}
                        required
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
                        required
                      />
                    </td>
                    <td className="px-4 py-2 border text-center">
                      <button
                        type="button"
                        onClick={() => removeLocationRow(row.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded text-sm"
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
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm"
            >
              + Add Another Location
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className={`px-6 py-2 rounded text-white ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {loading ? 'Saving...' : 'Save Location Rates'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}