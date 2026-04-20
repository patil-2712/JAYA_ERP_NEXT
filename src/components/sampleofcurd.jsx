"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  FaEdit, FaTrash, FaPlus, FaSearch, FaMinus, FaUsers,
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaFileUpload,
  FaDownload, FaChevronRight, FaChevronLeft, FaTimes, FaCheck,
  FaArrowLeft, FaShieldAlt, FaExclamationCircle, FaClipboardCheck,
  FaBuilding, FaIdCard, FaTrashAlt, FaEye, FaCloudUploadAlt, FaFileInvoice
} from "react-icons/fa";
import { HiOutlineDocumentText } from "react-icons/hi";
import CountryStateSearch from "@/components/CountryStateSearch";
import GroupSearch from "@/components/groupmaster";
import AccountSearch from "@/components/AccountSearch";
import { toast } from "react-toastify";

// ─── 7 Steps (Added Documents) ───
const STEPS = [
  { id: 1, label: "Basic Info",      icon: FaUser },
  { id: 2, label: "Contact",         icon: FaPhone },
  { id: 3, label: "Addresses",       icon: FaMapMarkerAlt },
  { id: 4, label: "Tax & Finance",   icon: HiOutlineDocumentText },
  { id: 5, label: "Documents",       icon: FaFileUpload },
  { id: 6, label: "SLA & Agents",    icon: FaShieldAlt },
  { id: 7, label: "Review & Submit", icon: FaClipboardCheck },
];

// ✅ EMPTY_ADDR with Title and GST
const EMPTY_ADDR = { 
  title: "",  
  address1: "", 
  address2: "", 
  country: "", 
  state: "", 
  city: "", 
  pin: "",
  gstNumber: ""  // GST field for each address
};

// ✅ Customer Document Types
const CUSTOMER_DOC_TYPES = [
  { key: "gstCertificate", label: "GST Certificate", icon: HiOutlineDocumentText, accept: "image/*,.pdf", required: false },
  { key: "panCard", label: "PAN Card", icon: FaIdCard, accept: "image/*,.pdf", required: true },
  { key: "iecCertificate", label: "IEC Certificate", icon: HiOutlineDocumentText, accept: "image/*,.pdf", required: false },
];

const EMPTY = {
  customerCode: "", customerName: "", customerGroup: "", customerType: "",
  emailId: "", mobileNumber: "", contactPersonName: "", commissionRate: "",
  billingAddresses:  [{ ...EMPTY_ADDR }],
  shippingAddresses: [{ ...EMPTY_ADDR }],
  paymentTerms: "", gstNumber: "", gstCategory: "", pan: "",
  glAccount: null, assignedAgents: [], contactEmails: [], slaPolicyId: null,
  documents: {
    gstCertificate: null,
    panCard: null,
    iecCertificate: null,
    otherDocuments: []
  }
};

const VALIDATORS = {
  1: (d) => {
    const e = {};
    if (!d.customerName?.trim())  e.customerName  = "Customer Name is required";
    if (!d.customerGroup?.trim()) e.customerGroup = "Customer Group is required";
    if (!d.customerType)          e.customerType  = "Customer Type is required";
    return e;
  },
  2: (d) => {
    const e = {};
    if (d.emailId && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(d.emailId))
      e.emailId = "Invalid email format";
    if (d.mobileNumber && !/^\d{10}$/.test(d.mobileNumber))
      e.mobileNumber = "Must be exactly 10 digits";
    (d.contactEmails || []).forEach((c, i) => {
      if (c.email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(c.email))
        e[`ce_${i}`] = "Invalid email";
    });
    return e;
  },
  3: (d) => {
    const e = {};
    (d.billingAddresses  || []).forEach((a, i) => { 
      if (a.pin && !/^\d{6}$/.test(a.pin)) e[`bp_${i}`] = "PIN must be 6 digits";
      if (a.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(a.gstNumber)) 
        e[`bgst_${i}`] = "Invalid GST format";
    });
    (d.shippingAddresses || []).forEach((a, i) => { 
      if (a.pin && !/^\d{6}$/.test(a.pin)) e[`sp_${i}`] = "PIN must be 6 digits";
      if (a.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(a.gstNumber)) 
        e[`sgst_${i}`] = "Invalid GST format";
    });
    return e;
  },
  4: (d) => {
    const e = {};
    if (!d.pan?.trim()) e.pan = "PAN is required";
    else if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(d.pan)) e.pan = "Invalid PAN";
    if (d.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(d.gstNumber)) 
      e.gstNumber = "Invalid GST format";
    return e;
  },
  5: () => ({}),
  6: () => ({}),
  7: () => ({}),
};

// ✅ AddrBlock with Title and GST
const AddrBlock = ({ type, list, color, onChange, onRemove, onAdd, onFetchPin, fi, Err, errs }) => (
  <div>
    {list.map((addr, i) => (
      <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md ${color}`}>
              {type === "bill" ? "Billing" : "Shipping"} Address #{i + 1}
            </span>
          </div>
          {i > 0 && (
            <button type="button" onClick={() => onRemove(type, i)}
              className="w-7 h-7 rounded-lg bg-red-50 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all">
              <FaTimes className="text-xs" />
            </button>
          )}
        </div>
        
        {/* ✅ Address Title Field */}
        <div className="mb-3">
          <input 
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none bg-white"
            value={addr.title || ""} 
            onChange={e => onChange(type, i, "title", e.target.value)} 
            placeholder={`${type === "bill" ? "Billing" : "Shipping"} Address Title (e.g., Head Office, Warehouse)`}
          />
          <p className="text-[10px] text-gray-400 mt-1">Give this address a name for easy reference</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <input 
              className={fi("")} 
              value={addr.address1 || ""} 
              onChange={e => onChange(type, i, "address1", e.target.value)} 
              placeholder="Line 1 — Street address" 
            />
          </div>
          <div>
            <input 
              className={fi("")} 
              value={addr.address2 || ""} 
              onChange={e => onChange(type, i, "address2", e.target.value)} 
              placeholder="Line 2 — Apt, floor…" 
            />
          </div>
          <div>
            <input
              className={fi(type === "bill" ? `bp_${i}` : `sp_${i}`)}
              type="number" 
              value={addr.pin || ""} 
              placeholder="PIN code (6 digits)"
              onChange={e => { const p = e.target.value; onChange(type, i, "pin", p); onFetchPin(type, i, p); }}
            />
            <Err k={type === "bill" ? `bp_${i}` : `sp_${i}`} />
            {addr.pin?.length === 6 && !errs[`${type === "bill" ? "bp" : "sp"}_${i}`] &&
              <p className="text-[11px] text-emerald-500 font-medium mt-1">✓ City & State auto-filled</p>}
          </div>
          <div>
            <input 
              className={fi("")} 
              value={addr.city || ""} 
              onChange={e => onChange(type, i, "city", e.target.value)} 
              placeholder="City" 
            />
          </div>
        </div>
        <div className="mt-3">
          <CountryStateSearch
            valueCountry={addr.country ? { name: addr.country } : null}
            valueState={addr.state ? { name: addr.state } : null}
            onSelectCountry={c => onChange(type, i, "country", c?.name || "")}
            onSelectState={s => onChange(type, i, "state", s?.name || "")}
          />
        </div>
        
        {/* ✅ GST Field for this address */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <label className="block text-[10.5px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
            <FaFileInvoice className="inline mr-1 text-gray-400" /> GST Number <span className="text-gray-400">(optional for this address)</span>
          </label>
          <input
            className={`${fi(type === "bill" ? `bgst_${i}` : `sgst_${i}`)} font-mono text-sm`}
            value={addr.gstNumber || ""}
            onChange={e => {
              const gst = e.target.value.toUpperCase();
              onChange(type, i, "gstNumber", gst);
            }}
            placeholder="e.g., 22ABCDE1234F1Z5"
            maxLength={15}
          />
          <Err k={type === "bill" ? `bgst_${i}` : `sgst_${i}`} />
          <p className="text-[10px] text-gray-400 mt-1">
            Format: 2 digits (State) + 5 chars (PAN) + 4 digits + 1 char + Z + 1 checksum
          </p>
        </div>
      </div>
    ))}
    <button type="button" onClick={() => onAdd(type)}
      className="w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-indigo-500 font-semibold text-sm hover:border-indigo-400 hover:bg-indigo-50 flex items-center justify-center gap-2 transition-all">
      <FaPlus className="text-xs" /> Add New {type === "bill" ? "Billing" : "Shipping"} Address
    </button>
  </div>
);

// ✅ Document Upload Component
const CustomerDocumentSection = ({ documents, onDocumentChange }) => {
  const [uploading, setUploading] = useState({});
  const [selectedDocType, setSelectedDocType] = useState(null);
  const [otherDocName, setOtherDocName] = useState("");
  const [otherDocFile, setOtherDocFile] = useState(null);

  const handleFileChange = async (docKey, file) => {
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error(`${CUSTOMER_DOC_TYPES.find(d => d.key === docKey)?.label} exceeds 5MB`);
      return;
    }

    setUploading(prev => ({ ...prev, [docKey]: true }));
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('section', 'customer');
    formData.append('field', docKey);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post('/api/upload/excel', formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        onDocumentChange(docKey, response.data.filePath);
        toast.success(`${CUSTOMER_DOC_TYPES.find(d => d.key === docKey)?.label} uploaded`);
        setSelectedDocType(null);
      } else {
        toast.error(response.data.error || "Upload failed");
      }
    } catch (error) {
      toast.error(`Failed to upload`);
    } finally {
      setUploading(prev => ({ ...prev, [docKey]: false }));
    }
  };

  const handleOtherDocumentUpload = async () => {
    if (!otherDocName.trim()) {
      toast.error("Please enter document name");
      return;
    }
    if (!otherDocFile) {
      toast.error("Please select a file");
      return;
    }

    setUploading(prev => ({ ...prev, other: true }));
    
    const formData = new FormData();
    formData.append('file', otherDocFile);
    formData.append('section', 'customer');
    formData.append('field', 'other');

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post('/api/upload/excel', formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        const newDoc = {
          name: otherDocName,
          filePath: response.data.filePath,
          uploadedAt: new Date()
        };
        onDocumentChange('otherDocuments', [...(documents.otherDocuments || []), newDoc]);
        setOtherDocName("");
        setOtherDocFile(null);
        toast.success("Document uploaded");
      }
    } catch (error) {
      toast.error("Failed to upload");
    } finally {
      setUploading(prev => ({ ...prev, other: false }));
    }
  };

  const removeOtherDocument = (index) => {
    const updated = [...(documents.otherDocuments || [])];
    updated.splice(index, 1);
    onDocumentChange('otherDocuments', updated);
  };

  const removeDocument = (docKey) => {
    onDocumentChange(docKey, null);
    toast.info(`${CUSTOMER_DOC_TYPES.find(d => d.key === docKey)?.label} removed`);
  };

  const viewDocument = (filePath) => {
    window.open(filePath, '_blank');
  };

  const uploadedCount = (() => {
    let count = 0;
    CUSTOMER_DOC_TYPES.forEach(doc => {
      if (documents[doc.key]) count++;
    });
    count += (documents.otherDocuments || []).length;
    return count;
  })();

  return (
    <div className="space-y-5">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2 mb-4">
        <FaExclamationCircle className="text-blue-500 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-700 font-medium">
          Upload customer documents (Max 5MB per file). Supported: Images and PDF.
          <span className="text-red-500 ml-1">* PAN Card is mandatory.</span>
          <span className="text-gray-500 ml-1">Uploaded: {uploadedCount} documents</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {CUSTOMER_DOC_TYPES.map((doc) => (
          <label
            key={doc.key}
            className={`flex flex-col items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
              selectedDocType === doc.key
                ? 'border-indigo-500 bg-indigo-50'
                : documents[doc.key]
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-200 bg-gray-50 hover:border-indigo-300'
            }`}
          >
            <input
              type="radio"
              name="documentType"
              value={doc.key}
              checked={selectedDocType === doc.key}
              onChange={() => setSelectedDocType(doc.key)}
              className="hidden"
            />
            <doc.icon className={`text-2xl ${
              selectedDocType === doc.key ? 'text-indigo-600' : documents[doc.key] ? 'text-emerald-600' : 'text-gray-400'
            }`} />
            <span className={`text-xs font-semibold mt-2 text-center ${
              selectedDocType === doc.key ? 'text-indigo-700' : documents[doc.key] ? 'text-emerald-700' : 'text-gray-600'
            }`}>
              {doc.label}
              {doc.required && <span className="text-red-500 text-xs ml-1">*</span>}
            </span>
            {documents[doc.key] && <span className="text-[9px] text-emerald-500 mt-1">✓ Uploaded</span>}
          </label>
        ))}
      </div>

      {selectedDocType && (
        <div className="border-2 border-indigo-200 rounded-xl p-6 bg-indigo-50/30 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-indigo-800">Upload {CUSTOMER_DOC_TYPES.find(d => d.key === selectedDocType)?.label}</h3>
            <button onClick={() => setSelectedDocType(null)} className="text-gray-400 hover:text-gray-600">
              <FaTimes />
            </button>
          </div>

          {documents[selectedDocType] ? (
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3 border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">File uploaded</span>
                  <button onClick={() => viewDocument(documents[selectedDocType])} className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-sm">
                    <FaEye className="inline mr-1" /> View
                  </button>
                </div>
              </div>
              <div className="flex gap-3">
                <label className="flex-1 cursor-pointer">
                  <div className="w-full py-2.5 rounded-lg bg-indigo-600 text-white text-sm text-center hover:bg-indigo-700">Change File</div>
                  <input type="file" hidden accept={CUSTOMER_DOC_TYPES.find(d => d.key === selectedDocType)?.accept}
                    onChange={(e) => { if (e.target.files?.[0]) handleFileChange(selectedDocType, e.target.files[0]); e.target.value = ''; }} />
                </label>
                <button onClick={() => removeDocument(selectedDocType)} className="px-4 py-2.5 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600">
                  <FaTrashAlt className="inline mr-1" /> Remove
                </button>
              </div>
            </div>
          ) : (
            <label className="block cursor-pointer">
              <div className={`w-full py-8 border-2 border-dashed rounded-xl text-center transition-all ${
                uploading[selectedDocType] ? 'border-indigo-300 bg-indigo-100' : 'border-indigo-300 hover:border-indigo-500 hover:bg-indigo-100'
              }`}>
                {uploading[selectedDocType] ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-indigo-600">Uploading...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <FaCloudUploadAlt className="text-indigo-400 text-3xl" />
                    <span className="text-sm text-gray-600">Click to upload</span>
                  </div>
                )}
              </div>
              <input type="file" hidden accept={CUSTOMER_DOC_TYPES.find(d => d.key === selectedDocType)?.accept}
                onChange={(e) => { if (e.target.files?.[0]) handleFileChange(selectedDocType, e.target.files[0]); e.target.value = ''; }} />
            </label>
          )}
        </div>
      )}

      <div className="border-t border-gray-200 pt-6">
        <p className="text-sm font-bold text-gray-800 mb-3">Other Documents</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <input type="text" placeholder="Document name" value={otherDocName} onChange={(e) => setOtherDocName(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm" />
          <div className="flex gap-2">
            <label className="flex-1 cursor-pointer">
              <div className="w-full px-3 py-2.5 rounded-lg border-2 border-dashed border-gray-300 text-center text-sm">
                {otherDocFile ? otherDocFile.name : "Choose File"}
              </div>
              <input type="file" hidden accept="image/*,.pdf" onChange={(e) => setOtherDocFile(e.target.files?.[0] || null)} />
            </label>
            <button onClick={handleOtherDocumentUpload} disabled={uploading.other}
              className="px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
              {uploading.other ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>

        {(documents.otherDocuments || []).length > 0 && (
          <div className="space-y-2 mt-4">
            {(documents.otherDocuments || []).map((doc, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div>
                  <p className="text-sm font-medium">{doc.name}</p>
                  <p className="text-[10px] text-gray-400">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => viewDocument(doc.filePath)} className="px-2 py-1 rounded bg-indigo-50 text-indigo-600 text-xs">View</button>
                  <button onClick={() => removeOtherDocument(idx)} className="px-2 py-1 rounded bg-red-50 text-red-500 text-xs">Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function CustomerManagement() {
  const [view, setView] = useState("list");
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [availableUsers, setAvailableUsers] = useState([]);
  const [slaPolicies, setSlaPolicies] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [cd, setCd] = useState({ ...EMPTY });
  const [errs, setErrs] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [canCreate, setCanCreate] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
    fetchCustomers();
    loadUsers();
    loadSla();
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      const p = data?.user?.modules?.Customers?.permissions || {};
      const isCompany = data?.user?.type?.toLowerCase() === "company";
      const isAdmin = data?.user?.roles?.includes("Admin");
      if (isCompany || isAdmin) {
        setCanCreate(true);
        setCanEdit(true);
        setCanDelete(true);
      } else {
        setCanCreate(p.create === true);
        setCanEdit(p.edit === true);
        setCanDelete(p.delete === true);
      }
    } catch (err) {
      console.error("Permission fetch error:", err);
    }
  };

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/customers", { headers: { Authorization: `Bearer ${token}` } });
      setCustomers(res.data.data || []);
    } catch { toast.error("Failed to load customers"); }
    setLoading(false);
  };

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/company/users", { headers: { Authorization: `Bearer ${token}` } });
      setAvailableUsers((res.data || []).filter(u => u.roles?.some(r => r === "Support Executive" || r === "Agent")));
    } catch { toast.error("Failed to load users"); }
  };

  const loadSla = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/helpdesk/sla", { headers: { Authorization: `Bearer ${token}` } });
      setSlaPolicies(res.data?.data || res.data || []);
    } catch { toast.error("Failed to load SLA policies"); }
  };

  const clearErr = (k) => setErrs(p => { const n = { ...p }; delete n[k]; return n; });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCd(p => ({ ...p, [name]: value }));
    clearErr(name);
  };

  const handleAddrChange = (type, idx, field, value) => {
    const key = type === "bill" ? "billingAddresses" : "shippingAddresses";
    setCd(p => {
      const arr = [...p[key]];
      arr[idx] = { ...arr[idx], [field]: value };
      return { ...p, [key]: arr };
    });
    if (field === "pin") clearErr(`${type === "bill" ? "bp" : "sp"}_${idx}`);
    if (field === "gstNumber") clearErr(`${type === "bill" ? "bgst" : "sgst"}_${idx}`);
  };

  const fetchPin = async (type, idx, pin) => {
    if (pin.length !== 6) return;
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      if (data?.[0]?.Status === "Success") {
        const post = data[0]?.PostOffice?.[0];
        if (!post) return;
        handleAddrChange(type, idx, "city", post.District || "");
        handleAddrChange(type, idx, "state", post.State || "");
        handleAddrChange(type, idx, "country", "India");
      }
    } catch { }
  };

  const addAddr = (type) => { const k = type === "bill" ? "billingAddresses" : "shippingAddresses"; setCd(p => ({ ...p, [k]: [...p[k], { ...EMPTY_ADDR }] })); };
  const removeAddr = (type, idx) => { const k = type === "bill" ? "billingAddresses" : "shippingAddresses"; if (cd[k].length === 1) return; setCd(p => ({ ...p, [k]: p[k].filter((_, i) => i !== idx) })); };

  const addCE = () => setCd(p => ({ ...p, contactEmails: [...(p.contactEmails || []), { name: "", email: "" }] }));
  const removeCE = (i) => setCd(p => ({ ...p, contactEmails: p.contactEmails.filter((_, j) => j !== i) }));
  const handleCE = (i, f, v) => { const arr = [...cd.contactEmails]; arr[i] = { ...arr[i], [f]: v }; setCd(p => ({ ...p, contactEmails: arr })); if (f === "email") clearErr(`ce_${i}`); };

  const toggleAgent = (id) => {
    setCd(p => {
      const ids = p.assignedAgents.map(x => x.toString());
      return { ...p, assignedAgents: ids.includes(id.toString()) ? ids.filter(x => x !== id.toString()) : [...ids, id.toString()] };
    });
  };

  const selectSla = (id) => setCd(p => ({ ...p, slaPolicyId: p.slaPolicyId?.toString() === id?.toString() ? null : id }));

  const handleDocumentChange = (docKey, value) => {
    setCd(prev => ({
      ...prev,
      documents: { ...prev.documents, [docKey]: value }
    }));
  };

  const goNext = () => {
    const v = VALIDATORS[step];
    if (v) {
      const e = v(cd);
      if (Object.keys(e).length) {
        setErrs(e);
        toast.error(Object.values(e)[0]);
        return;
      }
    }
    setErrs({});
    setStep(s => s + 1);
  };

  const goPrev = () => { setErrs({}); setStep(s => s - 1); };

  const reset = () => { setCd({ ...EMPTY }); setStep(1); setErrs({}); setView("list"); };

  const handleSubmit = async () => {
    if (cd._id && !canEdit) {
      toast.error("No permission to edit");
      return;
    }
    if (!cd._id && !canCreate) {
      toast.error("No permission to create");
      return;
    }

    let allE = {};
    for (let s = 1; s <= 6; s++) {
      const v = VALIDATORS[s];
      if (v) allE = { ...allE, ...v(cd) };
    }
    if (Object.keys(allE).length) {
      setErrs(allE);
      toast.error("Please fix errors");
      return;
    }

    setSubmitting(true);
    const token = localStorage.getItem("token");
    
    // Remove customerCode from payload (backend will generate it)
    const { customerCode, ...payloadWithoutCode } = cd;
    
    const payload = {
      ...payloadWithoutCode,
      assignedAgents: cd.assignedAgents.map(id => ({ _id: id })),
      glAccount: cd.glAccount?._id || null,
      slaPolicyId: cd.slaPolicyId?._id || cd.slaPolicyId || null,
    };

    try {
      if (cd._id) {
        await axios.put(`/api/customers/${cd._id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Customer updated!");
      } else {
        await axios.post("/api/customers", payload, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Customer created!");
      }
      reset();
      fetchCustomers();
    } catch (err) {
      const message = err?.response?.data?.message || err?.response?.data?.msg || null;
      toast.error(message || "Failed to save customer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (c) => {
    setCd({
      ...c,
      contactEmails: c.contactEmails || [],
      assignedAgents: (c.assignedAgents || []).map(a => (typeof a === "string" ? a : a._id)),
      slaPolicyId: c.slaPolicyId?._id || c.slaPolicyId || null,
      documents: c.documents || EMPTY.documents,
    });
    setStep(1);
    setErrs({});
    setView("form");
  };

  const handleDelete = async (id) => {
    if (!canDelete) {
      toast.error("No permission to delete");
      return;
    }
    if (!confirm("Delete this customer?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/customers/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Customer deleted!");
      fetchCustomers();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const parseCSV = (csv) => {
    const lines = csv.split("\n").filter(l => l.trim());
    const headers = lines[0].split(",");
    return lines.slice(1).map(line => {
      const vals = line.split(",");
      const obj = {};
      headers.forEach((h, i) => (obj[h] = vals[i] || ""));
      return obj;
    });
  };

  const downloadTemplate = () => {
    const h = ["customerName", "customerGroup", "customerType", "emailId", "mobileNumber", "gstNumber", "gstCategory", "pan", "contactPersonName", "commissionRate", "paymentTerms"];
    const r = ["John Doe", "Retail", "Individual", "john@example.com", "9876543210", "22ABCDE1234F1Z5", "Registered Regular", "ABCDE1234F", "John Manager", "5", "30"];
    const blob = new Blob([[h, r].map(x => x.join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "customer_template.csv";
    a.click();
  };

  const handleBulk = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("/api/customers/bulk", { customers: parseCSV(await file.text()) }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        toast.success("Bulk upload completed");
        fetchCustomers();
      }
    } catch {
      toast.error("Bulk upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const filtered = customers.filter(c => {
    const q = searchTerm.toLowerCase();
    const matchQ = [c.customerCode, c.customerName, c.emailId, c.customerGroup, c.customerType].some(v => v?.toLowerCase().includes(q));
    const matchT = filterType === "All" || c.customerType === filterType;
    return matchQ && matchT;
  });

  const stats = {
    total: customers.length,
    individual: customers.filter(c => c.customerType === "Individual").length,
    business: customers.filter(c => c.customerType === "Business").length,
    government: customers.filter(c => c.customerType === "Government").length,
  };

  const Err = ({ k }) => errs[k] ? <p className="flex items-center gap-1 mt-1 text-xs text-red-500"><FaExclamationCircle />{errs[k]}</p> : null;

  const fi = (k) => `w-full px-3 py-2.5 rounded-lg border text-sm outline-none bg-white ${errs[k] ? "border-red-400 ring-2 ring-red-100 bg-red-50" : "border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"}`;

  const label = (text, req) => (
    <label className="block text-[10.5px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
      {text}{req && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );

  const RRow = ({ label: l, value }) => (
    <div className="flex justify-between py-2 border-b border-gray-100">
      <span className="text-xs font-bold text-gray-400">{l}</span>
      <span className="text-sm font-semibold text-gray-800">{value || "—"}</span>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                {label("Customer Code")}
                <input className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-100 cursor-not-allowed text-gray-500" value={cd.customerCode || "Auto-generated"} readOnly disabled />
                <p className="text-[11px] text-gray-400 mt-1">Auto-generated by system</p>
              </div>
              <div>
                {label("Customer Name", true)}
                <input className={fi("customerName")} name="customerName" value={cd.customerName || ""} onChange={handleChange} placeholder="e.g. Acme Corporation" />
                <Err k="customerName" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                {label("Customer Group", true)}
                <GroupSearch value={cd.customerGroup} onSelectGroup={name => { setCd(p => ({ ...p, customerGroup: name })); clearErr("customerGroup"); }} />
                <Err k="customerGroup" />
              </div>
              <div>
                {label("Customer Type", true)}
                <select className={fi("customerType")} name="customerType" value={cd.customerType || ""} onChange={handleChange}>
                  <option value="">Select type…</option>
                  <option>Individual</option>
                  <option>Business</option>
                  <option>Government</option>
                  <option>E-commerce</option>
                </select>
                <Err k="customerType" />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                {label("Primary Email")}
                <input className={fi("emailId")} name="emailId" type="email" value={cd.emailId || ""} onChange={handleChange} />
                <Err k="emailId" />
              </div>
              <div>
                {label("Mobile Number")}
                <input className={fi("mobileNumber")} name="mobileNumber" type="text" maxLength={10} value={cd.mobileNumber || ""} onChange={e => { if (/^\d{0,10}$/.test(e.target.value)) handleChange(e); }} />
                <Err k="mobileNumber" />
              </div>
              <div>
                {label("Contact Person")}
                <input className={fi("")} name="contactPersonName" value={cd.contactPersonName || ""} onChange={handleChange} />
              </div>
            </div>
            <div className="border-t pt-5">
              <p className="text-sm font-bold mb-3">Additional Contact Emails</p>
              {(cd.contactEmails || []).map((c, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 mb-2">
                  <input className={fi("")} placeholder="Name" value={c.name || ""} onChange={e => handleCE(i, "name", e.target.value)} />
                  <div>
                    <input className={fi(`ce_${i}`)} placeholder="Email" type="email" value={c.email || ""} onChange={e => handleCE(i, "email", e.target.value)} />
                    <Err k={`ce_${i}`} />
                  </div>
                  <button onClick={() => removeCE(i)} className="w-8 h-[42px] rounded-lg bg-red-50 text-red-400 hover:bg-red-500 hover:text-white"><FaMinus /></button>
                </div>
              ))}
              <button onClick={addCE} className="w-full py-2.5 border-2 border-dashed rounded-xl text-indigo-500 font-semibold text-sm hover:border-indigo-400 hover:bg-indigo-50 flex items-center justify-center gap-2">
                <FaPlus /> Add Contact Email
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <p className="text-sm font-bold mb-3"><FaMapMarkerAlt className="inline mr-2 text-indigo-500" /> Billing Addresses</p>
              <AddrBlock type="bill" list={cd.billingAddresses} color="bg-indigo-50 text-indigo-600" onChange={handleAddrChange} onRemove={removeAddr} onAdd={addAddr} onFetchPin={fetchPin} fi={fi} Err={Err} errs={errs} />
            </div>
            <div className="border-t pt-5">
              <p className="text-sm font-bold mb-3"><FaMapMarkerAlt className="inline mr-2 text-emerald-500" /> Shipping Addresses</p>
              <AddrBlock type="ship" list={cd.shippingAddresses} color="bg-emerald-50 text-emerald-600" onChange={handleAddrChange} onRemove={removeAddr} onAdd={addAddr} onFetchPin={fetchPin} fi={fi} Err={Err} errs={errs} />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                {label("GST Number")}
                <input className={fi("gstNumber")} name="gstNumber" maxLength={15} value={cd.gstNumber || ""} onChange={e => handleChange({ target: { name: "gstNumber", value: e.target.value.toUpperCase() } })} />
                <Err k="gstNumber" />
              </div>
              <div>
                {label("GST Category")}
                <select className={fi("")} name="gstCategory" value={cd.gstCategory || ""} onChange={handleChange}>
                  <option value="">Select GST Category…</option>
                  {["Registered Regular", "Registered Composition", "Unregistered", "SEZ", "Overseas", "Deemed Export", "UIN Holders", "Tax Deductor", "Tax Collector", "Input Service Distributor"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                {label("PAN Number", true)}
                <input className={fi("pan")} name="pan" maxLength={10} value={cd.pan || ""} onChange={e => handleChange({ target: { name: "pan", value: e.target.value.toUpperCase() } })} />
                <Err k="pan" />
              </div>
              <div>
                {label("Payment Terms (Days)")}
                <input className={fi("")} name="paymentTerms" type="number" value={cd.paymentTerms || ""} onChange={handleChange} />
              </div>
              <div>
                {label("Commission Rate (%)")}
                <input className={fi("")} name="commissionRate" value={cd.commissionRate || ""} onChange={handleChange} />
              </div>
            </div>
            <div className="border-t pt-4">
              {label("GL Account")}
              <AccountSearch value={cd.glAccount} onSelect={sel => setCd(p => ({ ...p, glAccount: sel }))} />
            </div>
          </div>
        );
      case 5:
        return <CustomerDocumentSection documents={cd.documents} onDocumentChange={handleDocumentChange} />;
      case 6:
        return (
          <div className="space-y-6">
            <div>
              <p className="text-sm font-bold mb-1"><FaShieldAlt className="inline mr-2 text-violet-500" /> SLA Policy</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div onClick={() => setCd(p => ({ ...p, slaPolicyId: null }))} className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer ${!cd.slaPolicyId ? "border-violet-400 bg-violet-50" : "border-gray-200 bg-gray-50"}`}>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${!cd.slaPolicyId ? "bg-violet-500 text-white" : "bg-gray-200"}`}>✕</div>
                  <div><p className="font-bold">No SLA</p><p className="text-xs text-gray-400">Default handling</p></div>
                </div>
                {slaPolicies.map(sla => (
                  <div key={sla._id} onClick={() => selectSla(sla._id)} className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer ${cd.slaPolicyId?.toString() === sla._id.toString() ? "border-violet-400 bg-violet-50" : "border-gray-200 bg-gray-50"}`}>
                    <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center text-violet-500"><FaShieldAlt /></div>
                    <div><p className="font-bold">{sla.name}</p><p className="text-xs text-gray-400">{sla.description || sla.responseTime}</p></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t pt-5">
              <p className="text-sm font-bold mb-1"><FaUsers className="inline mr-2 text-indigo-500" /> Assign Agents</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableUsers.map(user => (
                  <div key={user._id} onClick={() => toggleAgent(user._id)} className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer ${cd.assignedAgents?.map(x => x.toString()).includes(user._id.toString()) ? "border-indigo-400 bg-indigo-50" : "border-gray-200 bg-gray-50"}`}>
                    <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-500 font-bold">{user.name?.[0]}</div>
                    <div><p className="font-bold">{user.name}</p><p className="text-xs text-gray-400">{user.roles?.join(", ")}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 7:
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Review all details before saving.</p>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-bold mb-3">Basic Info</p>
              <RRow label="Code" value={cd.customerCode} />
              <RRow label="Name" value={cd.customerName} />
              <RRow label="Group" value={cd.customerGroup} />
              <RRow label="Type" value={cd.customerType} />
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-bold mb-3">Contact</p>
              <RRow label="Email" value={cd.emailId} />
              <RRow label="Mobile" value={cd.mobileNumber} />
              <RRow label="Contact Person" value={cd.contactPersonName} />
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-bold mb-3">Tax & Finance</p>
              <RRow label="GST" value={cd.gstNumber} />
              <RRow label="PAN" value={cd.pan} />
              <RRow label="Payment Terms" value={cd.paymentTerms} />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (view === "list") return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-extrabold">Customers</h1>
            <p className="text-sm text-gray-400">{customers.length} total</p>
          </div>
          <div className="flex gap-2">
            <button onClick={downloadTemplate} className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gray-900 text-white text-sm"><FaDownload /> Template</button>
            <label className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-violet-600 text-white text-sm cursor-pointer">
              {uploading ? "Uploading…" : <><FaFileUpload /> Bulk</>}
              <input type="file" hidden accept=".csv" onChange={handleBulk} />
            </label>
            {canCreate && (
              <button onClick={() => setView("form")} className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 text-white text-sm">
                <FaPlus /> Add Customer
              </button>
            )}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <input className="w-64 px-3 py-2 rounded-lg border" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Code</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c._id} className="border-b hover:bg-indigo-50/30">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-indigo-600">{c.customerCode}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold">{c.customerName}</p>
                      <p className="text-xs text-gray-400">{c.customerGroup}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${c.customerType === "Individual" ? "bg-indigo-50 text-indigo-600" : "bg-amber-50 text-amber-600"}`}>{c.customerType}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{c.emailId}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        {canEdit && <button onClick={() => handleEdit(c)} className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-500 hover:bg-indigo-500 hover:text-white"><FaEdit className="text-xs mx-auto" /></button>}
                        {canDelete && <button onClick={() => handleDelete(c._id)} className="w-7 h-7 rounded-lg bg-red-50 text-red-400 hover:bg-red-500 hover:text-white"><FaTrash className="text-xs mx-auto" /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <button onClick={reset} className="flex items-center gap-1.5 text-indigo-600 text-sm mb-4"><FaArrowLeft /> Back</button>
        <h2 className="text-xl font-extrabold">{cd._id ? "Edit Customer" : "New Customer"}</h2>
        <p className="text-sm text-gray-400 mb-6">Step {step} of {STEPS.length} — {STEPS[step - 1].label}</p>
        
        <div className="flex items-start mb-7">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = step > s.id;
            const active = step === s.id;
            return (
              <React.Fragment key={s.id}>
                <div className="flex flex-col items-center">
                  <button onClick={() => done && setStep(s.id)} className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 ${done ? "bg-emerald-500 border-emerald-500 text-white" : active ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-gray-200 text-gray-300"}`}>
                    {done ? <FaCheck className="text-xs" /> : <Icon className="text-xs" />}
                  </button>
                  <span className={`text-[9px] font-bold mt-1.5 hidden sm:block ${done ? "text-emerald-500" : active ? "text-indigo-600" : "text-gray-300"}`}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mt-[18px] mx-1 transition-all ${done ? "bg-emerald-400" : "bg-gray-200"}`} />}
              </React.Fragment>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-6 sm:p-8 mb-4">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">{React.createElement(STEPS[step - 1].icon, { className: "text-base" })}</div>
            <div><h3 className="font-bold">{STEPS[step - 1].label}</h3><p className="text-xs text-gray-400">Fill in the details</p></div>
          </div>
          {renderStep()}
        </div>

        <div className="flex justify-between">
          <button onClick={step > 1 ? goPrev : reset} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-semibold text-sm"><FaChevronLeft /> {step > 1 ? "Previous" : "Cancel"}</button>
          {step < STEPS.length ? (
            <button onClick={goNext} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm">Next <FaChevronRight /></button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700">
              {submitting ? "Saving..." : (cd._id ? "Update Customer" : "Create Customer")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
//"use client";
//
//import React, { useState, useEffect, useRef } from "react";
//import axios from "axios";
//import {
//  FaEdit, FaTrash, FaPlus, FaSearch, FaMinus, FaUsers,
//  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaFileUpload,
//  FaDownload, FaChevronRight, FaChevronLeft, FaTimes, FaCheck,
//  FaArrowLeft, FaShieldAlt, FaExclamationCircle, FaClipboardCheck,
//  FaBuilding
//} from "react-icons/fa";
//import { HiOutlineDocumentText } from "react-icons/hi";
//import CountryStateSearch from "@/components/CountryStateSearch";
//import GroupSearch from "@/components/groupmaster";
//import AccountSearch from "@/components/AccountSearch";
//import { toast } from "react-toastify";
//
//// ─── 6 Steps ───
//const STEPS = [
//  { id: 1, label: "Basic Info",      icon: FaUser },
//  { id: 2, label: "Contact",         icon: FaPhone },
//  { id: 3, label: "Addresses",       icon: FaMapMarkerAlt },
//  { id: 4, label: "Tax & Finance",   icon: HiOutlineDocumentText },
//  { id: 5, label: "SLA & Agents",    icon: FaShieldAlt },
//  { id: 6, label: "Review & Submit", icon: FaClipboardCheck },
//];
//
//const EMPTY_ADDR = { address1: "", address2: "", country: "", state: "", city: "", pin: "" };
//const EMPTY = {
//  customerCode: "", customerName: "", customerGroup: "", customerType: "",
//  emailId: "", mobileNumber: "", contactPersonName: "", commissionRate: "",
//  billingAddresses:  [{ ...EMPTY_ADDR }],
//  shippingAddresses: [{ ...EMPTY_ADDR }],
//  paymentTerms: "", gstNumber: "", gstCategory: "", pan: "",
//  glAccount: null, assignedAgents: [], contactEmails: [], slaPolicyId: null,
//};
//
//const VALIDATORS = {
//  1: (d) => {
//    const e = {};
//    if (!d.customerName?.trim())  e.customerName  = "Customer Name is required";
//    if (!d.customerGroup?.trim()) e.customerGroup = "Customer Group is required";
//    if (!d.customerType)          e.customerType  = "Customer Type is required";
//    return e;
//  },
//  2: (d) => {
//    const e = {};
//    if (d.emailId && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(d.emailId))
//      e.emailId = "Invalid email format";
//    if (d.mobileNumber && !/^\d{10}$/.test(d.mobileNumber))
//      e.mobileNumber = "Must be exactly 10 digits";
//    (d.contactEmails || []).forEach((c, i) => {
//      if (c.email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(c.email))
//        e[`ce_${i}`] = "Invalid email";
//    });
//    return e;
//  },
//  3: (d) => {
//    const e = {};
//    (d.billingAddresses  || []).forEach((a, i) => { if (a.pin && !/^\d{6}$/.test(a.pin)) e[`bp_${i}`] = "PIN must be 6 digits"; });
//    (d.shippingAddresses || []).forEach((a, i) => { if (a.pin && !/^\d{6}$/.test(a.pin)) e[`sp_${i}`] = "PIN must be 6 digits"; });
//    return e;
//  },
//  4: (d) => {
//    const e = {};
//    if (!d.pan?.trim())                                    e.pan = "PAN is required";
//    else if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(d.pan))     e.pan = "Invalid PAN (e.g. ABCDE1234F)";
//    if (d.gstNumber && !/^[A-Z0-9]{15}$/.test(d.gstNumber)) e.gstNumber = "GST must be 15 alphanumeric chars";
//    return e;
//  },
//  5: () => ({}),
//  6: () => ({}),
//};
//
//const AddrBlock = ({ type, list, color, onChange, onRemove, onAdd, onFetchPin, fi, Err, errs }) => (
//  <div>
//    {list.map((addr, i) => (
//      <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-3">
//        <div className="flex items-center justify-between mb-3">
//          <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md ${color}`}>
//            {type === "bill" ? "Billing" : "Shipping"} #{i + 1}
//          </span>
//          {i > 0 && (
//            <button type="button" onClick={() => onRemove(type, i)}
//              className="w-7 h-7 rounded-lg bg-red-50 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all">
//              <FaTimes className="text-xs" />
//            </button>
//          )}
//        </div>
//        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//          <div><input className={fi("")} value={addr.address1 || ""} onChange={e => onChange(type, i, "address1", e.target.value)} placeholder="Line 1 — Street address" /></div>
//          <div><input className={fi("")} value={addr.address2 || ""} onChange={e => onChange(type, i, "address2", e.target.value)} placeholder="Line 2 — Apt, floor…" /></div>
//          <div>
//            <input
//              className={fi(type === "bill" ? `bp_${i}` : `sp_${i}`)}
//              type="number" value={addr.pin || ""} placeholder="PIN code (6 digits)"
//              onChange={e => { const p = e.target.value; onChange(type, i, "pin", p); onFetchPin(type, i, p); }}
//            />
//            <Err k={type === "bill" ? `bp_${i}` : `sp_${i}`} />
//            {addr.pin?.length === 6 && !errs[`${type === "bill" ? "bp" : "sp"}_${i}`] &&
//              <p className="text-[11px] text-emerald-500 font-medium mt-1">✓ City & State auto-filled</p>}
//          </div>
//          <div><input className={fi("")} value={addr.city || ""} onChange={e => onChange(type, i, "city", e.target.value)} placeholder="City" /></div>
//        </div>
//        <div className="mt-3">
//          <CountryStateSearch
//            valueCountry={addr.country ? { name: addr.country } : null}
//            valueState={addr.state ? { name: addr.state } : null}
//            onSelectCountry={c => onChange(type, i, "country", c?.name || "")}
//            onSelectState={s => onChange(type, i, "state", s?.name || "")}
//          />
//        </div>
//      </div>
//    ))}
//    <button type="button" onClick={() => onAdd(type)}
//      className="w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-indigo-500 font-semibold text-sm hover:border-indigo-400 hover:bg-indigo-50 flex items-center justify-center gap-2 transition-all">
//      <FaPlus className="text-xs" /> Add {type === "bill" ? "Billing" : "Shipping"} Address
//    </button>
//  </div>
//);
//
//export default function CustomerManagement() {
//  const [view,           setView]           = useState("list");
//  const [customers,      setCustomers]      = useState([]);
//  const [searchTerm,     setSearchTerm]     = useState("");
//  const [filterType,     setFilterType]     = useState("All");
//  const [availableUsers, setAvailableUsers] = useState([]);
//  const [slaPolicies,    setSlaPolicies]    = useState([]);
//  const [uploading,      setUploading]      = useState(false);
//  const [loading,        setLoading]        = useState(false);
//  const [step,           setStep]           = useState(1);
//  const [cd,             setCd]             = useState({ ...EMPTY });
//  const [errs,           setErrs]           = useState({});
//  const [submitting,     setSubmitting]     = useState(false);
//
//  // ✅ Permission state — yahan define karo
//  const [canCreate, setCanCreate] = useState(false);
//  const [canEdit,   setCanEdit]   = useState(false);
//  const [canDelete, setCanDelete] = useState(false);
//
//  // ─── Loaders ───
//  useEffect(() => {
//    fetchCustomers();
//    loadUsers();
//    loadSla();
//    fetchPermissions(); // ✅ permissions bhi load karo
//  }, []);
//
//  // ✅ Permission fetch — /api/auth/me se
//  const fetchPermissions = async () => {
//    try {
//      const token = localStorage.getItem("token");
//      if (!token) return;
//
//      const res  = await fetch("/api/auth/me", {
//        headers: { Authorization: `Bearer ${token}` },
//      });
//      const data = await res.json();
//
//      const p = data?.user?.modules?.Customers?.permissions || {};
//
//      // ✅ Company/Admin ko hamesha full access
//      const isCompany = data?.user?.type?.toLowerCase() === "company";
//      const isAdmin   = data?.user?.roles?.includes("Admin");
//
//      if (isCompany || isAdmin) {
//        setCanCreate(true);
//        setCanEdit(true);
//        setCanDelete(true);
//      } else {
//        setCanCreate(p.create === true);
//        setCanEdit(p.edit     === true);
//        setCanDelete(p.delete === true);
//      }
//    } catch (err) {
//      console.error("Permission fetch error:", err);
//    }
//  };
//
//  const fetchCustomers = async () => {
//    setLoading(true);
//    try {
//      const token = localStorage.getItem("token");
//      const res = await axios.get("/api/customers", { headers: { Authorization: `Bearer ${token}` } });
//      setCustomers(res.data.data || []);
//    } catch { toast.error("Failed to load customers"); }
//    setLoading(false);
//  };
//
//  const loadUsers = async () => {
//    try {
//      const token = localStorage.getItem("token");
//      const res = await axios.get("/api/company/users", { headers: { Authorization: `Bearer ${token}` } });
//      setAvailableUsers((res.data || []).filter(u => u.roles?.some(r => r === "Support Executive" || r === "Agent")));
//    } catch { toast.error("Failed to load users"); }
//  };
//
//  const loadSla = async () => {
//    try {
//      const token = localStorage.getItem("token");
//      const res = await axios.get("/api/helpdesk/sla", { headers: { Authorization: `Bearer ${token}` } });
//      setSlaPolicies(res.data?.data || res.data || []);
//    } catch { toast.error("Failed to load SLA policies"); }
//  };
//
//  const generateCode = async () => {
//    try {
//      const token = localStorage.getItem("token");
//      const res = await fetch("/api/lastCustomerCode", { headers: { Authorization: `Bearer ${token}` } });
//      const { lastCustomerCode } = await res.json();
//      const num = parseInt(lastCustomerCode.split("-")[1], 10) + 1;
//      setCd(p => ({ ...p, customerCode: `CUST-${String(num).padStart(4, "0")}` }));
//    } catch { }
//  };
//
//  // ─── Helpers ───
//  const clearErr = (k) => setErrs(p => { const n = { ...p }; delete n[k]; return n; });
//
//  const handleChange = (e) => {
//    const { name, value } = e.target;
//    setCd(p => ({ ...p, [name]: value }));
//    clearErr(name);
//  };
//
//  const handleAddrChange = (type, idx, field, value) => {
//    const key = type === "bill" ? "billingAddresses" : "shippingAddresses";
//    setCd(p => {
//      const arr = [...p[key]];
//      arr[idx] = { ...arr[idx], [field]: value };
//      return { ...p, [key]: arr };
//    });
//    if (field === "pin") clearErr(`${type === "bill" ? "bp" : "sp"}_${idx}`);
//  };
//
//  const fetchPin = async (type, idx, pin) => {
//    if (pin.length !== 6) return;
//    try {
//      const res  = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
//      const data = await res.json();
//      if (data?.[0]?.Status === "Success") {
//        const post = data[0]?.PostOffice?.[0];
//        if (!post) return;
//        handleAddrChange(type, idx, "city",    post.District || "");
//        handleAddrChange(type, idx, "state",   post.State    || "");
//        handleAddrChange(type, idx, "country", "India");
//      }
//    } catch { }
//  };
//
//  const addAddr    = (type) => { const k = type === "bill" ? "billingAddresses" : "shippingAddresses"; setCd(p => ({ ...p, [k]: [...p[k], { ...EMPTY_ADDR }] })); };
//  const removeAddr = (type, idx) => { const k = type === "bill" ? "billingAddresses" : "shippingAddresses"; if (cd[k].length === 1) return; setCd(p => ({ ...p, [k]: p[k].filter((_, i) => i !== idx) })); };
//
//  const addCE    = ()        => setCd(p => ({ ...p, contactEmails: [...(p.contactEmails || []), { name: "", email: "" }] }));
//  const removeCE = (i)       => setCd(p => ({ ...p, contactEmails: p.contactEmails.filter((_, j) => j !== i) }));
//  const handleCE = (i, f, v) => { const arr = [...cd.contactEmails]; arr[i] = { ...arr[i], [f]: v }; setCd(p => ({ ...p, contactEmails: arr })); if (f === "email") clearErr(`ce_${i}`); };
//
//  const toggleAgent = (id) => {
//    setCd(p => {
//      const ids = p.assignedAgents.map(x => x.toString());
//      return { ...p, assignedAgents: ids.includes(id.toString()) ? ids.filter(x => x !== id.toString()) : [...ids, id.toString()] };
//    });
//  };
//
//  const selectSla = (id) => setCd(p => ({ ...p, slaPolicyId: p.slaPolicyId?.toString() === id?.toString() ? null : id }));
//
//  // ─── Navigation ───
//  const goNext = () => {
//    const v = VALIDATORS[step];
//    if (v) {
//      const e = v(cd);
//      if (Object.keys(e).length) {
//        setErrs(e);
//        toast.error(Object.values(e)[0]);
//        return;
//      }
//    }
//    setErrs({});
//    setStep(s => s + 1);
//  };
//
//  const goPrev = () => { setErrs({}); setStep(s => s - 1); };
//
//  const reset = () => { setCd({ ...EMPTY }); setStep(1); setErrs({}); setView("list"); };
//
//  // ─── Submit ───
//  const handleSubmit = async () => {
//    // ✅ 1. Permission check
//    if (cd._id && !canEdit) {
//      toast.error("You don't have permission to edit customers");
//      return;
//    }
//    if (!cd._id && !canCreate) {
//      toast.error("You don't have permission to create customers");
//      return;
//    }
//
//    // ✅ 2. Final validation — all steps
//    let allE = {};
//    for (let s = 1; s <= 5; s++) {
//      const v = VALIDATORS[s];
//      if (v) allE = { ...allE, ...v(cd) };
//    }
//    if (Object.keys(allE).length) {
//      setErrs(allE);
//      toast.error("Please fix errors before submitting");
//      return;
//    }
//
//    setSubmitting(true);
//
//    const token   = localStorage.getItem("token");
//    const payload = {
//      ...cd,
//      assignedAgents: cd.assignedAgents.map(id => ({ _id: id })),
//      glAccount:      cd.glAccount?._id   || null,
//      slaPolicyId:    cd.slaPolicyId?._id || cd.slaPolicyId || null,
//    };
//
//    try {
//      if (cd._id) {
//        await axios.put(`/api/customers/${cd._id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
//        toast.success("Customer updated!");
//      } else {
//        await axios.post("/api/customers", payload, { headers: { Authorization: `Bearer ${token}` } });
//        toast.success("Customer created!");
//      }
//      reset();
//      fetchCustomers();
//
//    } catch (err) {
//      // ✅ 3. Proper backend error handling
//      const status  = err?.response?.status;
//      const message = err?.response?.data?.message
//                   || err?.response?.data?.msg
//                   || err?.response?.data?.error
//                   || null;
//
//      if (status === 401)        toast.error("Session expired. Please login again.");
//      else if (status === 403)   toast.error("You are not authorized to perform this action.");
//      else if (status === 409)   toast.error(message || "Customer already exists.");
//      else if (status === 400 || status === 422) toast.error(message || "Invalid data. Please check all fields.");
//      else if (status >= 500)    toast.error("Server error. Please try again later.");
//      else if (message)          toast.error(message);
//      else                       toast.error("Unexpected error. Please try again.");
//
//      console.error("Customer save error:", err?.response?.data || err.message);
//    } finally {
//      // ✅ 4. Hamesha submitting false karo
//      setSubmitting(false);
//    }
//  };
//
//  const handleEdit = (c) => {
//    setCd({
//      ...c,
//      contactEmails:  c.contactEmails  || [],
//      assignedAgents: (c.assignedAgents || []).map(a => (typeof a === "string" ? a : a._id)),
//      slaPolicyId:    c.slaPolicyId?._id || c.slaPolicyId || null,
//    });
//    setStep(1); setErrs({}); setView("form");
//  };
//
//  const handleDelete = async (id) => {
//    if (!canDelete) {
//      toast.error("You don't have permission to delete customers");
//      return;
//    }
//    if (!confirm("Delete this customer?")) return;
//    try {
//      const token = localStorage.getItem("token");
//      await axios.delete(`/api/customers/${id}`, { headers: { Authorization: `Bearer ${token}` } });
//      toast.success("Customer deleted!");
//      fetchCustomers();
//    } catch (err) {
//      const message = err?.response?.data?.message || err?.response?.data?.msg || null;
//      toast.error(message || "Failed to delete customer");
//    }
//  };
//
//  // ─── Bulk upload ───
//  const parseCSV = (csv) => {
//    const lines   = csv.split("\n").filter(l => l.trim());
//    const headers = lines[0].split(",");
//    return lines.slice(1).map(line => { const vals = line.split(","); const obj = {}; headers.forEach((h, i) => (obj[h] = vals[i] || "")); return obj; });
//  };
//
//  const downloadTemplate = () => {
//    const h = ["customerName","customerGroup","customerType","emailId","mobileNumber","gstNumber","gstCategory","pan","contactPersonName","commissionRate","paymentTerms","billingAddress1","billingAddress2","billingCity","billingState","billingPin","billingCountry","shippingAddress1","shippingAddress2","shippingCity","shippingState","shippingPin","shippingCountry","glAccount"];
//    const r = ["John Doe","Retail","Individual","john@example.com","9876543210","22ABCDE1234F1Z5","Registered Regular","ABCDE1234F","John Manager","5","30","Line 1","Line 2","Mumbai","Maharashtra","400001","India","Line 1","Line 2","Mumbai","Maharashtra","400002","India","BANKHEAD_ID"];
//    const blob = new Blob([[h, r].map(x => x.join(",")).join("\n")], { type: "text/csv" });
//    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "customer_template.csv"; a.click();
//  };
//
//  const handleBulk = async (e) => {
//    const file = e.target.files[0]; if (!file) return;
//    setUploading(true);
//    try {
//      const token = localStorage.getItem("token");
//      const res   = await axios.post("/api/customers/bulk", { customers: parseCSV(await file.text()) }, { headers: { Authorization: `Bearer ${token}` } });
//      const { success, results } = res.data;
//      if (success) {
//        const cr = results.filter(r => r.success && r.action === "created").length;
//        const up = results.filter(r => r.success && r.action === "updated").length;
//        const sk = results.filter(r => !r.success).length;
//        toast.success(`${cr} created · ${up} updated · ${sk} skipped`);
//        fetchCustomers();
//      }
//    } catch { toast.error("Bulk upload failed"); }
//    finally { setUploading(false); e.target.value = ""; }
//  };
//
//  // ─── Derived ───
//  const filtered = customers.filter(c => {
//    const q      = searchTerm.toLowerCase();
//    const matchQ = [c.customerCode, c.customerName, c.emailId, c.customerGroup, c.customerType].some(v => v?.toLowerCase().includes(q));
//    const matchT = filterType === "All" || c.customerType === filterType;
//    return matchQ && matchT;
//  });
//
//  const stats = {
//    total:      customers.length,
//    individual: customers.filter(c => c.customerType === "Individual").length,
//    business:   customers.filter(c => c.customerType === "Business").length,
//    government: customers.filter(c => c.customerType === "Government").length,
//  };
//
//  // ─── Field error component ───
//  const Err = ({ k }) => errs[k]
//    ? <p className="flex items-center gap-1 mt-1 text-xs text-red-500 font-medium"><FaExclamationCircle className="shrink-0" />{errs[k]}</p>
//    : null;
//
//  // ─── Field input class ───
//  const fi = (k) =>
//    `w-full px-3 py-2.5 rounded-lg border text-sm font-medium transition-all outline-none bg-white
//     ${errs[k]
//       ? "border-red-400 ring-2 ring-red-100 bg-red-50 placeholder:text-red-300"
//       : "border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 placeholder:text-gray-300"}`;
//
//  const label = (text, req) => (
//    <label className="block text-[10.5px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
//      {text}{req && <span className="text-red-500 ml-0.5">*</span>}
//    </label>
//  );
//
//  const RRow = ({ label: l, value }) => (
//    <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
//      <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{l}</span>
//      <span className="text-sm font-semibold text-gray-800 text-right max-w-[60%]">{value || <span className="text-gray-300 font-normal">—</span>}</span>
//    </div>
//  );
//
//  // ─── Step content ───
//  const renderStep = () => {
//    switch (step) {
//      case 1: return (
//        <div className="space-y-5">
//          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//            <div>
//              {label("Customer Code")}
//              <input className={`${fi("")} bg-gray-100 cursor-not-allowed text-gray-400`} value={cd.customerCode || ""} readOnly />
//              <p className="text-[11px] text-gray-400 mt-1">Auto-generated</p>
//            </div>
//            <div>
//              {label("Customer Name", true)}
//              <input className={fi("customerName")} name="customerName" value={cd.customerName || ""} onChange={handleChange} placeholder="e.g. Acme Corporation" />
//              <Err k="customerName" />
//            </div>
//          </div>
//          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//            <div>
//              {label("Customer Group", true)}
//              <GroupSearch value={cd.customerGroup} onSelectGroup={name => { setCd(p => ({ ...p, customerGroup: name })); clearErr("customerGroup"); }} />
//              <Err k="customerGroup" />
//            </div>
//            <div>
//              {label("Customer Type", true)}
//              <select className={fi("customerType")} name="customerType" value={cd.customerType || ""} onChange={handleChange}>
//                <option value="">Select type…</option>
//                <option>Individual</option>
//                <option>Business</option>
//                <option>Government</option>
//              </select>
//              <Err k="customerType" />
//            </div>
//          </div>
//        </div>
//      );
//
//      case 2: return (
//        <div className="space-y-5">
//          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//            <div>
//              {label("Primary Email")}
//              <input className={fi("emailId")} name="emailId" type="email" value={cd.emailId || ""} onChange={handleChange} placeholder="email@example.com" />
//              <Err k="emailId" />
//            </div>
//            <div>
//              {label("Mobile Number")}
//              <input className={fi("mobileNumber")} name="mobileNumber" type="text" maxLength={10} placeholder="10-digit number" value={cd.mobileNumber || ""}
//                onChange={e => { if (/^\d{0,10}$/.test(e.target.value)) handleChange(e); }} />
//              <Err k="mobileNumber" />
//            </div>
//            <div>
//              {label("Contact Person")}
//              <input className={fi("")} name="contactPersonName" value={cd.contactPersonName || ""} onChange={handleChange} placeholder="Full name" />
//            </div>
//          </div>
//          <div className="border-t border-gray-100 pt-5">
//            <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
//              <FaEnvelope className="text-indigo-500" /> Additional Contact Emails
//              <span className="text-xs font-normal text-gray-400">optional</span>
//            </p>
//            {(cd.contactEmails || []).map((c, i) => (
//              <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 mb-2 items-start">
//                <input className={fi("")} placeholder="Employee name" value={c.name || ""} onChange={e => handleCE(i, "name", e.target.value)} />
//                <div>
//                  <input className={fi(`ce_${i}`)} placeholder="employee@email.com" type="email" value={c.email || ""} onChange={e => handleCE(i, "email", e.target.value)} />
//                  <Err k={`ce_${i}`} />
//                </div>
//                <button type="button" onClick={() => removeCE(i)}
//                  className="w-8 h-[42px] rounded-lg bg-red-50 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all shrink-0">
//                  <FaMinus className="text-xs" />
//                </button>
//              </div>
//            ))}
//            <button type="button" onClick={addCE}
//              className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-indigo-500 font-semibold text-sm hover:border-indigo-400 hover:bg-indigo-50 flex items-center justify-center gap-2 transition-all mt-1">
//              <FaPlus className="text-xs" /> Add Contact Email
//            </button>
//          </div>
//        </div>
//      );
//
//      case 3: return (
//        <div className="space-y-6">
//          <div>
//            <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"><FaMapMarkerAlt className="text-indigo-500" /> Billing Addresses</p>
//            <AddrBlock type="bill" list={cd.billingAddresses} color="bg-indigo-50 text-indigo-600" onChange={handleAddrChange} onRemove={removeAddr} onAdd={addAddr} onFetchPin={fetchPin} fi={fi} Err={Err} errs={errs} />
//          </div>
//          <div className="border-t border-gray-100 pt-5">
//            <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"><FaMapMarkerAlt className="text-emerald-500" /> Shipping Addresses</p>
//            <AddrBlock type="ship" list={cd.shippingAddresses} color="bg-emerald-50 text-emerald-600" onChange={handleAddrChange} onRemove={removeAddr} onAdd={addAddr} onFetchPin={fetchPin} fi={fi} Err={Err} errs={errs} />
//          </div>
//        </div>
//      );
//
//      case 4: return (
//        <div className="space-y-4">
//          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//            <div>
//              {label("GST Number")}
//              <input className={fi("gstNumber")} name="gstNumber" maxLength={15} placeholder="e.g. 22ABCDE1234F1Z5" value={cd.gstNumber || ""}
//                onChange={e => { const v = e.target.value.toUpperCase(); if (/^[A-Z0-9]{0,15}$/.test(v)) handleChange({ target: { name: "gstNumber", value: v } }); }} />
//              <Err k="gstNumber" />
//              <p className="text-[11px] text-gray-400 mt-1">15 alphanumeric characters</p>
//            </div>
//            <div>
//              {label("GST Category")}
//              <select className={fi("")} name="gstCategory" value={cd.gstCategory || ""} onChange={handleChange}>
//                <option value="">Select GST Category…</option>
//                {["Registered Regular","Registered Composition","Unregistered","SEZ","Overseas","Deemed Export","UIN Holders","Tax Deductor","Tax Collector","Input Service Distributor"].map(o => <option key={o}>{o}</option>)}
//              </select>
//            </div>
//            <div>
//              {label("PAN Number", true)}
//              <input className={fi("pan")} name="pan" maxLength={10} placeholder="e.g. ABCDE1234F" value={cd.pan || ""}
//                onChange={e => { const v = e.target.value.toUpperCase(); if (/^[A-Z0-9]{0,10}$/.test(v)) handleChange({ target: { name: "pan", value: v } }); }} />
//              <Err k="pan" />
//              <p className="text-[11px] text-gray-400 mt-1">Format: AAAAA9999A</p>
//            </div>
//            <div>
//              {label("Payment Terms (Days)")}
//              <input className={fi("")} name="paymentTerms" type="number" placeholder="e.g. 30" value={cd.paymentTerms || ""} onChange={handleChange} />
//            </div>
//            <div>
//              {label("Commission Rate (%)")}
//              <input className={fi("")} name="commissionRate" placeholder="e.g. 5" value={cd.commissionRate || ""} onChange={handleChange} />
//            </div>
//          </div>
//          <div className="border-t border-gray-100 pt-4">
//            {label("GL Account")}
//            <AccountSearch value={cd.glAccount} onSelect={sel => setCd(p => ({ ...p, glAccount: sel }))} />
//          </div>
//        </div>
//      );
//
//      case 5: return (
//        <div className="space-y-6">
//          <div>
//            <p className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-1">
//              <FaShieldAlt className="text-violet-500" /> SLA Policy
//              <span className="text-xs font-normal text-gray-400 ml-1">Select one (optional)</span>
//            </p>
//            <p className="text-xs text-gray-400 mb-4">Choose the Service Level Agreement that applies to this customer.</p>
//            {slaPolicies.length === 0 ? (
//              <div className="text-center py-10 text-gray-300">
//                <FaShieldAlt className="text-4xl mx-auto mb-2 opacity-30" />
//                <p className="text-sm font-medium">No SLA policies found</p>
//              </div>
//            ) : (
//              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
//                <div onClick={() => setCd(p => ({ ...p, slaPolicyId: null }))}
//                  className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all
//                    ${!cd.slaPolicyId ? "border-violet-400 bg-violet-50 shadow-sm shadow-violet-100" : "border-gray-200 bg-gray-50 hover:border-violet-300 hover:bg-violet-50/40"}`}>
//                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 transition-all ${!cd.slaPolicyId ? "bg-violet-500 text-white" : "bg-gray-200 text-gray-400"}`}>✕</div>
//                  <div className="flex-1 min-w-0">
//                    <p className="text-sm font-bold text-gray-800">No SLA</p>
//                    <p className="text-xs text-gray-400">Default handling</p>
//                  </div>
//                  <div className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${!cd.slaPolicyId ? "border-violet-500 bg-violet-500" : "border-gray-300"}`}>
//                    {!cd.slaPolicyId && <FaCheck className="text-white" style={{ fontSize: 8 }} />}
//                  </div>
//                </div>
//                {slaPolicies.map(sla => {
//                  const curId = cd.slaPolicyId?._id || cd.slaPolicyId;
//                  const isSel = curId && curId.toString() === sla._id.toString();
//                  return (
//                    <div key={sla._id} onClick={() => selectSla(sla._id)}
//                      className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all
//                        ${isSel ? "border-violet-400 bg-violet-50 shadow-sm shadow-violet-100" : "border-gray-200 bg-gray-50 hover:border-violet-300 hover:bg-violet-50/40"}`}>
//                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all ${isSel ? "bg-violet-500 text-white" : "bg-violet-100 text-violet-500"}`}>
//                        <FaShieldAlt className="text-sm" />
//                      </div>
//                      <div className="flex-1 min-w-0">
//                        <p className="text-sm font-bold text-gray-800 truncate">{sla.name}</p>
//                        <p className="text-xs text-gray-400 truncate">{sla.description || sla.responseTime || "Custom policy"}</p>
//                      </div>
//                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${isSel ? "border-violet-500 bg-violet-500" : "border-gray-300"}`}>
//                        {isSel && <FaCheck className="text-white" style={{ fontSize: 8 }} />}
//                      </div>
//                    </div>
//                  );
//                })}
//              </div>
//            )}
//            {cd.slaPolicyId && (
//              <div className="mt-3 flex items-center gap-2 text-violet-600 bg-violet-50 border border-violet-200 rounded-lg px-3 py-2 text-sm font-semibold">
//                <FaCheck className="text-xs" /> SLA Policy selected
//              </div>
//            )}
//          </div>
//
//          <div className="border-t border-gray-100 pt-5">
//            <p className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-1">
//              <FaUsers className="text-indigo-500" /> Assign Agents
//              <span className="text-xs font-normal text-gray-400 ml-1">optional</span>
//            </p>
//            <p className="text-xs text-gray-400 mb-4">Select one or more agents to handle this customer's support.</p>
//            {availableUsers.length === 0 ? (
//              <div className="text-center py-10 text-gray-300">
//                <FaUsers className="text-4xl mx-auto mb-2 opacity-30" />
//                <p className="text-sm font-medium">No agents available</p>
//              </div>
//            ) : (
//              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
//                {availableUsers.map(user => {
//                  const isSel = cd.assignedAgents?.map(x => x.toString()).includes(user._id.toString());
//                  return (
//                    <div key={user._id} onClick={() => toggleAgent(user._id)}
//                      className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all select-none
//                        ${isSel ? "border-indigo-400 bg-indigo-50 shadow-sm shadow-indigo-100" : "border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50/40"}`}>
//                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-extrabold shrink-0 transition-all ${isSel ? "bg-indigo-500 text-white" : "bg-indigo-100 text-indigo-500"}`}>
//                        {(user.name || "?")[0].toUpperCase()}
//                      </div>
//                      <div className="flex-1 min-w-0">
//                        <p className="text-sm font-bold text-gray-800 truncate">{user.name}</p>
//                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 truncate">{user.roles?.join(", ")}</p>
//                      </div>
//                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${isSel ? "border-indigo-500 bg-indigo-500" : "border-gray-300"}`}>
//                        {isSel && <FaCheck className="text-white" style={{ fontSize: 8 }} />}
//                      </div>
//                    </div>
//                  );
//                })}
//              </div>
//            )}
//            {cd.assignedAgents?.length > 0 && (
//              <div className="mt-3 flex items-center gap-2 text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2 text-sm font-semibold">
//                <FaCheck className="text-xs" />
//                {cd.assignedAgents.length} agent{cd.assignedAgents.length > 1 ? "s" : ""} assigned
//              </div>
//            )}
//          </div>
//        </div>
//      );
//
//      case 6: return (
//        <div className="space-y-4">
//          <p className="text-sm text-gray-500">Review all details before saving. Click Previous to edit any section.</p>
//          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
//            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5"><FaUser className="text-indigo-400" /> Basic Info</p>
//            <RRow label="Code"  value={cd.customerCode} />
//            <RRow label="Name"  value={cd.customerName} />
//            <RRow label="Group" value={cd.customerGroup} />
//            <RRow label="Type"  value={cd.customerType} />
//          </div>
//          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
//            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5"><FaPhone className="text-indigo-400" /> Contact</p>
//            <RRow label="Email"          value={cd.emailId} />
//            <RRow label="Mobile"         value={cd.mobileNumber} />
//            <RRow label="Contact Person" value={cd.contactPersonName} />
//            {cd.contactEmails?.length > 0 && (
//              <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
//                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Extra Emails</span>
//                <div className="text-right">{cd.contactEmails.map((c, i) => <p key={i} className="text-xs font-medium text-gray-700">{c.name} — {c.email}</p>)}</div>
//              </div>
//            )}
//          </div>
//          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
//            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5"><HiOutlineDocumentText className="text-indigo-400" /> Tax & Finance</p>
//            <RRow label="GST"           value={cd.gstNumber} />
//            <RRow label="GST Category"  value={cd.gstCategory} />
//            <RRow label="PAN"           value={cd.pan} />
//            <RRow label="Payment Terms" value={cd.paymentTerms ? `${cd.paymentTerms} days` : ""} />
//            <RRow label="Commission"    value={cd.commissionRate ? `${cd.commissionRate}%` : ""} />
//            <RRow label="GL Account"    value={cd.glAccount?.accountName} />
//          </div>
//          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
//            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5"><FaShieldAlt className="text-violet-400" /> SLA & Agents</p>
//            <RRow label="SLA Policy" value={cd.slaPolicyId ? slaPolicies.find(s => s._id.toString() === (cd.slaPolicyId?._id || cd.slaPolicyId)?.toString())?.name || "Selected" : "No SLA"} />
//            <div className="flex justify-between py-2">
//              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Agents</span>
//              <div className="text-right">
//                {cd.assignedAgents?.length > 0
//                  ? cd.assignedAgents.map(id => { const u = availableUsers.find(u => u._id.toString() === id.toString()); return <p key={id} className="text-xs font-medium text-gray-700">{u?.name || id}</p>; })
//                  : <span className="text-gray-300 font-normal text-sm">—</span>}
//              </div>
//            </div>
//          </div>
//          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
//            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5"><FaMapMarkerAlt className="text-indigo-400" /> Addresses</p>
//            <RRow label="Billing Addresses"  value={`${cd.billingAddresses?.filter(a => a.address1).length || 0} added`} />
//            <RRow label="Shipping Addresses" value={`${cd.shippingAddresses?.filter(a => a.address1).length || 0} added`} />
//          </div>
//        </div>
//      );
//
//      default: return null;
//    }
//  };
//
//  // ═══════════════════════════════════════════════════════
//  // ─── LIST VIEW ───
//  // ═══════════════════════════════════════════════════════
//  if (view === "list") return (
//    <div className="min-h-screen bg-gray-50 font-sans">
//      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
//
//        {/* Header */}
//        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
//          <div>
//            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Customers</h1>
//            <p className="text-sm text-gray-400 mt-0.5">{customers.length} total customers</p>
//          </div>
//          <div className="flex flex-wrap gap-2">
//            <button onClick={downloadTemplate}
//              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-all">
//              <FaDownload className="text-xs" /> Template
//            </button>
//            <label className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 cursor-pointer transition-all">
//              {uploading ? "Uploading…" : <><FaFileUpload className="text-xs" /> Bulk Upload</>}
//              <input type="file" hidden accept=".csv" onChange={handleBulk} />
//            </label>
//            {/* ✅ canCreate nahi hai toh button hide */}
//            {canCreate && (
//              <button onClick={() => { generateCode(); setView("form"); }}
//                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200">
//                <FaPlus className="text-xs" /> Add Customer
//              </button>
//            )}
//          </div>
//        </div>
//
//        {/* Stat cards */}
//        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
//          {[
//            { label: "Total",      value: stats.total,      emoji: "👥", filter: "All" },
//            { label: "Individual", value: stats.individual, emoji: "🙍", filter: "Individual" },
//            { label: "Business",   value: stats.business,   emoji: "🏢", filter: "Business" },
//            { label: "Government", value: stats.government, emoji: "🏛️", filter: "Government" },
//          ].map(s => (
//            <div key={s.label} onClick={() => setFilterType(s.filter)}
//              className={`bg-white rounded-2xl p-4 flex items-center gap-3 cursor-pointer border-2 transition-all
//                ${filterType === s.filter ? "border-indigo-400 shadow-md shadow-indigo-100" : "border-transparent shadow-sm hover:border-indigo-200 hover:-translate-y-0.5"}`}>
//              <span className="text-2xl">{s.emoji}</span>
//              <div>
//                <p className="text-[10.5px] font-bold uppercase tracking-widest text-gray-400">{s.label}</p>
//                <p className="text-2xl font-extrabold tracking-tight text-gray-900 leading-none mt-0.5">{s.value}</p>
//              </div>
//            </div>
//          ))}
//        </div>
//
//        {/* Table card */}
//        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
//          <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-gray-100">
//            <div className="relative flex-1 min-w-[180px] max-w-xs">
//              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs pointer-events-none" />
//              <input
//                className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all placeholder:text-gray-300"
//                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search customers…"
//              />
//            </div>
//            <div className="flex gap-2 flex-wrap ml-auto">
//              {["All", "Individual", "Business", "Government"].map(t => (
//                <button key={t} onClick={() => setFilterType(t)}
//                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
//                    ${filterType === t ? "bg-indigo-600 text-white border-indigo-600" : "bg-gray-50 text-gray-500 border-gray-200 hover:border-indigo-300 hover:text-indigo-500"}`}>
//                  {t}
//                </button>
//              ))}
//            </div>
//          </div>
//
//          {/* ===== DESKTOP TABLE ===== */}
//          <div className="hidden md:block overflow-x-auto">
//            <table className="w-full text-sm border-collapse">
//              <thead>
//                <tr className="bg-gray-50 border-b border-gray-100">
//                  {["Code","Customer","Type","Email","SLA","GL Account","Agents","Actions"].map(h => (
//                    <th key={h} className="px-4 py-3 text-left text-[10.5px] font-bold uppercase tracking-wider text-gray-400 whitespace-nowrap">{h}</th>
//                  ))}
//                </tr>
//              </thead>
//              <tbody>
//                {loading ? (
//                  Array(5).fill(0).map((_, i) => (
//                    <tr key={i} className="border-b border-gray-50">
//                      {Array(8).fill(0).map((__, j) => (
//                        <td key={j} className="px-4 py-3">
//                          <div className="h-3.5 rounded bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:400%_100%] animate-[shimmer_1.4s_infinite]" />
//                        </td>
//                      ))}
//                    </tr>
//                  ))
//                ) : filtered.length === 0 ? (
//                  <tr><td colSpan={8} className="text-center py-16 text-gray-300">
//                    <div className="text-4xl mb-2 opacity-30">📋</div>
//                    <p className="text-sm font-medium">No customers found</p>
//                  </td></tr>
//                ) : filtered.map(c => (
//                  <tr key={c._id} className="border-b border-gray-50 hover:bg-indigo-50/30 transition-colors">
//                    <td className="px-4 py-3">
//                      <span className="font-mono text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{c.customerCode}</span>
//                    </td>
//                    <td className="px-4 py-3">
//                      <p className="font-semibold text-gray-900 text-sm">{c.customerName}</p>
//                      <p className="text-xs text-gray-400">{c.customerGroup}</p>
//                    </td>
//                    <td className="px-4 py-3">
//                      <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full
//                        ${c.customerType === "Individual" ? "bg-indigo-50 text-indigo-600"
//                          : c.customerType === "Business" ? "bg-amber-50 text-amber-600"
//                          : "bg-emerald-50 text-emerald-600"}`}>
//                        {c.customerType}
//                      </span>
//                    </td>
//                    <td className="px-4 py-3 text-gray-500 text-xs">{c.emailId || <span className="text-gray-200">—</span>}</td>
//                    <td className="px-4 py-3">
//                      {c.slaPolicyId
//                        ? <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-violet-50 text-violet-600">{c.slaPolicyId?.name || "SLA"}</span>
//                        : <span className="text-gray-200 text-xs">—</span>}
//                    </td>
//                    <td className="px-4 py-3 text-gray-500 text-xs">{c.glAccount?.accountName || <span className="text-gray-200">—</span>}</td>
//                    <td className="px-4 py-3">
//                      {c.assignedAgents?.length > 0 ? (
//                        <div className="flex">
//                          {c.assignedAgents.slice(0, 3).map((a, i) => (
//                            <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 border-2 border-white -ml-1.5 first:ml-0 flex items-center justify-center text-white text-[9px] font-bold">
//                              {(a.name || "?")[0].toUpperCase()}
//                            </div>
//                          ))}
//                          {c.assignedAgents.length > 3 && (
//                            <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white -ml-1.5 flex items-center justify-center text-gray-500 text-[9px] font-bold">
//                              +{c.assignedAgents.length - 3}
//                            </div>
//                          )}
//                        </div>
//                      ) : <span className="text-gray-200 text-xs">None</span>}
//                    </td>
//                    <td className="px-4 py-3">
//                      <div className="flex gap-1.5">
//                        {/* ✅ canEdit nahi hai toh edit button hide */}
//                        {canEdit && (
//                          <button onClick={() => handleEdit(c)} className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-500 hover:bg-indigo-500 hover:text-white flex items-center justify-center transition-all">
//                            <FaEdit className="text-xs" />
//                          </button>
//                        )}
//                        {/* ✅ canDelete nahi hai toh delete button hide */}
//                        {canDelete && (
//                          <button onClick={() => handleDelete(c._id)} className="w-7 h-7 rounded-lg bg-red-50 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all">
//                            <FaTrash className="text-xs" />
//                          </button>
//                        )}
//                      </div>
//                    </td>
//                  </tr>
//                ))}
//              </tbody>
//            </table>
//          </div>
//
//          {/* ===== MOBILE CARDS ===== */}
//          <div className="md:hidden">
//            {loading ? (
//              Array(4).fill(0).map((_, i) => (
//                <div key={i} className="p-4 border-b border-gray-100">
//                  <div className="flex justify-between items-start mb-3">
//                    <div className="h-4 w-20 rounded bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-[shimmer_1.4s_infinite]" />
//                    <div className="h-4 w-16 rounded bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-[shimmer_1.4s_infinite]" />
//                  </div>
//                  <div className="h-3.5 w-3/4 rounded bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-[shimmer_1.4s_infinite] mb-2" />
//                  <div className="h-3 w-1/2 rounded bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-[shimmer_1.4s_infinite]" />
//                </div>
//              ))
//            ) : filtered.length === 0 ? (
//              <div className="text-center py-16 text-gray-300">
//                <div className="text-4xl mb-2 opacity-30">📋</div>
//                <p className="text-sm font-medium">No customers found</p>
//              </div>
//            ) : filtered.map(c => (
//              <div key={c._id} className="p-4 border-b border-gray-100 hover:bg-indigo-50/20 transition-colors">
//                <div className="flex items-center justify-between mb-2">
//                  <span className="font-mono text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{c.customerCode}</span>
//                  <div className="flex gap-1.5">
//                    {canEdit && (
//                      <button onClick={() => handleEdit(c)} className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-500 hover:bg-indigo-500 hover:text-white flex items-center justify-center transition-all">
//                        <FaEdit className="text-xs" />
//                      </button>
//                    )}
//                    {canDelete && (
//                      <button onClick={() => handleDelete(c._id)} className="w-7 h-7 rounded-lg bg-red-50 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all">
//                        <FaTrash className="text-xs" />
//                      </button>
//                    )}
//                  </div>
//                </div>
//                <div className="mb-2">
//                  <p className="font-semibold text-gray-900 text-sm">{c.customerName}</p>
//                  {c.customerGroup && <p className="text-xs text-gray-400">{c.customerGroup}</p>}
//                </div>
//                <div className="flex flex-wrap gap-1.5 mb-2">
//                  <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full
//                    ${c.customerType === "Individual" ? "bg-indigo-50 text-indigo-600"
//                      : c.customerType === "Business" ? "bg-amber-50 text-amber-600"
//                      : "bg-emerald-50 text-emerald-600"}`}>
//                    {c.customerType}
//                  </span>
//                  {c.slaPolicyId && (
//                    <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-violet-50 text-violet-600">{c.slaPolicyId?.name || "SLA"}</span>
//                  )}
//                </div>
//                {c.emailId && <p className="text-xs text-gray-500 mb-1.5 truncate">📧 {c.emailId}</p>}
//                {c.glAccount?.accountName && <p className="text-xs text-gray-500 mb-1.5">🏦 {c.glAccount.accountName}</p>}
//                {c.assignedAgents?.length > 0 && (
//                  <div className="flex items-center gap-2 mt-2">
//                    <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">Agents:</span>
//                    <div className="flex">
//                      {c.assignedAgents.slice(0, 4).map((a, i) => (
//                        <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 border-2 border-white -ml-1.5 first:ml-0 flex items-center justify-center text-white text-[9px] font-bold">
//                          {(a.name || "?")[0].toUpperCase()}
//                        </div>
//                      ))}
//                      {c.assignedAgents.length > 4 && (
//                        <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white -ml-1.5 flex items-center justify-center text-gray-500 text-[9px] font-bold">
//                          +{c.assignedAgents.length - 4}
//                        </div>
//                      )}
//                    </div>
//                  </div>
//                )}
//              </div>
//            ))}
//          </div>
//        </div>
//      </div>
//      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
//    </div>
//  );
//
//  // ═══════════════════════════════════════════════════════
//  // ─── FORM VIEW ───
//  // ═══════════════════════════════════════════════════════
//  return (
//    <div className="min-h-screen bg-gray-50">
//      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
//        <button onClick={reset} className="flex items-center gap-1.5 text-indigo-600 font-semibold text-sm mb-4 hover:text-indigo-800 transition-colors">
//          <FaArrowLeft className="text-xs" /> Back to Customers
//        </button>
//        <h2 className="text-xl font-extrabold tracking-tight text-gray-900 mb-0.5">
//          {cd._id ? "Edit Customer" : "New Customer"}
//        </h2>
//        <p className="text-sm text-gray-400 mb-6">
//          Step {step} of {STEPS.length} — <span className="font-semibold text-gray-600">{STEPS[step - 1].label}</span>
//        </p>
//
//        {/* Stepper */}
//        <div className="flex items-start mb-7">
//          {STEPS.map((s, i) => {
//            const Icon  = s.icon;
//            const done   = step > s.id;
//            const active = step === s.id;
//            return (
//              <React.Fragment key={s.id}>
//                <div className="flex flex-col items-center shrink-0">
//                  <button type="button" onClick={() => done && setStep(s.id)}
//                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
//                      ${done   ? "bg-emerald-500 border-emerald-500 text-white cursor-pointer hover:bg-emerald-600"
//                        : active ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200"
//                        : "bg-white border-gray-200 text-gray-300 cursor-default"}`}>
//                    {done ? <FaCheck style={{ fontSize: 12 }} /> : <Icon style={{ fontSize: 12 }} />}
//                  </button>
//                  <span className={`text-[9px] font-bold uppercase tracking-wider mt-1.5 whitespace-nowrap hidden sm:block
//                    ${done ? "text-emerald-500" : active ? "text-indigo-600" : "text-gray-300"}`}>
//                    {s.label}
//                  </span>
//                </div>
//                {i < STEPS.length - 1 && (
//                  <div className={`flex-1 h-0.5 mt-[18px] mx-1 transition-all ${done ? "bg-emerald-400" : "bg-gray-200"}`} />
//                )}
//              </React.Fragment>
//            );
//          })}
//        </div>
//
//        {/* Form card */}
//        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-4">
//          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
//            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
//              {React.createElement(STEPS[step - 1].icon, { className: "text-base" })}
//            </div>
//            <div>
//              <h3 className="text-base font-bold text-gray-900">{STEPS[step - 1].label}</h3>
//              <p className="text-xs text-gray-400">Fill in the details below</p>
//            </div>
//            <span className="ml-auto text-xs font-bold text-gray-300 font-mono">{step}/{STEPS.length}</span>
//          </div>
//          {renderStep()}
//        </div>
//
//        {/* Navigation */}
//        <div className="flex items-center justify-between">
//          <button type="button" onClick={step > 1 ? goPrev : reset}
//            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-semibold text-sm hover:bg-gray-200 transition-all border border-gray-200">
//            <FaChevronLeft className="text-xs" /> {step > 1 ? "Previous" : "Cancel"}
//          </button>
//
//          <span className="text-xs font-bold text-gray-300 font-mono">{step} / {STEPS.length}</span>
//
//          {step < STEPS.length ? (
//            <button type="button" onClick={goNext}
//              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200">
//              Next <FaChevronRight className="text-xs" />
//            </button>
//          ) : (
//            // ✅ Permission ke hisaab se submit button
//            <button type="button" onClick={handleSubmit}
//              disabled={submitting || (cd._id ? !canEdit : !canCreate)}
//              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm transition-all
//                ${submitting || (cd._id ? !canEdit : !canCreate)
//                  ? "bg-gray-300 cursor-not-allowed opacity-60"
//                  : "bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-200"}`}>
//              {submitting
//                ? "Saving…"
//                : cd._id
//                  ? (canEdit   ? <><FaCheck className="text-xs" /> Update Customer</> : "No Edit Permission")
//                  : (canCreate ? <><FaCheck className="text-xs" /> Create Customer</> : "No Create Permission")
//              }
//            </button>
//          )}
//        </div>
//      </div>
//    </div>
//  );
//}
//

// "use client";

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { FaEdit, FaTrash, FaPlus, FaSearch, FaMinus } from "react-icons/fa";
// import CountryStateSearch from "@/components/CountryStateSearch";
// import GroupSearch from "@/components/groupmaster";
// import AccountSearch from "@/components/AccountSearch";
// import { toast } from "react-toastify";

// export default function CustomerManagement() {
//   const [view, setView] = useState("list");
//   const [customers, setCustomers] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//    const [availableUsers, setAvailableUsers] = useState([]);

//   // ✅ MISSING — now added
//   const [uploading, setUploading] = useState(false);

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const [customerDetails, setCustomerDetails] = useState({
//     customerCode: "",
//     customerName: "",
//     customerGroup: "",
//     customerType: "",
//     emailId: "",
//     mobileNumber: "",
//     billingAddresses: [
//       { address1: "", address2: "", country: "", state: "", city: "", pin: "" },
//     ],
//     shippingAddresses: [
//       { address1: "", address2: "", country: "", state: "", city: "", pin: "" },
//     ],
//     paymentTerms: "",
//     gstNumber: "",
//     gstCategory: "",
//     pan: "",
//     contactPersonName: "",
//     commissionRate: "",
//     glAccount: null,
//      assignedAgents: [],
//       contactEmails: [], 
//   });


//     // 1. Filtered Users load karne ka logic
//  const loadUsers = async () => {
//   try {
//     const token = localStorage.getItem("token");
//     const res = await axios.get("/api/company/users", { 
//       headers: { Authorization: `Bearer ${token}` },
//     });
    
//     // Log check karne ke liye (Optional)
//     console.log("Raw Data from API:", res.data);

//     // Filter Logic: Agar roles array mein 'Support Executive' ya 'Employee' hai
//     const filtered = (res.data || []).filter(user => 
//       user.roles && user.roles.some(role => role === "Support Executive" || role === "Agent" )
//     );
    
//     setAvailableUsers(filtered);
//   } catch (err) {
//     toast.error("Users load karne mein error");
//     console.error(err);
//   }
// };

//   useEffect(() => {
//     loadUsers();
//   }, []);




//   const fetchFromPincode = async (type, index, pin) => {
//     if (pin.length !== 6) return;
  
//     try {
//       const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
//       const data = await res.json();
  
//       if (!Array.isArray(data)) return;
  
//       if (data?.[0]?.Status === "Success") {
//         const post = data[0]?.PostOffice?.[0];
//         if (!post) return;
  
//         handleAddressChange(type, index, "city", post.District || "");
//         handleAddressChange(type, index, "state", post.State || "");
//         handleAddressChange(type, index, "country", "India");
//       }
//     } catch (err) {
//       console.error("Pincode lookup failed", err);
//     }
//   };
  

//   // 2. Selection handle karne ka logic (Checkbox style)
// const handleAgentToggle = (userId) => {
//   setCustomerDetails((prev) => {
//     const ids = prev.assignedAgents.map(id => id.toString());

//     return {
//       ...prev,
//       assignedAgents: ids.includes(userId.toString())
//         ? ids.filter(id => id !== userId.toString())
//         : [...ids, userId.toString()],
//     };
//   });
// };



//   /* ✅ FETCH CUSTOMERS */
//   const fetchCustomers = async () => {

//     setLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       const res = await axios.get("/api/customers", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setCustomers(res.data.data || []);
//       console.log("Fetched customers:", res.data.data);
//     } catch (err) {
//       toast.error("Failed to load customers");
//     }
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchCustomers();
//   }, []);

//   /* ✅ GENERATE CUSTOMER CODE */
//   const generateCustomerCode = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const res = await fetch("/api/lastCustomerCode", {
//         method: "GET",
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const { lastCustomerCode } = await res.json();
//       const num = parseInt(lastCustomerCode.split("-")[1], 10) + 1;

//       setCustomerDetails((prev) => ({
//         ...prev,
//         customerCode: `CUST-${num.toString().padStart(4, "0")}`,
//       }));
//     } catch (err) {
//       console.error("Error generating code", err);
//     }
//   };

//   /* ✅ HANDLE INPUT CHANGE */
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setCustomerDetails((prev) => ({ ...prev, [name]: value }));
//   };

//   /* ✅ ADDRESS HANDLING */
//   const handleAddressChange = (type, idx, field, value) => {
//     const key = type === "billing" ? "billingAddresses" : "shippingAddresses";
//     const arr = [...customerDetails[key]];
//     arr[idx][field] = value;
//     setCustomerDetails((prev) => ({ ...prev, [key]: arr }));
//   };

//   const addAddress = (type) => {
//     const key = type === "billing" ? "billingAddresses" : "shippingAddresses";
//     setCustomerDetails((prev) => ({
//       ...prev,
//       [key]: [
//         ...prev[key],
//         { address1: "", address2: "", country: "", state: "", city: "", pin: "" },
//       ],
//     }));
//   };

//   const removeAddress = (type, idx) => {
//     const key = type === "billing" ? "billingAddresses" : "shippingAddresses";
//     if (customerDetails[key].length === 1) return;
//     setCustomerDetails((prev) => ({
//       ...prev,
//       [key]: prev[key].filter((_, i) => i !== idx),
//     }));
//   };

//   /* ✅ VALIDATION */
//   const validate = () => {
//     const required = [
//       "customerName",
//       // "customerGroup",
//       // "customerType",
//       // "emailId",
//       // "mobileNumber",
//       // "gstNumber",
//       // "gstCategory",
//       // "pan",
//       // "glAccount",
//     ];

//     for (let field of required) {
//       const value = customerDetails[field];
//       if (!value || (field === "glAccount" && !value?._id)) {
//         toast.error(`${field} is required`);
//         return false;
//       }
//     }

//     return true;
//   };


//   const addContactEmail = () => {
//   setCustomerDetails(prev => ({
//     ...prev,
//     contactEmails: [...(prev.contactEmails || []), { email: "", name: "" }]
//   }));
// };

// const removeContactEmail = (idx) => {
//   setCustomerDetails(prev => ({
//     ...prev,
//     contactEmails: prev.contactEmails.filter((_, i) => i !== idx)
//   }));
// };

// const handleContactEmailChange = (idx, field, value) => {
//   const arr = [...customerDetails.contactEmails];
//   arr[idx][field] = value;
//   setCustomerDetails(prev => ({ ...prev, contactEmails: arr }));
// };


//   /* ✅ SUBMIT FORM */
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validate()) return;

//     const token = localStorage.getItem("token");
//     const payload = {
//       ...customerDetails,
//       assignedAgents: customerDetails.assignedAgents.map((id) => ({ _id: id })),
//       glAccount: customerDetails.glAccount?._id || null,
//     };

//     try {
//       if (customerDetails._id) {
//         await axios.put(`/api/customers/${customerDetails._id}`, payload, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//       } else {
//         await axios.post("/api/customers", payload, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//       }

//       toast.success("Customer saved successfully");
//       resetForm();
//       fetchCustomers();
//     } catch (err) {
//       toast.error("Error saving customer");
//     }
//   };

//   /* ✅ RESET FORM */
//   const resetForm = () => {
//     setCustomerDetails({
//       customerCode: "",
//       customerName: "",
//       customerGroup: "",
//       customerType: "",
//       emailId: "",
//       mobileNumber: "",
//       billingAddresses: [
//         { address1: "", address2: "", country: "", state: "", city: "", pin: "" },
//       ],
//       shippingAddresses: [
//         { address1: "", address2: "", country: "", state: "", city: "", pin: "" },
//       ],
//       paymentTerms: "",
//       gstNumber: "",
//       gstCategory: "",
//       pan: "",
//       contactPersonName: "",
//       commissionRate: "",
//       glAccount: null,
//       assignedAgents: [],
//        contactEmails: [], 
//     });

//     setView("list");
//   };

//   /* ✅ EDIT */
//  const handleEdit = (c) => {
//   setCustomerDetails({
//     ...c,
//     contactEmails: c.contactEmails || [],
//     assignedAgents: (c.assignedAgents || []).map((a) =>
//       typeof a === "string" ? a : a._id
//     ),
//   });
//   setView("form");
// };


//   /* ✅ DELETE */
//   const handleDelete = async (id) => {
//     if (!confirm("Are you sure?")) return;

//     const token = localStorage.getItem("token");

//     await axios.delete(`/api/customers/${id}`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });

//     fetchCustomers();
//   };

//   /* ✅ SEARCH FILTER */
//   const filtered = customers.filter((c) =>
//     [
//       c.customerCode,
//       c.customerName,
//       c.emailId,
//       c.customerGroup,
//       c.customerType,
//       c.glAccount?.accountCode,
//     ].some((v) => v?.toLowerCase().includes(searchTerm.toLowerCase()))
//   );

//   /* ✅ DOWNLOAD TEMPLATE */
//   const downloadTemplate = () => {
//   const header = [
//     "customerName",
//     "customerGroup",
//     "customerType",
//     "emailId",
//     "mobileNumber",
//     "gstNumber",
//     "gstCategory",
//     "pan",
//     "contactPersonName",
//     "commissionRate",
//     "paymentTerms",

//     // ✅ Billing Address Fields
//     "billingAddress1",
//     "billingAddress2",
//     "billingCity",
//     "billingState",
//     "billingPin",
//     "billingCountry",

//     // ✅ Shipping Address Fields
//     "shippingAddress1",
//     "shippingAddress2",
//     "shippingCity",
//     "shippingState",
//     "shippingPin",
//     "shippingCountry",

//     // ✅ GL Account (BankHead)
//     "glAccount"

//   ];

//   const sampleRow = [
//     "John Doe",                   // customerName
//     "Retail",                     // customerGroup
//     "Individual",                 // customerType (Individual/Business/Government)
//     "john@example.com",           // emailId
//     "9876543210",                 // mobileNumber
//     "22ABCDE1234F1Z5",            // gstNumber
//     "Registered Regular",         // gstCategory
//     "ABCDE1234F",                 // pan
//     "John Manager",               // contactPersonName
//     "5",                          // commissionRate
//     "30",                         // paymentTerms

//     // ✅ Billing Address
//     "Line 1",                     // billingAddress1
//     "Line 2",                     // billingAddress2
//     "Mumbai",                     // billingCity
//     "Maharashtra",                // billingState
//     "400001",                     // billingPin
//     "India",                      // billingCountry

//     // ✅ Shipping Address
//     "Line 1",                     // shippingAddress1
//     "Line 2",                     // shippingAddress2
//     "Mumbai",                     // shippingCity
//     "Maharashtra",                // shippingState
//     "400002",                     // shippingPin
//     "India",                      // shippingCountry

//     // ✅ BankHead ID
//     "BANKHEAD_OBJECT_ID"
//   ];

//   const csv = [header.join(","), sampleRow.join(",")].join("\n");

//   const blob = new Blob([csv], { type: "text/csv" });
//   const link = document.createElement("a");
//   link.href = URL.createObjectURL(blob);
//   link.download = "customer_bulk_upload_template.csv";
//   link.click();
// };


//   /* ✅ MISSING parseCSV() — Now Added ✅ */
//   const parseCSV = (csv) => {
//     const lines = csv.split("\n").filter((line) => line.trim() !== "");
//     const headers = lines[0].split(",");

//     return lines.slice(1).map((line) => {
//       const values = line.split(",");
//       let obj = {};
//       headers.forEach((h, i) => (obj[h] = values[i] || ""));
//       return obj;
//     });
//   };

//   /* ✅ BULK UPLOAD */
// /* ✅ BULK UPLOAD HANDLER */
// const handleBulkUpload = async (e) => {
//   const file = e.target.files[0];
//   if (!file) return;

//   setUploading(true);

//   try {
//     const text = await file.text();
//     const jsonData = parseCSV(text); // Ensure parseCSV returns [{}, {}, ...]
//     const token = localStorage.getItem("token");

//     const res = await axios.post(
//       "/api/customers/bulk",
//       { customers: jsonData },
//       {
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );

//     const { success, message, results } = res.data;

//     if (success) {
//       // ✅ Calculate summary
//       const total = results.length;
//       const created = results.filter((r) => r.success && r.action === "created").length;
//       const updated = results.filter((r) => r.success && r.action === "updated").length;
//       const skipped = results.filter((r) => !r.success).length;

//       toast.success(
//         `✅ Bulk Upload Complete — ${created} created, ${updated} updated, ${skipped} skipped.`
//       );

//       // ✅ Show detailed warnings (GL Account missing, etc.)
//       const warnings = results
//         .filter((r) => r.warnings && r.warnings.length > 0)
//         .map((r) => `Row ${r.row}: ${r.warnings.join(", ")}`);
//       warnings.forEach((msg) => toast.warn(msg));

//       // ✅ Show row-specific errors
//       const failed = results
//         .filter((r) => !r.success && r.errors)
//         .map((r) => `Row ${r.row}: ${r.errors.join(", ")}`);
//       failed.forEach((msg) => toast.error(msg));

//       // ✅ Refresh customer list
//       fetchCustomers();
//     } else {
//       toast.error(`❌ Bulk upload failed: ${message || "Unknown error"}`);
//     }
//   } catch (err) {
//     console.error("Bulk Upload Error:", err);
//     toast.error("Invalid CSV format or server error");
//   } finally {
//     setUploading(false);
//     e.target.value = ""; // ✅ reset file input
//   }
// };

//   /* ✅ LIST VIEW UI */
//   const renderListView = () => (
//     <div className="p-6 sm:p-8">

//       <div className="flex flex-col sm:flex-row justify-between mb-6 gap-3">
//         <h1 className="text-2xl font-bold">Customer Management</h1>

//         <div className="flex gap-3">

//           {/* Download Template */}
//           <button
//             onClick={downloadTemplate}
//             className="px-4 py-2 bg-gray-700 text-white rounded-md"
//           >
//             Download Template
//           </button>

//           {/* Bulk Upload */}
//           <label className="px-4 py-2 bg-purple-600 text-white rounded-md cursor-pointer">
//             {uploading ? "Uploading..." : "Bulk Upload"}
//             <input type="file" hidden accept=".csv" onChange={handleBulkUpload} />
//           </label>

//           {/* Add Customer */}
//           <button
//             onClick={() => {
//               generateCustomerCode();
//               setView("form");
//             }}
//             className="px-4 py-2 bg-blue-600 text-white rounded-md"
//           >
//             <FaPlus className="mr-2" /> Add Customer
//           </button>
//         </div>
//       </div>

//       {/* Search */}
//       <div className="mb-4 relative max-w-md">
//         <input
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           placeholder="Search customers..."
//           className="w-full border rounded-md py-2 pl-4 pr-10"
//         />
//         <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto">
//         <table className="min-w-full bg-white divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               {["Code", "Name", "Email", "Group", "Type", "Contact Emails","GL Account","Assigned Agents", "Actions"].map(
//                 (h) => (
//                   <th key={h} className="px-4 py-2 text-left text-sm font-medium">
//                     {h}
//                   </th>
//                 )
//               )}
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-200">
//             {filtered.map((c) => (
//               <tr key={c._id}>
//                 <td className="px-4 py-2">{c.customerCode}</td>
//                 <td className="px-4 py-2">{c.customerName}</td>
//                 <td className="px-4 py-2">{c.emailId}</td>
//                 <td className="px-4 py-2">{c.customerGroup}</td>
//                 <td className="px-4 py-2">{c.customerType}</td>
//                 <td>
//   {c.contactEmails?.map(e => e.email).join(", ") || "-"}
// </td>
            
//                 <td className="px-4 py-2">{c.glAccount?.accountName || "N/A"}</td>
//               <td className="px-4 py-2 text-sm">
//   {c.assignedAgents && c.assignedAgents.length > 0 
//     ? c.assignedAgents.map(agent => agent.name).join(", ") 
//     : "No Agent"}
// </td>
//                 <td className="px-4 py-2 flex gap-3">
//                   <button onClick={() => handleEdit(c)} className="text-blue-600">
//                     <FaEdit />
//                   </button>
//                   <button
//                     onClick={() => handleDelete(c._id)}
//                     className="text-red-600"
//                   >
//                     <FaTrash />
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//     </div>
//   );


// const renderFormView = () => (
//   <div className="p-8 bg-white rounded-lg shadow-lg max-w-5xl mx-auto">
//     <h2 className="text-2xl font-semibold mb-6 text-center">
//       {customerDetails._id ? "Edit Customer" : "New Customer"}
//     </h2>

    

//     <form onSubmit={handleSubmit} className="space-y-6">
//       {/* Basic Info */}
//       <div className="grid sm:grid-cols-2 gap-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
//           <input
//             name="customerCode"
//             value={customerDetails.customerCode || ""}
//             readOnly
//             className="w-full border rounded-md p-2 bg-gray-100"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Customer Name <span className="text-red-500">*</span>
//           </label>
//           <input
//             name="customerName"
//             value={customerDetails.customerName || ""}
//             onChange={handleChange}
//             className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500"
//           />
//         </div>
//       </div>

//       {/* Group and Type */}
//       <div className="grid sm:grid-cols-2 gap-4">
//      <div>
//   <label className="block text-sm font-medium text-gray-700 mb-1">
//     Customer Group <span className="text-red-500">*</span>
//   </label>
//   <GroupSearch
//     value={customerDetails.customerGroup}
//     onSelectGroup={(name) =>
//       setCustomerDetails((prev) => ({ ...prev, customerGroup: name }))
//     }
//   />
//   {!customerDetails.customerGroup && (
//     <p className="text-red-500 text-sm mt-1">Customer Group is required</p>
//   )}
// </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Customer Type <span className="text-red-500">*</span>
//           </label>
//           <select
//             name="customerType"
//             value={customerDetails.customerType || ""}
//             onChange={handleChange}
//             className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500"
//           >
//             <option value="">Select</option>
//             <option>Individual</option>
//             <option>Business</option>
//             <option>Government</option>
//           </select>
//         </div>
//       </div>

//       {/* Contact Info */}
//       <div className="grid sm:grid-cols-3 gap-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Email ID <span className="text-red-500">*</span>
//           </label>
//           <input
//             name="emailId"
//             type="email"
//             value={customerDetails.emailId || ""}
//             onChange={handleChange}
//             className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500"
//           />
//         </div>
//      <div>
//   <label className="block text-sm font-medium text-gray-700 mb-1">
//     Mobile Number
//   </label>
//   <input
//     name="mobileNumber"
//     type="text"
//     placeholder="Mobile Number"
//     maxLength={10}
//     value={customerDetails.mobileNumber || ""}
//     onChange={(e) => {
//       const input = e.target.value;
//       if (/^\d{0,10}$/.test(input)) {
//         handleChange(e); // only allow up to 10 digits
//       }
//     }}
//     className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500"
//   />
// </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
//           <input
//             name="contactPersonName"
//             value={customerDetails.contactPersonName || ""}
//             onChange={handleChange}
//             placeholder="Contact Person"
//             className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500"
//           />
//         </div>
//       </div>


//       {/* 🔥 CONTACT EMAILS (MULTIPLE EMPLOYEES) */}
// <div className="border p-4 rounded bg-gray-50">
//   <h3 className="text-sm font-bold mb-3">
//     Company Contact Emails (Employees)
//   </h3>

//   {customerDetails.contactEmails?.map((c, i) => (
//     <div key={i} className="grid grid-cols-3 gap-3 mb-2">
//       <input
//         placeholder="Employee Name"
//         value={c.name || ""}
//         onChange={(e) =>
//           handleContactEmailChange(i, "name", e.target.value)
//         }
//         className="border p-2 rounded"
//       />

//       <input
//         placeholder="Employee Email"
//         value={c.email || ""}
//         onChange={(e) =>
//           handleContactEmailChange(i, "email", e.target.value)
//         }
//         className="border p-2 rounded"
//       />

//       <button
//         type="button"
//         onClick={() => removeContactEmail(i)}
//         className="text-red-600"
//       >
//         <FaMinus />
//       </button>
//     </div>
//   ))}

//   <button
//     type="button"
//     onClick={addContactEmail}
//     className="text-blue-600 flex items-center gap-2"
//   >
//     <FaPlus /> Add Employee Email
//   </button>
// </div>


//          {/* Billing Addresses */}
//       <h3 className="text-lg font-semibold">Billing Addresses</h3>
//       {customerDetails.billingAddresses?.map((addr, i) => (
//         <div key={i} className="border p-4 rounded mb-4">
//           <div className="flex justify-between items-center mb-2">
//             <span className="font-medium">Billing Address {i + 1}</span>
//             {i > 0 && (
//               <button
//                 type="button"
//                 onClick={() => removeAddress("billing", i)}
//                 className="text-red-600"
//               >
//                 <FaMinus />
//               </button>
//             )}
//           </div>
//           <div className="grid sm:grid-cols-2 gap-4">
//             <input
//               value={addr.address1 || ""}
//               onChange={(e) => handleAddressChange("billing", i, "address1", e.target.value)}
//               placeholder="Line 1"
//               className="border p-2 rounded"
//             />
//             <input
//               value={addr.address2 || ""}
//               onChange={(e) => handleAddressChange("billing", i, "address2", e.target.value)}
//               placeholder="Line 2"
//               className="border p-2 rounded"
//             />
//             <input
//               value={addr.city || ""}
//               onChange={(e) => handleAddressChange("billing", i, "city", e.target.value)}
//               placeholder="City"
//               className="border p-2 rounded"
//             />
//             <input
//               value={addr.pin || ""}
//                type="Number"
//                onChange={(e) => {
//                 const pin = e.target.value;
//                 handleAddressChange("billing", i, "pin", pin);
//                 fetchFromPincode("billing", i, pin);
//               }}
              
//               placeholder="PIN"
//               className="border p-2 rounded"
//             />
//        <CountryStateSearch
//   valueCountry={addr.country ? { name: addr.country } : null}
//   valueState={addr.state ? { name: addr.state } : null}
//   onSelectCountry={(c) => handleAddressChange("billing", i, "country", c?.name || "")}
//   onSelectState={(s) => handleAddressChange("billing", i, "state", s?.name || "")}
// />

//           </div>
//         </div>
//       ))}
//       <button
//         type="button"
//         onClick={() => addAddress("billing")}
//         className="inline-flex items-center text-blue-600 mb-6"
//       >
//         <FaPlus className="mr-1" /> Add Billing Address
//       </button>

//       {/* Shipping Addresses */}
//       <h3 className="text-lg font-semibold">Shipping Addresses</h3>
//       {customerDetails.shippingAddresses?.map((addr, i) => (
//         <div key={i} className="border p-4 rounded mb-4">
//           <div className="flex justify-between items-center mb-2">
//             <span className="font-medium">Shipping Address {i + 1}</span>
//             {i > 0 && (
//               <button
//                 type="button"
//                 onClick={() => removeAddress("shipping", i)}
//                 className="text-red-600"
//               >
//                 <FaMinus />
//               </button>
//             )}
//           </div>
//           <div className="grid sm:grid-cols-2 gap-4">
//             <input
//               value={addr.address1 || ""}
//               onChange={(e) => handleAddressChange("shipping", i, "address1", e.target.value)}
//               placeholder="Line 1"
//               className="border p-2 rounded"
//             />
//             <input
//               value={addr.address2 || ""}
//               onChange={(e) => handleAddressChange("shipping", i, "address2", e.target.value)}
//               placeholder="Line 2"
//               className="border p-2 rounded"
//             />
//             <input
//               value={addr.city || ""}
//               onChange={(e) => handleAddressChange("shipping", i, "city", e.target.value)}
//               placeholder="City"
//               className="border p-2 rounded"
//             />
//             <input
//               value={addr.pin || ""}
//                type="Number"
//                onChange={(e) => {
//                 const pin = e.target.value;
//                 handleAddressChange("shipping", i, "pin", pin);
//                 fetchFromPincode("shipping", i, pin);
//               }}
              
//               placeholder="PIN"
//               className="border p-2 rounded"
//             />
//           <CountryStateSearch
//   valueCountry={addr.country ? { name: addr.country } : null}
//   valueState={addr.state ? { name: addr.state } : null}
//   onSelectCountry={(c) => handleAddressChange("shipping", i, "country", c?.name || "")}
//   onSelectState={(s) => handleAddressChange("shipping", i, "state", s?.name || "")}
// />

//           </div>
//         </div>
//       ))}
//       <button
//         type="button"
//         onClick={() => addAddress("shipping")}
//         className="inline-flex items-center text-blue-600 mb-6"
//       >
//         <FaPlus className="mr-1" /> Add Shipping Address
//       </button>

//       {/* Other Details */}
//       <div className="grid sm:grid-cols-2 gap-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms In (Day)</label>
//           <input
//             name="paymentTerms"
//             type="Number"
//             value={customerDetails.paymentTerms || ""}
//             onChange={handleChange}
//             placeholder="Payment Terms"
//             className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500"
//           />
//         </div>
//       <div>
//   <label className="block text-sm font-medium text-gray-700 mb-1">
//     GST Number
//   </label>
//   <input
//     name="gstNumber"
//     type="text"
//     placeholder="Enter GST Number"
//     value={customerDetails.gstNumber || ""}
//     onChange={(e) => {
//       const input = e.target.value.toUpperCase();
//       if (/^[A-Z0-9]{0,15}$/.test(input)) {
//         handleChange({ target: { name: "gstNumber", value: input } });
//       }
//     }}
//     maxLength={15}
//     className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500"
//   />
// </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             GST Category <span className="text-red-500">*</span>
//           </label>
//           <select
//             name="gstCategory"
//             value={customerDetails.gstCategory || ""}
//             onChange={handleChange}
//             className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500"
           
//           >
//             <option value="">Select GST Category</option>
//             <option value="Registered Regular">Registered Regular</option>
//             <option value="Registered Composition">Registered Composition</option>
//             <option value="Unregistered">Unregistered</option>
//             <option value="SEZ">SEZ</option>
//             <option value="Overseas">Overseas</option>
//             <option value="Deemed Export">Deemed Export</option>
//             <option value="UIN Holders">UIN Holders</option>
//             <option value="Tax Deductor">Tax Deductor</option>
//             <option value="Tax Collector">Tax Collector</option>
//             <option value="Input Service Distributor">Input Service Distributor</option>
//           </select>
//         </div>
//     <div>
//   <label className="block text-sm font-medium text-gray-700 mb-1">
//     PAN Number
//   </label>
//   <input
//     name="pan"
//     type="text"
//     placeholder="Enter PAN Number"
//     value={customerDetails.pan || ""}
//     onChange={(e) => {
//       const input = e.target.value.toUpperCase();
//       if (/^[A-Z0-9]{0,10}$/.test(input)) {
//         handleChange({ target: { name: "pan", value: input } });
//       }
//     }}
//     maxLength={10}
//     className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500"
//   />
// </div>

//         <div>
        
//           <AccountSearch
//             value={customerDetails.glAccount}
//             onSelect={(selected) =>
//               setCustomerDetails((prev) => ({
//                 ...prev,
//                 glAccount: selected,
//               }))
//             }
//           />
//         </div>
//       </div>
//       {/* Assigned Agents */}
//       {/* 3. UI for Assigned Agents */}
//       {/* ASSIGNED AGENTS SECTION */}
//           <div className="border p-4 rounded bg-blue-50">
//   <h3 className="text-sm font-bold text-blue-700 mb-3 uppercase tracking-tight">
//     Assign Agents & Support Staff
//   </h3>

//   <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//     {availableUsers.map((user) => {
//       const isAssigned = customerDetails.assignedAgents
//         ?.map(id => id.toString())
//         .includes(user._id.toString());

//       return (
//         <label
//           key={user._id}
//           className={`flex flex-col p-2 border rounded cursor-pointer transition-all ${
//             isAssigned
//               ? "bg-blue-600 text-white border-blue-700"
//               : "bg-white text-gray-700 border-gray-200"
//           }`}
//         >
//           <div className="flex items-center">
//             <input
//               type="checkbox"
//               className="mr-2"
//               checked={isAssigned}
//               onChange={() => handleAgentToggle(user._id)}
//             />

//             <div>
//               <div className="text-sm font-bold">
//                 Name: {user.name}
//               </div>
//               <div
//                 className={`text-[10px] uppercase ${
//                   isAssigned ? "text-blue-100" : "text-gray-500"
//                 }`}
//               >
//                 {user.roles?.join(", ")}
//               </div>
//             </div>
//           </div>
//         </label>
//       );
//     })}
//   </div>
// </div>



//       {/* Footer Buttons */}
//       <div className="flex justify-end space-x-3 mt-6">
//         <button
//           type="button"
//           onClick={resetForm}
//           className="px-4 py-2 bg-gray-500 text-white rounded-md"
//         >
//           Cancel
//         </button>
//         <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md">
//           {customerDetails._id ? "Update" : "Create"}
//         </button>
//       </div>
//     </form>
//   </div>
// );


//   return view === "list" ? renderListView() : renderFormView();
// }
