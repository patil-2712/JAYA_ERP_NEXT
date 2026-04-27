"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

// Helper function to add days to a date
function addDays(dateString, days) {
  if (!dateString || !days) return "";
  const date = new Date(dateString);
  date.setDate(date.getDate() + parseInt(days));
  return date.toISOString().split('T')[0];
}

// Helper function to format date for display
function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

// Helper function to get latest POD Date from LR entries
function getLatestPodDate(lrEntries) {
  if (!lrEntries || lrEntries.length === 0) return "";
  
  const podDates = lrEntries
    .filter(lr => lr.podDate && lr.podDate.trim() !== '')
    .map(lr => new Date(lr.podDate));
  
  if (podDates.length === 0) return "";
  
  const latestDate = new Date(Math.max(...podDates));
  return latestDate.toISOString().split('T')[0];
}

// Reusable Card Component
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

export default function CreatePOD() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [purchases, setPurchases] = useState([]);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [allConsignmentNotes, setAllConsignmentNotes] = useState([]);
  const [filteredLRs, setFilteredLRs] = useState([]);
  const [loadingLR, setLoadingLR] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  
  // ==================== HEADER STATE ====================
  const [header, setHeader] = useState({
    podNo: "",
    purchaseNo: "",
    pricingSerialNo: "",
    branch: "",
    date: new Date().toISOString().split('T')[0],
    delivery: "Normal"
  });

  // ==================== BILLING STATE (Readonly) ====================
  const [billing, setBilling] = useState({
    billingType: "Multi - Order",
    noOfLoadingPoints: "",
    noOfDroppingPoint: ""
  });

  // ==================== ORDERS from Purchase ====================
  const [purchaseOrders, setPurchaseOrders] = useState([]);

  // ==================== LR DETAILS ====================
  const [lrEntries, setLrEntries] = useState([]);

  // ==================== SINGLE PRODUCTS TABLE (Readonly) ====================
  const [products, setProducts] = useState([]);

 // ==================== VENDOR & FINANCIAL ====================
const [vendorFinancial, setVendorFinancial] = useState({
  vendorName: "",
  vendorCode: "",
  total: 0,
  advance: 0,
  balance: 0,
  poDeduction: 0,
  podDeduction: 0,
  finalBalance: 0,
  dueDays: 0
});

  // ==================== POD STATUS SECTION ====================
  const [podStatusSection, setPodStatusSection] = useState({
    lastPodDate: "",
    podStatus: "",
    dueDate: "",
    paymentDate: "",
    acknowledgementMail: false,
    note: ""
  });

  // ==================== REMARKS ====================
  const [remarks, setRemarks] = useState("");

  // Order Columns (Like Purchase Panel)
  const orderColumns = [
    { key: "orderNo", label: "Order", minWidth: "120px" },
    { key: "partyName", label: "Party Name", minWidth: "150px" },
    { key: "branch", label: "Branch / Plant Code", minWidth: "150px" },
    { key: "orderType", label: "Order Type", minWidth: "100px" },
    { key: "pinCode", label: "Pin Code", minWidth: "100px" },
    { key: "state", label: "State", minWidth: "120px" },
    { key: "district", label: "District", minWidth: "120px" },
    { key: "from", label: "From", minWidth: "120px" },
    { key: "to", label: "To", minWidth: "120px" },
    { key: "locationRate", label: "Location Rate", minWidth: "100px" },
    { key: "weight", label: "Weight", minWidth: "80px" }
  ];

  // Product Columns (Readonly) - 11 columns including Delivery Status, Deduction, Value
  const productColumns = [
    { key: "productName", label: "Product name", minWidth: "150px" },
    { key: "totalPkgs", label: "TOTAL PKGS", minWidth: "100px" },
    { key: "pkgsType", label: "PKGS TYPE", minWidth: "100px" },
    { key: "uom", label: "UOM", minWidth: "80px" },
    { key: "packSize", label: "Pack Size", minWidth: "100px" },
    { key: "skuSize", label: "SKU - SIZE", minWidth: "100px" },
    { key: "wtLtr", label: "WT (LTR)", minWidth: "100px" },
    { key: "actualWt", label: "ACTUAL - WT", minWidth: "100px" },
    { key: "deliveryStatus", label: "Delivery Status", minWidth: "130px" },
    { key: "deduction", label: "Deduction", minWidth: "100px" },
    { key: "value", label: "Value", minWidth: "100px" }
  ];

  // Fetch Purchases
  useEffect(() => {
    fetchPurchases();
    fetchSuppliers();
  }, []);

  const fetchPurchases = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/purchase-panel?format=table', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        // Enhanced purchases with derived fields
        const enhancedPurchases = (data.data || []).map(purchase => {
          // Extract from/to from orderRows if available
          let fromLocation = '';
          let toLocation = '';
          let lrCode = purchase.lrCode || purchase.consignmentNo || '';
          
          if (purchase.orderRows && purchase.orderRows.length > 0) {
            fromLocation = purchase.orderRows[0]?.from || '';
            toLocation = purchase.orderRows[0]?.to || '';
          }
          
          return {
            ...purchase,
            fromLocation,
            toLocation,
            lrCode
          };
        });
        setPurchases(enhancedPurchases);
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
    }
  };

  // Fetch Suppliers to get dueDays
  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/suppliers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSuppliers(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  // Get Due Days from supplier by vendor code
  const getDueDaysFromSupplier = (vendorCode) => {
    if (!vendorCode || suppliers.length === 0) return 0;
    const supplier = suppliers.find(s => s.supplierCode === vendorCode);
    return supplier?.dueDays || 0;
  };

  // NEW: Calculate Due Date based on Last POD Date + Due Days
  const calculateDueDate = (lastPodDate, dueDays) => {
    if (!lastPodDate || !dueDays) return "";
    return addDays(lastPodDate, dueDays);
  };

  // NEW: Calculate Payment Date based on Due Date + 3 days
  const calculatePaymentDate = (dueDate) => {
    if (!dueDate) return "";
    return addDays(dueDate, 3);
  };

  // NEW: Update Last POD Date and recalculate Due Date & Payment Date
  const updateLastPodDateAndRecalculate = (newLastPodDate) => {
    setPodStatusSection(prev => ({ ...prev, lastPodDate: newLastPodDate }));
    
    if (newLastPodDate && vendorFinancial.dueDays) {
      const newDueDate = calculateDueDate(newLastPodDate, vendorFinancial.dueDays);
      setPodStatusSection(prev => ({ ...prev, dueDate: newDueDate }));
      
      if (newDueDate) {
        const newPaymentDate = calculatePaymentDate(newDueDate);
        setPodStatusSection(prev => ({ ...prev, paymentDate: newPaymentDate }));
      }
    }
  };

  // NEW: Auto update Last POD Date from LR entries
  const autoUpdateLastPodDate = (lrEntriesList) => {
    const latestPodDate = getLatestPodDate(lrEntriesList);
    if (latestPodDate && latestPodDate !== podStatusSection.lastPodDate) {
      updateLastPodDateAndRecalculate(latestPodDate);
      console.log(`📅 Auto-set Last POD Date to: ${latestPodDate} (latest from LRs)`);
    }
  };

  // Fetch ALL Consignment Notes (LR) for comparison
  const fetchAllConsignmentNotes = async () => {
    setLoadingLR(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/consignment-note?format=table', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        console.log('📋 All Consignment Notes:', data.data);
        setAllConsignmentNotes(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching consignment notes:', error);
    } finally {
      setLoadingLR(false);
    }
  };

  // Filter LRs based on Purchase Order Numbers
  const filterLRsByPurchaseOrders = (purchaseOrderNumbers) => {
    if (!purchaseOrderNumbers || purchaseOrderNumbers.length === 0) {
      setFilteredLRs([]);
      return;
    }
    
    const matchedLRs = allConsignmentNotes.filter(lr => 
      purchaseOrderNumbers.includes(lr.orderNo)
    );
    
    console.log('🔍 Matched LRs:', matchedLRs);
    setFilteredLRs(matchedLRs);
    return matchedLRs;
  };

  // Fetch LR Details and Products from Consignment Note
  const fetchLRDetails = async (lrNo, lrId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/consignment-note?lrNo=${lrNo}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      console.log('📦 LR Details Response:', data);
      
      if (data.success && data.data) {
        const lrData = data.data;
        console.log('📦 LR Data:', lrData);
        console.log('📦 Pack Data:', lrData.packData);
        
        // Clear existing products for this LR
        setProducts(prev => prev.filter(p => p.lrRefId !== lrId));
        
        const allProducts = [];
        
        // Helper function to add product
        const addProduct = (item, sourceType) => {
          if (item && item.productName && item.productName.trim() !== '') {
            allProducts.push({
              _id: uid(),
              lrRefId: lrId,
              sourceType: sourceType,
              productName: item.productName || '',
              totalPkgs: item.totalPkgs || '',
              pkgsType: item.pkgsType || '',
              uom: item.uom || '',
              packSize: item.packWeight || item.packSize || '',
              skuSize: item.skuSize || '',
              wtLtr: item.wtLtr || '',
              actualWt: item.actualWt || '',
              deliveryStatus: item.deliveryStatus || '',
              deduction: item.deduction || '',
              value: item.value || ''
            });
            console.log(`✅ Added product from ${sourceType}:`, item.productName);
          }
        };
        
        // Get Palletization Data
        if (lrData.packData?.PALLETIZATION && lrData.packData.PALLETIZATION.length > 0) {
          console.log('📦 Palletization products:', lrData.packData.PALLETIZATION);
          lrData.packData.PALLETIZATION.forEach(item => addProduct(item, 'PALLETIZATION'));
        }
        
        // Get Uniform Data
        if (lrData.packData?.['UNIFORM - BAGS/BOXES'] && lrData.packData['UNIFORM - BAGS/BOXES'].length > 0) {
          console.log('📦 Uniform products:', lrData.packData['UNIFORM - BAGS/BOXES']);
          lrData.packData['UNIFORM - BAGS/BOXES'].forEach(item => addProduct(item, 'UNIFORM'));
        }
        
        // Get Loose Cargo Data
        if (lrData.packData?.['LOOSE - CARGO'] && lrData.packData['LOOSE - CARGO'].length > 0) {
          console.log('📦 Loose Cargo products:', lrData.packData['LOOSE - CARGO']);
          lrData.packData['LOOSE - CARGO'].forEach(item => addProduct(item, 'LOOSE_CARGO'));
        }
        
        // Get Non-Uniform Data
        if (lrData.packData?.['NON-UNIFORM - GENERAL CARGO'] && lrData.packData['NON-UNIFORM - GENERAL CARGO'].length > 0) {
          console.log('📦 Non-Uniform products:', lrData.packData['NON-UNIFORM - GENERAL CARGO']);
          lrData.packData['NON-UNIFORM - GENERAL CARGO'].forEach(item => addProduct(item, 'NON_UNIFORM'));
        }
        
        // Also check for productRows (alternative structure)
        if (lrData.productRows && lrData.productRows.length > 0) {
          console.log('📦 Product Rows:', lrData.productRows);
          lrData.productRows.forEach(item => addProduct(item, 'PRODUCT_ROWS'));
        }
        
        console.log('📦 Total products collected:', allProducts.length);
        setProducts(prev => [...prev, ...allProducts]);
        
        // Update LR entry with order details and POD Date
        const podDateFromLR = lrData.lrDetails?.podDate || lrData.podDate || '';
        
        setLrEntries(prev => prev.map(lr => 
          lr._id === lrId ? { 
            ...lr, 
            lrNo: lrData.lrNo,
            lrDate: lrData.header?.lrDate || lrData.lrDate || '',
            orderNo: lrData.header?.orderNo || lrData.orderNo || '',
            podDate: podDateFromLR
          } : lr
        ));
        
        // After updating LR entries, recalculate Last POD Date
        setTimeout(() => {
          const updatedLrEntries = [...lrEntries];
          const updatedIndex = updatedLrEntries.findIndex(lr => lr._id === lrId);
          if (updatedIndex !== -1) {
            updatedLrEntries[updatedIndex] = {
              ...updatedLrEntries[updatedIndex],
              podDate: podDateFromLR
            };
            autoUpdateLastPodDate(updatedLrEntries);
          }
        }, 100);
        
        if (allProducts.length > 0) {
          alert(`✅ Loaded ${allProducts.length} products from LR: ${lrNo}\n📅 POD Date: ${podDateFromLR || 'Not set'}`);
        } else {
          alert(`⚠️ No products found in LR: ${lrNo}\nPlease check if the LR has product details.`);
        }
      }
    } catch (error) {
      console.error('Error fetching LR details:', error);
      alert('Failed to load LR details');
    }
  };

 // Handle Purchase Selection
const handlePurchaseSelect = async (purchaseNo) => {
  setHeader({ ...header, purchaseNo });
  setLoading(true);
  
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/purchase-panel?purchaseNo=${purchaseNo}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    
    if (data.success && data.data) {
      const purchase = data.data;
      
      // Extract from/to from orderRows
      let fromLocation = '';
      let toLocation = '';
      let lrCode = purchase.lrCode || purchase.consignmentNo || '';
      
      if (purchase.orderRows && purchase.orderRows.length > 0) {
        fromLocation = purchase.orderRows[0]?.from || '';
        toLocation = purchase.orderRows[0]?.to || '';
      }
      
      // Get vehicle number from various locations
      const vehicleNo = purchase.purchaseDetails?.vehicleNo || 
                        purchase.vehicleNo || 
                        purchase.header?.vehicleNo || '';
      
      const enhancedPurchase = {
        ...purchase,
        vehicleNo,
        fromLocation,
        toLocation,
        lrCode
      };
      
      setSelectedPurchase(enhancedPurchase);
      
      console.log('🚛 Purchase Details:', {
        purchaseNo: purchase.purchaseNo,
        vendorName: purchase.purchaseDetails?.vendorName,
        vehicleNo,
        fromLocation,
        toLocation,
        lrCode
      });
      
      // Extract orders from purchase
      const orderNumbers = [];
      if (purchase.orderRows && purchase.orderRows.length > 0) {
        const mappedOrders = purchase.orderRows.map(row => ({
          orderNo: row.orderNo,
          partyName: row.partyName,
          branch: row.plantName,
          plantCode: row.plantCode,
          orderType: row.orderType,
          pinCode: row.pinCode,
          state: row.state,
          district: row.district,
          from: row.from || fromLocation,
          to: row.to || toLocation,
          locationRate: row.locationRate,
          weight: row.weight
        }));
        setPurchaseOrders(mappedOrders);
        
        mappedOrders.forEach(order => {
          if (order.orderNo) orderNumbers.push(order.orderNo);
        });
      }
      
      // Auto-fill header
      setHeader({
        ...header,
        purchaseNo: purchase.purchaseNo,
        pricingSerialNo: purchase.pricingSerialNo || '',
        branch: purchase.header?.branchName || purchase.branchName || '',
        date: purchase.header?.date ? new Date(purchase.header.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        delivery: purchase.header?.delivery || 'Normal'
      });
      
      // Auto-fill billing
      const orderCount = purchase.orderRows?.length || 0;
      setBilling({
        billingType: orderCount === 1 ? "Single - Order" : "Multi - Order",
        noOfLoadingPoints: purchase.billing?.noOfLoadingPoints || '',
        noOfDroppingPoint: purchase.billing?.noOfDroppingPoint || ''
      });
      
      // Get vendor code from purchase
      const vendorCode = purchase.purchaseDetails?.vendorCode || '';
      const vendorName = purchase.purchaseDetails?.vendorName || '';
      
      // Get due days from supplier
      const dueDays = getDueDaysFromSupplier(vendorCode);
      
      // Get PO Deduction from purchase
      const poDeductionFromPurchase = 
        purchase.purchaseDetails?.poDeduction || 
        purchase.poDeduction || 
        purchase.totalDeductions || 
        0;
      
      // Auto-fill vendor
      setVendorFinancial(prev => ({
        ...prev,
        vendorName: vendorName,
        vendorCode: vendorCode,
        advance: num(purchase.purchaseDetails?.advance) || 0,
        total: purchase.purchaseAmountFromVNN || purchase.purchaseDetails?.amount || 0,
        dueDays: dueDays,
        poDeduction: num(poDeductionFromPurchase)
      }));
      
      // Calculate balance
      const totalAmt = purchase.purchaseAmountFromVNN || purchase.purchaseDetails?.amount || 0;
      const advanceAmt = num(purchase.purchaseDetails?.advance) || 0;
      setVendorFinancial(prev => ({
        ...prev,
        balance: totalAmt - advanceAmt
      }));
      
      // Create LR entries for each order
      if (orderNumbers.length > 0) {
        const newLrEntries = orderNumbers.map((orderNo, index) => ({
          _id: uid(),
          lrNo: "",
          lrDate: "",
          orderNo: orderNo,
          delivery: "COURIER",
          inPersonParsal: "",
          docketNo: "",
          podDate: "",
          podUpload: "",
          podReceived: "Pending"
        }));
        setLrEntries(newLrEntries);
      }
      
      // Fetch all consignment notes first time
      if (allConsignmentNotes.length === 0) {
        await fetchAllConsignmentNotes();
      } else {
        filterLRsByPurchaseOrders(orderNumbers);
      }
      
      // Show detailed alert with all info
      const vehicleMsg = vehicleNo ? `\n🚛 Vehicle: ${vehicleNo}` : '';
      const routeMsg = (fromLocation && toLocation) ? `\n📍 Route: ${fromLocation} → ${toLocation}` : '';
      const lrMsg = lrCode ? `\n📋 LR Code: ${lrCode}` : '';
      const dueDaysMsg = dueDays > 0 ? `\n📅 Due Days: ${dueDays} days` : '';
      const poDeductionMsg = poDeductionFromPurchase > 0 ? `\n💰 PO Deduction: ₹${poDeductionFromPurchase}` : '';
      
      alert(`✅ Loaded Purchase: ${purchase.purchaseNo}
📦 Customer: ${vendorName}
${vehicleMsg}${routeMsg}${lrMsg}
📋 Orders found: ${orderNumbers.join(', ') || 'None'}${dueDaysMsg}${poDeductionMsg}
🏷️ Vendor Code: ${vendorCode || 'N/A'}`);
    }
  } catch (error) {
    console.error('Error loading purchase:', error);
    alert('Failed to load purchase details');
  } finally {
    setLoading(false);
  }
};

  // Filter LRs when allConsignmentNotes or purchaseOrders change
  useEffect(() => {
    if (allConsignmentNotes.length > 0 && purchaseOrders.length > 0) {
      const orderNumbers = purchaseOrders.map(order => order.orderNo);
      filterLRsByPurchaseOrders(orderNumbers);
    }
  }, [allConsignmentNotes, purchaseOrders]);

  // Get available LRs for a specific order
  const getAvailableLRsForOrder = (orderNo) => {
    return filteredLRs.filter(lr => lr.orderNo === orderNo);
  };

  // Handle LR Selection for a specific order
  const handleLRSelect = async (lrId, selectedLRNo, orderNo) => {
    const selectedLR = filteredLRs.find(c => c.lrNo === selectedLRNo && c.orderNo === orderNo);
    
    if (selectedLR) {
      setLrEntries(prev => prev.map(lr => 
        lr._id === lrId ? { 
          ...lr, 
          lrNo: selectedLRNo,
          lrDate: selectedLR.lrDate || '',
          orderNo: orderNo
        } : lr
      ));
      await fetchLRDetails(selectedLRNo, lrId);
    }
  };

  // Update LR entry
  const updateLREntry = (id, key, value) => {
    setLrEntries(prev => {
      const updated = prev.map(lr => lr._id === id ? { ...lr, [key]: value } : lr);
      // Auto update Last POD Date when podDate changes
      if (key === 'podDate') {
        setTimeout(() => autoUpdateLastPodDate(updated), 0);
      }
      return updated;
    });
  };

  // Handle POD Upload
  const handlePodUpload = async (e, lrId) => {
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
    
    // Show uploading status
    updateLREntry(lrId, 'podUpload', 'UPLOADING');
    
    // Simulate file upload (replace with actual upload logic)
    const formData = new FormData();
    formData.append('file', file);
    formData.append('lrId', lrId);
    
    try {
      // Uncomment for actual API call
      // const token = localStorage.getItem('token');
      // const res = await fetch('/api/upload-pod', {
      //   method: 'POST',
      //   headers: { Authorization: `Bearer ${token}` },
      //   body: formData
      // });
      // const data = await res.json();
      
      // For demo: simulate successful upload
      setTimeout(() => {
        // Update LR entry with upload status AND set POD Received to "Received"
        updateLREntry(lrId, 'podUpload', 'UPLOADED');
        updateLREntry(lrId, 'podReceived', 'Received'); // Auto-set to Received
        alert(`✅ POD uploaded successfully for LR`);
      }, 1000);
      
    } catch (error) {
      console.error('Error uploading POD:', error);
      updateLREntry(lrId, 'podUpload', '');
      alert('❌ Failed to upload POD');
    }
  };

  // Update Product fields (Delivery Status, Deduction, Value are editable)
  const updateProduct = (id, key, value) => {
    setProducts(prev => prev.map(p => p._id === id ? { ...p, [key]: value } : p));
  };

// Calculations
const calculateTotalActualWt = () => {
  return products.reduce((sum, p) => sum + num(p.actualWt), 0);
};

const calculateTotalQuantity = () => {
  return products.reduce((sum, p) => sum + num(p.totalPkgs), 0);
};

const calculateTotalPODDeduction = () => {
  return num(vendorFinancial.poDeduction) + num(vendorFinancial.podDeduction);
};

const calculateFinalBalance = () => {
  const total = vendorFinancial.total;
  const advance = vendorFinancial.advance;
  const totalPodDeduction = calculateTotalPODDeduction();
  return total - advance - totalPodDeduction;
};

 // Save Function
const handleSave = async () => {
  if (!header.purchaseNo) {
    alert("Please select a Purchase No");
    return;
  }

  setSaving(true);

  try {
    const token = localStorage.getItem('token');
    
    const payload = {
      header,
      billing,
      purchaseOrders,
      lrEntries,
      products,
      vendorFinancial: {
        vendorName: vendorFinancial.vendorName,
        vendorCode: vendorFinancial.vendorCode,
        total: calculateTotalActualWt() || vendorFinancial.total,
        advance: vendorFinancial.advance,
        balance: vendorFinancial.total - vendorFinancial.advance,
        poDeduction: vendorFinancial.poDeduction,
        podDeduction: vendorFinancial.podDeduction,
        finalBalance: calculateFinalBalance(),
        dueDays: vendorFinancial.dueDays
      },
      podStatusSection,
      remarks,
      purchaseNo: header.purchaseNo,
      pricingSerialNo: header.pricingSerialNo
    };

    const res = await fetch('/api/pod-panel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.success) {
      alert(`✅ POD created successfully!\nPOD No: ${data.data?.podNo}`);
      router.push('/admin/ProofOfDelivery');
    } else {
      alert(data.message || 'Failed to create POD');
    }
  } catch (error) {
    console.error('Error saving POD:', error);
    alert(`❌ Error: ${error.message}`);
  } finally {
    setSaving(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-full px-4 py-3 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/admin/ProofOfDelivery')}
                className="text-yellow-600 hover:text-yellow-800 font-medium text-sm flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to List
              </button>
              <div className="text-lg font-extrabold text-slate-900">Create Proof of Delivery (POD)</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`rounded-xl px-5 py-2 text-sm font-bold text-white transition ${
                saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-600 hover:bg-yellow-700'
              }`}
            >
              {saving ? 'Saving...' : 'Save POD'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-full p-4">
        
        {/* ==================== PURCHASE SELECTION with Enhanced Dropdown ==================== */}
        <Card title="Select Purchase Order">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-6">
              <label className="text-xs font-bold text-slate-600">Purchase No *</label>
              <select
                value={header.purchaseNo}
                onChange={(e) => handlePurchaseSelect(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
                style={{ width: '100%', minWidth: '400px' }}
              >
                <option value="">Select Purchase No</option>
                {purchases.map(p => {
                  // Get vehicle number from purchase
                  const vehicleNo = p.vehicleNo || p.purchaseDetails?.vehicleNo || '';
                  
                  // Get from/to locations from purchase (already enhanced in fetchPurchases)
                  const fromLoc = p.fromLocation || p.orderRows?.[0]?.from || '';
                  const toLoc = p.toLocation || p.orderRows?.[0]?.to || '';
                  
                  // Get LR code from purchase
                  const lrCode = p.lrCode || p.consignmentNo || '';
                  
                  // Build display text with icons
                  let displayText = `${p.purchaseNo} - ${p.vendorName || p.purchaseDetails?.vendorName || 'Unknown'}`;
                  
                  if (vehicleNo) {
                    displayText += ` | 🚛 ${vehicleNo}`;
                  }
                  
                  if (fromLoc && toLoc) {
                    const shortFrom = fromLoc.length > 15 ? fromLoc.substring(0, 12) + '...' : fromLoc;
                    const shortTo = toLoc.length > 15 ? toLoc.substring(0, 12) + '...' : toLoc;
                    displayText += ` | 📍 ${shortFrom} → ${shortTo}`;
                  }
                  
                  if (lrCode) {
                    displayText += ` | 📋 ${lrCode}`;
                  }
                  
                  return (
                    <option key={p._id} value={p.purchaseNo} title={displayText}>
                      {displayText}
                    </option>
                  );
                })}
              </select>
              <p className="text-xs text-slate-400 mt-1">
                Select a purchase to auto-fill order and LR details
              </p>
            </div>
            
            {/* Enhanced Selected Purchase Details Card */}
            {selectedPurchase && (
              <div className="col-span-12 md:col-span-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-xl border border-blue-200">
                  <div className="text-xs font-bold text-blue-700 mb-2">📋 Selected Purchase Details</div>
                  <div className="grid grid-cols-12 gap-2 text-xs">
                    <div className="col-span-12 md:col-span-4">
                      <span className="text-slate-500">Purchase No:</span>
                      <span className="font-medium text-slate-800 ml-1">{selectedPurchase.purchaseNo}</span>
                    </div>
                    <div className="col-span-12 md:col-span-4">
                      <span className="text-slate-500">Customer:</span>
                      <span className="font-medium text-slate-800 ml-1">{selectedPurchase.purchaseDetails?.vendorName || selectedPurchase.vendorName || '-'}</span>
                    </div>
                    <div className="col-span-12 md:col-span-4">
                      <span className="text-slate-500">Vehicle No:</span>
                      <span className="font-medium text-slate-800 ml-1">🚛 {selectedPurchase.vehicleNo || selectedPurchase.purchaseDetails?.vehicleNo || '-'}</span>
                    </div>
                    <div className="col-span-12 md:col-span-6">
                      <span className="text-slate-500">From → To:</span>
                      <span className="font-medium text-slate-800 ml-1">
                        📍 {selectedPurchase.fromLocation || selectedPurchase.orderRows?.[0]?.from || '-'} → {selectedPurchase.toLocation || selectedPurchase.orderRows?.[0]?.to || '-'}
                      </span>
                    </div>
                    <div className="col-span-12 md:col-span-3">
                      <span className="text-slate-500">LR Code:</span>
                      <span className="font-medium text-slate-800 ml-1">📋 {selectedPurchase.lrCode || selectedPurchase.consignmentNo || '-'}</span>
                    </div>
                    <div className="col-span-12 md:col-span-3">
                      <span className="text-slate-500">Order Count:</span>
                      <span className="font-medium text-blue-700 ml-1">{selectedPurchase.orderRows?.length || 0} Orders</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {loading && (
              <div className="col-span-12">
                <div className="bg-yellow-50 p-3 rounded-lg text-yellow-600 text-sm border border-yellow-200">
                  <svg className="animate-spin h-4 w-4 inline mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading purchase details...
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* ==================== HEADER INFORMATION (Readonly) ==================== */}
        <Card title="POD Information">
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">POD No</label>
              <input type="text" value="Auto-generated on save" readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm" />
            </div>
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Purchase No</label>
              <input type="text" value={header.purchaseNo} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm" />
            </div>
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Pricing Serial No</label>
              <input type="text" value={header.pricingSerialNo} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm" />
            </div>
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Branch</label>
              <input type="text" value={header.branch} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm" />
            </div>
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Date</label>
              <input type="date" value={header.date} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Delivery</label>
              <input type="text" value={header.delivery} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" />
            </div>
          </div>
        </Card>

        {/* ==================== BILLING TYPE / CHARGES (Readonly) ==================== */}
        <Card title="Billing Type / Charges">
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
                    <input type="text" value={billing.billingType} readOnly className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm cursor-not-allowed" />
                  </td>
                  <td className="border border-yellow-300 px-2 py-2">
                    <input type="number" value={billing.noOfLoadingPoints} readOnly className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm cursor-not-allowed" />
                  </td>
                  <td className="border border-yellow-300 px-2 py-2">
                    <input type="number" value={billing.noOfDroppingPoint} readOnly className="w-full rounded-lg border border-slate-200 bg-gray-100 px-2 py-1.5 text-sm cursor-not-allowed" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* ==================== ORDERS TABLE (Scrollable) ==================== */}
        <Card title="Orders (Auto-filled from Purchase Panel)">
          <div className="overflow-auto rounded-xl border border-yellow-300 max-h-[400px]">
            <table className="min-w-max w-full text-sm">
              <thead className="sticky top-0 bg-yellow-400 z-10">
                <tr>
                  {orderColumns.map((col) => (
                    <th
                      key={col.key}
                      className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center"
                      style={{ minWidth: col.minWidth }}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.length > 0 ? purchaseOrders.map((order, idx) => (
                  <tr key={idx} className="hover:bg-yellow-50 even:bg-slate-50">
                    <td className="border border-yellow-300 px-2 py-2 text-slate-700">{order.orderNo || '-'}</td>
                    <td className="border border-yellow-300 px-2 py-2 text-slate-700">{order.partyName || '-'}</td>
                    <td className="border border-yellow-300 px-2 py-2 text-slate-700">{order.branch || order.plantCode || '-'}</td>
                    <td className="border border-yellow-300 px-2 py-2 text-slate-700">{order.orderType || '-'}</td>
                    <td className="border border-yellow-300 px-2 py-2 text-slate-700">{order.pinCode || '-'}</td>
                    <td className="border border-yellow-300 px-2 py-2 text-slate-700">{order.state || '-'}</td>
                    <td className="border border-yellow-300 px-2 py-2 text-slate-700">{order.district || '-'}</td>
                    <td className="border border-yellow-300 px-2 py-2 text-slate-700">{order.from || '-'}</td>
                    <td className="border border-yellow-300 px-2 py-2 text-slate-700">{order.to || '-'}</td>
                    <td className="border border-yellow-300 px-2 py-2 text-slate-700">{order.locationRate || '-'}</td>
                    <td className="border border-yellow-300 px-2 py-2 text-slate-700 text-right">{order.weight || 0}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={orderColumns.length} className="border border-yellow-300 px-4 py-8 text-center text-slate-400">
                      Select a purchase to load orders
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* ==================== LR DETAILS SECTION - One per Order ==================== */}
        <div className="mt-4">
          <div className="text-sm font-extrabold text-slate-900 mb-2">LR Details (One per Order)</div>
        </div>
        
        {lrEntries.map((lr, lrIndex) => {
          const availableLRs = getAvailableLRsForOrder(lr.orderNo);
          const order = purchaseOrders.find(o => o.orderNo === lr.orderNo);
          const lrProducts = products.filter(p => p.lrRefId === lr._id);
          
          return (
            <div key={lr._id} className="mb-6">
              <Card 
                title={`LR Details for Order: ${lr.orderNo || `Order #${lrIndex + 1}`}`}
              >
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-12 md:col-span-3">
                    <label className="text-xs font-bold text-slate-600">LR No *</label>
                    <select
                      value={lr.lrNo}
                      onChange={(e) => handleLRSelect(lr._id, e.target.value, lr.orderNo)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-yellow-500"
                      disabled={!header.purchaseNo || availableLRs.length === 0}
                    >
                      <option value="">Select LR No for {lr.orderNo || 'Order'}</option>
                      {availableLRs.map((cn, idx) => (
                        <option key={idx} value={cn.lrNo}>
                          {cn.lrNo} - {cn.partyName}
                        </option>
                      ))}
                    </select>
                    {!header.purchaseNo && (
                      <div className="text-xs text-red-500 mt-1">Please select Purchase No first</div>
                    )}
                    {header.purchaseNo && lr.orderNo && availableLRs.length === 0 && !loadingLR && (
                      <div className="text-xs text-amber-500 mt-1">
                        ⚠️ No LR found for Order: {lr.orderNo}
                      </div>
                    )}
                  </div>
                  <div className="col-span-12 md:col-span-2">
                    <label className="text-xs font-bold text-slate-600">LR Date</label>
                    <input 
                      type="text" 
                      value={lr.lrDate} 
                      readOnly
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed" 
                    />
                  </div>
                  <div className="col-span-12 md:col-span-2">
                    <label className="text-xs font-bold text-slate-600">Order No</label>
                    <input 
                      type="text" 
                      value={lr.orderNo} 
                      readOnly
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed" 
                    />
                  </div>
                  <div className="col-span-12 md:col-span-2">
                    <label className="text-xs font-bold text-slate-600">Party Name</label>
                    <input 
                      type="text" 
                      value={order?.partyName || '-'} 
                      readOnly
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed" 
                    />
                  </div>
                  
                  {/* NEW FIELD: In Person / Parsal */}
                  <div className="col-span-12 md:col-span-3">
                    <label className="text-xs font-bold text-slate-600">In Person / Parsal *</label>
                    <select
                      value={lr.inPersonParsal || ""}
                      onChange={(e) => updateLREntry(lr._id, 'inPersonParsal', e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-yellow-500"
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="In Person">In Person</option>
                      <option value="Parsal">Parsal</option>
                    </select>
                    <p className="text-xs text-slate-400 mt-1">Select delivery type</p>
                  </div>
                  
                  {/* Docket No field - moved after In Person/Parsal */}
                  <div className="col-span-12 md:col-span-3">
                    <label className="text-xs font-bold text-slate-600">Docket No</label>
                    <input 
                      type="text" 
                      value={lr.docketNo} 
                      onChange={(e) => updateLREntry(lr._id, 'docketNo', e.target.value)} 
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-yellow-500" 
                      placeholder="48126412412"
                    />
                  </div>
                  
                  <div className="col-span-12 md:col-span-2">
                    <label className="text-xs font-bold text-slate-600">POD Date</label>
                    <input 
                      type="date" 
                      value={lr.podDate} 
                      onChange={(e) => updateLREntry(lr._id, 'podDate', e.target.value)} 
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-yellow-500" 
                    />
                  </div>
                  
                  <div className="col-span-12 md:col-span-3">
                    <label className="text-xs font-bold text-slate-600">POD Upload</label>
                    <div className="mt-1 flex gap-2 items-center">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handlePodUpload(e, lr._id)}
                        className={`w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-yellow-500 ${
                          lr.podUpload === 'UPLOADED' 
                            ? 'bg-gray-100 cursor-not-allowed' 
                            : 'bg-white border-slate-200'
                        }`}
                        disabled={lr.podUpload === 'UPLOADED'}
                      />
                      {lr.podUpload === 'UPLOADED' && (
                        <span className="text-green-600 text-sm flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Uploaded
                        </span>
                      )}
                      {lr.podUpload === 'UPLOADING' && (
                        <span className="text-yellow-600 text-sm flex items-center gap-1">
                          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Uploading...
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {lr.podUpload === 'UPLOADED' 
                        ? 'POD file uploaded - Received status locked' 
                        : 'Upload PDF or Image (Max 5MB)'}
                    </p>
                  </div>
                  
             <div className="col-span-12 md:col-span-2">
  <label className="text-xs font-bold text-slate-600">POD Received</label>
  <input 
    type="text"
    value={lr.podUpload === 'UPLOADED' ? 'Received' : lr.podReceived}
    readOnly
    className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed"
  />
  {lr.podUpload === 'UPLOADED' && (
    <p className="text-xs text-green-600 mt-1">✓ Auto-set to Received after upload</p>
  )}
</div>
                </div>

                {/* ==================== PRODUCTS TABLE ==================== */}
                <div className="mt-4">
                  <div className="text-sm font-extrabold text-slate-900 mb-2">Products for LR: {lr.lrNo || 'Not Selected'}</div>
                  <div className="overflow-auto rounded-xl border border-yellow-300">
                    <table className="min-w-max w-full text-sm">
                      <thead className="sticky top-0 bg-yellow-400 z-10">
                        <tr>
                          {productColumns.map((col) => (
                            <th
                              key={col.key}
                              className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center"
                              style={{ minWidth: col.minWidth }}
                            >
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {lrProducts.length > 0 ? lrProducts.map((product, idx) => (
                          <tr key={product._id || idx} className="hover:bg-yellow-50 even:bg-slate-50">
                            <td className="border border-yellow-300 px-2 py-2 text-slate-700">{product.productName || '-'}</td>
                            <td className="border border-yellow-300 px-2 py-2 text-slate-700 text-right">{product.totalPkgs || '-'}</td>
                            <td className="border border-yellow-300 px-2 py-2 text-slate-700">{product.pkgsType || '-'}</td>
                            <td className="border border-yellow-300 px-2 py-2 text-slate-700">{product.uom || '-'}</td>
                            <td className="border border-yellow-300 px-2 py-2 text-slate-700">{product.packSize || '-'}</td>
                            <td className="border border-yellow-300 px-2 py-2 text-slate-700">{product.skuSize || '-'}</td>
                            <td className="border border-yellow-300 px-2 py-2 text-slate-700 text-right">{product.wtLtr || '-'}</td>
                            <td className="border border-yellow-300 px-2 py-2 text-slate-700 text-right">{product.actualWt || '-'}</td>
                            <td className="border border-yellow-300 px-2 py-2">
                              <select
                                value={product.deliveryStatus || ''}
                                onChange={(e) => updateProduct(product._id, 'deliveryStatus', e.target.value)}
                                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-yellow-500"
                              >
                                <option value="">Select</option>
                                <option value="Damaged">Damaged</option>
                                <option value="Bags Short">Bags Short</option>
                                <option value="NA">NA</option>
                                <option value="Box">Box</option>
                              </select>
                            </td>
                            <td className="border border-yellow-300 px-2 py-2">
                              <input
                                type="text"
                                value={product.deduction || ''}
                                onChange={(e) => updateProduct(product._id, 'deduction', e.target.value)}
                                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-yellow-500"
                                placeholder="5 Bags"
                              />
                            </td>
                            <td className="border border-yellow-300 px-2 py-2">
                              <input
                                type="number"
                                value={product.value || ''}
                                onChange={(e) => updateProduct(product._id, 'value', e.target.value)}
                                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-yellow-500"
                                placeholder="2000"
                              />
                             </td>
                           </tr>
                        )) : (
                          <tr>
                            <td colSpan={productColumns.length} className="border border-yellow-300 px-4 py-8 text-center text-slate-400">
                              {lr.lrNo ? 
                                `No products found for LR ${lr.lrNo}` : 
                                `Select an LR No for Order ${lr.orderNo || 'this order'} to load products`}
                             </td>
                           </tr>
                        )}
                      </tbody>
                      {lrProducts.length > 0 && (
                        <tfoot className="bg-yellow-100">
                          <tr>
                            <td colSpan="7" className="border border-yellow-300 px-3 py-2 text-right font-bold">Total Actual WT for this LR:</td>
                            <td className="border border-yellow-300 px-3 py-2 font-bold text-blue-700">
                              {lrProducts.reduce((sum, p) => sum + num(p.actualWt), 0)} MT
                             </td>
                            <td colSpan="3" className="border border-yellow-300 px-3 py-2"></td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>
              </Card>
            </div>
          );
        })}

        {/* ==================== VENDOR & FINANCIAL SUMMARY ==================== */}
        <Card title="Vendor & Financial Summary">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Vendor Name</label>
              <input type="text" value={vendorFinancial.vendorName} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm" />
            </div>
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Vendor Code</label>
              <input type="text" value={vendorFinancial.vendorCode} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm" />
            </div>
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Due Days</label>
              <input type="text" value={vendorFinancial.dueDays ? `${vendorFinancial.dueDays} days` : '0 days'} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm font-bold text-blue-700" />
            </div>
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Total</label>
              <input type="text" value={`₹${vendorFinancial.total.toLocaleString()}`} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm font-bold text-green-700" />
            </div>
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Advance</label>
              <input type="number" value={vendorFinancial.advance} onChange={(e) => setVendorFinancial({ ...vendorFinancial, advance: num(e.target.value) })} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-yellow-500" />
            </div>
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Balance</label>
              <input type="text" value={`₹${(vendorFinancial.total - vendorFinancial.advance).toLocaleString()}`} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm" />
            </div>
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">PO - Deduction (from Purchase)</label>
              <input 
                type="text" 
                value={`₹${vendorFinancial.poDeduction.toLocaleString()}`} 
                readOnly 
                className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" 
              />
              <p className="text-xs text-slate-400 mt-1">Auto-filled from Purchase Panel</p>
            </div>
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">POD - Deduction</label>
              <input 
                type="number" 
                value={vendorFinancial.podDeduction} 
                onChange={(e) => setVendorFinancial({ ...vendorFinancial, podDeduction: num(e.target.value) })} 
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-yellow-500" 
                placeholder="Enter POD deduction"
              />
            </div>
            
            {/* Total POD Deduction */}
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Total POD Deduction</label>
              <input 
                type="text" 
                value={`₹${(vendorFinancial.poDeduction + vendorFinancial.podDeduction).toLocaleString()}`} 
                readOnly 
                className="mt-1 w-full rounded-xl border border-purple-200 bg-purple-50 px-3 py-2 text-sm font-bold text-purple-700" 
              />
              <p className="text-xs text-slate-400 mt-1">PO Deduction + POD Deduction</p>
            </div>
            
            {/* Final Balance */}
            <div className="col-span-12 md:col-span-4">
              <label className="text-xs font-bold text-slate-600">Final Balance</label>
              <input 
                type="text" 
                value={`₹${(vendorFinancial.total - vendorFinancial.advance - (vendorFinancial.poDeduction + vendorFinancial.podDeduction)).toLocaleString()}`} 
                readOnly 
                className="mt-1 w-full rounded-xl border border-purple-200 bg-purple-50 px-3 py-2 text-sm font-bold text-purple-700" 
              />
              <p className="text-xs text-slate-400 mt-1">Total - Advance - POD Deduction</p>
            </div>
          </div>
        </Card>
        
        {/* ==================== POD STATUS SECTION with Auto Date Calculations ==================== */}
        <Card title="POD Status & Payment">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Last POD Date</label>
              <input 
                type="date" 
                value={podStatusSection.lastPodDate} 
                readOnly
                className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" 
              />
              <p className="text-xs text-blue-600 mt-1">
                Auto-set from latest LR POD Date
              </p>
            </div>
            
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">POD Status</label>
              <select 
                value={podStatusSection.podStatus || "Pending"} 
                disabled
                className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm outline-none cursor-not-allowed"
              >
                <option value="Pending">Pending</option>
                <option value="Clear & Ok">Clear & Ok</option>
                <option value="Deductions">Deductions</option>
              </select>
            </div>
            
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Due Date</label>
              <input 
                type="date" 
                value={podStatusSection.dueDate} 
                readOnly
                className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" 
              />
              <p className="text-xs text-blue-600 mt-1">
                Last POD Date + Due Days
              </p>
            </div>
            
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Payment Date</label>
              <input 
                type="date" 
                value={podStatusSection.paymentDate} 
                readOnly
                className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm cursor-not-allowed" 
              />
              <p className="text-xs text-green-600 mt-1">
                Due Date + 3 days
              </p>
            </div>
            
            <div className="col-span-12 md:col-span-4">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={podStatusSection.acknowledgementMail} 
                  onChange={(e) => setPodStatusSection({ ...podStatusSection, acknowledgementMail: e.target.checked })} 
                  className="rounded border-slate-300" 
                />
                Acknowledgement Mail Sent
              </label>
              <p className="text-xs text-slate-500 mt-1">Shot a Mail on the Registered Vendor mail ID</p>
            </div>
            
            <div className="col-span-12">
              <label className="text-xs font-bold text-slate-600">Remarks</label>
              <textarea 
                value={remarks} 
                onChange={(e) => setRemarks(e.target.value)} 
                rows={2} 
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-yellow-500" 
                placeholder="Enter remarks..." 
              />
            </div>
          </div>
        </Card>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-12 gap-4 mt-4">
          <div className="col-span-12 md:col-span-3">
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200">
              <div className="text-xs text-slate-500">Total Quantity</div>
              <div className="text-2xl font-bold text-yellow-700">{calculateTotalQuantity()} PKGS</div>
            </div>
          </div>
          <div className="col-span-12 md:col-span-3">
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200">
              <div className="text-xs text-slate-500">Total Actual WT</div>
              <div className="text-2xl font-bold text-yellow-700">{calculateTotalActualWt()} MT</div>
            </div>
          </div>
          <div className="col-span-12 md:col-span-3">
        
          </div>
          <div className="col-span-12 md:col-span-3">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
              <div className="text-xs text-slate-500">Balance</div>
              <div className="text-2xl font-bold text-purple-700">
                ₹{(vendorFinancial.total - vendorFinancial.advance - (vendorFinancial.poDeduction + vendorFinancial.podDeduction)).toLocaleString()}
              </div>
              <p className="text-xs text-slate-400 mt-1">Total - Advance - POD Deduction</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}