const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const RecoveryMan = require('../models/RecoveryMan');
const Transaction = require('../models/Transaction');
const { asyncHandler } = require('../middleware/errorHandler');

// Compute the net balance for one recovery man.
// Positive netBalance  -> net Income (money in exceeds money out) -> shown as "Income"
// Negative netBalance  -> net Expense (money out exceeds money in) -> shown as "Expense"
const computeBalance = (recoveryMan, totals) => {
  const income = totals?.income || 0; // money you received from the recovery man
  const expense = totals?.expense || 0; // money you gave to the recovery man
  const opening =
    recoveryMan.openingBalanceType === 'collect'
      ? recoveryMan.openingBalance
      : -recoveryMan.openingBalance;

  const netBalance = opening + income - expense;
  return {
    netBalance: Math.round(netBalance * 100) / 100,
    status: netBalance > 0 ? 'youWillGet' : netBalance < 0 ? 'youWillGive' : 'settled',
    totalIncome: income,
    totalExpense: expense,
  };
};

const getTotalsMap = async (recoveryManIds) => {
  const rows = await Transaction.aggregate([
    { $match: { recoveryMan: { $in: recoveryManIds } } },
    {
      $group: {
        _id: { recoveryMan: '$recoveryMan', type: '$type' },
        total: { $sum: '$amount' },
      },
    },
  ]);

  const map = {};
  rows.forEach((row) => {
    const id = row._id.recoveryMan.toString();
    if (!map[id]) map[id] = { income: 0, expense: 0 };
    map[id][row._id.type] = row.total;
  });
  return map;
};

// @route   GET /api/recoverymen
// @desc    List all recovery men with computed balances + overall summary
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { search = '', includeArchived = 'false' } = req.query;

    const filter = {};
    if (includeArchived !== 'true') filter.archived = false;
    if (search.trim()) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { area: { $regex: search, $options: 'i' } },
      ];
    }

    const recoveryMen = await RecoveryMan.find(filter).sort({ createdAt: -1 }).lean();
    const ids = recoveryMen.map((r) => r._id);
    const totalsMap = await getTotalsMap(ids);

    let youWillGive = 0;
    let youWillGet = 0;

    const enriched = recoveryMen.map((rm) => {
      const balance = computeBalance(rm, totalsMap[rm._id.toString()]);
      if (balance.netBalance > 0) youWillGet += balance.netBalance;
      if (balance.netBalance < 0) youWillGive += Math.abs(balance.netBalance);
      return { ...rm, balance };
    });

    res.json({
      success: true,
      count: enriched.length,
      summary: {
        youWillGive: Math.round(youWillGive * 100) / 100,
        youWillGet: Math.round(youWillGet * 100) / 100,
      },
      data: enriched,
    });
  })
);

// @route   GET /api/recoverymen/:id
// @desc    Get a single recovery man with balance
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const rm = await RecoveryMan.findById(req.params.id).lean();
    if (!rm) {
      res.status(404);
      throw new Error('Recovery man not found');
    }
    const totalsMap = await getTotalsMap([rm._id]);
    const balance = computeBalance(rm, totalsMap[rm._id.toString()]);
    res.json({ success: true, data: { ...rm, balance } });
  })
);

// @route   POST /api/recoverymen
// @desc    Create a recovery man
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, phone, area, notes, openingBalance, openingBalanceType } = req.body;
    if (!name || !name.trim()) {
      res.status(400);
      throw new Error('Name is required');
    }
    const rm = await RecoveryMan.create({
      name: name.trim(),
      phone,
      area,
      notes,
      openingBalance: openingBalance || 0,
      openingBalanceType: openingBalanceType || 'collect',
    });
    res.status(201).json({ success: true, data: rm });
  })
);

// @route   PUT /api/recoverymen/:id
// @desc    Update a recovery man
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const rm = await RecoveryMan.findById(req.params.id);
    if (!rm) {
      res.status(404);
      throw new Error('Recovery man not found');
    }
    const fields = ['name', 'phone', 'area', 'notes', 'openingBalance', 'openingBalanceType', 'archived'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) rm[f] = req.body[f];
    });
    await rm.save();
    res.json({ success: true, data: rm });
  })
);

// @route   DELETE /api/recoverymen/:id
// @desc    Delete a recovery man and all of their transactions
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const rm = await RecoveryMan.findById(req.params.id);
    if (!rm) {
      res.status(404);
      throw new Error('Recovery man not found');
    }
    await Transaction.deleteMany({ recoveryMan: rm._id });
    await rm.deleteOne();
    res.json({ success: true, data: {} });
  })
);

module.exports = router;
module.exports.computeBalance = computeBalance;
module.exports.getTotalsMap = getTotalsMap;
