const express = require('express');
const router = express.Router();
const RecoveryMan = require('../models/RecoveryMan');
const Transaction = require('../models/Transaction');
const { asyncHandler } = require('../middleware/errorHandler');
const { computeBalance, getTotalsMap } = require('./recoveryMen');

// @route   GET /api/dashboard/summary
// @desc    Overall totals: recovery men count, total income, total expense, net balances
router.get(
  '/summary',
  asyncHandler(async (req, res) => {
    const recoveryMen = await RecoveryMan.find({ archived: false }).lean();
    const ids = recoveryMen.map((r) => r._id);
    const totalsMap = await getTotalsMap(ids);

    let youWillGive = 0;
    let youWillGet = 0;
    let totalIncome = 0;
    let totalExpense = 0;

    recoveryMen.forEach((rm) => {
      const t = totalsMap[rm._id.toString()];
      totalIncome += t?.income || 0;
      totalExpense += t?.expense || 0;
      const balance = computeBalance(rm, t);
      if (balance.netBalance > 0) youWillGet += balance.netBalance;
      if (balance.netBalance < 0) youWillGive += Math.abs(balance.netBalance);
    });

    const recentTransactions = await Transaction.find({})
      .sort({ date: -1, createdAt: -1 })
      .limit(8)
      .populate('recoveryMan', 'name')
      .lean();

    res.json({
      success: true,
      data: {
        totalRecoveryMen: recoveryMen.length,
        totalIncome: Math.round(totalIncome * 100) / 100,
        totalExpense: Math.round(totalExpense * 100) / 100,
        youWillGive: Math.round(youWillGive * 100) / 100,
        youWillGet: Math.round(youWillGet * 100) / 100,
        recentTransactions,
      },
    });
  })
);

module.exports = router;
