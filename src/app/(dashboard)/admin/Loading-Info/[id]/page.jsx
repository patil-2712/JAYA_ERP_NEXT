"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

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
  Vehicle Negotiation Hook
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

function FileUploadItem({ file, onRemove, index, label, isExisting = false, readOnly = false, isCameraPhoto = false, photoTime = null }) {
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

  const handleView = () => {
    if (isExisting && file.path) {
      window.open(file.path, '_blank');
    } else if (file.type && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 mt-1">
      {imagePreview && !isExisting && (
        <img src={imagePreview} alt="Preview" className="w-10 h-10 rounded object-cover cursor-pointer" onClick={handleView} />
      )}
      {isExisting && (
        <div className="w-10 h-10 bg-green-100 rounded flex items-center justify-center cursor-pointer" onClick={handleView}>
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-700 truncate cursor-pointer" onClick={handleView}>
          {isExisting ? (file.name || 'Existing Document') : file.name}
        </p>
        <p className="text-xs text-slate-500">
          {isExisting ? 'Already uploaded' : `${(file.size / 1024).toFixed(1)} KB`}
        </p>
        {photoTime && (
          <p className="text-xs text-green-600">Captured: {photoTime}</p>
        )}
      </div>
      {!readOnly && (
        <button
          onClick={() => onRemove(index, isExisting)}
          className="text-red-500 hover:text-red-700 p-1"
          title="Remove"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

function VehicleSearchDropdown({ onSelect, placeholder = "Search vehicle...", selectedVehicleId, value = "", readOnly = false }) {
  const [searchQuery, setSearchQuery] = useState(value || "");
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const dropdownRef = useRef(null);
  const vehicleSearch = useVehicleSearch();

  useEffect(() => {
    if (value) {
      setSearchQuery(value);
    }
  }, [value]);

  useEffect(() => {
    if (vehicleSearch.vehicles.length > 0) {
      setFilteredVehicles(vehicleSearch.vehicles);
    }
  }, [vehicleSearch.vehicles]);

  const handleSearch = (query) => {
    if (readOnly) return;
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
    if (readOnly) return;
    setSearchQuery(vehicle.vehicleNumber);
    setShowDropdown(false);
    onSelect(vehicle);
  };

  const handleInputFocus = async () => {
    if (!readOnly) {
      if (vehicleSearch.vehicles.length === 0) {
        await vehicleSearch.searchVehicles();
      }
      setFilteredVehicles(vehicleSearch.vehicles);
      setShowDropdown(true);
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={handleInputFocus}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        className={`mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
          readOnly ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'
        }`}
        placeholder={placeholder}
        autoComplete="off"
        readOnly={readOnly}
      />
      
      {showDropdown && !readOnly && (
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
          readOnly ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'
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
    if (disabled) return;
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
    if (disabled) return;
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
        onFocus={() => !disabled && setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        className={`mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
          disabled ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'
        }`}
        placeholder={placeholder}
        disabled={disabled}
      />
      {showDropdown && !disabled && (
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

function OwnerSearchDropdown({ onSelect, placeholder = "Search owner...", readOnly = false }) {
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
    if (readOnly) return;
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
    if (readOnly) return;
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
        onFocus={() => !readOnly && setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        className={`mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
          readOnly ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'
        }`}
        placeholder={placeholder}
        autoComplete="off"
        readOnly={readOnly}
      />
      {showDropdown && !readOnly && (
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

function PackTypeTable({ packType, rows, onChange, onRemove, onDuplicate, onToggleUniform, readOnly = false }) {
  const getColumns = (type) => {
    if (type === "PALLETIZATION") {
      return [
        { key: "noOfPallets", label: "NO OF PALLETS", type: "number", readOnly: true },
        { key: "unitPerPallets", label: "UNIT PER PALLETS", type: "number", readOnly: true },
        { key: "totalPkgs", label: "TOTAL PKGS", type: "number", readOnly: true },
        { key: "pkgsType", label: "PKGS TYPE", type: "text", options: PKGS_TYPE_OPTIONS, readOnly: true },
        { key: "uom", label: "UOM", type: "text", options: UOM_OPTIONS, readOnly: true },
        { key: "skuSize", label: "SKU - SIZE", type: "text", options: SKU_SIZE_OPTIONS, readOnly: true },
        { key: "packWeight", label: "PACK - WEIGHT", type: "number", readOnly: true },
        { key: "productName", label: "PRODUCT NAME", type: "text", options: PRODUCT_NAME_OPTIONS, readOnly: true },
        { key: "wtLtr", label: "WT (LTR)", type: "number", readOnly: true },
        { key: "actualWt", label: "ACTUAL - WT", type: "number", readOnly: true },
        { key: "chargedWt", label: "CHARGED - WT", type: "number", readOnly: false },
        { key: "wtUom", label: "WT UOM", type: "text", readOnly: true },
      ];
    }

    if (type === "UNIFORM - BAGS/BOXES") {
      return [
        { key: "totalPkgs", label: "TOTAL PKGS", type: "number", readOnly: true },
        { key: "pkgsType", label: "PKGS TYPE", type: "text", options: PKGS_TYPE_OPTIONS, readOnly: true },
        { key: "uom", label: "UOM", type: "text", options: UOM_OPTIONS, readOnly: true },
        { key: "skuSize", label: "SKU - SIZE", type: "text", options: SKU_SIZE_OPTIONS, readOnly: true },
        { key: "packWeight", label: "PACK - WEIGHT", type: "number", readOnly: true },
        { key: "productName", label: "PRODUCT NAME", type: "text", options: PRODUCT_NAME_OPTIONS, readOnly: true },
        { key: "wtLtr", label: "WT (LTR)", type: "number", readOnly: true },
        { key: "actualWt", label: "ACTUAL - WT", type: "number", readOnly: true },
        { key: "chargedWt", label: "CHARGED - WT", type: "number", readOnly: false },
        { key: "wtUom", label: "WT UOM", type: "text", readOnly: true },
      ];
    }

    if (type === "LOOSE - CARGO") {
      return [
        { key: "uom", label: "UOM", type: "text", options: UOM_OPTIONS, readOnly: true },
        { key: "productName", label: "PRODUCT NAME", type: "text", options: PRODUCT_NAME_OPTIONS, readOnly: true },
        { key: "actualWt", label: "ACTUAL - WT", type: "number", readOnly: true },
        { key: "chargedWt", label: "CHARGED - WT", type: "number", readOnly: false },
      ];
    }

    return [
      { key: "nos", label: "NOS", type: "number", readOnly: true },
      { key: "productName", label: "PRODUCT NAME", type: "text", options: PRODUCT_NAME_OPTIONS, readOnly: true },
      { key: "uom", label: "UOM", type: "text", options: UOM_OPTIONS, readOnly: true },
      { key: "length", label: "LENGTH", type: "number", readOnly: true },
      { key: "width", label: "WIDTH", type: "number", readOnly: true },
      { key: "height", label: "HEIGHT", type: "number", readOnly: true },
      { key: "actualWt", label: "ACTUAL - WT", type: "number", readOnly: true },
      { key: "chargedWt", label: "CHARGED - WT", type: "number", readOnly: false },
    ];
  };

  const cols = useMemo(() => getColumns(packType), [packType]);

  if (!rows || rows.length === 0) {
    return (
      <div className="overflow-auto rounded-xl border border-yellow-300">
        <div className="p-8 text-center text-slate-400">
          No data available
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
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r._id} className="hover:bg-yellow-50 even:bg-slate-50">
              {cols.map((c) => (
                <td key={c.key} className="border border-yellow-300 px-2 py-2">
                  {c.readOnly ? (
                    c.options ? (
                      <div className="w-full px-2 py-1.5 text-sm bg-slate-50 rounded-lg border border-slate-200">
                        {r[c.key] || '-'}
                      </div>
                    ) : (
                      <div className="w-full px-2 py-1.5 text-sm bg-slate-50 rounded-lg border border-slate-200">
                        {r[c.key] || '-'}
                      </div>
                    )
                  ) : (
                    c.options ? (
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
                        onChange={(e) => onChange(r._id, c.key, e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                        placeholder={`Enter ${c.label}`}
                        step={c.type === "number" ? "0.001" : undefined}
                      />
                    )
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-yellow-100">
          <tr>
            <td colSpan={cols.length - 1} className="border border-yellow-300 px-3 py-2 text-right font-bold">
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

export default function EditLoadingInfoPanel() {
  const router = useRouter();
  const params = useParams();
  const panelId = params.id;

  /** =========================
   * STATE FOR API DATA
   ========================= */
  const [branches, setBranches] = useState([]);
  const [plants, setPlants] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
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
  const ownerSearch = useOwnerSearch();

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
  const [orderRows, setOrderRows] = useState([]);

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
    PALLETIZATION: [],
    "UNIFORM - BAGS/BOXES": [],
    "LOOSE - CARGO": [],
    "NON-UNIFORM - GENERAL CARGO": [],
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
   * ADDITIONAL STATE FOR NEW FIELDS
   ========================= */
  const [vehiclePhotoFiles, setVehiclePhotoFiles] = useState([]);
  const [detentionDays, setDetentionDays] = useState("");
  const [vehicleSlipFiles, setVehicleSlipFiles] = useState([]);
  const [loadedVehicleSlipFiles, setLoadedVehicleSlipFiles] = useState([]);
  const [hasHelper, setHasHelper] = useState(false);
  const [helperInfo, setHelperInfo] = useState({
    name: "",
    mobileNo: "",
    photo: [],
    aadharPhoto: []
  });
  
  /** =========================
   * VL PHOTO DETAILS STATE (Height, Width, Nose)
   ========================= */
  const [vlPhotoDetails, setVlPhotoDetails] = useState({});

  /** =========================
   * VL FIELDS STATE - Initially 5 fields
   ========================= */
  const [vlFields, setVlFields] = useState([1, 2, 3, 4, 5]);

  /** =========================
   * EXISTING FILE PATHS (from database)
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
    },
    vehiclePhotos: [],
    vehicleSlips: [],
    loadedVehicleSlips: []
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
   * ARRIVAL DETAILS with OUT DATE
   ========================= */
  const [arrivalDetails, setArrivalDetails] = useState({
    date: new Date().toISOString().split('T')[0],
    time: "",
    outDate: "",
    outTime: "",
  });

  /** =========================
   * READONLY MODE STATE
   ========================= */
  const [isReadOnly, setIsReadOnly] = useState(false);
  
  /** =========================
   * CAMERA PHOTO CAPTURE STATE
   ========================= */
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);

  // Fetch loading panel data
  useEffect(() => {
    if (panelId) {
      fetchLoadingPanelData();
    }
    fetchBranches();
    fetchPlants();
    fetchOrders();
    vehicleNegotiation.fetchNegotiations();
    vehicleSearch.searchVehicles();
  }, [panelId]);

  const fetchLoadingPanelData = async () => {
    setFetchLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch(`/api/loading-panel?id=${panelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch loading panel');
      }

      const panel = data.data;
      
      if (panel.panelStatus === 'Approved' || panel.panelStatus === 'Completed') {
        setIsReadOnly(true);
      }
      
      // Set header data
      setHeader({
        vehicleArrivalNo: panel.vehicleArrivalNo || "",
        vehicleNegotiationNo: panel.vehicleNegotiationNo || "",
        branch: panel.branch || "",
        branchName: panel.branchName || "",
        branchCode: panel.branchCode || "",
        date: panel.date || new Date().toISOString().split('T')[0],
        delivery: panel.delivery || "",
        billingType: panel.billingType || "",
        noOfLoadingPoints: panel.noOfLoadingPoints?.toString() || "",
        noOfDroppingPoint: panel.noOfDroppingPoint?.toString() || "",
        collectionCharges: panel.collectionCharges || "",
        cancellationCharges: panel.cancellationCharges || "",
        loadingCharges: panel.loadingCharges || "",
        otherCharges: panel.otherCharges || "",
      });

      if (panel.vehicleNegotiationNo) {
        setVehicleNegotiationNo(panel.vehicleNegotiationNo);
      }

      // Set order rows
      if (panel.orderRows && panel.orderRows.length > 0) {
        const processedOrderRows = panel.orderRows.map(row => ({
          ...row,
          _id: row._id || uid(),
          weight: row.weight?.toString() || "",
        }));
        setOrderRows(processedOrderRows);
      } else {
        setOrderRows([defaultOrderRow()]);
      }

      // Set vehicle info
      if (panel.vehicleInfo) {
        setVehicleInfo({
          vehicleNo: panel.vehicleInfo.vehicleNo || "",
          driverMobileNo: panel.vehicleInfo.driverMobileNo || "",
          driverName: panel.vehicleInfo.driverName || "",
          drivingLicense: panel.vehicleInfo.drivingLicense || "",
          vehicleWeight: panel.vehicleInfo.vehicleWeight?.toString() || "",
          vehicleOwnerName: panel.vehicleInfo.vehicleOwnerName || "",
          vehicleOwnerRC: panel.vehicleInfo.vehicleOwnerRC || "",
          ownerPanCard: panel.vehicleInfo.ownerPanCard || "",
          verified: panel.vehicleInfo.verified || false,
          vehicleType: panel.vehicleInfo.vehicleType || "",
          message: panel.vehicleInfo.message || "",
          remarks: panel.vehicleInfo.remarks || "",
          rcDocument: panel.vehicleInfo.rcDocument || "",
          panDocument: panel.vehicleInfo.panDocument || "",
          licenseDocument: panel.vehicleInfo.licenseDocument || "",
          driverPhoto: panel.vehicleInfo.driverPhoto || "",
          vehicleId: panel.vehicleInfo.vehicleId || "",
          insuranceNumber: panel.vehicleInfo.insuranceNumber || "",
          chasisNumber: panel.vehicleInfo.chasisNumber || "",
          fitnessNumber: panel.vehicleInfo.fitnessNumber || "",
          pucNumber: panel.vehicleInfo.pucNumber || ""
        });

        // Set existing files for vehicle documents
        if (panel.vehicleInfo.rcDocument) {
          setExistingFiles(prev => ({
            ...prev,
            vehicle: { ...prev.vehicle, rc: [{ name: 'RC Document', path: panel.vehicleInfo.rcDocument }] }
          }));
        }
        if (panel.vehicleInfo.panDocument) {
          setExistingFiles(prev => ({
            ...prev,
            vehicle: { ...prev.vehicle, pan: [{ name: 'PAN Document', path: panel.vehicleInfo.panDocument }] }
          }));
        }
        if (panel.vehicleInfo.licenseDocument) {
          setExistingFiles(prev => ({
            ...prev,
            vehicle: { ...prev.vehicle, license: [{ name: 'License Document', path: panel.vehicleInfo.licenseDocument }] }
          }));
        }
        if (panel.vehicleInfo.driverPhoto) {
          setExistingFiles(prev => ({
            ...prev,
            vehicle: { ...prev.vehicle, photo: [{ name: 'Driver Photo', path: panel.vehicleInfo.driverPhoto }] }
          }));
        }
      }

      // Set detention info
      if (panel.detentionDays) setDetentionDays(panel.detentionDays);
      
      // Set helper info
      if (panel.hasHelper !== undefined) setHasHelper(panel.hasHelper);
      if (panel.helperInfo) {
        setHelperInfo({
          name: panel.helperInfo.name || "",
          mobileNo: panel.helperInfo.mobileNo || "",
          photo: panel.helperInfo.photo || [],
          aadharPhoto: panel.helperInfo.aadharPhoto || []
        });
      }
      
      // Set vehicle photos
      if (panel.vehiclePhotos && panel.vehiclePhotos.length > 0) {
        setExistingFiles(prev => ({
          ...prev,
          vehiclePhotos: panel.vehiclePhotos.map(path => ({ name: 'Vehicle Photo', path }))
        }));
      }
      
      // Set vehicle slips
      if (panel.vehicleSlips && panel.vehicleSlips.length > 0) {
        setExistingFiles(prev => ({
          ...prev,
          vehicleSlips: panel.vehicleSlips.map(path => ({ name: 'Vehicle Slip', path }))
        }));
      }
      
      // Set loaded vehicle slips
      if (panel.loadedVehicleSlips && panel.loadedVehicleSlips.length > 0) {
        setExistingFiles(prev => ({
          ...prev,
          loadedVehicleSlips: panel.loadedVehicleSlips.map(path => ({ name: 'Loaded Vehicle Slip', path }))
        }));
      }

      // Set VL Photo Details
      if (panel.vlPhotoDetails) {
        setVlPhotoDetails(panel.vlPhotoDetails);
      }

      // Set VL Fields
      if (panel.vlFields && panel.vlFields.length > 0) {
        setVlFields(panel.vlFields);
      }

      // Set pack data
      if (panel.packData) {
        const processedPackData = {
          PALLETIZATION: (panel.packData.PALLETIZATION || []).map(row => ({
            ...row,
            _id: row._id || uid(),
            noOfPallets: row.noOfPallets?.toString() || "",
            unitPerPallets: row.unitPerPallets?.toString() || "",
            totalPkgs: row.totalPkgs?.toString() || "",
            packWeight: row.packWeight?.toString() || "",
            wtLtr: row.wtLtr?.toString() || "",
            actualWt: row.actualWt?.toString() || "",
            chargedWt: row.chargedWt?.toString() || "",
          })),
          "UNIFORM - BAGS/BOXES": (panel.packData["UNIFORM - BAGS/BOXES"] || []).map(row => ({
            ...row,
            _id: row._id || uid(),
            totalPkgs: row.totalPkgs?.toString() || "",
            packWeight: row.packWeight?.toString() || "",
            wtLtr: row.wtLtr?.toString() || "",
            actualWt: row.actualWt?.toString() || "",
            chargedWt: row.chargedWt?.toString() || "",
          })),
          "LOOSE - CARGO": (panel.packData["LOOSE - CARGO"] || []).map(row => ({
            ...row,
            _id: row._id || uid(),
            actualWt: row.actualWt?.toString() || "",
            chargedWt: row.chargedWt?.toString() || "",
          })),
          "NON-UNIFORM - GENERAL CARGO": (panel.packData["NON-UNIFORM - GENERAL CARGO"] || []).map(row => ({
            ...row,
            _id: row._id || uid(),
            nos: row.nos?.toString() || "",
            productName: row.productName || "",
            uom: row.uom || "",
            length: row.length?.toString() || "",
            width: row.width?.toString() || "",
            height: row.height?.toString() || "",
            actualWt: row.actualWt?.toString() || "",
            chargedWt: row.chargedWt?.toString() || "",
          })),
        };
        
        if (processedPackData.PALLETIZATION.length === 0) {
          processedPackData.PALLETIZATION.push(defaultPackRow('PALLETIZATION'));
        }
        if (processedPackData['UNIFORM - BAGS/BOXES'].length === 0) {
          processedPackData['UNIFORM - BAGS/BOXES'].push(defaultPackRow('UNIFORM - BAGS/BOXES'));
        }
        if (processedPackData['LOOSE - CARGO'].length === 0) {
          processedPackData['LOOSE - CARGO'].push(defaultPackRow('LOOSE - CARGO'));
        }
        if (processedPackData['NON-UNIFORM - GENERAL CARGO'].length === 0) {
          processedPackData['NON-UNIFORM - GENERAL CARGO'].push(defaultPackRow('NON-UNIFORM - GENERAL CARGO'));
        }
        
        setPackData(processedPackData);
        
        if (panel.activePack) {
          setActivePack(panel.activePack);
        }
      }

      // Set upload sections
      if (panel.vbpUploads) {
        setVbpUploads({
          approval: panel.vbpUploads.approval || "",
          remark: panel.vbpUploads.remark || "",
        });
        
        const vbpExisting = {};
        ['vbp1','vbp2','vbp3','vbp4','vbp5','vbp6','vbp7','videoVbp'].forEach(key => {
          if (panel.vbpUploads[key]) {
            vbpExisting[key] = [{ name: `VBP ${key}`, path: panel.vbpUploads[key] }];
          }
        });
        setExistingFiles(prev => ({ ...prev, vbp: vbpExisting }));
      }

      if (panel.vftUploads) {
        setVftUploads({
          approval: panel.vftUploads.approval || "",
        });
        
        const vftExisting = {};
        ['vft1','vft2','vft3','vft4','vft5','vft6','vft7','videoVft'].forEach(key => {
          if (panel.vftUploads[key]) {
            vftExisting[key] = [{ name: `VFT ${key}`, path: panel.vftUploads[key] }];
          }
        });
        setExistingFiles(prev => ({ ...prev, vft: vftExisting }));
      }

      if (panel.votUploads) {
        setVotUploads({
          approval: panel.votUploads.approval || "",
        });
        
        const votExisting = {};
        ['vot1','vot2','vot3','vot4','vot5','vot6','vot7','videoVot'].forEach(key => {
          if (panel.votUploads[key]) {
            votExisting[key] = [{ name: `VOT ${key}`, path: panel.votUploads[key] }];
          }
        });
        setExistingFiles(prev => ({ ...prev, vot: votExisting }));
      }

      if (panel.vlUploads) {
        setVlUploads({
          approval: panel.vlUploads.approval || "",
          loadingStatus: panel.vlUploads.loadingStatus || "",
        });
        
        const vlExisting = {};
        for (let i = 1; i <= 15; i++) {
          const key = `vl${i}`;
          if (panel.vlUploads[key]) {
            vlExisting[key] = [{ name: `VL ${key}`, path: panel.vlUploads[key] }];
          }
        }
        if (panel.vlUploads.videoVl) {
          vlExisting.videoVl = [{ name: 'Video VL', path: panel.vlUploads.videoVl }];
        }
        setExistingFiles(prev => ({ ...prev, vl: vlExisting }));
      }

      if (panel.loadedWeighment) {
        setLoadedWeighment({
          approval: panel.loadedWeighment.approval || "",
          loadingCharges: panel.loadedWeighment.loadingCharges?.toString() || "",
          loadingStaffMunshiyana: panel.loadedWeighment.loadingStaffMunshiyana?.toString() || "",
          otherExpenses: panel.loadedWeighment.otherExpenses?.toString() || "",
          vehicleFloorTarpaulin: panel.loadedWeighment.vehicleFloorTarpaulin?.toString() || "",
          vehicleOuterTarpaulin: panel.loadedWeighment.vehicleOuterTarpaulin?.toString() || "",
        });
        
        if (panel.loadedWeighment.weighSlip) {
          setExistingFiles(prev => ({
            ...prev,
            weighment: {
              weighSlip: [{ name: 'Weigh Slip', path: panel.loadedWeighment.weighSlip }]
            }
          }));
        }
      }

      if (panel.gpsTracking) {
        setGpsTracking({
          driverMobileNumber: panel.gpsTracking.driverMobileNumber || "",
          isTrackingActive: panel.gpsTracking.isTrackingActive || false,
        });
      }

      if (panel.arrivalDetails) {
        setArrivalDetails({
          date: panel.arrivalDetails.date ? new Date(panel.arrivalDetails.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          time: panel.arrivalDetails.time || "",
          outDate: panel.arrivalDetails.outDate ? new Date(panel.arrivalDetails.outDate).toISOString().split('T')[0] : "",
          outTime: panel.arrivalDetails.outTime || "",
        });
      }

    } catch (error) {
      console.error('Error fetching loading panel:', error);
      setApiError(error.message);
      alert(`❌ Failed to load loading panel: ${error.message}`);
    } finally {
      setFetchLoading(false);
    }
  };

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
   * HANDLER FUNCTIONS
   ========================= */
  
  const handleVehiclePhotoSelect = () => {
    if (isReadOnly) return;
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

  const removeVehiclePhoto = (index, isExisting = false) => {
    if (isReadOnly) return;
    if (isExisting) {
      setExistingFiles(prev => ({
        ...prev,
        vehiclePhotos: prev.vehiclePhotos.filter((_, i) => i !== index)
      }));
    } else {
      setVehiclePhotoFiles(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleVehicleSlipSelect = () => {
    if (isReadOnly) return;
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

  const removeVehicleSlip = (index, isExisting = false) => {
    if (isReadOnly) return;
    if (isExisting) {
      setExistingFiles(prev => ({
        ...prev,
        vehicleSlips: prev.vehicleSlips.filter((_, i) => i !== index)
      }));
    } else {
      setVehicleSlipFiles(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleLoadedVehicleSlipSelect = () => {
    if (isReadOnly) return;
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

  const removeLoadedVehicleSlip = (index, isExisting = false) => {
    if (isReadOnly) return;
    if (isExisting) {
      setExistingFiles(prev => ({
        ...prev,
        loadedVehicleSlips: prev.loadedVehicleSlips.filter((_, i) => i !== index)
      }));
    } else {
      setLoadedVehicleSlipFiles(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleHelperFileSelect = (field) => {
    if (isReadOnly) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
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

  const handleVehicleSelect = (vehicle) => {
    if (isReadOnly) return;
    
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
    });

    // Set existing documents
    if (vehicle.rcDocuments && vehicle.rcDocuments.length > 0) {
      setExistingFiles(prev => ({
        ...prev,
        vehicle: { ...prev.vehicle, rc: vehicle.rcDocuments.map(doc => ({ name: 'RC Document', path: doc })) }
      }));
    }
    if (vehicle.panCardDocuments && vehicle.panCardDocuments.length > 0) {
      setExistingFiles(prev => ({
        ...prev,
        vehicle: { ...prev.vehicle, pan: vehicle.panCardDocuments.map(doc => ({ name: 'PAN Document', path: doc })) }
      }));
    }

    alert(`✅ Vehicle ${vehicle.vehicleNumber} loaded successfully`);
  };

  const handleCreateVehicle = () => {
    if (isReadOnly) return;
    router.push('/admin/vehicle2');
  };

  const handleVehicleNegotiationSearch = (query) => {
    if (isReadOnly) return;
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
    if (isReadOnly) return;
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

        // Fetch pack data from order panels
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
                    
                    if (orderPackData['NON-UNIFORM - GENERAL CARGO'] && orderPackData['NON-UNIFORM - GENERAL CARGO'].length > 0) {
                      const newNonUniformRows = orderPackData['NON-UNIFORM - GENERAL CARGO'].map(item => ({
                        _id: uid(),
                        nos: item.nos?.toString() || "",
                        productName: item.productName || "",
                        uom: item.uom || "",
                        length: item.length?.toString() || "",
                        width: item.width?.toString() || "",
                        height: item.height?.toString() || "",
                        actualWt: item.actualWt?.toString() || "",
                        chargedWt: item.chargedWt?.toString() || "",
                      }));
                      mergedPackData['NON-UNIFORM - GENERAL CARGO'] = [...mergedPackData['NON-UNIFORM - GENERAL CARGO'], ...newNonUniformRows];
                    }
                  }
                }
              } catch (err) {
                console.error(`Error fetching order panel:`, err);
              }
            }
          }
        }
        
        if (!packDataFound) {
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
    if (!isReadOnly && !showVehicleNegotiationDropdown) {
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
  const addOrderRow = () => {
    if (!isReadOnly) {
      setOrderRows([...orderRows, defaultOrderRow()]);
    }
  };

  const updateOrderRow = (rowId, key, value) => {
    if (!isReadOnly) {
      setOrderRows((prev) =>
        prev.map((r) => (r._id === rowId ? { ...r, [key]: value } : r))
      );
    }
  };

  const removeOrderRow = (rowId) => {
    if (!isReadOnly) {
      if (orderRows.length > 1) {
        setOrderRows((prev) => prev.filter((r) => r._id !== rowId));
      } else {
        alert("At least one order row is required");
      }
    }
  };

  /** =========================
   * PACK DATA FUNCTIONS
   ========================= */
  const rows = useMemo(() => {
    return packData[activePack] || [];
  }, [packData, activePack]);

  const updatePackRow = (rowId, key, value) => {
    if (!isReadOnly) {
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
    }
  };

  const addPackRow = () => {
    if (!isReadOnly) {
      setPackData((prev) => ({
        ...prev,
        [activePack]: [...prev[activePack], defaultPackRow(activePack)],
      }));
    }
  };

  const removePackRow = (id) => {
    if (!isReadOnly) {
      const currentRows = packData[activePack] || [];
      if (currentRows.length > 1) {
        setPackData((prev) => ({
          ...prev,
          [activePack]: prev[activePack].filter((r) => r._id !== id),
        }));
      } else {
        alert("At least one row is required");
      }
    }
  };

  const duplicatePackRow = (id) => {
    if (!isReadOnly) {
      const row = (packData[activePack] || []).find((r) => r._id === id);
      if (!row) return;
      setPackData((prev) => ({
        ...prev,
        [activePack]: [...prev[activePack], { ...row, _id: uid() }],
      }));
    }
  };

  const toggleUniformMode = (rowId) => {
    if (!isReadOnly) {
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
    }
  };

  const handleBillingTypeChange = (value) => {
    if (!isReadOnly) {
      setHeader((prev) => ({ ...prev, billingType: value }));
    }
  };

  const handleActivateTracking = () => {
    if (isReadOnly) return;
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

  /** =========================
   * HANDLE FILE SELECTION
   ========================= */
  const handleFileSelect = (section, field, isVideo = false) => {
    if (isReadOnly) return;
    
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

  const removeFile = (section, field, index, isExisting = false) => {
    if (isReadOnly) return;
    
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

  // Camera functions
  const startCamera = async () => {
    if (isReadOnly) return;
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

  // Generate LR function
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

  const getTotalVlPhotosCount = () => {
    let total = 0;
    for (let i = 1; i <= Math.max(...vlFields, 5); i++) {
      total += (vlFiles[`vl${i}`]?.length || 0);
      total += (existingFiles.vl?.[`vl${i}`]?.length || 0);
    }
    return total;
  };

  const handleAddMoreVlField = () => {
    if (isReadOnly) return;
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
    if (isReadOnly) return;
    if (fieldNum <= 5) {
      alert("Cannot remove first 5 VL fields (VL-1 to VL-5)");
      return;
    }
    
    const currentCount = (vlFiles[`vl${fieldNum}`]?.length || 0) + (existingFiles.vl?.[`vl${fieldNum}`]?.length || 0);
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
    
    setExistingFiles(prev => ({
      ...prev,
      vl: Object.keys(prev.vl).reduce((acc, key) => {
        if (key !== `vl${fieldNum}`) {
          acc[key] = prev.vl[key];
        }
        return acc;
      }, {})
    }));
    
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
      weighment: {},
      helper: {},
      vehiclePhotos: [],
      vehicleSlips: [],
      loadedVehicleSlips: []
    };

    // Upload vehicle photos
    for (const file of vehiclePhotoFiles) {
      uploadPromises.push(
        uploadFile(file, 'vehicle', 'vehiclePhotos')
          .then(data => {
            if (data.success) {
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

    // Upload vehicle slips
    for (const file of vehicleSlipFiles) {
      uploadPromises.push(
        uploadFile(file, 'weighment', 'vehicleSlip')
          .then(data => {
            if (data.success) {
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

    // Upload loaded vehicle slips
    for (const file of loadedVehicleSlipFiles) {
      uploadPromises.push(
        uploadFile(file, 'weighment', 'loadedVehicleSlip')
          .then(data => {
            if (data.success) {
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

    // Upload helper files
    for (const [field, files] of Object.entries(helperInfo)) {
      if (Array.isArray(files)) {
        for (const file of files) {
          uploadPromises.push(
            uploadFile(file, 'helper', field)
              .then(data => {
                if (data.success) {
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

    // Upload vehicle files (RC, PAN, License, Photo)
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

    // Upload VBP files
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

    // Upload VFT files
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

    // Upload VOT files
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

    // Upload VL files
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

    // Upload weighment files
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

  const handleUpdate = async () => {
    if (isReadOnly) {
      alert("This record is in read-only mode and cannot be edited.");
      return;
    }

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

      // Combine existing and new file paths
      const finalVehicleFiles = {
        rcDocument: vehicleInfo.rcDocument || uploadedPaths.vehicle.rc || (existingFiles.vehicle?.rc?.[0]?.path || ''),
        panDocument: vehicleInfo.panDocument || uploadedPaths.vehicle.pan || (existingFiles.vehicle?.pan?.[0]?.path || ''),
        licenseDocument: vehicleInfo.licenseDocument || uploadedPaths.vehicle.license || (existingFiles.vehicle?.license?.[0]?.path || ''),
        driverPhoto: vehicleInfo.driverPhoto || uploadedPaths.vehicle.photo || (existingFiles.vehicle?.photo?.[0]?.path || ''),
      };

      const finalVbpUploads = {
        ...vbpUploads,
        vbp1: existingFiles.vbp?.vbp1?.[0]?.path || uploadedPaths.vbp.vbp1 || '',
        vbp2: existingFiles.vbp?.vbp2?.[0]?.path || uploadedPaths.vbp.vbp2 || '',
        vbp3: existingFiles.vbp?.vbp3?.[0]?.path || uploadedPaths.vbp.vbp3 || '',
        vbp4: existingFiles.vbp?.vbp4?.[0]?.path || uploadedPaths.vbp.vbp4 || '',
        vbp5: existingFiles.vbp?.vbp5?.[0]?.path || uploadedPaths.vbp.vbp5 || '',
        vbp6: existingFiles.vbp?.vbp6?.[0]?.path || uploadedPaths.vbp.vbp6 || '',
        vbp7: existingFiles.vbp?.vbp7?.[0]?.path || uploadedPaths.vbp.vbp7 || '',
        videoVbp: existingFiles.vbp?.videoVbp?.[0]?.path || uploadedPaths.vbp.videoVbp || '',
      };

      const finalVftUploads = {
        ...vftUploads,
        vft1: existingFiles.vft?.vft1?.[0]?.path || uploadedPaths.vft.vft1 || '',
        vft2: existingFiles.vft?.vft2?.[0]?.path || uploadedPaths.vft.vft2 || '',
        vft3: existingFiles.vft?.vft3?.[0]?.path || uploadedPaths.vft.vft3 || '',
        vft4: existingFiles.vft?.vft4?.[0]?.path || uploadedPaths.vft.vft4 || '',
        vft5: existingFiles.vft?.vft5?.[0]?.path || uploadedPaths.vft.vft5 || '',
        vft6: existingFiles.vft?.vft6?.[0]?.path || uploadedPaths.vft.vft6 || '',
        vft7: existingFiles.vft?.vft7?.[0]?.path || uploadedPaths.vft.vft7 || '',
        videoVft: existingFiles.vft?.videoVft?.[0]?.path || uploadedPaths.vft.videoVft || '',
      };

      const finalVotUploads = {
        ...votUploads,
        vot1: existingFiles.vot?.vot1?.[0]?.path || uploadedPaths.vot.vot1 || '',
        vot2: existingFiles.vot?.vot2?.[0]?.path || uploadedPaths.vot.vot2 || '',
        vot3: existingFiles.vot?.vot3?.[0]?.path || uploadedPaths.vot.vot3 || '',
        vot4: existingFiles.vot?.vot4?.[0]?.path || uploadedPaths.vot.vot4 || '',
        vot5: existingFiles.vot?.vot5?.[0]?.path || uploadedPaths.vot.vot5 || '',
        vot6: existingFiles.vot?.vot6?.[0]?.path || uploadedPaths.vot.vot6 || '',
        vot7: existingFiles.vot?.vot7?.[0]?.path || uploadedPaths.vot.vot7 || '',
        videoVot: existingFiles.vot?.videoVot?.[0]?.path || uploadedPaths.vot.videoVot || '',
      };

      const finalVlUploads = {
        ...vlUploads,
      };
      
      // Add all vl fields up to 15
      for (let i = 1; i <= 15; i++) {
        const key = `vl${i}`;
        finalVlUploads[key] = existingFiles.vl?.[key]?.[0]?.path || uploadedPaths.vl[key] || '';
      }
      finalVlUploads.videoVl = existingFiles.vl?.videoVl?.[0]?.path || uploadedPaths.vl.videoVl || '';

      const finalWeighment = {
        ...loadedWeighment,
        weighSlip: existingFiles.weighment?.weighSlip?.[0]?.path || uploadedPaths.weighment.weighSlip || '',
      };

      const finalVehiclePhotos = [
        ...(existingFiles.vehiclePhotos?.map(p => p.path) || []),
        ...(uploadedPaths.vehiclePhotos || [])
      ];

      const finalVehicleSlips = [
        ...(existingFiles.vehicleSlips?.map(p => p.path) || []),
        ...(uploadedPaths.vehicleSlips || [])
      ];

      const finalLoadedVehicleSlips = [
        ...(existingFiles.loadedVehicleSlips?.map(p => p.path) || []),
        ...(uploadedPaths.loadedVehicleSlips || [])
      ];

      const payload = {
        id: panelId,
        header: {
          ...header,
          vehicleNegotiationNo: vehicleNegotiationNo,
        },
        vehicleInfo: {
          ...vehicleInfo,
          ...finalVehicleFiles,
        },
        orderRows,
        packData,
        deductionRows,
        totalQuantity,
        vbpUploads: finalVbpUploads,
        vftUploads: finalVftUploads,
        votUploads: finalVotUploads,
        vlUploads: finalVlUploads,
        loadedWeighment: finalWeighment,
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
        } : null,
        detentionDays,
        vehiclePhotos: finalVehiclePhotos,
        vehicleSlips: finalVehicleSlips,
        loadedVehicleSlips: finalLoadedVehicleSlips,
        hasHelper,
        helperInfo: {
          name: helperInfo.name,
          mobileNo: helperInfo.mobileNo,
          photo: uploadedPaths.helper?.photo || helperInfo.photo,
          aadharPhoto: uploadedPaths.helper?.aadharPhoto || helperInfo.aadharPhoto
        },
        vlPhotoDetails,
        vlFields
      };

      console.log("Updating loading panel:", payload);

      const res = await fetch('/api/loading-panel', {
        method: 'PUT',
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
      
      alert(`✅ Loading Info updated successfully!\nVehicle Arrival No: ${header.vehicleArrivalNo}`);
      
      setTimeout(() => {
        router.push('/admin/Loading-Info');
      }, 2000);
      
    } catch (error) {
      console.error('Error updating loading info:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading loading panel...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Sticky Top Bar */}
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
                Edit Loading Info: {header.vehicleArrivalNo}
              </div>
              {isReadOnly && (
                <span className="ml-3 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">
                  READ ONLY - Approved/Completed
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
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
            {!isReadOnly && (
              <button
                onClick={handleUpdate}
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
                    {uploading ? 'Uploading...' : 'Updating...'}
                  </span>
                ) : 'Update Loading Info'}
              </button>
            )}
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
            {!isReadOnly && (
              <button 
                onClick={handleVehicleSlipSelect}
                className="w-full rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 border border-slate-300 hover:bg-slate-200 transition flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {vehicleSlipFiles.length > 0 ? `✓ ${vehicleSlipFiles.length} new` : '+ Upload Vehicle Slip'}
              </button>
            )}
            <div className="mt-2">
              {existingFiles.vehicleSlips?.map((file, idx) => (
                <FileUploadItem 
                  key={`existing-vehicleSlip-${idx}`}
                  file={file}
                  index={idx}
                  onRemove={() => removeVehicleSlip(idx, true)}
                  label="Vehicle Slip"
                  isExisting={true}
                  readOnly={isReadOnly}
                />
              ))}
              {vehicleSlipFiles.map((file, idx) => (
                <FileUploadItem 
                  key={`new-vehicleSlip-${idx}`}
                  file={file}
                  index={idx}
                  onRemove={() => removeVehicleSlip(idx)}
                  label="Vehicle Slip"
                  readOnly={isReadOnly}
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
                  className={`mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 pr-8 ${
                    isReadOnly ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'
                  }`}
                  placeholder="Search vehicle negotiation..."
                  readOnly={isReadOnly}
                />
                {vehicleNegotiation.loading && !isReadOnly && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="animate-spin h-4 w-4 text-emerald-500" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </div>
              
              {showVehicleNegotiationDropdown && !isReadOnly && (
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

            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Vehicle Number</label>
              <VehicleSearchDropdown
                onSelect={handleVehicleSelect}
                placeholder="Type to search vehicle..."
                selectedVehicleId={selectedVehicle?._id}
                value={vehicleInfo.vehicleNo}
                readOnly={isReadOnly}
              />
            </div>

            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Mobile Number</label>
              <input
                type="text"
                value={vehicleInfo.driverMobileNo}
                onChange={(e) => !isReadOnly && setVehicleInfo({ ...vehicleInfo, driverMobileNo: e.target.value })}
                readOnly={isReadOnly}
                className={`mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ${
                  isReadOnly ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'
                }`}
                placeholder="Enter mobile number"
              />
            </div>

            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Branch *</label>
              <SearchableDropdown
                items={branches}
                selectedId={header.branch}
                onSelect={(branch) => !isReadOnly && setHeader({ 
                  ...header, 
                  branch: branch?._id || '',
                  branchName: branch?.name || '',
                  branchCode: branch?.code || ''
                })}
                placeholder="Search branch..."
                displayField="name"
                codeField="code"
                disabled={isReadOnly}
              />
            </div>

            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Date</label>
              <input
                type="date"
                value={header.date}
                onChange={(e) => !isReadOnly && setHeader({ ...header, date: e.target.value })}
                readOnly={isReadOnly}
                className={`mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ${
                  isReadOnly ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'
                }`}
              />
            </div>

            <div className="col-span-12 md:col-span-2">
              <Select
                label="Delivery"
                value={header.delivery}
                onChange={(v) => !isReadOnly && setHeader({ ...header, delivery: v })}
                options={DELIVERY_OPTIONS}
                readOnly={isReadOnly}
              />
            </div>

            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Driving Licence</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={vehicleInfo.drivingLicense}
                  onChange={(e) => !isReadOnly && setVehicleInfo({ ...vehicleInfo, drivingLicense: e.target.value })}
                  readOnly={isReadOnly}
                  className={`mt-1 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ${
                    isReadOnly ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'
                  }`}
                  placeholder="Enter License Number"
                />
                {!isReadOnly && (
                  <button 
                    onClick={() => handleFileSelect('vehicle', 'license')}
                    className="mt-1 rounded-lg bg-purple-50 px-3 py-2 text-xs font-bold text-purple-700 border border-purple-200 hover:bg-purple-100 whitespace-nowrap"
                  >
                    {vehicleFiles.license.length > 0 ? `✓ ${vehicleFiles.license.length}` : 'Upload'}
                  </button>
                )}
              </div>
              {existingFiles.vehicle?.license?.map((file, idx) => (
                <FileUploadItem 
                  key={`existing-license-${idx}`}
                  file={file}
                  index={idx}
                  onRemove={() => removeFile('vehicle', 'license', idx, true)}
                  label="License"
                  isExisting={true}
                  readOnly={isReadOnly}
                />
              ))}
              {vehicleFiles.license.map((file, idx) => (
                <FileUploadItem 
                  key={`new-license-${idx}`}
                  file={file}
                  index={idx}
                  onRemove={() => removeFile('vehicle', 'license', idx)}
                  label="License"
                  readOnly={isReadOnly}
                />
              ))}
              <p className="text-xs text-slate-400 mt-1">Upload Driving License (PDF/Image)</p>
            </div>
          </div>
        </Card>

        {/* Billing Type / Charges Table - READ ONLY */}
        <div className="mt-4">
          <Card title="Billing Type / Charges (Read Only)">
            <div className="overflow-auto rounded-xl border border-yellow-300">
              <table className="min-w-full w-full text-sm">
                <thead className="sticky top-0 bg-yellow-400">
                  <tr>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">Billing Type</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">No. of Loading Points</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">No. of Dropping Point</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-yellow-50 even:bg-slate-50">
                    <td className="border border-yellow-300 px-2 py-2">
                      <input
                        type="text"
                        value={header.billingType || ""}
                        readOnly
                        className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm outline-none cursor-not-allowed"
                      />
                    </td>
                    <td className="border border-yellow-300 px-2 py-2">
                      <input
                        type="text"
                        value={header.noOfLoadingPoints || ""}
                        readOnly
                        className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm outline-none cursor-not-allowed"
                      />
                    </td>
                    <td className="border border-yellow-300 px-2 py-2">
                      <input
                        type="text"
                        value={header.noOfDroppingPoint || ""}
                        readOnly
                        className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm outline-none cursor-not-allowed"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Order Details Table - READ ONLY */}
        <div className="mt-4">
          <Card title="Order Details (Read Only)">
            <div className="overflow-auto rounded-xl border border-yellow-300 max-h-[500px] overflow-y-auto">
              <table className="min-w-max w-full text-sm">
                <thead className="sticky top-0 bg-yellow-400 z-10">
                  <tr>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[120px]">Order No</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[150px]">Party Name</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[120px]">Plant</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[100px]">Order Type</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[100px]">Pin Code</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[120px]">From</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[120px]">To</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[120px]">Taluka</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[120px]">District</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[100px]">State</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[80px]">Weight (MT)</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[130px]">Collection Charges</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[140px]">Cancellation Charges</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[130px]">Loading Charges</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[130px]">Other Charges</th>
                  </tr>
                </thead>
                <tbody>
                  {orderRows.map((row, idx) => (
                    <tr key={row._id || idx} className="hover:bg-yellow-50 even:bg-slate-50">
                      <td className="border border-yellow-300 px-2 py-2">
                        <input type="text" value={row.orderNo || ""} readOnly className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm cursor-not-allowed" placeholder="Order No" />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input type="text" value={row.partyName || ""} readOnly className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm cursor-not-allowed" placeholder="Party Name" />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input type="text" value={row.plantName || row.plantCode || ""} readOnly className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm cursor-not-allowed" placeholder="Plant" />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input type="text" value={row.orderType || ""} readOnly className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm cursor-not-allowed" placeholder="Order Type" />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input type="text" value={row.pinCode || ""} readOnly className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm cursor-not-allowed" placeholder="Pin Code" />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input type="text" value={row.fromName || row.from || ""} readOnly className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm cursor-not-allowed" placeholder="From" />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input type="text" value={row.toName || row.to || ""} readOnly className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm cursor-not-allowed" placeholder="To" />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input type="text" value={row.talukaName || row.taluka || ""} readOnly className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm cursor-not-allowed" placeholder="Taluka" />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input type="text" value={row.districtName || row.district || ""} readOnly className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm cursor-not-allowed" placeholder="District" />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input type="text" value={row.stateName || row.state || ""} readOnly className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm cursor-not-allowed" placeholder="State" />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input type="number" value={row.weight || ""} readOnly className="w-24 rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm cursor-not-allowed" placeholder="0" />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input type="text" value={row.collectionCharges || "0"} readOnly className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm cursor-not-allowed" placeholder="Collection Charges" />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input type="text" value={row.cancellationCharges || "Nil"} readOnly className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm cursor-not-allowed" placeholder="Cancellation Charges" />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input type="text" value={row.loadingCharges || "Nil"} readOnly className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm cursor-not-allowed" placeholder="Loading Charges" />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input type="number" value={row.otherCharges || "0"} readOnly className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm cursor-not-allowed" placeholder="Other Charges" />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-yellow-100">
                  <tr>
                    <td colSpan="10" className="border border-yellow-300 px-3 py-2 text-right font-bold">Total Quantity (MT):</td>
                    <td className="border border-yellow-300 px-3 py-2 font-bold">{calculateTotalWeight()}</td>
                    <td colSpan="4" className="border border-yellow-300 px-3 py-2"></td>
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
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">Vehicle Search</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">Vehicle Information</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">Driver Information</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">Message & Remarks</th>
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
                            value={vehicleInfo.vehicleNo}
                            readOnly={isReadOnly}
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
                                  remarks: `Pan Card: ${owner.ownerPanCard || 'N/A'}`
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
                            readOnly={isReadOnly}
                          />
                        </div>
                        
                        {!isReadOnly && (
                          <button
                            onClick={handleCreateVehicle}
                            className="w-full rounded-lg bg-green-600 px-3 py-2 text-xs font-bold text-white hover:bg-green-700 transition"
                          >
                            + Create New Vehicle
                          </button>
                        )}
                        
                        {selectedVehicle && (
                          <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
                            <div className="text-xs font-medium text-green-800">Selected Vehicle:</div>
                            <div className="text-xs text-green-700 mt-1">{selectedVehicle.vehicleNumber}</div>
                            <div className="text-xs text-green-600">Owner: {selectedVehicle.ownerName}</div>
                          </div>
                        )}

                        {/* Vehicle Photos Upload */}
                        <div className="pt-2 border-t border-slate-200">
                          <label className="text-xs font-bold text-slate-600">Vehicle Photos</label>
                          <p className="text-xs text-slate-400 mb-1">Upload vehicle photos (Max 10)</p>
                          {!isReadOnly && (
                            <button 
                              onClick={handleVehiclePhotoSelect}
                              className="w-full rounded-lg bg-cyan-50 px-3 py-2 text-xs font-bold text-cyan-700 border border-cyan-200 hover:bg-cyan-100 transition flex items-center justify-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {vehiclePhotoFiles.length > 0 ? `✓ ${vehiclePhotoFiles.length} new` : '+ Upload Vehicle Photos'}
                            </button>
                          )}
                          <div className="mt-2 max-h-40 overflow-y-auto">
                            {existingFiles.vehiclePhotos?.map((file, idx) => (
                              <FileUploadItem 
                                key={`existing-vehiclePhoto-${idx}`}
                                file={file}
                                index={idx}
                                onRemove={() => removeVehiclePhoto(idx, true)}
                                label={`Vehicle Photo`}
                                isExisting={true}
                                readOnly={isReadOnly}
                              />
                            ))}
                            {vehiclePhotoFiles.map((file, idx) => (
                              <FileUploadItem 
                                key={`new-vehiclePhoto-${idx}`}
                                file={file}
                                index={idx}
                                onRemove={() => removeVehiclePhoto(idx)}
                                label={`Vehicle Photo ${idx + 1}`}
                                readOnly={isReadOnly}
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

                        {/* Insurance Number - READ ONLY */}
                        <div>
                          <label className="text-xs font-bold text-slate-600">Insurance Number</label>
                          <input
                            type="text"
                            value={vehicleInfo.insuranceNumber}
                            readOnly
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed"
                          />
                        </div>

                        {/* Chasis Number - READ ONLY */}
                        <div>
                          <label className="text-xs font-bold text-slate-600">Chasis Number</label>
                          <input
                            type="text"
                            value={vehicleInfo.chasisNumber}
                            readOnly
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed"
                          />
                        </div>

                        {/* Fitness Number - READ ONLY */}
                        <div>
                          <label className="text-xs font-bold text-slate-600">Fitness Number</label>
                          <input
                            type="text"
                            value={vehicleInfo.fitnessNumber}
                            readOnly
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed"
                          />
                        </div>

                        {/* PUC Number - READ ONLY */}
                        <div>
                          <label className="text-xs font-bold text-slate-600">PUC Number</label>
                          <input
                            type="text"
                            value={vehicleInfo.pucNumber}
                            readOnly
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </td>

                    {/* Vehicle Information Column - READ ONLY */}
                    <td className="border border-yellow-300 px-4 py-3 align-top">
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-bold text-slate-600">Vehicle No *</label>
                          <input
                            type="text"
                            value={vehicleInfo.vehicleNo}
                            readOnly
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-600">Vehicle Type</label>
                          <input
                            type="text"
                            value={vehicleInfo.vehicleType}
                            readOnly
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-600">Vehicle Weight (MT)</label>
                          <input
                            type="text"
                            value={vehicleInfo.vehicleWeight}
                            readOnly
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-600">Vehicle Owner RC</label>
                          <input
                            type="text"
                            value={vehicleInfo.vehicleOwnerRC}
                            readOnly
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-600">Vehicle Owner Name</label>
                          <input
                            type="text"
                            value={vehicleInfo.vehicleOwnerName}
                            readOnly
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-600">Owner Pan Card</label>
                          <input
                            type="text"
                            value={vehicleInfo.ownerPanCard}
                            readOnly
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs font-bold text-slate-600">Owner RC Doc</label>
                            {!isReadOnly && (
                              <button 
                                onClick={() => handleFileSelect('vehicle', 'rc')}
                                className="mt-1 w-full rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 border border-blue-200 hover:bg-blue-100"
                              >
                                {vehicleFiles.rc.length > 0 ? `✓ ${vehicleFiles.rc.length} new` : '+ Select'}
                              </button>
                            )}
                            {existingFiles.vehicle?.rc?.map((file, idx) => (
                              <FileUploadItem 
                                key={`existing-rc-${idx}`}
                                file={file}
                                index={idx}
                                onRemove={() => removeFile('vehicle', 'rc', idx, true)}
                                label="RC"
                                isExisting={true}
                                readOnly={isReadOnly}
                              />
                            ))}
                            {vehicleFiles.rc.map((file, idx) => (
                              <FileUploadItem 
                                key={`new-rc-${idx}`}
                                file={file}
                                index={idx}
                                onRemove={() => removeFile('vehicle', 'rc', idx)}
                                label="RC"
                                readOnly={isReadOnly}
                              />
                            ))}
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-600">Owner Pan Doc</label>
                            {!isReadOnly && (
                              <button 
                                onClick={() => handleFileSelect('vehicle', 'pan')}
                                className="mt-1 w-full rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 border border-blue-200 hover:bg-blue-100"
                              >
                                {vehicleFiles.pan.length > 0 ? `✓ ${vehicleFiles.pan.length} new` : '+ Select'}
                              </button>
                            )}
                            {existingFiles.vehicle?.pan?.map((file, idx) => (
                              <FileUploadItem 
                                key={`existing-pan-${idx}`}
                                file={file}
                                index={idx}
                                onRemove={() => removeFile('vehicle', 'pan', idx, true)}
                                label="PAN"
                                isExisting={true}
                                readOnly={isReadOnly}
                              />
                            ))}
                            {vehicleFiles.pan.map((file, idx) => (
                              <FileUploadItem 
                                key={`new-pan-${idx}`}
                                file={file}
                                index={idx}
                                onRemove={() => removeFile('vehicle', 'pan', idx)}
                                label="PAN"
                                readOnly={isReadOnly}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center mt-2">
                          <input
                            type="checkbox"
                            id="verified"
                            checked={vehicleInfo.verified}
                            disabled={isReadOnly}
                            className={`rounded border-slate-300 text-sky-600 focus:ring-sky-500 ${
                              isReadOnly ? 'cursor-not-allowed opacity-50' : ''
                            }`}
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
                            onChange={(e) => !isReadOnly && setVehicleInfo({ ...vehicleInfo, driverName: e.target.value })}
                            readOnly={isReadOnly}
                            className={`mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ${
                              isReadOnly ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'
                            }`}
                            placeholder="Enter driver name"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-600">Driver Mobile No</label>
                          <input
                            type="text"
                            value={vehicleInfo.driverMobileNo}
                            onChange={(e) => !isReadOnly && setVehicleInfo({ ...vehicleInfo, driverMobileNo: e.target.value })}
                            readOnly={isReadOnly}
                            className={`mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ${
                              isReadOnly ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'
                            }`}
                            placeholder="Enter mobile number"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-600">Driving License No</label>
                          <input
                            type="text"
                            value={vehicleInfo.drivingLicense}
                            onChange={(e) => !isReadOnly && setVehicleInfo({ ...vehicleInfo, drivingLicense: e.target.value })}
                            readOnly={isReadOnly}
                            className={`mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ${
                              isReadOnly ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'
                            }`}
                            placeholder="License No"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-600">Driver Photo</label>
                          {!isReadOnly && (
                            <button 
                              onClick={() => handleFileSelect('vehicle', 'photo')}
                              className="mt-1 w-full rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 border border-blue-200 hover:bg-blue-100"
                            >
                              {vehicleFiles.photo.length > 0 ? `✓ ${vehicleFiles.photo.length} new` : '+ Select'}
                            </button>
                          )}
                          {existingFiles.vehicle?.photo?.map((file, idx) => (
                            <FileUploadItem 
                              key={`existing-photo-${idx}`}
                              file={file}
                              index={idx}
                              onRemove={() => removeFile('vehicle', 'photo', idx, true)}
                              label="Photo"
                              isExisting={true}
                              readOnly={isReadOnly}
                            />
                          ))}
                          {vehicleFiles.photo.map((file, idx) => (
                            <FileUploadItem 
                              key={`new-photo-${idx}`}
                              file={file}
                              index={idx}
                              onRemove={() => removeFile('vehicle', 'photo', idx)}
                              label="Photo"
                              readOnly={isReadOnly}
                            />
                          ))}
                        </div>

                        {/* Helper Section */}
                        <div className="pt-3 border-t border-slate-200">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={hasHelper}
                              onChange={(e) => !isReadOnly && setHasHelper(e.target.checked)}
                              disabled={isReadOnly}
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
                                onChange={(e) => !isReadOnly && setHelperInfo({ ...helperInfo, name: e.target.value })}
                                readOnly={isReadOnly}
                                className={`mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ${
                                  isReadOnly ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'
                                }`}
                                placeholder="Enter helper name"
                              />
                            </div>

                            <div>
                              <label className="text-xs font-bold text-slate-600">Helper Mobile Number</label>
                              <input
                                type="tel"
                                value={helperInfo.mobileNo}
                                onChange={(e) => !isReadOnly && setHelperInfo({ ...helperInfo, mobileNo: e.target.value })}
                                readOnly={isReadOnly}
                                className={`mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ${
                                  isReadOnly ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'
                                }`}
                                placeholder="Enter mobile number"
                              />
                            </div>

                            <div>
                              <label className="text-xs font-bold text-slate-600">Helper Photo</label>
                              {!isReadOnly && (
                                <button 
                                  onClick={() => handleHelperFileSelect('photo')}
                                  className="mt-1 w-full rounded-lg bg-green-50 px-3 py-2 text-xs font-bold text-green-700 border border-green-200 hover:bg-green-100"
                                >
                                  {helperInfo.photo.length > 0 ? `✓ ${helperInfo.photo.length} file(s)` : '+ Upload Photo'}
                                </button>
                              )}
                              {helperInfo.photo.map((file, idx) => (
                                <FileUploadItem 
                                  key={`helper-photo-${idx}`}
                                  file={file}
                                  index={idx}
                                  onRemove={() => removeFile('helper', 'photo', idx)}
                                  label="Helper Photo"
                                  readOnly={isReadOnly}
                                />
                              ))}
                            </div>

                            <div>
                              <label className="text-xs font-bold text-slate-600">Helper Aadhar Photo</label>
                              {!isReadOnly && (
                                <button 
                                  onClick={() => handleHelperFileSelect('aadharPhoto')}
                                  className="mt-1 w-full rounded-lg bg-purple-50 px-3 py-2 text-xs font-bold text-purple-700 border border-purple-200 hover:bg-purple-100"
                                >
                                  {helperInfo.aadharPhoto.length > 0 ? `✓ ${helperInfo.aadharPhoto.length} file(s)` : '+ Upload Aadhar'}
                                </button>
                              )}
                              {helperInfo.aadharPhoto.map((file, idx) => (
                                <FileUploadItem 
                                  key={`helper-aadhar-${idx}`}
                                  file={file}
                                  index={idx}
                                  onRemove={() => removeFile('helper', 'aadharPhoto', idx)}
                                  label="Helper Aadhar"
                                  readOnly={isReadOnly}
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
                            onChange={(e) => !isReadOnly && setVehicleInfo({ ...vehicleInfo, message: e.target.value })}
                            readOnly={isReadOnly}
                            rows={3}
                            className={`mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ${
                              isReadOnly ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'
                            }`}
                            placeholder="Enter message"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-600">Remarks</label>
                          <textarea
                            value={vehicleInfo.remarks}
                            onChange={(e) => !isReadOnly && setVehicleInfo({ ...vehicleInfo, remarks: e.target.value })}
                            readOnly={isReadOnly}
                            rows={4}
                            className={`mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ${
                              isReadOnly ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'
                            }`}
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

        {/* Pack Type Section - READ ONLY */}
        <div className="mt-4">
          <Card title="Pack Type (Read Only)">
            <div className="mb-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="text-sm font-bold text-slate-700">Select Pack Type:</div>
                <select
                  value={activePack}
                  onChange={(e) => setActivePack(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                >
                  {PACK_TYPES.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.label} ({packData[p.key]?.length || 0} rows)
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <PackTypeTable
              key={activePack}
              packType={activePack}
              rows={rows}
              onChange={updatePackRow}
              onRemove={removePackRow}
              onDuplicate={duplicatePackRow}
              onToggleUniform={toggleUniformMode}
              readOnly={true}
            />
          </Card>
        </div>

        {/* VBP Panel */}
        <div className="mt-4">
          <Card title="VBP - PANEL (Vehicle Body Pictures)">
            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
              <div className="grid grid-cols-8 gap-3">
                {[1,2,3,4,5,6,7].map((num) => (
                  <div key={num} className="col-span-1">
                    <div className="text-xs font-bold text-slate-600 mb-1">VBP - {num}</div>
                    {!isReadOnly && (
                      <button 
                        onClick={() => handleFileSelect('vbp', `vbp${num}`)}
                        className={`w-full rounded-lg px-2 py-3 text-xs font-bold border hover:bg-opacity-80 ${
                          vbpFiles[`vbp${num}`].length > 0 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : existingFiles.vbp?.[`vbp${num}`]?.length > 0
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        {vbpFiles[`vbp${num}`].length > 0 
                          ? `✓ ${vbpFiles[`vbp${num}`].length} new` 
                          : existingFiles.vbp?.[`vbp${num}`]?.length > 0
                            ? '✓ Existing'
                            : 'Select'}
                      </button>
                    )}
                    {existingFiles.vbp?.[`vbp${num}`]?.map((file, idx) => (
                      <FileUploadItem 
                        key={`existing-vbp${num}-${idx}`}
                        file={file}
                        index={idx}
                        onRemove={() => removeFile('vbp', `vbp${num}`, idx, true)}
                        label={`VBP-${num}`}
                        isExisting={true}
                        readOnly={isReadOnly}
                      />
                    ))}
                    {vbpFiles[`vbp${num}`].map((file, idx) => (
                      <FileUploadItem 
                        key={`new-vbp${num}-${idx}`}
                        file={file}
                        index={idx}
                        onRemove={() => removeFile('vbp', `vbp${num}`, idx)}
                        label={`VBP-${num}`}
                        readOnly={isReadOnly}
                      />
                    ))}
                  </div>
                ))}
                <div className="col-span-1">
                  <div className="text-xs font-bold text-slate-600 mb-1">Video - VBP</div>
                  {!isReadOnly && (
                    <button 
                      onClick={() => handleFileSelect('vbp', 'videoVbp', true)}
                      className={`w-full rounded-lg px-2 py-3 text-xs font-bold border hover:bg-opacity-80 ${
                        vbpFiles.videoVbp.length > 0 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : existingFiles.vbp?.videoVbp?.length > 0
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}
                    >
                      {vbpFiles.videoVbp.length > 0 
                        ? `✓ ${vbpFiles.videoVbp.length} new` 
                        : existingFiles.vbp?.videoVbp?.length > 0
                          ? '✓ Existing'
                          : 'Select'}
                    </button>
                  )}
                  {existingFiles.vbp?.videoVbp?.map((file, idx) => (
                    <FileUploadItem 
                      key={`existing-videoVbp-${idx}`}
                      file={file}
                      index={idx}
                      onRemove={() => removeFile('vbp', 'videoVbp', idx, true)}
                      label="Video"
                      isExisting={true}
                      readOnly={isReadOnly}
                    />
                  ))}
                  {vbpFiles.videoVbp.map((file, idx) => (
                    <FileUploadItem 
                      key={`new-videoVbp-${idx}`}
                      file={file}
                      index={idx}
                      onRemove={() => removeFile('vbp', 'videoVbp', idx)}
                      label="Video"
                      readOnly={isReadOnly}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-600">Approval:</span>
                  <span className={`text-sm px-3 py-1 rounded-full ${vbpUploads.approval === 'Approved' ? 'bg-green-100 text-green-800' : vbpUploads.approval === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
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
          </Card>
        </div>

        {/* VFT Panel */}
        <div className="mt-4">
          <Card title="VFT - PANEL (Vehicle Floor Tarpaulin Pictures)">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="grid grid-cols-8 gap-3">
                {[1,2,3,4,5,6,7].map((num) => (
                  <div key={num} className="col-span-1">
                    <div className="text-xs font-bold text-slate-600 mb-1">VFT - {num}</div>
                    {!isReadOnly && (
                      <button 
                        onClick={() => handleFileSelect('vft', `vft${num}`)}
                        className={`w-full rounded-lg px-2 py-3 text-xs font-bold border hover:bg-opacity-80 ${
                          vftFiles[`vft${num}`].length > 0 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : existingFiles.vft?.[`vft${num}`]?.length > 0
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        {vftFiles[`vft${num}`].length > 0 
                          ? `✓ ${vftFiles[`vft${num}`].length} new` 
                          : existingFiles.vft?.[`vft${num}`]?.length > 0
                            ? '✓ Existing'
                            : 'Select'}
                      </button>
                    )}
                    {existingFiles.vft?.[`vft${num}`]?.map((file, idx) => (
                      <FileUploadItem 
                        key={`existing-vft${num}-${idx}`}
                        file={file}
                        index={idx}
                        onRemove={() => removeFile('vft', `vft${num}`, idx, true)}
                        label={`VFT-${num}`}
                        isExisting={true}
                        readOnly={isReadOnly}
                      />
                    ))}
                    {vftFiles[`vft${num}`].map((file, idx) => (
                      <FileUploadItem 
                        key={`new-vft${num}-${idx}`}
                        file={file}
                        index={idx}
                        onRemove={() => removeFile('vft', `vft${num}`, idx)}
                        label={`VFT-${num}`}
                        readOnly={isReadOnly}
                      />
                    ))}
                  </div>
                ))}
                <div className="col-span-1">
                  <div className="text-xs font-bold text-slate-600 mb-1">Video - VFT</div>
                  {!isReadOnly && (
                    <button 
                      onClick={() => handleFileSelect('vft', 'videoVft', true)}
                      className={`w-full rounded-lg px-2 py-3 text-xs font-bold border hover:bg-opacity-80 ${
                        vftFiles.videoVft.length > 0 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : existingFiles.vft?.videoVft?.length > 0
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}
                    >
                      {vftFiles.videoVft.length > 0 
                        ? `✓ ${vftFiles.videoVft.length} new` 
                        : existingFiles.vft?.videoVft?.length > 0
                          ? '✓ Existing'
                          : 'Select'}
                    </button>
                  )}
                  {existingFiles.vft?.videoVft?.map((file, idx) => (
                    <FileUploadItem 
                      key={`existing-videoVft-${idx}`}
                      file={file}
                      index={idx}
                      onRemove={() => removeFile('vft', 'videoVft', idx, true)}
                      label="Video"
                      isExisting={true}
                      readOnly={isReadOnly}
                    />
                  ))}
                  {vftFiles.videoVft.map((file, idx) => (
                    <FileUploadItem 
                      key={`new-videoVft-${idx}`}
                      file={file}
                      index={idx}
                      onRemove={() => removeFile('vft', 'videoVft', idx)}
                      label="Video"
                      readOnly={isReadOnly}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <span className="text-xs font-bold text-slate-600">Vehicle - Floor Tarpaulin Approval:</span>
                <span className={`text-sm px-3 py-1 rounded-full ${vftUploads.approval === 'Approved' ? 'bg-green-100 text-green-800' : vftUploads.approval === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {vftUploads.approval || 'Not Set'}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* VOT Panel */}
        <div className="mt-4">
          <Card title="VOT - PANEL (Vehicle Outer Tarpaulin Pictures)">
            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
              <div className="grid grid-cols-8 gap-3">
                {[1,2,3,4,5,6,7].map((num) => (
                  <div key={num} className="col-span-1">
                    <div className="text-xs font-bold text-slate-600 mb-1">VOT - {num}</div>
                    {!isReadOnly && (
                      <button 
                        onClick={() => handleFileSelect('vot', `vot${num}`)}
                        className={`w-full rounded-lg px-2 py-3 text-xs font-bold border hover:bg-opacity-80 ${
                          votFiles[`vot${num}`].length > 0 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : existingFiles.vot?.[`vot${num}`]?.length > 0
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        {votFiles[`vot${num}`].length > 0 
                          ? `✓ ${votFiles[`vot${num}`].length} new` 
                          : existingFiles.vot?.[`vot${num}`]?.length > 0
                            ? '✓ Existing'
                            : 'Select'}
                      </button>
                    )}
                    {existingFiles.vot?.[`vot${num}`]?.map((file, idx) => (
                      <FileUploadItem 
                        key={`existing-vot${num}-${idx}`}
                        file={file}
                        index={idx}
                        onRemove={() => removeFile('vot', `vot${num}`, idx, true)}
                        label={`VOT-${num}`}
                        isExisting={true}
                        readOnly={isReadOnly}
                      />
                    ))}
                    {votFiles[`vot${num}`].map((file, idx) => (
                      <FileUploadItem 
                        key={`new-vot${num}-${idx}`}
                        file={file}
                        index={idx}
                        onRemove={() => removeFile('vot', `vot${num}`, idx)}
                        label={`VOT-${num}`}
                        readOnly={isReadOnly}
                      />
                    ))}
                  </div>
                ))}
                <div className="col-span-1">
                  <div className="text-xs font-bold text-slate-600 mb-1">Video - VOT</div>
                  {!isReadOnly && (
                    <button 
                      onClick={() => handleFileSelect('vot', 'videoVot', true)}
                      className={`w-full rounded-lg px-2 py-3 text-xs font-bold border hover:bg-opacity-80 ${
                        votFiles.videoVot.length > 0 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : existingFiles.vot?.videoVot?.length > 0
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}
                    >
                      {votFiles.videoVot.length > 0 
                        ? `✓ ${votFiles.videoVot.length} new` 
                        : existingFiles.vot?.videoVot?.length > 0
                          ? '✓ Existing'
                          : 'Select'}
                    </button>
                  )}
                  {existingFiles.vot?.videoVot?.map((file, idx) => (
                    <FileUploadItem 
                      key={`existing-videoVot-${idx}`}
                      file={file}
                      index={idx}
                      onRemove={() => removeFile('vot', 'videoVot', idx, true)}
                      label="Video"
                      isExisting={true}
                      readOnly={isReadOnly}
                    />
                  ))}
                  {votFiles.videoVot.map((file, idx) => (
                    <FileUploadItem 
                      key={`new-videoVot-${idx}`}
                      file={file}
                      index={idx}
                      onRemove={() => removeFile('vot', 'videoVot', idx)}
                      label="Video"
                      readOnly={isReadOnly}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <span className="text-xs font-bold text-slate-600">Vehicle - Outer Tarpaulin Approval:</span>
                <span className={`text-sm px-3 py-1 rounded-full ${votUploads.approval === 'Approved' ? 'bg-green-100 text-green-800' : votUploads.approval === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {votUploads.approval || 'Not Set'}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* VL Panel with Dynamic Fields */}
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
                  {!isReadOnly && vlFields.length < 15 && getTotalVlPhotosCount() < 25 && (
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
                  const currentCount = (vlFiles[`vl${fieldNum}`]?.length || 0) + (existingFiles.vl?.[`vl${fieldNum}`]?.length || 0);
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
                            {!isReadOnly && fieldNum > 5 && (
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
                          disabled={isDisabled || isReadOnly}
                          className={`w-full rounded-lg py-2.5 text-sm font-bold border transition-all ${
                            currentCount > 0 
                              ? 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100' 
                              : isDisabled 
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                : isReadOnly
                                  ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
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

                        {/* Existing VL files */}
                        {existingFiles.vl?.[`vl${fieldNum}`]?.map((file, idx) => (
                          <div key={`existing-vl-${fieldNum}-${idx}`} className="mt-2">
                            <FileUploadItem 
                              file={file}
                              index={idx}
                              onRemove={() => removeFile('vl', `vl${fieldNum}`, idx, true)}
                              label={`VL(stack)-${fieldNum}`}
                              isExisting={true}
                              readOnly={isReadOnly}
                            />
                            {/* Height, Width, Nose inputs for existing files */}
                            <div className="grid grid-cols-3 gap-2 mt-2">
                              <div>
                                <label className="text-xs font-bold text-slate-600">Height (ft)</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={vlPhotoDetails[`vl${fieldNum}_${idx}_height`] || ""}
                                  onChange={(e) => !isReadOnly && setVlPhotoDetails(prev => ({
                                    ...prev,
                                    [`vl${fieldNum}_${idx}_height`]: e.target.value
                                  }))}
                                  readOnly={isReadOnly}
                                  className={`mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-emerald-500 ${
                                    isReadOnly ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'
                                  }`}
                                  placeholder="Height in ft"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-bold text-slate-600">Width (ft)</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={vlPhotoDetails[`vl${fieldNum}_${idx}_width`] || ""}
                                  onChange={(e) => !isReadOnly && setVlPhotoDetails(prev => ({
                                    ...prev,
                                    [`vl${fieldNum}_${idx}_width`]: e.target.value
                                  }))}
                                  readOnly={isReadOnly}
                                  className={`mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-emerald-500 ${
                                    isReadOnly ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'
                                  }`}
                                  placeholder="Width in ft"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-bold text-slate-600">Nose (ft)</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={vlPhotoDetails[`vl${fieldNum}_${idx}_nose`] || ""}
                                  onChange={(e) => !isReadOnly && setVlPhotoDetails(prev => ({
                                    ...prev,
                                    [`vl${fieldNum}_${idx}_nose`]: e.target.value
                                  }))}
                                  readOnly={isReadOnly}
                                  className={`mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-emerald-500 ${
                                    isReadOnly ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'
                                  }`}
                                  placeholder="Nose in ft"
                                />
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* New VL files with height, width, nose inputs */}
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
                                  readOnly={isReadOnly}
                                />
                                
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                  <div>
                                    <label className="text-xs font-bold text-slate-600">Height (ft)</label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={vlPhotoDetails[`vl${fieldNum}_${fileIdx}_height`] || ""}
                                      onChange={(e) => !isReadOnly && setVlPhotoDetails(prev => ({
                                        ...prev,
                                        [`vl${fieldNum}_${fileIdx}_height`]: e.target.value
                                      }))}
                                      readOnly={isReadOnly}
                                      className={`mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-emerald-500 ${
                                        isReadOnly ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'
                                      }`}
                                      placeholder="Height in ft"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs font-bold text-slate-600">Width (ft)</label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={vlPhotoDetails[`vl${fieldNum}_${fileIdx}_width`] || ""}
                                      onChange={(e) => !isReadOnly && setVlPhotoDetails(prev => ({
                                        ...prev,
                                        [`vl${fieldNum}_${fileIdx}_width`]: e.target.value
                                      }))}
                                      readOnly={isReadOnly}
                                      className={`mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-emerald-500 ${
                                        isReadOnly ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'
                                      }`}
                                      placeholder="Width in ft"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs font-bold text-slate-600">Nose (ft)</label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={vlPhotoDetails[`vl${fieldNum}_${fileIdx}_nose`] || ""}
                                      onChange={(e) => !isReadOnly && setVlPhotoDetails(prev => ({
                                        ...prev,
                                        [`vl${fieldNum}_${fileIdx}_nose`]: e.target.value
                                      }))}
                                      readOnly={isReadOnly}
                                      className={`mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-emerald-500 ${
                                        isReadOnly ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'
                                      }`}
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
                    {!isReadOnly && (
                      <button 
                        onClick={() => handleFileSelect('vl', 'videoVl', true)}
                        className={`rounded-lg px-4 py-2 text-xs font-bold border hover:bg-opacity-80 ${
                          vlFiles.videoVl && vlFiles.videoVl.length > 0
                            ? 'bg-green-50 text-green-700 border-green-300' 
                            : existingFiles.vl?.videoVl?.length > 0
                              ? 'bg-blue-50 text-blue-700 border-blue-300'
                              : 'bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200'
                        }`}
                      >
                        {vlFiles.videoVl && vlFiles.videoVl.length > 0 
                          ? `✓ ${vlFiles.videoVl.length} new` 
                          : existingFiles.vl?.videoVl?.length > 0
                            ? '✓ Existing'
                            : '+ Upload Video'}
                      </button>
                    )}
                  </div>
                  {existingFiles.vl?.videoVl?.map((file, idx) => (
                    <FileUploadItem 
                      key={`existing-videoVl-${idx}`}
                      file={file}
                      index={idx}
                      onRemove={() => removeFile('vl', 'videoVl', idx, true)}
                      label="Video"
                      isExisting={true}
                      readOnly={isReadOnly}
                    />
                  ))}
                  {vlFiles.videoVl && vlFiles.videoVl.map((file, idx) => (
                    <FileUploadItem 
                      key={`new-videoVl-${idx}`}
                      file={file}
                      index={idx}
                      onRemove={() => removeFile('vl', 'videoVl', idx)}
                      label="Video"
                      readOnly={isReadOnly}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <span className="text-xs font-bold text-slate-600">Vehicle - Loading Approval:</span>
                <span className={`text-sm px-3 py-1 rounded-full ${vlUploads.approval === 'Approved' ? 'bg-green-100 text-green-800' : vlUploads.approval === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {vlUploads.approval || 'Not Set'}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-xs font-bold text-slate-600">Loading Status:</span>
                <span className={`text-sm px-3 py-1 rounded-full ${vlUploads.loadingStatus === 'Loaded' ? 'bg-green-100 text-green-800' : vlUploads.loadingStatus === 'Partially Loaded' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
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

        {/* Loaded Vehicle Weighment & Charges */}
        <div className="mt-4">
          <Card title="Loaded Vehicle Weighment & Charges">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Weighment & Approval</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600">Loaded Vehicle - Weigh Slip:</span>
                      {!isReadOnly && (
                        <button 
                          onClick={() => handleFileSelect('weighment', 'weighSlip')}
                          className={`rounded-lg px-4 py-2 text-xs font-bold border hover:bg-opacity-80 ${
                            weighmentFiles.weighSlip.length > 0 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : existingFiles.weighment?.weighSlip?.length > 0
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-gray-50 text-gray-700 border-gray-200'
                          }`}
                        >
                          {weighmentFiles.weighSlip.length > 0 
                            ? `✓ ${weighmentFiles.weighSlip.length} new` 
                            : existingFiles.weighment?.weighSlip?.length > 0
                              ? '✓ Existing'
                              : 'Select'}
                        </button>
                      )}
                    </div>
                    {existingFiles.weighment?.weighSlip?.map((file, idx) => (
                      <FileUploadItem 
                        key={`existing-weighSlip-${idx}`}
                        file={file}
                        index={idx}
                        onRemove={() => removeFile('weighment', 'weighSlip', idx, true)}
                        label="Weigh Slip"
                        isExisting={true}
                        readOnly={isReadOnly}
                      />
                    ))}
                    {weighmentFiles.weighSlip.map((file, idx) => (
                      <FileUploadItem 
                        key={`new-weighSlip-${idx}`}
                        file={file}
                        index={idx}
                        onRemove={() => removeFile('weighment', 'weighSlip', idx)}
                        label="Weigh Slip"
                        readOnly={isReadOnly}
                      />
                    ))}
                    
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-600">Approval:</span>
                      <span className={`text-sm px-3 py-1 rounded-full ${loadedWeighment.approval === 'Approved' ? 'bg-green-100 text-green-800' : loadedWeighment.approval === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {loadedWeighment.approval || 'Not Set'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Detention Days */}
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 mt-4">
                  <label className="text-xs font-bold text-orange-700">Detention Days</label>
                  <input
                    type="number"
                    value={detentionDays}
                    onChange={(e) => !isReadOnly && setDetentionDays(e.target.value)}
                    readOnly={isReadOnly}
                    className={`mt-1 w-full rounded-lg border border-orange-200 px-3 py-2 text-sm outline-none ${
                      isReadOnly ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'
                    }`}
                    placeholder="Enter number of detention days"
                    min="0"
                  />
                  <p className="text-xs text-orange-600 mt-1">Number of days vehicle is detained</p>
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
                        onChange={(e) => !isReadOnly && setLoadedWeighment({ ...loadedWeighment, loadingCharges: e.target.value })}
                        readOnly={isReadOnly}
                        className={`w-32 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-right ${
                          isReadOnly ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'
                        }`}
                        placeholder="0"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-700">Loading Staff Munshiyana:</span>
                      <input
                        type="number"
                        value={loadedWeighment.loadingStaffMunshiyana}
                        onChange={(e) => !isReadOnly && setLoadedWeighment({ ...loadedWeighment, loadingStaffMunshiyana: e.target.value })}
                        readOnly={isReadOnly}
                        className={`w-32 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-right ${
                          isReadOnly ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'
                        }`}
                        placeholder="0"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-700">Other Expenses:</span>
                      <input
                        type="number"
                        value={loadedWeighment.otherExpenses}
                        onChange={(e) => !isReadOnly && setLoadedWeighment({ ...loadedWeighment, otherExpenses: e.target.value })}
                        readOnly={isReadOnly}
                        className={`w-32 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-right ${
                          isReadOnly ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'
                        }`}
                        placeholder="0"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-700">Vehicle - Floor Tarpaulin:</span>
                      <input
                        type="number"
                        value={loadedWeighment.vehicleFloorTarpaulin}
                        onChange={(e) => !isReadOnly && setLoadedWeighment({ ...loadedWeighment, vehicleFloorTarpaulin: e.target.value })}
                        readOnly={isReadOnly}
                        className={`w-32 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-right ${
                          isReadOnly ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'
                        }`}
                        placeholder="0"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-700">Vehicle - Outer Tarpaulin:</span>
                      <input
                        type="number"
                        value={loadedWeighment.vehicleOuterTarpaulin}
                        onChange={(e) => !isReadOnly && setLoadedWeighment({ ...loadedWeighment, vehicleOuterTarpaulin: e.target.value })}
                        readOnly={isReadOnly}
                        className={`w-32 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-right ${
                          isReadOnly ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'
                        }`}
                        placeholder="0"
                      />
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 mt-2">
                      <span className="text-sm font-bold text-slate-800">Total:</span>
                      <span className="font-bold text-orange-700 text-lg">
                        ₹{calculateTotalCharges().toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Arrival Details with Out Date and Out Time */}
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
                        onChange={(e) => !isReadOnly && setArrivalDetails({ ...arrivalDetails, date: e.target.value })}
                        readOnly={isReadOnly}
                        className={`mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ${
                          isReadOnly ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'
                        }`}
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
                        onChange={(e) => !isReadOnly && setArrivalDetails({ ...arrivalDetails, time: e.target.value })}
                        readOnly={isReadOnly}
                        className={`mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ${
                          isReadOnly ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'
                        }`}
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
                        onChange={(e) => !isReadOnly && setArrivalDetails({ ...arrivalDetails, outDate: e.target.value })}
                        readOnly={isReadOnly}
                        className={`mt-1 w-full rounded-lg border border-orange-200 px-3 py-2 text-sm outline-none ${
                          isReadOnly ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'
                        }`}
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
                        onChange={(e) => !isReadOnly && setArrivalDetails({ ...arrivalDetails, outTime: e.target.value })}
                        readOnly={isReadOnly}
                        className={`mt-1 w-full rounded-lg border border-orange-200 px-3 py-2 text-sm outline-none ${
                          isReadOnly ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'
                        }`}
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

        {/* Vehicle GPS Tracking & Driver Photo */}
        <div className="mt-4">
          <Card title="Vehicle GPS Tracking & Driver Photo">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
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
                        onChange={(e) => !isReadOnly && setGpsTracking({ ...gpsTracking, driverMobileNumber: e.target.value })}
                        readOnly={isReadOnly}
                        className={`rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 ${
                          isReadOnly ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'
                        }`}
                      />
                      {!isReadOnly && (
                        <button 
                          onClick={handleActivateTracking}
                          className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
                        >
                          {gpsTracking.isTrackingActive ? 'Tracking Active' : 'Activate Tracking'}
                        </button>
                      )}
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
              </div>

              <div className="col-span-12 md:col-span-6">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 h-full">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Driver Photo Capture</h3>
                      <p className="text-xs text-slate-600 mt-1">Click to open camera and capture driver photo</p>
                      <p className="text-xs text-green-600 mt-1">📸 Photo capture will auto-fill Arrival Date & Time</p>
                    </div>
                    {!isReadOnly && (
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
                    )}
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
                          readOnly={isReadOnly}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Documents Section */}
        <div className="mt-4">
          <Card title="Documents & Consignment Note (LR)">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-800 mb-2">Consignment Note (LR)</h3>
                  {!isReadOnly && (
                    <button 
                      onClick={handleGenerateLR}
                      className="w-full rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
                    >
                      Generate LR
                    </button>
                  )}
                  {isReadOnly && (
                    <button className="w-full rounded-lg bg-gray-400 px-4 py-2 text-xs font-bold text-white cursor-not-allowed" disabled>
                      Generate LR
                    </button>
                  )}
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
            {!isReadOnly && (
              <button 
                onClick={handleLoadedVehicleSlipSelect}
                className="w-full rounded-lg bg-indigo-100 px-3 py-2 text-xs font-bold text-indigo-700 border border-indigo-300 hover:bg-indigo-200 transition flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {loadedVehicleSlipFiles.length > 0 ? `✓ ${loadedVehicleSlipFiles.length} new` : '+ Upload Loaded Vehicle Slip'}
              </button>
            )}
            <div className="mt-2">
              {existingFiles.loadedVehicleSlips?.map((file, idx) => (
                <FileUploadItem 
                  key={`existing-loadedSlip-${idx}`}
                  file={file}
                  index={idx}
                  onRemove={() => removeLoadedVehicleSlip(idx, true)}
                  label="Loaded Vehicle Slip"
                  isExisting={true}
                  readOnly={isReadOnly}
                />
              ))}
              {loadedVehicleSlipFiles.map((file, idx) => (
                <FileUploadItem 
                  key={`new-loadedSlip-${idx}`}
                  file={file}
                  index={idx}
                  onRemove={() => removeLoadedVehicleSlip(idx)}
                  label="Loaded Vehicle Slip"
                  readOnly={isReadOnly}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}