const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  type: {
    type: String,
    enum: ['revenue', 'cost', 'expense', 'payment'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'completed',
  }
}, {
  timestamps: true,
});

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
