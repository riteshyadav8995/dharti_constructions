const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'overdue'],
    default: 'completed',
  },
  paymentMode: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'Cheque', 'UPI'],
    required: true,
  },
  reference: {
    type: String,
  },
  receiptUrl: {
    type: String,
  }
}, {
  timestamps: true,
});

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
