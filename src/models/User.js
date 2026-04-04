const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const ROLES = ["viewer", "analyst", "admin"];
const STATUSES = ["active", "inactive"];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ROLES,
      default: "viewer",
    },
    status: {
      type: String,
      enum: STATUSES,
      default: "active",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function comparePassword(plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

const User = mongoose.model("User", userSchema);
User.ROLES = ROLES;
User.STATUSES = STATUSES;
module.exports = User;
