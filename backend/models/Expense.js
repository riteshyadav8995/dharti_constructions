const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  category: {
    type: String,
    enum: ['Labour', 'Materials', 'Machinery', 'Subcontractor', 'Miscellaneous'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  invoiceUrl: {
    type: String, // Path to the uploaded invoice file
  },
  description: {
    type: String,
  }
}, {
  timestamps: true,
});

const Expense = mongoose.model('Expense', expenseSchema);
module.exports = Expense;
