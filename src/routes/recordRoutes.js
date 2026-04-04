const { Router } = require("express");
const { body, param, query } = require("express-validator");
const recordController = require("../controllers/recordController");
const { roleAuth, requireAdmin, requireAnalystOrAdmin } = require("../middleware/roleAuth");
const validateRequest = require("../middleware/validateRequest");

const router = Router();

router.use(roleAuth);

const listRules = [
  query("type").optional().isIn(["income", "expense"]).withMessage("type must be income or expense"),
  query("category").optional().isString().trim(),
  query("dateFrom").optional().isISO8601().withMessage("dateFrom must be a valid ISO date"),
  query("dateTo").optional().isISO8601().withMessage("dateTo must be a valid ISO date"),
  query("search").optional().isString().trim(),
  query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be 1–100"),
];

const createRules = [
  body("amount").isFloat({ min: 0 }).withMessage("amount must be a non-negative number"),
  body("type").isIn(["income", "expense"]).withMessage("type must be income or expense"),
  body("category").trim().notEmpty().withMessage("category is required"),
  body("date").isISO8601().withMessage("date must be a valid ISO 8601 date"),
  body("notes").optional().isString(),
  body("createdBy").optional().isMongoId().withMessage("createdBy must be a valid ObjectId"),
];

const idParam = [param("id").isMongoId().withMessage("invalid record id")];

const patchRules = [
  ...idParam,
  body("amount").optional().isFloat({ min: 0 }).withMessage("amount must be a non-negative number"),
  body("type").optional().isIn(["income", "expense"]).withMessage("type must be income or expense"),
  body("category").optional().trim().notEmpty().withMessage("category cannot be empty"),
  body("date").optional().isISO8601().withMessage("date must be a valid ISO 8601 date"),
  body("notes").optional().isString(),
];

router.get("/", requireAnalystOrAdmin, listRules, validateRequest, recordController.listRecords);
router.get("/:id", requireAnalystOrAdmin, idParam, validateRequest, recordController.getRecord);

router.post(
  "/",
  requireAdmin,
  createRules,
  validateRequest,
  recordController.createRecord
);

router.patch(
  "/:id",
  requireAdmin,
  patchRules,
  validateRequest,
  recordController.updateRecord
);

router.delete(
  "/:id",
  requireAdmin,
  idParam,
  validateRequest,
  recordController.removeRecord
);

module.exports = router;
