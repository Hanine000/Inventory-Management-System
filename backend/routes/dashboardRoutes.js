import express from "express";
import {
  getStats,
  getTotalProducts,
  getTotalSales,
  getLowStockCount,
  getSalesLast7Days,
  getSalesByCategory,
  getTopProducts,
} from "../controllers/dashboardController.js";
import { protect } from "../middleware/authMiddleware.js"; 

const router = express.Router();

// ─── DASHBOARD ROUTES ─────────────────────────────────────────────────────────
router.get("/stats", getStats);                    // all KPIs in one request
router.get("/total-products", getTotalProducts);   // total products only
router.get("/total-sales", getTotalSales);         // total sales only
router.get("/low-stock", getLowStockCount);        // low stock only
router.get("/sales-last-7-days", protect, getSalesLast7Days);
router.get("/sales-by-category", protect, getSalesByCategory);
router.get("/top-products",      protect, getTopProducts);

router.get("/ping", (req, res) => res.json({ message: "dashboard router works" }));

export default router;