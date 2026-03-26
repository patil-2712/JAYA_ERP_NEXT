"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
const ADVANCE_STATUS_OPTIONS = ["Pending", "Approved", "Rejected", "Paid", "Completed"];

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
function usePurchasePanel() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/purchase-panel?format=table', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        console.warn('Purchase API returned', res.status);
        setPurchases([]);
        return;
      }
      
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        // Filter purchases that have pending advance payment
        const availablePurchases = data.data.filter(p => 
          p.status !== 'Completed' && p.status !== 'Paid'
        );
        setPurchases(availablePurchases);
        console.log(`📊 Found ${availablePurchases.length} available purchases`);
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPurchaseByNo = async (purchaseNo) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/purchase-panel?purchaseNo=${encodeURIComponent(purchaseNo)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        console.error(`API returned ${res.status}`);
        return null;
      }
      
      const data = await res.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Error fetching purchase:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount
  useEffect(() => {
    fetchPurchases();
  }, []);

  return { purchases, loading, fetchPurchases, getPurchaseByNo };
}

function useVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log("🔍 Fetching vendors with bank details...");
      
      const res = await fetch('/api/suppliers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = await res.json();
      console.log("📦 Raw vendor data from API:", data);
      
      if (data.success && Array.isArray(data.data)) {
        // Map supplier data to include ALL fields
        const mappedVendors = data.data.map(supplier => {
          return {
            _id: supplier._id,
            supplierName: supplier.supplierName,
            supplierCode: supplier.supplierCode,
            supplierStatus: supplier.supplierStatus || "Active",
            // Bank details - using correct field names
            bankName: supplier.bankName || '',
            bankAccountNumber: supplier.bankAccountNumber || '',
            ifscCode: supplier.ifscCode || '',
            // Payment terms
            paymentTerms: supplier.paymentTerms || "10",
            // Keep these for backward compatibility
            accountNo: supplier.bankAccountNumber || '',
            ifsc: supplier.ifscCode || '',
            // GL Account
            glAccount: supplier.glAccount,
            // Add display name for dropdown
            displayName: `${supplier.supplierName} (${supplier.supplierCode})`
          };
        });
        
        setVendors(mappedVendors);
        console.log("✅ Mapped vendors with bank details:", mappedVendors);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch vendor by code
  const fetchVendorByCode = async (vendorCode) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log(`🔍 Fetching vendor by code: ${vendorCode}`);
      
      if (!vendorCode) {
        console.log("❌ No vendor code provided");
        return null;
      }
      
      const res = await fetch(`/api/suppliers/by-code/${encodeURIComponent(vendorCode)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log(`📡 Response status: ${res.status}`);
      
      if (!res.ok) {
        console.log(`❌ API returned ${res.status}`);
        return null;
      }
      
      const data = await res.json();
      console.log("📦 Vendor by code data:", data);
      
      if (data.success && data.data) {
        const supplier = data.data;
        return {
          _id: supplier._id,
          supplierName: supplier.supplierName,
          supplierCode: supplier.supplierCode,
          supplierStatus: supplier.supplierStatus || "Active",
          bankName: supplier.bankName || '',
          bankAccountNumber: supplier.bankAccountNumber || '',
          ifscCode: supplier.ifscCode || '',
          paymentTerms: supplier.paymentTerms || "10",
          accountNo: supplier.bankAccountNumber || '',
          ifsc: supplier.ifscCode || '',
          glAccount: supplier.glAccount,
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching vendor by code:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount
  useEffect(() => {
    fetchVendors();
  }, []);

  return { vendors, loading, fetchVendors, fetchVendorByCode };
}

/* =========================
  PURCHASE DROPDOWN COMPONENT
========================= */
function PurchaseDropdown({ 
  onSelect,
  placeholder = "Search purchase..."
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [purchaseList, setPurchaseList] = useState([]);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const purchaseHook = usePurchasePanel();

  useEffect(() => {
    setPurchaseList(purchaseHook.purchases);
  }, [purchaseHook.purchases]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!showDropdown) {
      setShowDropdown(true);
    }
  };

  const handleSelectPurchase = async (purchase) => {
    setSearchQuery(purchase.purchaseNo);
    setShowDropdown(false);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/purchase-panel?purchaseNo=${encodeURIComponent(purchase.purchaseNo)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          onSelect(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching purchase details:', error);
    }
  };

  const handleInputFocus = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
    
    setShowDropdown(true);
    if (purchaseList.length === 0 && purchaseHook.purchases.length === 0) {
      purchaseHook.fetchPurchases();
    }
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

  // Filter based on search
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return purchaseList;
    return purchaseList.filter(p =>
      p.purchaseNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.vendorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.vehicleNo?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [purchaseList, searchQuery]);

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
        placeholder={placeholder}
        autoComplete="off"
      />
      
      {showDropdown && (
        <div 
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            zIndex: 9999,
            maxHeight: '400px'
          }}
          className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-y-auto"
        >
          {purchaseHook.loading ? (
            <div className="p-4 text-center text-sm text-slate-500">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500 mx-auto mb-2"></div>
              Loading purchases...
            </div>
          ) : filteredList.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filteredList.map((p) => (
                <div
                  key={p._id}
                  onMouseDown={() => handleSelectPurchase(p)}
                  className="p-3 hover:bg-emerald-50 cursor-pointer"
                >
                  <div className="font-medium text-slate-800">{p.purchaseNo}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    Vendor: {p.vendorName || 'N/A'} | Vehicle: {p.vehicleNo || 'N/A'} | Amount: ₹{num(p.amount).toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Balance: ₹{num(p.balance).toLocaleString()} | Status: {p.status || 'Pending'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-slate-500">
              {searchQuery.trim() ? 
                `No purchases found for "${searchQuery}"` : 
                "No purchases available"
              }
            </div>
          )}
        </div>
      )}
    </div>
  );
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
    locationRate: "",
    priceList: "",
    weight: "",
    rate: "",
    totalAmount: "",
  };
}

function defaultAdditionItem() {
  return {
    _id: uid(),
    description: "Loading Charges",
    amount: "0",
  };
}

function defaultDeductionItem() {
  return {
    _id: uid(),
    description: "Detention Charges",
    amount: "0",
  };
}

export default function CreateAdvancePayment() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const purchaseNoFromUrl = searchParams.get('purchaseNo');

  /** =========================
   * CUSTOM HOOKS
   ========================= */
  const purchaseHook = usePurchasePanel();
  const vendorHook = useVendors();

  /** =========================
   * STATE FOR API DATA
   ========================= */
  const [branches, setBranches] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [apiError, setApiError] = useState(null);

  /** =========================
   * PURCHASE NO SEARCH STATE
   ========================= */
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [purchaseData, setPurchaseData] = useState(null);

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
    delivery: "Normal",
  });

  /** =========================
   * BILLING CHARGES STATE
   ========================= */
  const [billing, setBilling] = useState({
    billingType: "Multi - Order",
    noOfLoadingPoints: "1",
    noOfDroppingPoint: "1",
    collectionCharges: "0",
    cancellationCharges: "Nil",
    loadingCharges: "Nil",
    otherCharges: "0",
  });

  /** =========================
   * ORDERS TABLE STATE
   ========================= */
  const [orderRows, setOrderRows] = useState([defaultOrderRow()]);

  /** =========================
   * VENDOR DETAILS STATE - Updated field names to match model
   ========================= */
  const [vendorDetails, setVendorDetails] = useState({
    vendorStatus: "Active",
    vendorCode: "",
    vendorName: "",
    vehicleNo: "",
    purchaseType: "Loading & Unloading",
    rate: "",
    weight: "",
    amount: "",
    rateType: "Per MT",
    paymentTerms: "80 % Advance",
    advance: "",
    // Bank fields matching the model
    bankAccountNumber: "",
    bankName: "",
    ifscCode: "",
    transactionId: "",
  });

  /** =========================
   * ADDITION & DEDUCTION STATE
   ========================= */
  const [additions, setAdditions] = useState({
    totalAddition: "0",
    items: []
  });

  const [deductions, setDeductions] = useState({
    totalDeduction: "0",
    items: []
  });

  /** =========================
   * PAYMENT DETAILS - Updated to use correct field names
   ========================= */
  const [paymentDetails, setPaymentDetails] = useState({
    vendorNameDebit: "",
    accountNoCredit: "",
    finalAmount: "",
    remarks: "ADV Payment",
    transactionId: "",
    bankVendorCode: "",
    paymentDate: new Date().toISOString().split('T')[0],
    paymentStatus: "Pending"
  });

  /** =========================
   * BILLING COLUMNS FOR TABLE
   ========================= */
  const billingColumns = [
    { key: "billingType", label: "Billing Type", options: BILLING_TYPES },
    { key: "noOfLoadingPoints", label: "No. of Loading Points", type: "number" },
    { key: "noOfDroppingPoint", label: "No. of Droping Point", type: "number" },
    { key: "collectionCharges", label: "Collection Charges", type: "number" },
    { key: "cancellationCharges", label: "Cancellation Charges", type: "text" },
    { key: "loadingCharges", label: "Loading Charges", type: "text" },
    { key: "otherCharges", label: "Other Charges", type: "number" },
  ];

  /** =========================
   * DEBUG EFFECTS
   ========================= */
  useEffect(() => {
    console.log("Current vendorDetails:", vendorDetails);
  }, [vendorDetails]);

  useEffect(() => {
    console.log("Current vendors list:", vendors);
  }, [vendors]);

  useEffect(() => {
    console.log("💰 paymentDetails updated:", paymentDetails);
  }, [paymentDetails]);

  /** =========================
   * LOAD PURCHASE DATA IF PURCHASE NO IN URL
   ========================= */
  useEffect(() => {
    if (purchaseNoFromUrl) {
      loadPurchaseByNo(purchaseNoFromUrl);
    }
    fetchData();
  }, [purchaseNoFromUrl]);

  /** =========================
   * AUTO-FETCH VENDOR WHEN PURCHASE DATA HAS VENDOR CODE
   ========================= */
  useEffect(() => {
    const autoFetchVendorFromPurchase = async () => {
      console.log("🔍 Checking purchaseData for vendor code:", purchaseData);
      
      if (!purchaseData) {
        console.log("❌ No purchase data available");
        return;
      }

      // Try different possible paths to find vendor code
      const possibleVendorCode = 
        purchaseData.purchaseDetails?.vendorCode || 
        purchaseData.purchaseDetails?.supplierCode ||
        purchaseData.vendorDetails?.vendorCode ||
        purchaseData.vendorDetails?.supplierCode ||
        purchaseData.vendor?.code ||
        purchaseData.vendorCode ||
        purchaseData.supplierCode;
      
      console.log("🔍 Found possible vendor code:", possibleVendorCode);
      
      if (possibleVendorCode) {
        console.log(`🔍 Auto-fetching vendor with code: ${possibleVendorCode}`);
        
        const vendor = await vendorHook.fetchVendorByCode(possibleVendorCode);
        if (vendor) {
          console.log("✅ Auto-fetched vendor:", vendor);
          handleVendorSelect(vendor);
        } else {
          console.log("❌ No vendor found with code:", possibleVendorCode);
        }
      } else {
        console.log("❌ No vendor code found in purchase data");
      }
    };

    autoFetchVendorFromPurchase();
  }, [purchaseData]);

  const loadPurchaseByNo = async (purchaseNo) => {
    setFetchingData(true);
    try {
      const data = await purchaseHook.getPurchaseByNo(purchaseNo);
      if (data) {
        handlePurchaseSelect(data);
      }
    } catch (error) {
      console.error('Error loading purchase:', error);
    } finally {
      setFetchingData(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        vendorHook.fetchVendors(),
        fetchBranches()
      ]);
      
      // Update vendors from hook
      setVendors(vendorHook.vendors);
    } catch (error) {
      console.error('Error fetching data:', error);
      setApiError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const res = await fetch('/api/branches', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setBranches(data.data);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  /** =========================
   * HANDLE PURCHASE SELECT
   ========================= */
  const handlePurchaseSelect = (purchaseData) => {
    setSelectedPurchase(purchaseData);
    setPurchaseData(purchaseData);

    console.log("📦 Purchase Data loaded:", purchaseData);
    console.log("📦 Purchase Details:", purchaseData.purchaseDetails);
    console.log("📦 Vendor Code from purchase:", purchaseData.purchaseDetails?.vendorCode);

    // ===== AUTO-FILL HEADER =====
    setHeader({
      purchaseNo: purchaseData.purchaseNo || purchaseData.header?.purchaseNo || "",
      pricingSerialNo: purchaseData.pricingSerialNo || purchaseData.header?.pricingSerialNo || "",
      branch: purchaseData.header?.branch || purchaseData.branch || "",
      branchName: purchaseData.header?.branchName || purchaseData.branchName || "",
      branchCode: purchaseData.header?.branchCode || purchaseData.branchCode || "",
      date: purchaseData.header?.date ? new Date(purchaseData.header.date).toISOString().split('T')[0] : 
            purchaseData.date ? new Date(purchaseData.date).toISOString().split('T')[0] : header.date,
      delivery: purchaseData.header?.delivery || purchaseData.delivery || "Normal",
    });

    // ===== AUTO-FILL BILLING =====
    setBilling({
      billingType: purchaseData.billing?.billingType || purchaseData.billingType || "Multi - Order",
      noOfLoadingPoints: purchaseData.billing?.noOfLoadingPoints?.toString() || purchaseData.loadingPoints?.toString() || "1",
      noOfDroppingPoint: purchaseData.billing?.noOfDroppingPoint?.toString() || purchaseData.dropPoints?.toString() || "1",
      collectionCharges: purchaseData.billing?.collectionCharges?.toString() || purchaseData.collectionCharges?.toString() || "0",
      cancellationCharges: purchaseData.billing?.cancellationCharges || purchaseData.cancellationCharges || "Nil",
      loadingCharges: purchaseData.billing?.loadingCharges || purchaseData.loadingCharges || "Nil",
      otherCharges: purchaseData.billing?.otherCharges?.toString() || purchaseData.otherCharges?.toString() || "0",
    });

    // ===== AUTO-FILL ORDER ROWS =====
    if (purchaseData.orderRows && purchaseData.orderRows.length > 0) {
      const newOrderRows = purchaseData.orderRows.map(row => ({
        _id: uid(),
        orderNo: row.orderNo || "",
        partyName: row.partyName || "",
        plantCode: row.plantCode || "",
        plantName: row.plantName || "",
        orderType: row.orderType || "",
        pinCode: row.pinCode || "",
        state: row.state || "",
        district: row.district || "",
        from: row.from || "",
        to: row.to || "",
        locationRate: row.locationRate?.toString() || "",
        priceList: row.priceList || "",
        weight: row.weight?.toString() || "",
        rate: row.rate?.toString() || "",
        totalAmount: row.totalAmount?.toString() || "",
      }));
      setOrderRows(newOrderRows);
    } else {
      setOrderRows([defaultOrderRow()]);
    }

    // ===== AUTO-FILL VENDOR DETAILS =====
    if (purchaseData.purchaseDetails) {
      const pd = purchaseData.purchaseDetails;
      console.log("📝 Setting vendor details from purchase:", pd);
      
      // Store the vendor code - try multiple possible field names
      const vendorCode = pd.vendorCode || pd.supplierCode || "";
      
      setVendorDetails(prev => ({
        ...prev,
        vendorStatus: pd.vendorStatus || "Active",
        vendorCode: vendorCode,
        vendorName: pd.vendorName || pd.supplierName || "",
        vehicleNo: pd.vehicleNo || "",
        purchaseType: pd.purchaseType || "Loading & Unloading",
        rate: pd.rate?.toString() || "",
        weight: pd.weight?.toString() || "",
        amount: pd.amount?.toString() || "",
        rateType: pd.rateType || "Per MT",
        paymentTerms: pd.paymentTerms || "80 % Advance",
        advance: pd.advance?.toString() || "",
      }));

      // Calculate amount if not present
      if (!pd.amount && pd.rate && pd.weight) {
        const amount = num(pd.rate) * num(pd.weight);
        setVendorDetails(prev => ({
          ...prev,
          amount: amount.toString()
        }));
      }

      // Auto-fill payment details
      setPaymentDetails(prev => ({
        ...prev,
        vendorNameDebit: pd.vendorName || pd.supplierName || "",
        finalAmount: pd.advance?.toString() || "",
        bankVendorCode: vendorCode,
      }));
    }

    // ===== AUTO-FILL ADDITIONS FROM PURCHASE =====
    if (purchaseData.additions && purchaseData.additions.length > 0) {
      const totalAdd = purchaseData.additions.reduce((sum, item) => sum + num(item.amount), 0);
      setAdditions({
        totalAddition: totalAdd.toString(),
        items: purchaseData.additions.map(item => ({
          _id: uid(),
          description: item.description || "Addition",
          amount: item.amount?.toString() || "0"
        }))
      });
    }

    // ===== AUTO-FILL DEDUCTIONS FROM PURCHASE =====
    if (purchaseData.deductions && purchaseData.deductions.length > 0) {
      const totalDed = purchaseData.deductions.reduce((sum, item) => sum + num(item.amount), 0);
      setDeductions({
        totalDeduction: totalDed.toString(),
        items: purchaseData.deductions.map(item => ({
          _id: uid(),
          description: item.description || "Deduction",
          amount: item.amount?.toString() || "0"
        }))
      });
    }
  };

  /** =========================
   * HANDLE VENDOR SELECT - FIXED VERSION
   ========================= */
  const handleVendorSelect = (vendor) => {
    console.log("🟢 handleVendorSelect CALLED with vendor:", vendor);
    
    if (!vendor) {
      console.log("❌ Vendor is null or undefined");
      return;
    }
    
    console.log("🟢 Vendor ID:", vendor._id);
    console.log("🟢 Vendor Name:", vendor.supplierName);
    console.log("🟢 Bank Account Number from vendor:", vendor.bankAccountNumber);
    console.log("🟢 Bank Name from vendor:", vendor.bankName);
    console.log("🟢 IFSC Code from vendor:", vendor.ifscCode);
    
    // Extract bank details using correct field names from the model
    const bankAccountNumber = vendor.bankAccountNumber || vendor.accountNo || '';
    const bankName = vendor.bankName || '';
    const ifscCode = vendor.ifscCode || vendor.ifsc || '';
    
    console.log("✅ Extracted bank details:", {
      bankAccountNumber,
      bankName,
      ifscCode
    });
    
    // Update vendor details with bank info
    setVendorDetails(prev => {
      console.log("📝 Previous vendorDetails state:", prev);
      
      const newState = {
        ...prev,
        vendorName: vendor.supplierName || "",
        vendorCode: vendor.supplierCode || "",
        vendorStatus: vendor.supplierStatus || "Active",
        bankAccountNumber: bankAccountNumber,
        bankName: bankName,
        ifscCode: ifscCode,
      };
      
      console.log("📝 New vendorDetails state:", newState);
      return newState;
    });
    
    // Update payment details with bank info - THIS SETS THE VENDOR NAME IN PAYMENT SECTION
    setPaymentDetails(prev => {
      console.log("💰 Previous paymentDetails state:", prev);
      
      const newState = {
        ...prev,
        vendorNameDebit: vendor.supplierName || "",
        accountNoCredit: bankAccountNumber,
        bankVendorCode: vendor.supplierCode || "",
      };
      
      console.log("💰 New paymentDetails state:", newState);
      return newState;
    });
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
          
          // Auto-calculate Total Amount = Weight * Rate
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
  };

  const removeOrderRow = (rowId) => {
    if (orderRows.length > 1) {
      setOrderRows((prev) => prev.filter((r) => r._id !== rowId));
    } else {
      alert("At least one order row is required");
    }
  };

  const duplicateOrderRow = (rowId) => {
    const row = orderRows.find((r) => r._id === rowId);
    if (!row) return;
    setOrderRows([...orderRows, { ...row, _id: uid(), orderNo: "" }]);
  };

  /** =========================
   * ADDITION FUNCTIONS
   ========================= */
  const addAdditionItem = () => {
    setAdditions({
      ...additions,
      items: [...additions.items, defaultAdditionItem()]
    });
  };

  const updateAdditionItem = (itemId, key, value) => {
    const updatedItems = additions.items.map(item => 
      item._id === itemId ? { ...item, [key]: value } : item
    );
    
    const totalAddition = updatedItems.reduce((sum, item) => sum + num(item.amount), 0);
    
    setAdditions({
      totalAddition: totalAddition.toString(),
      items: updatedItems
    });
  };

  const removeAdditionItem = (itemId) => {
    if (additions.items.length > 1) {
      const updatedItems = additions.items.filter(item => item._id !== itemId);
      const totalAddition = updatedItems.reduce((sum, item) => sum + num(item.amount), 0);
      
      setAdditions({
        totalAddition: totalAddition.toString(),
        items: updatedItems
      });
    } else {
      alert("At least one addition item is required");
    }
  };

  /** =========================
   * DEDUCTION FUNCTIONS
   ========================= */
  const addDeductionItem = () => {
    setDeductions({
      ...deductions,
      items: [...deductions.items, defaultDeductionItem()]
    });
  };

  const updateDeductionItem = (itemId, key, value) => {
    const updatedItems = deductions.items.map(item => 
      item._id === itemId ? { ...item, [key]: value } : item
    );
    
    const totalDeduction = updatedItems.reduce((sum, item) => sum + num(item.amount), 0);
    
    setDeductions({
      totalDeduction: totalDeduction.toString(),
      items: updatedItems
    });
  };

  const removeDeductionItem = (itemId) => {
    if (deductions.items.length > 1) {
      const updatedItems = deductions.items.filter(item => item._id !== itemId);
      const totalDeduction = updatedItems.reduce((sum, item) => sum + num(item.amount), 0);
      
      setDeductions({
        totalDeduction: totalDeduction.toString(),
        items: updatedItems
      });
    } else {
      alert("At least one deduction item is required");
    }
  };

  /** =========================
   * BILLING TYPE CHANGE HANDLER
   ========================= */
  const handleBillingTypeChange = (value) => {
    setBilling((prev) => ({ ...prev, billingType: value }));
  };

  /** =========================
   * CALCULATE BALANCE
   ========================= */
  const calculateBalance = () => {
    const amount = num(vendorDetails.amount);
    const advance = num(vendorDetails.advance);
    const totalAdditions = num(additions.totalAddition);
    const totalDeductions = num(deductions.totalDeduction);
    return (amount - advance - totalDeductions + totalAdditions).toFixed(2);
  };

  /** =========================
   * CALCULATE TOTAL ORDER AMOUNT
   ========================= */
  const calculateTotalOrderAmount = () => {
    return orderRows.reduce((sum, row) => sum + num(row.totalAmount), 0);
  };

  /** =========================
   * HANDLE GENERATE QUEUE (for demo)
   ========================= */
  const handleGenerateQueue = () => {
    const finalAmount = num(paymentDetails.finalAmount || vendorDetails.advance);
    alert(`✅ Payment queue ready to generate for ${paymentDetails.vendorNameDebit}\nAmount: ₹${finalAmount.toLocaleString()}`);
  };

  /** =========================
   * HANDLE SAVE
   ========================= */
  const handleSave = async () => {
    if (!header.branch) {
      alert("Please select a branch");
      return;
    }

    if (!vendorDetails.vendorName) {
      alert("Please select a vendor");
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      
      const payload = {
        purchaseNo: header.purchaseNo,
        pricingSerialNo: header.pricingSerialNo,
        header,
        billing,
        orderRows,
        vendorDetails: {
          ...vendorDetails,
          rate: num(vendorDetails.rate),
          weight: num(vendorDetails.weight),
          amount: num(vendorDetails.amount),
          advance: num(vendorDetails.advance),
        },
        additions: {
          totalAddition: num(additions.totalAddition),
          items: additions.items.map(item => ({
            description: item.description,
            amount: num(item.amount)
          }))
        },
        deductions: {
          totalDeduction: num(deductions.totalDeduction),
          items: deductions.items.map(item => ({
            description: item.description,
            amount: num(item.amount)
          }))
        },
        paymentDetails: {
          ...paymentDetails,
          finalAmount: num(paymentDetails.finalAmount || vendorDetails.advance),
        },
        balance: calculateBalance(),
        totalOrderAmount: calculateTotalOrderAmount(),
        purchaseDataId: purchaseData?._id,
      };

      console.log("Saving advance payment:", payload);

      // If no token, just show success with mock data
      if (!token) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert(`✅ Advance Payment saved successfully (Demo Mode)!\nPurchase No: ${header.purchaseNo}`);
        router.push('/admin/Advance-Payment');
        return;
      }

      const res = await fetch('/api/Advance-Payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: `HTTP error! status: ${res.status}` }));
        throw new Error(errorData.message || 'Failed to save advance payment');
      }

      const data = await res.json();
      alert(`✅ Advance Payment saved successfully!\nPayment No: ${data.data?.paymentNo || 'Generated'}`);
      
      router.push('/admin/Advance-Payment');
      
    } catch (error) {
      console.error('Error saving advance payment:', error);
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
      delivery: "Normal",
    });
    
    setBilling({
      billingType: "Multi - Order",
      noOfLoadingPoints: "1",
      noOfDroppingPoint: "1",
      collectionCharges: "0",
      cancellationCharges: "Nil",
      loadingCharges: "Nil",
      otherCharges: "0",
    });
    
    setOrderRows([defaultOrderRow()]);
    
    setVendorDetails({
      vendorStatus: "Active",
      vendorCode: "",
      vendorName: "",
      vehicleNo: "",
      purchaseType: "Loading & Unloading",
      rate: "",
      weight: "",
      amount: "",
      rateType: "Per MT",
      paymentTerms: "80 % Advance",
      advance: "",
      bankAccountNumber: "",
      bankName: "",
      ifscCode: "",
      transactionId: "",
    });
    
    setAdditions({
      totalAddition: "0",
      items: []
    });
    
    setDeductions({
      totalDeduction: "0",
      items: []
    });
    
    setPaymentDetails({
      vendorNameDebit: "",
      accountNoCredit: "",
      finalAmount: "",
      remarks: "ADV Payment",
      transactionId: "",
      bankVendorCode: "",
      paymentDate: new Date().toISOString().split('T')[0],
      paymentStatus: "Pending"
    });
    
    setSelectedPurchase(null);
    setPurchaseData(null);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /** =========================
   * RENDER
   ========================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* ===== Sticky Top Bar ===== */}
      <div className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-full px-4 py-3 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/admin/Advance-Payment')}
                className="text-emerald-600 hover:text-emerald-800 font-medium text-sm flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to List
              </button>
              <div className="text-lg font-extrabold text-slate-900">
                Create Advance Payment
              </div>
            </div>
            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
              <span>Purchase No: {header.purchaseNo || "Not selected"}</span>
              {header.pricingSerialNo && (
                <>
                  <span>|</span>
                  <span className="text-purple-600">PSN: {header.pricingSerialNo}</span>
                </>
              )}
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
              onClick={resetForm}
              className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Reset
            </button>
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
              ) : 'Save Payment'}
            </button>
          </div>
        </div>
      </div>

      {/* ===== Main Content ===== */}
      <div className="mx-auto max-w-full p-4">
        {/* ===== Purchase Search Dropdown ===== */}
        <div className="mb-4">
          <Card title="Load from Purchase Panel">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-4">
                <label className="text-xs font-bold text-slate-600">Search Purchase No</label>
                <PurchaseDropdown
                  onSelect={handlePurchaseSelect}
                  placeholder="Search by Purchase No, Vendor or Vehicle..."
                />
                <p className="text-xs text-slate-400 mt-1">Select a purchase to auto-fill all data</p>
              </div>

              {purchaseData && (
                <div className="col-span-12 md:col-span-8">
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs font-bold text-slate-600">Loaded Purchase:</span>
                        <span className="ml-2 text-sm font-bold text-green-800">{purchaseData.purchaseNo}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-600">Vendor:</span>
                        <span className="ml-2 text-sm text-slate-700">{purchaseData.purchaseDetails?.vendorName || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-600">Total Amount:</span>
                        <span className="ml-2 text-sm font-bold text-emerald-700">₹{num(purchaseData.purchaseDetails?.amount).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-600">Advance:</span>
                        <span className="ml-2 text-sm font-bold text-blue-700">₹{num(purchaseData.purchaseDetails?.advance).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* ===== Header Information ===== */}
        <Card title="Purchase Information">
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Purchase No</label>
              <input
                type="text"
                value={header.purchaseNo}
                onChange={(e) => setHeader({ ...header, purchaseNo: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                placeholder="Auto-filled from purchase"
              />
            </div>

            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Pricing Serial No</label>
              <input
                type="text"
                value={header.pricingSerialNo}
                onChange={(e) => setHeader({ ...header, pricingSerialNo: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                placeholder="Auto-filled"
              />
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
              />
            </div>

            <div className="col-span-12 md:col-span-2">
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

        {/* ===== Billing Type / Charges Table ===== */}
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
                            value={billing[col.key] || ""}
                            onChange={(e) => {
                              if (col.key === "billingType") {
                                handleBillingTypeChange(e.target.value);
                              } else {
                                setBilling(prev => ({ ...prev, [col.key]: e.target.value }));
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
                            value={billing[col.key] || ""}
                            onChange={(e) => setBilling(prev => ({ ...prev, [col.key]: e.target.value }))}
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

        {/* ===== Orders Table ===== */}
        <div className="mt-4">
          <Card 
            title="Order Details"
            right={
              <div className="flex gap-2">
                <button
                  onClick={addOrderRow}
                  className="rounded-xl bg-yellow-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-yellow-700 transition"
                >
                  + Add Order
                </button>
              </div>
            }
          >
            <div className="overflow-auto rounded-xl border border-yellow-300">
              <table className="min-w-full w-full text-sm">
                <thead className="sticky top-0 bg-yellow-400 z-10">
                  <tr>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900">Order No</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900">Party Name</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900">Plant Code</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900">Order Type</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900">Pin Code</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900">State</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900">District</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900">From</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900">To</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900">Location Rate</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900">Price List</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900">Weight</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900">Rate</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900">Total Amount</th>
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
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                          placeholder="Order No"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.partyName || ""}
                          onChange={(e) => updateOrderRow(row._id, 'partyName', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                          placeholder="Party Name"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.plantName || row.plantCode || ""}
                          onChange={(e) => updateOrderRow(row._id, 'plantName', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                          placeholder="Plant"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <select
                          value={row.orderType || ""}
                          onChange={(e) => updateOrderRow(row._id, 'orderType', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm"
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
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                          placeholder="Pin Code"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.state || ""}
                          onChange={(e) => updateOrderRow(row._id, 'state', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                          placeholder="State"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.district || ""}
                          onChange={(e) => updateOrderRow(row._id, 'district', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                          placeholder="District"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.from || ""}
                          onChange={(e) => updateOrderRow(row._id, 'from', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                          placeholder="From"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.to || ""}
                          onChange={(e) => updateOrderRow(row._id, 'to', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                          placeholder="To"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.locationRate || ""}
                          onChange={(e) => updateOrderRow(row._id, 'locationRate', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                          placeholder="Location Rate"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="text"
                          value={row.priceList || ""}
                          onChange={(e) => updateOrderRow(row._id, 'priceList', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                          placeholder="Price List"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="number"
                          value={row.weight || ""}
                          onChange={(e) => updateOrderRow(row._id, 'weight', e.target.value)}
                          className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                          placeholder="0"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="number"
                          value={row.rate || ""}
                          onChange={(e) => updateOrderRow(row._id, 'rate', e.target.value)}
                          className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                          placeholder="0"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <input
                          type="number"
                          value={row.totalAmount || (num(row.weight) * num(row.rate)).toString()}
                          readOnly
                          className="w-24 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm font-bold text-emerald-700"
                          placeholder="Auto"
                        />
                      </td>
                      <td className="border border-yellow-300 px-2 py-2">
                        <div className="flex gap-1">
                          <button
                            onClick={() => duplicateOrderRow(row._id)}
                            className="rounded-lg border border-yellow-500 bg-yellow-100 px-2 py-1.5 text-xs font-bold text-yellow-800 hover:bg-yellow-200"
                            title="Duplicate"
                          >
                            Dup
                          </button>
                          <button
                            onClick={() => removeOrderRow(row._id)}
                            className="rounded-lg bg-red-500 px-2 py-1.5 text-xs font-bold text-white hover:bg-red-600"
                            title="Remove"
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
                    <td colSpan="13" className="border border-yellow-300 px-3 py-2 text-right font-bold">
                      Total Order Amount:
                    </td>
                    <td className="border border-yellow-300 px-3 py-2 font-bold text-emerald-800">
                      ₹{calculateTotalOrderAmount().toLocaleString()}
                    </td>
                    <td className="border border-yellow-300 px-3 py-2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </div>

        {/* ===== Advance Payment Panel ===== */}
        <div className="mt-4">
          <Card title="Advance Payment - Panel">
            <div className="grid grid-cols-12 gap-4">
              {/* Vendor Information */}
              {/* Vendor Information */}
<div className="col-span-12 md:col-span-4">
  <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 h-full">
    <h3 className="text-sm font-bold text-slate-800 mb-3">Vendor Information</h3>
    
    <div className="space-y-3">
      <div>
        <label className="text-xs font-bold text-slate-600">Vendor Status</label>
        <select
          value={vendorDetails.vendorStatus}
          onChange={(e) => setVendorDetails({ ...vendorDetails, vendorStatus: e.target.value })}
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
        >
          {VENDOR_STATUS_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-bold text-slate-600">Vendor Code</label>
        <input
          type="text"
          value={vendorDetails.vendorCode}
          onChange={(e) => setVendorDetails({ ...vendorDetails, vendorCode: e.target.value })}
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
          placeholder="Auto-filled from purchase"
          readOnly
        />
      </div>

      <div>
        <label className="text-xs font-bold text-slate-600">Vendor Name *</label>
        {/* Changed from SearchableDropdown to simple input */}
        <input
          type="text"
          value={vendorDetails.vendorName}
          onChange={(e) => setVendorDetails({ ...vendorDetails, vendorName: e.target.value })}
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
          placeholder="Auto-filled from vendor"
          readOnly
        />
        {vendorDetails.vendorName && (
          <p className="text-xs text-green-600 mt-1">
            ✓ Selected: {vendorDetails.vendorName} ({vendorDetails.vendorCode})
          </p>
        )}
      </div>

      <div>
        <label className="text-xs font-bold text-slate-600">Vehicle No</label>
        <input
          type="text"
          value={vendorDetails.vehicleNo}
          onChange={(e) => setVendorDetails({ ...vendorDetails, vehicleNo: e.target.value })}
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
          placeholder="HR38X8960"
        />
      </div>

      <div>
        <label className="text-xs font-bold text-slate-600">Purchase - Type</label>
        <select
          value={vendorDetails.purchaseType}
          onChange={(e) => setVendorDetails({ ...vendorDetails, purchaseType: e.target.value })}
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
        >
          {PURCHASE_TYPE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    </div>
  </div>
</div>

              {/* Payment Calculation */}
              <div className="col-span-12 md:col-span-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 h-full">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Payment Calculation</h3>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-bold text-slate-600">Rate (₹)</label>
                        <input
                          type="number"
                          value={vendorDetails.rate}
                          onChange={(e) => {
                            const rate = e.target.value;
                            const amount = num(rate) * num(vendorDetails.weight);
                            setVendorDetails({ 
                              ...vendorDetails, 
                              rate,
                              amount: amount.toString()
                            });
                          }}
                          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-600">Weight (MT)</label>
                        <input
                          type="number"
                          value={vendorDetails.weight}
                          onChange={(e) => {
                            const weight = e.target.value;
                            const amount = num(vendorDetails.rate) * num(weight);
                            setVendorDetails({ 
                              ...vendorDetails, 
                              weight,
                              amount: amount.toString()
                            });
                          }}
                          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600">Amount (₹)</label>
                      <input
                        type="number"
                        value={vendorDetails.amount}
                        readOnly
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-bold text-emerald-700"
                        placeholder="Auto-calculated"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600">Rate - Type</label>
                      <select
                        value={vendorDetails.rateType}
                        onChange={(e) => setVendorDetails({ ...vendorDetails, rateType: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                      >
                        {RATE_TYPE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600">Payment Terms</label>
                      <select
                        value={vendorDetails.paymentTerms}
                        onChange={(e) => setVendorDetails({ ...vendorDetails, paymentTerms: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                      >
                        {PAYMENT_TERMS_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600">Advance (₹)</label>
                      <input
                        type="number"
                        value={vendorDetails.advance}
                        onChange={(e) => {
                          const advance = e.target.value;
                          setVendorDetails({ ...vendorDetails, advance });
                          setPaymentDetails(prev => ({
                            ...prev,
                            finalAmount: advance
                          }));
                        }}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="col-span-12 md:col-span-4">
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 h-full">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Bank Details</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600">Account Number</label>
                      <input
                        type="text"
                        value={vendorDetails.bankAccountNumber || ""}
                        onChange={(e) => setVendorDetails({ ...vendorDetails, bankAccountNumber: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                        placeholder="Enter account number"
                      />
                      {vendorDetails.bankAccountNumber && vendorDetails.bankAccountNumber.trim() !== "" ? (
                        <p className="text-xs text-green-600 mt-1">✓ Bank account loaded from vendor</p>
                      ) : (
                        <p className="text-xs text-amber-600 mt-1">No account number available</p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600">Bank Name</label>
                      <input
                        type="text"
                        value={vendorDetails.bankName || ""}
                        onChange={(e) => setVendorDetails({ ...vendorDetails, bankName: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                        placeholder="Auto-filled from vendor"
                      />
                      {vendorDetails.bankName && vendorDetails.bankName.trim() !== "" ? (
                        <p className="text-xs text-green-600 mt-1">✓ Bank name loaded from vendor</p>
                      ) : (
                        <p className="text-xs text-amber-600 mt-1">No bank name available</p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600">IFSC Code</label>
                      <input
                        type="text"
                        value={vendorDetails.ifscCode || ""}
                        onChange={(e) => setVendorDetails({ ...vendorDetails, ifscCode: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                        placeholder="Auto-filled from vendor"
                      />
                      {vendorDetails.ifscCode && vendorDetails.ifscCode.trim() !== "" ? (
                        <p className="text-xs text-green-600 mt-1">✓ IFSC code loaded from vendor</p>
                      ) : (
                        <p className="text-xs text-amber-600 mt-1">No IFSC code available</p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600">Transaction ID</label>
                      <input
                        type="text"
                        value={vendorDetails.transactionId || ""}
                        onChange={(e) => setVendorDetails({ ...vendorDetails, transactionId: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                        placeholder="6412878541272"
                      />
                    </div>

                    {/* Display Bank Details Summary */}
                    <div className="mt-2 p-3 bg-white rounded-lg border border-yellow-100">
                      <p className="text-xs font-medium text-slate-700 mb-2">Bank Details Summary:</p>
                      {(vendorDetails.bankName?.trim() || vendorDetails.ifscCode?.trim() || vendorDetails.bankAccountNumber?.trim()) ? (
                        <div className="space-y-1 text-xs">
                          {vendorDetails.bankName?.trim() && (
                            <p className="text-green-700">
                              <span className="font-medium">Bank:</span> {vendorDetails.bankName}
                            </p>
                          )}
                          {vendorDetails.ifscCode?.trim() && (
                            <p className="text-green-700">
                              <span className="font-medium">IFSC:</span> {vendorDetails.ifscCode}
                            </p>
                          )}
                          {vendorDetails.bankAccountNumber?.trim() ? (
                            <p className="text-green-700">
                              <span className="font-medium">A/C:</span> {vendorDetails.bankAccountNumber}
                            </p>
                          ) : (
                            <p className="text-amber-600">Account number not provided</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-amber-600">No bank details available. Select a vendor to auto-fill.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* ===== Additions Section ===== */}
        <div className="mt-4">
          <Card 
            title="Additions (+) - Extra Charges"
            right={
              <button
                onClick={addAdditionItem}
                className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700"
              >
                + Add Addition
              </button>
            }
          >
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <h4 className="text-sm font-bold text-green-800 mb-3">Addition Items</h4>
                  
                  {additions.items.length === 0 ? (
                    <div className="text-center py-4 text-slate-500 border-2 border-dashed border-green-200 rounded-lg">
                      <p>No additions added. Click "Add Addition" to add charges.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {additions.items.map((item) => (
                        <div key={item._id} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateAdditionItem(item._id, 'description', e.target.value)}
                            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-green-500"
                            placeholder="Description"
                          />
                          <input
                            type="number"
                            value={item.amount}
                            onChange={(e) => updateAdditionItem(item._id, 'amount', e.target.value)}
                            className="w-32 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-green-500 text-right"
                            placeholder="Amount"
                          />
                          <button
                            onClick={() => removeAdditionItem(item._id)}
                            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                            title="Remove"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="col-span-12 md:col-span-6">
                <div className="bg-green-100 p-4 rounded-xl border border-green-300 h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-sm font-bold text-green-800 mb-2">Total Additions</div>
                    <div className="text-3xl font-bold text-green-700">
                      ₹{num(additions.totalAddition).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* ===== Deductions Section ===== */}
        <div className="mt-4">
          <Card 
            title="Deductions (-) - Adjustments"
            right={
              <button
                onClick={addDeductionItem}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700"
              >
                + Add Deduction
              </button>
            }
          >
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
                <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                  <h4 className="text-sm font-bold text-red-800 mb-3">Deduction Items</h4>
                  
                  {deductions.items.length === 0 ? (
                    <div className="text-center py-4 text-slate-500 border-2 border-dashed border-red-200 rounded-lg">
                      <p>No deductions added. Click "Add Deduction" to add adjustments.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {deductions.items.map((item) => (
                        <div key={item._id} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateDeductionItem(item._id, 'description', e.target.value)}
                            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-red-500"
                            placeholder="Description"
                          />
                          <input
                            type="number"
                            value={item.amount}
                            onChange={(e) => updateDeductionItem(item._id, 'amount', e.target.value)}
                            className="w-32 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-red-500 text-right"
                            placeholder="Amount"
                          />
                          <button
                            onClick={() => removeDeductionItem(item._id)}
                            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                            title="Remove"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="col-span-12 md:col-span-6">
                <div className="bg-red-100 p-4 rounded-xl border border-red-300 h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-sm font-bold text-red-800 mb-2">Total Deductions</div>
                    <div className="text-3xl font-bold text-red-700">
                      ₹{num(deductions.totalDeduction).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* ===== Balance & Final Amount ===== */}
        <div className="mt-4">
          <div className="grid grid-cols-12 gap-4">
            {/* Balance Calculation Details */}
            <div className="col-span-12 md:col-span-6">
              <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                <h3 className="text-sm font-bold text-purple-800 mb-3">Balance Calculation</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Total Amount:</span>
                    <span className="font-bold">₹{num(vendorDetails.amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Advance Payment:</span>
                    <span className="font-bold text-blue-600">- ₹{num(vendorDetails.advance).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Total Additions:</span>
                    <span className="font-bold text-green-600">+ ₹{num(additions.totalAddition).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Total Deductions:</span>
                    <span className="font-bold text-red-600">- ₹{num(deductions.totalDeduction).toLocaleString()}</span>
                  </div>
                  <div className="border-t border-purple-200 pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span className="text-purple-800">Calculated Balance:</span>
                      <span className="text-xl text-purple-700">₹{calculateBalance().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Final Payment Amount */}
            <div className="col-span-12 md:col-span-6">
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 h-full flex items-center justify-center">
                <div className="text-center w-full">
                  <h3 className="text-sm font-bold text-blue-800 mb-2">Final Payment Amount</h3>
                  <div className="text-4xl font-bold text-blue-700 bg-white border border-blue-300 rounded-lg px-4 py-4 text-center">
                    ₹{calculateBalance().toLocaleString()}
                  </div>
                  <p className="text-xs text-blue-600 mt-2">Balance amount to be paid after adjustments</p>
                  <p className="text-xs text-slate-500 mt-1">
                    (Amount - Advance - Deductions + Additions)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Payment Transaction Details ===== */}
        <div className="mt-4">
          <Card title="Payment Transaction Details">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-3">
                <label className="text-xs font-bold text-slate-600">Vendor Name (Debit)</label>
                <input
                  type="text"
                  value={paymentDetails.vendorNameDebit || vendorDetails.vendorName}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, vendorNameDebit: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  placeholder="Vendor name"
                />
                {paymentDetails.vendorNameDebit && (
                  <p className="text-xs text-green-600 mt-1">✓ Auto-filled from vendor</p>
                )}
              </div>

              <div className="col-span-12 md:col-span-3">
                <label className="text-xs font-bold text-slate-600">Account No (Credit)</label>
                <input
                  type="text"
                  value={paymentDetails.accountNoCredit || vendorDetails.bankAccountNumber}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, accountNoCredit: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  placeholder="Account number"
                />
                {vendorDetails.bankAccountNumber ? (
                  <p className="text-xs text-green-600 mt-1">✓ Loaded from vendor</p>
                ) : (
                  <p className="text-xs text-amber-600 mt-1">Please enter account number</p>
                )}
              </div>

              <div className="col-span-12 md:col-span-2">
                <label className="text-xs font-bold text-slate-600">Final Amount</label>
                <input
                  type="number"
                  value={paymentDetails.finalAmount || vendorDetails.advance}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, finalAmount: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 font-bold text-emerald-700"
                  placeholder="Final amount"
                />
              </div>

              <div className="col-span-12 md:col-span-2">
                <label className="text-xs font-bold text-slate-600">Payment Date</label>
                <input
                  type="date"
                  value={paymentDetails.paymentDate}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, paymentDate: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div className="col-span-12 md:col-span-2">
                <label className="text-xs font-bold text-slate-600">Payment Status</label>
                <select
                  value={paymentDetails.paymentStatus}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, paymentStatus: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                >
                  {ADVANCE_STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-12 md:col-span-3">
                <label className="text-xs font-bold text-slate-600">Remarks</label>
                <input
                  type="text"
                  value={paymentDetails.remarks}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, remarks: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  placeholder="ADV Payment"
                />
              </div>

              <div className="col-span-12 md:col-span-3">
                <label className="text-xs font-bold text-slate-600">Transaction ID</label>
                <input
                  type="text"
                  value={paymentDetails.transactionId || vendorDetails.transactionId}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, transactionId: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  placeholder="Transaction ID"
                />
              </div>

              <div className="col-span-12 md:col-span-3">
                <label className="text-xs font-bold text-slate-600">Bank Vendor Code</label>
                <input
                  type="text"
                  value={paymentDetails.bankVendorCode || vendorDetails.vendorCode}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, bankVendorCode: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  placeholder="Bank vendor code"
                />
              </div>

              <div className="col-span-12 md:col-span-2">
                <label className="text-xs font-bold text-slate-600">Generate Queue</label>
                <button
                  onClick={handleGenerateQueue}
                  className="mt-1 w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 transition"
                >
                  Generate Queue
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Reusable Components
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

function Select({ label, value, onChange, options = [], col = "" }) {
  return (
    <div className={col}>
      <label className="text-xs font-bold text-slate-600">{label}</label>
      <select
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
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
  displayField = 'supplierName',  // Change default to supplierName
  codeField = 'supplierCode',      // Change default to supplierCode
  valueField = 'supplierName',     // Change default to supplierName
  idField = '_id',
  disabled = false
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Update search query when selectedId or items change
  useEffect(() => {
    console.log("🔍 SearchableDropdown - selectedId:", selectedId);
    console.log("🔍 SearchableDropdown - items:", items);
    
    if (selectedId && items?.length > 0) {
      // Try to find the item by various methods
      const selectedItem = items.find(item => 
        item.supplierName === selectedId || 
        item.supplierCode === selectedId ||
        item._id === selectedId ||
        item.supplierName?.toLowerCase() === selectedId?.toLowerCase()
      );
      
      if (selectedItem) {
        console.log("✅ Found selected item:", selectedItem);
        const displayValue = `${selectedItem.supplierName} (${selectedItem.supplierCode})`;
        setSearchQuery(displayValue);
      } else {
        console.log("❌ No matching item found for:", selectedId);
        setSearchQuery(selectedId || "");
      }
    } else {
      setSearchQuery("");
    }
  }, [selectedId, items]);

  useEffect(() => {
    setFilteredItems(items || []);
  }, [items]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredItems(items || []);
    } else {
      const filtered = (items || []).filter(item =>
        item.supplierName?.toLowerCase().includes(query.toLowerCase()) ||
        item.supplierCode?.toLowerCase().includes(query.toLowerCase()) ||
        item.bankAccountNumber?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredItems(filtered);
    }
  };

  const handleSelectItem = (item) => {
    console.log("🔍 SearchableDropdown selected item:", item);
    onSelect?.(item);
    setSearchQuery(`${item.supplierName} (${item.supplierCode})`);
    setShowDropdown(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => !disabled && setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
      />
      {showDropdown && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {filteredItems?.length > 0 ? (
            filteredItems.map((item) => (
              <div
                key={item._id}
                onMouseDown={() => handleSelectItem(item)}
                className={`p-2 hover:bg-emerald-50 cursor-pointer border-b border-slate-100 ${
                  item.supplierName === selectedId || 
                  item.supplierCode === selectedId ||
                  item._id === selectedId ? 'bg-emerald-100' : ''
                }`}
              >
                <div className="font-medium text-slate-800 text-sm">
                  {item.supplierName}
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                  <span>Code: {item.supplierCode || 'N/A'}</span>
                  {item.bankAccountNumber && (
                    <span className="text-green-600">A/C: {item.bankAccountNumber}</span>
                  )}
                </div>
                {(item.bankName || item.ifscCode) && (
                  <div className="text-xs text-slate-400">
                    Bank: {item.bankName || 'N/A'} {item.ifscCode && `| IFSC: ${item.ifscCode}`}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-2 text-center text-sm text-slate-500">
              {searchQuery.trim() ? 
                `No vendors found for "${searchQuery}"` : 
                "No vendors available"
              }
            </div>
          )}
        </div>
      )}
    </div>
  );
}