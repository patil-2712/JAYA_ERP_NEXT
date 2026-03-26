"use client";

import { useMemo, useState, useEffect, useRef, useCallback } from "react";

/* =========================
  CONSTANTS
========================= */
const DELIVERY_TYPES = ["COURIER", "IN-PERSON", "HAND DELIVERY", "TRANSPORT"];
const DELIVERY_STATUS = ["Delivered", "Partial", "Damaged", "Shortage", "Pending"];
const POD_RECEIVED_STATUS = ["Received", "Pending", "Awaited"];
const PAYMENT_TERMS = ["Prepaid", "To Pay", "Credit", "Advance"];
const UNITS_OF_MEASURE = ["MT", "KG", "Ton", "Liter", "CBM", "Bags", "Boxes", "Drums"];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/* =========================
  DEFAULT ROWS
========================= */
function defaultOrderRow() {
  return {
    _id: uid(),
    orderNo: "",
    partyName: "",
    plantCode: "",
    orderType: "Sales",
    pinCode: "",
    state: "",
    district: "",
    from: "",
    to: "",
    locationRate: "",
    weight: "",
  };
}

function defaultProductRow() {
  return {
    _id: uid(),
    productName: "",
    totalPkgs: "",
    pkgsType: "Bags",
    uom: "Kgs",
    packSize: "",
    skuSize: "",
    wtLtr: "",
    actualWt: "",
    deliveryStatus: "",
    deduction: "",
    deductionValue: "",
    remarks: "",
  };
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

function Input({ label, value, onChange, col = "", type = "text", readOnly = false, required = false }) {
  return (
    <div className={col}>
      <label className="text-xs font-bold text-slate-600">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        readOnly={readOnly}
        required={required}
        className={`mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 ${
          readOnly ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
        }`}
      />
    </div>
  );
}

function Select({ label, value, onChange, options = [], col = "", readOnly = false, required = false }) {
  return (
    <div className={col}>
      <label className="text-xs font-bold text-slate-600">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={readOnly}
        required={required}
        className={`mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 ${
          readOnly ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'
        }`}
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

function FileUpload({ label, value, onChange, col = "", accept = ".pdf,.jpg,.jpeg,.png" }) {
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onChange?.(file);
    }
  };

  return (
    <div className={col}>
      <label className="text-xs font-bold text-slate-600">{label}</label>
      <div className="mt-1 flex items-center gap-2">
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          id={`file-${label}`}
        />
        <label
          htmlFor={`file-${label}`}
          className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Choose File
        </label>
        {fileName && <span className="text-sm text-slate-600">{fileName}</span>}
      </div>
    </div>
  );
}

/* =========================
  PROOF OF DELIVERY PAGE
========================= */
export default function ProofOfDeliveryPage() {
  /* ===== HEADER STATE ===== */
  const [header, setHeader] = useState({
    purchaseNo: "",
    pricingSerialNo: "",
    branch: "Kandla",
    delivery: "COURIER",
    date: new Date().toISOString().split('T')[0],
    billingType: "Multi - Order",
    loadingPoints: "1",
    dropPoints: "2",
    collectionCharges: "100",
    cancellationCharges: "Nil",
    loadingCharges: "Nil",
    otherCharges: "Nil",
  });

  /* ===== ORDERS STATE ===== */
  const [orders, setOrders] = useState([
    {
      _id: uid(),
      orderNo: "JL-Aug-001",
      partyName: "Indorama India Pvt ltd",
      plantCode: "Kandla - 9002",
      orderType: "Sales",
      pinCode: "207243",
      state: "Uttar Pradesh",
      district: "Etah",
      from: "Kandla",
      to: "Darayoganj",
      locationRate: "Etah",
      weight: "20",
    },
    {
      _id: uid(),
      orderNo: "JL-Aug-002",
      partyName: "SQM India Pvt Lts",
      plantCode: "Kandla - 9002",
      orderType: "Sales",
      pinCode: "207243",
      state: "Uttar Pradesh",
      district: "Etah",
      from: "Kandla",
      to: "Ganj",
      locationRate: "Aligarh",
      weight: "15",
    },
  ]);

  /* ===== VENDOR STATE ===== */
  const [vendor, setVendor] = useState({
    vendorName: "Divya Roadways",
    vendorCode: "HEVQS2366H2",
    vehicleNo: "HR38X8960",
    purchaseType: "Safi Vehicle",
    rateType: "Per MT",
    rate: "2850",
    weight: "35",
    amount: "99750",
    advance: "80000",
    totalAddition: "2500",
    totalDeduction: "7000",
    balance: "15250",
  });

  /* ===== POD STATE ===== */
  const [podDetails, setPodDetails] = useState({
    lrNo: "JL-GDM-001",
    lrDate: "2026-01-01",
    docketNo: "48126412412",
    podDate: "2025-02-15",
    podUpload: null,
    podReceived: "Received",
    deliveryType: "COURIER",
  });

  /* ===== PRODUCTS STATE ===== */
  const [products, setProducts] = useState([
    {
      _id: uid(),
      productName: "CN 25 Kgs",
      totalPkgs: "600",
      pkgsType: "Bags",
      uom: "Kgs",
      packSize: "20 Kgs",
      skuSize: "20",
      wtLtr: "12000",
      actualWt: "12",
      deliveryStatus: "Bags Damaged",
      deduction: "2 Bags",
      deductionValue: "2450",
      remarks: "",
    },
    {
      _id: uid(),
      productName: "YaraVita Stopit 1Ltr",
      totalPkgs: "20",
      pkgsType: "Boxes",
      uom: "Ltr",
      packSize: "1 Ltr",
      skuSize: "10",
      wtLtr: "200",
      actualWt: "0.4",
      deliveryStatus: "Leakage",
      deduction: "2 Boxes",
      deductionValue: "3210",
      remarks: "",
    },
  ]);

  /* ===== ADDITIONAL POD ===== */
  const [additionalPod, setAdditionalPod] = useState({
    lrNo: "JL-GDM-002",
    lrDate: "2026-01-01",
    orderNo: "JL-Aug-002",
    docketNo: "48126412412",
    podDate: "2025-02-15",
    podUpload: null,
    podReceived: "Pending",
    deliveryType: "COURIER",
  });

  /* ===== ACKNOWLEDGMENT STATE ===== */
  const [acknowledgment, setAcknowledgment] = useState({
    lastPodDate: "2025-01-15",
    podStatus: "Clear & Ok",
    dueDate: "2025-02-15",
    paymentDate: "2025-02-18",
  });

  /* ===== CALCULATIONS ===== */
  const totalWeight = useMemo(() => {
    return orders.reduce((acc, r) => acc + num(r.weight), 0);
  }, [orders]);

  const totalProductsWeight = useMemo(() => {
    return products.reduce((acc, p) => acc + num(p.actualWt), 0);
  }, [products]);

  const totalDeductionValue = useMemo(() => {
    return products.reduce((acc, p) => acc + num(p.deductionValue), 0);
  }, [products]);

  const finalBalance = useMemo(() => {
    const amount = num(vendor.amount);
    const advance = num(vendor.advance);
    const addition = num(vendor.totalAddition);
    const deduction = num(vendor.totalDeduction);
    const podDeduction = totalDeductionValue;
    
    return amount - advance - deduction - podDeduction + addition;
  }, [vendor, totalDeductionValue]);

  /* ===== HANDLERS ===== */
  const updateOrder = (id, key, value) => {
    setOrders((prev) => prev.map((r) => (r._id === id ? { ...r, [key]: value } : r)));
  };

  const updateProduct = (id, key, value) => {
    setProducts((prev) => 
      prev.map((p) => {
        if (p._id === id) {
          const updated = { ...p, [key]: value };
          
          // Auto-calculate WT (LTR) = Total PKGS * Pack Size
          if (key === 'totalPkgs' || key === 'packSize') {
            const totalPkgs = num(updated.totalPkgs);
            const packSize = num(updated.packSize);
            updated.wtLtr = totalPkgs * packSize;
          }
          
          // Auto-calculate Actual WT = WT (LTR) * conversion factor / 1000
          if (key === 'wtLtr' || key === 'totalPkgs' || key === 'packSize') {
            const wtLtr = num(updated.wtLtr);
            updated.actualWt = (wtLtr * 2 / 1000).toFixed(2);
          }
          
          return updated;
        }
        return p;
      })
    );
  };

  const addProduct = () => {
    setProducts((prev) => [...prev, defaultProductRow()]);
  };

  const removeProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p._id !== id));
  };

  const handlePodUpload = (file, type) => {
    if (type === 'main') {
      setPodDetails(prev => ({ ...prev, podUpload: file }));
    } else {
      setAdditionalPod(prev => ({ ...prev, podUpload: file }));
    }
  };

  const handleSaveAll = () => {
    // Validate required fields
    if (!podDetails.lrNo) {
      alert("Please enter LR No");
      return;
    }

    // Prepare payload for API
    const payload = {
      header,
      orders,
      vendor,
      podDetails,
      products,
      additionalPod,
      acknowledgment,
      totals: {
        totalWeight,
        totalProductsWeight,
        totalDeductionValue,
        finalBalance,
      },
    };

    console.log("Saving POD data:", payload);
    alert("✅ Proof of Delivery saved successfully!");
  };

  /* ===== ORDERS TABLE COMPONENT ===== */
  const OrdersTable = ({ rows }) => {
    return (
      <div className="overflow-auto rounded-xl border border-yellow-300 mb-4">
        <table className="min-w-full w-full text-sm">
          <thead className="sticky top-0 bg-yellow-400">
            <tr>
              <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">Order</th>
              <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">Party Name</th>
              <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">Plant Code</th>
              <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">Order Type</th>
              <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">Pin Code</th>
              <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">State</th>
              <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">District</th>
              <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">From</th>
              <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">To</th>
              <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">Weight</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row._id} className="hover:bg-yellow-50 even:bg-slate-50">
                <td className="border border-yellow-300 px-2 py-2 font-medium">{row.orderNo}</td>
                <td className="border border-yellow-300 px-2 py-2">{row.partyName}</td>
                <td className="border border-yellow-300 px-2 py-2">{row.plantCode}</td>
                <td className="border border-yellow-300 px-2 py-2">{row.orderType}</td>
                <td className="border border-yellow-300 px-2 py-2">{row.pinCode}</td>
                <td className="border border-yellow-300 px-2 py-2">{row.state}</td>
                <td className="border border-yellow-300 px-2 py-2">{row.district}</td>
                <td className="border border-yellow-300 px-2 py-2">{row.from}</td>
                <td className="border border-yellow-300 px-2 py-2">{row.to}</td>
                <td className="border border-yellow-300 px-2 py-2 font-medium">{row.weight}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  /* ===== PRODUCTS TABLE COMPONENT ===== */
  const ProductsTable = ({ rows, onChange, onRemove }) => {
    return (
      <div className="overflow-auto rounded-xl border border-yellow-300">
        <table className="min-w-full w-full text-sm">
          <thead className="sticky top-0 bg-yellow-400">
            <tr>
              <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">Product Name</th>
              <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">Total PKGS</th>
              <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">PKGS Type</th>
              <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">UOM</th>
              <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">Pack Size</th>
              <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">SKU Size</th>
              <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">WT (LTR)</th>
              <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">Actual WT</th>
              <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">Delivery Status</th>
              <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">Deduction</th>
              <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">Value</th>
              <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row._id} className="hover:bg-yellow-50 even:bg-slate-50">
                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    type="text"
                    value={row.productName || ""}
                    onChange={(e) => onChange(row._id, 'productName', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
                    placeholder="Product name"
                  />
                </td>
                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    type="number"
                    value={row.totalPkgs || ""}
                    onChange={(e) => onChange(row._id, 'totalPkgs', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
                    placeholder="Total"
                  />
                </td>
                <td className="border border-yellow-300 px-2 py-2">
                  <select
                    value={row.pkgsType || ""}
                    onChange={(e) => onChange(row._id, 'pkgsType', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
                  >
                    <option value="Bags">Bags</option>
                    <option value="Boxes">Boxes</option>
                    <option value="Drums">Drums</option>
                    <option value="Pallets">Pallets</option>
                  </select>
                </td>
                <td className="border border-yellow-300 px-2 py-2">
                  <select
                    value={row.uom || ""}
                    onChange={(e) => onChange(row._id, 'uom', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
                  >
                    {UNITS_OF_MEASURE.map(uom => (
                      <option key={uom} value={uom}>{uom}</option>
                    ))}
                  </select>
                </td>
                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    type="text"
                    value={row.packSize || ""}
                    onChange={(e) => onChange(row._id, 'packSize', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
                    placeholder="e.g., 20 Kgs"
                  />
                </td>
                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    type="text"
                    value={row.skuSize || ""}
                    onChange={(e) => onChange(row._id, 'skuSize', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
                    placeholder="SKU"
                  />
                </td>
                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    type="number"
                    value={row.wtLtr || ""}
                    readOnly
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm outline-none"
                    placeholder="Auto"
                  />
                </td>
                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    type="number"
                    value={row.actualWt || ""}
                    readOnly
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm outline-none"
                    placeholder="Auto"
                  />
                </td>
                <td className="border border-yellow-300 px-2 py-2">
                  <select
                    value={row.deliveryStatus || ""}
                    onChange={(e) => onChange(row._id, 'deliveryStatus', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
                  >
                    <option value="">Select</option>
                    <option value="Bags Damaged">Bags Damaged</option>
                    <option value="Leakage">Leakage</option>
                    <option value="Bags Short">Bags Short</option>
                    <option value="Damaged">Damaged</option>
                    <option value="Shortage">Shortage</option>
                  </select>
                </td>
                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    type="text"
                    value={row.deduction || ""}
                    onChange={(e) => onChange(row._id, 'deduction', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
                    placeholder="e.g., 2 Bags"
                  />
                </td>
                <td className="border border-yellow-300 px-2 py-2">
                  <input
                    type="number"
                    value={row.deductionValue || ""}
                    onChange={(e) => onChange(row._id, 'deductionValue', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
                    placeholder="Value"
                  />
                </td>
                <td className="border border-yellow-300 px-2 py-2 text-center">
                  <button
                    onClick={() => onRemove(row._id)}
                    className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600 transition"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* ===== Top Bar ===== */}
      <div className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-full px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-lg font-extrabold text-slate-900">
              Proof of Delivery (POD) - Panel
            </div>
            <div className="text-sm text-slate-500">
              Purchase No: {header.purchaseNo || "QUE-001"} | Pricing Serial No: {header.pricingSerialNo || "PS-002"}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveAll}
              className="rounded-xl bg-yellow-600 px-5 py-2 text-sm font-bold text-white hover:bg-yellow-700 transition"
            >
              Save POD
            </button>
          </div>
        </div>
      </div>

      {/* ===== Main Layout ===== */}
      <div className="mx-auto max-w-full p-4 space-y-4">
        {/* ===== PART 1: HEADER INFORMATION ===== */}
        <Card title="POD - Header Information">
          <div className="grid grid-cols-12 gap-3 mb-4">
            <Input
              col="col-span-12 md:col-span-2"
              label="Purchase No"
              value={header.purchaseNo}
              onChange={(v) => setHeader(p => ({ ...p, purchaseNo: v }))}
              placeholder="QUE-001"
            />
            
            <Input
              col="col-span-12 md:col-span-2"
              label="Pricing Serial No"
              value={header.pricingSerialNo}
              onChange={(v) => setHeader(p => ({ ...p, pricingSerialNo: v }))}
              placeholder="PS-002"
            />

            <Input
              col="col-span-12 md:col-span-2"
              label="Branch"
              value={header.branch}
              onChange={(v) => setHeader(p => ({ ...p, branch: v }))}
            />

            <Select
              col="col-span-12 md:col-span-2"
              label="Delivery"
              value={header.delivery}
              onChange={(v) => setHeader(p => ({ ...p, delivery: v }))}
              options={DELIVERY_TYPES}
            />

            <Input
              type="date"
              col="col-span-12 md:col-span-2"
              label="Date"
              value={header.date}
              onChange={(v) => setHeader(p => ({ ...p, date: v }))}
            />

            <Select
              col="col-span-12 md:col-span-2"
              label="Billing Type"
              value={header.billingType}
              onChange={(v) => setHeader(p => ({ ...p, billingType: v }))}
              options={["Single - Order", "Multi - Order"]}
            />
          </div>

          <div className="grid grid-cols-12 gap-3">
            <Input
              col="col-span-12 md:col-span-2"
              label="Loading Points"
              value={header.loadingPoints}
              onChange={(v) => setHeader(p => ({ ...p, loadingPoints: v }))}
              type="number"
            />

            <Input
              col="col-span-12 md:col-span-2"
              label="Drop Points"
              value={header.dropPoints}
              onChange={(v) => setHeader(p => ({ ...p, dropPoints: v }))}
              type="number"
            />

            <Input
              col="col-span-12 md:col-span-2"
              label="Collection Charges"
              value={header.collectionCharges}
              onChange={(v) => setHeader(p => ({ ...p, collectionCharges: v }))}
              type="number"
            />

            <Input
              col="col-span-12 md:col-span-2"
              label="Cancellation Charges"
              value={header.cancellationCharges}
              onChange={(v) => setHeader(p => ({ ...p, cancellationCharges: v }))}
            />

            <Input
              col="col-span-12 md:col-span-2"
              label="Loading Charges"
              value={header.loadingCharges}
              onChange={(v) => setHeader(p => ({ ...p, loadingCharges: v }))}
            />

            <Input
              col="col-span-12 md:col-span-2"
              label="Other Charges"
              value={header.otherCharges}
              onChange={(v) => setHeader(p => ({ ...p, otherCharges: v }))}
            />
          </div>
        </Card>

        {/* ===== PART 2: ORDERS ===== */}
        <Card title="Orders">
          <OrdersTable rows={orders} />
          <div className="flex justify-end mt-2">
            <div className="text-sm font-bold text-slate-700">
              Total Weight: <span className="text-yellow-700">{totalWeight} MT</span>
            </div>
          </div>
        </Card>

        {/* ===== PART 3: VENDOR DETAILS ===== */}
        <Card title="Vendor Details">
          <div className="grid grid-cols-12 gap-3">
            <Input
              col="col-span-12 md:col-span-3"
              label="Vendor Name"
              value={vendor.vendorName}
              onChange={(v) => setVendor(p => ({ ...p, vendorName: v }))}
            />

            <Input
              col="col-span-12 md:col-span-2"
              label="Vendor Code"
              value={vendor.vendorCode}
              onChange={(v) => setVendor(p => ({ ...p, vendorCode: v }))}
            />

            <Input
              col="col-span-12 md:col-span-2"
              label="Vehicle No"
              value={vendor.vehicleNo}
              onChange={(v) => setVendor(p => ({ ...p, vehicleNo: v }))}
            />

            <Input
              col="col-span-12 md:col-span-2"
              label="Purchase Type"
              value={vendor.purchaseType}
              onChange={(v) => setVendor(p => ({ ...p, purchaseType: v }))}
            />

            <Select
              col="col-span-12 md:col-span-3"
              label="Rate Type"
              value={vendor.rateType}
              onChange={(v) => setVendor(p => ({ ...p, rateType: v }))}
              options={["Per MT", "Fixed", "Per Trip"]}
            />
          </div>

          <div className="grid grid-cols-12 gap-3 mt-3">
            <Input
              col="col-span-12 md:col-span-2"
              label="Rate"
              value={vendor.rate}
              onChange={(v) => setVendor(p => ({ ...p, rate: v }))}
              type="number"
            />

            <Input
              col="col-span-12 md:col-span-2"
              label="Weight (MT)"
              value={vendor.weight}
              onChange={(v) => setVendor(p => ({ ...p, weight: v }))}
              type="number"
            />

            <Input
              col="col-span-12 md:col-span-2"
              label="Amount"
              value={vendor.amount}
              onChange={(v) => setVendor(p => ({ ...p, amount: v }))}
              type="number"
              readOnly
            />

            <Input
              col="col-span-12 md:col-span-2"
              label="Advance"
              value={vendor.advance}
              onChange={(v) => setVendor(p => ({ ...p, advance: v }))}
              type="number"
            />

            <Input
              col="col-span-12 md:col-span-2"
              label="Total Addition"
              value={vendor.totalAddition}
              onChange={(v) => setVendor(p => ({ ...p, totalAddition: v }))}
              type="number"
            />

            <Input
              col="col-span-12 md:col-span-2"
              label="Total Deduction"
              value={vendor.totalDeduction}
              onChange={(v) => setVendor(p => ({ ...p, totalDeduction: v }))}
              type="number"
            />
          </div>

          <div className="grid grid-cols-12 gap-3 mt-3">
            <Input
              col="col-span-12 md:col-span-2 md:col-start-11"
              label="Balance"
              value={vendor.balance}
              onChange={(v) => setVendor(p => ({ ...p, balance: v }))}
              type="number"
              readOnly
            />
          </div>
        </Card>

        {/* ===== PART 4: POD DETAILS ===== */}
        <Card title="POD Details - Main">
          <div className="grid grid-cols-12 gap-3">
            <Input
              col="col-span-12 md:col-span-2"
              label="LR No"
              value={podDetails.lrNo}
              onChange={(v) => setPodDetails(p => ({ ...p, lrNo: v }))}
              required
            />

            <Input
              type="date"
              col="col-span-12 md:col-span-2"
              label="LR Date"
              value={podDetails.lrDate}
              onChange={(v) => setPodDetails(p => ({ ...p, lrDate: v }))}
            />

            <Input
              col="col-span-12 md:col-span-2"
              label="Docket No"
              value={podDetails.docketNo}
              onChange={(v) => setPodDetails(p => ({ ...p, docketNo: v }))}
            />

            <Input
              type="date"
              col="col-span-12 md:col-span-2"
              label="POD Date"
              value={podDetails.podDate}
              onChange={(v) => setPodDetails(p => ({ ...p, podDate: v }))}
            />

            <Select
              col="col-span-12 md:col-span-2"
              label="POD Received"
              value={podDetails.podReceived}
              onChange={(v) => setPodDetails(p => ({ ...p, podReceived: v }))}
              options={POD_RECEIVED_STATUS}
            />

            <FileUpload
              col="col-span-12 md:col-span-2"
              label="POD Upload"
              onChange={(file) => handlePodUpload(file, 'main')}
            />
          </div>
        </Card>

        {/* ===== PART 5: PRODUCTS TABLE ===== */}
        <Card 
          title="Products - Delivery Status" 
          right={
            <button
              onClick={addProduct}
              className="rounded-xl bg-yellow-600 px-4 py-2 text-sm font-bold text-white hover:bg-yellow-700"
            >
              + Add Product
            </button>
          }
        >
          <ProductsTable
            rows={products}
            onChange={updateProduct}
            onRemove={removeProduct}
          />
          
          <div className="flex justify-end gap-4 mt-4">
            <div className="flex items-center gap-2 border border-yellow-300 px-4 py-2 bg-yellow-50 rounded-lg">
              <span className="text-sm font-bold text-slate-700">Total Deduction Value:</span>
              <span className="text-lg font-extrabold text-red-600">₹{totalDeductionValue}</span>
            </div>
          </div>
        </Card>

        {/* ===== PART 6: ADDITIONAL POD ===== */}
        <Card title="Additional POD Details">
          <div className="grid grid-cols-12 gap-3">
            <Input
              col="col-span-12 md:col-span-2"
              label="LR No"
              value={additionalPod.lrNo}
              onChange={(v) => setAdditionalPod(p => ({ ...p, lrNo: v }))}
            />

            <Input
              type="date"
              col="col-span-12 md:col-span-2"
              label="LR Date"
              value={additionalPod.lrDate}
              onChange={(v) => setAdditionalPod(p => ({ ...p, lrDate: v }))}
            />

            <Input
              col="col-span-12 md:col-span-2"
              label="Order No"
              value={additionalPod.orderNo}
              onChange={(v) => setAdditionalPod(p => ({ ...p, orderNo: v }))}
            />

            <Input
              col="col-span-12 md:col-span-2"
              label="Docket No"
              value={additionalPod.docketNo}
              onChange={(v) => setAdditionalPod(p => ({ ...p, docketNo: v }))}
            />

            <Input
              type="date"
              col="col-span-12 md:col-span-2"
              label="POD Date"
              value={additionalPod.podDate}
              onChange={(v) => setAdditionalPod(p => ({ ...p, podDate: v }))}
            />

            <Select
              col="col-span-12 md:col-span-2"
              label="POD Received"
              value={additionalPod.podReceived}
              onChange={(v) => setAdditionalPod(p => ({ ...p, podReceived: v }))}
              options={POD_RECEIVED_STATUS}
            />
          </div>
        </Card>

        {/* ===== PART 7: ACKNOWLEDGMENT ===== */}
        <Card title="Acknowledgment & Payment">
          <div className="grid grid-cols-12 gap-3">
            <Input
              type="date"
              col="col-span-12 md:col-span-3"
              label="Last POD Date"
              value={acknowledgment.lastPodDate}
              onChange={(v) => setAcknowledgment(p => ({ ...p, lastPodDate: v }))}
            />

            <Select
              col="col-span-12 md:col-span-3"
              label="POD Status"
              value={acknowledgment.podStatus}
              onChange={(v) => setAcknowledgment(p => ({ ...p, podStatus: v }))}
              options={["Clear & Ok", "Deductions", "Disputed", "Pending"]}
            />

            <Input
              type="date"
              col="col-span-12 md:col-span-3"
              label="Due Date"
              value={acknowledgment.dueDate}
              onChange={(v) => setAcknowledgment(p => ({ ...p, dueDate: v }))}
            />

            <Input
              type="date"
              col="col-span-12 md:col-span-3"
              label="Payment Date"
              value={acknowledgment.paymentDate}
              onChange={(v) => setAcknowledgment(p => ({ ...p, paymentDate: v }))}
            />
          </div>
        </Card>

        {/* ===== PART 8: FINAL CALCULATIONS ===== */}
        <Card title="Final Summary">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-3 bg-yellow-50 p-4 rounded-xl border border-yellow-200">
              <div className="text-xs text-yellow-600 font-bold">Total Amount</div>
              <div className="text-2xl font-extrabold text-slate-900">₹{num(vendor.amount).toLocaleString()}</div>
            </div>
            
            <div className="col-span-12 md:col-span-3 bg-yellow-50 p-4 rounded-xl border border-yellow-200">
              <div className="text-xs text-yellow-600 font-bold">Advance Paid</div>
              <div className="text-2xl font-extrabold text-slate-900">₹{num(vendor.advance).toLocaleString()}</div>
            </div>
            
            <div className="col-span-12 md:col-span-3 bg-red-50 p-4 rounded-xl border border-red-200">
              <div className="text-xs text-red-600 font-bold">Total Deductions</div>
              <div className="text-2xl font-extrabold text-red-700">₹{(num(vendor.totalDeduction) + totalDeductionValue).toLocaleString()}</div>
            </div>
            
            <div className="col-span-12 md:col-span-3 bg-green-50 p-4 rounded-xl border border-green-200">
              <div className="text-xs text-green-600 font-bold">Final Balance</div>
              <div className="text-2xl font-extrabold text-green-700">₹{finalBalance.toLocaleString()}</div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-700">
              <span className="font-bold">Note:</span> Final Amount will be calculated after all deductions and additions from the purchase panel.
              {finalBalance <= 0 ? (
                <span className="ml-2 text-green-600">✓ All payments cleared</span>
              ) : (
                <span className="ml-2 text-orange-600">⚠ Balance payment pending</span>
              )}
            </div>
          </div>
        </Card>

        {/* ===== PART 9: REPORT VIEW ===== */}
        <Card title="POD Report View">
          <div className="overflow-auto rounded-xl border border-yellow-300">
            <table className="min-w-full w-full text-sm">
              <thead className="sticky top-0 bg-yellow-400">
                <tr>
                  <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900">Date</th>
                  <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900">Purchase No</th>
                  <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900">Order</th>
                  <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900">Party Name</th>
                  <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900">Plant Code</th>
                  <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900">Order Type</th>
                  <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900">Pin Code</th>
                  <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900">State</th>
                  <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900">District</th>
                  <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900">From</th>
                  <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900">To</th>
                  <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900">Weight</th>
                  <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900">Unloading</th>
                  <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900">POD Upload</th>
                  <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold text-slate-900">POD Received</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-yellow-50">
                  <td className="border border-yellow-300 px-2 py-2">{header.date}</td>
                  <td className="border border-yellow-300 px-2 py-2">QUE-001</td>
                  <td className="border border-yellow-300 px-2 py-2">JL-Aug-001</td>
                  <td className="border border-yellow-300 px-2 py-2">Indorama India Pvt ltd</td>
                  <td className="border border-yellow-300 px-2 py-2">Kandla - 9002</td>
                  <td className="border border-yellow-300 px-2 py-2">Sales</td>
                  <td className="border border-yellow-300 px-2 py-2">207243</td>
                  <td className="border border-yellow-300 px-2 py-2">Uttar Pradesh</td>
                  <td className="border border-yellow-300 px-2 py-2">Etah</td>
                  <td className="border border-yellow-300 px-2 py-2">Kandla</td>
                  <td className="border border-yellow-300 px-2 py-2">Darayoganj</td>
                  <td className="border border-yellow-300 px-2 py-2">20</td>
                  <td className="border border-yellow-300 px-2 py-2">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Completed</span>
                  </td>
                  <td className="border border-yellow-300 px-2 py-2">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Completed</span>
                  </td>
                  <td className="border border-yellow-300 px-2 py-2">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">Pending</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}