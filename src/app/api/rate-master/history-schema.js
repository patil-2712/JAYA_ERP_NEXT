import mongoose from 'mongoose';

const rateHistorySchema = new mongoose.Schema({
  rateMasterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RateMaster',
    required: true
  },
  rateMasterTitle: {
    type: String,
    required: true
  },
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true
  },
  locationName: {
    type: String,
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
  version: {
    type: Number,
    default: 1
  },
  revisedAt: {
    type: Date,
    default: Date.now
  },
  revisedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CompanyUser'
  },
  action: {
    type: String,
    enum: ['CREATED', 'REVISED', 'DELETED'],
    default: 'CREATED'
  },
  changes: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true
});

const RateHistory = mongoose.models.RateHistory || mongoose.model('RateHistory', rateHistorySchema);

export default RateHistory;