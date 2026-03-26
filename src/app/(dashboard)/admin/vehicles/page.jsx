// app/vehicles/page.jsx
'use client';

import { useState, useEffect } from 'react';

export default function VehiclePage() {
  const [vehicles, setVehicles] = useState([]);
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    rcNumber: '',
    pucNumber: '',
    fitnessNumber: '',
    ownerName: '',
    chasisNumber: '',
    insuranceNumber: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);

  // ✅ Fetch Vehicles
  const fetchVehicles = async (search = '') => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const url = search ? `/api/vehicles?search=${encodeURIComponent(search)}` : '/api/vehicles';
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (data.success && Array.isArray(data.data)) {
        setVehicles(data.data);
      } else {
        setVehicles([]);
        setError(data.message || 'Failed to load vehicles');
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error.message);
      setError('Failed to load vehicles');
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Input Change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value.toUpperCase()
    }));
  };

  // ✅ Reset Form
  const resetForm = () => {
    setFormData({
      vehicleNumber: '',
      rcNumber: '',
      pucNumber: '',
      fitnessNumber: '',
      ownerName: '',
      chasisNumber: '',
      insuranceNumber: '',
      isActive: true,
    });
    setEditingId(null);
    setError(null);
  };

  // ✅ Add or Update Vehicle
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (!formData.vehicleNumber || !formData.rcNumber || !formData.ownerName) {
      setError('Vehicle Number, RC Number, and Owner Name are required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = editingId ? `/api/vehicles?id=${editingId}` : '/api/vehicles';
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
        setError(data.message || `Failed to ${editingId ? 'update' : 'add'} vehicle`);
        return;
      }

      resetForm();
      fetchVehicles(searchTerm);
    } catch (error) {
      console.error(`Error ${editingId ? 'updating' : 'adding'} vehicle:`, error.message);
      setError(`Failed to ${editingId ? 'update' : 'add'} vehicle.`);
    }
  };

  // ✅ Edit Vehicle
  const editVehicle = (vehicle) => {
    setFormData({
      vehicleNumber: vehicle.vehicleNumber,
      rcNumber: vehicle.rcNumber,
      pucNumber: vehicle.pucNumber || '',
      fitnessNumber: vehicle.fitnessNumber || '',
      ownerName: vehicle.ownerName,
      chasisNumber: vehicle.chasisNumber || '',
      insuranceNumber: vehicle.insuranceNumber || '',
      isActive: vehicle.isActive,
    });
    setEditingId(vehicle._id);
    setError(null);
  };

  // ✅ Delete Vehicle
  const deleteVehicle = async (id) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/vehicles?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Failed to delete vehicle');
        return;
      }

      setError(null);
      fetchVehicles(searchTerm);
    } catch (error) {
      console.error('Error deleting vehicle:', error.message);
      setError('Failed to delete vehicle.');
    }
  };

  // ✅ Toggle Active Status
  const toggleActive = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/vehicles?id=${id}`, {
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

      fetchVehicles(searchTerm);
    } catch (error) {
      console.error('Error toggling vehicle status:', error.message);
      setError('Failed to update status.');
    }
  };

  // ✅ Handle Search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchVehicles(searchTerm);
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Vehicle Master</h1>

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
            placeholder="Search by vehicle number, RC number, owner name..."
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
              fetchVehicles();
            }}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
          >
            Clear
          </button>
        </div>
      </form>

      {/* Add/Edit Form */}
      <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 p-4 rounded">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input
            type="text"
            name="vehicleNumber"
            placeholder="Vehicle Number *"
            value={formData.vehicleNumber}
            onChange={handleInputChange}
            className="border px-4 py-2 rounded"
            required
          />
          <input
            type="text"
            name="rcNumber"
            placeholder="RC Number *"
            value={formData.rcNumber}
            onChange={handleInputChange}
            className="border px-4 py-2 rounded"
            required
          />
          <input
            type="text"
            name="pucNumber"
            placeholder="PUC Number"
            value={formData.pucNumber}
            onChange={handleInputChange}
            className="border px-4 py-2 rounded"
          />
          <input
            type="text"
            name="fitnessNumber"
            placeholder="Fitness Number"
            value={formData.fitnessNumber}
            onChange={handleInputChange}
            className="border px-4 py-2 rounded"
          />
          <input
            type="text"
            name="ownerName"
            placeholder="Owner Name *"
            value={formData.ownerName}
            onChange={handleInputChange}
            className="border px-4 py-2 rounded"
            required
          />
          <input
            type="text"
            name="chasisNumber"
            placeholder="Chasis Number"
            value={formData.chasisNumber}
            onChange={handleInputChange}
            className="border px-4 py-2 rounded"
          />
          <input
            type="text"
            name="insuranceNumber"
            placeholder="Insurance Number"
            value={formData.insuranceNumber}
            onChange={handleInputChange}
            className="border px-4 py-2 rounded"
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
            {editingId ? 'Update Vehicle' : 'Add Vehicle'}
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

      {/* Vehicles List */}
      {loading ? (
        <div className="text-center py-4">Loading vehicles...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border text-left">Vehicle No.</th>
                <th className="px-4 py-2 border text-left">RC No.</th>
                <th className="px-4 py-2 border text-left">Owner</th>
                <th className="px-4 py-2 border text-left">PUC</th>
                <th className="px-4 py-2 border text-left">Fitness</th>
                <th className="px-4 py-2 border text-left">Chasis No.</th>
                <th className="px-4 py-2 border text-left">Insurance</th>
                <th className="px-4 py-2 border text-center">Status</th>
                <th className="px-4 py-2 border text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.length > 0 ? (
                vehicles.map((vehicle) => (
                  <tr key={vehicle._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">{vehicle.vehicleNumber}</td>
                    <td className="px-4 py-2 border">{vehicle.rcNumber}</td>
                    <td className="px-4 py-2 border">{vehicle.ownerName}</td>
                    <td className="px-4 py-2 border">{vehicle.pucNumber || '-'}</td>
                    <td className="px-4 py-2 border">{vehicle.fitnessNumber || '-'}</td>
                    <td className="px-4 py-2 border">{vehicle.chasisNumber || '-'}</td>
                    <td className="px-4 py-2 border">{vehicle.insuranceNumber || '-'}</td>
                    <td className="px-4 py-2 border text-center">
                      <button
                        onClick={() => toggleActive(vehicle._id, vehicle.isActive)}
                        className={`px-2 py-1 rounded text-xs ${
                          vehicle.isActive 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {vehicle.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-2 border text-center">
                      <button
                        onClick={() => editVehicle(vehicle)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-600 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteVehicle(vehicle._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-4 text-gray-500">
                    No vehicles found
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