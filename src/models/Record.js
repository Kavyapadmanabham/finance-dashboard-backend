const mongoose = require("mongoose");

const TYPES = ["income", "expense"];

const recordSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, enum: TYPES, required: true },
    category: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    notes: { type: String, trim: true, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

recordSchema.index({ isDeleted: 1, date: -1 });

const Record = mongoose.model("Record", recordSchema);
Record.TYPES = TYPES;
module.exports = Record;
