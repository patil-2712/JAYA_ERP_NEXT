"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

/* =========================
  CONSTANTS
========================= */
const ORDER_TYPES = ["Sales", "STO Order", "Export", "Import"];
const BILLING_TYPES = ["Single - Order", "Multi - Order"];
const DELIVERY_TYPES = ["Urgent", "Normal", "Express", "Scheduled"];
const PRICE_LISTS = ["INDORAMA GDM MULTI P", "SQM GDM MULTI P", "Nil Price list"];
const APPROVAL_STATUS = ["Pending", "Approved", "Rejected", "Completed"];
const RATE_APPROVAL_TYPES = ["Contract Rates", "Mail Approval Rate"];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/* =========================
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

function Input({ label, value, col = "", type = "text", readOnly = false }) {
  return (
    <div className={col}>
      <label className="text-xs font-bold text-slate-600">{label}</label>
      <div className={`mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm ${
        readOnly ? 'bg-slate-50 text-slate-700' : 'bg-white'
      }`}>
        {value || "-"}
      </div>
    </div>
  );
}

function Select({ label, value, options = [], col = "", readOnly = false }) {
  return (
    <div className={col}>
      <label className="text-xs font-bold text-slate-600">{label}</label>
      <div className={`mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm ${
        readOnly ? 'bg-slate-50 text-slate-700' : 'bg-white'
      }`}>
        {value || "-"}
      </div>
    </div>
  );
}

/* =========================
  Editable Select for Approval Section
========================= */
function EditableSelect({ label, value, onChange, options = [], col = "" }) {
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

function EditableInput({ label, value, onChange, col = "", type = "text", placeholder = "" }) {
  return (
    <div className={col}>
      <label className="text-xs font-bold text-slate-600">{label}</label>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
      />
    </div>
  );
}

/* =========================
  Orders Table Component (Read-only)
========================= */
function OrdersTable({ rows }) {
  const columns = [
    { key: "orderNo", label: "Order No" },
    { key: "partyName", label: "Party Name" },
    { key: "plantCode", label: "Plant Code" },
    { key: "plantName", label: "Plant Name" },
    { key: "plantCodeValue", label: "Plant Code Value" },
    { key: "orderType", label: "Order Type" },
    { key: "pinCode", label: "Pin Code" },
    { key: "country", label: "Country" },
    { key: "state", label: "State" },
    { key: "district", label: "District" },
    { key: "from", label: "From" },
    { key: "to", label: "To" },
    { key: "locationRate", label: "Location Rate" },
    { key: "priceList", label: "Price List" },
    { key: "weight", label: "Weight" },
    { key: "rate", label: "Rate" },
    { key: "totalAmount", label: "Total Amount" },
  ];

  return (
    <div className="overflow-auto rounded-xl border border-yellow-300">
      <table className="min-w-full w-full text-sm">
        <thead className="sticky top-0 bg-yellow-400">
          <tr>
            {columns.map((col) => (
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
          {rows.length > 0 ? (
            rows.map((row) => (
              <tr key={row._id} className="hover:bg-yellow-50 even:bg-slate-50">
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.orderNo || '-'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.partyName || '-'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.plantCode || '-'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.plantName || '-'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.plantCodeValue || '-'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.orderType || '-'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.pinCode || '-'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.countryName || row.country || '-'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.stateName || row.state || '-'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.districtName || row.district || '-'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.fromName || row.from || '-'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.toName || row.to || '-'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.locationRate || '0'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.priceList || '-'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.weight || '0'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.rate || '0'}</td>
                <td className="border border-yellow-300 px-2 py-2 text-slate-700 font-bold">₹{num(row.weight) * num(row.rate)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="border border-yellow-300 px-4 py-8 text-center text-slate-400">
                No orders added.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* =========================
  MAIN APPROVE PAGE
========================= */
export default function ApprovePricingPanel() {
  const router = useRouter();
  const params = useParams();
  const panelId = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(false);

  // State for all data
  const [pricingSerialNo, setPricingSerialNo] = useState("");
  const [header, setHeader] = useState({});
  const [billing, setBilling] = useState({});
  const [orders, setOrders] = useState([]);
  const [rateApproval, setRateApproval] = useState({
    approvalType: "Contract Rates",
    uploadFileName: "",
    approvalStatus: "Pending",
  });
  
  // Email approval state
  const [emailRecipient, setEmailRecipient] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [showEmailModal, setShowEmailModal] = useState(false);

  useEffect(() => {
    fetchPricingPanelData();
  }, []);

  const fetchPricingPanelData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch(`/api/pricing-panel?id=${panelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch pricing panel');
      }

      const panel = data.data;
      
      // Set pricing serial number
      setPricingSerialNo(panel.pricingSerialNo || "");
      
      // Set header data
      setHeader({
        pricingSerialNo: panel.pricingSerialNo || "",
        branchName: panel.branchName || "",
        branchCode: panel.branchCode || "",
        delivery: panel.delivery || "Normal",
        date: panel.date ? new Date(panel.date).toLocaleDateString('en-GB') : "",
        partyName: panel.partyName || "",
        customerCode: panel.customerCode || "",
        contactPerson: panel.contactPerson || ""
      });

      // Set billing data
      setBilling({
        billingType: panel.billingType || "Multi - Order",
        loadingPoints: panel.loadingPoints || "",
        dropPoints: panel.dropPoints || "",
        collectionCharges: panel.collectionCharges || 0,
        cancellationCharges: panel.cancellationCharges || "Nil",
        loadingCharges: panel.loadingCharges || "Nil",
        otherCharges: panel.otherCharges || 0,
      });

      // Set orders
      if (panel.orders && panel.orders.length > 0) {
        setOrders(panel.orders);
      } else {
        setOrders([]);
      }

      // Set rate approval
      if (panel.rateApproval) {
        setRateApproval({
          approvalType: panel.rateApproval.approvalType || "Contract Rates",
          uploadFileName: panel.rateApproval.uploadFile || "",
          approvalStatus: panel.rateApproval.approvalStatus || "Pending",
        });
      }

      // Set default email subject and message
      setEmailSubject(`Pricing Panel Approval Request - ${panel.pricingSerialNo || ''}`);
      setEmailMessage(`Dear Approver,\n\nPlease review and approve the following pricing panel:\n\nPricing Serial No: ${panel.pricingSerialNo || ''}\nParty Name: ${panel.partyName || ''}\nTotal Amount: ₹${panel.totalAmount || 0}\nTotal Weight: ${panel.totalWeight || 0}\n\nPlease click on the link below to approve:\n${window.location.origin}/admin/approve-pricing-panel/${panelId}?action=approve\n\nRegards,\nERP System`);

    } catch (error) {
      console.error('Error fetching pricing panel:', error);
      setError(error.message);
      alert(`Failed to load pricing panel: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmailApproval = async () => {
    if (!emailRecipient) {
      alert("Please enter recipient email address");
      return;
    }

    if (!emailRecipient.includes('@')) {
      alert("Please enter a valid email address");
      return;
    }

    setSendingEmail(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/send-approval-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: emailRecipient,
          subject: emailSubject,
          message: emailMessage,
          pricingPanelId: panelId,
          pricingSerialNo: pricingSerialNo,
          approvalType: rateApproval.approvalType
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Email sent successfully to ${emailRecipient}!`);
        setShowEmailModal(false);
        setEmailRecipient("");
      } else {
        alert(data.message || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert(`Error sending email: ${error.message}`);
    } finally {
      setSendingEmail(false);
    }
  };

  const handleApprove = async (autoApprove = false) => {
    // If it's auto-approve from email link, set status to Approved
    const newStatus = autoApprove ? "Approved" : rateApproval.approvalStatus;
    
    if (!newStatus && !autoApprove) {
      alert("Please select approval status");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch current data
      const fetchRes = await fetch(`/api/pricing-panel?id=${panelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const fetchData = await fetchRes.json();
      
      if (!fetchData.success) {
        throw new Error('Failed to fetch pricing panel data');
      }
      
      const currentData = fetchData.data;
      
      // Update only the rate approval section
      const updatedData = {
        ...currentData,
        rateApproval: {
          approvalType: rateApproval.approvalType,
          uploadFile: rateApproval.uploadFileName,
          approvalStatus: newStatus,
        }
      };
      
      // Send update
      const res = await fetch('/api/pricing-panel', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: panelId,
          ...updatedData
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert(`Pricing Panel ${newStatus} successfully!`);
        // Update local state
        setRateApproval(prev => ({ ...prev, approvalStatus: newStatus }));
        
        // If approved, redirect back to list after 2 seconds
        if (newStatus === "Approved") {
          setTimeout(() => {
            router.push('/admin/pricing-panel');
          }, 1500);
        } else {
          router.push('/admin/pricing-panel');
        }
      } else {
        alert(data.message || 'Failed to update approval');
      }
    } catch (error) {
      console.error('Error updating approval:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Check URL for auto-approve action (for email link)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    if (action === 'approve') {
      handleApprove(true);
    }
  }, []);

  const totalWeight = useMemo(() => {
    return orders.reduce((acc, r) => acc + num(r.weight), 0);
  }, [orders]);

  const totalAmount = useMemo(() => {
    return orders.reduce((acc, r) => {
      const weight = num(r.weight);
      const rate = num(r.rate);
      return acc + (weight * rate);
    }, 0);
  }, [orders]);

  const billingColumns = [
    { key: "billingType", label: "Billing Type" },
    { key: "loadingPoints", label: "No. of Loading Points" },
    { key: "dropPoints", label: "No. of Droping Point" },
    { key: "collectionCharges", label: "Collection Charges" },
    { key: "cancellationCharges", label: "Cancellation Charges" },
    { key: "loadingCharges", label: "Loading Charges" },
    { key: "otherCharges", label: "Other Charges" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading pricing panel...</p>
          </div>
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
                onClick={() => router.push('/admin/pricing-panel')}
                className="text-yellow-600 hover:text-yellow-800 font-medium text-sm flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to List
              </button>
              <div className="text-lg font-extrabold text-slate-900">
                Approve Pricing Panel: {pricingSerialNo}
              </div>
            </div>
            <div className="text-xs text-green-600 mt-1 font-medium">
              ⓘ Only Rate Approval section is editable
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Show Send Email button only when Mail Approval Rate is selected */}
            {rateApproval.approvalType === "Mail Approval Rate" && rateApproval.approvalStatus === "Pending" && (
              <button
                onClick={() => setShowEmailModal(true)}
                className="rounded-xl px-5 py-2 text-sm font-bold text-white transition bg-blue-600 hover:bg-blue-700"
              >
                📧 Send Email for Approval
              </button>
            )}
            
            <button
              onClick={() => handleApprove(false)}
              disabled={saving}
              className={`rounded-xl px-5 py-2 text-sm font-bold text-white transition ${
                saving 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
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
              ) : 'Submit Approval'}
            </button>
          </div>
        </div>
      </div>

      {/* ===== Main Layout ===== */}
      <div className="mx-auto max-w-full p-4 space-y-4">
        {/* ===== PART 1: PRICING PANEL - PART 1 (READ ONLY) ===== */}
        <Card title="Pricing Panel - Part -1 (Read Only)">
          {/* Header Section */}
          <div className="grid grid-cols-12 gap-3 mb-4">
            <Input
              col="col-span-12 md:col-span-3"
              label="Pricing Serial No"
              value={pricingSerialNo}
              readOnly={true}
            />
            
            <Input
              col="col-span-12 md:col-span-3"
              label="Branch"
              value={header.branchName}
              readOnly={true}
            />

            <Input
              col="col-span-12 md:col-span-3"
              label="Delivery"
              value={header.delivery}
              readOnly={true}
            />

            <Input
              col="col-span-12 md:col-span-3"
              label="Date"
              value={header.date}
              readOnly={true}
            />
            
            <Input
              col="col-span-12 md:col-span-3"
              label="Party Name"
              value={header.partyName}
              readOnly={true}
            />
            
            <Input
              col="col-span-12 md:col-span-3"
              label="Customer Code"
              value={header.customerCode}
              readOnly={true}
            />
            
            <Input
              col="col-span-12 md:col-span-3"
              label="Contact Person"
              value={header.contactPerson}
              readOnly={true}
            />
          </div>

          {/* Billing Type / Charges */}
          <div className="mb-4">
            <div className="text-sm font-bold text-slate-700 mb-2">Billing Type / Charges</div>
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
                      <td key={col.key} className="border border-yellow-300 px-2 py-2 text-slate-700 text-center">
                        {billing[col.key] || '-'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Orders Table */}
          <div>
            <div className="text-sm font-bold text-slate-700 mb-4">
              Orders - {billing.billingType} - {orders.length} row{orders.length !== 1 ? 's' : ''}
            </div>
            
            <OrdersTable rows={orders} />
          </div>

          {/* Totals */}
          <div className="flex justify-end gap-4 mt-4">
            <div className="flex items-center gap-3 border border-yellow-300 px-6 py-3 bg-yellow-50 rounded-xl">
              <div className="text-sm font-extrabold text-slate-900">Total Weight:</div>
              <div className="text-xl font-extrabold text-emerald-700">{totalWeight}</div>
            </div>
            <div className="flex items-center gap-3 border border-yellow-300 px-6 py-3 bg-yellow-50 rounded-xl">
              <div className="text-sm font-extrabold text-slate-900">Total Amount:</div>
              <div className="text-xl font-extrabold text-emerald-700">₹{totalAmount}</div>
            </div>
          </div>
        </Card>

        {/* ===== PART 2: RATE APPROVAL - EDITABLE ===== */}
        <Card title="Rate - Approval - Part - 2 (Editable)">
          <div className="grid grid-cols-12 gap-4">
            <EditableSelect
              col="col-span-12 md:col-span-4"
              label="Rate Approval Type"
              value={rateApproval.approvalType}
              onChange={(v) => setRateApproval({ ...rateApproval, approvalType: v })}
              options={RATE_APPROVAL_TYPES}
            />

            <div className="col-span-12 md:col-span-4">
              <label className="text-xs font-bold text-slate-600">Rate Approval Upload</label>
              <div className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                {rateApproval.uploadFileName || "No file uploaded"}
              </div>
              <p className="text-xs text-slate-400 mt-1">File upload is read-only in approval</p>
            </div>

            <EditableSelect
              col="col-span-12 md:col-span-4"
              label="Approval Status"
              value={rateApproval.approvalStatus}
              onChange={(v) => setRateApproval({ ...rateApproval, approvalStatus: v })}
              options={APPROVAL_STATUS}
            />
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-800">
              <span className="font-bold">Note:</span> Only the Approval Status and Rate Approval Type can be modified. All other data is read-only.
              {rateApproval.approvalType === "Mail Approval Rate" && (
                <span className="block mt-2 text-green-700">
                  📧 <strong>Mail Approval Mode:</strong> Click the "Send Email for Approval" button above to request approval via email.
                </span>
              )}
            </p>
          </div>
        </Card>
      </div>

      {/* ===== Email Modal ===== */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Send Approval Email</h2>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <EditableInput
                col="col-span-12"
                label="Recipient Email"
                value={emailRecipient}
                onChange={setEmailRecipient}
                placeholder="approver@company.com"
                type="email"
              />
              
              <EditableInput
                col="col-span-12"
                label="Subject"
                value={emailSubject}
                onChange={setEmailSubject}
                placeholder="Email Subject"
              />
              
              <div>
                <label className="text-xs font-bold text-slate-600">Message</label>
                <textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  rows={10}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  placeholder="Type your message here..."
                />
              </div>
              
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <p className="text-xs text-yellow-800">
                  <span className="font-bold">Note:</span> The recipient will receive an email with an approval link. 
                  When they click the link, the approval status will be automatically updated to "Approved".
                </p>
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmailApproval}
                disabled={sendingEmail}
                className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
              >
                {sendingEmail ? 'Sending...' : 'Send Email'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}