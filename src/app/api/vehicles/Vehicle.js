// models/Vehicle.js
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