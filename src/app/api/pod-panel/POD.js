import mongoose from 'mongoose';

// Product Schema
const productSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  lrRefId: { type: String, default: '' },
  productName: { type: String, default: '' },
  totalPkgs: { type: String, default: '' },
  pkgsType: { type: String, default: '' },
  uom: { type: String, default: '' },
  packSize: { type: String, default: '' },
  skuSize: { type: String, default: '' },
  wtLtr: { type: String, default: '' },
  actualWt: { type: String, default: '' },
  deliveryStatus: { type: String, default: '' },
  deduction: { type: String, default: '' },
  value: { type: String, default: '' }
}, { _id: false });

// LR Entry Schema
// LR Entry Schema - Add inPersonParsal field
const lrEntrySchema = new mongoose.Schema({
  _id: { type: String, required: true },
  lrNo: { type: String, default: '' },
  lrDate: { type: String, default: '' },
  orderNo: { type: String, default: '' },
  delivery: { type: String, enum: ['COURIER', 'IN-PERSON', 'EMAIL'], default: 'COURIER' },
  inPersonParsal: { type: String, enum: ['In Person', 'Parsal', ''], default: '' }, // ADD THIS LINE
  docketNo: { type: String, default: '' },
  podDate: { type: String, default: '' },
  podUpload: { type: String, default: '' },
  podReceived: { type: String, enum: ['Pending', 'Received', 'Partial'], default: 'Pending' }
}, { _id: false });

// Order Schema
const orderSchema = new mongoose.Schema({
  orderNo: { type: String, default: '' },
  partyName: { type: String, default: '' },
  branch: { type: String, default: '' },
  plantCode: { type: String, default: '' },
  orderType: { type: String, default: '' },
  pinCode: { type: String, default: '' },
  state: { type: String, default: '' },
  district: { type: String, default: '' },
  from: { type: String, default: '' },
  to: { type: String, default: '' },
  locationRate: { type: String, default: '' },
  weight: { type: Number, default: 0 }
}, { _id: false });

const podSchema = new mongoose.Schema({
  podNo: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  
  // References
  purchaseNo: {
    type: String,
    required: true,
    index: true
  },
  pricingSerialNo: {
    type: String,
    default: ''
  },
  
  // Header Information
  header: {
    podNo: { type: String, default: '' },
    purchaseNo: { type: String, default: '' },
    pricingSerialNo: { type: String, default: '' },
    branch: { type: String, default: '' },
    date: { type: Date, default: Date.now },
    delivery: { type: String, enum: ['Urgent', 'Normal', 'Express', 'Scheduled'], default: 'Normal' }
  },

  // Billing Information
  billing: {
    billingType: { type: String, enum: ['Single - Order', 'Multi - Order'], default: 'Multi - Order' },
    noOfLoadingPoints: { type: String, default: '' },
    noOfDroppingPoint: { type: String, default: '' }
  },

  // Orders from Purchase
  purchaseOrders: [orderSchema],

  // LR Entries
  lrEntries: [lrEntrySchema],

  // Products
  products: [productSchema],

  // Vendor Financial
 // In models/POD.js, update the vendorFinancial schema:

// Vendor Financial
vendorFinancial: {
  vendorName: { type: String, default: '' },
  vendorCode: { type: String, default: '' },  // ADD THIS LINE
  total: { type: Number, default: 0 },
  advance: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  poDeduction: { type: Number, default: 0 },
  podDeduction: { type: Number, default: 0 },  // ADD THIS LINE
  finalBalance: { type: Number, default: 0 }
},

  // POD Status Section
  podStatusSection: {
    lastPodDate: { type: String, default: '' },
    podStatus: { type: String, enum: ['Clear & Ok', 'Deductions', 'Pending', ''], default: 'Pending' },
    dueDate: { type: String, default: '' },
    paymentDate: { type: String, default: '' },
    acknowledgementMail: { type: Boolean, default: false },
    note: { type: String, default: '' }
  },

  // Remarks
  remarks: { type: String, default: '' },

  // Calculated Totals
  totalQuantity: { type: Number, default: 0 },
  totalActualWt: { type: Number, default: 0 },
  podDeduction: { type: Number, default: 0 },
  finalBalance: { type: Number, default: 0 },

  // Status
  podStatus: { type: String, enum: ['Pending', 'Received', 'Partial', 'Rejected'], default: 'Pending' },
  paymentStatus: { type: String, enum: ['Pending', 'Partially Paid', 'Paid'], default: 'Pending' },

  // Company & User Tracking
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CompanyUser'
  }

}, { timestamps: true });

// Pre-save middleware to calculate totals
podSchema.pre('save', function(next) {
  // Calculate total quantity from products
  this.totalQuantity = this.products.reduce((sum, p) => sum + (parseFloat(p.totalPkgs) || 0), 0);
  
  // Calculate total actual weight from products
  this.totalActualWt = this.products.reduce((sum, p) => sum + (parseFloat(p.actualWt) || 0), 0);
  
  // Calculate POD deduction from products value
  this.podDeduction = this.products.reduce((sum, p) => sum + (parseFloat(p.value) || 0), 0);
  
  // Calculate final balance
  const total = this.vendorFinancial?.total || 0;
  const advance = this.vendorFinancial?.advance || 0;
  const poDeduction = this.vendorFinancial?.poDeduction || 0;
  this.finalBalance = total - advance - poDeduction - this.podDeduction;
  
  // Update header with POD number
  if (this.header) {
    this.header.podNo = this.podNo;
  }
  
  next();
});

const POD = mongoose.models.POD || mongoose.model('POD', podSchema);

export default POD;