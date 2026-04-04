const { Router } = require("express");
const dashboardController = require("../controllers/dashboardController");
const { roleAuth, requireGetOnlyNonAdminWrite } = require("../middleware/roleAuth");

const router = Router();

router.use(roleAuth, requireGetOnlyNonAdminWrite);

router.get("/summary", dashboardController.summary);
router.get("/category", dashboardController.category);
router.get("/recent", dashboardController.recent);
router.get("/monthly", dashboardController.monthly);
router.get("/weekly", dashboardController.weekly);

module.exports = router;
