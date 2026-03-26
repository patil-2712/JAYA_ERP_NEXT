"use client";

import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";

/* =========================
  CONSTANTS (Same as Create Page)
========================= */
const ORDER_TYPES = ["Sales", "STO Order", "Export", "Import"];
const BILLING_TYPES = ["Single - Order", "Multi - Order"];
const DELIVERY_TYPES = ["Urgent", "Normal", "Express", "Scheduled"];
const PRICE_LISTS = ["INDORAMA GDM MULTI P", "SQM GDM MULTI P", "Nil Price list"];
const APPROVAL_STATUS = ["Pending", "Approved", "Rejected", "Completed"];
const RATE_APPROVAL_TYPES = ["Contract Rates", "Mail Approval Rate"];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/* =========================
  CUSTOMER SEARCH HOOK (Same as Create Page)
========================= */
function useCustomerSearch() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchCustomers = async (query = "") => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const url = '/api/customers';
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCustomers(data.data);
      } else {
        setCustomers([]);
        setError(data.message || 'No customers found');
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      setCustomers([]);
      setError('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  return { customers, loading, error, searchCustomers };
}

/* =========================
  VEHICLE NEGOTIATION SEARCH HOOK - FOR EDIT PAGE
  Shows VNNs that are NOT used in any pricing panel, but keeps current VNN visible
========================= */
function useVehicleNegotiationSearch(currentVnn) {
  const [vehicleNegotiations, setVehicleNegotiations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchVehicleNegotiations = async (query = "") => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch all vehicle negotiations
      const vnRes = await fetch('/api/vehicle-negotiation', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!vnRes.ok) {
        throw new Error(`HTTP error! status: ${vnRes.status}`);
      }
      
      const vnData = await vnRes.json();
      
      // Fetch all pricing panels to see which VNNs are already used
      const pricingRes = await fetch('/api/pricing-panel?format=table', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const pricingData = await pricingRes.json();
      
      // Create a Set of used VNNs
      const usedVnns = new Set();
      if (pricingData.success && Array.isArray(pricingData.data)) {
        pricingData.data.forEach(item => {
          if (item.vnn && item.vnn !== '-' && item.vnn !== 'N/A') {
            // Don't mark current VNN as used
            if (item.vnn !== currentVnn) {
              usedVnns.add(item.vnn);
            }
          }
        });
      }
      
      // Filter out VNNs that are already used, but keep current VNN
      if (vnData.success && Array.isArray(vnData.data)) {
        const availableVNs = vnData.data.filter(vn => 
          !usedVnns.has(vn.vnnNo) || vn.vnnNo === currentVnn
        );
        setVehicleNegotiations(availableVNs);
        console.log(`📊 Found ${availableVNs.length} available VNNs out of ${vnData.data.length} total`);
      } else {
        setVehicleNegotiations([]);
        setError(vnData.message || 'No vehicle negotiations found');
      }
    } catch (err) {
      console.error('Error fetching vehicle negotiations:', err);
      setVehicleNegotiations([]);
      setError('Failed to fetch vehicle negotiations');
    } finally {
      setLoading(false);
    }
  };

  const getVehicleNegotiationById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/vehicle-negotiation?id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.success && data.data) {
        return data.data;
      } else {
        setError(data.message || 'Vehicle negotiation not found');
        return null;
      }
    } catch (err) {
      console.error('Error fetching vehicle negotiation:', err);
      setError('Failed to fetch vehicle negotiation');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount
  useEffect(() => {
    searchVehicleNegotiations();
  }, [currentVnn]);

  return { 
    vehicleNegotiations, 
    loading, 
    error, 
    searchVehicleNegotiations, 
    getVehicleNegotiationById 
  };
}

/* =========================
  DEFAULT ROWS (Same as Create Page)
========================= */
function defaultOrderRow(index = 1) {
  return {
    _id: uid(),
    orderNo: "",
    vehicleNegotiationId: "",
    vnnNumber: "",
    partyName: "",
    customerId: "",
    customerCode: "",
    contactPerson: "",
    plantCode: "",
    plantName: "",
    plantCodeValue: "",
    orderType: "Sales",
    pinCode: "",
    from: "",
    fromName: "",
    to: "",
    toName: "",
    district: "",
    districtName: "",
    state: "",
    stateName: "",
    country: "",
    countryName: "",
    locationRate: "",
    priceList: "",
    weight: "",
    rate: "",
    totalAmount: 0,
  };
}

/* =========================
  UI COMPONENTS (Same as Create Page)
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

/* =========================
  SEARCHABLE DROPDOWN COMPONENTS (Same as Create Page)
========================= */
function SearchableDropdown({ 
  items, 
  selectedId, 
  onSelect, 
  placeholder = "Search...",
  required = false,
  displayField = 'name',
  codeField = 'code',
  disabled = false,
  readOnly = false
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setFilteredItems(items);
    if (selectedId) {
      const item = items.find(i => i._id === selectedId || i.code === selectedId);
      setSelectedItem(item);
      if (item) {
        setSearchQuery(getDisplayValue(item));
      }
    } else {
      setSelectedItem(null);
      setSearchQuery("");
    }
  }, [items, selectedId, displayField]);

  const getDisplayValue = (item) => {
    if (!item) return "";
    const display = item[displayField] || item.customerName || "";
    const code = item[codeField] ? `(${item[codeField]})` : "";
    return `${display} ${code}`.trim();
  };

  const handleSearch = (query) => {
    if (readOnly) return;
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredItems(items);
    } else {
      const filtered = items.filter(item =>
        (item[displayField] && item[displayField].toLowerCase().includes(query.toLowerCase())) ||
        (item[codeField] && item[codeField].toLowerCase().includes(query.toLowerCase())) ||
        (item.customerName && item.customerName.toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredItems(filtered);
    }
    
    if (selectedItem && query !== getDisplayValue(selectedItem)) {
      setSelectedItem(null);
      onSelect?.(null);
    }
  };

  const handleSelectItem = (item) => {
    if (readOnly) return;
    setSelectedItem(item);
    setSearchQuery(getDisplayValue(item));
    setShowDropdown(false);
    onSelect?.(item);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => !readOnly && setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        className={`mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
          readOnly ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
        }`}
        placeholder={placeholder}
        required={required}
        disabled={disabled || readOnly}
        autoComplete="off"
        readOnly={readOnly}
      />
      
      {showDropdown && !readOnly && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div
                key={item._id}
                onMouseDown={() => handleSelectItem(item)}
                className={`p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors ${
                  selectedItem?._id === item._id ? 'bg-sky-50' : ''
                }`}
              >
                <div className="font-medium text-slate-800">
                  {item[displayField] || item.customerName}
                </div>
                {item[codeField] && (
                  <div className="text-xs text-slate-500 mt-1">
                    Code: {item[codeField]}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-3 text-center text-sm text-slate-500">
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

/* =========================
  VEHICLE NEGOTIATION DROPDOWN FOR HEADER - EDIT PAGE
  Shows only available VNNs + current VNN (no "Available" label)
========================= */
function VehicleNegotiationHeaderDropdown({ 
  onSelect,
  placeholder = "Search vehicle negotiation...",
  currentVnn = null
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [vnList, setVnList] = useState([]);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const vehicleNegotiationSearch = useVehicleNegotiationSearch(currentVnn);

  useEffect(() => {
    setVnList(vehicleNegotiationSearch.vehicleNegotiations);
  }, [vehicleNegotiationSearch.vehicleNegotiations]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!showDropdown) {
      setShowDropdown(true);
    }
  };

  const handleSelectVN = async (vn) => {
    setSearchQuery(vn.vnnNo);
    setShowDropdown(false);
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/vehicle-negotiation?id=${vn._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          onSelect(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching VN details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputFocus = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
    
    setShowDropdown(true);
    if (vnList.length === 0 && vehicleNegotiationSearch.vehicleNegotiations.length === 0) {
      vehicleNegotiationSearch.searchVehicleNegotiations();
    }
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

  // Filter based on search
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return vnList;
    return vnList.filter(vn =>
      vn.vnnNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vn.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vn.branchName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [vnList, searchQuery]);

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
        placeholder={placeholder}
        autoComplete="off"
      />
      
      {showDropdown && (
        <div 
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            zIndex: 9999,
            maxHeight: '400px'
          }}
          className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-y-auto"
        >
          {vehicleNegotiationSearch.loading ? (
            <div className="p-4 text-center text-sm text-slate-500">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sky-500 mx-auto mb-2"></div>
              Loading vehicle negotiations...
            </div>
          ) : filteredList.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filteredList.map((vn) => (
                <div
                  key={vn._id}
                  onMouseDown={() => handleSelectVN(vn)}
                  className="p-3 hover:bg-yellow-50 cursor-pointer"
                >
                  <div className="font-medium text-slate-800">{vn.vnnNo}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {vn.customerName || 'N/A'} | {vn.branchName} | Orders: {vn.orders?.length || 0}
                    {vn.vnnNo === currentVnn && (
                      <span className="ml-2 text-blue-600">(Current)</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-slate-500">
              {searchQuery.trim() ? 
                `No vehicle negotiations found for "${searchQuery}"` : 
                "No vehicle negotiations available"
              }
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* =========================
  ORDERS TABLE COMPONENT - EDIT PAGE (Same as Create Page but with read-only fields)
========================= */
function OrdersTable({ rows, onChange, onRemove, billingType }) {
  const columns = [
    { key: "orderNo", label: "Order No *" },
    { key: "partyName", label: "Party Name" },
    { key: "plantCode", label: "Plant Code" },
    { key: "plantName", label: "Plant Name", readOnly: true },
    { key: "plantCodeValue", label: "Plant Code Value", readOnly: true },
    { key: "orderType", label: "Order Type" },
    { key: "pinCode", label: "Pin Code" },
    { key: "country", label: "Country" },
    { key: "state", label: "State" },
    { key: "district", label: "District" },
    { key: "from", label: "From" },
    { key: "to", label: "To" },
    { key: "locationRate", label: "Location Rate", type: "number" },
    { key: "priceList", label: "Price List" },
    { key: "weight", label: "Weight", type: "number" },
    { key: "rate", label: "Rate", type: "number" },
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
            <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">
              Total Amount
            </th>
            {billingType === "Multi - Order" && (
              <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">
                Actions
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => {
            const totalAmount = num(row.weight) * num(row.rate);
            
            return (
              <tr key={row._id} className="hover:bg-yellow-50 even:bg-slate-50">
                {/* Order No */}
                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    value={row.orderNo || ""}
                    onChange={(e) => onChange(row._id, 'orderNo', e.target.value)}
                    className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                      row.vehicleNegotiationId ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    placeholder="Enter Order No"
                    readOnly={!!row.vehicleNegotiationId}
                  />
                </td>

                {/* Party Name */}
                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    value={row.partyName || ""}
                    onChange={(e) => onChange(row._id, 'partyName', e.target.value)}
                    className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                      row.vehicleNegotiationId ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    placeholder="Party Name"
                    readOnly={!!row.vehicleNegotiationId}
                  />
                </td>

                {/* Plant Code */}
                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    value={row.plantCode || ""}
                    onChange={(e) => onChange(row._id, 'plantCode', e.target.value)}
                    className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                      row.vehicleNegotiationId ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    placeholder="Plant Code"
                    readOnly={!!row.vehicleNegotiationId}
                  />
                </td>

                {/* Plant Name - Read Only */}
                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    type="text"
                    value={row.plantName || ""}
                    readOnly
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm outline-none"
                    placeholder="Auto-filled"
                  />
                </td>

                {/* Plant Code Value - Read Only */}
                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    type="text"
                    value={row.plantCodeValue || ""}
                    readOnly
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm outline-none"
                    placeholder="Auto-filled"
                  />
                </td>

                {/* Order Type */}
                <td className="border border-yellow-300 px-2 py-2">
                  <select
                    value={row.orderType || ""}
                    onChange={(e) => onChange(row._id, 'orderType', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  >
                    <option value="">Select</option>
                    {ORDER_TYPES.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Pin Code */}
                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    type="text"
                    value={row.pinCode || ""}
                    onChange={(e) => onChange(row._id, 'pinCode', e.target.value)}
                    className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                      row.vehicleNegotiationId ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    placeholder="Pin Code"
                    readOnly={!!row.vehicleNegotiationId}
                  />
                </td>

                {/* Country */}
                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    value={row.countryName || ""}
                    onChange={(e) => onChange(row._id, 'countryName', e.target.value)}
                    className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                      row.vehicleNegotiationId ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    placeholder="Country"
                    readOnly={!!row.vehicleNegotiationId}
                  />
                </td>

                {/* State */}
                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    value={row.stateName || ""}
                    onChange={(e) => onChange(row._id, 'stateName', e.target.value)}
                    className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                      row.vehicleNegotiationId ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    placeholder="State"
                    readOnly={!!row.vehicleNegotiationId}
                  />
                </td>

                {/* District */}
                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    value={row.districtName || ""}
                    onChange={(e) => onChange(row._id, 'districtName', e.target.value)}
                    className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                      row.vehicleNegotiationId ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    placeholder="District"
                    readOnly={!!row.vehicleNegotiationId}
                  />
                </td>

                {/* From */}
                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    value={row.fromName || ""}
                    onChange={(e) => onChange(row._id, 'fromName', e.target.value)}
                    className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                      row.vehicleNegotiationId ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    placeholder="From"
                    readOnly={!!row.vehicleNegotiationId}
                  />
                </td>

                {/* To */}
                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    value={row.toName || ""}
                    onChange={(e) => onChange(row._id, 'toName', e.target.value)}
                    className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                      row.vehicleNegotiationId ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    placeholder="To"
                    readOnly={!!row.vehicleNegotiationId}
                  />
                </td>

                {/* Location Rate */}
                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    type="number"
                    value={row.locationRate || ""}
                    onChange={(e) => onChange(row._id, 'locationRate', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    placeholder="Enter Location Rate"
                  />
                </td>

                {/* Price List */}
                <td className="border border-yellow-300 px-2 py-2">
                  <select
                    value={row.priceList || ""}
                    onChange={(e) => onChange(row._id, 'priceList', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  >
                    <option value="">Select Price List</option>
                    {PRICE_LISTS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Weight */}
                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    type="number"
                    value={row.weight || ""}
                    onChange={(e) => onChange(row._id, 'weight', e.target.value)}
                    className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                      row.vehicleNegotiationId ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    placeholder="Weight"
                    readOnly={!!row.vehicleNegotiationId}
                  />
                </td>

                {/* Rate */}
                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    type="number"
                    value={row.rate || ""}
                    onChange={(e) => onChange(row._id, 'rate', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    placeholder="Enter Rate"
                  />
                </td>

                {/* Total Amount */}
                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    type="number"
                    value={totalAmount}
                    readOnly
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm outline-none"
                  />
                </td>

                {/* Actions */}
                {billingType === "Multi - Order" && (
                  <td className="border border-yellow-300 px-2 py-2 text-center">
                    <button
                      onClick={() => onRemove(row._id)}
                      className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600 transition"
                    >
                      Remove
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* =========================
  MAIN EDIT PAGE
========================= */
export default function EditPricingPanel() {
  const router = useRouter();
  const params = useParams();
  const panelId = params.id;

  /** =========================
   * STATE FOR API DATA
   ========================= */
  const [branches, setBranches] = useState([]);
  const [countries, setCountries] = useState([]);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [pricingSerialNo, setPricingSerialNo] = useState("");
  const [stateData, setStateData] = useState({});
  const [districtData, setDistrictData] = useState({});

  /** =========================
   * CUSTOMER SEARCH STATE
   ========================= */
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const customerSearch = useCustomerSearch();

  /** =========================
   * VEHICLE NEGOTIATION SEARCH STATE
   ========================= */
  const [vehicleNegotiationSearchQuery, setVehicleNegotiationSearchQuery] = useState("");
  const [selectedVehicleNegotiation, setSelectedVehicleNegotiation] = useState(null);
  const [currentVnn, setCurrentVnn] = useState("");
  const vehicleNegotiationSearch = useVehicleNegotiationSearch(currentVnn);

  /* ===== HEADER ===== */
  const [header, setHeader] = useState({
    pricingSerialNo: "",
    branch: "",
    branchName: "",
    branchCode: "",
    delivery: "Normal",
    date: new Date().toISOString().split('T')[0],
    partyName: "",
    customerId: ""
  });

  /* ===== BILLING ===== */
  const [billing, setBilling] = useState({
    billingType: "Multi - Order",
    loadingPoints: "",
    dropPoints: "",
    collectionCharges: 0,
    cancellationCharges: "Nil",
    loadingCharges: "Nil",
    otherCharges: 0,
  });

  /* ===== ORDERS ===== */
  const [orders, setOrders] = useState([]);

  /* ===== RATE APPROVAL - READ ONLY ===== */
  const [rateApproval, setRateApproval] = useState({
    approvalType: "Contract Rates",
    uploadFile: null,
    uploadFileName: "",
    approvalStatus: "Pending",
  });

  /** =========================
   * FETCH DATA FROM APIs
   ========================= */
  useEffect(() => {
    fetchBranches();
    fetchCountries();
    fetchPlants();
    fetchPricingPanelData();
  }, []);

  const fetchPricingPanelData = async () => {
    setFetchLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch the pricing panel
      const res = await fetch(`/api/pricing-panel?id=${panelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch pricing panel');
      }

      const panel = data.data;
      
      // Set current VNN for filtering
      if (panel.orders && panel.orders.length > 0 && panel.orders[0].vnnNumber) {
        setCurrentVnn(panel.orders[0].vnnNumber);
      }
      
      // Set pricing serial number
      setPricingSerialNo(panel.pricingSerialNo || "");
      
      // Set header data
      setHeader({
        pricingSerialNo: panel.pricingSerialNo || "",
        branch: panel.branch || "",
        branchName: panel.branchName || "",
        branchCode: panel.branchCode || "",
        delivery: panel.delivery || "Normal",
        date: panel.date ? new Date(panel.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        partyName: panel.partyName || "",
        customerId: panel.customerId || ""
      });

      // Set billing data
      if (panel.billingType || panel.collectionCharges) {
        setBilling({
          billingType: panel.billingType || "Multi - Order",
          loadingPoints: panel.loadingPoints?.toString() || "",
          dropPoints: panel.dropPoints?.toString() || "",
          collectionCharges: panel.collectionCharges || 0,
          cancellationCharges: panel.cancellationCharges || "Nil",
          loadingCharges: panel.loadingCharges || "Nil",
          otherCharges: panel.otherCharges || 0,
        });
      }

      // Set orders
      if (panel.orders && panel.orders.length > 0) {
        const processedOrders = panel.orders.map(order => ({
          ...order,
          _id: order._id || uid(),
          weight: order.weight?.toString() || "",
          rate: order.rate?.toString() || "",
          locationRate: order.locationRate?.toString() || "",
          vehicleNegotiationId: order.vehicleNegotiationId || ""
        }));
        setOrders(processedOrders);
      } else {
        setOrders([defaultOrderRow()]);
      }

      // Set rate approval
      if (panel.rateApproval) {
        setRateApproval({
          approvalType: panel.rateApproval.approvalType || "Contract Rates",
          uploadFile: null,
          uploadFileName: panel.rateApproval.uploadFile || "",
          approvalStatus: panel.rateApproval.approvalStatus || "Pending",
        });
      }

      // Set customer if exists
      if (panel.partyName) {
        setCustomerSearchQuery(panel.partyName);
        setSelectedCustomer({
          _id: panel.customerId,
          customerName: panel.partyName,
          customerCode: panel.customerCode || "",
          contactPersonName: panel.contactPerson || ""
        });
      }

    } catch (error) {
      console.error('Error fetching pricing panel:', error);
      alert(`Failed to load pricing panel: ${error.message}`);
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/branches', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setBranches(data.data);
      }
    } catch (error) {
      console.error('Error fetching branches:', error.message);
    }
  };

  const fetchCountries = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/countries', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCountries(data.data);
      }
    } catch (error) {
      console.error('Error fetching countries:', error.message);
    }
  };

  const fetchPlants = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/plants', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setPlants(data.data);
      }
    } catch (error) {
      console.error('Error fetching plants:', error.message);
    }
  };

  const fetchStatesForCountry = async (countryCode) => {
    if (!countryCode) return [];
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/states?country=${countryCode}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        return data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching states:', error.message);
      return [];
    }
  };

  const fetchDistrictsForState = async (stateId) => {
    if (!stateId) return [];
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/districts?state=${stateId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        return data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching districts:', error.message);
      return [];
    }
  };

  /** =========================
   * CUSTOMER SEARCH FUNCTIONS
   ========================= */
  const handleCustomerSearch = (query) => {
    setCustomerSearchQuery(query);
    
    if (query.trim() === "") {
      setFilteredCustomers(customerSearch.customers);
    } else {
      const filtered = customerSearch.customers.filter(customer =>
        customer.customerName.toLowerCase().includes(query.toLowerCase()) ||
        customer.customerCode.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCustomers(filtered);
    }
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCustomerSearchQuery(customer.customerName);
    setShowCustomerDropdown(false);
    
    setHeader(prev => ({
      ...prev,
      partyName: customer.customerName,
      customerId: customer._id
    }));
    
    setOrders(prevOrders => 
      prevOrders.map(order => ({
        ...order,
        partyName: customer.customerName,
        customerId: customer._id,
        customerCode: customer.customerCode,
        contactPerson: customer.contactPersonName || ""
      }))
    );
  };

  useEffect(() => {
    if (customerSearch.customers.length > 0) {
      setFilteredCustomers(customerSearch.customers);
    }
  }, [customerSearch.customers]);

  /** =========================
   * VEHICLE NEGOTIATION SELECT FUNCTION
   ========================= */
  const handleSelectVehicleNegotiation = async (fullVN) => {
    setSelectedVehicleNegotiation(fullVN);
    setVehicleNegotiationSearchQuery(fullVN.vnnNo);

    // Update header with VN data
    setHeader(prev => ({
      ...prev,
      branch: fullVN.branch || "",
      branchName: fullVN.branchName || "",
      branchCode: fullVN.branchCode || "",
      delivery: fullVN.delivery || "Normal",
      date: fullVN.date ? new Date(fullVN.date).toISOString().split('T')[0] : prev.date,
      partyName: fullVN.customerName || fullVN.partyName || "",
      customerId: fullVN.customerId || ""
    }));

    // Update billing with VN charges
    setBilling(prev => ({
      ...prev,
      collectionCharges: fullVN.collectionCharges || 0,
      cancellationCharges: fullVN.cancellationCharges || "Nil",
      loadingCharges: fullVN.loadingCharges || "Nil",
      otherCharges: fullVN.otherCharges || 0,
      loadingPoints: prev.loadingPoints || fullVN.loadingPoints || "",
      dropPoints: prev.dropPoints || fullVN.dropPoints || ""
    }));

    // Create new orders from vehicle negotiation
    if (fullVN.orders && fullVN.orders.length > 0) {
      const newOrders = fullVN.orders.map(order => ({
        _id: uid(),
        orderNo: order.orderNo,
        vehicleNegotiationId: fullVN._id,
        vnnNumber: fullVN.vnnNo,
        partyName: order.partyName || fullVN.customerName || "",
        customerId: order.customerId || fullVN.customerId,
        customerCode: order.customerCode || "",
        contactPerson: order.contactPerson || fullVN.contactPerson || "",
        plantCode: order.plantCode,
        plantName: order.plantName || "",
        plantCodeValue: order.plantCodeValue || "",
        orderType: order.orderType || "Sales",
        pinCode: order.pinCode || "",
        from: order.from,
        fromName: order.fromName || "",
        to: order.to,
        toName: order.toName || "",
        country: order.country,
        countryName: order.countryName || "",
        state: order.state,
        stateName: order.stateName || "",
        district: order.district,
        districtName: order.districtName || "",
        locationRate: "",
        priceList: "",
        weight: order.weight || "",
        rate: "",
        totalAmount: 0
      }));
      
      setOrders(newOrders);
    }
  };

  /** =========================
   * ORDER ROW FUNCTIONS
   ========================= */
  const updateOrder = (id, key, value) => {
    setOrders((prev) => prev.map((r) => (r._id === id ? { ...r, [key]: value } : r)));
  };

  const addOrder = () => {
    setOrders((prev) => [
      ...prev,
      {
        ...defaultOrderRow(prev.length + 1),
        _id: uid(),
      },
    ]);
  };

  const removeOrder = (id) => {
    if (orders.length > 1) {
      setOrders((prev) => prev.filter((x) => x._id !== id));
    } else {
      alert("At least one order row is required");
    }
  };

  const handleBillingTypeChange = (value) => {
    setBilling((prev) => ({ ...prev, billingType: value }));
    
    if (value === "Single - Order") {
      if (orders.length > 1) {
        setOrders([orders[0]]);
      } else {
        setOrders([defaultOrderRow(1)]);
      }
    }
  };

  /** =========================
   * CALCULATIONS
   ========================= */
  const totalWeight = useMemo(() => {
    return orders.reduce((acc, r) => acc + num(r.weight), 0);
  }, [orders]);

  const totalAmount = useMemo(() => {
    return orders.reduce((acc, r) => {
      const weight = num(r.weight);
      const rate = num(r.rate);
      return acc + (weight * rate);
    }, 0);
  }, [orders]);

  /** =========================
   * FILE UPLOAD HANDLER - READ ONLY
   ========================= */
  const handleFileSelect = (e) => {
    alert("Rate Approval section is read-only");
  };

  /** =========================
   * UPDATE FUNCTION
   ========================= */
  const handleUpdate = async () => {
    if (!header.branch) {
      alert("Please select a branch");
      return;
    }
    
    const hasInvalidOrders = orders.some(order => !order.orderNo);
    if (hasInvalidOrders) {
      alert("Please enter Order No for all order rows");
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("No authentication token found. Please login again.");
      }

      const payload = {
        id: panelId,
        header: {
          ...header,
          partyName: selectedCustomer?.customerName || header.partyName,
          customerId: selectedCustomer?._id || header.customerId
        },
        billing: {
          ...billing,
          loadingPoints: num(billing.loadingPoints) || 1,
          dropPoints: num(billing.dropPoints) || 1,
          collectionCharges: num(billing.collectionCharges) || 0,
          otherCharges: num(billing.otherCharges) || 0
        },
        orders: orders.map(order => ({
          _id: order._id,
          orderNo: order.orderNo,
          vehicleNegotiationId: order.vehicleNegotiationId,
          vnnNumber: order.vnnNumber,
          partyName: order.partyName,
          customerId: order.customerId || null,
          customerCode: order.customerCode,
          contactPerson: order.contactPerson,
          plantCode: order.plantCode,
          plantName: order.plantName,
          plantCodeValue: order.plantCodeValue,
          orderType: order.orderType,
          pinCode: order.pinCode,
          from: order.from,
          fromName: order.fromName,
          to: order.to,
          toName: order.toName,
          country: order.country,
          countryName: order.countryName,
          state: order.state,
          stateName: order.stateName,
          district: order.district,
          districtName: order.districtName,
          locationRate: num(order.locationRate),
          priceList: order.priceList,
          weight: num(order.weight),
          rate: num(order.rate),
          totalAmount: num(order.weight) * num(order.rate)
        })),
        totalWeight,
        totalAmount,
        rateApproval: {
          approvalType: rateApproval.approvalType,
          approvalStatus: rateApproval.approvalStatus,
          uploadFile: rateApproval.uploadFileName
        }
      };

      console.log("Sending update payload:", JSON.stringify(payload, null, 2));

      const res = await fetch('/api/pricing-panel', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to update: ${res.status}`);
      }

      const data = await res.json();

      setSaveSuccess(true);
      
      alert(`✅ Pricing panel updated successfully!\nPricing Serial No: ${header.pricingSerialNo}`);
      
      setTimeout(() => {
        router.push('/admin/pricing-panel');
      }, 2000);
      
    } catch (error) {
      console.error('Error updating pricing panel:', error);
      setSaveError(error.message || 'Failed to update pricing panel');
      alert(`❌ Error: ${error.message}`);
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const billingColumns = [
    { key: "billingType", label: "Billing Type", options: BILLING_TYPES },
    { key: "loadingPoints", label: "No. of Loading Points", type: "number" },
    { key: "dropPoints", label: "No. of Droping Point", type: "number" },
    { key: "collectionCharges", label: "Collection Charges", type: "number" },
    { key: "cancellationCharges", label: "Cancellation Charges", type: "text" },
    { key: "loadingCharges", label: "Loading Charges", type: "text" },
    { key: "otherCharges", label: "Other Charges", type: "number" },
  ];

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading pricing panel...</p>
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
                onClick={() => router.push('/admin/pricing-panel')}
                className="text-yellow-600 hover:text-yellow-800 font-medium text-sm flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to List
              </button>
              <div className="text-lg font-extrabold text-slate-900">
                Edit Pricing Panel: {header.pricingSerialNo}
              </div>
            </div>
            {saveSuccess && (
              <div className="text-sm text-green-600 font-medium mt-1">
                ✅ Pricing panel updated successfully! Redirecting to list...
              </div>
            )}
            {saveError && (
              <div className="text-sm text-red-600 font-medium mt-1">
                ❌ {saveError}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleUpdate}
              disabled={saving || uploading}
              className={`rounded-xl px-5 py-2 text-sm font-bold text-white transition ${
                saving || uploading
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-yellow-600 hover:bg-yellow-700'
              }`}
            >
              {saving || uploading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {uploading ? 'Uploading...' : 'Updating...'}
                </span>
              ) : 'Update Pricing Panel'}
            </button>
          </div>
        </div>
      </div>

      {/* ===== Main Layout ===== */}
      <div className="mx-auto max-w-full p-4 space-y-4">
        {/* ===== PART 1: PRICING PANEL - PART 1 ===== */}
        <Card title="Pricing Panel - Part -1">
          {/* Header Section */}
          <div className="grid grid-cols-12 gap-3 mb-4">
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Pricing Serial No</label>
              <div className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                {header.pricingSerialNo}
              </div>
            </div>

            {/* Search Vehicle Negotiation Field - Shows available VNNs + current */}
            <div className="col-span-12 md:col-span-3 relative">
              <label className="text-xs font-bold text-slate-600">Search Vehicle Negotiation</label>
              <VehicleNegotiationHeaderDropdown
                onSelect={handleSelectVehicleNegotiation}
                placeholder="Search by VNN..."
                currentVnn={currentVnn}
              />
              {selectedVehicleNegotiation && (
                <div className="text-xs text-slate-500 mt-1">
                  Selected: {selectedVehicleNegotiation.vnnNo}
                </div>
              )}
            </div>
            
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Branch *</label>
              <SearchableDropdown
                items={branches}
                selectedId={header.branch}
                onSelect={(branch) => setHeader(p => ({ 
                  ...p, 
                  branch: branch?._id || '',
                  branchName: branch?.name || '',
                  branchCode: branch?.code || ''
                }))}
                placeholder="Search branch... *"
                required={true}
                displayField="name"
                codeField="code"
                readOnly={false}
              />
              {selectedVehicleNegotiation && (
                <div className="text-xs text-slate-500 mt-1">
                  From Vehicle Negotiation: {header.branchName} ({header.branchCode})
                </div>
              )}
            </div>

            <Select
              col="col-span-12 md:col-span-3"
              label="Delivery"
              value={header.delivery}
              onChange={(v) => setHeader((p) => ({ ...p, delivery: v }))}
              options={DELIVERY_TYPES}
              readOnly={false}
            />

            <Input
              type="date"
              col="col-span-12 md:col-span-3"
              label="Date"
              value={header.date}
              onChange={(v) => setHeader((p) => ({ ...p, date: v }))}
              readOnly={false}
            />
            
            {/* Party Name - Searchable */}
            <div className="col-span-12 md:col-span-3 relative">
              <label className="text-xs font-bold text-slate-600">Party Name</label>
              <input
                type="text"
                value={selectedCustomer ? selectedCustomer.customerName : header.partyName}
                onChange={(e) => handleCustomerSearch(e.target.value)}
                onFocus={() => {
                  if (customerSearch.customers.length === 0) {
                    customerSearch.searchCustomers("");
                  }
                  setFilteredCustomers(customerSearch.customers);
                  setShowCustomerDropdown(true);
                }}
                onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                placeholder="Search customer by name..."
                autoComplete="off"
              />
              
              {showCustomerDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {customerSearch.loading ? (
                    <div className="p-3 text-center text-sm text-slate-500">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sky-500 mx-auto"></div>
                      <p className="mt-1">Loading customers...</p>
                    </div>
                  ) : filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                      <div
                        key={customer._id}
                        onMouseDown={() => handleSelectCustomer(customer)}
                        className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors"
                      >
                        <div className="font-medium text-slate-800">
                          {customer.customerName}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Code: {customer.customerCode}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-sm text-slate-500">
                      No customers found
                    </div>
                  )}
                </div>
              )}
              {selectedVehicleNegotiation && (
                <div className="text-xs text-slate-500 mt-1">
                  From Vehicle Negotiation
                </div>
              )}
            </div>
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
                      <td key={col.key} className="border border-yellow-300 px-2 py-2">
                        {col.options ? (
                          <select
                            value={billing[col.key] || ""}
                            onChange={(e) => {
                              if (col.key === "billingType") {
                                handleBillingTypeChange(e.target.value);
                              } else {
                                setBilling(prev => ({ ...prev, [col.key]: e.target.value }));
                              }
                            }}
                            disabled={col.key !== "billingType" && selectedVehicleNegotiation && col.key !== "loadingPoints" && col.key !== "dropPoints"}
                            className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                              (col.key !== "billingType" && selectedVehicleNegotiation && col.key !== "loadingPoints" && col.key !== "dropPoints") ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                            }`}
                          >
                            <option value="">Select {col.label}</option>
                            {col.options.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={col.type || "text"}
                            value={billing[col.key] || ""}
                            onChange={(e) => setBilling(prev => ({ ...prev, [col.key]: e.target.value }))}
                            readOnly={selectedVehicleNegotiation && col.key !== "loadingPoints" && col.key !== "dropPoints"}
                            className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                              (selectedVehicleNegotiation && col.key !== "loadingPoints" && col.key !== "dropPoints") ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                            }`}
                            placeholder={`Enter ${col.label}`}
                          />
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            {selectedVehicleNegotiation && (
              <div className="text-xs text-slate-500 mt-2">
                * Collection Charges, Cancellation Charges, Loading Charges, Other Charges are populated from Vehicle Negotiation.
                Loading Points and Drop Points are editable.
              </div>
            )}
          </div>

          {/* Orders Table */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-bold text-slate-700">
                Orders - {billing.billingType} - {orders.length} row{orders.length !== 1 ? 's' : ''}
              </div>
              
              {billing.billingType === "Multi - Order" && !selectedVehicleNegotiation && (
                <button
                  onClick={addOrder}
                  className="rounded-xl bg-yellow-600 px-4 py-2 text-sm font-bold text-white hover:bg-yellow-700"
                >
                  + Add Row
                </button>
              )}
            </div>
            
            <OrdersTable
              rows={orders}
              onChange={updateOrder}
              onRemove={removeOrder}
              billingType={billing.billingType}
            />
          </div>

          {/* Totals */}
          <div className="flex justify-end gap-4 mt-4">
            <div className="flex items-center gap-3 border border-yellow-300 px-6 py-3 bg-yellow-50 rounded-xl">
              <div className="text-sm font-extrabold text-slate-900">Total Weight:</div>
              <div className="text-xl font-extrabold text-emerald-700">{totalWeight}</div>
            </div>
            <div className="flex items-center gap-3 border border-yellow-300 px-6 py-3 bg-yellow-50 rounded-xl">
              <div className="text-sm font-extrabold text-slate-900">Total Amount:</div>
              <div className="text-xl font-extrabold text-emerald-700">{totalAmount}</div>
            </div>
          </div>
        </Card>

        {/* ===== PART 2: RATE APPROVAL - READ ONLY ===== */}
        <Card title="Rate - Approval - Part - 2 (Read Only)">
          <div className="grid grid-cols-12 gap-4">
            <Select
              col="col-span-12 md:col-span-4"
              label="Rate Approval Type"
              value={rateApproval.approvalType}
              onChange={(v) => setRateApproval((p) => ({ ...p, approvalType: v }))}
              options={RATE_APPROVAL_TYPES}
              readOnly={true}
            />

            <div className="col-span-12 md:col-span-4">
              <label className="text-xs font-bold text-slate-600">Rate Approval Upload</label>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileSelect}
                disabled={true}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none cursor-not-allowed"
              />
              {rateApproval.uploadFileName && (
                <div className="mt-1 text-xs text-green-600">
                  ✅ Current file: {rateApproval.uploadFileName}
                </div>
              )}
            </div>

            <Select
              col="col-span-12 md:col-span-4"
              label="Approval Status"
              value={rateApproval.approvalStatus}
              onChange={(v) => setRateApproval((p) => ({ ...p, approvalStatus: v }))}
              options={APPROVAL_STATUS}
              readOnly={true}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}