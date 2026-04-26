"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
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

export default function ApprovePOD() {
  const router = useRouter();
  const params = useParams();
  const podId = params.id;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [podData, setPodData] = useState(null);
  const [supplierEmail, setSupplierEmail] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [supplierCode, setSupplierCode] = useState("");
  
  // ==================== READONLY STATE (from DB) ====================
  const [header, setHeader] = useState({
    podNo: "",
    purchaseNo: "",
    pricingSerialNo: "",
    branch: "",
    date: "",
    delivery: "Normal"
  });

  const [billing, setBilling] = useState({
    billingType: "Multi - Order",
    noOfLoadingPoints: "",
    noOfDroppingPoint: ""
  });

  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [lrEntries, setLrEntries] = useState([]);
  const [products, setProducts] = useState([]);
  const [vendorFinancial, setVendorFinancial] = useState({
    vendorName: "",
    vendorEmail: "",
    vendorCode: "",
    total: 0,
    advance: 0,
    balance: 0,
    poDeduction: 0,
    finalBalance: 0
  });

  // ==================== EDITABLE STATE ====================
  const [podStatusSection, setPodStatusSection] = useState({
    lastPodDate: "",
    podStatus: "Pending",
    dueDate: "",
    paymentDate: "",
    acknowledgementMail: false,
    note: ""
  });

  const [remarks, setRemarks] = useState("");

  // Product Columns
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

  // Order Columns
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

  // Fetch POD data
  useEffect(() => {
    if (podId) {
      fetchPODData();
    }
  }, [podId]);

  const fetchPODData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/pod-panel?id=${podId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (data.success && data.data) {
        const pod = data.data;
        setPodData(pod);
        
        // Set header (readonly)
        setHeader({
          podNo: pod.podNo || "",
          purchaseNo: pod.purchaseNo || "",
          pricingSerialNo: pod.pricingSerialNo || "",
          branch: pod.header?.branch || "",
          date: pod.header?.date ? new Date(pod.header.date).toISOString().split('T')[0] : "",
          delivery: pod.header?.delivery || "Normal"
        });
        
        // Set billing (readonly)
        if (pod.billing) {
          setBilling({
            billingType: pod.billing.billingType || "Multi - Order",
            noOfLoadingPoints: pod.billing.noOfLoadingPoints || "",
            noOfDroppingPoint: pod.billing.noOfDroppingPoint || ""
          });
        }
        
        // Set purchase orders (readonly)
        if (pod.purchaseOrders) {
          setPurchaseOrders(pod.purchaseOrders);
        }
        
        // Set LR entries (readonly)
        if (pod.lrEntries) {
          setLrEntries(pod.lrEntries);
        }
        
        // Set products (readonly)
        if (pod.products) {
          setProducts(pod.products);
        }
        
        // Get vendor code from purchase
        const vendorCode = pod.vendorFinancial?.vendorCode || pod.purchaseDetails?.vendorCode || "";
        const vendorName = pod.vendorFinancial?.vendorName || pod.purchaseDetails?.vendorName || "";
        
        setSupplierCode(vendorCode);
        setSupplierName(vendorName);
        
        // Set vendor financial (readonly)
        if (pod.vendorFinancial) {
          setVendorFinancial({
            vendorName: vendorName,
            vendorEmail: pod.vendorFinancial.vendorEmail || "",
            vendorCode: vendorCode,
            total: pod.vendorFinancial.total || 0,
            advance: pod.vendorFinancial.advance || 0,
            balance: pod.vendorFinancial.balance || 0,
            poDeduction: pod.vendorFinancial.poDeduction || 0,
            finalBalance: pod.vendorFinancial.finalBalance || 0
          });
        }
        
        // Try to get supplier email from vendors API using vendor code
        if (vendorCode) {
          try {
            const vendorsRes = await fetch(`/api/suppliers?supplierCode=${vendorCode}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const vendorsData = await vendorsRes.json();
            console.log("Suppliers API response:", vendorsData);
            
            if (vendorsData.success && vendorsData.data && vendorsData.data.length > 0) {
              const supplier = vendorsData.data[0];
              const email = supplier.emailId || supplier.email || supplier.contactEmail || "";
              console.log("Found supplier email:", email);
              setSupplierEmail(email);
              setSupplierName(supplier.supplierName || vendorName);
              setVendorFinancial(prev => ({ ...prev, vendorEmail: email }));
            } else {
              console.log("No supplier found for code:", vendorCode);
              setSupplierName(vendorName);
            }
          } catch (err) {
            console.error("Error fetching supplier email:", err);
            setSupplierName(vendorName);
          }
        } else {
          setSupplierName(vendorName);
        }
        
        // Set pod status section (editable fields)
        if (pod.podStatusSection) {
          setPodStatusSection({
            lastPodDate: pod.podStatusSection.lastPodDate || "",
            podStatus: pod.podStatusSection.podStatus || "",
            dueDate: pod.podStatusSection.dueDate || "",
            paymentDate: pod.podStatusSection.paymentDate || "",
            acknowledgementMail: pod.podStatusSection.acknowledgementMail || false,
            note: pod.podStatusSection.note || ""
          });
        }
        
        // Set remarks (editable)
        if (pod.remarks) {
          setRemarks(pod.remarks);
        }
      }
    } catch (error) {
      console.error('Error fetching POD:', error);
      alert('Failed to load POD data');
    } finally {
      setLoading(false);
    }
  };

  // Send Email Function
  const sendEmailToSupplier = async () => {
    if (!supplierEmail) {
      alert("❌ No supplier email found. Please add email in supplier master first.\n\nGo to Supplier Management → Edit Supplier → Add Email ID");
      return;
    }

    setSendingEmail(true);
    
    try {
      const totalPodDeduction = products.reduce((sum, p) => sum + num(p.value), 0);
      const finalBalance = vendorFinancial.total - vendorFinancial.advance - vendorFinancial.poDeduction - totalPodDeduction;
      const totalQuantity = products.reduce((sum, p) => sum + num(p.totalPkgs), 0);
      const totalActualWt = products.reduce((sum, p) => sum + num(p.actualWt), 0);
      
      const emailContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Proof of Delivery (POD) - ${header.podNo}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 900px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #f0b90b, #e6a800); padding: 20px; text-align: center; color: #1a1a1a; }
            .header h1 { margin: 0; font-size: 24px; }
            .header p { margin: 5px 0 0; opacity: 0.9; }
            .content { padding: 20px; }
            h2 { color: #333; font-size: 18px; margin-top: 20px; margin-bottom: 10px; border-left: 4px solid #f0b90b; padding-left: 10px; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 15px; font-size: 13px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .amount { font-weight: bold; color: #8B5CF6; }
            .footer { background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 11px; color: #666; border-top: 1px solid #eee; }
            .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
            .badge-success { background: #d4edda; color: #155724; }
            .badge-warning { background: #fff3cd; color: #856404; }
            .badge-danger { background: #f8d7da; color: #721c24; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📋 Proof of Delivery (POD)</h1>
              <p>${header.podNo}</p>
            </div>
            <div class="content">
              
              <h2>📄 POD Information</h2>
              <table>
                <tr><th style="width:40%">POD No</th><td><strong>${header.podNo}</strong></td></tr>
                <tr><th>Purchase No</th><td>${header.purchaseNo}</td></tr>
                <tr><th>Branch</th><td>${header.branch}</td></tr>
                <tr><th>Date</th><td>${header.date}</td></tr>
                <tr><th>Delivery</th><td>${header.delivery}</td></tr>
              </table>

              <h2>📦 Orders</h2>
              <table>
                <thead>
                  <tr><th>Order No</th><th>Party Name</th><th>Order Type</th><th>From</th><th>To</th><th>Weight</th></tr>
                </thead>
                <tbody>
                  ${purchaseOrders.map(order => `
                    <tr>
                      <td>${order.orderNo || '-'}</td>
                      <td>${order.partyName || '-'}</td>
                      <td>${order.orderType || '-'}</td>
                      <td>${order.from || '-'}</td>
                      <td>${order.to || '-'}</td>
                      <td>${order.weight || 0}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              <h2>🚛 LR Details</h2>
              <table>
                <thead>
                  <tr><th>LR No</th><th>LR Date</th><th>Order No</th><th>Party Name</th><th>In Person / Parsal</th><th>POD Date</th><th>POD Received</th></tr>
                </thead>
                <tbody>
                  ${lrEntries.map(lr => `
                    <tr>
                      <td>${lr.lrNo || '-'}</td>
                      <td>${lr.lrDate || '-'}</td>
                      <td>${lr.orderNo || '-'}</td>
                      <td>${purchaseOrders.find(o => o.orderNo === lr.orderNo)?.partyName || '-'}</td>
                      <td><span class="badge badge-success">${lr.inPersonParsal || '-'}</span></td>
                      <td>${lr.podDate || '-'}</td>
                      <td><span class="badge ${lr.podReceived === 'Received' ? 'badge-success' : 'badge-warning'}">${lr.podReceived || 'Pending'}</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              <h2>📊 Products Summary</h2>
              <table>
                <thead>
                  <tr><th>Product Name</th><th>PKGS</th><th>Type</th><th>UOM</th><th>Actual WT</th><th>Delivery Status</th><th>Deduction</th><th>Value</th></tr>
                </thead>
                <tbody>
                  ${products.map(product => `
                    <tr>
                      <td>${product.productName || '-'}</td>
                      <td>${product.totalPkgs || '-'}</td>
                      <td>${product.pkgsType || '-'}</td>
                      <td>${product.uom || '-'}</td>
                      <td>${product.actualWt || '-'}</td>
                      <td>${product.deliveryStatus || '-'}</td>
                      <td>${product.deduction || '-'}</td>
                      <td>₹${num(product.value).toLocaleString()}</td>
                    </tr>
                  `).join('')}
                </tbody>
                <tfoot>
                  <tr style="background:#f0f0f0; font-weight:bold;">
                    <td colspan="4">Totals:</td>
                    <td>${totalActualWt} MT</td>
                    <td colspan="2"></td>
                    <td>₹${totalPodDeduction.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>

              <h2>💰 Financial Summary</h2>
              <table>
                <tr><th style="width:40%">Vendor Name</th><td>${supplierName || vendorFinancial.vendorName}</td></tr>
                <tr><th>Vendor Code</th><td>${vendorFinancial.vendorCode || '-'}</td></tr>
                <tr><th>Total Amount</th><td class="amount">₹${vendorFinancial.total?.toLocaleString() || 0}</td></tr>
                <tr><th>Advance Paid</th><td>₹${vendorFinancial.advance?.toLocaleString() || 0}</td></tr>
                <tr><th>PO Deduction</th><td>₹${vendorFinancial.poDeduction?.toLocaleString() || 0}</td></tr>
                <tr><th>POD Deduction</th><td class="amount">₹${totalPodDeduction.toLocaleString()}</td></tr>
                <tr><th>Total Actual WT</th><td>${totalActualWt} MT</td></tr>
                <tr><th>Final Balance</th><td class="amount">₹${finalBalance.toLocaleString()}</td></tr>
              </table>

              <h2>📅 POD Status</h2>
              <table>
                <tr><th style="width:40%">Last POD Date</th><td>${podStatusSection.lastPodDate || '-'}</td></tr>
                <tr><th>POD Status</th><td><span class="badge ${podStatusSection.podStatus === 'Clear & Ok' ? 'badge-success' : 'badge-warning'}">${podStatusSection.podStatus || 'Pending'}</span></td></tr>
                <tr><th>Due Date</th><td>${podStatusSection.dueDate || '-'}</td></tr>
                <tr><th>Payment Date</th><td>${podStatusSection.paymentDate || '-'}</td></tr>
                <tr><th>Remarks</th><td>${remarks || '-'}</td></tr>
              </table>
            </div>
            <div class="footer">
              <p>This is an auto-generated email from the ERP System. Please contact your account manager for any queries.</p>
              <p>Generated on: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const payload = {
        to: supplierEmail,
        subject: `Proof of Delivery (POD) - ${header.podNo}`,
        html: emailContent,
        podId: podId,
        podNo: header.podNo
      };

      const token = localStorage.getItem('token');
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        alert(`✅ Email sent successfully to ${supplierEmail}`);
        setPodStatusSection(prev => ({ ...prev, acknowledgementMail: true }));
      } else {
        alert(data.message || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert(`❌ Error sending email: ${error.message}`);
    } finally {
      setSendingEmail(false);
    }
  };

  // Handle Approval Submit
  const handleApprove = async () => {
    if (!podStatusSection.podStatus) {
      alert("Please select POD Received status");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      
      const payload = {
        id: podId,
        podStatusSection: {
          ...podStatusSection,
          podStatus: podStatusSection.podStatus
        },
        remarks: remarks,
        approvalStatus: "Approved",
        approvedBy: "Approver",
        approvedAt: new Date().toISOString()
      };

      const res = await fetch('/api/pod-panel', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        alert(`✅ POD ${podStatusSection.podStatus === 'Received' ? 'Approved' : 'Updated'} successfully!`);
        router.push('/admin/ProofOfDelivery');
      } else {
        alert(data.message || 'Failed to update approval');
      }
    } catch (error) {
      console.error('Error updating approval:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Calculations for display
  const calculateTotalActualWt = () => {
    return products.reduce((sum, p) => sum + num(p.actualWt), 0);
  };

  const calculateTotalQuantity = () => {
    return products.reduce((sum, p) => sum + num(p.totalPkgs), 0);
  };

  const calculatePODDeduction = () => {
    return products.reduce((sum, p) => sum + num(p.value), 0);
  };

  const calculateFinalBalance = () => {
    const total = vendorFinancial.total;
    const advance = vendorFinancial.advance;
    const poDeduction = vendorFinancial.poDeduction;
    const podDeduction = calculatePODDeduction();
    return total - advance - poDeduction - podDeduction;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
        <p className="mt-4 text-slate-600">Loading POD data...</p>
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
                onClick={() => router.push('/admin/ProofOfDelivery')}
                className="text-yellow-600 hover:text-yellow-800 font-medium text-sm flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to List
              </button>
              <div className="text-lg font-extrabold text-slate-900">Approve POD: {header.podNo}</div>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Purchase No: {header.purchaseNo} | Vendor: {supplierName || vendorFinancial.vendorName}
              {supplierEmail && <span className="ml-2 text-green-600">📧 {supplierEmail}</span>}
              {supplierCode && <span className="ml-2 text-blue-600">🔑 {supplierCode}</span>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleApprove}
              disabled={saving}
              className={`rounded-xl px-5 py-2 text-sm font-bold text-white transition ${
                saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {saving ? 'Submitting...' : 'Submit Approval'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-full p-4">
        
        {/* Summary Cards */}
        <div className="grid grid-cols-12 gap-4 mb-4">
          <div className="col-span-12 md:col-span-3">
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200">
              <div className="text-xs text-slate-500">POD No</div>
              <div className="text-xl font-bold text-slate-800">{header.podNo}</div>
            </div>
          </div>
          <div className="col-span-12 md:col-span-3">
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200">
              <div className="text-xs text-slate-500">Purchase No</div>
              <div className="text-xl font-bold text-slate-800">{header.purchaseNo}</div>
            </div>
          </div>
          <div className="col-span-12 md:col-span-3">
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200">
              <div className="text-xs text-slate-500">Total Amount</div>
              <div className="text-xl font-bold text-green-700">₹{vendorFinancial.total?.toLocaleString() || 0}</div>
            </div>
          </div>
          <div className="col-span-12 md:col-span-3">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
              <div className="text-xs text-slate-500">Final Balance</div>
              <div className="text-xl font-bold text-purple-700">₹{calculateFinalBalance().toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* ==================== HEADER INFORMATION (Readonly) ==================== */}
        <Card title="POD Information">
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">POD No</label>
              <input type="text" value={header.podNo} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm" />
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
              <input type="text" value={header.date} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm" />
            </div>
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Delivery</label>
              <input type="text" value={header.delivery} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm" />
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
                  <td className="border border-yellow-300 px-2 py-2 text-slate-700">{billing.billingType || '-'}</td>
                  <td className="border border-yellow-300 px-2 py-2 text-slate-700">{billing.noOfLoadingPoints || '-'}</td>
                  <td className="border border-yellow-300 px-2 py-2 text-slate-700">{billing.noOfDroppingPoint || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* ==================== ORDERS TABLE (Readonly) ==================== */}
        <Card title="Orders">
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
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* ==================== LR DETAILS SECTION (Readonly with In Person/Parsal field) ==================== */}
        {lrEntries.map((lr, lrIndex) => {
          const lrProducts = products.filter(p => p.lrRefId === lr._id);
          const order = purchaseOrders.find(o => o.orderNo === lr.orderNo);
          
          return (
            <div key={lr._id} className="mb-6">
              <Card title={`LR Details for Order: ${lr.orderNo || `Order #${lrIndex + 1}`}`}>
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-12 md:col-span-3">
                    <label className="text-xs font-bold text-slate-600">LR No</label>
                    <input type="text" value={lr.lrNo} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm" />
                  </div>
                  <div className="col-span-12 md:col-span-2">
                    <label className="text-xs font-bold text-slate-600">LR Date</label>
                    <input type="text" value={lr.lrDate} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm" />
                  </div>
                  <div className="col-span-12 md:col-span-2">
                    <label className="text-xs font-bold text-slate-600">Order No</label>
                    <input type="text" value={lr.orderNo} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm" />
                  </div>
                  <div className="col-span-12 md:col-span-2">
                    <label className="text-xs font-bold text-slate-600">Party Name</label>
                    <input type="text" value={order?.partyName || '-'} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm" />
                  </div>
                  
                  {/* NEW FIELD: In Person / Parsal (Readonly) */}
                  <div className="col-span-12 md:col-span-3">
                    <label className="text-xs font-bold text-slate-600">In Person / Parsal</label>
                    <input 
                      type="text" 
                      value={lr.inPersonParsal || '-'} 
                      readOnly 
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm font-medium text-blue-700" 
                    />
                  </div>
                  
                  <div className="col-span-12 md:col-span-3">
                    <label className="text-xs font-bold text-slate-600">Docket No</label>
                    <input type="text" value={lr.docketNo} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm" />
                  </div>
                  <div className="col-span-12 md:col-span-2">
                    <label className="text-xs font-bold text-slate-600">POD Date</label>
                    <input type="text" value={lr.podDate} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm" />
                  </div>
                  <div className="col-span-12 md:col-span-3">
                    <label className="text-xs font-bold text-slate-600">POD Upload</label>
                    <div className="mt-1">
                      {lr.podUpload === 'UPLOADED' ? (
                        <span className="text-green-600 text-sm flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Uploaded
                        </span>
                      ) : (
                        <span className="text-gray-500 text-sm">Not Uploaded</span>
                      )}
                    </div>
                  </div>
                  <div className="col-span-12 md:col-span-2">
                    <label className="text-xs font-bold text-slate-600">POD Received</label>
                    <input type="text" value={lr.podReceived} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm" />
                  </div>
                </div>

                {/* Products Table (Readonly) */}
                <div className="mt-4">
                  <div className="text-sm font-extrabold text-slate-900 mb-2">Products</div>
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
                            <td className="border border-yellow-300 px-2 py-2 text-slate-700">{product.deliveryStatus || '-'}</td>
                            <td className="border border-yellow-300 px-2 py-2 text-slate-700">{product.deduction || '-'}</td>
                            <td className="border border-yellow-300 px-2 py-2 text-slate-700 text-right">{product.value || '-'}</td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={productColumns.length} className="border border-yellow-300 px-4 py-8 text-center text-slate-400">
                              No products found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
            </div>
          );
        })}

        {/* ==================== VENDOR & FINANCIAL SUMMARY (Readonly) ==================== */}
        <Card title="Vendor & Financial Summary">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">Vendor Name</label>
              <input type="text" value={supplierName || vendorFinancial.vendorName} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm" />
            </div>
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Vendor Code</label>
              <input type="text" value={supplierCode || vendorFinancial.vendorCode || '-'} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm" />
            </div>
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Total</label>
              <input type="text" value={`₹${vendorFinancial.total?.toLocaleString() || 0}`} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm" />
            </div>
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Advance</label>
              <input type="text" value={`₹${vendorFinancial.advance?.toLocaleString() || 0}`} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm" />
            </div>
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Balance</label>
              <input type="text" value={`₹${vendorFinancial.balance?.toLocaleString() || 0}`} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm" />
            </div>
            <div className="col-span-12 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">PO - Deduction</label>
              <input type="text" value={`₹${vendorFinancial.poDeduction?.toLocaleString() || 0}`} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm" />
            </div>
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">POD - Deduction</label>
              <input type="text" value={`₹${calculatePODDeduction().toLocaleString()}`} readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm" />
            </div>
            <div className="col-span-12 md:col-span-4">
              <label className="text-xs font-bold text-slate-600">Final Balance</label>
              <input type="text" value={`₹${calculateFinalBalance().toLocaleString()}`} readOnly className="mt-1 w-full rounded-xl border border-purple-200 bg-purple-50 px-3 py-2 text-sm font-bold text-purple-700" />
            </div>
          </div>
        </Card>

        {/* ==================== APPROVAL SECTION (Editable Fields Only) ==================== */}
        <Card title="Approval">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-3">
              <label className="text-xs font-bold text-slate-600">POD Received Status *</label>
              <select
                value={podStatusSection.podStatus}
                onChange={(e) => setPodStatusSection({ ...podStatusSection, podStatus: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
              >
                <option value="">Select Status</option>
                <option value="Pending">Pending</option>
                <option value="Clear & Ok">Clear & Ok</option>
                <option value="Deductions">Deductions</option>
              </select>
            </div>

            <div className="col-span-12 md:col-span-5">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-2 mb-1">
                <input 
                  type="checkbox" 
                  checked={podStatusSection.acknowledgementMail} 
                  onChange={(e) => setPodStatusSection({ ...podStatusSection, acknowledgementMail: e.target.checked })} 
                  className="rounded border-slate-300 w-4 h-4"
                />
                Acknowledgement Mail Sent
              </label>
              <div className="flex gap-2 items-center">
                <p className="text-xs text-slate-500 flex-1">Shot a Mail on the Registered Vendor mail ID</p>
                <button
                  onClick={sendEmailToSupplier}
                  disabled={sendingEmail || !supplierEmail}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    sendingEmail || !supplierEmail
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {sendingEmail ? (
                    <>
                      <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Send Email
                    </>
                  )}
                </button>
              </div>
              {!supplierEmail && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-700">
                    ⚠️ No email found for supplier. Please go to Supplier Management and add email ID.
                  </p>
                  <button
                    onClick={() => window.open('/admin/supplier', '_blank')}
                    className="mt-1 text-xs text-blue-600 hover:underline"
                  >
                    Go to Supplier Management →
                  </button>
                </div>
              )}
              {supplierEmail && (
                <p className="text-xs text-green-600 mt-1">📧 Email will be sent to: {supplierEmail}</p>
              )}
            </div>

            <div className="col-span-12">
              <label className="text-xs font-bold text-slate-600">Remarks</label>
              <textarea 
                value={remarks} 
                onChange={(e) => setRemarks(e.target.value)} 
                rows={3} 
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200" 
                placeholder="Enter approval remarks..."
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
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200">
              <div className="text-xs text-slate-500">POD Deduction</div>
              <div className="text-2xl font-bold text-red-600">₹{calculatePODDeduction().toLocaleString()}</div>
            </div>
          </div>
          <div className="col-span-12 md:col-span-3">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
              <div className="text-xs text-slate-500">Final Balance</div>
              <div className="text-2xl font-bold text-purple-700">₹{calculateFinalBalance().toLocaleString()}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}