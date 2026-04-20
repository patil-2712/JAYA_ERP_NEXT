//import mongoose from 'mongoose';
//
//const consignmentCounterSchema = new mongoose.Schema({
//  _id: {
//    type: String,
//    required: true
//  },
//  sequence_value: {
//    type: Number,
//    default: 0
//  },
//  prefix: {
//    type: String,
//    default: 'LR'
//  },
//  year: {
//    type: Number,
//    default: () => new Date().getFullYear()
//  }
//}, {
//  timestamps: true
//});
//
//const ConsignmentCounter = mongoose.models.ConsignmentCounter || 
//  mongoose.model('ConsignmentCounter', consignmentCounterSchema);
//
//export async function getNextLRNumber(companyId) {
//  const counterId = `consignment_${companyId}`;
//  const currentYear = new Date().getFullYear();
//  
//  try {
//    const counter = await ConsignmentCounter.findOneAndUpdate(
//      { _id: counterId },
//      { 
//        $inc: { sequence_value: 1 },
//        $setOnInsert: { prefix: 'LR', year: currentYear }
//      },
//      { 
//        new: true, 
//        upsert: true,
//        setDefaultsOnInsert: true
//      }
//    );
//    
//    // Reset sequence if year changed
//    if (counter.year !== currentYear) {
//      counter.sequence_value = 1;
//      counter.year = currentYear;
//      await counter.save();
//    }
//    
//    const sequenceNumber = String(counter.sequence_value).padStart(5, '0');
//    return `${counter.prefix}-${currentYear}-${sequenceNumber}`;
//  } catch (error) {
//    console.error('Error generating LR number:', error);
//    const timestamp = Date.now().toString().slice(-6);
//    return `LR-${timestamp}`;
//  }
//}
//
//export default ConsignmentCounter;
// /models/ConsignmentCounter.js
import mongoose from 'mongoose';

const consignmentCounterSchema = new mongoose.Schema({
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
    default: 'LR'
  },
  year: {
    type: Number,
    default: () => new Date().getFullYear()
  }
}, {
  timestamps: true
});

const ConsignmentCounter = mongoose.models.ConsignmentCounter || 
  mongoose.model('ConsignmentCounter', consignmentCounterSchema);

export async function getNextLRNumber(companyId) {
  const counterId = `consignment_${companyId}`;
  const currentYear = new Date().getFullYear();
  
  try {
    let counter = await ConsignmentCounter.findOne({ _id: counterId });
    
    if (!counter) {
      counter = new ConsignmentCounter({
        _id: counterId,
        sequence_value: 1,
        prefix: 'LR',
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
    console.error('Error generating LR number:', error);
    const timestamp = Date.now().toString().slice(-6);
    return `LR-${timestamp}`;
  }
}

export default ConsignmentCounter;