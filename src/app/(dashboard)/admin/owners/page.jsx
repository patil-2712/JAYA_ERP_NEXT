'use client';

import { useState, useEffect } from 'react';

// File Upload Item Component
function FileItem({ file, onRemove, index, label }) {
  return (
    <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 mt-1">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-700 truncate">{file.name}</p>
        <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
      </div>
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="text-red-500 hover:text-red-700 p-1"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// Document Upload Section Component
function DocumentUploadSection({ 
  label, 
  value, 
  placeholder, 
  onChange, 
  files, 
  onFileSelect, 
  onRemoveFile, 
  existingDocuments, 
  onRemoveExistingDocument,
  documentType, 
  required = false 
}) {
  return (
    <div className="border rounded-lg p-3 bg-white shadow-sm">
      <label className="text-xs font-bold text-slate-600 block mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="border border-slate-200 rounded-lg px-3 py-2 w-full text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none uppercase"
        required={required}
      />
      <div className="mt-2">
        <label className="text-xs text-slate-500 block mb-1">Upload Documents (PDF/Images)</label>
        <input 
          type="file" 
          accept=".pdf,.jpg,.jpeg,.png,.webp" 
          onChange={(e) => onFileSelect(e, documentType)}
          className="text-xs w-full border border-slate-200 rounded-lg p-1.5 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
          multiple
        />
        <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
          {/* New files to upload */}
          {files.map((file, idx) => (
            <FileItem key={`new-${idx}`} file={file} index={idx} onRemove={() => onRemoveFile(idx, documentType)} label={label} />
          ))}
          
          {/* Existing documents with delete option */}
          {existingDocuments?.map((doc, idx) => (
            <div key={`existing-${documentType}-${idx}`} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
              <div className="flex-1">
                <p className="text-xs font-medium text-green-800">Existing Document</p>
                <a href={doc} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-600 hover:underline">
                  View {label} {idx + 1}
                </a>
              </div>
              <button
                type="button"
                onClick={() => onRemoveExistingDocument(documentType, idx)}
                className="text-red-500 hover:text-red-700 p-1"
                title="Remove this document"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function OwnerPage() {
  const [owners, setOwners] = useState([]);
  const [formData, setFormData] = useState({
    ownerName: '',
    vehicleNumber: '',
    ownerPanCard: '',
    mobileNumber1: '',
    mobileNumber2: '',
    adharCardNumber: '',
    rcNumber: '',
    isActive: true,
  });
  
  // File states
  const [panCardFiles, setPanCardFiles] = useState([]);
  const [adharCardFiles, setAdharCardFiles] = useState([]);
  const [rcFiles, setRcFiles] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [existingDocuments, setExistingDocuments] = useState({});
  
  // State for documents to delete
  const [documentsToDelete, setDocumentsToDelete] = useState({
    panCard: [],
    adharCard: [],
    rc: [],
  });

  // ✅ Fetch Owners
  const fetchOwners = async (search = '') => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const url = search ? `/api/owners?search=${encodeURIComponent(search)}` : '/api/owners';
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (data.success && Array.isArray(data.data)) {
        setOwners(data.data);
      } else {
        setOwners([]);
        setError(data.message || 'Failed to load owners');
      }
    } catch (error) {
      console.error('Error fetching owners:', error.message);
      setError('Failed to load owners');
      setOwners([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Input Change with Uppercase for specific fields
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Fields that should be uppercase (like Vehicle Master)
    const uppercaseFields = ['vehicleNumber', 'rcNumber', 'ownerPanCard'];
    
    let newValue = type === 'checkbox' ? checked : value;
    
    if (uppercaseFields.includes(name) && type !== 'checkbox') {
      newValue = value.toUpperCase();
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  // ✅ Handle File Selection
  const handleFileSelect = (e, docType) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    switch(docType) {
      case 'panCard':
        setPanCardFiles(prev => [...prev, ...files]);
        break;
      case 'adharCard':
        setAdharCardFiles(prev => [...prev, ...files]);
        break;
      case 'rc':
        setRcFiles(prev => [...prev, ...files]);
        break;
      default:
        break;
    }
    e.target.value = '';
  };

  // ✅ Remove File from local state
  const removeFile = (index, docType) => {
    switch(docType) {
      case 'panCard':
        setPanCardFiles(prev => prev.filter((_, i) => i !== index));
        break;
      case 'adharCard':
        setAdharCardFiles(prev => prev.filter((_, i) => i !== index));
        break;
      case 'rc':
        setRcFiles(prev => prev.filter((_, i) => i !== index));
        break;
      default:
        break;
    }
  };

  // ✅ Handle removing existing document
  const handleRemoveExistingDocument = (docType, index) => {
    setDocumentsToDelete(prev => ({
      ...prev,
      [docType]: [...(prev[docType] || []), index]
    }));
    
    setExistingDocuments(prev => ({
      ...prev,
      [docType + 'Documents']: prev[docType + 'Documents']?.filter((_, i) => i !== index)
    }));
  };

  // ✅ Upload a single file
  const uploadFile = async (file, docType) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('section', 'owner');
    formData.append('field', docType);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/upload/excel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Upload failed with status ${res.status}`);
      }

      const data = await res.json();
      return data.success ? data.filePath : null;
    } catch (error) {
      console.error(`Error uploading ${docType}:`, error);
      return null;
    }
  };

  // ✅ Upload all files
  const uploadAllFiles = async () => {
    const uploadedPaths = {
      panCard: [],
      adharCard: [],
      rc: [],
    };

    for (const file of panCardFiles) {
      const path = await uploadFile(file, 'panCard');
      if (path) uploadedPaths.panCard.push(path);
    }

    for (const file of adharCardFiles) {
      const path = await uploadFile(file, 'adharCard');
      if (path) uploadedPaths.adharCard.push(path);
    }

    for (const file of rcFiles) {
      const path = await uploadFile(file, 'rc');
      if (path) uploadedPaths.rc.push(path);
    }

    return uploadedPaths;
  };

  // ✅ Reset Form
  const resetForm = () => {
    setFormData({
      ownerName: '',
      vehicleNumber: '',
      ownerPanCard: '',
      mobileNumber1: '',
      mobileNumber2: '',
      adharCardNumber: '',
      rcNumber: '',
      isActive: true,
    });
    setPanCardFiles([]);
    setAdharCardFiles([]);
    setRcFiles([]);
    setExistingDocuments({});
    setDocumentsToDelete({
      panCard: [],
      adharCard: [],
      rc: [],
    });
    setEditingId(null);
    setError(null);
  };

  // ✅ Add or Update Owner
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (!formData.ownerName || !formData.vehicleNumber) {
      setError('Owner Name and Vehicle Number are required');
      setSubmitting(false);
      return;
    }

    try {
      const uploadedPaths = await uploadAllFiles();
      
      const token = localStorage.getItem('token');
      const url = editingId ? `/api/owners?id=${editingId}` : '/api/owners';
      const method = editingId ? 'PUT' : 'POST';

      const getExistingDocuments = (docType) => {
        const existing = existingDocuments[docType + 'Documents'] || [];
        const toDelete = documentsToDelete[docType] || [];
        return existing.filter((_, index) => !toDelete.includes(index));
      };

      const payload = {
        ownerName: formData.ownerName,
        vehicleNumber: formData.vehicleNumber.toUpperCase(),
        ownerPanCard: formData.ownerPanCard.toUpperCase(),
        mobileNumber1: formData.mobileNumber1,
        mobileNumber2: formData.mobileNumber2,
        adharCardNumber: formData.adharCardNumber,
        rcNumber: formData.rcNumber.toUpperCase(),
        panCardDocuments: [...getExistingDocuments('panCard'), ...uploadedPaths.panCard],
        adharCardDocuments: [...getExistingDocuments('adharCard'), ...uploadedPaths.adharCard],
        rcDocuments: [...getExistingDocuments('rc'), ...uploadedPaths.rc],
        isActive: formData.isActive,
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || `Failed to ${editingId ? 'update' : 'add'} owner`);
        setSubmitting(false);
        return;
      }

      resetForm();
      fetchOwners(searchTerm);
      alert(`✅ Owner ${editingId ? 'updated' : 'added'} successfully!`);
    } catch (error) {
      console.error(`Error ${editingId ? 'updating' : 'adding'} owner:`, error.message);
      setError(`Failed to ${editingId ? 'update' : 'add'} owner.`);
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Edit Owner
  const editOwner = (owner) => {
    setFormData({
      ownerName: owner.ownerName,
      vehicleNumber: owner.vehicleNumber,
      ownerPanCard: owner.ownerPanCard || '',
      mobileNumber1: owner.mobileNumber1 || '',
      mobileNumber2: owner.mobileNumber2 || '',
      adharCardNumber: owner.adharCardNumber || '',
      rcNumber: owner.rcNumber || '',
      isActive: owner.isActive,
    });
    
    setExistingDocuments({
      panCardDocuments: owner.panCardDocuments || [],
      adharCardDocuments: owner.adharCardDocuments || [],
      rcDocuments: owner.rcDocuments || [],
    });
    
    setDocumentsToDelete({
      panCard: [],
      adharCard: [],
      rc: [],
    });
    
    setPanCardFiles([]);
    setAdharCardFiles([]);
    setRcFiles([]);
    setEditingId(owner._id);
    setError(null);
  };

  // ✅ Delete Owner
  const deleteOwner = async (id) => {
    if (!confirm('Are you sure you want to delete this owner?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/owners?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Failed to delete owner');
        return;
      }

      setError(null);
      fetchOwners(searchTerm);
      alert('✅ Owner deleted successfully!');
    } catch (error) {
      console.error('Error deleting owner:', error.message);
      setError('Failed to delete owner.');
    }
  };

  // ✅ Toggle Active Status
  const toggleActive = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/owners?id=${id}`, {
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

      fetchOwners(searchTerm);
    } catch (error) {
      console.error('Error toggling owner status:', error.message);
      setError('Failed to update status.');
    }
  };

  // ✅ Handle Search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchOwners(searchTerm);
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-2xl font-bold mb-4 text-slate-800">Owner Master</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by owner name, vehicle number, RC number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-slate-300 px-4 py-2 flex-1 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
          />
          <button type="submit" className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition">
            Search
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              fetchOwners();
            }}
            className="bg-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-400 transition"
          >
            Clear
          </button>
        </div>
      </form>

      {/* Add/Edit Form */}
      <form onSubmit={handleSubmit} className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-4">{editingId ? 'Edit Owner' : 'Add New Owner'}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {/* Owner Name */}
          <div className="border rounded-lg p-3 bg-white shadow-sm">
            <label className="text-xs font-bold text-slate-600 block mb-1">Owner Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="ownerName"
              placeholder="Enter Owner Name"
              value={formData.ownerName}
              onChange={handleInputChange}
              className="border border-slate-200 rounded-lg px-3 py-2 w-full text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              required
            />
          </div>

          {/* Vehicle Number - with uppercase */}
          <div className="border rounded-lg p-3 bg-white shadow-sm">
            <label className="text-xs font-bold text-slate-600 block mb-1">Vehicle Number <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="vehicleNumber"
              placeholder="Enter Vehicle Number"
              value={formData.vehicleNumber}
              onChange={handleInputChange}
              className="border border-slate-200 rounded-lg px-3 py-2 w-full text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none uppercase"
              required
            />
          </div>

          {/* Mobile Number 1 */}
          <div className="border rounded-lg p-3 bg-white shadow-sm">
            <label className="text-xs font-bold text-slate-600 block mb-1">Mobile Number 1</label>
            <input
              type="tel"
              name="mobileNumber1"
              placeholder="Enter Mobile Number"
              value={formData.mobileNumber1}
              onChange={handleInputChange}
              className="border border-slate-200 rounded-lg px-3 py-2 w-full text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* Mobile Number 2 */}
          <div className="border rounded-lg p-3 bg-white shadow-sm">
            <label className="text-xs font-bold text-slate-600 block mb-1">Mobile Number 2</label>
            <input
              type="tel"
              name="mobileNumber2"
              placeholder="Enter Alternate Mobile Number"
              value={formData.mobileNumber2}
              onChange={handleInputChange}
              className="border border-slate-200 rounded-lg px-3 py-2 w-full text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* Owner Pan Card Section - with uppercase */}
          <DocumentUploadSection
            label="Owner Pan Card Number"
            value={formData.ownerPanCard}
            placeholder="Enter Pan Card Number"
            onChange={(e) => setFormData(prev => ({ ...prev, ownerPanCard: e.target.value.toUpperCase() }))}
            files={panCardFiles}
            onFileSelect={handleFileSelect}
            onRemoveFile={removeFile}
            onRemoveExistingDocument={handleRemoveExistingDocument}
            existingDocuments={existingDocuments.panCardDocuments}
            documentType="panCard"
          />

          {/* Adhar Card Section */}
          <DocumentUploadSection
            label="Adhar Card Number"
            value={formData.adharCardNumber}
            placeholder="Enter Adhar Card Number"
            onChange={(e) => setFormData(prev => ({ ...prev, adharCardNumber: e.target.value }))}
            files={adharCardFiles}
            onFileSelect={handleFileSelect}
            onRemoveFile={removeFile}
            onRemoveExistingDocument={handleRemoveExistingDocument}
            existingDocuments={existingDocuments.adharCardDocuments}
            documentType="adharCard"
          />

          {/* RC Number Section - with uppercase */}
          <DocumentUploadSection
            label="RC Number"
            value={formData.rcNumber}
            placeholder="Enter RC Number"
            onChange={(e) => setFormData(prev => ({ ...prev, rcNumber: e.target.value.toUpperCase() }))}
            files={rcFiles}
            onFileSelect={handleFileSelect}
            onRemoveFile={removeFile}
            onRemoveExistingDocument={handleRemoveExistingDocument}
            existingDocuments={existingDocuments.rcDocuments}
            documentType="rc"
          />

          {/* Active Status */}
          <div className="border rounded-lg p-3 bg-white shadow-sm flex items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span className="text-sm font-medium text-slate-700">Active Owner</span>
            </label>
          </div>
        </div>
        
        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className={`bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition font-medium ${
              submitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {submitting ? 'Uploading & Saving...' : (editingId ? 'Update Owner' : 'Add Owner')}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-slate-500 text-white px-6 py-2 rounded-lg hover:bg-slate-600 transition font-medium"
            >
              Cancel Edit
            </button>
          )}
        </div>
        {submitting && (
          <div className="mt-2 text-sm text-emerald-600 flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Uploading documents and saving owner...
          </div>
        )}
      </form>

      {/* Owners List */}
      {loading ? (
        <div className="text-center py-8">Loading owners...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-xl overflow-hidden">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 border text-left text-sm font-bold text-slate-700">Owner Name</th>
                <th className="px-4 py-3 border text-left text-sm font-bold text-slate-700">Vehicle No.</th>
                <th className="px-4 py-3 border text-left text-sm font-bold text-slate-700">Mobile Numbers</th>
                <th className="px-4 py-3 border text-left text-sm font-bold text-slate-700">Pan Card</th>
                <th className="px-4 py-3 border text-left text-sm font-bold text-slate-700">Adhar Card</th>
                <th className="px-4 py-3 border text-left text-sm font-bold text-slate-700">RC Number</th>
                <th className="px-4 py-3 border text-center text-sm font-bold text-slate-700">Status</th>
                <th className="px-4 py-3 border text-center text-sm font-bold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {owners.length > 0 ? (
                owners.map((owner) => (
                  <tr key={owner._id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-2 border text-sm font-medium">{owner.ownerName}</td>
                    <td className="px-4 py-2 border text-sm uppercase">{owner.vehicleNumber}</td>
                    <td className="px-4 py-2 border text-sm">
                      {owner.mobileNumber1}
                      {owner.mobileNumber2 && <span className="block text-xs text-slate-500">{owner.mobileNumber2}</span>}
                    </td>
                    <td className="px-4 py-2 border text-sm uppercase">
                      {owner.ownerPanCard}
                      {owner.panCardDocuments?.length > 0 && (
                        <div className="text-xs text-slate-500 mt-1">
                          📄 {owner.panCardDocuments.length} file(s)
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 border text-sm">
                      {owner.adharCardNumber}
                      {owner.adharCardDocuments?.length > 0 && (
                        <div className="text-xs text-slate-500 mt-1">
                          📄 {owner.adharCardDocuments.length} file(s)
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 border text-sm uppercase">
                      {owner.rcNumber}
                      {owner.rcDocuments?.length > 0 && (
                        <div className="text-xs text-slate-500 mt-1">
                          📄 {owner.rcDocuments.length} file(s)
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 border text-center">
                      <button
                        onClick={() => toggleActive(owner._id, owner.isActive)}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          owner.isActive 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        } transition`}
                      >
                        {owner.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-2 border text-center">
                      <button
                        onClick={() => editOwner(owner)}
                        className="bg-amber-500 text-white px-3 py-1 rounded-md mr-2 hover:bg-amber-600 transition text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteOwner(owner._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-500">
                    No owners found
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