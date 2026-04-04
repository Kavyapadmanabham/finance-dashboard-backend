const { Router } = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const validateRequest = require("../middleware/validateRequest");

const router = Router();

const registerRules = [
  body("name").trim().notEmpty().withMessage("name is required"),
  body("email").isEmail().normalizeEmail().withMessage("valid email is required"),
  body("password")
    .isString()
    .withMessage("password is required")
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters"),
];

const loginRules = [
  body("email").isEmail().normalizeEmail().withMessage("valid email is required"),
  body("password").isString().notEmpty().withMessage("password is required"),
];

router.post("/register", registerRules, validateRequest, authController.register);
router.post("/login", loginRules, validateRequest, authController.login);

module.exports = router;
