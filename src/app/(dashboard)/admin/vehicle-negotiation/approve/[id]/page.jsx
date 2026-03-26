"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";

/* =======================
  HELPERS / CONSTANTS
======================= */
const ORDER_TYPES = ["Sales", "STO Order", "Export", "Import"];
const STATUSES = ["Open", "Hold", "Cancelled"];
const BILLING_TYPES = ["Multi - Order", "Single Order"];
const PURCHASE_TYPES = ["Loading & Unloading", "Unloading Only", "Safi Vehicle"];
const VENDOR_STATUS = ["Active", "Blacklisted"];
const RATE_TYPES = ["Per MT", "Fixed"];
const PAYMENT_TERMS = [
  "80 % Advance",
  "90 % Advance",
  "Rs.10,000/- Balance Only",
  "Rs. 5000/- Balance Only",
  "Full Payment after Delivery",
];
const APPROVALS = ["Approved", "Reject", "Pending"];
const MEMO_STATUS = ["Uploaded", "Pending"];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/* =======================
  Supplier Search Hook
========================= */
function useSupplierSearch() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchSuppliers = async (query = "") => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = '/api/suppliers';
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setSuppliers(data.data);
      } else {
        setSuppliers([]);
      }
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  return { suppliers, loading, searchSuppliers };
}

/* =======================
  Vehicle Search Hook
========================= */
function useVehicleSearch() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchVehicles = async (query = "") => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = query ? `/api/vehicles?search=${encodeURIComponent(query)}` : '/api/vehicles';
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.success && Array.isArray(data.data)) {
        setVehicles(data.data);
      } else {
        setVehicles([]);
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  return { vehicles, loading, searchVehicles };
}

/* =======================
  Searchable Dropdown Components
========================= */
function TableSearchableDropdown({ 
  items, 
  selectedId, 
  onSelect, 
  placeholder = "Search...",
  displayField = 'name',
  codeField = 'code',
  disabled = false,
  showCode = true,
  cellId = ""
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    setFilteredItems(items);
    if (selectedId) {
      const item = items.find(i => i._id === selectedId || i.supplierName === selectedId);
      if (item) {
        setSelectedItem(item);
        setSearchQuery(getDisplayValue(item));
      } else {
        setSelectedItem(null);
        setSearchQuery("");
      }
    } else {
      setSelectedItem(null);
      setSearchQuery("");
    }
  }, [items, selectedId]);

  const getDisplayValue = (item) => {
    if (!item) return "";
    const display = item[displayField] || "";
    const code = item[codeField] && showCode ? ` (${item[codeField]})` : "";
    return `${display}${code}`;
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredItems(items);
    } else {
      const filtered = items.filter(item => {
        const display = (item[displayField] || '').toLowerCase();
        const code = (item[codeField] || '').toLowerCase();
        const searchLower = query.toLowerCase();
        return display.includes(searchLower) || code.includes(searchLower);
      });
      setFilteredItems(filtered);
    }
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setSearchQuery(getDisplayValue(item));
    setShowDropdown(false);
    onSelect?.(item);
  };

  const handleInputFocus = () => {
    if (disabled) return;
    
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
    
    setFilteredItems(items);
    setShowDropdown(true);
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      if (dropdownRef.current && !dropdownRef.current.contains(document.activeElement)) {
        setShowDropdown(false);
      }
    }, 200);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (showDropdown && inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width
        });
      }
    };

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [showDropdown]);

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 disabled:opacity-50"
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
      />
      
      {showDropdown && !disabled && (
        <div 
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            zIndex: 9999
          }}
          className="bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div
                key={item._id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelectItem(item);
                }}
                className="p-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100"
              >
                <div className="font-medium text-slate-800 text-sm">
                  {item[displayField]}
                </div>
                {item[codeField] && showCode && (
                  <div className="text-xs text-slate-500 mt-0.5">
                    Code: {item[codeField]}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-2 text-center text-sm text-slate-500">
              {searchQuery.trim() ? 
                `No items found for "${searchQuery}"` : 
                "No items available"
              }
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* =======================
  UI COMPONENTS
========================= */
function Card({ title, right, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm mb-4">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="text-sm font-extrabold text-slate-900">{title}</div>
        {right || null}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Input({ label, value, onChange, col = "", type = "text", readOnly = false }) {
  return (
    <div className={col}>
      <label className="text-xs font-bold text-slate-600">{label}</label>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        readOnly={readOnly}
        className={`mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
          readOnly ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
        }`}
      />
    </div>
  );
}

function Select({ label, value, onChange, options = [], col = "", readOnly = false }) {
  return (
    <div className={col}>
      <label className="text-xs font-bold text-slate-600">{label}</label>
      <select
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={readOnly}
        className={`mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
          readOnly ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
        }`}
      >
        <option value="">Select {label}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

/* =======================
  Orders Table Component (Read-only)
========================= */
function OrdersTable({ rows }) {
  const columns = [
    { key: "orderNo", label: "Order No" },
    { key: "partyName", label: "Party Name" },
    { key: "plantCode", label: "Plant Code" },
    { key: "plantName", label: "Plant Name" },
    { key: "plantCodeValue", label: "Plant Code Value" },
    { key: "orderType", label: "Order Type" },
    { key: "pinCode", label: "Pin Code" },
    { key: "from", label: "From" },
    { key: "to", label: "To" },
    { key: "country", label: "Country" },
    { key: "state", label: "State" },
    { key: "district", label: "District" },
    { key: "weight", label: "Weight" },
    { key: "status", label: "Status" },
  ];

  return (
    <div className="overflow-auto rounded-xl border border-yellow-300">
      <table className="min-w-full w-full text-sm">
        <thead className="sticky top-0 bg-yellow-400">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.length > 0 ? (
            rows.map((row) => (
              <tr key={row._id} className="hover:bg-yellow-50 even:bg-slate-50">
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.orderNo || '-'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.partyName || '-'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.plantCode || '-'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.plantName || '-'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.plantCodeValue || '-'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.orderType || '-'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.pinCode || '-'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.fromName || row.from || '-'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.toName || row.to || '-'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.countryName || row.country || '-'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.stateName || row.state || '-'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.districtName || row.district || '-'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.weight || '0'}</td>
                <td className="border border-yellow-300 px-2 py-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    row.status === 'Open' ? 'bg-green-100 text-green-800' :
                    row.status === 'Hold' ? 'bg-yellow-100 text-yellow-800' :
                    row.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    {row.status || 'Open'}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="border border-yellow-300 px-4 py-8 text-center text-slate-400">
                No orders added.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* =======================
  Vendors Table Component (Read-only)
========================= */
function VendorsTable({ rows }) {
  return (
    <div className="overflow-auto rounded-xl border border-yellow-300">
      <table className="min-w-full w-full text-sm">
        <thead className="sticky top-0 bg-yellow-400">
          <tr>
            <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">
              Supplier Name
            </th>
            <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">
              Supplier Code
            </th>
            <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">
              Market Rates
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.length > 0 ? (
            rows.map((row) => (
              <tr key={row._id} className="hover:bg-yellow-50 even:bg-slate-50">
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.vendorName || '-'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.vendorCode || '-'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">₹{row.marketRate || '0'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="border border-yellow-300 px-4 py-8 text-center text-slate-400">
                No suppliers added.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* =======================
  MAIN APPROVE PAGE
========================= */
export default function ApproveVehicleNegotiation() {
  const router = useRouter();
  const params = useParams();
  const negotiationId = params.id;

  const supplierSearch = useSupplierSearch();
  const vehicleSearch = useVehicleSearch();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  // State for all data
  const [vnnNumber, setVnnNumber] = useState("");
  const [header, setHeader] = useState({});
  const [orders, setOrders] = useState([]);
  const [negotiation, setNegotiation] = useState({});
  const [vendors, setVendors] = useState([]);
  const [approval, setApproval] = useState({
    vendorName: "",
    vendorCode: "",
    vendorStatus: "Active",
    rateType: "Per MT",
    finalPerMT: "",
    finalFix: "",
    vehicleNo: "",
    vehicleId: "",
    vehicleData: null,
    mobile: "",
    purchaseType: "Loading & Unloading",
    paymentTerms: "80 % Advance",
    approvalStatus: "Pending",
    remarks: "",
    memoStatus: "Pending",
    memoFile: null
  });
  const [voiceUrl, setVoiceUrl] = useState("");
  const [selectedOrderPanels, setSelectedOrderPanels] = useState([]);

  // Fetch suppliers and vehicles on mount
  useEffect(() => {
    supplierSearch.searchSuppliers();
    vehicleSearch.searchVehicles();
  }, []);

  useEffect(() => {
    fetchNegotiationData();
  }, []);

  const fetchNegotiationData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch(`/api/vehicle-negotiation?id=${negotiationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch vehicle negotiation');
      }

      const vn = data.data;
      console.log("Loaded negotiation data:", vn);
      
      // Set VNN number
      setVnnNumber(vn.vnnNo || "");
      
      // Set header data
      setHeader({
        vnnNo: vn.vnnNo || "",
        branchName: vn.branchName || "",
        branchCode: vn.branchCode || "",
        delivery: vn.delivery || "Urgent",
        date: vn.date ? new Date(vn.date).toLocaleDateString('en-GB') : "",
        billingType: vn.billingType || "Multi - Order",
        loadingPoints: vn.loadingPoints || "",
        dropPoints: vn.dropPoints || "",
        collectionCharges: vn.collectionCharges || "",
        cancellationCharges: vn.cancellationCharges || "Nil",
        loadingCharges: vn.loadingCharges || "Nil",
        otherCharges: vn.otherCharges || "Nil",
        partyName: vn.partyName || vn.customerName || "",
        customerCode: vn.customerCode || "",
        contactPerson: vn.contactPerson || ""
      });

      // Set orders
      if (vn.orders && vn.orders.length > 0) {
        setOrders(vn.orders);
      }

      // Set order panels
      if (vn.selectedOrderPanels) {
        setSelectedOrderPanels(vn.selectedOrderPanels);
      }

      // Set negotiation
      if (vn.negotiation) {
        setNegotiation({
          maxRate: vn.negotiation.maxRate || "",
          targetRate: vn.negotiation.targetRate || "",
          purchaseType: vn.negotiation.purchaseType || "",
          oldRatePercent: vn.negotiation.oldRatePercent || "",
          remarks1: vn.negotiation.remarks1 || "",
        });
      }

      // Set vendors
      if (vn.vendors && vn.vendors.length > 0) {
        setVendors(vn.vendors);
      }

      // Set voice note
      if (vn.voiceNote) {
        setVoiceUrl(vn.voiceNote);
      }

      // Set approval - ALL FIELDS ARE EDITABLE
      if (vn.approval) {
        setApproval({
          vendorName: vn.approval.vendorName || "",
          vendorCode: vn.approval.vendorCode || "",
          vendorStatus: vn.approval.vendorStatus || "Active",
          rateType: vn.approval.rateType || "Per MT",
          finalPerMT: vn.approval.finalPerMT?.toString() || "",
          finalFix: vn.approval.finalFix?.toString() || "",
          vehicleNo: vn.approval.vehicleNo || "",
          vehicleId: vn.approval.vehicleId || "",
          vehicleData: vn.approval.vehicleData || null,
          mobile: vn.approval.mobile || "",
          purchaseType: vn.approval.purchaseType || "Loading & Unloading",
          paymentTerms: vn.approval.paymentTerms || "80 % Advance",
          approvalStatus: vn.approval.approvalStatus || "Pending",
          remarks: vn.approval.remarks || "",
          memoStatus: vn.approval.memoStatus || "Pending",
          memoFile: vn.approval.memoFile || null
        });
      }

    } catch (error) {
      console.error('Error fetching vehicle negotiation:', error);
      setError(error.message);
      alert(`Failed to load vehicle negotiation: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSupplierSelect = (supplier) => {
    if (supplier) {
      console.log("Selected supplier:", supplier);
      setApproval({
        ...approval,
        vendorName: supplier.supplierName,
        vendorCode: supplier.supplierCode || '',
        vendorStatus: supplier.supplierStatus || "Active"
      });
    }
  };

  const handleVehicleSelect = (vehicle) => {
    if (vehicle) {
      setApproval({
        ...approval,
        vehicleNo: vehicle.vehicleNumber,
        vehicleId: vehicle._id,
        vehicleData: vehicle,
        mobile: vehicle.driverMobile || approval.mobile
      });
    }
  };

  const handleMemoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      alert("❌ Please upload only PDF or image files (JPEG, PNG)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("❌ File size should be less than 5MB");
      return;
    }

    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/upload/excel', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      
      const data = await res.json();
      
      if (data.success) {
        setApproval((prev) => ({ 
          ...prev, 
          memoStatus: "Uploaded",
          memoFile: {
            filePath: data.filePath,
            fullPath: data.fullPath,
            filename: data.filename,
            originalName: file.name,
            size: file.size,
            mimeType: file.type
          }
        }));
        alert("✅ Memo uploaded successfully!");
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (error) {
      console.error("Error uploading memo:", error);
      alert("❌ Failed to upload memo. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleApprove = async () => {
    if (!approval.approvalStatus) {
      alert("Please select approval status");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch current data
      const fetchRes = await fetch(`/api/vehicle-negotiation?id=${negotiationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const fetchData = await fetchRes.json();
      
      if (!fetchData.success) {
        throw new Error('Failed to fetch negotiation data');
      }
      
      const currentData = fetchData.data;
      
      // Log what we're about to send
      console.log("Saving approval with vendorCode:", approval.vendorCode);
      
      // Update only the approval section with all fields
      const updatedData = {
        ...currentData,
        approval: {
          vendorName: approval.vendorName,
          vendorCode: approval.vendorCode,
          vendorStatus: approval.vendorStatus,
          rateType: approval.rateType,
          finalPerMT: num(approval.finalPerMT),
          finalFix: num(approval.finalFix),
          vehicleNo: approval.vehicleNo,
          vehicleId: approval.vehicleId,
          vehicleData: approval.vehicleData,
          mobile: approval.mobile,
          purchaseType: approval.purchaseType,
          paymentTerms: approval.paymentTerms,
          approvalStatus: approval.approvalStatus,
          remarks: approval.remarks,
          memoStatus: approval.memoStatus,
          memoFile: approval.memoFile
        }
      };
      
      // Send update
      const res = await fetch('/api/vehicle-negotiation', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: negotiationId,
          ...updatedData
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert(`Vehicle Negotiation ${approval.approvalStatus} successfully!`);
        router.push('/admin/vehicle-negotiation');
      } else {
        alert(data.message || 'Failed to update approval');
      }
    } catch (error) {
      console.error('Error updating approval:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateVehicle = () => {
    router.push('/admin/vehicle2');
  };

  const totalWeight = useMemo(() => {
    return orders.reduce((acc, r) => acc + num(r.weight), 0);
  }, [orders]);

  const purchaseAmount = useMemo(() => {
    if (approval.rateType === "Per MT") {
      return num(approval.finalPerMT) * totalWeight;
    }
    return num(approval.finalFix);
  }, [approval.rateType, approval.finalPerMT, approval.finalFix, totalWeight]);

  const billingColumns = [
    { key: "billingType", label: "Billing Type" },
    { key: "loadingPoints", label: "No. of Loading Points" },
    { key: "dropPoints", label: "No. of Droping Point" },
    { key: "collectionCharges", label: "Collection Charges" },
    { key: "cancellationCharges", label: "Cancellation Charges" },
    { key: "loadingCharges", label: "Loading Charges" },
    { key: "otherCharges", label: "Other Charges" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading vehicle negotiation...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* ===== Top Bar ===== */}
      <div className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-full px-4 py-3 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/admin/vehicle-negotiation')}
                className="text-yellow-600 hover:text-yellow-800 font-medium text-sm flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to List
              </button>
              <div className="text-lg font-extrabold text-slate-900">
                Approve Vehicle Negotiation: {vnnNumber}
              </div>
            </div>
            <div className="text-xs text-green-600 mt-1 font-medium">
              ⓘ Part 3 and Memo section are editable for approval
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleApprove}
              disabled={saving || uploading}
              className={`rounded-xl px-5 py-2 text-sm font-bold text-white transition ${
                saving || uploading
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {saving || uploading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {uploading ? 'Uploading...' : 'Saving...'}
                </span>
              ) : 'Submit Approval'}
            </button>
          </div>
        </div>
      </div>

      {/* ===== Main Layout ===== */}
      <div className="mx-auto max-w-full p-4 space-y-4">
        {/* ===== PART 1: VEHICLE NEGOTIATION - PART 1 (READ ONLY) ===== */}
        <Card title="Vehicle Negotiation - Panel - Part -1 (Read Only)">
          {/* Header Section */}
          <div className="grid grid-cols-12 gap-3 mb-4">
            <Input
              col="col-span-12 md:col-span-3"
              label="Vehicle Negotiation No"
              value={vnnNumber}
              readOnly={true}
            />
            
            <div className="col-span-12 md:col-span-6">
              <label className="text-xs font-bold text-slate-600">Selected Order Panels</label>
              <div className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                {selectedOrderPanels.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedOrderPanels.map((panel, idx) => (
                      <span key={idx} className="bg-yellow-100 px-2 py-1 rounded-md text-xs">
                        {panel.orderPanelNo}
                      </span>
                    ))}
                  </div>
                ) : (
                  "No order panels selected"
                )}
              </div>
            </div>
            
            <Input
              col="col-span-12 md:col-span-3"
              label="Branch"
              value={header.branchName}
              readOnly={true}
            />

            <Input
              col="col-span-12 md:col-span-3"
              label="Delivery"
              value={header.delivery}
              readOnly={true}
            />

            <Input
              col="col-span-12 md:col-span-3"
              label="Date"
              value={header.date}
              readOnly={true}
            />
            
            <Input
              col="col-span-12 md:col-span-3"
              label="Party Name"
              value={header.partyName}
              readOnly={true}
            />
            
            <Input
              col="col-span-12 md:col-span-3"
              label="Customer Code"
              value={header.customerCode}
              readOnly={true}
            />
            
            <Input
              col="col-span-12 md:col-span-3"
              label="Contact Person"
              value={header.contactPerson}
              readOnly={true}
            />
          </div>

          {/* Billing Type / Charges */}
          <div className="mb-4">
            <div className="text-sm font-bold text-slate-700 mb-2">Billing Type / Charges</div>
            <div className="overflow-auto rounded-xl border border-yellow-300">
              <table className="min-w-full w-full text-sm">
                <thead className="sticky top-0 bg-yellow-400">
                  <tr>
                    {billingColumns.map((col) => (
                      <th
                        key={col.key}
                        className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center"
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  <tr className="hover:bg-yellow-50 even:bg-slate-50">
                    {billingColumns.map((col) => (
                      <td key={col.key} className="border border-yellow-300 px-2 py-2 text-slate-700 text-center">
                        {header[col.key] || '-'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Orders Table */}
          <div>
            <div className="text-sm font-bold text-slate-700 mb-4">
              Orders (Part-1) - {header.billingType} - {orders.length} row{orders.length !== 1 ? 's' : ''}
            </div>
            
            <OrdersTable rows={orders} />
          </div>

          {/* Total Weight */}
          <div className="flex justify-end mt-4">
            <div className="flex items-center gap-3 border border-yellow-300 px-6 py-3 bg-yellow-50 rounded-xl">
              <div className="text-sm font-extrabold text-slate-900">Total Weight:</div>
              <div className="text-xl font-extrabold text-emerald-700">{totalWeight}</div>
            </div>
          </div>
        </Card>

        {/* ===== PART 2: VEHICLE NEGOTIATION - PART 2 (READ ONLY) ===== */}
        <Card title="Vehicle - Negotiation - Part - 2 (Read Only)">
          <div className="grid grid-cols-12 gap-3 mb-4">
            <Input
              col="col-span-12 md:col-span-3"
              label="Max Rate"
              value={negotiation.maxRate}
              readOnly={true}
            />
            <Input
              col="col-span-12 md:col-span-3"
              label="Target Rate"
              value={negotiation.targetRate}
              readOnly={true}
            />
            <Input
              col="col-span-12 md:col-span-3"
              label="Purchase - Type"
              value={negotiation.purchaseType}
              readOnly={true}
            />
            <Input
              col="col-span-12 md:col-span-3"
              label="Old Rate %"
              value={negotiation.oldRatePercent}
              readOnly={true}
            />
          </div>

          {/* Vendors / Market Rates */}
          <div className="mb-4">
            <div className="text-sm font-bold text-slate-700 mb-4">Suppliers / Market Rates</div>
            <VendorsTable rows={vendors} />
          </div>

          {/* Remarks & Voice Note */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-7">
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="text-sm font-extrabold text-slate-900 mb-3">Remarks</div>
                <div className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  {negotiation.remarks1 || "-"}
                </div>
              </div>
            </div>

            {/* Voice Note Section */}
            <div className="col-span-12 md:col-span-5">
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="text-sm font-extrabold text-slate-900 mb-3">Voice Note</div>
                {voiceUrl ? (
                  <div className="mt-3">
                    <audio src={voiceUrl} controls className="w-full" />
                  </div>
                ) : (
                  <div className="text-sm text-slate-500">No voice note uploaded</div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* ===== PART 3: VEHICLE APPROVAL - PART 3 (ALL FIELDS EDITABLE) ===== */}
        <Card title="Vehicle - Approval - Part - 3 (All Fields Editable)">
          <div className="grid grid-cols-12 gap-3 mb-4">
            {/* Supplier Name with Dropdown */}
            <div className="col-span-12 md:col-span-4">
              <label className="text-xs font-bold text-slate-600">Supplier Name</label>
              <TableSearchableDropdown
                items={supplierSearch.suppliers}
                selectedId={approval.vendorName}
                onSelect={handleSupplierSelect}
                placeholder="Search supplier..."
                displayField="supplierName"
                codeField="supplierCode"
              />
            </div>
            
            {/* Supplier Code - Auto-filled */}
            <Input
              col="col-span-12 md:col-span-4"
              label="Supplier Code"
              value={approval.vendorCode}
              onChange={(v) => setApproval({ ...approval, vendorCode: v })}
            />
            
            {/* Supplier Status */}
            <Select
              col="col-span-12 md:col-span-4"
              label="Supplier Status"
              value={approval.vendorStatus}
              onChange={(v) => setApproval({ ...approval, vendorStatus: v })}
              options={VENDOR_STATUS}
            />
          </div>

          <div className="grid grid-cols-12 gap-3 mb-4">
            {/* Rate Type */}
            <Select
              col="col-span-12 md:col-span-4"
              label="Rate - Type"
              value={approval.rateType}
              onChange={(v) => setApproval({ ...approval, rateType: v })}
              options={RATE_TYPES}
            />
            
            {/* Final Per MT */}
            <Input
              col="col-span-12 md:col-span-4"
              label="Final - Per MT (A)"
              value={approval.finalPerMT}
              onChange={(v) => setApproval({ ...approval, finalPerMT: v })}
              type="number"
            />
            
            {/* Final Fix */}
            <Input
              col="col-span-12 md:col-span-4"
              label="Final - Fix"
              value={approval.finalFix}
              onChange={(v) => setApproval({ ...approval, finalFix: v })}
              type="number"
            />
          </div>

          {/* A / B / A x B */}
          <div className="grid grid-cols-12 gap-3 mb-4">
            <div className="col-span-12 md:col-span-4">
              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-600">Weight (B) - Auto Calculated</label>
                <div className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-extrabold text-slate-900">
                  {totalWeight}
                </div>
              </div>
            </div>
            <div className="col-span-12 md:col-span-4">
              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-600">Purchase Amount (A x B)</label>
                <div className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-extrabold text-emerald-700">
                  {purchaseAmount}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-3 mb-4">
            {/* Vehicle Number with Dropdown and Create Button */}
            <div className="col-span-12 md:col-span-4">
              <label className="text-xs font-bold text-slate-600">Vehicle Number</label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <TableSearchableDropdown
                    items={vehicleSearch.vehicles}
                    selectedId={approval.vehicleNo}
                    onSelect={handleVehicleSelect}
                    placeholder="Search vehicle..."
                    displayField="vehicleNumber"
                    codeField="rcNumber"
                  />
                </div>
                <button
                  onClick={() => router.push('/admin/vehicle2')}
                  className="rounded-lg bg-green-600 px-3 py-2 text-xs font-bold text-white hover:bg-green-700 transition whitespace-nowrap"
                  type="button"
                >
                  Create
                </button>
              </div>
            </div>

            {/* Mobile */}
            <Input
              col="col-span-12 md:col-span-4"
              label="Mobile"
              value={approval.mobile}
              onChange={(v) => setApproval({ ...approval, mobile: v })}
            />
          </div>

          <div className="grid grid-cols-12 gap-3 mb-4">
            {/* Purchase Type */}
            <Select
              col="col-span-12 md:col-span-4"
              label="Purchase - Type"
              value={approval.purchaseType}
              onChange={(v) => setApproval({ ...approval, purchaseType: v })}
              options={PURCHASE_TYPES}
            />
            
            {/* Payment Terms */}
            <Select
              col="col-span-12 md:col-span-4"
              label="Payment - Terms"
              value={approval.paymentTerms}
              onChange={(v) => setApproval({ ...approval, paymentTerms: v })}
              options={PAYMENT_TERMS}
            />
            
            {/* Approval Status */}
            <Select
              col="col-span-12 md:col-span-4"
              label="Approval Status"
              value={approval.approvalStatus}
              onChange={(v) => setApproval({ ...approval, approvalStatus: v })}
              options={APPROVALS}
            />
          </div>

          {/* Remarks */}
          <div>
            <div className="text-sm font-extrabold text-slate-900 mb-3">Remarks</div>
            <textarea
              value={approval.remarks}
              onChange={(e) => setApproval({ ...approval, remarks: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              rows={3}
              placeholder="Enter approval remarks..."
            />
          </div>
        </Card>

        {/* ===== MEMO UPLOAD (EDITABLE) ===== */}
        <Card title="Memo - Upload (Editable)">
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="text-sm font-extrabold text-slate-900 mb-3">Memo Upload</div>
            
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleMemoUpload}
                  disabled={uploading}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 disabled:opacity-50"
                />
              </div>
              
              <div className="col-span-12 md:col-span-3">
                <Select
                  label="Memo Status"
                  value={approval.memoStatus}
                  onChange={(v) => setApproval({ ...approval, memoStatus: v })}
                  options={MEMO_STATUS}
                />
              </div>
              
              <div className="col-span-12 md:col-span-3">
                <label className="text-xs font-bold text-slate-600">Current File</label>
                <div className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  {approval.memoFile?.originalName || "No file uploaded"}
                </div>
              </div>
            </div>

            {uploading && (
              <div className="mt-3 text-sm text-blue-600 flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading memo...
              </div>
            )}

            {approval.memoFile && (
              <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-800">Uploaded File:</p>
                <p className="text-sm text-green-700 mt-1">{approval.memoFile.originalName}</p>
                <p className="text-xs text-green-600 mt-0.5">Size: {(approval.memoFile.size / 1024).toFixed(1)} KB</p>
                {approval.memoFile.filePath && process.env.NODE_ENV === 'development' && (
                  <a 
                    href={approval.memoFile.filePath} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-sky-600 hover:underline mt-2 inline-block"
                  >
                    View File
                  </a>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}