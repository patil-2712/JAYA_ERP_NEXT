'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PkgTypePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/admin/pkg-type';
  
  const [pkgTypes, setPkgTypes] = useState([]);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Fetch PKG Types
  const fetchPkgTypes = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/pkg-types', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setPkgTypes(data.data);
      } else {
        setPkgTypes([]);
        setError(data.message || 'Failed to load PKG types');
      }
    } catch (error) {
      console.error('Error fetching PKG types:', error);
      setError('Failed to load PKG types');
      setPkgTypes([]);
    } finally {
      setLoading(false);
    }
  };

  // Add or Update PKG Type
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter PKG type name');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const url = editingId ? `/api/pkg-types?id=${editingId}` : '/api/pkg-types';
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
        setError(data.message || `Failed to ${editingId ? 'update' : 'add'} PKG type`);
        return;
      }
      
      // Reset form
      setName('');
      setEditingId(null);
      setError(null);
      
      // Refresh the list
      await fetchPkgTypes();
      
      // Show success message
      alert(`PKG Type ${editingId ? 'updated' : 'created'} successfully!`);
      
      // If there's a return URL, navigate back after short delay
      if (returnUrl && returnUrl !== '/admin/pkg-type') {
        setTimeout(() => {
          router.push(returnUrl);
        }, 1500);
      }
      
    } catch (error) {
      console.error(`Error ${editingId ? 'updating' : 'adding'} PKG type:`, error);
      setError(`Failed to ${editingId ? 'update' : 'add'} PKG type.`);
    } finally {
      setSaving(false);
    }
  };

  // Edit PKG Type
  const editPkgType = (pkgType) => {
    setName(pkgType.name);
    setEditingId(pkgType._id);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete PKG Type
  const deletePkgType = async (id) => {
    if (!confirm('Are you sure you want to delete this PKG type?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/pkg-types?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to delete PKG type');
        return;
      }
      setError(null);
      fetchPkgTypes();
    } catch (error) {
      console.error('Error deleting PKG type:', error);
      setError('Failed to delete PKG type.');
    }
  };

  // Cancel Edit
  const cancelEdit = () => {
    setName('');
    setEditingId(null);
    setError(null);
  };

  // Go back to return URL
  const handleBack = () => {
    router.push(returnUrl);
  };

  useEffect(() => {
    fetchPkgTypes();
  }, []);

  return (
    <div className="container mx-auto p-4">
      {/* Back button if coming from another page */}
      {returnUrl && returnUrl !== '/admin/pkg-type' && (
        <button
          onClick={handleBack}
          className="mb-4 text-sky-600 hover:text-sky-800 font-medium text-sm flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Order Panel
        </button>
      )}
      
      <h1 className="text-2xl font-bold mb-4">PKG Type Master</h1>

      {error && <div className="text-red-500 mb-4 bg-red-50 p-2 rounded">{error}</div>}

      {/* Add/Edit Form */}
      <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 p-4 rounded-lg">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Enter PKG Type Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            autoFocus
          />
          <button 
            type="submit" 
            disabled={saving}
            className={`px-6 py-2 rounded text-white ${
              saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {saving ? 'Saving...' : (editingId ? 'Update PKG Type' : 'Add PKG Type')}
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

      {/* PKG Types List */}
      {loading ? (
        <div className="mb-4">Loading PKG types...</div>
      ) : (
        <ul className="divide-y border rounded-lg">
          {pkgTypes.length > 0 ? (
            pkgTypes.map((pkgType, index) => (
              <li key={pkgType._id} className="flex justify-between items-center p-4 hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <span className="text-gray-500 w-8">{index + 1}.</span>
                  <span className="font-medium">{pkgType.name}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    pkgType.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {pkgType.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => editPkgType(pkgType)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deletePkgType(pkgType._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))
          ) : (
            <li className="p-4 text-center text-gray-500">No PKG types found</li>
          )}
        </ul>
      )}
    </div>
  );
}