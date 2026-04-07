'use client';

import { useState, useEffect } from 'react';

export default function LocationPage() {
  const [locations, setLocations] = useState([]);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch Locations
  const fetchLocations = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/locations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setLocations(data.data);
      } else {
        setLocations([]);
        setError(data.message || 'Failed to load locations');
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      setError('Failed to load locations');
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  // Add or Update Location
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter location name');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = editingId ? `/api/locations?id=${editingId}` : '/api/locations';
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: name.trim() }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || `Failed to ${editingId ? 'update' : 'add'} location`);
        return;
      }
      
      // Reset form
      setName('');
      setEditingId(null);
      setError(null);
      fetchLocations();
    } catch (error) {
      console.error(`Error ${editingId ? 'updating' : 'adding'} location:`, error);
      setError(`Failed to ${editingId ? 'update' : 'add'} location.`);
    }
  };

  // Edit Location
  const editLocation = (location) => {
    setName(location.name);
    setEditingId(location._id);
    setError(null);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete Location
  const deleteLocation = async (id) => {
    if (!confirm('Are you sure you want to delete this location?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/locations?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to delete location');
        return;
      }
      setError(null);
      fetchLocations();
    } catch (error) {
      console.error('Error deleting location:', error);
      setError('Failed to delete location.');
    }
  };

  // Cancel Edit
  const cancelEdit = () => {
    setName('');
    setEditingId(null);
    setError(null);
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">From Location Master</h1>

      {error && <div className="text-red-500 mb-4 bg-red-50 p-2 rounded">{error}</div>}

      {/* Add/Edit Form - Single Field */}
      <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 p-4 rounded-lg">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Enter Location Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            autoFocus
          />
          <button 
            type="submit" 
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            {editingId ? 'Update Location' : 'Add Location'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Locations List */}
      {loading ? (
        <div className="mb-4">Loading locations...</div>
      ) : (
        <ul className="divide-y border rounded-lg">
          {locations.length > 0 ? (
            locations.map((location, index) => (
              <li key={location._id} className="flex justify-between items-center p-4 hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <span className="text-gray-500 w-8">{index + 1}.</span>
                  <span className="font-medium">{location.name}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    location.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {location.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => editLocation(location)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteLocation(location._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))
          ) : (
            <li className="p-4 text-center text-gray-500">No locations found</li>
          )}
        </ul>
      )}
    </div>
  );
}