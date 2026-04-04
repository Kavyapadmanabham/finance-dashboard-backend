const Record = require("../models/Record");

const activeMatch = { isDeleted: false };

async function getSummary() {
  let totalIncome = 0;
  let totalExpense = 0;
  const rows = await Record.aggregate([
    { $match: activeMatch },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
      },
    },
  ]);
  for (const row of rows) {
    if (row._id === "income") totalIncome = row.total;
    if (row._id === "expense") totalExpense = row.total;
  }

  return {
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense,
  };
}

async function getCategoryTotals() {
  return Record.aggregate([
    { $match: activeMatch },
    {
      $group: {
        _id: { category: "$category", type: "$type" },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.category": 1 } },
    {
      $project: {
        _id: 0,
        category: "$_id.category",
        type: "$_id.type",
        total: 1,
      },
    },
  ]);
}

async function getRecentRecords(limit = 5) {
  return Record.find(activeMatch)
    .sort({ date: -1, createdAt: -1 })
    .limit(limit)
    .populate("createdBy", "name email")
    .lean();
}

async function getMonthlyGrouped() {
  return Record.aggregate([
    { $match: activeMatch },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
          type: "$type",
        },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
    {
      $group: {
        _id: { year: "$_id.year", month: "$_id.month" },
        types: {
          $push: { type: "$_id.type", total: "$total" },
        },
      },
    },
    {
      $project: {
        _id: 0,
        year: "$_id.year",
        month: "$_id.month",
        label: {
          $concat: [
            { $toString: "$_id.year" },
            "-",
            {
              $cond: [
                { $lt: ["$_id.month", 10] },
                { $concat: ["0", { $toString: "$_id.month" }] },
                { $toString: "$_id.month" },
              ],
            },
          ],
        },
        types: 1,
      },
    },
    { $sort: { year: 1, month: 1 } },
  ]);
}

async function getWeeklyGrouped() {
  return Record.aggregate([
    { $match: activeMatch },
    {
      $group: {
        _id: {
          isoWeekYear: { $isoWeekYear: "$date" },
          isoWeek: { $isoWeek: "$date" },
          type: "$type",
        },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.isoWeekYear": 1, "_id.isoWeek": 1 } },
    {
      $group: {
        _id: { isoWeekYear: "$_id.isoWeekYear", isoWeek: "$_id.isoWeek" },
        types: {
          $push: { type: "$_id.type", total: "$total" },
        },
      },
    },
    {
      $project: {
        _id: 0,
        isoWeekYear: "$_id.isoWeekYear",
        isoWeek: "$_id.isoWeek",
        label: {
          $concat: [
            { $toString: "$_id.isoWeekYear" },
            "-W",
            {
              $cond: [
                { $lt: ["$_id.isoWeek", 10] },
                { $concat: ["0", { $toString: "$_id.isoWeek" }] },
                { $toString: "$_id.isoWeek" },
              ],
            },
          ],
        },
        types: 1,
      },
    },
    { $sort: { isoWeekYear: 1, isoWeek: 1 } },
  ]);
}

module.exports = {
  getSummary,
  getCategoryTotals,
  getRecentRecords,
  getMonthlyGrouped,
  getWeeklyGrouped,
};
