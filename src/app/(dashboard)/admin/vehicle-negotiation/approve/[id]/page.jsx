"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import mongoose from 'mongoose';

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

function isValidObjectId(id) {
  return id && mongoose.Types.ObjectId.isValid(id);
}

/* =======================
  Supplier Search Hook
========================= */
function useSupplierSearch() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchSuppliers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/suppliers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setSuppliers(data.data);
      }
    } catch (err) {
      console.error('Error fetching suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  return { suppliers, loading, searchSuppliers };
}

/* =======================
  Customer Search Hook
========================= */
function useCustomerSearch() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchCustomers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/customers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCustomers(data.data);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  return { customers, loading, searchCustomers };
}

/* =======================
  Order Panel Search Hook
========================= */
function useOrderPanelSearch() {
  const [orderPanels, setOrderPanels] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchOrderPanels = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/order-panel', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setOrderPanels(data.data);
      }
    } catch (err) {
      console.error('Error fetching order panels:', err);
    } finally {
      setLoading(false);
    }
  };

  const getOrderPanelById = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/order-panel?id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        return data.data;
      }
      return null;
    } catch (err) {
      console.error('Error fetching order panel:', err);
      return null;
    }
  };

  useEffect(() => {
    searchOrderPanels();
  }, []);

  return { orderPanels, loading, searchOrderPanels, getOrderPanelById };
}

/* =======================
  DEFAULT ROWS
======================= */
function defaultOrderRow() {
  return {
    _id: uid(),
    orderNo: "",
    orderPanelId: "",
    partyName: "",
    customerId: null,
    customerCode: "",
    contactPerson: "",
    plantCode: null,
    plantName: "",
    plantCodeValue: "",
    orderType: "Sales",
    pinCode: "",
    from: null,
    fromName: "",
    to: null,
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
    collectionCharges: "",
    cancellationCharges: "",
    loadingCharges: "",
    otherCharges: "",
  };
}

function defaultVendorRow() {
  return {
    _id: uid(),
    vendorName: "",
    vendorCode: "", 
    marketRate: "",
    purchaseType: "",
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
    setFilteredItems(items);
    if (selectedId) {
      const item = items.find(i => i._id === selectedId);
      if (item) {
        setSelectedItem(item);
        setSearchQuery(item[displayField] || "");
      }
    }
  }, [items, selectedId, displayField]);

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setSearchQuery(item[displayField] || "");
    setShowDropdown(false);
    onSelect?.(item);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        disabled={disabled}
        className={`mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
          disabled ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
        }`}
        placeholder={placeholder}
        autoComplete="off"
      />
      
      {showDropdown && !disabled && filteredItems.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              onMouseDown={() => handleSelectItem(item)}
              className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100"
            >
              <div className="font-medium text-slate-800">{item[displayField]}</div>
              <div className="text-xs text-slate-500">{item[codeField] && `Code: ${item[codeField]}`}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SupplierSearchDropdown({ value, onSelect, readOnly = false }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const supplierSearch = useSupplierSearch();

  useEffect(() => {
    supplierSearch.searchSuppliers();
  }, []);

  useEffect(() => {
    if (value) setSearchQuery(value);
  }, [value]);

  useEffect(() => {
    setSuppliers(supplierSearch.suppliers);
  }, [supplierSearch.suppliers]);

  const handleSelectItem = (supplier) => {
    setSearchQuery(supplier.supplierName);
    setShowDropdown(false);
    onSelect(supplier);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        readOnly={readOnly}
        className={`mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
          readOnly ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
        }`}
        placeholder="Search supplier..."
        autoComplete="off"
      />
      
      {showDropdown && !readOnly && suppliers.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {suppliers.map((supplier) => (
            <div
              key={supplier._id}
              onMouseDown={() => handleSelectItem(supplier)}
              className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100"
            >
              <div className="font-medium text-slate-800">{supplier.supplierName}</div>
              <div className="text-xs text-slate-500">Code: {supplier.supplierCode}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MultiSelectOrderPanelDropdown({ selectedPanels = [], onSelect, placeholder = "Search and select order panels...", readOnly = false }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const orderPanelSearch = useOrderPanelSearch();

  useEffect(() => {
    orderPanelSearch.searchOrderPanels();
  }, []);

  const availablePanels = orderPanelSearch.orderPanels.filter(
    panel => !selectedPanels.some(p => p._id === panel._id)
  );

  const handleSelectPanel = async (panel) => {
    const fullPanel = await orderPanelSearch.getOrderPanelById(panel._id);
    if (fullPanel) onSelect(fullPanel);
    setSearchQuery("");
    setShowDropdown(false);
  };

  const handleRemovePanel = (panelId) => {
    onSelect(null, panelId);
  };

  if (readOnly) {
    return (
      <div className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 min-h-[42px]">
        {selectedPanels.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedPanels.map((panel, idx) => (
              <span key={idx} className="bg-yellow-100 px-2 py-1 rounded-md text-xs">{panel.orderPanelNo}</span>
            ))}
          </div>
        ) : "No order panels selected"}
      </div>
    );
  }

  return (
    <div className="relative">
      {selectedPanels.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 p-2 border border-yellow-200 rounded-lg bg-yellow-50">
          {selectedPanels.map((panel) => (
            <div key={panel._id} className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-md text-sm">
              <span className="font-medium">{panel.orderPanelNo}</span>
              <button onClick={() => handleRemovePanel(panel._id)} className="text-red-500 hover:text-red-700 font-bold ml-1">×</button>
            </div>
          ))}
        </div>
      )}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
        placeholder={placeholder}
        autoComplete="off"
      />
      {showDropdown && availablePanels.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {availablePanels.map((panel) => (
            <div
              key={panel._id}
              onMouseDown={() => handleSelectPanel(panel)}
              className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100"
            >
              <div className="font-medium text-slate-800">{panel.orderPanelNo}</div>
              <div className="text-xs text-slate-500">{panel.partyName || panel.customerName}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* =======================
  Orders Table Component (Read-only with all charge fields)
========================= */
function OrdersTable({ rows }) {
  const columns = [
    { key: "orderNo", label: "Order No", minWidth: "120px" },
    { key: "partyName", label: "Party Name", minWidth: "150px" },
    { key: "plantCode", label: "Plant Code", minWidth: "100px" },
    { key: "plantName", label: "Plant Name", minWidth: "120px" },
    { key: "orderType", label: "Order Type", minWidth: "100px" },
    { key: "pinCode", label: "Pin Code", minWidth: "100px" },
    { key: "from", label: "From", minWidth: "120px" },
    { key: "to", label: "To", minWidth: "120px" },
    { key: "taluka", label: "Taluka", minWidth: "120px" },
    { key: "district", label: "District", minWidth: "100px" },
    { key: "state", label: "State", minWidth: "100px" },
    { key: "country", label: "Country", minWidth: "100px" },
    { key: "weight", label: "Weight", minWidth: "80px" },
    { key: "status", label: "Status", minWidth: "100px" },
    { key: "collectionCharges", label: "Collection Charges", minWidth: "120px" },
    { key: "cancellationCharges", label: "Cancellation Charges", minWidth: "130px" },
    { key: "loadingCharges", label: "Loading Charges", minWidth: "120px" },
    { key: "otherCharges", label: "Other Charges", minWidth: "110px" },
  ];

  if (!rows || rows.length === 0) {
    return (
      <div className="overflow-auto rounded-xl border border-yellow-300 p-8 text-center text-slate-400">
        No orders found
      </div>
    );
  }

  return (
    <div className="overflow-auto rounded-xl border border-yellow-300 max-h-[500px]">
      <table className="min-w-max w-full text-sm">
        <thead className="sticky top-0 bg-yellow-400 z-10">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center" style={{ minWidth: col.minWidth }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row._id || idx} className="hover:bg-yellow-50 even:bg-slate-50">
              <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.orderNo || '-'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.partyName || '-'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.plantCode || '-'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.plantName || '-'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.orderType || '-'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.pinCode || '-'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.fromName || row.from || '-'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.toName || row.to || '-'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.talukaName || row.taluka || '-'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.districtName || row.district || '-'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.stateName || row.state || '-'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.countryName || row.country || '-'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.weight || '0'}</td>
              <td className="border border-yellow-300 px-2 py-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  row.status === 'Open' ? 'bg-green-100 text-green-800' :
                  row.status === 'Hold' ? 'bg-yellow-100 text-yellow-800' :
                  row.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'
                }`}>{row.status || 'Open'}</span>
              </td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.collectionCharges || '0'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.cancellationCharges || 'Nil'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.loadingCharges || 'Nil'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.otherCharges || '0'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* =======================
  Vendors Table Component (Read-only with Purchase Type)
========================= */
function VendorsTable({ rows }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="overflow-auto rounded-xl border border-yellow-300 p-8 text-center text-slate-400">
        No suppliers found
      </div>
    );
  }

  return (
    <div className="overflow-auto rounded-xl border border-yellow-300 max-h-[300px]">
      <table className="min-w-full w-full text-sm">
        <thead className="sticky top-0 bg-yellow-400 z-10">
          <tr>
            <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">Supplier Name</th>
            <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">Supplier Code</th>
            <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">Purchase - Type</th>
            <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">Market Rates</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row._id || idx} className="hover:bg-yellow-50 even:bg-slate-50">
              <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.vendorName || '-'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.vendorCode || '-'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.purchaseType || '-'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700">₹{row.marketRate || '0'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* =======================
  Billing Type Table Component (Read-only - Only Billing Type, Loading Points, Drop Points)
========================= */
function BillingTypeTable({ header, billingColumns }) {
  return (
    <div className="overflow-auto rounded-xl border border-yellow-300">
      <table className="min-w-full w-full text-sm">
        <thead className="sticky top-0 bg-yellow-400">
          <tr>
            {billingColumns.map((col) => (
              <th key={col.key} className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">
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
  const customerSearch = useCustomerSearch();
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [purchaseTypes, setPurchaseTypes] = useState([]);
  const [paymentTerms, setPaymentTerms] = useState([]);
  const [branches, setBranches] = useState([]);
  const [plants, setPlants] = useState([]);

  const [vnnNumber, setVnnNumber] = useState("");
  const [selectedOrderPanels, setSelectedOrderPanels] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const [header, setHeader] = useState({
    vnnNo: "",
    branch: null,
    branchName: "",
    branchCode: "",
    delivery: "Urgent",
    date: "",
    loadingPoints: "",
    dropPoints: "",
    collectionCharges: "",
    cancellationCharges: "",
    loadingCharges: "",
    otherCharges: "",
    partyName: "",
    customerId: null,
    billingType: "Multi - Order"
  });

  const [orders, setOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [negotiation, setNegotiation] = useState({
    maxRate: "",
    targetRate: "",
    purchaseType: "",
    oldRatePercent: "",
    remarks1: "",
  });
  const [voiceUrl, setVoiceUrl] = useState("");
  const [voiceFileInfo, setVoiceFileInfo] = useState(null);

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
    purchaseType: "",
    paymentTerms: "",
    approvalStatus: "",
    remarks: "",
    memoStatus: "Pending",
    memoFile: null
  });

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchBranches();
        await fetchPlants();
        await supplierSearch.searchSuppliers();
        await customerSearch.searchCustomers();
        await fetchPurchaseTypes();
        await fetchPaymentTerms();
        await fetchNegotiationData();
      } catch (error) {
        console.error("Error in fetchData:", error);
      }
    };
    fetchData();
  }, []);

  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/branches', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) setBranches(data.data);
    } catch (error) { console.error('Error fetching branches:', error); }
  };

  const fetchPlants = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/plants', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) setPlants(data.data);
    } catch (error) { console.error('Error fetching plants:', error); }
  };

  const fetchPurchaseTypes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/purchase-type', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) setPurchaseTypes(data.data.map(item => item.name));
    } catch (error) { console.error('Error fetching purchase types:', error); }
  };

  const fetchPaymentTerms = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/payment-terms', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) setPaymentTerms(data.data.map(item => item.name));
    } catch (error) { console.error('Error fetching payment terms:', error); }
  };

  const fetchNegotiationData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log("Fetching negotiation with ID:", negotiationId);
      
      const res = await fetch(`/api/vehicle-negotiation?id=${negotiationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log("API Response:", data);
      
      if (!data.success) throw new Error(data.message || 'Failed to fetch');

      const vn = data.data;
      console.log("Vehicle Negotiation Data:", vn);
      
      setVnnNumber(vn.vnnNo || "");
      
      setHeader({
        vnnNo: vn.vnnNo || "",
        branch: vn.branch || null,
        branchName: vn.branchName || "",
        branchCode: vn.branchCode || "",
        delivery: vn.delivery || "Urgent",
        date: vn.date ? new Date(vn.date).toISOString().split('T')[0] : "",
        loadingPoints: vn.loadingPoints?.toString() || "",
        dropPoints: vn.dropPoints?.toString() || "",
        collectionCharges: vn.collectionCharges?.toString() || "",
        cancellationCharges: vn.cancellationCharges || "Nil",
        loadingCharges: vn.loadingCharges || "Nil",
        otherCharges: vn.otherCharges || "Nil",
        partyName: vn.partyName || vn.customerName || "",
        customerId: vn.customerId || null,
        billingType: vn.billingType || "Multi - Order"
      });

      if (vn.customerName) {
        setSelectedCustomer({
          _id: vn.customerId,
          customerName: vn.customerName,
          customerCode: vn.customerCode || ""
        });
      }

      if (vn.orders && vn.orders.length > 0) {
        setOrders(vn.orders.map(order => ({ ...order, _id: order._id || uid() })));
      } else {
        setOrders([defaultOrderRow()]);
      }

      if (vn.selectedOrderPanels && vn.selectedOrderPanels.length > 0) {
        setSelectedOrderPanels(vn.selectedOrderPanels);
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
        setVendors(vn.vendors.map(v => ({ ...v, _id: v._id || uid() })));
      } else {
        setVendors([defaultVendorRow()]);
      }

      if (vn.voiceNote) setVoiceUrl(vn.voiceNote);
      if (vn.voiceNoteFile) setVoiceFileInfo(vn.voiceNoteFile);

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
          purchaseType: vn.approval.purchaseType || "",
          paymentTerms: vn.approval.paymentTerms || "",
          approvalStatus: vn.approval.approvalStatus || "Pending",
          remarks: vn.approval.remarks || "",
          memoStatus: vn.approval.memoStatus || "Pending",
          memoFile: vn.approval.memoFile || null
        });

        if (vn.approval.vendorName) {
          setSelectedSupplier({ supplierName: vn.approval.vendorName });
        }
      }

    } catch (error) {
      console.error('Error fetching:', error);
      alert(`Failed to load: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSupplierSelect = (supplier) => {
    if (supplier) {
      setSelectedSupplier(supplier);
      setApproval(prev => ({
        ...prev,
        vendorName: supplier.supplierName,
        vendorCode: supplier.supplierCode || '',
        vendorStatus: supplier.supplierStatus || "Active"
      }));
    }
  };

  const handleMemoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      alert("❌ Please upload only PDF or image files");
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
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      
      if (data.success) {
        setApproval(prev => ({ 
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
      }
    } catch (error) {
      console.error("Error uploading memo:", error);
      alert("❌ Failed to upload memo");
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
      
      const fetchRes = await fetch(`/api/vehicle-negotiation?id=${negotiationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const fetchData = await fetchRes.json();
      if (!fetchData.success) throw new Error('Failed to fetch data');
      
      const currentData = fetchData.data;
      
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
      
      const res = await fetch('/api/vehicle-negotiation', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: negotiationId, ...updatedData }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`Vehicle Negotiation ${approval.approvalStatus} successfully!`);
        router.push('/admin/vehicle-negotiation');
      } else {
        alert(data.message || 'Failed to update approval');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
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
      {/* Top Bar */}
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
              ⓘ Only Approval Status and Remarks are editable
            </div>
          </div>

          <button
            onClick={handleApprove}
            disabled={saving || uploading}
            className={`rounded-xl px-5 py-2 text-sm font-bold text-white transition ${
              saving || uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {saving || uploading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {uploading ? 'Uploading...' : 'Saving...'}
              </span>
            ) : 'Submit Approval'}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-full p-4 space-y-4">
        {/* PART 1 - READ ONLY */}
        <Card title="Vehicle Negotiation - Panel - Part -1 (Read Only)">
          <div className="grid grid-cols-12 gap-3 mb-4">
            <Input col="col-span-12 md:col-span-3" label="Vehicle Negotiation No" value={vnnNumber} readOnly={true} />
            
            <div className="col-span-12 md:col-span-6">
              <label className="text-xs font-bold text-slate-600">Select Order Panels</label>
              <MultiSelectOrderPanelDropdown
                selectedPanels={selectedOrderPanels}
                onSelect={() => {}}
                placeholder="Search and select order panels..."
                readOnly={true}
              />
            </div>
            
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Branch</label>
              <Input value={header.branchName} readOnly={true} />
            </div>

            <Input col="col-span-12 md:col-span-3" label="Delivery" value={header.delivery} readOnly={true} />
            <Input type="date" col="col-span-12 md:col-span-3" label="Date" value={header.date} readOnly={true} />
           
          </div>

          {/* Billing Type / Charges */}
          <div className="mb-4">
            <div className="text-sm font-bold text-slate-700 mb-2">Billing Type / Charges</div>
            <BillingTypeTable header={header} billingColumns={billingColumns} />
          </div>

          {/* Orders Table with all charge fields */}
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

          {/* Suppliers / Market Rates Section with Purchase Type */}
          <div className="mt-6">
            <div className="text-sm font-bold text-slate-700 mb-4">Suppliers / Market Rates</div>
            <VendorsTable rows={vendors} />
          </div>
        </Card>

        {/* PART 2 - READ ONLY */}
        <Card title="Vehicle - Negotiation - Part - 2 (Read Only)">
          <div className="grid grid-cols-12 gap-3 mb-4">
            <Input col="col-span-12 md:col-span-3" label="Max Rate" value={negotiation.maxRate} readOnly={true} />
            <Input col="col-span-12 md:col-span-3" label="Target Rate" value={negotiation.targetRate} readOnly={true} />
            <Input col="col-span-12 md:col-span-3" label="Old Rate %" value={negotiation.oldRatePercent} readOnly={true} />
          </div>

          {/* Remarks & Voice Note */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-7">
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="text-sm font-extrabold text-slate-900 mb-3">Remarks</div>
                <div className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 min-h-[80px]">
                  {negotiation.remarks1 || "-"}
                </div>
              </div>
            </div>
            <div className="col-span-12 md:col-span-5">
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="text-sm font-extrabold text-slate-900 mb-3">Voice Note</div>
                {voiceUrl ? (
                  <audio ref={audioRef} src={voiceUrl} controls className="w-full" />
                ) : (
                  <div className="text-sm text-slate-500 italic">No voice note uploaded</div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* PART 3 - VEHICLE APPROVAL - Only Approval Status and Remarks Editable */}
        <Card title="Vehicle - Approval - Part - 3 (Only Approval Status & Remarks Editable)">
          <div className="grid grid-cols-12 gap-3 mb-4">
            <div className="col-span-12 md:col-span-4">
              <label className="text-xs font-bold text-slate-600">Supplier Name</label>
              <Input value={selectedSupplier?.supplierName || approval.vendorName} readOnly={true} />
            </div>
            <Input col="col-span-12 md:col-span-4" label="Supplier Code" value={approval.vendorCode} readOnly={true} />
            <Select col="col-span-12 md:col-span-4" label="Supplier Status" value={approval.vendorStatus} options={VENDOR_STATUS} readOnly={true} />
          </div>

          <div className="grid grid-cols-12 gap-3 mb-4">
            <Select col="col-span-12 md:col-span-4" label="Rate - Type" value={approval.rateType} options={RATE_TYPES} readOnly={true} />
            <Input col="col-span-12 md:col-span-4" label="Final - Per MT (A)" value={approval.finalPerMT} type="number" readOnly={true} />
            <Input col="col-span-12 md:col-span-4" label="Final - Fix" value={approval.finalFix} type="number" readOnly={true} />
          </div>

          <div className="grid grid-cols-12 gap-3 mb-4">
            <div className="col-span-12 md:col-span-4">
              <label className="text-xs font-bold text-slate-600">Weight (B)</label>
              <div className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-extrabold text-slate-900">{totalWeight}</div>
            </div>
            <div className="col-span-12 md:col-span-4">
              <label className="text-xs font-bold text-slate-600">Purchase Amount (A x B)</label>
              <div className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-extrabold text-emerald-700">₹{purchaseAmount.toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-3 mb-4">
            <div className="col-span-12 md:col-span-4">
              <label className="text-xs font-bold text-slate-600">Vehicle Number</label>
              <Input value={approval.vehicleNo} readOnly={true} />
            </div>
            <Input col="col-span-12 md:col-span-4" label="Mobile" value={approval.mobile} readOnly={true} />
          </div>

          <div className="grid grid-cols-12 gap-3 mb-4">
            <Select col="col-span-12 md:col-span-4" label="Purchase - Type" value={approval.purchaseType} options={purchaseTypes.length > 0 ? purchaseTypes : PURCHASE_TYPES} readOnly={true} />
            <Select col="col-span-12 md:col-span-4" label="Payment - Terms" value={approval.paymentTerms} options={paymentTerms.length > 0 ? paymentTerms : PAYMENT_TERMS} readOnly={true} />
            <Select col="col-span-12 md:col-span-4" label="Approval Status *" value={approval.approvalStatus} onChange={(v) => setApproval(prev => ({ ...prev, approvalStatus: v }))} options={APPROVALS} readOnly={false} />
          </div>

          <div>
            <div className="text-sm font-extrabold text-slate-900 mb-3">Remarks</div>
            <textarea
              value={approval.remarks}
              onChange={(e) => setApproval(prev => ({ ...prev, remarks: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              rows={3}
              placeholder="Enter approval remarks..."
              readOnly={false}
            />
          </div>
        </Card>

      {/* MEMO UPLOAD - EDITABLE */}
<Card title="Memo - Upload (Editable)">
  <div className="rounded-xl border border-slate-200 p-4">
    <div className="text-sm font-extrabold text-slate-900 mb-3">Memo Upload</div>
    
    {/* File Upload */}
    <input
      type="file"
      accept=".pdf,.png,.jpg,.jpeg"
      onChange={handleMemoUpload}
      disabled={uploading}
      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 disabled:opacity-50"
    />
    
    {/* Uploading Status */}
    {uploading && (
      <div className="mt-3 text-sm text-blue-600 flex items-center gap-2">
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Uploading memo...
      </div>
    )}
    
    {/* Memo Status - Editable */}
    <div className="mt-3">
      <label className="text-xs font-bold text-slate-600">Memo Status</label>
      <select
        value={approval.memoStatus || "Pending"}
        onChange={(e) => setApproval(prev => ({ ...prev, memoStatus: e.target.value }))}
        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
      >
        {MEMO_STATUS.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
    
    {/* Memo Approval Dropdown - Editable */}
    <div className="mt-3">
      <label className="text-xs font-bold text-slate-600">Memo Approval</label>
      <select
        value={approval.approvalStatus || ""}
        onChange={(e) => setApproval(prev => ({ ...prev, approvalStatus: e.target.value }))}
        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
      >
        <option value="">Select Approval</option>
        {APPROVALS.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
    
    {/* Display Uploaded File Info */}
    {approval.memoFile && (
      <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
        <p className="text-sm font-medium text-green-800">Uploaded File:</p>
        <p className="text-sm text-green-700 mt-1">{approval.memoFile.originalName}</p>
        <p className="text-xs text-green-600 mt-0.5">Size: {(approval.memoFile.size / 1024).toFixed(1)} KB</p>
        {approval.memoFile.filePath && (
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