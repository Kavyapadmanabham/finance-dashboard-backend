const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new ApiError(500, "JWT_SECRET is not configured");
  const expiresIn = process.env.JWT_EXPIRES_IN || "1d";
  return jwt.sign({ sub: String(user._id), role: user.role }, secret, { expiresIn });
}

function sanitizeUser(userDoc) {
  return {
    id: String(userDoc._id),
    name: userDoc.name,
    email: userDoc.email,
    role: userDoc.role,
    status: userDoc.status,
    createdAt: userDoc.createdAt,
    updatedAt: userDoc.updatedAt,
  };
}

async function register(data) {
  const email = String(data.email).toLowerCase().trim();
  const taken = await User.findOne({ email });
  if (taken) {
    throw new ApiError(400, "Email already in use");
  }

  const user = await User.create({
    name: data.name,
    email,
    password: data.password,
    role: "viewer",
    status: "active",
  });

  const token = signToken(user);
  return { user: sanitizeUser(user), token };
}

async function login(data) {
  const email = String(data.email).toLowerCase().trim();
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError(404, "No account found for this email. Please register first.");
  }
  if (user.status !== "active") {
    throw new ApiError(403, "User is inactive");
  }

  const ok = await user.comparePassword(data.password);
  if (!ok) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = signToken(user);
  return { user: sanitizeUser(user), token };
}

module.exports = {
  register,
  login,
};
