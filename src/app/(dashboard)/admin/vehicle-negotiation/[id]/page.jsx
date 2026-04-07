"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

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

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function formatDateDDMMYYYY(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

/* =======================
  Supplier Search Hook
========================= */
function useSupplierSearch() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchSuppliers = async (query = "") => {
    setLoading(true);
    setError(null);
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
        setError(data.message || 'No suppliers found');
      }
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      setSuppliers([]);
      setError('Failed to fetch suppliers');
    } finally {
      setLoading(false);
    }
  };

  return { suppliers, loading, error, searchSuppliers };
}

/* =======================
  Customer Search Hook
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

/* =======================
  Vehicle Search Hook
========================= */
function useVehicleSearch() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchVehicles = async (query = "") => {
    setLoading(true);
    setError(null);
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
        setError(data.message || 'No vehicles found');
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setVehicles([]);
      setError('Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  const getVehicleById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/vehicles?id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.success && data.data) {
        return data.data;
      } else {
        setError(data.message || 'Vehicle not found');
        return null;
      }
    } catch (err) {
      console.error('Error fetching vehicle:', err);
      setError('Failed to fetch vehicle');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount
  useEffect(() => {
    searchVehicles();
  }, []);

  return { vehicles, loading, error, searchVehicles, getVehicleById };
}

/* =======================
  Order Panel Search Hook
========================= */
function useOrderPanelSearch() {
  const [orderPanels, setOrderPanels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchOrderPanels = async (query = "") => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      
      // First, fetch all vehicle negotiations to see which order panels are already used
      const vehicleRes = await fetch('/api/vehicle-negotiation?format=table', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const vehicleData = await vehicleRes.json();
      
      // Get unique order panel IDs from vehicle negotiations
      const usedOrderPanelIds = new Set();
      if (vehicleData.success && Array.isArray(vehicleData.data)) {
        vehicleData.data.forEach(item => {
          if (item.order && item.order !== 'N/A') {
            const orderNo = item.order;
            usedOrderPanelIds.add(orderNo);
          }
        });
      }
      
      // Now fetch all order panels
      const res = await fetch('/api/order-panel', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.success && Array.isArray(data.data)) {
        // Filter out order panels that are already used in vehicle negotiations
        const availablePanels = data.data.filter(panel => 
          !usedOrderPanelIds.has(panel.orderPanelNo)
        );
        
        setOrderPanels(availablePanels);
        console.log(`📊 Found ${availablePanels.length} available order panels out of ${data.data.length} total`);
      } else {
        setOrderPanels([]);
        setError(data.message || 'No order panels found');
      }
    } catch (err) {
      console.error('Error fetching order panels:', err);
      setOrderPanels([]);
      setError('Failed to fetch order panels');
    } finally {
      setLoading(false);
    }
  };

  const getOrderPanelById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/order-panel?id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.success && data.data) {
        return data.data;
      } else {
        setError(data.message || 'Order panel not found');
        return null;
      }
    } catch (err) {
      console.error('Error fetching order panel:', err);
      setError('Failed to fetch order panel');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount
  useEffect(() => {
    searchOrderPanels();
  }, []);

  return { orderPanels, loading, error, searchOrderPanels, getOrderPanelById };
}

/* =======================
  DEFAULT ROWS
======================= */
function defaultOrderRow(index = 1) {
  return {
    _id: uid(),
    orderNo: "",
    orderPanelId: "",
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
    weight: "",
    status: "Open",
  };
}

function defaultVendorRow() {
  return {
    _id: uid(),
    vendorName: "",
    vendorCode: "",
    marketRate: "",
  };
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
  Searchable Dropdown Component (for table cells)
========================= */
function TableSearchableDropdown({ 
  items, 
  selectedId, 
  onSelect, 
  placeholder = "Search...",
  required = false,
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
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    if (isUpdatingRef.current) return;
    
    if (selectedId) {
      const item = items.find(i => i._id === selectedId || i.code === selectedId);
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
  }, [items, selectedId, displayField, codeField]);

  useEffect(() => {
    setFilteredItems(items);
  }, [items]);

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
    
    if (selectedItem && query !== getDisplayValue(selectedItem)) {
      setSelectedItem(null);
      isUpdatingRef.current = true;
      onSelect?.(null);
      setTimeout(() => { isUpdatingRef.current = false; }, 100);
    }
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setSearchQuery(getDisplayValue(item));
    setShowDropdown(false);
    isUpdatingRef.current = true;
    onSelect?.(item);
    setTimeout(() => { isUpdatingRef.current = false; }, 100);
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
        required={required}
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
                className={`p-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors ${
                  selectedItem?._id === item._id ? 'bg-sky-50' : ''
                }`}
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
  Regular Searchable Dropdown (for use outside tables)
========================= */
function SearchableDropdown({ 
  items, 
  selectedId, 
  onSelect, 
  placeholder = "Search...",
  required = false,
  displayField = 'name',
  codeField = 'code',
  disabled = false
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
    if (displayField === 'customerName') return item.customerName || "";
    if (displayField === 'supplierName') return `${item.supplierName || ''} (${item.supplierCode || ''})`;
    if (displayField === 'vehicleNumber') return `${item.vehicleNumber} - ${item.ownerName || ''}`;
    const display = item[displayField] || "";
    const code = item[codeField] ? `(${item[codeField]})` : "";
    return `${display} ${code}`.trim();
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredItems(items);
    } else {
      const filtered = items.filter(item => {
        if (displayField === 'supplierName') {
          return (item.supplierName && item.supplierName.toLowerCase().includes(query.toLowerCase())) ||
                 (item.supplierCode && item.supplierCode.toLowerCase().includes(query.toLowerCase()));
        }
        if (displayField === 'vehicleNumber') {
          return (item.vehicleNumber && item.vehicleNumber.toLowerCase().includes(query.toLowerCase())) ||
                 (item.ownerName && item.ownerName.toLowerCase().includes(query.toLowerCase())) ||
                 (item.rcNumber && item.rcNumber.toLowerCase().includes(query.toLowerCase()));
        }
        return (item[displayField] && item[displayField].toLowerCase().includes(query.toLowerCase())) ||
               (item[codeField] && item[codeField].toLowerCase().includes(query.toLowerCase())) ||
               (item.customerName && item.customerName.toLowerCase().includes(query.toLowerCase()));
      });
      setFilteredItems(filtered);
    }
    
    if (selectedItem && query !== getDisplayValue(selectedItem)) {
      setSelectedItem(null);
      onSelect?.(null);
    }
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setSearchQuery(getDisplayValue(item));
    setShowDropdown(false);
    onSelect?.(item);
  };

  const handleInputFocus = () => {
    if (!showDropdown) {
      setFilteredItems(items);
      setShowDropdown(true);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      if (dropdownRef.current && !dropdownRef.current.contains(document.activeElement)) {
        setShowDropdown(false);
        if (selectedItem) {
          setSearchQuery(getDisplayValue(selectedItem));
        }
      }
    }, 200);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 disabled:opacity-50"
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete="off"
      />
      
      {showDropdown && (
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
                  {displayField === 'supplierName' ? item.supplierName : 
                   displayField === 'vehicleNumber' ? item.vehicleNumber : 
                   (item[displayField] || item.customerName)}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {displayField === 'supplierName' ? (
                    <>
                      Code: {item.supplierCode} | Status: {item.supplierStatus || 'Active'}
                    </>
                  ) : displayField === 'vehicleNumber' ? (
                    <>
                      Owner: {item.ownerName} | RC: {item.rcNumber}
                    </>
                  ) : (
                    item[codeField] && `Code: ${item[codeField]}`
                  )}
                </div>
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

/* =======================
  Supplier Search Dropdown Component (for Part 3)
========================= */
function SupplierSearchDropdown({ 
  value, 
  onSelect,
  placeholder = "Search supplier...",
  readOnly = false
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const dropdownRef = useRef(null);
  const supplierSearch = useSupplierSearch();

  useEffect(() => {
    if (value) {
      setSearchQuery(value);
    } else {
      setSearchQuery("");
    }
  }, [value]);

  useEffect(() => {
    setSuppliers(supplierSearch.suppliers);
  }, [supplierSearch.suppliers]);

  const handleSearch = (query) => {
    if (readOnly) return;
    setSearchQuery(query);
    if (!showDropdown) {
      setShowDropdown(true);
    }
    
    if (!query.trim()) {
      setSuppliers(supplierSearch.suppliers);
    } else {
      const filtered = supplierSearch.suppliers.filter(supplier =>
        supplier.supplierName?.toLowerCase().includes(query.toLowerCase()) ||
        supplier.supplierCode?.toLowerCase().includes(query.toLowerCase())
      );
      setSuppliers(filtered);
    }
  };

  const handleSelectItem = (supplier) => {
    if (readOnly) return;
    setSearchQuery(supplier.supplierName);
    setShowDropdown(false);
    onSelect(supplier);
  };

  const handleInputFocus = async () => {
    if (readOnly) return;
    if (supplierSearch.suppliers.length === 0) {
      await supplierSearch.searchSuppliers();
    }
    setSuppliers(supplierSearch.suppliers);
    setShowDropdown(true);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={handleInputFocus}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        readOnly={readOnly}
        className={`mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
          readOnly ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
        }`}
        placeholder={placeholder}
        autoComplete="off"
      />
      
      {showDropdown && !readOnly && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {supplierSearch.loading ? (
            <div className="p-3 text-center text-sm text-slate-500">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sky-500 mx-auto"></div>
              <p className="mt-1">Loading suppliers...</p>
            </div>
          ) : suppliers.length > 0 ? (
            suppliers.map((supplier) => (
              <div
                key={supplier._id}
                onMouseDown={() => handleSelectItem(supplier)}
                className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors"
              >
                <div className="font-medium text-slate-800">
                  {supplier.supplierName}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Code: {supplier.supplierCode} | Status: {supplier.supplierStatus || 'Active'}
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 text-center text-sm text-slate-500">
              No suppliers found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* =======================
  Vehicle Search Dropdown Component
========================= */
function VehicleSearchDropdown({ 
  value, 
  onSelect,
  placeholder = "Search vehicle..."
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const dropdownRef = useRef(null);
  const vehicleSearch = useVehicleSearch();

  useEffect(() => {
    if (value) {
      setSearchQuery(value);
    } else {
      setSearchQuery("");
    }
  }, [value]);

  useEffect(() => {
    setVehicles(vehicleSearch.vehicles);
  }, [vehicleSearch.vehicles]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!showDropdown) {
      setShowDropdown(true);
    }
    
    if (!query.trim()) {
      setVehicles(vehicleSearch.vehicles);
    } else {
      const filtered = vehicleSearch.vehicles.filter(vehicle =>
        vehicle.vehicleNumber?.toLowerCase().includes(query.toLowerCase()) ||
        vehicle.ownerName?.toLowerCase().includes(query.toLowerCase()) ||
        vehicle.rcNumber?.toLowerCase().includes(query.toLowerCase())
      );
      setVehicles(filtered);
    }
  };

  const handleSelectItem = (vehicle) => {
    setSearchQuery(vehicle.vehicleNumber);
    setShowDropdown(false);
    onSelect(vehicle);
  };

  const handleInputFocus = async () => {
    if (vehicleSearch.vehicles.length === 0) {
      await vehicleSearch.searchVehicles();
    }
    setVehicles(vehicleSearch.vehicles);
    setShowDropdown(true);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={handleInputFocus}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
        placeholder={placeholder}
        autoComplete="off"
      />
      
      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {vehicleSearch.loading ? (
            <div className="p-3 text-center text-sm text-slate-500">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sky-500 mx-auto"></div>
              <p className="mt-1">Loading vehicles...</p>
            </div>
          ) : vehicles.length > 0 ? (
            vehicles.map((vehicle) => (
              <div
                key={vehicle._id}
                onMouseDown={() => handleSelectItem(vehicle)}
                className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors"
              >
                <div className="font-medium text-slate-800">
                  {vehicle.vehicleNumber}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Owner: {vehicle.ownerName} | RC: {vehicle.rcNumber}
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 text-center text-sm text-slate-500">
              No vehicles found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* =======================
  Multi-Select Order Panel Dropdown Component
========================= */
function MultiSelectOrderPanelDropdown({ 
  selectedPanels = [],
  onSelect,
  placeholder = "Search and select order panels..."
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [panels, setPanels] = useState([]);
  const [allPanels, setAllPanels] = useState([]);
  const [count, setCount] = useState(0);
  const dropdownRef = useRef(null);
  const orderPanelSearch = useOrderPanelSearch();

  useEffect(() => {
    if (orderPanelSearch.orderPanels.length > 0) {
      setAllPanels(orderPanelSearch.orderPanels);
      
      const selectedIds = selectedPanels.map(p => p._id);
      const filtered = orderPanelSearch.orderPanels.filter(
        panel => !selectedIds.includes(panel._id)
      );
      setPanels(filtered);
      setCount(filtered.length);
    }
  }, [orderPanelSearch.orderPanels, selectedPanels]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!showDropdown) {
      setShowDropdown(true);
    }
    
    const selectedIds = selectedPanels.map(p => p._id);
    
    if (!query.trim()) {
      const filtered = allPanels.filter(panel => !selectedIds.includes(panel._id));
      setPanels(filtered);
      setCount(filtered.length);
    } else {
      const filtered = allPanels.filter(panel => 
        !selectedIds.includes(panel._id) && (
          panel.orderPanelNo?.toLowerCase().includes(query.toLowerCase()) ||
          panel.partyName?.toLowerCase().includes(query.toLowerCase()) ||
          panel.customerName?.toLowerCase().includes(query.toLowerCase())
        )
      );
      setPanels(filtered);
      setCount(filtered.length);
    }
  };

  const handleSelectPanel = async (panel) => {
    setSearchQuery("");
    
    if (selectedPanels.some(p => p._id === panel._id)) {
      alert("This order panel is already selected");
      return;
    }
    
    try {
      const fullPanel = await orderPanelSearch.getOrderPanelById(panel._id);
      if (fullPanel) {
        onSelect(fullPanel);
        
        setPanels(prev => {
          const newPanels = prev.filter(p => p._id !== panel._id);
          setCount(newPanels.length);
          return newPanels;
        });
      }
    } catch (error) {
      console.error('Error fetching order panel details:', error);
    }
  };

  const handleRemovePanel = (panelId) => {
    const removedPanel = selectedPanels.find(p => p._id === panelId);
    onSelect(null, panelId);
    
    if (removedPanel) {
      const panelToAdd = allPanels.find(p => p._id === panelId);
      if (panelToAdd) {
        setPanels(prev => {
          if (!prev.some(p => p._id === panelId)) {
            const newPanels = [...prev, panelToAdd].sort((a, b) => 
              (a.orderPanelNo || '').localeCompare(b.orderPanelNo || '')
            );
            setCount(newPanels.length);
            return newPanels;
          }
          return prev;
        });
      }
    }
  };

  const handleInputFocus = async () => {
    await orderPanelSearch.searchOrderPanels();
    
    const selectedIds = selectedPanels.map(p => p._id);
    const filtered = orderPanelSearch.orderPanels.filter(
      panel => !selectedIds.includes(panel._id)
    );
    setPanels(filtered);
    setCount(filtered.length);
    setShowDropdown(true);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {selectedPanels.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 p-2 border border-yellow-200 rounded-lg bg-yellow-50">
          {selectedPanels.map((panel) => (
            <div
              key={panel._id}
              className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-md text-sm"
            >
              <span className="font-medium">{panel.orderPanelNo}</span>
              <button
                onClick={() => handleRemovePanel(panel._id)}
                className="text-red-500 hover:text-red-700 font-bold ml-1"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={handleInputFocus}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
        placeholder={placeholder}
        autoComplete="off"
      />
      
      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {orderPanelSearch.loading ? (
            <div className="p-3 text-center text-sm text-slate-500">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sky-500 mx-auto"></div>
              <p className="mt-1">Loading available order panels...</p>
            </div>
          ) : panels.length > 0 ? (
            panels.map((panel) => (
              <div
                key={panel._id}
                onMouseDown={() => handleSelectPanel(panel)}
                className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors"
              >
                <div className="font-medium text-slate-800">
                  {panel.orderPanelNo}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {panel.partyName || panel.customerName || 'N/A'} | 
                  Branch: {panel.branchName || panel.branchCode || 'N/A'} | 
                  Weight: {panel.totalWeight || 0}
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 text-center text-sm text-slate-500">
              {searchQuery.trim() ? 
                `No matching order panels found for "${searchQuery}"` : 
                "No order panels available"
              }
            </div>
          )}
          {panels.length > 0 && (
            <div className="p-2 text-xs text-slate-500 border-t border-slate-200 bg-slate-50">
              {count} panel(s) available
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* =======================
  Orders Table Component - SCROLLABLE WITH TALUKA
========================= */
/* =======================
  Orders Table Component - SCROLLABLE WITH TALUKA
========================= */
function OrdersTable({ rows, onChange, onRemove, billingType, readOnly = false }) {
  const columns = [
    { key: "orderNo", label: "Order No", minWidth: "120px" },
    { key: "partyName", label: "Party Name", minWidth: "150px" },
    { key: "plantCode", label: "Plant Code *", minWidth: "120px" },
    { key: "plantName", label: "Plant Name", minWidth: "120px" },
    { key: "plantCodeValue", label: "Plant Code Value", minWidth: "120px" },
    { key: "orderType", label: "Order Type", minWidth: "120px" },
    { key: "pinCode", label: "Pin Code", minWidth: "100px" },
    { key: "from", label: "From", minWidth: "120px" },
    { key: "to", label: "To", minWidth: "120px" },
    { key: "taluka", label: "Taluka", minWidth: "120px" },
    { key: "country", label: "Country", minWidth: "100px" },
    { key: "state", label: "State", minWidth: "100px" },
    { key: "district", label: "District", minWidth: "100px" },
    { key: "weight", label: "Weight", minWidth: "80px" },
    { key: "status", label: "Status", minWidth: "100px" },
  ];

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
              </th>
            ))}
            <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.length > 0 ? (
            rows.map((row) => (
              <tr key={row._id} className="hover:bg-yellow-50 even:bg-slate-50">
                {/* Order No */}
                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    value={row.orderNo || ""}
                    onChange={(e) => onChange(row._id, 'orderNo', e.target.value)}
                    readOnly={readOnly}
                    className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                      readOnly ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    placeholder="Enter Order No"
                  />
                </td>

                {/* Party Name */}
                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    value={row.partyName || ""}
                    onChange={(e) => onChange(row._id, 'partyName', e.target.value)}
                    readOnly={readOnly}
                    className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                      readOnly ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    placeholder="Enter Party Name"
                  />
                </td>

                {/* Plant Code */}
                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    value={row.plantCode || ""}
                    onChange={(e) => onChange(row._id, 'plantCode', e.target.value)}
                    readOnly={readOnly}
                    className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                      readOnly ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    placeholder="Enter Plant Code"
                  />
                </td>

                {/* Plant Name */}
                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    type="text"
                    value={row.plantName || ""}
                    onChange={(e) => onChange(row._id, 'plantName', e.target.value)}
                    readOnly={readOnly}
                    className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                      readOnly ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    placeholder="Enter Plant Name"
                  />
                </td>

                {/* Plant Code Value */}
                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    type="text"
                    value={row.plantCodeValue || ""}
                    onChange={(e) => onChange(row._id, 'plantCodeValue', e.target.value)}
                    readOnly={readOnly}
                    className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                      readOnly ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    placeholder="Enter Plant Code Value"
                  />
                </td>

                {/* Order Type */}
                <td className="border border-yellow-300 px-2 py-2">
                  <select
                    value={row.orderType || ""}
                    onChange={(e) => onChange(row._id, 'orderType', e.target.value)}
                    disabled={readOnly}
                    className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                      readOnly ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                  >
                    <option value="">Select Order Type</option>
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
                    value={row.pinCode || ""}
                    onChange={(e) => onChange(row._id, 'pinCode', e.target.value)}
                    readOnly={readOnly}
                    className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                      readOnly ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    placeholder="Enter Pin Code"
                  />
                </td>

                {/* From */}
                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    value={row.fromName || ""}
                    onChange={(e) => onChange(row._id, 'fromName', e.target.value)}
                    readOnly={readOnly}
                    className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                      readOnly ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    placeholder="Enter From"
                  />
                </td>

                {/* To */}
                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    value={row.toName || ""}
                    onChange={(e) => onChange(row._id, 'toName', e.target.value)}
                    readOnly={readOnly}
                    className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                      readOnly ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    placeholder="Enter To"
                  />
                </td>

                {/* Taluka */}
                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    value={row.talukaName || row.taluka || ""}
                    onChange={(e) => onChange(row._id, 'talukaName', e.target.value)}
                    readOnly={readOnly}
                    className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                      readOnly ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    placeholder="Enter Taluka"
                  />
                </td>

                {/* Country */}
                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    value={row.countryName || ""}
                    onChange={(e) => onChange(row._id, 'countryName', e.target.value)}
                    readOnly={readOnly}
                    className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                      readOnly ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    placeholder="Enter Country"
                  />
                </td>

                {/* State */}
                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    value={row.stateName || ""}
                    onChange={(e) => onChange(row._id, 'stateName', e.target.value)}
                    readOnly={readOnly}
                    className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                      readOnly ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    placeholder="Enter State"
                  />
                </td>

                {/* District */}
                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    value={row.districtName || ""}
                    onChange={(e) => onChange(row._id, 'districtName', e.target.value)}
                    readOnly={readOnly}
                    className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                      readOnly ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    placeholder="Enter District"
                  />
                </td>

                {/* Weight */}
                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    type="number"
                    value={row.weight || ""}
                    onChange={(e) => onChange(row._id, 'weight', e.target.value)}
                    readOnly={readOnly}
                    className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                      readOnly ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    placeholder="Enter Weight"
                  />
                </td>

                {/* Status */}
                <td className="border border-yellow-300 px-2 py-2">
                  <select
                    value={row.status || ""}
                    onChange={(e) => onChange(row._id, 'status', e.target.value)}
                    disabled={readOnly}
                    className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                      readOnly ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                  >
                    <option value="">Select Status</option>
                    {STATUSES.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Actions */}
                <td className="border border-yellow-300 px-2 py-2 text-center">
                  {billingType === "Multi - Order" && !readOnly && rows.length > 1 && (
                    <button
                      onClick={() => onRemove(row._id)}
                      className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600 transition"
                    >
                      Remove
                    </button>
                  )}
                  {readOnly && (
                    <span className="text-xs text-slate-400">Read Only</span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + 1} className="border border-yellow-300 px-4 py-8 text-center text-slate-400">
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
  Vendors Table Component
========================= */
function VendorsTable({ rows, onChange, onRemove, readOnly = false, suppliers = [] }) {
  const columns = [
    { key: "vendorName", label: "Supplier Name" },
    { key: "vendorCode", label: "Supplier Code" },
    { key: "marketRate", label: "Market Rates", type: "number" },
  ];

  return (
    <div className="overflow-auto rounded-xl border border-yellow-300 max-h-[300px]">
      <table className="min-w-full w-full text-sm">
        <thead className="sticky top-0 bg-yellow-400 z-10">
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
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.length > 0 ? (
            rows.map((row, index) => (
              <tr key={row._id} className="hover:bg-yellow-50 even:bg-slate-50">
                <td className="border border-yellow-300 px-2 py-2">
                  <TableSearchableDropdown
                    items={suppliers || []}
                    selectedId={row.vendorName}
                    onSelect={(supplier) => {
                      if (supplier) {
                        const newVendors = [...rows];
                        newVendors[index] = {
                          ...newVendors[index],
                          vendorName: supplier.supplierName,
                          vendorCode: supplier.supplierCode || '',
                          marketRate: newVendors[index].marketRate || ''
                        };
                        onChange(newVendors[index]._id, 'vendorName', newVendors[index].vendorName);
                        onChange(newVendors[index]._id, 'vendorCode', newVendors[index].vendorCode);
                      }
                    }}
                    placeholder="Select Supplier"
                    displayField="supplierName"
                    codeField="supplierCode"
                    disabled={readOnly}
                    cellId={`supplier-${row._id}`}
                  />
                </td>
                
                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    type="text"
                    value={row.vendorCode || ""}
                    readOnly
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm outline-none cursor-not-allowed"
                    placeholder="Auto-filled"
                  />
                </td>
                
                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    type="number"
                    value={row.marketRate || ""}
                    onChange={(e) => onChange(row._id, 'marketRate', e.target.value)}
                    readOnly={readOnly}
                    className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                      readOnly ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    placeholder="Enter Market Rate"
                  />
                </td>
                
                <td className="border border-yellow-300 px-2 py-2 text-center">
                  {!readOnly && rows.length > 1 && (
                    <button
                      onClick={() => onRemove(row._id)}
                      className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600 transition"
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + 1} className="border border-yellow-300 px-4 py-8 text-center text-slate-400">
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
  MAIN EDIT PAGE
========================= */
export default function EditVehicleNegotiation() {
  const router = useRouter();
  const params = useParams();
  const negotiationId = params.id;

  /** =========================
   * STATE FOR API DATA
   ========================= */
  const [branches, setBranches] = useState([]);
  const [countries, setCountries] = useState([]);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [vnnNumber, setVnnNumber] = useState("");
  const [stateData, setStateData] = useState({});
  const [districtData, setDistrictData] = useState({});

  /** =========================
   * VEHICLE SEARCH STATE
   ========================= */
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const vehicleSearch = useVehicleSearch();

  /** =========================
   * CUSTOMER SEARCH STATE
   ========================= */
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const customerSearch = useCustomerSearch();

  /** =========================
   * SUPPLIER SEARCH STATE
   ========================= */
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const supplierSearch = useSupplierSearch();

  /** =========================
   * ORDER PANEL MULTI-SELECT STATE
   ========================= */
  const [selectedOrderPanels, setSelectedOrderPanels] = useState([]);
  const orderPanelSearch = useOrderPanelSearch();

  /* ===== TOP BAR ===== */
  const [header, setHeader] = useState({
    vnnNo: "",
    branch: "",
    branchName: "",
    branchCode: "",
    delivery: "Urgent",
    date: new Date().toISOString().split('T')[0],
    billingType: "Multi - Order",
    loadingPoints: "",
    dropPoints: "",
    collectionCharges: "",
    cancellationCharges: "",
    loadingCharges: "",
    otherCharges: "",
    partyName: "",
    customerId: ""
  });

  /* ===== ORDERS ===== */
  const [orders, setOrders] = useState([]);

  /* ===== FILE UPLOAD STATES ===== */
  const [voiceFileInfo, setVoiceFileInfo] = useState(null);
  const [memoFile, setMemoFile] = useState(null);
  const audioRef = useRef(null);

  /* ===== NEGOTIATION ===== */
  const [negotiation, setNegotiation] = useState({
    maxRate: "",
    targetRate: "",
    purchaseType: "",
    oldRatePercent: "",
    remarks1: "",
  });

  const [vendors, setVendors] = useState([]);
  const [voiceUrl, setVoiceUrl] = useState("");

  /* ===== APPROVAL - Part 3 Read Only ===== */
  const [approval, setApproval] = useState({
    vendorName: "",
    vendorId: null,
    vendorCode: "",
    vendorStatus: "Active",
    rateType: "",
    finalPerMT: "",
    finalFix: "",
    vehicleNo: "",
    vehicleId: "",
    vehicleData: null,
    mobile: "",
    purchaseType: "",
    paymentTerms: "",
    approvalStatus: "",
    remarks: "",
    memoStatus: "Pending",
    memoFile: null
  });

  /** =========================
   * FETCH DATA FROM APIs
   ========================= */
  useEffect(() => {
    fetchBranches();
    fetchCountries();
    fetchPlants();
    supplierSearch.searchSuppliers();
    fetchNegotiationData();
  }, []);

  const fetchNegotiationData = async () => {
    setFetchLoading(true);
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
      
      setVnnNumber(vn.vnnNo || "");
      
      setHeader({
        vnnNo: vn.vnnNo || "",
        branch: vn.branch || "",
        branchName: vn.branchName || "",
        branchCode: vn.branchCode || "",
        delivery: vn.delivery || "Urgent",
        date: vn.date ? new Date(vn.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        billingType: vn.billingType || "Multi - Order",
        loadingPoints: vn.loadingPoints?.toString() || "",
        dropPoints: vn.dropPoints?.toString() || "",
        collectionCharges: vn.collectionCharges?.toString() || "",
        cancellationCharges: vn.cancellationCharges || "",
        loadingCharges: vn.loadingCharges || "",
        otherCharges: vn.otherCharges || "",
        partyName: vn.partyName || vn.customerName || "",
        customerId: vn.customerId || ""
      });

      if (vn.customerName) {
        setSelectedCustomer({
          _id: vn.customerId,
          customerName: vn.customerName,
          customerCode: vn.customerCode || "",
          contactPersonName: vn.contactPerson || ""
        });
        setCustomerSearchQuery(vn.customerName);
      }

      if (vn.orders && vn.orders.length > 0) {
        const processedOrders = vn.orders.map(order => ({
          ...order,
          _id: order._id || uid(),
          weight: order.weight?.toString() || "",
        }));
        setOrders(processedOrders);
      }

      if (vn.selectedOrderPanels && vn.selectedOrderPanels.length > 0) {
        const fullPanels = [];
        for (const panel of vn.selectedOrderPanels) {
          try {
            const fullPanel = await orderPanelSearch.getOrderPanelById(panel._id);
            if (fullPanel) {
              fullPanels.push(fullPanel);
            } else {
              fullPanels.push(panel);
            }
          } catch (err) {
            console.error("Error fetching panel:", err);
            fullPanels.push(panel);
          }
        }
        setSelectedOrderPanels(fullPanels);
      }

      if (vn.negotiation) {
        setNegotiation({
          maxRate: vn.negotiation.maxRate?.toString() || "",
          targetRate: vn.negotiation.targetRate?.toString() || "",
          purchaseType: vn.negotiation.purchaseType || "",
          oldRatePercent: vn.negotiation.oldRatePercent || "",
          remarks1: vn.negotiation.remarks1 || "",
        });
      }

      if (vn.vendors && vn.vendors.length > 0) {
        const processedVendors = vn.vendors.map(vendor => ({
          ...vendor,
          _id: vendor._id || uid(),
          marketRate: vendor.marketRate?.toString() || "",
        }));
        setVendors(processedVendors);
      } else {
        setVendors([defaultVendorRow()]);
      }

      if (vn.voiceNote) {
        setVoiceUrl(vn.voiceNote);
      }
      if (vn.voiceNoteFile) {
        setVoiceFileInfo(vn.voiceNoteFile);
      }

      if (vn.approval) {
        setApproval({
          vendorName: vn.approval.vendorName || "",
          vendorId: vn.approval.vendorId || null,
          vendorCode: vn.approval.vendorCode || "",
          vendorStatus: vn.approval.vendorStatus || "Active",
          rateType: vn.approval.rateType || "",
          finalPerMT: vn.approval.finalPerMT?.toString() || "",
          finalFix: vn.approval.finalFix?.toString() || "",
          vehicleNo: vn.approval.vehicleNo || "",
          vehicleId: vn.approval.vehicleId || "",
          vehicleData: vn.approval.vehicleData || null,
          mobile: vn.approval.mobile || "",
          purchaseType: vn.approval.purchaseType || "",
          paymentTerms: vn.approval.paymentTerms || "",
          approvalStatus: vn.approval.approvalStatus || "",
          remarks: vn.approval.remarks || "",
          memoStatus: vn.approval.memoStatus || "Pending",
          memoFile: vn.approval.memoFile || null
        });

        if (vn.approval.vehicleData) {
          setSelectedVehicle(vn.approval.vehicleData);
        } else if (vn.approval.vehicleId) {
          const vehicle = await vehicleSearch.getVehicleById(vn.approval.vehicleId);
          if (vehicle) {
            setSelectedVehicle(vehicle);
          }
        }

        if (vn.approval.vendorName && supplierSearch.suppliers.length > 0) {
          const supplier = supplierSearch.suppliers.find(s => s.supplierName === vn.approval.vendorName);
          if (supplier) {
            setSelectedSupplier(supplier);
          }
        }
      }

    } catch (error) {
      console.error('Error fetching vehicle negotiation:', error);
      alert(`Failed to load vehicle negotiation: ${error.message}`);
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
      } else {
        setBranches([]);
      }
    } catch (error) {
      console.error('Error fetching branches:', error.message);
      setBranches([]);
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
      } else {
        setCountries([]);
      }
    } catch (error) {
      console.error('Error fetching countries:', error.message);
      setCountries([]);
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
      } else {
        setPlants([]);
      }
    } catch (error) {
      console.error('Error fetching plants:', error.message);
      setPlants([]);
    }
  };

  /** =========================
   * VEHICLE SEARCH FUNCTIONS
   ========================= */
  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
    setApproval(prev => ({
      ...prev,
      vehicleNo: vehicle.vehicleNumber,
      vehicleId: vehicle._id,
      vehicleData: vehicle
    }));
  };

  /** =========================
   * SUPPLIER SELECT FUNCTION
   ========================= */
  const handleSupplierSelect = (supplier) => {
    setSelectedSupplier(supplier);
    setApproval(prev => ({
      ...prev,
      vendorName: supplier.supplierName,
      vendorId: supplier._id,
      vendorCode: supplier.supplierCode,
      vendorStatus: supplier.supplierStatus || "Active"
    }));
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
        customer.customerCode.toLowerCase().includes(query.toLowerCase()) ||
        (customer.contactPersonName && customer.contactPersonName.toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredCustomers(filtered);
    }
    
    if (selectedCustomer && query !== selectedCustomer.customerName) {
      setSelectedCustomer(null);
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

  const handleCustomerInputFocus = async () => {
    if (!showCustomerDropdown) {
      if (customerSearch.customers.length === 0) {
        await customerSearch.searchCustomers("");
      }
      setFilteredCustomers(customerSearch.customers);
      setShowCustomerDropdown(true);
    }
  };

  const handleCustomerInputBlur = () => {
    setTimeout(() => {
      setShowCustomerDropdown(false);
    }, 200);
  };

  useEffect(() => {
    if (customerSearch.customers.length > 0) {
      setFilteredCustomers(customerSearch.customers);
    }
  }, [customerSearch.customers]);

  /** =========================
   * Handle Order Panel Multi-Select
   ========================= */
  const handleOrderPanelSelect = async (fullPanel, removePanelId = null) => {
    if (removePanelId) {
      setSelectedOrderPanels(prev => prev.filter(p => p._id !== removePanelId));
      setOrders(prev => prev.filter(order => order.orderPanelId !== removePanelId));
      
      if (selectedOrderPanels.length === 1) {
        setHeader(prev => ({
          ...prev,
          branch: "",
          branchName: "",
          branchCode: "",
          partyName: "",
          customerId: "",
          collectionCharges: "",
          cancellationCharges: "",
          loadingCharges: "",
          otherCharges: "",
          loadingPoints: "",
          dropPoints: ""
        }));
        setSelectedCustomer(null);
        setCustomerSearchQuery("");
      }
    } else if (fullPanel) {
      if (selectedOrderPanels.some(p => p._id === fullPanel._id)) {
        alert("This order panel is already selected");
        return;
      }
      
      setSelectedOrderPanels(prev => [...prev, fullPanel]);
      
      let plantRowsToUse = fullPanel.plantRows;
      
      if (!plantRowsToUse || plantRowsToUse.length === 0) {
        try {
          const fetchedPanel = await orderPanelSearch.getOrderPanelById(fullPanel._id);
          if (fetchedPanel && fetchedPanel.plantRows && fetchedPanel.plantRows.length > 0) {
            plantRowsToUse = fetchedPanel.plantRows;
          }
        } catch (err) {
          console.error("Error fetching panel details:", err);
        }
      }
      
      if (plantRowsToUse && plantRowsToUse.length > 0) {
        const newOrders = plantRowsToUse.map((row) => {
          let plantId = '';
          let plantName = '';
          let plantCode = '';
          
          if (row.plantCode) {
            if (typeof row.plantCode === 'object' && row.plantCode._id) {
              plantId = row.plantCode._id;
              plantName = row.plantCode.name || '';
              plantCode = row.plantCode.code || '';
            } else if (typeof row.plantCode === 'string') {
              plantId = row.plantCode;
              plantName = row.plantName || '';
              plantCode = row.plantCodeValue || '';
            }
          }
          
          if (!plantId && row.plantCodeValue) {
            const plant = plants.find(p => p.code === row.plantCodeValue);
            if (plant) {
              plantId = plant._id;
              plantName = plant.name;
              plantCode = plant.code;
            }
          }
          
          return {
            _id: uid(),
            orderNo: fullPanel.orderPanelNo || row.orderNo || "",
            orderPanelId: fullPanel._id,
            partyName: fullPanel.partyName || fullPanel.customerName || row.partyName || "",
            customerId: fullPanel.customerId || row.customerId || null,
            customerCode: fullPanel.customerCode || row.customerCode || "",
            contactPerson: fullPanel.contactPerson || row.contactPerson || "",
            plantCode: plantId,
            plantName: plantName || row.plantName || "",
            plantCodeValue: plantCode || row.plantCodeValue || "",
            orderType: row.orderType || "Sales",
            pinCode: row.pinCode || "",
            from: row.from || "",
            fromName: row.fromName || "",
            to: row.to || "",
            toName: row.toName || "",
            taluka: row.taluka || "",
            talukaName: row.talukaName || "",
            district: row.district || "",
            districtName: row.districtName || "",
            state: row.state || "",
            stateName: row.stateName || "",
            country: row.country || "",
            countryName: row.countryName || "",
            weight: row.weight || "",
            status: row.status || "Open",
          };
        });
        
        setOrders(prev => [...prev, ...newOrders]);
      } else {
        const defaultOrder = {
          _id: uid(),
          orderNo: fullPanel.orderPanelNo || "",
          orderPanelId: fullPanel._id,
          partyName: fullPanel.partyName || fullPanel.customerName || "",
          customerId: fullPanel.customerId || null,
          customerCode: fullPanel.customerCode || "",
          contactPerson: fullPanel.contactPerson || "",
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
          weight: fullPanel.totalWeight || "",
          status: "Open",
        };
        setOrders(prev => [...prev, defaultOrder]);
      }

      if (selectedOrderPanels.length === 0) {
        setHeader(prev => ({
          ...prev,
          branch: fullPanel.branch || "",
          branchName: fullPanel.branchName || "",
          branchCode: fullPanel.branchCode || "",
          delivery: fullPanel.delivery || "Urgent",
          date: fullPanel.date ? new Date(fullPanel.date).toISOString().split('T')[0] : prev.date,
          partyName: fullPanel.partyName || fullPanel.customerName || "",
          customerId: fullPanel.customerId || "",
          collectionCharges: fullPanel.collectionCharges || "",
          cancellationCharges: fullPanel.cancellationCharges || "",
          loadingCharges: fullPanel.loadingCharges || "",
          otherCharges: fullPanel.otherCharges || "",
          loadingPoints: fullPanel.loadingPoints || "",
          dropPoints: fullPanel.dropPoints || ""
        }));

        if (fullPanel.customerId) {
          const customer = customerSearch.customers.find(c => c._id === fullPanel.customerId);
          if (customer) {
            setSelectedCustomer(customer);
            setCustomerSearchQuery(customer.customerName);
          }
        }
      }
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
      const orderToRemove = orders.find(o => o._id === id);
      if (orderToRemove && orderToRemove.orderPanelId) {
        const otherOrdersFromSamePanel = orders.filter(o => 
          o.orderPanelId === orderToRemove.orderPanelId && o._id !== id
        );
        
        if (otherOrdersFromSamePanel.length === 0) {
          setSelectedOrderPanels(prev => 
            prev.filter(p => p._id !== orderToRemove.orderPanelId)
          );
        }
      }
      
      setOrders((prev) => prev.filter((x) => x._id !== id));
    } else {
      alert("At least one order row is required");
    }
  };

  const totalWeight = useMemo(() => {
    return orders.reduce((acc, r) => acc + num(r.weight), 0);
  }, [orders]);

  /** =========================
   * Handle Billing Type Change
   ========================= */
  const handleBillingTypeChange = (value) => {
    setHeader((prev) => ({ ...prev, billingType: value }));
  };

  /** =========================
   * VENDOR FUNCTIONS
   ========================= */
  const addVendor = () => setVendors((p) => [...p, defaultVendorRow()]);

  const removeVendor = (id) => {
    if (vendors.length > 1) {
      setVendors((p) => p.filter((x) => x._id !== id));
    } else {
      alert("At least one vendor row is required");
    }
  };

  const updateVendor = (id, key, value) => {
    setVendors((p) => p.map((v) => (v._id === id ? { ...v, [key]: value } : v)));
  };

  /** =========================
   * HANDLE MEMO UPLOAD
   ========================= */
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

    setMemoFile(file);
    
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
        setApproval((p) => ({ 
          ...p, 
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
    }
  };

  /** =========================
   * HANDLE VOICE NOTE UPLOAD
   ========================= */
  const handleVoiceUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/m4a', 'audio/webm'];
    if (!allowedTypes.includes(file.type)) {
      alert("❌ Please upload only audio files (MP3, WAV, M4A)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("❌ Audio file size should be less than 10MB");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      
      const data = await res.json();
      
      if (data.success) {
        let audioUrl;
        if (process.env.NODE_ENV === 'development' && data.filePath) {
          audioUrl = data.filePath;
        } else {
          audioUrl = URL.createObjectURL(file);
        }
        
        setVoiceUrl(audioUrl);
        
        setVoiceFileInfo({
          filePath: data.filePath,
          fullPath: data.fullPath,
          filename: data.filename,
          originalName: file.name,
          size: file.size,
          mimeType: file.type
        });
        
        alert("✅ Voice note uploaded successfully!");
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (error) {
      console.error("Error uploading voice note:", error);
      alert("❌ Failed to upload voice note. Please try again.");
    }
  };

  /** =========================
   * CREATE VEHICLE FUNCTION
   ========================= */
  const handleCreateVehicle = () => {
    router.push('/admin/vehicle2');
  };

  /** =========================
   * UPDATE FUNCTION
   ========================= */
  const handleUpdate = async () => {
    if (!header.branch) {
      alert("Please select a branch");
      return;
    }
    
    if (orders.length === 0) {
      alert("Please add at least one order");
      return;
    }
    
    const hasInvalidOrders = orders.some(order => !order.plantCode);
    if (hasInvalidOrders) {
      const invalidCount = orders.filter(order => !order.plantCode).length;
      alert(`Please select plant for all order rows. ${invalidCount} row(s) missing plant code.`);
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
        id: negotiationId,
        header: {
          branch: header.branch || '',
          branchName: header.branchName || '',
          branchCode: header.branchCode || '',
          delivery: header.delivery || 'Normal',
          date: header.date || new Date().toISOString().split('T')[0],
          billingType: header.billingType || 'Multi - Order',
          loadingPoints: header.loadingPoints || '',
          dropPoints: header.dropPoints || '',
          collectionCharges: header.collectionCharges || '',
          cancellationCharges: header.cancellationCharges || '',
          loadingCharges: header.loadingCharges || '',
          otherCharges: header.otherCharges || '',
          partyName: header.partyName || '',
          customerId: header.customerId || null,
          customerName: selectedCustomer?.customerName || header.customerName || '',
          customerCode: selectedCustomer?.customerCode || header.customerCode || '',
          contactPerson: selectedCustomer?.contactPersonName || header.contactPerson || ''
        },
        orders: orders.map(order => ({
          _id: order._id,
          orderNo: order.orderNo || '',
          orderPanelId: order.orderPanelId || '',
          partyName: order.partyName || '',
          customerId: order.customerId || null,
          customerCode: order.customerCode || '',
          contactPerson: order.contactPerson || '',
          plantCode: order.plantCode || '',
          plantName: order.plantName || '',
          plantCodeValue: order.plantCodeValue || '',
          orderType: order.orderType || 'Sales',
          pinCode: order.pinCode || '',
          from: order.from || '',
          fromName: order.fromName || '',
          to: order.to || '',
          toName: order.toName || '',
          taluka: order.taluka || '',
          talukaName: order.talukaName || '',
          country: order.country || '',
          countryName: order.countryName || '',
          state: order.state || '',
          stateName: order.stateName || '',
          district: order.district || '',
          districtName: order.districtName || '',
          weight: num(order.weight),
          status: order.status || 'Open'
        })),
        negotiation: {
          maxRate: num(negotiation.maxRate),
          targetRate: num(negotiation.targetRate),
          purchaseType: negotiation.purchaseType || '',
          oldRatePercent: negotiation.oldRatePercent || '',
          remarks1: negotiation.remarks1 || ''
        },
        vendors: vendors.map(vendor => ({
          _id: vendor._id,
          vendorName: vendor.vendorName || '',
          vendorCode: vendor.vendorCode || '',
          marketRate: num(vendor.marketRate)
        })),
        voiceUrl: voiceUrl || '',
        voiceFileInfo: voiceFileInfo,
        approval: {
          vendorName: approval.vendorName || '',
          vendorId: approval.vendorId || null,
          vendorCode: approval.vendorCode || '',
          vendorStatus: approval.vendorStatus || 'Active',
          rateType: approval.rateType || '',
          finalPerMT: num(approval.finalPerMT),
          finalFix: num(approval.finalFix),
          vehicleNo: approval.vehicleNo || '',
          vehicleId: approval.vehicleId || '',
          mobile: approval.mobile || '',
          purchaseType: approval.purchaseType || '',
          paymentTerms: approval.paymentTerms || '',
          approvalStatus: approval.approvalStatus || '',
          remarks: approval.remarks || '',
          memoStatus: approval.memoStatus || 'Pending',
          memoFile: approval.memoFile
        }
      };

      console.log("Sending update payload:", JSON.stringify(payload, null, 2));

      const res = await fetch('/api/vehicle-negotiation', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Error response text:", text);
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.message || `Failed to update: ${res.status}`);
        } catch (e) {
          throw new Error(`Server returned ${res.status}: ${text || 'No error details'}`);
        }
      }

      let data;
      try {
        data = await res.json();
      } catch (e) {
        console.error("Failed to parse JSON response:", e);
        throw new Error("Server returned invalid JSON response");
      }

      console.log("Response from backend:", data);

      setSaveSuccess(true);
      
      alert(`✅ Vehicle negotiation updated successfully!\nVNN Number: ${header.vnnNo}`);
      
      setTimeout(() => {
        router.push('/admin/vehicle-negotiation');
      }, 2000);
      
    } catch (error) {
      console.error('Error updating vehicle negotiation:', error);
      setSaveError(error.message || 'Failed to update vehicle negotiation');
      alert(`❌ Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const purchaseAmount = useMemo(() => {
    if (approval.rateType === "Per MT") {
      return num(approval.finalPerMT) * totalWeight;
    }
    return num(approval.finalFix);
  }, [approval.rateType, approval.finalPerMT, approval.finalFix, totalWeight]);

  const billingColumns = [
    { key: "billingType", label: "Billing Type", options: BILLING_TYPES },
    { key: "loadingPoints", label: "No. of Loading Points", type: "number" },
    { key: "dropPoints", label: "No. of Droping Point", type: "number" },
    { key: "collectionCharges", label: "Collection Charges" },
    { key: "cancellationCharges", label: "Cancellation Charges" },
    { key: "loadingCharges", label: "Loading Charges" },
    { key: "otherCharges", label: "Other Charges" },
  ];

  if (fetchLoading) {
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

  // Determine if charges should be read-only
  const isChargesReadOnly = selectedOrderPanels.length > 0;

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
                Edit Vehicle Negotiation: {header.vnnNo}
              </div>
            </div>
            {saveSuccess && (
              <div className="text-sm text-green-600 font-medium mt-1">
                ✅ Vehicle negotiation updated successfully! Redirecting to list...
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
                  Updating...
                </span>
              ) : 'Update Negotiation'}
            </button>
          </div>
        </div>
      </div>

      {/* ===== Main Layout ===== */}
      <div className="mx-auto max-w-full p-4 space-y-4">
        {/* ===== PART 1: VEHICLE NEGOTIATION - PART 1 ===== */}
        <Card title="Vehicle Negotiation - Panel - Part -1">
          {/* Header Section */}
          <div className="grid grid-cols-12 gap-3 mb-4">
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Vehicle Negotiation No</label>
              <div className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                {header.vnnNo || "Auto-generated on save"}
              </div>
            </div>
            
            <div className="col-span-12 md:col-span-6">
              <label className="text-xs font-bold text-slate-600">Select Order Panels (Multi-Select)</label>
              <MultiSelectOrderPanelDropdown
                selectedPanels={selectedOrderPanels}
                onSelect={handleOrderPanelSelect}
                placeholder="Search and select order panels..."
              />
              {selectedOrderPanels.length > 0 && (
                <div className="text-xs text-slate-500 mt-1">
                  {selectedOrderPanels.length} order panel(s) selected • {orders.length} total order row(s)
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
              />
            </div>

            <Select
              col="col-span-12 md:col-span-3"
              label="Delivery"
              value={header.delivery}
              onChange={(v) => setHeader((p) => ({ ...p, delivery: v }))}
              options={["Urgent", "Normal"]}
            />

            <Input
              type="date"
              col="col-span-12 md:col-span-3"
              label="Date"
              value={header.date}
              onChange={(v) => setHeader((p) => ({ ...p, date: v }))}
            />
            
            <div className="col-span-12 md:col-span-3 relative">
              <label className="text-xs font-bold text-slate-600">Party Name</label>
              <input
                type="text"
                value={selectedCustomer ? selectedCustomer.customerName : header.partyName}
                onChange={(e) => handleCustomerSearch(e.target.value)}
                onFocus={handleCustomerInputFocus}
                onBlur={handleCustomerInputBlur}
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
            </div>
          </div>

          {/* Billing Type / Charges - With proper read-only for charges */}
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
                        {col.key === "billingType" ? (
                          <select
                            value={header.billingType || "Multi - Order"}
                            onChange={(e) => handleBillingTypeChange(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                          >
                            {BILLING_TYPES.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={col.type || "text"}
                            value={header[col.key] || ""}
                            onChange={(e) => setHeader(prev => ({ ...prev, [col.key]: e.target.value }))}
                            readOnly={col.key !== "loadingPoints" && col.key !== "dropPoints" ? isChargesReadOnly : false}
                            className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                              col.key !== "loadingPoints" && col.key !== "dropPoints" && isChargesReadOnly ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
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
            {isChargesReadOnly && (
              <div className="text-xs text-orange-500 mt-2 p-2 bg-orange-50 rounded">
                * Loading Points and Drop Points are editable. Other charges are read-only (from selected panels).
              </div>
            )}
          </div>

          {/* Orders Table */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-bold text-slate-700">
                Orders (Part-1) - {header.billingType} - {orders.length} row{orders.length !== 1 ? 's' : ''}
              </div>
              
              {header.billingType === "Multi - Order" && (
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
              billingType={header.billingType}
              readOnly={selectedOrderPanels.length > 0}
            />
          </div>

          {/* Total Weight */}
          <div className="flex justify-end mt-4">
            <div className="flex items-center gap-3 border border-yellow-300 px-6 py-3 bg-yellow-50 rounded-xl">
              <div className="text-sm font-extrabold text-slate-900">Total Weight:</div>
              <div className="text-xl font-extrabold text-emerald-700">{totalWeight}</div>
            </div>
          </div>
        </Card>

        {/* ===== PART 2: VEHICLE NEGOTIATION - PART 2 ===== */}
        <Card title="Vehicle - Negotiation - Part - 2">
          <div className="grid grid-cols-12 gap-3 mb-4">
            <Input
              col="col-span-12 md:col-span-3"
              label="Max Rate"
              value={negotiation.maxRate}
              onChange={(v) => setNegotiation((p) => ({ ...p, maxRate: v }))}
            />
            <Input
              col="col-span-12 md:col-span-3"
              label="Target Rate"
              value={negotiation.targetRate}
              onChange={(v) => setNegotiation((p) => ({ ...p, targetRate: v }))}
            />
            <Select
              col="col-span-12 md:col-span-3"
              label="Purchase - Type"
              value={negotiation.purchaseType}
              onChange={(v) => setNegotiation((p) => ({ ...p, purchaseType: v }))}
              options={PURCHASE_TYPES}
            />
            <Input
              col="col-span-12 md:col-span-3"
              label="Old Rate %"
              value={negotiation.oldRatePercent}
              onChange={(v) => setNegotiation((p) => ({ ...p, oldRatePercent: v }))}
            />
          </div>

          {/* Vendors / Market Rates */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-bold text-slate-700">Suppliers / Market Rates</div>
              <button
                onClick={addVendor}
                className="rounded-xl bg-yellow-600 px-4 py-2 text-sm font-bold text-white hover:bg-yellow-700"
              >
                + Add Supplier
              </button>
            </div>
            
            <VendorsTable
              rows={vendors}
              onChange={updateVendor}
              onRemove={removeVendor}
              suppliers={supplierSearch.suppliers}
            />
          </div>

          {/* Remarks & Voice Note */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-7">
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="text-sm font-extrabold text-slate-900 mb-3">Remarks</div>
                <textarea
                  value={negotiation.remarks1}
                  onChange={(e) => setNegotiation((p) => ({ ...p, remarks1: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  rows={2}
                  placeholder="Enter remarks..."
                />
              </div>
            </div>

            <div className="col-span-12 md:col-span-5">
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="text-sm font-extrabold text-slate-900 mb-3">Voice Note</div>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleVoiceUpload}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                />
                {voiceUrl && (
                  <div className="mt-3">
                    <audio 
                      ref={audioRef} 
                      src={voiceUrl} 
                      controls 
                      className="w-full"
                    />
                    {voiceFileInfo?.filePath && process.env.NODE_ENV === 'development' && (
                      <div className="mt-2 text-xs text-slate-500">
                        File: {voiceFileInfo.originalName}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* ===== PART 3: VEHICLE APPROVAL - PART 3 - READ ONLY ===== */}
        <Card title="Vehicle - Approval - Part - 3 (Read Only)">
          <div className="grid grid-cols-12 gap-3 mb-4">
            <div className="col-span-12 md:col-span-4">
              <label className="text-xs font-bold text-slate-600">Supplier Name</label>
              <SupplierSearchDropdown
                value={selectedSupplier ? selectedSupplier.supplierName : approval.vendorName}
                onSelect={handleSupplierSelect}
                placeholder="Search supplier..."
                readOnly={true}
              />
            </div>
            
            <Select
              col="col-span-12 md:col-span-4"
              label="Supplier (Status)"
              value={approval.vendorStatus}
              onChange={(v) => setApproval((p) => ({ ...p, vendorStatus: v }))}
              options={VENDOR_STATUS}
              readOnly={true}
            />
            <Select
              col="col-span-12 md:col-span-4"
              label="Rate - Type"
              value={approval.rateType}
              onChange={(v) => setApproval((p) => ({ ...p, rateType: v }))}
              options={RATE_TYPES}
              readOnly={true}
            />
          </div>

          <div className="grid grid-cols-12 gap-3 mb-4">
            <Input
              col="col-span-12 md:col-span-4"
              label="Final - Per MT (A)"
              value={approval.finalPerMT}
              onChange={(v) => setApproval((p) => ({ ...p, finalPerMT: v }))}
              readOnly={true}
            />
            <div className="col-span-12 md:col-span-4 mt-2">
              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-600">Weight (B)</label>
                <div className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-extrabold text-slate-900">
                  {totalWeight}
                </div>
              </div>
            </div>
            <div className="col-span-12 md:col-span-4 mt-2">
              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-600">Purchase Amount (A x B)</label>
                <div className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-extrabold text-emerald-700">
                  {purchaseAmount}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-3 mb-4">
            <Input
              col="col-span-12 md:col-span-4"
              label="Final - Fix"
              value={approval.finalFix}
              onChange={(v) => setApproval((p) => ({ ...p, finalFix: v }))}
              readOnly={true}
            />
            
            <div className="col-span-12 md:col-span-4">
              <label className="text-xs font-bold text-slate-600">Vehicle Number</label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <VehicleSearchDropdown
                    value={approval.vehicleNo}
                    onSelect={handleVehicleSelect}
                    placeholder="Search vehicle..."
                  />
                </div>
                <button
                  onClick={handleCreateVehicle}
                  className="rounded-lg bg-green-600 px-3 py-2 text-xs font-bold text-white hover:bg-green-700 transition whitespace-nowrap mt-1"
                  title="Create New Vehicle"
                >
                  Create
                </button>
              </div>
              {selectedVehicle && (
                <div className="mt-1 text-xs text-slate-500">
                  RC: {selectedVehicle.rcNumber} | Owner: {selectedVehicle.ownerName}
                </div>
              )}
            </div>

            <Input
              col="col-span-12 md:col-span-4"
              label="Mobile"
              value={approval.mobile}
              onChange={(v) => setApproval((p) => ({ ...p, mobile: v }))}
              readOnly={true}
            />
          </div>

          <div className="grid grid-cols-12 gap-3 mb-4">
            <Select
              col="col-span-12 md:col-span-4"
              label="Purchase - Type"
              value={approval.purchaseType}
              onChange={(v) => setApproval((p) => ({ ...p, purchaseType: v }))}
              options={PURCHASE_TYPES}
              readOnly={true}
            />
            <Select
              col="col-span-12 md:col-span-4"
              label="Payment - Terms"
              value={approval.paymentTerms}
              onChange={(v) => setApproval((p) => ({ ...p, paymentTerms: v }))}
              options={PAYMENT_TERMS}
              readOnly={true}
            />
            <Select
              col="col-span-12 md:col-span-4"
              label="Approval"
              value={approval.approvalStatus}
              onChange={(v) => setApproval((p) => ({ ...p, approvalStatus: v }))}
              options={APPROVALS}
              readOnly={true}
            />
          </div>

          <div>
            <div className="text-sm font-extrabold text-slate-900 mb-3">Remarks</div>
            <textarea
              value={approval.remarks}
              onChange={(e) => setApproval((p) => ({ ...p, remarks: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              rows={2}
              placeholder="Enter approval remarks..."
              readOnly={true}
            />
          </div>
        </Card>

        {/* ===== MEMO UPLOAD ===== */}
        <Card title="Memo - Upload">
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="text-sm font-extrabold text-slate-900 mb-3">Memo Upload</div>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleMemoUpload}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            />
            <div className="mt-3 text-sm">
              Status:{" "}
              <span className={`font-extrabold ${approval.memoStatus === "Uploaded" ? "text-green-700" : "text-yellow-700"}`}>
                {approval.memoStatus || "Pending"}
              </span>
            </div>
            {approval.memoFile && (
              <div className="mt-2 text-xs text-slate-600">
                File: {approval.memoFile.originalName}
                {approval.memoFile.filePath && process.env.NODE_ENV === 'development' && (
                  <a 
                    href={approval.memoFile.filePath} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-2 text-sky-600 hover:underline"
                  >
                    View
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