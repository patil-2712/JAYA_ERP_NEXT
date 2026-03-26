"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/** =========================
 * CONSTANTS
 ========================= */
const PACK_TYPES = [
  { key: "PALLETIZATION", label: "Palletization" },
  { key: "UNIFORM - BAGS/BOXES", label: "Uniform - Bags/Boxes" },
  { key: "LOOSE - CARGO", label: "Loose - Cargo" },
];

const DELIVERY_OPTIONS = ["Urgent", "Normal", "Express", "Scheduled"];
const ORDER_TYPES = ["Sales", "STO Order", "Export", "Import"];
const PKGS_TYPE_OPTIONS = ["Drum", "Boxes", "Bags", "Cartons", "Crates", "Pallets", "Box"];
const UOM_OPTIONS = ["KG", "LTR", "TON", "M3", "PCS", "Kgs", "Ltr", "MT"];
const PRODUCT_NAME_OPTIONS = [
  "CALCIUM NITRATE 20KG", 
  "CALCIUM NITRATE 10KG", 
  "CALCIUM NITRATE 1KG", 
  "Chromite Sand", 
  "Bud Builder", 
  "Di-Betic Easter", 
  "Polysulphate - Premium", 
  "YaraVita Stopit 1Ltr"
];
const SKU_SIZE_OPTIONS = ["20 Kgs", "10 Kgs", "1 Kgs", "100 Ltr", "200 Kgs", "1 Ltr", "20"];
const VEHICLE_TYPE_OPTIONS = ["Truck - 6 Wheels", "Truck - 10 Wheels", "Truck - 14 Wheels", "Container", "Trailer"];
const BILLING_TYPES = ["Multi - Order", "Single Order"];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
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
  Vehicle Negotiation Hook - Shows only unused VNNs
========================= */
function useVehicleNegotiation() {
  const [negotiations, setNegotiations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNegotiations = async (search = "") => {
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
      
      // Fetch all loading info panels to see which VNNs are already used
      const loadingRes = await fetch('/api/loading-panel?format=table', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const loadingData = await loadingRes.json();
      
      // Create a Set of used VNNs
      const usedVnns = new Set();
      if (loadingData.success && Array.isArray(loadingData.data)) {
        loadingData.data.forEach(item => {
          if (item.vehicleNegotiationNo && item.vehicleNegotiationNo !== '-' && item.vehicleNegotiationNo !== 'N/A') {
            usedVnns.add(item.vehicleNegotiationNo);
          }
        });
      }
      
      // Filter out VNNs that are already used in loading panels
      if (vnData.success && Array.isArray(vnData.data)) {
        const availableVNs = vnData.data.filter(vn => !usedVnns.has(vn.vnnNo));
        setNegotiations(availableVNs);
        console.log(`📊 Found ${availableVNs.length} available VNNs out of ${vnData.data.length} total`);
      } else {
        setNegotiations([]);
        setError(vnData.message || 'No vehicle negotiations found');
      }
    } catch (err) {
      console.error('Error fetching vehicle negotiations:', err);
      setNegotiations([]);
      setError('Failed to fetch vehicle negotiations');
    } finally {
      setLoading(false);
    }
  };

  const getNegotiationById = async (id) => {
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
    fetchNegotiations();
  }, []);

  return { negotiations, loading, error, fetchNegotiations, getNegotiationById };
}

/* =======================
  Loading Info Hook - To check used VNNs
========================= */
function useLoadingInfo() {
  const [loadingInfos, setLoadingInfos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLoadingInfos = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/loading-panel?format=table', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = await res.json();
      
      if (data.success && Array.isArray(data.data)) {
        setLoadingInfos(data.data);
      } else {
        setLoadingInfos([]);
      }
    } catch (err) {
      console.error('Error fetching loading infos:', err);
      setError('Failed to fetch loading infos');
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount
  useEffect(() => {
    fetchLoadingInfos();
  }, []);

  return { loadingInfos, loading, error, fetchLoadingInfos };
}

/** =========================
 * DEFAULT EMPTY ROWS
 ========================= */
function defaultOrderRow() {
  return {
    _id: uid(),
    orderNo: "",
    partyName: "",
    plantCode: "",
    plantName: "",
    orderType: "",
    pinCode: "",
    state: "",
    district: "",
    from: "",
    to: "",
    weight: "",
  };
}

/** =========================
 * DEFAULT PACK DATA ROWS
 ========================= */
function defaultPackRow(packType) {
  if (packType === "PALLETIZATION") {
    return {
      _id: uid(),
      noOfPallets: "",
      unitPerPallets: "",
      totalPkgs: "",
      pkgsType: "",
      uom: "",
      skuSize: "",
      packWeight: "",
      productName: "",
      wtLtr: "",
      actualWt: "",
      chargedWt: "",
      wtUom: "",
      isUniform: false,
    };
  }

  if (packType === "UNIFORM - BAGS/BOXES") {
    return {
      _id: uid(),
      totalPkgs: "",
      pkgsType: "",
      uom: "",
      skuSize: "",
      packWeight: "",
      productName: "",
      wtLtr: "",
      actualWt: "",
      chargedWt: "",
      wtUom: "",
    };
  }

  // LOOSE - CARGO
  return {
    _id: uid(),
    uom: "",
    productName: "",
    actualWt: "",
    chargedWt: "",
  };
}

/* =======================
  UI Components
========================= */

// File upload item component
function FileUploadItem({ file, onRemove, index, label }) {
  return (
    <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 mt-1">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-700 truncate">{file.name}</p>
        <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
      </div>
      <button
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

// Vehicle Search Dropdown Component
function VehicleSearchDropdown({ 
  onSelect, 
  placeholder = "Search vehicle...",
  selectedVehicleId
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const dropdownRef = useRef(null);
  const vehicleSearch = useVehicleSearch();

  useEffect(() => {
    if (vehicleSearch.vehicles.length > 0) {
      setFilteredVehicles(vehicleSearch.vehicles);
    }
  }, [vehicleSearch.vehicles]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (query.trim() === "") {
      setFilteredVehicles(vehicleSearch.vehicles);
    } else {
      const filtered = vehicleSearch.vehicles.filter(vehicle =>
        vehicle.vehicleNumber?.toLowerCase().includes(query.toLowerCase()) ||
        vehicle.ownerName?.toLowerCase().includes(query.toLowerCase()) ||
        vehicle.rcNumber?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredVehicles(filtered);
    }
    
    if (!showDropdown) {
      setShowDropdown(true);
    }
  };

  const handleSelectVehicle = (vehicle) => {
    setSearchQuery(vehicle.vehicleNumber);
    setShowDropdown(false);
    onSelect(vehicle);
  };

  const handleInputFocus = async () => {
    if (vehicleSearch.vehicles.length === 0) {
      await vehicleSearch.searchVehicles();
    }
    setFilteredVehicles(vehicleSearch.vehicles);
    setShowDropdown(true);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={handleInputFocus}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
        placeholder={placeholder}
        autoComplete="off"
      />
      
      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {vehicleSearch.loading ? (
            <div className="p-3 text-center text-sm text-slate-500">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sky-500 mx-auto"></div>
              <p className="mt-1">Loading vehicles...</p>
            </div>
          ) : filteredVehicles.length > 0 ? (
            filteredVehicles.map((vehicle) => (
              <div
                key={vehicle._id}
                onMouseDown={() => handleSelectVehicle(vehicle)}
                className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors"
              >
                <div className="font-medium text-slate-800">
                  {vehicle.vehicleNumber}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Owner: {vehicle.ownerName} | RC: {vehicle.rcNumber}
                </div>
                {vehicle.insuranceNumber && (
                  <div className="text-xs text-slate-400">
                    Insurance: {vehicle.insuranceNumber}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-3 text-center text-sm text-slate-500">
              {searchQuery.trim() ? 
                `No vehicles found for "${searchQuery}"` : 
                "No vehicles available"
              }
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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

function Select({ label, value, onChange, options = [], col = "", readOnly = false }) {
  return (
    <div className={col}>
      <label className="text-xs font-bold text-slate-600">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={readOnly}
        className={`mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
          readOnly ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
        }`}
      >
        <option value="">Select {label}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function SearchableDropdown({ 
  items, 
  selectedId, 
  onSelect, 
  placeholder = "Search...",
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
    setFilteredItems(items || []);
    if (selectedId && items?.length > 0) {
      const item = items.find(i => i._id === selectedId || i.name === selectedId);
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
    const display = item[displayField] || "";
    const code = item[codeField] ? `(${item[codeField]})` : "";
    return `${display} ${code}`.trim();
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredItems(items || []);
    } else {
      const filtered = (items || []).filter(item =>
        (item[displayField]?.toLowerCase().includes(query.toLowerCase())) ||
        (item[codeField]?.toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredItems(filtered);
    }
  };

  const handleSelectItem = (item) => {
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
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
        placeholder={placeholder}
        disabled={disabled}
      />
      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {filteredItems?.length > 0 ? (
            filteredItems.map((item) => (
              <div
                key={item._id}
                onMouseDown={() => handleSelectItem(item)}
                className={`p-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 ${
                  selectedItem?._id === item._id ? 'bg-sky-50' : ''
                }`}
              >
                <div className="font-medium text-slate-800 text-sm">
                  {item[displayField]}
                </div>
                {item[codeField] && (
                  <div className="text-xs text-slate-500">Code: {item[codeField]}</div>
                )}
              </div>
            ))
          ) : (
            <div className="p-2 text-center text-sm text-slate-500">No items found</div>
          )}
        </div>
      )}
    </div>
  );
}

function TableSearchableDropdown({ 
  items, 
  selectedId, 
  onSelect, 
  placeholder = "Search...",
  displayField = 'name',
  codeField = 'code',
  disabled = false,
  cellId = ""
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setFilteredItems(items || []);
    if (selectedId && items?.length > 0) {
      const item = items.find(i => i._id === selectedId || i.name === selectedId);
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
    const display = item[displayField] || "";
    const code = item[codeField] ? `(${item[codeField]})` : "";
    return `${display} ${code}`.trim();
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredItems(items || []);
    } else {
      const filtered = (items || []).filter(item =>
        (item[displayField]?.toLowerCase().includes(query.toLowerCase())) ||
        (item[codeField]?.toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredItems(filtered);
    }
  };

  const handleInputFocus = () => {
    if (!showDropdown && inputRef.current) {
      setFilteredItems(items || []);
      const inputRect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: inputRect.bottom + window.scrollY + 4,
        left: inputRect.left + window.scrollX,
        width: inputRect.width
      });
      setShowDropdown(true);
    }
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setSearchQuery(getDisplayValue(item));
    setShowDropdown(false);
    onSelect?.(item);
  };

  return (
    <>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-sky-500"
          placeholder={placeholder}
          disabled={disabled}
        />
      </div>
      {showDropdown && (
        <div 
          ref={dropdownRef}
          className="fixed z-[9999] bg-white border border-slate-200 rounded-lg shadow-lg overflow-y-auto max-h-60"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`
          }}
        >
          {filteredItems?.length > 0 ? (
            filteredItems.map((item) => (
              <div
                key={item._id}
                onMouseDown={() => handleSelectItem(item)}
                className="p-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100"
              >
                <div className="font-medium text-slate-800 text-sm">
                  {item[displayField]}
                </div>
                {item[codeField] && (
                  <div className="text-xs text-slate-500">Code: {item[codeField]}</div>
                )}
              </div>
            ))
          ) : (
            <div className="p-2 text-center text-sm text-slate-500">No items found</div>
          )}
        </div>
      )}
    </> 
  );
}

function PackTypeTable({ packType, rows, onChange, onRemove, onDuplicate, onToggleUniform }) {
  const cols = useMemo(() => {
    if (packType === "PALLETIZATION") {
      return [
        { key: "noOfPallets", label: "NO OF PALLETS", type: "number", options: null },
        { key: "unitPerPallets", label: "UNIT PER PALLETS", type: "number", options: null },
        { key: "totalPkgs", label: "TOTAL PKGS", type: "number", options: null, readOnly: true },
        { key: "pkgsType", label: "PKGS TYPE", type: "text", options: PKGS_TYPE_OPTIONS },
        { key: "uom", label: "UOM", type: "text", options: UOM_OPTIONS },
        { key: "skuSize", label: "SKU - SIZE", type: "text", options: SKU_SIZE_OPTIONS },
        { key: "packWeight", label: "PACK - WEIGHT", type: "number", options: null },
        { key: "productName", label: "PRODUCT NAME", type: "text", options: PRODUCT_NAME_OPTIONS },
        { key: "wtLtr", label: "WT (LTR)", type: "number", options: null },
        { key: "actualWt", label: "ACTUAL - WT", type: "number", options: null },
        { key: "chargedWt", label: "CHARGED - WT", type: "number", options: null },
        { key: "wtUom", label: "UOM", type: "text", options: UOM_OPTIONS },
      ];
    }

    if (packType === "UNIFORM - BAGS/BOXES") {
      return [
        { key: "totalPkgs", label: "TOTAL PKGS", type: "number", options: null },
        { key: "pkgsType", label: "PKGS TYPE", type: "text", options: PKGS_TYPE_OPTIONS },
        { key: "uom", label: "UOM", type: "text", options: UOM_OPTIONS },
        { key: "skuSize", label: "SKU - SIZE", type: "text", options: SKU_SIZE_OPTIONS },
        { key: "packWeight", label: "PACK - WEIGHT", type: "number", options: null },
        { key: "productName", label: "PRODUCT NAME", type: "text", options: PRODUCT_NAME_OPTIONS },
        { key: "wtLtr", label: "WT (LTR)", type: "number", options: null },
        { key: "actualWt", label: "ACTUAL - WT", type: "number", options: null },
        { key: "chargedWt", label: "CHARGED - WT", type: "number", options: null },
        { key: "wtUom", label: "UOM", type: "text", options: UOM_OPTIONS },
      ];
    }

    return [
      { key: "uom", label: "UOM", type: "text", options: UOM_OPTIONS },
      { key: "productName", label: "PRODUCT NAME", type: "text", options: PRODUCT_NAME_OPTIONS },
      { key: "actualWt", label: "ACTUAL - WT", type: "number", options: null },
      { key: "chargedWt", label: "CHARGED - WT", type: "number", options: null },
    ];
  }, [packType]);

  const handleChange = (rowId, key, value) => {
    onChange(rowId, key, value);
  };

  return (
    <div className="overflow-auto rounded-xl border border-yellow-300">
      <table className="min-w-full w-full text-sm">
        <thead className="sticky top-0 bg-yellow-400">
          <tr>
            {packType === "PALLETIZATION" && (
              <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">
                UNIFORM
              </th>
            )}
            {cols.map((c) => (
              <th
                key={c.key}
                className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center"
              >
                {c.label}
              </th>
            ))}
            <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {rows && rows.length > 0 ? (
            rows.map((r) => (
              <tr key={r._id} className="hover:bg-yellow-50 even:bg-slate-50">
                {packType === "PALLETIZATION" && (
                  <td className="border border-yellow-300 px-2 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={r.isUniform || false}
                      onChange={() => onToggleUniform(r._id)}
                      className="h-4 w-4 rounded border-yellow-300 text-yellow-600 focus:ring-yellow-500"
                    />
                  </td>
                )}
                
                {cols.map((c) => (
                  <td key={c.key} className="border border-yellow-300 px-2 py-2">
                    {c.options ? (
                      <select
                        value={r[c.key] || ""}
                        onChange={(e) => handleChange(r._id, c.key, e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                      >
                        <option value="">Select {c.label}</option>
                        {c.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={c.type || "text"}
                        value={r[c.key] || ""}
                        readOnly={c.readOnly}
                        onChange={(e) => handleChange(r._id, c.key, e.target.value)}
                        className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${c.readOnly ? 'bg-slate-50' : 'bg-white'}`}
                        placeholder={`Enter ${c.label}`}
                      />
                    )}
                  </td>
                ))}
                <td className="border border-yellow-300 px-2 py-2">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => onDuplicate(r._id)}
                      className="rounded-lg border border-yellow-500 bg-yellow-100 px-3 py-1.5 text-xs font-bold text-yellow-800 hover:bg-yellow-200 transition"
                    >
                      Duplicate
                    </button>
                    <button
                      onClick={() => onRemove(r._id)}
                      className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600 transition"
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={cols.length + (packType === "PALLETIZATION" ? 2 : 1)}
                className="border border-yellow-300 px-4 py-10 text-center text-slate-400 font-semibold"
              >
                No rows yet. Click <b>Add Row</b> to add data.
              </td>
            </tr>
          )}
        </tbody>
        <tfoot className="bg-yellow-100">
          <tr>
            <td
              colSpan={packType === "PALLETIZATION" ? cols.length + 1 : cols.length}
              className="border border-yellow-300 px-3 py-2 text-right font-bold"
            >
              Total Actual Weight:
            </td>
            <td className="border border-yellow-300 px-3 py-2 font-bold">
              {rows.reduce((sum, r) => sum + num(r.actualWt), 0).toFixed(2)}
            </td>
            <td className="border border-yellow-300 px-3 py-2"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default function CreateLoadingInfoPanel() {
  const router = useRouter();

  /** =========================
   * STATE FOR API DATA
   ========================= */
  const [branches, setBranches] = useState([]);
  const [plants, setPlants] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [fetchingNegotiationData, setFetchingNegotiationData] = useState(false);

  /** =========================
   * VEHICLE SEARCH STATE
   ========================= */
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const vehicleSearch = useVehicleSearch();
  const vehicleNegotiation = useVehicleNegotiation();
  const loadingInfo = useLoadingInfo();

  /** =========================
   * VEHICLE NEGOTIATION SEARCH STATE
   ========================= */
  const [vehicleNegotiationNo, setVehicleNegotiationNo] = useState("");
  const [showVehicleNegotiationDropdown, setShowVehicleNegotiationDropdown] = useState(false);
  const [filteredVehicleNegotiations, setFilteredVehicleNegotiations] = useState([]);
  const [selectedVehicleNegotiation, setSelectedVehicleNegotiation] = useState(null);
  const vehicleNegotiationDropdownRef = useRef(null);

  /** =========================
   * HEADER STATE
   ========================= */
  const [header, setHeader] = useState({
    vehicleArrivalNo: "",
    vehicleNegotiationNo: "",
    branch: "",
    branchName: "",
    branchCode: "",
    date: new Date().toISOString().split('T')[0],
    delivery: "",
    billingType: "",
    noOfLoadingPoints: "",
    noOfDroppingPoint: "",
    collectionCharges: "",
    cancellationCharges: "",
    loadingCharges: "",
    otherCharges: "",
  });

  /** =========================
   * ORDERS TABLE STATE
   ========================= */
  const [orderRows, setOrderRows] = useState([defaultOrderRow()]);

  /** =========================
   * VEHICLE & DRIVER STATE
   ========================= */
  const [vehicleInfo, setVehicleInfo] = useState({
    vehicleNo: "",
    driverMobileNo: "",
    driverName: "",
    drivingLicense: "",
    vehicleWeight: "",
    vehicleOwnerName: "",
    vehicleOwnerRC: "",
    ownerPanCard: "",
    verified: false,
    vehicleType: "",
    message: "",
    remarks: "",
    rcDocument: "",
    panDocument: "",
    licenseDocument: "",
    driverPhoto: "",
    vehicleId: "",
    insuranceNumber: "",
    chasisNumber: "",
    fitnessNumber: "",
    pucNumber: ""
  });

  /** =========================
   * PACK DATA STATE
   ========================= */
  const [activePack, setActivePack] = useState("PALLETIZATION");
  const [packData, setPackData] = useState({
    PALLETIZATION: [defaultPackRow("PALLETIZATION")],
    "UNIFORM - BAGS/BOXES": [defaultPackRow("UNIFORM - BAGS/BOXES")],
    "LOOSE - CARGO": [defaultPackRow("LOOSE - CARGO")],
  });

  /** =========================
   * DEDUCTIONS STATE
   ========================= */
  const [deductionRows, setDeductionRows] = useState([]);
  const [totalQuantity, setTotalQuantity] = useState("");

  /** =========================
   * UPLOAD SECTIONS STATE (Stores File objects temporarily)
   ========================= */
  const [vbpFiles, setVbpFiles] = useState({
    vbp1: [], vbp2: [], vbp3: [], vbp4: [],
    vbp5: [], vbp6: [], vbp7: [], videoVbp: [],
  });

  const [vftFiles, setVftFiles] = useState({
    vft1: [], vft2: [], vft3: [], vft4: [],
    vft5: [], vft6: [], vft7: [], videoVft: [],
  });

  const [votFiles, setVotFiles] = useState({
    vot1: [], vot2: [], vot3: [], vot4: [],
    vot5: [], vot6: [], vot7: [], videoVot: [],
  });

  const [vlFiles, setVlFiles] = useState({
    vl1: [], vl2: [], vl3: [], vl4: [],
    vl5: [], vl6: [], vl7: [], videoVl: [],
  });

  const [vehicleFiles, setVehicleFiles] = useState({
    rc: [], pan: [], license: [], photo: []
  });

  const [weighmentFiles, setWeighmentFiles] = useState({
    weighSlip: []
  });

  /** =========================
   * UPLOAD SECTIONS STATE (For approvals and remarks) - READ ONLY
   ========================= */
  const [vbpUploads, setVbpUploads] = useState({
    approval: "",
    remark: "",
  });

  const [vftUploads, setVftUploads] = useState({
    approval: "",
  });

  const [votUploads, setVotUploads] = useState({
    approval: "",
  });

  const [vlUploads, setVlUploads] = useState({
    approval: "",
    loadingStatus: "",
  });

  const [loadedWeighment, setLoadedWeighment] = useState({
    approval: "",
    loadingCharges: "",
    loadingStaffMunshiyana: "",
    otherExpenses: "",
    vehicleFloorTarpaulin: "",
    vehicleOuterTarpaulin: "",
  });

  /** =========================
   * GPS TRACKING STATE
   ========================= */
  const [gpsTracking, setGpsTracking] = useState({
    driverMobileNumber: "",
    isTrackingActive: false,
  });

  /** =========================
   * ARRIVAL DETAILS
   ========================= */
  const [arrivalDetails, setArrivalDetails] = useState({
    date: new Date().toISOString().split('T')[0],
    time: "",
  });

  /** =========================
   * FETCH DATA FROM APIs
   ========================= */
  useEffect(() => {
    fetchBranches();
    fetchPlants();
    fetchOrders();
    vehicleSearch.searchVehicles();
  }, []);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setBranches([]);
        return;
      }
      
      const res = await fetch('/api/branches', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setBranches(data.data);
      } else {
        setBranches([]);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      setBranches([]);
      setApiError('Failed to fetch branches');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlants = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setPlants([]);
        return;
      }
      
      const res = await fetch('/api/plants', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setPlants(data.data);
      } else {
        setPlants([]);
      }
    } catch (error) {
      console.error('Error fetching plants:', error);
      setPlants([]);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setOrders([]);
        return;
      }
      
      const res = await fetch('/api/order-panel', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setOrders(data.data);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    }
  };

  /** =========================
   * VEHICLE SELECT HANDLER
   ========================= */
  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
    
    setVehicleInfo({
      ...vehicleInfo,
      vehicleNo: vehicle.vehicleNumber || "",
      vehicleOwnerName: vehicle.ownerName || "",
      vehicleOwnerRC: vehicle.rcNumber || "",
      ownerPanCard: vehicle.panCard || "",
      vehicleType: vehicle.vehicleType || "",
      vehicleWeight: vehicle.vehicleWeight || "",
      insuranceNumber: vehicle.insuranceNumber || "",
      chasisNumber: vehicle.chasisNumber || "",
      fitnessNumber: vehicle.fitnessNumber || "",
      pucNumber: vehicle.pucNumber || "",
      vehicleId: vehicle._id || "",
      driverName: vehicle.driverName || vehicleInfo.driverName,
      driverMobileNo: vehicle.driverMobile || vehicleInfo.driverMobileNo,
      drivingLicense: vehicle.drivingLicense || vehicleInfo.drivingLicense,
    });

    alert(`✅ Vehicle ${vehicle.vehicleNumber} loaded successfully`);
  };

  /** =========================
   * CREATE VEHICLE FUNCTION
   ========================= */
  const handleCreateVehicle = () => {
    router.push('/admin/vehicle2');
  };

  /** =========================
   * VEHICLE NEGOTIATION HANDLERS
   ========================= */
  const handleVehicleNegotiationSearch = (query) => {
    setVehicleNegotiationNo(query);
    
    if (query.trim() === "") {
      setFilteredVehicleNegotiations(vehicleNegotiation.negotiations);
    } else {
      const filtered = vehicleNegotiation.negotiations.filter(nego =>
        nego.vnnNo?.toLowerCase().includes(query.toLowerCase()) ||
        nego.customerName?.toLowerCase().includes(query.toLowerCase()) ||
        nego.branchName?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredVehicleNegotiations(filtered);
    }
  };

const handleSelectVehicleNegotiation = async (negotiation) => {
  setSelectedVehicleNegotiation(negotiation);
  setVehicleNegotiationNo(negotiation.vnnNo);
  setShowVehicleNegotiationDropdown(false);
  setFetchingNegotiationData(true);
  
  try {
    // Fetch full negotiation details
    const fullNegotiation = await vehicleNegotiation.getNegotiationById(negotiation._id);
    
    console.log("===== FULL NEGOTIATION DATA =====");
    console.log("Full Negotiation:", fullNegotiation);
    
    if (fullNegotiation) {
      // Auto-fill header with negotiation data
      setHeader({
        ...header,
        vehicleNegotiationNo: negotiation.vnnNo,
        branch: fullNegotiation.branch || "",
        branchName: fullNegotiation.branchName || "",
        branchCode: fullNegotiation.branchCode || "",
        delivery: fullNegotiation.delivery || "",
        billingType: fullNegotiation.billingType || "",
        noOfLoadingPoints: fullNegotiation.loadingPoints?.toString() || "",
        noOfDroppingPoint: fullNegotiation.dropPoints?.toString() || "",
        collectionCharges: fullNegotiation.collectionCharges?.toString() || "",
        cancellationCharges: fullNegotiation.cancellationCharges || "",
        loadingCharges: fullNegotiation.loadingCharges || "",
        otherCharges: fullNegotiation.otherCharges || "",
      });

      // Auto-fill vehicle information from the negotiation
      if (fullNegotiation.vehicleInfo) {
        const vInfo = fullNegotiation.vehicleInfo;
        setVehicleInfo({
          ...vehicleInfo,
          vehicleNo: vInfo.vehicleNo || "",
          driverMobileNo: vInfo.driverMobileNo || "",
          driverName: vInfo.driverName || "",
          drivingLicense: vInfo.drivingLicense || "",
          vehicleWeight: vInfo.vehicleWeight?.toString() || "",
          vehicleOwnerName: vInfo.vehicleOwnerName || "",
          vehicleOwnerRC: vInfo.vehicleOwnerRC || "",
          ownerPanCard: vInfo.ownerPanCard || "",
          verified: vInfo.verified || false,
          vehicleType: vInfo.vehicleType || "",
          message: vInfo.message || "",
          remarks: vInfo.remarks || "",
          rcDocument: vInfo.rcDocument || "",
          panDocument: vInfo.panDocument || "",
          licenseDocument: vInfo.licenseDocument || "",
          driverPhoto: vInfo.driverPhoto || "",
          vehicleId: vInfo.vehicleId || "",
          insuranceNumber: vInfo.insuranceNumber || "",
          chasisNumber: vInfo.chasisNumber || "",
          fitnessNumber: vInfo.fitnessNumber || "",
          pucNumber: vInfo.pucNumber || ""
        });
      }

      // Auto-fill orders from the negotiation
      if (fullNegotiation.orders && fullNegotiation.orders.length > 0) {
        console.log("Orders found:", fullNegotiation.orders);
        const newOrderRows = fullNegotiation.orders.map(order => ({
          _id: uid(),
          orderNo: order.orderNo || "",
          partyName: order.partyName || fullNegotiation.customerName || "",
          plantCode: order.plantCode || "",
          plantName: order.plantName || "",
          orderType: order.orderType || "",
          pinCode: order.pinCode || "",
          state: order.stateName || order.state || "",
          district: order.districtName || order.district || "",
          from: order.fromName || order.from || "",
          to: order.toName || order.to || "",
          weight: order.weight?.toString() || "",
        }));
        
        setOrderRows(newOrderRows);
      }

      // ===== FETCH PACK DATA FROM ORIGINAL ORDER PANELS USING ORDER NUMBERS =====
      console.log("===== FETCHING PACK DATA FROM ORDER PANELS =====");
      
      // Initialize merged pack data structure
      let mergedPackData = {
        PALLETIZATION: [],
        'UNIFORM - BAGS/BOXES': [],
        'LOOSE - CARGO': []
      };
      
      let packDataFound = false;
      const token = localStorage.getItem('token');
      
      if (fullNegotiation.orders && fullNegotiation.orders.length > 0) {
        console.log(`Processing ${fullNegotiation.orders.length} orders for pack data`);
        
        // First, fetch all order panels once (optimization)
        console.log("Fetching all order panels...");
        const allOrdersRes = await fetch('/api/order-panel', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (allOrdersRes.ok) {
          const allOrdersData = await allOrdersRes.json();
          
          if (allOrdersData.success && allOrdersData.data) {
            console.log(`Found ${allOrdersData.data.length} total order panels`);
            
            // Create a map for faster lookup
            const orderPanelMap = {};
            allOrdersData.data.forEach(op => {
              orderPanelMap[op.orderPanelNo] = op._id;
            });
            
            // Process each order from the negotiation
            for (let i = 0; i < fullNegotiation.orders.length; i++) {
              const order = fullNegotiation.orders[i];
              const orderNo = order.orderNo; // Like "OP-0006"
              
              if (orderNo) {
                console.log(`\n----- Processing Order ${i+1}: ${orderNo} -----`);
                
                // Find the order panel ID from our map
                const orderPanelId = orderPanelMap[orderNo];
                
                if (orderPanelId) {
                  console.log(`✅ Found matching order panel for ${orderNo}, ID: ${orderPanelId}`);
                  
                  // Fetch the full order panel details using its ID
                  try {
                    const fullOrderRes = await fetch(`/api/order-panel?id=${orderPanelId}`, {
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    
                    if (fullOrderRes.ok) {
                      const fullOrderData = await fullOrderRes.json();
                      
                      if (fullOrderData.success && fullOrderData.data) {
                        const orderPanel = fullOrderData.data;
                        
                        // Check if the order panel has packData
                        if (orderPanel.packData) {
                          console.log(`✅ Order ${orderNo} HAS packData!`);
                          packDataFound = true;
                          
                          // Process PALLETIZATION data - APPEND to merged data
                          if (orderPanel.packData.PALLETIZATION && orderPanel.packData.PALLETIZATION.length > 0) {
                            console.log(`Found ${orderPanel.packData.PALLETIZATION.length} PALLETIZATION rows in order ${orderNo}`);
                            const newPalletRows = orderPanel.packData.PALLETIZATION.map(item => ({
                              _id: uid(),
                              noOfPallets: item.noOfPallets?.toString() || "",
                              unitPerPallets: item.unitPerPallets?.toString() || "",
                              totalPkgs: item.totalPkgs?.toString() || "",
                              pkgsType: item.pkgsType || "",
                              uom: item.uom || "",
                              skuSize: item.skuSize || "",
                              packWeight: item.packWeight?.toString() || "",
                              productName: item.productName || "",
                              wtLtr: item.wtLtr?.toString() || "",
                              actualWt: item.actualWt?.toString() || "",
                              chargedWt: item.chargedWt?.toString() || "",
                              wtUom: item.wtUom || "",
                              isUniform: item.isUniform || false,
                            }));
                            mergedPackData.PALLETIZATION = [...mergedPackData.PALLETIZATION, ...newPalletRows];
                          }
                          
                          // Process UNIFORM - BAGS/BOXES data - APPEND to merged data
                          if (orderPanel.packData['UNIFORM - BAGS/BOXES'] && orderPanel.packData['UNIFORM - BAGS/BOXES'].length > 0) {
                            console.log(`Found ${orderPanel.packData['UNIFORM - BAGS/BOXES'].length} UNIFORM rows in order ${orderNo}`);
                            const newUniformRows = orderPanel.packData['UNIFORM - BAGS/BOXES'].map(item => ({
                              _id: uid(),
                              totalPkgs: item.totalPkgs?.toString() || "",
                              pkgsType: item.pkgsType || "",
                              uom: item.uom || "",
                              skuSize: item.skuSize || "",
                              packWeight: item.packWeight?.toString() || "",
                              productName: item.productName || "",
                              wtLtr: item.wtLtr?.toString() || "",
                              actualWt: item.actualWt?.toString() || "",
                              chargedWt: item.chargedWt?.toString() || "",
                              wtUom: item.wtUom || "",
                            }));
                            mergedPackData['UNIFORM - BAGS/BOXES'] = [...mergedPackData['UNIFORM - BAGS/BOXES'], ...newUniformRows];
                          }
                          
                          // Process LOOSE - CARGO data - APPEND to merged data
                          if (orderPanel.packData['LOOSE - CARGO'] && orderPanel.packData['LOOSE - CARGO'].length > 0) {
                            console.log(`Found ${orderPanel.packData['LOOSE - CARGO'].length} LOOSE rows in order ${orderNo}`);
                            const newLooseRows = orderPanel.packData['LOOSE - CARGO'].map(item => ({
                              _id: uid(),
                              uom: item.uom || "",
                              productName: item.productName || "",
                              actualWt: item.actualWt?.toString() || "",
                              chargedWt: item.chargedWt?.toString() || "",
                            }));
                            mergedPackData['LOOSE - CARGO'] = [...mergedPackData['LOOSE - CARGO'], ...newLooseRows];
                          }
                        } else {
                          console.log(`Order panel ${orderNo} has no packData`);
                        }
                      }
                    }
                  } catch (error) {
                    console.error(`Error fetching full order panel for ${orderNo}:`, error);
                  }
                } else {
                  console.log(`No matching order panel found for ${orderNo}`);
                }
              }
            }
          }
        }
      }
      
      // After processing all orders, log the merged results
      console.log("\n===== MERGED PACK DATA FROM ALL ORDERS =====");
      console.log("Total PALLETIZATION rows:", mergedPackData.PALLETIZATION.length);
      console.log("Total UNIFORM rows:", mergedPackData['UNIFORM - BAGS/BOXES'].length);
      console.log("Total LOOSE rows:", mergedPackData['LOOSE - CARGO'].length);
      
      // If no pack data found in any order, use defaults
      if (!packDataFound || 
          (mergedPackData.PALLETIZATION.length === 0 && 
           mergedPackData['UNIFORM - BAGS/BOXES'].length === 0 && 
           mergedPackData['LOOSE - CARGO'].length === 0)) {
        console.log("No pack data found in any order panel, using defaults");
        mergedPackData = {
          PALLETIZATION: [defaultPackRow('PALLETIZATION')],
          'UNIFORM - BAGS/BOXES': [defaultPackRow('UNIFORM - BAGS/BOXES')],
          'LOOSE - CARGO': [defaultPackRow('LOOSE - CARGO')]
        };
      } else {
        // Ensure at least one row exists for each pack type (if completely empty)
        if (mergedPackData.PALLETIZATION.length === 0) {
          mergedPackData.PALLETIZATION.push(defaultPackRow('PALLETIZATION'));
        }
        if (mergedPackData['UNIFORM - BAGS/BOXES'].length === 0) {
          mergedPackData['UNIFORM - BAGS/BOXES'].push(defaultPackRow('UNIFORM - BAGS/BOXES'));
        }
        if (mergedPackData['LOOSE - CARGO'].length === 0) {
          mergedPackData['LOOSE - CARGO'].push(defaultPackRow('LOOSE - CARGO'));
        }
      }
      
      console.log("\n===== FINAL PACK DATA =====");
      console.log("PALLETIZATION:", mergedPackData.PALLETIZATION);
      console.log("UNIFORM:", mergedPackData['UNIFORM - BAGS/BOXES']);
      console.log("LOOSE:", mergedPackData['LOOSE - CARGO']);
      
      // Set the merged pack data
      setPackData(mergedPackData);
      
      // Set active pack based on which has the most data or first non-default
      if (mergedPackData.PALLETIZATION.length > 1 || 
          (mergedPackData.PALLETIZATION.length === 1 && mergedPackData.PALLETIZATION[0].noOfPallets)) {
        console.log("Setting active pack to PALLETIZATION");
        setActivePack('PALLETIZATION');
      } else if (mergedPackData['UNIFORM - BAGS/BOXES'].length > 1 ||
                (mergedPackData['UNIFORM - BAGS/BOXES'].length === 1 && mergedPackData['UNIFORM - BAGS/BOXES'][0].totalPkgs)) {
        console.log("Setting active pack to UNIFORM - BAGS/BOXES");
        setActivePack('UNIFORM - BAGS/BOXES');
      } else if (mergedPackData['LOOSE - CARGO'].length > 1 ||
                (mergedPackData['LOOSE - CARGO'].length === 1 && mergedPackData['LOOSE - CARGO'][0].actualWt)) {
        console.log("Setting active pack to LOOSE - CARGO");
        setActivePack('LOOSE - CARGO');
      }

      // Auto-fill approval statuses from negotiation
      if (fullNegotiation.approval) {
        setVbpUploads({
          approval: fullNegotiation.approval.vbpApproval || "",
          remark: fullNegotiation.approval.vbpRemark || "",
        });
        setVftUploads({
          approval: fullNegotiation.approval.vftApproval || "",
        });
        setVotUploads({
          approval: fullNegotiation.approval.votApproval || "",
        });
        setVlUploads({
          approval: fullNegotiation.approval.vlApproval || "",
          loadingStatus: fullNegotiation.approval.loadingStatus || "",
        });
        setLoadedWeighment({
          ...loadedWeighment,
          approval: fullNegotiation.approval.weighmentApproval || "",
        });
      }

      alert(`✅ Data loaded from Vehicle Negotiation: ${negotiation.vnnNo}`);
    }
  } catch (error) {
    console.error("Error loading vehicle negotiation:", error);
    alert(`❌ Failed to load data: ${error.message}`);
  } finally {
    setFetchingNegotiationData(false);
  }
};

  const handleVehicleNegotiationInputFocus = () => {
    if (!showVehicleNegotiationDropdown) {
      setFilteredVehicleNegotiations(vehicleNegotiation.negotiations);
      setShowVehicleNegotiationDropdown(true);
    }
  };

  const handleVehicleNegotiationInputBlur = () => {
    setTimeout(() => {
      if (vehicleNegotiationDropdownRef.current && !vehicleNegotiationDropdownRef.current.contains(document.activeElement)) {
        setShowVehicleNegotiationDropdown(false);
      }
    }, 200);
  };

  useEffect(() => {
    if (vehicleNegotiation.negotiations.length > 0) {
      setFilteredVehicleNegotiations(vehicleNegotiation.negotiations);
    }
  }, [vehicleNegotiation.negotiations]);

  /** =========================
   * ORDER ROW FUNCTIONS
   ========================= */
  const addOrderRow = () => setOrderRows([...orderRows, defaultOrderRow()]);

  const updateOrderRow = (rowId, key, value) => {
    setOrderRows((prev) =>
      prev.map((r) => (r._id === rowId ? { ...r, [key]: value } : r))
    );
  };

  const removeOrderRow = (rowId) => {
    if (orderRows.length > 1) {
      setOrderRows((prev) => prev.filter((r) => r._id !== rowId));
    } else {
      alert("At least one order row is required");
    }
  };

  /** =========================
   * PACK DATA FUNCTIONS
   ========================= */
  const rows = packData[activePack] || [];

  const updatePackRow = (rowId, key, value) => {
    setPackData((prev) => {
      const updatedPack = prev[activePack].map((r) => {
        if (r._id === rowId) {
          const updatedRow = { ...r, [key]: value };
          
          if (activePack === "PALLETIZATION") {
            if (key === "noOfPallets" || key === "unitPerPallets") {
              const noOfPallets = num(updatedRow.noOfPallets);
              const unitPerPallets = num(updatedRow.unitPerPallets);
              const totalPkgs = noOfPallets * unitPerPallets;
              updatedRow.totalPkgs = totalPkgs > 0 ? String(totalPkgs) : "";
            }
          }
          
          if (activePack === "UNIFORM - BAGS/BOXES") {
            if (key === "totalPkgs" || key === "packWeight") {
              const totalPkgs = num(updatedRow.totalPkgs);
              const packWeight = num(updatedRow.packWeight);
              updatedRow.wtLtr = totalPkgs * packWeight;
            }
            
            if (key === "wtLtr" || key === "totalPkgs" || key === "packWeight") {
              const wtLtr = num(updatedRow.wtLtr);
              updatedRow.actualWt = wtLtr * 2 / 1000;
            }
          }
          
          return updatedRow;
        }
        return r;
      });
      
      return {
        ...prev,
        [activePack]: updatedPack,
      };
    });
  };

  const addPackRow = () => {
    setPackData((prev) => ({
      ...prev,
      [activePack]: [...prev[activePack], defaultPackRow(activePack)],
    }));
  };

  const removePackRow = (id) => {
    const currentRows = packData[activePack] || [];
    if (currentRows.length > 1) {
      setPackData((prev) => ({
        ...prev,
        [activePack]: prev[activePack].filter((r) => r._id !== id),
      }));
    } else {
      alert("At least one row is required");
    }
  };

  const duplicatePackRow = (id) => {
    const row = (packData[activePack] || []).find((r) => r._id === id);
    if (!row) return;
    setPackData((prev) => ({
      ...prev,
      [activePack]: [...prev[activePack], { ...row, _id: uid() }],
    }));
  };

  const toggleUniformMode = (rowId) => {
    setPackData((prev) => {
      const updatedPack = prev[activePack].map((r) => {
        if (r._id === rowId) {
          return { ...r, isUniform: !r.isUniform };
        }
        return r;
      });
      
      return {
        ...prev,
        [activePack]: updatedPack,
      };
    });
  };

  /** =========================
   * BILLING TYPE CHANGE HANDLER
   ========================= */
  const handleBillingTypeChange = (value) => {
    setHeader((prev) => ({ ...prev, billingType: value }));
  };

  /** =========================
   * GPS TRACKING HANDLER
   ========================= */
  const handleActivateTracking = () => {
    if (!gpsTracking.driverMobileNumber) {
      alert("Please enter driver mobile number first");
      return;
    }
    setGpsTracking(prev => ({ ...prev, isTrackingActive: true }));
    alert(`✅ Tracking activated for mobile: ${gpsTracking.driverMobileNumber}`);
  };

  /** =========================
   * CALCULATED VALUES
   ========================= */
  const calculateTotalWeight = () => {
    return orderRows.reduce((sum, row) => sum + num(row.weight), 0);
  };

  const calculateTotalActualWt = () => {
    return packData[activePack].reduce((sum, row) => sum + num(row.actualWt), 0);
  };

  const calculateTotalCharges = () => {
    return (
      num(loadedWeighment.loadingCharges) +
      num(loadedWeighment.loadingStaffMunshiyana) +
      num(loadedWeighment.otherExpenses) +
      num(loadedWeighment.vehicleFloorTarpaulin) +
      num(loadedWeighment.vehicleOuterTarpaulin)
    );
  };

  /** =========================
   * BILLING COLUMNS FOR TABLE
   ========================= */
  const billingColumns = [
    { key: "billingType", label: "Billing Type", options: BILLING_TYPES },
    { key: "noOfLoadingPoints", label: "No. of Loading Points", type: "number" },
    { key: "noOfDroppingPoint", label: "No. of Droping Point", type: "number" },
    { key: "collectionCharges", label: "Collection Charges", type: "text" },
    { key: "cancellationCharges", label: "Cancellation Charges", type: "text" },
    { key: "loadingCharges", label: "Loading Charges", type: "text" },
    { key: "otherCharges", label: "Other Charges", type: "text" },
  ];

  /** =========================
   * HANDLE FILE SELECTION
   ========================= */
  const handleFileSelect = (section, field, isVideo = false) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = isVideo ? 'video/*' : 'image/*';
    input.multiple = false;
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      switch(section) {
        case 'vehicle':
          setVehicleFiles(prev => ({
            ...prev,
            [field]: [...prev[field], file]
          }));
          break;
          
        case 'vbp':
          setVbpFiles(prev => ({
            ...prev,
            [field]: [...prev[field], file]
          }));
          break;
          
        case 'vft':
          setVftFiles(prev => ({
            ...prev,
            [field]: [...prev[field], file]
          }));
          break;
          
        case 'vot':
          setVotFiles(prev => ({
            ...prev,
            [field]: [...prev[field], file]
          }));
          break;
          
        case 'vl':
          setVlFiles(prev => ({
            ...prev,
            [field]: [...prev[field], file]
          }));
          break;
          
        case 'weighment':
          setWeighmentFiles(prev => ({
            ...prev,
            [field]: [...prev[field], file]
          }));
          break;
      }
    };
    
    input.click();
  };

  /** =========================
   * REMOVE SELECTED FILE
   ========================= */
  const removeFile = (section, field, index) => {
    switch(section) {
      case 'vehicle':
        setVehicleFiles(prev => ({
          ...prev,
          [field]: prev[field].filter((_, i) => i !== index)
        }));
        break;
        
      case 'vbp':
        setVbpFiles(prev => ({
          ...prev,
          [field]: prev[field].filter((_, i) => i !== index)
        }));
        break;
        
      case 'vft':
        setVftFiles(prev => ({
          ...prev,
          [field]: prev[field].filter((_, i) => i !== index)
        }));
        break;
        
      case 'vot':
        setVotFiles(prev => ({
          ...prev,
          [field]: prev[field].filter((_, i) => i !== index)
        }));
        break;
        
      case 'vl':
        setVlFiles(prev => ({
          ...prev,
          [field]: prev[field].filter((_, i) => i !== index)
        }));
        break;
        
      case 'weighment':
        setWeighmentFiles(prev => ({
          ...prev,
          [field]: prev[field].filter((_, i) => i !== index)
        }));
        break;
    }
  };

  /** =========================
   * UPLOAD ALL FILES DURING SAVE
   ========================= */
const uploadAllFiles = async (token) => {
  const uploadPromises = [];
  const uploadedPaths = {
    vehicle: {},
    vbp: {},
    vft: {},
    vot: {},
    vl: {},
    weighment: {}
  };

  // Helper function to upload a single file
  const uploadFile = async (file, section, field) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('section', section);
    formData.append('field', field);

    try {
      const response = await fetch('/api/upload/excel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      // Check if response is OK
      if (!response.ok) {
        const text = await response.text();
        console.error(`Upload failed: ${response.status}`, text);
        throw new Error(`Upload failed with status ${response.status}`);
      }

      // Try to parse JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return data;
      } else {
        const text = await response.text();
        console.error('Response is not JSON:', text.substring(0, 200));
        throw new Error('Server returned non-JSON response');
      }
    } catch (error) {
      console.error(`Error uploading ${section}/${field}:`, error);
      throw error;
    }
  };

  // Upload vehicle files
  for (const [field, files] of Object.entries(vehicleFiles)) {
    for (const file of files) {
      uploadPromises.push(
        uploadFile(file, 'vehicle', field)
          .then(data => {
            if (data.success) {
              uploadedPaths.vehicle[field] = data.filePath;
            }
            return data;
          })
          .catch(error => {
            console.error(`Failed to upload vehicle/${field}:`, error);
            return null;
          })
      );
    }
  }

  // Upload VBP files
  for (const [field, files] of Object.entries(vbpFiles)) {
    for (const file of files) {
      uploadPromises.push(
        uploadFile(file, 'vbp', field)
          .then(data => {
            if (data.success) {
              uploadedPaths.vbp[field] = data.filePath;
            }
            return data;
          })
          .catch(error => {
            console.error(`Failed to upload vbp/${field}:`, error);
            return null;
          })
      );
    }
  }

  // Upload VFT files
  for (const [field, files] of Object.entries(vftFiles)) {
    for (const file of files) {
      uploadPromises.push(
        uploadFile(file, 'vft', field)
          .then(data => {
            if (data.success) {
              uploadedPaths.vft[field] = data.filePath;
            }
            return data;
          })
          .catch(error => {
            console.error(`Failed to upload vft/${field}:`, error);
            return null;
          })
      );
    }
  }

  // Upload VOT files
  for (const [field, files] of Object.entries(votFiles)) {
    for (const file of files) {
      uploadPromises.push(
        uploadFile(file, 'vot', field)
          .then(data => {
            if (data.success) {
              uploadedPaths.vot[field] = data.filePath;
            }
            return data;
          })
          .catch(error => {
            console.error(`Failed to upload vot/${field}:`, error);
            return null;
          })
      );
    }
  }

  // Upload VL files
  for (const [field, files] of Object.entries(vlFiles)) {
    for (const file of files) {
      uploadPromises.push(
        uploadFile(file, 'vl', field)
          .then(data => {
            if (data.success) {
              uploadedPaths.vl[field] = data.filePath;
            }
            return data;
          })
          .catch(error => {
            console.error(`Failed to upload vl/${field}:`, error);
            return null;
          })
      );
    }
  }

  // Upload weighment files
  for (const [field, files] of Object.entries(weighmentFiles)) {
    for (const file of files) {
      uploadPromises.push(
        uploadFile(file, 'weighment', field)
          .then(data => {
            if (data.success) {
              uploadedPaths.weighment[field] = data.filePath;
            }
            return data;
          })
          .catch(error => {
            console.error(`Failed to upload weighment/${field}:`, error);
            return null;
          })
      );
    }
  }

  // Wait for all uploads to complete
  const results = await Promise.allSettled(uploadPromises);
  console.log('Upload results:', results);

  return uploadedPaths;
};

  /** =========================
   * HANDLE SAVE
   ========================= */
  const handleSave = async () => {
    if (!header.branch) {
      alert("Please select a branch");
      return;
    }

    if (!vehicleInfo.vehicleNo) {
      alert("Please enter vehicle number");
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      
      setUploading(true);
      const uploadedPaths = await uploadAllFiles(token);
      setUploading(false);

      // Ensure pack data is properly formatted with all required fields
      const formattedPackData = {
        PALLETIZATION: packData.PALLETIZATION.map(item => ({
          _id: item._id,
          noOfPallets: item.noOfPallets || "",
          unitPerPallets: item.unitPerPallets || "",
          totalPkgs: item.totalPkgs || "",
          pkgsType: item.pkgsType || "",
          uom: item.uom || "",
          skuSize: item.skuSize || "",
          packWeight: item.packWeight || "",
          productName: item.productName || "",
          wtLtr: item.wtLtr || "",
          actualWt: item.actualWt || "",
          chargedWt: item.chargedWt || "",
          wtUom: item.wtUom || "",
          isUniform: item.isUniform || false
        })),
        'UNIFORM - BAGS/BOXES': packData['UNIFORM - BAGS/BOXES'].map(item => ({
          _id: item._id,
          totalPkgs: item.totalPkgs || "",
          pkgsType: item.pkgsType || "",
          uom: item.uom || "",
          skuSize: item.skuSize || "",
          packWeight: item.packWeight || "",
          productName: item.productName || "",
          wtLtr: item.wtLtr || "",
          actualWt: item.actualWt || "",
          chargedWt: item.chargedWt || "",
          wtUom: item.wtUom || "",
        })),
        'LOOSE - CARGO': packData['LOOSE - CARGO'].map(item => ({
          _id: item._id,
          uom: item.uom || "",
          productName: item.productName || "",
          actualWt: item.actualWt || "",
          chargedWt: item.chargedWt || "",
        }))
      };

      const payload = {
        header: {
          ...header,
          vehicleNegotiationNo: vehicleNegotiationNo,
        },
        vehicleInfo: {
          ...vehicleInfo,
          rcDocument: uploadedPaths.vehicle.rc || vehicleInfo.rcDocument,
          panDocument: uploadedPaths.vehicle.pan || vehicleInfo.panDocument,
          licenseDocument: uploadedPaths.vehicle.license || vehicleInfo.licenseDocument,
          driverPhoto: uploadedPaths.vehicle.photo || vehicleInfo.driverPhoto,
        },
        orderRows,
        packData: formattedPackData,
        deductionRows,
        totalQuantity,
        vbpUploads: {
          ...vbpUploads,
          vbp1: uploadedPaths.vbp.vbp1,
          vbp2: uploadedPaths.vbp.vbp2,
          vbp3: uploadedPaths.vbp.vbp3,
          vbp4: uploadedPaths.vbp.vbp4,
          vbp5: uploadedPaths.vbp.vbp5,
          vbp6: uploadedPaths.vbp.vbp6,
          vbp7: uploadedPaths.vbp.vbp7,
          videoVbp: uploadedPaths.vbp.videoVbp,
        },
        vftUploads: {
          ...vftUploads,
          vft1: uploadedPaths.vft.vft1,
          vft2: uploadedPaths.vft.vft2,
          vft3: uploadedPaths.vft.vft3,
          vft4: uploadedPaths.vft.vft4,
          vft5: uploadedPaths.vft.vft5,
          vft6: uploadedPaths.vft.vft6,
          vft7: uploadedPaths.vft.vft7,
          videoVft: uploadedPaths.vft.videoVft,
        },
        votUploads: {
          ...votUploads,
          vot1: uploadedPaths.vot.vot1,
          vot2: uploadedPaths.vot.vot2,
          vot3: uploadedPaths.vot.vot3,
          vot4: uploadedPaths.vot.vot4,
          vot5: uploadedPaths.vot.vot5,
          vot6: uploadedPaths.vot.vot6,
          vot7: uploadedPaths.vot.vot7,
          videoVot: uploadedPaths.vot.videoVot,
        },
        vlUploads: {
          ...vlUploads,
          vl1: uploadedPaths.vl.vl1,
          vl2: uploadedPaths.vl.vl2,
          vl3: uploadedPaths.vl.vl3,
          vl4: uploadedPaths.vl.vl4,
          vl5: uploadedPaths.vl.vl5,
          vl6: uploadedPaths.vl.vl6,
          vl7: uploadedPaths.vl.vl7,
          videoVl: uploadedPaths.vl.videoVl,
        },
        loadedWeighment: {
          ...loadedWeighment,
          weighSlip: uploadedPaths.weighment.weighSlip,
        },
        gpsTracking,
        arrivalDetails,
        totalWeight: calculateTotalWeight(),
        totalActualWeight: calculateTotalActualWt(),
        totalCharges: calculateTotalCharges(),
        activePack,
        vehicleNegotiationNo,
        selectedVehicle: selectedVehicle ? {
          id: selectedVehicle._id,
          vehicleNumber: selectedVehicle.vehicleNumber,
          ownerName: selectedVehicle.ownerName
        } : null,
        selectedVehicleNegotiation: selectedVehicleNegotiation ? {
          id: selectedVehicleNegotiation._id,
          vnnNo: selectedVehicleNegotiation.vnnNo
        } : null
      };

      console.log("Saving loading info:", payload);

      const res = await fetch('/api/loading-panel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      
      alert(`✅ Loading Info saved successfully!\nVehicle Arrival No: ${data.data?.vehicleArrivalNo || 'Generated'}`);
      
      resetForm();
      
    } catch (error) {
      console.error('Error saving loading info:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  /** =========================
   * RESET FORM
   ========================= */
  const resetForm = () => {
    setHeader({
      vehicleArrivalNo: "",
      vehicleNegotiationNo: "",
      branch: "",
      branchName: "",
      branchCode: "",
      date: new Date().toISOString().split('T')[0],
      delivery: "",
      billingType: "",
      noOfLoadingPoints: "",
      noOfDroppingPoint: "",
      collectionCharges: "",
      cancellationCharges: "",
      loadingCharges: "",
      otherCharges: "",
    });
    
    setVehicleNegotiationNo("");
    setSelectedVehicleNegotiation(null);
    setOrderRows([defaultOrderRow()]);
    setVehicleInfo({
      vehicleNo: "",
      driverMobileNo: "",
      driverName: "",
      drivingLicense: "",
      vehicleWeight: "",
      vehicleOwnerName: "",
      vehicleOwnerRC: "",
      ownerPanCard: "",
      verified: false,
      vehicleType: "",
      message: "",
      remarks: "",
      rcDocument: "",
      panDocument: "",
      licenseDocument: "",
      driverPhoto: "",
      vehicleId: "",
      insuranceNumber: "",
      chasisNumber: "",
      fitnessNumber: "",
      pucNumber: ""
    });
    
    setSelectedVehicle(null);
    
    setPackData({
      PALLETIZATION: [defaultPackRow("PALLETIZATION")],
      "UNIFORM - BAGS/BOXES": [defaultPackRow("UNIFORM - BAGS/BOXES")],
      "LOOSE - CARGO": [defaultPackRow("LOOSE - CARGO")],
    });
    
    setActivePack("PALLETIZATION");
    setDeductionRows([]);
    setTotalQuantity("");
    
    setVbpFiles({
      vbp1: [], vbp2: [], vbp3: [], vbp4: [],
      vbp5: [], vbp6: [], vbp7: [], videoVbp: [],
    });
    setVftFiles({
      vft1: [], vft2: [], vft3: [], vft4: [],
      vft5: [], vft6: [], vft7: [], videoVft: [],
    });
    setVotFiles({
      vot1: [], vot2: [], vot3: [], vot4: [],
      vot5: [], vot6: [], vot7: [], videoVot: [],
    });
    setVlFiles({
      vl1: [], vl2: [], vl3: [], vl4: [],
      vl5: [], vl6: [], vl7: [], videoVl: [],
    });
    setVehicleFiles({
      rc: [], pan: [], license: [], photo: []
    });
    setWeighmentFiles({
      weighSlip: []
    });
    
    setVbpUploads({ approval: "", remark: "" });
    setVftUploads({ approval: "" });
    setVotUploads({ approval: "" });
    setVlUploads({ approval: "", loadingStatus: "" });
    setLoadedWeighment({ 
      approval: "", 
      loadingCharges: "", 
      loadingStaffMunshiyana: "", 
      otherExpenses: "", 
      vehicleFloorTarpaulin: "", 
      vehicleOuterTarpaulin: "" 
    });
    
    setGpsTracking({
      driverMobileNumber: "",
      isTrackingActive: false,
    });
    
    setArrivalDetails({ date: new Date().toISOString().split('T')[0], time: "" });
  };

  /** =========================
   * Helper function to get status badge color
   ========================= */
  const getStatusBadge = (status) => {
    if (status === 'Approved') return 'bg-green-100 text-green-800';
    if (status === 'Rejected') return 'bg-red-100 text-red-800';
    if (status === 'Pending') return 'bg-yellow-100 text-yellow-800';
    if (status === 'Loaded') return 'bg-green-100 text-green-800';
    if (status === 'Partially Loaded') return 'bg-yellow-100 text-yellow-800';
    if (status === 'Not Loaded') return 'bg-red-100 text-red-800';
    return 'bg-slate-100 text-slate-800';
  };

  /** =========================
   * RENDER
   ========================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-full px-4 py-3 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/admin/Loading-Info')}
                className="text-emerald-600 hover:text-emerald-800 font-medium text-sm flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to List
              </button>
              <div className="text-lg font-extrabold text-slate-900">
                Create New Loading Info
              </div>
            </div>
            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
              <span>Vehicle Arrival No: {header.vehicleArrivalNo || vehicleNegotiationNo || "Will be auto-generated"}</span>
              {fetchingNegotiationData && (
                <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full text-xs flex items-center">
                  <svg className="animate-spin h-3 w-3 mr-1" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading negotiation data...
                </span>
              )}
              {uploading && (
                <span className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full text-xs flex items-center">
                  <svg className="animate-spin h-3 w-3 mr-1" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading files...
                </span>
              )}
              {apiError && (
                <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full text-xs">
                  ⚠️ {apiError}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving || uploading}
              className={`rounded-xl px-5 py-2 text-sm font-bold text-white transition ${
                saving || uploading
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-emerald-600 hover:bg-emerald-700'
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
              ) : 'Save Loading Info'}
            </button>
            <button
              onClick={resetForm}
              className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-full p-4">
        {/* Vehicle Arrival Information Card */}
        <Card title="Vehicle Arrival Information">
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Vehicle Arrival No</label>
              <input
                type="text"
                value={header.vehicleArrivalNo || ""}
                readOnly
                className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed"
                placeholder="Auto-generated on save"
              />
            </div>

            {/* Vehicle Negotiation Search Field */}
            <div className="col-span-12 md:col-span-3 relative" ref={vehicleNegotiationDropdownRef}>
              <label className="text-xs font-bold text-slate-600">Vehicle Negotiation No</label>
              <div className="relative">
                <input
                  type="text"
                  value={vehicleNegotiationNo}
                  onChange={(e) => handleVehicleNegotiationSearch(e.target.value)}
                  onFocus={handleVehicleNegotiationInputFocus}
                  onBlur={handleVehicleNegotiationInputBlur}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 pr-8"
                  placeholder="Search vehicle negotiation..."
                />
                {vehicleNegotiation.loading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="animate-spin h-4 w-4 text-emerald-500" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </div>
              
              {showVehicleNegotiationDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {vehicleNegotiation.loading ? (
                    <div className="p-3 text-center text-sm text-slate-500">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500 mx-auto"></div>
                      <p className="mt-1">Loading vehicle negotiations...</p>
                    </div>
                  ) : filteredVehicleNegotiations.length > 0 ? (
                    filteredVehicleNegotiations.map((nego) => (
                      <div
                        key={nego._id}
                        onMouseDown={() => handleSelectVehicleNegotiation(nego)}
                        className="p-3 hover:bg-emerald-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors"
                      >
                        <div className="font-medium text-slate-800">
                          {nego.vnnNo}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Vehicle: {nego.vehicleInfo?.vehicleNo || 'N/A'} • Vendor: {nego.approval?.vendorName || 'N/A'}
                        </div>
                        <div className="text-xs text-slate-400">
                          Customer: {nego.customerName || 'N/A'}
                        </div>
                        <div className="text-xs text-emerald-600">
                          ✓ Available
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-sm text-slate-500">
                      {vehicleNegotiationNo.trim() ? 
                        `No available vehicle negotiations found for "${vehicleNegotiationNo}"` : 
                        "No vehicle negotiations available"
                      }
                    </div>
                  )}
                </div>
              )}
              <div className="text-xs text-slate-400 mt-1">Select to auto-fill vehicle data</div>
            </div>

            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Branch *</label>
              <SearchableDropdown
                items={branches}
                selectedId={header.branch}
                onSelect={(branch) => setHeader({ 
                  ...header, 
                  branch: branch?._id || '',
                  branchName: branch?.name || '',
                  branchCode: branch?.code || ''
                })}
                placeholder="Search branch..."
                displayField="name"
                codeField="code"
              />
            </div>

            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Date</label>
              <input
                type="date"
                value={header.date}
                onChange={(e) => setHeader({ ...header, date: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <div className="col-span-12 md:col-span-2">
              <Select
                label="Delivery"
                value={header.delivery}
                onChange={(v) => setHeader({ ...header, delivery: v })}
                options={DELIVERY_OPTIONS}
              />
            </div>
          </div>
        </Card>

        {/* Billing Type / Charges Card */}
        <div className="mt-4">
          <Card title="Billing Type / Charges">
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
                            value={header[col.key] || ""}
                            onChange={(e) => {
                              if (col.key === "billingType") {
                                handleBillingTypeChange(e.target.value);
                              } else {
                                setHeader(prev => ({ ...prev, [col.key]: e.target.value }));
                              }
                            }}
                            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
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
                            value={header[col.key] || ""}
                            onChange={(e) => setHeader(prev => ({ ...prev, [col.key]: e.target.value }))}
                            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                            placeholder={`Enter ${col.label}`}
                          />
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Order Details Card */}
        <div className="mt-4">
          <Card 
            title="Order Details"
            right={
              <button
                onClick={addOrderRow}
                className="rounded-xl bg-yellow-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-yellow-700 transition"
              >
                + Add Order
              </button>
            }
          >
            <div className="overflow-auto rounded-xl border border-yellow-300">
              <table className="min-w-full w-full text-sm">
                <thead className="sticky top-0 bg-yellow-400 z-10">
                  <tr>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900">Order</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900">Party Name</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900">Plant</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900">Order Type</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900">Pin Code</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900">State</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900">District</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900">From</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900">To</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900">Weight</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orderRows.map((row) => (
                    <tr key={row._id} className="hover:bg-yellow-50 even:bg-slate-50">
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.orderNo || ""}
                          onChange={(e) => updateOrderRow(row._id, 'orderNo', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
                          placeholder="Order No"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.partyName || ""}
                          onChange={(e) => updateOrderRow(row._id, 'partyName', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
                          placeholder="Party Name"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <TableSearchableDropdown
                          items={plants}
                          selectedId={row.plantCode}
                          onSelect={(plant) => {
                            if (plant) {
                              updateOrderRow(row._id, 'plantCode', plant._id);
                              updateOrderRow(row._id, 'plantName', plant.name);
                              if (plant.address || plant.city) {
                                updateOrderRow(row._id, 'from', plant.address || plant.city || '');
                              }
                            }
                          }}
                          placeholder="Select Plant"
                          displayField="name"
                          codeField="code"
                          cellId={`plant-${row._id}`}
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <select
                          value={row.orderType || ""}
                          onChange={(e) => updateOrderRow(row._id, 'orderType', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm outline-none focus:border-emerald-500"
                        >
                          <option value="">Select</option>
                          {ORDER_TYPES.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.pinCode || ""}
                          onChange={(e) => updateOrderRow(row._id, 'pinCode', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
                          placeholder="Pin Code"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.state || ""}
                          onChange={(e) => updateOrderRow(row._id, 'state', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
                          placeholder="State"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.district || ""}
                          onChange={(e) => updateOrderRow(row._id, 'district', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
                          placeholder="District"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.from || ""}
                          onChange={(e) => updateOrderRow(row._id, 'from', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
                          placeholder="From"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.to || ""}
                          onChange={(e) => updateOrderRow(row._id, 'to', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
                          placeholder="To"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="number"
                          value={row.weight || ""}
                          onChange={(e) => updateOrderRow(row._id, 'weight', e.target.value)}
                          className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
                          placeholder="Weight"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <button
                          onClick={() => removeOrderRow(row._id)}
                          className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-yellow-100">
                  <tr>
                    <td colSpan="9" className="border border-yellow-300 px-3 py-2 text-right font-bold">
                      Total Quantity (MT):
                    </td>
                    <td className="border border-yellow-300 px-3 py-2 font-bold">
                      {calculateTotalWeight()}
                    </td>
                    <td className="border border-yellow-300 px-3 py-2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </div>

        {/* Vehicle & Driver Details Card */}
        <div className="mt-4">
          <Card title="Vehicle & Driver Details">
            <div className="overflow-auto rounded-xl border border-yellow-300">
              <table className="min-w-full w-full text-sm">
                <thead className="sticky top-0 bg-yellow-400">
                  <tr>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">
                      Vehicle Search
                    </th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">
                      Vehicle Information
                    </th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">
                      Driver Information
                    </th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">
                      Message & Remarks
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-yellow-50 even:bg-slate-50">
                    <td className="border border-yellow-300 px-4 py-3 align-top">
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-bold text-slate-600">Search Vehicle</label>
                          <VehicleSearchDropdown
                            onSelect={handleVehicleSelect}
                            placeholder="Type to search vehicle..."
                            selectedVehicleId={selectedVehicle?._id}
                          />
                          <div className="text-xs text-slate-400 mt-1">Search by vehicle number or owner name</div>
                        </div>
                        
                        <button
                          onClick={handleCreateVehicle}
                          className="w-full rounded-lg bg-green-600 px-3 py-2 text-xs font-bold text-white hover:bg-green-700 transition"
                        >
                          + Create New Vehicle
                        </button>
                        
                        {selectedVehicle && (
                          <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
                            <div className="text-xs font-medium text-green-800">Selected Vehicle:</div>
                            <div className="text-xs text-green-700 mt-1">{selectedVehicle.vehicleNumber}</div>
                            <div className="text-xs text-green-600">Owner: {selectedVehicle.ownerName}</div>
                          </div>
                        )}

                        <div>
                          <label className="text-xs font-bold text-slate-600">Insurance Number</label>
                          <input
                            type="text"
                            value={vehicleInfo.insuranceNumber}
                            onChange={(e) => setVehicleInfo({ ...vehicleInfo, insuranceNumber: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                            placeholder="Enter insurance number"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-600">Chasis Number</label>
                          <input
                            type="text"
                            value={vehicleInfo.chasisNumber}
                            onChange={(e) => setVehicleInfo({ ...vehicleInfo, chasisNumber: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                            placeholder="Enter chasis number"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-600">Fitness Number</label>
                          <input
                            type="text"
                            value={vehicleInfo.fitnessNumber}
                            onChange={(e) => setVehicleInfo({ ...vehicleInfo, fitnessNumber: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                            placeholder="Enter fitness number"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-600">PUC Number</label>
                          <input
                            type="text"
                            value={vehicleInfo.pucNumber}
                            onChange={(e) => setVehicleInfo({ ...vehicleInfo, pucNumber: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                            placeholder="Enter PUC number"
                          />
                        </div>
                      </div>
                    </td>

                    <td className="border border-yellow-300 px-4 py-3 align-top">
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-bold text-slate-600">Vehicle No *</label>
                          <input
                            type="text"
                            value={vehicleInfo.vehicleNo}
                            onChange={(e) => setVehicleInfo({ ...vehicleInfo, vehicleNo: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                            placeholder="Enter vehicle number"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-600">Vehicle Type</label>
                          <select
                            value={vehicleInfo.vehicleType}
                            onChange={(e) => setVehicleInfo({ ...vehicleInfo, vehicleType: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                          >
                            <option value="">Select Vehicle Type</option>
                            {VEHICLE_TYPE_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-600">Vehicle Weight (MT)</label>
                          <input
                            type="number"
                            value={vehicleInfo.vehicleWeight}
                            onChange={(e) => setVehicleInfo({ ...vehicleInfo, vehicleWeight: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                            placeholder="Enter weight"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-600">Vehicle Owner RC</label>
                          <input
                            type="text"
                            value={vehicleInfo.vehicleOwnerRC}
                            onChange={(e) => setVehicleInfo({ ...vehicleInfo, vehicleOwnerRC: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                            placeholder="Enter RC number"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-600">Vehicle Owner Name</label>
                          <input
                            type="text"
                            value={vehicleInfo.vehicleOwnerName}
                            onChange={(e) => setVehicleInfo({ ...vehicleInfo, vehicleOwnerName: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                            placeholder="Enter owner name"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-600">Owner Pan Card</label>
                          <input
                            type="text"
                            value={vehicleInfo.ownerPanCard}
                            onChange={(e) => setVehicleInfo({ ...vehicleInfo, ownerPanCard: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                            placeholder="Enter PAN number"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs font-bold text-slate-600">Owner RC Doc</label>
                            <button 
                              onClick={() => handleFileSelect('vehicle', 'rc')}
                              className="mt-1 w-full rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 border border-blue-200 hover:bg-blue-100"
                            >
                              {vehicleFiles.rc.length > 0 ? `✓ ${vehicleFiles.rc.length} file(s)` : '+ Select File'}
                            </button>
                            {vehicleFiles.rc.map((file, idx) => (
                              <FileUploadItem 
                                key={idx} 
                                file={file} 
                                index={idx}
                                onRemove={() => removeFile('vehicle', 'rc', idx)}
                                label="RC"
                              />
                            ))}
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-600">Owner Pan Doc</label>
                            <button 
                              onClick={() => handleFileSelect('vehicle', 'pan')}
                              className="mt-1 w-full rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 border border-blue-200 hover:bg-blue-100"
                            >
                              {vehicleFiles.pan.length > 0 ? `✓ ${vehicleFiles.pan.length} file(s)` : '+ Select File'}
                            </button>
                            {vehicleFiles.pan.map((file, idx) => (
                              <FileUploadItem 
                                key={idx} 
                                file={file} 
                                index={idx}
                                onRemove={() => removeFile('vehicle', 'pan', idx)}
                                label="PAN"
                              />
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center mt-2">
                          <input
                            type="checkbox"
                            id="verified"
                            checked={vehicleInfo.verified}
                            onChange={(e) => setVehicleInfo({ ...vehicleInfo, verified: e.target.checked })}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <label htmlFor="verified" className="ml-2 text-sm font-medium text-slate-700">
                            Verified
                          </label>
                        </div>
                      </div>
                    </td>

                    <td className="border border-yellow-300 px-4 py-3 align-top">
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-bold text-slate-600">Driver Name</label>
                          <input
                            type="text"
                            value={vehicleInfo.driverName}
                            onChange={(e) => setVehicleInfo({ ...vehicleInfo, driverName: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                            placeholder="Enter driver name"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-600">Driver Mobile No</label>
                          <input
                            type="text"
                            value={vehicleInfo.driverMobileNo}
                            onChange={(e) => setVehicleInfo({ ...vehicleInfo, driverMobileNo: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                            placeholder="Enter mobile number"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-600">Driving License No</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={vehicleInfo.drivingLicense}
                              onChange={(e) => setVehicleInfo({ ...vehicleInfo, drivingLicense: e.target.value })}
                              className="mt-1 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                              placeholder="License No"
                            />
                            <button 
                              onClick={() => handleFileSelect('vehicle', 'license')}
                              className="mt-1 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 border border-blue-200 hover:bg-blue-100 whitespace-nowrap"
                            >
                              {vehicleFiles.license.length > 0 ? `✓ ${vehicleFiles.license.length}` : 'Select'}
                            </button>
                          </div>
                          {vehicleFiles.license.map((file, idx) => (
                            <FileUploadItem 
                              key={idx} 
                              file={file} 
                              index={idx}
                              onRemove={() => removeFile('vehicle', 'license', idx)}
                              label="License"
                            />
                          ))}
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-600">Driver Photo</label>
                          <button 
                            onClick={() => handleFileSelect('vehicle', 'photo')}
                            className="mt-1 w-full rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 border border-blue-200 hover:bg-blue-100"
                          >
                            {vehicleFiles.photo.length > 0 ? `✓ ${vehicleFiles.photo.length} file(s)` : '+ Select Photo'}
                          </button>
                          {vehicleFiles.photo.map((file, idx) => (
                            <FileUploadItem 
                              key={idx} 
                              file={file} 
                              index={idx}
                              onRemove={() => removeFile('vehicle', 'photo', idx)}
                              label="Photo"
                            />
                          ))}
                        </div>
                      </div>
                    </td>

                    <td className="border border-yellow-300 px-4 py-3 align-top">
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-bold text-slate-600">Message (Hindi/English)</label>
                          <textarea
                            value={vehicleInfo.message}
                            onChange={(e) => setVehicleInfo({ ...vehicleInfo, message: e.target.value })}
                            rows={3}
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                            placeholder="Enter message"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-600">Remarks</label>
                          <textarea
                            value={vehicleInfo.remarks}
                            onChange={(e) => setVehicleInfo({ ...vehicleInfo, remarks: e.target.value })}
                            rows={4}
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                            placeholder="Enter remarks"
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Pack Type Card */}
        <div className="mt-4">
          <Card title="Pack Type">
            <div className="mb-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="text-sm font-bold text-slate-700">Select Pack Type:</div>
                <select
                  value={activePack}
                  onChange={(e) => setActivePack(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                >
                  {PACK_TYPES.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.label} ({packData[p.key]?.length || 0} rows)
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={addPackRow}
                className="rounded-xl bg-yellow-600 px-4 py-2 text-sm font-bold text-white hover:bg-yellow-700 transition"
              >
                + Add Row
              </button>
            </div>
            
            <PackTypeTable
              packType={activePack}
              rows={rows}
              onChange={updatePackRow}
              onRemove={removePackRow}
              onDuplicate={duplicatePackRow}
              onToggleUniform={toggleUniformMode}
            />
          </Card>
        </div>

        {/* VBP Panel Card */}
        <div className="mt-4">
          <Card title="VBP - PANEL (Vehicle Body Pictures)">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Vehicle - Body Pictures (VBP)</h3>
                  
                  <div className="grid grid-cols-8 gap-3">
                    {[1,2,3,4,5,6,7].map((num) => (
                      <div key={num} className="col-span-1">
                        <div className="text-xs font-bold text-slate-600 mb-1">VBP - {num}</div>
                        <button 
                          onClick={() => handleFileSelect('vbp', `vbp${num}`)}
                          className={`w-full rounded-lg px-2 py-3 text-xs font-bold border hover:bg-opacity-80 ${
                            vbpFiles[`vbp${num}`].length > 0 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {vbpFiles[`vbp${num}`].length > 0 ? `✓ ${vbpFiles[`vbp${num}`].length} file(s)` : 'Select'}
                        </button>
                        {vbpFiles[`vbp${num}`].map((file, idx) => (
                          <FileUploadItem 
                            key={idx} 
                            file={file} 
                            index={idx}
                            onRemove={() => removeFile('vbp', `vbp${num}`, idx)}
                            label={`VBP-${num}`}
                          />
                        ))}
                      </div>
                    ))}
                    <div className="col-span-1">
                      <div className="text-xs font-bold text-slate-600 mb-1">Video - VBP</div>
                      <button 
                        onClick={() => handleFileSelect('vbp', 'videoVbp', true)}
                        className={`w-full rounded-lg px-2 py-3 text-xs font-bold border hover:bg-opacity-80 ${
                          vbpFiles.videoVbp.length > 0 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}
                      >
                        {vbpFiles.videoVbp.length > 0 ? `✓ ${vbpFiles.videoVbp.length} file(s)` : 'Select'}
                      </button>
                      {vbpFiles.videoVbp.map((file, idx) => (
                        <FileUploadItem 
                          key={idx} 
                          file={file} 
                          index={idx}
                          onRemove={() => removeFile('vbp', 'videoVbp', idx)}
                          label="Video"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-600">Approval:</span>
                      <span className={`text-sm px-3 py-1 rounded-full ${getStatusBadge(vbpUploads.approval)}`}>
                        {vbpUploads.approval || 'Not Set'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      <span className="font-bold">Note:</span> Vehicle Negotiation Entry will be cancelled if the Vehicle is rejected because of Vehicle Body.
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="text-xs font-bold text-slate-600">Remark</label>
                    <div className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                      {vbpUploads.remark || 'No remarks'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* VFT Panel Card */}
        <div className="mt-4">
          <Card title="VFT - PANEL (Vehicle Floor Tarpaulin Pictures)">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="grid grid-cols-8 gap-3">
                {[1,2,3,4,5,6,7].map((num) => (
                  <div key={num} className="col-span-1">
                    <div className="text-xs font-bold text-slate-600 mb-1">VFT - {num}</div>
                    <button 
                      onClick={() => handleFileSelect('vft', `vft${num}`)}
                      className={`w-full rounded-lg px-2 py-3 text-xs font-bold border hover:bg-opacity-80 ${
                        vftFiles[`vft${num}`].length > 0 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {vftFiles[`vft${num}`].length > 0 ? `✓ ${vftFiles[`vft${num}`].length} file(s)` : 'Select'}
                    </button>
                    {vftFiles[`vft${num}`].map((file, idx) => (
                      <FileUploadItem 
                        key={idx} 
                        file={file} 
                        index={idx}
                        onRemove={() => removeFile('vft', `vft${num}`, idx)}
                        label={`VFT-${num}`}
                      />
                    ))}
                  </div>
                ))}
                <div className="col-span-1">
                  <div className="text-xs font-bold text-slate-600 mb-1">Video - VFT</div>
                  <button 
                    onClick={() => handleFileSelect('vft', 'videoVft', true)}
                    className={`w-full rounded-lg px-2 py-3 text-xs font-bold border hover:bg-opacity-80 ${
                      vftFiles.videoVft.length > 0 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-purple-50 text-purple-700 border-purple-200'
                    }`}
                  >
                    {vftFiles.videoVft.length > 0 ? `✓ ${vftFiles.videoVft.length} file(s)` : 'Select'}
                  </button>
                  {vftFiles.videoVft.map((file, idx) => (
                    <FileUploadItem 
                      key={idx} 
                      file={file} 
                      index={idx}
                      onRemove={() => removeFile('vft', 'videoVft', idx)}
                      label="Video"
                    />
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <span className="text-xs font-bold text-slate-600">Vehicle - Floor Tarpaulin Approval:</span>
                <span className={`text-sm px-3 py-1 rounded-full ${getStatusBadge(vftUploads.approval)}`}>
                  {vftUploads.approval || 'Not Set'}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* VOT Panel Card */}
        <div className="mt-4">
          <Card title="VOT - PANEL (Vehicle Outer Tarpaulin Pictures)">
            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
              <div className="grid grid-cols-8 gap-3">
                {[1,2,3,4,5,6,7].map((num) => (
                  <div key={num} className="col-span-1">
                    <div className="text-xs font-bold text-slate-600 mb-1">VOT - {num}</div>
                    <button 
                      onClick={() => handleFileSelect('vot', `vot${num}`)}
                      className={`w-full rounded-lg px-2 py-3 text-xs font-bold border hover:bg-opacity-80 ${
                        votFiles[`vot${num}`].length > 0 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {votFiles[`vot${num}`].length > 0 ? `✓ ${votFiles[`vot${num}`].length} file(s)` : 'Select'}
                    </button>
                    {votFiles[`vot${num}`].map((file, idx) => (
                      <FileUploadItem 
                        key={idx} 
                        file={file} 
                        index={idx}
                        onRemove={() => removeFile('vot', `vot${num}`, idx)}
                        label={`VOT-${num}`}
                      />
                    ))}
                  </div>
                ))}
                <div className="col-span-1">
                  <div className="text-xs font-bold text-slate-600 mb-1">Video - VOT</div>
                  <button 
                    onClick={() => handleFileSelect('vot', 'videoVot', true)}
                    className={`w-full rounded-lg px-2 py-3 text-xs font-bold border hover:bg-opacity-80 ${
                      votFiles.videoVot.length > 0 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-purple-50 text-purple-700 border-purple-200'
                    }`}
                  >
                    {votFiles.videoVot.length > 0 ? `✓ ${votFiles.videoVot.length} file(s)` : 'Select'}
                  </button>
                  {votFiles.videoVot.map((file, idx) => (
                    <FileUploadItem 
                      key={idx} 
                      file={file} 
                      index={idx}
                      onRemove={() => removeFile('vot', 'videoVot', idx)}
                      label="Video"
                    />
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <span className="text-xs font-bold text-slate-600">Vehicle - Outer Tarpaulin Approval:</span>
                <span className={`text-sm px-3 py-1 rounded-full ${getStatusBadge(votUploads.approval)}`}>
                  {votUploads.approval || 'Not Set'}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* VL Panel Card */}
        <div className="mt-4">
          <Card title="VL - PANEL (Vehicle Loading Pictures)">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="grid grid-cols-8 gap-3">
                {[1,2,3,4,5,6,7].map((num) => (
                  <div key={num} className="col-span-1">
                    <div className="text-xs font-bold text-slate-600 mb-1">VL - {num}</div>
                    <button 
                      onClick={() => handleFileSelect('vl', `vl${num}`)}
                      className={`w-full rounded-lg px-2 py-3 text-xs font-bold border hover:bg-opacity-80 ${
                        vlFiles[`vl${num}`] && vlFiles[`vl${num}`].length > 0
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {vlFiles[`vl${num}`] && vlFiles[`vl${num}`].length > 0 
                        ? `✓ ${vlFiles[`vl${num}`].length} file(s)` 
                        : 'Select'}
                    </button>
                    {vlFiles[`vl${num}`] && vlFiles[`vl${num}`].map((file, idx) => (
                      <FileUploadItem 
                        key={idx} 
                        file={file} 
                        index={idx}
                        onRemove={() => removeFile('vl', `vl${num}`, idx)}
                        label={`VL-${num}`}
                      />
                    ))}
                  </div>
                ))}
                <div className="col-span-1">
                  <div className="text-xs font-bold text-slate-600 mb-1">Video - VL</div>
                  <button 
                    onClick={() => handleFileSelect('vl', 'videoVl', true)}
                    className={`w-full rounded-lg px-2 py-3 text-xs font-bold border hover:bg-opacity-80 ${
                      vlFiles.videoVl && vlFiles.videoVl.length > 0
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-purple-50 text-purple-700 border-purple-200'
                    }`}
                  >
                    {vlFiles.videoVl && vlFiles.videoVl.length > 0 
                      ? `✓ ${vlFiles.videoVl.length} file(s)` 
                      : 'Select'}
                  </button>
                  {vlFiles.videoVl && vlFiles.videoVl.map((file, idx) => (
                    <FileUploadItem 
                      key={idx} 
                      file={file} 
                      index={idx}
                      onRemove={() => removeFile('vl', 'videoVl', idx)}
                      label="Video"
                    />
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <span className="text-xs font-bold text-slate-600">Vehicle - Loading Approval:</span>
                <span className={`text-sm px-3 py-1 rounded-full ${getStatusBadge(vlUploads.approval)}`}>
                  {vlUploads.approval || 'Not Set'}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-xs font-bold text-slate-600">Loading Status:</span>
                <span className={`text-sm px-3 py-1 rounded-full ${getStatusBadge(vlUploads.loadingStatus)}`}>
                  {vlUploads.loadingStatus || 'Not Set'}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Loaded Vehicle Weighment & Charges Card */}
        <div className="mt-4">
          <Card title="Loaded Vehicle Weighment & Charges">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Weighment & Approval</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600">Loaded Vehicle - Weigh Slip:</span>
                      <button 
                        onClick={() => handleFileSelect('weighment', 'weighSlip')}
                        className={`rounded-lg px-4 py-2 text-xs font-bold border hover:bg-opacity-80 ${
                          weighmentFiles.weighSlip.length > 0 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {weighmentFiles.weighSlip.length > 0 ? `✓ ${weighmentFiles.weighSlip.length} file(s)` : 'Select'}
                      </button>
                    </div>
                    {weighmentFiles.weighSlip.map((file, idx) => (
                      <FileUploadItem 
                        key={idx} 
                        file={file} 
                        index={idx}
                        onRemove={() => removeFile('weighment', 'weighSlip', idx)}
                        label="Weigh Slip"
                      />
                    ))}
                    
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-600">Approval:</span>
                      <span className={`text-sm px-3 py-1 rounded-full ${getStatusBadge(loadedWeighment.approval)}`}>
                        {loadedWeighment.approval || 'Not Set'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-white rounded-lg border border-yellow-100">
                    <p className="text-xs text-slate-600">
                      <span className="font-bold text-red-600">⚠️ Note:</span> Documents - LR & Ewaybill is required for Vehicle to do the Loaded Vehicle Weighment and this could be a loophole - Try to Fix this.
                    </p>
                    <p className="text-xs text-slate-600 mt-2">
                      <span className="font-bold text-amber-600">⚠️ Note:</span> Unless the Tracking of Driver of loaded Vehicle is activated the LR Option should not be available.
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-span-12 md:col-span-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Loading Charges & Expenses</h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-700">Loading Charges:</span>
                      <input
                        type="number"
                        value={loadedWeighment.loadingCharges}
                        onChange={(e) => setLoadedWeighment({ ...loadedWeighment, loadingCharges: e.target.value })}
                        className="w-32 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-right focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                        placeholder="0"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-700">Loading Staff Munshiyana:</span>
                      <input
                        type="number"
                        value={loadedWeighment.loadingStaffMunshiyana}
                        onChange={(e) => setLoadedWeighment({ ...loadedWeighment, loadingStaffMunshiyana: e.target.value })}
                        className="w-32 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-right focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                        placeholder="0"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-700">Other Expenses:</span>
                      <input
                        type="number"
                        value={loadedWeighment.otherExpenses}
                        onChange={(e) => setLoadedWeighment({ ...loadedWeighment, otherExpenses: e.target.value })}
                        className="w-32 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-right focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                        placeholder="0"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-700">Vehicle - Floor Tarpaulin:</span>
                      <input
                        type="number"
                        value={loadedWeighment.vehicleFloorTarpaulin}
                        onChange={(e) => setLoadedWeighment({ ...loadedWeighment, vehicleFloorTarpaulin: e.target.value })}
                        className="w-32 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-right focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                        placeholder="0"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-700">Vehicle - Outer Tarpaulin:</span>
                      <input
                        type="number"
                        value={loadedWeighment.vehicleOuterTarpaulin}
                        onChange={(e) => setLoadedWeighment({ ...loadedWeighment, vehicleOuterTarpaulin: e.target.value })}
                        className="w-32 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-right focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                        placeholder="0"
                      />
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 mt-2">
                      <span className="text-sm font-bold text-slate-800">Total:</span>
                      <span className="font-bold text-emerald-700">
                        ₹{calculateTotalCharges().toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Vehicle GPS Tracking Card */}
        <div className="mt-4">
          <Card title="Vehicle GPS Tracking">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Live Vehicle Tracking</h3>
                    <p className="text-xs text-slate-600">Track vehicle location in real-time via API integration</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Driver Mobile Number"
                    value={gpsTracking.driverMobileNumber}
                    onChange={(e) => setGpsTracking({ ...gpsTracking, driverMobileNumber: e.target.value })}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                  <button 
                    onClick={handleActivateTracking}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
                  >
                    {gpsTracking.isTrackingActive ? 'Tracking Active' : 'Activate Tracking'}
                  </button>
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-500">
                <span className="font-bold">API Status:</span> {gpsTracking.isTrackingActive ? 'Active' : 'Ready'}
                {gpsTracking.isTrackingActive && (
                  <span className="ml-3 text-green-600">
                    ✓ Tracking active for: {gpsTracking.driverMobileNumber}
                  </span>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Documents & Consignment Note Card */}
        <div className="mt-4">
          <Card title="Documents & Consignment Note (LR)">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-800 mb-2">Consignment Note (LR)</h3>
                  <button className="w-full rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700">
                    Generate LR
                  </button>
                </div>
              </div>
              <div className="col-span-12 md:col-span-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-800 mb-2">E-waybill</h3>
                  <button className="w-full rounded-lg bg-green-600 px-4 py-2 text-xs font-bold text-white hover:bg-green-700">
                    Generate E-waybill
                  </button>
                </div>
              </div>
              <div className="col-span-12 md:col-span-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-800 mb-2">Invoice</h3>
                  <button className="w-full rounded-lg bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700">
                    View Invoice
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Arrival Details Card */}
        <div className="mt-4">
          <Card title="Arrival Details">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-3">
                <div className="bg-slate-50 p-3 rounded-lg">
                  <label className="text-xs font-bold text-slate-600">Arrival Date</label>
                  <input
                    type="date"
                    value={arrivalDetails.date}
                    onChange={(e) => setArrivalDetails({ ...arrivalDetails, date: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div className="col-span-12 md:col-span-3">
                <div className="bg-slate-50 p-3 rounded-lg">
                  <label className="text-xs font-bold text-slate-600">Arrival Time</label>
                  <input
                    type="time"
                    value={arrivalDetails.time}
                    onChange={(e) => setArrivalDetails({ ...arrivalDetails, time: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                    placeholder="HH:MM"
                  />
                </div>
              </div>
              <div className="col-span-12 md:col-span-6">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-800">
                    <span className="font-bold">Note:</span> JV need for making the payment in Driver or Motor Owner Account.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}