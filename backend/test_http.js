require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const testHttp = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const client = await User.findOne({ role: 'client' });
    
    // We can generate a token directly instead of logging in
    const jwt = require('jsonwebtoken');
    const admin = await User.findOne({ role: 'admin' });
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    
    console.log('Got token for admin', admin.email);
    
    const updateRes = await fetch(`http://localhost:5000/api/auth/clients/${client._id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({
        purchasedUnit: '1',
        totalAmount: '60',
        paymentPlan: '2'
      })
    });
    
    const updateData = await updateRes.json();
    console.log('Update Status:', updateRes.status);
    console.log('Success!', updateData);
  } catch (error) {
    console.error('HTTP Error:', error);
  } finally {
    process.exit(0);
  }
};

testHttp();
