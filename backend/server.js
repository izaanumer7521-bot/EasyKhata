const path = require('path');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const recoveryMenRoutes = require('./routes/recoveryMen');
const transactionRoutes = require('./routes/transactions');
const dashboardRoutes = require('./routes/dashboard');

connectDB().catch((err) => {
  // Don't crash the process on a connection error — let individual
  // requests fail with a 500 instead, which is safer on serverless hosts.
  console.error('Initial MongoDB connection failed:', err.message);
});

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.get('/api/health', (req, res) => res.json({ success: true, message: 'API is running' }));

app.use('/api/recoverymen', recoveryMenRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Serve the React build in production — only when running as a single
// traditional server (e.g. Render). On Vercel, the frontend is deployed
// as its own service and this backend never receives non-/api requests.
if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
  const buildPath = path.join(__dirname, '..', 'frontend', 'build');
  app.use(express.static(buildPath));
  app.get('*', (req, res) => res.sendFile(path.join(buildPath, 'index.html')));
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
