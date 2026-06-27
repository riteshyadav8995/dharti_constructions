require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const test = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Find a client
    const user = await User.findOne({ role: 'client' });
    if (!user) {
      console.log('No client found');
      return;
    }
    console.log('Client found:', user.name);
    
    // Try to update
    user.purchasedUnit = "1";
    user.totalAmount = 60;
    user.paymentPlan = "2";
    
    const updatedUser = await user.save();
    console.log('Update successful:', updatedUser);
  } catch (error) {
    console.error('Update failed:', error);
  } finally {
    process.exit(0);
  }
};

test();
