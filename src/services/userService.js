const mongoose = require("mongoose");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");

async function createUser(data) {
  const user = await User.create(data);
  return User.findById(user._id).select("-password");
}

async function listUsers() {
  return User.find().select("-password").sort({ createdAt: -1 }).lean();
}

async function updateUser(id, data) {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid user id");
  }
  const user = await User.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true }
  ).select("-password");
  if (!user) throw new ApiError(404, "User not found");
  return user;
}

module.exports = {
  createUser,
  listUsers,
  updateUser,
};
