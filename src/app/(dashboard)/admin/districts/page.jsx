'use client';

import { useState, useEffect } from 'react';

export default function DistrictPage() {
  const [districts, setDistricts] = useState([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [state, setState] = useState('');
  const [states, setStates] = useState([]);
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Fetch Countries (same as states page)
  const fetchCountries = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/countries', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCountries(data.data);
      } else {
        setCountries([]);
      }
    } catch (error) {
      console.error('Error fetching countries:', error.message);
      setCountries([]);
    }
  };

  // ✅ Fetch States for selected country
  const fetchStates = async (countryCode) => {
    if (!countryCode) {
      setStates([]);
      setState('');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/states?country=${countryCode}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setStates(data.data);
      } else {
        setStates([]);
      }
    } catch (error) {
      console.error('Error fetching states:', error.message);
      setStates([]);
    }
  };

  // ✅ Fetch Districts
  const fetchDistricts = async (stateId) => {
    if (!stateId) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/districts?state=${stateId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setDistricts(data.data);
      } else {
        setDistricts([]);
        setError(data.message || 'Failed to load districts');
      }
    } catch (error) {
      console.error('Error fetching districts:', error.message);
      setError('Failed to load districts');
      setDistricts([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add District
  const addDistrict = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/districts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, code, state }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to add district');
        return;
      }
      setName('');
      setCode('');
      setError(null);
      fetchDistricts(state);
    } catch (error) {
      console.error('Error adding district:', error.message);
      setError('Failed to add district.');
    }
  };

  // ✅ Delete District
  const deleteDistrict = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/districts?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to delete district');
        return;
      }
      setError(null);
      fetchDistricts(state);
    } catch (error) {
      console.error('Error deleting district:', error.message);
      setError('Failed to delete district.');
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  return (
    <div className="container mx-auto p-4 ">
      <h1 className="text-2xl font-bold mb-4">District Master</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Country and State Selection */}
      <div className="mb-6">
        <select
          onChange={(e) => {
            setCountry(e.target.value);
            setState(''); // Reset state selection
            setDistricts([]); // Clear districts
            fetchStates(e.target.value);
          }}
          value={country}
          className="border px-4 py-2 mr-2 mb-2"
        >
          <option value="">Select a Country</option>
          {countries.length > 0 ? (
            countries.map((countryItem) => (
              <option key={countryItem._id} value={countryItem.code}>
                {countryItem.name}
              </option>
            ))
          ) : (
            <option disabled>No countries available</option>
          )}
        </select>

        {country && (
          <select
            onChange={(e) => {
              setState(e.target.value);
              fetchDistricts(e.target.value);
            }}
            value={state}
            className="border px-4 py-2"
          >
            <option value="">Select a State</option>
            {states.length > 0 ? (
              states.map((stateItem) => (
                <option key={stateItem._id} value={stateItem._id}>
                  {stateItem.name} ({stateItem.code})
                </option>
              ))
            ) : (
              <option disabled>No states available</option>
            )}
          </select>
        )}
      </div>

      {state && (
        <>
          <form onSubmit={addDistrict} className="mb-6">
            <input
              type="text"
              placeholder="District Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border px-4 py-2 mr-2"
              required
            />
            <input
              type="text"
              placeholder="District Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="border px-4 py-2 mr-2"
              required
            />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2">
              Add District
            </button>
          </form>

          {loading ? (
            <div className="mb-4">Loading districts...</div>
          ) : (
            <ul>
              {districts.length > 0 ? (
                districts.map((district) => (
                  <li key={district._id} className="flex justify-between items-center border-b py-2">
                    <span>
                      {district.name} ({district.code})
                    </span>
                    <button
                      onClick={() => deleteDistrict(district._id)}
                      className="bg-red-500 text-white px-2 py-1"
                    >
                      Delete
                    </button>
                  </li>
                ))
              ) : (
                <li>No districts found</li>
              )}
            </ul>
          )}
        </>
      )}
    </div>
  );
}