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
const STATUS_OPTIONS = ["Draft", "Approved", "Rejected", "Completed", "Pending"];

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
function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/order-panel', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  return { orders, loading, fetchOrders };
}

function useVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/vendors', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setVendors(data.data);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  return { vendors, loading, fetchVendors };
}

function usePlants() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPlants = async () => {
    setLoading(true);
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
      console.error('Error fetching plants:', error);
    } finally {
      setLoading(false);
    }
  };

  return { plants, loading, fetchPlants };
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

function useLoadingInfo() {
  const [loadingInfos, setLoadingInfos] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLoadingInfos = async (currentNoteId = null) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch('/api/loading-panel?format=table', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        console.warn('Loading Info API returned', res.status);
        setLoadingInfos([]);
        return;
      }
      
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        // Check which loading infos are already used in consignment notes
        const consignmentRes = await fetch('/api/consignment-note?format=table', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const consignmentData = await consignmentRes.json();
        
        // Create a Set of used loading info numbers (excluding current note)
        const usedLoadingInfos = new Set();
        if (consignmentData.success && Array.isArray(consignmentData.data)) {
          consignmentData.data.forEach(item => {
            // Don't count the current note's loading info as used
            if (item.loadingInfoNo && item.loadingInfoNo !== '' && item._id !== currentNoteId) {
              usedLoadingInfos.add(item.loadingInfoNo);
            }
          });
        }
        
        // Filter out loading infos that are already used
        const availableLoadingInfos = data.data.filter(info => 
          !usedLoadingInfos.has(info.vehicleArrivalNo)
        );
        
        console.log(`📊 Found ${availableLoadingInfos.length} available loading infos out of ${data.data.length} total`);
        
        const enhancedData = availableLoadingInfos.map(item => ({
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
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Error fetching loading info by ID:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { 
    loadingInfos, 
    loading, 
    fetchLoadingInfos, 
    getLoadingInfoById
  };
}

/** =========================
 * DEFAULT EMPTY ROWS
 ========================= */
function defaultProductRow() {
  return {
    _id: uid(),
    totalPkgs: "",
    pkgsType: "",
    uom: "",
    packSize: "",
    skuSize: "",
    productName: "",
    wtLtr: "",
    actualWt: "",
    chargedWt: "",
    wtUom: "MT",
  };
}

export default function EditConsignmentNote() {
  const router = useRouter();
  const params = useParams();
  const noteId = params.id;

  /** =========================
   * CUSTOM HOOKS
   ========================= */
  const orderHook = useOrders();
  const vendorHook = useVendors();
  const plantHook = usePlants();
  const vehicleNegotiationHook = useVehicleNegotiation();
  const loadingInfoHook = useLoadingInfo();

  /** =========================
   * STATE FOR API DATA
   ========================= */
  const [orders, setOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [fetchingData, setFetchingData] = useState(false);

  /** =========================
   * LOADING INFO STATE
   ========================= */
  const [loadingInfoNo, setLoadingInfoNo] = useState("");
  const [showLoadingInfoDropdown, setShowLoadingInfoDropdown] = useState(false);
  const [filteredLoadingInfos, setFilteredLoadingInfos] = useState([]);
  const loadingInfoDropdownRef = useRef(null);
  const [vnnData, setVnnData] = useState(null);

  /** =========================
   * HEADER STATE
   ========================= */
  const [header, setHeader] = useState({
    partyName: "",
    orderNo: "",
    orderType: "Sales",
    plantCode: "",
    plantName: "",
    hiredOwned: "Hired",
    vendorCode: "",
    vendorName: "",
    from: "",
    to: "",
    district: "",
    state: "",
    vehicleNo: "",
    partyNo: "",
    lrNo: "",
    lrDate: "",
    unit: "MT",
    status: "Pending"
  });

  /** =========================
   * CONSIGNOR/CONSIGNEE STATE
   ========================= */
  const [consignor, setConsignor] = useState({
    name: "",
    address: "",
  });

  const [consignee, setConsignee] = useState({
    name: "",
    address: "",
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
   * PRODUCT ROWS STATE
   ========================= */
  const [productRows, setProductRows] = useState([]);
  const [vnnNo, setVnnNo] = useState("");
  const [vehicleNegotiationId, setVehicleNegotiationId] = useState("");

  /** =========================
   * FETCH DATA ON MOUNT
   ========================= */
  useEffect(() => {
    if (noteId) {
      fetchConsignmentNote();
    }
    fetchData();
    loadingInfoHook.fetchLoadingInfos(noteId);
  }, [noteId]);

  useEffect(() => {
    if (loadingInfoHook.loadingInfos.length > 0) {
      setFilteredLoadingInfos(loadingInfoHook.loadingInfos);
    }
  }, [loadingInfoHook.loadingInfos]);

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
      
      // Set reference fields
      if (note.vnnNo) setVnnNo(note.vnnNo);
      if (note.vehicleNegotiationId) setVehicleNegotiationId(note.vehicleNegotiationId);
      if (note.loadingInfoNo) setLoadingInfoNo(note.loadingInfoNo);
      
      // Set header data
      setHeader({
        partyName: note.header?.partyName || "",
        orderNo: note.header?.orderNo || "",
        orderType: note.header?.orderType || "Sales",
        plantCode: note.header?.plantCode || "",
        plantName: note.header?.plantName || "",
        hiredOwned: note.header?.hiredOwned || "Hired",
        vendorCode: note.header?.vendorCode || "",
        vendorName: note.header?.vendorName || "",
        from: note.header?.from || "",
        to: note.header?.to || "",
        district: note.header?.district || "",
        state: note.header?.state || "",
        vehicleNo: note.header?.vehicleNo || "",
        partyNo: note.header?.partyNo || "",
        lrNo: note.lrNo || "",
        lrDate: note.header?.lrDate || "",
        unit: note.header?.unit || "MT",
        status: note.header?.status || "Pending"
      });

      // Set consignor
      setConsignor({
        name: note.consignor?.name || "",
        address: note.consignor?.address || ""
      });

      // Set consignee
      setConsignee({
        name: note.consignee?.name || "",
        address: note.consignee?.address || ""
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

      // Set product rows
      if (note.productRows && note.productRows.length > 0) {
        const processedRows = note.productRows.map(row => ({
          ...row,
          _id: row._id || uid(),
          totalPkgs: row.totalPkgs?.toString() || "",
          packSize: row.packSize?.toString() || "",
          wtLtr: row.wtLtr?.toString() || "",
          actualWt: row.actualWt?.toString() || "",
          chargedWt: row.chargedWt?.toString() || "",
        }));
        setProductRows(processedRows);
      } else {
        setProductRows([defaultProductRow()]);
      }

    } catch (error) {
      console.error('Error fetching consignment note:', error);
      setApiError(error.message);
      alert(`❌ Failed to load consignment note: ${error.message}`);
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        orderHook.fetchOrders(),
        vendorHook.fetchVendors(),
        plantHook.fetchPlants()
      ]);
      
      setOrders(orderHook.orders);
      setVendors(vendorHook.vendors);
      setPlants(plantHook.plants);
    } catch (error) {
      console.error('Error fetching data:', error);
      setApiError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

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
      const fullInfo = await loadingInfoHook.getLoadingInfoById(loadingInfo._id);
      
      if (fullInfo) {
        console.log("📦 Full Loading Info:", fullInfo);
        
        // Get VNN from loading info
        const vnnFromLoading = fullInfo.vehicleNegotiationNo;
        
        if (vnnFromLoading) {
          // Fetch Vehicle Negotiation data
          const vnnData = await vehicleNegotiationHook.getNegotiationByVNN(vnnFromLoading);
          
          if (vnnData) {
            setVnnData(vnnData);
            setVnnNo(vnnFromLoading);
            setVehicleNegotiationId(vnnData._id);
            console.log("✅ Vehicle Negotiation Data:", vnnData);
            
            // ===== EXTRACT VENDOR CODE FROM VNN APPROVAL =====
            const approval = vnnData.approval || {};
            const vendorCode = approval.vendorCode || "";  // Get vendor code from approval
            const vendorName = approval.vendorName || vnnData.vendorName || "";
            
            console.log("✅ Vendor from VNN:", { vendorName, vendorCode });
            
            // Auto-fill from VNN data including vendor code
            setHeader(prev => ({
              ...prev,
              vendorName: vendorName || prev.vendorName,
              vendorCode: vendorCode || prev.vendorCode,  // ✅ Set vendor code from VNN
              vehicleNo: approval.vehicleNo || vnnData.vehicleInfo?.vehicleNo || prev.vehicleNo,
            }));

            // Auto-fill from VNN orders
            if (vnnData.orders && vnnData.orders.length > 0) {
              const firstOrder = vnnData.orders[0];
              setHeader(prev => ({
                ...prev,
                partyName: firstOrder.partyName || vnnData.customerName || "",
                orderNo: firstOrder.orderNo || "",
                plantCode: firstOrder.plantCodeValue || firstOrder.plantCode || "",
                plantName: firstOrder.plantName || "",
                from: firstOrder.fromName || firstOrder.from || "",
                to: firstOrder.toName || firstOrder.to || "",
                district: firstOrder.districtName || firstOrder.district || "",
                state: firstOrder.stateName || firstOrder.state || "",
              }));
              
              setConsignor(prev => ({
                ...prev,
                name: firstOrder.partyName || vnnData.customerName || "",
              }));
            }
            
            // Show success message with vendor info
            if (vendorCode) {
              alert(`✅ Data loaded from Vehicle Negotiation!\nVendor: ${vendorName} (Code: ${vendorCode})`);
            } else {
              alert(`✅ Data loaded from Vehicle Negotiation: ${vnnFromLoading}`);
            }
          }
        }

        // Auto-fill vehicle information from loading info (fallback)
        if (fullInfo.vehicleInfo && !vnnData) {
          setHeader(prev => ({
            ...prev,
            vehicleNo: fullInfo.vehicleInfo.vehicleNo || prev.vehicleNo,
            partyNo: fullInfo.vehicleInfo.driverMobileNo || "",
          }));
        }

        // Auto-fill from/to locations from order rows (fallback)
        if (fullInfo.orderRows && fullInfo.orderRows.length > 0 && !vnnData) {
          const firstOrder = fullInfo.orderRows[0];
          setHeader(prev => ({
            ...prev,
            from: firstOrder.from || "",
            to: firstOrder.to || "",
            district: firstOrder.district || "",
            state: firstOrder.state || "",
          }));
        }

        // Auto-fill product rows from pack data
        if (fullInfo.packData) {
          const products = [];
          
          // Get products from PALLETIZATION
          if (fullInfo.packData.PALLETIZATION && fullInfo.packData.PALLETIZATION.length > 0) {
            fullInfo.packData.PALLETIZATION.forEach(item => {
              products.push({
                _id: uid(),
                totalPkgs: item.totalPkgs?.toString() || "",
                pkgsType: item.pkgsType || "",
                uom: item.uom || "",
                packSize: item.skuSize || "",
                skuSize: item.skuSize || "",
                productName: item.productName || "",
                wtLtr: item.wtLtr?.toString() || "",
                actualWt: item.actualWt?.toString() || "",
                chargedWt: item.chargedWt?.toString() || "",
                wtUom: item.wtUom || "MT",
              });
            });
          }
          
          // Get products from UNIFORM
          if (fullInfo.packData['UNIFORM - BAGS/BOXES'] && fullInfo.packData['UNIFORM - BAGS/BOXES'].length > 0) {
            fullInfo.packData['UNIFORM - BAGS/BOXES'].forEach(item => {
              products.push({
                _id: uid(),
                totalPkgs: item.totalPkgs?.toString() || "",
                pkgsType: item.pkgsType || "",
                uom: item.uom || "",
                packSize: item.skuSize || "",
                skuSize: item.skuSize || "",
                productName: item.productName || "",
                wtLtr: item.wtLtr?.toString() || "",
                actualWt: item.actualWt?.toString() || "",
                chargedWt: item.chargedWt?.toString() || "",
                wtUom: item.wtUom || "MT",
              });
            });
          }
          
          // Get products from LOOSE CARGO
          if (fullInfo.packData['LOOSE - CARGO'] && fullInfo.packData['LOOSE - CARGO'].length > 0) {
            fullInfo.packData['LOOSE - CARGO'].forEach(item => {
              products.push({
                _id: uid(),
                totalPkgs: "1",
                pkgsType: "Loose",
                uom: item.uom || "",
                packSize: "",
                skuSize: "",
                productName: item.productName || "",
                wtLtr: "",
                actualWt: item.actualWt?.toString() || "",
                chargedWt: item.chargedWt?.toString() || "",
                wtUom: item.uom || "MT",
              });
            });
          }
          
          if (products.length > 0) {
            setProductRows(products);
          }
        }
        
        alert(`✅ Data loaded from Loading Info: ${loadingInfo.vehicleArrivalNo}`);
      }
    } catch (error) {
      console.error("Error loading loading info:", error);
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
   * PRODUCT ROW FUNCTIONS
   ========================= */
  const addProductRow = () => setProductRows([...productRows, defaultProductRow()]);

  const updateProductRow = (rowId, key, value) => {
    setProductRows((prev) =>
      prev.map((r) => {
        if (r._id === rowId) {
          const updatedRow = { ...r, [key]: value };
          
          // Auto-calculate WT (LTR) = TOTAL PKGS * PACK SIZE
          if (key === "totalPkgs" || key === "packSize") {
            const totalPkgs = num(updatedRow.totalPkgs);
            const packSize = parseFloat(updatedRow.packSize) || 0;
            updatedRow.wtLtr = (totalPkgs * packSize).toString();
            
            // Auto-calculate ACTUAL WT (convert to MT if needed)
            if (updatedRow.wtUom === "MT") {
              updatedRow.actualWt = ((totalPkgs * packSize) / 1000).toString();
            } else {
              updatedRow.actualWt = (totalPkgs * packSize).toString();
            }
          }
          
          // Auto-calculate ACTUAL WT from WT LTR
          if (key === "wtLtr") {
            const wtLtr = num(updatedRow.wtLtr);
            if (updatedRow.wtUom === "MT") {
              updatedRow.actualWt = (wtLtr / 1000).toString();
            } else {
              updatedRow.actualWt = wtLtr.toString();
            }
          }
          
          // Update CHARGED WT when ACTUAL WT changes (optional auto-fill)
          if (key === "actualWt" && !updatedRow.chargedWt) {
            updatedRow.chargedWt = updatedRow.actualWt;
          }
          
          return updatedRow;
        }
        return r;
      })
    );
  };

  const removeProductRow = (rowId) => {
    if (productRows.length > 1) {
      setProductRows((prev) => prev.filter((r) => r._id !== rowId));
    } else {
      alert("At least one product row is required");
    }
  };

  const duplicateProductRow = (rowId) => {
    const row = productRows.find((r) => r._id === rowId);
    if (!row) return;
    setProductRows([...productRows, { ...row, _id: uid() }]);
  };

  /** =========================
   * CALCULATED VALUES
   ========================= */
  const calculateTotalActualWt = () => {
    return productRows.reduce((sum, row) => sum + num(row.actualWt), 0);
  };

  /** =========================
   * HANDLE UPDATE
   ========================= */
  const handleUpdate = async () => {
    if (!header.partyName) {
      alert("Please select a party");
      return;
    }

    if (!header.orderNo) {
      alert("Please enter order number");
      return;
    }

    if (!header.vendorName) {
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
        id: noteId,
        vnnNo,
        vehicleNegotiationId,
        loadingInfoNo,
        header,
        consignor,
        consignee,
        invoice,
        ewaybill,
        productRows: productRows.map(row => ({
          ...row,
          totalPkgs: row.totalPkgs || '',
          pkgsType: row.pkgsType || '',
          uom: row.uom || '',
          packSize: row.packSize || '',
          skuSize: row.skuSize || '',
          productName: row.productName || '',
          wtLtr: parseFloat(row.wtLtr) || 0,
          actualWt: parseFloat(row.actualWt) || 0,
          chargedWt: parseFloat(row.chargedWt) || 0,
          wtUom: row.wtUom || 'MT'
        })),
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
              {loadingInfoNo && (
                <>
                  <span>Loading Info: {loadingInfoNo}</span>
                  <span>|</span>
                </>
              )}
              {vnnNo && (
                <>
                  <span>VNN: {vnnNo}</span>
                  <span>|</span>
                </>
              )}
              <span>Status: {header.status}</span>
              {fetchingData && (
                <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full text-xs flex items-center">
                  <svg className="animate-spin h-3 w-3 mr-1" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
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
                  Updating...
                </span>
              ) : 'Update LR'}
            </button>
          </div>
        </div>
      </div>

      {/* ===== Main Content ===== */}
      <div className="mx-auto max-w-full p-4">
        {/* ===== Loading Info Search ===== */}
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
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 pr-8"
                    placeholder="Search loading info..."
                  />
                  {loadingInfoHook.loading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg className="animate-spin h-4 w-4 text-purple-500" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  )}
                </div>
                
                {showLoadingInfoDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {loadingInfoHook.loading ? (
                      <div className="p-3 text-center text-sm text-slate-500">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500 mx-auto"></div>
                        <p className="mt-1">Loading...</p>
                      </div>
                    ) : filteredLoadingInfos.length > 0 ? (
                      filteredLoadingInfos.map((info) => (
                        <div
                          key={info._id}
                          onMouseDown={() => handleSelectLoadingInfo(info)}
                          className="p-3 hover:bg-purple-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors"
                        >
                          <div className="font-medium text-slate-800">
                            {info.vehicleArrivalNo}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            Vehicle: {info.vehicleNo || 'N/A'} • 
                            From: {info.orderRows?.[0]?.from || 'N/A'} → 
                            To: {info.orderRows?.[0]?.to || 'N/A'}
                          </div>
                          <div className="text-xs text-slate-400">
                            Branch: {info.branch || 'N/A'}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center text-sm text-slate-500">
                        {loadingInfoNo.trim() ? 
                          `No loading info found for "${loadingInfoNo}"` : 
                          "No loading info available"
                        }
                      </div>
                    )}
                  </div>
                )}
                <div className="text-xs text-slate-400 mt-1">Select to auto-fill vehicle, vendor, and product data</div>
              </div>
            </div>
          </Card>
        </div>

        {/* ===== Party Information ===== */}
        <Card title="Party Information">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Party Name *</label>
              <input
                type="text"
                value={header.partyName}
                onChange={(e) => setHeader({ ...header, partyName: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                placeholder="Enter party name"
              />
            </div>

            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Order No *</label>
              <input
                type="text"
                value={header.orderNo}
                onChange={(e) => setHeader({ ...header, orderNo: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                placeholder="Enter order no"
              />
            </div>

            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Order Type</label>
              <select
                value={header.orderType}
                onChange={(e) => setHeader({ ...header, orderType: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
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
                onChange={(e) => setHeader({ ...header, plantCode: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                placeholder="Plant code"
              />
            </div>

            <div className="col-span-12 md:col-span-1">
              <label className="text-xs font-bold text-slate-600">Hired/Owned</label>
              <select
                value={header.hiredOwned}
                onChange={(e) => setHeader({ ...header, hiredOwned: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
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
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                placeholder="Vendor code"
              />
            </div>

            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Vendor Name *</label>
              <input
                type="text"
                value={header.vendorName}
                onChange={(e) => setHeader({ ...header, vendorName: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                placeholder="Vendor name"
              />
            </div>

            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">From</label>
              <input
                type="text"
                value={header.from}
                onChange={(e) => setHeader({ ...header, from: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                placeholder="Kandla"
              />
            </div>

            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">To</label>
              <input
                type="text"
                value={header.to}
                onChange={(e) => setHeader({ ...header, to: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                placeholder="Darayoganj"
              />
            </div>

            <div className="col-span-12 md:col-span-1">
              <label className="text-xs font-bold text-slate-600">District</label>
              <input
                type="text"
                value={header.district}
                onChange={(e) => setHeader({ ...header, district: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                placeholder="Etah"
              />
            </div>

            <div className="col-span-12 md:col-span-1">
              <label className="text-xs font-bold text-slate-600">State</label>
              <input
                type="text"
                value={header.state}
                onChange={(e) => setHeader({ ...header, state: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                placeholder="UP"
              />
            </div>

            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Vehicle No</label>
              <input
                type="text"
                value={header.vehicleNo}
                onChange={(e) => setHeader({ ...header, vehicleNo: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                placeholder="HR38X8960"
              />
            </div>

            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Party/Mobile No</label>
              <input
                type="text"
                value={header.partyNo}
                onChange={(e) => setHeader({ ...header, partyNo: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
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
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                placeholder="DD.MM.YYYY"
              />
            </div>

            <div className="col-span-12 md:col-span-1">
              <label className="text-xs font-bold text-slate-600">Unit</label>
              <select
                value={header.unit}
                onChange={(e) => setHeader({ ...header, unit: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
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
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
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
                  <div>
                    <label className="text-xs font-bold text-slate-600">Consignor Name</label>
                    <input
                      type="text"
                      value={consignor.name}
                      onChange={(e) => setConsignor({ ...consignor, name: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                      placeholder="Enter consignor name"
                    />
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
                  </div>
                </div>
              </Card>
            </div>

            <div className="col-span-12 md:col-span-6">
              <Card title="Consignee (Receiver)">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-600">Consignee Name</label>
                    <input
                      type="text"
                      value={consignee.name}
                      onChange={(e) => setConsignee({ ...consignee, name: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                      placeholder="Enter consignee name"
                    />
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
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
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
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                  placeholder="DC20004623"
                />
              </div>

              <div className="col-span-12 md:col-span-3">
                <label className="text-xs font-bold text-slate-600">BOE / Invoice Date</label>
                <input
                  type="text"
                  value={invoice.boeInvoiceDate}
                  onChange={(e) => setInvoice({ ...invoice, boeInvoiceDate: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                  placeholder="DD.MM.YYYY"
                />
              </div>

              <div className="col-span-12 md:col-span-3">
                <label className="text-xs font-bold text-slate-600">Invoice Value</label>
                <input
                  type="text"
                  value={invoice.invoiceValue}
                  onChange={(e) => setInvoice({ ...invoice, invoiceValue: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
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
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                  placeholder="5641 3563 6264"
                />
              </div>

              <div className="col-span-12 md:col-span-4">
                <label className="text-xs font-bold text-slate-600">Expiry Date</label>
                <input
                  type="text"
                  value={ewaybill.expiryDate}
                  onChange={(e) => setEwaybill({ ...ewaybill, expiryDate: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                  placeholder="DD.MM.YYYY"
                />
              </div>

              <div className="col-span-12 md:col-span-4">
                <label className="text-xs font-bold text-slate-600">Container No</label>
                <input
                  type="text"
                  value={ewaybill.containerNo}
                  onChange={(e) => setEwaybill({ ...ewaybill, containerNo: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                  placeholder="TEU8753185M"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* ===== Products Table ===== */}
        <div className="mt-4">
          <Card 
            title="Product Details"
            right={
              <div className="flex gap-2">
                <button
                  onClick={addProductRow}
                  className="rounded-xl bg-yellow-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-yellow-700 transition"
                >
                  + Add Product
                </button>
              </div>
            }
          >
            <div className="overflow-auto rounded-xl border border-yellow-300">
              <table className="min-w-full w-full text-sm">
                <thead className="sticky top-0 bg-yellow-400">
                  <tr>
                    <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">TOTAL PKGS</th>
                    <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">PKGS TYPE</th>
                    <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">UOM</th>
                    <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">Pack Size</th>
                    <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">SKU - SIZE</th>
                    <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">PRODUCT NAME</th>
                    <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">WT (LTR)</th>
                    <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">ACTUAL - WT</th>
                    <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">CHARGED - WT</th>
                    <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">WT UOM</th>
                    <th className="border border-yellow-500 px-2 py-3 text-xs font-extrabold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {productRows.map((row) => (
                    <tr key={row._id} className="hover:bg-yellow-50 even:bg-slate-50">
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="number"
                          value={row.totalPkgs || ""}
                          onChange={(e) => updateProductRow(row._id, 'totalPkgs', e.target.value)}
                          className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                          placeholder="Qty"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <select
                          value={row.pkgsType || ""}
                          onChange={(e) => updateProductRow(row._id, 'pkgsType', e.target.value)}
                          className="w-24 rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm"
                        >
                          <option value="">Select</option>
                          {PKGS_TYPE_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <select
                          value={row.uom || ""}
                          onChange={(e) => updateProductRow(row._id, 'uom', e.target.value)}
                          className="w-16 rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm"
                        >
                          <option value="">UOM</option>
                          {UOM_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.packSize || ""}
                          onChange={(e) => updateProductRow(row._id, 'packSize', e.target.value)}
                          className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                          placeholder="20 Kgs"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <select
                          value={row.skuSize || ""}
                          onChange={(e) => updateProductRow(row._id, 'skuSize', e.target.value)}
                          className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm"
                        >
                          <option value="">Size</option>
                          {SKU_SIZE_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <select
                          value={row.productName || ""}
                          onChange={(e) => updateProductRow(row._id, 'productName', e.target.value)}
                          className="w-40 rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm"
                        >
                          <option value="">Select Product</option>
                          {PRODUCT_NAME_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="number"
                          value={row.wtLtr || ""}
                          readOnly
                          className="w-20 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm"
                          placeholder="Auto"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="number"
                          value={row.actualWt || ""}
                          onChange={(e) => updateProductRow(row._id, 'actualWt', e.target.value)}
                          className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                          placeholder="Weight"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="number"
                          value={row.chargedWt || ""}
                          onChange={(e) => updateProductRow(row._id, 'chargedWt', e.target.value)}
                          className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                          placeholder="Charged"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <select
                          value={row.wtUom || "MT"}
                          onChange={(e) => updateProductRow(row._id, 'wtUom', e.target.value)}
                          className="w-16 rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm"
                        >
                          {UOM_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <div className="flex gap-1">
                          <button
                            onClick={() => duplicateProductRow(row._id)}
                            className="rounded-lg border border-yellow-500 bg-yellow-100 px-2 py-1.5 text-xs font-bold text-yellow-800 hover:bg-yellow-200"
                            title="Duplicate Row"
                          >
                            Dup
                          </button>
                          <button
                            onClick={() => removeProductRow(row._id)}
                            className="rounded-lg bg-red-500 px-2 py-1.5 text-xs font-bold text-white hover:bg-red-600"
                            title="Remove Row"
                          >
                            Del
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-yellow-100">
                  <tr>
                    <td colSpan="7" className="border border-yellow-300 px-3 py-2 text-right font-bold">
                      Total Actual Weight:
                    </td>
                    <td className="border border-yellow-300 px-3 py-2 font-bold text-emerald-700">
                      {calculateTotalActualWt().toFixed(2)} {header.unit}
                    </td>
                    <td colSpan="3" className="border border-yellow-300 px-3 py-2"></td>
                  </tr>
                </tfoot>
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
                      <span className="font-bold text-amber-800">{header.vehicleNo || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Vendor:</span>
                      <span className="font-bold text-amber-800">{header.vendorName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Mobile No:</span>
                      <span className="font-bold text-amber-800">{header.partyNo || 'N/A'}</span>
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
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Total Products:</span>
                      <span className="font-bold text-purple-800">{productRows.length}</span>
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