import Product from "../models/Product.js";

export const updateStock = async (items) => {
  const bulkOps = items.map((item) => ({
    updateOne: {
      filter: { _id: item.product },
      update: { $inc: { "stock.quantity": item.receivedQuantity || item.quantity } }, 
    },
  }));

  await Product.bulkWrite(bulkOps);
};