const recordService = require("../services/recordService");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const createRecord = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (body.createdBy === undefined && req.user && req.user.id) {
    body.createdBy = req.user.id;
  }
  const record = await recordService.createRecord(body);
  res.status(201).json({ success: true, data: record });
});

const listRecords = asyncHandler(async (req, res) => {
  const result = await recordService.listRecords(req.query);
  res.json({ success: true, ...result });
});

const getRecord = asyncHandler(async (req, res) => {
  const record = await recordService.getRecordById(req.params.id);
  res.json({ success: true, data: record });
});

const updateRecord = asyncHandler(async (req, res) => {
  const allowed = ["amount", "type", "category", "date", "notes"];
  const payload = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) payload[key] = req.body[key];
  }
  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, "At least one of amount, type, category, date, notes is required");
  }
  const record = await recordService.updateRecord(req.params.id, payload);
  res.json({ success: true, data: record });
});

const removeRecord = asyncHandler(async (req, res) => {
  const record = await recordService.softDeleteRecord(req.params.id);
  res.json({
    success: true,
    message: "Record soft-deleted",
    data: { id: record._id, isDeleted: record.isDeleted },
  });
});

module.exports = {
  createRecord,
  listRecords,
  getRecord,
  updateRecord,
  removeRecord,
};
