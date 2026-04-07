import mongoose from 'mongoose';

const rateSlabSchema = new mongoose.Schema({
  fromQty: {
    type: Number,
    required: true
  },
  toQty: {
    type: Number,
    required: true
  },
  rate: {
    type: Number,
    required: true
  }
});

const rateMasterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true
  },
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true
  },
  rateSlabs: [rateSlabSchema],
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CompanyUser'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to ensure unique title per company
rateMasterSchema.index({ companyId: 1, title: 1 }, { unique: true });

const RateMaster = mongoose.models.RateMaster || mongoose.model('RateMaster', rateMasterSchema);

export default RateMaster;