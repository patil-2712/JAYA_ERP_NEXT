'use client';

import { useState, useEffect } from 'react';

export default function UOMPage() {
  const [uoms, setUoms] = useState([]);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Fetch UOMs
  const fetchUOMs = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/uoms', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setUoms(data.data);
      } else {
        setUoms([]);
        setError(data.message || 'Failed to load UOMs');
      }
    } catch (error) {
      console.error('Error fetching UOMs:', error.message);
      setError('Failed to load UOMs');
      setUoms([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add UOM
  const addUOM = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('UOM name is required');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/uoms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to add UOM');
        return;
      }
      setName('');
      setError(null);
      fetchUOMs();
    } catch (error) {
      console.error('Error adding UOM:', error.message);
      setError('Failed to add UOM.');
    }
  };

  // ✅ Update UOM
  const updateUOM = async (id) => {
    if (!editingName.trim()) {
      setError('UOM name is required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/uoms', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, name: editingName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to update UOM');
        return;
      }
      setEditingId(null);
      setEditingName('');
      setError(null);
      fetchUOMs();
    } catch (error) {
      console.error('Error updating UOM:', error.message);
      setError('Failed to update UOM.');
    }
  };

  // ✅ Delete UOM
  const deleteUOM = async (id) => {
    if (!confirm('Are you sure you want to delete this UOM?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/uoms?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to delete UOM');
        return;
      }
      setError(null);
      fetchUOMs();
    } catch (error) {
      console.error('Error deleting UOM:', error.message);
      setError('Failed to delete UOM.');
    }
  };

  // ✅ Start editing
  const startEdit = (uom) => {
    setEditingId(uom._id);
    setEditingName(uom.name);
  };

  // ✅ Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  useEffect(() => {
    fetchUOMs();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Unit of Measurement (UOM) Master</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Add Form */}
      <form onSubmit={addUOM} className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Add New UOM</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="UOM Name (e.g., Kilogram, Liter, Piece, Meter)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border px-4 py-2 rounded flex-1"
            required
          />
          <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
            Add UOM
          </button>
        </div>
      </form>

      {/* UOM List */}
      {loading ? (
        <div className="mb-4">Loading UOMs...</div>
      ) : (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-3">UOM List</h2>
          {uoms.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sr. No.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      UOM Name
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {uoms.map((uom, index) => (
                    <tr key={uom._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === uom._id ? (
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="border px-2 py-1 rounded w-64"
                            autoFocus
                          />
                        ) : (
                          <span className="text-sm font-medium text-gray-900">{uom.name}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {editingId === uom._id ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => updateUOM(uom._id)}
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
                              onClick={() => startEdit(uom)}
                              className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteUOM(uom._id)}
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
            <p className="text-gray-500">No UOMs found. Add your first UOM above.</p>
          )}
        </div>
      )}
    </div>
  );
}