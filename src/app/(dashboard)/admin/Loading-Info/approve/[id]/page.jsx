"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";

/* =======================
  HELPERS / CONSTANTS
======================= */
const DELIVERY_OPTIONS = ["Urgent", "Normal", "Express", "Scheduled"];
const ORDER_TYPES = ["Sales", "STO Order", "Export", "Import"];
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
  "YaraVita Stopit 1Ltr"
];
const SKU_SIZE_OPTIONS = ["20 Kgs", "10 Kgs", "1 Kgs", "100 Ltr", "200 Kgs", "1 Ltr", "20"];
const VEHICLE_TYPE_OPTIONS = ["Truck - 6 Wheels", "Truck - 10 Wheels", "Truck - 14 Wheels", "Container", "Trailer"];
const BILLING_TYPES = ["Multi - Order", "Single Order"];
const PACK_TYPES = [
  { key: "PALLETIZATION", label: "Palletization" },
  { key: "UNIFORM - BAGS/BOXES", label: "Uniform - Bags/Boxes" },
  { key: "LOOSE - CARGO", label: "Loose - Cargo" },
];
const APPROVAL_STATUS = ["Approved", "Rejected", "Pending"];
const LOADING_STATUS = ["Loaded", "Partially Loaded", "Not Loaded"];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/* =======================
  File Display Component with Direct Preview (Click on Image)
========================= */
function FileDisplayItem({ file, label }) {
  const [showModal, setShowModal] = useState(false);
  
  // Check if file is an image
  const isImage = (filePath) => {
    if (!filePath) return false;
    return filePath.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i);
  };
  
  // Check if file is a video
  const isVideo = (filePath) => {
    if (!filePath) return false;
    return filePath.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i);
  };
  
  const getFileName = () => {
    if (file.originalName) return file.originalName;
    if (file.name) return file.name;
    return label || 'File';
  };

  const getFileTypeLabel = () => {
    if (isImage(file.path)) return 'Image';
    if (isVideo(file.path)) return 'Video';
    return 'Document';
  };

  const handleClick = () => {
    if (isImage(file.path) || isVideo(file.path)) {
      setShowModal(true);
    } else if (file.path) {
      window.open(file.path, '_blank');
    }
  };

  return (
    <>
      {/* File Card - Click anywhere to preview */}
      <div 
        onClick={handleClick}
        className="group relative bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer"
      >
        {/* Image/Video Preview Area */}
        <div className="aspect-video bg-gray-100 flex items-center justify-center relative overflow-hidden">
          {isImage(file.path) ? (
            <img 
              src={file.path} 
              alt={getFileName()}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = `
                  <div class="flex flex-col items-center justify-center text-gray-400">
                    <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span class="text-xs mt-1">Preview not available</span>
                  </div>
                `;
              }}
            />
          ) : isVideo(file.path) ? (
            <div className="relative w-full h-full bg-gray-800 flex items-center justify-center">
              <svg className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <span className="absolute bottom-2 right-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
                Video
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="text-xs mt-1">{getFileTypeLabel()}</span>
            </div>
          )}
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
            <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
        </div>
        
        {/* File Info */}
        <div className="p-2 border-t border-slate-100">
          <p className="text-xs font-medium text-slate-700 truncate" title={getFileName()}>
            {getFileName()}
          </p>
          <p className="text-xs text-slate-500">
            {file.size ? `${(file.size / 1024).toFixed(1)} KB` : getFileTypeLabel()}
          </p>
        </div>
      </div>

      {/* Modal for Full Size Preview */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div className="relative max-w-6xl max-h-[90vh] w-full h-full">
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 text-3xl transition-colors z-10"
            >
              ✕
            </button>
            
            {/* Download button */}
            <a
              href={file.path}
              download
              className="absolute -top-12 left-0 text-white hover:text-gray-300 text-sm flex items-center gap-2 z-10 bg-black/50 px-3 py-1 rounded-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </a>
            
            {/* Content */}
            {isImage(file.path) && (
              <img 
                src={file.path} 
                alt={getFileName()}
                className="w-full h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            )}
            
            {isVideo(file.path) && (
              <video 
                src={file.path} 
                controls 
                autoPlay
                className="w-full h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              >
                Your browser does not support the video tag.
              </video>
            )}
            
            {/* File name overlay */}
            <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm bg-black/60 py-2 rounded-lg mx-auto w-max px-4">
              {getFileName()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* =======================
  File Grid Group Component
========================= */
function FileGridGroup({ title, files, emptyMessage = "No files uploaded" }) {
  const fileArray = Object.entries(files).flatMap(([key, fileList]) => 
    fileList.map(file => ({ ...file, key }))
  );

  if (fileArray.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div>
      {title && <h4 className="text-xs font-bold text-slate-600 mb-3">{title}</h4>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {fileArray.map((file, idx) => (
          <FileDisplayItem 
            key={`${file.key}-${idx}`}
            file={file}
            label={file.key}
          />
        ))}
      </div>
    </div>
  );
}

/* =======================
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

function Input({ label, value, col = "", type = "text", readOnly = true }) {
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

function Select({ label, value, options = [], col = "", readOnly = true }) {
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

function EditableSelect({ label, value, onChange, options = [], col = "" }) {
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
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function EditableInput({ label, value, onChange, col = "", type = "text" }) {
  return (
    <div className={col}>
      <label className="text-xs font-bold text-slate-600">{label}</label>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
      />
    </div>
  );
}

/* =======================
  Orders Table Component (Read-only)
========================= */
function OrdersTable({ rows }) {
  return (
    <div className="overflow-auto rounded-xl border border-yellow-300">
      <table className="min-w-full w-full text-sm">
        <thead className="sticky top-0 bg-yellow-400">
          <tr>
            <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold">Order</th>
            <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold">Party Name</th>
            <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold">Plant</th>
            <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold">Order Type</th>
            <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold">Pin Code</th>
            <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold">State</th>
            <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold">District</th>
            <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold">From</th>
            <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold">To</th>
            <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold">Weight</th>
           </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row._id} className="hover:bg-yellow-50 even:bg-slate-50">
              <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.orderNo || '-'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.partyName || '-'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.plantName || '-'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.orderType || '-'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.pinCode || '-'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.state || '-'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.district || '-'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.from || '-'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.to || '-'}</td>
              <td className="border border-yellow-300 px-2 py-2 text-slate-700">{row.weight || '0'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* =======================
  Pack Type Table Component (Read-only)
========================= */
function PackTypeTable({ packType, rows }) {
  const cols = useMemo(() => {
    if (packType === "PALLETIZATION") {
      return [
        { key: "noOfPallets", label: "NO OF PALLETS" },
        { key: "unitPerPallets", label: "UNIT PER PALLETS" },
        { key: "totalPkgs", label: "TOTAL PKGS" },
        { key: "pkgsType", label: "PKGS TYPE" },
        { key: "uom", label: "UOM" },
        { key: "skuSize", label: "SKU - SIZE" },
        { key: "packWeight", label: "PACK - WEIGHT" },
        { key: "productName", label: "PRODUCT NAME" },
        { key: "wtLtr", label: "WT (LTR)" },
        { key: "actualWt", label: "ACTUAL - WT" },
        { key: "chargedWt", label: "CHARGED - WT" },
        { key: "wtUom", label: "UOM" },
      ];
    }
    if (packType === "UNIFORM - BAGS/BOXES") {
      return [
        { key: "totalPkgs", label: "TOTAL PKGS" },
        { key: "pkgsType", label: "PKGS TYPE" },
        { key: "uom", label: "UOM" },
        { key: "skuSize", label: "SKU - SIZE" },
        { key: "packWeight", label: "PACK - WEIGHT" },
        { key: "productName", label: "PRODUCT NAME" },
        { key: "wtLtr", label: "WT (LTR)" },
        { key: "actualWt", label: "ACTUAL - WT" },
        { key: "chargedWt", label: "CHARGED - WT" },
        { key: "wtUom", label: "UOM" },
      ];
    }
    return [
      { key: "uom", label: "UOM" },
      { key: "productName", label: "PRODUCT NAME" },
      { key: "actualWt", label: "ACTUAL - WT" },
      { key: "chargedWt", label: "CHARGED - WT" },
    ];
  }, [packType]);

  return (
    <div className="overflow-auto rounded-xl border border-yellow-300">
      <table className="min-w-full w-full text-sm">
        <thead className="sticky top-0 bg-yellow-400">
          <tr>
            {packType === "PALLETIZATION" && (
              <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold">UNIFORM</th>
            )}
            {cols.map((c) => (
              <th key={c.key} className="border border-yellow-500 px-3 py-3 text-xs font-extrabold">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r._id} className="hover:bg-yellow-50 even:bg-slate-50">
              {packType === "PALLETIZATION" && (
                <td className="border border-yellow-300 px-2 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={r.isUniform || false}
                    disabled
                    className="h-4 w-4 rounded border-yellow-300 opacity-50"
                  />
                </td>
              )}
              {cols.map((c) => (
                <td key={c.key} className="border border-yellow-300 px-2 py-2 text-slate-700">
                  {r[c.key] || '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* =======================
  MAIN APPROVE PAGE
========================= */
export default function ApproveLoadingPanel() {
  const router = useRouter();
  const params = useParams();
  const panelId = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // State for all data
  const [header, setHeader] = useState({});
  const [orderRows, setOrderRows] = useState([]);
  const [vehicleInfo, setVehicleInfo] = useState({});
  const [activePack, setActivePack] = useState("PALLETIZATION");
  const [packData, setPackData] = useState({
    PALLETIZATION: [],
    "UNIFORM - BAGS/BOXES": [],
    "LOOSE - CARGO": [],
  });
  
  // File states - for displaying existing files
  const [existingFiles, setExistingFiles] = useState({
    vbp: {},
    vft: {},
    vot: {},
    vl: {},
    weighment: { weighSlip: [] }
  });

  // Approval states - THESE ARE EDITABLE
  const [vbpUploads, setVbpUploads] = useState({
    approval: "",
    remark: "",
  });

  const [vftUploads, setVftUploads] = useState({
    approval: "",
  });

  const [votUploads, setVotUploads] = useState({
    approval: "",
  });

  const [vlUploads, setVlUploads] = useState({
    approval: "",
    loadingStatus: "",
  });

  const [loadedWeighment, setLoadedWeighment] = useState({
    approval: "",
    loadingCharges: "",
    loadingStaffMunshiyana: "",
    otherExpenses: "",
    vehicleFloorTarpaulin: "",
    vehicleOuterTarpaulin: "",
  });

  const [gpsTracking, setGpsTracking] = useState({
    driverMobileNumber: "",
    isTrackingActive: false,
  });

  const [arrivalDetails, setArrivalDetails] = useState({
    date: "",
    time: "",
  });

  useEffect(() => {
    fetchLoadingPanelData();
  }, []);

  const fetchLoadingPanelData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch(`/api/loading-panel?id=${panelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch loading panel');
      }

      const panel = data.data;
      
      // Set header data
      setHeader({
        vehicleArrivalNo: panel.vehicleArrivalNo || "",
        vehicleNegotiationNo: panel.vehicleNegotiationNo || "",
        branchName: panel.branchName || "",
        branchCode: panel.branchCode || "",
        date: panel.date ? new Date(panel.date).toLocaleDateString('en-GB') : "",
        delivery: panel.delivery || "",
        billingType: panel.billingType || "",
        noOfLoadingPoints: panel.noOfLoadingPoints || "",
        noOfDroppingPoint: panel.noOfDroppingPoint || "",
        collectionCharges: panel.collectionCharges || "",
        cancellationCharges: panel.cancellationCharges || "",
        loadingCharges: panel.loadingCharges || "",
        otherCharges: panel.otherCharges || "",
      });

      // Set order rows
      if (panel.orderRows && panel.orderRows.length > 0) {
        setOrderRows(panel.orderRows);
      }

      // Set vehicle info
      if (panel.vehicleInfo) {
        setVehicleInfo({
          vehicleNo: panel.vehicleInfo.vehicleNo || "",
          driverMobileNo: panel.vehicleInfo.driverMobileNo || "",
          driverName: panel.vehicleInfo.driverName || "",
          drivingLicense: panel.vehicleInfo.drivingLicense || "",
          vehicleWeight: panel.vehicleInfo.vehicleWeight || "",
          vehicleOwnerName: panel.vehicleInfo.vehicleOwnerName || "",
          vehicleOwnerRC: panel.vehicleInfo.vehicleOwnerRC || "",
          ownerPanCard: panel.vehicleInfo.ownerPanCard || "",
          verified: panel.vehicleInfo.verified || false,
          vehicleType: panel.vehicleInfo.vehicleType || "",
          insuranceNumber: panel.vehicleInfo.insuranceNumber || "",
          chasisNumber: panel.vehicleInfo.chasisNumber || "",
          fitnessNumber: panel.vehicleInfo.fitnessNumber || "",
          pucNumber: panel.vehicleInfo.pucNumber || "",
        });
      }

      // Set pack data
      if (panel.packData) {
        setPackData({
          PALLETIZATION: panel.packData.PALLETIZATION || [],
          "UNIFORM - BAGS/BOXES": panel.packData["UNIFORM - BAGS/BOXES"] || [],
          "LOOSE - CARGO": panel.packData["LOOSE - CARGO"] || [],
        });
      }
      if (panel.activePack) {
        setActivePack(panel.activePack);
      }

      // Set existing files
      const vbpFiles = {};
      const vftFiles = {};
      const votFiles = {};
      const vlFiles = {};

      // VBP Files
      if (panel.vbpUploads) {
        ['vbp1','vbp2','vbp3','vbp4','vbp5','vbp6','vbp7','videoVbp'].forEach(key => {
          if (panel.vbpUploads[key]) {
            vbpFiles[key] = [{
              path: panel.vbpUploads[key],
              name: `${key} file`,
              originalName: `${key} file`
            }];
          }
        });
      }

      // VFT Files
      if (panel.vftUploads) {
        ['vft1','vft2','vft3','vft4','vft5','vft6','vft7','videoVft'].forEach(key => {
          if (panel.vftUploads[key]) {
            vftFiles[key] = [{
              path: panel.vftUploads[key],
              name: `${key} file`,
              originalName: `${key} file`
            }];
          }
        });
      }

      // VOT Files
      if (panel.votUploads) {
        ['vot1','vot2','vot3','vot4','vot5','vot6','vot7','videoVot'].forEach(key => {
          if (panel.votUploads[key]) {
            votFiles[key] = [{
              path: panel.votUploads[key],
              name: `${key} file`,
              originalName: `${key} file`
            }];
          }
        });
      }

      // VL Files
      if (panel.vlUploads) {
        ['vl1','vl2','vl3','vl4','vl5','vl6','vl7','videoVl'].forEach(key => {
          if (panel.vlUploads[key]) {
            vlFiles[key] = [{
              path: panel.vlUploads[key],
              name: `${key} file`,
              originalName: `${key} file`
            }];
          }
        });
      }

      setExistingFiles({
        vbp: vbpFiles,
        vft: vftFiles,
        vot: votFiles,
        vl: vlFiles,
        weighment: {
          weighSlip: panel.loadedWeighment?.weighSlip ? [{
            path: panel.loadedWeighment.weighSlip,
            name: 'Weigh Slip',
            originalName: 'Weigh Slip'
          }] : []
        }
      });

      // Set approval sections
      if (panel.vbpUploads) {
        setVbpUploads({
          approval: panel.vbpUploads.approval || "",
          remark: panel.vbpUploads.remark || "",
        });
      }

      if (panel.vftUploads) {
        setVftUploads({
          approval: panel.vftUploads.approval || "",
        });
      }

      if (panel.votUploads) {
        setVotUploads({
          approval: panel.votUploads.approval || "",
        });
      }

      if (panel.vlUploads) {
        setVlUploads({
          approval: panel.vlUploads.approval || "",
          loadingStatus: panel.vlUploads.loadingStatus || "",
        });
      }

      if (panel.loadedWeighment) {
        setLoadedWeighment({
          approval: panel.loadedWeighment.approval || "",
          loadingCharges: panel.loadedWeighment.loadingCharges?.toString() || "",
          loadingStaffMunshiyana: panel.loadedWeighment.loadingStaffMunshiyana?.toString() || "",
          otherExpenses: panel.loadedWeighment.otherExpenses?.toString() || "",
          vehicleFloorTarpaulin: panel.loadedWeighment.vehicleFloorTarpaulin?.toString() || "",
          vehicleOuterTarpaulin: panel.loadedWeighment.vehicleOuterTarpaulin?.toString() || "",
        });
      }

      if (panel.gpsTracking) {
        setGpsTracking({
          driverMobileNumber: panel.gpsTracking.driverMobileNumber || "",
          isTrackingActive: panel.gpsTracking.isTrackingActive || false,
        });
      }

      if (panel.arrivalDetails) {
        setArrivalDetails({
          date: panel.arrivalDetails.date ? new Date(panel.arrivalDetails.date).toISOString().split('T')[0] : "",
          time: panel.arrivalDetails.time || "",
        });
      }

    } catch (error) {
      console.error('Error fetching loading panel:', error);
      setError(error.message);
      alert(`❌ Failed to load loading panel: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch current data
      const fetchRes = await fetch(`/api/loading-panel?id=${panelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const fetchData = await fetchRes.json();
      
      if (!fetchData.success) {
        throw new Error('Failed to fetch loading panel data');
      }
      
      const currentData = fetchData.data;
      
      // Update only the approval sections
      const updatedData = {
        ...currentData,
        vbpUploads: {
          ...currentData.vbpUploads,
          approval: vbpUploads.approval,
          remark: vbpUploads.remark,
        },
        vftUploads: {
          ...currentData.vftUploads,
          approval: vftUploads.approval,
        },
        votUploads: {
          ...currentData.votUploads,
          approval: votUploads.approval,
        },
        vlUploads: {
          ...currentData.vlUploads,
          approval: vlUploads.approval,
          loadingStatus: vlUploads.loadingStatus,
        },
        loadedWeighment: {
          ...currentData.loadedWeighment,
          approval: loadedWeighment.approval,
          loadingCharges: num(loadedWeighment.loadingCharges),
          loadingStaffMunshiyana: num(loadedWeighment.loadingStaffMunshiyana),
          otherExpenses: num(loadedWeighment.otherExpenses),
          vehicleFloorTarpaulin: num(loadedWeighment.vehicleFloorTarpaulin),
          vehicleOuterTarpaulin: num(loadedWeighment.vehicleOuterTarpaulin),
        },
        gpsTracking: {
          ...currentData.gpsTracking,
          driverMobileNumber: gpsTracking.driverMobileNumber,
          isTrackingActive: gpsTracking.isTrackingActive,
        },
        arrivalDetails: {
          date: arrivalDetails.date ? new Date(arrivalDetails.date) : currentData.arrivalDetails?.date,
          time: arrivalDetails.time,
        }
      };
      
      // Send update
      const res = await fetch('/api/loading-panel', {
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
        alert(`✅ Loading Panel approved/updated successfully!`);
        router.push('/admin/Loading-Info');
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

  const calculateTotalWeight = () => {
    return orderRows.reduce((sum, row) => sum + num(row.weight), 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading loading panel...</p>
          </div>
        </div>
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
                onClick={() => router.push('/admin/Loading-Info')}
                className="text-emerald-600 hover:text-emerald-800 font-medium text-sm flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to List
              </button>
              <div className="text-lg font-extrabold text-slate-900">
                Approve Loading Panel: {header.vehicleArrivalNo}
              </div>
            </div>
            <div className="text-xs text-emerald-600 mt-1 font-medium">
              ⓘ Click on any image to view full size
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleApprove}
              disabled={saving}
              className={`rounded-xl px-5 py-2 text-sm font-bold text-white transition ${
                saving 
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
              ) : 'Submit Approval'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-full p-4">
        {/* Vehicle Arrival Information - READ ONLY */}
        <Card title="Vehicle Arrival Information (Read Only)">
          <div className="grid grid-cols-12 gap-3">
            <Input
              col="col-span-12 md:col-span-3"
              label="Vehicle Arrival No"
              value={header.vehicleArrivalNo}
            />
            <Input
              col="col-span-12 md:col-span-3"
              label="Vehicle Negotiation No"
              value={header.vehicleNegotiationNo}
            />
            <Input
              col="col-span-12 md:col-span-3"
              label="Branch"
              value={header.branchName}
            />
            <Input
              col="col-span-12 md:col-span-3"
              label="Date"
              value={header.date}
            />
            <Input
              col="col-span-12 md:col-span-2"
              label="Delivery"
              value={header.delivery}
            />
          </div>
        </Card>

        {/* Billing Type / Charges - READ ONLY */}
        <div className="mt-4">
          <Card title="Billing Type / Charges (Read Only)">
            <div className="overflow-auto rounded-xl border border-yellow-300">
              <table className="min-w-full w-full text-sm">
                <thead className="sticky top-0 bg-yellow-400">
                  <tr>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold">Billing Type</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold">Loading Points</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold">Drop Points</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold">Collection Charges</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold">Cancellation Charges</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold">Loading Charges</th>
                    <th className="border border-yellow-500 px-3 py-3 text-xs font-extrabold">Other Charges</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-yellow-50 even:bg-slate-50">
                    <td className="border border-yellow-300 px-2 py-2 text-slate-700">{header.billingType || '-'}</td>
                    <td className="border border-yellow-300 px-2 py-2 text-slate-700">{header.noOfLoadingPoints || '-'}</td>
                    <td className="border border-yellow-300 px-2 py-2 text-slate-700">{header.noOfDroppingPoint || '-'}</td>
                    <td className="border border-yellow-300 px-2 py-2 text-slate-700">{header.collectionCharges || '-'}</td>
                    <td className="border border-yellow-300 px-2 py-2 text-slate-700">{header.cancellationCharges || '-'}</td>
                    <td className="border border-yellow-300 px-2 py-2 text-slate-700">{header.loadingCharges || '-'}</td>
                    <td className="border border-yellow-300 px-2 py-2 text-slate-700">{header.otherCharges || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Orders Table - READ ONLY */}
        <div className="mt-4">
          <Card title="Order Details (Read Only)">
            <OrdersTable rows={orderRows} />
            <div className="flex justify-end mt-4">
              <div className="flex items-center gap-3 border border-yellow-300 px-6 py-3 bg-yellow-50 rounded-xl">
                <div className="text-sm font-extrabold text-slate-900">Total Weight:</div>
                <div className="text-xl font-extrabold text-emerald-700">{calculateTotalWeight()}</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Vehicle & Driver Details - READ ONLY */}
        <div className="mt-4">
          <Card title="Vehicle & Driver Details (Read Only)">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-4">
                <Input label="Vehicle No" value={vehicleInfo.vehicleNo} />
                <Input label="Vehicle Type" value={vehicleInfo.vehicleType} />
                <Input label="Vehicle Weight (MT)" value={vehicleInfo.vehicleWeight} />
                <Input label="Insurance Number" value={vehicleInfo.insuranceNumber} />
                <Input label="Chasis Number" value={vehicleInfo.chasisNumber} />
                <Input label="Fitness Number" value={vehicleInfo.fitnessNumber} />
                <Input label="PUC Number" value={vehicleInfo.pucNumber} />
              </div>
              <div className="col-span-12 md:col-span-4">
                <Input label="Driver Name" value={vehicleInfo.driverName} />
                <Input label="Driver Mobile No" value={vehicleInfo.driverMobileNo} />
                <Input label="Driving License" value={vehicleInfo.drivingLicense} />
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    checked={vehicleInfo.verified}
                    disabled
                    className="h-4 w-4 rounded border-slate-300 opacity-50"
                  />
                  <label className="ml-2 text-sm font-medium text-slate-700">Verified</label>
                </div>
              </div>
              <div className="col-span-12 md:col-span-4">
                <Input label="Vehicle Owner Name" value={vehicleInfo.vehicleOwnerName} />
                <Input label="Vehicle Owner RC" value={vehicleInfo.vehicleOwnerRC} />
                <Input label="Owner Pan Card" value={vehicleInfo.ownerPanCard} />
              </div>
            </div>
          </Card>
        </div>

        {/* Pack Type - READ ONLY */}
        <div className="mt-4">
          <Card title="Pack Type (Read Only)">
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <div className="text-sm font-bold text-slate-700">Selected Pack Type:</div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm">
                  {PACK_TYPES.find(p => p.key === activePack)?.label || activePack}
                </div>
              </div>
            </div>
            <PackTypeTable packType={activePack} rows={packData[activePack] || []} />
          </Card>
        </div>

        {/* VBP Panel - EDITABLE with direct image preview */}
        <div className="mt-4">
          <Card title="VBP - PANEL (Vehicle Body Pictures) - Editable">
            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-600">Approval:</span>
                  <EditableSelect
                    value={vbpUploads.approval}
                    onChange={(v) => setVbpUploads({ ...vbpUploads, approval: v })}
                    options={APPROVAL_STATUS}
                  />
                </div>
                <div className="text-xs text-slate-500">
                  <span className="font-bold">Note:</span> Click on any image to view full size
                </div>
              </div>
              
              {/* Display uploaded files in grid */}
              <FileGridGroup 
                title="Vehicle Body Pictures"
                files={existingFiles.vbp}
                emptyMessage="No VBP images uploaded"
              />

              <div className="mt-3">
                <label className="text-xs font-bold text-slate-600">Remark</label>
                <EditableInput
                  value={vbpUploads.remark}
                  onChange={(v) => setVbpUploads({ ...vbpUploads, remark: v })}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* VFT Panel - EDITABLE with direct image preview */}
        <div className="mt-4">
          <Card title="VFT - PANEL (Vehicle Floor Tarpaulin Pictures) - Editable">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-bold text-slate-600">Approval:</span>
                <EditableSelect
                  value={vftUploads.approval}
                  onChange={(v) => setVftUploads({ ...vftUploads, approval: v })}
                  options={APPROVAL_STATUS}
                />
              </div>
              
              {/* Display uploaded files in grid */}
              <FileGridGroup 
                title="Vehicle Floor Tarpaulin Pictures"
                files={existingFiles.vft}
                emptyMessage="No VFT images uploaded"
              />
            </div>
          </Card>
        </div>

        {/* VOT Panel - EDITABLE with direct image preview */}
        <div className="mt-4">
          <Card title="VOT - PANEL (Vehicle Outer Tarpaulin Pictures) - Editable">
            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-bold text-slate-600">Approval:</span>
                <EditableSelect
                  value={votUploads.approval}
                  onChange={(v) => setVotUploads({ ...votUploads, approval: v })}
                  options={APPROVAL_STATUS}
                />
              </div>
              
              {/* Display uploaded files in grid */}
              <FileGridGroup 
                title="Vehicle Outer Tarpaulin Pictures"
                files={existingFiles.vot}
                emptyMessage="No VOT images uploaded"
              />
            </div>
          </Card>
        </div>

        {/* VL Panel - EDITABLE with direct image preview */}
        <div className="mt-4">
          <Card title="VL - PANEL (Vehicle Loading Pictures) - Editable">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-bold text-slate-600">Approval:</span>
                <EditableSelect
                  value={vlUploads.approval}
                  onChange={(v) => setVlUploads({ ...vlUploads, approval: v })}
                  options={APPROVAL_STATUS}
                />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-bold text-slate-600">Loading Status:</span>
                <EditableSelect
                  value={vlUploads.loadingStatus}
                  onChange={(v) => setVlUploads({ ...vlUploads, loadingStatus: v })}
                  options={LOADING_STATUS}
                />
              </div>
              
              {/* Display uploaded files in grid */}
              <FileGridGroup 
                title="Vehicle Loading Pictures"
                files={existingFiles.vl}
                emptyMessage="No VL images uploaded"
              />
            </div>
          </Card>
        </div>

        {/* Loaded Vehicle Weighment - EDITABLE with direct image preview */}
        <div className="mt-4">
          <Card title="Loaded Vehicle Weighment & Charges - Editable">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Weighment Approval</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-bold text-slate-600">Approval:</span>
                    <EditableSelect
                      value={loadedWeighment.approval}
                      onChange={(v) => setLoadedWeighment({ ...loadedWeighment, approval: v })}
                      options={APPROVAL_STATUS}
                    />
                  </div>
                  
                  {/* Display weigh slip */}
                  {existingFiles.weighment?.weighSlip?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-600 mb-2">Weigh Slip:</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {existingFiles.weighment.weighSlip.map((file, idx) => (
                          <FileDisplayItem 
                            key={`weighSlip-${idx}`}
                            file={file}
                            label="Weigh Slip"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="col-span-12 md:col-span-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Loading Charges</h3>
                  <div className="space-y-2">
                    <EditableInput
                      label="Loading Charges"
                      value={loadedWeighment.loadingCharges}
                      onChange={(v) => setLoadedWeighment({ ...loadedWeighment, loadingCharges: v })}
                      type="number"
                    />
                    <EditableInput
                      label="Loading Staff Munshiyana"
                      value={loadedWeighment.loadingStaffMunshiyana}
                      onChange={(v) => setLoadedWeighment({ ...loadedWeighment, loadingStaffMunshiyana: v })}
                      type="number"
                    />
                    <EditableInput
                      label="Other Expenses"
                      value={loadedWeighment.otherExpenses}
                      onChange={(v) => setLoadedWeighment({ ...loadedWeighment, otherExpenses: v })}
                      type="number"
                    />
                    <EditableInput
                      label="Vehicle Floor Tarpaulin"
                      value={loadedWeighment.vehicleFloorTarpaulin}
                      onChange={(v) => setLoadedWeighment({ ...loadedWeighment, vehicleFloorTarpaulin: v })}
                      type="number"
                    />
                    <EditableInput
                      label="Vehicle Outer Tarpaulin"
                      value={loadedWeighment.vehicleOuterTarpaulin}
                      onChange={(v) => setLoadedWeighment({ ...loadedWeighment, vehicleOuterTarpaulin: v })}
                      type="number"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* GPS Tracking - EDITABLE */}
        <div className="mt-4">
          <Card title="Vehicle GPS Tracking - Editable">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-4">
                  <EditableInput
                    label="Driver Mobile Number"
                    value={gpsTracking.driverMobileNumber}
                    onChange={(v) => setGpsTracking({ ...gpsTracking, driverMobileNumber: v })}
                  />
                </div>
                <div className="col-span-12 md:col-span-4">
                  <div className="flex items-center gap-2 mt-6">
                    <input
                      type="checkbox"
                      checked={gpsTracking.isTrackingActive}
                      onChange={(e) => setGpsTracking({ ...gpsTracking, isTrackingActive: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="text-sm font-medium text-slate-700">Tracking Active</label>
                  </div>
                </div>
                <div className="col-span-12 md:col-span-4">
                  <div className="text-xs text-slate-500 mt-6">
                    API Status: {gpsTracking.isTrackingActive ? 'Active' : 'Ready'}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Arrival Details - EDITABLE */}
        <div className="mt-4">
          <Card title="Arrival Details - Editable">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-3">
                <EditableInput
                  label="Arrival Date"
                  type="date"
                  value={arrivalDetails.date}
                  onChange={(v) => setArrivalDetails({ ...arrivalDetails, date: v })}
                />
              </div>
              <div className="col-span-12 md:col-span-3">
                <EditableInput
                  label="Arrival Time"
                  type="time"
                  value={arrivalDetails.time}
                  onChange={(v) => setArrivalDetails({ ...arrivalDetails, time: v })}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}