import mongoose from 'mongoose';

const podCounterSchema = new mongoose.Schema({
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
    default: 'POD'
  },
  year: {
    type: Number,
    default: () => new Date().getFullYear()
  }
}, {
  timestamps: true
});

const PODCounter = mongoose.models.PODCounter || 
  mongoose.model('PODCounter', podCounterSchema);

export async function getNextPODNumber(companyId) {
  const counterId = `pod_${companyId}`;
  const currentYear = new Date().getFullYear();
  
  try {
    let counter = await PODCounter.findOne({ _id: counterId });
    
    if (!counter) {
      counter = new PODCounter({
        _id: counterId,
        sequence_value: 1,
        prefix: 'POD',
        year: currentYear
      });
      await counter.save();
    } else {
      // Reset sequence if year changed
      if (counter.year !== currentYear) {
        counter.sequence_value = 1;
        counter.year = currentYear;
      } else {
        counter.sequence_value += 1;
      }
      await counter.save();
    }
    
    const sequenceNumber = String(counter.sequence_value).padStart(5, '0');
    return `${counter.prefix}-${currentYear}-${sequenceNumber}`;
  } catch (error) {
    console.error('Error generating POD number:', error);
    const timestamp = Date.now().toString().slice(-6);
    return `POD-${timestamp}`;
  }
}

export default PODCounter;