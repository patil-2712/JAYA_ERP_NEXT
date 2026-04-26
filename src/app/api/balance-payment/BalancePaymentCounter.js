import mongoose from 'mongoose';

const balancePaymentCounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  sequence_value: { type: Number, default: 0 },
  prefix: { type: String, default: 'BLP' },
  year: { type: Number, default: () => new Date().getFullYear() }
}, { timestamps: true });

const BalancePaymentCounter = mongoose.models.BalancePaymentCounter || 
  mongoose.model('BalancePaymentCounter', balancePaymentCounterSchema);

export async function getNextBalancePaymentNumber(companyId) {
  const counterId = `blp_${companyId}`;
  const currentYear = new Date().getFullYear();
  
  let counter = await BalancePaymentCounter.findOne({ _id: counterId });
  
  if (!counter) {
    counter = new BalancePaymentCounter({
      _id: counterId,
      sequence_value: 1,
      prefix: 'BLP',
      year: currentYear
    });
  } else {
    if (counter.year !== currentYear) {
      counter.sequence_value = 1;
      counter.year = currentYear;
    } else {
      counter.sequence_value += 1;
    }
  }
  
  await counter.save();
  const sequenceNumber = String(counter.sequence_value).padStart(5, '0');
  return `${counter.prefix}-${currentYear}-${sequenceNumber}`;
}

export default BalancePaymentCounter;