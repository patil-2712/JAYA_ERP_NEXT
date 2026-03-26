'use client';

import { useState, useEffect } from 'react';

export default function PlantPage() {
  const [plants, setPlants] = useState([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Fetch Plants
  const fetchPlants = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/plants', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setPlants(data.data);
      } else {
        setPlants([]);
        setError(data.message || 'Failed to load plants');
      }
    } catch (error) {
      console.error('Error fetching plants:', error.message);
      setError('Failed to load plants');
      setPlants([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add Plant
  const addPlant = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/plants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to add plant');
        return;
      }
      setName('');
      setCode('');
      setError(null);
      fetchPlants();
    } catch (error) {
      console.error('Error adding plant:', error.message);
      setError('Failed to add plant.');
    }
  };

  // ✅ Delete Plant
  const deletePlant = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/plants?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to delete plant');
        return;
      }
      setError(null);
      fetchPlants();
    } catch (error) {
      console.error('Error deleting plant:', error.message);
      setError('Failed to delete plant.');
    }
  };

  useEffect(() => {
    fetchPlants();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Plant Master</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <form onSubmit={addPlant} className="mb-6">
        <input
          type="text"
          placeholder="Plant Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border px-4 py-2 mr-2"
          required
        />
        <input
          type="text"
          placeholder="Plant Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="border px-4 py-2 mr-2"
          required
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">
          Add Plant
        </button>
      </form>

      {loading ? (
        <div className="mb-4">Loading plants...</div>
      ) : (
        <ul>
          {plants.length > 0 ? (
            plants.map((plant) => (
              <li key={plant._id} className="flex justify-between items-center border-b py-2">
                <span>
                  {plant.name} ({plant.code})
                </span>
                <button
                  onClick={() => deletePlant(plant._id)}
                  className="bg-red-500 text-white px-2 py-1"
                >
                  Delete
                </button>
              </li>
            ))
          ) : (
            <li>No plants found</li>
          )}
        </ul>
      )}
    </div>
  );
}