const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function auth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = String(authHeader).split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
      message: "Missing or invalid Authorization header",
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select("_id name email role status");
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "User not found",
      });
    }
    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "Inactive users cannot access this resource",
      });
    }

    req.user = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    };
    return next();
  } catch (_err) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
      message: "Invalid or expired token",
    });
  }
}

module.exports = auth;
