import mongoose from 'mongoose';

const paymentTermsSchema = new mongoose.Schema(
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

paymentTermsSchema.index(
  {
    companyId: 1,
    name: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.models.PaymentTerms ||
  mongoose.model('PaymentTerms', paymentTermsSchema);