import mongoose from 'mongoose';

const skuSizeSchema = new mongoose.Schema({
  value: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    enum: [
      'BAG', 'BAL', 'BDL', 'BKL', 'BOU', 'BOX', 'BTL', 'BUN', 'CAN', 'CBM', 
      'CCM', 'CMS', 'CTN', 'DOZ', 'DRM', 'GGK', 'GMS', 'GRS', 'GYD', 'KGS', 
      'KLR', 'KME', 'LTR', 'MLT', 'MTR', 'MTS', 'NOS', 'OTH', 'PAC', 'PCS', 
      'PRS', 'QTL', 'ROL', 'SET', 'SQF', 'SQM', 'SQY', 'TBS', 'TGM', 'THD', 
      'TON', 'TUB', 'UGS', 'UNT', 'YDS'
    ]
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

// Compound index for unique size per company
skuSizeSchema.index({ companyId: 1, value: 1, unit: 1 }, { unique: true });

// Virtual field for display
skuSizeSchema.virtual('display').get(function() {
  return `${this.value} ${this.unit}`;
});

// Ensure virtuals are included in JSON
skuSizeSchema.set('toJSON', { virtuals: true });
skuSizeSchema.set('toObject', { virtuals: true });

const SKUSize = mongoose.models.SKUSize || mongoose.model('SKUSize', skuSizeSchema);

export default SKUSize;