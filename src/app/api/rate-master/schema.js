import mongoose from 'mongoose';

const locationRateSchema = new mongoose.Schema({
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true
  },
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
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  version: {
    type: Number,
    default: 1
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
  locationRates: [locationRateSchema],
  weightRule: {
    type: String,
    enum: ['above_25', 'all_weights'],
    default: 'all_weights'
  },
  approvalOption: {
    type: String,
    enum: ['contract_rate', 'mail_approval'],
    required: true
  },
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

rateMasterSchema.index({ companyId: 1, title: 1 }, { unique: true });

const RateMaster = mongoose.models.RateMaster || mongoose.model('RateMaster', rateMasterSchema);

export default RateMaster;