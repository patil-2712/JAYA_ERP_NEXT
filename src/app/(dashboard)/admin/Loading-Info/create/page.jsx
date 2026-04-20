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
  { key: "NON-UNIFORM - GENERAL CARGO", label: "Non-uniform - General Cargo" },
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

  useEffect(() => {
    searchVehicles();
  }, []);

  return { vehicles, loading, error, searchVehicles, getVehicleById };
}

/* =======================
  Owner Search Hook
========================= */
function useOwnerSearch() {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchOwners = async (vehicleNumber = "") => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const url = vehicleNumber ? `/api/owners?search=${encodeURIComponent(vehicleNumber)}` : '/api/owners';
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (data.success && Array.isArray(data.data)) {
        setOwners(data.data);
      } else {
        setOwners([]);
        setError(data.message || 'No owners found');
      }
    } catch (err) {
      console.error('Error fetching owners:', err);
      setOwners([]);
      setError('Failed to fetch owners');
    } finally {
      setLoading(false);
    }
  };

  return { owners, loading, error, searchOwners };
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
      
      const vnRes = await fetch('/api/vehicle-negotiation', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!vnRes.ok) {
        throw new Error(`HTTP error! status: ${vnRes.status}`);
      }
      
      const vnData = await vnRes.json();
      
      const loadingRes = await fetch('/api/loading-panel?format=table', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const loadingData = await loadingRes.json();
      
      const usedVnns = new Set();
      if (loadingData.success && Array.isArray(loadingData.data)) {
        loadingData.data.forEach(item => {
          if (item.vehicleNegotiationNo && item.vehicleNegotiationNo !== '-' && item.vehicleNegotiationNo !== 'N/A') {
            usedVnns.add(item.vehicleNegotiationNo);
          }
        });
      }
      
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

  useEffect(() => {
    fetchNegotiations();
  }, []);

  return { negotiations, loading, error, fetchNegotiations, getNegotiationById };
}

/* =======================
  Loading Info Hook
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
    taluka: "",
    talukaName: "",
    district: "",
    districtName: "",
    state: "",
    stateName: "",
    from: "",
    fromName: "",
    to: "",
    toName: "",
    weight: "",
    collectionCharges: "",
    cancellationCharges: "",
    loadingCharges: "",
    otherCharges: "",
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

  if (packType === "LOOSE - CARGO") {
    return {
      _id: uid(),
      uom: "",
      productName: "",
      actualWt: "",
      chargedWt: "",
    };
  }

  // NON-UNIFORM - GENERAL CARGO
  return {
    _id: uid(),
    nos: "",
    productName: "",
    uom: "",
    length: "",
    width: "",
    height: "",
    actualWt: "",
    chargedWt: "",
  };
}

/* =======================
  UI Components
========================= */

function FileUploadItem({ file, onRemove, index, label, isCameraPhoto = false, photoTime = null, isExisting = false }) {
  const [imagePreview, setImagePreview] = useState(null);
  
  useEffect(() => {
    if (file && file.type && file.type.startsWith('image/') && !isExisting) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, [file, isExisting]);

  return (
    <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 mt-1">
      {imagePreview && !isExisting && (
        <img src={imagePreview} alt="Preview" className="w-10 h-10 rounded object-cover" />
      )}
      {isExisting && (
        <div className="w-10 h-10 bg-green-100 rounded flex items-center justify-center">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-700 truncate">
          {isExisting ? (file.name || 'Existing Document') : file.name}
        </p>
        <p className="text-xs text-slate-500">
          {isExisting ? 'Already uploaded' : `${(file.size / 1024).toFixed(1)} KB`}
        </p>
        {photoTime && (
          <p className="text-xs text-green-600">Captured: {photoTime}</p>
        )}
      </div>
      <button
        onClick={() => onRemove(index, isExisting)}
        className="text-red-500 hover:text-red-700 p-1"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

function VehicleSearchDropdown({ onSelect, placeholder = "Search vehicle...", selectedVehicleId }) {
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

function SearchableDropdown({ items, selectedId, onSelect, placeholder = "Search...", displayField = 'name', codeField = 'code', disabled = false }) {
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

function TableSearchableDropdown({ items, selectedId, onSelect, placeholder = "Search...", displayField = 'name', codeField = 'code', disabled = false, cellId = "" }) {
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
  const getColumns = (type) => {
    if (type === "PALLETIZATION") {
      return [
        { key: "noOfPallets", label: "NO OF PALLETS", type: "number" },
        { key: "unitPerPallets", label: "UNIT PER PALLETS", type: "number" },
        { key: "totalPkgs", label: "TOTAL PKGS", type: "number", readOnly: true },
        { key: "pkgsType", label: "PKGS TYPE", type: "text", options: PKGS_TYPE_OPTIONS },
        { key: "uom", label: "UOM", type: "text", options: UOM_OPTIONS },
        { key: "skuSize", label: "SKU - SIZE", type: "text", options: SKU_SIZE_OPTIONS },
        { key: "packWeight", label: "PACK - WEIGHT", type: "number" },
        { key: "productName", label: "PRODUCT NAME", type: "text", options: PRODUCT_NAME_OPTIONS },
        { key: "wtLtr", label: "WT (LTR)", type: "number", readOnly: true },
        { key: "actualWt", label: "ACTUAL - WT", type: "number", readOnly: true },
        { key: "chargedWt", label: "CHARGED - WT", type: "number" },
        { key: "wtUom", label: "WT UOM", type: "text", readOnly: true },
      ];
    }

    if (type === "UNIFORM - BAGS/BOXES") {
      return [
        { key: "totalPkgs", label: "TOTAL PKGS", type: "number" },
        { key: "pkgsType", label: "PKGS TYPE", type: "text", options: PKGS_TYPE_OPTIONS },
        { key: "uom", label: "UOM", type: "text", options: UOM_OPTIONS },
        { key: "skuSize", label: "SKU - SIZE", type: "text", options: SKU_SIZE_OPTIONS },
        { key: "packWeight", label: "PACK - WEIGHT", type: "number" },
        { key: "productName", label: "PRODUCT NAME", type: "text", options: PRODUCT_NAME_OPTIONS },
        { key: "wtLtr", label: "WT (LTR)", type: "number", readOnly: true },
        { key: "actualWt", label: "ACTUAL - WT", type: "number", readOnly: true },
        { key: "chargedWt", label: "CHARGED - WT", type: "number" },
        { key: "wtUom", label: "WT UOM", type: "text", readOnly: true },
      ];
    }

    if (type === "LOOSE - CARGO") {
      return [
        { key: "uom", label: "UOM", type: "text", options: UOM_OPTIONS },
        { key: "productName", label: "PRODUCT NAME", type: "text", options: PRODUCT_NAME_OPTIONS },
        { key: "actualWt", label: "ACTUAL - WT", type: "number" },
        { key: "chargedWt", label: "CHARGED - WT", type: "number" },
      ];
    }

    // NON-UNIFORM - GENERAL CARGO
    return [
      { key: "nos", label: "NOS", type: "number" },
      { key: "productName", label: "PRODUCT NAME", type: "text", options: PRODUCT_NAME_OPTIONS },
      { key: "uom", label: "UOM", type: "text", options: UOM_OPTIONS },
      { key: "length", label: "LENGTH", type: "number" },
      { key: "width", label: "WIDTH", type: "number" },
      { key: "height", label: "HEIGHT", type: "number" },
      { key: "actualWt", label: "ACTUAL - WT", type: "number" },
      { key: "chargedWt", label: "CHARGED - WT", type: "number" },
    ];
  };

  const cols = useMemo(() => getColumns(packType), [packType]);

  if (!rows || rows.length === 0) {
    return (
      <div className="overflow-auto rounded-xl border border-yellow-300">
        <div className="p-8 text-center text-slate-400">
          No rows yet. Click <b>Add Row</b> to add data.
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-auto rounded-xl border border-yellow-300">
      <table className="min-w-full w-full text-sm">
        <thead className="sticky top-0 bg-yellow-400">
          <tr>
            {cols.map((c) => (
              <th
                key={c.key}
                className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center"
              >
                {c.label}
                {c.readOnly && <span className="ml-1 text-xs text-blue-600">*Auto</span>}
              </th>
            ))}
            <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r._id} className="hover:bg-yellow-50 even:bg-slate-50">
              {cols.map((c) => (
                <td key={c.key} className="border border-yellow-300 px-2 py-2">
                  {c.options ? (
                    <select
                      value={r[c.key] || ""}
                      onChange={(e) => onChange(r._id, c.key, e.target.value)}
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
                      onChange={(e) => onChange(r._id, c.key, e.target.value)}
                      className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                        c.readOnly ? 'bg-slate-50' : 'bg-white'
                      }`}
                      placeholder={`Enter ${c.label}`}
                      step={c.type === "number" ? "0.001" : undefined}
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
          ))}
        </tbody>
        <tfoot className="bg-yellow-100">
          <tr>
            <td colSpan={cols.length} className="border border-yellow-300 px-3 py-2 text-right font-bold">
              Total Actual Weight:
            </td>
            <td className="border border-yellow-300 px-3 py-2 font-bold">
              {rows.reduce((sum, r) => sum + num(r.actualWt), 0).toFixed(2)}
            </td>
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
  const [isReadOnly, setIsReadOnly] = useState(false);

  /** =========================
   * SEARCH HOOKS
   ========================= */
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const vehicleSearch = useVehicleSearch();
  const vehicleNegotiation = useVehicleNegotiation();
  const loadingInfo = useLoadingInfo();
  const ownerSearch = useOwnerSearch();

  const [vehiclePhotoFiles, setVehiclePhotoFiles] = useState([]);
  const [detentionDays, setDetentionDays] = useState("");
  const [detentionNumber, setDetentionNumber] = useState("");
  
  /** =========================
   * STATE FOR SLIP FILES
   ========================= */
  const [vehicleSlipFiles, setVehicleSlipFiles] = useState([]);
  const [loadedVehicleSlipFiles, setLoadedVehicleSlipFiles] = useState([]);
  
  /** =========================
   * VL PHOTO DETAILS STATE (Height, Width, Nose)
   ========================= */
  const [vlPhotoDetails, setVlPhotoDetails] = useState({});

  /** =========================
   * VL FIELDS STATE - Initially 5 fields
   ========================= */
  const [vlFields, setVlFields] = useState([1, 2, 3, 4, 5]);

  /** =========================
   * EXISTING FILES STATE
   ========================= */
  const [existingFiles, setExistingFiles] = useState({
    vehicle: {
      rc: [],
      pan: [],
      license: [],
      photo: []
    },
    vbp: {},
    vft: {},
    vot: {},
    vl: {},
    weighment: {
      weighSlip: []
    }
  });

  const handleVehicleSlipSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf';
    input.multiple = true;
    
    input.onchange = async (e) => {
      const files = Array.from(e.target.files);
      setVehicleSlipFiles(prev => [...prev, ...files]);
    };
    
    input.click();
  };

  const removeVehicleSlip = (index) => {
    setVehicleSlipFiles(prev => prev.filter((_, i) => i !== index));
  };

  /** =========================
   * VEHICLE NEGOTIATION SEARCH STATE
   ========================= */
  const [vehicleNegotiationNo, setVehicleNegotiationNo] = useState("");
  const [showVehicleNegotiationDropdown, setShowVehicleNegotiationDropdown] = useState(false);
  const [filteredVehicleNegotiations, setFilteredVehicleNegotiations] = useState([]);
  const [selectedVehicleNegotiation, setSelectedVehicleNegotiation] = useState(null);
  const vehicleNegotiationDropdownRef = useRef(null);

  const [hasHelper, setHasHelper] = useState(false);
  const [helperInfo, setHelperInfo] = useState({
    name: "",
    mobileNo: "",
    photo: [],
    aadharPhoto: []
  });

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

  const handleVehiclePhotoSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    
    input.onchange = async (e) => {
      const files = Array.from(e.target.files);
      const newTotalPhotos = vehiclePhotoFiles.length + files.length;
      if (newTotalPhotos > 10) {
        alert("Maximum 10 vehicle photos allowed!");
        return;
      }
      setVehiclePhotoFiles(prev => [...prev, ...files]);
    };
    
    input.click();
  };

  const removeVehiclePhoto = (index) => {
    setVehiclePhotoFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleLoadedVehicleSlipSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf';
    input.multiple = true;
    
    input.onchange = async (e) => {
      const files = Array.from(e.target.files);
      setLoadedVehicleSlipFiles(prev => [...prev, ...files]);
    };
    
    input.click();
  };

  const removeLoadedVehicleSlip = (index) => {
    setLoadedVehicleSlipFiles(prev => prev.filter((_, i) => i !== index));
  };

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
    "NON-UNIFORM - GENERAL CARGO": [defaultPackRow("NON-UNIFORM - GENERAL CARGO")],
  });

  /** =========================
   * DEDUCTIONS STATE
   ========================= */
  const [deductionRows, setDeductionRows] = useState([]);
  const [totalQuantity, setTotalQuantity] = useState("");

  /** =========================
   * UPLOAD SECTIONS STATE
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
    rc: [], pan: [], license: [], photo: [], aadhar: []
  });

  const [weighmentFiles, setWeighmentFiles] = useState({
    weighSlip: []
  });

  /** =========================
   * UPLOAD SECTIONS STATE (For approvals and remarks)
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
    loadingStatus: "Not Loaded",
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
    outDate: "",
    outTime: "",
  });
  
  /** =========================
   * CAMERA PHOTO CAPTURE STATE
   ========================= */
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);

  /** =========================
   * FETCH DATA FROM APIs
   ========================= */
  useEffect(() => {
    fetchBranches();
    fetchPlants();
    fetchOrders();
    vehicleSearch.searchVehicles();
  }, []);

  // Owner Search Dropdown Component
  function OwnerSearchDropdown({ onSelect, placeholder = "Search owner..." }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [filteredOwners, setFilteredOwners] = useState([]);
    const [owners, setOwners] = useState([]);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    const fetchOwners = async (query = "") => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const url = query ? `/api/owners?search=${encodeURIComponent(query)}` : '/api/owners';
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setOwners(data.data);
          setFilteredOwners(data.data);
        }
      } catch (err) {
        console.error("Error fetching owners:", err);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchOwners();
    }, []);

    const handleSearch = (query) => {
      setSearchQuery(query);
      if (!query.trim()) {
        setFilteredOwners(owners);
      } else {
        const filtered = owners.filter(owner =>
          owner.ownerName?.toLowerCase().includes(query.toLowerCase()) ||
          owner.vehicleNumber?.toLowerCase().includes(query.toLowerCase()) ||
          owner.rcNumber?.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredOwners(filtered);
      }
      if (!showDropdown) setShowDropdown(true);
    };

    const handleSelectOwner = (owner) => {
      setSearchQuery(owner.ownerName);
      setShowDropdown(false);
      onSelect(owner);
    };

    return (
      <div className="relative w-full" ref={dropdownRef}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
          placeholder={placeholder}
          autoComplete="off"
        />
        {showDropdown && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-3 text-center text-sm text-slate-500">Loading owners...</div>
            ) : filteredOwners.length > 0 ? (
              filteredOwners.map((owner) => (
                <div
                  key={owner._id}
                  onMouseDown={() => handleSelectOwner(owner)}
                  className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100"
                >
                  <div className="font-medium text-slate-800">{owner.ownerName}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    Vehicle: {owner.vehicleNumber} | RC: {owner.rcNumber || 'N/A'}
                  </div>
                  <div className="text-xs text-slate-400">
                    Mobile: {owner.mobileNumber1 || owner.mobileNumber2 || 'N/A'}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-sm text-slate-500">No owners found</div>
            )}
          </div>
        )}
      </div>
    );
  }

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
   * CAMERA FUNCTIONS
   ========================= */
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setShowCamera(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        const now = new Date();
        const filename = `driver_photo_${now.getTime()}.jpg`;
        const file = new File([blob], filename, { type: 'image/jpeg' });
        
        setVehicleFiles(prev => ({
          ...prev,
          photo: [...prev.photo, file]
        }));
        
        setArrivalDetails(prev => ({
          ...prev,
          date: now.toISOString().split('T')[0],
          time: now.toLocaleTimeString(),
        }));
        
        alert(`✅ Driver photo captured successfully!\n📅 Date: ${now.toLocaleDateString()}\n⏰ Time: ${now.toLocaleTimeString()}`);
        
        stopCamera();
      }, 'image/jpeg', 0.9);
    }
  };

  /** =========================
   * GENERATE LR FUNCTION
   ========================= */
  const handleGenerateLR = () => {
    const now = new Date();
    const outTime = now.toLocaleTimeString();
    const outDate = now.toISOString().split('T')[0];
    
    setArrivalDetails(prev => ({
      ...prev,
      outDate: outDate,
      outTime: outTime,
    }));
    
    alert(`✅ Consignment Note (LR) Generated!\n📅 Out Date: ${outDate}\n⏰ Out Time: ${outTime}`);
  };

  /** =========================
   * VEHICLE SELECT HANDLER
   ========================= */
  const handleVehicleSelect = async (vehicle) => {
    setSelectedVehicle(vehicle);
    
    setVehicleInfo(prev => ({
      ...prev,
      vehicleNo: vehicle.vehicleNumber || "",
      vehicleOwnerName: "",
      vehicleOwnerRC: "",
      ownerPanCard: "",
      vehicleType: vehicle.vehicleType || "",
      vehicleWeight: vehicle.vehicleWeight?.toString() || "",
      vehicleId: vehicle._id || "",
      insuranceNumber: vehicle.insuranceNumber || "",
      chasisNumber: vehicle.chasisNumber || "",
      fitnessNumber: vehicle.fitnessNumber || "",
      pucNumber: vehicle.pucNumber || "",
    }));

    if (vehicle.vehicleNumber) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/owners?search=${encodeURIComponent(vehicle.vehicleNumber)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const owner = data.data[0];
          
          setVehicleInfo(prev => ({
            ...prev,
            vehicleOwnerName: owner.ownerName || "",
            vehicleOwnerRC: owner.rcNumber || "",
            ownerPanCard: owner.ownerPanCard || "",
            message: `Vehicle Owner: ${owner.ownerName}\nContact: ${owner.mobileNumber1 || owner.mobileNumber2}\nRC Number: ${owner.rcNumber || ''}`,
            remarks: `Pan Card: ${owner.ownerPanCard || 'N/A'}\nAdhar Card: ${owner.adharCardNumber || 'N/A'}`
          }));
          
          setExistingFiles(prev => ({
            ...prev,
            vehicle: {
              ...prev.vehicle,
              rc: owner.rcDocuments?.map(doc => ({ name: 'RC Document', path: doc })) || [],
              pan: owner.panCardDocuments?.map(doc => ({ name: 'PAN Document', path: doc })) || [],
            }
          }));
          
          alert(`✅ Vehicle ${vehicle.vehicleNumber} loaded successfully!\nOwner: ${owner.ownerName}`);
        } else {
          alert(`✅ Vehicle ${vehicle.vehicleNumber} loaded successfully!`);
        }
      } catch (err) {
        console.error("Error fetching owner:", err);
        alert(`✅ Vehicle ${vehicle.vehicleNumber} loaded successfully!`);
      }
    } else {
      alert(`✅ Vehicle loaded successfully!`);
    }
  };

  const handleCreateVehicle = () => {
    router.push('/admin/vehicle2');
  };

  /** =========================
   * VL FIELD FUNCTIONS
   ========================= */
  const handleAddMoreVlField = () => {
    if (vlFields.length < 15) {
      const nextNumber = vlFields.length + 1;
      setVlFields([...vlFields, nextNumber]);
      
      if (!vlFiles[`vl${nextNumber}`]) {
        setVlFiles(prev => ({
          ...prev,
          [`vl${nextNumber}`]: []
        }));
      }
    } else {
      alert("Maximum 15 VL fields allowed!");
    }
  };

  const handleRemoveVlField = (fieldNum) => {
    if (fieldNum <= 5) {
      alert("Cannot remove first 5 VL fields (VL-1 to VL-5)");
      return;
    }
    
    const currentCount = vlFiles[`vl${fieldNum}`]?.length || 0;
    if (currentCount > 0) {
      if (!confirm(`Field VL-${fieldNum} has ${currentCount} photo(s). Removing this field will delete all its photos. Are you sure?`)) {
        return;
      }
    }
    
    setVlFields(prev => prev.filter(num => num !== fieldNum));
    
    setVlFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[`vl${fieldNum}`];
      return newFiles;
    });
    
    setVlPhotoDetails(prev => {
      const newDetails = { ...prev };
      Object.keys(newDetails).forEach(key => {
        if (key.startsWith(`vl${fieldNum}_`)) {
          delete newDetails[key];
        }
      });
      return newDetails;
    });
    
    alert(`✅ VL-${fieldNum} field removed successfully`);
  };

  const getTotalVlPhotosCount = () => {
    let total = 0;
    for (let i = 1; i <= Math.max(...vlFields, 5); i++) {
      total += vlFiles[`vl${i}`]?.length || 0;
    }
    return total;
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
      const fullNegotiation = await vehicleNegotiation.getNegotiationById(negotiation._id);
      
      if (fullNegotiation) {
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

        if (fullNegotiation.approval) {
          const vehicleNumber = fullNegotiation.approval.vehicleNo || "";
          
          setVehicleInfo(prev => ({
            ...prev,
            vehicleNo: vehicleNumber,
            driverMobileNo: fullNegotiation.approval.mobile || "",
            driverName: fullNegotiation.approval.driverName || prev.driverName,
            drivingLicense: fullNegotiation.approval.drivingLicense || prev.drivingLicense,
            vehicleWeight: fullNegotiation.approval.vehicleWeight?.toString() || "",
            vehicleOwnerName: fullNegotiation.approval.vendorName || "",
            vehicleOwnerRC: fullNegotiation.approval.vehicleRC || "",
            ownerPanCard: fullNegotiation.approval.panCard || "",
            verified: fullNegotiation.approval.verified || false,
            vehicleType: fullNegotiation.approval.vehicleType || "",
            message: fullNegotiation.approval.message || "",
            remarks: fullNegotiation.approval.remarks || "",
            vehicleId: fullNegotiation.approval.vehicleId || "",
            insuranceNumber: fullNegotiation.approval.insuranceNumber || "",
            chasisNumber: fullNegotiation.approval.chasisNumber || "",
            fitnessNumber: fullNegotiation.approval.fitnessNumber || "",
            pucNumber: fullNegotiation.approval.pucNumber || ""
          }));
          
          if (vehicleNumber) {
            setSelectedVehicle({
              _id: fullNegotiation.approval.vehicleId,
              vehicleNumber: vehicleNumber,
              ownerName: fullNegotiation.approval.vendorName || ""
            });
          }
        }

        if (fullNegotiation.orders && fullNegotiation.orders.length > 0) {
          const newOrderRows = fullNegotiation.orders.map(order => ({
            _id: uid(),
            orderNo: order.orderNo || "",
            partyName: order.partyName || fullNegotiation.customerName || "",
            plantCode: order.plantCode || "",
            plantName: order.plantName || "",
            orderType: order.orderType || "",
            pinCode: order.pinCode || "",
            taluka: order.talukaName || order.taluka || "",
            talukaName: order.talukaName || order.taluka || "",
            district: order.districtName || order.district || "",
            districtName: order.districtName || order.district || "",
            state: order.stateName || order.state || "",
            stateName: order.stateName || order.state || "",
            from: order.fromName || order.from || "",
            fromName: order.fromName || order.from || "",
            to: order.toName || order.to || "",
            toName: order.toName || order.to || "",
            weight: order.weight?.toString() || "",
            collectionCharges: order.collectionCharges?.toString() || "",
            cancellationCharges: order.cancellationCharges || "",
            loadingCharges: order.loadingCharges || "",
            otherCharges: order.otherCharges?.toString() || "",
          }));
          setOrderRows(newOrderRows);
        }

        let mergedPackData = {
          PALLETIZATION: [],
          'UNIFORM - BAGS/BOXES': [],
          'LOOSE - CARGO': [],
          'NON-UNIFORM - GENERAL CARGO': []
        };

        let packDataFound = false;
        const token = localStorage.getItem('token');
        const selectedOrderPanels = fullNegotiation.selectedOrderPanels || [];

        if (selectedOrderPanels.length > 0) {
          for (const panel of selectedOrderPanels) {
            const orderPanelId = panel._id;
            
            if (orderPanelId) {
              try {
                const orderRes = await fetch(`/api/order-panel?id=${orderPanelId}`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                
                if (orderRes.ok) {
                  const orderData = await orderRes.json();
                  
                  if (orderData.success && orderData.data && orderData.data.packData) {
                    const orderPackData = orderData.data.packData;
                    packDataFound = true;
                    
                    if (orderPackData.PALLETIZATION && orderPackData.PALLETIZATION.length > 0) {
                      const newPalletRows = orderPackData.PALLETIZATION.map(item => ({
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
                    
                    if (orderPackData['UNIFORM - BAGS/BOXES'] && orderPackData['UNIFORM - BAGS/BOXES'].length > 0) {
                      const newUniformRows = orderPackData['UNIFORM - BAGS/BOXES'].map(item => ({
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
                    
                    if (orderPackData['LOOSE - CARGO'] && orderPackData['LOOSE - CARGO'].length > 0) {
                      const newLooseRows = orderPackData['LOOSE - CARGO'].map(item => ({
                        _id: uid(),
                        uom: item.uom || "",
                        productName: item.productName || "",
                        actualWt: item.actualWt?.toString() || "",
                        chargedWt: item.chargedWt?.toString() || "",
                      }));
                      mergedPackData['LOOSE - CARGO'] = [...mergedPackData['LOOSE - CARGO'], ...newLooseRows];
                    }
                  }
                }
              } catch (err) {
                console.error(`Error fetching order panel ${orderPanelId}:`, err);
              }
            }
          }
        }
        
        if (!packDataFound || 
            (mergedPackData.PALLETIZATION.length === 0 && 
             mergedPackData['UNIFORM - BAGS/BOXES'].length === 0 && 
             mergedPackData['LOOSE - CARGO'].length === 0 &&
             mergedPackData['NON-UNIFORM - GENERAL CARGO'].length === 0)) {
          mergedPackData = {
            PALLETIZATION: [defaultPackRow('PALLETIZATION')],
            'UNIFORM - BAGS/BOXES': [defaultPackRow('UNIFORM - BAGS/BOXES')],
            'LOOSE - CARGO': [defaultPackRow('LOOSE - CARGO')],
            'NON-UNIFORM - GENERAL CARGO': [defaultPackRow('NON-UNIFORM - GENERAL CARGO')]
          };
        } else {
          if (mergedPackData.PALLETIZATION.length === 0) mergedPackData.PALLETIZATION.push(defaultPackRow('PALLETIZATION'));
          if (mergedPackData['UNIFORM - BAGS/BOXES'].length === 0) mergedPackData['UNIFORM - BAGS/BOXES'].push(defaultPackRow('UNIFORM - BAGS/BOXES'));
          if (mergedPackData['LOOSE - CARGO'].length === 0) mergedPackData['LOOSE - CARGO'].push(defaultPackRow('LOOSE - CARGO'));
          if (mergedPackData['NON-UNIFORM - GENERAL CARGO'].length === 0) mergedPackData['NON-UNIFORM - GENERAL CARGO'].push(defaultPackRow('NON-UNIFORM - GENERAL CARGO'));
        }

        setPackData(mergedPackData);
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
  const rows = useMemo(() => {
    return packData[activePack] || [];
  }, [packData, activePack]);

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

  const handleBillingTypeChange = (value) => {
    setHeader((prev) => ({ ...prev, billingType: value }));
  };

  const handleActivateTracking = () => {
    if (!gpsTracking.driverMobileNumber) {
      alert("Please enter driver mobile number first");
      return;
    }
    setGpsTracking(prev => ({ ...prev, isTrackingActive: true }));
    alert(`✅ Tracking activated for mobile: ${gpsTracking.driverMobileNumber}`);
  };

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

  const billingColumns = [
    { key: "billingType", label: "Billing Type", options: BILLING_TYPES },
    { key: "noOfLoadingPoints", label: "No. of Loading Points", type: "number" },
    { key: "noOfDroppingPoint", label: "No. of Droping Point", type: "number" },
  ];

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

  const handleHelperFileSelect = (field, isVideo = false) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = isVideo ? 'video/*' : 'image/*';
    input.multiple = false;
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      setHelperInfo(prev => ({
        ...prev,
        [field]: [...prev[field], file]
      }));
    };
    
    input.click();
  };

  const removeFile = (section, field, index, isExisting = false) => {
    if (isExisting) {
      setExistingFiles(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: prev[section][field].filter((_, i) => i !== index)
        }
      }));
      
      if (section === 'vehicle') {
        if (field === 'rc') setVehicleInfo(prev => ({ ...prev, rcDocument: '' }));
        if (field === 'pan') setVehicleInfo(prev => ({ ...prev, panDocument: '' }));
        if (field === 'license') setVehicleInfo(prev => ({ ...prev, licenseDocument: '' }));
        if (field === 'photo') setVehicleInfo(prev => ({ ...prev, driverPhoto: '' }));
      }
    } else {
      switch(section) {
        case 'vehicle':
          setVehicleFiles(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
          }));
          break;
        case 'helper':
          setHelperInfo(prev => ({
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
    }
  };

  const uploadAllFiles = async (token) => {
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

        if (!response.ok) {
          const text = await response.text();
          console.error(`Upload failed: ${response.status}`, text);
          throw new Error(`Upload failed with status ${response.status}`);
        }

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

    const uploadPromises = [];
    const uploadedPaths = {
      vehicle: {},
      vbp: {},
      vft: {},
      vot: {},
      vl: {},
      weighment: {}
    };

    for (const file of vehiclePhotoFiles) {
      uploadPromises.push(
        uploadFile(file, 'vehicle', 'vehiclePhotos')
          .then(data => {
            if (data.success) {
              if (!uploadedPaths.vehiclePhotos) uploadedPaths.vehiclePhotos = [];
              uploadedPaths.vehiclePhotos.push(data.filePath);
            }
            return data;
          })
          .catch(error => {
            console.error(`Failed to upload vehicle photo:`, error);
            return null;
          })
      );
    }

    for (const file of vehicleSlipFiles) {
      uploadPromises.push(
        uploadFile(file, 'weighment', 'vehicleSlip')
          .then(data => {
            if (data.success) {
              if (!uploadedPaths.vehicleSlips) uploadedPaths.vehicleSlips = [];
              uploadedPaths.vehicleSlips.push(data.filePath);
            }
            return data;
          })
          .catch(error => {
            console.error(`Failed to upload vehicle slip:`, error);
            return null;
          })
      );
    }

    for (const file of loadedVehicleSlipFiles) {
      uploadPromises.push(
        uploadFile(file, 'weighment', 'loadedVehicleSlip')
          .then(data => {
            if (data.success) {
              if (!uploadedPaths.loadedVehicleSlips) uploadedPaths.loadedVehicleSlips = [];
              uploadedPaths.loadedVehicleSlips.push(data.filePath);
            }
            return data;
          })
          .catch(error => {
            console.error(`Failed to upload loaded vehicle slip:`, error);
            return null;
          })
      );
    }

    for (const [field, files] of Object.entries(helperInfo)) {
      if (Array.isArray(files)) {
        for (const file of files) {
          uploadPromises.push(
            uploadFile(file, 'helper', field)
              .then(data => {
                if (data.success) {
                  if (!uploadedPaths.helper) uploadedPaths.helper = {};
                  uploadedPaths.helper[field] = data.filePath;
                }
                return data;
              })
              .catch(error => {
                console.error(`Failed to upload helper/${field}:`, error);
                return null;
              })
          );
        }
      }
    }

    for (const [field, files] of Object.entries(vehicleFiles)) {
      for (const file of files) {
        uploadPromises.push(
          uploadFile(file, 'vehicle', field)
            .then(data => {
              if (data.success) uploadedPaths.vehicle[field] = data.filePath;
              return data;
            })
            .catch(error => {
              console.error(`Failed to upload vehicle/${field}:`, error);
              return null;
            })
        );
      }
    }

    for (const [field, files] of Object.entries(vbpFiles)) {
      for (const file of files) {
        uploadPromises.push(
          uploadFile(file, 'vbp', field)
            .then(data => {
              if (data.success) uploadedPaths.vbp[field] = data.filePath;
              return data;
            })
            .catch(error => {
              console.error(`Failed to upload vbp/${field}:`, error);
              return null;
            })
        );
      }
    }

    for (const [field, files] of Object.entries(vftFiles)) {
      for (const file of files) {
        uploadPromises.push(
          uploadFile(file, 'vft', field)
            .then(data => {
              if (data.success) uploadedPaths.vft[field] = data.filePath;
              return data;
            })
            .catch(error => {
              console.error(`Failed to upload vft/${field}:`, error);
              return null;
            })
        );
      }
    }

    for (const [field, files] of Object.entries(votFiles)) {
      for (const file of files) {
        uploadPromises.push(
          uploadFile(file, 'vot', field)
            .then(data => {
              if (data.success) uploadedPaths.vot[field] = data.filePath;
              return data;
            })
            .catch(error => {
              console.error(`Failed to upload vot/${field}:`, error);
              return null;
            })
        );
      }
    }

    for (const [field, files] of Object.entries(vlFiles)) {
      for (const file of files) {
        uploadPromises.push(
          uploadFile(file, 'vl', field)
            .then(data => {
              if (data.success) uploadedPaths.vl[field] = data.filePath;
              return data;
            })
            .catch(error => {
              console.error(`Failed to upload vl/${field}:`, error);
              return null;
            })
        );
      }
    }

    for (const [field, files] of Object.entries(weighmentFiles)) {
      for (const file of files) {
        uploadPromises.push(
          uploadFile(file, 'weighment', field)
            .then(data => {
              if (data.success) uploadedPaths.weighment[field] = data.filePath;
              return data;
            })
            .catch(error => {
              console.error(`Failed to upload weighment/${field}:`, error);
              return null;
            })
        );
      }
    }

    await Promise.allSettled(uploadPromises);
    console.log('Upload results completed');
    return uploadedPaths;
  };

  const handleSave = async () => {
    if (!header.branch) {
      alert("Please select a branch");
      return;
    }

    if (!vehicleInfo.vehicleNo) {
      alert("Please enter vehicle number");
      return;
    }

    const totalVlPhotos = getTotalVlPhotosCount();
    if (totalVlPhotos < 5) {
      alert(`Please upload at least 5 Vehicle Loading (VL) photos. Currently uploaded: ${totalVlPhotos}/5`);
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      
      setUploading(true);
      const uploadedPaths = await uploadAllFiles(token);
      setUploading(false);

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
        })),
        'NON-UNIFORM - GENERAL CARGO': packData['NON-UNIFORM - GENERAL CARGO'].map(item => ({
          _id: item._id,
          nos: item.nos || "",
          productName: item.productName || "",
          uom: item.uom || "",
          length: item.length || "",
          width: item.width || "",
          height: item.height || "",
          actualWt: item.actualWt || "",
          chargedWt: item.chargedWt || "",
        }))
      };

      const payload = {
        detentionDays: detentionDays,
        detentionNumber: detentionNumber,
        vehiclePhotos: uploadedPaths.vehiclePhotos || [],
        vehicleSlips: uploadedPaths.vehicleSlips || [],
        loadedVehicleSlips: uploadedPaths.loadedVehicleSlips || [],
        vlPhotoDetails: vlPhotoDetails,
        hasHelper: hasHelper,
        helperInfo: {
          name: helperInfo.name,
          mobileNo: helperInfo.mobileNo,
          photo: uploadedPaths.helper?.photo || [],
          aadharPhoto: uploadedPaths.helper?.aadharPhoto || []
        },
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
          aadharDocument: uploadedPaths.vehicle.aadhar || vehicleInfo.aadharDocument,
        },
        orderRows: orderRows.map(order => ({
          orderNo: order.orderNo,
          partyName: order.partyName,
          plantCode: order.plantCode,
          plantName: order.plantName,
          orderType: order.orderType,
          pinCode: order.pinCode,
          taluka: order.taluka || order.talukaName,
          talukaName: order.talukaName || order.taluka,
          district: order.district || order.districtName,
          districtName: order.districtName || order.district,
          state: order.state || order.stateName,
          stateName: order.stateName || order.state,
          from: order.from || order.fromName,
          fromName: order.fromName || order.from,
          to: order.to || order.toName,
          toName: order.toName || order.to,
          weight: num(order.weight),
          collectionCharges: num(order.collectionCharges) || 0,
          cancellationCharges: order.cancellationCharges || 'Nil',
          loadingCharges: order.loadingCharges || 'Nil',
          otherCharges: num(order.otherCharges) || 0
        })),
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

  const resetForm = () => {
    setVehiclePhotoFiles([]);
    setDetentionDays("");
    setDetentionNumber("");
    setVehicleSlipFiles([]);
    setLoadedVehicleSlipFiles([]);
    setVlFields([1, 2, 3, 4, 5]);
    setVlPhotoDetails({});
    setHasHelper(false);
    setHelperInfo({
      name: "",
      mobileNo: "",
      photo: [],
      aadharPhoto: []
    });
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
      "NON-UNIFORM - GENERAL CARGO": [defaultPackRow("NON-UNIFORM - GENERAL CARGO")],
    });
    
    setExistingFiles({
      vehicle: { rc: [], pan: [], license: [], photo: [] },
      vbp: {},
      vft: {},
      vot: {},
      vl: {},
      weighment: { weighSlip: [] }
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
      rc: [], pan: [], license: [], photo: [], aadhar: []
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
    
    setArrivalDetails({ date: new Date().toISOString().split('T')[0], time: "", outDate: "", outTime: "" });
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const getStatusBadge = (status) => {
    if (status === 'Approved') return 'bg-green-100 text-green-800';
    if (status === 'Rejected') return 'bg-red-100 text-red-800';
    if (status === 'Pending') return 'bg-yellow-100 text-yellow-800';
    if (status === 'Loaded') return 'bg-green-100 text-green-800';
    if (status === 'Partially Loaded') return 'bg-yellow-100 text-yellow-800';
    if (status === 'Not Loaded') return 'bg-red-100 text-red-800';
    return 'bg-slate-100 text-slate-800';
  };

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

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-4 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Capture Driver Photo</h3>
              <button
                onClick={stopCamera}
                className="text-red-500 hover:text-red-700 p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg bg-black"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={capturePhoto}
                className="rounded-full bg-blue-600 px-6 py-3 text-white font-bold hover:bg-blue-700"
              >
                Capture Photo
              </button>
              <button
                onClick={stopCamera}
                className="rounded-full bg-gray-500 px-6 py-3 text-white font-bold hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="mx-auto max-w-full p-4">
        {/* Vehicle Slip Upload - Top section */}
        <div className="mb-4">
          <div className="bg-white p-4 rounded-xl border-2 border-dashed border-slate-300">
            <label className="text-xs font-bold text-slate-600">Vehicle Slip</label>
            <p className="text-xs text-slate-400 mb-1">Upload vehicle slip (Image/PDF)</p>
            <button 
              onClick={handleVehicleSlipSelect}
              className="w-full rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 border border-slate-300 hover:bg-slate-200 transition flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              {vehicleSlipFiles.length > 0 ? `✓ ${vehicleSlipFiles.length} file(s)` : '+ Upload Vehicle Slip'}
            </button>
            <div className="mt-2">
              {vehicleSlipFiles.map((file, idx) => (
                <FileUploadItem 
                  key={idx} 
                  file={file} 
                  index={idx}
                  onRemove={removeVehicleSlip}
                  label="Vehicle Slip"
                />
              ))}
            </div>
          </div>
        </div>

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
              
              {showVehicleNegotiationDropdown && !selectedVehicleNegotiation && (
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
                          Vehicle: {nego.approval?.vehicleNo || 'N/A'} • Vendor: {nego.approval?.vendorName || 'N/A'}
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

            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Vehicle Number</label>
              <input
                type="text"
                value={vehicleInfo.vehicleNo}
                onChange={(e) => setVehicleInfo({ ...vehicleInfo, vehicleNo: e.target.value })}
                className={`mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 ${
                  selectedVehicleNegotiation ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                }`}
                placeholder="Enter vehicle number"
                readOnly={!!selectedVehicleNegotiation}
              />
              {selectedVehicleNegotiation && (
                <div className="text-xs text-green-600 mt-0.5">Auto-filled from negotiation</div>
              )}
            </div>

            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Mobile Number</label>
              <input
                type="text"
                value={vehicleInfo.driverMobileNo}
                onChange={(e) => setVehicleInfo({ ...vehicleInfo, driverMobileNo: e.target.value })}
                className={`mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 ${
                  selectedVehicleNegotiation ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                }`}
                placeholder="Enter mobile number"
                readOnly={!!selectedVehicleNegotiation}
              />
              {selectedVehicleNegotiation && (
                <div className="text-xs text-green-600 mt-0.5">Auto-filled from negotiation</div>
              )}
            </div>

            <div className="col-span-12 md:col-span-2">
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
                disabled={!!selectedVehicleNegotiation}
              />
            </div>

            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Date</label>
              <input
                type="date"
                value={header.date}
                onChange={(e) => setHeader({ ...header, date: e.target.value })}
                readOnly={!!selectedVehicleNegotiation}
                className={`mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 ${
                  selectedVehicleNegotiation ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                }`}
              />
            </div>

            <div className="col-span-12 md:col-span-2">
              <Select
                label="Delivery"
                value={header.delivery}
                onChange={(v) => setHeader({ ...header, delivery: v })}
                options={DELIVERY_OPTIONS}
                readOnly={!!selectedVehicleNegotiation}
              />
            </div>

            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Driving licence </label>
              <button 
                onClick={() => handleFileSelect('vehicle', 'aadhar')}
                className="mt-1 w-full rounded-lg bg-purple-50 px-3 py-2 text-xs font-bold text-purple-700 border border-purple-200 hover:bg-purple-100 transition flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                {vehicleFiles.aadhar.length > 0 ? `✓ ${vehicleFiles.aadhar.length} file(s)` : 'Upload Aadhar'}
              </button>
              {vehicleFiles.aadhar.map((file, idx) => (
                <FileUploadItem 
                  key={idx} 
                  file={file} 
                  index={idx}
                  onRemove={() => removeFile('vehicle', 'aadhar', idx)}
                  label="Aadhar"
                />
              ))}
              <p className="text-xs text-slate-400 mt-1">Upload Owner's Aadhar Card (PDF/Image)</p>
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
                            disabled={!!selectedVehicleNegotiation}
                            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 disabled:bg-slate-50 disabled:cursor-not-allowed"
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
                            readOnly={!!selectedVehicleNegotiation}
                            className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 ${
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
          </Card>
        </div>

        {/* Order Details Card */}
        <div className="mt-4">
          <Card 
            title="Order Details"
            right={
              <button
                onClick={addOrderRow}
                disabled={!!selectedVehicleNegotiation}
                className={`rounded-xl px-4 py-1.5 text-xs font-bold text-white transition ${
                  selectedVehicleNegotiation 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-yellow-600 hover:bg-yellow-700'
                }`}
              >
                + Add Order
              </button>
            }
          >
            <div className="overflow-auto rounded-xl border border-yellow-300 max-h-[500px]">
              <table className="min-w-max w-full text-sm">
                <thead className="sticky top-0 bg-yellow-400 z-10">
                  <tr>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[100px]">Order</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[150px]">Party Name</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[150px]">Plant</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[100px]">Order Type</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[100px]">Pin Code</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[120px]">From</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[120px]">To</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[100px]">Taluka</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[100px]">District</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[100px]">State</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[80px]">Weight (MT)</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[120px]">Collection Charges</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[130px]">Cancellation Charges</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[120px]">Loading Charges</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[120px]">Other Charges</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[80px]">Actions</th>
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
                          readOnly={!!selectedVehicleNegotiation}
                          className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-emerald-500 ${
                            selectedVehicleNegotiation ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                          }`}
                          placeholder="Order No"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.partyName || ""}
                          onChange={(e) => updateOrderRow(row._id, 'partyName', e.target.value)}
                          readOnly={!!selectedVehicleNegotiation}
                          className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-emerald-500 ${
                            selectedVehicleNegotiation ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                          }`}
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
                                updateOrderRow(row._id, 'fromName', plant.address || plant.city || '');
                              }
                            }
                          }}
                          placeholder="Select Plant"
                          displayField="name"
                          codeField="code"
                          cellId={`plant-${row._id}`}
                          disabled={!!selectedVehicleNegotiation}
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <select
                          value={row.orderType || ""}
                          onChange={(e) => updateOrderRow(row._id, 'orderType', e.target.value)}
                          disabled={!!selectedVehicleNegotiation}
                          className={`w-full rounded-lg border border-slate-200 px-2 py-2 text-sm outline-none focus:border-emerald-500 ${
                            selectedVehicleNegotiation ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                          }`}
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
                          readOnly={!!selectedVehicleNegotiation}
                          className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-emerald-500 ${
                            selectedVehicleNegotiation ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                          }`}
                          placeholder="Pin Code"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.fromName || row.from || ""}
                          onChange={(e) => updateOrderRow(row._id, 'fromName', e.target.value)}
                          readOnly={!!selectedVehicleNegotiation}
                          className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-emerald-500 ${
                            selectedVehicleNegotiation ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                          }`}
                          placeholder="From"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.toName || row.to || ""}
                          onChange={(e) => updateOrderRow(row._id, 'toName', e.target.value)}
                          readOnly={!!selectedVehicleNegotiation}
                          className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-emerald-500 ${
                            selectedVehicleNegotiation ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                          }`}
                          placeholder="To"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.talukaName || row.taluka || ""}
                          onChange={(e) => updateOrderRow(row._id, 'talukaName', e.target.value)}
                          readOnly={!!selectedVehicleNegotiation}
                          className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-emerald-500 ${
                            selectedVehicleNegotiation ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                          }`}
                          placeholder="Taluka"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.districtName || row.district || ""}
                          onChange={(e) => updateOrderRow(row._id, 'districtName', e.target.value)}
                          readOnly={!!selectedVehicleNegotiation}
                          className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-emerald-500 ${
                            selectedVehicleNegotiation ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                          }`}
                          placeholder="District"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.stateName || row.state || ""}
                          onChange={(e) => updateOrderRow(row._id, 'stateName', e.target.value)}
                          readOnly={!!selectedVehicleNegotiation}
                          className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-emerald-500 ${
                            selectedVehicleNegotiation ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                          }`}
                          placeholder="State"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="number"
                          value={row.weight || ""}
                          onChange={(e) => updateOrderRow(row._id, 'weight', e.target.value)}
                          readOnly={!!selectedVehicleNegotiation}
                          className={`w-20 rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-emerald-500 ${
                            selectedVehicleNegotiation ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                          }`}
                          placeholder="Weight"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="number"
                          value={row.collectionCharges || ""}
                          onChange={(e) => updateOrderRow(row._id, 'collectionCharges', e.target.value)}
                          readOnly={!!selectedVehicleNegotiation}
                          className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-emerald-500 ${
                            selectedVehicleNegotiation ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                          }`}
                          placeholder="Collection Charges"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.cancellationCharges || ""}
                          onChange={(e) => updateOrderRow(row._id, 'cancellationCharges', e.target.value)}
                          readOnly={!!selectedVehicleNegotiation}
                          className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-emerald-500 ${
                            selectedVehicleNegotiation ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                          }`}
                          placeholder="Cancellation Charges"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.loadingCharges || ""}
                          onChange={(e) => updateOrderRow(row._id, 'loadingCharges', e.target.value)}
                          readOnly={!!selectedVehicleNegotiation}
                          className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-emerald-500 ${
                            selectedVehicleNegotiation ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                          }`}
                          placeholder="Loading Charges"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="number"
                          value={row.otherCharges || ""}
                          onChange={(e) => updateOrderRow(row._id, 'otherCharges', e.target.value)}
                          readOnly={!!selectedVehicleNegotiation}
                          className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-emerald-500 ${
                            selectedVehicleNegotiation ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
                          }`}
                          placeholder="Other Charges"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <button
                          onClick={() => removeOrderRow(row._id)}
                          disabled={!!selectedVehicleNegotiation}
                          className={`rounded-lg px-3 py-1.5 text-xs font-bold text-white ${
                            selectedVehicleNegotiation 
                              ? 'bg-gray-400 cursor-not-allowed' 
                              : 'bg-red-500 hover:bg-red-600'
                          }`}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-yellow-100">
                  <tr>
                    <td colSpan="10" className="border border-yellow-300 px-3 py-2 text-right font-bold">
                      Total Quantity (MT):
                    </td>
                    <td className="border border-yellow-300 px-3 py-2 font-bold">
                      {calculateTotalWeight()}
                    </td>
                    <td colSpan="5" className="border border-yellow-300 px-3 py-2"></td>
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
                    {/* Vehicle Search Column */}
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

                        <div className="mt-3 pt-2 border-t border-slate-200">
                          <label className="text-xs font-bold text-slate-600">Or Search by Owner Name</label>
                          <OwnerSearchDropdown
                            onSelect={(owner) => {
                              if (owner) {
                                setVehicleInfo(prev => ({
                                  ...prev,
                                  vehicleNo: owner.vehicleNumber || "",
                                  vehicleOwnerName: owner.ownerName || "",
                                  vehicleOwnerRC: owner.rcNumber || "",
                                  ownerPanCard: owner.ownerPanCard || "",
                                  message: `Vehicle Owner: ${owner.ownerName}\nContact: ${owner.mobileNumber1 || owner.mobileNumber2}\nRC Number: ${owner.rcNumber || ''}`,
                                  remarks: `Pan Card: ${owner.ownerPanCard || 'N/A'}\nAdhar Card: ${owner.adharCardNumber || 'N/A'}`
                                }));
                                
                                setSelectedVehicle({
                                  _id: owner._id,
                                  vehicleNumber: owner.vehicleNumber,
                                  ownerName: owner.ownerName
                                });
                                
                                setExistingFiles(prev => ({
                                  ...prev,
                                  vehicle: {
                                    ...prev.vehicle,
                                    rc: owner.rcDocuments?.map(doc => ({ name: 'RC Document', path: doc })) || [],
                                    pan: owner.panCardDocuments?.map(doc => ({ name: 'PAN Document', path: doc })) || [],
                                  }
                                }));
                                
                                alert(`✅ Owner ${owner.ownerName} loaded!\nVehicle: ${owner.vehicleNumber}`);
                              }
                            }}
                            placeholder="Search by owner name, vehicle number, or RC number..."
                          />
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

                        <div className="pt-2 border-t border-slate-200">
                          <label className="text-xs font-bold text-slate-600">Vehicle Photos</label>
                          <p className="text-xs text-slate-400 mb-1">Upload vehicle photos (Max 10)</p>
                          <button 
                            onClick={handleVehiclePhotoSelect}
                            className="w-full rounded-lg bg-cyan-50 px-3 py-2 text-xs font-bold text-cyan-700 border border-cyan-200 hover:bg-cyan-100 transition flex items-center justify-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {vehiclePhotoFiles.length > 0 ? `✓ ${vehiclePhotoFiles.length} / 10 photos` : '+ Upload Vehicle Photos'}
                          </button>
                          <div className="mt-2 max-h-40 overflow-y-auto">
                            {vehiclePhotoFiles.map((file, idx) => (
                              <FileUploadItem 
                                key={idx} 
                                file={file} 
                                index={idx}
                                onRemove={removeVehiclePhoto}
                                label={`Vehicle Photo ${idx + 1}`}
                              />
                            ))}
                          </div>
                          {vehiclePhotoFiles.length > 0 && (
                            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                              <div 
                                className="bg-cyan-500 h-1.5 rounded-full transition-all"
                                style={{ width: `${(vehiclePhotoFiles.length / 10) * 100}%` }}
                              />
                            </div>
                          )}
                        </div>

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

                    {/* Vehicle Information Column */}
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
                            {existingFiles.vehicle?.rc?.map((file, idx) => (
                              <FileUploadItem 
                                key={`existing-rc-${idx}`}
                                file={file}
                                index={idx}
                                onRemove={() => removeFile('vehicle', 'rc', idx, true)}
                                label="RC"
                                isExisting={true}
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
                            {existingFiles.vehicle?.pan?.map((file, idx) => (
                              <FileUploadItem 
                                key={`existing-pan-${idx}`}
                                file={file}
                                index={idx}
                                onRemove={() => removeFile('vehicle', 'pan', idx, true)}
                                label="PAN"
                                isExisting={true}
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

                    {/* Driver Information Column */}
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

                        <div className="pt-3 border-t border-slate-200">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={hasHelper}
                              onChange={(e) => setHasHelper(e.target.checked)}
                              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-xs font-bold text-slate-700">Helper / Co-Driver Available?</span>
                          </label>
                        </div>

                        {hasHelper && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span className="text-xs font-bold text-blue-800">Helper / Co-Driver Details</span>
                            </div>

                            <div>
                              <label className="text-xs font-bold text-slate-600">Helper Name</label>
                              <input
                                type="text"
                                value={helperInfo.name}
                                onChange={(e) => setHelperInfo({ ...helperInfo, name: e.target.value })}
                                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                                placeholder="Enter helper name"
                              />
                            </div>

                            <div>
                              <label className="text-xs font-bold text-slate-600">Helper Mobile Number</label>
                              <input
                                type="tel"
                                value={helperInfo.mobileNo}
                                onChange={(e) => setHelperInfo({ ...helperInfo, mobileNo: e.target.value })}
                                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                                placeholder="Enter mobile number"
                              />
                            </div>

                            <div>
                              <label className="text-xs font-bold text-slate-600">Helper Photo</label>
                              <button 
                                onClick={() => handleHelperFileSelect('photo')}
                                className="mt-1 w-full rounded-lg bg-green-50 px-3 py-2 text-xs font-bold text-green-700 border border-green-200 hover:bg-green-100"
                              >
                                {helperInfo.photo.length > 0 ? `✓ ${helperInfo.photo.length} file(s)` : '+ Upload Photo'}
                              </button>
                              {helperInfo.photo.map((file, idx) => (
                                <FileUploadItem 
                                  key={idx} 
                                  file={file} 
                                  index={idx}
                                  onRemove={() => removeFile('helper', 'photo', idx)}
                                  label="Helper Photo"
                                />
                              ))}
                            </div>

                            <div>
                              <label className="text-xs font-bold text-slate-600">Helper Aadhar Photo</label>
                              <button 
                                onClick={() => handleHelperFileSelect('aadharPhoto')}
                                className="mt-1 w-full rounded-lg bg-purple-50 px-3 py-2 text-xs font-bold text-purple-700 border border-purple-200 hover:bg-purple-100"
                              >
                                {helperInfo.aadharPhoto.length > 0 ? `✓ ${helperInfo.aadharPhoto.length} file(s)` : '+ Upload Aadhar'}
                              </button>
                              {helperInfo.aadharPhoto.map((file, idx) => (
                                <FileUploadItem 
                                  key={idx} 
                                  file={file} 
                                  index={idx}
                                  onRemove={() => removeFile('helper', 'aadharPhoto', idx)}
                                  label="Helper Aadhar"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Message & Remarks Column */}
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
              key={activePack}
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

        {/* VL Panel Card */}
        <div className="mt-4">
          <Card title="VL - PANEL (Vehicle Loading Pictures)">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="mb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Vehicle Loading Pictures (VL)</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Minimum 5 photos required • Maximum 25 photos allowed • Current: {getTotalVlPhotosCount()} / 25
                  </p>
                  <p className="text-xs text-blue-500 mt-1">
                    Active Fields: {vlFields.length} • Max Fields: 15
                  </p>
                </div>
                <div className="flex gap-2">
                  {vlFields.length < 15 && getTotalVlPhotosCount() < 25 && (
                    <button
                      onClick={handleAddMoreVlField}
                      className="rounded-lg bg-green-600 px-4 py-2 text-xs font-bold text-white hover:bg-green-700 transition flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Field VL-{vlFields.length + 1}
                    </button>
                  )}
                  {getTotalVlPhotosCount() < 5 && (
                    <div className="text-xs text-red-500 font-medium flex items-center">
                      ⚠️ Need {5 - getTotalVlPhotosCount()} more photo(s)
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-12 gap-4">
                {vlFields.map((fieldNum) => {
                  const currentCount = vlFiles[`vl${fieldNum}`]?.length || 0;
                  const totalCount = getTotalVlPhotosCount();
                  const isMaxReached = totalCount >= 25;
                  const isDisabled = isMaxReached && currentCount === 0;
                  
                  return (
                    <div key={fieldNum} className="col-span-12 lg:col-span-6">
                      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-sm font-bold text-slate-800">
                            VL(stack)-{fieldNum}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${currentCount > 0 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                              {currentCount} / 25 photos
                            </span>
                            {fieldNum > 5 && (
                              <button
                                onClick={() => handleRemoveVlField(fieldNum)}
                                className="text-red-500 hover:text-red-700 p-1"
                                title="Remove this field"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => handleFileSelect('vl', `vl${fieldNum}`)}
                          disabled={isDisabled}
                          className={`w-full rounded-lg py-2.5 text-sm font-bold border transition-all ${
                            currentCount > 0 
                              ? 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100' 
                              : isDisabled 
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                : 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100'
                          }`}
                          title={isDisabled ? "Maximum 25 photos reached" : `Upload VL(stack)-${fieldNum} photos`}
                        >
                          {currentCount > 0 
                            ? `📸 + Add More Photos (${currentCount} uploaded)` 
                            : isDisabled 
                              ? 'Max Reached' 
                              : '+ Select Photos'}
                        </button>

                        {currentCount > 0 && (
                          <div className="mt-2">
                            <div className="w-full bg-slate-200 rounded-full h-1.5">
                              <div 
                                className="bg-green-500 h-1.5 rounded-full transition-all"
                                style={{ width: `${(currentCount / 25) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {vlFiles[`vl${fieldNum}`] && vlFiles[`vl${fieldNum}`].length > 0 && (
                          <div className="mt-3 space-y-2 max-h-96 overflow-y-auto">
                            <div className="text-xs font-bold text-slate-600 mb-2">Uploaded Photos:</div>
                            {vlFiles[`vl${fieldNum}`].map((file, fileIdx) => (
                              <div key={fileIdx} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                                <FileUploadItem 
                                  file={file} 
                                  index={fileIdx}
                                  onRemove={() => removeFile('vl', `vl${fieldNum}`, fileIdx)}
                                  label={`VL(stack)-${fieldNum}`}
                                />
                                
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                  <div>
                                    <label className="text-xs font-bold text-slate-600">Height (ft)</label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={vlPhotoDetails[`vl${fieldNum}_${fileIdx}_height`] || ""}
                                      onChange={(e) => setVlPhotoDetails(prev => ({
                                        ...prev,
                                        [`vl${fieldNum}_${fileIdx}_height`]: e.target.value
                                      }))}
                                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-emerald-500"
                                      placeholder="Height in ft"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs font-bold text-slate-600">Width (ft)</label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={vlPhotoDetails[`vl${fieldNum}_${fileIdx}_width`] || ""}
                                      onChange={(e) => setVlPhotoDetails(prev => ({
                                        ...prev,
                                        [`vl${fieldNum}_${fileIdx}_width`]: e.target.value
                                      }))}
                                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-emerald-500"
                                      placeholder="Width in ft"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs font-bold text-slate-600">Nose (ft)</label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={vlPhotoDetails[`vl${fieldNum}_${fileIdx}_nose`] || ""}
                                      onChange={(e) => setVlPhotoDetails(prev => ({
                                        ...prev,
                                        [`vl${fieldNum}_${fileIdx}_nose`]: e.target.value
                                      }))}
                                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-emerald-500"
                                      placeholder="Nose in ft"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-purple-700 mb-1">Video - VL</div>
                      <p className="text-xs text-slate-500">Upload video of vehicle loading (Optional)</p>
                    </div>
                    <button 
                      onClick={() => handleFileSelect('vl', 'videoVl', true)}
                      className={`rounded-lg px-4 py-2 text-xs font-bold border hover:bg-opacity-80 ${
                        vlFiles.videoVl && vlFiles.videoVl.length > 0
                          ? 'bg-green-50 text-green-700 border-green-300' 
                          : 'bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200'
                      }`}
                    >
                      {vlFiles.videoVl && vlFiles.videoVl.length > 0 
                        ? `✓ ${vlFiles.videoVl.length} video(s)` 
                        : '+ Upload Video'}
                    </button>
                  </div>
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

              <div className="mt-4">
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Total Upload Progress</span>
                  <span className="font-bold">{getTotalVlPhotosCount()} / 25 photos</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      getTotalVlPhotosCount() >= 5 
                        ? 'bg-green-500' 
                        : 'bg-yellow-500'
                    }`}
                    style={{ 
                      width: `${Math.min(100, (getTotalVlPhotosCount() / 25) * 100)}%` 
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-red-500">⚠️ Minimum: 5 photos</span>
                  <span className="text-green-500">✓ Maximum: 25 photos</span>
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
              
              {getTotalVlPhotosCount() > 0 && getTotalVlPhotosCount() < 5 && (
                <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-xs text-red-600 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    ⚠️ Please upload at least {5 - getTotalVlPhotosCount()} more photo(s). Minimum 5 photos required.
                  </p>
                </div>
              )}
              
              {getTotalVlPhotosCount() >= 5 && (
                <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs text-green-600 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    ✅ Great! You have uploaded {getTotalVlPhotosCount()} photo(s). Minimum requirement satisfied.
                  </p>
                </div>
              )}
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
                </div>
                <div className="mt-4">
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                    <label className="text-xs font-bold text-orange-700">Detention Days</label>
                    <input
                      type="number"
                      value={detentionDays}
                      onChange={(e) => setDetentionDays(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500"
                      placeholder="Enter number of detention days"
                      min="0"
                    />
                    <p className="text-xs text-orange-600 mt-1">Number of days vehicle is detained</p>
                  </div>
                </div>
              </div>

              <div className="col-span-12 md:col-span-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-slate-800">Loading Charges & Expenses</h3>
                    <div className="bg-orange-100 text-orange-800 text-xs px-3 py-1 rounded-full font-medium">
                      Deduct at Office
                    </div>
                  </div>
                  
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
                      <span className="text-sm font-bold text-slate-800">Total (to be deducted at office):</span>
                      <span className="font-bold text-orange-700 text-lg">
                        ₹{calculateTotalCharges().toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Arrival Details */}
            <div className="mt-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Arrival Details</h3>
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
                      <p className="text-xs text-green-600 mt-1">Auto-filled from camera capture</p>
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
                      <p className="text-xs text-green-600 mt-1">Auto-filled from camera capture</p>
                    </div>
                  </div>
                  <div className="col-span-12 md:col-span-3">
                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                      <label className="text-xs font-bold text-orange-700">Out Date</label>
                      <input
                        type="date"
                        value={arrivalDetails.outDate || ""}
                        onChange={(e) => setArrivalDetails({ ...arrivalDetails, outDate: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500"
                      />
                      <p className="text-xs text-orange-600 mt-1">Auto-filled when generating LR</p>
                    </div>
                  </div>
                  <div className="col-span-12 md:col-span-3">
                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                      <label className="text-xs font-bold text-orange-700">Out Time</label>
                      <input
                        type="time"
                        value={arrivalDetails.outTime}
                        onChange={(e) => setArrivalDetails({ ...arrivalDetails, outTime: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500"
                        placeholder="HH:MM"
                      />
                      <p className="text-xs text-orange-600 mt-1">Auto-filled when generating LR</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Vehicle GPS Tracking Card */}
        <div className="mt-4">
          <Card title="Vehicle GPS Tracking & Driver Photo">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 h-full">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">Live Vehicle Tracking</h3>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">Track vehicle location in real-time via API integration</p>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Driver Mobile Number"
                      value={gpsTracking.driverMobileNumber}
                      onChange={(e) => setGpsTracking({ ...gpsTracking, driverMobileNumber: e.target.value })}
                      className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                    />
                    <button 
                      onClick={handleActivateTracking}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 whitespace-nowrap"
                    >
                      {gpsTracking.isTrackingActive ? 'Tracking Active' : 'Activate Tracking'}
                    </button>
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
              </div>

              <div className="col-span-12 md:col-span-6">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 h-full">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Driver Photo Capture</h3>
                      <p className="text-xs text-slate-600 mt-1">Click to open camera and capture driver photo</p>
                      <p className="text-xs text-green-600 mt-1">📸 Photo capture will auto-fill Arrival Date & Time</p>
                    </div>
                    <button
                      onClick={startCamera}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Open Camera
                    </button>
                  </div>
                  {vehicleFiles.photo.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-bold text-slate-600 mb-2">Captured Photos:</p>
                      {vehicleFiles.photo.map((file, idx) => (
                        <FileUploadItem 
                          key={idx} 
                          file={file} 
                          index={idx}
                          onRemove={() => removeFile('vehicle', 'photo', idx)}
                          label="Driver Photo"
                          isCameraPhoto={true}
                        />
                      ))}
                    </div>
                  )}
                </div>
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
                  <button 
                    onClick={handleGenerateLR}
                    className="w-full rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
                  >
                    Generate LR
                  </button>
                  <p className="text-xs text-slate-500 mt-2">Click to generate LR and auto-fill Out Time & Date</p>
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

        {/* Loaded Vehicle Slip Upload - Bottom section */}
        <div className="mt-4">
          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
            <label className="text-xs font-bold text-indigo-700">Loaded Vehicle Slip</label>
            <p className="text-xs text-slate-400 mb-1">Upload loaded vehicle slip after loading (Image/PDF)</p>
            <button 
              onClick={handleLoadedVehicleSlipSelect}
              className="w-full rounded-lg bg-indigo-100 px-3 py-2 text-xs font-bold text-indigo-700 border border-indigo-300 hover:bg-indigo-200 transition flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              {loadedVehicleSlipFiles.length > 0 ? `✓ ${loadedVehicleSlipFiles.length} file(s)` : '+ Upload Loaded Vehicle Slip'}
            </button>
            <div className="mt-2">
              {loadedVehicleSlipFiles.map((file, idx) => (
                <FileUploadItem 
                  key={idx} 
                  file={file} 
                  index={idx}
                  onRemove={removeLoadedVehicleSlip}
                  label="Loaded Vehicle Slip"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}