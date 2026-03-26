"use client"
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from 'next/navigation';

export default function CustomerPage({ customerId }) {
  const router = useRouter();
  const [customerDetails, setCustomerDetails] = useState({
    customerCode: "",
    customerName: "",
    customerGroup: "",
    customerType: "",
    emailId: "",
    fromLead: "",
    mobileNumber: "",
    fromOpportunity: "",
    billingAddress1: "",
    billingAddress2: "",
    billingCity: "",
    billingState: "",
    billingZip: "",
    billingCountry: "",
    shippingAddress1: "",
    shippingAddress2: "",
    shippingCity: "",
    shippingState: "",
    shippingZip: "",
    shippingCountry: "",
    paymentTerms: "",
    gstNumber: "",
    gstCategory: "",
    pan: "",
    contactPersonName: "",
    commissionRate: "",
    glAccount: "",
  });

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");

  // Effect hook to fetch customer details if editing
  useEffect(() => {
    if (customerId) {
      const fetchCustomerDetails = async () => {
        try {
          const response = await axios.get(`/api/customers/${customerId}`);
          setCustomerDetails(response.data);
        } catch (error) {
          console.error("Error fetching customer details:", error);
        }
      };

      fetchCustomerDetails();
    } else {
      // Generate a new customer code if creating new customer
      generateCustomerCode();
    }
    
    // Fetch all customers
    fetchCustomers();
  }, [customerId]);

  // ✅ Fetch Customers
  const fetchCustomers = async () => {
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
        setError(data.message || 'Failed to load customers');
      }
    } catch (error) {
      console.error('Error fetching customers:', error.message);
      setError('Failed to load customers');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

const generateCustomerCode = async () => {
  try {
    const lastCodeRes = await fetch("/api/lastCustomerCode");
    const data = await lastCodeRes.json();
    
    // Check if data exists and has lastCustomerCode
    const lastCustomerCode = data?.lastCustomerCode;
    
    let lastNumber = 0;
    
    if (lastCustomerCode && typeof lastCustomerCode === 'string') {
      // Extract number from code like "CUST-0001"
      const match = lastCustomerCode.match(/CUST-(\d+)/);
      if (match && match[1]) {
        lastNumber = parseInt(match[1], 10);
      }
    }
    
    let newNumber = lastNumber + 1;
    let generatedCode = "";
    let codeExists = true;

    while (codeExists) {
      generatedCode = `CUST-${newNumber.toString().padStart(4, "0")}`;
      const checkRes = await fetch(`/api/checkCustomerCode?code=${generatedCode}`);
      const { exists } = await checkRes.json();
      if (!exists) break;
      newNumber++;
    }

    setCustomerDetails(prev => ({
      ...prev,
      customerCode: generatedCode,
    }));
  } catch (error) {
    console.error("Failed to generate code:", error);
    // Set a default code if generation fails
    setCustomerDetails(prev => ({
      ...prev,
      customerCode: "CUST-0001",
    }));
  }
};

  const customerTypeOptions = [
    { value: "Individual", label: "Individual" },
    { value: "Business", label: "Business" },
    { value: "Government", label: "Government" },
  ];
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validate()) {
      try {
        if (customerId) {
          // Edit customer
          await axios.put(`/api/customers/${customerId}`, customerDetails);
          setSuccess("Customer updated successfully!");
        } else {
          // Create new customer
          await axios.post("/api/customers", customerDetails);
          setSuccess("Customer created successfully!");
          
          // Ask user if they want to return to Order Panel
          setTimeout(() => {
            const returnToOrderPanel = window.confirm(
              `Customer "${customerDetails.customerName}" created successfully!\n\nDo you want to return to Order Panel?`
            );
            if (returnToOrderPanel) {
              router.push('/admin/order-panel');
            }
          }, 500);
        }
        
        // Reset form for new customer
        if (!customerId) {
          setCustomerDetails({
            customerCode: "",
            customerName: "",
            customerGroup: "",
            customerType: "",
            emailId: "",
            fromLead: "",
            mobileNumber: "",
            fromOpportunity: "",
            billingAddress1: "",
            billingAddress2: "",
            billingCity: "",
            billingState: "",
            billingZip: "",
            billingCountry: "",
            shippingAddress1: "",
            shippingAddress2: "",
            shippingCity: "",
            shippingState: "",
            shippingZip: "",
            shippingCountry: "",
            paymentTerms: "",
            gstNumber: "",
            gstCategory: "",
            pan: "",
            contactPersonName: "",
            commissionRate: "",
            glAccount: "",
          });
          generateCustomerCode();
        }
        
        fetchCustomers();
      } catch (error) {
        console.error("Error submitting form:", error);
        setError("There was an error submitting the form.");
      }
    }
  };

  const validate = () => {
  const requiredFields = [
    "customerName",
    "billingAddress1",
    "billingCity",
    "billingCountry",
    "billingState",
    "billingZip",
    "shippingAddress1",
    "shippingCity",
    "shippingCountry",
    "shippingState",
    "shippingZip",
  ];

  // Check required fields (Removed email mandatory if you want optional)
  for (const field of requiredFields) {
    if (!customerDetails[field]) {
      alert(`Please fill the required field: ${field}`);
      return false;
    }
  }

  // ✅ Mobile number validation (ONLY if entered)
  if (customerDetails.mobileNumber) {
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(customerDetails.mobileNumber)) {
      alert("Mobile number must be exactly 10 digits");
      return false;
    }
  }

  return true;
};

  // ✅ Delete Customer
  const deleteCustomer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/customers?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to delete customer');
        return;
      }
      setError(null);
      setSuccess('Customer deleted successfully!');
      fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error.message);
      setError('Failed to delete customer.');
    }
  };

  // ✅ Return to Order Panel
  const returnToOrderPanel = () => {
    router.push('/admin/order-panel');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* ===== Top Bar ===== */}
      <div className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-full px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-lg font-extrabold text-slate-900">
              Customer Master
            </div>
            {success && (
              <div className="text-sm text-green-600 font-medium">
                ✅ {success}
              </div>
            )}
            {error && (
              <div className="text-sm text-red-600 font-medium">
                ❌ {error}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={returnToOrderPanel}
              className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-bold text-white hover:bg-sky-700 transition"
            >
              ← Back to Order Panel
            </button>
          </div>
        </div>
      </div>

      {/* ===== Main Content ===== */}
      <div className="mx-auto max-w-full p-4">
        {/* Add Customer Form */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm mb-4">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div className="text-sm font-extrabold text-slate-900">
              {customerId ? "Edit Customer" : "Create New Customer"}
            </div>
          </div>
          
          <div className="p-4">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-12 md:col-span-4">
                  <label className="text-xs font-bold text-slate-600 mb-1 block">
                    Customer Code
                  </label>
                  <input
                    type="text"
                    value={customerDetails.customerCode}
                    readOnly
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm outline-none"
                  />
                </div>

                <div className="col-span-12 md:col-span-4">
                  <label className="text-xs font-bold text-slate-600 mb-1 block">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerDetails.customerName}
                    onChange={(e) =>
                      setCustomerDetails({
                        ...customerDetails,
                        customerName: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    required
                  />
                </div>

                <div className="col-span-12 md:col-span-4">
                  <label className="text-xs font-bold text-slate-600 mb-1 block">
                    Customer Group
                  </label>
                  <input
                    type="text"
                    value={customerDetails.customerGroup}
                    onChange={(e) =>
                      setCustomerDetails({
                        ...customerDetails,
                        customerGroup: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  />
                </div>

                <div className="col-span-12 md:col-span-4">
                  <label className="text-xs font-bold text-slate-600 mb-1 block">
                    Customer Type
                  </label>
                  <select
                    value={customerDetails.customerType}
                    onChange={(e) =>
                      setCustomerDetails({
                        ...customerDetails,
                        customerType: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  >
                    <option value="">Select Customer Type</option>
                    {customerTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-12 md:col-span-4">
                  <label className="text-xs font-bold text-slate-600 mb-1 block">
                    Email ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={customerDetails.emailId}
                    onChange={(e) =>
                      setCustomerDetails({
                        ...customerDetails,
                        emailId: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    required
                  />
                </div>

                <div className="col-span-12 md:col-span-4">
                  <label className="text-xs font-bold text-slate-600 mb-1 block">
                    Mobile Number
                  </label>
                 <input
  type="text"
  maxLength={10}
  value={customerDetails.mobileNumber}
  onChange={(e) => {
    const value = e.target.value.replace(/\D/g, ""); // only numbers
    setCustomerDetails({
      ...customerDetails,
      mobileNumber: value,
    });
  }}
  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
/>
                </div>

                <div className="col-span-12 md:col-span-4">
                  <label className="text-xs font-bold text-slate-600 mb-1 block">
                    Contact Person Name
                  </label>
                  <input
                    type="text"
                    value={customerDetails.contactPersonName}
                    onChange={(e) =>
                      setCustomerDetails({
                        ...customerDetails,
                        contactPersonName: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  />
                </div>

                <div className="col-span-12 md:col-span-4">
                  <label className="text-xs font-bold text-slate-600 mb-1 block">
                    Payment Terms
                  </label>
                  <input
                    type="text"
                    value={customerDetails.paymentTerms}
                    onChange={(e) =>
                      setCustomerDetails({
                        ...customerDetails,
                        paymentTerms: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  />
                </div>

                <div className="col-span-12 md:col-span-4">
                  <label className="text-xs font-bold text-slate-600 mb-1 block">
                    GST Number
                  </label>
                  <input
                    type="text"
                    value={customerDetails.gstNumber}
                    onChange={(e) =>
                      setCustomerDetails({
                        ...customerDetails,
                        gstNumber: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  />
                </div>

                <div className="col-span-12 md:col-span-4">
                  <label className="text-xs font-bold text-slate-600 mb-1 block">
                    GST Category
                  </label>
                  <input
                    type="text"
                    value={customerDetails.gstCategory}
                    onChange={(e) =>
                      setCustomerDetails({
                        ...customerDetails,
                        gstCategory: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  />
                </div>

                <div className="col-span-12 md:col-span-4">
                  <label className="text-xs font-bold text-slate-600 mb-1 block">
                    PAN
                  </label>
                  <input
                    type="text"
                    value={customerDetails.pan}
                    onChange={(e) =>
                      setCustomerDetails({
                        ...customerDetails,
                        pan: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  />
                </div>

                <div className="col-span-12 md:col-span-4">
                  <label className="text-xs font-bold text-slate-600 mb-1 block">
                    Commission Rate
                  </label>
                  <input
                    type="text"
                    value={customerDetails.commissionRate}
                    onChange={(e) =>
                      setCustomerDetails({
                        ...customerDetails,
                        commissionRate: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  />
                </div>

                <div className="col-span-12 md:col-span-4">
                  <label className="text-xs font-bold text-slate-600 mb-1 block">
                    GL Account
                  </label>
                  <input
                    type="text"
                    value={customerDetails.glAccount}
                    onChange={(e) =>
                      setCustomerDetails({
                        ...customerDetails,
                        glAccount: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  />
                </div>

                {/* Billing Address */}
                <div className="col-span-12">
                  <div className="text-sm font-extrabold text-slate-900 mb-3">Billing Address</div>
                </div>
                
                <div className="col-span-12 md:col-span-6">
                  <label className="text-xs font-bold text-slate-600 mb-1 block">
                    Address Line 1 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Address Line 1"
                    value={customerDetails.billingAddress1}
                    onChange={(e) =>
                      setCustomerDetails({
                        ...customerDetails,
                        billingAddress1: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    required
                  />
                </div>

                <div className="col-span-12 md:col-span-6">
                  <label className="text-xs font-bold text-slate-600 mb-1 block">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    placeholder="Address Line 2"
                    value={customerDetails.billingAddress2}
                    onChange={(e) =>
                      setCustomerDetails({
                        ...customerDetails,
                        billingAddress2: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  />
                </div>

                <div className="col-span-12 md:col-span-4">
                  <label className="text-xs font-bold text-slate-600 mb-1 block">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="City"
                    value={customerDetails.billingCity}
                    onChange={(e) =>
                      setCustomerDetails({
                        ...customerDetails,
                        billingCity: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    required
                  />
                </div>

                <div className="col-span-12 md:col-span-4">
                  <label className="text-xs font-bold text-slate-600 mb-1 block">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="State"
                    value={customerDetails.billingState}
                    onChange={(e) =>
                      setCustomerDetails({
                        ...customerDetails,
                        billingState: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    required
                  />
                </div>

                <div className="col-span-12 md:col-span-4">
                  <label className="text-xs font-bold text-slate-600 mb-1 block">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Country"
                    value={customerDetails.billingCountry}
                    onChange={(e) =>
                      setCustomerDetails({
                        ...customerDetails,
                        billingCountry: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    required
                  />
                </div>

                <div className="col-span-12 md:col-span-4">
                  <label className="text-xs font-bold text-slate-600 mb-1 block">
                    PIN Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="PIN Code"
                    value={customerDetails.billingZip}
                    onChange={(e) =>
                      setCustomerDetails({
                        ...customerDetails,
                        billingZip: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    required
                  />
                </div>

                {/* Shipping Address */}
                <div className="col-span-12 mt-6">
                  <div className="text-sm font-extrabold text-slate-900 mb-3">Shipping Address</div>
                </div>
                
                <div className="col-span-12 md:col-span-6">
                  <label className="text-xs font-bold text-slate-600 mb-1 block">
                    Address Line 1 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Address Line 1"
                    value={customerDetails.shippingAddress1}
                    onChange={(e) =>
                      setCustomerDetails({
                        ...customerDetails,
                        shippingAddress1: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    required
                  />
                </div>

                <div className="col-span-12 md:col-span-6">
                  <label className="text-xs font-bold text-slate-600 mb-1 block">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    placeholder="Address Line 2"
                    value={customerDetails.shippingAddress2}
                    onChange={(e) =>
                      setCustomerDetails({
                        ...customerDetails,
                        shippingAddress2: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  />
                </div>

                <div className="col-span-12 md:col-span-4">
                  <label className="text-xs font-bold text-slate-600 mb-1 block">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="City"
                    value={customerDetails.shippingCity}
                    onChange={(e) =>
                      setCustomerDetails({
                        ...customerDetails,
                        shippingCity: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    required
                  />
                </div>

                <div className="col-span-12 md:col-span-4">
                  <label className="text-xs font-bold text-slate-600 mb-1 block">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="State"
                    value={customerDetails.shippingState}
                    onChange={(e) =>
                      setCustomerDetails({
                        ...customerDetails,
                        shippingState: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    required
                  />
                </div>

                <div className="col-span-12 md:col-span-4">
                  <label className="text-xs font-bold text-slate-600 mb-1 block">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Country"
                    value={customerDetails.shippingCountry}
                    onChange={(e) =>
                      setCustomerDetails({
                        ...customerDetails,
                        shippingCountry: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    required
                  />
                </div>

                <div className="col-span-12 md:col-span-4">
                  <label className="text-xs font-bold text-slate-600 mb-1 block">
                    PIN Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="PIN Code"
                    value={customerDetails.shippingZip}
                    onChange={(e) =>
                      setCustomerDetails({
                        ...customerDetails,
                        shippingZip: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    required
                  />
                </div>

                <div className="col-span-12 flex gap-3 mt-6">
                  <button
                    type="submit"
                    className={`rounded-xl px-5 py-2 text-sm font-bold text-white transition ${
                      customerId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    {customerId ? "Update Customer" : "Create Customer"}
                  </button>
                  <button
                    type="button"
                    onClick={returnToOrderPanel}
                    className="rounded-xl bg-sky-600 px-5 py-2 text-sm font-bold text-white hover:bg-sky-700 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Customer List */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div className="text-sm font-extrabold text-slate-900">Customer List</div>
            <div className="text-sm text-slate-600">
              Total Customers: {customers.length}
            </div>
          </div>
          
          <div className="p-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mx-auto"></div>
                <p className="mt-2 text-sm text-slate-500">Loading customers...</p>
              </div>
            ) : customers.length > 0 ? (
              <div className="overflow-auto rounded-xl border border-yellow-300">
                <table className="min-w-full w-full text-sm">
                  <thead className="sticky top-0 bg-yellow-400 z-10">
                    <tr>
                      <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-left">
                        Customer Code
                      </th>
                      <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-left">
                        Customer Name
                      </th>
                      <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-left">
                        Contact Person
                      </th>
                      <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-left">
                        Email
                      </th>
                      <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-left">
                        Mobile
                      </th>
                      <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-left">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer) => (
                      <tr key={customer._id} className="hover:bg-yellow-50 even:bg-slate-50">
                        <td className="border border-yellow-300 px-3 py-3">
                          <div className="font-medium text-slate-800">{customer.customerCode}</div>
                        </td>
                        <td className="border border-yellow-300 px-3 py-3">
                          <div className="font-medium text-slate-800">{customer.customerName}</div>
                        </td>
                        <td className="border border-yellow-300 px-3 py-3">
                          <div className="font-medium text-slate-800">{customer.contactPersonName || "-"}</div>
                        </td>
                        <td className="border border-yellow-300 px-3 py-3">
                          <div className="font-medium text-slate-800">{customer.emailId}</div>
                        </td>
                        <td className="border border-yellow-300 px-3 py-3">
                          <div className="font-medium text-slate-800">{customer.mobileNumber || "-"}</div>
                        </td>
                        <td className="border border-yellow-300 px-3 py-3">
                          <button
                            onClick={() => deleteCustomer(customer._id)}
                            className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600 transition"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 font-semibold">
                No customers found. Create your first customer above.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}