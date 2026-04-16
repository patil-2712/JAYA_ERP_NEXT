import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  companyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Company", 
    required: true 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "CompanyUser" 
  },
  vehicleNumber: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  rcNumber: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  pucNumber: {
    type: String,
    uppercase: true,
    trim: true,
  },
  fitnessNumber: {
    type: String,
    uppercase: true,
    trim: true,
  },
  ownerName: {
    type: String,
    required: true,
    trim: true,
  },
  chasisNumber: {
    type: String,
    uppercase: true,
    trim: true,
  },
  insuranceNumber: {
    type: String,
    uppercase: true,
    trim: true,
  },
  vehicleType: {
    type: String,
    trim: true,
  },
  vehicleWeight: {
    type: Number,
    default: 0,
  },
  // Document arrays for multiple file uploads
  rcDocuments: [{
    type: String,
    default: []
  }],
  pucDocuments: [{
    type: String,
    default: []
  }],
  fitnessDocuments: [{
    type: String,
    default: []
  }],
  weightSlipDocuments: [{
    type: String,
    default: []
  }],
  insuranceDocuments: [{
    type: String,
    default: []
  }],
  chasisDocuments: [{
    type: String,
    default: []
  }],
  vehiclePhotos: [{
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

// Compound index to ensure unique vehicle per company
vehicleSchema.index({ companyId: 1, vehicleNumber: 1 }, { unique: true });

const Vehicle = mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema);

export default Vehicle;