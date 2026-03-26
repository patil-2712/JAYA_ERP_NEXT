import mongoose from 'mongoose';
const { Schema } = mongoose;

const transportPriceListSchema = new mongoose.Schema({
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
  district: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  // Price slabs
  price075: {
    type: Number,
    required: true,
    default: 0
  },
  price275to3: {
    type: Number,
    required: true,
    default: 0
  },
  price3to5: {
    type: Number,
    required: true,
    default: 0
  },
  price5Above: {
    type: Number,
    required: true,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index to ensure unique pincode per company
transportPriceListSchema.index({ companyId: 1, pincode: 1 }, { unique: true });

const TransportPriceList = mongoose.models.TransportPriceList || mongoose.model('TransportPriceList', transportPriceListSchema);

export default TransportPriceList;