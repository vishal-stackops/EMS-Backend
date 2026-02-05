const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const authController = require("../controllers/auth.controller");

router.post("/login", authController.login);
// src/routes/auth.routes.js
router.post("/logout", authMiddleware, authController.logout);

router.post(
  "/register",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR"]), // ADMIN and HR can register users
  authController.register
);

router.post("/refresh-token", authController.refreshToken);
router.post("/change-password", authMiddleware, authController.changePassword);
router.post("/reset-password/:token", authController.resetPassword);


module.exports = router;
