import mongoose from "mongoose";

// ─── SUB-SCHEMA: each line item in the order ──────────────────────────────────
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product reference is required"],
    },

    productName: {
      // snapshot at time of order (product may be renamed/deleted later)
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },

    unitCost: {
      // cost price at time of order
      type: Number,
      required: [true, "Unit cost is required"],
      min: [0, "Unit cost cannot be negative"],
    },

    subtotal: {
      // unitCost × quantity — stored to avoid recalculation
      type: Number,
      required: true,
    },

    receivedQuantity: {
      // tracks partial deliveries (filled by receiveOrder())
      type: Number,
      default: 0,
      min: [0, "Received quantity cannot be negative"],
    },
  },
  { _id: false }
);

// ─── MAIN ORDER SCHEMA ────────────────────────────────────────────────────────
const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      // auto-generated e.g. "ORD-20260405-001"
      type: String,
      unique: true,
    },

    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: [true, "Supplier is required"],
    },

    supplierName: {
      // snapshot — supplier may be deleted later
      type: String,
      required: true,
    },

    supplierEmail: { 
      type: String, 
      required: true 
    },

    items: {
      type: [orderItemSchema],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: "An order must have at least one item",
      },
    },

    totalAmount: {
      // sum of all item subtotals
      type: Number,
      required: true,
      min: [0, "Total amount cannot be negative"],
    },

    status: {
      type: String,
      enum: ["Pending", "Accepted", "Received", "Cancelled"],
      default: "Pending",
    },

    receivedAt: {
      type: Date,
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// ─── PRE-SAVE HOOK: auto-generate orderNumber ─────────────────────────────────
orderSchema.pre("save", async function () {
  if (!this.isNew) return;

  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);


  const lastOrder = await mongoose.model("Order").findOne({
    createdAt: { $gte: startOfDay, $lte: endOfDay },
    orderNumber: { $regex: `^ORD-${dateStr}-` },
  }).sort({ orderNumber: -1 });

  let nextSeq = 1;
  if (lastOrder) {
    
    const lastSeq = parseInt(lastOrder.orderNumber.split("-")[2], 10);
    nextSeq = lastSeq + 1;
  }

  this.orderNumber = `ORD-${dateStr}-${String(nextSeq).padStart(3, "0")}`;
});


// ─── VIRTUAL: total items count ──────────────────────────────────────────────
orderSchema.virtual("totalItems").get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// ─── INDEXES ──────────────────────────────────────────────────────────────────
orderSchema.index({ supplier: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

orderSchema.set("toJSON", { virtuals: true });
orderSchema.set("toObject", { virtuals: true });

export default mongoose.model("Order", orderSchema);