'use client';

import { useState, useEffect } from 'react';

export default function BranchPage() {
  const [branches, setBranches] = useState([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Fetch Branches
  const fetchBranches = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/branches', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setBranches(data.data);
      } else {
        setBranches([]);
        setError(data.message || 'Failed to load branches');
      }
    } catch (error) {
      console.error('Error fetching branches:', error.message);
      setError('Failed to load branches');
      setBranches([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add Branch
  const addBranch = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/branches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to add branch');
        return;
      }
      setName('');
      setCode('');
      setError(null);
      fetchBranches();
    } catch (error) {
      console.error('Error adding branch:', error.message);
      setError('Failed to add branch.');
    }
  };

  // ✅ Delete Branch
  const deleteBranch = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/branches?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to delete branch');
        return;
      }
      setError(null);
      fetchBranches();
    } catch (error) {
      console.error('Error deleting branch:', error.message);
      setError('Failed to delete branch.');
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  return (
    <div className="container mx-auto p-4 ">
      <h1 className="text-2xl font-bold mb-4">Branch Master</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <form onSubmit={addBranch} className="mb-6">
        <input
          type="text"
          placeholder="Branch Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border px-4 py-2 mr-2"
          required
        />
        <input
          type="text"
          placeholder="Branch Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="border px-4 py-2 mr-2"
          required
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">
          Add Branch
        </button>
      </form>

      {loading ? (
        <div className="mb-4">Loading branches...</div>
      ) : (
        <ul>
          {branches.length > 0 ? (
            branches.map((branch) => (
              <li key={branch._id} className="flex justify-between items-center border-b py-2">
                <span>
                  {branch.name} ({branch.code})
                </span>
                <button
                  onClick={() => deleteBranch(branch._id)}
                  className="bg-red-500 text-white px-2 py-1"
                >
                  Delete
                </button>
              </li>
            ))
          ) : (
            <li>No branches found</li>
          )}
        </ul>
      )}
    </div>
  );
}