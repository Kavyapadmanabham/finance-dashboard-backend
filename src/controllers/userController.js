const userService = require("../services/userService");
const asyncHandler = require("../utils/asyncHandler");

const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(201).json({ success: true, data: user });
});

const listUsers = asyncHandler(async (req, res) => {
  const users = await userService.listUsers();
  res.json({ success: true, data: users });
});

const updateUser = asyncHandler(async (req, res) => {
  const { role, status } = req.body;
  const payload = {};
  if (role !== undefined) payload.role = role;
  if (status !== undefined) payload.status = status;
  const user = await userService.updateUser(req.params.id, payload);
  res.json({ success: true, data: user });
});

module.exports = {
  createUser,
  listUsers,
  updateUser,
};
