import Order from "../models/Order.js";
import Supplier from "../models/Supplier.js";
import Product from "../models/Product.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendOrderEmail, sendCancelEmail } from "../utils/email.js";
import { updateStock } from "../utils/stockManager.js";

// ─── STATUS TRANSITION MAP ────────────────────────────────────────────────────
const VALID_TRANSITIONS = {
  Pending: ["Accepted", "Cancelled"],
  Accepted: ["Received", "Cancelled"],
};

const isValidTransition = (current, next) =>
  VALID_TRANSITIONS[current]?.includes(next) ?? false;

// ─── CREATE ORDER ─────────────────────────────────────────────────────────────
export const createOrder = asyncHandler(async (req, res, next) => {
  const { supplier, items } = req.body;

  if (!items || items.length === 0) {
    return next(new Error("An order must contain at least one item"));
  }

  const supplierDoc = await Supplier.findById(supplier);
  if (!supplierDoc) return next(new Error("Supplier not found"));

  const processedItems = await Promise.all(
    items.map(async (item) => {
      const productDoc = await Product.findById(item.product);
      if (!productDoc) throw new Error(`Product not found: ${item.product}`);
      if (item.quantity < 1) throw new Error(`Invalid quantity for product: ${productDoc.name}`);

      return {
        product: productDoc._id,
        productName: productDoc.name, 
        quantity: item.quantity,
        unitCost: item.unitCost,
        subtotal: item.unitCost * item.quantity,
      };
    })
  );

  const totalAmount = processedItems.reduce((sum, item) => sum + item.subtotal, 0);

  const order = await Order.create({
    supplier: supplierDoc._id,
    supplierName: supplierDoc.name,
    supplierEmail: supplierDoc.email,
    items: processedItems,
    totalAmount,
    status: "Pending",
    createdBy: req.user._id,
  });

  try {
  await sendOrderEmail(order);
} catch (err) {
  console.error("Email failed:", err.message);
}

  res.status(201).json({ success: true, data: order });
});

// ─── GET ALL ORDERS ───────────────────────────────────────────────────────────
export const getOrders = asyncHandler(async (req, res) => {
  const { status, supplier, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (supplier) filter.supplier = supplier;

  const orders = await Order.find(filter)
    .populate("supplier", "name email")
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Order.countDocuments(filter);

  res.json({
    success: true,
    data: orders,
    pagination: { total, page: Number(page), limit: Number(limit) },
  });
});

// ─── GET SINGLE ORDER ─────────────────────────────────────────────────────────
export const getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate("supplier", "name email")
    .populate("items.product", "name sku")
    .populate("createdBy", "name email");

  if (!order) return next(new Error("Order not found"));

  res.json({ success: true, data: order });
});

// ─── UPDATE ORDER STATUS ──────────────────────────────────────────────────────
export const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) return next(new Error("Order not found"));

  if (!isValidTransition(order.status, status)) {
    return next(
      new Error(`Invalid status transition: ${order.status} → ${status}`)
    );
  }

  order.status = status;

  if (status === "Received") {
    order.receivedAt = new Date();
    await updateStock(order.items);
  }

  if (status === "Cancelled") {
    await sendCancelEmail(order);
  }

  await order.save();

  res.json({ success: true, data: order });
});

// ─── DELETE ORDER ─────────────────────────────────────────────────────────────
export const deleteOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) return next(new Error("Order not found"));

  if (order.status !== "Cancelled") {
    return next(new Error("Only cancelled orders can be deleted"));
  }

  await order.deleteOne();

  res.json({ success: true, message: "Order deleted successfully" });
});
// ─── ACCEPT ORDER (called from email link, no auth required) ──────────────────
export const acceptOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).send(`
        <h2>Order not found.</h2>
      `);
    }

    if (order.status !== "Pending") {
      return res.status(400).send(`
        <h2>This order is already <strong>${order.status}</strong>.</h2>
        <p>No changes were made.</p>
      `);
    }

    order.status = "Accepted";
    await order.save();

    return res.status(200).send(`
      <h2>✅ Order ${order.orderNumber} has been accepted successfully.</h2>
      <p>Thank you! The Lumière team has been notified.</p>
    `);

  } catch (error) {
    return res.status(500).send(`<h2>Server error. Please try again later.</h2>`);
  }
};