// app/pincodes/page.jsx
'use client';

import { useState, useEffect } from 'react';

export default function PincodePage() {
  const [pincodes, setPincodes] = useState([]);
  const [formData, setFormData] = useState({
    pincode: '',
    city: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);

  // ✅ Fetch Pincodes
  const fetchPincodes = async (search = '') => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const url = search ? `/api/pincodes?search=${encodeURIComponent(search)}` : '/api/pincodes';
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (data.success && Array.isArray(data.data)) {
        setPincodes(data.data);
      } else {
        setPincodes([]);
        setError(data.message || 'Failed to load pincodes');
      }
    } catch (error) {
      console.error('Error fetching pincodes:', error.message);
      setError('Failed to load pincodes');
      setPincodes([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Input Change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // ✅ Reset Form
  const resetForm = () => {
    setFormData({
      pincode: '',
      city: '',
      isActive: true,
    });
    setEditingId(null);
    setError(null);
  };

  // ✅ Add or Update Pincode
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate pincode format
    if (!/^\d{6}$/.test(formData.pincode)) {
      setError('Pincode must be a 6-digit number');
      return;
    }

    // Validate city
    if (!formData.city.trim()) {
      setError('City name is required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = editingId ? `/api/pincodes?id=${editingId}` : '/api/pincodes';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || `Failed to ${editingId ? 'update' : 'add'} pincode`);
        return;
      }

      resetForm();
      fetchPincodes(searchTerm);
    } catch (error) {
      console.error(`Error ${editingId ? 'updating' : 'adding'} pincode:`, error.message);
      setError(`Failed to ${editingId ? 'update' : 'add'} pincode.`);
    }
  };

  // ✅ Edit Pincode
  const editPincode = (pincode) => {
    setFormData({
      pincode: pincode.pincode,
      city: pincode.city,
      isActive: pincode.isActive,
    });
    setEditingId(pincode._id);
    setError(null);
  };

  // ✅ Delete Pincode
  const deletePincode = async (id) => {
    if (!confirm('Are you sure you want to delete this pincode?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/pincodes?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Failed to delete pincode');
        return;
      }

      setError(null);
      fetchPincodes(searchTerm);
    } catch (error) {
      console.error('Error deleting pincode:', error.message);
      setError('Failed to delete pincode.');
    }
  };

  // ✅ Toggle Active Status
  const toggleActive = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/pincodes?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Failed to update status');
        return;
      }

      fetchPincodes(searchTerm);
    } catch (error) {
      console.error('Error toggling pincode status:', error.message);
      setError('Failed to update status.');
    }
  };

  // ✅ Handle Search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchPincodes(searchTerm);
  };

  useEffect(() => {
    fetchPincodes();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Pincode Master</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by pincode or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border px-4 py-2 flex-1 rounded"
          />
          <button type="submit" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
            Search
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              fetchPincodes();
            }}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
          >
            Clear
          </button>
        </div>
      </form>

      {/* Add/Edit Form */}
      <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 p-4 rounded">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="pincode"
            placeholder="Pincode (6 digits)"
            value={formData.pincode}
            onChange={handleInputChange}
            className="border px-4 py-2 rounded"
            maxLength="6"
            pattern="\d*"
            required
          />
          <input
            type="text"
            name="city"
            placeholder="City Name"
            value={formData.city}
            onChange={handleInputChange}
            className="border px-4 py-2 rounded"
            required
          />
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="rounded"
            />
            <span>Active</span>
          </label>
        </div>
        
        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            {editingId ? 'Update Pincode' : 'Add Pincode'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {/* Pincodes List */}
      {loading ? (
        <div className="text-center py-4">Loading pincodes...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border text-left">Pincode</th>
                <th className="px-4 py-2 border text-left">City</th>
                <th className="px-4 py-2 border text-center">Status</th>
                <th className="px-4 py-2 border text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pincodes.length > 0 ? (
                pincodes.map((pincode) => (
                  <tr key={pincode._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">{pincode.pincode}</td>
                    <td className="px-4 py-2 border">{pincode.city}</td>
                    <td className="px-4 py-2 border text-center">
                      <button
                        onClick={() => toggleActive(pincode._id, pincode.isActive)}
                        className={`px-2 py-1 rounded text-xs ${
                          pincode.isActive 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {pincode.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-2 border text-center">
                      <button
                        onClick={() => editPincode(pincode)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-600 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deletePincode(pincode._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    No pincodes found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}