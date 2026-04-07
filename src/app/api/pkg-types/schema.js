import mongoose from 'mongoose';

const pkgTypeSchema = new mongoose.Schema({
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

// Compound index to ensure unique PKG type name per company
pkgTypeSchema.index({ companyId: 1, name: 1 }, { unique: true });

const PkgType = mongoose.models.PkgType || mongoose.model('PkgType', pkgTypeSchema);

export default PkgType;