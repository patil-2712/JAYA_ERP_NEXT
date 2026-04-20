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
  
  // Orders with Taluka, District, State fields
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
    taluka: String,
    talukaName: String,
    district: String,
    districtName: String,
    state: String,
    stateName: String,
    from: String,
    fromName: String,
    to: String,
    toName: String,
    weight: Number,
    collectionCharges: Number,
    cancellationCharges: String,
    loadingCharges: String,
    otherCharges: Number
  }],
  
  // Vehicle & Driver with Owner Aadhar
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
    ownerAadharCard: String,
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
    driverPhoto: String,
    aadharDocument: String
  },
  
  // Helper / Co-Driver Information
  hasHelper: {
    type: Boolean,
    default: false
  },
  helperInfo: {
    name: String,
    mobileNo: String,
    photo: [String],
    aadharPhoto: [String]
  },
  
  // Vehicle Photos
  vehiclePhotos: [String],
  
  // Detention Information
  detentionDays: String,
  detentionNumber: String,
  
  // Vehicle Slip files
  vehicleSlips: [String],
  
  // Loaded Vehicle Slip
  loadedVehicleSlips: [String],
  
  // VL Photo Details (Height, Width, Nose for each photo)
  vlPhotoDetails: {
    type: Map,
    of: {
      height: { type: Number, default: 0 },
      width: { type: Number, default: 0 },
      nose: { type: Number, default: 0 }
    },
    default: () => new Map()
  },
  
  // Pack Data
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
    }],
    'NON-UNIFORM - GENERAL CARGO': [{
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId()
      },
      nos: Number,
      productName: String,
      uom: String,
      length: Number,
      width: Number,
      height: Number,
      actualWt: Number,
      chargedWt: Number
    }]
  },
  activePack: {
    type: String,
    enum: ['PALLETIZATION', 'UNIFORM - BAGS/BOXES', 'LOOSE - CARGO', 'NON-UNIFORM - GENERAL CARGO'],
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
  
  // Upload sections - VL with dynamic fields up to vl15
  vlUploads: {
    vl1: String, vl2: String, vl3: String, vl4: String,
    vl5: String, vl6: String, vl7: String, vl8: String, vl9: String,
    vl10: String, vl11: String, vl12: String, vl13: String, vl14: String, vl15: String,
    videoVl: String,
    approval: String,
    loadingStatus: {
      type: String,
      enum: ['Loaded', 'Partially Loaded', 'Not Loaded', ''],
      default: ''
    }
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
  
  // Arrival details with Out Date and Out Time
  arrivalDetails: {
    date: Date,
    time: String,
    outDate: Date,
    outTime: String
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
  
  // Selected references
  selectedVehicle: {
    id: String,
    vehicleNumber: String,
    ownerName: String
  },
  selectedVehicleNegotiation: {
    id: String,
    vnnNo: String
  },
  
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

// Index for better performance
loadingPanelSchema.index({ companyId: 1, createdAt: -1 });
loadingPanelSchema.index({ vehicleArrivalNo: 1, companyId: 1 });
loadingPanelSchema.index({ vehicleNegotiationNo: 1 });
loadingPanelSchema.index({ 'vehicleInfo.vehicleNo': 1 });

const LoadingPanel = mongoose.models.LoadingPanel || 
  mongoose.model('LoadingPanel', loadingPanelSchema);

export default LoadingPanel;