import express from "express";
import {
  register,
  login,
  getCurrentUser,
  updateProfile,
  changePassword,
  deleteAccount,
  getAllUsers,
  getUserById,
  forgotPassword,
  resetPassword
} from "../controllers/authController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Test route - no middleware
router.post("/ping", (req, res) => {
  console.log("Ping received!");
  console.log("Body:", req.body);
  res.json({ message: "pong", body: req.body });
});

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/reset-password/:token", (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL}/reset-password/${req.params.token}`);
});

// Protected routes
router.get("/me", protect, getCurrentUser);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);
router.delete("/account", protect, deleteAccount);

// Admin routes
router.get("/", protect, adminOnly, getAllUsers);
router.get("/:id", protect, adminOnly, getUserById);

export default router;