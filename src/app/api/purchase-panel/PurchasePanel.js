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
  
  header: {
    purchaseNo: { type: String },
    pricingSerialNo: { type: String },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
    branchName: { type: String },
    branchCode: { type: String },
    date: { type: Date, default: Date.now },
    delivery: { type: String, enum: ['Urgent', 'Normal', 'Express', 'Scheduled'], default: 'Normal' }
  },

  billing: {
    billingType: { type: String, enum: ['Single - Order', 'Multi - Order'], default: 'Multi - Order' },
    noOfLoadingPoints: { type: String, default: '1' },
    noOfDroppingPoint: { type: String, default: '1' },
    collectionCharges: { type: String, default: '0' },
    cancellationCharges: { type: String, default: 'Nil' },
    loadingCharges: { type: String, default: 'Nil' },
    otherCharges: { type: String, default: 'Nil' }
  },

  orderRows: [{
    _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    orderNo: { type: String },
    partyName: { type: String },
    plantCode: { type: String },
    plantName: { type: String },
    orderType: { type: String, enum: ['Sales', 'STO Order', 'Export', 'Import'], default: 'Sales' },
    pinCode: { type: String },
    state: { type: String },
    district: { type: String },
    from: { type: String },
    to: { type: String },
    locationRate: { type: String, default: '' },
    priceList: { type: String, default: '' },
    weight: { type: Number, default: 0 },
    rate: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 }
  }],

  purchaseDetails: {
    vendorStatus: { type: String, enum: ['Active', 'Blacklisted'], default: 'Active' },
    vendorName: { type: String },
    vendorCode: { type: String },
    vehicleNo: { type: String },
    vehicleType: { type: String },
    driverMobileNo: { type: String },
    purchaseType: { type: String, enum: ['Loading & Unloading', 'Unloading Only', 'Safi Vehicle'], default: 'Loading & Unloading' },
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

  additions: [{
    _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    description: { type: String },
    amount: { type: Number, default: 0 }
  }],

  deductions: [{
    _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    description: { type: String },
    amount: { type: Number, default: 0 }
  }],

  totalAdditions: { type: Number, default: 0 },
  totalDeductions: { type: Number, default: 0 },
  totalOrderAmount: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },

  registeredVehicle: {
    vehiclePlate: { type: String, default: '' },
    isRegistered: { type: Boolean, default: false }
  },

  approval: {
    status: { type: String, enum: ['Approved', 'Rejected', 'Pending'], default: 'Pending' },
    remarks: { type: String, default: '' }
  },

  arrivalDetails: {
    date: { type: Date, default: Date.now },
    time: { type: String, default: '' }
  },

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
  // Calculate total order amount
  this.totalOrderAmount = this.orderRows.reduce((sum, row) => sum + (row.totalAmount || 0), 0);
  
  // Calculate total additions
  this.totalAdditions = this.additions.reduce((sum, row) => sum + (row.amount || 0), 0);
  
  // Calculate total deductions
  this.totalDeductions = this.deductions.reduce((sum, row) => sum + (row.amount || 0), 0);
  
  // Calculate balance
  const amount = this.purchaseDetails?.amount || 0;
  const advance = this.purchaseDetails?.advance || 0;
  this.balance = amount - advance - this.totalDeductions + this.totalAdditions;
  
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