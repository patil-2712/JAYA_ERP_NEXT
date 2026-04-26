import mongoose from 'mongoose';

// Define the schema for ItemGroup
const ItemGroupSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'companyUser' },
  
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  category: { type: String, default: '' }, // NEW: Item Category field
}, { timestamps: true });

// Create a model for the schema
const ItemGroup = mongoose.models.ItemGroup || mongoose.model('ItemGroup', ItemGroupSchema);

export default ItemGroup;