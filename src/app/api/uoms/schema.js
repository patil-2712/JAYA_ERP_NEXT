import mongoose from 'mongoose';

const uomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: false
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

// Compound index to ensure unique UOM name per company
uomSchema.index({ companyId: 1, name: 1 }, { unique: true });

const UOM = mongoose.models.UOM || mongoose.model('UOM', uomSchema);

export default UOM;