// AdvancePayment.js
import mongoose from 'mongoose';

const advancePaymentSchema = new mongoose.Schema({
  // Auto-generated payment number
  paymentNo: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  
  // Reference to Purchase Panel
  purchaseNo: {
    type: String,
    index: true,
    sparse: true
  },
  
  purchaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchasePanel',
    index: true,
    sparse: true
  },
  
  pricingSerialNo: {
    type: String,
    default: ''
  },
  
  // Purchase Amount from VNN (A x B)
  purchaseAmountFromVNN: {
    type: Number,
    default: 0
  },
  
  // Header Information
  header: {
    purchaseNo: { type: String, default: '' },
    pricingSerialNo: { type: String, default: '' },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
    branchName: { type: String, default: '' },
    branchCode: { type: String, default: '' },
    date: { type: Date, default: Date.now },
    delivery: { type: String, enum: ['Urgent', 'Normal', 'Express', 'Scheduled'], default: 'Normal' }
  },

  // Billing Charges
  billing: {
    billingType: { type: String, enum: ['Single - Order', 'Multi - Order'], default: 'Multi - Order' },
    noOfLoadingPoints: { type: String, default: '1' },
    noOfDroppingPoint: { type: String, default: '1' },
    collectionCharges: { type: String, default: '0' },
    cancellationCharges: { type: String, default: 'Nil' },
    loadingCharges: { type: String, default: 'Nil' },
    otherCharges: { type: String, default: '0' }
  },

  // Order Rows
  orderRows: [{
    _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    orderNo: { type: String, default: '' },
    partyName: { type: String, default: '' },
    plantCode: { type: String, default: '' },
    plantName: { type: String, default: '' },
    orderType: { type: String, enum: ['Sales', 'STO Order', 'Export', 'Import'], default: 'Sales' },
    pinCode: { type: String, default: '' },
    state: { type: String, default: '' },
    district: { type: String, default: '' },
    from: { type: String, default: '' },
    to: { type: String, default: '' },
    locationRate: { type: String, default: '' },
    priceList: { type: String, default: '' },
    weight: { type: Number, default: 0 },
    rate: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    collectionCharges: { type: String, default: '0' },
    cancellationCharges: { type: String, default: 'Nil' },
    loadingCharges: { type: String, default: 'Nil' },
    otherCharges: { type: String, default: '0' }
  }],

  // Purchase Terms (separate from vendorDetails)
  purchaseTerms: {
    purchaseType: { type: String, default: 'Loading & Unloading' },
    rateType: { type: String, enum: ['Per MT', 'Fixed'], default: 'Per MT' },
    paymentTerms: { type: String, default: '80 % Advance' }
  },

  // Vendor Details
  vendorDetails: {
    vendorStatus: { type: String, enum: ['Active', 'Blacklisted'], default: 'Active' },
    vendorCode: { type: String, default: '' },
    vendorName: { type: String, default: '' },
    vehicleNo: { type: String, default: '' },
    rate: { type: Number, default: 0 },
    weight: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    advance: { type: Number, default: 0 },
    accountNo: { type: String, default: '' },
    bankName: { type: String, default: '' },
    ifsc: { type: String, default: '' },
    transactionId: { type: String, default: '' }
  },

  // Additions
  additions: {
    totalAddition: { type: Number, default: 0 },
    items: [{
      _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
      description: { type: String, default: '' },
      amount: { type: Number, default: 0 }
    }]
  },

  // Deductions
  deductions: {
    totalDeduction: { type: Number, default: 0 },
    items: [{
      _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
      description: { type: String, default: '' },
      amount: { type: Number, default: 0 }
    }]
  },

  // Payment Details
  paymentDetails: {
    vendorNameDebit: { type: String, default: '' },
    accountNoCredit: { type: String, default: '' },
    finalAmount: { type: Number, default: 0 },
    remarks: { type: String, default: 'ADV Payment' },
    transactionId: { type: String, default: '' },
    bankVendorCode: { type: String, default: '' },
    paymentDate: { type: Date, default: Date.now },
    paymentStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Paid', 'Completed'], default: 'Pending' }
  },

  // Memo File from Vehicle Negotiation
  memoFile: {
    filePath: { type: String },
    fullPath: { type: String },
    filename: { type: String },
    originalName: { type: String },
    size: { type: Number },
    mimeType: { type: String }
  },

  // Calculated Fields
  balance: {
    type: Number,
    default: 0
  },
  
  totalOrderAmount: {
    type: Number,
    default: 0
  },

  // Status
  status: {
    type: String,
    enum: ['Draft', 'Pending', 'Approved', 'Rejected', 'Paid', 'Completed'],
    default: 'Draft'
  },

  // Queue Generation
  queueGenerated: {
    type: Boolean,
    default: false
  },
  
  queueDate: {
    type: Date
  },

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
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Pre-save middleware to calculate totals
advancePaymentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate total order amount from orderRows
  this.totalOrderAmount = this.orderRows.reduce((sum, row) => {
    const totalAmount = row.totalAmount || 0;
    const collectionCharges = num(row.collectionCharges);
    const cancellationCharges = num(row.cancellationCharges);
    const loadingCharges = num(row.loadingCharges);
    const otherCharges = num(row.otherCharges);
    return sum + totalAmount + collectionCharges + cancellationCharges + loadingCharges + otherCharges;
  }, 0);
  
  // Calculate total additions
  this.additions.totalAddition = this.additions.items.reduce((sum, item) => sum + (item.amount || 0), 0);
  
  // Calculate total deductions
  this.deductions.totalDeduction = this.deductions.items.reduce((sum, item) => sum + (item.amount || 0), 0);
  
  // Calculate balance: Purchase Amount - Advance + Additions - Deductions
  const purchaseAmount = this.purchaseAmountFromVNN || this.vendorDetails?.amount || 0;
  const advance = this.vendorDetails?.advance || 0;
  const totalAdditions = this.additions.totalAddition || 0;
  const totalDeductions = this.deductions.totalDeduction || 0;
  
  this.balance = purchaseAmount - advance + totalAdditions - totalDeductions;
  
  // Set final amount in payment details if not set
  if (!this.paymentDetails.finalAmount) {
    this.paymentDetails.finalAmount = advance;
  }
  
  next();
});

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

const AdvancePayment = mongoose.models.AdvancePayment || 
  mongoose.model('AdvancePayment', advancePaymentSchema);

export default AdvancePayment;