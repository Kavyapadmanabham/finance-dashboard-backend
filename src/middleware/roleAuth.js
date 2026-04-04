const VALID_ROLES = ["viewer", "analyst", "admin"];

/**
 * Role MUST come from the authenticated JWT user (`req.user`), loaded in `middleware/auth.js`.
 * Never trust client-supplied role headers — that would allow privilege escalation.
 */
function roleAuth(req, res, next) {
  const role = req.user && req.user.role ? String(req.user.role).trim().toLowerCase() : null;

  if (!role) {
    return res.status(403).json({
      success: false,
      error: "Forbidden",
      message: "Role could not be determined for this user",
    });
  }

  if (!VALID_ROLES.includes(role)) {
    return res.status(403).json({
      success: false,
      error: "Forbidden",
      message: "Invalid role on user account",
    });
  }

  req.role = role;
  next();
}

function requireAdmin(req, res, next) {
  if (req.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: "Forbidden",
      message: "Admin role required",
    });
  }
  next();
}

/**
 * Financial record listing/detail: Analyst and Admin only.
 * Viewer uses dashboard analytics endpoints instead (no raw record CRUD/read).
 */
function requireAnalystOrAdmin(req, res, next) {
  if (req.role === "analyst" || req.role === "admin") {
    return next();
  }
  return res.status(403).json({
    success: false,
    error: "Forbidden",
    message: "Viewing and managing financial records requires analyst or admin role",
  });
}

/**
 * Dashboard routes are GET-only for all roles (viewer sees aggregates; analyst/admin same + can also use records).
 * Blocks accidental non-GET if extended later.
 */
function requireGetOnlyNonAdminWrite(req, res, next) {
  if (req.role === "admin") return next();
  if (req.method === "GET") return next();
  return res.status(403).json({
    success: false,
    error: "Forbidden",
    message: "Only GET requests are allowed for your role",
  });
}

module.exports = {
  roleAuth,
  requireAdmin,
  requireAnalystOrAdmin,
  requireGetOnlyNonAdminWrite,
  VALID_ROLES,
};
