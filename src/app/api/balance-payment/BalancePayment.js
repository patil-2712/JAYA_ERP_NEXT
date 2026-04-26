//import mongoose from 'mongoose';
//
//// Order Row Schema
//const orderRowSchema = new mongoose.Schema({
//  _id: { type: String, required: true },
//  orderNo: { type: String, default: '' },
//  partyName: { type: String, default: '' },
//  plantCode: { type: String, default: '' },
//  orderType: { type: String, default: '' },
//  pinCode: { type: String, default: '' },
//  state: { type: String, default: '' },
//  district: { type: String, default: '' },
//  from: { type: String, default: '' },
//  to: { type: String, default: '' },
//  locationRate: { type: String, default: '' },
//  priceList: { type: String, default: '' },
//  weight: { type: String, default: '0' },
//  rate: { type: String, default: '0' },
//  totalAmount: { type: String, default: '0' }
//}, { _id: false });
//
//// Main Balance Payment Schema
//const balancePaymentSchema = new mongoose.Schema({
//  // Auto-generated number
//  balancePaymentNo: {
//    type: String,
//    unique: true,
//    required: true,
//    index: true
//  },
//  
//  // Basic Info
//  branch: { type: String, default: '' },
//  date: { type: String, default: '' },
//  vendorName: { type: String, default: '' },
//  podNo: { type: String, default: '' },
//  purchaseNo: { type: String, default: '' },
//  
//  // Order Rows
//  orderRows: [orderRowSchema],
//  
//  // Balance Payment Panel Fields
//  vendorStatus: { type: String, default: 'Active' },
//  vendorCode: { type: String, default: '' },
//  vendorNamePayment: { type: String, default: '' },
//  vehicleNo: { type: String, default: '' },
//  purchaseType: { type: String, default: 'Safi Vehicle' },
//  rateType: { type: String, default: 'Per MT' },
//  rate: { type: Number, default: 0 },
//  weight: { type: Number, default: 0 },
//  amount: { type: Number, default: 0 },
//  advance: { type: Number, default: 0 },
//  totalAddition: { type: Number, default: 0 },
//  totalDeduction: { type: Number, default: 0 },
//  balance: { type: Number, default: 0 },
//  
//  // NEW FIELDS for PO Addition, PO Deduction, POD Deductions
//  poAddition: { type: Number, default: 0 },
//  poDeduction: { type: Number, default: 0 },
//  podDeduction: { type: Number, default: 0 },
//  finalBalance: { type: Number, default: 0 },
//  dueDate: { type: String, default: '' },
//  
//  // Payment Transaction Details
//  vendorNameDebit: { type: String, default: '' },
//  accountNoCredit: { type: String, default: '' },
//  finalAmount: { type: Number, default: 0 },
//  remarks: { type: String, default: 'Balance Payment' },
//  transactionId: { type: String, default: '' },
//  bankVendorCode: { type: String, default: '' },
//  
//  // Payment Status
//  paymentStatus: { type: String, enum: ['Pending', 'Queued', 'Completed', 'Paid'], default: 'Pending' },
//  paymentDate: { type: Date, default: Date.now },
//  
//  // Company & User Tracking
//  companyId: {
//    type: mongoose.Schema.Types.ObjectId,
//    ref: 'Company',
//    required: true,
//    index: true
//  },
//  createdBy: {
//    type: mongoose.Schema.Types.ObjectId,
//    ref: 'CompanyUser'
//  }
//
//}, { timestamps: true });
//
//// Pre-save middleware
//balancePaymentSchema.pre('save', function(next) {
//  // Calculate balance: Amount - Advance + Addition - Deduction
//  this.balance = (this.amount || 0) - (this.advance || 0) + (this.totalAddition || 0) - (this.totalDeduction || 0);
//  // Calculate final balance
//  this.finalBalance = (this.amount || 0) - (this.advance || 0) - (this.poDeduction || 0) - (this.podDeduction || 0) + (this.poAddition || 0);
//  next();
//});
//
//const BalancePayment = mongoose.models.BalancePayment || 
//  mongoose.model('BalancePayment', balancePaymentSchema);
//
//export default BalancePayment;
import mongoose from 'mongoose';

// Order Row Schema
const orderRowSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  orderNo: { type: String, default: '' },
  partyName: { type: String, default: '' },
  plantCode: { type: String, default: '' },
  orderType: { type: String, default: '' },
  pinCode: { type: String, default: '' },
  state: { type: String, default: '' },
  district: { type: String, default: '' },
  from: { type: String, default: '' },
  to: { type: String, default: '' },
  locationRate: { type: String, default: '' },
  priceList: { type: String, default: '' },
  weight: { type: String, default: '0' },
  rate: { type: String, default: '0' },
  totalAmount: { type: String, default: '0' }
}, { _id: false });

// Main Balance Payment Schema
const balancePaymentSchema = new mongoose.Schema({
  // Auto-generated number
  balancePaymentNo: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  
  // Basic Info
  branch: { type: String, default: '' },
  date: { type: String, default: '' },
  vendorName: { type: String, default: '' },
  podNo: { type: String, default: '' },
  purchaseNo: { type: String, default: '' },
  
  // Order Rows
  orderRows: [orderRowSchema],
  
  // Balance Payment Panel Fields
  vendorStatus: { type: String, default: 'Active' },
  vendorCode: { type: String, default: '' },
  vendorNamePayment: { type: String, default: '' },
  vehicleNo: { type: String, default: '' },
  purchaseType: { type: String, default: 'Safi Vehicle' },
  rateType: { type: String, default: 'Per MT' },
  rate: { type: Number, default: 0 },
  weight: { type: Number, default: 0 },
  amount: { type: Number, default: 0 },
  advance: { type: Number, default: 0 },
  totalAddition: { type: Number, default: 0 },
  totalDeduction: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  
  // NEW FIELDS for PO Addition, PO Deduction, POD Deductions
  poAddition: { type: Number, default: 0 },
  poDeduction: { type: Number, default: 0 },
  podDeduction: { type: Number, default: 0 },
  finalBalance: { type: Number, default: 0 },
  dueDate: { type: String, default: '' },
  
  // Payment Transaction Details
  vendorNameDebit: { type: String, default: '' },
  accountNoCredit: { type: String, default: '' },
  finalAmount: { type: Number, default: 0 },
  remarks: { type: String, default: 'Balance Payment' },
  transactionId: { type: String, default: '' },
  bankVendorCode: { type: String, default: '' },
  
  // Payment Status - UPDATED enum to include Approved and Rejected
  paymentStatus: { 
  type: String, 
  enum: ['Pending', 'Queued', 'Approved', 'Rejected', 'Completed', 'Paid'], 
  default: 'Pending' 
},
  paymentDate: { type: Date, default: Date.now },
  
  // Delivery and Pricing
  delivery: { type: String, default: 'Normal' },
  pricingSerialNo: { type: String, default: '' },
  from: { type: String, default: '' },
  to: { type: String, default: '' },
  
  // Company & User Tracking
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CompanyUser'
  }

}, { timestamps: true });

// Pre-save middleware
balancePaymentSchema.pre('save', function(next) {
  // Calculate balance: Amount - Advance + Addition - Deduction
  this.balance = (this.amount || 0) - (this.advance || 0) + (this.totalAddition || 0) - (this.totalDeduction || 0);
  // Calculate final balance
  this.finalBalance = (this.amount || 0) - (this.advance || 0) - (this.poDeduction || 0) - (this.podDeduction || 0) + (this.poAddition || 0);
  next();
});

const BalancePayment = mongoose.models.BalancePayment || 
  mongoose.model('BalancePayment', balancePaymentSchema);

export default BalancePayment;