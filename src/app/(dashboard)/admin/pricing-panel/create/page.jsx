"use client";

import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

/* =========================
  CONSTANTS
========================= */
const ORDER_TYPES = ["Sales", "STO Order", "Export", "Import"];
const BILLING_TYPES = ["Single - Order", "Multi - Order"];
const DELIVERY_TYPES = ["Urgent", "Normal", "Express", "Scheduled"];
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
  CUSTOMER SEARCH HOOK
========================= */
function useCustomerSearch() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/customers', {
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
  VEHICLE NEGOTIATION SEARCH HOOK
========================= */
function useVehicleNegotiationSearch() {
  const [vehicleNegotiations, setVehicleNegotiations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchVehicleNegotiations = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      
      const vnRes = await fetch('/api/vehicle-negotiation', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!vnRes.ok) {
        throw new Error(`HTTP error! status: ${vnRes.status}`);
      }
      
      const vnData = await vnRes.json();
      
      const pricingRes = await fetch('/api/pricing-panel?format=table', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const pricingData = await pricingRes.json();
      
      const usedVnns = new Set();
      if (pricingData.success && Array.isArray(pricingData.data)) {
        pricingData.data.forEach(item => {
          if (item.vnn && item.vnn !== '-' && item.vnn !== 'N/A') {
            usedVnns.add(item.vnn);
          }
        });
      }
      
      if (vnData.success && Array.isArray(vnData.data)) {
        const availableVNs = vnData.data.filter(vn => !usedVnns.has(vn.vnnNo));
        setVehicleNegotiations(availableVNs);
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

  useEffect(() => {
    searchVehicleNegotiations();
  }, []);

  return { 
    vehicleNegotiations, 
    loading, 
    error, 
    searchVehicleNegotiations, 
    getVehicleNegotiationById 
  };
}

/* =========================
  RATE MASTER SEARCH HOOK
========================= */
function useRateMasterSearch() {
  const [rateMasters, setRateMasters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchRateMasters = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/rate-master', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setRateMasters(data.data);
      } else {
        setRateMasters([]);
      }
    } catch (err) {
      console.error('Error fetching rate masters:', err);
      setRateMasters([]);
      setError('Failed to fetch rate masters');
    } finally {
      setLoading(false);
    }
  };

  return { rateMasters, loading, error, searchRateMasters };
}

/* =========================
  DEFAULT ROWS
========================= */
function defaultOrderRow() {
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
    taluka: "",
    talukaName: "",
    district: "",
    districtName: "",
    state: "",
    stateName: "",
    country: "",
    countryName: "",
    locationRate: "",      // Store location name only
    priceList: "",
    selectedRateMaster: null,
    weight: "",
    rate: "",
    totalAmount: 0,
  };
}

/* =========================
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

/* =========================
  SEARCHABLE DROPDOWN COMPONENT
========================= */
function SearchableDropdown({ 
  items, 
  selectedId, 
  onSelect, 
  placeholder = "Search...",
  required = false,
  displayField = 'name',
  codeField = 'code',
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
      const item = items.find(i => i._id === selectedId);
      setSelectedItem(item);
      if (item) {
        setSearchQuery(getDisplayValue(item));
      }
    } else {
      setSelectedItem(null);
      setSearchQuery("");
    }
  }, [items, selectedId]);

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
  LOCATION RATE DROPDOWN COMPONENT - Simple Dropdown without restrictions
========================= */
// Updated LocationRateDropdown Component - Fixed for Pricing Panel
function LocationRateDropdown({ 
  locations, 
  selectedName,  // Changed from selectedId to selectedName
  onSelect, 
  placeholder = "Select Location...",
  readOnly = false
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  // Find selected item by name instead of ID
  useEffect(() => {
    if (selectedName && locations) {
      const item = locations.find(l => l.name === selectedName);
      setSelectedItem(item);
      if (item) {
        setSearchQuery(item.name);
      }
    } else if (!selectedName) {
      setSelectedItem(null);
      setSearchQuery("");
    }
  }, [locations, selectedName]);

  const handleSelectItem = (item) => {
    if (readOnly) return;
    setSelectedItem(item);
    setSearchQuery(item.name);
    setShowDropdown(false);
    
    // Pass only the name to parent (since location only has name field)
    onSelect?.(item.name);
  };

  const handleInputFocus = () => {
    if (!readOnly && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
      setShowDropdown(true);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      if (dropdownRef.current && !dropdownRef.current.contains(document.activeElement)) {
        setShowDropdown(false);
      }
    }, 200);
  };

  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) return locations || [];
    return (locations || []).filter(loc => 
      loc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [locations, searchQuery]);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
          readOnly ? 'bg-slate-50 cursor-not-allowed' : 'bg-white cursor-pointer'
        }`}
        placeholder={placeholder}
        readOnly={readOnly}
        autoComplete="off"
      />
      <div className="absolute right-2 top-2 text-gray-400 pointer-events-none">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      {showDropdown && !readOnly && filteredLocations.length > 0 && (
        <div 
          ref={dropdownRef}
          className="fixed z-[9999] bg-white border border-slate-200 rounded-lg shadow-xl overflow-y-auto"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            maxHeight: '300px'
          }}
        >
          <div className="sticky top-0 bg-gray-50 px-3 py-2 text-xs font-semibold text-slate-600 border-b">
            Select Location
          </div>
          {filteredLocations.map((location) => (
            <div
              key={location._id}
              onMouseDown={() => handleSelectItem(location)}
              className={`px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors ${
                selectedItem?._id === location._id ? 'bg-sky-50' : ''
              }`}
            >
              <div className="font-medium text-slate-800 text-sm">
                {location.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================
  PRICE LIST DROPDOWN COMPONENT - With Proper ID Matching
========================= */
function PriceListDropdown({ 
  rateMasters, 
  selectedValue, 
  onSelect, 
  locationName,
  branchId,
  customerId,
  placeholder = "Select Price List...",
  readOnly = false
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  // Filter rate masters based on branch ID and customer ID (exact match)
  const filteredRateMasters = useMemo(() => {
    let filtered = rateMasters || [];
    
    // Filter by branch ID (exact match - required)
    if (branchId) {
      filtered = filtered.filter(rm => {
        const rmBranchId = rm.branchId?._id || rm.branchId;
        return String(rmBranchId) === String(branchId);
      });
    } else {
      return [];
    }
    
    // Filter by customer ID (exact match - required)
    if (customerId) {
      filtered = filtered.filter(rm => {
        const rmCustomerId = rm.customerId?._id || rm.customerId;
        return String(rmCustomerId) === String(customerId);
      });
    } else {
      return [];
    }
    
    // Filter by location (optional)
    if (locationName) {
      filtered = filtered.filter(rm => {
        const rmLocationId = rm.locationId?._id || rm.locationId;
        const rmLocationName = rm.locationName;
        return String(rmLocationId) === String(locationName) || 
               rmLocationName?.toLowerCase() === locationName.toLowerCase();
      });
    }
    
    return filtered;
  }, [rateMasters, locationName, branchId, customerId]);

  useEffect(() => {
    if (selectedValue) {
      const item = filteredRateMasters.find(rm => rm.title === selectedValue);
      setSelectedItem(item);
      if (item) {
        setSearchQuery(item.title);
      }
    } else {
      setSelectedItem(null);
      setSearchQuery("");
    }
  }, [filteredRateMasters, selectedValue]);

  const handleSelectItem = (item) => {
    if (readOnly) return;
    setSelectedItem(item);
    setSearchQuery(item.title);
    setShowDropdown(false);
    onSelect?.(item);
  };

  const handleInputFocus = () => {
    if (!readOnly && inputRef.current && filteredRateMasters.length > 0) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
      setShowDropdown(true);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      if (dropdownRef.current && !dropdownRef.current.contains(document.activeElement)) {
        setShowDropdown(false);
      }
    }, 200);
  };

  const searchedItems = useMemo(() => {
    if (!searchQuery.trim()) return filteredRateMasters;
    return filteredRateMasters.filter(rm => 
      rm.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [filteredRateMasters, searchQuery]);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
          readOnly ? 'bg-slate-50 cursor-not-allowed' : 'bg-white cursor-pointer'
        }`}
        placeholder={placeholder}
        readOnly={readOnly}
        autoComplete="off"
      />
      <div className="absolute right-2 top-2 text-gray-400 pointer-events-none">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      {showDropdown && !readOnly && filteredRateMasters.length > 0 && (
        <div 
          className="fixed z-[9999] bg-white border border-slate-200 rounded-lg shadow-xl overflow-y-auto"
          style={{
            position: 'fixed',
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            maxHeight: '300px'
          }}
        >
          <div className="sticky top-0 bg-gray-50 px-3 py-2 text-xs font-semibold text-slate-600 border-b">
            Select Price List
          </div>
          {searchedItems.length > 0 ? (
            searchedItems.map((rm) => (
              <div
                key={rm._id}
                onMouseDown={() => handleSelectItem(rm)}
                className={`px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors ${
                  selectedItem?._id === rm._id ? 'bg-sky-50' : ''
                }`}
              >
                <div className="font-medium text-slate-800 text-sm">
                  {rm.title}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Branch: {rm.branchName || 'N/A'} | Customer: {rm.customerName || 'N/A'} | Slabs: {rm.rateSlabs?.length || 0}
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 text-center text-sm text-slate-500">
              {searchQuery.trim() ? 
                `No price lists found for "${searchQuery}"` : 
                `No price lists available for this branch and customer`
              }
            </div>
          )}
        </div>
      )}
      
      {filteredRateMasters.length === 0 && !readOnly && branchId && customerId && (
        <div className="text-xs text-amber-600 mt-1">
          ⚠️ No rate master found for this Branch and Customer. Please create a rate master first.
        </div>
      )}
    </div>
  );
}

/* =========================
  VEHICLE NEGOTIATION DROPDOWN FOR HEADER
========================= */
function VehicleNegotiationHeaderDropdown({ 
  onSelect,
  placeholder = "Search vehicle negotiation..."
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [vnList, setVnList] = useState([]);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const vehicleNegotiationSearch = useVehicleNegotiationSearch();

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
  ORDERS TABLE COMPONENT
========================= */
function OrdersTable({ 
  rows, 
  onChange, 
  onRemove, 
  billingType, 
  selectedVehicleNegotiation,
  locations,
  rateMasters,
  headerBranch,
  headerCustomerId
}) {
  const columns = [
    { key: "orderNo", label: "Order No *", minWidth: "120px" },
    { key: "partyName", label: "Party Name", minWidth: "150px" },
    { key: "plantCode", label: "Plant Code", minWidth: "100px" },
    { key: "plantName", label: "Plant Name", minWidth: "120px", readOnly: true },
    { key: "plantCodeValue", label: "Plant Code Value", minWidth: "120px", readOnly: true },
    { key: "orderType", label: "Order Type", minWidth: "100px" },
    { key: "pinCode", label: "Pin Code", minWidth: "100px" },
    { key: "from", label: "From", minWidth: "120px" },
    { key: "to", label: "To", minWidth: "120px" },
    { key: "taluka", label: "Taluka", minWidth: "120px" },
    { key: "district", label: "District", minWidth: "100px" },
    { key: "state", label: "State", minWidth: "100px" },
    { key: "country", label: "Country", minWidth: "100px" },
    { key: "locationRate", label: "Location Rate", minWidth: "200px" },
    { key: "priceList", label: "Price List", minWidth: "220px" },
    { key: "weight", label: "Weight", type: "number", minWidth: "80px" },
    { key: "rate", label: "Rate", type: "number", minWidth: "80px" },
  ];

  const isReadOnlyMode = !!selectedVehicleNegotiation;

  const handleLocationRateSelect = (rowId, location) => {
    onChange(rowId, 'locationRate', location.name);
    onChange(rowId, 'locationRateId', location._id);
    onChange(rowId, 'priceList', '');
    onChange(rowId, 'rate', '');
    onChange(rowId, 'selectedRateMaster', null);
  };

  const handlePriceListSelect = (rowId, rateMaster) => {
    onChange(rowId, 'priceList', rateMaster.title);
    onChange(rowId, 'selectedRateMaster', rateMaster);
    
    const currentRow = rows.find(r => r._id === rowId);
    if (currentRow && currentRow.weight) {
      const applicableSlab = rateMaster.rateSlabs?.find(slab => 
        num(currentRow.weight) >= slab.fromQty && num(currentRow.weight) <= slab.toQty
      );
      if (applicableSlab) {
        onChange(rowId, 'rate', applicableSlab.rate);
      }
    }
  };

  const handleWeightChange = (rowId, weight) => {
    onChange(rowId, 'weight', weight);
    
    const currentRow = rows.find(r => r._id === rowId);
    if (currentRow && currentRow.selectedRateMaster) {
      const applicableSlab = currentRow.selectedRateMaster.rateSlabs?.find(slab => 
        num(weight) >= slab.fromQty && num(weight) <= slab.toQty
      );
      if (applicableSlab) {
        onChange(rowId, 'rate', applicableSlab.rate);
      }
    }
  };

  return (
    <div className="overflow-auto rounded-xl border border-yellow-300 max-h-[500px]">
      <table className="min-w-max w-full text-sm">
        <thead className="sticky top-0 bg-yellow-400 z-10">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center"
                style={{ minWidth: col.minWidth }}
              >
                {col.label}
                {col.readOnly && <span className="ml-1 text-xs text-blue-600">*Auto</span>}
              </th>
            ))}
            <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">
              Total Amount
            </th>
            {billingType === "Multi - Order" && !isReadOnlyMode && (
              <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">
                Actions
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => {
            const totalAmount = num(row.weight) * num(row.rate);
            const isFromVehicleNegotiation = !!row.vehicleNegotiationId || isReadOnlyMode;
            const currentCustomerId = row.customerId || headerCustomerId;
            
            return (
              <tr key={row._id} className="hover:bg-yellow-50 even:bg-slate-50">
                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    value={row.orderNo || ""}
                    onChange={(e) => onChange(row._id, 'orderNo', e.target.value)}
                    className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                      isFromVehicleNegotiation ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    placeholder="Enter Order No"
                    readOnly={isFromVehicleNegotiation}
                  />
                </td>

                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    value={row.partyName || ""}
                    onChange={(e) => onChange(row._id, 'partyName', e.target.value)}
                    className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                      isFromVehicleNegotiation ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    placeholder="Party Name"
                    readOnly={isFromVehicleNegotiation}
                  />
                </td>

                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    value={row.plantCode || ""}
                    onChange={(e) => onChange(row._id, 'plantCode', e.target.value)}
                    className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                      isFromVehicleNegotiation ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    placeholder="Plant Code"
                    readOnly={isFromVehicleNegotiation}
                  />
                </td>

                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    type="text"
                    value={row.plantName || ""}
                    readOnly
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm outline-none"
                    placeholder="Auto-filled"
                  />
                </td>

                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    type="text"
                    value={row.plantCodeValue || ""}
                    readOnly
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm outline-none"
                    placeholder="Auto-filled"
                  />
                </td>

                <td className="border border-yellow-300 px-2 py-2">
                  <select
                    value={row.orderType || ""}
                    onChange={(e) => onChange(row._id, 'orderType', e.target.value)}
                    className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                      isFromVehicleNegotiation ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    disabled={isFromVehicleNegotiation}
                  >
                    <option value="">Select</option>
                    {ORDER_TYPES.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    type="text"
                    value={row.pinCode || ""}
                    onChange={(e) => onChange(row._id, 'pinCode', e.target.value)}
                    className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                      isFromVehicleNegotiation ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    placeholder="Pin Code"
                    readOnly={isFromVehicleNegotiation}
                  />
                </td>

                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    value={row.fromName || ""}
                    onChange={(e) => onChange(row._id, 'fromName', e.target.value)}
                    className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                      isFromVehicleNegotiation ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    placeholder="From"
                    readOnly={isFromVehicleNegotiation}
                  />
                </td>

                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    value={row.toName || ""}
                    onChange={(e) => onChange(row._id, 'toName', e.target.value)}
                    className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                      isFromVehicleNegotiation ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    placeholder="To"
                    readOnly={isFromVehicleNegotiation}
                  />
                </td>

                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    value={row.talukaName || row.taluka || ""}
                    onChange={(e) => onChange(row._id, 'talukaName', e.target.value)}
                    className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                      isFromVehicleNegotiation ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    placeholder="Taluka"
                    readOnly={isFromVehicleNegotiation}
                  />
                </td>

                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    value={row.districtName || ""}
                    onChange={(e) => onChange(row._id, 'districtName', e.target.value)}
                    className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                      isFromVehicleNegotiation ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    placeholder="District"
                    readOnly={isFromVehicleNegotiation}
                  />
                </td>

                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    value={row.stateName || ""}
                    onChange={(e) => onChange(row._id, 'stateName', e.target.value)}
                    className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                      isFromVehicleNegotiation ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    placeholder="State"
                    readOnly={isFromVehicleNegotiation}
                  />
                </td>

                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    value={row.countryName || ""}
                    onChange={(e) => onChange(row._id, 'countryName', e.target.value)}
                    className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                      isFromVehicleNegotiation ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    placeholder="Country"
                    readOnly={isFromVehicleNegotiation}
                  />
                </td>

               // In OrdersTable component, update the location rate cell:
<td className="border border-yellow-300 px-2 py-2">
  <LocationRateDropdown
    locations={locations}
    selectedName={row.locationRate}  // Pass name instead of ID
    onSelect={(locationName) => {
      // Store only the location name (since backend only has name field)
      onChange(row._id, 'locationRate', locationName);
      // Reset price list and rate when location changes
      onChange(row._id, 'priceList', '');
      onChange(row._id, 'rate', '');
      onChange(row._id, 'selectedRateMaster', null);
    }}
    readOnly={false}
    placeholder="Select Location..."
  />
</td>

                <td className="border border-yellow-300 px-2 py-2">
                  <PriceListDropdown
                    rateMasters={rateMasters}
                    selectedValue={row.priceList}
                    onSelect={(rateMaster) => handlePriceListSelect(row._id, rateMaster)}
                    locationName={row.locationRate}
                    branchId={headerBranch}
                    customerId={currentCustomerId}
                    placeholder="Select Price List..."
                    readOnly={false}
                  />
                </td>

                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    type="number"
                    value={row.weight || ""}
                    onChange={(e) => handleWeightChange(row._id, e.target.value)}
                    className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                      isFromVehicleNegotiation ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    placeholder="Weight"
                    readOnly={isFromVehicleNegotiation}
                  />
                </td>

                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    type="number"
                    value={row.rate || ""}
                    onChange={(e) => onChange(row._id, 'rate', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    placeholder="Enter Rate"
                  />
                </td>

                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    type="number"
                    value={totalAmount}
                    readOnly
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm outline-none"
                  />
                </td>

                {billingType === "Multi - Order" && !isReadOnlyMode && (
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
  MAIN CREATE PAGE
========================= */
export default function PricingPanelPage() {
  const router = useRouter();
  
  const [branches, setBranches] = useState([]);
  const [locations, setLocations] = useState([]);
  const [countries, setCountries] = useState([]);
  const [plants, setPlants] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [pricingSerialNo, setPricingSerialNo] = useState("");

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const customerSearch = useCustomerSearch();

  const [selectedVehicleNegotiation, setSelectedVehicleNegotiation] = useState(null);
  const vehicleNegotiationSearch = useVehicleNegotiationSearch();

  const rateMasterSearch = useRateMasterSearch();

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

  const [billing, setBilling] = useState({
    billingType: "Multi - Order",
    loadingPoints: "",
    dropPoints: "",
    collectionCharges: 0,
    cancellationCharges: "Nil",
    loadingCharges: "Nil",
    otherCharges: 0,
  });

  const [orders, setOrders] = useState([
    defaultOrderRow(),
    defaultOrderRow()
  ]);

  const [rateApproval, setRateApproval] = useState({
    approvalType: "Contract Rates",
    uploadFile: null,
    uploadFileName: "",
    approvalStatus: "Pending",
  });

  useEffect(() => {
    fetchBranches();
    fetchLocations();
    fetchCountries();
    fetchPlants();
    customerSearch.searchCustomers();
    rateMasterSearch.searchRateMasters();
  }, []);

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

  const fetchLocations = async () => {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/locations', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    
    if (data.success && Array.isArray(data.data)) {
      // Locations only have name field from backend
      setLocations(data.data);
      console.log("Loaded locations:", data.data.length);
    } else {
      setLocations([]);
    }
  } catch (error) {
    console.error('Error fetching locations:', error.message);
    setLocations([]);
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

  useEffect(() => {
    if (orders.length === 1) {
      setBilling(prev => ({ ...prev, billingType: "Single - Order" }));
    } else if (orders.length > 1) {
      setBilling(prev => ({ ...prev, billingType: "Multi - Order" }));
    }
  }, [orders.length]);

  const handleSelectVehicleNegotiation = async (fullVN) => {
    setSelectedVehicleNegotiation(fullVN);
    
    setHeader(prev => ({
      ...prev,
      branch: fullVN.branch?._id || fullVN.branch || "",
      branchName: fullVN.branchName || "",
      branchCode: fullVN.branchCode || "",
      delivery: fullVN.delivery || "Normal",
      date: fullVN.date ? new Date(fullVN.date).toISOString().split('T')[0] : prev.date,
      partyName: fullVN.customerName || fullVN.partyName || prev.partyName,
      customerId: fullVN.customerId?._id || fullVN.customerId || prev.customerId
    }));

    setBilling(prev => ({
      ...prev,
      collectionCharges: fullVN.collectionCharges || 0,
      cancellationCharges: fullVN.cancellationCharges || "Nil",
      loadingCharges: fullVN.loadingCharges || "Nil",
      otherCharges: fullVN.otherCharges || 0,
      loadingPoints: fullVN.loadingPoints || prev.loadingPoints || "",
      dropPoints: fullVN.dropPoints || prev.dropPoints || ""
    }));

    if (fullVN.orders && fullVN.orders.length > 0) {
      const newOrders = fullVN.orders.map(order => ({
        _id: uid(),
        orderNo: order.orderNo,
        vehicleNegotiationId: fullVN._id,
        vnnNumber: fullVN.vnnNo,
        partyName: order.partyName || fullVN.customerName || "",
        customerId: order.customerId?._id || order.customerId || fullVN.customerId?._id || fullVN.customerId,
        customerCode: order.customerCode || "",
        contactPerson: order.contactPerson || fullVN.contactPerson || "",
        plantCode: order.plantCode?._id || order.plantCode,
        plantName: order.plantName || "",
        plantCodeValue: order.plantCodeValue || "",
        orderType: order.orderType || "Sales",
        pinCode: order.pinCode || "",
        from: order.from,
        fromName: order.fromName || "",
        to: order.to,
        toName: order.toName || "",
        taluka: order.taluka || "",
        talukaName: order.talukaName || order.taluka || "",
        district: order.district,
        districtName: order.districtName || "",
        state: order.state,
        stateName: order.stateName || "",
        country: order.country,
        countryName: order.countryName || "",
        locationRate: "",
        locationRateId: "",
        locationRateTitle: "",
        priceList: "",
        selectedRateMaster: null,
        weight: order.weight || "",
        rate: "",
        totalAmount: 0
      }));

      if (billing.billingType === "Single - Order") {
        setOrders([newOrders[0]]);
      } else {
        setOrders(newOrders);
      }
    }
  };

  const updateOrder = (id, key, value) => {
    setOrders((prev) => prev.map((r) => (r._id === id ? { ...r, [key]: value } : r)));
  };

  const addOrder = () => {
    setOrders((prev) => [...prev, defaultOrderRow()]);
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
      setOrders([orders[0] || defaultOrderRow()]);
    } else {
      if (orders.length < 2) {
        setOrders([...orders, defaultOrderRow()]);
      }
    }
  };

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

  const handleFileSelect = (e) => {
    alert("Rate Approval section is read-only");
  };

  const handleSaveAll = async () => {
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
       // In the orders mapping
orders: orders.map(order => ({
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
  taluka: order.taluka,
  talukaName: order.talukaName,
  district: order.district,
  districtName: order.districtName,
  state: order.state,
  stateName: order.stateName,
  country: order.country,
  countryName: order.countryName,
  locationRate: order.locationRate,  // Store only the name
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
          uploadFileName: rateApproval.uploadFileName
        },
        branches: branches,
        plants: plants,
        countries: countries,
        locations: locations
      };

      const res = await fetch('/api/pricing-panel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || `Failed to save pricing panel: ${res.status}`);
      }

      setSaveSuccess(true);
      setPricingSerialNo(data.data?.pricingSerialNo || "Generated");
      
      alert(`✅ Pricing panel saved successfully!\nPricing Serial No: ${data.data?.pricingSerialNo}`);
      
      resetForm();
      
    } catch (error) {
      console.error('Error saving pricing panel:', error);
      setSaveError(error.message || 'Failed to save pricing panel');
      alert(`❌ Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setHeader({
      pricingSerialNo: "",
      branch: "",
      branchName: "",
      branchCode: "",
      delivery: "Normal",
      date: new Date().toISOString().split('T')[0],
      partyName: "",
      customerId: ""
    });
    
    setBilling({
      billingType: "Multi - Order",
      loadingPoints: "",
      dropPoints: "",
      collectionCharges: 0,
      cancellationCharges: "Nil",
      loadingCharges: "Nil",
      otherCharges: 0,
    });
    
    setOrders([defaultOrderRow(), defaultOrderRow()]);
    
    setRateApproval({
      approvalType: "Contract Rates",
      uploadFile: null,
      uploadFileName: "",
      approvalStatus: "Pending",
    });
    
    setSelectedCustomer(null);
    setSelectedVehicleNegotiation(null);
    
    setSaveSuccess(false);
    setSaveError(null);
    setPricingSerialNo("");
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const isHeaderReadOnly = !!selectedVehicleNegotiation;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-full px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-lg font-extrabold text-slate-900">
              Pricing Panel
            </div>
            {saveSuccess && (
              <div className="text-sm text-green-600 font-medium">
                ✅ Pricing panel saved successfully! PSN: {pricingSerialNo}
              </div>
            )}
            {saveError && (
              <div className="text-sm text-red-600 font-medium">
                ❌ {saveError}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className={`rounded-xl px-5 py-2 text-sm font-bold text-white transition ${
                saving
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-yellow-600 hover:bg-yellow-700'
              }`}
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : 'Save All'}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-full p-4 space-y-4">
        <Card title="Pricing Panel - Part -1">
          <div className="grid grid-cols-12 gap-3 mb-4">
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Pricing Serial No</label>
              <div className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                {pricingSerialNo || "Auto-generated on save"}
              </div>
            </div>

            <div className="col-span-12 md:col-span-3 relative">
              <label className="text-xs font-bold text-slate-600">Search Vehicle Negotiation</label>
              <VehicleNegotiationHeaderDropdown
                onSelect={handleSelectVehicleNegotiation}
                placeholder="Search by VNN..."
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
                readOnly={isHeaderReadOnly}
              />
            </div>

            <Select
              col="col-span-12 md:col-span-3"
              label="Delivery"
              value={header.delivery}
              onChange={(v) => setHeader((p) => ({ ...p, delivery: v }))}
              options={DELIVERY_TYPES}
              readOnly={isHeaderReadOnly}
            />

            <Input
              type="date"
              col="col-span-12 md:col-span-3"
              label="Date"
              value={header.date}
              onChange={(v) => setHeader((p) => ({ ...p, date: v }))}
              readOnly={isHeaderReadOnly}
            />
            
            <div className="col-span-12 md:col-span-3 relative">
              <label className="text-xs font-bold text-slate-600">Party Name</label>
              <input
                type="text"
                value={header.partyName}
                readOnly={true}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none cursor-not-allowed"
                placeholder="Auto-filled from Vehicle Negotiation"
              />
            </div>
          </div>

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
                            disabled={col.key !== "billingType" && selectedVehicleNegotiation}
                            className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                              (col.key !== "billingType" && selectedVehicleNegotiation) ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
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
                            readOnly={selectedVehicleNegotiation}
                            className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                              selectedVehicleNegotiation ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
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
          </div>

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
              selectedVehicleNegotiation={selectedVehicleNegotiation}
              locations={locations}
              rateMasters={rateMasterSearch.rateMasters}
              headerBranch={header.branch}
              headerCustomerId={header.customerId}
            />
          </div>

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
                  ✅ File: {rateApproval.uploadFileName}
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