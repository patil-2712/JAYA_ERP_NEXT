import mongoose from 'mongoose';

const loadingCounterSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    unique: true
  },
  sequence: {
    type: Number,
    default: 0
  },
  prefix: {
    type: String,
    default: 'LD'
  },
  year: {
    type: Number,
    default: () => new Date().getFullYear()
  }
}, {
  timestamps: true
});

export async function getNextLoadingNumber(companyId) {
  const currentYear = new Date().getFullYear();
  
  const counter = await LoadingCounter.findOneAndUpdate(
    { companyId },
    { 
      $inc: { sequence: 1 },
      $setOnInsert: { prefix: 'LD', year: currentYear }
    },
    { 
      new: true, 
      upsert: true,
      setDefaultsOnInsert: true
    }
  );

  if (counter.year !== currentYear) {
    counter.sequence = 1;
    counter.year = currentYear;
    await counter.save();
  }

  const sequenceStr = String(counter.sequence).padStart(4, '0');
  return `${counter.prefix}-${currentYear}-${sequenceStr}`;
}

const LoadingCounter = mongoose.models.LoadingCounter || 
  mongoose.model('LoadingCounter', loadingCounterSchema);

export default LoadingCounter;