const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const progressRoutes = require('./routes/progressRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
