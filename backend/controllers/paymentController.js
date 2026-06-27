const Payment = require('../models/Payment');

const createPayment = async (req, res) => {
  try {
    const { client, project, amount, paymentDate, status, installmentType, receiptUrl, paymentMode, reference } = req.body;
    const payment = new Payment({
      client, project, amount, paymentDate, status, installmentType, receiptUrl, paymentMode, reference
    });
    const createdPayment = await payment.save();
    res.status(201).json(createdPayment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getPaymentsByClient = async (req, res) => {
  try {
    const clientId = req.user.role === 'admin' ? req.params.clientId : req.user._id;
    const payments = await Payment.find({ client: clientId }).populate('project', 'name').sort({ paymentDate: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate('client', 'name email').populate('project', 'name').sort({ paymentDate: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createPayment, getPaymentsByClient, getAllPayments };
