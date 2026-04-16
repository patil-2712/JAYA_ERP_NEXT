"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/** =========================
 * CONSTANTS
 ========================= */
const DELIVERY_OPTIONS = ["Urgent", "Normal", "Express", "Scheduled"];
const ORDER_TYPES = ["Sales", "STO Order", "Export", "Import"];
const BILLING_TYPES = ["Single - Order", "Multi - Order"];
const PURCHASE_TYPE_OPTIONS = ["Loading & Unloading", "Unloading Only", "Safi Vehicle"];
const PAYMENT_TERMS_OPTIONS = [
  "80 % Advance", 
  "90 % Advance", 
  "Rs.10,000/- Balance Only", 
  "Rs. 5000/- Balance Only", 
  "Full Payment after Delivery"
];
const RATE_TYPE_OPTIONS = ["Per MT", "Fixed"];
const VENDOR_STATUS_OPTIONS = ["Active", "Blacklisted"];
const APPROVAL_OPTIONS = ["Approved", "Rejected", "Pending"];
const VEHICLE_TYPE_OPTIONS = ["Truck - 6 Wheels", "Truck - 10 Wheels", "Truck - 14 Wheels", "Container", "Trailer"];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/* =======================
  Data Fetching Hooks
========================= */
function useLoadingInfo() {
  const [loadingInfos, setLoadingInfos] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLoadingInfos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const loadingRes = await fetch('/api/loading-panel?format=table', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!loadingRes.ok) {
        console.warn('Loading Info API returned', loadingRes.status);
        setLoadingInfos([]);
        return;
      }
      
      const loadingData = await loadingRes.json();
      
      const purchaseRes = await fetch('/api/purchase-panel?format=table', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      let usedLoadingInfos = new Set();
      
      if (purchaseRes.ok) {
        const purchaseData = await purchaseRes.json();
        if (purchaseData.success && Array.isArray(purchaseData.data)) {
          purchaseData.data.forEach(item => {
            if (item.loadingInfoNo && item.loadingInfoNo !== '') {
              usedLoadingInfos.add(item.loadingInfoNo);
            }
          });
        }
      }
      
      if (loadingData.success && Array.isArray(loadingData.data)) {
        const availableInfos = loadingData.data.filter(info => 
          info.vehicleNegotiationNo && 
          info.vehicleNegotiationNo !== 'N/A' &&
          !usedLoadingInfos.has(info.vehicleArrivalNo)
        );
        
        console.log(`📊 Found ${availableInfos.length} available loading infos out of ${loadingData.data.length} total`);
        
        const enhancedData = availableInfos.map(item => ({
          ...item,
          driverNo: item.driverNo || item.driverMobileNo || '',
          vehicleInfo: item.vehicleInfo || {},
          orderRows: item.orderRows || []
        }));
        
        setLoadingInfos(enhancedData);
      }
    } catch (error) {
      console.error('Error fetching loading info:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getLoadingInfoById = async (id) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/loading-panel?id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) return null;
      
      const data = await res.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Error fetching loading info:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loadingInfos, loading, fetchLoadingInfos, getLoadingInfoById };
}

function useVehicleNegotiation() {
  const [loading, setLoading] = useState(false);

  const getNegotiationByVNN = async (vnnNo) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log(`🔍 Fetching Vehicle Negotiation with VNN: ${vnnNo}`);
      
      const res = await fetch(`/api/vehicle-negotiation?vnnNo=${encodeURIComponent(vnnNo)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        console.error(`API returned ${res.status}`);
        return null;
      }
      
      const data = await res.json();
      console.log("📦 Vehicle Negotiation Data:", data);
      
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Error fetching negotiation:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, getNegotiationByVNN };
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
    district: "",
    state: "",
    country: "",
    from: "",
    to: "",
    locationRate: "",
    priceList: "",
    weight: "",
    rate: "",
    totalAmount: "",
    collectionCharges: "",
    cancellationCharges: "",
    loadingCharges: "",
    otherCharges: "",
  };
}

function defaultAdditionRow() {
  return {
    _id: uid(),
    description: "",
    amount: "",
  };
}

function defaultDeductionRow() {
  return {
    _id: uid(),
    description: "",
    amount: "",
  };
}

export default function CreatePurchasePanel() {
  const router = useRouter();

  /** =========================
   * CUSTOM HOOKS
   ========================= */
  const loadingInfoHook = useLoadingInfo();
  const vehicleNegotiationHook = useVehicleNegotiation();

  /** =========================
   * STATE FOR API DATA
   ========================= */
  const [branches, setBranches] = useState([]);
  const [plants, setPlants] = useState([]);
  const [priceLists, setPriceLists] = useState([]);
  const [orders, setOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [fetchingData, setFetchingData] = useState(false);
  const [memoFileInfo, setMemoFileInfo] = useState(null);

  /** =========================
   * LOADING INFO SEARCH STATE
   ========================= */
  const [loadingInfoNo, setLoadingInfoNo] = useState("");
  const [showLoadingInfoDropdown, setShowLoadingInfoDropdown] = useState(false);
  const [filteredLoadingInfos, setFilteredLoadingInfos] = useState([]);
  const loadingInfoDropdownRef = useRef(null);

  /** =========================
   * HEADER STATE
   ========================= */
  const [header, setHeader] = useState({
    purchaseNo: "",
    pricingSerialNo: "",
    branch: "",
    branchName: "",
    branchCode: "",
    date: new Date().toISOString().split('T')[0],
    delivery: "",
  });

  /** =========================
   * BILLING CHARGES STATE
   ========================= */
  const [billing, setBilling] = useState({
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
   * PURCHASE DETAILS STATE
   ========================= */
  const [purchaseDetails, setPurchaseDetails] = useState({
    vendorStatus: "",
    vendorName: "",
    vendorCode: "",
    vehicleNo: "",
    purchaseType: "",
    paymentTerms: "",
    rateType: "",
    rate: "",
    weight: "",
    amount: "",
    advance: "",
    vehicleFloorTarpaulin: "",
    vehicleOuterTarpaulin: "",
    vehicleType: "",
    driverMobileNo: "",
    purchaseDate: new Date().toISOString().split('T')[0],
  });

  /** =========================
   * LOADING CHARGES & EXPENSES STATE (All 5 fields)
   ========================= */
  const [loadingExpenses, setLoadingExpenses] = useState({
    loadingCharges: "",
    loadingStaffMunshiyana: "",
    otherExpenses: "",
    vehicleFloorTarpaulin: "",
    vehicleOuterTarpaulin: "",
  });

  /** =========================
   * ADDITION & DEDUCTION STATE
   ========================= */
  const [additions, setAdditions] = useState([]);
  const [deductions, setDeductions] = useState([]);

  /** =========================
   * REGISTERED VEHICLE STATE
   ========================= */
  const [registeredVehicle, setRegisteredVehicle] = useState({
    loadingPanelPlate: "",
    registeredPlate: "",
    isRegistered: false,
  });

  /** =========================
   * APPROVAL STATE
   ========================= */
  const [approval, setApproval] = useState({
    status: "",
    remarks: "",
  });

  /** =========================
   * ARRIVAL DETAILS STATE
   ========================= */
  const [arrivalDetails, setArrivalDetails] = useState({
    date: new Date().toISOString().split('T')[0],
    time: "",
  });

  /** =========================
   * VNN REFERENCE STATE
   ========================= */
  const [selectedVNN, setSelectedVNN] = useState(null);
  const [selectedVNNNo, setSelectedVNNNo] = useState("");

  /** =========================
   * MEMO UPLOAD FUNCTION
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
        setMemoFileInfo({
          filePath: data.filePath,
          fullPath: data.fullPath,
          filename: data.filename,
          originalName: file.name,
          size: file.size,
          mimeType: file.type
        });
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
   * FETCH DATA FROM APIs
   ========================= */
  useEffect(() => {
    fetchBranches();
    fetchPlants();
    fetchPriceLists();
    fetchOrders();
    fetchVendors();
    loadingInfoHook.fetchLoadingInfos();
  }, []);

  useEffect(() => {
    if (loadingInfoHook.loadingInfos.length > 0) {
      setFilteredLoadingInfos(loadingInfoHook.loadingInfos);
    }
  }, [loadingInfoHook.loadingInfos]);

  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const res = await fetch('/api/branches', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        console.warn('Branches API not available');
        return;
      }
      
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setBranches(data.data);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchPlants = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const res = await fetch('/api/plants', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        console.warn('Plants API not available');
        return;
      }
      
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setPlants(data.data);
      }
    } catch (error) {
      console.error('Error fetching plants:', error);
    }
  };

  const fetchPriceLists = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const res = await fetch('/api/price-lists', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        console.warn('Price lists API not available');
        setPriceLists([]);
        return;
      }
      
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setPriceLists(data.data);
      }
    } catch (error) {
      console.error('Error fetching price lists:', error);
      setPriceLists([]);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const res = await fetch('/api/order-panel', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        console.warn('Orders API not available');
        return;
      }
      
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchVendors = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const res = await fetch('/api/vendors', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        console.warn('Vendors API not available');
        setVendors([]);
        return;
      }
      
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setVendors(data.data);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setVendors([]);
    }
  };

  /** =========================
   * BILLING COLUMNS - READ ONLY
   ========================= */
  const billingColumns = [
    { key: "billingType", label: "Billing Type", options: BILLING_TYPES },
    { key: "noOfLoadingPoints", label: "No. of Loading Points", type: "number" },
    { key: "noOfDroppingPoint", label: "No. of Dropping Point", type: "number" },
  ];

  /** =========================
   * LOADING INFO HANDLERS
   ========================= */
  const handleLoadingInfoSearch = (query) => {
    setLoadingInfoNo(query);
    
    if (query.trim() === "") {
      setFilteredLoadingInfos(loadingInfoHook.loadingInfos);
    } else {
      const filtered = loadingInfoHook.loadingInfos.filter(info =>
        info.vehicleArrivalNo?.toLowerCase().includes(query.toLowerCase()) ||
        info.vehicleNo?.toLowerCase().includes(query.toLowerCase()) ||
        info.branch?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredLoadingInfos(filtered);
    }
  };

  const handleSelectLoadingInfo = async (loadingInfo) => {
    setLoadingInfoNo(loadingInfo.vehicleArrivalNo);
    setShowLoadingInfoDropdown(false);
    setFetchingData(true);
    
    try {
      console.log("📋 Selected Loading Info:", loadingInfo);
      
      const vnnFromLoading = loadingInfo.vehicleNegotiationNo;
      
      if (!vnnFromLoading) {
        alert("⚠️ This Loading Info has no Vehicle Negotiation reference");
        setFetchingData(false);
        return;
      }
      
      console.log("🔍 Looking for Vehicle Negotiation with VNN:", vnnFromLoading);
      setSelectedVNNNo(vnnFromLoading);
      
      const vnnData = await vehicleNegotiationHook.getNegotiationByVNN(vnnFromLoading);
      
      if (!vnnData) {
        alert(`⚠️ No Vehicle Negotiation found for VNN: ${vnnFromLoading}`);
        setFetchingData(false);
        return;
      }
      
      console.log("✅ Vehicle Negotiation Data loaded:", vnnData);
      setSelectedVNN(vnnData);
      
      const vehicleNegotiationId = vnnData._id;
      console.log("🔑 Vehicle Negotiation ID:", vehicleNegotiationId);
      
      let pricingData = null;
      let orderPanelData = null;
      let loadingPanelData = null;
      
      try {
        const token = localStorage.getItem('token');
        
        // Fetch pricing panel
        const pricingRes = await fetch('/api/pricing-panel?format=table', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (pricingRes.ok) {
          const pricingList = await pricingRes.json();
          
          if (pricingList.success && Array.isArray(pricingList.data)) {
            for (const panel of pricingList.data) {
              if (panel.vnn === vnnFromLoading || panel.vehicleNegotiationId === vehicleNegotiationId) {
                const fullPricingRes = await fetch(`/api/pricing-panel?id=${panel.panelId || panel._id}`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                
                if (fullPricingRes.ok) {
                  const fullData = await fullPricingRes.json();
                  if (fullData.success) {
                    pricingData = fullData.data;
                    console.log("✅ Found Pricing Panel:", pricingData.pricingSerialNo);
                    break;
                  }
                }
              }
            }
          }
        }
        
        // Fetch Order Panel data
        if (vnnData.selectedOrderPanels && vnnData.selectedOrderPanels.length > 0) {
          const firstOrderPanel = vnnData.selectedOrderPanels[0];
          if (firstOrderPanel && firstOrderPanel._id) {
            const orderRes = await fetch(`/api/order-panel?id=${firstOrderPanel._id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            
            if (orderRes.ok) {
              const orderData = await orderRes.json();
              if (orderData.success && orderData.data) {
                orderPanelData = orderData.data;
                console.log("✅ Found Order Panel Data:", orderPanelData.orderPanelNo);
              }
            }
          }
        }
        
        // Fetch FULL Loading Panel data
        const loadingPanelRes = await fetch(`/api/loading-panel?vehicleArrivalNo=${loadingInfo.vehicleArrivalNo}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (loadingPanelRes.ok) {
          const loadingPanelResult = await loadingPanelRes.json();
          if (loadingPanelResult.success && loadingPanelResult.data) {
            loadingPanelData = loadingPanelResult.data;
            console.log("✅ Found Loading Panel Data:", loadingPanelData.vehicleArrivalNo);
          }
        }
        
      } catch (error) {
        console.error("Error fetching additional data:", error);
      }
      
      let driverMobileNo = "";
      if (loadingInfo.driverNo) {
        driverMobileNo = loadingInfo.driverNo;
      } else if (loadingInfo.vehicleInfo?.driverMobileNo) {
        driverMobileNo = loadingInfo.vehicleInfo.driverMobileNo;
      }
      
      const approval = vnnData.approval || {};
      const vehicleInfo = vnnData.vehicleInfo || {};
      const negotiation = vnnData.negotiation || {};
      
      const vendorCode = approval.vendorCode || "";
      const vendorName = approval.vendorName || vnnData.vendorName || "";
      
      console.log("✅ Vendor from VNN:", { vendorName, vendorCode });
      
      setHeader({
        ...header,
        branch: vnnData.branch || "",
        branchName: vnnData.branchName || "",
        delivery: vnnData.delivery || "",
        date: vnnData.date ? new Date(vnnData.date).toISOString().split('T')[0] : header.date,
        pricingSerialNo: pricingData?.pricingSerialNo || "",
      });

      setBilling({
        billingType: vnnData.billingType || "Multi - Order",
        noOfLoadingPoints: vnnData.loadingPoints?.toString() || "1",
        noOfDroppingPoint: vnnData.dropPoints?.toString() || "1",
        collectionCharges: vnnData.collectionCharges?.toString() || "0",
        cancellationCharges: vnnData.cancellationCharges || "Nil",
        loadingCharges: vnnData.loadingCharges || "Nil",
        otherCharges: vnnData.otherCharges || "Nil",
      });

      setPurchaseDetails({
        ...purchaseDetails,
        vendorName: vendorName,
        vendorStatus: approval.vendorStatus || vnnData.vendorStatus || "Active",
        vendorCode: vendorCode,
        vehicleNo: approval.vehicleNo || vehicleInfo.vehicleNo || loadingInfo.vehicleNo || "",
        vehicleType: vehicleInfo.vehicleType || vnnData.vehicleType || approval.vehicleType || "",
        driverMobileNo: driverMobileNo,
        purchaseType: approval.purchaseType || negotiation.purchaseType || "Loading & Unloading",
        paymentTerms: approval.paymentTerms || "80 % Advance",
        rateType: approval.rateType || "Per MT",
        rate: approval.finalPerMT?.toString() || approval.finalFix?.toString() || "",
      });

      // Load Loading Expenses from Loading Panel data
      let loadingChargesVal = "0";
      let loadingStaffMunshiyanaVal = "0";
      let otherExpensesVal = "0";
      let vehicleFloorTarpaulinVal = "0";
      let vehicleOuterTarpaulinVal = "0";
      
      if (loadingPanelData && loadingPanelData.loadedWeighment) {
        loadingChargesVal = loadingPanelData.loadedWeighment.loadingCharges?.toString() || "0";
        loadingStaffMunshiyanaVal = loadingPanelData.loadedWeighment.loadingStaffMunshiyana?.toString() || "0";
        otherExpensesVal = loadingPanelData.loadedWeighment.otherExpenses?.toString() || "0";
        vehicleFloorTarpaulinVal = loadingPanelData.loadedWeighment.vehicleFloorTarpaulin?.toString() || "0";
        vehicleOuterTarpaulinVal = loadingPanelData.loadedWeighment.vehicleOuterTarpaulin?.toString() || "0";
        console.log("✅ Loading Expenses from Loading Panel");
      } else if (orderPanelData && orderPanelData.loadedWeighment) {
        loadingChargesVal = orderPanelData.loadedWeighment.loadingCharges?.toString() || "0";
        loadingStaffMunshiyanaVal = orderPanelData.loadedWeighment.loadingStaffMunshiyana?.toString() || "0";
        otherExpensesVal = orderPanelData.loadedWeighment.otherExpenses?.toString() || "0";
        vehicleFloorTarpaulinVal = orderPanelData.loadedWeighment.vehicleFloorTarpaulin?.toString() || "0";
        vehicleOuterTarpaulinVal = orderPanelData.loadedWeighment.vehicleOuterTarpaulin?.toString() || "0";
        console.log("✅ Loading Expenses from Order Panel");
      } else if (approval) {
        loadingChargesVal = approval.loadingCharges?.toString() || "0";
        loadingStaffMunshiyanaVal = approval.loadingStaffMunshiyana?.toString() || "0";
        otherExpensesVal = approval.otherExpenses?.toString() || "0";
        vehicleFloorTarpaulinVal = approval.vehicleFloorTarpaulin?.toString() || "0";
        vehicleOuterTarpaulinVal = approval.vehicleOuterTarpaulin?.toString() || "0";
        console.log("✅ Loading Expenses from VNN Approval");
      }
      
      setLoadingExpenses({
        loadingCharges: loadingChargesVal,
        loadingStaffMunshiyana: loadingStaffMunshiyanaVal,
        otherExpenses: otherExpensesVal,
        vehicleFloorTarpaulin: vehicleFloorTarpaulinVal,
        vehicleOuterTarpaulin: vehicleOuterTarpaulinVal,
      });

      const vehiclePlate = approval.vehicleNo || vehicleInfo.vehicleNo || loadingInfo.vehicleNo || "";
      if (vehiclePlate) {
        setRegisteredVehicle({
          loadingPanelPlate: vehiclePlate,
          registeredPlate: vehiclePlate,
          isRegistered: approval.verified || vehicleInfo.verified || false,
        });
      }

      setApproval({
        status: approval.approvalStatus || "Pending",
        remarks: `Auto-filled from VNN: ${vnnData.vnnNo}`,
      });

      if (vnnData.orders && vnnData.orders.length > 0) {
        const newOrderRows = vnnData.orders.map(order => {
          let locationRate = "";
          let priceList = "";
          let rate = "";
          let totalAmount = "";
          
          if (pricingData && pricingData.orders) {
            const matchingPricingOrder = pricingData.orders.find(
              po => po.orderNo === order.orderNo
            );
            
            if (matchingPricingOrder) {
              console.log(`✅ Found pricing data for order ${order.orderNo}:`, matchingPricingOrder);
              locationRate = matchingPricingOrder.locationRate?.toString() || "";
              priceList = matchingPricingOrder.priceList || "";
              rate = matchingPricingOrder.rate?.toString() || "";
              totalAmount = matchingPricingOrder.totalAmount?.toString() || "";
            }
          }
          
          return {
            _id: uid(),
            orderNo: order.orderNo || "",
            partyName: order.partyName || vnnData.customerName || "",
            plantCode: order.plantCode || "",
            plantName: order.plantName || "",
            orderType: order.orderType || "Sales",
            pinCode: order.pinCode || "",
            taluka: order.talukaName || order.taluka || "",
            district: order.districtName || order.district || "",
            state: order.stateName || order.state || "",
            country: order.countryName || order.country || "",
            from: order.fromName || order.from || "",
            to: order.toName || order.to || "",
            locationRate: locationRate,
            priceList: priceList,
            weight: order.weight?.toString() || "",
            rate: rate,
            totalAmount: totalAmount,
            collectionCharges: order.collectionCharges?.toString() || "0",
            cancellationCharges: order.cancellationCharges || "Nil",
            loadingCharges: order.loadingCharges || "Nil",
            otherCharges: order.otherCharges?.toString() || "0",
          };
        });
        
        setOrderRows(newOrderRows);
        
        const totalWeight = newOrderRows.reduce((sum, row) => sum + num(row.weight), 0);
        const totalOrderAmount = newOrderRows.reduce((sum, row) => sum + num(row.totalAmount), 0);
        
        setPurchaseDetails(prev => ({
          ...prev,
          weight: totalWeight.toString(),
          amount: totalOrderAmount.toString(),
        }));
      }

      let loadedMessage = `✅ Data loaded from Vehicle Negotiation: ${vnnData.vnnNo}`;
      if (pricingData) {
        loadedMessage += `\n✅ Also loaded from Pricing Panel: ${pricingData.pricingSerialNo}`;
      }
      if (orderPanelData) {
        loadedMessage += `\n✅ Also loaded from Order Panel: ${orderPanelData.orderPanelNo}`;
      }
      if (loadingPanelData && loadingPanelData.loadedWeighment) {
        loadedMessage += `\n✅ Also loaded Loading Expenses from Loading Info`;
      }
      if (vendorCode) {
        loadedMessage += `\n✅ Vendor Code: ${vendorCode}`;
      }
      
      alert(loadedMessage);
      
    } catch (error) {
      console.error("❌ Error loading data:", error);
      alert(`❌ Failed to load data: ${error.message}`);
    } finally {
      setFetchingData(false);
    }
  };

  const handleLoadingInfoInputFocus = () => {
    if (!showLoadingInfoDropdown) {
      setFilteredLoadingInfos(loadingInfoHook.loadingInfos);
      setShowLoadingInfoDropdown(true);
    }
  };

  const handleLoadingInfoInputBlur = () => {
    setTimeout(() => {
      if (loadingInfoDropdownRef.current && !loadingInfoDropdownRef.current.contains(document.activeElement)) {
        setShowLoadingInfoDropdown(false);
      }
    }, 200);
  };

  /** =========================
   * ORDER ROW FUNCTIONS
   ========================= */
  const addOrderRow = () => setOrderRows([...orderRows, defaultOrderRow()]);

  const updateOrderRow = (rowId, key, value) => {
    setOrderRows((prev) =>
      prev.map((r) => {
        if (r._id === rowId) {
          const updatedRow = { ...r, [key]: value };
          
          if (key === "weight" || key === "rate") {
            const weight = num(updatedRow.weight);
            const rate = num(updatedRow.rate);
            updatedRow.totalAmount = (weight * rate).toString();
          }
          
          return updatedRow;
        }
        return r;
      })
    );

    const totalWeight = orderRows.reduce((sum, row) => {
      if (row._id === rowId) {
        const newWeight = key === "weight" ? num(value) : num(row.weight);
        return sum + newWeight;
      }
      return sum + num(row.weight);
    }, 0);

    const totalOrderAmount = orderRows.reduce((sum, row) => {
      if (row._id === rowId) {
        let totalAmount = num(row.totalAmount);
        let collectionCharges = num(row.collectionCharges);
        let cancellationCharges = num(row.cancellationCharges);
        let loadingCharges = num(row.loadingCharges);
        let otherCharges = num(row.otherCharges);
        
        if (key === "collectionCharges") {
          collectionCharges = num(value);
        } else if (key === "cancellationCharges") {
          cancellationCharges = num(value);
        } else if (key === "loadingCharges") {
          loadingCharges = num(value);
        } else if (key === "otherCharges") {
          otherCharges = num(value);
        } else if (key === "weight") {
          totalAmount = num(value) * num(row.rate);
        } else if (key === "rate") {
          totalAmount = num(row.weight) * num(value);
        }
        
        return sum + totalAmount + collectionCharges + cancellationCharges + loadingCharges + otherCharges;
      }
      
      let totalAmount = num(row.totalAmount);
      let collectionCharges = num(row.collectionCharges);
      let cancellationCharges = num(row.cancellationCharges);
      let loadingCharges = num(row.loadingCharges);
      let otherCharges = num(row.otherCharges);
      
      return sum + totalAmount + collectionCharges + cancellationCharges + loadingCharges + otherCharges;
    }, 0);

    setPurchaseDetails(prev => ({
      ...prev,
      weight: totalWeight.toString(),
      amount: totalOrderAmount.toString(),
    }));
  };

  const removeOrderRow = (rowId) => {
    if (orderRows.length > 1) {
      const newRows = orderRows.filter((r) => r._id !== rowId);
      setOrderRows(newRows);
      
      const totalWeight = newRows.reduce((sum, row) => sum + num(row.weight), 0);
      const totalAmount = newRows.reduce((sum, row) => sum + num(row.totalAmount), 0);
      
      setPurchaseDetails(prev => ({
        ...prev,
        weight: totalWeight.toString(),
        amount: totalAmount.toString(),
      }));
    } else {
      alert("At least one order row is required");
    }
  };

  const duplicateOrderRow = (rowId) => {
    const row = orderRows.find((r) => r._id === rowId);
    if (!row) return;
    const newRows = [...orderRows, { ...row, _id: uid(), orderNo: "" }];
    setOrderRows(newRows);
    
    const totalWeight = newRows.reduce((sum, row) => sum + num(row.weight), 0);
    const totalAmount = newRows.reduce((sum, row) => sum + num(row.totalAmount), 0);
    
    setPurchaseDetails(prev => ({
      ...prev,
      weight: totalWeight.toString(),
      amount: totalAmount.toString(),
    }));
  };

  /** =========================
   * ADDITION FUNCTIONS
   ========================= */
  const addAdditionRow = () => {
    setAdditions([...additions, defaultAdditionRow()]);
  };

  const updateAdditionRow = (rowId, key, value) => {
    setAdditions((prev) =>
      prev.map((r) => (r._id === rowId ? { ...r, [key]: value } : r))
    );
  };

  const removeAdditionRow = (rowId) => {
    setAdditions((prev) => prev.filter((r) => r._id !== rowId));
  };

  /** =========================
   * DEDUCTION FUNCTIONS
   ========================= */
  const addDeductionRow = () => {
    setDeductions([...deductions, defaultDeductionRow()]);
  };

  const updateDeductionRow = (rowId, key, value) => {
    setDeductions((prev) =>
      prev.map((r) => (r._id === rowId ? { ...r, [key]: value } : r))
    );
  };

  const removeDeductionRow = (rowId) => {
    setDeductions((prev) => prev.filter((r) => r._id !== rowId));
  };

  /** =========================
   * BILLING TYPE CHANGE HANDLER
   ========================= */
  const handleBillingTypeChange = (value) => {
    setBilling((prev) => ({ ...prev, billingType: value }));
  };

  /** =========================
   * CALCULATED VALUES
   ========================= */
  const calculateTotalOrderAmount = () => {
    return orderRows.reduce((sum, row) => {
      const totalAmount = num(row.totalAmount);
      const collectionCharges = num(row.collectionCharges);
      const cancellationCharges = num(row.cancellationCharges);
      const loadingCharges = num(row.loadingCharges);
      const otherCharges = num(row.otherCharges);
      
      return sum + totalAmount + collectionCharges + cancellationCharges + loadingCharges + otherCharges;
    }, 0);
  };

  const calculateTotalAdditions = () => {
    return additions.reduce((sum, row) => sum + num(row.amount), 0);
  };

  const calculateTotalDeductions = () => {
    return deductions.reduce((sum, row) => sum + num(row.amount), 0);
  };

  const calculateTotalLoadingExpenses = () => {
    return (
      num(loadingExpenses.loadingCharges) +
      num(loadingExpenses.loadingStaffMunshiyana) +
      num(loadingExpenses.otherExpenses) +
      num(loadingExpenses.vehicleFloorTarpaulin) +
      num(loadingExpenses.vehicleOuterTarpaulin)
    );
  };

  // NEW: Calculate Advance Paid + Deduct at Office
  const calculateAdvancePlusDeduct = () => {
    return num(purchaseDetails.advance) + calculateTotalLoadingExpenses();
  };

  // UPDATED: Final Balance = Total Order Amount - Advance Paid
  const calculateBalance = () => {
    const totalOrderAmount = calculateTotalOrderAmount();
    const advance = num(purchaseDetails.advance);
    
    return totalOrderAmount - advance;
  };

  // Net Effect for Additions & Deductions section
  const calculateNetEffect = () => {
    const advance = num(purchaseDetails.advance);
    const totalAdditions = calculateTotalAdditions();
    const totalDeductions = calculateTotalDeductions();
    const totalLoadingExpenses = calculateTotalLoadingExpenses();
    
    return advance + totalAdditions - totalDeductions - totalLoadingExpenses;
  };

  /** =========================
   * HANDLE SAVE
   ========================= */
  const handleSave = async () => {
    if (!header.branch) {
      alert("Please select a branch");
      return;
    }

    if (!purchaseDetails.vendorName) {
      alert("Please select a vendor");
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("No authentication token found");
      }

      const payload = {
        header: {
          ...header,
        },
        billing,
        orders: orderRows,
        purchaseDetails,
        loadingExpenses,
        additions,
        deductions,
        registeredVehicle: {
          vehiclePlate: registeredVehicle.registeredPlate,
          isRegistered: registeredVehicle.isRegistered,
        },
        approval,
        arrivalDetails,
        loadingInfoNo,
        vnnNo: selectedVNN?.vnnNo || selectedVNNNo || "",
        vehicleNegotiationId: selectedVNN?._id || "",
        totalOrderAmount: calculateTotalOrderAmount(),
        totalAdditions: calculateTotalAdditions(),
        totalDeductions: calculateTotalDeductions(),
        totalLoadingExpenses: calculateTotalLoadingExpenses(),
        balance: calculateBalance(),
        netEffect: calculateNetEffect(),
        memoFile: memoFileInfo,
      };

      console.log("Saving purchase panel:", payload);

      const res = await fetch('/api/purchase-panel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: `HTTP error! status: ${res.status}` }));
        throw new Error(errorData.message || 'Failed to save purchase');
      }

      const data = await res.json();
      alert(`✅ Purchase saved successfully!\nPurchase No: ${data.data?.purchaseNo || 'Generated'}`);
      
      router.push('/admin/Purchase-Panel');
      
    } catch (error) {
      console.error('Error saving purchase:', error);
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
      purchaseNo: "",
      pricingSerialNo: "",
      branch: "",
      branchName: "",
      branchCode: "",
      date: new Date().toISOString().split('T')[0],
      delivery: "",
    });
    
    setBilling({
      billingType: "",
      noOfLoadingPoints: "",
      noOfDroppingPoint: "",
      collectionCharges: "",
      cancellationCharges: "",
      loadingCharges: "",
      otherCharges: "",
    });
    
    setOrderRows([defaultOrderRow()]);
    
    setPurchaseDetails({
      vendorStatus: "",
      vendorName: "",
      vendorCode: "",
      vehicleNo: "",
      purchaseType: "",
      paymentTerms: "",
      rateType: "",
      rate: "",
      weight: "",
      amount: "",
      advance: "",
      vehicleFloorTarpaulin: "",
      vehicleOuterTarpaulin: "",
      vehicleType: "",
      driverMobileNo: "",
      purchaseDate: new Date().toISOString().split('T')[0],
    });
    
    setLoadingExpenses({
      loadingCharges: "",
      loadingStaffMunshiyana: "",
      otherExpenses: "",
      vehicleFloorTarpaulin: "",
      vehicleOuterTarpaulin: "",
    });
    
    setAdditions([]);
    setDeductions([]);
    setMemoFileInfo(null);
    
    setRegisteredVehicle({
      loadingPanelPlate: "",
      registeredPlate: "",
      isRegistered: false,
    });
    
    setApproval({
      status: "",
      remarks: "",
    });
    
    setArrivalDetails({
      date: new Date().toISOString().split('T')[0],
      time: "",
    });

    setLoadingInfoNo("");
    setSelectedVNN(null);
    setSelectedVNNNo("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-full px-4 py-3 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/admin/Purchase-Panel')}
                className="text-emerald-600 hover:text-emerald-800 font-medium text-sm flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to List
              </button>
              <div className="text-lg font-extrabold text-slate-900">
                Create Purchase Panel
              </div>
            </div>
            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
              <span>Purchase No: {header.purchaseNo || "Will be auto-generated"}</span>
              <span>|</span>
              <span>VNN: {selectedVNNNo || selectedVNN?.vnnNo || "None"}</span>
              {header.pricingSerialNo && (
                <>
                  <span>|</span>
                  <span className="text-purple-600 font-medium">PSN: {header.pricingSerialNo}</span>
                </>
              )}
              {fetchingData && (
                <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full text-xs flex items-center">
                  <svg className="animate-spin h-3 w-3 mr-1" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading Vehicle Negotiation...
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
              disabled={saving || fetchingData}
              className={`rounded-xl px-5 py-2 text-sm font-bold text-white transition ${
                saving || fetchingData
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
                  Saving...
                </span>
              ) : 'Save Purchase'}
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
        {/* Loading Info Search Section */}
        <div className="mb-4">
          <Card title="Load from Loading Info">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-4 relative" ref={loadingInfoDropdownRef}>
                <label className="text-xs font-bold text-slate-600">Loading Info (Vehicle Arrival No)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={loadingInfoNo}
                    onChange={(e) => handleLoadingInfoSearch(e.target.value)}
                    onFocus={handleLoadingInfoInputFocus}
                    onBlur={handleLoadingInfoInputBlur}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 pr-8"
                    placeholder="Search loading info..."
                  />
                  {loadingInfoHook.loading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg className="animate-spin h-4 w-4 text-emerald-500" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  )}
                </div>
                
                {showLoadingInfoDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {loadingInfoHook.loading ? (
                      <div className="p-3 text-center text-sm text-slate-500">Loading...</div>
                    ) : filteredLoadingInfos.length > 0 ? (
                      filteredLoadingInfos.map((info) => (
                        <div
                          key={info._id}
                          onMouseDown={() => handleSelectLoadingInfo(info)}
                          className="p-3 hover:bg-emerald-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors"
                        >
                          <div className="font-medium text-slate-800">
                            {info.vehicleArrivalNo}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            Vehicle: {info.vehicleNo || 'N/A'} • VNN: {info.vehicleNegotiationNo || 'N/A'}
                          </div>
                          <div className="text-xs text-slate-400">
                            Branch: {info.branch || 'N/A'}
                          </div>
                          {info.vehicleNegotiationNo && (
                            <div className="text-xs text-emerald-600 mt-1 font-bold">
                              ✓ Has VNN: {info.vehicleNegotiationNo}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center text-sm text-slate-500">
                        No Loading Info found
                      </div>
                    )}
                  </div>
                )}
                <div className="text-xs text-slate-400 mt-1">
                  Select Loading Info to auto-fill from Vehicle Negotiation
                </div>
              </div>

              {selectedVNN && (
                <div className="col-span-12 md:col-span-8">
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <span className="text-xs font-bold text-slate-600">Loaded VNN:</span>
                        <span className="ml-2 text-sm font-bold text-green-800">{selectedVNN.vnnNo}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-600">PSN:</span>
                        <span className="ml-2 text-sm font-bold text-purple-800">{header.pricingSerialNo || 'Not Found'}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-600">Vendor:</span>
                        <span className="ml-2 text-sm text-slate-700">{selectedVNN.approval?.vendorName || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-600">Vehicle:</span>
                        <span className="ml-2 text-sm text-slate-700">{selectedVNN.approval?.vehicleNo || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-600">Orders:</span>
                        <span className="ml-2 text-sm text-slate-700">{selectedVNN.orders?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Header Information - READ ONLY */}
        <Card title="Purchase Information">
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Purchase No</label>
              <input
                type="text"
                value={header.purchaseNo}
                readOnly
                className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed"
                placeholder="Auto-generated on save"
              />
            </div>

            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">VNN No</label>
              <input
                type="text"
                value={selectedVNN?.vnnNo || selectedVNNNo || ""}
                readOnly
                className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed"
                placeholder="Auto-filled from VNN"
              />
            </div>

            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Pricing Serial No</label>
              <input
                type="text"
                value={header.pricingSerialNo}
                readOnly
                className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed"
                placeholder="Auto-filled from VNN"
              />
            </div>

            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Branch *</label>
              <input
                type="text"
                value={`${header.branchName || ''} (${header.branchCode || ''})`}
                readOnly
                className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed"
              />
            </div>

            <div className="col-span-12 md:col-span-1">
              <label className="text-xs font-bold text-slate-600">Date</label>
              <input
                type="text"
                value={header.date}
                readOnly
                className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed"
              />
            </div>

            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Delivery</label>
              <input
                type="text"
                value={header.delivery}
                readOnly
                className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed"
              />
            </div>
          </div>
        </Card>

        {/* Billing Type / Charges Table - READ ONLY */}
        <div className="mt-4">
          <Card title="Billing Type / Charges (Auto-filled from VNN)">
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
                        <input
                          type={col.type || "text"}
                          value={billing[col.key] || ""}
                          readOnly
                          className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm outline-none cursor-not-allowed"
                          placeholder={`${col.label}`}
                        />
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Orders Table - READ ONLY */}
        <div className="mt-4">
          <Card title="Order Details (Auto-filled from VNN & Pricing Panel)">
            <div className="overflow-auto rounded-xl border border-yellow-300">
              <table className="min-w-max w-full text-sm">
                <thead className="sticky top-0 bg-yellow-400 z-10">
                  <tr>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[120px]">Order No</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[150px]">Party Name</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[120px]">Plant</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[100px]">Order Type</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[100px]">Pin Code</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[120px]">Taluka</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[120px]">District</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[120px]">State</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[120px]">Country</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[120px]">From</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[120px]">To</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[100px]">Location Rate</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[100px]">Price List</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[80px]">Weight</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[80px]">Rate</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[100px]">Total Amount</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[130px]">Collection Charges</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[140px]">Cancellation Charges</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[130px]">Loading Charges</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 min-w-[130px]">Other Charges</th>
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
                          readOnly
                          className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm"
                          placeholder="Order No"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.partyName || ""}
                          readOnly
                          className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm"
                          placeholder="Party Name"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.plantName || row.plantCode || ""}
                          readOnly
                          className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm"
                          placeholder="Plant"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.orderType || ""}
                          readOnly
                          className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm"
                          placeholder="Order Type"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.pinCode || ""}
                          readOnly
                          className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm"
                          placeholder="Pin Code"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.taluka || ""}
                          readOnly
                          className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm"
                          placeholder="Taluka"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.district || ""}
                          readOnly
                          className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm"
                          placeholder="District"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.state || ""}
                          readOnly
                          className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm"
                          placeholder="State"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.country || ""}
                          readOnly
                          className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm"
                          placeholder="Country"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.from || ""}
                          readOnly
                          className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm"
                          placeholder="From"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.to || ""}
                          readOnly
                          className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm"
                          placeholder="To"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.locationRate || ""}
                          readOnly
                          className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm"
                          placeholder="Location Rate"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.priceList || ""}
                          readOnly
                          className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm"
                          placeholder="Price List"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="number"
                          value={row.weight || ""}
                          readOnly
                          className="w-20 rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm"
                          placeholder="0"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="number"
                          value={row.rate || ""}
                          readOnly
                          className="w-20 rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm"
                          placeholder="0"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="number"
                          value={row.totalAmount || ""}
                          readOnly
                          className="w-24 rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm font-bold text-emerald-700"
                          placeholder="Auto"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="number"
                          value={row.collectionCharges || ""}
                          readOnly
                          className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm"
                          placeholder="Collection Charges"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.cancellationCharges || ""}
                          readOnly
                          className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm"
                          placeholder="Cancellation Charges"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.loadingCharges || ""}
                          readOnly
                          className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm"
                          placeholder="Loading Charges"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="number"
                          value={row.otherCharges || ""}
                          readOnly
                          className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm"
                          placeholder="Other Charges"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <div className="flex gap-1">
                          <button
                            onClick={() => duplicateOrderRow(row._id)}
                            className="rounded-lg border border-yellow-500 bg-yellow-100 px-2 py-1.5 text-xs font-bold text-yellow-800 hover:bg-yellow-200"
                            title="Duplicate Row"
                          >
                            📋
                          </button>
                          <button
                            onClick={() => removeOrderRow(row._id)}
                            className="rounded-lg bg-red-500 px-2 py-1.5 text-xs font-bold text-white hover:bg-red-600"
                            title="Remove Row"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-yellow-100">
                  <tr>
                    <td colSpan="20" className="border border-yellow-300 px-3 py-2 text-right font-bold">
                      Total Order Amount:
                    </td>
                    <td className="border border-yellow-300 px-3 py-2 font-bold text-emerald-800">
                      ₹{calculateTotalOrderAmount().toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </div>

        {/* Purchase Details Section - READ ONLY */}
        <div className="mt-4">
          <Card title="Purchase Details (Auto-filled from VNN)">
            <div className="grid grid-cols-12 gap-4">
              {/* Left Column - Vendor Info */}
              <div className="col-span-12 md:col-span-4">
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 h-full">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Vendor Information</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600">Vendor Status</label>
                      <input
                        type="text"
                        value={purchaseDetails.vendorStatus || "Active"}
                        readOnly
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm outline-none cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600">Vendor Name *</label>
                      <input
                        type="text"
                        value={purchaseDetails.vendorName}
                        readOnly
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm outline-none cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600">Vendor Code</label>
                      <input
                        type="text"
                        value={purchaseDetails.vendorCode}
                        readOnly
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm outline-none cursor-not-allowed"
                      />
                      <p className="text-xs text-blue-600 mt-1">Auto-filled from Vehicle Negotiation</p>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600">Vehicle No</label>
                      <input
                        type="text"
                        value={purchaseDetails.vehicleNo}
                        readOnly
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm outline-none cursor-not-allowed"
                      />
                      <p className="text-xs text-blue-600 mt-1">Auto-filled from Vehicle Negotiation</p>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600">Vehicle Type</label>
                      <input
                        type="text"
                        value={purchaseDetails.vehicleType || ""}
                        readOnly
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm outline-none cursor-not-allowed"
                      />
                      <p className="text-xs text-blue-600 mt-1">Auto-filled from Vehicle Negotiation</p>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600">Driver Mobile No</label>
                      <input
                        type="text"
                        value={purchaseDetails.driverMobileNo}
                        readOnly
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm outline-none cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600">Purchase Date</label>
                      <input
                        type="date"
                        value={purchaseDetails.purchaseDate}
                        onChange={(e) => setPurchaseDetails({ ...purchaseDetails, purchaseDate: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Column - Purchase Terms (READ ONLY) */}
              <div className="col-span-12 md:col-span-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 h-full">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Purchase Terms (Auto-filled from VNN)</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600">Purchase - Type</label>
                      <input
                        type="text"
                        value={purchaseDetails.purchaseType || "Loading & Unloading"}
                        readOnly
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm outline-none cursor-not-allowed"
                      />
                      <p className="text-xs text-blue-600 mt-1">Auto-filled from Vehicle Negotiation</p>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600">Payment Terms</label>
                      <input
                        type="text"
                        value={purchaseDetails.paymentTerms || "80 % Advance"}
                        readOnly
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm outline-none cursor-not-allowed"
                      />
                      <p className="text-xs text-blue-600 mt-1">Auto-filled from Vehicle Negotiation</p>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600">Rate - Type</label>
                      <input
                        type="text"
                        value={purchaseDetails.rateType || "Per MT"}
                        readOnly
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm outline-none cursor-not-allowed"
                      />
                      <p className="text-xs text-blue-600 mt-1">Auto-filled from Vehicle Negotiation</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-bold text-slate-600">Rate (₹)</label>
                        <input
                          type="number"
                          value={purchaseDetails.rate}
                          readOnly
                          className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm outline-none cursor-not-allowed"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-600">Weight (MT)</label>
                        <input
                          type="number"
                          value={purchaseDetails.weight}
                          readOnly
                          className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm outline-none cursor-not-allowed"
                          placeholder="Auto from orders"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600">Amount (₹)</label>
                      <input
                        type="number"
                        value={purchaseDetails.amount}
                        readOnly
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-bold text-emerald-700"
                        placeholder="Auto-calculated"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600">Advance (₹)</label>
                      <input
                        type="number"
                        value={purchaseDetails.advance}
                        onChange={(e) => setPurchaseDetails({ ...purchaseDetails, advance: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

      {/* Right Column - Uploaded MEMO Display with Full Box Preview */}
<div className="col-span-12 md:col-span-4">
  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200 h-full">
    <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Uploaded MEMO
    </h3>
    
    {memoFileInfo ? (
      <div 
        className="relative group cursor-pointer overflow-hidden rounded-xl border-2 border-green-300 bg-white shadow-lg hover:shadow-xl transition-all duration-300"
        onClick={() => {
          if (memoFileInfo.filePath) {
            window.open(memoFileInfo.filePath, '_blank');
          }
        }}
      >
        {/* Image/File Preview - Full Box */}
        <div className="relative w-full min-h-[280px] bg-gray-100">
          {memoFileInfo.mimeType?.includes('image') ? (
            <img 
              src={memoFileInfo.filePath} 
              alt={memoFileInfo.originalName}
              className="w-full h-full min-h-[280px] object-contain transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = `
                  <div class="flex flex-col items-center justify-center min-h-[280px] bg-gray-100">
                    <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span class="text-sm text-gray-500 mt-2">Preview not available</span>
                    <span class="text-xs text-gray-400 mt-1">Click to view/download</span>
                  </div>
                `;
              }}
            />
          ) : memoFileInfo.mimeType?.includes('pdf') ? (
            <div className="flex flex-col items-center justify-center min-h-[280px] bg-red-50">
              <svg className="w-20 h-20 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="text-lg font-bold text-red-600 mt-3">PDF Document</span>
              <span className="text-sm text-gray-500 mt-1">{memoFileInfo.originalName}</span>
              <span className="text-xs text-gray-400 mt-2">Click to view PDF</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[280px] bg-gray-100">
              <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-lg font-medium text-gray-600 mt-3">{memoFileInfo.originalName}</span>
              <span className="text-sm text-gray-500 mt-1">Click to download</span>
            </div>
          )}
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-2">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="text-white text-sm font-medium">Click to View Full Size</span>
          </div>
        </div>
        
        {/* File Info Footer */}
        <div className="p-3 bg-white border-t border-green-100">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800 truncate" title={memoFileInfo.originalName}>
                {memoFileInfo.originalName}
              </p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">✓ Uploaded</span>
                <span className="text-xs text-slate-500">{(memoFileInfo.size / 1024).toFixed(1)} KB</span>
              </div>
            </div>
            {memoFileInfo.filePath && (
              <a
                href={memoFileInfo.filePath}
                download
                onClick={(e) => e.stopPropagation()}
                className="p-2 text-sky-600 hover:text-sky-800 hover:bg-sky-50 rounded-lg transition-colors"
                title="Download File"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center min-h-[280px] bg-white rounded-xl border-2 border-dashed border-green-300">
        <svg className="w-16 h-16 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm font-medium text-slate-600">No MEMO uploaded yet</p>
        <p className="text-xs text-slate-400 mt-1">Upload MEMO from the section below</p>
      </div>
    )}
  </div>
</div>
            </div>
          </Card>
        </div>

        {/* Loading Charges & Expenses Section - WITH ALL 5 FIELDS */}
        <div className="mt-4">
          <Card title="Loading Charges & Expenses">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-800">Deduct at Office</h3>
                <div className="bg-orange-100 text-orange-800 text-xs px-3 py-1 rounded-full font-medium">
                  Will be deducted from Total Amount
                </div>
              </div>
              
              <div className="space-y-3">
                {/* Loading Charges */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-700">Loading Charges:</span>
                  <input
                    type="number"
                    value={loadingExpenses.loadingCharges}
                    onChange={(e) => setLoadingExpenses({ ...loadingExpenses, loadingCharges: e.target.value })}
                    className="w-32 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-right focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    placeholder="0"
                  />
                </div>
                
                {/* Loading Staff Munshiyana */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-700">Loading Staff Munshiyana:</span>
                  <input
                    type="number"
                    value={loadingExpenses.loadingStaffMunshiyana}
                    onChange={(e) => setLoadingExpenses({ ...loadingExpenses, loadingStaffMunshiyana: e.target.value })}
                    className="w-32 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-right focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    placeholder="0"
                  />
                </div>
                
                {/* Other Expenses */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-700">Other Expenses:</span>
                  <input
                    type="number"
                    value={loadingExpenses.otherExpenses}
                    onChange={(e) => setLoadingExpenses({ ...loadingExpenses, otherExpenses: e.target.value })}
                    className="w-32 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-right focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    placeholder="0"
                  />
                </div>
                
                {/* Vehicle - Floor Tarpaulin */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-700">Vehicle - Floor Tarpaulin:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={loadingExpenses.vehicleFloorTarpaulin}
                      onChange={(e) => setLoadingExpenses({ ...loadingExpenses, vehicleFloorTarpaulin: e.target.value })}
                      className="w-32 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-right focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                      placeholder="0"
                    />
                    <span className="text-xs font-medium text-slate-600 whitespace-nowrap bg-slate-100 px-2 py-1 rounded-lg">
                      {purchaseDetails.vehicleType || "Truck"}
                    </span>
                  </div>
                </div>
                
                {/* Vehicle - Outer Tarpaulin */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-700">Vehicle - Outer Tarpaulin:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={loadingExpenses.vehicleOuterTarpaulin}
                      onChange={(e) => setLoadingExpenses({ ...loadingExpenses, vehicleOuterTarpaulin: e.target.value })}
                      className="w-32 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-right focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                      placeholder="0"
                    />
                    <span className="text-xs font-medium text-slate-600 whitespace-nowrap bg-slate-100 px-2 py-1 rounded-lg">
                      {purchaseDetails.vehicleType || "Truck"}
                    </span>
                  </div>
                </div>
                
                {/* Total Line */}
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 mt-2">
                  <span className="text-sm font-bold text-slate-800">Total (to be deducted at office):</span>
                  <span className="font-bold text-orange-700 text-lg">
                    ₹{calculateTotalLoadingExpenses().toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Vehicle Registration Section */}
        <div className="mt-4">
          <Card title="Vehicle Registration">
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-12 md:col-span-5">
                <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-slate-600">Loading Panel Vehicle - Plate</label>
                    <input
                      type="text"
                      value={registeredVehicle.loadingPanelPlate || purchaseDetails.vehicleNo || ""}
                      readOnly
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-blue-100 px-3 py-2 text-sm text-blue-800 font-medium outline-none cursor-not-allowed"
                      placeholder="Auto-filled from Loading Info"
                    />
                    <p className="text-xs text-blue-600 mt-1">ⓘ Auto-filled from Vehicle Negotiation</p>
                  </div>
                </div>
              </div>

              <div className="col-span-12 md:col-span-5">
                <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-slate-200">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-slate-600">Registered Vehicle - Plate</label>
                    <input
                      type="text"
                      value={registeredVehicle.registeredPlate}
                      onChange={(e) => setRegisteredVehicle({ 
                        ...registeredVehicle, 
                        registeredPlate: e.target.value 
                      })}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                      placeholder="Enter registered plate number"
                    />
                    <p className="text-xs text-slate-500 mt-1">Enter the actual registered plate if different</p>
                  </div>
                </div>
              </div>

              <div className="col-span-12 md:col-span-2">
                <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200 h-full">
                  <div className="flex flex-col items-start">
                    <label className="text-xs font-bold text-slate-600 mb-1">Verification</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="registered"
                        checked={registeredVehicle.isRegistered}
                        onChange={(e) => setRegisteredVehicle({ 
                          ...registeredVehicle, 
                          isRegistered: e.target.checked 
                        })}
                        className="h-5 w-5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      />
                      <label htmlFor="registered" className="text-sm font-medium text-slate-700">
                        Verified Registered
                      </label>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Check if verified</p>
                  </div>
                </div>
              </div>
            </div>

            {registeredVehicle.loadingPanelPlate && registeredVehicle.registeredPlate && (
              <div className="mt-3 px-3">
                {registeredVehicle.loadingPanelPlate === registeredVehicle.registeredPlate ? (
                  <div className="text-xs text-green-600 bg-green-50 p-2 rounded-lg inline-flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    ✓ Plates match - Verified
                  </div>
                ) : (
                  <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg inline-flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    ⚠️ Different plate entered - Manual verification required
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Additions & Deductions Section - Shows Advance Paid + Deduct at Office */}
        <div className="mt-4">
          <div className="grid grid-cols-12 gap-4">
            {/* Advance + Deduct at Office Summary */}
            <div className="col-span-12">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-xs text-slate-500">Advance Paid</div>
                    <div className="text-2xl font-bold text-emerald-700">₹{num(purchaseDetails.advance).toLocaleString()}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-slate-500">Deduct at Office</div>
                    <div className="text-2xl font-bold text-orange-700">₹{calculateTotalLoadingExpenses().toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>

           {/* Deductions Column */}
<div className="col-span-12 md:col-span-6">
  <Card 
    title="Deductions (-) - Adjustments"
    right={
      <button
        onClick={addDeductionRow}
        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700"
      >
        + Add Deduction
      </button>
    }
  >
    {deductions.length === 0 ? (
      <div className="text-center py-8 text-slate-500 border-2 border-dashed border-red-200 rounded-lg">
        <svg className="mx-auto h-8 w-8 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
        <p className="mt-2">No deductions added. Click "Add Deduction" to add deductions.</p>
      </div>
    ) : (
      <div className="overflow-auto rounded-xl border border-red-300">
        <table className="min-w-full w-full text-sm">
          <thead className="bg-red-100">
            <tr>
              <th className="border border-red-300 px-3 py-2 text-xs font-bold text-slate-800">Description</th>
              <th className="border border-red-300 px-3 py-2 text-xs font-bold text-slate-800">Amount (₹)</th>
              <th className="border border-red-300 px-3 py-2 text-xs font-bold text-slate-800">Action</th>
            </tr>
          </thead>
          <tbody>
            {deductions.map((row) => (
              <tr key={row._id} className="hover:bg-red-50">
                <td className="border border-red-300 px-2 py-2">
                  <input
                    type="text"
                    value={row.description}
                    onChange={(e) => updateDeductionRow(row._id, 'description', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                    placeholder="Description"
                  />
                </td>
                <td className="border border-red-300 px-2 py-2">
                  <input
                    type="number"
                    value={row.amount}
                    onChange={(e) => updateDeductionRow(row._id, 'amount', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-right"
                    placeholder="0.00"
                  />
                </td>
                <td className="border border-red-300 px-2 py-2 text-center">
                  <button
                    onClick={() => removeDeductionRow(row._id)}
                    className="rounded-lg bg-red-500 px-2 py-1.5 text-xs font-bold text-white hover:bg-red-600"
                    title="Remove"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
            <tr className="bg-red-100 font-bold">
              <td className="border border-red-300 px-3 py-2 text-right">Total Deductions:</td>
              <td className="border border-red-300 px-3 py-2 text-right text-red-700">
                ₹{calculateTotalDeductions().toLocaleString()}
              </td>
              <td className="border border-red-300 px-3 py-2"></td>
            </tr>
          </tbody>
        </table>
      </div>
    )}
  </Card>
</div>

           {/* Additions Column */}
<div className="col-span-12 md:col-span-6">
  <Card 
    title="Additions (+) - Extra Charges"
    right={
      <button
        onClick={addAdditionRow}
        className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700"
      >
        + Add Addition
      </button>
    }
  >
    {additions.length === 0 ? (
      <div className="text-center py-8 text-slate-500 border-2 border-dashed border-green-200 rounded-lg">
        <svg className="mx-auto h-8 w-8 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <p className="mt-2">No additions added. Click "Add Addition" to add charges.</p>
      </div>
    ) : (
      <div className="overflow-auto rounded-xl border border-green-300">
        <table className="min-w-full w-full text-sm">
          <thead className="bg-green-100">
            <tr>
              <th className="border border-green-300 px-3 py-2 text-xs font-bold text-slate-800">Description</th>
              <th className="border border-green-300 px-3 py-2 text-xs font-bold text-slate-800">Amount (₹)</th>
              <th className="border border-green-300 px-3 py-2 text-xs font-bold text-slate-800">Action</th>
            </tr>
          </thead>
          <tbody>
            {additions.map((row) => (
              <tr key={row._id} className="hover:bg-green-50">
                <td className="border border-green-300 px-2 py-2">
                  <input
                    type="text"
                    value={row.description}
                    onChange={(e) => updateAdditionRow(row._id, 'description', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                    placeholder="Description"
                  />
                </td>
                <td className="border border-green-300 px-2 py-2">
                  <input
                    type="number"
                    value={row.amount}
                    onChange={(e) => updateAdditionRow(row._id, 'amount', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-right"
                    placeholder="0.00"
                  />
                </td>
                <td className="border border-green-300 px-2 py-2 text-center">
                  <button
                    onClick={() => removeAdditionRow(row._id)}
                    className="rounded-lg bg-red-500 px-2 py-1.5 text-xs font-bold text-white hover:bg-red-600"
                    title="Remove"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
            <tr className="bg-green-100 font-bold">
              <td className="border border-green-300 px-3 py-2 text-right">Total Additions:</td>
              <td className="border border-green-300 px-3 py-2 text-right text-emerald-700">
                ₹{calculateTotalAdditions().toLocaleString()}
              </td>
              <td className="border border-green-300 px-3 py-2"></td>
            </tr>
          </tbody>
        </table>
      </div>
    )}
  </Card>
</div>
        </div>

        {/* Final Summary & Balance - Updated Formula */}
        <div className="mt-4">
          <Card title="Purchase Summary & Balance">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Total Order Amount:</span>
                      <span className="font-bold text-blue-800">₹{calculateTotalOrderAmount().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Advance Paid:</span>
                      <span className="font-bold text-emerald-700">₹{num(purchaseDetails.advance).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-blue-200">
                      <span className="text-sm font-bold text-slate-800">Final Balance:</span>
                      <span className="text-xl font-bold text-purple-800">₹{calculateBalance().toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Formula: Total Order Amount - Advance Paid
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-span-12 md:col-span-4">
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-4 rounded-xl border border-amber-200">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Additions & Deductions</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Advance Paid:</span>
                      <span className="font-bold text-emerald-700">₹{num(purchaseDetails.advance).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Deduct at Office:</span>
                      <span className="font-bold text-orange-700">₹{calculateTotalLoadingExpenses().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Total Additions (+):</span>
                      <span className="font-bold text-emerald-700">₹{calculateTotalAdditions().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Total Deductions (-):</span>
                      <span className="font-bold text-red-700">₹{calculateTotalDeductions().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-amber-200">
                      <span className="text-sm font-bold text-slate-800">Net Effect:</span>
                      <span className={`font-bold ${calculateNetEffect() >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                        ₹{calculateNetEffect().toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-span-12 md:col-span-4">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Payment Info</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Purchase Amount:</span>
                      <span className="font-bold text-blue-800">₹{num(purchaseDetails.amount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Balance Due:</span>
                      <span className="font-bold text-purple-800">₹{calculateBalance().toLocaleString()}</span>
                    </div>
                    <div className="mt-3 pt-2 border-t border-purple-200">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600">JV Entry Required:</span>
                        <span className="font-bold text-purple-700">Dr. / Cr.</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <span className="inline-block w-1 h-1 bg-purple-400 rounded-full"></span>
                        JV need for making the payment in Driver or Motor Owner Account.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Purchase MEMO & Approval - With Upload */}
        <div className="mt-4">
          <Card title="Purchase - MEMO & Approval">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Purchase MEMO</h3>
                  <div className="flex flex-col gap-3">
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleMemoUpload}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500"
                    />
                    {memoFileInfo && (
                      <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <div>
                            <p className="text-xs font-medium text-green-800">{memoFileInfo.originalName}</p>
                            <p className="text-xs text-green-600">Uploaded successfully</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-span-12 md:col-span-6">
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Approval / Rejection (Read Only)</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <select
                        value={approval.status}
                        disabled
                        className="flex-1 rounded-lg border border-slate-200 bg-slate-100 px-4 py-2 text-sm outline-none cursor-not-allowed"
                      >
                        <option value="">{approval.status || "Auto-filled from VNN"}</option>
                        {APPROVAL_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <span className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-lg whitespace-nowrap">
                        Auto Fetch from VNN
                      </span>
                    </div>
                    <div>
                      <textarea
                        value={approval.remarks}
                        readOnly
                        rows={2}
                        className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm outline-none cursor-not-allowed"
                        placeholder="Auto-filled from VNN"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Arrival Details */}
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
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500"
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
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500"
                    placeholder="HH:MM"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
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

