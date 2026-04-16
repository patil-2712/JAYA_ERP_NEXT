import mongoose from 'mongoose';

const purchaseTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CompanyUser',
    },
  },
  {
    timestamps: true,
  }
);

purchaseTypeSchema.index(
  {
    companyId: 1,
    name: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.models.PurchaseType ||
  mongoose.model('PurchaseType', purchaseTypeSchema);