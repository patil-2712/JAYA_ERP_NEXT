'use client';

import { useState, useEffect } from 'react';

export default function SKUSizePage() {
  const [sizes, setSizes] = useState([]);
  const [sizeValue, setSizeValue] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('KGS');
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [editingUnit, setEditingUnit] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Unit options from your list
  const unitOptions = [
    { code: 'BAG', name: 'BAGS' },
    { code: 'BAL', name: 'BALE' },
    { code: 'BDL', name: 'BUNDLES' },
    { code: 'BKL', name: 'BUCKLES' },
    { code: 'BOU', name: 'BILLION OF UNITS' },
    { code: 'BOX', name: 'BOX' },
    { code: 'BTL', name: 'BOTTLES' },
    { code: 'BUN', name: 'BUNCHES' },
    { code: 'CAN', name: 'CANS' },
    { code: 'CBM', name: 'CUBIC METERS' },
    { code: 'CCM', name: 'CUBIC CENTIMETERS' },
    { code: 'CMS', name: 'CENTIMETERS' },
    { code: 'CTN', name: 'CARTONS' },
    { code: 'DOZ', name: 'DOZENS' },
    { code: 'DRM', name: 'DRUMS' },
    { code: 'GGK', name: 'GREAT GROSS' },
    { code: 'GMS', name: 'GRAMMES' },
    { code: 'GRS', name: 'GROSS' },
    { code: 'GYD', name: 'GROSS YARDS' },
    { code: 'KGS', name: 'KILOGRAMS' },
    { code: 'KLR', name: 'KILOLITRE' },
    { code: 'KME', name: 'KILOMETRE' },
    { code: 'LTR', name: 'LITRES' },
    { code: 'MLT', name: 'MILILITRE' },
    { code: 'MTR', name: 'METERS' },
    { code: 'MTS', name: 'METRIC TON' },
    { code: 'NOS', name: 'NUMBERS' },
    { code: 'OTH', name: 'OTHERS' },
    { code: 'PAC', name: 'PACKS' },
    { code: 'PCS', name: 'PIECES' },
    { code: 'PRS', name: 'PAIRS' },
    { code: 'QTL', name: 'QUINTAL' },
    { code: 'ROL', name: 'ROLLS' },
    { code: 'SET', name: 'SETS' },
    { code: 'SQF', name: 'SQUARE FEET' },
    { code: 'SQM', name: 'SQUARE METERS' },
    { code: 'SQY', name: 'SQUARE YARDS' },
    { code: 'TBS', name: 'TABLETS' },
    { code: 'TGM', name: 'TEN GROSS' },
    { code: 'THD', name: 'THOUSANDS' },
    { code: 'TON', name: 'TONNES' },
    { code: 'TUB', name: 'TUBES' },
    { code: 'UGS', name: 'US GALLONS' },
    { code: 'UNT', name: 'UNITS' },
    { code: 'YDS', name: 'YARDS' }
  ];

  // ✅ Fetch SKU Sizes
  const fetchSizes = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/sku-sizes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setSizes(data.data);
      } else {
        setSizes([]);
        setError(data.message || 'Failed to load SKU sizes');
      }
    } catch (error) {
      console.error('Error fetching SKU sizes:', error.message);
      setError('Failed to load SKU sizes');
      setSizes([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add SKU Size
  const addSize = async (e) => {
    e.preventDefault();
    if (!sizeValue || !sizeValue.trim()) {
      setError('Size value is required');
      return;
    }
    
    if (isNaN(sizeValue) || parseFloat(sizeValue) <= 0) {
      setError('Please enter a valid positive number');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/sku-sizes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          value: parseFloat(sizeValue), 
          unit: selectedUnit 
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to add SKU size');
        return;
      }
      setSizeValue('');
      setSelectedUnit('KGS');
      setError(null);
      fetchSizes();
    } catch (error) {
      console.error('Error adding SKU size:', error.message);
      setError('Failed to add SKU size.');
    }
  };

  // ✅ Update SKU Size
  const updateSize = async (id) => {
    if (!editingValue || !editingValue.trim()) {
      setError('Size value is required');
      return;
    }

    if (isNaN(editingValue) || parseFloat(editingValue) <= 0) {
      setError('Please enter a valid positive number');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/sku-sizes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          id, 
          value: parseFloat(editingValue), 
          unit: editingUnit 
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to update SKU size');
        return;
      }
      setEditingId(null);
      setEditingValue('');
      setEditingUnit('');
      setError(null);
      fetchSizes();
    } catch (error) {
      console.error('Error updating SKU size:', error.message);
      setError('Failed to update SKU size.');
    }
  };

  // ✅ Delete SKU Size
  const deleteSize = async (id) => {
    if (!confirm('Are you sure you want to delete this SKU size?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/sku-sizes?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to delete SKU size');
        return;
      }
      setError(null);
      fetchSizes();
    } catch (error) {
      console.error('Error deleting SKU size:', error.message);
      setError('Failed to delete SKU size.');
    }
  };

  // ✅ Start editing
  const startEdit = (size) => {
    setEditingId(size._id);
    setEditingValue(size.value.toString());
    setEditingUnit(size.unit);
  };

  // ✅ Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditingValue('');
    setEditingUnit('');
  };

  // ✅ Get unit display name
  const getUnitName = (unitCode) => {
    const unit = unitOptions.find(u => u.code === unitCode);
    return unit ? `${unit.code} - ${unit.name}` : unitCode;
  };

  useEffect(() => {
    fetchSizes();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">SKU Size Master</h1>
      <p className="text-gray-600 mb-4">Manage product sizes like 100 KGS, 50 LTR, 25 PCS, etc.</p>

      {error && <div className="text-red-500 mb-4 p-2 bg-red-50 rounded">{error}</div>}

      {/* Add Form */}
      <form onSubmit={addSize} className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Add New SKU Size</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
            <input
              type="number"
              step="any"
              placeholder="Enter size value (e.g., 100)"
              value={sizeValue}
              onChange={(e) => setSizeValue(e.target.value)}
              className="border px-4 py-2 rounded w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="border px-4 py-2 rounded w-full"
            >
              {unitOptions.map(unit => (
                <option key={unit.code} value={unit.code}>
                  {unit.code} - {unit.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4">
          <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
            Add Size
          </button>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          Example: Value=100 + Unit=KGS = 100 KGS
        </div>
      </form>

      {/* SKU Sizes List */}
      {loading ? (
        <div className="mb-4">Loading SKU sizes...</div>
      ) : (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-3">SKU Sizes List</h2>
          {sizes.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sr. No.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Display Format
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sizes.map((size, index) => (
                    <tr key={size._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === size._id ? (
                          <input
                            type="number"
                            step="any"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            className="border px-2 py-1 rounded w-32"
                            autoFocus
                          />
                        ) : (
                          <span className="text-sm font-medium text-gray-900">{size.value}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === size._id ? (
                          <select
                            value={editingUnit}
                            onChange={(e) => setEditingUnit(e.target.value)}
                            className="border px-2 py-1 rounded"
                          >
                            {unitOptions.map(unit => (
                              <option key={unit.code} value={unit.code}>
                                {unit.code} - {unit.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-sm text-gray-900">
                            {getUnitName(size.unit)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                          {size.value} {size.unit}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {editingId === size._id ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => updateSize(size._id)}
                              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => startEdit(size)}
                              className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteSize(size._id)}
                              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
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
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No SKU sizes found. Add your first size above.</p>
              <p className="text-sm text-gray-400 mt-2">Example: 100 KGS, 50 LTR, 25 PCS</p>
            </div>
          )}
        </div>
      )}

      {/* Summary Section */}
      {sizes.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Summary</h3>
          <p>Total SKU Sizes: <span className="font-bold">{sizes.length}</span></p>
          <div className="flex flex-wrap gap-2 mt-2">
            {sizes.slice(0, 10).map(size => (
              <span key={size._id} className="px-2 py-1 bg-gray-200 rounded text-sm">
                {size.value} {size.unit}
              </span>
            ))}
            {sizes.length > 10 && <span className="text-sm text-gray-500">+{sizes.length - 10} more</span>}
          </div>
        </div>
      )}
    </div>
  );
}