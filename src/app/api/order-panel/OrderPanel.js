//import mongoose from 'mongoose';
//
//const orderPanelSchema = new mongoose.Schema({
//  // Auto-generated order panel number (OP-0001, OP-0002, etc.)
//  orderPanelNo: {
//    type: String,
//    unique: true,
//    required: true,
//    index: true
//  },
//  
//  // Header Information
//  branch: {
//    type: mongoose.Schema.Types.ObjectId,
//    ref: 'Branch',
//    required: true
//  },
//  branchName: String,
//  branchCode: String,
//  delivery: {
//    type: String,
//    enum: ['Urgent', 'Normal', 'Express', 'Scheduled'],
//    default: 'Normal'
//  },
//  date: {
//    type: Date,
//    default: Date.now
//  },
//  
//  // Customer Information
//  customerId: {
//    type: mongoose.Schema.Types.ObjectId,
//    ref: 'Customer',
//    required: false
//  },
//  customerCode: String,
//  customerName: String,
//  contactPerson: String,
//  partyName: String,
//  
//  // Charges
//  collectionCharges: {
//    type: Number,
//    default: 0
//  },
//  cancellationCharges: {
//    type: String,
//    default: 'Nil'
//  },
//  loadingCharges: {
//    type: String,
//    default: 'Nil'
//  },
//  otherCharges: {
//    type: Number,
//    default: 0
//  },
//  
//  // Plant Routes/Rows
//  plantRows: [{
//    _id: {
//      type: mongoose.Schema.Types.ObjectId,
//      default: () => new mongoose.Types.ObjectId()
//    },
//    plantCode: {
//      type: mongoose.Schema.Types.ObjectId,
//      ref: 'Plant'
//    },
//    plantName: String,
//    plantCodeValue: String,
//    orderType: {
//      type: String,
//      enum: ['Sales', 'STO Order', 'Export', 'Import'],
//      default: 'Sales'
//    },
//    pinCode: String,
//    from: {
//      type: mongoose.Schema.Types.ObjectId,
//      ref: 'Branch'
//    },
//    fromName: String,
//    to: {
//      type: mongoose.Schema.Types.ObjectId,
//      ref: 'Branch'
//    },
//    toName: String,
//    // NEW FIELDS - taluka
//    taluka: String,
//    talukaName: String,
//    district: String,
//    districtName: String,
//    state: String,
//    stateName: String,
//    country: String,
//    countryName: String,
//    weight: {
//      type: Number,
//      default: 0
//    },
//    status: {
//      type: String,
//      enum: ['Open', 'Hold', 'Cancelled'],
//      default: 'Open'
//    },
//    // Additional fields for rates
//    locationRate: {
//      type: Number,
//      default: 0
//    },
//    rate: {
//      type: Number,
//      default: 0
//    },
//    totalAmount: {
//      type: Number,
//      default: 0
//    }
//  }],
//  
//  // Pack Data
//  packData: {
//    PALLETIZATION: [{
//      _id: {
//        type: mongoose.Schema.Types.ObjectId,
//        default: () => new mongoose.Types.ObjectId()
//      },
//      noOfPallets: Number,
//      unitPerPallets: Number,
//      totalPkgs: Number,
//      pkgsType: String,
//      uom: String,
//      skuSize: String,
//      packWeight: Number,
//      productName: String,
//      wtLtr: Number,
//      actualWt: Number,
//      chargedWt: Number,
//      wtUom: String
//    }],
//    'UNIFORM - BAGS/BOXES': [{
//      _id: {
//        type: mongoose.Schema.Types.ObjectId,
//        default: () => new mongoose.Types.ObjectId()
//      },
//      totalPkgs: Number,
//      pkgsType: String,
//      uom: String,
//      skuSize: String,
//      packWeight: Number,
//      productName: String,
//      wtLtr: Number,
//      actualWt: Number,
//      chargedWt: Number,
//      wtUom: String
//    }],
//    'LOOSE - CARGO': [{
//      _id: {
//        type: mongoose.Schema.Types.ObjectId,
//        default: () => new mongoose.Types.ObjectId()
//      },
//      uom: String,
//      productName: String,
//      actualWt: Number,
//      chargedWt: Number
//    }]
//  },
//  
//  // Calculated fields
//  totalWeight: {
//    type: Number,
//    default: 0
//  },
//  totalAmount: {
//    type: Number,
//    default: 0
//  },
//  
//  // Company & User Tracking
//  companyId: {
//    type: mongoose.Schema.Types.ObjectId,
//    ref: 'Company',
//    required: true
//  },
//  createdBy: {
//    type: mongoose.Schema.Types.ObjectId,
//    ref: 'CompanyUser'
//  },
//  
//  // Status
//  panelStatus: {
//    type: String,
//    enum: ['Draft', 'Submitted', 'Approved', 'Completed', 'Cancelled'],
//    default: 'Draft'
//  },
//  
//  // Timestamps
//  createdAt: {
//    type: Date,
//    default: Date.now
//  },
//  updatedAt: {
//    type: Date,
//    default: Date.now
//  }
//});
//
//// Calculate totals before saving
//orderPanelSchema.pre('save', function(next) {
//  // Calculate total weight from plantRows
//  this.totalWeight = this.plantRows.reduce((sum, row) => sum + (row.weight || 0), 0);
//  
//  // Calculate total amount from plantRows (weight * rate)
//  this.totalAmount = this.plantRows.reduce((sum, row) => {
//    return sum + ((row.weight || 0) * (row.rate || 0));
//  }, 0);
//  
//  // Update individual plantRow totalAmount
//  this.plantRows = this.plantRows.map(row => ({
//    ...row,
//    totalAmount: (row.weight || 0) * (row.rate || 0)
//  }));
//  
//  this.updatedAt = Date.now();
//  next();
//});
//
//// Update timestamp on save
//orderPanelSchema.pre('save', function(next) {
//  this.updatedAt = Date.now();
//  next();
//});
//
//const OrderPanel = mongoose.models.OrderPanel || mongoose.model('OrderPanel', orderPanelSchema);
//export default OrderPanel;
import mongoose from 'mongoose';

const orderPanelSchema = new mongoose.Schema({
  // Auto-generated order panel number (OP-0001, OP-0002, etc.)
  orderPanelNo: {
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
    enum: ['Urgent', 'Normal', 'Express', 'Scheduled'],
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
  customerCode: String,
  customerName: String,
  contactPerson: String,
  partyName: String,
  
  // Charges
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
    type: Number,
    default: 0
  },
  
  // Plant Routes/Rows
  plantRows: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    },
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
    taluka: String,
    talukaName: String,
    district: String,
    districtName: String,
    state: String,
    stateName: String,
    country: String,
    countryName: String,
    weight: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['Open', 'Hold', 'Cancelled'],
      default: 'Open'
    },
    locationRate: {
      type: Number,
      default: 0
    },
    rate: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      default: 0
    }
  }],
  
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
      wtUom: String
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
      nos: {
        type: Number,
        default: 0
      },
      productName: {
        type: String,
        default: ''
      },
      uom: {
        type: String,
        default: 'MT'
      },
      length: {
        type: Number,
        default: 0
      },
      width: {
        type: Number,
        default: 0
      },
      height: {
        type: Number,
        default: 0
      },
      actualWt: {
        type: Number,
        default: 0
      },
      chargedWt: {
        type: Number,
        default: 0
      }
    }]
  },
  
  // Calculated fields
  totalWeight: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 0
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
orderPanelSchema.pre('save', function(next) {
  this.totalWeight = this.plantRows.reduce((sum, row) => sum + (row.weight || 0), 0);
  this.totalAmount = this.plantRows.reduce((sum, row) => {
    return sum + ((row.weight || 0) * (row.rate || 0));
  }, 0);
  this.plantRows = this.plantRows.map(row => ({
    ...row,
    totalAmount: (row.weight || 0) * (row.rate || 0)
  }));
  this.updatedAt = Date.now();
  next();
});

// Update timestamp on save
orderPanelSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const OrderPanel = mongoose.models.OrderPanel || mongoose.model('OrderPanel', orderPanelSchema);
export default OrderPanel;