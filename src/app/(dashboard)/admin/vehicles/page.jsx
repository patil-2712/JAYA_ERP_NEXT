'use client';

import { useState, useEffect } from 'react';

// Vehicle Type Options
const VEHICLE_TYPE_OPTIONS = [
  "Truck - 6 Wheels",
  "Truck - 10 Wheels", 
  "Truck - 14 Wheels",
  "Container",
  "Trailer",
  "Pickup",
  "Van",
  "Bus",
  "Car",
  "Other"
];

// File Upload Item Component (just for display, not actual upload)
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

// Document Upload Section Component with Delete Option for Existing Documents
function DocumentUploadSection({ 
  label, 
  numberValue, 
  numberPlaceholder, 
  onNumberChange, 
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
        value={numberValue}
        onChange={onNumberChange}
        placeholder={numberPlaceholder}
        className="border border-slate-200 rounded-lg px-3 py-2 w-full text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
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

export default function VehiclePage() {
  const [vehicles, setVehicles] = useState([]);
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    rcNumber: '',
    pucNumber: '',
    fitnessNumber: '',
    ownerName: '',
    chasisNumber: '',
    insuranceNumber: '',
    vehicleType: '',
    vehicleWeight: '',
    isActive: true,
  });
  
  // File states (store files temporarily, upload on submit)
  const [rcFiles, setRcFiles] = useState([]);
  const [pucFiles, setPucFiles] = useState([]);
  const [fitnessFiles, setFitnessFiles] = useState([]);
  const [weightSlipFiles, setWeightSlipFiles] = useState([]);
  const [insuranceFiles, setInsuranceFiles] = useState([]);
  const [chasisFiles, setChasisFiles] = useState([]);
  const [vehiclePhotoFiles, setVehiclePhotoFiles] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [existingDocuments, setExistingDocuments] = useState({});
  
  // State for documents to delete
  const [documentsToDelete, setDocumentsToDelete] = useState({
    rc: [],
    puc: [],
    fitness: [],
    weightSlip: [],
    insurance: [],
    chasis: [],
    photo: [],
  });

  // ✅ Fetch Vehicles
  const fetchVehicles = async (search = '') => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const url = search ? `/api/vehicles?search=${encodeURIComponent(search)}` : '/api/vehicles';
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (data.success && Array.isArray(data.data)) {
        setVehicles(data.data);
      } else {
        setVehicles([]);
        setError(data.message || 'Failed to load vehicles');
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error.message);
      setError('Failed to load vehicles');
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Input Change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value.toUpperCase()
    }));
  };

  // ✅ Handle Vehicle Type Change
  const handleVehicleTypeChange = (e) => {
    setFormData(prev => ({
      ...prev,
      vehicleType: e.target.value
    }));
  };

  // ✅ Handle Vehicle Weight Change
  const handleVehicleWeightChange = (e) => {
    setFormData(prev => ({
      ...prev,
      vehicleWeight: e.target.value
    }));
  };

  // ✅ Handle File Selection (store files locally)
  const handleFileSelect = (e, docType) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    switch(docType) {
      case 'rc':
        setRcFiles(prev => [...prev, ...files]);
        break;
      case 'puc':
        setPucFiles(prev => [...prev, ...files]);
        break;
      case 'fitness':
        setFitnessFiles(prev => [...prev, ...files]);
        break;
      case 'weightSlip':
        setWeightSlipFiles(prev => [...prev, ...files]);
        break;
      case 'insurance':
        setInsuranceFiles(prev => [...prev, ...files]);
        break;
      case 'chasis':
        setChasisFiles(prev => [...prev, ...files]);
        break;
      case 'photo':
        setVehiclePhotoFiles(prev => [...prev, ...files]);
        break;
      default:
        break;
    }
    e.target.value = '';
  };

  // ✅ Remove File from local state
  const removeFile = (index, docType) => {
    switch(docType) {
      case 'rc':
        setRcFiles(prev => prev.filter((_, i) => i !== index));
        break;
      case 'puc':
        setPucFiles(prev => prev.filter((_, i) => i !== index));
        break;
      case 'fitness':
        setFitnessFiles(prev => prev.filter((_, i) => i !== index));
        break;
      case 'weightSlip':
        setWeightSlipFiles(prev => prev.filter((_, i) => i !== index));
        break;
      case 'insurance':
        setInsuranceFiles(prev => prev.filter((_, i) => i !== index));
        break;
      case 'chasis':
        setChasisFiles(prev => prev.filter((_, i) => i !== index));
        break;
      case 'photo':
        setVehiclePhotoFiles(prev => prev.filter((_, i) => i !== index));
        break;
      default:
        break;
    }
  };

  // ✅ Handle removing existing document (mark for deletion)
  const handleRemoveExistingDocument = (docType, index) => {
    setDocumentsToDelete(prev => ({
      ...prev,
      [docType]: [...(prev[docType] || []), index]
    }));
    
    // Also remove from existingDocuments display
    setExistingDocuments(prev => ({
      ...prev,
      [docType + 'Documents']: prev[docType + 'Documents']?.filter((_, i) => i !== index)
    }));
  };

  // ✅ Upload a single file to server
  const uploadFile = async (file, docType) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('section', 'vehicle');
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

  // ✅ Upload all files and get paths
  const uploadAllFiles = async () => {
    const uploadedPaths = {
      rc: [],
      puc: [],
      fitness: [],
      weightSlip: [],
      insurance: [],
      chasis: [],
      photo: [],
    };

    // Upload RC files
    for (const file of rcFiles) {
      const path = await uploadFile(file, 'rc');
      if (path) uploadedPaths.rc.push(path);
    }

    // Upload PUC files
    for (const file of pucFiles) {
      const path = await uploadFile(file, 'puc');
      if (path) uploadedPaths.puc.push(path);
    }

    // Upload Fitness files
    for (const file of fitnessFiles) {
      const path = await uploadFile(file, 'fitness');
      if (path) uploadedPaths.fitness.push(path);
    }

    // Upload Weight Slip files
    for (const file of weightSlipFiles) {
      const path = await uploadFile(file, 'weightSlip');
      if (path) uploadedPaths.weightSlip.push(path);
    }

    // Upload Insurance files
    for (const file of insuranceFiles) {
      const path = await uploadFile(file, 'insurance');
      if (path) uploadedPaths.insurance.push(path);
    }

    // Upload Chasis files
    for (const file of chasisFiles) {
      const path = await uploadFile(file, 'chasis');
      if (path) uploadedPaths.chasis.push(path);
    }

    // Upload Photo files
    for (const file of vehiclePhotoFiles) {
      const path = await uploadFile(file, 'photo');
      if (path) uploadedPaths.photo.push(path);
    }

    return uploadedPaths;
  };

  // ✅ Reset Form
  const resetForm = () => {
    setFormData({
      vehicleNumber: '',
      rcNumber: '',
      pucNumber: '',
      fitnessNumber: '',
      ownerName: '',
      chasisNumber: '',
      insuranceNumber: '',
      vehicleType: '',
      vehicleWeight: '',
      isActive: true,
    });
    setRcFiles([]);
    setPucFiles([]);
    setFitnessFiles([]);
    setWeightSlipFiles([]);
    setInsuranceFiles([]);
    setChasisFiles([]);
    setVehiclePhotoFiles([]);
    setExistingDocuments({});
    setDocumentsToDelete({
      rc: [],
      puc: [],
      fitness: [],
      weightSlip: [],
      insurance: [],
      chasis: [],
      photo: [],
    });
    setEditingId(null);
    setError(null);
  };

  // ✅ Add or Update Vehicle (Upload files on submit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    // Validate required fields
    if (!formData.vehicleNumber || !formData.rcNumber || !formData.ownerName) {
      setError('Vehicle Number, RC Number, and Owner Name are required');
      setSubmitting(false);
      return;
    }

    try {
      // First, upload all files
      const uploadedPaths = await uploadAllFiles();
      
      const token = localStorage.getItem('token');
      const url = editingId ? `/api/vehicles?id=${editingId}` : '/api/vehicles';
      const method = editingId ? 'PUT' : 'POST';

      // Get existing documents (excluding those marked for deletion)
      const getExistingDocuments = (docType) => {
        const existing = existingDocuments[docType + 'Documents'] || [];
        const toDelete = documentsToDelete[docType] || [];
        return existing.filter((_, index) => !toDelete.includes(index));
      };

      // Combine existing (not deleted) + new uploaded documents
      const allRcDocuments = [...getExistingDocuments('rc'), ...uploadedPaths.rc];
      const allPucDocuments = [...getExistingDocuments('puc'), ...uploadedPaths.puc];
      const allFitnessDocuments = [...getExistingDocuments('fitness'), ...uploadedPaths.fitness];
      const allWeightSlipDocuments = [...getExistingDocuments('weightSlip'), ...uploadedPaths.weightSlip];
      const allInsuranceDocuments = [...getExistingDocuments('insurance'), ...uploadedPaths.insurance];
      const allChasisDocuments = [...getExistingDocuments('chasis'), ...uploadedPaths.chasis];
      const allVehiclePhotos = [...getExistingDocuments('photo'), ...uploadedPaths.photo];

      const payload = {
        ...formData,
        vehicleWeight: formData.vehicleWeight ? parseFloat(formData.vehicleWeight) : 0,
        rcDocuments: allRcDocuments,
        pucDocuments: allPucDocuments,
        fitnessDocuments: allFitnessDocuments,
        weightSlipDocuments: allWeightSlipDocuments,
        insuranceDocuments: allInsuranceDocuments,
        chasisDocuments: allChasisDocuments,
        vehiclePhotos: allVehiclePhotos,
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
        setError(data.message || `Failed to ${editingId ? 'update' : 'add'} vehicle`);
        setSubmitting(false);
        return;
      }

      resetForm();
      fetchVehicles(searchTerm);
      alert(`✅ Vehicle ${editingId ? 'updated' : 'added'} successfully!`);
    } catch (error) {
      console.error(`Error ${editingId ? 'updating' : 'adding'} vehicle:`, error.message);
      setError(`Failed to ${editingId ? 'update' : 'add'} vehicle.`);
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Edit Vehicle
  const editVehicle = (vehicle) => {
    setFormData({
      vehicleNumber: vehicle.vehicleNumber,
      rcNumber: vehicle.rcNumber,
      pucNumber: vehicle.pucNumber || '',
      fitnessNumber: vehicle.fitnessNumber || '',
      ownerName: vehicle.ownerName,
      chasisNumber: vehicle.chasisNumber || '',
      insuranceNumber: vehicle.insuranceNumber || '',
      vehicleType: vehicle.vehicleType || '',
      vehicleWeight: vehicle.vehicleWeight?.toString() || '',
      isActive: vehicle.isActive,
    });
    
    setExistingDocuments({
      rcDocuments: vehicle.rcDocuments || [],
      pucDocuments: vehicle.pucDocuments || [],
      fitnessDocuments: vehicle.fitnessDocuments || [],
      weightSlipDocuments: vehicle.weightSlipDocuments || [],
      insuranceDocuments: vehicle.insuranceDocuments || [],
      chasisDocuments: vehicle.chasisDocuments || [],
      vehiclePhotos: vehicle.vehiclePhotos || [],
    });
    
    // Reset documents to delete
    setDocumentsToDelete({
      rc: [],
      puc: [],
      fitness: [],
      weightSlip: [],
      insurance: [],
      chasis: [],
      photo: [],
    });
    
    setRcFiles([]);
    setPucFiles([]);
    setFitnessFiles([]);
    setWeightSlipFiles([]);
    setInsuranceFiles([]);
    setChasisFiles([]);
    setVehiclePhotoFiles([]);
    setEditingId(vehicle._id);
    setError(null);
  };

  // ✅ Delete Vehicle
  const deleteVehicle = async (id) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/vehicles?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Failed to delete vehicle');
        return;
      }

      setError(null);
      fetchVehicles(searchTerm);
      alert('✅ Vehicle deleted successfully!');
    } catch (error) {
      console.error('Error deleting vehicle:', error.message);
      setError('Failed to delete vehicle.');
    }
  };

  // ✅ Toggle Active Status
  const toggleActive = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/vehicles?id=${id}`, {
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

      fetchVehicles(searchTerm);
    } catch (error) {
      console.error('Error toggling vehicle status:', error.message);
      setError('Failed to update status.');
    }
  };

  // ✅ Handle Search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchVehicles(searchTerm);
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-2xl font-bold mb-4 text-slate-800">Vehicle Master</h1>

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
            placeholder="Search by vehicle number, RC number, owner name..."
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
              fetchVehicles();
            }}
            className="bg-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-400 transition"
          >
            Clear
          </button>
        </div>
      </form>

      {/* Add/Edit Form */}
      <form onSubmit={handleSubmit} className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-4">{editingId ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Basic Information Section */}
          <div className="border rounded-lg p-3 bg-white shadow-sm">
            <label className="text-xs font-bold text-slate-600 block mb-1">Vehicle Number <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="vehicleNumber"
              placeholder="Vehicle Number"
              value={formData.vehicleNumber}
              onChange={handleInputChange}
              className="border border-slate-200 rounded-lg px-3 py-2 w-full text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              required
            />
          </div>

          <div className="border rounded-lg p-3 bg-white shadow-sm">
            <label className="text-xs font-bold text-slate-600 block mb-1">Owner Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="ownerName"
              placeholder="Owner Name"
              value={formData.ownerName}
              onChange={handleInputChange}
              className="border border-slate-200 rounded-lg px-3 py-2 w-full text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              required
            />
          </div>

          <div className="border rounded-lg p-3 bg-white shadow-sm">
            <label className="text-xs font-bold text-slate-600 block mb-1">Vehicle Type</label>
            <select
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleVehicleTypeChange}
              className="border border-slate-200 rounded-lg px-3 py-2 w-full text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
            >
              <option value="">Select Vehicle Type</option>
              {VEHICLE_TYPE_OPTIONS.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="border rounded-lg p-3 bg-white shadow-sm">
            <label className="text-xs font-bold text-slate-600 block mb-1">Vehicle Weight (MT)</label>
            <input
              type="number"
              name="vehicleWeight"
              placeholder="Vehicle Weight"
              value={formData.vehicleWeight}
              onChange={handleVehicleWeightChange}
              className="border border-slate-200 rounded-lg px-3 py-2 w-full text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              step="0.01"
            />
          </div>

          {/* RC Document Section */}
          <DocumentUploadSection
            label="RC Number"
            numberValue={formData.rcNumber}
            numberPlaceholder="Enter RC Number"
            onNumberChange={(e) => setFormData(prev => ({ ...prev, rcNumber: e.target.value.toUpperCase() }))}
            files={rcFiles}
            onFileSelect={handleFileSelect}
            onRemoveFile={removeFile}
            onRemoveExistingDocument={handleRemoveExistingDocument}
            existingDocuments={existingDocuments.rcDocuments}
            documentType="rc"
            required={true}
          />

          {/* PUC Document Section */}
          <DocumentUploadSection
            label="PUC Number"
            numberValue={formData.pucNumber}
            numberPlaceholder="Enter PUC Number"
            onNumberChange={(e) => setFormData(prev => ({ ...prev, pucNumber: e.target.value.toUpperCase() }))}
            files={pucFiles}
            onFileSelect={handleFileSelect}
            onRemoveFile={removeFile}
            onRemoveExistingDocument={handleRemoveExistingDocument}
            existingDocuments={existingDocuments.pucDocuments}
            documentType="puc"
          />

          {/* Fitness Document Section */}
          <DocumentUploadSection
            label="Fitness Number"
            numberValue={formData.fitnessNumber}
            numberPlaceholder="Enter Fitness Number"
            onNumberChange={(e) => setFormData(prev => ({ ...prev, fitnessNumber: e.target.value.toUpperCase() }))}
            files={fitnessFiles}
            onFileSelect={handleFileSelect}
            onRemoveFile={removeFile}
            onRemoveExistingDocument={handleRemoveExistingDocument}
            existingDocuments={existingDocuments.fitnessDocuments}
            documentType="fitness"
          />

          {/* Weight Slip Document Section */}
          <DocumentUploadSection
            label="Weight Slip"
            numberValue={formData.vehicleWeight?.toString() || ''}
            numberPlaceholder="Enter Weight (MT)"
            onNumberChange={handleVehicleWeightChange}
            files={weightSlipFiles}
            onFileSelect={handleFileSelect}
            onRemoveFile={removeFile}
            onRemoveExistingDocument={handleRemoveExistingDocument}
            existingDocuments={existingDocuments.weightSlipDocuments}
            documentType="weightSlip"
          />

          {/* Insurance Document Section */}
          <DocumentUploadSection
            label="Insurance Number"
            numberValue={formData.insuranceNumber}
            numberPlaceholder="Enter Insurance Number"
            onNumberChange={(e) => setFormData(prev => ({ ...prev, insuranceNumber: e.target.value.toUpperCase() }))}
            files={insuranceFiles}
            onFileSelect={handleFileSelect}
            onRemoveFile={removeFile}
            onRemoveExistingDocument={handleRemoveExistingDocument}
            existingDocuments={existingDocuments.insuranceDocuments}
            documentType="insurance"
          />

          {/* Chasis Document Section */}
          <DocumentUploadSection
            label="Chasis Number"
            numberValue={formData.chasisNumber}
            numberPlaceholder="Enter Chasis Number"
            onNumberChange={(e) => setFormData(prev => ({ ...prev, chasisNumber: e.target.value.toUpperCase() }))}
            files={chasisFiles}
            onFileSelect={handleFileSelect}
            onRemoveFile={removeFile}
            onRemoveExistingDocument={handleRemoveExistingDocument}
            existingDocuments={existingDocuments.chasisDocuments}
            documentType="chasis"
          />

          {/* Vehicle Photo Section */}
          <div className="border rounded-lg p-3 bg-white shadow-sm">
            <label className="text-xs font-bold text-slate-600 block mb-1">Vehicle Photo</label>
            <div className="mt-1">
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => handleFileSelect(e, 'photo')}
                className="text-xs w-full border border-slate-200 rounded-lg p-1.5 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                multiple
              />
              <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                {vehiclePhotoFiles.map((file, idx) => (
                  <FileItem key={`photo-new-${idx}`} file={file} index={idx} onRemove={() => removeFile(idx, 'photo')} label="Photo" />
                ))}
                {existingDocuments.vehiclePhotos?.map((doc, idx) => (
                  <div key={`existing-photo-${idx}`} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-green-800">Existing Photo</p>
                      <a href={doc} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-600 hover:underline">
                        View Photo {idx + 1}
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingDocument('photo', idx)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Remove this photo"
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
              <span className="text-sm font-medium text-slate-700">Active Vehicle</span>
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
            {submitting ? 'Uploading & Saving...' : (editingId ? 'Update Vehicle' : 'Add Vehicle')}
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
            Uploading documents and saving vehicle...
          </div>
        )}
      </form>

      {/* Vehicles List */}
      {loading ? (
        <div className="text-center py-8">Loading vehicles...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-xl overflow-hidden">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 border text-left text-sm font-bold text-slate-700">Vehicle No.</th>
                <th className="px-4 py-3 border text-left text-sm font-bold text-slate-700">RC No.</th>
                <th className="px-4 py-3 border text-left text-sm font-bold text-slate-700">Owner</th>
                <th className="px-4 py-3 border text-left text-sm font-bold text-slate-700">Type</th>
                <th className="px-4 py-3 border text-left text-sm font-bold text-slate-700">Weight</th>
                <th className="px-4 py-3 border text-left text-sm font-bold text-slate-700">Documents</th>
                <th className="px-4 py-3 border text-center text-sm font-bold text-slate-700">Status</th>
                <th className="px-4 py-3 border text-center text-sm font-bold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.length > 0 ? (
                vehicles.map((vehicle) => (
                  <tr key={vehicle._id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-2 border text-sm">{vehicle.vehicleNumber}</td>
                    <td className="px-4 py-2 border text-sm">{vehicle.rcNumber}</td>
                    <td className="px-4 py-2 border text-sm">{vehicle.ownerName}</td>
                    <td className="px-4 py-2 border text-sm">{vehicle.vehicleType || '-'}</td>
                    <td className="px-4 py-2 border text-sm">{vehicle.vehicleWeight || '-'}</td>
                    <td className="px-4 py-2 border text-sm">
                      <div className="space-y-1">
                        {vehicle.rcDocuments?.length > 0 && <div className="text-xs text-slate-600">📄 RC: {vehicle.rcDocuments.length} file(s)</div>}
                        {vehicle.pucDocuments?.length > 0 && <div className="text-xs text-slate-600">📄 PUC: {vehicle.pucDocuments.length} file(s)</div>}
                        {vehicle.fitnessDocuments?.length > 0 && <div className="text-xs text-slate-600">📄 Fitness: {vehicle.fitnessDocuments.length} file(s)</div>}
                        {vehicle.weightSlipDocuments?.length > 0 && <div className="text-xs text-slate-600">📄 Weight Slip: {vehicle.weightSlipDocuments.length} file(s)</div>}
                        {vehicle.insuranceDocuments?.length > 0 && <div className="text-xs text-slate-600">📄 Insurance: {vehicle.insuranceDocuments.length} file(s)</div>}
                        {vehicle.chasisDocuments?.length > 0 && <div className="text-xs text-slate-600">📄 Chasis: {vehicle.chasisDocuments.length} file(s)</div>}
                        {vehicle.vehiclePhotos?.length > 0 && <div className="text-xs text-slate-600">📷 Photo: {vehicle.vehiclePhotos.length} file(s)</div>}
                        {(!vehicle.rcDocuments?.length && !vehicle.pucDocuments?.length && !vehicle.fitnessDocuments?.length && 
                          !vehicle.weightSlipDocuments?.length && !vehicle.insuranceDocuments?.length && !vehicle.chasisDocuments?.length && 
                          !vehicle.vehiclePhotos?.length) && <span className="text-slate-400 text-xs">No documents</span>}
                      </div>
                    </td>
                    <td className="px-4 py-2 border text-center">
                      <button
                        onClick={() => toggleActive(vehicle._id, vehicle.isActive)}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          vehicle.isActive 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        } transition`}
                      >
                        {vehicle.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-2 border text-center">
                      <button
                        onClick={() => editVehicle(vehicle)}
                        className="bg-amber-500 text-white px-3 py-1 rounded-md mr-2 hover:bg-amber-600 transition text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteVehicle(vehicle._id)}
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
                    No vehicles found
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