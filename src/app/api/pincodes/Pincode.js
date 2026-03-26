// models/Pincode.js
import mongoose from 'mongoose';

const pincodeSchema = new mongoose.Schema({
  companyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Company", 
    required: true 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "CompanyUser" 
  },
  pincode: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Compound index to ensure unique pincode per company
pincodeSchema.index({ companyId: 1, pincode: 1 }, { unique: true });

const Pincode = mongoose.models.Pincode || mongoose.model('Pincode', pincodeSchema);

export default Pincode;