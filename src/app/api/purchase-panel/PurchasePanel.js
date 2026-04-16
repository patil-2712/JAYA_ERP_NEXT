// PurchasePanel.js
import mongoose from 'mongoose';

const purchasePanelSchema = new mongoose.Schema({
  purchaseNo: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  
  // References
  vehicleNegotiationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VehicleNegotiation',
    index: true,
    sparse: true
  },
  vnnNo: {
    type: String,
    index: true,
    sparse: true
  },
  pricingSerialNo: {
    type: String,
    index: true,
    sparse: true
  },
  loadingInfoNo: {
    type: String,
    index: true,
    sparse: true
  },
  
  // Header Information
  header: {
    purchaseNo: { type: String },
    pricingSerialNo: { type: String },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
    branchName: { type: String },
    branchCode: { type: String },
    date: { type: Date, default: Date.now },
    delivery: { type: String, enum: ['Urgent', 'Normal', 'Express', 'Scheduled'], default: 'Normal' }
  },

  // Billing Information
  billing: {
    billingType: { type: String, enum: ['Single - Order', 'Multi - Order'], default: 'Multi - Order' },
    noOfLoadingPoints: { type: String, default: '1' },
    noOfDroppingPoint: { type: String, default: '1' },
    collectionCharges: { type: String, default: '0' },
    cancellationCharges: { type: String, default: 'Nil' },
    loadingCharges: { type: String, default: 'Nil' },
    otherCharges: { type: String, default: 'Nil' }
  },

  // Order Rows (matches frontend orderRows)
  orderRows: [{
    _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    orderNo: { type: String },
    partyName: { type: String },
    plantCode: { type: String },
    plantName: { type: String },
    orderType: { type: String, enum: ['Sales', 'STO Order', 'Export', 'Import'], default: 'Sales' },
    pinCode: { type: String },
    taluka: { type: String },
    district: { type: String },
    state: { type: String },
    country: { type: String },
    from: { type: String },
    to: { type: String },
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

  // Purchase Details
 purchaseDetails: {
  vendorStatus: { type: String, enum: ['Active', 'Blacklisted'], default: 'Active' },
  vendorName: { type: String },
  vendorCode: { type: String },
  vehicleNo: { type: String },
  vehicleType: { type: String },
  driverMobileNo: { type: String },
  purchaseType: { type: String, default: 'Loading & Unloading' },  // ✅ Remove enum
  paymentTerms: { type: String, default: '80 % Advance' },
  rateType: { type: String, enum: ['Per MT', 'Fixed'], default: 'Per MT' },
  rate: { type: Number, default: 0 },
  weight: { type: Number, default: 0 },
  amount: { type: Number, default: 0 },
  advance: { type: Number, default: 0 },
  vehicleFloorTarpaulin: { type: Number, default: 0 },
  vehicleOuterTarpaulin: { type: Number, default: 0 },
  purchaseDate: { type: Date, default: Date.now }
},

  // Loading Expenses (matches frontend loadingExpenses)
  loadingExpenses: {
    loadingCharges: { type: Number, default: 0 },
    loadingStaffMunshiyana: { type: Number, default: 0 },
    otherExpenses: { type: Number, default: 0 },
    vehicleFloorTarpaulin: { type: Number, default: 0 },
    vehicleOuterTarpaulin: { type: Number, default: 0 }
  },
  totalLoadingExpenses: { type: Number, default: 0 },

  // Additions
  additions: [{
    _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    description: { type: String },
    amount: { type: Number, default: 0 }
  }],

  // Deductions
  deductions: [{
    _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    description: { type: String },
    amount: { type: Number, default: 0 }
  }],

  // Calculated Totals
  totalAdditions: { type: Number, default: 0 },
  totalDeductions: { type: Number, default: 0 },
  totalOrderAmount: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  netEffect: { type: Number, default: 0 },

  // Registered Vehicle
  registeredVehicle: {
    vehiclePlate: { type: String, default: '' },
    isRegistered: { type: Boolean, default: false }
  },

  // Approval
  approval: {
    status: { type: String, enum: ['Approved', 'Rejected', 'Pending'], default: 'Pending' },
    remarks: { type: String, default: '' }
  },

  // Arrival Details
  arrivalDetails: {
    date: { type: Date, default: Date.now },
    time: { type: String, default: '' }
  },

  // Memo File
  memoFile: {
    filePath: { type: String },
    fullPath: { type: String },
    filename: { type: String },
    originalName: { type: String },
    size: { type: Number },
    mimeType: { type: String }
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

  // Status
  panelStatus: {
    type: String,
    enum: ['Draft', 'Submitted', 'Approved', 'Completed', 'Cancelled'],
    default: 'Draft'
  }

}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save middleware to calculate totals
purchasePanelSchema.pre('save', function(next) {
  // Calculate total order amount from orderRows (weight * rate)
  this.totalOrderAmount = this.orderRows.reduce((sum, row) => {
    const totalAmount = (row.weight || 0) * (row.rate || 0);
    return sum + totalAmount;
  }, 0);
  
  // Calculate total additions
  this.totalAdditions = this.additions.reduce((sum, row) => sum + (row.amount || 0), 0);
  
  // Calculate total deductions
  this.totalDeductions = this.deductions.reduce((sum, row) => sum + (row.amount || 0), 0);
  
  // Calculate total loading expenses
  this.totalLoadingExpenses = (
    (this.loadingExpenses?.loadingCharges || 0) +
    (this.loadingExpenses?.loadingStaffMunshiyana || 0) +
    (this.loadingExpenses?.otherExpenses || 0) +
    (this.loadingExpenses?.vehicleFloorTarpaulin || 0) +
    (this.loadingExpenses?.vehicleOuterTarpaulin || 0)
  );
  
  // Calculate net effect
  const advance = this.purchaseDetails?.advance || 0;
  this.netEffect = advance + this.totalAdditions - this.totalDeductions - this.totalLoadingExpenses;
  
  // Calculate balance (Total Order Amount - Advance Paid)
  this.balance = this.totalOrderAmount - advance;
  
  // Update header with purchase number
  if (this.header) {
    this.header.purchaseNo = this.purchaseNo;
    this.header.pricingSerialNo = this.pricingSerialNo;
  }
  
  next();
});

// Update timestamp on save
purchasePanelSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const PurchasePanel = mongoose.models.PurchasePanel || 
  mongoose.model('PurchasePanel', purchasePanelSchema);

export default PurchasePanel;