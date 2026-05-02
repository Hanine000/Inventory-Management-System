import { useState } from "react";
import { useCreateSale } from "../../hooks/useSales";
import { useProducts } from "../../hooks/useProducts";
import { formatCurrency } from "../../utils/FormatDate";

const inputCls = (err) =>
  ["w-full bg-slate-800/60 border rounded-lg px-3 py-2.5 text-sm text-slate-100",
   "placeholder:text-slate-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0",
   err ? "border-red-500/60 focus:ring-red-500/20"
       : "border-slate-700 hover:border-slate-600 focus:border-rose-500/60 focus:ring-rose-500/15",
  ].join(" ");

const Field = ({ label, required, error, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
      {label}{required && <span className="text-rose-400 ml-1">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-400 mt-0.5">{error}</p>}
  </div>
);

const emptyItem = () => ({ product: "", quantity: 1, unitPrice: "" });

const PAYMENT_METHODS = ["cash", "card", "transfer"];

const SaleForm = ({ onSuccess, onCancel }) => {
  const createMutation = useCreateSale();
  const { data: productsData } = useProducts({ limit: 200, isActive: "true" });
  const products = productsData?.data ?? [];

  const [customerName, setCustomerName]   = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [items, setItems]                 = useState([emptyItem()]);
  const [errors, setErrors]               = useState({});
  const [serverError, setServerError]     = useState("");

  // ── Item handlers ────────────────────────────────────────────────────────
  const updateItem = (idx, field, value) => {
    setItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      // Auto-fill selling price when product selected
      if (field === "product" && value) {
        const prod = products.find((p) => p._id === value);
        if (prod) next[idx].unitPrice = prod.price?.sellingPrice ?? "";
      }
      return next;
    });
    setErrors((p) => ({ ...p, [`item_${idx}_${field}`]: "" }));
    setServerError("");
  };

  const addItem    = () => setItems((p) => [...p, emptyItem()]);
  const removeItem = (idx) => setItems((p) => p.filter((_, i) => i !== idx));

  // ── Total ────────────────────────────────────────────────────────────────
  const total = items.reduce((sum, item) => {
    return sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
  }, 0);

  // ── Validation ───────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    items.forEach((item, idx) => {
      if (!item.product)                        e[`item_${idx}_product`]   = "Select a product.";
      if (!item.quantity || item.quantity < 1)  e[`item_${idx}_quantity`]  = "Min 1.";
      if (!item.unitPrice || item.unitPrice < 0) e[`item_${idx}_unitPrice`] = "Enter price.";
    });
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setServerError("");
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const body = {
      items: items.map((item) => ({
        product:   item.product,
        quantity:  Number(item.quantity),
        unitPrice: Number(item.unitPrice),
      })),
      paymentMethod,
      ...(customerName  && { customerName }),
      ...(customerPhone && { customerPhone }),
    };

    createMutation.mutate(body, {
      onSuccess: () => onSuccess?.(),
      onError: (err) =>
        setServerError(err?.response?.data?.message ?? err?.message ?? "Failed to create sale."),
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {serverError && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p className="text-sm text-red-400">{serverError}</p>
        </div>
      )}

      {/* Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Sale Items <span className="text-rose-400">*</span>
          </label>
          <button type="button" onClick={addItem}
            className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            Add Item
          </button>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-12 gap-2 px-1">
          <div className="col-span-5 text-[10px] text-slate-600 uppercase tracking-widest font-semibold">Product</div>
          <div className="col-span-2 text-[10px] text-slate-600 uppercase tracking-widest font-semibold">Qty</div>
          <div className="col-span-3 text-[10px] text-slate-600 uppercase tracking-widest font-semibold">Unit Price</div>
          <div className="col-span-2 text-[10px] text-slate-600 uppercase tracking-widest font-semibold text-right">Subtotal</div>
        </div>

        {items.map((item, idx) => {
          const subtotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
          const selectedProduct = products.find((p) => p._id === item.product);
          const stockLeft = selectedProduct?.stock?.quantity ?? null;

          return (
            <div key={idx} className="grid grid-cols-12 gap-2 items-start bg-slate-800/40 rounded-xl p-3 border border-slate-700/40">
              {/* Product */}
              <div className="col-span-5">
                <select value={item.product} onChange={(e) => updateItem(idx, "product", e.target.value)}
                  className={`${inputCls(errors[`item_${idx}_product`])} text-xs py-2`}>
                  <option value="">Select product…</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id} disabled={p.stock?.quantity === 0}>
                      {p.name}{p.stock?.quantity === 0 ? " (out of stock)" : ""}
                    </option>
                  ))}
                </select>
                {stockLeft !== null && (
                  <p className={`text-[10px] mt-1 ${stockLeft <= 5 ? "text-amber-400" : "text-slate-600"}`}>
                    {stockLeft} in stock
                  </p>
                )}
                {errors[`item_${idx}_product`] && (
                  <p className="text-xs text-red-400 mt-0.5">{errors[`item_${idx}_product`]}</p>
                )}
              </div>

              {/* Quantity */}
              <div className="col-span-2">
                <input type="number" min="1" max={stockLeft ?? undefined} value={item.quantity}
                  onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                  className={`${inputCls(errors[`item_${idx}_quantity`])} text-xs py-2`}
                  placeholder="1" />
                {errors[`item_${idx}_quantity`] && (
                  <p className="text-xs text-red-400 mt-0.5">{errors[`item_${idx}_quantity`]}</p>
                )}
              </div>

              {/* Unit price */}
              <div className="col-span-3">
                <input type="number" min="0" step="0.01" value={item.unitPrice}
                  onChange={(e) => updateItem(idx, "unitPrice", e.target.value)}
                  className={`${inputCls(errors[`item_${idx}_unitPrice`])} text-xs py-2`}
                  placeholder="0.00" />
                {errors[`item_${idx}_unitPrice`] && (
                  <p className="text-xs text-red-400 mt-0.5">{errors[`item_${idx}_unitPrice`]}</p>
                )}
              </div>

              {/* Subtotal + remove */}
              <div className="col-span-2 flex items-center justify-end gap-1.5 pt-2">
                <span className="text-xs font-semibold text-slate-300 whitespace-nowrap">
                  {subtotal > 0 ? formatCurrency(subtotal) : "—"}
                </span>
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(idx)}
                    className="p-1 rounded text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Total */}
        <div className="flex items-center justify-between pt-2 px-1 border-t border-slate-700/50">
          <span className="text-xs text-slate-500">{items.length} item{items.length !== 1 ? "s" : ""}</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Total:</span>
            <span className="text-sm font-bold text-emerald-400">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2 border-t border-slate-700/50">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={createMutation.isPending}
          className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 rounded-lg shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 flex items-center gap-2">
          {createMutation.isPending
            ? <><svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Recording…</>
            : "Record Sale"
          }
        </button>
      </div>
    </form>
  );
};

export default SaleForm;