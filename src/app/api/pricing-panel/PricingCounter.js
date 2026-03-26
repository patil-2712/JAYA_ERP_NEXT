// /utils/PricingCounter.js
import mongoose from 'mongoose';

const pricingCounterSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  sequence_value: {
    type: Number,
    default: 0
  }
});

const PricingCounter = mongoose.models.PricingCounter || 
  mongoose.model('PricingCounter', pricingCounterSchema);

// Function to get next pricing serial number
export async function getNextPricingSerialNumber(companyId) {
  const counterId = `pricing_panel_${companyId}`;
  
  try {
    const counter = await PricingCounter.findOneAndUpdate(
      { _id: counterId },
      { $inc: { sequence_value: 1 } },
      { 
        new: true, 
        upsert: true,
        returnDocument: 'after'
      }
    );
    
    // Format: PSN-0001, PSN-0002, etc.
    const sequenceNumber = String(counter.sequence_value).padStart(4, '0');
    return `PSN-${sequenceNumber}`;
  } catch (error) {
    console.error('Error generating pricing serial number:', error);
    // Fallback: timestamp-based number
    const timestamp = Date.now().toString().slice(-6);
    return `PSN-FB-${timestamp}`;
  }
}

export default PricingCounter;