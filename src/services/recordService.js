const mongoose = require("mongoose");
const Record = require("../models/Record");
const ApiError = require("../utils/ApiError");
const { parsePagination } = require("../utils/pagination");

function buildListFilter(query) {
  const filter = { isDeleted: false };

  if (query.type) {
    filter.type = query.type;
  }
  if (query.category) {
    filter.category = new RegExp(`^${escapeRegex(query.category)}$`, "i");
  }
  if (query.dateFrom || query.dateTo) {
    filter.date = {};
    if (query.dateFrom) {
      filter.date.$gte = new Date(query.dateFrom);
    }
    if (query.dateTo) {
      const end = new Date(query.dateTo);
      end.setHours(23, 59, 59, 999);
      filter.date.$lte = end;
    }
  }
  if (query.search && String(query.search).trim()) {
    const term = String(query.search).trim();
    filter.$or = [
      { category: new RegExp(escapeRegex(term), "i") },
      { notes: new RegExp(escapeRegex(term), "i") },
    ];
  }

  return filter;
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function createRecord(data) {
  const payload = {
    amount: data.amount,
    type: data.type,
    category: data.category,
    date: data.date,
    notes: data.notes !== undefined && data.notes !== null ? data.notes : "",
  };
  const creator = data.createdBy;
  if (creator && mongoose.isValidObjectId(String(creator))) {
    payload.createdBy = creator;
  }
  return Record.create(payload);
}

async function listRecords(query) {
  const { page, limit, skip } = parsePagination(query);
  const filter = buildListFilter(query);

  const [items, total] = await Promise.all([
    Record.find(filter)
      .populate("createdBy", "name email")
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Record.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

async function getRecordById(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid record id");
  }
  const record = await Record.findOne({ _id: id, isDeleted: false })
    .populate("createdBy", "name email")
    .lean();
  if (!record) throw new ApiError(404, "Record not found");
  return record;
}

async function updateRecord(id, data) {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid record id");
  }
  const record = await Record.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: data },
    { new: true, runValidators: true }
  ).populate("createdBy", "name email");
  if (!record) throw new ApiError(404, "Record not found");
  return record;
}

async function softDeleteRecord(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid record id");
  }
  const record = await Record.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: { isDeleted: true } },
    { new: true }
  );
  if (!record) throw new ApiError(404, "Record not found");
  return record;
}

module.exports = {
  createRecord,
  listRecords,
  getRecordById,
  updateRecord,
  softDeleteRecord,
  buildListFilter,
};
