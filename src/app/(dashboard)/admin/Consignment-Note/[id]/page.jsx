"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";

/** =========================
 * CONSTANTS
 ========================= */
const ORDER_TYPES = ["Sales", "STO Order", "Export", "Import"];
const HIRED_OWNED_OPTIONS = ["Hired", "Owned"];
const UNIT_OPTIONS = ["MT", "KG", "LTR", "TON", "M3", "PCS"];
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
  "YaraVita Stopit 1Ltr",
  "CN 25 Kgs"
];
const SKU_SIZE_OPTIONS = ["20 Kgs", "10 Kgs", "1 Kgs", "100 Ltr", "200 Kgs", "1 Ltr", "20"];
const BOE_INVOICE_OPTIONS = ["As Per Invoice", "As Per Bill Of Entry", "NA"];
const STATUS_OPTIONS = ["Pending", "Approved", "Rejected", "Completed", "Draft"];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** =========================
 * DEFAULT EMPTY ROWS FOR EACH PACK TYPE
 ========================= */
function defaultPalletizationRow() {
  return {
    _id: uid(),
    packType: "PALLETIZATION",
    noOfPallets: "",
    unitPerPallets: "",
    totalPkgs: "",
    pkgsType: "",
    uom: "MT",
    skuSize: "",
    packWeight: "",
    productName: "",
    wtLtr: "",
    actualWt: "",
    chargedWt: "",
    wtUom: "MT",
  };
}

function defaultUniformRow() {
  return {
    _id: uid(),
    packType: "UNIFORM - BAGS/BOXES",
    totalPkgs: "",
    pkgsType: "",
    uom: "",
    skuSize: "",
    packWeight: "",
    productName: "",
    wtLtr: "",
    actualWt: "",
    chargedWt: "",
    wtUom: "MT",
  };
}

function defaultLooseCargoRow() {
  return {
    _id: uid(),
    packType: "LOOSE - CARGO",
    uom: "MT",
    productName: "",
    actualWt: "",
    chargedWt: "",
  };
}

function defaultNonUniformRow() {
  return {
    _id: uid(),
    packType: "NON-UNIFORM - GENERAL CARGO",
    nos: "",
    productName: "",
    uom: "MT",
    length: "",
    width: "",
    height: "",
    actualWt: "",
    chargedWt: "",
  };
}

export default function EditConsignmentNote() {
  const router = useRouter();
  const params = useParams();
  const noteId = params.id;

  /** =========================
   * STATE
   ========================= */
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchingData, setFetchingData] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

  /** =========================
   * ORDER SEARCH STATE
   ========================= */
  const [showOrderDropdown, setShowOrderDropdown] = useState(false);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const orderDropdownRef = useRef(null);

  /** =========================
   * CUSTOMER DROPDOWN STATES
   ========================= */
  const [showConsignorDropdown, setShowConsignorDropdown] = useState(false);
  const [showConsigneeDropdown, setShowConsigneeDropdown] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [filteredConsignors, setFilteredConsignors] = useState([]);
  const [filteredConsignees, setFilteredConsignees] = useState([]);
  const consignorDropdownRef = useRef(null);
  const consigneeDropdownRef = useRef(null);

  /** =========================
   * ADDRESS TITLE DROPDOWN STATES
   ========================= */
  const [showConsignorAddressDropdown, setShowConsignorAddressDropdown] = useState(false);
  const [showConsigneeAddressDropdown, setShowConsigneeAddressDropdown] = useState(false);
  const [consignorAddresses, setConsignorAddresses] = useState([]);
  const [consigneeAddresses, setConsigneeAddresses] = useState([]);
  const consignorAddressRef = useRef(null);
  const consigneeAddressRef = useRef(null);

  /** =========================
   * VEHICLE NEGOTIATION STATE
   ========================= */
  const [vehicleNegotiationData, setVehicleNegotiationData] = useState(null);
  const [fetchingVehicleData, setFetchingVehicleData] = useState(false);

  /** =========================
   * HEADER STATE
   ========================= */
  const generateLRNo = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `LR-${year}${month}${day}-${random}`;
  };

  const getCurrentDateFormatted = () => {
    const date = new Date();
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const [header, setHeader] = useState({
    orderNo: "",
    partyName: "",
    orderType: "Sales",
    plantCode: "",
    plantName: "",
    hiredOwned: "Hired",
    vendorCode: "",
    vendorName: "",
    from: "",
    to: "",
    taluka: "",
    district: "",
    state: "",
    vehicleNo: "",
    partyNo: "",
    lrNo: generateLRNo(),
    lrDate: getCurrentDateFormatted(),
    unit: "MT",
    status: "Pending"
  });

  /** =========================
   * CONSIGNOR/CONSIGNEE STATE
   ========================= */
  const [consignor, setConsignor] = useState({
    name: "",
    address: "",
    customerId: "",
    selectedAddressTitle: ""
  });

  const [consignee, setConsignee] = useState({
    name: "",
    address: "",
    customerId: "",
    selectedAddressTitle: ""
  });

  /** =========================
   * INVOICE/BOE STATE
   ========================= */
  const [invoice, setInvoice] = useState({
    boeInvoice: "As Per Invoice",
    boeInvoiceNo: "",
    boeInvoiceDate: "",
    invoiceValue: "",
  });

  /** =========================
   * E-WAYBILL & CONTAINER STATE
   ========================= */
  const [ewaybill, setEwaybill] = useState({
    ewaybillNo: "",
    expiryDate: "",
    containerNo: "",
  });

  /** =========================
   * PRODUCT ROWS FOR EACH PACK TYPE
   ========================= */
  const [palletizationRows, setPalletizationRows] = useState([defaultPalletizationRow()]);
  const [uniformRows, setUniformRows] = useState([defaultUniformRow()]);
  const [looseCargoRows, setLooseCargoRows] = useState([defaultLooseCargoRow()]);
  const [nonUniformRows, setNonUniformRows] = useState([defaultNonUniformRow()]);

  /** =========================
   * FETCH ORDERS FROM API
   ========================= */
  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token found');
        setAllOrders([]);
        return;
      }
      
      const res = await fetch('/api/order-panel?format=table', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        throw new Error(`API returned ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.success && Array.isArray(data.data)) {
        setAllOrders(data.data);
        setFilteredOrders(data.data);
      } else {
        setAllOrders([]);
        setFilteredOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setAllOrders([]);
      setFilteredOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  /** =========================
   * FETCH CUSTOMERS FROM API
   ========================= */
  const fetchCustomers = async () => {
    setCustomersLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token found');
        setCustomers([]);
        return;
      }
      
      const res = await fetch('/api/customers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        throw new Error(`API returned ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.success && Array.isArray(data.data)) {
        const customersWithAddress = data.data.map(customer => ({
          ...customer,
          address: customer.address || customer.billingAddress || customer.shippingAddress || customer.customerAddress || ''
        }));
        setCustomers(customersWithAddress);
        setFilteredConsignors(customersWithAddress);
        setFilteredConsignees(customersWithAddress);
      } else {
        setCustomers([]);
        setFilteredConsignors([]);
        setFilteredConsignees([]);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
      setFilteredConsignors([]);
      setFilteredConsignees([]);
    } finally {
      setCustomersLoading(false);
    }
  };

  /** =========================
   * HELPER FUNCTION TO EXTRACT ADDRESSES FROM CUSTOMER
   ========================= */
  const extractAddressesFromCustomer = (customer) => {
    const addresses = [];
    
    if (customer.billingAddresses && Array.isArray(customer.billingAddresses)) {
      customer.billingAddresses.forEach((addr, idx) => {
        if (addr.address1 || addr.address2 || addr.city) {
          const addressText = `${addr.address1 || ''} ${addr.address2 || ''} ${addr.city || ''} ${addr.state || ''} ${addr.pin || ''}`.trim();
          if (addressText) {
            addresses.push({
              title: addr.title || `Billing Address ${idx + 1}`,
              address: addressText,
              type: 'billing',
              gstNumber: addr.gstNumber || ''
            });
          }
        }
      });
    }
    
    if (customer.shippingAddresses && Array.isArray(customer.shippingAddresses)) {
      customer.shippingAddresses.forEach((addr, idx) => {
        if (addr.address1 || addr.address2 || addr.city) {
          const addressText = `${addr.address1 || ''} ${addr.address2 || ''} ${addr.city || ''} ${addr.state || ''} ${addr.pin || ''}`.trim();
          if (addressText) {
            addresses.push({
              title: addr.title || `Shipping Address ${idx + 1}`,
              address: addressText,
              type: 'shipping',
              gstNumber: addr.gstNumber || ''
            });
          }
        }
      });
    }
    
    if (addresses.length === 0) {
      const oldAddress = customer.address || customer.billingAddress || customer.shippingAddress || customer.customerAddress || '';
      if (oldAddress) {
        addresses.push({
          title: 'Default Address',
          address: oldAddress,
          type: 'default',
          gstNumber: ''
        });
      }
    }
    
    return addresses;
  };

  /** =========================
   * FETCH VEHICLE NEGOTIATION BY ORDER NUMBER
   ========================= */
  const fetchVehicleNegotiationByOrder = async (orderNo) => {
    setFetchingVehicleData(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      
      const res = await fetch('/api/vehicle-negotiation?format=table', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) return null;
      
      const data = await res.json();
      
      if (data.success && Array.isArray(data.data)) {
        const matchingRecord = data.data.find(record => record.order === orderNo);
        
        if (matchingRecord && matchingRecord.vnId) {
          const detailRes = await fetch(`/api/vehicle-negotiation?id=${matchingRecord.vnId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          const detailData = await detailRes.json();
          
          if (detailData.success && detailData.data) {
            setVehicleNegotiationData(detailData.data);
            return detailData.data;
          }
        }
      }
      
      setVehicleNegotiationData(null);
      return null;
    } catch (error) {
      console.error('Error fetching vehicle negotiation:', error);
      setVehicleNegotiationData(null);
      return null;
    } finally {
      setFetchingVehicleData(false);
    }
  };

  /** =========================
   * FETCH CONSIGNMENT NOTE
   ========================= */
  const fetchConsignmentNote = async () => {
    setFetchLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch(`/api/consignment-note?id=${noteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch consignment note');
      }

      const note = data.data;
      console.log("📦 Consignment Note Data:", note);
      
      // Set header data
      setHeader({
        orderNo: note.header?.orderNo || "",
        partyName: note.header?.partyName || "",
        orderType: note.header?.orderType || "Sales",
        plantCode: note.header?.plantCode || "",
        plantName: note.header?.plantName || "",
        hiredOwned: note.header?.hiredOwned || "Hired",
        vendorCode: note.header?.vendorCode || "",
        vendorName: note.header?.vendorName || "",
        from: note.header?.from || "",
        to: note.header?.to || "",
        taluka: note.header?.taluka || "",
        district: note.header?.district || "",
        state: note.header?.state || "",
        vehicleNo: note.header?.vehicleNo || "",
        partyNo: note.header?.partyNo || "",
        lrNo: note.lrNo || generateLRNo(),
        lrDate: note.header?.lrDate || getCurrentDateFormatted(),
        unit: note.header?.unit || "MT",
        status: note.header?.status || "Pending"
      });

      // Set consignor
      setConsignor({
        name: note.consignor?.name || "",
        address: note.consignor?.address || "",
        customerId: note.consignor?.customerId || "",
        selectedAddressTitle: note.consignor?.selectedAddressTitle || ""
      });

      // Set consignee
      setConsignee({
        name: note.consignee?.name || "",
        address: note.consignee?.address || "",
        customerId: note.consignee?.customerId || "",
        selectedAddressTitle: note.consignee?.selectedAddressTitle || ""
      });

      // Set invoice
      setInvoice({
        boeInvoice: note.invoice?.boeInvoice || "As Per Invoice",
        boeInvoiceNo: note.invoice?.boeInvoiceNo || "",
        boeInvoiceDate: note.invoice?.boeInvoiceDate || "",
        invoiceValue: note.invoice?.invoiceValue || ""
      });

      // Set ewaybill
      setEwaybill({
        ewaybillNo: note.ewaybill?.ewaybillNo || "",
        expiryDate: note.ewaybill?.expiryDate || "",
        containerNo: note.ewaybill?.containerNo || ""
      });

      // Set pack data from note
      if (note.packData) {
        // Palletization
        if (note.packData.PALLETIZATION && note.packData.PALLETIZATION.length > 0) {
          setPalletizationRows(note.packData.PALLETIZATION.map(row => ({
            ...row,
            _id: row._id || uid()
          })));
        } else {
          setPalletizationRows([defaultPalletizationRow()]);
        }

        // Uniform
        if (note.packData['UNIFORM - BAGS/BOXES'] && note.packData['UNIFORM - BAGS/BOXES'].length > 0) {
          setUniformRows(note.packData['UNIFORM - BAGS/BOXES'].map(row => ({
            ...row,
            _id: row._id || uid()
          })));
        } else {
          setUniformRows([defaultUniformRow()]);
        }

        // Loose Cargo
        if (note.packData['LOOSE - CARGO'] && note.packData['LOOSE - CARGO'].length > 0) {
          setLooseCargoRows(note.packData['LOOSE - CARGO'].map(row => ({
            ...row,
            _id: row._id || uid()
          })));
        } else {
          setLooseCargoRows([defaultLooseCargoRow()]);
        }

        // Non-Uniform
        if (note.packData['NON-UNIFORM - GENERAL CARGO'] && note.packData['NON-UNIFORM - GENERAL CARGO'].length > 0) {
          setNonUniformRows(note.packData['NON-UNIFORM - GENERAL CARGO'].map(row => ({
            ...row,
            _id: row._id || uid()
          })));
        } else {
          setNonUniformRows([defaultNonUniformRow()]);
        }
      }

      // Check if note has a linked order to make it read-only
      if (note.header?.orderNo) {
        setIsReadOnly(true);
      }

    } catch (error) {
      console.error('Error fetching consignment note:', error);
      setApiError(error.message);
      alert(`❌ Failed to load consignment note: ${error.message}`);
    } finally {
      setFetchLoading(false);
    }
  };

  /** =========================
   * LOAD DATA ON MOUNT
   ========================= */
  useEffect(() => {
    fetchOrders();
    fetchCustomers();
    if (noteId) {
      fetchConsignmentNote();
    }
  }, [noteId]);

  /** =========================
   * ORDER SEARCH HANDLERS
   ========================= */
  const handleOrderSearch = (query) => {
    setHeader(prev => ({ ...prev, orderNo: query }));
    
    if (!allOrders || allOrders.length === 0) {
      setFilteredOrders([]);
      return;
    }
    
    if (query.trim() === "") {
      setFilteredOrders(allOrders);
    } else {
      const filtered = allOrders.filter(order => {
        const orderNo = order.orderNo || order.orderPanelNo;
        return orderNo?.toLowerCase().includes(query.toLowerCase());
      });
      setFilteredOrders(filtered);
    }
  };

  const handleSelectOrder = async (order) => {
    setFetchingData(true);
    
    try {
      const token = localStorage.getItem('token');
      const orderId = order._id || order.originalOrderId;
      
      let fullOrder = order;
      
      if (orderId) {
        const res = await fetch(`/api/order-panel?id=${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const data = await res.json();
        if (data.success && data.data) {
          fullOrder = data.data;
        }
      }
      
      const orderNo = fullOrder.orderPanelNo || fullOrder.orderNo || order.orderNo || '';
      const partyName = fullOrder.partyName || fullOrder.customerName || order.partyName || '';
      
      let plantCode = '';
      let plantName = '';
      
      if (fullOrder.plantRows && fullOrder.plantRows.length > 0) {
        const firstRow = fullOrder.plantRows[0];
        plantCode = firstRow.plantCodeValue || firstRow.plantCode || '';
        plantName = firstRow.plantName || '';
      }
      
      let fromLocation = fullOrder.from || order.from || '';
      let toLocation = fullOrder.to || order.to || '';
      let taluka = fullOrder.taluka || order.taluka || '';
      let district = fullOrder.district || order.district || '';
      let state = fullOrder.state || order.state || '';
      
      if (fullOrder.plantRows && fullOrder.plantRows.length > 0) {
        const firstRow = fullOrder.plantRows[0];
        fromLocation = firstRow.fromName || firstRow.from || fromLocation;
        toLocation = firstRow.toName || firstRow.to || toLocation;
        taluka = firstRow.talukaName || firstRow.taluka || taluka;
        district = firstRow.districtName || firstRow.district || district;
        state = firstRow.stateName || firstRow.state || state;
      }
      
      // Fetch vehicle negotiation data for this order
      const vehicleData = await fetchVehicleNegotiationByOrder(orderNo);
      
      if (vehicleData && vehicleData.approval) {
        setHeader(prev => ({
          ...prev,
          orderNo: orderNo,
          partyName: partyName,
          plantCode: plantCode,
          plantName: plantName,
          from: fromLocation,
          to: toLocation,
          taluka: taluka,
          district: district,
          state: state,
          vendorCode: vehicleData.approval.vendorCode || prev.vendorCode,
          vendorName: vehicleData.approval.vendorName || prev.vendorName,
          vehicleNo: vehicleData.approval.vehicleNo || prev.vehicleNo,
          partyNo: vehicleData.approval.mobile || prev.partyNo,
        }));
      } else {
        setHeader(prev => ({
          ...prev,
          orderNo: orderNo,
          partyName: partyName,
          plantCode: plantCode,
          plantName: plantName,
          from: fromLocation,
          to: toLocation,
          taluka: taluka,
          district: district,
          state: state,
        }));
      }
      
      setConsignor(prev => ({
        ...prev,
        name: partyName
      }));
      
      setIsReadOnly(true);
      
      if (fullOrder.packData) {
        if (fullOrder.packData.PALLETIZATION && fullOrder.packData.PALLETIZATION.length > 0) {
          const palletRows = fullOrder.packData.PALLETIZATION.map(item => ({
            _id: uid(),
            packType: "PALLETIZATION",
            noOfPallets: item.noOfPallets?.toString() || "",
            unitPerPallets: item.unitPerPallets?.toString() || "",
            totalPkgs: item.totalPkgs?.toString() || "",
            pkgsType: item.pkgsType || "",
            uom: item.uom || "MT",
            skuSize: item.skuSize || "",
            packWeight: item.packWeight?.toString() || "",
            productName: item.productName || "",
            wtLtr: item.wtLtr?.toString() || "",
            actualWt: item.actualWt?.toString() || "",
            chargedWt: item.chargedWt?.toString() || "",
            wtUom: item.wtUom || "MT",
          }));
          setPalletizationRows(palletRows);
        }
        
        if (fullOrder.packData['UNIFORM - BAGS/BOXES'] && fullOrder.packData['UNIFORM - BAGS/BOXES'].length > 0) {
          const uniformRowsData = fullOrder.packData['UNIFORM - BAGS/BOXES'].map(item => ({
            _id: uid(),
            packType: "UNIFORM - BAGS/BOXES",
            totalPkgs: item.totalPkgs?.toString() || "",
            pkgsType: item.pkgsType || "",
            uom: item.uom || "",
            skuSize: item.skuSize || "",
            packWeight: item.packWeight?.toString() || "",
            productName: item.productName || "",
            wtLtr: item.wtLtr?.toString() || "",
            actualWt: item.actualWt?.toString() || "",
            chargedWt: item.chargedWt?.toString() || "",
            wtUom: item.wtUom || "MT",
          }));
          setUniformRows(uniformRowsData);
        }
        
        if (fullOrder.packData['LOOSE - CARGO'] && fullOrder.packData['LOOSE - CARGO'].length > 0) {
          const looseRowsData = fullOrder.packData['LOOSE - CARGO'].map(item => ({
            _id: uid(),
            packType: "LOOSE - CARGO",
            uom: item.uom || "MT",
            productName: item.productName || "",
            actualWt: item.actualWt?.toString() || "",
            chargedWt: item.chargedWt?.toString() || "",
          }));
          setLooseCargoRows(looseRowsData);
        }
        
        if (fullOrder.packData['NON-UNIFORM - GENERAL CARGO'] && fullOrder.packData['NON-UNIFORM - GENERAL CARGO'].length > 0) {
          const nonUniformRowsData = fullOrder.packData['NON-UNIFORM - GENERAL CARGO'].map(item => ({
            _id: uid(),
            packType: "NON-UNIFORM - GENERAL CARGO",
            nos: item.nos?.toString() || "",
            productName: item.productName || "",
            uom: item.uom || "MT",
            length: item.length?.toString() || "",
            width: item.width?.toString() || "",
            height: item.height?.toString() || "",
            actualWt: item.actualWt?.toString() || "",
            chargedWt: item.chargedWt?.toString() || "",
          }));
          setNonUniformRows(nonUniformRowsData);
        }
      }
      
      alert(`✅ Order ${orderNo} loaded successfully! Data is now read-only.`);
      
    } catch (error) {
      console.error('Error fetching order details:', error);
      alert(`❌ Failed to load order details: ${error.message}`);
    } finally {
      setFetchingData(false);
      setShowOrderDropdown(false);
    }
  };

  const handleOrderInputFocus = () => {
    if (!showOrderDropdown && allOrders && allOrders.length > 0) {
      setFilteredOrders(allOrders);
      setShowOrderDropdown(true);
    } else if (!allOrders || allOrders.length === 0) {
      fetchOrders();
    }
  };

  const handleOrderInputBlur = () => {
    setTimeout(() => {
      if (orderDropdownRef.current && !orderDropdownRef.current.contains(document.activeElement)) {
        setShowOrderDropdown(false);
      }
    }, 200);
  };

  /** =========================
   * CUSTOMER DROPDOWN HANDLERS
   ========================= */
  const handleConsignorSearch = (query) => {
    setConsignor(prev => ({ ...prev, name: query }));
    
    if (!customers || customers.length === 0) {
      setFilteredConsignors([]);
      return;
    }
    
    if (query.trim() === "") {
      setFilteredConsignors(customers);
    } else {
      const filtered = customers.filter(customer =>
        customer.customerName?.toLowerCase().includes(query.toLowerCase()) ||
        customer.customerCode?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredConsignors(filtered);
    }
  };

  const handleSelectConsignor = (customer) => {
    const addresses = extractAddressesFromCustomer(customer);
    
    setConsignor({
      name: customer.customerName,
      address: addresses.length > 0 ? addresses[0].address : '',
      customerId: customer._id,
      selectedAddressTitle: addresses.length > 0 ? addresses[0].title : ''
    });
    
    setConsignorAddresses(addresses);
    setShowConsignorDropdown(false);
  };

  const handleConsignorInputFocus = () => {
    if (!showConsignorDropdown) {
      if (customers.length === 0) {
        fetchCustomers();
      } else {
        setFilteredConsignors(customers);
        setShowConsignorDropdown(true);
      }
    }
  };

  const handleConsignorInputBlur = () => {
    setTimeout(() => {
      if (consignorDropdownRef.current && !consignorDropdownRef.current.contains(document.activeElement)) {
        setShowConsignorDropdown(false);
      }
    }, 200);
  };

  const handleSelectConsignorAddress = (addressObj) => {
    setConsignor(prev => ({
      ...prev,
      address: addressObj.address,
      selectedAddressTitle: addressObj.title
    }));
    setShowConsignorAddressDropdown(false);
  };

  const handleConsigneeSearch = (query) => {
    setConsignee(prev => ({ ...prev, name: query }));
    
    if (!customers || customers.length === 0) {
      setFilteredConsignees([]);
      return;
    }
    
    if (query.trim() === "") {
      setFilteredConsignees(customers);
    } else {
      const filtered = customers.filter(customer =>
        customer.customerName?.toLowerCase().includes(query.toLowerCase()) ||
        customer.customerCode?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredConsignees(filtered);
    }
  };

  const handleSelectConsignee = (customer) => {
    const addresses = extractAddressesFromCustomer(customer);
    
    setConsignee({
      name: customer.customerName,
      address: addresses.length > 0 ? addresses[0].address : '',
      customerId: customer._id,
      selectedAddressTitle: addresses.length > 0 ? addresses[0].title : ''
    });
    
    setConsigneeAddresses(addresses);
    setShowConsigneeDropdown(false);
  };

  const handleConsigneeInputFocus = () => {
    if (!showConsigneeDropdown) {
      if (customers.length === 0) {
        fetchCustomers();
      } else {
        setFilteredConsignees(customers);
        setShowConsigneeDropdown(true);
      }
    }
  };

  const handleConsigneeInputBlur = () => {
    setTimeout(() => {
      if (consigneeDropdownRef.current && !consigneeDropdownRef.current.contains(document.activeElement)) {
        setShowConsigneeDropdown(false);
      }
    }, 200);
  };

  const handleSelectConsigneeAddress = (addressObj) => {
    setConsignee(prev => ({
      ...prev,
      address: addressObj.address,
      selectedAddressTitle: addressObj.title
    }));
    setShowConsigneeAddressDropdown(false);
  };

  /** =========================
   * PRODUCT ROW HANDLERS FOR EACH PACK TYPE
   ========================= */
  // Palletization
  const addPalletizationRow = () => setPalletizationRows([...palletizationRows, defaultPalletizationRow()]);
  const updatePalletizationRow = (id, field, value) => {
    setPalletizationRows(prev => prev.map(row => 
      row._id === id ? { ...row, [field]: value } : row
    ));
  };
  const removePalletizationRow = (id) => {
    if (palletizationRows.length > 1) {
      setPalletizationRows(prev => prev.filter(row => row._id !== id));
    }
  };

  // Uniform
  const addUniformRow = () => setUniformRows([...uniformRows, defaultUniformRow()]);
  const updateUniformRow = (id, field, value) => {
    setUniformRows(prev => prev.map(row => 
      row._id === id ? { ...row, [field]: value } : row
    ));
  };
  const removeUniformRow = (id) => {
    if (uniformRows.length > 1) {
      setUniformRows(prev => prev.filter(row => row._id !== id));
    }
  };

  // Loose Cargo
  const addLooseCargoRow = () => setLooseCargoRows([...looseCargoRows, defaultLooseCargoRow()]);
  const updateLooseCargoRow = (id, field, value) => {
    setLooseCargoRows(prev => prev.map(row => 
      row._id === id ? { ...row, [field]: value } : row
    ));
  };
  const removeLooseCargoRow = (id) => {
    if (looseCargoRows.length > 1) {
      setLooseCargoRows(prev => prev.filter(row => row._id !== id));
    }
  };

  // Non-Uniform
  const addNonUniformRow = () => setNonUniformRows([...nonUniformRows, defaultNonUniformRow()]);
  const updateNonUniformRow = (id, field, value) => {
    setNonUniformRows(prev => prev.map(row => 
      row._id === id ? { ...row, [field]: value } : row
    ));
  };
  const removeNonUniformRow = (id) => {
    if (nonUniformRows.length > 1) {
      setNonUniformRows(prev => prev.filter(row => row._id !== id));
    }
  };

  /** =========================
   * CALCULATED VALUES
   ========================= */
  const calculateTotalActualWt = () => {
    let total = 0;
    palletizationRows.forEach(row => total += num(row.actualWt));
    uniformRows.forEach(row => total += num(row.actualWt));
    looseCargoRows.forEach(row => total += num(row.actualWt));
    nonUniformRows.forEach(row => total += num(row.actualWt));
    return total;
  };

  /** =========================
   * HANDLE UPDATE
   ========================= */
  const handleUpdate = async () => {
    if (!header.partyName) {
      alert("Please enter party name");
      return;
    }

    if (!header.vendorName) {
      alert("Please enter vendor name");
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      const payload = {
        id: noteId,
        header,
        consignor,
        consignee,
        invoice,
        ewaybill,
        packData: {
          PALLETIZATION: palletizationRows,
          'UNIFORM - BAGS/BOXES': uniformRows,
          'LOOSE - CARGO': looseCargoRows,
          'NON-UNIFORM - GENERAL CARGO': nonUniformRows
        },
        totalWeight: calculateTotalActualWt(),
      };

      console.log("Updating consignment note:", payload);

      const res = await fetch('/api/consignment-note', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: `HTTP error! status: ${res.status}` }));
        throw new Error(errorData.message || 'Failed to update consignment note');
      }

      const data = await res.json();
      
      alert(`✅ Consignment Note updated successfully!\nLR No: ${header.lrNo}`);
      
      router.push('/admin/Consignment-Note');
      
    } catch (error) {
      console.error('Error updating consignment note:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Get vehicle negotiation summary for display
  const getVehicleSummary = () => {
    if (!vehicleNegotiationData?.approval) return null;
    
    const approval = vehicleNegotiationData.approval;
    return {
      vehicleNo: approval.vehicleNo || 'N/A',
      vendorName: approval.vendorName || 'N/A',
      vendorCode: approval.vendorCode || 'N/A',
      mobile: approval.mobile || 'N/A',
      rateType: approval.rateType || 'N/A',
      finalRate: approval.rateType === 'Per MT' ? approval.finalPerMT : approval.finalFix,
      approvalStatus: approval.approvalStatus || 'Pending'
    };
  };

  const vehicleSummary = getVehicleSummary();

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading consignment note...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* ===== Sticky Top Bar ===== */}
      <div className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-full px-4 py-3 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/admin/Consignment-Note')}
                className="text-purple-600 hover:text-purple-800 font-medium text-sm flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to List
              </button>
              <div className="text-lg font-extrabold text-slate-900">
                Edit Consignment Note: {header.lrNo}
              </div>
            </div>
            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
              <span>Status: {header.status}</span>
              {isReadOnly && (
                <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full text-xs">
                  🔒 Read Only Mode - Data loaded from Order
                </span>
              )}
              {fetchingVehicleData && (
                <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-xs flex items-center">
                  <svg className="animate-spin h-3 w-3 mr-1" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Fetching vehicle data...
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
              onClick={handleUpdate}
              disabled={saving || fetchingData || isReadOnly}
              className={`rounded-xl px-5 py-2 text-sm font-bold text-white transition ${
                saving || fetchingData || isReadOnly
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-emerald-600 hover:bg-emerald-700'
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
              ) : 'Update LR'}
            </button>
          </div>
        </div>
      </div>

      {/* ===== Main Content ===== */}
      <div className="mx-auto max-w-full p-4">
        {/* ===== Order Selection ===== */}
        <Card title="Select Order">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-4 relative" ref={orderDropdownRef}>
              <label className="text-xs font-bold text-slate-600">Order No *</label>
              <div className="relative">
                <input
                  type="text"
                  value={header.orderNo}
                  onChange={(e) => handleOrderSearch(e.target.value)}
                  onFocus={handleOrderInputFocus}
                  onBlur={handleOrderInputBlur}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 pr-8"
                  placeholder="Search order no..."
               
                />
                {ordersLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="animate-spin h-4 w-4 text-purple-500" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </div>
              {showOrderDropdown && !isReadOnly && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {ordersLoading ? (
                    <div className="p-3 text-center text-sm text-slate-500">Loading orders...</div>
                  ) : filteredOrders.length > 0 ? (
                    filteredOrders.map((order, index) => (
                      <div
                        key={order._id || index}
                        onMouseDown={() => handleSelectOrder(order)}
                        className="p-3 hover:bg-purple-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors"
                      >
                        <div className="font-medium text-slate-800">
                          {order.orderNo || order.orderPanelNo}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Party: {order.partyName || order.customerName || 'N/A'}
                        </div>
                        <div className="text-xs text-slate-400">
                          From: {order.from || 'N/A'} → To: {order.to || 'N/A'}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-sm text-slate-500">
                      {header.orderNo.trim() ? 
                        `No orders found for "${header.orderNo}"` : 
                        "No orders available. Please create orders first."
                      }
                    </div>
                  )}
                </div>
              )}
              <div className="text-xs text-slate-400 mt-1">Search and select order to auto-fill details (Read Only after selection)</div>
            </div>
          </div>
        </Card>

        {/* ===== Vehicle Negotiation Summary Card ===== */}
        {vehicleSummary && (
          <div className="mt-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="text-sm font-extrabold text-green-800">Vehicle Negotiation Data Found</h3>
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                  vehicleSummary.approvalStatus === 'Approved' ? 'bg-green-100 text-green-700' :
                  vehicleSummary.approvalStatus === 'Reject' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {vehicleSummary.approvalStatus}
                </span>
              </div>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-3">
                  <div className="text-xs text-green-600 font-medium">Vehicle No</div>
                  <div className="text-sm font-bold text-green-800">{vehicleSummary.vehicleNo}</div>
                </div>
                <div className="col-span-12 md:col-span-3">
                  <div className="text-xs text-green-600 font-medium">Vendor Name</div>
                  <div className="text-sm font-bold text-green-800">{vehicleSummary.vendorName}</div>
                  <div className="text-xs text-green-500">Code: {vehicleSummary.vendorCode}</div>
                </div>
                <div className="col-span-12 md:col-span-3">
                  <div className="text-xs text-green-600 font-medium">Mobile No</div>
                  <div className="text-sm font-bold text-green-800">{vehicleSummary.mobile}</div>
                </div>
                <div className="col-span-12 md:col-span-3">
                  <div className="text-xs text-green-600 font-medium">Rate Details</div>
                  <div className="text-sm font-bold text-green-800">
                    {vehicleSummary.rateType}: {vehicleSummary.finalRate}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== Party Information ===== */}
        <Card title="Party Information">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Party Name *</label>
              <input
                type="text"
                value={header.partyName}
                onChange={(e) => setHeader({ ...header, partyName: e.target.value })}
                readOnly={isReadOnly}
                className={`mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                placeholder="Enter party name"
              />
            </div>

            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Order No</label>
              <input
                type="text"
                value={header.orderNo}
                readOnly
                className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed"
              />
            </div>

            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Order Type</label>
              <select
                value={header.orderType}
                onChange={(e) => setHeader({ ...header, orderType: e.target.value })}
                disabled={isReadOnly}
                className={`mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
              >
                {ORDER_TYPES.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Plant Code</label>
              <input
                type="text"
                value={header.plantCode}
                readOnly
                className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed"
              />
            </div>

            <div className="col-span-12 md:col-span-1">
              <label className="text-xs font-bold text-slate-600">Hired/Owned</label>
              <select
                value={header.hiredOwned}
                onChange={(e) => setHeader({ ...header, hiredOwned: e.target.value })}
                disabled={isReadOnly}
                className={`mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
              >
                {HIRED_OWNED_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Vendor Code</label>
              <input
                type="text"
                value={header.vendorCode}
                onChange={(e) => setHeader({ ...header, vendorCode: e.target.value })}
                readOnly={isReadOnly || !!vehicleNegotiationData}
                className={`mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 ${(isReadOnly || vehicleNegotiationData) ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                placeholder="Enter vendor code"
              />
            </div>

            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Vendor Name *</label>
              <input
                type="text"
                value={header.vendorName}
                onChange={(e) => setHeader({ ...header, vendorName: e.target.value })}
                readOnly={isReadOnly || !!vehicleNegotiationData}
                className={`mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 ${(isReadOnly || vehicleNegotiationData) ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                placeholder="Enter vendor name"
              />
            </div>

            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">From</label>
              <input
                type="text"
                value={header.from}
                readOnly
                className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed"
              />
            </div>

            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">To</label>
              <input
                type="text"
                value={header.to}
                readOnly
                className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed"
              />
            </div>

            <div className="col-span-12 md:col-span-1">
              <label className="text-xs font-bold text-slate-600">Taluka</label>
              <input
                type="text"
                value={header.taluka}
                readOnly
                className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed"
              />
            </div>

            <div className="col-span-12 md:col-span-1">
              <label className="text-xs font-bold text-slate-600">District</label>
              <input
                type="text"
                value={header.district}
                readOnly
                className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed"
              />
            </div>

            <div className="col-span-12 md:col-span-1">
              <label className="text-xs font-bold text-slate-600">State</label>
              <input
                type="text"
                value={header.state}
                readOnly
                className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed"
              />
            </div>

            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Vehicle No</label>
              <input
                type="text"
                value={header.vehicleNo}
                onChange={(e) => setHeader({ ...header, vehicleNo: e.target.value })}
                readOnly={isReadOnly || !!vehicleNegotiationData}
                className={`mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 ${(isReadOnly || vehicleNegotiationData) ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                placeholder="HR38X8960"
              />
            </div>

            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Party/Mobile No</label>
              <input
                type="text"
                value={header.partyNo}
                onChange={(e) => setHeader({ ...header, partyNo: e.target.value })}
                readOnly={isReadOnly || !!vehicleNegotiationData}
                className={`mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 ${(isReadOnly || vehicleNegotiationData) ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                placeholder="8182482111"
              />
            </div>

            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">LR No</label>
              <input
                type="text"
                value={header.lrNo}
                readOnly
                className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed"
              />
            </div>

            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">LR Date</label>
              <input
                type="text"
                value={header.lrDate}
                onChange={(e) => setHeader({ ...header, lrDate: e.target.value })}
                readOnly={isReadOnly}
                className={`mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                placeholder="DD.MM.YYYY"
              />
            </div>

            <div className="col-span-12 md:col-span-1">
              <label className="text-xs font-bold text-slate-600">Unit</label>
              <select
                value={header.unit}
                onChange={(e) => setHeader({ ...header, unit: e.target.value })}
                disabled={isReadOnly}
                className={`mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
              >
                {UNIT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="col-span-12 md:col-span-1">
              <label className="text-xs font-bold text-slate-600">Status</label>
              <select
                value={header.status}
                onChange={(e) => setHeader({ ...header, status: e.target.value })}
                disabled={isReadOnly}
                className={`mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* ===== Consignor & Consignee ===== */}
        <div className="mt-4">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-6">
              <Card title="Consignor (Sender)">
                <div className="space-y-3">
                  <div className="relative" ref={consignorDropdownRef}>
                    <label className="text-xs font-bold text-slate-600">Consignor Name *</label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={consignor.name}
                          onChange={(e) => handleConsignorSearch(e.target.value)}
                          onFocus={handleConsignorInputFocus}
                          onBlur={handleConsignorInputBlur}
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                          placeholder="Search customer by name..."
                          autoComplete="off"
                        />
                        {showConsignorDropdown && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                            {customersLoading ? (
                              <div className="p-3 text-center text-sm text-slate-500">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500 mx-auto"></div>
                                <p className="mt-1">Loading customers...</p>
                              </div>
                            ) : filteredConsignors.length > 0 ? (
                              filteredConsignors.map((customer) => {
                                const addresses = extractAddressesFromCustomer(customer);
                                const addressCount = addresses.length;
                                
                                return (
                                  <div
                                    key={customer._id}
                                    onMouseDown={() => handleSelectConsignor(customer)}
                                    className="p-3 hover:bg-purple-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors"
                                  >
                                    <div className="font-medium text-slate-800">{customer.customerName}</div>
                                    <div className="text-xs text-slate-500 mt-1">
                                      Code: {customer.customerCode}
                                      {customer.contactPersonName && ` • Contact: ${customer.contactPersonName}`}
                                      {addressCount > 0 && ` • ${addressCount} address(es)`}
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="p-3 text-center text-sm text-slate-500">
                                {consignor.name.trim() ? 
                                  `No customers found for "${consignor.name}"` : 
                                  "No customers available"
                                }
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Address Title Dropdown */}
                  <div className="relative" ref={consignorAddressRef}>
                    <label className="text-xs font-bold text-slate-600">Select Address Title</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={consignor.selectedAddressTitle}
                        onFocus={() => {
                          if (consignor.customerId && consignorAddresses.length > 0) {
                            setShowConsignorAddressDropdown(true);
                          }
                        }}
                        onBlur={handleConsignorInputBlur}
                        readOnly
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-50 px-3 py-2 text-sm outline-none cursor-pointer"
                        placeholder={consignorAddresses.length > 0 ? "Select an address..." : "No addresses available"}
                      />
                      {showConsignorAddressDropdown && consignorAddresses.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                          {consignorAddresses.map((addr, idx) => (
                            <div
                              key={idx}
                              onMouseDown={() => handleSelectConsignorAddress(addr)}
                              className="p-3 hover:bg-purple-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                            >
                              <div className="font-medium text-slate-800">{addr.title}</div>
                              <div className="text-xs text-slate-500 mt-1">{addr.address.substring(0, 100)}...</div>
                              {addr.gstNumber && (
                                <div className="text-xs text-slate-400 mt-0.5">GST: {addr.gstNumber}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-slate-600">Consignor Address</label>
                    <textarea
                      value={consignor.address}
                      onChange={(e) => setConsignor({ ...consignor, address: e.target.value })}
                      rows={4}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                      placeholder="Enter complete address"
                    />
                    {consignor.address && consignor.customerId && (
                      <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Address auto-filled from selected customer
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            <div className="col-span-12 md:col-span-6">
              <Card title="Consignee (Receiver)">
                <div className="space-y-3">
                  <div className="relative" ref={consigneeDropdownRef}>
                    <label className="text-xs font-bold text-slate-600">Consignee Name *</label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={consignee.name}
                          onChange={(e) => handleConsigneeSearch(e.target.value)}
                          onFocus={handleConsigneeInputFocus}
                          onBlur={handleConsigneeInputBlur}
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                          placeholder="Search customer by name..."
                          autoComplete="off"
                        />
                        {showConsigneeDropdown && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                            {customersLoading ? (
                              <div className="p-3 text-center text-sm text-slate-500">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500 mx-auto"></div>
                                <p className="mt-1">Loading customers...</p>
                              </div>
                            ) : filteredConsignees.length > 0 ? (
                              filteredConsignees.map((customer) => {
                                const addresses = extractAddressesFromCustomer(customer);
                                const addressCount = addresses.length;
                                
                                return (
                                  <div
                                    key={customer._id}
                                    onMouseDown={() => handleSelectConsignee(customer)}
                                    className="p-3 hover:bg-purple-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors"
                                  >
                                    <div className="font-medium text-slate-800">{customer.customerName}</div>
                                    <div className="text-xs text-slate-500 mt-1">
                                      Code: {customer.customerCode}
                                      {customer.contactPersonName && ` • Contact: ${customer.contactPersonName}`}
                                      {addressCount > 0 && ` • ${addressCount} address(es)`}
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="p-3 text-center text-sm text-slate-500">
                                {consignee.name.trim() ? 
                                  `No customers found for "${consignee.name}"` : 
                                  "No customers available"
                                }
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Address Title Dropdown for Consignee */}
                  <div className="relative" ref={consigneeAddressRef}>
                    <label className="text-xs font-bold text-slate-600">Select Address Title</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={consignee.selectedAddressTitle}
                        onFocus={() => {
                          if (consignee.customerId && consigneeAddresses.length > 0) {
                            setShowConsigneeAddressDropdown(true);
                          }
                        }}
                        onBlur={handleConsignorInputBlur}
                        readOnly
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-50 px-3 py-2 text-sm outline-none cursor-pointer"
                        placeholder={consigneeAddresses.length > 0 ? "Select an address..." : "No addresses available"}
                      />
                      {showConsigneeAddressDropdown && consigneeAddresses.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                          {consigneeAddresses.map((addr, idx) => (
                            <div
                              key={idx}
                              onMouseDown={() => handleSelectConsigneeAddress(addr)}
                              className="p-3 hover:bg-purple-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                            >
                              <div className="font-medium text-slate-800">{addr.title}</div>
                              <div className="text-xs text-slate-500 mt-1">{addr.address.substring(0, 100)}...</div>
                              {addr.gstNumber && (
                                <div className="text-xs text-slate-400 mt-0.5">GST: {addr.gstNumber}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-slate-600">Consignee Address</label>
                    <textarea
                      value={consignee.address}
                      onChange={(e) => setConsignee({ ...consignee, address: e.target.value })}
                      rows={4}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                      placeholder="Enter complete address"
                    />
                    {consignee.address && consignee.customerId && (
                      <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Address auto-filled from selected customer
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* ===== BOE / Invoice Information ===== */}
        <div className="mt-4">
          <Card title="BOE / Invoice Details">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-3">
                <label className="text-xs font-bold text-slate-600">BOE / INV</label>
                <select
                  value={invoice.boeInvoice}
                  onChange={(e) => setInvoice({ ...invoice, boeInvoice: e.target.value })}
                  
                  className={`mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 `}
                >
                  {BOE_INVOICE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-12 md:col-span-3">
                <label className="text-xs font-bold text-slate-600">BOE / Invoice No</label>
                <input
                  type="text"
                  value={invoice.boeInvoiceNo}
                  onChange={(e) => setInvoice({ ...invoice, boeInvoiceNo: e.target.value })}
                  
                  className={`mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 `}
                  placeholder="DC20004623"
                />
              </div>

              <div className="col-span-12 md:col-span-3">
                <label className="text-xs font-bold text-slate-600">BOE / Invoice Date</label>
                <input
                  type="text"
                  value={invoice.boeInvoiceDate}
                  onChange={(e) => setInvoice({ ...invoice, boeInvoiceDate: e.target.value })}
                
                  className={`mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 `}
                  placeholder="DD.MM.YYYY"
                />
              </div>

              <div className="col-span-12 md:col-span-3">
                <label className="text-xs font-bold text-slate-600">Invoice Value</label>
                <input
                  type="text"
                  value={invoice.invoiceValue}
                  onChange={(e) => setInvoice({ ...invoice, invoiceValue: e.target.value })}
                  
                  className={`mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 `}
                  placeholder="1589233"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* ===== E-waybill & Container ===== */}
        <div className="mt-4">
          <Card title="E-waybill & Container Details">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-4">
                <label className="text-xs font-bold text-slate-600">E-waybill No</label>
                <input
                  type="text"
                  value={ewaybill.ewaybillNo}
                  onChange={(e) => setEwaybill({ ...ewaybill, ewaybillNo: e.target.value })}
                 
                  className={`mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 `}
                  placeholder="5641 3563 6264"
                />
              </div>

              <div className="col-span-12 md:col-span-4">
                <label className="text-xs font-bold text-slate-600">Expiry Date</label>
                <input
                  type="text"
                  value={ewaybill.expiryDate}
                  onChange={(e) => setEwaybill({ ...ewaybill, expiryDate: e.target.value })}
                  
                  className={`mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 `}
                  placeholder="DD.MM.YYYY"
                />
              </div>

              <div className="col-span-12 md:col-span-4">
                <label className="text-xs font-bold text-slate-600">Container No</label>
                <input
                  type="text"
                  value={ewaybill.containerNo}
                  onChange={(e) => setEwaybill({ ...ewaybill, containerNo: e.target.value })}
                 
                  className={`mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 `}
                  placeholder="TEU8753185M"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* ===== Product Details - All 4 Pack Types ===== */}
        
        {/* PALLETIZATION Section */}
        <div className="mt-4">
          <Card 
            title="Palletization"
            right={
              !isReadOnly && (
                <button
                  onClick={addPalletizationRow}
                  className="rounded-xl bg-yellow-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-yellow-700 transition"
                >
                  + Add Row
                </button>
              )
            }
          >
            <div className="overflow-auto rounded-xl border border-yellow-300">
              <table className="min-w-full w-full text-sm">
                <thead className="sticky top-0 bg-yellow-400">
                  <tr>
                    <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">NO OF PALLETS</th>
                    <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">UNIT PER PALLETS</th>
                    <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">TOTAL PKGS</th>
                    <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">PKG TYPE</th>
                    <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">UOM</th>
                    <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">SKU - SIZE</th>
                    <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">PACK - WEIGHT</th>
                    <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">PRODUCT NAME</th>
                    <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">WT (LTR)</th>
                    <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">ACTUAL - WT</th>
                    <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">CHARGED - WT</th>
                    <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">WT UOM</th>
                    {!isReadOnly && <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {palletizationRows.map((row) => (
                    <tr key={row._id} className="hover:bg-yellow-50 even:bg-slate-50">
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.noOfPallets}
                          onChange={(e) => updatePalletizationRow(row._id, 'noOfPallets', e.target.value)}
                          readOnly={isReadOnly}
                          className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm ${isReadOnly ? 'bg-gray-100' : 'bg-white'}`}
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.unitPerPallets}
                          onChange={(e) => updatePalletizationRow(row._id, 'unitPerPallets', e.target.value)}
                          readOnly={isReadOnly}
                          className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm ${isReadOnly ? 'bg-gray-100' : 'bg-white'}`}
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.totalPkgs}
                          onChange={(e) => updatePalletizationRow(row._id, 'totalPkgs', e.target.value)}
                          readOnly={isReadOnly}
                          className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm ${isReadOnly ? 'bg-gray-100' : 'bg-white'}`}
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <select
                          value={row.pkgsType}
                          onChange={(e) => updatePalletizationRow(row._id, 'pkgsType', e.target.value)}
                          disabled={isReadOnly}
                          className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                        >
                          <option value="">Select</option>
                          {PKGS_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                       </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <select
                          value={row.uom}
                          onChange={(e) => updatePalletizationRow(row._id, 'uom', e.target.value)}
                          disabled={isReadOnly}
                          className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                        >
                          {UOM_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                       </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <select
                          value={row.skuSize}
                          onChange={(e) => updatePalletizationRow(row._id, 'skuSize', e.target.value)}
                          disabled={isReadOnly}
                          className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                        >
                          <option value="">Select</option>
                          {SKU_SIZE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                       </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.packWeight}
                          onChange={(e) => updatePalletizationRow(row._id, 'packWeight', e.target.value)}
                          readOnly={isReadOnly}
                          className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm ${isReadOnly ? 'bg-gray-100' : 'bg-white'}`}
                        />
                       </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <select
                          value={row.productName}
                          onChange={(e) => updatePalletizationRow(row._id, 'productName', e.target.value)}
                          disabled={isReadOnly}
                          className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                        >
                          <option value="">Select</option>
                          {PRODUCT_NAME_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                       </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.wtLtr}
                          onChange={(e) => updatePalletizationRow(row._id, 'wtLtr', e.target.value)}
                          readOnly={isReadOnly}
                          className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm ${isReadOnly ? 'bg-gray-100' : 'bg-white'}`}
                        />
                       </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.actualWt}
                          onChange={(e) => updatePalletizationRow(row._id, 'actualWt', e.target.value)}
                          readOnly={isReadOnly}
                          className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm ${isReadOnly ? 'bg-gray-100' : 'bg-white'}`}
                        />
                       </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.chargedWt}
                          onChange={(e) => updatePalletizationRow(row._id, 'chargedWt', e.target.value)}
                          readOnly={isReadOnly}
                          className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm ${isReadOnly ? 'bg-gray-100' : 'bg-white'}`}
                        />
                       </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <select
                          value={row.wtUom}
                          onChange={(e) => updatePalletizationRow(row._id, 'wtUom', e.target.value)}
                          disabled={isReadOnly}
                          className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                        >
                          {UOM_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                       </td>
                      {!isReadOnly && (
                        <td className="border border-yellow-300 px-2 py-2 text-center">
                          {palletizationRows.length > 1 && (
                            <button
                              onClick={() => removePalletizationRow(row._id)}
                              className="rounded-lg bg-red-500 px-2 py-1.5 text-xs font-bold text-white hover:bg-red-600"
                            >
                              Remove
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* UNIFORM - BAGS/BOXES Section */}
        <div className="mt-4">
          <Card 
            title="Uniform - Bags/Boxes"
            right={
              !isReadOnly && (
                <button
                  onClick={addUniformRow}
                  className="rounded-xl bg-yellow-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-yellow-700 transition"
                >
                  + Add Row
                </button>
              )
            }
          >
            <div className="overflow-auto rounded-xl border border-yellow-300">
              <table className="min-w-full w-full text-sm">
                <thead className="sticky top-0 bg-yellow-400">
                  <tr>
                    <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">TOTAL PKGS</th>
                    <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">PKG TYPE</th>
                    <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">UOM</th>
                    <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">SKU - SIZE</th>
                    <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">PACK - WEIGHT</th>
                    <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">PRODUCT NAME</th>
                    <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">WT (LTR)</th>
                    <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">ACTUAL - WT</th>
                    <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">CHARGED - WT</th>
                    <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">WT UOM</th>
                    {!isReadOnly && <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {uniformRows.map((row) => (
                    <tr key={row._id} className="hover:bg-yellow-50 even:bg-slate-50">
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.totalPkgs}
                          onChange={(e) => updateUniformRow(row._id, 'totalPkgs', e.target.value)}
                          readOnly={isReadOnly}
                          className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm ${isReadOnly ? 'bg-gray-100' : 'bg-white'}`}
                        />
                       </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <select
                          value={row.pkgsType}
                          onChange={(e) => updateUniformRow(row._id, 'pkgsType', e.target.value)}
                          disabled={isReadOnly}
                          className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                        >
                          <option value="">Select</option>
                          {PKGS_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                       </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <select
                          value={row.uom}
                          onChange={(e) => updateUniformRow(row._id, 'uom', e.target.value)}
                          disabled={isReadOnly}
                          className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                        >
                          {UOM_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                       </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <select
                          value={row.skuSize}
                          onChange={(e) => updateUniformRow(row._id, 'skuSize', e.target.value)}
                          disabled={isReadOnly}
                          className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                        >
                          <option value="">Select</option>
                          {SKU_SIZE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                       </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.packWeight}
                          onChange={(e) => updateUniformRow(row._id, 'packWeight', e.target.value)}
                          readOnly={isReadOnly}
                          className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm ${isReadOnly ? 'bg-gray-100' : 'bg-white'}`}
                        />
                       </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <select
                          value={row.productName}
                          onChange={(e) => updateUniformRow(row._id, 'productName', e.target.value)}
                          disabled={isReadOnly}
                          className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                        >
                          <option value="">Select</option>
                          {PRODUCT_NAME_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                       </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.wtLtr}
                          onChange={(e) => updateUniformRow(row._id, 'wtLtr', e.target.value)}
                          readOnly={isReadOnly}
                          className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm ${isReadOnly ? 'bg-gray-100' : 'bg-white'}`}
                        />
                       </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.actualWt}
                          onChange={(e) => updateUniformRow(row._id, 'actualWt', e.target.value)}
                          readOnly={isReadOnly}
                          className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm ${isReadOnly ? 'bg-gray-100' : 'bg-white'}`}
                        />
                       </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.chargedWt}
                          onChange={(e) => updateUniformRow(row._id, 'chargedWt', e.target.value)}
                          readOnly={isReadOnly}
                          className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm ${isReadOnly ? 'bg-gray-100' : 'bg-white'}`}
                        />
                       </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <select
                          value={row.wtUom}
                          onChange={(e) => updateUniformRow(row._id, 'wtUom', e.target.value)}
                          disabled={isReadOnly}
                          className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                        >
                          {UOM_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                       </td>
                      {!isReadOnly && (
                        <td className="border border-yellow-300 px-2 py-2 text-center">
                          {uniformRows.length > 1 && (
                            <button
                              onClick={() => removeUniformRow(row._id)}
                              className="rounded-lg bg-red-500 px-2 py-1.5 text-xs font-bold text-white hover:bg-red-600"
                            >
                              Remove
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* LOOSE - CARGO Section */}
        <div className="mt-4">
          <Card 
            title="Loose - Cargo"
            right={
              !isReadOnly && (
                <button
                  onClick={addLooseCargoRow}
                  className="rounded-xl bg-yellow-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-yellow-700 transition"
                >
                  + Add Row
                </button>
              )
            }
          >
            <div className="overflow-auto rounded-xl border border-yellow-300">
              <table className="min-w-full w-full text-sm">
                <thead className="sticky top-0 bg-yellow-400">
                  <tr>
                    <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">UOM</th>
                    <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">PRODUCT NAME</th>
                    <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">ACTUAL - WT</th>
                    <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">CHARGED - WT</th>
                    {!isReadOnly && <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {looseCargoRows.map((row) => (
                    <tr key={row._id} className="hover:bg-yellow-50 even:bg-slate-50">
                      <td className="border border-yellow-300 px-2 py-2">
                        <select
                          value={row.uom}
                          onChange={(e) => updateLooseCargoRow(row._id, 'uom', e.target.value)}
                          disabled={isReadOnly}
                          className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                        >
                          {UOM_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                       </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <select
                          value={row.productName}
                          onChange={(e) => updateLooseCargoRow(row._id, 'productName', e.target.value)}
                          disabled={isReadOnly}
                          className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                        >
                          <option value="">Select</option>
                          {PRODUCT_NAME_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                       </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.actualWt}
                          onChange={(e) => updateLooseCargoRow(row._id, 'actualWt', e.target.value)}
                          readOnly={isReadOnly}
                          className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm ${isReadOnly ? 'bg-gray-100' : 'bg-white'}`}
                        />
                       </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.chargedWt}
                          onChange={(e) => updateLooseCargoRow(row._id, 'chargedWt', e.target.value)}
                          readOnly={isReadOnly}
                          className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm ${isReadOnly ? 'bg-gray-100' : 'bg-white'}`}
                        />
                       </td>
                      {!isReadOnly && (
                        <td className="border border-yellow-300 px-2 py-2 text-center">
                          {looseCargoRows.length > 1 && (
                            <button
                              onClick={() => removeLooseCargoRow(row._id)}
                              className="rounded-lg bg-red-500 px-2 py-1.5 text-xs font-bold text-white hover:bg-red-600"
                            >
                              Remove
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* NON-UNIFORM - GENERAL CARGO Section */}
        <div className="mt-4">
          <Card 
            title="Non-uniform - General Cargo"
            right={
              !isReadOnly && (
                <button
                  onClick={addNonUniformRow}
                  className="rounded-xl bg-yellow-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-yellow-700 transition"
                >
                  + Add Row
                </button>
              )
            }
          >
            <div className="overflow-auto rounded-xl border border-yellow-300">
              <table className="min-w-full w-full text-sm">
                <thead className="sticky top-0 bg-yellow-400">
                  <tr>
                    <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">NOS</th>
                    <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">PRODUCT NAME</th>
                    <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">UOM</th>
                    <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">LENGTH</th>
                    <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">WIDTH</th>
                    <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">HEIGHT</th>
                    <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">ACTUAL - WT</th>
                    <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">CHARGED - WT</th>
                    {!isReadOnly && <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {nonUniformRows.map((row) => (
                    <tr key={row._id} className="hover:bg-yellow-50 even:bg-slate-50">
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.nos}
                          onChange={(e) => updateNonUniformRow(row._id, 'nos', e.target.value)}
                          readOnly={isReadOnly}
                          className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm ${isReadOnly ? 'bg-gray-100' : 'bg-white'}`}
                        />
                       </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <select
                          value={row.productName}
                          onChange={(e) => updateNonUniformRow(row._id, 'productName', e.target.value)}
                          disabled={isReadOnly}
                          className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                        >
                          <option value="">Select</option>
                          {PRODUCT_NAME_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                       </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <select
                          value={row.uom}
                          onChange={(e) => updateNonUniformRow(row._id, 'uom', e.target.value)}
                          disabled={isReadOnly}
                          className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                        >
                          {UOM_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                       </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.length}
                          onChange={(e) => updateNonUniformRow(row._id, 'length', e.target.value)}
                          readOnly={isReadOnly}
                          className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm ${isReadOnly ? 'bg-gray-100' : 'bg-white'}`}
                        />
                       </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.width}
                          onChange={(e) => updateNonUniformRow(row._id, 'width', e.target.value)}
                          readOnly={isReadOnly}
                          className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm ${isReadOnly ? 'bg-gray-100' : 'bg-white'}`}
                        />
                       </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.height}
                          onChange={(e) => updateNonUniformRow(row._id, 'height', e.target.value)}
                          readOnly={isReadOnly}
                          className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm ${isReadOnly ? 'bg-gray-100' : 'bg-white'}`}
                        />
                       </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.actualWt}
                          onChange={(e) => updateNonUniformRow(row._id, 'actualWt', e.target.value)}
                          readOnly={isReadOnly}
                          className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm ${isReadOnly ? 'bg-gray-100' : 'bg-white'}`}
                        />
                       </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.chargedWt}
                          onChange={(e) => updateNonUniformRow(row._id, 'chargedWt', e.target.value)}
                          readOnly={isReadOnly}
                          className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm ${isReadOnly ? 'bg-gray-100' : 'bg-white'}`}
                        />
                       </td>
                      {!isReadOnly && (
                        <td className="border border-yellow-300 px-2 py-2 text-center">
                          {nonUniformRows.length > 1 && (
                            <button
                              onClick={() => removeNonUniformRow(row._id)}
                              className="rounded-lg bg-red-500 px-2 py-1.5 text-xs font-bold text-white hover:bg-red-600"
                            >
                              Remove
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* ===== Summary Card ===== */}
        <div className="mt-4">
          <Card title="Summary">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Order No:</span>
                      <span className="font-bold text-blue-800">{header.orderNo || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Party Name:</span>
                      <span className="font-bold text-blue-800">{header.partyName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">From - To:</span>
                      <span className="font-bold text-blue-800">{header.from || 'N/A'} → {header.to || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-span-12 md:col-span-4">
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-4 rounded-xl border border-amber-200">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Vehicle Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Vehicle No:</span>
                      <span className={`font-bold ${header.vehicleNo && header.vehicleNo !== 'N/A' ? 'text-green-700' : 'text-amber-800'}`}>
                        {header.vehicleNo || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Vendor:</span>
                      <span className={`font-bold ${header.vendorName && header.vendorName !== 'N/A' ? 'text-green-700' : 'text-amber-800'}`}>
                        {header.vendorName || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Mobile No:</span>
                      <span className={`font-bold ${header.partyNo && header.partyNo !== 'N/A' ? 'text-green-700' : 'text-amber-800'}`}>
                        {header.partyNo || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-span-12 md:col-span-4">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Weight Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Total Weight:</span>
                      <span className="text-xl font-bold text-purple-800">{calculateTotalActualWt().toFixed(2)} {header.unit}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/** =========================
 * REUSABLE COMPONENTS
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