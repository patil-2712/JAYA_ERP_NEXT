"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import mongoose from 'mongoose';

/** =========================
 * CONSTANTS
 ========================= */
const PACK_TYPES = [
  { key: "PALLETIZATION", label: "Palletization" },
  { key: "LOOSE - CARGO", label: "Loose - Cargo" },
];

const ORDER_TYPES = ["Sales", "STO Order", "Export", "Import"];
const STATUSES = ["Open", "Hold", "Cancelled"];
const DELIVERY_OPTIONS = ["Urgent", "Normal", "Express", "Scheduled"];
const PKGS_TYPE_OPTIONS = ["Drum", "Boxes", "Bags", "Cartons", "Crates", "Pallets", "Box"];
const UOM_OPTIONS = ["KG", "LTR", "TON", "M3", "PCS", "Kgs", "Ltr", "MT"];
const PRODUCT_NAME_OPTIONS = ["Chemicals", "Food Items", "Electronics", "Machinery", "Textiles", "Automotive Parts", "Di-Betic Easter", "Chromite Sand", "Bud Builder", "CALCIUM NITRATE 10KG", "CALCIUM NITRATE 1KG"];
const SKU_SIZE_OPTIONS = ["100 Ltr", "200 Kgs", "10 Kgs", "1 Kgs", "1 Ltr", "Small", "Medium", "Large", "Extra Large", "Standard"];

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

/** =========================
 * DEFAULT EMPTY ROWS - UPDATED with null for ObjectId fields
 ========================= */
function defaultRow(packType) {
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

function defaultPlantRow() {
  return {
    _id: uid(),
    plantCode: null, // Changed from "" to null
    plantName: "",
    plantCodeValue: "",
    orderType: "",
    pinCode: "",
    pinCodeData: null,
    from: null, // Changed from "" to null
    fromName: "",
    to: null, // Changed from "" to null
    toName: "",
    country: "",
    countryName: "",
    state: "",
    stateName: "",
    district: "",
    districtName: "",
    weight: "",
    status: "",
  };
}

/** =========================
 * Customer Search Hook
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

/** =========================
 * Pincode Hook
 ========================= */
function usePincodes() {
  const [pincodes, setPincodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPincodes = async (search = "") => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const url = search ? `/api/pincodes?search=${encodeURIComponent(search)}` : '/api/pincodes';
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setPincodes(data.data);
      } else {
        setPincodes([]);
        setError(data.message || 'No pincodes found');
      }
    } catch (err) {
      console.error('Error fetching pincodes:', err);
      setPincodes([]);
      setError('Failed to fetch pincodes');
    } finally {
      setLoading(false);
    }
  };

  const searchPincodes = async (query) => {
    await fetchPincodes(query);
  };

  return { pincodes, loading, error, fetchPincodes, searchPincodes };
}

/** =========================
 * External Pincode API Hook
 ========================= */
function useExternalPincodeAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pincodeData, setPincodeData] = useState(null);

  const fetchPincodeDetails = async (pincode) => {
    if (!pincode || pincode.length !== 6) {
      return null;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();
      
      if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice && data[0].PostOffice.length > 0) {
        const postOffice = data[0].PostOffice[0];
        const result = {
          to: postOffice.Name,
          toName: postOffice.Name,
          country: postOffice.Country,
          countryName: postOffice.Country,
          state: postOffice.State,
          stateName: postOffice.State,
          district: postOffice.District,
          districtName: postOffice.District,
          circle: postOffice.Circle,
          division: postOffice.Division,
          region: postOffice.Region,
          block: postOffice.Block,
          pincode: pincode
        };
        setPincodeData(result);
        return result;
      } else {
        setError('Invalid pincode or no data found');
        return null;
      }
    } catch (err) {
      console.error('Error fetching pincode details:', err);
      setError('Failed to fetch pincode details');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, pincodeData, fetchPincodeDetails };
}

export default function EditOrderPanel() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id;

  /** =========================
   * STATE FOR API DATA
   ========================= */
  const [branches, setBranches] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  /** =========================
   * CUSTOMER SEARCH STATE
   ========================= */
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const customerSearch = useCustomerSearch();

  /** =========================
   * PINCODE API STATE
   ========================= */
  const pincodeAPI = useExternalPincodeAPI();
  const [pincodeInput, setPincodeInput] = useState({});

  /** =========================
   * HEADER STATE
   ========================= */
  const [top, setTop] = useState({
    orderNo: "",
    branch: null, // Changed from "" to null
    branchName: "",
    branchCode: "",
    delivery: "Normal",
    date: new Date().toISOString().split('T')[0],
    partyName: "",
    collectionCharges: "",
    cancellationCharges: "",
    loadingCharges: "",
    otherCharges: "",
    customerId: null, // Changed from "" to null
    customerCode: "",
    customerName: "",
    contactPerson: "",
  });

  /** =========================
   * PLANT GRID TABLE DATA
   ========================= */
  const [plantRows, setPlantRows] = useState([defaultPlantRow()]);

  /** =========================
   * PACK DATA
   ========================= */
  const [activePack, setActivePack] = useState("PALLETIZATION");
  const [packData, setPackData] = useState({
    PALLETIZATION: [],
    "UNIFORM - BAGS/BOXES": [],
    "LOOSE - CARGO": [],
  });

  /** =========================
   * FETCH ORDER DATA
   ========================= */
  useEffect(() => {
    if (orderId) {
      fetchOrderData();
      fetchBranches();
      fetchCountries();
      fetchPlants();
      pincodeAPI.fetchPincodeDetails(); // Initialize pincode API
    }
  }, [orderId]);

  const fetchOrderData = async () => {
    setFetchLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch the order
      const res = await fetch(`/api/order-panel?id=${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch order');
      }

      const order = data.data;
      
      // Set order number
      setOrderNumber(order.orderPanelNo || order.orderNo || "");
      
      // Set header data - ensure null for empty ObjectId fields
      setTop({
        orderNo: order.orderPanelNo || order.orderNo || "",
        branch: order.branch || null,
        branchName: order.branchName || "",
        branchCode: order.branchCode || "",
        delivery: order.delivery || "Normal",
        date: order.date ? new Date(order.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        partyName: order.partyName || order.customerName || "",
        collectionCharges: order.collectionCharges?.toString() || "",
        cancellationCharges: order.cancellationCharges || "",
        loadingCharges: order.loadingCharges || "",
        otherCharges: order.otherCharges?.toString() || "",
        customerId: order.customerId || null,
        customerCode: order.customerCode || "",
        customerName: order.customerName || "",
        contactPerson: order.contactPerson || "",
      });

      // Set customer data
      if (order.customerName) {
        setSelectedCustomer({
          _id: order.customerId,
          customerName: order.customerName,
          customerCode: order.customerCode,
          contactPersonName: order.contactPerson,
        });
        setCustomerSearchQuery(order.customerName);
      }

      // Process plant rows - ensure null for ObjectId fields
      if (order.plantRows && order.plantRows.length > 0) {
        const processedPlantRows = order.plantRows.map(row => ({
          _id: row._id || uid(),
          plantCode: row.plantCode || null,
          plantName: row.plantName || "",
          plantCodeValue: row.plantCodeValue || "",
          orderType: row.orderType || "Sales",
          pinCode: row.pinCode || "",
          pinCodeData: row.pinCode ? { pincode: row.pinCode } : null,
          from: row.from || null,
          fromName: row.fromName || "",
          to: row.to || null,
          toName: row.toName || "",
          country: row.country || "",
          countryName: row.countryName || "",
          state: row.state || "",
          stateName: row.stateName || "",
          district: row.district || "",
          districtName: row.districtName || "",
          weight: row.weight?.toString() || "",
          status: row.status || "Open",
        }));
        setPlantRows(processedPlantRows);
      }

      // Process pack data
      if (order.packData) {
        const processedPackData = {
          PALLETIZATION: (order.packData.PALLETIZATION || []).map(row => ({
            ...row,
            _id: row._id || uid(),
            noOfPallets: row.noOfPallets?.toString() || "",
            unitPerPallets: row.unitPerPallets?.toString() || "",
            totalPkgs: row.totalPkgs?.toString() || "",
            pkgsType: row.pkgsType || "",
            uom: row.uom || "",
            skuSize: row.skuSize || "",
            packWeight: row.packWeight?.toString() || "",
            productName: row.productName || "",
            wtLtr: row.wtLtr?.toString() || "",
            actualWt: row.actualWt?.toString() || "",
            chargedWt: row.chargedWt?.toString() || "",
            wtUom: row.wtUom || "",
            isUniform: row.isUniform || false,
          })),
          "UNIFORM - BAGS/BOXES": (order.packData["UNIFORM - BAGS/BOXES"] || []).map(row => ({
            ...row,
            _id: row._id || uid(),
            totalPkgs: row.totalPkgs?.toString() || "",
            pkgsType: row.pkgsType || "",
            uom: row.uom || "",
            skuSize: row.skuSize || "",
            packWeight: row.packWeight?.toString() || "",
            productName: row.productName || "",
            wtLtr: row.wtLtr?.toString() || "",
            actualWt: row.actualWt?.toString() || "",
            chargedWt: row.chargedWt?.toString() || "",
            wtUom: row.wtUom || "",
          })),
          "LOOSE - CARGO": (order.packData["LOOSE - CARGO"] || []).map(row => ({
            ...row,
            _id: row._id || uid(),
            uom: row.uom || "",
            productName: row.productName || "",
            actualWt: row.actualWt?.toString() || "",
            chargedWt: row.chargedWt?.toString() || "",
          })),
        };
        setPackData(processedPackData);
      }

    } catch (error) {
      console.error('Error fetching order:', error);
      alert(`Failed to load order: ${error.message}`);
    } finally {
      setFetchLoading(false);
    }
  };

  /** =========================
   * FETCH DATA FROM APIs
   ========================= */
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

  const fetchStates = async (countryCode) => {
    if (!countryCode) {
      setStates([]);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/states?country=${countryCode}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setStates(data.data);
      } else {
        setStates([]);
      }
    } catch (error) {
      console.error('Error fetching states:', error.message);
      setStates([]);
    }
  };

  const fetchDistricts = async (stateId) => {
    if (!stateId) {
      setDistricts([]);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/districts?state=${stateId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setDistricts(data.data);
      } else {
        setDistricts([]);
      }
    } catch (error) {
      console.error('Error fetching districts:', error.message);
      setDistricts([]);
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
        customer.customerCode.toLowerCase().includes(query.toLowerCase()) ||
        (customer.contactPersonName && customer.contactPersonName.toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredCustomers(filtered);
    }
    
    if (selectedCustomer && query !== selectedCustomer.customerName) {
      setSelectedCustomer(null);
      setTop(prev => ({
        ...prev,
        customerId: null,
        customerCode: "",
        customerName: "",
        contactPerson: "",
        partyName: ""
      }));
    }
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCustomerSearchQuery(customer.customerName);
    setShowCustomerDropdown(false);
    
    setTop(prev => ({
      ...prev,
      customerId: customer._id,
      customerCode: customer.customerCode,
      customerName: customer.customerName,
      contactPerson: customer.contactPersonName || "",
      partyName: customer.customerName
    }));
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
   * BRANCH SELECTION
   ========================= */
  const handleBranchSelect = (branch) => {
    if (branch) {
      setTop(prev => ({
        ...prev,
        branch: branch._id,
        branchName: branch.name,
        branchCode: branch.code || ''
      }));
    } else {
      setTop(prev => ({
        ...prev,
        branch: null,
        branchName: "",
        branchCode: ""
      }));
    }
  };

  /** =========================
   * PLANT SELECTION
   ========================= */
  const handlePlantChange = (rowId, plantId) => {
    const selectedPlant = plants.find(p => p._id === plantId);
    if (selectedPlant) {
      updatePlantRow(rowId, 'plantCode', plantId);
      updatePlantRow(rowId, 'plantName', selectedPlant.name);
      updatePlantRow(rowId, 'plantCodeValue', selectedPlant.code);
    } else {
      updatePlantRow(rowId, 'plantCode', null);
      updatePlantRow(rowId, 'plantName', '');
      updatePlantRow(rowId, 'plantCodeValue', '');
    }
  };

  /** =========================
   * PINCODE API INTEGRATION
   ========================= */
  const handlePincodeChange = async (rowId, pincode) => {
    // Update pincode field
    updatePlantRow(rowId, 'pinCode', pincode);
    
    // Store input value for tracking
    setPincodeInput(prev => ({ ...prev, [rowId]: pincode }));
    
    // Only fetch if pincode is 6 digits
    if (pincode && pincode.length === 6) {
      const result = await pincodeAPI.fetchPincodeDetails(pincode);
      
      if (result) {
        // Store city name in toName field
        updatePlantRow(rowId, 'toName', result.toName);
        // IMPORTANT: Set to to null when using pincode city
        updatePlantRow(rowId, 'to', null);
        
        // Store country, state, district names and codes
        updatePlantRow(rowId, 'countryName', result.countryName);
        updatePlantRow(rowId, 'country', result.country);
        
        updatePlantRow(rowId, 'stateName', result.stateName);
        updatePlantRow(rowId, 'state', result.state);
        
        updatePlantRow(rowId, 'districtName', result.districtName);
        updatePlantRow(rowId, 'district', result.district);
      }
    }
  };

  /** =========================
   * PLANT ROW FUNCTIONS
   ========================= */
  const addPlantRow = () => setPlantRows((p) => [...p, defaultPlantRow()]);

  const updatePlantRow = (rowId, key, value) => {
    setPlantRows((prev) =>
      prev.map((r) => (r._id === rowId ? { ...r, [key]: value } : r))
    );
  };

  const removePlantRow = (rowId) => {
    if (plantRows.length > 1) {
      setPlantRows((prev) => prev.filter((r) => r._id !== rowId));
    } else {
      alert("At least one plant row is required");
    }
  };

  /** =========================
   * PACK DATA FUNCTIONS
   ========================= */
  const rows = packData[activePack] || [];
  const uniformRows = packData["UNIFORM - BAGS/BOXES"] || [];

  // Helper function to recalculate weights for PALLETIZATION
  const recalculatePalletizationWeights = (row) => {
    const noOfPallets = num(row.noOfPallets);
    const unitPerPallets = num(row.unitPerPallets);
    const totalPkgs = num(row.totalPkgs);
    const packWeight = num(row.packWeight);
    const uom = (row.uom || "").toUpperCase();
    
    // Calculate TOTAL PKGS if we have noOfPallets and unitPerPallets
    if (noOfPallets > 0 && unitPerPallets > 0) {
      const calculatedTotalPkgs = noOfPallets * unitPerPallets;
      row.totalPkgs = calculatedTotalPkgs > 0 ? String(calculatedTotalPkgs) : "";
    }
    
    const currentTotalPkgs = num(row.totalPkgs);
    
    // Calculate based on UOM
    if (currentTotalPkgs > 0 && packWeight > 0) {
      if (uom === "LTR" || uom === "L") {
        // For LTR: WT (LTR) = TOTAL PKGS * PACK-WEIGHT
        const wtLtr = currentTotalPkgs * packWeight;
        row.wtLtr = wtLtr > 0 ? String(wtLtr.toFixed(2)) : "";
        
        // ACTUAL WT = WT (LTR) / 1000
        const actualWt = wtLtr / 1000;
        row.actualWt = actualWt > 0 ? String(actualWt.toFixed(3)) : "";
      } else if (uom === "KG" || uom === "KGS") {
        // For KG: ACTUAL WT = TOTAL PKGS * PACK-WEIGHT / 1000
        const actualWt = (currentTotalPkgs * packWeight) / 1000;
        row.actualWt = actualWt > 0 ? String(actualWt.toFixed(3)) : "";
        // WT LTR is not applicable for KG
        row.wtLtr = "";
      } else {
        // For other UOMs
        row.wtLtr = "";
        row.actualWt = "";
      }
    }
    
    return row;
  };

  // Helper function to recalculate weights for UNIFORM - BAGS/BOXES
  const recalculateUniformWeights = (row) => {
    const totalPkgs = num(row.totalPkgs);
    const packWeight = num(row.packWeight);
    const uom = (row.uom || "").toUpperCase();
    
    if (totalPkgs > 0 && packWeight > 0) {
      if (uom === "LTR" || uom === "L") {
        // For LTR: WT (LTR) = TOTAL PKGS * PACK-WEIGHT
        const wtLtr = totalPkgs * packWeight;
        row.wtLtr = wtLtr > 0 ? String(wtLtr.toFixed(2)) : "";
        
        // ACTUAL WT = WT (LTR) / 1000
        const actualWt = wtLtr / 1000;
        row.actualWt = actualWt > 0 ? String(actualWt.toFixed(3)) : "";
      } else if (uom === "KG" || uom === "KGS") {
        // For KG: ACTUAL WT = TOTAL PKGS * PACK-WEIGHT / 1000
        const actualWt = (totalPkgs * packWeight) / 1000;
        row.actualWt = actualWt > 0 ? String(actualWt.toFixed(3)) : "";
        // WT LTR is not applicable for KG
        row.wtLtr = "";
      } else {
        // For other UOMs
        row.wtLtr = "";
        row.actualWt = "";
      }
    }
    
    return row;
  };

  // Helper function for LOOSE - CARGO
  const recalculateLooseWeights = (row) => {
    const uom = (row.uom || "").toUpperCase();
    const actualWt = num(row.actualWt);
    
    if (actualWt > 0) {
      row.actualWt = String(actualWt);
    }
    
    return row;
  };

  const updatePackRow = (rowId, key, value, packType = activePack) => {
    setPackData((prev) => {
      const updatedPack = prev[packType].map((r) => {
        if (r._id === rowId) {
          const updatedRow = { ...r, [key]: value };
          
          if (packType === "PALLETIZATION") {
            return recalculatePalletizationWeights(updatedRow);
          } else if (packType === "UNIFORM - BAGS/BOXES") {
            return recalculateUniformWeights(updatedRow);
          } else if (packType === "LOOSE - CARGO") {
            return recalculateLooseWeights(updatedRow);
          }
          
          return updatedRow;
        }
        return r;
      });
      
      return {
        ...prev,
        [packType]: updatedPack,
      };
    });
  };

  const addRow = (packType = activePack) => {
    setPackData((prev) => ({
      ...prev,
      [packType]: [...prev[packType], defaultRow(packType)],
    }));
  };

  const removeRow = (packType, id) => {
    const currentRows = packData[packType] || [];
    if (currentRows.length > 1) {
      setPackData((prev) => ({
        ...prev,
        [packType]: prev[packType].filter((r) => r._id !== id),
      }));
    } else {
      alert("At least one row is required");
    }
  };

  const duplicateRow = (packType, id) => {
    const row = (packData[packType] || []).find((r) => r._id === id);
    if (!row) return;
    setPackData((prev) => ({
      ...prev,
      [packType]: [...prev[packType], { ...row, _id: uid() }],
    }));
  };

  /** =========================
   * TOGGLE UNIFORM MODE
   ========================= */
  const toggleUniformMode = (rowId) => {
    setPackData((prev) => {
      const palletRow = prev.PALLETIZATION.find(r => r._id === rowId);
      if (!palletRow) return prev;
      
      const newIsUniform = !palletRow.isUniform;
      
      const updatedPalletRows = prev.PALLETIZATION.map((r) => {
        if (r._id === rowId) {
          return { ...r, isUniform: newIsUniform };
        }
        return r;
      });
      
      let updatedUniformRows = [...prev["UNIFORM - BAGS/BOXES"]];
      
      if (newIsUniform) {
        const newUniformRow = {
          _id: uid(),
          totalPkgs: palletRow.totalPkgs || "",
          pkgsType: palletRow.pkgsType || "",
          uom: palletRow.uom || "",
          skuSize: palletRow.skuSize || "",
          packWeight: palletRow.packWeight || "",
          productName: palletRow.productName || "",
          wtLtr: palletRow.wtLtr || "",
          actualWt: palletRow.actualWt || "",
          chargedWt: palletRow.chargedWt || "",
          wtUom: palletRow.wtUom || "",
        };
        
        const calculatedRow = recalculateUniformWeights(newUniformRow);
        updatedUniformRows = [...updatedUniformRows, calculatedRow];
      } else {
        const matchingIndex = updatedUniformRows.findIndex(u => 
          u.totalPkgs === palletRow.totalPkgs &&
          u.pkgsType === palletRow.pkgsType &&
          u.uom === palletRow.uom &&
          u.skuSize === palletRow.skuSize &&
          u.packWeight === palletRow.packWeight &&
          u.productName === palletRow.productName
        );
        
        if (matchingIndex !== -1) {
          updatedUniformRows.splice(matchingIndex, 1);
        }
      }
      
      return {
        ...prev,
        PALLETIZATION: updatedPalletRows,
        "UNIFORM - BAGS/BOXES": updatedUniformRows,
      };
    });
  };

  /** =========================
   * UPDATE ORDER FUNCTION - FIXED for backend
   ========================= */
  const handleUpdate = async () => {
    // Validation
    if (!top.branch) {
      alert("Please select a branch");
      return;
    }
    
    // Validate plant rows
    const hasInvalidPlantRows = plantRows.some(row => !row.plantCode);
    if (hasInvalidPlantRows) {
      alert("Please select plant for all plant rows");
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
      
      // Prepare payload - ensure null for ObjectId fields
      const payload = {
        id: orderId, // Include the order ID for update
        
        // Header info
        branch: top.branch, // Will be ObjectId or null
        branchName: top.branchName,
        branchCode: top.branchCode,
        delivery: top.delivery,
        date: top.date,
        
        // Customer info - ensure null for ObjectId
        customerId: selectedCustomer?._id || null,
        customerCode: selectedCustomer?.customerCode || '',
        customerName: selectedCustomer?.customerName || '',
        contactPerson: selectedCustomer?.contactPersonName || '',
        partyName: selectedCustomer?.customerName || top.partyName || '',
        
        // Charges
        collectionCharges: num(top.collectionCharges) || 0,
        cancellationCharges: top.cancellationCharges || 'Nil',
        loadingCharges: top.loadingCharges || 'Nil',
        otherCharges: num(top.otherCharges) || 0,
        
        // Plant rows - ensure null for ObjectId fields
        plantRows: plantRows.map(row => ({
          _id: row._id,
          plantCode: row.plantCode || null, // Send null instead of empty string
          plantName: row.plantName || '',
          plantCodeValue: row.plantCodeValue || '',
          orderType: row.orderType || "Sales",
          pinCode: row.pinCode || "",
          pinCodeData: row.pinCodeData ? {
            pincode: row.pinCodeData.pincode,
            city: row.pinCodeData.city
          } : null,
          from: row.from || null, // Send null instead of empty string
          fromName: row.fromName || "",
          to: row.to || null, // Send null instead of empty string
          toName: row.toName || "",
          country: row.country || "",
          countryName: row.countryName || "",
          state: row.state || "",
          stateName: row.stateName || "",
          district: row.district || "",
          districtName: row.districtName || "",
          weight: num(row.weight) || 0,
          status: row.status || "Open",
          rate: 0,
          locationRate: 0
        })),
        
        // Pack data
        packData: {
          PALLETIZATION: packData.PALLETIZATION.map(row => ({
            noOfPallets: num(row.noOfPallets),
            unitPerPallets: num(row.unitPerPallets),
            totalPkgs: num(row.totalPkgs),
            pkgsType: row.pkgsType || "",
            uom: row.uom || "",
            skuSize: row.skuSize || "",
            packWeight: num(row.packWeight),
            productName: row.productName || "",
            wtLtr: num(row.wtLtr),
            actualWt: num(row.actualWt),
            chargedWt: num(row.chargedWt),
            wtUom: row.wtUom || "",
            isUniform: row.isUniform || false
          })),
          "UNIFORM - BAGS/BOXES": packData["UNIFORM - BAGS/BOXES"].map(row => ({
            totalPkgs: num(row.totalPkgs),
            pkgsType: row.pkgsType || "",
            uom: row.uom || "",
            skuSize: row.skuSize || "",
            packWeight: num(row.packWeight),
            productName: row.productName || "",
            wtLtr: num(row.wtLtr),
            actualWt: num(row.actualWt),
            chargedWt: num(row.chargedWt),
            wtUom: row.wtUom || ""
          })),
          "LOOSE - CARGO": packData["LOOSE - CARGO"].map(row => ({
            uom: row.uom || "",
            productName: row.productName || "",
            actualWt: num(row.actualWt),
            chargedWt: num(row.chargedWt)
          }))
        }
      };

      console.log("Sending update payload:", JSON.stringify(payload, null, 2));

      const res = await fetch('/api/order-panel', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("Response:", data);

      if (!res.ok) {
        throw new Error(data.message || `Failed to update order: ${res.status}`);
      }

      setSaveSuccess(true);
      
      alert(`✅ Order updated successfully!\nOrder Panel Number: ${top.orderNo}`);
      
      // Redirect back to list
      setTimeout(() => {
        router.push('/admin/order-panel');
      }, 2000);
      
    } catch (error) {
      console.error('Error updating order:', error);
      setSaveError(error.message || 'Failed to update order');
      alert(`❌ Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  /** =========================
   * CREATE FUNCTIONS
   ========================= */
  const handleCreateCustomer = () => {
    router.push('/admin/customer2');
  };

  const handleCreatePincode = () => {
    router.push('/admin/pincodes2');
  };

  const handleCreatePlant = () => {
    router.push('/admin/plant2');
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading order details...</p>
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
                onClick={() => router.push('/admin/order-panel')}
                className="text-sky-600 hover:text-sky-800 font-medium text-sm flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to List
              </button>
              <div className="text-lg font-extrabold text-slate-900">
                Edit Order Panel: {top.orderNo}
              </div>
            </div>
            {saveSuccess && (
              <div className="text-sm text-green-600 font-medium mt-1">
                ✅ Order updated successfully! Redirecting to list...
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
                  : 'bg-sky-600 hover:bg-sky-700'
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
              ) : 'Update Order'}
            </button>
          </div>
        </div>
      </div>

      {/* ===== Main Layout ===== */}
      <div className="mx-auto max-w-full p-4">
        {/* Header info */}
        <Card title="Order Details">
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12 md:col-span-4">
              <label className="text-xs font-bold text-slate-600">Order No</label>
              <div className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                {top.orderNo || "N/A"}
              </div>
            </div>
            
            {/* Branch Dropdown */}
            <div className="col-span-12 md:col-span-4 relative">
              <label className="text-xs font-bold text-slate-600">Branch *</label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <SearchableDropdown
                    items={branches}
                    selectedId={top.branch}
                    onSelect={handleBranchSelect}
                    placeholder="Search branch... *"
                    required={true}
                    displayField="name"
                    codeField="code"
                  />
                </div>
                <button
                  onClick={() => router.push('/admin/branches2')}
                  className="rounded-lg bg-green-600 px-3 py-2 text-xs font-bold text-white hover:bg-green-700 transition whitespace-nowrap"
                  title="Create New Branch"
                >
                  Create
                </button>
              </div>
            </div>
            
            <Select
              col="col-span-12 md:col-span-4"
              label="Delivery"
              value={top.delivery}
              onChange={(v) => setTop((p) => ({ ...p, delivery: v }))}
              options={DELIVERY_OPTIONS}
            />

            <Input
              col="col-span-12 md:col-span-4"
              type="date"
              label="Date"
              value={top.date}
              onChange={(v) => setTop((p) => ({ ...p, date: v }))}
            />
            
            {/* Customer Search */}
            <div className="col-span-12 md:col-span-8 relative">
              <label className="text-xs font-bold text-slate-600">Party Name *</label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={selectedCustomer ? selectedCustomer.customerName : customerSearchQuery}
                    onChange={(e) => handleCustomerSearch(e.target.value)}
                    onFocus={handleCustomerInputFocus}
                    onBlur={handleCustomerInputBlur}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    placeholder="Search customer by name... *"
                  />
                  
                  {/* Customer Search Dropdown */}
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
                              {customer.contactPersonName && ` • Contact: ${customer.contactPersonName}`}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-center text-sm text-slate-500">
                          {customerSearchQuery.trim() ? 
                            `No customers found for "${customerSearchQuery}"` : 
                            "No customers available"
                          }
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Input
              col="col-span-6 md:col-span-3"
              label="Collection Charges"
              value={top.collectionCharges}
              onChange={(v) =>
                setTop((p) => ({ ...p, collectionCharges: v }))
              }
              type="number"
            />
            <Input
              col="col-span-6 md:col-span-3"
              label="Cancellation Charges"
              value={top.cancellationCharges}
              onChange={(v) =>
                setTop((p) => ({ ...p, cancellationCharges: v }))
              }
            />
			
            <Input
              col="col-span-6 md:col-span-3"
              label="Loading Charges"
              value={top.loadingCharges}
              onChange={(v) => setTop((p) => ({ ...p, loadingCharges: v }))}
            />
            <Input
              col="col-span-6 md:col-span-3"
              label="Other Charges"
              value={top.otherCharges}
              onChange={(v) => setTop((p) => ({ ...p, otherCharges: v }))}
              type="number"
            />
          </div>
        </Card>

        <div className="mt-4">
          {/* Plant Code / Route Section */}
          <Card title="Plant Code / Route">
            <div className="mb-4 flex justify-between items-center">
              <div className="text-sm text-slate-600">
                Manage plant routes and distribution - Enter pincode to auto-fill location fields
              </div>
              <button
                onClick={addPlantRow}
                className="rounded-xl bg-yellow-600 px-4 py-2 text-sm font-bold text-white hover:bg-yellow-700 transition"
              >
                + Add Row
              </button>
            </div>
            <PlantGridTable
              rows={plantRows}
              onChange={updatePlantRow}
              onRemove={removePlantRow}
              onPlantChange={handlePlantChange}
              onPincodeChange={handlePincodeChange}
              plants={plants}
              countries={countries}
              states={states}
              districts={districts}
              branches={branches}
              pincodeAPI={pincodeAPI}
              pincodeInput={pincodeInput}
              onCreatePlant={handleCreatePlant}
              onCreatePincode={handleCreatePincode}
            />
          </Card>

          {/* PACK TYPE SECTIONS */}
          <div className="mt-4 space-y-6">
            {/* First Card: PALLETIZATION and LOOSE - CARGO with Dropdown */}
            <Card title="Pack Type">
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
                <button
                  onClick={() => addRow(activePack)}
                  className="rounded-xl bg-yellow-600 px-4 py-2 text-sm font-bold text-white hover:bg-yellow-700 transition"
                >
                  + Add Row to {activePack === "PALLETIZATION" ? "Palletization" : "Loose Cargo"}
                </button>
              </div>
              
              {/* Pack Type Form Table */}
              <PackTypeTable
                packType={activePack}
                rows={rows}
                onChange={(rowId, key, value) => updatePackRow(rowId, key, value, activePack)}
                onRemove={(id) => removeRow(activePack, id)}
                onDuplicate={(id) => duplicateRow(activePack, id)}
                onToggleUniform={toggleUniformMode}
              />
            </Card>

            {/* Second Card: UNIFORM - BAGS/BOXES */}
            <Card title="UNIFORM - BAGS / BOXES">
              <div className="mb-4 flex justify-between items-center">
                <div className="text-sm text-slate-600">
                  Manage uniform bags and boxes packaging
                </div>
                <button
                  onClick={() => addRow("UNIFORM - BAGS/BOXES")}
                  className="rounded-xl bg-yellow-600 px-4 py-2 text-sm font-bold text-white hover:bg-yellow-700 transition"
                >
                  + Add Row to Uniform Bags/Boxes
                </button>
              </div>
              
              {/* Uniform Bags/Boxes Table */}
              <PackTypeTable
                packType="UNIFORM - BAGS/BOXES"
                rows={uniformRows}
                onChange={(rowId, key, value) => updatePackRow(rowId, key, value, "UNIFORM - BAGS/BOXES")}
                onRemove={(id) => removeRow("UNIFORM - BAGS/BOXES", id)}
                onDuplicate={(id) => duplicateRow("UNIFORM - BAGS/BOXES", id)}
                onToggleUniform={toggleUniformMode}
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

/** =========================
 * COMPONENTS
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

function Input({ label, value, onChange, col = "", type = "text", required = false }) {
  return (
    <div className={col}>
      <label className="text-xs font-bold text-slate-600">{label}</label>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
        required={required}
      />
    </div>
  );
}

function Select({ label, value, onChange, options = [], col = "" }) {
  return (
    <div className={col}>
      <label className="text-xs font-bold text-slate-600">{label}</label>
      <select
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
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

/** =========================
 * Searchable Dropdown Component
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
      const item = items.find(i => i._id === selectedId);
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
    const display = item[displayField] || "";
    const code = item[codeField] ? `(${item[codeField]})` : "";
    return `${display} ${code}`.trim();
  };

  const handleSearch = (query) => {
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

/** =========================
 * Plant Grid Table Component with yellow header
 ========================= */
function PlantGridTable({ 
  rows, 
  onChange, 
  onRemove, 
  onPlantChange,
  onPincodeChange,
  plants,
  countries,
  states,
  districts,
  branches,
  pincodeAPI,
  pincodeInput,
  onCreatePlant,
  onCreatePincode
}) {
  const router = useRouter();
  const [stateData, setStateData] = useState({});
  const [districtData, setDistrictData] = useState({});

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

  const handleCountrySelect = async (rowId, country) => {
    if (country) {
      onChange(rowId, 'country', country.code);
      onChange(rowId, 'countryName', country.name);
      onChange(rowId, 'state', '');
      onChange(rowId, 'stateName', '');
      onChange(rowId, 'district', '');
      onChange(rowId, 'districtName', '');
      
      const statesForCountry = await fetchStatesForCountry(country.code);
      setStateData(prev => ({ ...prev, [country.code]: statesForCountry }));
    } else {
      onChange(rowId, 'country', '');
      onChange(rowId, 'countryName', '');
      onChange(rowId, 'state', '');
      onChange(rowId, 'stateName', '');
      onChange(rowId, 'district', '');
      onChange(rowId, 'districtName', '');
    }
  };

  const handleStateSelect = async (rowId, state) => {
    if (state) {
      onChange(rowId, 'state', state._id);
      onChange(rowId, 'stateName', state.name);
      onChange(rowId, 'district', '');
      onChange(rowId, 'districtName', '');
      
      const districtsForState = await fetchDistrictsForState(state._id);
      setDistrictData(prev => ({ ...prev, [state._id]: districtsForState }));
    } else {
      onChange(rowId, 'state', '');
      onChange(rowId, 'stateName', '');
      onChange(rowId, 'district', '');
      onChange(rowId, 'districtName', '');
    }
  };

  const handleDistrictSelect = (rowId, district) => {
    if (district) {
      onChange(rowId, 'district', district._id);
      onChange(rowId, 'districtName', district.name);
    } else {
      onChange(rowId, 'district', '');
      onChange(rowId, 'districtName', '');
    }
  };

  const handleBranchSelect = (rowId, field, branch) => {
    if (branch) {
      onChange(rowId, field, branch._id);
      if (field === 'from') {
        onChange(rowId, 'fromName', branch.name);
      } else if (field === 'to') {
        onChange(rowId, 'toName', branch.name);
      }
    } else {
      onChange(rowId, field, null);
      if (field === 'from') {
        onChange(rowId, 'fromName', '');
      } else if (field === 'to') {
        onChange(rowId, 'toName', '');
      }
    }
  };

  const cols = [
    { key: "plantCode", label: "Plant Code *", type: "plant", data: plants },
    { key: "plantName", label: "Plant Name", readOnly: true },
    { key: "orderType", label: "Order Type", options: ORDER_TYPES },
    { key: "pinCode", label: "Pin Code", type: "pincode" },
    { key: "from", label: "From", type: "branch", data: branches },
    { key: "to", label: "To", type: "branch", data: branches },
    { key: "country", label: "Country", type: "country", data: countries },
    { key: "state", label: "State", type: "state", data: [] },
    { key: "district", label: "District", type: "district", data: [] },
    { key: "weight", label: "Weight", type: "number" },
    { key: "status", label: "Status", options: STATUSES },
  ];

  return (
    <div className="overflow-auto rounded-xl border border-yellow-300">
      <table className="min-w-full w-full text-sm">
        <thead className="sticky top-0 bg-yellow-400 z-10">
          <tr>
            {cols.map((c) => (
              <th
                key={c.key}
                className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center"
              >
                {c.label}
              </th>
            ))}
            <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">
              Action
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r) => {
            const currentStates = stateData[r.country] || [];
            const currentDistricts = districtData[r.state] || [];
            const isPincodeLoading = pincodeAPI.loading && pincodeInput[r._id]?.length === 6;
            
            return (
              <tr key={r._id} className="hover:bg-yellow-50 even:bg-slate-50">
                {/* Plant Code */}
                <td className="border border-yellow-300 px-2 py-2 relative">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <TableSearchableDropdown
                        items={plants}
                        selectedId={r.plantCode}
                        onSelect={(plant) => {
                          if (plant) {
                            onPlantChange(r._id, plant._id);
                          } else {
                            onChange(r._id, 'plantCode', null);
                            onChange(r._id, 'plantName', '');
                            onChange(r._id, 'plantCodeValue', '');
                          }
                        }}
                        placeholder="Search plant... *"
                        required={true}
                        displayField="name"
                        codeField="code"
                        cellId={`plant-${r._id}`}
                      />
                    </div>
                    <button
                      onClick={onCreatePlant}
                      className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition whitespace-nowrap"
                      title="Create New Plant"
                    >
                      Create
                    </button>
                  </div>
                </td>

                {/* Plant Name */}
                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    type="text"
                    value={r.plantName || ""}
                    readOnly
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm outline-none"
                    placeholder="Auto-filled from plant selection"
                  />
                </td>

                {/* Order Type */}
                <td className="border border-yellow-300 px-2 py-2">
                  <select
                    value={r.orderType || ""}
                    onChange={(e) => onChange(r._id, 'orderType', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
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
                <td className="border border-yellow-300 px-2 py-2 relative">
                  <div className="relative">
                    <input
                      type="text"
                      value={r.pinCode || ""}
                      onChange={(e) => onPincodeChange(r._id, e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                      placeholder="Enter 6-digit pincode"
                      maxLength="6"
                    />
                    {isPincodeLoading && (
                      <div className="absolute right-2 top-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sky-500"></div>
                      </div>
                    )}
                  </div>
                  {pincodeAPI.error && r.pinCode?.length === 6 && (
                    <div className="text-xs text-red-500 mt-1">{pincodeAPI.error}</div>
                  )}
                </td>

                {/* From */}
                <td className="border border-yellow-300 px-2 py-2 relative">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <TableSearchableDropdown
                        items={branches}
                        selectedId={r.from}
                        onSelect={(branch) => handleBranchSelect(r._id, 'from', branch)}
                        placeholder="Search branch..."
                        displayField="name"
                        codeField="code"
                        cellId={`from-${r._id}`}
                      />
                    </div>
                  </div>
                </td>

                {/* To */}
                <td className="border border-yellow-300 px-2 py-2 relative">
                  {r.to ? (
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <TableSearchableDropdown
                          items={branches}
                          selectedId={r.to}
                          onSelect={(branch) => handleBranchSelect(r._id, 'to', branch)}
                          placeholder="Search branch..."
                          displayField="name"
                          codeField="code"
                          cellId={`to-${r._id}`}
                        />
                      </div>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={r.toName || ""}
                      onChange={(e) => {
                        onChange(r._id, 'toName', e.target.value);
                        onChange(r._id, 'to', null);
                      }}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                      placeholder={r.toName ? r.toName : "Enter city name or select branch"}
                    />
                  )}
                </td>

                {/* Country */}
                <td className="border border-yellow-300 px-2 py-2 relative">
                  <input
                    type="text"
                    value={r.countryName || r.country || ""}
                    readOnly
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm outline-none"
                    placeholder="Auto-filled from pincode"
                  />
                </td>

                {/* State */}
                <td className="border border-yellow-300 px-2 py-2 relative">
                  <input
                    type="text"
                    value={r.stateName || r.state || ""}
                    readOnly
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm outline-none"
                    placeholder="Auto-filled from pincode"
                  />
                </td>

                {/* District */}
                <td className="border border-yellow-300 px-2 py-2 relative">
                  <input
                    type="text"
                    value={r.districtName || r.district || ""}
                    readOnly
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm outline-none"
                    placeholder="Auto-filled from pincode"
                  />
                </td>

                {/* Weight */}
                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    type="number"
                    value={r.weight || ""}
                    onChange={(e) => onChange(r._id, 'weight', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    placeholder="Enter Weight"
                  />
                </td>

                {/* Status */}
                <td className="border border-yellow-300 px-2 py-2">
                  <select
                    value={r.status || ""}
                    onChange={(e) => onChange(r._id, 'status', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  >
                    <option value="">Select Status</option>
                    {STATUSES.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Action */}
                <td className="border border-yellow-300 px-2 py-2 text-center">
                  <button
                    onClick={() => onRemove(r._id)}
                    className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600 transition"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            );
          })}
          
          {rows.length === 0 && (
            <tr>
              <td colSpan={cols.length + 1} className="border border-yellow-300 px-4 py-8 text-center text-slate-400">
                No plant routes added. Click "+ Add Row" to add a new route.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/** =========================
 * Table Searchable Dropdown Component
 ========================= */
function TableSearchableDropdown({ 
  items, 
  selectedId, 
  onSelect, 
  onSearch,
  placeholder = "Search...",
  required = false,
  displayField = 'name',
  codeField = 'code',
  disabled = false,
  cellId = "",
  loading = false,
  renderItem = null
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef(null);
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
  }, [items, selectedId, displayField]);

  const getDisplayValue = (item) => {
    if (!item) return "";
    if (displayField === 'customerName') return item.customerName || "";
    const display = item[displayField] || "";
    const code = item[codeField] ? `(${item[codeField]})` : "";
    return `${display} ${code}`.trim();
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (onSearch) {
      onSearch(query);
    } else {
      if (!query.trim()) {
        setFilteredItems(items);
      } else {
        const filtered = items.filter(item => {
          const searchLower = query.toLowerCase();
          return (
            (item[displayField] && item[displayField].toLowerCase().includes(searchLower)) ||
            (item[codeField] && item[codeField].toLowerCase().includes(searchLower)) ||
            (item.customerName && item.customerName.toLowerCase().includes(searchLower))
          );
        });
        setFilteredItems(filtered);
      }
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
    if (!showDropdown && inputRef.current) {
      setFilteredItems(items);
      
      const inputRect = inputRef.current.getBoundingClientRect();
      const tableContainer = inputRef.current.closest('.overflow-auto');
      
      if (tableContainer) {
        setDropdownPosition({
          top: inputRect.bottom + window.scrollY + 4,
          left: inputRect.left + window.scrollX,
          width: inputRect.width
        });
      }
      
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
    <>
      <div className="relative">
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
        />
        {loading && (
          <div className="absolute right-2 top-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sky-500"></div>
          </div>
        )}
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
          {loading ? (
            <div className="p-3 text-center text-sm text-slate-500">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sky-500 mx-auto"></div>
              <p className="mt-1">Loading...</p>
            </div>
          ) : filteredItems.length > 0 ? (
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
                {renderItem ? (
                  renderItem(item)
                ) : (
                  <>
                    <div className="font-medium text-slate-800 text-sm">
                      {item[displayField] || item.customerName}
                    </div>
                    {item[codeField] && (
                      <div className="text-xs text-slate-500 mt-0.5">
                        Code: {item[codeField]}
                      </div>
                    )}
                  </>
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
    </>
  );
}

/** ===== Pack Type Table Component with Uniform Checkbox ===== */
function PackTypeTable({ packType, rows, onChange, onRemove, onDuplicate, onToggleUniform }) {
  const cols = useMemo(() => {
    if (packType === "PALLETIZATION") {
      return [
        { key: "noOfPallets", label: "NO OF PALLETS", type: "number", options: null },
        { key: "unitPerPallets", label: "UNIT PER PALLETS", type: "number", options: null },
        { key: "totalPkgs", label: "TOTAL PKGS", type: "number", options: null, readOnly: true },
        { key: "pkgsType", label: "PKG TYPE", type: "text", options: PKGS_TYPE_OPTIONS },
        { key: "uom", label: "UOM", type: "text", options: UOM_OPTIONS },
        { key: "skuSize", label: "SKU - SIZE", type: "text", options: SKU_SIZE_OPTIONS },
        { key: "packWeight", label: "PACK - WEIGHT", type: "number", options: null },
        { key: "productName", label: "PRODUCT NAME", type: "text", options: PRODUCT_NAME_OPTIONS },
        { key: "wtLtr", label: "WT (LTR)", type: "number", options: null, readOnly: true },
        { key: "actualWt", label: "ACTUAL - WT", type: "number", options: null, readOnly: true },
        { key: "chargedWt", label: "CHARGED - WT", type: "number", options: null },
        { key: "wtUom", label: "UOM", type: "text", options: UOM_OPTIONS },
      ];
    }

    if (packType === "UNIFORM - BAGS/BOXES") {
      return [
        { key: "totalPkgs", label: "TOTAL PKGS", type: "number", options: null },
        { key: "pkgsType", label: "PKG TYPE", type: "text", options: PKGS_TYPE_OPTIONS },
        { key: "uom", label: "UOM", type: "text", options: UOM_OPTIONS },
        { key: "skuSize", label: "SKU - SIZE", type: "text", options: SKU_SIZE_OPTIONS },
        { key: "packWeight", label: "PACK - WEIGHT", type: "number", options: null },
        { key: "productName", label: "PRODUCT NAME", type: "text", options: PRODUCT_NAME_OPTIONS },
        { key: "wtLtr", label: "WT (LTR)", type: "number", options: null, readOnly: true },
        { key: "actualWt", label: "ACTUAL - WT", type: "number", options: null, readOnly: true },
        { key: "chargedWt", label: "CHARGED - WT", type: "number", options: null },
        { key: "wtUom", label: "UOM", type: "text", options: UOM_OPTIONS },
      ];
    }

    // LOOSE - CARGO
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
            {/* Add Uniform checkbox column only for PALLETIZATION */}
            {packType === "PALLETIZATION" && (
              <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center w-16">
                UNIFORM
              </th>
            )}
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
          {rows.length ? (
            rows.map((r) => (
              <tr key={r._id} className="hover:bg-yellow-50 even:bg-slate-50">
                {/* Uniform checkbox only for PALLETIZATION */}
                {packType === "PALLETIZATION" && (
                  <td className="border border-yellow-300 px-2 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={r.isUniform || false}
                      onChange={() => onToggleUniform(r._id)}
                      className="h-4 w-4 rounded border-yellow-300 text-yellow-600 focus:ring-yellow-500 cursor-pointer"
                      title="Check to add to Uniform Bags/Boxes"
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
                        className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                          c.readOnly 
                            ? 'bg-slate-100 text-slate-700' 
                            : 'bg-white'
                        }`}
                        placeholder={c.readOnly ? "Auto-calculated" : `Enter ${c.label}`}
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
      </table>
    </div>
  );
}