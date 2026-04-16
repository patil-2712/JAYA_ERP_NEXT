//"use client";
//
//import { useMemo, useState, useEffect, useRef, useCallback } from "react";
//import { useRouter, useParams } from "next/navigation";
//
///** =========================
// * CONSTANTS
// ========================= */
//const PACK_TYPES = [
//  { key: "PALLETIZATION", label: "Palletization" },
//  { key: "UNIFORM - BAGS/BOXES", label: "Uniform - Bags/Boxes" },
//  { key: "LOOSE - CARGO", label: "Loose - Cargo" },
//  { key: "NON-UNIFORM - GENERAL CARGO", label: "Non-uniform - General Cargo" },
//];
//
//const ORDER_TYPES = ["Sales", "STO Order", "Export", "Import"];
//const STATUSES = ["Open", "Hold", "Cancelled"];
//const DELIVERY_OPTIONS = ["Urgent", "Normal", "Express", "Scheduled"];
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
///** =========================
// * DEFAULT EMPTY ROWS
// ========================= */
//function defaultRow(packType) {
//  if (packType === "PALLETIZATION") {
//    return {
//      _id: uid(),
//      noOfPallets: "",
//      unitPerPallets: "",
//      totalPkgs: "",
//      pkgsType: "",
//      uom: "MT",
//      skuSize: "",
//      packWeight: "",
//      productName: "",
//      wtLtr: "",
//      actualWt: "",
//      chargedWt: "",
//      wtUom: "MT",
//      isUniform: false,
//    };
//  }
//
//  if (packType === "UNIFORM - BAGS/BOXES") {
//    return {
//      _id: uid(),
//      totalPkgs: "",
//      pkgsType: "",
//      uom: "MT",
//      skuSize: "",
//      packWeight: "",
//      productName: "",
//      wtLtr: "",
//      actualWt: "",
//      chargedWt: "",
//      wtUom: "MT",
//    };
//  }
//
//  if (packType === "LOOSE - CARGO") {
//    return {
//      _id: uid(),
//      uom: "MT",
//      productName: "",
//      actualWt: "",
//      chargedWt: "",
//    };
//  }
//
//  // NON-UNIFORM - GENERAL CARGO
//  return {
//    _id: uid(),
//    nos: "",
//    productName: "",
//    uom: "MT",
//    length: "",
//    width: "",
//    height: "",
//    actualWt: "",
//    chargedWt: "",
//  };
//}
//
//function defaultPlantRow() {
//  return {
//    _id: uid(),
//    plantCode: null,
//    plantName: "",
//    plantCodeValue: "",
//    orderType: "",
//    pinCode: "",
//    from: null,
//    fromName: "",
//    to: null,
//    toName: "",
//    taluka: "",
//    talukaName: "",
//    district: "",
//    districtName: "",
//    state: "",
//    stateName: "",
//    country: "",
//    countryName: "",
//    weight: "",
//    status: "",
//    collectionCharges: "",
//    cancellationCharges: "",
//    loadingCharges: "",
//    otherCharges: "",
//  };
//}
//
///** =========================
// * Customer Search Hook
// ========================= */
//function useCustomerSearch() {
//  const [customers, setCustomers] = useState([]);
//  const [loading, setLoading] = useState(false);
//  const [error, setError] = useState(null);
//
//  const searchCustomers = async (query = "") => {
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
///** =========================
// * External Pincode API Hook with Multiple Cities Support
// ========================= */
//function useExternalPincodeAPI() {
//  const [loading, setLoading] = useState(false);
//  const [error, setError] = useState(null);
//  const [pincodeData, setPincodeData] = useState(null);
//  const [multipleCities, setMultipleCities] = useState([]);
//
//  const fetchPincodeDetails = async (pincode) => {
//    if (!pincode || pincode.length !== 6) {
//      return null;
//    }
//
//    setLoading(true);
//    setError(null);
//    setMultipleCities([]);
//    
//    try {
//      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
//      const data = await response.json();
//      
//      if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice && data[0].PostOffice.length > 0) {
//        const postOffices = data[0].PostOffice;
//        
//        const uniqueLocations = [];
//        const seen = new Set();
//        
//        postOffices.forEach(po => {
//          const cityName = po.Name;
//          const key = `${po.Name}-${po.District}-${po.State}`;
//          
//          if (!seen.has(key)) {
//            seen.add(key);
//            uniqueLocations.push({
//              taluka: po.Block || po.Taluk || po.District,
//              talukaName: po.Block || po.Taluk || po.District,
//              district: po.District,
//              districtName: po.District,
//              state: po.State,
//              stateName: po.State,
//              country: po.Country,
//              countryName: po.Country,
//              city: cityName,
//              cityName: cityName,
//              pincode: pincode,
//              postOffice: po.Name,
//              block: po.Block,
//              division: po.Division
//            });
//          }
//        });
//        
//        if (uniqueLocations.length > 1) {
//          setMultipleCities(uniqueLocations);
//        }
//        
//        const firstLocation = uniqueLocations[0];
//        const result = {
//          taluka: firstLocation.taluka,
//          talukaName: firstLocation.talukaName,
//          district: firstLocation.district,
//          districtName: firstLocation.districtName,
//          state: firstLocation.state,
//          stateName: firstLocation.stateName,
//          country: firstLocation.country,
//          countryName: firstLocation.countryName,
//          city: firstLocation.city,
//          cityName: firstLocation.cityName,
//          pincode: pincode,
//          hasMultiple: uniqueLocations.length > 1,
//          allLocations: uniqueLocations
//        };
//        
//        setPincodeData(result);
//        return result;
//      } else {
//        setError('Invalid pincode or no data found');
//        return null;
//      }
//    } catch (err) {
//      console.error('Error fetching pincode details:', err);
//      setError('Failed to fetch pincode details');
//      return null;
//    } finally {
//      setLoading(false);
//    }
//  };
//
//  return { loading, error, pincodeData, multipleCities, fetchPincodeDetails };
//}
//
//export default function EditOrderPanel() {
//  const router = useRouter();
//  const params = useParams();
//  const orderId = params.id;
//
//  /** =========================
//   * STATE FOR API DATA
//   ========================= */
//  const [branches, setBranches] = useState([]);
//  const [locations, setLocations] = useState([]); 
//  const [countries, setCountries] = useState([]);
//  const [states, setStates] = useState([]);
//  const [districts, setDistricts] = useState([]);
//  const [plants, setPlants] = useState([]);
//  const [pkgTypes, setPkgTypes] = useState([]);
//  const [uoms, setUoms] = useState([]);
//  const [skuSizes, setSkuSizes] = useState([]);
//  const [items, setItems] = useState([]);
//  const [loading, setLoading] = useState(false);
//  const [fetchLoading, setFetchLoading] = useState(true);
//  const [saving, setSaving] = useState(false);
//  const [saveError, setSaveError] = useState(null);
//  const [saveSuccess, setSaveSuccess] = useState(false);
//  const [orderNumber, setOrderNumber] = useState("");
//
//  /** =========================
//   * CUSTOMER SEARCH STATE
//   ========================= */
//  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
//  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
//  const [selectedCustomer, setSelectedCustomer] = useState(null);
//  const [filteredCustomers, setFilteredCustomers] = useState([]);
//  const customerSearch = useCustomerSearch();
//
//  /** =========================
//   * PINCODE API STATE
//   ========================= */
//  const pincodeAPI = useExternalPincodeAPI();
//  const [pincodeInput, setPincodeInput] = useState({});
//  const [showCityDropdown, setShowCityDropdown] = useState({});
//  const [cityOptionsByRow, setCityOptionsByRow] = useState({});
//
//  /** =========================
//   * CHARGES VISIBILITY STATE
//   ========================= */
//  const [showCharges, setShowCharges] = useState(false);
//
//  /** =========================
//   * HEADER STATE
//   ========================= */
//  const [top, setTop] = useState({
//    orderNo: "",
//    branch: null,
//    branchName: "",
//    branchCode: "",
//    delivery: "Normal",
//    date: new Date().toISOString().split('T')[0],
//    partyName: "",
//    collectionCharges: "",
//    cancellationCharges: "",
//    loadingCharges: "",
//    otherCharges: "",
//    customerId: null,
//    customerCode: "",
//    customerName: "",
//    contactPerson: "",
//  });
//
//  /** =========================
//   * PLANT GRID TABLE DATA
//   ========================= */
//  const [plantRows, setPlantRows] = useState([defaultPlantRow()]);
//
//  /** =========================
//   * PACK DATA
//   ========================= */
//  const [activePack, setActivePack] = useState("PALLETIZATION");
//  const [packData, setPackData] = useState({
//    PALLETIZATION: [],
//    "UNIFORM - BAGS/BOXES": [],
//    "LOOSE - CARGO": [],
//    "NON-UNIFORM - GENERAL CARGO": [],
//  });
//
//  /** =========================
//   * FETCH MASTER DATA
//   ========================= */
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
//  const fetchLocations = async () => {
//    try {
//      const token = localStorage.getItem('token');
//      const res = await fetch('/api/locations', {
//        headers: { Authorization: `Bearer ${token}` },
//      });
//      const data = await res.json();
//      if (data.success && Array.isArray(data.data)) {
//        setLocations(data.data);
//      }
//    } catch (error) {
//      console.error('Error fetching locations:', error.message);
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
//  const fetchPkgTypes = async () => {
//    try {
//      const token = localStorage.getItem('token');
//      const res = await fetch('/api/pkg-types', {
//        headers: { Authorization: `Bearer ${token}` },
//      });
//      const data = await res.json();
//      if (data.success && Array.isArray(data.data)) {
//        setPkgTypes(data.data);
//      }
//    } catch (error) {
//      console.error('Error fetching PKG types:', error.message);
//    }
//  };
//
//  const fetchUOMs = async () => {
//    try {
//      const token = localStorage.getItem('token');
//      const res = await fetch('/api/uoms', {
//        headers: { Authorization: `Bearer ${token}` },
//      });
//      const data = await res.json();
//      if (data.success && Array.isArray(data.data)) {
//        setUoms(data.data);
//      }
//    } catch (error) {
//      console.error('Error fetching UOMs:', error.message);
//    }
//  };
//
//  const fetchSKUSizes = async () => {
//    try {
//      const token = localStorage.getItem('token');
//      const res = await fetch('/api/sku-sizes', {
//        headers: { Authorization: `Bearer ${token}` },
//      });
//      const data = await res.json();
//      if (data.success && Array.isArray(data.data)) {
//        setSkuSizes(data.data);
//      }
//    } catch (error) {
//      console.error('Error fetching SKU sizes:', error.message);
//    }
//  };
//
//  const fetchItems = async () => {
//    try {
//      const token = localStorage.getItem('token');
//      const res = await fetch('/api/items', {
//        headers: { Authorization: `Bearer ${token}` },
//      });
//      const data = await res.json();
//      if (data.success && Array.isArray(data.data)) {
//        setItems(data.data);
//      }
//    } catch (error) {
//      console.error('Error fetching items:', error.message);
//    }
//  };
//
//  /** =========================
//   * FETCH ORDER DATA
//   ========================= */
//  useEffect(() => {
//    if (orderId) {
//      fetchOrderData();
//      fetchBranches();
//      fetchCountries();
//      fetchPlants();
//      fetchLocations();
//      fetchPkgTypes();
//      fetchUOMs();
//      fetchSKUSizes();
//      fetchItems();
//    }
//  }, [orderId]);
//
//  const fetchOrderData = async () => {
//    setFetchLoading(true);
//    try {
//      const token = localStorage.getItem('token');
//      
//      const res = await fetch(`/api/order-panel?id=${orderId}`, {
//        headers: { Authorization: `Bearer ${token}` },
//      });
//      
//      const data = await res.json();
//      
//      if (!data.success) {
//        throw new Error(data.message || 'Failed to fetch order');
//      }
//
//      const order = data.data;
//      
//      setOrderNumber(order.orderPanelNo || order.orderNo || "");
//      
//      setTop({
//        orderNo: order.orderPanelNo || order.orderNo || "",
//        branch: order.branch || null,
//        branchName: order.branchName || "",
//        branchCode: order.branchCode || "",
//        delivery: order.delivery || "Normal",
//        date: order.date ? new Date(order.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
//        partyName: order.partyName || order.customerName || "",
//        collectionCharges: order.collectionCharges?.toString() || "",
//        cancellationCharges: order.cancellationCharges || "",
//        loadingCharges: order.loadingCharges || "",
//        otherCharges: order.otherCharges?.toString() || "",
//        customerId: order.customerId || null,
//        customerCode: order.customerCode || "",
//        customerName: order.customerName || "",
//        contactPerson: order.contactPerson || "",
//      });
//
//      if (order.customerName) {
//        setSelectedCustomer({
//          _id: order.customerId,
//          customerName: order.customerName,
//          customerCode: order.customerCode,
//          contactPersonName: order.contactPerson,
//        });
//        setCustomerSearchQuery(order.customerName);
//      }
//
//      if (order.plantRows && order.plantRows.length > 0) {
//        const processedPlantRows = order.plantRows.map(row => ({
//          _id: row._id || uid(),
//          plantCode: row.plantCode || null,
//          plantName: row.plantName || "",
//          plantCodeValue: row.plantCodeValue || "",
//          orderType: row.orderType || "Sales",
//          pinCode: row.pinCode || "",
//          from: row.from || null,
//          fromName: row.fromName || "",
//          to: row.to || null,
//          toName: row.toName || "",
//          taluka: row.taluka || "",
//          talukaName: row.talukaName || "",
//          district: row.district || "",
//          districtName: row.districtName || "",
//          state: row.state || "",
//          stateName: row.stateName || "",
//          country: row.country || "",
//          countryName: row.countryName || "",
//          weight: row.weight?.toString() || "",
//          status: row.status || "Open",
//          collectionCharges: row.collectionCharges?.toString() || "",
//          cancellationCharges: row.cancellationCharges || "",
//          loadingCharges: row.loadingCharges || "",
//          otherCharges: row.otherCharges?.toString() || "",
//        }));
//        setPlantRows(processedPlantRows);
//      }
//
//      if (order.packData) {
//        const processedPackData = {
//          PALLETIZATION: (order.packData.PALLETIZATION || []).map(row => ({
//            ...row,
//            _id: row._id || uid(),
//            noOfPallets: row.noOfPallets?.toString() || "",
//            unitPerPallets: row.unitPerPallets?.toString() || "",
//            totalPkgs: row.totalPkgs?.toString() || "",
//            pkgsType: row.pkgsType || "",
//            uom: row.uom || "MT",
//            skuSize: row.skuSize || "",
//            packWeight: row.packWeight?.toString() || "",
//            productName: row.productName || "",
//            wtLtr: row.wtLtr?.toString() || "",
//            actualWt: row.actualWt?.toString() || "",
//            chargedWt: row.chargedWt?.toString() || "",
//            wtUom: row.wtUom || "MT",
//            isUniform: row.isUniform || false,
//          })),
//          "UNIFORM - BAGS/BOXES": (order.packData["UNIFORM - BAGS/BOXES"] || []).map(row => ({
//            ...row,
//            _id: row._id || uid(),
//            totalPkgs: row.totalPkgs?.toString() || "",
//            pkgsType: row.pkgsType || "",
//            uom: row.uom || "MT",
//            skuSize: row.skuSize || "",
//            packWeight: row.packWeight?.toString() || "",
//            productName: row.productName || "",
//            wtLtr: row.wtLtr?.toString() || "",
//            actualWt: row.actualWt?.toString() || "",
//            chargedWt: row.chargedWt?.toString() || "",
//            wtUom: row.wtUom || "MT",
//          })),
//          "LOOSE - CARGO": (order.packData["LOOSE - CARGO"] || []).map(row => ({
//            ...row,
//            _id: row._id || uid(),
//            uom: row.uom || "MT",
//            productName: row.productName || "",
//            actualWt: row.actualWt?.toString() || "",
//            chargedWt: row.chargedWt?.toString() || "",
//          })),
//          "NON-UNIFORM - GENERAL CARGO": (order.packData["NON-UNIFORM - GENERAL CARGO"] || []).map(row => ({
//            ...row,
//            _id: row._id || uid(),
//            nos: row.nos?.toString() || "",
//            productName: row.productName || "",
//            uom: row.uom || "MT",
//            length: row.length?.toString() || "",
//            width: row.width?.toString() || "",
//            height: row.height?.toString() || "",
//            actualWt: row.actualWt?.toString() || "",
//            chargedWt: row.chargedWt?.toString() || "",
//          })),
//        };
//        setPackData(processedPackData);
//      }
//
//    } catch (error) {
//      console.error('Error fetching order:', error);
//      alert(`Failed to load order: ${error.message}`);
//    } finally {
//      setFetchLoading(false);
//    }
//  };
//
//  /** =========================
//   * CUSTOMER SEARCH FUNCTIONS
//   ========================= */
//  const handleCustomerSearch = (query) => {
//    setCustomerSearchQuery(query);
//    
//    if (query.trim() === "") {
//      setFilteredCustomers(customerSearch.customers);
//    } else {
//      const filtered = customerSearch.customers.filter(customer =>
//        customer.customerName.toLowerCase().includes(query.toLowerCase()) ||
//        customer.customerCode.toLowerCase().includes(query.toLowerCase()) ||
//        (customer.contactPersonName && customer.contactPersonName.toLowerCase().includes(query.toLowerCase()))
//      );
//      setFilteredCustomers(filtered);
//    }
//    
//    if (selectedCustomer && query !== selectedCustomer.customerName) {
//      setSelectedCustomer(null);
//      setTop(prev => ({
//        ...prev,
//        customerId: null,
//        customerCode: "",
//        customerName: "",
//        contactPerson: "",
//        partyName: ""
//      }));
//    }
//  };
//
//  const handleSelectCustomer = (customer) => {
//    setSelectedCustomer(customer);
//    setCustomerSearchQuery(customer.customerName);
//    setShowCustomerDropdown(false);
//    
//    setTop(prev => ({
//      ...prev,
//      customerId: customer._id,
//      customerCode: customer.customerCode,
//      customerName: customer.customerName,
//      contactPerson: customer.contactPersonName || "",
//      partyName: customer.customerName
//    }));
//  };
//
//  const handleCustomerInputFocus = async () => {
//    if (!showCustomerDropdown) {
//      if (customerSearch.customers.length === 0) {
//        await customerSearch.searchCustomers("");
//      }
//      setFilteredCustomers(customerSearch.customers);
//      setShowCustomerDropdown(true);
//    }
//  };
//
//  const handleCustomerInputBlur = () => {
//    setTimeout(() => {
//      setShowCustomerDropdown(false);
//    }, 200);
//  };
//
//  useEffect(() => {
//    if (customerSearch.customers.length > 0) {
//      setFilteredCustomers(customerSearch.customers);
//    }
//  }, [customerSearch.customers]);
//
//  /** =========================
//   * BRANCH SELECTION
//   ========================= */
//  const handleBranchSelect = (branch) => {
//    if (branch) {
//      setTop(prev => ({
//        ...prev,
//        branch: branch._id,
//        branchName: branch.name,
//        branchCode: branch.code || ''
//      }));
//    } else {
//      setTop(prev => ({
//        ...prev,
//        branch: null,
//        branchName: "",
//        branchCode: ""
//      }));
//    }
//  };
//
//  /** =========================
//   * PLANT SELECTION
//   ========================= */
//  const handlePlantChange = (rowId, plantId) => {
//    const selectedPlant = plants.find(p => p._id === plantId);
//    if (selectedPlant) {
//      updatePlantRow(rowId, 'plantCode', plantId);
//      updatePlantRow(rowId, 'plantName', selectedPlant.name);
//      updatePlantRow(rowId, 'plantCodeValue', selectedPlant.code);
//    } else {
//      updatePlantRow(rowId, 'plantCode', null);
//      updatePlantRow(rowId, 'plantName', '');
//      updatePlantRow(rowId, 'plantCodeValue', '');
//    }
//  };
//
//  /** =========================
//   * PINCODE API INTEGRATION
//   ========================= */
//  const handlePincodeChange = async (rowId, pincode) => {
//    updatePlantRow(rowId, 'pinCode', pincode);
//    setPincodeInput(prev => ({ ...prev, [rowId]: pincode }));
//    
//    if (pincode && pincode.length === 6) {
//      const result = await pincodeAPI.fetchPincodeDetails(pincode);
//      
//      if (result) {
//        if (result.hasMultiple && result.allLocations && result.allLocations.length > 0) {
//          setCityOptionsByRow(prev => ({ 
//            ...prev, 
//            [rowId]: result.allLocations 
//          }));
//        } else {
//          setCityOptionsByRow(prev => ({ ...prev, [rowId]: [] }));
//          updatePlantRow(rowId, 'taluka', result.taluka);
//          updatePlantRow(rowId, 'talukaName', result.talukaName);
//          updatePlantRow(rowId, 'district', result.district);
//          updatePlantRow(rowId, 'districtName', result.districtName);
//          updatePlantRow(rowId, 'state', result.state);
//          updatePlantRow(rowId, 'stateName', result.stateName);
//          updatePlantRow(rowId, 'country', result.country);
//          updatePlantRow(rowId, 'countryName', result.countryName);
//          updatePlantRow(rowId, 'toName', result.cityName);
//          updatePlantRow(rowId, 'to', null);
//        }
//      }
//    } else {
//      setCityOptionsByRow(prev => ({ ...prev, [rowId]: [] }));
//    }
//  };
//
//  const handleSelectCity = (rowId, location) => {
//    updatePlantRow(rowId, 'taluka', location.taluka);
//    updatePlantRow(rowId, 'talukaName', location.talukaName);
//    updatePlantRow(rowId, 'district', location.district);
//    updatePlantRow(rowId, 'districtName', location.districtName);
//    updatePlantRow(rowId, 'state', location.state);
//    updatePlantRow(rowId, 'stateName', location.stateName);
//    updatePlantRow(rowId, 'country', location.country);
//    updatePlantRow(rowId, 'countryName', location.countryName);
//    updatePlantRow(rowId, 'toName', location.cityName);
//    updatePlantRow(rowId, 'to', null);
//    setShowCityDropdown(prev => ({ ...prev, [rowId]: false }));
//  };
//
//  /** =========================
//   * PLANT ROW FUNCTIONS
//   ========================= */
//  const addPlantRow = () => setPlantRows((p) => [...p, defaultPlantRow()]);
//
//  const updatePlantRow = (rowId, key, value) => {
//    setPlantRows((prev) =>
//      prev.map((r) => (r._id === rowId ? { ...r, [key]: value } : r))
//    );
//  };
//
//  const removePlantRow = (rowId) => {
//    if (plantRows.length > 1) {
//      setPlantRows((prev) => prev.filter((r) => r._id !== rowId));
//    } else {
//      alert("At least one plant row is required");
//    }
//  };
//
//  /** =========================
//   * PACK DATA FUNCTIONS - FIXED CALCULATIONS
//   ========================= */
//  const rows = packData[activePack] || [];
//
//  const recalculatePalletizationWeights = (row) => {
//    const updatedRow = { ...row };
//    
//    const noOfPallets = num(updatedRow.noOfPallets);
//    const unitPerPallets = num(updatedRow.unitPerPallets);
//    const packWeight = num(updatedRow.packWeight);
//    const uom = (updatedRow.uom || "").toUpperCase().trim();
//    
//    let totalPkgs = num(updatedRow.totalPkgs);
//    
//    if (noOfPallets > 0 && unitPerPallets > 0) {
//      const calculatedTotalPkgs = noOfPallets * unitPerPallets;
//      totalPkgs = calculatedTotalPkgs;
//      updatedRow.totalPkgs = String(calculatedTotalPkgs);
//    }
//    
//    if (totalPkgs > 0 && packWeight > 0) {
//      if (uom === "LTR" || uom === "L") {
//        const wtLtr = totalPkgs * packWeight;
//        updatedRow.wtLtr = wtLtr.toFixed(2);
//        const actualWt = wtLtr / 1000;
//        updatedRow.actualWt = actualWt.toFixed(3);
//      } else if (uom === "KG" || uom === "KGS") {
//        const actualWt = totalPkgs * packWeight;
//        updatedRow.actualWt = actualWt.toFixed(3);
//        updatedRow.wtLtr = "";
//      } else {
//        updatedRow.wtLtr = "";
//        updatedRow.actualWt = "";
//      }
//    } else {
//      if (!updatedRow.wtLtr) updatedRow.wtLtr = "";
//      if (!updatedRow.actualWt) updatedRow.actualWt = "";
//    }
//    
//    return updatedRow;
//  };
//
//  const recalculateUniformWeights = (row) => {
//    const updatedRow = { ...row };
//    
//    const totalPkgs = num(updatedRow.totalPkgs);
//    const packWeight = num(updatedRow.packWeight);
//    const uom = (updatedRow.uom || "").toUpperCase().trim();
//    
//    if (totalPkgs > 0 && packWeight > 0) {
//      if (uom === "LTR" || uom === "L") {
//        const wtLtr = totalPkgs * packWeight;
//        updatedRow.wtLtr = wtLtr.toFixed(2);
//        const actualWt = (wtLtr / 1000) * 2;
//        updatedRow.actualWt = actualWt.toFixed(3);
//      } else if (uom === "KG" || uom === "KGS") {
//        const actualWt = totalPkgs * packWeight;
//        updatedRow.actualWt = actualWt.toFixed(3);
//        updatedRow.wtLtr = "";
//      } else {
//        updatedRow.wtLtr = "";
//        updatedRow.actualWt = "";
//      }
//    } else {
//      if (!updatedRow.wtLtr) updatedRow.wtLtr = "";
//      if (!updatedRow.actualWt) updatedRow.actualWt = "";
//    }
//    
//    return updatedRow;
//  };
//
//  const recalculateLooseWeights = (row) => {
//    return row;
//  };
//
//  const updatePackRow = (rowId, key, value, packType = activePack) => {
//    setPackData((prev) => {
//      const updatedPack = prev[packType].map((r) => {
//        if (r._id === rowId) {
//          let updatedRow = { ...r, [key]: value };
//          
//          if (packType === "PALLETIZATION") {
//            updatedRow = recalculatePalletizationWeights(updatedRow);
//          } else if (packType === "UNIFORM - BAGS/BOXES") {
//            updatedRow = recalculateUniformWeights(updatedRow);
//          }
//          
//          return updatedRow;
//        }
//        return r;
//      });
//      
//      return {
//        ...prev,
//        [packType]: updatedPack,
//      };
//    });
//  };
//
//  const addRow = (packType = activePack) => {
//    setPackData((prev) => ({
//      ...prev,
//      [packType]: [...prev[packType], defaultRow(packType)],
//    }));
//  };
//
//  const removeRow = (packType, id) => {
//    const currentRows = packData[packType] || [];
//    if (currentRows.length > 1) {
//      setPackData((prev) => ({
//        ...prev,
//        [packType]: prev[packType].filter((r) => r._id !== id),
//      }));
//    } else {
//      alert("At least one row is required");
//    }
//  };
//
//  const duplicateRow = (packType, id) => {
//    const row = (packData[packType] || []).find((r) => r._id === id);
//    if (!row) return;
//    setPackData((prev) => ({
//      ...prev,
//      [packType]: [...prev[packType], { ...row, _id: uid() }],
//    }));
//  };
//
//  /** =========================
//   * UPDATE ORDER FUNCTION
//   ========================= */
//  const handleUpdate = async () => {
//    if (!top.branch) {
//      alert("Please select a branch");
//      return;
//    }
//    
//    const hasInvalidPlantRows = plantRows.some(row => !row.plantCode);
//    if (hasInvalidPlantRows) {
//      alert("Please select plant for all plant rows");
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
//        id: orderId,
//        branch: top.branch,
//        branchName: top.branchName,
//        branchCode: top.branchCode,
//        delivery: top.delivery,
//        date: top.date,
//        customerId: selectedCustomer?._id || null,
//        customerCode: selectedCustomer?.customerCode || '',
//        customerName: selectedCustomer?.customerName || '',
//        contactPerson: selectedCustomer?.contactPersonName || '',
//        partyName: selectedCustomer?.customerName || top.partyName || '',
//        collectionCharges: num(top.collectionCharges) || 0,
//        cancellationCharges: top.cancellationCharges || 'Nil',
//        loadingCharges: top.loadingCharges || 'Nil',
//        otherCharges: num(top.otherCharges) || 0,
//        plantRows: plantRows.map(row => ({
//          _id: row._id,
//          plantCode: row.plantCode || null,
//          plantName: row.plantName || '',
//          plantCodeValue: row.plantCodeValue || '',
//          orderType: row.orderType || "Sales",
//          pinCode: row.pinCode || "",
//          from: row.from || null,
//          fromName: row.fromName || "",
//          to: row.to || null,
//          toName: row.toName || "",
//          taluka: row.taluka || "",
//          talukaName: row.talukaName || "",
//          district: row.district || "",
//          districtName: row.districtName || "",
//          state: row.state || "",
//          stateName: row.stateName || "",
//          country: row.country || "",
//          countryName: row.countryName || "",
//          weight: num(row.weight) || 0,
//          status: row.status || "Open",
//          rate: 0,
//          locationRate: 0,
//          collectionCharges: num(row.collectionCharges) || 0,
//          cancellationCharges: row.cancellationCharges || 'Nil',
//          loadingCharges: row.loadingCharges || 'Nil',
//          otherCharges: num(row.otherCharges) || 0
//        })),
//        packData: {
//          PALLETIZATION: packData.PALLETIZATION.map(row => ({
//            _id: row._id,
//            noOfPallets: num(row.noOfPallets),
//            unitPerPallets: num(row.unitPerPallets),
//            totalPkgs: num(row.totalPkgs),
//            pkgsType: row.pkgsType || "",
//            uom: row.uom || "MT",
//            skuSize: row.skuSize || "",
//            packWeight: num(row.packWeight),
//            productName: row.productName || "",
//            wtLtr: num(row.wtLtr),
//            actualWt: num(row.actualWt),
//            chargedWt: num(row.chargedWt),
//            wtUom: row.wtUom || "MT",
//            isUniform: row.isUniform || false
//          })),
//          "UNIFORM - BAGS/BOXES": packData["UNIFORM - BAGS/BOXES"].map(row => ({
//            _id: row._id,
//            totalPkgs: num(row.totalPkgs),
//            pkgsType: row.pkgsType || "",
//            uom: row.uom || "MT",
//            skuSize: row.skuSize || "",
//            packWeight: num(row.packWeight),
//            productName: row.productName || "",
//            wtLtr: num(row.wtLtr),
//            actualWt: num(row.actualWt),
//            chargedWt: num(row.chargedWt),
//            wtUom: row.wtUom || "MT"
//          })),
//          "LOOSE - CARGO": packData["LOOSE - CARGO"].map(row => ({
//            _id: row._id,
//            uom: row.uom || "MT",
//            productName: row.productName || "",
//            actualWt: num(row.actualWt),
//            chargedWt: num(row.chargedWt)
//          })),
//          "NON-UNIFORM - GENERAL CARGO": packData["NON-UNIFORM - GENERAL CARGO"].map(row => ({
//            _id: row._id,
//            nos: num(row.nos),
//            productName: row.productName || "",
//            uom: row.uom || "MT",
//            length: num(row.length),
//            width: num(row.width),
//            height: num(row.height),
//            actualWt: num(row.actualWt),
//            chargedWt: num(row.chargedWt)
//          }))
//        }
//      };
//
//      const res = await fetch('/api/order-panel', {
//        method: 'PUT',
//        headers: {
//          'Content-Type': 'application/json',
//          Authorization: `Bearer ${token}`,
//        },
//        body: JSON.stringify(payload),
//      });
//
//      const data = await res.json();
//
//      if (!res.ok) {
//        throw new Error(data.message || `Failed to update order: ${res.status}`);
//      }
//
//      setSaveSuccess(true);
//      alert(`✅ Order updated successfully!\nOrder Panel Number: ${top.orderNo}`);
//      
//      setTimeout(() => {
//        router.push('/admin/order-panel');
//      }, 2000);
//      
//    } catch (error) {
//      console.error('Error updating order:', error);
//      setSaveError(error.message || 'Failed to update order');
//      alert(`❌ Error: ${error.message}`);
//    } finally {
//      setSaving(false);
//    }
//  };
//
//  if (fetchLoading) {
//    return (
//      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white">
//        <div className="text-center">
//          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
//          <p className="mt-4 text-slate-600">Loading order details...</p>
//        </div>
//      </div>
//    );
//  }
//
//  return (
//    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
//      {/* ===== Top Bar ===== */}
//      <div className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
//        <div className="mx-auto max-w-full px-4 py-3 flex items-center justify-between">
//          <div>
//            <div className="flex items-center gap-3">
//              <button
//                onClick={() => router.push('/admin/order-panel')}
//                className="text-sky-600 hover:text-sky-800 font-medium text-sm flex items-center gap-1"
//              >
//                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//                </svg>
//                Back to List
//              </button>
//              <div className="text-lg font-extrabold text-slate-900">
//                Edit Order Panel: {top.orderNo}
//              </div>
//            </div>
//            {saveSuccess && (
//              <div className="text-sm text-green-600 font-medium mt-1">
//                ✅ Order updated successfully! Redirecting to list...
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
//                saving 
//                  ? 'bg-gray-400 cursor-not-allowed' 
//                  : 'bg-sky-600 hover:bg-sky-700'
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
//              ) : 'Update Order'}
//            </button>
//          </div>
//        </div>
//      </div>
//
//      {/* ===== Main Layout ===== */}
//      <div className="mx-auto max-w-full p-4">
//        {/* Header info */}
//        <Card title="Order Details">
//          <div className="grid grid-cols-12 gap-3">
//            <div className="col-span-12 md:col-span-4">
//              <label className="text-xs font-bold text-slate-600">Order No</label>
//              <div className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
//                {top.orderNo || "N/A"}
//              </div>
//            </div>
//            
//            <div className="col-span-12 md:col-span-4 relative">
//              <label className="text-xs font-bold text-slate-600">Branch *</label>
//              <div className="flex items-center gap-2">
//                <div className="flex-1">
//                  <SearchableDropdown
//                    items={branches}
//                    selectedId={top.branch}
//                    onSelect={handleBranchSelect}
//                    placeholder="Search branch... *"
//                    required={true}
//                    displayField="name"
//                    codeField="code"
//                  />
//                </div>
//                <button
//                  onClick={() => router.push('/admin/branches2')}
//                  className="rounded-lg bg-green-600 px-3 py-2 text-xs font-bold text-white hover:bg-green-700 transition whitespace-nowrap"
//                  title="Create New Branch"
//                >
//                  Create
//                </button>
//              </div>
//            </div>
//            
//            <Select
//              col="col-span-12 md:col-span-4"
//              label="Delivery"
//              value={top.delivery}
//              onChange={(v) => setTop((p) => ({ ...p, delivery: v }))}
//              options={DELIVERY_OPTIONS}
//            />
//
//            <Input
//              col="col-span-12 md:col-span-4"
//              type="date"
//              label="Date"
//              value={top.date}
//              onChange={(v) => setTop((p) => ({ ...p, date: v }))}
//            />
//            
//            <div className="col-span-12 md:col-span-8 relative">
//              <label className="text-xs font-bold text-slate-600">Party Name *</label>
//              <div className="flex items-center gap-2">
//                <div className="flex-1">
//                  <input
//                    type="text"
//                    value={selectedCustomer ? selectedCustomer.customerName : customerSearchQuery}
//                    onChange={(e) => handleCustomerSearch(e.target.value)}
//                    onFocus={handleCustomerInputFocus}
//                    onBlur={handleCustomerInputBlur}
//                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
//                    placeholder="Search customer by name... *"
//                  />
//                  
//                  {showCustomerDropdown && (
//                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
//                      {customerSearch.loading ? (
//                        <div className="p-3 text-center text-sm text-slate-500">
//                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sky-500 mx-auto"></div>
//                          <p className="mt-1">Loading customers...</p>
//                        </div>
//                      ) : filteredCustomers.length > 0 ? (
//                        filteredCustomers.map((customer) => (
//                          <div
//                            key={customer._id}
//                            onMouseDown={() => handleSelectCustomer(customer)}
//                            className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors"
//                          >
//                            <div className="font-medium text-slate-800">
//                              {customer.customerName}
//                            </div>
//                            <div className="text-xs text-slate-500 mt-1">
//                              Code: {customer.customerCode}
//                              {customer.contactPersonName && ` • Contact: ${customer.contactPersonName}`}
//                            </div>
//                          </div>
//                        ))
//                      ) : (
//                        <div className="p-3 text-center text-sm text-slate-500">
//                          {customerSearchQuery.trim() ? 
//                            `No customers found for "${customerSearchQuery}"` : 
//                            "No customers available"
//                          }
//                        </div>
//                      )}
//                    </div>
//                  )}
//                </div>
//              </div>
//            </div>
//
//            {/* Charges Fields - Conditionally Visible */}
//            {showCharges && (
//              <>
//                <Input
//                  col="col-span-6 md:col-span-3"
//                  label="Collection Charges"
//                  value={top.collectionCharges}
//                  onChange={(v) =>
//                    setTop((p) => ({ ...p, collectionCharges: v }))
//                  }
//                  type="number"
//                />
//                <Input
//                  col="col-span-6 md:col-span-3"
//                  label="Cancellation Charges"
//                  value={top.cancellationCharges}
//                  onChange={(v) =>
//                    setTop((p) => ({ ...p, cancellationCharges: v }))
//                  }
//                />
//                <Input
//                  col="col-span-6 md:col-span-3"
//                  label="Loading Charges"
//                  value={top.loadingCharges}
//                  onChange={(v) => setTop((p) => ({ ...p, loadingCharges: v }))}
//                />
//                <Input
//                  col="col-span-6 md:col-span-3"
//                  label="Other Charges"
//                  value={top.otherCharges}
//                  onChange={(v) => setTop((p) => ({ ...p, otherCharges: v }))}
//                  type="number"
//                />
//              </>
//            )}
//          </div>
//        </Card>
//
//        <div className="mt-4">
//          {/* Plant Code / Route Section */}
//          <Card title="Plant Code / Route">
//            <div className="mb-4 flex justify-between items-center">
//              <div className="text-sm text-slate-600">
//                Manage plant routes and distribution - Enter pincode to auto-fill location fields
//              </div>
//              <div className="flex gap-2">
//                <button
//                  onClick={() => setShowCharges(!showCharges)}
//                  className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
//                    showCharges 
//                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
//                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//                  }`}
//                >
//                  {showCharges ? 'Hide Charges' : 'Charges'}
//                </button>
//                <button
//                  onClick={addPlantRow}
//                  className="rounded-xl bg-yellow-600 px-4 py-2 text-sm font-bold text-white hover:bg-yellow-700 transition"
//                >
//                  + Add Row
//                </button>
//              </div>
//            </div>
//            <PlantGridTable
//              rows={plantRows}
//              onChange={updatePlantRow}
//              onRemove={removePlantRow}
//              onPlantChange={handlePlantChange}
//              onPincodeChange={handlePincodeChange}
//              onSelectCity={handleSelectCity}
//              plants={plants}
//              branches={branches}
//              locations={locations} 
//              pincodeAPI={pincodeAPI}
//              pincodeInput={pincodeInput}
//              showCityDropdown={showCityDropdown}
//              setShowCityDropdown={setShowCityDropdown}
//              cityOptionsByRow={cityOptionsByRow}
//              showCharges={showCharges}
//            />
//          </Card>
//
//          {/* PACK TYPE SECTIONS */}
//          <div className="mt-4 space-y-6">
//            <Card title="Pack Type">
//              <div className="mb-4 flex justify-between items-center">
//                <div className="flex items-center gap-3">
//                  <div className="text-sm font-bold text-slate-700">Select Pack Type:</div>
//                  <select
//                    value={activePack}
//                    onChange={(e) => setActivePack(e.target.value)}
//                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
//                  >
//                    {PACK_TYPES.map((p) => (
//                      <option key={p.key} value={p.key}>
//                        {p.label} ({packData[p.key]?.length || 0} rows)
//                      </option>
//                    ))}
//                  </select>
//                </div>
//                <button
//                  onClick={() => addRow(activePack)}
//                  className="rounded-xl bg-yellow-600 px-4 py-2 text-sm font-bold text-white hover:bg-yellow-700 transition"
//                >
//                  + Add Row
//                </button>
//              </div>
//              
//              <PackTypeTable
//                packType={activePack}
//                rows={rows}
//                onChange={(rowId, key, value) => updatePackRow(rowId, key, value, activePack)}
//                onRemove={(id) => removeRow(activePack, id)}
//                onDuplicate={(id) => duplicateRow(activePack, id)}
//                pkgTypes={pkgTypes}
//                uoms={uoms}
//                skuSizes={skuSizes}
//                items={items}
//                onNavigateToCreate={() => router.push('/admin/pkg-type?returnUrl=/admin/order-panel/create')}
//                onNavigateToCreateUOM={() => router.push('/admin/uoms?returnUrl=/admin/order-panel/create')}
//                onNavigateToCreateSKUSize={() => router.push('/admin/sku-sizes?returnUrl=/admin/order-panel/create')}
//                onNavigateToCreateItem={() => router.push('/admin/items?returnUrl=/admin/order-panel/create')}
//              />
//            </Card>
//          </div>
//        </div>
//      </div>
//    </div>
//  );
//}
//
//// ========================
//// COMPONENTS
//// ========================
//
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
//function Input({ label, value, onChange, col = "", type = "text", required = false }) {
//  return (
//    <div className={col}>
//      <label className="text-xs font-bold text-slate-600">{label}</label>
//      <input
//        type={type}
//        value={value || ""}
//        onChange={(e) => onChange?.(e.target.value)}
//        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
//        required={required}
//      />
//    </div>
//  );
//}
//
//function Select({ label, value, onChange, options = [], col = "" }) {
//  return (
//    <div className={col}>
//      <label className="text-xs font-bold text-slate-600">{label}</label>
//      <select
//        value={value || ""}
//        onChange={(e) => onChange?.(e.target.value)}
//        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
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
//function SearchableDropdown({ 
//  items, 
//  selectedId, 
//  onSelect, 
//  placeholder = "Search...",
//  required = false,
//  displayField = 'name',
//  codeField = 'code',
//  disabled = false
//}) {
//  const [searchQuery, setSearchQuery] = useState("");
//  const [filteredItems, setFilteredItems] = useState([]);
//  const [showDropdown, setShowDropdown] = useState(false);
//  const [selectedItem, setSelectedItem] = useState(null);
//  const dropdownRef = useRef(null);
//  const inputRef = useRef(null);
//  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
//
//  useEffect(() => {
//    setFilteredItems(items);
//    if (selectedId) {
//      const item = items.find(i => i._id === selectedId);
//      setSelectedItem(item);
//      if (item) {
//        setSearchQuery(getDisplayValue(item));
//      }
//    } else {
//      setSelectedItem(null);
//      setSearchQuery("");
//    }
//  }, [items, selectedId]);
//
//  const getDisplayValue = (item) => {
//    if (!item) return "";
//    const display = item[displayField] || "";
//    const code = item[codeField] ? `(${item[codeField]})` : "";
//    return `${display} ${code}`.trim();
//  };
//
//  const handleSearch = (query) => {
//    setSearchQuery(query);
//    
//    if (!query.trim()) {
//      setFilteredItems(items);
//    } else {
//      const filtered = items.filter(item =>
//        (item[displayField] && item[displayField].toLowerCase().includes(query.toLowerCase())) ||
//        (item[codeField] && item[codeField].toLowerCase().includes(query.toLowerCase()))
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
//    setSelectedItem(item);
//    setSearchQuery(getDisplayValue(item));
//    setShowDropdown(false);
//    onSelect?.(item);
//  };
//
//  const handleInputFocus = () => {
//    if (!showDropdown) {
//      setFilteredItems(items);
//      setShowDropdown(true);
//      
//      if (inputRef.current) {
//        const rect = inputRef.current.getBoundingClientRect();
//        setDropdownPosition({
//          top: rect.bottom + window.scrollY,
//          left: rect.left + window.scrollX,
//          width: rect.width
//        });
//      }
//    }
//  };
//
//  const handleInputBlur = () => {
//    setTimeout(() => {
//      if (dropdownRef.current && !dropdownRef.current.contains(document.activeElement)) {
//        setShowDropdown(false);
//        if (selectedItem) {
//          setSearchQuery(getDisplayValue(selectedItem));
//        }
//      }
//    }, 200);
//  };
//
//  useEffect(() => {
//    const handleScroll = () => {
//      if (showDropdown && inputRef.current) {
//        const rect = inputRef.current.getBoundingClientRect();
//        setDropdownPosition({
//          top: rect.bottom + window.scrollY,
//          left: rect.left + window.scrollX,
//          width: rect.width
//        });
//      }
//    };
//    
//    window.addEventListener('scroll', handleScroll, true);
//    window.addEventListener('resize', handleScroll);
//    
//    return () => {
//      window.removeEventListener('scroll', handleScroll, true);
//      window.removeEventListener('resize', handleScroll);
//    };
//  }, [showDropdown]);
//
//  return (
//    <div className="relative" ref={dropdownRef}>
//      <input
//        ref={inputRef}
//        type="text"
//        value={searchQuery}
//        onChange={(e) => handleSearch(e.target.value)}
//        onFocus={handleInputFocus}
//        onBlur={handleInputBlur}
//        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 disabled:opacity-50"
//        placeholder={placeholder}
//        required={required}
//        disabled={disabled}
//        autoComplete="off"
//      />
//      
//      {showDropdown && (
//        <div 
//          className="fixed z-[9999] bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
//          style={{
//            top: `${dropdownPosition.top}px`,
//            left: `${dropdownPosition.left}px`,
//            width: `${dropdownPosition.width}px`
//          }}
//        >
//          {filteredItems.length > 0 ? (
//            filteredItems.map((item) => (
//              <div
//                key={item._id}
//                onMouseDown={(e) => {
//                  e.preventDefault();
//                  handleSelectItem(item);
//                }}
//                className={`p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors ${
//                  selectedItem?._id === item._id ? 'bg-sky-50' : ''
//                }`}
//              >
//                <div className="font-medium text-slate-800">
//                  {item[displayField]}
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
//function PlantGridTable({ 
//  rows, 
//  onChange, 
//  onRemove, 
//  onPlantChange,
//  onPincodeChange,
//  onSelectCity,
//  plants,
//  locations, 
//  branches,
//  pincodeAPI,
//  pincodeInput,
//  showCityDropdown,
//  setShowCityDropdown,
//  cityOptionsByRow,
//  showCharges = false
//}) {
//  const [cityDropdownPosition, setCityDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
//  const [activeCityRowId, setActiveCityRowId] = useState(null);
//  const inputRefs = useRef({});
//
//  const handleBranchSelect = (rowId, field, branch) => {
//    if (branch) {
//      onChange(rowId, field, branch._id);
//      if (field === 'from') {
//        onChange(rowId, 'fromName', branch.name);
//      } else if (field === 'to') {
//        onChange(rowId, 'toName', branch.name);
//      }
//    } else {
//      onChange(rowId, field, null);
//      if (field === 'from') {
//        onChange(rowId, 'fromName', '');
//      } else if (field === 'to') {
//        onChange(rowId, 'toName', '');
//      }
//    }
//  };
//
//  const handleLocationSelect = (rowId, field, location) => {
//    if (location) {
//      onChange(rowId, field, location._id);
//      if (field === 'from') {
//        onChange(rowId, 'fromName', location.name);
//      } else if (field === 'to') {
//        onChange(rowId, 'toName', location.name);
//      }
//    } else {
//      onChange(rowId, field, null);
//      if (field === 'from') {
//        onChange(rowId, 'fromName', '');
//      } else if (field === 'to') {
//        onChange(rowId, 'toName', '');
//      }
//    }
//  };
//
//  const handleCityInputClick = (event, rowId) => {
//    const cityOptions = cityOptionsByRow[rowId];
//    if (cityOptions && cityOptions.length > 0) {
//      const rect = event.target.getBoundingClientRect();
//      setCityDropdownPosition({
//        top: rect.bottom + window.scrollY,
//        left: rect.left + window.scrollX,
//        width: rect.width
//      });
//      setActiveCityRowId(rowId);
//    }
//  };
//
//  const cols = [
//    { key: "plantCode", label: "Plant Code *", width: "200px" },
//    { key: "plantName", label: "Plant Name", width: "200px" },
//    { key: "orderType", label: "Order Type", width: "150px" },
//    { key: "pinCode", label: "Pin Code", width: "120px" },
//    { key: "from", label: "From", width: "200px" },
//    { key: "to", label: "To / City", width: "220px" },
//    { key: "taluka", label: "Taluka", width: "150px" },
//    { key: "district", label: "District", width: "150px" },
//    { key: "state", label: "State", width: "150px" },
//    { key: "country", label: "Country", width: "150px" },
//    { key: "weight", label: "Weight", width: "100px" },
//    { key: "status", label: "Status", width: "120px" },
//  ];
//
//  if (showCharges) {
//    cols.push(
//      { key: "collectionCharges", label: "Collection Charges", width: "130px" },
//      { key: "cancellationCharges", label: "Cancellation Charges", width: "140px" },
//      { key: "loadingCharges", label: "Loading Charges", width: "120px" },
//      { key: "otherCharges", label: "Other Charges", width: "120px" }
//    );
//  }
//
//  useEffect(() => {
//    const handleClickOutside = (event) => {
//      if (activeCityRowId && !event.target.closest('.city-dropdown-container') && !event.target.closest('.city-input-field')) {
//        setActiveCityRowId(null);
//      }
//    };
//    document.addEventListener('mousedown', handleClickOutside);
//    return () => document.removeEventListener('mousedown', handleClickOutside);
//  }, [activeCityRowId]);
//
//  useEffect(() => {
//    const handleScroll = () => {
//      if (activeCityRowId && inputRefs.current[activeCityRowId]) {
//        const rect = inputRefs.current[activeCityRowId].getBoundingClientRect();
//        setCityDropdownPosition({
//          top: rect.bottom + window.scrollY,
//          left: rect.left + window.scrollX,
//          width: rect.width
//        });
//      }
//    };
//    
//    window.addEventListener('scroll', handleScroll, true);
//    window.addEventListener('resize', handleScroll);
//    
//    return () => {
//      window.removeEventListener('scroll', handleScroll, true);
//      window.removeEventListener('resize', handleScroll);
//    };
//  }, [activeCityRowId]);
//
//  return (
//    <>
//      <div className="rounded-xl border border-yellow-300 overflow-x-auto">
//        <table className="min-w-max w-full text-sm">
//          <thead className="sticky top-0 bg-yellow-400 z-10">
//            <tr>
//              {cols.map((c) => (
//                <th
//                  key={c.key}
//                  style={{ minWidth: c.width, width: c.width }}
//                  className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center"
//                >
//                  {c.label}
//                  {(c.key === "plantName" || c.key === "taluka" || c.key === "district" || c.key === "state" || c.key === "country") && 
//                    <span className="ml-1 text-xs text-blue-600">*Auto</span>
//                  }
//                </th>
//              ))}
//              <th style={{ minWidth: "100px", width: "100px" }} className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">
//                Action
//              </th>
//            </tr>
//          </thead>
//
//          <tbody>
//            {rows.map((r) => {
//              const isPincodeLoading = pincodeAPI.loading && pincodeInput[r._id]?.length === 6;
//              const cityOptions = cityOptionsByRow[r._id] || [];
//              const hasCities = cityOptions.length > 0;
//              
//              return (
//                <tr key={r._id} className="hover:bg-yellow-50 even:bg-slate-50">
//                  <td className="border border-yellow-300 px-2 py-2">
//                    <TableSearchableDropdown
//                      items={plants}
//                      selectedId={r.plantCode}
//                      onSelect={(plant) => {
//                        if (plant) {
//                          onPlantChange(r._id, plant._id);
//                        } else {
//                          onChange(r._id, 'plantCode', null);
//                          onChange(r._id, 'plantName', '');
//                          onChange(r._id, 'plantCodeValue', '');
//                        }
//                      }}
//                      placeholder="Search plant..."
//                      required={true}
//                      displayField="name"
//                      codeField="code"
//                    />
//                  </td>
//
//                  <td className="border border-yellow-300 px-2 py-2">
//                    <input
//                      type="text"
//                      value={r.plantName || ""}
//                      readOnly
//                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-sm outline-none"
//                      placeholder="Auto-filled"
//                    />
//                  </td>
//
//                  <td className="border border-yellow-300 px-2 py-2">
//                    <select
//                      value={r.orderType || ""}
//                      onChange={(e) => onChange(r._id, 'orderType', e.target.value)}
//                      className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
//                    >
//                      <option value="">Select Order Type</option>
//                      {ORDER_TYPES.map((opt) => (
//                        <option key={opt} value={opt}>
//                          {opt}
//                        </option>
//                      ))}
//                    </select>
//                  </td>
//
//                  <td className="border border-yellow-300 px-2 py-2">
//                    <div className="relative">
//                      <input
//                        type="text"
//                        value={r.pinCode || ""}
//                        onChange={(e) => onPincodeChange(r._id, e.target.value)}
//                        className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
//                        placeholder="Enter 6-digit pincode"
//                        maxLength="6"
//                      />
//                      {isPincodeLoading && (
//                        <div className="absolute right-2 top-2">
//                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sky-500"></div>
//                        </div>
//                      )}
//                    </div>
//                    {pincodeAPI.error && r.pinCode?.length === 6 && (
//                      <div className="text-xs text-red-500 mt-1">{pincodeAPI.error}</div>
//                    )}
//                  </td>
//
//                  <td className="border border-yellow-300 px-2 py-2">
//                    <TableSearchableDropdown
//                      items={locations}
//                      selectedId={r.from}
//                      onSelect={(location) => handleLocationSelect(r._id, 'from', location)}
//                      placeholder="Search location..."
//                      displayField="name"
//                      codeField="code"
//                    />
//                  </td>
//
//                  <td className="border border-yellow-300 px-2 py-2">
//                    <div className="relative city-dropdown-container">
//                      <input
//                        ref={el => inputRefs.current[r._id] = el}
//                        type="text"
//                        value={r.toName || ""}
//                        readOnly={hasCities}
//                        onChange={(e) => {
//                          if (!hasCities) {
//                            onChange(r._id, 'toName', e.target.value);
//                            onChange(r._id, 'to', null);
//                          }
//                        }}
//                        onClick={(e) => {
//                          if (hasCities) {
//                            handleCityInputClick(e, r._id);
//                          }
//                        }}
//                        className={`city-input-field w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
//                          hasCities ? 'cursor-pointer bg-yellow-50 hover:bg-yellow-100' : ''
//                        }`}
//                        placeholder={hasCities ? "Click to select city/area" : "Enter city name"}
//                      />
//                      {hasCities && (
//                        <div className="absolute right-2 top-2 text-gray-400 pointer-events-none">
//                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                          </svg>
//                        </div>
//                      )}
//                    </div>
//                  </td>
//
//                  <td className="border border-yellow-300 px-2 py-2">
//                    <input
//                      type="text"
//                      value={r.talukaName || r.taluka || ""}
//                      readOnly
//                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-sm outline-none"
//                      placeholder="Auto-filled"
//                    />
//                  </td>
//
//                  <td className="border border-yellow-300 px-2 py-2">
//                    <input
//                      type="text"
//                      value={r.districtName || r.district || ""}
//                      readOnly
//                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-sm outline-none"
//                      placeholder="Auto-filled"
//                    />
//                  </td>
//
//                  <td className="border border-yellow-300 px-2 py-2">
//                    <input
//                      type="text"
//                      value={r.stateName || r.state || ""}
//                      readOnly
//                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-sm outline-none"
//                      placeholder="Auto-filled"
//                    />
//                  </td>
//
//                  <td className="border border-yellow-300 px-2 py-2">
//                    <input
//                      type="text"
//                      value={r.countryName || r.country || ""}
//                      readOnly
//                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-sm outline-none"
//                      placeholder="Auto-filled"
//                    />
//                  </td>
//
//                  <td className="border border-yellow-300 px-2 py-2">
//                    <input
//                      type="number"
//                      value={r.weight || ""}
//                      onChange={(e) => onChange(r._id, 'weight', e.target.value)}
//                      className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
//                      placeholder="Weight"
//                    />
//                  </td>
//
//                  <td className="border border-yellow-300 px-2 py-2">
//                    <select
//                      value={r.status || ""}
//                      onChange={(e) => onChange(r._id, 'status', e.target.value)}
//                      className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
//                    >
//                      <option value="">Select Status</option>
//                      {STATUSES.map((opt) => (
//                        <option key={opt} value={opt}>
//                          {opt}
//                        </option>
//                      ))}
//                    </select>
//                  </td>
//
//                  {showCharges && (
//                    <>
//                      <td className="border border-yellow-300 px-2 py-2">
//                        <input
//                          type="number"
//                          value={r.collectionCharges || ""}
//                          onChange={(e) => onChange(r._id, 'collectionCharges', e.target.value)}
//                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
//                          placeholder="Collection Charges"
//                        />
//                      </td>
//                      <td className="border border-yellow-300 px-2 py-2">
//                        <input
//                          type="text"
//                          value={r.cancellationCharges || ""}
//                          onChange={(e) => onChange(r._id, 'cancellationCharges', e.target.value)}
//                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
//                          placeholder="Cancellation Charges"
//                        />
//                      </td>
//                      <td className="border border-yellow-300 px-2 py-2">
//                        <input
//                          type="text"
//                          value={r.loadingCharges || ""}
//                          onChange={(e) => onChange(r._id, 'loadingCharges', e.target.value)}
//                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
//                          placeholder="Loading Charges"
//                        />
//                      </td>
//                      <td className="border border-yellow-300 px-2 py-2">
//                        <input
//                          type="number"
//                          value={r.otherCharges || ""}
//                          onChange={(e) => onChange(r._id, 'otherCharges', e.target.value)}
//                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
//                          placeholder="Other Charges"
//                        />
//                      </td>
//                    </>
//                  )}
//
//                  <td className="border border-yellow-300 px-2 py-2 text-center">
//                    <button
//                      onClick={() => onRemove(r._id)}
//                      className="rounded-lg bg-red-500 px-3 py-2 text-xs font-bold text-white hover:bg-red-600 transition whitespace-nowrap"
//                    >
//                      Remove
//                    </button>
//                  </td>
//                </tr>
//              );
//            })}
//            
//            {rows.length === 0 && (
//              <tr>
//                <td colSpan={cols.length + 1} className="border border-yellow-300 px-4 py-8 text-center text-slate-400">
//                  No plant routes added. Click "+ Add Row" to add a new route.
//                </td>
//              </tr>
//            )}
//          </tbody>
//        </table>
//      </div>
//
//      {activeCityRowId && cityOptionsByRow[activeCityRowId] && cityOptionsByRow[activeCityRowId].length > 0 && (
//        <div 
//          className="fixed z-[99999] bg-white border border-slate-200 rounded-lg shadow-xl overflow-y-auto"
//          style={{
//            position: 'fixed',
//            top: `${cityDropdownPosition.top}px`,
//            left: `${cityDropdownPosition.left}px`,
//            width: `${cityDropdownPosition.width}px`,
//            maxHeight: '300px',
//            minWidth: '200px'
//          }}
//        >
//          <div className="sticky top-0 bg-gray-50 px-3 py-2 text-xs font-semibold text-slate-600 border-b">
//            Select Area/City
//          </div>
//          {cityOptionsByRow[activeCityRowId].map((loc, idx) => (
//            <div
//              key={idx}
//              onMouseDown={(e) => {
//                e.preventDefault();
//                e.stopPropagation();
//                onSelectCity(activeCityRowId, loc);
//                setActiveCityRowId(null);
//              }}
//              className="px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors"
//            >
//              <div className="font-medium text-slate-800 text-sm">
//                {loc.cityName}
//              </div>
//              <div className="text-xs text-slate-500 mt-0.5">
//                {loc.districtName}, {loc.stateName}
//              </div>
//            </div>
//          ))}
//        </div>
//      )}
//    </>
//  );
//}
//
//function TableSearchableDropdown({ 
//  items, 
//  selectedId, 
//  onSelect, 
//  placeholder = "Search...",
//  required = false,
//  displayField = 'name',
//  codeField = 'code',
//  disabled = false,
//  loading = false
//}) {
//  const [searchQuery, setSearchQuery] = useState("");
//  const [filteredItems, setFilteredItems] = useState([]);
//  const [showDropdown, setShowDropdown] = useState(false);
//  const [selectedItem, setSelectedItem] = useState(null);
//  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
//  const inputRef = useRef(null);
//  const dropdownRef = useRef(null);
//
//  const getDisplayValue = useCallback((item) => {
//    if (!item) return "";
//    const display = item[displayField] || "";
//    const code = item[codeField] ? `(${item[codeField]})` : "";
//    return `${display} ${code}`.trim();
//  }, [displayField, codeField]);
//
//  useEffect(() => {
//    setFilteredItems(items);
//    if (selectedId) {
//      const item = items.find(i => i._id === selectedId);
//      setSelectedItem(item);
//      if (item) {
//        setSearchQuery(getDisplayValue(item));
//      }
//    } else {
//      setSelectedItem(null);
//      setSearchQuery("");
//    }
//  }, [items, selectedId, getDisplayValue]);
//
//  const handleSearch = (query) => {
//    setSearchQuery(query);
//    
//    if (!query.trim()) {
//      setFilteredItems(items);
//    } else {
//      const filtered = items.filter(item => {
//        const searchLower = query.toLowerCase();
//        return (
//          (item[displayField] && item[displayField].toLowerCase().includes(searchLower)) ||
//          (item[codeField] && item[codeField].toLowerCase().includes(searchLower))
//        );
//      });
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
//    setSelectedItem(item);
//    setSearchQuery(getDisplayValue(item));
//    setShowDropdown(false);
//    onSelect?.(item);
//  };
//
//  const handleInputFocus = () => {
//    if (!showDropdown && inputRef.current) {
//      setFilteredItems(items);
//      
//      const rect = inputRef.current.getBoundingClientRect();
//      setDropdownPosition({
//        top: rect.bottom + window.scrollY,
//        left: rect.left + window.scrollX,
//        width: rect.width
//      });
//      
//      setShowDropdown(true);
//    }
//  };
//
//  const handleInputBlur = () => {
//    setTimeout(() => {
//      if (dropdownRef.current && !dropdownRef.current.contains(document.activeElement)) {
//        setShowDropdown(false);
//        if (selectedItem) {
//          setSearchQuery(getDisplayValue(selectedItem));
//        }
//      }
//    }, 200);
//  };
//
//  return (
//    <>
//      <div className="relative w-full">
//        <input
//          ref={inputRef}
//          type="text"
//          value={searchQuery}
//          onChange={(e) => handleSearch(e.target.value)}
//          onFocus={handleInputFocus}
//          onBlur={handleInputBlur}
//          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 disabled:opacity-50"
//          placeholder={placeholder}
//          required={required}
//          disabled={disabled}
//          autoComplete="off"
//        />
//        {loading && (
//          <div className="absolute right-2 top-2">
//            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sky-500"></div>
//          </div>
//        )}
//      </div>
//      
//      {showDropdown && (
//        <div 
//          ref={dropdownRef}
//          className="fixed z-[10000] bg-white border border-slate-200 rounded-lg shadow-xl overflow-y-auto"
//          style={{
//            top: `${dropdownPosition.top}px`,
//            left: `${dropdownPosition.left}px`,
//            width: `${dropdownPosition.width}px`,
//            maxHeight: '300px'
//          }}
//        >
//          {loading ? (
//            <div className="p-3 text-center text-sm text-slate-500">
//              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sky-500 mx-auto"></div>
//              <p className="mt-1">Loading...</p>
//            </div>
//          ) : filteredItems.length > 0 ? (
//            filteredItems.map((item) => (
//              <div
//                key={item._id}
//                onMouseDown={(e) => {
//                  e.preventDefault();
//                  handleSelectItem(item);
//                }}
//                className={`p-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors ${
//                  selectedItem?._id === item._id ? 'bg-sky-50' : ''
//                }`}
//              >
//                <div className="font-medium text-slate-800 text-sm">
//                  {item[displayField]}
//                </div>
//                {item[codeField] && (
//                  <div className="text-xs text-slate-500 mt-0.5">
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
//    </>
//  );
//}
//
///** ===== Pack Type Table Component ===== */
//function PackTypeTable({ 
//  packType, 
//  rows, 
//  onChange, 
//  onRemove, 
//  onDuplicate, 
//  pkgTypes = [], 
//  uoms = [], 
//  skuSizes = [], 
//  items = [],
//  onNavigateToCreate, 
//  onNavigateToCreateUOM, 
//  onNavigateToCreateSKUSize,
//  onNavigateToCreateItem
//}) {
//  
//  const [showItemDropdown, setShowItemDropdown] = useState({});
//  const [itemSearchQuery, setItemSearchQuery] = useState({});
//  const [filteredItems, setFilteredItems] = useState({});
//  const [itemDropdownPosition, setItemDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
//  const itemInputRefs = useRef({});
//  const itemDropdownRef = useRef({});
//
//  const cols = useMemo(() => {
//    if (packType === "PALLETIZATION") {
//      return [
//        { key: "noOfPallets", label: "NO OF PALLETS", type: "number", options: null },
//        { key: "unitPerPallets", label: "UNIT PER PALLETS", type: "number", options: null },
//        { key: "totalPkgs", label: "TOTAL PKGS", type: "number", options: null, readOnly: true },
//        { key: "pkgsType", label: "PKG TYPE", type: "select", options: pkgTypes, isDynamic: true },
//        { key: "uom", label: "UOM", type: "select", options: uoms, isUOM: true },
//        { key: "skuSize", label: "SKU - SIZE", type: "select", options: skuSizes, isSKUSize: true },
//        { key: "packWeight", label: "PACK - WEIGHT", type: "number", options: null },
//        { key: "productName", label: "PRODUCT NAME", type: "select", options: items, isItem: true },
//        { key: "wtLtr", label: "WT (LTR)", type: "number", options: null, readOnly: true },
//        { key: "actualWt", label: "ACTUAL - WT", type: "number", options: null, readOnly: true },
//        { key: "chargedWt", label: "CHARGED - WT", type: "number", options: null },
//        { key: "wtUom", label: "WT UOM", type: "text", options: null, readOnly: true, defaultValue: "MT" },
//      ];
//    }
//
//    if (packType === "UNIFORM - BAGS/BOXES") {
//      return [
//        { key: "totalPkgs", label: "TOTAL PKGS", type: "number", options: null },
//        { key: "pkgsType", label: "PKG TYPE", type: "select", options: pkgTypes, isDynamic: true },
//        { key: "uom", label: "UOM", type: "select", options: uoms, isUOM: true },
//        { key: "skuSize", label: "SKU - SIZE", type: "select", options: skuSizes, isSKUSize: true },
//        { key: "packWeight", label: "PACK - WEIGHT", type: "number", options: null },
//        { key: "productName", label: "PRODUCT NAME", type: "select", options: items, isItem: true },
//        { key: "wtLtr", label: "WT (LTR)", type: "number", options: null, readOnly: true },
//        { key: "actualWt", label: "ACTUAL - WT", type: "number", options: null, readOnly: true },
//        { key: "chargedWt", label: "CHARGED - WT", type: "number", options: null },
//        { key: "wtUom", label: "WT UOM", type: "text", options: null, readOnly: true, defaultValue: "MT" },
//      ];
//    }
//
//    if (packType === "LOOSE - CARGO") {
//      return [
//        { key: "uom", label: "UOM", type: "select", options: uoms, isUOM: true },
//        { key: "productName", label: "PRODUCT NAME", type: "select", options: items, isItem: true },
//        { key: "actualWt", label: "ACTUAL - WT", type: "number", options: null },
//        { key: "chargedWt", label: "CHARGED - WT", type: "number", options: null },
//      ];
//    }
//
//    // NON-UNIFORM - GENERAL CARGO
//    return [
//      { key: "nos", label: "NOS", type: "number", options: null },
//      { key: "productName", label: "PRODUCT NAME", type: "select", options: items, isItem: true },
//      { key: "uom", label: "UOM", type: "select", options: uoms, isUOM: true },
//      { key: "length", label: "LENGTH", type: "number", options: null },
//      { key: "width", label: "WIDTH", type: "number", options: null },
//      { key: "height", label: "HEIGHT", type: "number", options: null },
//      { key: "actualWt", label: "ACTUAL - WT", type: "number", options: null },
//      { key: "chargedWt", label: "CHARGED - WT", type: "number", options: null },
//    ];
//  }, [packType, pkgTypes, uoms, skuSizes, items]);
//
//  const handleChange = (rowId, key, value) => {
//    onChange(rowId, key, value);
//  };
//
//  const handleItemSearch = (rowId, query) => {
//    setItemSearchQuery(prev => ({ ...prev, [rowId]: query }));
//    
//    if (!query.trim()) {
//      setFilteredItems(prev => ({ ...prev, [rowId]: items }));
//    } else {
//      const filtered = items.filter(item =>
//        item.itemName.toLowerCase().includes(query.toLowerCase()) ||
//        (item.itemCode && item.itemCode.toLowerCase().includes(query.toLowerCase()))
//      );
//      setFilteredItems(prev => ({ ...prev, [rowId]: filtered }));
//    }
//  };
//
//  const handleSelectItem = (rowId, item) => {
//    onChange(rowId, 'productName', item.itemName);
//    setItemSearchQuery(prev => ({ ...prev, [rowId]: item.itemName }));
//    setShowItemDropdown(prev => ({ ...prev, [rowId]: false }));
//  };
//
//  const handleItemInputFocus = (rowId, event) => {
//    if (!showItemDropdown[rowId]) {
//      setFilteredItems(prev => ({ ...prev, [rowId]: items }));
//      
//      const rect = event.target.getBoundingClientRect();
//      setItemDropdownPosition({
//        top: rect.bottom + window.scrollY,
//        left: rect.left + window.scrollX,
//        width: rect.width
//      });
//      
//      setShowItemDropdown(prev => ({ ...prev, [rowId]: true }));
//    }
//  };
//
//  const handleItemInputBlur = (rowId) => {
//    setTimeout(() => {
//      if (itemDropdownRef.current[rowId] && !itemDropdownRef.current[rowId].contains(document.activeElement)) {
//        setShowItemDropdown(prev => ({ ...prev, [rowId]: false }));
//      }
//    }, 200);
//  };
//
//  useEffect(() => {
//    const handleScroll = () => {
//      Object.keys(showItemDropdown).forEach(rowId => {
//        if (showItemDropdown[rowId] && itemInputRefs.current[rowId]) {
//          const rect = itemInputRefs.current[rowId].getBoundingClientRect();
//          setItemDropdownPosition({
//            top: rect.bottom + window.scrollY,
//            left: rect.left + window.scrollX,
//            width: rect.width
//          });
//        }
//      });
//    };
//    
//    window.addEventListener('scroll', handleScroll, true);
//    window.addEventListener('resize', handleScroll);
//    
//    return () => {
//      window.removeEventListener('scroll', handleScroll, true);
//      window.removeEventListener('resize', handleScroll);
//    };
//  }, [showItemDropdown]);
//
//  useEffect(() => {
//    rows.forEach(row => {
//      if (!filteredItems[row._id]) {
//        setFilteredItems(prev => ({ ...prev, [row._id]: items }));
//      }
//      if (row.productName && !itemSearchQuery[row._id]) {
//        setItemSearchQuery(prev => ({ ...prev, [row._id]: row.productName }));
//      }
//    });
//  }, [items, rows]);
//
//  return (
//    <div className="overflow-auto rounded-xl border border-yellow-300">
//      <table className="min-w-max w-full text-sm">
//        <thead className="sticky top-0 bg-yellow-400">
//          <tr>
//            {cols.map((c) => (
//              <th
//                key={c.key}
//                className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center"
//              >
//                {c.label}
//                {c.readOnly && <span className="ml-1 text-xs text-blue-600">*Auto</span>}
//              </th>
//            ))}
//            <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">
//              Actions
//            </th>
//          </tr>
//        </thead>
//
//        <tbody>
//          {rows.length > 0 ? (
//            rows.map((r) => (
//              <tr key={r._id} className="hover:bg-yellow-50 even:bg-slate-50">
//                {cols.map((c) => {
//                  if (c.key === "wtUom") {
//                    return (
//                      <td key={c.key} className="border border-yellow-300 px-2 py-2">
//                        <input
//                          type="text"
//                          value="MT"
//                          readOnly
//                          className="w-full rounded-lg border border-slate-200 bg-slate-100 px-2 py-1.5 text-sm text-slate-700 font-medium"
//                        />
//                      </td>
//                    );
//                  }
//                  
//                  return (
//                    <td key={c.key} className="border border-yellow-300 px-2 py-2">
//                      {c.isDynamic ? (
//                        <div className="flex gap-2 items-center">
//                          <select
//                            value={r[c.key] || ""}
//                            onChange={(e) => handleChange(r._id, c.key, e.target.value)}
//                            className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
//                          >
//                            <option value="">Select {c.label}</option>
//                            {c.options.map((opt) => (
//                              <option key={opt._id} value={opt.name}>
//                                {opt.name}
//                              </option>
//                            ))}
//                          </select>
//                        </div>
//                      ) : c.isUOM ? (
//                        <div className="flex gap-2 items-center">
//                          <select
//                            value={r[c.key] || "MT"}
//                            onChange={(e) => handleChange(r._id, c.key, e.target.value)}
//                            className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
//                          >
//                            {c.options.length > 0 ? (
//                              c.options.map((opt) => (
//                                <option key={opt._id} value={opt.name}>
//                                  {opt.name}
//                                </option>
//                              ))
//                            ) : (
//                              <option value="MT">MT</option>
//                            )}
//                          </select>
//                        </div>
//                      ) : c.isSKUSize ? (
//                        <div className="flex gap-2 items-center">
//                          <select
//                            value={r[c.key] || ""}
//                            onChange={(e) => handleChange(r._id, c.key, e.target.value)}
//                            className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
//                          >
//                            <option value="">Select {c.label}</option>
//                            {c.options.map((opt) => (
//                              <option key={opt._id} value={opt.display}>
//                                {opt.display}
//                              </option>
//                            ))}
//                          </select>
//                        </div>
//                      ) : c.isItem ? (
//                        <div className="relative w-full">
//                          <div className="flex gap-2 items-center">
//                            <div className="flex-1 relative">
//                              <input
//                                ref={el => itemInputRefs.current[r._id] = el}
//                                type="text"
//                                value={itemSearchQuery[r._id] || r[c.key] || ""}
//                                onChange={(e) => handleItemSearch(r._id, e.target.value)}
//                                onFocus={(e) => handleItemInputFocus(r._id, e)}
//                                onBlur={() => handleItemInputBlur(r._id)}
//                                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
//                                placeholder={`Search ${c.label}...`}
//                                autoComplete="off"
//                              />
//                              {showItemDropdown[r._id] && (
//                                <div 
//                                  ref={el => itemDropdownRef.current[r._id] = el}
//                                  className="fixed z-[10000] bg-white border border-slate-200 rounded-lg shadow-xl overflow-y-auto"
//                                  style={{
//                                    top: `${itemDropdownPosition.top}px`,
//                                    left: `${itemDropdownPosition.left}px`,
//                                    width: `${itemDropdownPosition.width}px`,
//                                    maxHeight: '300px'
//                                  }}
//                                >
//                                  <div className="sticky top-0 bg-gray-50 px-3 py-2 text-xs font-semibold text-slate-600 border-b">
//                                    Select Product
//                                  </div>
//                                  {(filteredItems[r._id] || items).length > 0 ? (
//                                    (filteredItems[r._id] || items).map((item) => (
//                                      <div
//                                        key={item._id}
//                                        onMouseDown={(e) => {
//                                          e.preventDefault();
//                                          handleSelectItem(r._id, item);
//                                        }}
//                                        className="px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors"
//                                      >
//                                        <div className="font-medium text-slate-800 text-sm">
//                                          {item.itemName}
//                                        </div>
//                                        <div className="text-xs text-slate-500 mt-0.5">
//                                          Code: {item.itemCode} | Price: ₹{item.unitPrice}
//                                        </div>
//                                      </div>
//                                    ))
//                                  ) : (
//                                    <div className="p-3 text-center text-sm text-slate-500">
//                                      No items found
//                                    </div>
//                                  )}
//                                </div>
//                              )}
//                            </div>
//                          </div>
//                        </div>
//                      ) : c.options && !c.isDynamic && !c.isUOM && !c.isSKUSize && !c.isItem ? (
//                        <select
//                          value={r[c.key] || ""}
//                          onChange={(e) => handleChange(r._id, c.key, e.target.value)}
//                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
//                        >
//                          <option value="">Select {c.label}</option>
//                          {c.options.map((opt) => (
//                            <option key={opt} value={opt}>
//                              {opt}
//                            </option>
//                          ))}
//                        </select>
//                      ) : (
//                        <input
//                          type={c.type || "text"}
//                          value={r[c.key] || ""}
//                          readOnly={c.readOnly}
//                          onChange={(e) => handleChange(r._id, c.key, e.target.value)}
//                          className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
//                            c.readOnly 
//                              ? 'bg-slate-100 text-slate-700' 
//                              : 'bg-white'
//                          }`}
//                          placeholder={c.readOnly ? "Auto-calculated" : `Enter ${c.label}`}
//                          step={c.type === "number" ? "0.001" : undefined}
//                        />
//                      )}
//                    </td>
//                  );
//                })}
//                <td className="border border-yellow-300 px-2 py-2">
//                  <div className="flex gap-2 justify-center">
//                    <button
//                      onClick={() => onDuplicate(r._id)}
//                      className="rounded-lg border border-yellow-500 bg-yellow-100 px-3 py-1.5 text-xs font-bold text-yellow-800 hover:bg-yellow-200 transition"
//                    >
//                      Duplicate
//                    </button>
//                    <button
//                      onClick={() => onRemove(r._id)}
//                      className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600 transition"
//                    >
//                      Remove
//                    </button>
//                  </div>
//                </td>
//              </tr>
//            ))
//          ) : (
//            <tr>
//              <td
//                colSpan={cols.length + 1}
//                className="border border-yellow-300 px-4 py-10 text-center text-slate-400 font-semibold"
//              >
//                No rows yet. Click <b>Add Row</b> to add data.
//              </td>
//            </tr>
//          )}
//        </tbody>
//      </table>
//    </div>
//  );
//}
"use client";

import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";

/** =========================
 * CONSTANTS
 ========================= */
const PACK_TYPES = [
  { key: "PALLETIZATION", label: "Palletization" },
  { key: "UNIFORM - BAGS/BOXES", label: "Uniform - Bags/Boxes" },
  { key: "LOOSE - CARGO", label: "Loose - Cargo" },
  { key: "NON-UNIFORM - GENERAL CARGO", label: "Non-uniform - General Cargo" },
];

const ORDER_TYPES = ["Sales", "STO Order", "Export", "Import"];
const STATUSES = ["Open", "Hold", "Cancelled"];
const DELIVERY_OPTIONS = ["Urgent", "Normal", "Express", "Scheduled"];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** =========================
 * DEFAULT EMPTY ROWS
 ========================= */
function defaultRow(packType) {
  if (packType === "PALLETIZATION") {
    return {
      _id: uid(),
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
      isUniform: false,
    };
  }

  if (packType === "UNIFORM - BAGS/BOXES") {
    return {
      _id: uid(),
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

  if (packType === "LOOSE - CARGO") {
    return {
      _id: uid(),
      uom: "MT",
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
    uom: "MT",
    length: "",
    width: "",
    height: "",
    actualWt: "",
    chargedWt: "",
  };
}

function defaultPlantRow() {
  return {
    _id: uid(),
    plantCode: null,
    plantName: "",
    plantCodeValue: "",
    orderType: "",
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
    status: "",
    collectionCharges: "",
    cancellationCharges: "",
    loadingCharges: "",
    otherCharges: "",
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
 * External Pincode API Hook with Multiple Cities Support
 ========================= */
function useExternalPincodeAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pincodeData, setPincodeData] = useState(null);
  const [multipleCities, setMultipleCities] = useState([]);

  const fetchPincodeDetails = async (pincode) => {
    if (!pincode || pincode.length !== 6) {
      return null;
    }

    setLoading(true);
    setError(null);
    setMultipleCities([]);
    
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();
      
      if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice && data[0].PostOffice.length > 0) {
        const postOffices = data[0].PostOffice;
        
        const uniqueLocations = [];
        const seen = new Set();
        
        postOffices.forEach(po => {
          const cityName = po.Name;
          const key = `${po.Name}-${po.District}-${po.State}`;
          
          if (!seen.has(key)) {
            seen.add(key);
            uniqueLocations.push({
              taluka: po.Block || po.Taluk || po.District,
              talukaName: po.Block || po.Taluk || po.District,
              district: po.District,
              districtName: po.District,
              state: po.State,
              stateName: po.State,
              country: po.Country,
              countryName: po.Country,
              city: cityName,
              cityName: cityName,
              pincode: pincode,
              postOffice: po.Name,
              block: po.Block,
              division: po.Division
            });
          }
        });
        
        if (uniqueLocations.length > 1) {
          setMultipleCities(uniqueLocations);
        }
        
        const firstLocation = uniqueLocations[0];
        const result = {
          taluka: firstLocation.taluka,
          talukaName: firstLocation.talukaName,
          district: firstLocation.district,
          districtName: firstLocation.districtName,
          state: firstLocation.state,
          stateName: firstLocation.stateName,
          country: firstLocation.country,
          countryName: firstLocation.countryName,
          city: firstLocation.city,
          cityName: firstLocation.cityName,
          pincode: pincode,
          hasMultiple: uniqueLocations.length > 1,
          allLocations: uniqueLocations
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

  return { loading, error, pincodeData, multipleCities, fetchPincodeDetails };
}

export default function EditOrderPanel() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id;

  /** =========================
   * STATE FOR API DATA
   ========================= */
  const [branches, setBranches] = useState([]);
  const [locations, setLocations] = useState([]); 
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [plants, setPlants] = useState([]);
  const [pkgTypes, setPkgTypes] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [skuSizes, setSkuSizes] = useState([]);
  const [items, setItems] = useState([]);
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
  const [showCityDropdown, setShowCityDropdown] = useState({});
  const [cityOptionsByRow, setCityOptionsByRow] = useState({});

  /** =========================
   * CHARGES VISIBILITY STATE
   ========================= */
  const [showCharges, setShowCharges] = useState(false);

  /** =========================
   * HEADER STATE
   ========================= */
  const [top, setTop] = useState({
    orderNo: "",
    branch: null,
    branchName: "",
    branchCode: "",
    delivery: "Normal",
    date: new Date().toISOString().split('T')[0],
    partyName: "",
    collectionCharges: "",
    cancellationCharges: "",
    loadingCharges: "",
    otherCharges: "",
    customerId: null,
    customerCode: "",
    customerName: "",
    contactPerson: "",
  });

  /** =========================
   * PLANT GRID TABLE DATA
   ========================= */
  const [plantRows, setPlantRows] = useState([defaultPlantRow()]);

  /** =========================
   * PACK DATA - Separate arrays for each pack type
   ========================= */
  const [packData, setPackData] = useState({
    PALLETIZATION: [],
    "UNIFORM - BAGS/BOXES": [],
    "LOOSE - CARGO": [],
    "NON-UNIFORM - GENERAL CARGO": [],
  });

  /** =========================
   * FETCH MASTER DATA
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
      }
    } catch (error) {
      console.error('Error fetching branches:', error.message);
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
      }
    } catch (error) {
      console.error('Error fetching locations:', error.message);
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

  const fetchPkgTypes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/pkg-types', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setPkgTypes(data.data);
      }
    } catch (error) {
      console.error('Error fetching PKG types:', error.message);
    }
  };

  const fetchUOMs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/uoms', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setUoms(data.data);
      }
    } catch (error) {
      console.error('Error fetching UOMs:', error.message);
    }
  };

  const fetchSKUSizes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/sku-sizes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setSkuSizes(data.data);
      }
    } catch (error) {
      console.error('Error fetching SKU sizes:', error.message);
    }
  };

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/items', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setItems(data.data);
      }
    } catch (error) {
      console.error('Error fetching items:', error.message);
    }
  };

  /** =========================
   * FETCH ORDER DATA
   ========================= */
  useEffect(() => {
    if (orderId) {
      fetchOrderData();
      fetchBranches();
      fetchCountries();
      fetchPlants();
      fetchLocations();
      fetchPkgTypes();
      fetchUOMs();
      fetchSKUSizes();
      fetchItems();
    }
  }, [orderId]);

  const fetchOrderData = async () => {
    setFetchLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch(`/api/order-panel?id=${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch order');
      }

      const order = data.data;
      
      setOrderNumber(order.orderPanelNo || order.orderNo || "");
      
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

      if (order.customerName) {
        setSelectedCustomer({
          _id: order.customerId,
          customerName: order.customerName,
          customerCode: order.customerCode,
          contactPersonName: order.contactPerson,
        });
        setCustomerSearchQuery(order.customerName);
      }

      if (order.plantRows && order.plantRows.length > 0) {
        const processedPlantRows = order.plantRows.map(row => ({
          _id: row._id || uid(),
          plantCode: row.plantCode || null,
          plantName: row.plantName || "",
          plantCodeValue: row.plantCodeValue || "",
          orderType: row.orderType || "Sales",
          pinCode: row.pinCode || "",
          from: row.from || null,
          fromName: row.fromName || "",
          to: row.to || null,
          toName: row.toName || "",
          taluka: row.taluka || "",
          talukaName: row.talukaName || "",
          district: row.district || "",
          districtName: row.districtName || "",
          state: row.state || "",
          stateName: row.stateName || "",
          country: row.country || "",
          countryName: row.countryName || "",
          weight: row.weight?.toString() || "",
          status: row.status || "Open",
          collectionCharges: row.collectionCharges?.toString() || "",
          cancellationCharges: row.cancellationCharges || "",
          loadingCharges: row.loadingCharges || "",
          otherCharges: row.otherCharges?.toString() || "",
        }));
        setPlantRows(processedPlantRows);
      }

      // Load pack data for all pack types
      if (order.packData) {
        const processedPackData = {
          PALLETIZATION: (order.packData.PALLETIZATION || []).map(row => ({
            ...row,
            _id: row._id || uid(),
            noOfPallets: row.noOfPallets?.toString() || "",
            unitPerPallets: row.unitPerPallets?.toString() || "",
            totalPkgs: row.totalPkgs?.toString() || "",
            pkgsType: row.pkgsType || "",
            uom: row.uom || "MT",
            skuSize: row.skuSize || "",
            packWeight: row.packWeight?.toString() || "",
            productName: row.productName || "",
            wtLtr: row.wtLtr?.toString() || "",
            actualWt: row.actualWt?.toString() || "",
            chargedWt: row.chargedWt?.toString() || "",
            wtUom: row.wtUom || "MT",
            isUniform: row.isUniform || false,
          })),
          "UNIFORM - BAGS/BOXES": (order.packData["UNIFORM - BAGS/BOXES"] || []).map(row => ({
            ...row,
            _id: row._id || uid(),
            totalPkgs: row.totalPkgs?.toString() || "",
            pkgsType: row.pkgsType || "",
            uom: row.uom || "MT",
            skuSize: row.skuSize || "",
            packWeight: row.packWeight?.toString() || "",
            productName: row.productName || "",
            wtLtr: row.wtLtr?.toString() || "",
            actualWt: row.actualWt?.toString() || "",
            chargedWt: row.chargedWt?.toString() || "",
            wtUom: row.wtUom || "MT",
          })),
          "LOOSE - CARGO": (order.packData["LOOSE - CARGO"] || []).map(row => ({
            ...row,
            _id: row._id || uid(),
            uom: row.uom || "MT",
            productName: row.productName || "",
            actualWt: row.actualWt?.toString() || "",
            chargedWt: row.chargedWt?.toString() || "",
          })),
          "NON-UNIFORM - GENERAL CARGO": (order.packData["NON-UNIFORM - GENERAL CARGO"] || []).map(row => ({
            ...row,
            _id: row._id || uid(),
            nos: row.nos?.toString() || "",
            productName: row.productName || "",
            uom: row.uom || "MT",
            length: row.length?.toString() || "",
            width: row.width?.toString() || "",
            height: row.height?.toString() || "",
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
    updatePlantRow(rowId, 'pinCode', pincode);
    setPincodeInput(prev => ({ ...prev, [rowId]: pincode }));
    
    if (pincode && pincode.length === 6) {
      const result = await pincodeAPI.fetchPincodeDetails(pincode);
      
      if (result) {
        if (result.hasMultiple && result.allLocations && result.allLocations.length > 0) {
          setCityOptionsByRow(prev => ({ 
            ...prev, 
            [rowId]: result.allLocations 
          }));
        } else {
          setCityOptionsByRow(prev => ({ ...prev, [rowId]: [] }));
          updatePlantRow(rowId, 'taluka', result.taluka);
          updatePlantRow(rowId, 'talukaName', result.talukaName);
          updatePlantRow(rowId, 'district', result.district);
          updatePlantRow(rowId, 'districtName', result.districtName);
          updatePlantRow(rowId, 'state', result.state);
          updatePlantRow(rowId, 'stateName', result.stateName);
          updatePlantRow(rowId, 'country', result.country);
          updatePlantRow(rowId, 'countryName', result.countryName);
          updatePlantRow(rowId, 'toName', result.cityName);
          updatePlantRow(rowId, 'to', null);
        }
      }
    } else {
      setCityOptionsByRow(prev => ({ ...prev, [rowId]: [] }));
    }
  };

  const handleSelectCity = (rowId, location) => {
    updatePlantRow(rowId, 'taluka', location.taluka);
    updatePlantRow(rowId, 'talukaName', location.talukaName);
    updatePlantRow(rowId, 'district', location.district);
    updatePlantRow(rowId, 'districtName', location.districtName);
    updatePlantRow(rowId, 'state', location.state);
    updatePlantRow(rowId, 'stateName', location.stateName);
    updatePlantRow(rowId, 'country', location.country);
    updatePlantRow(rowId, 'countryName', location.countryName);
    updatePlantRow(rowId, 'toName', location.cityName);
    updatePlantRow(rowId, 'to', null);
    setShowCityDropdown(prev => ({ ...prev, [rowId]: false }));
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
  const recalculatePalletizationWeights = (row) => {
    const updatedRow = { ...row };
    
    const noOfPallets = num(updatedRow.noOfPallets);
    const unitPerPallets = num(updatedRow.unitPerPallets);
    const packWeight = num(updatedRow.packWeight);
    const uom = (updatedRow.uom || "").toUpperCase().trim();
    
    let totalPkgs = num(updatedRow.totalPkgs);
    
    if (noOfPallets > 0 && unitPerPallets > 0) {
      const calculatedTotalPkgs = noOfPallets * unitPerPallets;
      totalPkgs = calculatedTotalPkgs;
      updatedRow.totalPkgs = String(calculatedTotalPkgs);
    }
    
    if (totalPkgs > 0 && packWeight > 0) {
      if (uom === "LTR" || uom === "L") {
        const wtLtr = totalPkgs * packWeight;
        updatedRow.wtLtr = wtLtr.toFixed(2);
        const actualWt = wtLtr / 1000;
        updatedRow.actualWt = actualWt.toFixed(3);
      } else if (uom === "KG" || uom === "KGS") {
        const actualWt = totalPkgs * packWeight;
        updatedRow.actualWt = actualWt.toFixed(3);
        updatedRow.wtLtr = "";
      } else {
        updatedRow.wtLtr = "";
        updatedRow.actualWt = "";
      }
    } else {
      if (!updatedRow.wtLtr) updatedRow.wtLtr = "";
      if (!updatedRow.actualWt) updatedRow.actualWt = "";
    }
    
    return updatedRow;
  };

  const recalculateUniformWeights = (row) => {
    const updatedRow = { ...row };
    
    const totalPkgs = num(updatedRow.totalPkgs);
    const packWeight = num(updatedRow.packWeight);
    const uom = (updatedRow.uom || "").toUpperCase().trim();
    
    if (totalPkgs > 0 && packWeight > 0) {
      if (uom === "LTR" || uom === "L") {
        const wtLtr = totalPkgs * packWeight;
        updatedRow.wtLtr = wtLtr.toFixed(2);
        const actualWt = (wtLtr / 1000) * 2;
        updatedRow.actualWt = actualWt.toFixed(3);
      } else if (uom === "KG" || uom === "KGS") {
        const actualWt = totalPkgs * packWeight;
        updatedRow.actualWt = actualWt.toFixed(3);
        updatedRow.wtLtr = "";
      } else {
        updatedRow.wtLtr = "";
        updatedRow.actualWt = "";
      }
    } else {
      if (!updatedRow.wtLtr) updatedRow.wtLtr = "";
      if (!updatedRow.actualWt) updatedRow.actualWt = "";
    }
    
    return updatedRow;
  };

  const updatePackRow = (rowId, key, value, packType) => {
    setPackData((prev) => {
      const updatedPack = prev[packType].map((r) => {
        if (r._id === rowId) {
          let updatedRow = { ...r, [key]: value };
          
          if (packType === "PALLETIZATION") {
            updatedRow = recalculatePalletizationWeights(updatedRow);
          } else if (packType === "UNIFORM - BAGS/BOXES") {
            updatedRow = recalculateUniformWeights(updatedRow);
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

  const addRow = (packType) => {
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
   * UPDATE ORDER FUNCTION
   ========================= */
  const handleUpdate = async () => {
    if (!top.branch) {
      alert("Please select a branch");
      return;
    }
    
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
      
      const payload = {
        id: orderId,
        branch: top.branch,
        branchName: top.branchName,
        branchCode: top.branchCode,
        delivery: top.delivery,
        date: top.date,
        customerId: selectedCustomer?._id || null,
        customerCode: selectedCustomer?.customerCode || '',
        customerName: selectedCustomer?.customerName || '',
        contactPerson: selectedCustomer?.contactPersonName || '',
        partyName: selectedCustomer?.customerName || top.partyName || '',
        collectionCharges: num(top.collectionCharges) || 0,
        cancellationCharges: top.cancellationCharges || 'Nil',
        loadingCharges: top.loadingCharges || 'Nil',
        otherCharges: num(top.otherCharges) || 0,
        plantRows: plantRows.map(row => ({
          _id: row._id,
          plantCode: row.plantCode || null,
          plantName: row.plantName || '',
          plantCodeValue: row.plantCodeValue || '',
          orderType: row.orderType || "Sales",
          pinCode: row.pinCode || "",
          from: row.from || null,
          fromName: row.fromName || "",
          to: row.to || null,
          toName: row.toName || "",
          taluka: row.taluka || "",
          talukaName: row.talukaName || "",
          district: row.district || "",
          districtName: row.districtName || "",
          state: row.state || "",
          stateName: row.stateName || "",
          country: row.country || "",
          countryName: row.countryName || "",
          weight: num(row.weight) || 0,
          status: row.status || "Open",
          rate: 0,
          locationRate: 0,
          collectionCharges: num(row.collectionCharges) || 0,
          cancellationCharges: row.cancellationCharges || 'Nil',
          loadingCharges: row.loadingCharges || 'Nil',
          otherCharges: num(row.otherCharges) || 0
        })),
        packData: {
          PALLETIZATION: packData.PALLETIZATION.map(row => ({
            _id: row._id,
            noOfPallets: num(row.noOfPallets),
            unitPerPallets: num(row.unitPerPallets),
            totalPkgs: num(row.totalPkgs),
            pkgsType: row.pkgsType || "",
            uom: row.uom || "MT",
            skuSize: row.skuSize || "",
            packWeight: num(row.packWeight),
            productName: row.productName || "",
            wtLtr: num(row.wtLtr),
            actualWt: num(row.actualWt),
            chargedWt: num(row.chargedWt),
            wtUom: row.wtUom || "MT",
            isUniform: row.isUniform || false
          })),
          "UNIFORM - BAGS/BOXES": packData["UNIFORM - BAGS/BOXES"].map(row => ({
            _id: row._id,
            totalPkgs: num(row.totalPkgs),
            pkgsType: row.pkgsType || "",
            uom: row.uom || "MT",
            skuSize: row.skuSize || "",
            packWeight: num(row.packWeight),
            productName: row.productName || "",
            wtLtr: num(row.wtLtr),
            actualWt: num(row.actualWt),
            chargedWt: num(row.chargedWt),
            wtUom: row.wtUom || "MT"
          })),
          "LOOSE - CARGO": packData["LOOSE - CARGO"].map(row => ({
            _id: row._id,
            uom: row.uom || "MT",
            productName: row.productName || "",
            actualWt: num(row.actualWt),
            chargedWt: num(row.chargedWt)
          })),
          "NON-UNIFORM - GENERAL CARGO": packData["NON-UNIFORM - GENERAL CARGO"].map(row => ({
            _id: row._id,
            nos: num(row.nos),
            productName: row.productName || "",
            uom: row.uom || "MT",
            length: num(row.length),
            width: num(row.width),
            height: num(row.height),
            actualWt: num(row.actualWt),
            chargedWt: num(row.chargedWt)
          }))
        }
      };

      const res = await fetch('/api/order-panel', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || `Failed to update order: ${res.status}`);
      }

      setSaveSuccess(true);
      alert(`✅ Order updated successfully!\nOrder Panel Number: ${top.orderNo}`);
      
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

            {/* Charges Fields - Conditionally Visible */}
            {showCharges && (
              <>
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
              </>
            )}
          </div>
        </Card>

        <div className="mt-4">
          {/* Plant Code / Route Section */}
          <Card title="Plant Code / Route">
            <div className="mb-4 flex justify-between items-center">
              <div className="text-sm text-slate-600">
                Manage plant routes and distribution - Enter pincode to auto-fill location fields
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCharges(!showCharges)}
                  className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                    showCharges 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {showCharges ? 'Hide Charges' : 'Charges'}
                </button>
                <button
                  onClick={addPlantRow}
                  className="rounded-xl bg-yellow-600 px-4 py-2 text-sm font-bold text-white hover:bg-yellow-700 transition"
                >
                  + Add Row
                </button>
              </div>
            </div>
            <PlantGridTable
              rows={plantRows}
              onChange={updatePlantRow}
              onRemove={removePlantRow}
              onPlantChange={handlePlantChange}
              onPincodeChange={handlePincodeChange}
              onSelectCity={handleSelectCity}
              plants={plants}
              branches={branches}
              locations={locations} 
              pincodeAPI={pincodeAPI}
              pincodeInput={pincodeInput}
              showCityDropdown={showCityDropdown}
              setShowCityDropdown={setShowCityDropdown}
              cityOptionsByRow={cityOptionsByRow}
              showCharges={showCharges}
            />
          </Card>

          {/* PACK TYPE SECTIONS - Show ALL sections at once (like Create page) */}
          <div className="mt-4 space-y-6">
            {PACK_TYPES.map((pack) => (
              <Card key={pack.key} title={`${pack.label} (${packData[pack.key]?.length || 0} rows)`}>
                <div className="mb-4 flex justify-end">
                  <button
                    onClick={() => addRow(pack.key)}
                    className="rounded-xl bg-yellow-600 px-4 py-2 text-sm font-bold text-white hover:bg-yellow-700 transition"
                  >
                    + Add Row
                  </button>
                </div>
                
                <PackTypeTable
                  packType={pack.key}
                  rows={packData[pack.key] || []}
                  onChange={(rowId, key, value) => updatePackRow(rowId, key, value, pack.key)}
                  onRemove={(id) => removeRow(pack.key, id)}
                  onDuplicate={(id) => duplicateRow(pack.key, id)}
                  pkgTypes={pkgTypes}
                  uoms={uoms}
                  skuSizes={skuSizes}
                  items={items}
                  onNavigateToCreate={() => router.push('/admin/pkg-type?returnUrl=/admin/order-panel/create')}
                  onNavigateToCreateUOM={() => router.push('/admin/uoms?returnUrl=/admin/order-panel/create')}
                  onNavigateToCreateSKUSize={() => router.push('/admin/sku-sizes?returnUrl=/admin/order-panel/create')}
                  onNavigateToCreateItem={() => router.push('/admin/items?returnUrl=/admin/order-panel/create')}
                />
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ========================
// COMPONENTS
// ========================

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
  const inputRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

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
      setFilteredItems(items);
    } else {
      const filtered = items.filter(item =>
        (item[displayField] && item[displayField].toLowerCase().includes(query.toLowerCase())) ||
        (item[codeField] && item[codeField].toLowerCase().includes(query.toLowerCase()))
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
      
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width
        });
      }
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
    <div className="relative" ref={dropdownRef}>
      <input
        ref={inputRef}
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
        <div 
          className="fixed z-[9999] bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`
          }}
        >
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div
                key={item._id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelectItem(item);
                }}
                className={`p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors ${
                  selectedItem?._id === item._id ? 'bg-sky-50' : ''
                }`}
              >
                <div className="font-medium text-slate-800">
                  {item[displayField]}
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

function PlantGridTable({ 
  rows, 
  onChange, 
  onRemove, 
  onPlantChange,
  onPincodeChange,
  onSelectCity,
  plants,
  locations, 
  branches,
  pincodeAPI,
  pincodeInput,
  showCityDropdown,
  setShowCityDropdown,
  cityOptionsByRow,
  showCharges = false
}) {
  const [cityDropdownPosition, setCityDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [activeCityRowId, setActiveCityRowId] = useState(null);
  const inputRefs = useRef({});

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

  const handleLocationSelect = (rowId, field, location) => {
    if (location) {
      onChange(rowId, field, location._id);
      if (field === 'from') {
        onChange(rowId, 'fromName', location.name);
      } else if (field === 'to') {
        onChange(rowId, 'toName', location.name);
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

  const handleCityInputClick = (event, rowId) => {
    const cityOptions = cityOptionsByRow[rowId];
    if (cityOptions && cityOptions.length > 0) {
      const rect = event.target.getBoundingClientRect();
      setCityDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
      setActiveCityRowId(rowId);
    }
  };

  const cols = [
    { key: "plantCode", label: "Plant Code *", width: "200px" },
    { key: "plantName", label: "Plant Name", width: "200px" },
    { key: "orderType", label: "Order Type", width: "150px" },
    { key: "pinCode", label: "Pin Code", width: "120px" },
    { key: "from", label: "From", width: "200px" },
    { key: "to", label: "To / City", width: "220px" },
    { key: "taluka", label: "Taluka", width: "150px" },
    { key: "district", label: "District", width: "150px" },
    { key: "state", label: "State", width: "150px" },
    { key: "country", label: "Country", width: "150px" },
    { key: "weight", label: "Weight", width: "100px" },
    { key: "status", label: "Status", width: "120px" },
  ];

  if (showCharges) {
    cols.push(
      { key: "collectionCharges", label: "Collection Charges", width: "130px" },
      { key: "cancellationCharges", label: "Cancellation Charges", width: "140px" },
      { key: "loadingCharges", label: "Loading Charges", width: "120px" },
      { key: "otherCharges", label: "Other Charges", width: "120px" }
    );
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeCityRowId && !event.target.closest('.city-dropdown-container') && !event.target.closest('.city-input-field')) {
        setActiveCityRowId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeCityRowId]);

  useEffect(() => {
    const handleScroll = () => {
      if (activeCityRowId && inputRefs.current[activeCityRowId]) {
        const rect = inputRefs.current[activeCityRowId].getBoundingClientRect();
        setCityDropdownPosition({
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
  }, [activeCityRowId]);

  return (
    <div className="rounded-xl border border-yellow-300 overflow-x-auto">
      <table className="min-w-max w-full text-sm">
        <thead className="sticky top-0 bg-yellow-400 z-10">
          <tr>
            {cols.map((c) => (
              <th
                key={c.key}
                style={{ minWidth: c.width, width: c.width }}
                className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center"
              >
                {c.label}
                {(c.key === "plantName" || c.key === "taluka" || c.key === "district" || c.key === "state" || c.key === "country") && 
                  <span className="ml-1 text-xs text-blue-600">*Auto</span>
                }
              </th>
            ))}
            <th style={{ minWidth: "100px", width: "100px" }} className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">
              Action
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r) => {
            const isPincodeLoading = pincodeAPI.loading && pincodeInput[r._id]?.length === 6;
            const cityOptions = cityOptionsByRow[r._id] || [];
            const hasCities = cityOptions.length > 0;
            
            return (
              <tr key={r._id} className="hover:bg-yellow-50 even:bg-slate-50">
                {/* Plant Code */}
                <td className="border border-yellow-300 px-2 py-2">
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
                    placeholder="Search plant..."
                    required={true}
                    displayField="name"
                    codeField="code"
                  />
                </td>

                {/* Plant Name */}
                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    type="text"
                    value={r.plantName || ""}
                    readOnly
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-sm outline-none"
                    placeholder="Auto-filled"
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
                <td className="border border-yellow-300 px-2 py-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={r.pinCode || ""}
                      onChange={(e) => onPincodeChange(r._id, e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
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

                {/* From - Now shows Location Master data */}
                <td className="border border-yellow-300 px-2 py-2">
                  <TableSearchableDropdown
                    items={locations}
                    selectedId={r.from}
                    onSelect={(location) => handleLocationSelect(r._id, 'from', location)}
                    placeholder="Search location..."
                    displayField="name"
                    codeField="code"
                  />
                </td>

                {/* To / City */}
                <td className="border border-yellow-300 px-2 py-2">
                  <div className="relative city-dropdown-container">
                    <input
                      ref={el => inputRefs.current[r._id] = el}
                      type="text"
                      value={r.toName || ""}
                      readOnly={hasCities}
                      onChange={(e) => {
                        if (!hasCities) {
                          onChange(r._id, 'toName', e.target.value);
                          onChange(r._id, 'to', null);
                        }
                      }}
                      onClick={(e) => {
                        if (hasCities) {
                          handleCityInputClick(e, r._id);
                        }
                      }}
                      className={`city-input-field w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                        hasCities ? 'cursor-pointer bg-yellow-50 hover:bg-yellow-100' : ''
                      }`}
                      placeholder={hasCities ? "Click to select city/area" : "Enter city name"}
                    />
                    {hasCities && (
                      <div className="absolute right-2 top-2 text-gray-400 pointer-events-none">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </td>

                {/* Taluka */}
                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    type="text"
                    value={r.talukaName || r.taluka || ""}
                    readOnly
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-sm outline-none"
                    placeholder="Auto-filled"
                  />
                </td>

                {/* District */}
                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    type="text"
                    value={r.districtName || r.district || ""}
                    readOnly
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-sm outline-none"
                    placeholder="Auto-filled"
                  />
                </td>

                {/* State */}
                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    type="text"
                    value={r.stateName || r.state || ""}
                    readOnly
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-sm outline-none"
                    placeholder="Auto-filled"
                  />
                </td>

                {/* Country */}
                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    type="text"
                    value={r.countryName || r.country || ""}
                    readOnly
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-sm outline-none"
                    placeholder="Auto-filled"
                  />
                </td>

                {/* Weight */}
                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    type="number"
                    value={r.weight || ""}
                    onChange={(e) => onChange(r._id, 'weight', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    placeholder="Weight"
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

                {/* Charges Columns */}
                {showCharges && (
                  <>
                    <td className="border border-yellow-300 px-2 py-2">
                      <input
                        type="number"
                        value={r.collectionCharges || ""}
                        onChange={(e) => onChange(r._id, 'collectionCharges', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                        placeholder="Collection Charges"
                      />
                    </td>
                    <td className="border border-yellow-300 px-2 py-2">
                      <input
                        type="text"
                        value={r.cancellationCharges || ""}
                        onChange={(e) => onChange(r._id, 'cancellationCharges', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                        placeholder="Cancellation Charges"
                      />
                    </td>
                    <td className="border border-yellow-300 px-2 py-2">
                      <input
                        type="text"
                        value={r.loadingCharges || ""}
                        onChange={(e) => onChange(r._id, 'loadingCharges', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                        placeholder="Loading Charges"
                      />
                    </td>
                    <td className="border border-yellow-300 px-2 py-2">
                      <input
                        type="number"
                        value={r.otherCharges || ""}
                        onChange={(e) => onChange(r._id, 'otherCharges', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                        placeholder="Other Charges"
                      />
                    </td>
                  </>
                )}

                {/* Action */}
                <td className="border border-yellow-300 px-2 py-2 text-center">
                  <button
                    onClick={() => onRemove(r._id)}
                    className="rounded-lg bg-red-500 px-3 py-2 text-xs font-bold text-white hover:bg-red-600 transition whitespace-nowrap"
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

      {/* City Dropdown - Portal style positioning */}
      {activeCityRowId && cityOptionsByRow[activeCityRowId] && cityOptionsByRow[activeCityRowId].length > 0 && (
        <div 
          className="fixed z-[99999] bg-white border border-slate-200 rounded-lg shadow-xl overflow-y-auto"
          style={{
            position: 'fixed',
            top: `${cityDropdownPosition.top}px`,
            left: `${cityDropdownPosition.left}px`,
            width: `${cityDropdownPosition.width}px`,
            maxHeight: '300px',
            minWidth: '200px'
          }}
        >
          <div className="sticky top-0 bg-gray-50 px-3 py-2 text-xs font-semibold text-slate-600 border-b">
            Select Area/City
          </div>
          {cityOptionsByRow[activeCityRowId].map((loc, idx) => (
            <div
              key={idx}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelectCity(activeCityRowId, loc);
                setActiveCityRowId(null);
              }}
              className="px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors"
            >
              <div className="font-medium text-slate-800 text-sm">
                {loc.cityName}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {loc.districtName}, {loc.stateName}
              </div>
            </div>
          ))}
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
  required = false,
  displayField = 'name',
  codeField = 'code',
  disabled = false,
  loading = false
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const getDisplayValue = useCallback((item) => {
    if (!item) return "";
    const display = item[displayField] || "";
    const code = item[codeField] ? `(${item[codeField]})` : "";
    return `${display} ${code}`.trim();
  }, [displayField, codeField]);

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
  }, [items, selectedId, getDisplayValue]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredItems(items);
    } else {
      const filtered = items.filter(item => {
        const searchLower = query.toLowerCase();
        return (
          (item[displayField] && item[displayField].toLowerCase().includes(searchLower)) ||
          (item[codeField] && item[codeField].toLowerCase().includes(searchLower))
        );
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
    if (!showDropdown && inputRef.current) {
      setFilteredItems(items);
      
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
        if (selectedItem) {
          setSearchQuery(getDisplayValue(selectedItem));
        }
      }
    }, 200);
  };

  return (
    <>
      <div className="relative w-full">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 disabled:opacity-50"
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete="off"
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
          className="fixed z-[10000] bg-white border border-slate-200 rounded-lg shadow-xl overflow-y-auto"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
            maxHeight: '300px'
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
                <div className="font-medium text-slate-800 text-sm">
                  {item[displayField]}
                </div>
                {item[codeField] && (
                  <div className="text-xs text-slate-500 mt-0.5">
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
    </>
  );
}

/** ===== Pack Type Table Component ===== */
function PackTypeTable({ 
  packType, 
  rows, 
  onChange, 
  onRemove, 
  onDuplicate, 
  pkgTypes = [], 
  uoms = [], 
  skuSizes = [], 
  items = [],
  onNavigateToCreate, 
  onNavigateToCreateUOM, 
  onNavigateToCreateSKUSize,
  onNavigateToCreateItem
}) {
  
  const [showItemDropdown, setShowItemDropdown] = useState({});
  const [itemSearchQuery, setItemSearchQuery] = useState({});
  const [filteredItems, setFilteredItems] = useState({});
  const [itemDropdownPosition, setItemDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const itemInputRefs = useRef({});
  const itemDropdownRef = useRef({});

  const cols = useMemo(() => {
    if (packType === "PALLETIZATION") {
      return [
        { key: "noOfPallets", label: "NO OF PALLETS", type: "number", options: null },
        { key: "unitPerPallets", label: "UNIT PER PALLETS", type: "number", options: null },
        { key: "totalPkgs", label: "TOTAL PKGS", type: "number", options: null, readOnly: true },
        { key: "pkgsType", label: "PKG TYPE", type: "select", options: pkgTypes, isDynamic: true },
        { key: "uom", label: "UOM", type: "select", options: uoms, isUOM: true },
        { key: "skuSize", label: "SKU - SIZE", type: "select", options: skuSizes, isSKUSize: true },
        { key: "packWeight", label: "PACK - WEIGHT", type: "number", options: null },
        { key: "productName", label: "PRODUCT NAME", type: "select", options: items, isItem: true },
        { key: "wtLtr", label: "WT (LTR)", type: "number", options: null, readOnly: true },
        { key: "actualWt", label: "ACTUAL - WT", type: "number", options: null, readOnly: true },
        { key: "chargedWt", label: "CHARGED - WT", type: "number", options: null },
        { key: "wtUom", label: "WT UOM", type: "text", options: null, readOnly: true, defaultValue: "MT" },
      ];
    }

    if (packType === "UNIFORM - BAGS/BOXES") {
      return [
        { key: "totalPkgs", label: "TOTAL PKGS", type: "number", options: null },
        { key: "pkgsType", label: "PKG TYPE", type: "select", options: pkgTypes, isDynamic: true },
        { key: "uom", label: "UOM", type: "select", options: uoms, isUOM: true },
        { key: "skuSize", label: "SKU - SIZE", type: "select", options: skuSizes, isSKUSize: true },
        { key: "packWeight", label: "PACK - WEIGHT", type: "number", options: null },
        { key: "productName", label: "PRODUCT NAME", type: "select", options: items, isItem: true },
        { key: "wtLtr", label: "WT (LTR)", type: "number", options: null, readOnly: true },
        { key: "actualWt", label: "ACTUAL - WT", type: "number", options: null, readOnly: true },
        { key: "chargedWt", label: "CHARGED - WT", type: "number", options: null },
        { key: "wtUom", label: "WT UOM", type: "text", options: null, readOnly: true, defaultValue: "MT" },
      ];
    }

    if (packType === "LOOSE - CARGO") {
      return [
        { key: "uom", label: "UOM", type: "select", options: uoms, isUOM: true },
        { key: "productName", label: "PRODUCT NAME", type: "select", options: items, isItem: true },
        { key: "actualWt", label: "ACTUAL - WT", type: "number", options: null },
        { key: "chargedWt", label: "CHARGED - WT", type: "number", options: null },
      ];
    }

    // NON-UNIFORM - GENERAL CARGO
    return [
      { key: "nos", label: "NOS", type: "number", options: null },
      { key: "productName", label: "PRODUCT NAME", type: "select", options: items, isItem: true },
      { key: "uom", label: "UOM", type: "select", options: uoms, isUOM: true },
      { key: "length", label: "LENGTH", type: "number", options: null },
      { key: "width", label: "WIDTH", type: "number", options: null },
      { key: "height", label: "HEIGHT", type: "number", options: null },
      { key: "actualWt", label: "ACTUAL - WT", type: "number", options: null },
      { key: "chargedWt", label: "CHARGED - WT", type: "number", options: null },
    ];
  }, [packType, pkgTypes, uoms, skuSizes, items]);

  const handleChange = (rowId, key, value) => {
    onChange(rowId, key, value);
  };

  const handleItemSearch = (rowId, query) => {
    setItemSearchQuery(prev => ({ ...prev, [rowId]: query }));
    
    if (!query.trim()) {
      setFilteredItems(prev => ({ ...prev, [rowId]: items }));
    } else {
      const filtered = items.filter(item =>
        item.itemName.toLowerCase().includes(query.toLowerCase()) ||
        (item.itemCode && item.itemCode.toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredItems(prev => ({ ...prev, [rowId]: filtered }));
    }
  };

  const handleSelectItem = (rowId, item) => {
    onChange(rowId, 'productName', item.itemName);
    setItemSearchQuery(prev => ({ ...prev, [rowId]: item.itemName }));
    setShowItemDropdown(prev => ({ ...prev, [rowId]: false }));
  };

  const handleItemInputFocus = (rowId, event) => {
    if (!showItemDropdown[rowId]) {
      setFilteredItems(prev => ({ ...prev, [rowId]: items }));
      
      const rect = event.target.getBoundingClientRect();
      setItemDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
      
      setShowItemDropdown(prev => ({ ...prev, [rowId]: true }));
    }
  };

  const handleItemInputBlur = (rowId) => {
    setTimeout(() => {
      if (itemDropdownRef.current[rowId] && !itemDropdownRef.current[rowId].contains(document.activeElement)) {
        setShowItemDropdown(prev => ({ ...prev, [rowId]: false }));
      }
    }, 200);
  };

  useEffect(() => {
    const handleScroll = () => {
      Object.keys(showItemDropdown).forEach(rowId => {
        if (showItemDropdown[rowId] && itemInputRefs.current[rowId]) {
          const rect = itemInputRefs.current[rowId].getBoundingClientRect();
          setItemDropdownPosition({
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width
          });
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [showItemDropdown]);

  useEffect(() => {
    rows.forEach(row => {
      if (!filteredItems[row._id]) {
        setFilteredItems(prev => ({ ...prev, [row._id]: items }));
      }
      if (row.productName && !itemSearchQuery[row._id]) {
        setItemSearchQuery(prev => ({ ...prev, [row._id]: row.productName }));
      }
    });
  }, [items, rows]);

  return (
    <div className="overflow-auto rounded-xl border border-yellow-300">
      <table className="min-w-max w-full text-sm">
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
          {rows.length > 0 ? (
            rows.map((r) => (
              <tr key={r._id} className="hover:bg-yellow-50 even:bg-slate-50">
                {cols.map((c) => {
                  if (c.key === "wtUom") {
                    return (
                      <td key={c.key} className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value="MT"
                          readOnly
                          className="w-full rounded-lg border border-slate-200 bg-slate-100 px-2 py-1.5 text-sm text-slate-700 font-medium"
                        />
                      </td>
                    );
                  }
                  
                  return (
                    <td key={c.key} className="border border-yellow-300 px-2 py-2">
                      {c.isDynamic ? (
                        <div className="flex gap-2 items-center">
                          <select
                            value={r[c.key] || ""}
                            onChange={(e) => handleChange(r._id, c.key, e.target.value)}
                            className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                          >
                            <option value="">Select {c.label}</option>
                            {c.options.map((opt) => (
                              <option key={opt._id} value={opt.name}>
                                {opt.name}
                              </option>
                            ))}
                          </select>
                         
                        </div>
                      ) : c.isUOM ? (
                        <div className="flex gap-2 items-center">
                          <select
                            value={r[c.key] || "MT"}
                            onChange={(e) => handleChange(r._id, c.key, e.target.value)}
                            className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                          >
                            {c.options.length > 0 ? (
                              c.options.map((opt) => (
                                <option key={opt._id} value={opt.name}>
                                  {opt.name}
                                </option>
                              ))
                            ) : (
                              <option value="MT">MT</option>
                            )}
                          </select>
                          
                        </div>
                      ) : c.isSKUSize ? (
                        <div className="flex gap-2 items-center">
                          <select
                            value={r[c.key] || ""}
                            onChange={(e) => handleChange(r._id, c.key, e.target.value)}
                            className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                          >
                            <option value="">Select {c.label}</option>
                            {c.options.map((opt) => (
                              <option key={opt._id} value={opt.display}>
                                {opt.display}
                              </option>
                            ))}
                          </select>
                         
                        </div>
                      ) : c.isItem ? (
                        <div className="relative w-full">
                          <div className="flex gap-2 items-center">
                            <div className="flex-1 relative">
                              <input
                                ref={el => itemInputRefs.current[r._id] = el}
                                type="text"
                                value={itemSearchQuery[r._id] || r[c.key] || ""}
                                onChange={(e) => handleItemSearch(r._id, e.target.value)}
                                onFocus={(e) => handleItemInputFocus(r._id, e)}
                                onBlur={() => handleItemInputBlur(r._id)}
                                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                                placeholder={`Search ${c.label}...`}
                                autoComplete="off"
                              />
                              {showItemDropdown[r._id] && (
                                <div 
                                  ref={el => itemDropdownRef.current[r._id] = el}
                                  className="fixed z-[10000] bg-white border border-slate-200 rounded-lg shadow-xl overflow-y-auto"
                                  style={{
                                    top: `${itemDropdownPosition.top}px`,
                                    left: `${itemDropdownPosition.left}px`,
                                    width: `${itemDropdownPosition.width}px`,
                                    maxHeight: '300px'
                                  }}
                                >
                                  <div className="sticky top-0 bg-gray-50 px-3 py-2 text-xs font-semibold text-slate-600 border-b">
                                    Select Product
                                  </div>
                                  {(filteredItems[r._id] || items).length > 0 ? (
                                    (filteredItems[r._id] || items).map((item) => (
                                      <div
                                        key={item._id}
                                        onMouseDown={(e) => {
                                          e.preventDefault();
                                          handleSelectItem(r._id, item);
                                        }}
                                        className="px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors"
                                      >
                                        <div className="font-medium text-slate-800 text-sm">
                                          {item.itemName}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-0.5">
                                          Code: {item.itemCode} | Price: ₹{item.unitPrice}
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="p-3 text-center text-sm text-slate-500">
                                      No items found
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                           
                          </div>
                        </div>
                      ) : c.options && !c.isDynamic && !c.isUOM && !c.isSKUSize && !c.isItem ? (
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
                  );
                })}
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
                colSpan={cols.length + 1}
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