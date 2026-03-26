import mongoose from 'mongoose';

const loadingPanelSchema = new mongoose.Schema({
  // Auto-generated vehicle arrival number
  vehicleArrivalNo: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  
  // Reference to vehicle negotiation
  vehicleNegotiationNo: {
    type: String,
    index: true,
    sparse: true
  },
  
  // Header Information
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch'
  },
  branchName: String,
  branchCode: String,
  date: {
    type: Date,
    default: Date.now
  },
  delivery: {
    type: String,
    enum: ['Urgent', 'Normal', 'Express', 'Scheduled'],
    default: 'Normal'
  },
  
  // Billing Information
  billingType: {
    type: String,
    enum: ['Multi - Order', 'Single Order'],
    default: 'Multi - Order'
  },
  noOfLoadingPoints: Number,
  noOfDroppingPoint: Number,
  collectionCharges: String,
  cancellationCharges: String,
  loadingCharges: String,
  otherCharges: String,
  
  // Orders
  orderRows: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    },
    orderNo: String,
    partyName: String,
    plantCode: String,
    plantName: String,
    orderType: String,
    pinCode: String,
    state: String,
    district: String,
    from: String,
    to: String,
    weight: Number
  }],
  
  // Vehicle & Driver
  vehicleInfo: {
    vehicleNo: {
      type: String,
      required: true
    },
    driverMobileNo: String,
    driverName: String,
    drivingLicense: String,
    vehicleWeight: Number,
    vehicleOwnerName: String,
    vehicleOwnerRC: String,
    ownerPanCard: String,
    verified: {
      type: Boolean,
      default: false
    },
    vehicleType: String,
    message: String,
    remarks: String,
    vehicleId: String,
    insuranceNumber: String,
    chasisNumber: String,
    fitnessNumber: String,
    pucNumber: String,
    
    // File upload paths
    rcDocument: String,
    panDocument: String,
    licenseDocument: String,
    driverPhoto: String
  },
  
  // Pack Data (from Order Panel)
  packData: {
    PALLETIZATION: [{
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId()
      },
      noOfPallets: Number,
      unitPerPallets: Number,
      totalPkgs: Number,
      pkgsType: String,
      uom: String,
      skuSize: String,
      packWeight: Number,
      productName: String,
      wtLtr: Number,
      actualWt: Number,
      chargedWt: Number,
      wtUom: String,
      isUniform: {
        type: Boolean,
        default: false
      }
    }],
    'UNIFORM - BAGS/BOXES': [{
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId()
      },
      totalPkgs: Number,
      pkgsType: String,
      uom: String,
      skuSize: String,
      packWeight: Number,
      productName: String,
      wtLtr: Number,
      actualWt: Number,
      chargedWt: Number,
      wtUom: String
    }],
    'LOOSE - CARGO': [{
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId()
      },
      uom: String,
      productName: String,
      actualWt: Number,
      chargedWt: Number
    }]
  },
  activePack: {
    type: String,
    enum: ['PALLETIZATION', 'UNIFORM - BAGS/BOXES', 'LOOSE - CARGO'],
    default: 'PALLETIZATION'
  },
  
  // Deductions
  deductionRows: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    },
    description: String,
    amount: Number
  }],
  totalQuantity: String,
  
  // Upload sections - VBP
  vbpUploads: {
    vbp1: String, vbp2: String, vbp3: String, vbp4: String,
    vbp5: String, vbp6: String, vbp7: String, videoVbp: String,
    approval: String,
    remark: String
  },
  
  // Upload sections - VFT
  vftUploads: {
    vft1: String, vft2: String, vft3: String, vft4: String,
    vft5: String, vft6: String, vft7: String, videoVft: String,
    approval: String
  },
  
  // Upload sections - VOT
  votUploads: {
    vot1: String, vot2: String, vot3: String, vot4: String,
    vot5: String, vot6: String, vot7: String, videoVot: String,
    approval: String
  },
  
  // Upload sections - VL
  vlUploads: {
    vl1: String, vl2: String, vl3: String, vl4: String,
    vl5: String, vl6: String, vl7: String, videoVl: String,
    approval: String,
    loadingStatus: String
  },
  
  // Loaded weighment
  loadedWeighment: {
    weighSlip: String,
    approval: String,
    loadingCharges: {
      type: Number,
      default: 0
    },
    loadingStaffMunshiyana: {
      type: Number,
      default: 0
    },
    otherExpenses: {
      type: Number,
      default: 0
    },
    vehicleFloorTarpaulin: {
      type: Number,
      default: 0
    },
    vehicleOuterTarpaulin: {
      type: Number,
      default: 0
    }
  },
  
  // GPS Tracking
  gpsTracking: {
    driverMobileNumber: String,
    isTrackingActive: {
      type: Boolean,
      default: false
    }
  },
  
  // Arrival details
  arrivalDetails: {
    date: Date,
    time: String
  },
  
  // Totals
  totalWeight: {
    type: Number,
    default: 0
  },
  totalActualWeight: {
    type: Number,
    default: 0
  },
  totalCharges: {
    type: Number,
    default: 0
  },
  
  // Document fields
  consignmentNote: String,
  invoice: String,
  ewaybill: String,
  
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
    enum: ['Draft', 'Submitted', 'Approved', 'Completed', 'Cancelled'],
    default: 'Draft'
  }
}, {
  timestamps: true
});

// Update timestamp on save
loadingPanelSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const LoadingPanel = mongoose.models.LoadingPanel || 
  mongoose.model('LoadingPanel', loadingPanelSchema);

export default LoadingPanel;