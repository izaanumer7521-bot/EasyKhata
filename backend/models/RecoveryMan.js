const mongoose = require('mongoose');

const RecoveryManSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    area: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    // Starting balance when the recovery man is added.
    // "collect" = recovery man owes the business this amount (business will get)
    // "pay" = business owes the recovery man this amount (business will give)
    openingBalance: {
      type: Number,
      default: 0,
    },
    openingBalanceType: {
      type: String,
      enum: ['collect', 'pay'],
      default: 'collect',
    },
    archived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

RecoveryManSchema.index({ name: 'text', phone: 'text', area: 'text' });

module.exports = mongoose.model('RecoveryMan', RecoveryManSchema);
