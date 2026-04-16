import mongoose from 'mongoose';

const ownerSchema = new mongoose.Schema({
  companyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Company", 
    required: true 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "CompanyUser" 
  },
  ownerName: {
    type: String,
    required: true,
    trim: true,
  },
  vehicleNumber: {
    type: String,
    required: true,
    uppercase: true,  // ✅ Auto uppercase
    trim: true,
  },
  ownerPanCard: {
    type: String,
    uppercase: true,  // ✅ Auto uppercase
    trim: true,
  },
  mobileNumber1: {
    type: String,
    trim: true,
  },
  mobileNumber2: {
    type: String,
    trim: true,
  },
  adharCardNumber: {
    type: String,
    trim: true,
  },
  rcNumber: {
    type: String,
    uppercase: true,  // ✅ Auto uppercase
    trim: true,
  },
  panCardDocuments: [{
    type: String,
    default: []
  }],
  adharCardDocuments: [{
    type: String,
    default: []
  }],
  rcDocuments: [{
    type: String,
    default: []
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

ownerSchema.index({ companyId: 1, ownerName: 1, vehicleNumber: 1 }, { unique: true });

const Owner = mongoose.models.Owner || mongoose.model('Owner', ownerSchema);

export default Owner;