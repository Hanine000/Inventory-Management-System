import Product from "../models/Product.js";
import Sale from "../models/Sale.js";
import Category from "../models/Category.js";

// ─── 1. TOTAL PRODUCTS ────────────────────────────────────────────────────────
export const getTotalProducts = async (req, res, next) => {
  try {
    const totalProducts = await Product.countDocuments({ isActive: true }); cc

    res.status(200).json({
      success: true,
      data: { totalProducts },
    });
  } catch (error) {
    next(error);
  }
};

// ─── 2. LOW STOCK COUNT ───────────────────────────────────────────────────────
export const getLowStockCount = async (req, res, next) => {
  try {
    const lowStockProducts = await Product.find({ isActive: true })
      .select("name sku stock")
      .lean();
    const lowStock = lowStockProducts.filter(
      (p) => p.stock.quantity <= p.stock.lowStockThreshold
    );

    res.status(200).json({
      success: true,
      data: {
        lowStockCount: lowStock.length,
        products: lowStock, // useful to show which products are low
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── 3. TOTAL SALES ───────────────────────────────────────────────────────────
export const getTotalSales = async (req, res, next) => {
  try {
    const result = await Sale.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalSalesCount: { $sum: 1 },
        },
      },
    ]);

    const totalRevenue = result[0]?.totalRevenue || 0;
    const totalSalesCount = result[0]?.totalSalesCount || 0;

    res.status(200).json({
      success: true,
      data: { totalRevenue, totalSalesCount },
    });
  } catch (error) {
    next(error);
  }
};

// ─── 4. ALL STATS COMBINED (single request for dashboard) ────────────────────
export const getStats = async (req, res, next) => {
  try {
    // Run all queries in parallel for performance
    const [totalProducts, salesResult, allProducts, totalCategories] =
      await Promise.all([
        Product.countDocuments({ isActive: true }),
        Sale.aggregate([
          { $match: { status: "completed" } },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$totalAmount" },
              totalSalesCount: { $sum: 1 },
            },
          },
        ]),
        Product.find({ isActive: true }).select("stock").lean(),
        Category.countDocuments({ isActive: true }),
      ]);

    // Low stock filter
    const lowStockCount = allProducts.filter(
      (p) => p.stock.quantity <= p.stock.lowStockThreshold
    ).length;

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        totalCategories,
        totalRevenue: salesResult[0]?.totalRevenue || 0,
        totalSalesCount: salesResult[0]?.totalSalesCount || 0,
        lowStockCount,
      },
    });
  } catch (error) {
    next(error);
  }
};
// ─── 5. SALES LAST 7 DAYS (line chart) ───────────────────────────────────────
export const getSalesLast7Days = async (req, res, next) => {
  try {
    const days = 7;
    const start = new Date();
    start.setDate(start.getDate() - days + 1);
    start.setHours(0, 0, 0, 0);

    const result = await Sale.aggregate([
      { $match: { status: "completed", createdAt: { $gte: start } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          count:   { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // fill missing days with 0
    const map = Object.fromEntries(result.map((r) => [r._id, r]));
    const data = Array.from({ length: days }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      return {
        date:    key,
        revenue: map[key]?.revenue ?? 0,
        count:   map[key]?.count   ?? 0,
      };
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// ─── 6. SALES BY CATEGORY (pie chart) ────────────────────────────────────────
export const getSalesByCategory = async (req, res, next) => {
  try {
    const result = await Sale.aggregate([
      { $match: { status: "completed" } },
      { $unwind: "$items" },
      {
        $lookup: {
          from:         "products",
          localField:   "items.product",
          foreignField: "_id",
          as:           "productDoc",
        },
      },
      { $unwind: "$productDoc" },
      {
        $lookup: {
          from:         "categories",
          localField:   "productDoc.category",
          foreignField: "_id",
          as:           "categoryDoc",
        },
      },
      { $unwind: "$categoryDoc" },
      {
        $group: {
          _id:      "$categoryDoc._id",
          name:     { $first: "$categoryDoc.name" },
          revenue:  { $sum: { $multiply: ["$items.unitPrice", "$items.quantity"] } },
          count:    { $sum: "$items.quantity" },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// ─── 7. TOP 5 PRODUCTS (bar chart) ───────────────────────────────────────────
export const getTopProducts = async (req, res, next) => {
  try {
    const result = await Sale.aggregate([
      { $match: { status: "completed" } },
      { $unwind: "$items" },
      {
        $group: {
          _id:      "$items.product",
          name:     { $first: "$items.productName" },
          quantity: { $sum: "$items.quantity" },
          revenue:  { $sum: { $multiply: ["$items.unitPrice", "$items.quantity"] } },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};