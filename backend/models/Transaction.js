const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
  {
    recoveryMan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecoveryMan',
      required: true,
      index: true,
    },
    // income = money WE RECEIVED from the recovery man (reduces what they owe us)
    // expense = money WE GAVE to the recovery man (increases what they owe us)
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

TransactionSchema.index({ recoveryMan: 1, date: -1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
