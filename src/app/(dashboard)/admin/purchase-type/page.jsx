'use client';

import { useEffect, useState } from 'react';

export default function PurchaseTypePage() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchItems = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      const res = await fetch('/api/purchase-type', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setItems(data.data);
      } else {
        setError(data.message);
      }
    } catch {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');

      const res = await fetch('/api/purchase-type', {
        method: editId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: editId,
          name,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message);
        return;
      }

      setName('');
      setEditId(null);
      setError('');
      fetchItems();
    } catch {
      setError('Operation failed');
    }
  };

  const handleEdit = (item) => {
    setName(item.name);
    setEditId(item._id);
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`/api/purchase-type?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message);
        return;
      }

      fetchItems();
    } catch {
      setError('Delete failed');
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg p-6 border">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Purchase Type Master
        </h1>

        {error && (
          <div className="bg-red-100 text-red-600 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            placeholder="Enter Purchase Type"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border px-4 py-2 rounded w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />

          <button
            type="submit"
            className={`px-5 py-2 rounded text-white font-medium ${
              editId
                ? 'bg-yellow-500 hover:bg-yellow-600'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {editId ? 'Update' : 'Add'}
          </button>

          {editId && (
            <button
              type="button"
              onClick={() => {
                setEditId(null);
                setName('');
              }}
              className="px-5 py-2 rounded bg-gray-500 text-white hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </form>

        {/* Table */}
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 border">#</th>
                  <th className="text-left px-4 py-3 border">Purchase Type</th>
                  <th className="text-center px-4 py-3 border">Actions</th>
                </tr>
              </thead>

              <tbody>
                {items.length > 0 ? (
                  items.map((item, index) => (
                    <tr
                      key={item._id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-4 py-3 border">{index + 1}</td>

                      <td className="px-4 py-3 border">{item.name}</td>

                      <td className="px-4 py-3 border text-center space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(item._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="3"
                      className="text-center py-4 text-gray-500"
                    >
                      No Purchase Types Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}