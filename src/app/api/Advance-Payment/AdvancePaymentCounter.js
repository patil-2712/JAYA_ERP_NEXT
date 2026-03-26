import mongoose from 'mongoose';

const advancePaymentCounterSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  sequence_value: {
    type: Number,
    default: 0
  },
  prefix: {
    type: String,
    default: 'ADV'
  },
  year: {
    type: Number,
    default: () => new Date().getFullYear()
  }
}, {
  timestamps: true
});

const AdvancePaymentCounter = mongoose.models.AdvancePaymentCounter || 
  mongoose.model('AdvancePaymentCounter', advancePaymentCounterSchema);

export async function getNextAdvancePaymentNumber(companyId) {
  const counterId = `advance_payment_${companyId}`;
  const currentYear = new Date().getFullYear();
  
  try {
    const counter = await AdvancePaymentCounter.findOneAndUpdate(
      { _id: counterId },
      { 
        $inc: { sequence_value: 1 },
        $setOnInsert: { prefix: 'ADV', year: currentYear }
      },
      { 
        new: true, 
        upsert: true,
        setDefaultsOnInsert: true
      }
    );
    
    // Reset sequence if year changed
    if (counter.year !== currentYear) {
      counter.sequence_value = 1;
      counter.year = currentYear;
      await counter.save();
    }
    
    const sequenceNumber = String(counter.sequence_value).padStart(5, '0');
    return `${counter.prefix}-${currentYear}-${sequenceNumber}`;
  } catch (error) {
    console.error('Error generating advance payment number:', error);
    const timestamp = Date.now().toString().slice(-6);
    return `ADV-${timestamp}`;
  }
}

export default AdvancePaymentCounter;