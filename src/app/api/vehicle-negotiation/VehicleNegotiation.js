import mongoose from 'mongoose';

const vehicleNegotiationSchema = new mongoose.Schema({
  // Auto-generated vehicle negotiation number (VNN-0001, VNN-0002, etc.)
  vnnNo: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  
  // Header Information
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true
  },
  branchName: String,
  branchCode: String,
  delivery: {
    type: String,
    enum: ['Urgent', 'Normal'],
    default: 'Normal'
  },
  date: {
    type: Date,
    default: Date.now
  },
  
  // Customer Information
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: false
  },
  customerName: String,
  customerCode: String,
  contactPerson: String,
  
  // Billing Information
  billingType: {
    type: String,
    enum: ['Multi - Order', 'Single Order'],
    default: 'Multi - Order'
  },
  loadingPoints: {
    type: Number,
    default: 1
  },
  dropPoints: {
    type: Number,
    default: 1
  },
  collectionCharges: {
    type: Number,
    default: 0
  },
  cancellationCharges: {
    type: String,
    default: 'Nil'
  },
  loadingCharges: {
    type: String,
    default: 'Nil'
  },
  otherCharges: {
    type: String,
    default: 'Nil'
  },
  
  // Orders Data (array of orders)
  orders: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    },
    orderNo: String,
    orderPanelId: String,
    partyName: String,
    customerId: mongoose.Schema.Types.ObjectId,
    customerCode: String,
    contactPerson: String,
    plantCode: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plant'
    },
    plantName: String,
    plantCodeValue: String,
    orderType: {
      type: String,
      enum: ['Sales', 'STO Order', 'Export', 'Import'],
      default: 'Sales'
    },
    pinCode: String,
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch'
    },
    fromName: String,
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch'
    },
    toName: String,
    taluka: {
      type: String,
      default: ''
    },
    talukaName: {
      type: String,
      default: ''
    },
    country: String,
    countryName: String,
    state: String,
    stateName: String,
    district: String,
    districtName: String,
    weight: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['Open', 'Hold', 'Cancelled'],
      default: 'Open'
    }
  }],
  
  // Total Calculations
  totalWeight: {
    type: Number,
    default: 0
  },
  
  // Negotiation Data
  negotiation: {
    maxRate: {
      type: Number,
      default: 0
    },
    targetRate: {
      type: Number,
      default: 0
    },
    purchaseType: {
      type: String,
      enum: ['Loading & Unloading', 'Unloading Only', 'Safi Vehicle'],
      default: 'Loading & Unloading'
    },
    oldRatePercent: String,
    remarks1: String,
    remarks2: String
  },
  
  // Vendors Data (Market Rates section)
  vendors: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    },
    vendorName: String,
    vendorCode: { type: String, default: '' },
    marketRate: {
      type: Number,
      default: 0
    }
  }],
  
  // Voice Note (store file info)
  voiceNote: {
    type: String,
    default: ''
  },
  voiceNoteFile: {
    filePath: String,
    fullPath: String,
    filename: String,
    originalName: String,
    size: Number,
    mimeType: String,
    uploadedAt: Date
  },
  
  pricingSerialNo: {
    type: String,
    ref: 'PricingPanel',
    index: true,
    sparse: true
  },
  pricingPanelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PricingPanel',
    index: true,
    sparse: true
  },
  
  // ✅ COMPLETE Approval Data with ALL fields
  approval: {
    vendorName: { type: String, default: '' },
    vendorCode: { type: String, default: '' },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', default: null },
    vendorStatus: { type: String, enum: ['Active', 'Blacklisted'], default: 'Active' },
    rateType: { type: String, enum: ['Per MT', 'Fixed'], default: 'Per MT' },
    finalPerMT: { type: Number, default: 0 },
    finalFix: { type: Number, default: 0 },
    vehicleNo: { type: String, default: '' },
    vehicleId: { type: String, default: '' },
    vehicleData: { type: mongoose.Schema.Types.Mixed, default: null },
    mobile: { type: String, default: '' },
    purchaseType: { type: String, default: 'Loading & Unloading' },
    paymentTerms: { type: String, default: '80 % Advance' },
    approvalStatus: { type: String, enum: ['Approved', 'Reject', 'Pending'], default: 'Pending' },
    remarks: { type: String, default: '' },
    memoStatus: { type: String, enum: ['Uploaded', 'Pending'], default: 'Pending' },
    memoFile: {
      type: {
        filePath: { type: String, default: '' },
        fullPath: { type: String, default: '' },
        filename: { type: String, default: '' },
        originalName: { type: String, default: '' },
        size: { type: Number, default: 0 },
        mimeType: { type: String, default: '' },
        uploadedAt: { type: Date, default: Date.now }
      },
      required: false,
      default: null
    }
  },
  
  // Purchase Amount Calculation
  purchaseAmount: {
    type: Number,
    default: 0
  },
  
  // Report Data (for display)
  reportRows: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    },
    date: Date,
    vnn: String,
    order: String,
    partyName: String,
    plantCode: String,
    orderType: String,
    pinCode: String,
    from: String,
    to: String,
    taluka: String,
    district: String,
    state: String,
    country: String,
    weight: Number,
    orderStatus: String,
    approval: String,
    memo: String
  }],
  
  // Company & User Tracking
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CompanyUser'
  },
  
  // Status
  panelStatus: {
    type: String,
    enum: ['Draft', 'Submitted', 'Negotiating', 'Approved', 'Completed', 'Cancelled'],
    default: 'Draft'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate totals before saving
vehicleNegotiationSchema.pre('save', function(next) {
  // Calculate total weight
  this.totalWeight = this.orders.reduce((sum, order) => sum + (order.weight || 0), 0);
  
  // Calculate purchase amount
  if (this.approval.rateType === 'Per MT') {
    this.purchaseAmount = (this.approval.finalPerMT || 0) * this.totalWeight;
  } else {
    this.purchaseAmount = this.approval.finalFix || 0;
  }
  
  // Generate report rows from orders with taluka
  this.reportRows = this.orders.map(order => ({
    date: this.date,
    vnn: this.vnnNo,
    order: order.orderNo,
    partyName: order.partyName || '-',
    plantCode: order.plantName || '-',
    orderType: order.orderType,
    pinCode: order.pinCode || '-',
    from: order.fromName || '-',
    to: order.toName || '-',
    taluka: order.talukaName || order.taluka || '-',
    district: order.districtName || '-',
    state: order.stateName || '-',
    country: order.countryName || '-',
    weight: order.weight,
    orderStatus: order.status,
    approval: this.approval.approvalStatus || 'Pending',
    memo: this.approval.memoStatus || 'Pending'
  }));
  
  this.updatedAt = Date.now();
  next();
});

// Update timestamp on save
vehicleNegotiationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const VehicleNegotiation = mongoose.models.VehicleNegotiation || 
  mongoose.model('VehicleNegotiation', vehicleNegotiationSchema);

export default VehicleNegotiation;