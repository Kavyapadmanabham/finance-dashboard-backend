const { Router } = require("express");
const { body, param } = require("express-validator");
const userController = require("../controllers/userController");
const { roleAuth, requireAdmin } = require("../middleware/roleAuth");
const validateRequest = require("../middleware/validateRequest");

const router = Router();

router.use(roleAuth, requireAdmin);

const createRules = [
  body("name").trim().notEmpty().withMessage("name is required"),
  body("email").isEmail().normalizeEmail().withMessage("valid email is required"),
  body("password")
    .isString()
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters"),
  body("role")
    .optional()
    .isIn(["viewer", "analyst", "admin"])
    .withMessage("role must be viewer, analyst, or admin"),
  body("status")
    .optional()
    .isIn(["active", "inactive"])
    .withMessage("status must be active or inactive"),
];

const updateRules = [
  param("id").isMongoId().withMessage("invalid user id"),
  body("role")
    .optional()
    .isIn(["viewer", "analyst", "admin"])
    .withMessage("role must be viewer, analyst, or admin"),
  body("status")
    .optional()
    .isIn(["active", "inactive"])
    .withMessage("status must be active or inactive"),
  body().custom((_value, { req }) => {
    if (req.body.role === undefined && req.body.status === undefined) {
      throw new Error("At least one of role or status is required");
    }
    return true;
  }),
];

router.post("/", createRules, validateRequest, userController.createUser);
router.get("/", userController.listUsers);
router.patch("/:id", updateRules, validateRequest, userController.updateUser);

module.exports = router;
