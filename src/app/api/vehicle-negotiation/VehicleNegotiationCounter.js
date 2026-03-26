import mongoose from 'mongoose';

const vehicleNegotiationCounterSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  sequence_value: {
    type: Number,
    default: 0
  }
});

const VehicleNegotiationCounter = mongoose.models.VehicleNegotiationCounter || 
  mongoose.model('VehicleNegotiationCounter', vehicleNegotiationCounterSchema);

// Function to get next vehicle negotiation number
export async function getNextVehicleNegotiationNumber(companyId) {
  const counterId = `vehicle_negotiation_${companyId}`;
  
  try {
    const counter = await VehicleNegotiationCounter.findOneAndUpdate(
      { _id: counterId },
      { $inc: { sequence_value: 1 } },
      { 
        new: true, 
        upsert: true,
        returnDocument: 'after'
      }
    );
    
    // Format: VNN-0001, VNN-0002, etc.
    const sequenceNumber = String(counter.sequence_value).padStart(4, '0');
    return `VNN-${sequenceNumber}`;
  } catch (error) {
    console.error('Error generating vehicle negotiation number:', error);
    // Fallback: timestamp-based number
    const timestamp = Date.now().toString().slice(-6);
    return `VNN-FB-${timestamp}`;
  }
}

export default VehicleNegotiationCounter;