const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const RecoveryMan = require('../models/RecoveryMan');
const { asyncHandler } = require('../middleware/errorHandler');

// @route   GET /api/transactions/:recoveryManId
// @desc    Get the full ledger (entries + running balance) for one recovery man
router.get(
  '/:recoveryManId',
  asyncHandler(async (req, res) => {
    const rm = await RecoveryMan.findById(req.params.recoveryManId).lean();
    if (!rm) {
      res.status(404);
      throw new Error('Recovery man not found');
    }

    // Oldest first so we can compute a running balance, newest first for the timeline.
    const entriesAsc = await Transaction.find({ recoveryMan: rm._id })
      .sort({ date: 1, createdAt: 1 })
      .lean();

    let running =
      rm.openingBalanceType === 'collect' ? rm.openingBalance : -rm.openingBalance;

    const withBalance = entriesAsc.map((t) => {
      // income (money received) increases the balance; expense (money given) decreases it
      running += t.type === 'income' ? t.amount : -t.amount;
      return { ...t, balanceAfter: Math.round(running * 100) / 100 };
    });

    const totalIncome = entriesAsc
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);
    const totalExpense = entriesAsc
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);

    res.json({
      success: true,
      recoveryMan: rm,
      currentBalance: Math.round(running * 100) / 100,
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpense: Math.round(totalExpense * 100) / 100,
      data: withBalance.reverse(), // newest first for display
    });
  })
);

// @route   POST /api/transactions
// @desc    Add an income or expense entry for a recovery man
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { recoveryMan, type, amount, description, date } = req.body;

    if (!recoveryMan || !type || !amount) {
      res.status(400);
      throw new Error('recoveryMan, type and amount are required');
    }
    if (!['income', 'expense'].includes(type)) {
      res.status(400);
      throw new Error("type must be 'income' or 'expense'");
    }
    if (Number(amount) <= 0) {
      res.status(400);
      throw new Error('Amount must be greater than 0');
    }

    const rm = await RecoveryMan.findById(recoveryMan);
    if (!rm) {
      res.status(404);
      throw new Error('Recovery man not found');
    }

    const txn = await Transaction.create({
      recoveryMan,
      type,
      amount,
      description,
      date: date || Date.now(),
    });

    res.status(201).json({ success: true, data: txn });
  })
);

// @route   PUT /api/transactions/:id
// @desc    Edit a transaction entry
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const txn = await Transaction.findById(req.params.id);
    if (!txn) {
      res.status(404);
      throw new Error('Entry not found');
    }
    const { type, amount, description, date } = req.body;
    if (type && !['income', 'expense'].includes(type)) {
      res.status(400);
      throw new Error("type must be 'income' or 'expense'");
    }
    if (amount !== undefined && Number(amount) <= 0) {
      res.status(400);
      throw new Error('Amount must be greater than 0');
    }
    if (type) txn.type = type;
    if (amount !== undefined) txn.amount = amount;
    if (description !== undefined) txn.description = description;
    if (date) txn.date = date;

    await txn.save();
    res.json({ success: true, data: txn });
  })
);

// @route   DELETE /api/transactions/:id
// @desc    Delete a transaction entry
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const txn = await Transaction.findById(req.params.id);
    if (!txn) {
      res.status(404);
      throw new Error('Entry not found');
    }
    await txn.deleteOne();
    res.json({ success: true, data: {} });
  })
);

module.exports = router;
