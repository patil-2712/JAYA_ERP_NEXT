import mongoose from 'mongoose';

const plantSchema = new mongoose.Schema({
  companyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Company", 
    required: true 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "CompanyUser" 
  },
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
});

const Plant = mongoose.models.Plant || mongoose.model('Plant', plantSchema);

export default Plant;