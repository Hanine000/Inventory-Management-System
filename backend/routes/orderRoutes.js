import express from "express";
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  deleteOrder,
  acceptOrder,
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getOrders).post(protect, createOrder);
router.route("/:id").get(protect, getOrder).delete(protect, deleteOrder);
router.route("/:id/status").patch(protect, updateOrderStatus);
router.route("/:id/accept").get(acceptOrder);

export default router;