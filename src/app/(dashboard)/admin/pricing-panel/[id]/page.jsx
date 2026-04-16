//"use client";
//
//import { useMemo, useState, useEffect, useRef, useCallback } from "react";
//import { useRouter, useParams } from "next/navigation";
//
///* =========================
//  CONSTANTS (Same as Create Page)
//========================= */
//const ORDER_TYPES = ["Sales", "STO Order", "Export", "Import"];
//const BILLING_TYPES = ["Single - Order", "Multi - Order"];
//const DELIVERY_TYPES = ["Urgent", "Normal", "Express", "Scheduled"];
//const PRICE_LISTS = ["INDORAMA GDM MULTI P", "SQM GDM MULTI P", "Nil Price list"];
//const APPROVAL_STATUS = ["Pending", "Approved", "Rejected", "Completed"];
//const RATE_APPROVAL_TYPES = ["Contract Rates", "Mail Approval Rate"];
//
//function uid() {
//  return Math.random().toString(36).slice(2, 10);
//}
//
//function num(v) {
//  const n = Number(v);
//  return Number.isFinite(n) ? n : 0;
//}
//
///* =========================
//  CUSTOMER SEARCH HOOK
//========================= */
//function useCustomerSearch() {
//  const [customers, setCustomers] = useState([]);
//  const [loading, setLoading] = useState(false);
//  const [error, setError] = useState(null);
//
//  const searchCustomers = async () => {
//    setLoading(true);
//    setError(null);
//    try {
//      const token = localStorage.getItem('token');
//      const res = await fetch('/api/customers', {
//        headers: { Authorization: `Bearer ${token}` },
//      });
//      const data = await res.json();
//      if (data.success && Array.isArray(data.data)) {
//        setCustomers(data.data);
//      } else {
//        setCustomers([]);
//        setError(data.message || 'No customers found');
//      }
//    } catch (err) {
//      console.error('Error fetching customers:', err);
//      setCustomers([]);
//      setError('Failed to fetch customers');
//    } finally {
//      setLoading(false);
//    }
//  };
//
//  return { customers, loading, error, searchCustomers };
//}
//
///* =========================
//  VEHICLE NEGOTIATION SEARCH HOOK - FOR EDIT PAGE
//========================= */
///* =========================
//  VEHICLE NEGOTIATION SEARCH HOOK - FIXED
//========================= */
//function useVehicleNegotiationSearch(currentVnn) {
//  const [vehicleNegotiations, setVehicleNegotiations] = useState([]);
//  const [loading, setLoading] = useState(false);
//  const [error, setError] = useState(null);
//
//  const searchVehicleNegotiations = async () => {
//    setLoading(true);
//    setError(null);
//    try {
//      const token = localStorage.getItem('token');
//      
//      // Fetch all vehicle negotiations
//      const vnRes = await fetch('/api/vehicle-negotiation', {
//        headers: { Authorization: `Bearer ${token}` },
//      });
//      
//      if (!vnRes.ok) {
//        throw new Error(`HTTP error! status: ${vnRes.status}`);
//      }
//      
//      const vnData = await vnRes.json();
//      console.log("Vehicle Negotiations API response:", vnData);
//      
//      // Fetch existing pricing panels to check used VNNs
//      const pricingRes = await fetch('/api/pricing-panel?format=table', {
//        headers: { Authorization: `Bearer ${token}` },
//      });
//      
//      const pricingData = await pricingRes.json();
//      
//      const usedVnns = new Set();
//      if (pricingData.success && Array.isArray(pricingData.data)) {
//        pricingData.data.forEach(item => {
//          if (item.vnn && item.vnn !== '-' && item.vnn !== 'N/A') {
//            if (item.vnn !== currentVnn) {
//              usedVnns.add(item.vnn);
//            }
//          }
//        });
//      }
//      
//      if (vnData.success && Array.isArray(vnData.data)) {
//        // Filter out used VNNs, but keep current one
//        const availableVNs = vnData.data.filter(vn => 
//          !usedVnns.has(vn.vnnNo) || vn.vnnNo === currentVnn
//        );
//        setVehicleNegotiations(availableVNs);
//        console.log(`📊 Found ${availableVNs.length} available VNNs out of ${vnData.data.length} total`);
//      } else {
//        setVehicleNegotiations([]);
//        setError(vnData.message || 'No vehicle negotiations found');
//      }
//    } catch (err) {
//      console.error('Error fetching vehicle negotiations:', err);
//      setVehicleNegotiations([]);
//      setError('Failed to fetch vehicle negotiations');
//    } finally {
//      setLoading(false);
//    }
//  };
//
//  const getVehicleNegotiationById = async (id) => {
//    setLoading(true);
//    setError(null);
//    try {
//      const token = localStorage.getItem('token');
//      const res = await fetch(`/api/vehicle-negotiation?id=${id}`, {
//        headers: { Authorization: `Bearer ${token}` },
//      });
//      
//      if (!res.ok) {
//        throw new Error(`HTTP error! status: ${res.status}`);
//      }
//      
//      const data = await res.json();
//      
//      if (data.success && data.data) {
//        return data.data;
//      } else {
//        setError(data.message || 'Vehicle negotiation not found');
//        return null;
//      }
//    } catch (err) {
//      console.error('Error fetching vehicle negotiation:', err);
//      setError('Failed to fetch vehicle negotiation');
//      return null;
//    } finally {
//      setLoading(false);
//    }
//  };
//
//  // Run search on mount and when currentVnn changes
//  useEffect(() => {
//    searchVehicleNegotiations();
//  }, [currentVnn]);
//
//  return { 
//    vehicleNegotiations, 
//    loading, 
//    error, 
//    searchVehicleNegotiations, 
//    getVehicleNegotiationById 
//  };
//}
//
///* =========================
//  RATE MASTER SEARCH HOOK
//========================= */
//function useRateMasterSearch() {
//  const [rateMasters, setRateMasters] = useState([]);
//  const [loading, setLoading] = useState(false);
//  const [error, setError] = useState(null);
//
//  const searchRateMasters = async () => {
//    setLoading(true);
//    setError(null);
//    try {
//      const token = localStorage.getItem('token');
//      const res = await fetch('/api/rate-master', {
//        headers: { Authorization: `Bearer ${token}` },
//      });
//      
//      const data = await res.json();
//      if (data.success && Array.isArray(data.data)) {
//        setRateMasters(data.data);
//      } else {
//        setRateMasters([]);
//      }
//    } catch (err) {
//      console.error('Error fetching rate masters:', err);
//      setRateMasters([]);
//      setError('Failed to fetch rate masters');
//    } finally {
//      setLoading(false);
//    }
//  };
//
//  return { rateMasters, loading, error, searchRateMasters };
//}
//
///* =========================
//  LOCATION DATA HOOK
//========================= */
//function useLocationData() {
//  const [states, setStates] = useState([]);
//  const [districts, setDistricts] = useState({});
//  const [talukas, setTalukas] = useState({});
//  const [locations, setLocations] = useState([]);
//  const [loading, setLoading] = useState(false);
//
//  const fetchStates = async () => {
//    try {
//      const token = localStorage.getItem('token');
//      const res = await fetch('/api/states', {
//        headers: { Authorization: `Bearer ${token}` },
//      });
//      const data = await res.json();
//      if (data.success && Array.isArray(data.data)) {
//        setStates(data.data);
//        return data.data;
//      }
//      return [];
//    } catch (error) {
//      console.error('Error fetching states:', error);
//      return [];
//    }
//  };
//
//  const fetchLocations = async () => {
//    try {
//      const token = localStorage.getItem('token');
//      const res = await fetch('/api/locations', {
//        headers: { Authorization: `Bearer ${token}` },
//      });
//      const data = await res.json();
//      if (data.success && Array.isArray(data.data)) {
//        setLocations(data.data);
//        console.log("Loaded locations:", data.data.length);
//      } else {
//        setLocations([]);
//      }
//    } catch (error) {
//      console.error('Error fetching locations:', error);
//      setLocations([]);
//    }
//  };
//
//  const fetchDistrictsByState = async (stateId) => {
//    if (!stateId) return [];
//    try {
//      const token = localStorage.getItem('token');
//      const res = await fetch(`/api/districts?stateId=${stateId}`, {
//        headers: { Authorization: `Bearer ${token}` },
//      });
//      const data = await res.json();
//      if (data.success && Array.isArray(data.data)) {
//        setDistricts(prev => ({ ...prev, [stateId]: data.data }));
//        return data.data;
//      }
//      return [];
//    } catch (error) {
//      console.error('Error fetching districts:', error);
//      return [];
//    }
//  };
//
//  const fetchTalukasByDistrict = async (districtId) => {
//    if (!districtId) return [];
//    try {
//      const token = localStorage.getItem('token');
//      const res = await fetch(`/api/talukas?districtId=${districtId}`, {
//        headers: { Authorization: `Bearer ${token}` },
//      });
//      const data = await res.json();
//      if (data.success && Array.isArray(data.data)) {
//        setTalukas(prev => ({ ...prev, [districtId]: data.data }));
//        return data.data;
//      }
//      return [];
//    } catch (error) {
//      console.error('Error fetching talukas:', error);
//      return [];
//    }
//  };
//
//  return {
//    states,
//    districts,
//    talukas,
//    locations,
//    loading,
//    fetchStates,
//    fetchLocations,
//    fetchDistrictsByState,
//    fetchTalukasByDistrict,
//  };
//}
//
///* =========================
//  DEFAULT ROWS - WITH TALUKA
//========================= */
//function defaultOrderRow(index = 1) {
//  return {
//    _id: uid(),
//    orderNo: "",
//    vehicleNegotiationId: "",
//    vnnNumber: "",
//    partyName: "",
//    customerId: "",
//    customerCode: "",
//    contactPerson: "",
//    plantCode: "",
//    plantName: "",
//    plantCodeValue: "",
//    orderType: "Sales",
//    pinCode: "",
//    from: "",
//    fromName: "",
//    to: "",
//    toName: "",
//    taluka: "",
//    talukaName: "",
//    talukaId: "",
//    district: "",
//    districtName: "",
//    districtId: "",
//    state: "",
//    stateName: "",
//    stateId: "",
//    country: "",
//    countryName: "",
//    locationRate: "",
//    priceList: "",
//    selectedRateMaster: null,
//    weight: "",
//    rate: "",
//    totalAmount: 0,
//  };
//}
//
///* =========================
//  UI COMPONENTS
//========================= */
//function Card({ title, right, children }) {
//  return (
//    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm mb-4">
//      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
//        <div className="text-sm font-extrabold text-slate-900">{title}</div>
//        {right || null}
//      </div>
//      <div className="p-4">{children}</div>
//    </div>
//  );
//}
//
//function Input({ label, value, onChange, col = "", type = "text", readOnly = false, placeholder = "" }) {
//  return (
//    <div className={col}>
//      <label className="text-xs font-bold text-slate-600">{label}</label>
//      <input
//        type={type}
//        value={value || ""}
//        onChange={(e) => onChange?.(e.target.value)}
//        readOnly={readOnly}
//        placeholder={placeholder}
//        className={`mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
//          readOnly ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
//        }`}
//      />
//    </div>
//  );
//}
//
//function Select({ label, value, onChange, options = [], col = "", readOnly = false }) {
//  return (
//    <div className={col}>
//      <label className="text-xs font-bold text-slate-600">{label}</label>
//      <select
//        value={value || ""}
//        onChange={(e) => onChange?.(e.target.value)}
//        disabled={readOnly}
//        className={`mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
//          readOnly ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
//        }`}
//      >
//        <option value="">Select {label}</option>
//        {options.map((o) => (
//          <option key={o} value={o}>
//            {o}
//          </option>
//        ))}
//      </select>
//    </div>
//  );
//}
//
///* =========================
//  SEARCHABLE DROPDOWN COMPONENTS
//========================= */
//function SearchableDropdown({ 
//  items, 
//  selectedId, 
//  onSelect, 
//  placeholder = "Search...",
//  required = false,
//  displayField = 'name',
//  codeField = 'code',
//  disabled = false,
//  readOnly = false
//}) {
//  const [searchQuery, setSearchQuery] = useState("");
//  const [filteredItems, setFilteredItems] = useState([]);
//  const [showDropdown, setShowDropdown] = useState(false);
//  const [selectedItem, setSelectedItem] = useState(null);
//  const dropdownRef = useRef(null);
//
//  useEffect(() => {
//    setFilteredItems(items);
//    if (selectedId) {
//      const item = items.find(i => i._id === selectedId || i.code === selectedId);
//      setSelectedItem(item);
//      if (item) {
//        setSearchQuery(getDisplayValue(item));
//      }
//    } else {
//      setSelectedItem(null);
//      setSearchQuery("");
//    }
//  }, [items, selectedId, displayField]);
//
//  const getDisplayValue = (item) => {
//    if (!item) return "";
//    const display = item[displayField] || item.customerName || "";
//    const code = item[codeField] ? `(${item[codeField]})` : "";
//    return `${display} ${code}`.trim();
//  };
//
//  const handleSearch = (query) => {
//    if (readOnly) return;
//    setSearchQuery(query);
//    
//    if (!query.trim()) {
//      setFilteredItems(items);
//    } else {
//      const filtered = items.filter(item =>
//        (item[displayField] && item[displayField].toLowerCase().includes(query.toLowerCase())) ||
//        (item[codeField] && item[codeField].toLowerCase().includes(query.toLowerCase())) ||
//        (item.customerName && item.customerName.toLowerCase().includes(query.toLowerCase()))
//      );
//      setFilteredItems(filtered);
//    }
//    
//    if (selectedItem && query !== getDisplayValue(selectedItem)) {
//      setSelectedItem(null);
//      onSelect?.(null);
//    }
//  };
//
//  const handleSelectItem = (item) => {
//    if (readOnly) return;
//    setSelectedItem(item);
//    setSearchQuery(getDisplayValue(item));
//    setShowDropdown(false);
//    onSelect?.(item);
//  };
//
//  return (
//    <div className="relative" ref={dropdownRef}>
//      <input
//        type="text"
//        value={searchQuery}
//        onChange={(e) => handleSearch(e.target.value)}
//        onFocus={() => !readOnly && setShowDropdown(true)}
//        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
//        className={`mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
//          readOnly ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
//        }`}
//        placeholder={placeholder}
//        required={required}
//        disabled={disabled || readOnly}
//        autoComplete="off"
//        readOnly={readOnly}
//      />
//      
//      {showDropdown && !readOnly && (
//        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
//          {filteredItems.length > 0 ? (
//            filteredItems.map((item) => (
//              <div
//                key={item._id}
//                onMouseDown={() => handleSelectItem(item)}
//                className={`p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors ${
//                  selectedItem?._id === item._id ? 'bg-sky-50' : ''
//                }`}
//              >
//                <div className="font-medium text-slate-800">
//                  {item[displayField] || item.customerName}
//                </div>
//                {item[codeField] && (
//                  <div className="text-xs text-slate-500 mt-1">
//                    Code: {item[codeField]}
//                  </div>
//                )}
//              </div>
//            ))
//          ) : (
//            <div className="p-3 text-center text-sm text-slate-500">
//              {searchQuery.trim() ? 
//                `No items found for "${searchQuery}"` : 
//                "No items available"
//              }
//            </div>
//          )}
//        </div>
//      )}
//    </div>
//  );
//}
//
///* =========================
//  VEHICLE NEGOTIATION DROPDOWN - SHOWS CURRENT VNN DATA
//========================= */
//function VehicleNegotiationHeaderDropdown({ 
//  onSelect,
//  placeholder = "Search vehicle negotiation...",
//  currentVnn = null,
//  readOnly = false
//}) {
//  const [searchQuery, setSearchQuery] = useState("");
//  const [showDropdown, setShowDropdown] = useState(false);
//  const [vnList, setVnList] = useState([]);
//  const [loading, setLoading] = useState(false);
//  const inputRef = useRef(null);
//  const dropdownRef = useRef(null);
//
//  // Fetch vehicle negotiations
//  const fetchVehicleNegotiations = async () => {
//    setLoading(true);
//    try {
//      const token = localStorage.getItem('token');
//      const res = await fetch('/api/vehicle-negotiation', {
//        headers: { Authorization: `Bearer ${token}` },
//      });
//      const data = await res.json();
//      console.log("VN API Response:", data);
//      
//      if (data.success && Array.isArray(data.data)) {
//        // Get used VNNs from pricing panels
//        const pricingRes = await fetch('/api/pricing-panel?format=table', {
//          headers: { Authorization: `Bearer ${token}` },
//        });
//        const pricingData = await pricingRes.json();
//        
//        const usedVnns = new Set();
//        if (pricingData.success && Array.isArray(pricingData.data)) {
//          pricingData.data.forEach(item => {
//            if (item.vnn && item.vnn !== '-' && item.vnn !== 'N/A') {
//              if (item.vnn !== currentVnn) {
//                usedVnns.add(item.vnn);
//              }
//            }
//          });
//        }
//        
//        // Filter available VNs, but ALWAYS include current VNN
//        const availableVNs = data.data.filter(vn => 
//          !usedVnns.has(vn.vnnNo) || vn.vnnNo === currentVnn
//        );
//        setVnList(availableVNs);
//        console.log("Available VNs:", availableVNs);
//        console.log("Current VNN:", currentVnn);
//      } else {
//        setVnList([]);
//      }
//    } catch (err) {
//      console.error('Error:', err);
//      setVnList([]);
//    } finally {
//      setLoading(false);
//    }
//  };
//
//  useEffect(() => {
//    fetchVehicleNegotiations();
//  }, [currentVnn]);
//
//  // IMPORTANT: Set search query to current VNN when available
//  useEffect(() => {
//    if (currentVnn && currentVnn !== '-' && currentVnn !== 'N/A') {
//      // Find the VN object to get full details
//      const currentVN = vnList.find(vn => vn.vnnNo === currentVnn);
//      if (currentVN) {
//        setSearchQuery(`${currentVN.vnnNo} - ${currentVN.customerName || ''}`);
//      } else {
//        setSearchQuery(currentVnn);
//      }
//    } else if (!currentVnn) {
//      setSearchQuery("");
//    }
//  }, [currentVnn, vnList]);
//
//  const handleSelectVN = async (vn) => {
//    if (readOnly) return;
//    console.log("Selected VN:", vn);
//    setSearchQuery(`${vn.vnnNo} - ${vn.customerName || ''}`);
//    setShowDropdown(false);
//    
//    try {
//      const token = localStorage.getItem('token');
//      const res = await fetch(`/api/vehicle-negotiation?id=${vn._id}`, {
//        headers: { Authorization: `Bearer ${token}` },
//      });
//      
//      if (res.ok) {
//        const data = await res.json();
//        if (data.success && data.data) {
//          onSelect(data.data);
//        }
//      }
//    } catch (error) {
//      console.error('Error:', error);
//    }
//  };
//
//  // Filter based on search
//  const filteredList = useMemo(() => {
//    if (!searchQuery.trim()) return vnList;
//    return vnList.filter(vn =>
//      vn.vnnNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//      vn.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//      vn.branchName?.toLowerCase().includes(searchQuery.toLowerCase())
//    );
//  }, [vnList, searchQuery]);
//
//  // Close dropdown when clicking outside
//  useEffect(() => {
//    const handleClickOutside = (event) => {
//      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
//          inputRef.current && !inputRef.current.contains(event.target)) {
//        setShowDropdown(false);
//      }
//    };
//    document.addEventListener('mousedown', handleClickOutside);
//    return () => document.removeEventListener('mousedown', handleClickOutside);
//  }, []);
//
//  return (
//    <div className="relative w-full">
//      <input
//        ref={inputRef}
//        type="text"
//        value={searchQuery}
//        onChange={(e) => {
//          setSearchQuery(e.target.value);
//          setShowDropdown(true);
//        }}
//        onClick={() => setShowDropdown(true)}
//        onFocus={() => setShowDropdown(true)}
//        readOnly={readOnly}
//        className={`w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
//          readOnly ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
//        }`}
//        placeholder={placeholder}
//        autoComplete="off"
//      />
//      
//      {showDropdown && !readOnly && (
//        <div 
//          ref={dropdownRef}
//          className="absolute z-[9999] w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-y-auto"
//          style={{ maxHeight: '300px' }}
//        >
//          {loading ? (
//            <div className="p-4 text-center">
//              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sky-500 mx-auto"></div>
//              <p className="text-xs text-slate-500 mt-2">Loading...</p>
//            </div>
//          ) : filteredList.length > 0 ? (
//            filteredList.map((vn) => (
//              <div
//                key={vn._id}
//                onClick={() => handleSelectVN(vn)}
//                className={`p-3 hover:bg-yellow-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors ${
//                  vn.vnnNo === currentVnn ? 'bg-blue-50' : ''
//                }`}
//              >
//                <div className="font-semibold text-slate-800">
//                  {vn.vnnNo}
//                  {vn.vnnNo === currentVnn && (
//                    <span className="ml-2 text-xs text-green-600 font-medium">(Current)</span>
//                  )}
//                </div>
//                <div className="text-xs text-slate-500 mt-1">
//                  Customer: {vn.customerName || 'N/A'} | Branch: {vn.branchName || 'N/A'}
//                </div>
//                <div className="text-xs text-slate-400 mt-0.5">
//                  Orders: {vn.orders?.length || 0}
//                </div>
//              </div>
//            ))
//          ) : (
//            <div className="p-4 text-center text-sm text-slate-500">
//              {searchQuery.trim() ? 
//                `No results found for "${searchQuery}"` : 
//                "No vehicle negotiations available"
//              }
//            </div>
//          )}
//        </div>
//      )}
//    </div>
//  );
//}
///* =========================
//  LOCATION RATE DROPDOWN - EDITABLE
//========================= */
//function LocationRateDropdown({ 
//  locations, 
//  selectedName, 
//  onSelect, 
//  placeholder = "Select Location...",
//  readOnly = false
//}) {
//  const [searchQuery, setSearchQuery] = useState("");
//  const [showDropdown, setShowDropdown] = useState(false);
//  const [selectedItem, setSelectedItem] = useState(null);
//  const dropdownRef = useRef(null);
//  const inputRef = useRef(null);
//  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
//
//  useEffect(() => {
//    if (selectedName && locations) {
//      const item = locations.find(l => l.name === selectedName);
//      setSelectedItem(item);
//      if (item) {
//        setSearchQuery(item.name);
//      }
//    } else if (!selectedName) {
//      setSelectedItem(null);
//      setSearchQuery("");
//    }
//  }, [locations, selectedName]);
//
//  const handleSelectItem = (item) => {
//    if (readOnly) return;
//    setSelectedItem(item);
//    setSearchQuery(item.name);
//    setShowDropdown(false);
//    onSelect?.(item.name);
//  };
//
//  const handleInputFocus = () => {
//    if (!readOnly && inputRef.current) {
//      const rect = inputRef.current.getBoundingClientRect();
//      setDropdownPosition({
//        top: rect.bottom + window.scrollY,
//        left: rect.left + window.scrollX,
//        width: rect.width
//      });
//      setShowDropdown(true);
//    }
//  };
//
//  const handleInputBlur = () => {
//    setTimeout(() => {
//      if (dropdownRef.current && !dropdownRef.current.contains(document.activeElement)) {
//        setShowDropdown(false);
//      }
//    }, 200);
//  };
//
//  const filteredLocations = useMemo(() => {
//    if (!searchQuery.trim()) return locations || [];
//    return (locations || []).filter(loc => 
//      loc.name.toLowerCase().includes(searchQuery.toLowerCase())
//    );
//  }, [locations, searchQuery]);
//
//  return (
//    <div className="relative w-full" ref={dropdownRef}>
//      <input
//        ref={inputRef}
//        type="text"
//        value={searchQuery}
//        onChange={(e) => setSearchQuery(e.target.value)}
//        onFocus={handleInputFocus}
//        onBlur={handleInputBlur}
//        className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
//          readOnly ? 'bg-slate-50 cursor-not-allowed' : 'bg-white cursor-pointer'
//        }`}
//        placeholder={placeholder}
//        readOnly={readOnly}
//        autoComplete="off"
//      />
//      <div className="absolute right-2 top-2 text-gray-400 pointer-events-none">
//        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//        </svg>
//      </div>
//      
//      {showDropdown && !readOnly && filteredLocations.length > 0 && (
//        <div 
//          ref={dropdownRef}
//          className="fixed z-[9999] bg-white border border-slate-200 rounded-lg shadow-xl overflow-y-auto"
//          style={{
//            top: dropdownPosition.top,
//            left: dropdownPosition.left,
//            width: dropdownPosition.width,
//            maxHeight: '300px'
//          }}
//        >
//          <div className="sticky top-0 bg-gray-50 px-3 py-2 text-xs font-semibold text-slate-600 border-b">
//            Select Location
//          </div>
//          {filteredLocations.map((location) => (
//            <div
//              key={location._id}
//              onMouseDown={() => handleSelectItem(location)}
//              className={`px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors ${
//                selectedItem?._id === location._id ? 'bg-sky-50' : ''
//              }`}
//            >
//              <div className="font-medium text-slate-800 text-sm">
//                {location.name}
//              </div>
//            </div>
//          ))}
//        </div>
//      )}
//    </div>
//  );
//}
//
///* =========================
//  PRICE LIST DROPDOWN - EDITABLE
//========================= */
//function PriceListDropdown({ 
//  rateMasters, 
//  selectedValue, 
//  onSelect, 
//  locationName,
//  branchId,
//  customerId,
//  placeholder = "Select Price List...",
//  readOnly = false
//}) {
//  const [searchQuery, setSearchQuery] = useState("");
//  const [showDropdown, setShowDropdown] = useState(false);
//  const [selectedItem, setSelectedItem] = useState(null);
//  const dropdownRef = useRef(null);
//  const inputRef = useRef(null);
//  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
//
//  const filteredRateMasters = useMemo(() => {
//    let filtered = rateMasters || [];
//    
//    if (branchId) {
//      filtered = filtered.filter(rm => {
//        const rmBranchId = rm.branchId?._id || rm.branchId;
//        return String(rmBranchId) === String(branchId);
//      });
//    } else {
//      return [];
//    }
//    
//    if (customerId) {
//      filtered = filtered.filter(rm => {
//        const rmCustomerId = rm.customerId?._id || rm.customerId;
//        return String(rmCustomerId) === String(customerId);
//      });
//    } else {
//      return [];
//    }
//    
//    if (locationName) {
//      filtered = filtered.filter(rm => {
//        const rmLocationName = rm.locationName;
//        return rmLocationName?.toLowerCase() === locationName.toLowerCase();
//      });
//    }
//    
//    return filtered;
//  }, [rateMasters, locationName, branchId, customerId]);
//
//  useEffect(() => {
//    if (selectedValue) {
//      const item = filteredRateMasters.find(rm => rm.title === selectedValue);
//      setSelectedItem(item);
//      if (item) {
//        setSearchQuery(item.title);
//      }
//    } else {
//      setSelectedItem(null);
//      setSearchQuery("");
//    }
//  }, [filteredRateMasters, selectedValue]);
//
//  const handleSelectItem = (item) => {
//    if (readOnly) return;
//    setSelectedItem(item);
//    setSearchQuery(item.title);
//    setShowDropdown(false);
//    onSelect?.(item);
//  };
//
//  const handleInputFocus = () => {
//    if (!readOnly && inputRef.current && filteredRateMasters.length > 0) {
//      const rect = inputRef.current.getBoundingClientRect();
//      setDropdownPosition({
//        top: rect.bottom + window.scrollY,
//        left: rect.left + window.scrollX,
//        width: rect.width
//      });
//      setShowDropdown(true);
//    }
//  };
//
//  const handleInputBlur = () => {
//    setTimeout(() => {
//      if (dropdownRef.current && !dropdownRef.current.contains(document.activeElement)) {
//        setShowDropdown(false);
//      }
//    }, 200);
//  };
//
//  const searchedItems = useMemo(() => {
//    if (!searchQuery.trim()) return filteredRateMasters;
//    return filteredRateMasters.filter(rm => 
//      rm.title.toLowerCase().includes(searchQuery.toLowerCase())
//    );
//  }, [filteredRateMasters, searchQuery]);
//
//  return (
//    <div className="relative w-full" ref={dropdownRef}>
//      <input
//        ref={inputRef}
//        type="text"
//        value={searchQuery}
//        onChange={(e) => setSearchQuery(e.target.value)}
//        onFocus={handleInputFocus}
//        onBlur={handleInputBlur}
//        className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
//          readOnly ? 'bg-slate-50 cursor-not-allowed' : 'bg-white cursor-pointer'
//        }`}
//        placeholder={placeholder}
//        readOnly={readOnly}
//        autoComplete="off"
//      />
//      <div className="absolute right-2 top-2 text-gray-400 pointer-events-none">
//        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//        </svg>
//      </div>
//      
//      {showDropdown && !readOnly && filteredRateMasters.length > 0 && (
//        <div 
//          className="fixed z-[9999] bg-white border border-slate-200 rounded-lg shadow-xl overflow-y-auto"
//          style={{
//            position: 'fixed',
//            top: dropdownPosition.top,
//            left: dropdownPosition.left,
//            width: dropdownPosition.width,
//            maxHeight: '300px'
//          }}
//        >
//          <div className="sticky top-0 bg-gray-50 px-3 py-2 text-xs font-semibold text-slate-600 border-b">
//            Select Price List
//          </div>
//          {searchedItems.length > 0 ? (
//            searchedItems.map((rm) => (
//              <div
//                key={rm._id}
//                onMouseDown={() => handleSelectItem(rm)}
//                className={`px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors ${
//                  selectedItem?._id === rm._id ? 'bg-sky-50' : ''
//                }`}
//              >
//                <div className="font-medium text-slate-800 text-sm">
//                  {rm.title}
//                </div>
//                <div className="text-xs text-slate-500 mt-0.5">
//                  Branch: {rm.branchName || 'N/A'} | Customer: {rm.customerName || 'N/A'}
//                </div>
//              </div>
//            ))
//          ) : (
//            <div className="p-3 text-center text-sm text-slate-500">
//              {searchQuery.trim() ? 
//                `No price lists found for "${searchQuery}"` : 
//                `No price lists available`
//              }
//            </div>
//          )}
//        </div>
//      )}
//    </div>
//  );
//}
//
///* =========================
//  BILLING TYPE TABLE - READ ONLY
//========================= */
//function BillingTypeTable({ billing, billingColumns }) {
//  return (
//    <div className="overflow-auto rounded-xl border border-yellow-300">
//      <table className="min-w-full w-full text-sm">
//        <thead className="sticky top-0 bg-yellow-400">
//          <tr>
//            {billingColumns.map((col) => (
//              <th
//                key={col.key}
//                className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center"
//              >
//                {col.label}
//              </th>
//            ))}
//          </tr>
//        </thead>
//
//        <tbody>
//          <tr className="hover:bg-yellow-50 even:bg-slate-50">
//            {billingColumns.map((col) => (
//              <td key={col.key} className="border border-yellow-300 px-2 py-2">
//                {col.options ? (
//                  <select
//                    value={billing[col.key] || ""}
//                    disabled={true}
//                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm outline-none cursor-not-allowed"
//                  >
//                    <option value="">Select {col.label}</option>
//                    {col.options.map((opt) => (
//                      <option key={opt} value={opt}>
//                        {opt}
//                      </option>
//                    ))}
//                  </select>
//                ) : (
//                  <input
//                    type={col.type || "text"}
//                    value={billing[col.key] || ""}
//                    readOnly={true}
//                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm outline-none cursor-not-allowed"
//                    placeholder={`Enter ${col.label}`}
//                  />
//                )}
//              </td>
//            ))}
//          </tr>
//        </tbody>
//      </table>
//    </div>
//  );
//}
//
///* =========================
//  ORDERS TABLE COMPONENT - EDIT PAGE - WITH EDITABLE FIELDS
//========================= */
//function OrdersTable({ 
//  rows, 
//  onChange, 
//  onRemove, 
//  billingType, 
//  selectedVehicleNegotiation,
//  states,
//  districts,
//  talukas,
//  locations,
//  rateMasters,
//  headerBranch,
//  headerCustomerId,
//  onFetchDistricts,
//  onFetchTalukas
//}) {
//  const columns = [
//    { key: "orderNo", label: "Order No *", minWidth: "120px" },
//    { key: "partyName", label: "Party Name", minWidth: "150px" },
//    { key: "plantCode", label: "Plant Code", minWidth: "100px" },
//    { key: "plantName", label: "Plant Name", minWidth: "120px", readOnly: true },
//    { key: "plantCodeValue", label: "Plant Code Value", minWidth: "120px", readOnly: true },
//    { key: "orderType", label: "Order Type", minWidth: "100px" },
//    { key: "pinCode", label: "Pin Code", minWidth: "100px" },
//    { key: "from", label: "From", minWidth: "120px" },
//    { key: "to", label: "To", minWidth: "120px" },
//    { key: "state", label: "State", minWidth: "120px" },
//    { key: "district", label: "District", minWidth: "120px" },
//    { key: "taluka", label: "Taluka", minWidth: "120px" },
//    { key: "locationRate", label: "Location Rate", minWidth: "200px" },
//    { key: "priceList", label: "Price List", minWidth: "220px" },
//    { key: "weight", label: "Weight", type: "number", minWidth: "80px" },
//    { key: "rate", label: "Rate", type: "number", minWidth: "80px" },
//  ];
//
//  const isReadOnlyMode = !!selectedVehicleNegotiation;
//
//  const handleStateChange = async (rowId, stateId, stateName) => {
//    onChange(rowId, 'stateId', stateId);
//    onChange(rowId, 'stateName', stateName);
//    onChange(rowId, 'districtId', '');
//    onChange(rowId, 'districtName', '');
//    onChange(rowId, 'talukaId', '');
//    onChange(rowId, 'talukaName', '');
//    
//    if (stateId) {
//      await onFetchDistricts(stateId);
//    }
//  };
//
//  const handleDistrictChange = async (rowId, districtId, districtName) => {
//    onChange(rowId, 'districtId', districtId);
//    onChange(rowId, 'districtName', districtName);
//    onChange(rowId, 'talukaId', '');
//    onChange(rowId, 'talukaName', '');
//    
//    if (districtId) {
//      await onFetchTalukas(districtId);
//    }
//  };
//
//  const handleTalukaChange = (rowId, talukaId, talukaName) => {
//    onChange(rowId, 'talukaId', talukaId);
//    onChange(rowId, 'talukaName', talukaName);
//  };
//
//  const handleLocationRateSelect = (rowId, locationName) => {
//    onChange(rowId, 'locationRate', locationName);
//    onChange(rowId, 'priceList', '');
//    onChange(rowId, 'rate', '');
//    onChange(rowId, 'selectedRateMaster', null);
//  };
//
//  const handlePriceListSelect = (rowId, rateMaster) => {
//    onChange(rowId, 'priceList', rateMaster.title);
//    onChange(rowId, 'selectedRateMaster', rateMaster);
//    
//    const currentRow = rows.find(r => r._id === rowId);
//    if (currentRow && currentRow.weight) {
//      const applicableSlab = rateMaster.rateSlabs?.find(slab => 
//        num(currentRow.weight) >= slab.fromQty && num(currentRow.weight) <= slab.toQty
//      );
//      if (applicableSlab) {
//        onChange(rowId, 'rate', applicableSlab.rate);
//      }
//    }
//  };
//
//  const handleWeightChange = (rowId, weight) => {
//    onChange(rowId, 'weight', weight);
//    
//    const currentRow = rows.find(r => r._id === rowId);
//    if (currentRow && currentRow.selectedRateMaster) {
//      const applicableSlab = currentRow.selectedRateMaster.rateSlabs?.find(slab => 
//        num(weight) >= slab.fromQty && num(weight) <= slab.toQty
//      );
//      if (applicableSlab) {
//        onChange(rowId, 'rate', applicableSlab.rate);
//      }
//    }
//  };
//
//  return (
//    <div className="overflow-auto rounded-xl border border-yellow-300 max-h-[500px]">
//      <table className="min-w-max w-full text-sm">
//        <thead className="sticky top-0 bg-yellow-400 z-10">
//          <tr>
//            {columns.map((col) => (
//              <th
//                key={col.key}
//                className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center"
//                style={{ minWidth: col.minWidth }}
//              >
//                {col.label}
//              </th>
//            ))}
//            <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">
//              Total Amount
//            </th>
//            {billingType === "Multi - Order" && !isReadOnlyMode && (
//              <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">
//                Actions
//              </th>
//            )}
//          </tr>
//        </thead>
//
//        <tbody>
//          {rows.map((row) => {
//            const totalAmount = num(row.weight) * num(row.rate);
//            const isFromVehicleNegotiation = !!row.vehicleNegotiationId || isReadOnlyMode;
//            const districtOptions = districts[row.stateId] || [];
//            const talukaOptions = talukas[row.districtId] || [];
//            const currentCustomerId = row.customerId || headerCustomerId;
//            
//            return (
//              <tr key={row._id} className="hover:bg-yellow-50 even:bg-slate-50">
//                <td className="border border-yellow-300 px-2 py-2">
//                  <input
//                    value={row.orderNo || ""}
//                    onChange={(e) => onChange(row._id, 'orderNo', e.target.value)}
//                    className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
//                      isFromVehicleNegotiation ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
//                    }`}
//                    placeholder="Enter Order No"
//                    readOnly={isFromVehicleNegotiation}
//                  />
//                </td>
//
//                <td className="border border-yellow-300 px-2 py-2">
//                  <input
//                    value={row.partyName || ""}
//                    readOnly={true}
//                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm outline-none cursor-not-allowed"
//                    placeholder="Party Name"
//                  />
//                </td>
//
//                <td className="border border-yellow-300 px-2 py-2">
//                  <input
//                    value={row.plantCode || ""}
//                    onChange={(e) => onChange(row._id, 'plantCode', e.target.value)}
//                    className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
//                      isFromVehicleNegotiation ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
//                    }`}
//                    placeholder="Plant Code"
//                    readOnly={isFromVehicleNegotiation}
//                  />
//                </td>
//
//                <td className="border border-yellow-300 px-2 py-2">
//                  <input
//                    type="text"
//                    value={row.plantName || ""}
//                    readOnly
//                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm outline-none"
//                    placeholder="Auto-filled"
//                  />
//                </td>
//
//                <td className="border border-yellow-300 px-2 py-2">
//                  <input
//                    type="text"
//                    value={row.plantCodeValue || ""}
//                    readOnly
//                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm outline-none"
//                    placeholder="Auto-filled"
//                  />
//                </td>
//
//                <td className="border border-yellow-300 px-2 py-2">
//                  <select
//                    value={row.orderType || ""}
//                    onChange={(e) => onChange(row._id, 'orderType', e.target.value)}
//                    className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
//                      isFromVehicleNegotiation ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
//                    }`}
//                    disabled={isFromVehicleNegotiation}
//                  >
//                    <option value="">Select</option>
//                    {ORDER_TYPES.map((opt) => (
//                      <option key={opt} value={opt}>
//                        {opt}
//                      </option>
//                    ))}
//                  </select>
//                </td>
//
//                <td className="border border-yellow-300 px-2 py-2">
//                  <input
//                    type="text"
//                    value={row.pinCode || ""}
//                    onChange={(e) => onChange(row._id, 'pinCode', e.target.value)}
//                    className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
//                      isFromVehicleNegotiation ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
//                    }`}
//                    placeholder="Pin Code"
//                    readOnly={isFromVehicleNegotiation}
//                  />
//                </td>
//
//                <td className="border border-yellow-300 px-2 py-2">
//                  <input
//                    value={row.fromName || ""}
//                    onChange={(e) => onChange(row._id, 'fromName', e.target.value)}
//                    className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
//                      isFromVehicleNegotiation ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
//                    }`}
//                    placeholder="From"
//                    readOnly={isFromVehicleNegotiation}
//                  />
//                </td>
//
//                <td className="border border-yellow-300 px-2 py-2">
//                  <input
//                    value={row.toName || ""}
//                    onChange={(e) => onChange(row._id, 'toName', e.target.value)}
//                    className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
//                      isFromVehicleNegotiation ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
//                    }`}
//                    placeholder="To"
//                    readOnly={isFromVehicleNegotiation}
//                  />
//                </td>
//
//                <td className="border border-yellow-300 px-2 py-2">
//                  <select
//                    value={row.stateId || ""}
//                    onChange={(e) => {
//                      const selectedState = states.find(s => s._id === e.target.value);
//                      handleStateChange(row._id, e.target.value, selectedState?.name || "");
//                    }}
//                    className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
//                      isFromVehicleNegotiation ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
//                    }`}
//                    disabled={isFromVehicleNegotiation}
//                  >
//                    <option value="">Select State</option>
//                    {states.map((state) => (
//                      <option key={state._id} value={state._id}>
//                        {state.name}
//                      </option>
//                    ))}
//                  </select>
//                </td>
//
//                <td className="border border-yellow-300 px-2 py-2">
//                  <select
//                    value={row.districtId || ""}
//                    onChange={(e) => {
//                      const selectedDistrict = districtOptions.find(d => d._id === e.target.value);
//                      handleDistrictChange(row._id, e.target.value, selectedDistrict?.name || "");
//                    }}
//                    className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
//                      (isFromVehicleNegotiation || !row.stateId) ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
//                    }`}
//                    disabled={isFromVehicleNegotiation || !row.stateId}
//                  >
//                    <option value="">Select District</option>
//                    {districtOptions.map((district) => (
//                      <option key={district._id} value={district._id}>
//                        {district.name}
//                      </option>
//                    ))}
//                  </select>
//                </td>
//
//                <td className="border border-yellow-300 px-2 py-2">
//                  <select
//                    value={row.talukaId || ""}
//                    onChange={(e) => {
//                      const selectedTaluka = talukaOptions.find(t => t._id === e.target.value);
//                      handleTalukaChange(row._id, e.target.value, selectedTaluka?.name || "");
//                    }}
//                    className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
//                      (isFromVehicleNegotiation || !row.districtId) ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
//                    }`}
//                    disabled={isFromVehicleNegotiation || !row.districtId}
//                  >
//                    <option value="">Select Taluka</option>
//                    {talukaOptions.map((taluka) => (
//                      <option key={taluka._id} value={taluka._id}>
//                        {taluka.name}
//                      </option>
//                    ))}
//                  </select>
//                </td>
//
//                {/* Location Rate - EDITABLE DROPDOWN */}
//                <td className="border border-yellow-300 px-2 py-2">
//                  <LocationRateDropdown
//                    locations={locations}
//                    selectedName={row.locationRate}
//                    onSelect={(locationName) => handleLocationRateSelect(row._id, locationName)}
//                    readOnly={false}
//                    placeholder="Select Location..."
//                  />
//                </td>
//
//                {/* Price List - EDITABLE DROPDOWN */}
//                <td className="border border-yellow-300 px-2 py-2">
//                  <PriceListDropdown
//                    rateMasters={rateMasters}
//                    selectedValue={row.priceList}
//                    onSelect={(rateMaster) => handlePriceListSelect(row._id, rateMaster)}
//                    locationName={row.locationRate}
//                    branchId={headerBranch}
//                    customerId={currentCustomerId}
//                    placeholder="Select Price List..."
//                    readOnly={false}
//                  />
//                </td>
//
//                <td className="border border-yellow-300 px-2 py-2">
//                  <input
//                    type="number"
//                    value={row.weight || ""}
//                    onChange={(e) => handleWeightChange(row._id, e.target.value)}
//                    className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
//                      isFromVehicleNegotiation ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
//                    }`}
//                    placeholder="Weight"
//                    readOnly={isFromVehicleNegotiation}
//                  />
//                </td>
//
//                <td className="border border-yellow-300 px-2 py-2">
//                  <input
//                    type="number"
//                    value={row.rate || ""}
//                    onChange={(e) => onChange(row._id, 'rate', e.target.value)}
//                    className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
//                    placeholder="Enter Rate"
//                  />
//                </td>
//
//                <td className="border border-yellow-300 px-2 py-2">
//                  <input
//                    type="number"
//                    value={totalAmount}
//                    readOnly
//                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm outline-none"
//                  />
//                </td>
//
//                {billingType === "Multi - Order" && !isReadOnlyMode && (
//                  <td className="border border-yellow-300 px-2 py-2 text-center">
//                    <button
//                      onClick={() => onRemove(row._id)}
//                      className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600 transition"
//                    >
//                      Remove
//                    </button>
//                  </td>
//                )}
//              </tr>
//            );
//          })}
//        </tbody>
//      </table>
//    </div>
//  );
//}
//
///* =========================
//  MAIN EDIT PAGE
//========================= */
//export default function EditPricingPanel() {
//  const router = useRouter();
//  const params = useParams();
//  const panelId = params.id;
//
//  const [branches, setBranches] = useState([]);
//  const [countries, setCountries] = useState([]);
//  const [plants, setPlants] = useState([]);
//  const [fetchLoading, setFetchLoading] = useState(true);
//  const [saving, setSaving] = useState(false);
//  const [saveError, setSaveError] = useState(null);
//  const [saveSuccess, setSaveSuccess] = useState(false);
//  
//  const locationData = useLocationData();
//  const customerSearch = useCustomerSearch();
//  const rateMasterSearch = useRateMasterSearch();
//
//  const [selectedCustomer, setSelectedCustomer] = useState(null);
//  const [selectedVehicleNegotiation, setSelectedVehicleNegotiation] = useState(null);
//  const [currentVnn, setCurrentVnn] = useState("");
//
//  const [header, setHeader] = useState({
//    pricingSerialNo: "",
//    branch: "",
//    branchName: "",
//    branchCode: "",
//    delivery: "Normal",
//    date: new Date().toISOString().split('T')[0],
//    partyName: "",
//    customerId: ""
//  });
//
//  const [billing, setBilling] = useState({
//    billingType: "Multi - Order",
//    loadingPoints: "",
//    dropPoints: "",
//    collectionCharges: 0,
//    cancellationCharges: "Nil",
//    loadingCharges: "Nil",
//    otherCharges: 0,
//  });
//
//  const [orders, setOrders] = useState([]);
//
//  const [rateApproval, setRateApproval] = useState({
//    approvalType: "Contract Rates",
//    uploadFile: null,
//    uploadFileName: "",
//    approvalStatus: "Pending",
//  });
//
//  useEffect(() => {
//    fetchBranches();
//    fetchCountries();
//    fetchPlants();
//    fetchPricingPanelData();
//    locationData.fetchStates();
//    locationData.fetchLocations();
//    customerSearch.searchCustomers();
//    rateMasterSearch.searchRateMasters();
//  }, []);
//
//  const fetchPricingPanelData = async () => {
//  setFetchLoading(true);
//  try {
//    const token = localStorage.getItem('token');
//    
//    const res = await fetch(`/api/pricing-panel?id=${panelId}`, {
//      headers: { Authorization: `Bearer ${token}` },
//    });
//    
//    const data = await res.json();
//    
//    if (!data.success) {
//      throw new Error(data.message || 'Failed to fetch pricing panel');
//    }
//
//    const panel = data.data;
//    console.log("Fetched panel:", panel);
//    
//    // Check orders for VNN
//    if (panel.orders && panel.orders.length > 0) {
//      const firstOrder = panel.orders[0];
//      console.log("First order:", firstOrder);
//      
//      // Try to get VNN from different possible locations
//      let vnnValue = null;
//      
//      if (firstOrder.vnnNumber) {
//        vnnValue = firstOrder.vnnNumber;
//      } else if (firstOrder.vnn) {
//        vnnValue = firstOrder.vnn;
//      } else if (firstOrder.vehicleNegotiationId) {
//        // If it's an ID, fetch the VN to get the VNN number
//        const vnRes = await fetch(`/api/vehicle-negotiation?id=${firstOrder.vehicleNegotiationId}`, {
//          headers: { Authorization: `Bearer ${token}` },
//        });
//        const vnData = await vnRes.json();
//        if (vnData.success && vnData.data) {
//          vnnValue = vnData.data.vnnNo;
//        }
//      }
//      
//      if (vnnValue) {
//        setCurrentVnn(vnnValue);
//        console.log("Set current VNN to:", vnnValue);
//      }
//    }
//    
//    
//    
//    setHeader({
//      pricingSerialNo: panel.pricingSerialNo || "",
//      branch: panel.branch || "",
//      branchName: panel.branchName || "",
//      branchCode: panel.branchCode || "",
//      delivery: panel.delivery || "Normal",
//      date: panel.date ? new Date(panel.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
//      partyName: panel.partyName || "",
//      customerId: panel.customerId || ""
//    });
//
//      setBilling({
//        billingType: panel.billingType || "Multi - Order",
//        loadingPoints: panel.loadingPoints?.toString() || "",
//        dropPoints: panel.dropPoints?.toString() || "",
//        collectionCharges: panel.collectionCharges || 0,
//        cancellationCharges: panel.cancellationCharges || "Nil",
//        loadingCharges: panel.loadingCharges || "Nil",
//        otherCharges: panel.otherCharges || 0,
//      });
//
//      if (panel.orders && panel.orders.length > 0) {
//        const processedOrders = panel.orders.map(order => ({
//          ...order,
//          _id: order._id || uid(),
//          weight: order.weight?.toString() || "",
//          rate: order.rate?.toString() || "",
//          locationRate: order.locationRate || "",
//          taluka: order.taluka || "",
//          talukaName: order.talukaName || order.taluka || "",
//          talukaId: order.talukaId || "",
//          districtId: order.districtId || "",
//          stateId: order.stateId || "",
//          vehicleNegotiationId: order.vehicleNegotiationId || "",
//          priceList: order.priceList || "",
//          selectedRateMaster: null
//        }));
//        setOrders(processedOrders);
//      } else {
//        setOrders([defaultOrderRow()]);
//      }
//
//      if (panel.rateApproval) {
//        setRateApproval({
//          approvalType: panel.rateApproval.approvalType || "Contract Rates",
//          uploadFile: null,
//          uploadFileName: panel.rateApproval.uploadFile || "",
//          approvalStatus: panel.rateApproval.approvalStatus || "Pending",
//        });
//      }
//
//      if (panel.partyName) {
//        setSelectedCustomer({
//          _id: panel.customerId,
//          customerName: panel.partyName,
//          customerCode: panel.customerCode || "",
//          contactPersonName: panel.contactPerson || ""
//        });
//      }
//
//    } catch (error) {
//      console.error('Error fetching pricing panel:', error);
//      alert(`Failed to load pricing panel: ${error.message}`);
//    } finally {
//      setFetchLoading(false);
//    }
//  };
//
//  const fetchBranches = async () => {
//    try {
//      const token = localStorage.getItem('token');
//      const res = await fetch('/api/branches', {
//        headers: { Authorization: `Bearer ${token}` },
//      });
//      const data = await res.json();
//      if (data.success && Array.isArray(data.data)) {
//        setBranches(data.data);
//      }
//    } catch (error) {
//      console.error('Error fetching branches:', error.message);
//    }
//  };
//
//  const fetchCountries = async () => {
//    try {
//      const token = localStorage.getItem('token');
//      const res = await fetch('/api/countries', {
//        headers: { Authorization: `Bearer ${token}` },
//      });
//      const data = await res.json();
//      if (data.success && Array.isArray(data.data)) {
//        setCountries(data.data);
//      }
//    } catch (error) {
//      console.error('Error fetching countries:', error.message);
//    }
//  };
//
//  const fetchPlants = async () => {
//    try {
//      const token = localStorage.getItem('token');
//      const res = await fetch('/api/plants', {
//        headers: { Authorization: `Bearer ${token}` },
//      });
//      const data = await res.json();
//      if (data.success && Array.isArray(data.data)) {
//        setPlants(data.data);
//      }
//    } catch (error) {
//      console.error('Error fetching plants:', error.message);
//    }
//  };
//
//  const handleSelectVehicleNegotiation = async (fullVN) => {
//    setSelectedVehicleNegotiation(fullVN);
//    setCurrentVnn(fullVN.vnnNo);
//
//    setHeader(prev => ({
//      ...prev,
//      branch: fullVN.branch || "",
//      branchName: fullVN.branchName || "",
//      branchCode: fullVN.branchCode || "",
//      delivery: fullVN.delivery || "Normal",
//      date: fullVN.date ? new Date(fullVN.date).toISOString().split('T')[0] : prev.date,
//      partyName: fullVN.customerName || fullVN.partyName || "",
//      customerId: fullVN.customerId || ""
//    }));
//
//    setBilling(prev => ({
//      ...prev,
//      collectionCharges: fullVN.collectionCharges || 0,
//      cancellationCharges: fullVN.cancellationCharges || "Nil",
//      loadingCharges: fullVN.loadingCharges || "Nil",
//      otherCharges: fullVN.otherCharges || 0,
//      loadingPoints: prev.loadingPoints || fullVN.loadingPoints || "",
//      dropPoints: prev.dropPoints || fullVN.dropPoints || ""
//    }));
//
//    if (fullVN.orders && fullVN.orders.length > 0) {
//      const newOrders = fullVN.orders.map(order => ({
//        _id: uid(),
//        orderNo: order.orderNo,
//        vehicleNegotiationId: fullVN._id,
//        vnnNumber: fullVN.vnnNo,
//        partyName: order.partyName || fullVN.customerName || "",
//        customerId: order.customerId || fullVN.customerId,
//        customerCode: order.customerCode || "",
//        contactPerson: order.contactPerson || fullVN.contactPerson || "",
//        plantCode: order.plantCode,
//        plantName: order.plantName || "",
//        plantCodeValue: order.plantCodeValue || "",
//        orderType: order.orderType || "Sales",
//        pinCode: order.pinCode || "",
//        from: order.from,
//        fromName: order.fromName || "",
//        to: order.to,
//        toName: order.toName || "",
//        taluka: order.taluka || "",
//        talukaName: order.talukaName || order.taluka || "",
//        talukaId: order.talukaId || "",
//        district: order.district,
//        districtName: order.districtName || "",
//        districtId: order.districtId || "",
//        state: order.state,
//        stateName: order.stateName || "",
//        stateId: order.stateId || "",
//        country: order.country,
//        countryName: order.countryName || "",
//        locationRate: "",
//        priceList: "",
//        selectedRateMaster: null,
//        weight: order.weight || "",
//        rate: "",
//        totalAmount: 0
//      }));
//      
//      setOrders(newOrders);
//    }
//  };
//
//  const updateOrder = (id, key, value) => {
//    setOrders((prev) => prev.map((r) => (r._id === id ? { ...r, [key]: value } : r)));
//  };
//
//  const addOrder = () => {
//    setOrders((prev) => [...prev, { ...defaultOrderRow(), _id: uid() }]);
//  };
//
//  const removeOrder = (id) => {
//    if (orders.length > 1) {
//      setOrders((prev) => prev.filter((x) => x._id !== id));
//    } else {
//      alert("At least one order row is required");
//    }
//  };
//
//  const handleBillingTypeChange = (value) => {
//    setBilling((prev) => ({ ...prev, billingType: value }));
//    if (value === "Single - Order" && orders.length > 1) {
//      setOrders([orders[0]]);
//    }
//  };
//
//  const totalWeight = useMemo(() => {
//    return orders.reduce((acc, r) => acc + num(r.weight), 0);
//  }, [orders]);
//
//  const totalAmount = useMemo(() => {
//    return orders.reduce((acc, r) => {
//      const weight = num(r.weight);
//      const rate = num(r.rate);
//      return acc + (weight * rate);
//    }, 0);
//  }, [orders]);
//
//  const handleUpdate = async () => {
//    if (!header.branch) {
//      alert("Please select a branch");
//      return;
//    }
//    
//    const hasInvalidOrders = orders.some(order => !order.orderNo);
//    if (hasInvalidOrders) {
//      alert("Please enter Order No for all order rows");
//      return;
//    }
//
//    setSaving(true);
//    setSaveError(null);
//    setSaveSuccess(false);
//
//    try {
//      const token = localStorage.getItem('token');
//      if (!token) {
//        throw new Error("No authentication token found. Please login again.");
//      }
//
//      const payload = {
//        id: panelId,
//        header: {
//          ...header,
//          partyName: selectedCustomer?.customerName || header.partyName,
//          customerId: selectedCustomer?._id || header.customerId
//        },
//        billing: {
//          ...billing,
//          loadingPoints: num(billing.loadingPoints) || 1,
//          dropPoints: num(billing.dropPoints) || 1,
//          collectionCharges: num(billing.collectionCharges) || 0,
//          otherCharges: num(billing.otherCharges) || 0
//        },
//        orders: orders.map(order => ({
//          _id: order._id,
//          orderNo: order.orderNo,
//          vehicleNegotiationId: order.vehicleNegotiationId,
//          vnnNumber: order.vnnNumber,
//          partyName: order.partyName,
//          customerId: order.customerId || null,
//          customerCode: order.customerCode,
//          contactPerson: order.contactPerson,
//          plantCode: order.plantCode,
//          plantName: order.plantName,
//          plantCodeValue: order.plantCodeValue,
//          orderType: order.orderType,
//          pinCode: order.pinCode,
//          from: order.from,
//          fromName: order.fromName,
//          to: order.to,
//          toName: order.toName,
//          taluka: order.taluka,
//          talukaName: order.talukaName,
//          talukaId: order.talukaId,
//          district: order.district,
//          districtName: order.districtName,
//          districtId: order.districtId,
//          state: order.state,
//          stateName: order.stateName,
//          stateId: order.stateId,
//          country: order.country,
//          countryName: order.countryName,
//          locationRate: order.locationRate,
//          priceList: order.priceList,
//          weight: num(order.weight),
//          rate: num(order.rate),
//          totalAmount: num(order.weight) * num(order.rate)
//        })),
//        totalWeight,
//        totalAmount,
//        rateApproval: {
//          approvalType: rateApproval.approvalType,
//          approvalStatus: rateApproval.approvalStatus,
//          uploadFile: rateApproval.uploadFileName
//        }
//      };
//
//      const res = await fetch('/api/pricing-panel', {
//        method: 'PUT',
//        headers: {
//          'Content-Type': 'application/json',
//          Authorization: `Bearer ${token}`,
//        },
//        body: JSON.stringify(payload),
//      });
//
//      if (!res.ok) {
//        const errorData = await res.json();
//        throw new Error(errorData.message || `Failed to update: ${res.status}`);
//      }
//
//      setSaveSuccess(true);
//      alert(`✅ Pricing panel updated successfully!\nPricing Serial No: ${header.pricingSerialNo}`);
//      
//      setTimeout(() => {
//        router.push('/admin/pricing-panel');
//      }, 2000);
//      
//    } catch (error) {
//      console.error('Error updating pricing panel:', error);
//      setSaveError(error.message || 'Failed to update pricing panel');
//      alert(`❌ Error: ${error.message}`);
//    } finally {
//      setSaving(false);
//    }
//  };
//
//  const billingColumns = [
//    { key: "billingType", label: "Billing Type", options: BILLING_TYPES },
//    { key: "loadingPoints", label: "No. of Loading Points", type: "number" },
//    { key: "dropPoints", label: "No. of Droping Point", type: "number" },
//    { key: "collectionCharges", label: "Collection Charges", type: "number" },
//    { key: "cancellationCharges", label: "Cancellation Charges", type: "text" },
//    { key: "loadingCharges", label: "Loading Charges", type: "text" },
//    { key: "otherCharges", label: "Other Charges", type: "number" },
//  ];
//
//  if (fetchLoading) {
//    return (
//      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-6">
//        <div className="flex items-center justify-center h-64">
//          <div className="text-center">
//            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
//            <p className="mt-4 text-slate-600">Loading pricing panel...</p>
//          </div>
//        </div>
//      </div>
//    );
//  }
//
//  return (
//    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
//      <div className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
//        <div className="mx-auto max-w-full px-4 py-3 flex items-center justify-between">
//          <div>
//            <div className="flex items-center gap-3">
//              <button
//                onClick={() => router.push('/admin/pricing-panel')}
//                className="text-yellow-600 hover:text-yellow-800 font-medium text-sm flex items-center gap-1"
//              >
//                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//                </svg>
//                Back to List
//              </button>
//              <div className="text-lg font-extrabold text-slate-900">
//                Edit Pricing Panel: {header.pricingSerialNo}
//              </div>
//            </div>
//            {saveSuccess && (
//              <div className="text-sm text-green-600 font-medium mt-1">
//                ✅ Pricing panel updated successfully! Redirecting to list...
//              </div>
//            )}
//            {saveError && (
//              <div className="text-sm text-red-600 font-medium mt-1">
//                ❌ {saveError}
//              </div>
//            )}
//          </div>
//
//          <div className="flex items-center gap-3">
//            <button
//              onClick={handleUpdate}
//              disabled={saving}
//              className={`rounded-xl px-5 py-2 text-sm font-bold text-white transition ${
//                saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-600 hover:bg-yellow-700'
//              }`}
//            >
//              {saving ? (
//                <span className="flex items-center gap-2">
//                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                  </svg>
//                  Updating...
//                </span>
//              ) : 'Update Pricing Panel'}
//            </button>
//          </div>
//        </div>
//      </div>
//
//      <div className="mx-auto max-w-full p-4 space-y-4">
//        <Card title="Pricing Panel - Part -1">
//          <div className="grid grid-cols-12 gap-3 mb-4">
//            <div className="col-span-12 md:col-span-3">
//              <label className="text-xs font-bold text-slate-600">Pricing Serial No</label>
//              <div className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
//                {header.pricingSerialNo}
//              </div>
//            </div>
//
//           
//
//<div className="col-span-12 md:col-span-3 relative">
//  <label className="text-xs font-bold text-slate-600">Search Vehicle Negotiation</label>
//  <VehicleNegotiationHeaderDropdown
//    onSelect={handleSelectVehicleNegotiation}
//    placeholder="Search by VNN..."
//    currentVnn={currentVnn}
//    readOnly={false}
//  />
//  {selectedVehicleNegotiation && (
//    <div className="text-xs text-slate-500 mt-1">
//      Selected: {selectedVehicleNegotiation.vnnNo}
//    </div>
//  )}
//</div>
//            
//            <div className="col-span-12 md:col-span-3">
//              <label className="text-xs font-bold text-slate-600">Branch *</label>
//              <SearchableDropdown
//                items={branches}
//                selectedId={header.branch}
//                onSelect={(branch) => setHeader(p => ({ 
//                  ...p, 
//                  branch: branch?._id || '',
//                  branchName: branch?.name || '',
//                  branchCode: branch?.code || ''
//                }))}
//                placeholder="Search branch... *"
//                required={true}
//                displayField="name"
//                codeField="code"
//                readOnly={true}
//              />
//            </div>
//
//            <Select
//              col="col-span-12 md:col-span-3"
//              label="Delivery"
//              value={header.delivery}
//              onChange={(v) => setHeader((p) => ({ ...p, delivery: v }))}
//              options={DELIVERY_TYPES}
//              readOnly={true}
//            />
//
//            <Input
//              type="date"
//              col="col-span-12 md:col-span-3"
//              label="Date"
//              value={header.date}
//              onChange={(v) => setHeader((p) => ({ ...p, date: v }))}
//              readOnly={true}
//            />
//            
//            <div className="col-span-12 md:col-span-3 relative">
//              <label className="text-xs font-bold text-slate-600">Party Name</label>
//              <input
//                type="text"
//                value={selectedCustomer ? selectedCustomer.customerName : header.partyName}
//                readOnly={true}
//                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none cursor-not-allowed"
//                placeholder="Party Name"
//              />
//            </div>
//          </div>
//
//          <div className="mb-4">
//            <div className="text-sm font-bold text-slate-700 mb-2">Billing Type / Charges (Read Only)</div>
//            <BillingTypeTable billing={billing} billingColumns={billingColumns} />
//          </div>
//
//          <div>
//            <div className="flex items-center justify-between mb-4">
//              <div className="text-sm font-bold text-slate-700">
//                Orders - {billing.billingType} - {orders.length} row{orders.length !== 1 ? 's' : ''}
//              </div>
//              
//              {billing.billingType === "Multi - Order" && !selectedVehicleNegotiation && (
//                <button
//                  onClick={addOrder}
//                  className="rounded-xl bg-yellow-600 px-4 py-2 text-sm font-bold text-white hover:bg-yellow-700"
//                >
//                  + Add Row
//                </button>
//              )}
//            </div>
//            
//            <OrdersTable
//              rows={orders}
//              onChange={updateOrder}
//              onRemove={removeOrder}
//              billingType={billing.billingType}
//              selectedVehicleNegotiation={selectedVehicleNegotiation}
//              states={locationData.states}
//              districts={locationData.districts}
//              talukas={locationData.talukas}
//              locations={locationData.locations}
//              rateMasters={rateMasterSearch.rateMasters}
//              headerBranch={header.branch}
//              headerCustomerId={header.customerId}
//              onFetchDistricts={locationData.fetchDistrictsByState}
//              onFetchTalukas={locationData.fetchTalukasByDistrict}
//            />
//          </div>
//
//          <div className="flex justify-end gap-4 mt-4">
//            <div className="flex items-center gap-3 border border-yellow-300 px-6 py-3 bg-yellow-50 rounded-xl">
//              <div className="text-sm font-extrabold text-slate-900">Total Weight:</div>
//              <div className="text-xl font-extrabold text-emerald-700">{totalWeight}</div>
//            </div>
//            <div className="flex items-center gap-3 border border-yellow-300 px-6 py-3 bg-yellow-50 rounded-xl">
//              <div className="text-sm font-extrabold text-slate-900">Total Amount:</div>
//              <div className="text-xl font-extrabold text-emerald-700">{totalAmount}</div>
//            </div>
//          </div>
//        </Card>
//
//        <Card title="Rate - Approval - Part - 2 (Read Only)">
//          <div className="grid grid-cols-12 gap-4">
//            <Select
//              col="col-span-12 md:col-span-4"
//              label="Rate Approval Type"
//              value={rateApproval.approvalType}
//              onChange={(v) => setRateApproval((p) => ({ ...p, approvalType: v }))}
//              options={RATE_APPROVAL_TYPES}
//              readOnly={true}
//            />
//
//            <div className="col-span-12 md:col-span-4">
//              <label className="text-xs font-bold text-slate-600">Rate Approval Upload</label>
//              <input
//                type="file"
//                accept=".pdf,.png,.jpg,.jpeg"
//                onChange={() => alert("Rate Approval section is read-only")}
//                disabled={true}
//                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none cursor-not-allowed"
//              />
//              {rateApproval.uploadFileName && (
//                <div className="mt-1 text-xs text-green-600">
//                  ✅ Current file: {rateApproval.uploadFileName}
//                </div>
//              )}
//            </div>
//
//            <Select
//              col="col-span-12 md:col-span-4"
//              label="Approval Status"
//              value={rateApproval.approvalStatus}
//              onChange={(v) => setRateApproval((p) => ({ ...p, approvalStatus: v }))}
//              options={APPROVAL_STATUS}
//              readOnly={true}
//            />
//          </div>
//        </Card>
//      </div>
//    </div>
//  );
//}
"use client";

import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";

/* =========================
  CONSTANTS (Same as Create Page)
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
function useVehicleNegotiationSearch(currentVnn) {
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
            if (item.vnn !== currentVnn) {
              usedVnns.add(item.vnn);
            }
          }
        });
      }
      
      if (vnData.success && Array.isArray(vnData.data)) {
        const availableVNs = vnData.data.filter(vn => 
          !usedVnns.has(vn.vnnNo) || vn.vnnNo === currentVnn
        );
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
        const processedData = data.data.map(rm => ({
          ...rm,
          locationRates: rm.locationRates || [],
          rateSlabs: rm.locationRates?.flatMap(lr => [{
            fromQty: lr.fromQty,
            toQty: lr.toQty,
            rate: lr.rate,
            locationName: lr.locationName
          }]) || []
        }));
        setRateMasters(processedData);
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
  LOCATION DATA HOOK
========================= */
function useLocationData() {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState({});
  const [talukas, setTalukas] = useState({});
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStates = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/states', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setStates(data.data);
        return data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching states:', error);
      return [];
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
        setLocations(data.data);
      } else {
        setLocations([]);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      setLocations([]);
    }
  };

  const fetchDistrictsByState = async (stateId) => {
    if (!stateId) return [];
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/districts?stateId=${stateId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setDistricts(prev => ({ ...prev, [stateId]: data.data }));
        return data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching districts:', error);
      return [];
    }
  };

  const fetchTalukasByDistrict = async (districtId) => {
    if (!districtId) return [];
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/talukas?districtId=${districtId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setTalukas(prev => ({ ...prev, [districtId]: data.data }));
        return data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching talukas:', error);
      return [];
    }
  };

  return {
    states,
    districts,
    talukas,
    locations,
    loading,
    fetchStates,
    fetchLocations,
    fetchDistrictsByState,
    fetchTalukasByDistrict,
  };
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
    talukaId: "",
    district: "",
    districtName: "",
    districtId: "",
    state: "",
    stateName: "",
    stateId: "",
    country: "",
    countryName: "",
    locationRate: "",
    priceList: "",
    selectedRateMaster: null,
    weight: "",
    rate: "",
    totalAmount: 0,
    collectionCharges: "",
    cancellationCharges: "",
    loadingCharges: "",
    otherCharges: "",
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

function Input({ label, value, onChange, col = "", type = "text", readOnly = false, placeholder = "" }) {
  return (
    <div className={col}>
      <label className="text-xs font-bold text-slate-600">{label}</label>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        readOnly={readOnly}
        placeholder={placeholder}
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
  SEARCHABLE DROPDOWN COMPONENTS
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
  VEHICLE NEGOTIATION DROPDOWN
========================= */
function VehicleNegotiationHeaderDropdown({ 
  onSelect,
  placeholder = "Search vehicle negotiation...",
  currentVnn = null,
  readOnly = false
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [vnList, setVnList] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const fetchVehicleNegotiations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/vehicle-negotiation', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (data.success && Array.isArray(data.data)) {
        const pricingRes = await fetch('/api/pricing-panel?format=table', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const pricingData = await pricingRes.json();
        
        const usedVnns = new Set();
        if (pricingData.success && Array.isArray(pricingData.data)) {
          pricingData.data.forEach(item => {
            if (item.vnn && item.vnn !== '-' && item.vnn !== 'N/A') {
              if (item.vnn !== currentVnn) {
                usedVnns.add(item.vnn);
              }
            }
          });
        }
        
        const availableVNs = data.data.filter(vn => 
          !usedVnns.has(vn.vnnNo) || vn.vnnNo === currentVnn
        );
        setVnList(availableVNs);
      } else {
        setVnList([]);
      }
    } catch (err) {
      console.error('Error:', err);
      setVnList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicleNegotiations();
  }, [currentVnn]);

  useEffect(() => {
    if (currentVnn && currentVnn !== '-' && currentVnn !== 'N/A') {
      const currentVN = vnList.find(vn => vn.vnnNo === currentVnn);
      if (currentVN) {
        setSearchQuery(`${currentVN.vnnNo} - ${currentVN.customerName || ''}`);
      } else {
        setSearchQuery(currentVnn);
      }
    } else if (!currentVnn) {
      setSearchQuery("");
    }
  }, [currentVnn, vnList]);

  const handleSelectVN = async (vn) => {
    if (readOnly) return;
    setSearchQuery(`${vn.vnnNo} - ${vn.customerName || ''}`);
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
      console.error('Error:', error);
    }
  };

  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return vnList;
    return vnList.filter(vn =>
      vn.vnnNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vn.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vn.branchName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [vnList, searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setShowDropdown(true);
        }}
        onClick={() => setShowDropdown(true)}
        onFocus={() => setShowDropdown(true)}
        readOnly={readOnly}
        className={`w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
          readOnly ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
        }`}
        placeholder={placeholder}
        autoComplete="off"
      />
      
      {showDropdown && !readOnly && (
        <div 
          ref={dropdownRef}
          className="absolute z-[9999] w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-y-auto"
          style={{ maxHeight: '300px' }}
        >
          {loading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sky-500 mx-auto"></div>
              <p className="text-xs text-slate-500 mt-2">Loading...</p>
            </div>
          ) : filteredList.length > 0 ? (
            filteredList.map((vn) => (
              <div
                key={vn._id}
                onClick={() => handleSelectVN(vn)}
                className={`p-3 hover:bg-yellow-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors ${
                  vn.vnnNo === currentVnn ? 'bg-blue-50' : ''
                }`}
              >
                <div className="font-semibold text-slate-800">
                  {vn.vnnNo}
                  {vn.vnnNo === currentVnn && (
                    <span className="ml-2 text-xs text-green-600 font-medium">(Current)</span>
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Customer: {vn.customerName || 'N/A'} | Branch: {vn.branchName || 'N/A'}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Orders: {vn.orders?.length || 0}
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-slate-500">
              {searchQuery.trim() ? 
                `No results found for "${searchQuery}"` : 
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
  LOCATION RATE DROPDOWN
========================= */
function LocationRateDropdown({ 
  locations, 
  selectedName, 
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
  PRICE LIST DROPDOWN
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

  const filteredRateMasters = useMemo(() => {
    let filtered = rateMasters || [];
    
    if (branchId) {
      filtered = filtered.filter(rm => {
        const rmBranchId = rm.branchId?._id || rm.branchId;
        return String(rmBranchId) === String(branchId);
      });
    } else {
      return [];
    }
    
    if (customerId) {
      filtered = filtered.filter(rm => {
        const rmCustomerId = rm.customerId?._id || rm.customerId;
        return String(rmCustomerId) === String(customerId);
      });
    } else {
      return [];
    }
    
    if (locationName) {
      filtered = filtered.filter(rm => {
        return rm.locationRates && Array.isArray(rm.locationRates) && 
               rm.locationRates.some(lr => lr.locationName === locationName);
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
                  Branch: {rm.branchName || 'N/A'} | Customer: {rm.customerName || 'N/A'} | Locations: {rm.locationRates?.length || 0}
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 text-center text-sm text-slate-500">
              {searchQuery.trim() ? 
                `No price lists found for "${searchQuery}"` : 
                `No price lists available`
              }
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* =========================
  BILLING TYPE TABLE
========================= */
function BillingTypeTable({ billing, billingColumns }) {
  return (
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
                    disabled={true}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm outline-none cursor-not-allowed"
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
                    readOnly={true}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm outline-none cursor-not-allowed"
                    placeholder={`Enter ${col.label}`}
                  />
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/* =========================
  ORDERS TABLE COMPONENT - WITH ALL FIELDS IN ONE ROW
========================= */
/* =========================
  ORDERS TABLE COMPONENT - WITH ALL FIELDS IN ONE ROW
========================= */
function OrdersTable({ 
  rows, 
  onChange, 
  onRemove, 
  billingType, 
  selectedVehicleNegotiation,
  states,
  districts,
  talukas,
  locations,
  rateMasters,
  headerBranch,
  headerCustomerId,
  onFetchDistricts,
  onFetchTalukas
}) {
  const columns = [
    { key: "orderNo", label: "Order No *", width: "100px" },
    { key: "partyName", label: "Party Name", width: "130px" },
    { key: "plantCode", label: "Plant Code", width: "90px" },
    { key: "plantName", label: "Plant Name *Auto", width: "110px", readOnly: true },
    { key: "plantCodeValue", label: "Plant Code Value *Auto", width: "110px", readOnly: true },
    { key: "orderType", label: "Order Type", width: "90px" },
    { key: "pinCode", label: "Pin Code", width: "90px" },
    { key: "from", label: "From", width: "100px" },
    { key: "to", label: "To", width: "100px" },
    { key: "state", label: "State", width: "100px" },
    { key: "district", label: "District", width: "100px" },
    { key: "taluka", label: "Taluka", width: "100px" },
    { key: "locationRate", label: "Location Rate", width: "140px" },
    { key: "priceList", label: "Price List", width: "160px" },
    { key: "weight", label: "Weight", type: "number", width: "70px" },
    { key: "rate", label: "Rate (₹)", type: "number", width: "80px", readOnly: true },
    { key: "totalAmount", label: "Total Amount", type: "number", width: "90px", readOnly: true },
    { key: "collectionCharges", label: "Collection Charges", type: "number", width: "110px" },
    { key: "cancellationCharges", label: "Cancellation Charges", width: "120px" },
    { key: "loadingCharges", label: "Loading Charges", width: "110px" },
    { key: "otherCharges", label: "Other Charges", type: "number", width: "100px" },
  ];

  const isReadOnlyMode = !!selectedVehicleNegotiation;

  const handleStateChange = async (rowId, stateId, stateName) => {
    onChange(rowId, 'stateId', stateId);
    onChange(rowId, 'stateName', stateName);
    onChange(rowId, 'districtId', '');
    onChange(rowId, 'districtName', '');
    onChange(rowId, 'talukaId', '');
    onChange(rowId, 'talukaName', '');
    
    if (stateId) {
      await onFetchDistricts(stateId);
    }
  };

  const handleDistrictChange = async (rowId, districtId, districtName) => {
    onChange(rowId, 'districtId', districtId);
    onChange(rowId, 'districtName', districtName);
    onChange(rowId, 'talukaId', '');
    onChange(rowId, 'talukaName', '');
    
    if (districtId) {
      await onFetchTalukas(districtId);
    }
  };

  const handleTalukaChange = (rowId, talukaId, talukaName) => {
    onChange(rowId, 'talukaId', talukaId);
    onChange(rowId, 'talukaName', talukaName);
  };

  const handleLocationRateSelect = (rowId, locationName) => {
    onChange(rowId, 'locationRate', locationName);
    onChange(rowId, 'priceList', '');
    onChange(rowId, 'rate', '');
    onChange(rowId, 'selectedRateMaster', null);
  };

  const handlePriceListSelect = (rowId, rateMaster) => {
    onChange(rowId, 'priceList', rateMaster.title);
    onChange(rowId, 'selectedRateMaster', rateMaster);
    
    const currentRow = rows.find(r => r._id === rowId);
    if (currentRow && currentRow.weight && currentRow.locationRate) {
      const locationRate = rateMaster.locationRates?.find(lr => 
        lr.locationName === currentRow.locationRate
      );
      
      if (locationRate) {
        const weightNum = parseFloat(currentRow.weight);
        if (weightNum >= locationRate.fromQty && weightNum <= locationRate.toQty) {
          onChange(rowId, 'rate', locationRate.rate);
        } else {
          onChange(rowId, 'rate', '');
          alert(`Weight ${currentRow.weight} is outside the range (${locationRate.fromQty} - ${locationRate.toQty}) for this price list`);
        }
      }
    }
  };

  const handleWeightChange = (rowId, weight) => {
    onChange(rowId, 'weight', weight);
    
    const currentRow = rows.find(r => r._id === rowId);
    if (currentRow && currentRow.selectedRateMaster && currentRow.locationRate) {
      const locationRate = currentRow.selectedRateMaster.locationRates?.find(lr => 
        lr.locationName === currentRow.locationRate
      );
      
      if (locationRate) {
        const weightNum = parseFloat(weight);
        if (weightNum >= locationRate.fromQty && weightNum <= locationRate.toQty) {
          onChange(rowId, 'rate', locationRate.rate);
        } else {
          onChange(rowId, 'rate', '');
        }
      }
    }
  };

  return (
    <div className="overflow-auto rounded-xl border border-yellow-300 max-h-[600px]">
      <table className="min-w-max w-full text-sm">
        <thead className="sticky top-0 bg-yellow-400 z-10">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="border border-yellow-500 px-2 py-2 text-xs font-extrabold text-slate-900 text-center whitespace-nowrap"
                style={{ minWidth: col.width }}
              >
                {col.label}
                {col.readOnly && <span className="ml-1 text-xs text-blue-600">*</span>}
              </th>
            ))}
            {billingType === "Multi - Order" && !isReadOnlyMode && (
              <th className="border border-yellow-500 px-2 py-2 text-xs font-extrabold text-slate-900 text-center whitespace-nowrap">
                Actions
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => {
            const totalAmount = num(row.weight) * num(row.rate);
            const isFromVehicleNegotiation = !!row.vehicleNegotiationId || isReadOnlyMode;
            const districtOptions = districts[row.stateId] || [];
            const talukaOptions = talukas[row.districtId] || [];
            const currentCustomerId = row.customerId || headerCustomerId;
            
            return (
              <tr key={row._id} className="hover:bg-yellow-50 even:bg-slate-50">
                <td className="border border-yellow-300 px-1 py-1">
                  <input
                    value={row.orderNo || ""}
                    onChange={(e) => onChange(row._id, 'orderNo', e.target.value)}
                    className={`w-full min-w-[80px] rounded border border-slate-200 px-1 py-1 text-xs outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-200 ${
                      isFromVehicleNegotiation ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    placeholder="Order No"
                    readOnly={isFromVehicleNegotiation}
                  />
                </td>

                <td className="border border-yellow-300 px-1 py-1">
                  <input
                    value={row.partyName || ""}
                    readOnly={true}
                    className="w-full min-w-[100px] rounded border border-slate-200 bg-slate-50 px-1 py-1 text-xs outline-none cursor-not-allowed"
                    placeholder="Party Name"
                  />
                </td>

                <td className="border border-yellow-300 px-1 py-1">
                  <input
                    value={row.plantCode || ""}
                    onChange={(e) => onChange(row._id, 'plantCode', e.target.value)}
                    className={`w-full min-w-[70px] rounded border border-slate-200 px-1 py-1 text-xs outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-200 ${
                      isFromVehicleNegotiation ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    placeholder="Plant Code"
                    readOnly={isFromVehicleNegotiation}
                  />
                </td>

                <td className="border border-yellow-300 px-1 py-1">
                  <input
                    type="text"
                    value={row.plantName || ""}
                    readOnly
                    className="w-full min-w-[90px] rounded border border-slate-200 bg-slate-50 px-1 py-1 text-xs outline-none"
                    placeholder="Auto-filled"
                  />
                </td>

                <td className="border border-yellow-300 px-1 py-1">
                  <input
                    type="text"
                    value={row.plantCodeValue || ""}
                    readOnly
                    className="w-full min-w-[90px] rounded border border-slate-200 bg-slate-50 px-1 py-1 text-xs outline-none"
                    placeholder="Auto-filled"
                  />
                </td>

                <td className="border border-yellow-300 px-1 py-1">
                  <select
                    value={row.orderType || ""}
                    onChange={(e) => onChange(row._id, 'orderType', e.target.value)}
                    className={`w-full min-w-[80px] rounded border border-slate-200 px-1 py-1 text-xs outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-200 ${
                      isFromVehicleNegotiation ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    disabled={isFromVehicleNegotiation}
                  >
                    <option value="">Select</option>
                    {ORDER_TYPES.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </td>

                <td className="border border-yellow-300 px-1 py-1">
                  <input
                    type="text"
                    value={row.pinCode || ""}
                    onChange={(e) => onChange(row._id, 'pinCode', e.target.value)}
                    className={`w-full min-w-[70px] rounded border border-slate-200 px-1 py-1 text-xs outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-200 ${
                      isFromVehicleNegotiation ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    placeholder="Pin Code"
                    readOnly={isFromVehicleNegotiation}
                  />
                </td>

                <td className="border border-yellow-300 px-1 py-1">
                  <input
                    value={row.fromName || ""}
                    onChange={(e) => onChange(row._id, 'fromName', e.target.value)}
                    className={`w-full min-w-[80px] rounded border border-slate-200 px-1 py-1 text-xs outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-200 ${
                      isFromVehicleNegotiation ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    placeholder="From"
                    readOnly={isFromVehicleNegotiation}
                  />
                </td>

                <td className="border border-yellow-300 px-1 py-1">
                  <input
                    value={row.toName || ""}
                    onChange={(e) => onChange(row._id, 'toName', e.target.value)}
                    className={`w-full min-w-[80px] rounded border border-slate-200 px-1 py-1 text-xs outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-200 ${
                      isFromVehicleNegotiation ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    placeholder="To"
                    readOnly={isFromVehicleNegotiation}
                  />
                </td>

                <td className="border border-yellow-300 px-1 py-1">
                  <select
                    value={row.stateId || ""}
                    onChange={(e) => {
                      const selectedState = states.find(s => s._id === e.target.value);
                      handleStateChange(row._id, e.target.value, selectedState?.name || "");
                    }}
                    className={`w-full min-w-[100px] rounded border border-slate-200 px-1 py-1 text-xs outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-200 ${
                      isFromVehicleNegotiation ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    disabled={isFromVehicleNegotiation}
                  >
                    <option value="">Select State</option>
                    {states.map((state) => (
                      <option key={state._id} value={state._id}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="border border-yellow-300 px-1 py-1">
                  <select
                    value={row.districtId || ""}
                    onChange={(e) => {
                      const selectedDistrict = districtOptions.find(d => d._id === e.target.value);
                      handleDistrictChange(row._id, e.target.value, selectedDistrict?.name || "");
                    }}
                    className={`w-full min-w-[100px] rounded border border-slate-200 px-1 py-1 text-xs outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-200 ${
                      (isFromVehicleNegotiation || !row.stateId) ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    disabled={isFromVehicleNegotiation || !row.stateId}
                  >
                    <option value="">Select District</option>
                    {districtOptions.map((district) => (
                      <option key={district._id} value={district._id}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="border border-yellow-300 px-1 py-1">
                  <select
                    value={row.talukaId || ""}
                    onChange={(e) => {
                      const selectedTaluka = talukaOptions.find(t => t._id === e.target.value);
                      handleTalukaChange(row._id, e.target.value, selectedTaluka?.name || "");
                    }}
                    className={`w-full min-w-[100px] rounded border border-slate-200 px-1 py-1 text-xs outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-200 ${
                      (isFromVehicleNegotiation || !row.districtId) ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    disabled={isFromVehicleNegotiation || !row.districtId}
                  >
                    <option value="">Select Taluka</option>
                    {talukaOptions.map((taluka) => (
                      <option key={taluka._id} value={taluka._id}>
                        {taluka.name}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="border border-yellow-300 px-1 py-1">
                  <LocationRateDropdown
                    locations={locations}
                    selectedName={row.locationRate}
                    onSelect={(locationName) => handleLocationRateSelect(row._id, locationName)}
                    readOnly={false}
                    placeholder="Select Location..."
                  />
                </td>

                <td className="border border-yellow-300 px-1 py-1">
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

                <td className="border border-yellow-300 px-1 py-1">
                  <input
                    type="number"
                    step="0.01"
                    value={row.weight || ""}
                    onChange={(e) => handleWeightChange(row._id, e.target.value)}
                    className={`w-full min-w-[60px] rounded border border-slate-200 px-1 py-1 text-xs outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-200 ${
                      isFromVehicleNegotiation ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    placeholder="Weight"
                    readOnly={isFromVehicleNegotiation}
                  />
                </td>

                <td className="border border-yellow-300 px-1 py-1">
                  <input
                    type="number"
                    step="0.01"
                    value={row.rate || ""}
                    readOnly
                    className="w-full min-w-[60px] rounded border border-slate-200 bg-slate-50 px-1 py-1 text-xs outline-none cursor-not-allowed"
                    placeholder="Auto"
                  />
                </td>

                <td className="border border-yellow-300 px-1 py-1">
                  <input
                    type="number"
                    value={totalAmount}
                    readOnly
                    className="w-full min-w-[70px] rounded border border-slate-200 bg-slate-50 px-1 py-1 text-xs outline-none"
                  />
                </td>

                <td className="border border-yellow-300 px-1 py-1">
                  <input
                    type="number"
                    step="0.01"
                    value={row.collectionCharges || ""}
                    onChange={(e) => onChange(row._id, 'collectionCharges', e.target.value)}
                    className="w-full min-w-[80px] rounded border border-slate-200 bg-white px-1 py-1 text-xs outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-200"
                    placeholder="Collection"
                  />
                </td>

                <td className="border border-yellow-300 px-1 py-1">
                  <input
                    value={row.cancellationCharges || ""}
                    onChange={(e) => onChange(row._id, 'cancellationCharges', e.target.value)}
                    className="w-full min-w-[90px] rounded border border-slate-200 bg-white px-1 py-1 text-xs outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-200"
                    placeholder="Cancellation"
                  />
                </td>

                <td className="border border-yellow-300 px-1 py-1">
                  <input
                    value={row.loadingCharges || ""}
                    onChange={(e) => onChange(row._id, 'loadingCharges', e.target.value)}
                    className="w-full min-w-[80px] rounded border border-slate-200 bg-white px-1 py-1 text-xs outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-200"
                    placeholder="Loading"
                  />
                </td>

                <td className="border border-yellow-300 px-1 py-1">
                  <input
                    type="number"
                    step="0.01"
                    value={row.otherCharges || ""}
                    onChange={(e) => onChange(row._id, 'otherCharges', e.target.value)}
                    className="w-full min-w-[70px] rounded border border-slate-200 bg-white px-1 py-1 text-xs outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-200"
                    placeholder="Other"
                  />
                </td>

                {billingType === "Multi - Order" && !isReadOnlyMode && (
                  <td className="border border-yellow-300 px-1 py-1 text-center">
                    <button
                      onClick={() => onRemove(row._id)}
                      className="rounded bg-red-500 px-2 py-1 text-xs font-bold text-white hover:bg-red-600 transition"
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

  const [branches, setBranches] = useState([]);
  const [countries, setCountries] = useState([]);
  const [plants, setPlants] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const locationData = useLocationData();
  const customerSearch = useCustomerSearch();
  const rateMasterSearch = useRateMasterSearch();

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedVehicleNegotiation, setSelectedVehicleNegotiation] = useState(null);
  const [currentVnn, setCurrentVnn] = useState("");

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

  const [orders, setOrders] = useState([]);

  const [rateApproval, setRateApproval] = useState({
    approvalType: "Contract Rates",
    uploadFile: null,
    uploadFileName: "",
    approvalStatus: "Pending",
  });

  useEffect(() => {
    fetchBranches();
    fetchCountries();
    fetchPlants();
    fetchPricingPanelData();
    locationData.fetchStates();
    locationData.fetchLocations();
    customerSearch.searchCustomers();
    rateMasterSearch.searchRateMasters();
  }, []);

  const fetchPricingPanelData = async () => {
    setFetchLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch(`/api/pricing-panel?id=${panelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch pricing panel');
      }

      const panel = data.data;
      
      // Get VNN from orders
      if (panel.orders && panel.orders.length > 0) {
        const firstOrder = panel.orders[0];
        let vnnValue = null;
        
        if (firstOrder.vnnNumber) {
          vnnValue = firstOrder.vnnNumber;
        } else if (firstOrder.vnn) {
          vnnValue = firstOrder.vnn;
        }
        
        if (vnnValue) {
          setCurrentVnn(vnnValue);
        }
      }
      
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

      setBilling({
        billingType: panel.billingType || "Multi - Order",
        loadingPoints: panel.loadingPoints?.toString() || "",
        dropPoints: panel.dropPoints?.toString() || "",
        collectionCharges: panel.collectionCharges || 0,
        cancellationCharges: panel.cancellationCharges || "Nil",
        loadingCharges: panel.loadingCharges || "Nil",
        otherCharges: panel.otherCharges || 0,
      });

      if (panel.orders && panel.orders.length > 0) {
        const processedOrders = panel.orders.map(order => ({
          ...order,
          _id: order._id || uid(),
          weight: order.weight?.toString() || "",
          rate: order.rate?.toString() || "",
          locationRate: order.locationRate || "",
          taluka: order.taluka || "",
          talukaName: order.talukaName || order.taluka || "",
          talukaId: order.talukaId || "",
          districtId: order.districtId || "",
          stateId: order.stateId || "",
          vehicleNegotiationId: order.vehicleNegotiationId || "",
          priceList: order.priceList || "",
          selectedRateMaster: null,
          collectionCharges: order.collectionCharges?.toString() || "",
          cancellationCharges: order.cancellationCharges || "",
          loadingCharges: order.loadingCharges || "",
          otherCharges: order.otherCharges?.toString() || "",
        }));
        setOrders(processedOrders);
      } else {
        setOrders([defaultOrderRow()]);
      }

      if (panel.rateApproval) {
        setRateApproval({
          approvalType: panel.rateApproval.approvalType || "Contract Rates",
          uploadFile: null,
          uploadFileName: panel.rateApproval.uploadFile || "",
          approvalStatus: panel.rateApproval.approvalStatus || "Pending",
        });
      }

      if (panel.partyName) {
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

  const handleSelectVehicleNegotiation = async (fullVN) => {
    setSelectedVehicleNegotiation(fullVN);
    setCurrentVnn(fullVN.vnnNo);

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

    setBilling(prev => ({
      ...prev,
      collectionCharges: fullVN.collectionCharges || 0,
      cancellationCharges: fullVN.cancellationCharges || "Nil",
      loadingCharges: fullVN.loadingCharges || "Nil",
      otherCharges: fullVN.otherCharges || 0,
      loadingPoints: prev.loadingPoints || fullVN.loadingPoints || "",
      dropPoints: prev.dropPoints || fullVN.dropPoints || ""
    }));

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
        taluka: order.taluka || "",
        talukaName: order.talukaName || order.taluka || "",
        talukaId: order.talukaId || "",
        district: order.district,
        districtName: order.districtName || "",
        districtId: order.districtId || "",
        state: order.state,
        stateName: order.stateName || "",
        stateId: order.stateId || "",
        country: order.country,
        countryName: order.countryName || "",
        locationRate: "",
        priceList: "",
        selectedRateMaster: null,
        weight: order.weight || "",
        rate: "",
        totalAmount: 0,
        collectionCharges: "",
        cancellationCharges: "",
        loadingCharges: "",
        otherCharges: "",
      }));
      
      setOrders(newOrders);
    }
  };

  const updateOrder = (id, key, value) => {
    setOrders((prev) => prev.map((r) => (r._id === id ? { ...r, [key]: value } : r)));
  };

  const addOrder = () => {
    setOrders((prev) => [...prev, { ...defaultOrderRow(), _id: uid() }]);
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
    if (value === "Single - Order" && orders.length > 1) {
      setOrders([orders[0]]);
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
          taluka: order.taluka,
          talukaName: order.talukaName,
          talukaId: order.talukaId,
          district: order.district,
          districtName: order.districtName,
          districtId: order.districtId,
          state: order.state,
          stateName: order.stateName,
          stateId: order.stateId,
          country: order.country,
          countryName: order.countryName,
          locationRate: order.locationRate,
          priceList: order.priceList,
          weight: num(order.weight),
          rate: num(order.rate),
          totalAmount: num(order.weight) * num(order.rate),
          collectionCharges: num(order.collectionCharges) || 0,
          cancellationCharges: order.cancellationCharges || "Nil",
          loadingCharges: order.loadingCharges || "Nil",
          otherCharges: num(order.otherCharges) || 0
        })),
        totalWeight,
        totalAmount,
        rateApproval: {
          approvalType: rateApproval.approvalType,
          approvalStatus: rateApproval.approvalStatus,
          uploadFile: rateApproval.uploadFileName
        }
      };

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
    }
  };

  const billingColumns = [
    { key: "billingType", label: "Billing Type", options: BILLING_TYPES },
    { key: "loadingPoints", label: "No. of Loading Points", type: "number" },
    { key: "dropPoints", label: "No. of Droping Point", type: "number" },
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
              disabled={saving}
              className={`rounded-xl px-5 py-2 text-sm font-bold text-white transition ${
                saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-600 hover:bg-yellow-700'
              }`}
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </span>
              ) : 'Update Pricing Panel'}
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
                {header.pricingSerialNo}
              </div>
            </div>

            <div className="col-span-12 md:col-span-3 relative">
              <label className="text-xs font-bold text-slate-600">Search Vehicle Negotiation</label>
              <VehicleNegotiationHeaderDropdown
                onSelect={handleSelectVehicleNegotiation}
                placeholder="Search by VNN..."
                currentVnn={currentVnn}
                readOnly={false}
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
                readOnly={true}
              />
            </div>

            <Select
              col="col-span-12 md:col-span-3"
              label="Delivery"
              value={header.delivery}
              onChange={(v) => setHeader((p) => ({ ...p, delivery: v }))}
              options={DELIVERY_TYPES}
              readOnly={true}
            />

            <Input
              type="date"
              col="col-span-12 md:col-span-3"
              label="Date"
              value={header.date}
              onChange={(v) => setHeader((p) => ({ ...p, date: v }))}
              readOnly={true}
            />
            
            <div className="col-span-12 md:col-span-3 relative">
              <label className="text-xs font-bold text-slate-600">Party Name</label>
              <input
                type="text"
                value={selectedCustomer ? selectedCustomer.customerName : header.partyName}
                readOnly={true}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none cursor-not-allowed"
                placeholder="Party Name"
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="text-sm font-bold text-slate-700 mb-2">Billing Type / Charges (Read Only)</div>
            <BillingTypeTable billing={billing} billingColumns={billingColumns} />
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
              states={locationData.states}
              districts={locationData.districts}
              talukas={locationData.talukas}
              locations={locationData.locations}
              rateMasters={rateMasterSearch.rateMasters}
              headerBranch={header.branch}
              headerCustomerId={header.customerId}
              onFetchDistricts={locationData.fetchDistrictsByState}
              onFetchTalukas={locationData.fetchTalukasByDistrict}
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
                onChange={() => alert("Rate Approval section is read-only")}
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