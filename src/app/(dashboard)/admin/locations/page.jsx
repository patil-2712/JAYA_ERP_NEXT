'use client';

import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

export default function LocationPage() {
  const [locations, setLocations] = useState([]);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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
      
      setName('');
      setEditingId(null);
      setError(null);
      setSuccess(`Location ${editingId ? 'updated' : 'added'} successfully!`);
      setTimeout(() => setSuccess(null), 3000);
      fetchLocations();
    } catch (error) {
      console.error(`Error ${editingId ? 'updating' : 'adding'} location:`, error);
      setError(`Failed to ${editingId ? 'update' : 'add'} location.`);
    }
  };

  // Handle Excel/CSV Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Extract location names (assuming first column has names)
      const locationsArray = jsonData
        .slice(1) // Skip header row if exists
        .map(row => row[0]) // Get first column
        .filter(name => name && name.toString().trim())
        .map(name => name.toString().trim());

      if (locationsArray.length === 0) {
        setError('No valid location names found in file');
        return;
      }

      // Send to backend
      const token = localStorage.getItem('token');
      const res = await fetch('/api/locations/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ names: locationsArray }),
      });

      const result = await res.json();
      
      if (!res.ok) {
        setError(result.message || 'Failed to upload locations');
      } else {
        setSuccess(`Successfully added ${result.addedCount} locations. ${result.failedCount > 0 ? `Failed: ${result.failedCount}` : ''}`);
        setTimeout(() => setSuccess(null), 3000);
        fetchLocations();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Failed to process file');
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset file input
    }
  };

  // Edit Location
  const editLocation = (location) => {
    setName(location.name);
    setEditingId(location._id);
    setError(null);
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
      setSuccess('Location deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
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

  // Download Sample Excel Template
  const downloadSampleTemplate = () => {
    const sampleData = [
      ['Location Name'],
      ['Warehouse A'],
      ['Warehouse B'],
      ['Store Location 1'],
      ['Store Location 2'],
      ['Distribution Center']
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Locations');
    XLSX.writeFile(wb, 'location_template.xlsx');
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Location Master</h1>

      {error && <div className="text-red-500 mb-4 bg-red-50 p-2 rounded">{error}</div>}
      {success && <div className="text-green-500 mb-4 bg-green-50 p-2 rounded">{success}</div>}

      {/* Add/Edit Form */}
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

      {/* Excel Upload Section */}
      <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="font-semibold mb-2">Bulk Upload from Excel/CSV</h3>
        <div className="flex gap-4 items-center">
          <label className="cursor-pointer bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            {uploading ? 'Uploading...' : 'Upload Excel/CSV File'}
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
          <button
            type="button"
            onClick={downloadSampleTemplate}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Download Sample Template
          </button>
          <span className="text-sm text-gray-600">
            Upload Excel or CSV file with location names in first column
          </span>
        </div>
      </div>

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