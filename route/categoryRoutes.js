const express = require("express");
const router = express.Router();
const categoryController = require("../controller/categoryController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware.requireAuth, categoryController.getCategories);
router.post(
  "/interest",
  authMiddleware.requireAuth,
  categoryController.markInterest
);
router.get(
  "/get",
  authMiddleware.requireAuth,
  categoryController.getUserInterests
);
module.exports = router;
