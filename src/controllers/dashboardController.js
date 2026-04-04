const dashboardService = require("../services/dashboardService");
const asyncHandler = require("../utils/asyncHandler");

const summary = asyncHandler(async (req, res) => {
  const data = await dashboardService.getSummary();
  res.json({ success: true, data });
});

const category = asyncHandler(async (req, res) => {
  const data = await dashboardService.getCategoryTotals();
  res.json({ success: true, data });
});

const recent = asyncHandler(async (req, res) => {
  const data = await dashboardService.getRecentRecords(5);
  res.json({ success: true, data });
});

const monthly = asyncHandler(async (req, res) => {
  const data = await dashboardService.getMonthlyGrouped();
  res.json({ success: true, data });
});

const weekly = asyncHandler(async (req, res) => {
  const data = await dashboardService.getWeeklyGrouped();
  res.json({ success: true, data });
});

module.exports = {
  summary,
  category,
  recent,
  monthly,
  weekly,
};
