import mongoose from 'mongoose';

const purchaseCounterSchema = new mongoose.Schema({
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
    default: 'PUR'
  },
  year: {
    type: Number,
    default: () => new Date().getFullYear()
  }
}, {
  timestamps: true
});

const PurchaseCounter = mongoose.models.PurchaseCounter || 
  mongoose.model('PurchaseCounter', purchaseCounterSchema);

export async function getNextPurchaseNumber(companyId) {
  const counterId = `purchase_${companyId}`;
  const currentYear = new Date().getFullYear();
  
  try {
    const counter = await PurchaseCounter.findOneAndUpdate(
      { _id: counterId },
      { 
        $inc: { sequence_value: 1 },
        $setOnInsert: { prefix: 'PUR', year: currentYear }
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
    console.error('Error generating purchase number:', error);
    const timestamp = Date.now().toString().slice(-6);
    return `PUR-${timestamp}`;
  }
}

export default PurchaseCounter;