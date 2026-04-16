'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RateMasterListPage() {
  const router = useRouter();
  
  // Data state
  const [rateMasters, setRateMasters] = useState([]);
  const [filteredMasters, setFilteredMasters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch Rate Masters
  const fetchRateMasters = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/rate-master', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (data.success && Array.isArray(data.data)) {
        setRateMasters(data.data);
        setFilteredMasters(data.data);
      } else {
        setRateMasters([]);
        setFilteredMasters([]);
      }
    } catch (error) {
      console.error('Error fetching rate masters:', error);
      setError('Failed to load rate masters');
    } finally {
      setLoading(false);
    }
  };

  // Search filter
  useEffect(() => {
    if (searchTerm) {
      const filtered = rateMasters.filter(master =>
        master.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMasters(filtered);
    } else {
      setFilteredMasters(rateMasters);
    }
  }, [searchTerm, rateMasters]);

  useEffect(() => {
    fetchRateMasters();
  }, []);

  // Delete Rate Master
  const deleteRateMaster = async (id) => {
    if (!confirm('Are you sure you want to delete this rate master?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/rate-master?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete rate master');
      }
      fetchRateMasters();
      setSuccess('Rate master deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error deleting rate master:', error);
      setError(error.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  // Helper function to get weight rule label
  const getWeightRuleLabel = (rule) => {
    return rule === 'above_25' ? 'Above 25 kg' : 'All Weights';
  };

  // Helper function to get approval option label
  const getApprovalLabel = (option) => {
    return option === 'contract_rate' ? 'Contract Rate' : 'Mail Approval';
  };

  return (
    <div className="container mx-auto p-4">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Rate Masters List</h1>
            <p className="text-gray-600">All created rate masters</p>
          </div>
          <button
            onClick={() => router.push('/admin/rate-master/create')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            + Create New Rate Master
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Search Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search by Title
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Type title to search..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">Loading rate masters...</div>
        ) : filteredMasters.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No rate masters found matching your search' : 'No rate masters found. Create your first rate master!'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 border text-left text-sm font-semibold">S.No</th>
                  <th className="px-4 py-3 border text-left text-sm font-semibold">Title</th>
                  <th className="px-4 py-3 border text-left text-sm font-semibold">Customer</th>
                  <th className="px-4 py-3 border text-left text-sm font-semibold">Branch</th>
                  <th className="px-4 py-3 border text-left text-sm font-semibold">Weight Rule</th>
                  <th className="px-4 py-3 border text-left text-sm font-semibold">Approval</th>
                  <th className="px-4 py-3 border text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 border text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMasters.map((master, index) => (
                  <tr key={master._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border text-sm">{index + 1}</td>
                    <td className="px-4 py-2 border text-sm font-medium">{master.title}</td>
                    <td className="px-4 py-2 border text-sm">{master.customerName}</td>
                    <td className="px-4 py-2 border text-sm">{master.branchName}</td>
                    <td className="px-4 py-2 border text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${
                        master.weightRule === 'above_25' 
                          ? 'bg-orange-100 text-orange-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {getWeightRuleLabel(master.weightRule)}
                      </span>
                    </td>
                    <td className="px-4 py-2 border text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${
                        master.approvalOption === 'contract_rate' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {getApprovalLabel(master.approvalOption)}
                      </span>
                    </td>
                    <td className="px-4 py-2 border text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${
                        master.locationRates?.length > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {master.locationRates?.length || 0} Locations Added
                      </span>
                    </td>
                    <td className="px-4 py-2 border text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/admin/rate-master/rates/${master._id}`)}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-xs"
                        >
                          Add/View Rates
                        </button>
                        <button
                          onClick={() => router.push(`/admin/rate-master/edit/${master._id}`)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteRateMaster(master._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}