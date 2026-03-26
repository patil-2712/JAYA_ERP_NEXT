import mongoose from 'mongoose';

const orderPanelCounterSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  sequence_value: {
    type: Number,
    default: 0
  }
});

const OrderPanelCounter = mongoose.models.OrderPanelCounter || mongoose.model('OrderPanelCounter', orderPanelCounterSchema);

// Function to get next order panel number
export async function getNextOrderPanelNumber(companyId) {
  const counterId = `order_panel_${companyId}`;
  
  try {
    const counter = await OrderPanelCounter.findOneAndUpdate(
      { _id: counterId },
      { $inc: { sequence_value: 1 } },
      { 
        new: true, 
        upsert: true,
        returnDocument: 'after'
      }
    );
    
    // Format: OP-0001, OP-0002, etc.
    const sequenceNumber = String(counter.sequence_value).padStart(4, '0');
    return `OP-${sequenceNumber}`;
  } catch (error) {
    console.error('Error generating order panel number:', error);
    // Fallback: timestamp-based order number
    const timestamp = Date.now().toString().slice(-6);
    return `OP-${timestamp}`;
  }
}

export default OrderPanelCounter;