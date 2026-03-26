'use client';

import { useState, useEffect } from 'react';

export default function TransportPriceListPage() {
  const [priceList, setPriceList] = useState([]);
  const [formData, setFormData] = useState({
    pincode: '',
    city: '',
    district: '',
    state: '',
    price075: '',
    price275to3: '',
    price3to5: '',
    price5Above: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pincodeError, setPincodeError] = useState(null);

  // ✅ Fetch Price List (Your existing API)
  const fetchPriceList = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const url = searchTerm 
        ? `/api/transport-price-list?search=${encodeURIComponent(searchTerm)}`
        : '/api/transport-price-list';
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setPriceList(data.data);
      } else {
        setPriceList([]);
        setError(data.message || 'Failed to load price list');
      }
    } catch (error) {
      console.error('Error fetching price list:', error.message);
      setError('Failed to load price list');
      setPriceList([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch Pincode Details DIRECTLY from India Post API (NO BACKEND NEEDED)
// ✅ Fetch Pincode Details with working CORS proxy
const fetchPincodeDetails = async (pincode) => {
  if (!pincode || pincode.length !== 6) {
    setPincodeError('Please enter a 6-digit pincode');
    return;
  }

  setPincodeLoading(true);
  setPincodeError(null);

  // List of CORS proxies to try (in order)
  const proxies = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
    'https://proxy.cors.sh/',
    '' // Direct call as last resort
  ];

  for (const proxy of proxies) {
    try {
      let url;
      if (proxy) {
        // For allorigins, we need to encode the target URL
        if (proxy.includes('allorigins')) {
          url = `${proxy}${encodeURIComponent(`https://api.postalpincode.in/pincode/${pincode}`)}`;
        } else {
          url = `${proxy}https://api.postalpincode.in/pincode/${pincode}`;
        }
      } else {
        url = `https://api.postalpincode.in/pincode/${pincode}`;
      }

      console.log('Trying proxy:', proxy || 'direct');
      
      const res = await fetch(url, {
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (data && data[0] && data[0].Status === "Success") {
        const postOffice = data[0].PostOffice[0];
        
        setFormData(prev => ({
          ...prev,
          city: postOffice.Name || "",
          district: postOffice.District || "",
          state: postOffice.State || "",
          pincode: pincode
        }));
        setPincodeError(null);
        setPincodeLoading(false);
        return; // Success! Exit the function
      } else {
        throw new Error(data[0]?.Message || 'No details found');
      }
    } catch (error) {
      console.log(`Proxy ${proxy || 'direct'} failed:`, error.message);
      // Continue to next proxy
    }
  }

  // If all proxies failed, show error and allow manual entry
  setPincodeError('Unable to fetch pincode details. Please enter manually.');
  setFormData(prev => ({
    ...prev,
    city: '',
    district: '',
    state: ''
  }));
  setPincodeLoading(false);
};
  // ✅ Handle Pincode Input Change
  const handlePincodeChange = (e) => {
    const pincode = e.target.value.replace(/\D/g, '').slice(0, 6);
    setFormData(prev => ({ ...prev, pincode }));
    
    // Clear location fields when pincode changes
    if (pincode.length < 6) {
      setFormData(prev => ({
        ...prev,
        city: '',
        district: '',
        state: ''
      }));
      setPincodeError(null);
    }
  };

  // ✅ Handle Pincode Blur - fetch details when user leaves the field
  const handlePincodeBlur = () => {
    if (formData.pincode.length === 6) {
      fetchPincodeDetails(formData.pincode);
    }
  };

  // ✅ Handle Input Change for other fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ✅ Handle Submit (Add/Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validate required fields
    if (!formData.pincode || !formData.city || !formData.district || !formData.state) {
      setError('Please fill all location fields (auto-filled from pincode)');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = '/api/transport-price-list';
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId 
        ? { ...formData, id: editingId }
        : formData;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.message || `Failed to ${editingId ? 'update' : 'add'} price entry`);
        return;
      }

      // Reset form
      setFormData({
        pincode: '',
        city: '',
        district: '',
        state: '',
        price075: '',
        price275to3: '',
        price3to5: '',
        price5Above: ''
      });
      setEditingId(null);
      setPincodeError(null);
      setError(null);
      fetchPriceList();
    } catch (error) {
      console.error(`Error ${editingId ? 'updating' : 'adding'} price entry:`, error.message);
      setError(`Failed to ${editingId ? 'update' : 'add'} price entry.`);
    }
  };

  // ✅ Handle Edit
  const handleEdit = (item) => {
    setFormData({
      pincode: item.pincode,
      city: item.city,
      district: item.district,
      state: item.state,
      price075: item.price075,
      price275to3: item.price275to3,
      price3to5: item.price3to5,
      price5Above: item.price5Above
    });
    setEditingId(item._id);
  };

  // ✅ Handle Delete
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/transport-price-list?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.message || 'Failed to delete price entry');
        return;
      }
      
      setError(null);
      fetchPriceList();
    } catch (error) {
      console.error('Error deleting price entry:', error.message);
      setError('Failed to delete price entry.');
    }
  };

  // ✅ Handle Cancel Edit
  const handleCancelEdit = () => {
    setFormData({
      pincode: '',
      city: '',
      district: '',
      state: '',
      price075: '',
      price275to3: '',
      price3to5: '',
      price5Above: ''
    });
    setEditingId(null);
    setPincodeError(null);
    setError(null);
  };

  // ✅ Handle Search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchPriceList();
  };

  useEffect(() => {
    fetchPriceList();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Transport Price List Master</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search by Pincode, City, District, or State..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Search
          </button>
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                fetchPriceList();
              }}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Add/Edit Form */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? 'Edit Price Entry' : 'Add New Price Entry'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pincode Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pincode <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handlePincodeChange}
                  onBlur={handlePincodeBlur}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter 6-digit pincode"
                  maxLength="6"
                  required
                />
                {pincodeLoading && (
                  <div className="absolute right-3 top-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
              {pincodeError && (
                <p className="text-sm text-red-500 mt-1">{pincodeError}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full border rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Auto-filled from pincode"
                readOnly
                required
              />
            </div>
          </div>

          {/* Location Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                District <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                className="w-full border rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Auto-filled from pincode"
                readOnly
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full border rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Auto-filled from pincode"
                readOnly
                required
              />
            </div>
          </div>

          {/* Price Slabs Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                0.75 MT
              </label>
              <input
                type="number"
                name="price075"
                value={formData.price075}
                onChange={handleInputChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
                placeholder="Enter price"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                2.75 - 3 MT
              </label>
              <input
                type="number"
                name="price275to3"
                value={formData.price275to3}
                onChange={handleInputChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
                placeholder="Enter price"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                3 - 5 MT
              </label>
              <input
                type="number"
                name="price3to5"
                value={formData.price3to5}
                onChange={handleInputChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
                placeholder="Enter price"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                5 MT & Above
              </label>
              <input
                type="number"
                name="price5Above"
                value={formData.price5Above}
                onChange={handleInputChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
                placeholder="Enter price"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              {editingId ? 'Update Entry' : 'Add Entry'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Price List Table */}
      {loading ? (
        <div className="text-center py-8">Loading price list...</div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pincode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">District</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">0.75 MT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">2.75-3 MT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">3-5 MT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">5 MT & Above</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {priceList.length > 0 ? (
                priceList.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.pincode}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.city}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.district}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.state}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{item.price075?.toLocaleString() || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{item.price275to3?.toLocaleString() || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{item.price3to5?.toLocaleString() || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{item.price5Above?.toLocaleString() || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-6 py-4 text-center text-sm text-gray-500">
                    No price entries found
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