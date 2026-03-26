// /models/ConsignmentNote.js
import mongoose from 'mongoose';

const consignmentNoteSchema = new mongoose.Schema({
  lrNo: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  
  // Reference fields
  vnnNo: {
    type: String,
    default: '',
    index: true,
    sparse: true
  },
  
  vehicleNegotiationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VehicleNegotiation',
    index: true,
    sparse: true
  },

  loadingInfoNo: {
    type: String,
    default: '',
    index: true
  },
  
  header: {
    partyName: { type: String, default: '' },
    orderNo: { type: String, default: '' },
    orderType: { type: String, enum: ['Sales', 'STO Order', 'Export', 'Import'], default: 'Sales' },
    plantCode: { type: String, default: '' },
    plantName: { type: String, default: '' },
    hiredOwned: { type: String, enum: ['Hired', 'Owned'], default: 'Hired' },
    vendorCode: { type: String, default: '' },
    vendorName: { type: String, default: '' },
    from: { type: String, default: '' },
    to: { type: String, default: '' },
    district: { type: String, default: '' },
    state: { type: String, default: '' },
    vehicleNo: { type: String, default: '' },
    partyNo: { type: String, default: '' },
    lrDate: { type: String, default: '' },
    unit: { type: String, enum: ['MT', 'KG', 'LTR', 'TON', 'M3', 'PCS'], default: 'MT' },
    status: { type: String, enum: ['Draft', 'Approved', 'Rejected', 'Completed', 'Pending'], default: 'Pending' } // ✅ Updated enum
  },

  consignor: {
    name: { type: String, default: '' },
    address: { type: String, default: '' }
  },

  consignee: {
    name: { type: String, default: '' },
    address: { type: String, default: '' }
  },

  invoice: {
    boeInvoice: { type: String, enum: ['As Per Invoice', 'As Per Bill Of Entry', 'NA'], default: 'As Per Invoice' },
    boeInvoiceNo: { type: String, default: '' },
    boeInvoiceDate: { type: String, default: '' },
    invoiceValue: { type: String, default: '' }
  },

  ewaybill: {
    ewaybillNo: { type: String, default: '' },
    expiryDate: { type: String, default: '' },
    containerNo: { type: String, default: '' }
  },

  productRows: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    },
    totalPkgs: { type: String, default: '' },
    pkgsType: { type: String, default: '' },
    uom: { type: String, default: '' },
    packSize: { type: String, default: '' },
    skuSize: { type: String, default: '' },
    productName: { type: String, default: '' },
    wtLtr: { type: Number, default: 0 },
    actualWt: { type: Number, default: 0 },
    chargedWt: { type: Number, default: 0 },
    wtUom: { type: String, enum: ['KG', 'LTR', 'TON', 'M3', 'PCS', 'Kgs', 'Ltr', 'MT'], default: 'MT' }
  }],

  totalWeight: {
    type: Number,
    default: 0
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

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Pre-save middleware
consignmentNoteSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Recalculate total weight
  this.totalWeight = this.productRows.reduce((sum, row) => 
    sum + (parseFloat(row.actualWt) || 0), 0
  );
  
  next();
});

const ConsignmentNote = mongoose.models.ConsignmentNote || 
  mongoose.model('ConsignmentNote', consignmentNoteSchema);

export default ConsignmentNote;