import { useState, useRef, useMemo } from "react";
import { useCreateSale } from "../../hooks/useSales";
import { formatCurrency } from "../../utils/formatDate";

// ─── Shared micro-components ──────────────────────────────────────────────────

const Field = ({ label, error, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
      {label}
    </label>
    {children}
    {error && (
      <p className="text-xs text-red-400 flex items-center gap-1">
        <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd" />
        </svg>
        {error}
      </p>
    )}
  </div>
);

const inputCls = (err = false) =>
  [
    "w-full bg-slate-800/60 border rounded-lg px-3 py-2.5 text-sm text-slate-100",
    "placeholder:text-slate-600 transition-all duration-200 focus:outline-none focus:ring-2",
    err
      ? "border-red-500/60 focus:ring-red-500/20"
      : "border-slate-700 hover:border-slate-600 focus:border-rose-500/60 focus:ring-rose-500/15",
  ].join(" ");

// ─── Product search dropdown ──────────────────────────────────────────────────

const ProductSearch = ({ products, onSelect, excludeIds = [] }) => {
  const [query, setQuery]   = useState("");
  const [open,  setOpen]    = useState(false);
  const inputRef            = useRef(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products
      .filter(
        (p) =>
          !excludeIds.includes(p._id) &&
          p.isActive &&
          (p.name.toLowerCase().includes(q) ||
           p.sku?.toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [query, products, excludeIds]);

  const handleSelect = (product) => {
    onSelect(product);
    setQuery("");
    setOpen(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search by product name or SKU…"
          className={`${inputCls()} pl-9`}
        />
      </div>

      {/* Dropdown */}
      {open && filtered.length > 0 && (
        <ul className="absolute z-30 left-0 right-0 mt-1 bg-slate-800 border border-slate-700
                        rounded-xl shadow-xl overflow-hidden max-h-56 overflow-y-auto">
          {filtered.map((product) => {
            const outOfStock = product.stock?.quantity === 0;
            return (
              <li key={product._id}>
                <button
                  type="button"
                  disabled={outOfStock}
                  onMouseDown={() => handleSelect(product)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left
                             hover:bg-slate-700/70 disabled:opacity-40 disabled:cursor-not-allowed
                             transition-colors duration-100"
                >
                  {/* Thumbnail */}
                  {product.images?.[0]?.url ? (
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                      className="w-8 h-8 rounded-md object-cover flex-shrink-0 border border-slate-700"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-md bg-slate-700 flex-shrink-0 flex items-center justify-center">
                      <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-100 font-medium truncate">{product.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {formatCurrency(product.price?.sellingPrice, "DZD", "fr-DZ")}
                      {" · "}
                      <span className={product.stock?.quantity === 0 ? "text-red-400" : "text-slate-500"}>
                        {outOfStock ? "Out of stock" : `${product.stock.quantity} in stock`}
                      </span>
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* No results hint */}
      {open && query.trim() && filtered.length === 0 && (
        <div className="absolute z-30 left-0 right-0 mt-1 bg-slate-800 border border-slate-700
                         rounded-xl px-4 py-3 text-xs text-slate-500">
          No available products match "{query}"
        </div>
      )}
    </div>
  );
};

// ─── Single line-item row ─────────────────────────────────────────────────────

const LineItem = ({ item, onChange, onRemove, error }) => {
  const maxQty = item.product.stock?.quantity ?? 0;

  return (
    <div className={[
      "grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 py-3 px-3 rounded-xl",
      "border transition-colors duration-150",
      error
        ? "bg-red-500/5 border-red-500/30"
        : "bg-slate-800/40 border-slate-700/60",
    ].join(" ")}>
      {/* Thumbnail */}
      {item.product.images?.[0]?.url ? (
        <img
          src={item.product.images[0].url}
          alt={item.product.name}
          className="w-10 h-10 rounded-lg object-cover border border-slate-700/60 flex-shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded-lg bg-slate-700 flex-shrink-0 flex items-center justify-center">
          <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
      )}

      {/* Name + price */}
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-100 truncate">{item.product.name}</p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          {formatCurrency(item.product.price?.sellingPrice, "DZD", "fr-DZ")} each
          {" · "}
          <span className={maxQty <= 5 ? "text-amber-400" : "text-slate-500"}>
            {maxQty} in stock
          </span>
        </p>
        {error && <p className="text-[11px] text-red-400 mt-0.5">{error}</p>}
      </div>

      {/* Quantity stepper */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          type="button"
          onClick={() => onChange(Math.max(1, item.quantity - 1))}
          className="w-7 h-7 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 flex items-center justify-center
                     transition-colors text-base leading-none disabled:opacity-40"
          disabled={item.quantity <= 1}
        >
          −
        </button>
        <input
          type="number"
          min={1}
          max={maxQty}
          value={item.quantity}
          onChange={(e) => {
            const v = Math.max(1, Math.min(maxQty, Number(e.target.value) || 1));
            onChange(v);
          }}
          className="w-12 text-center bg-slate-800 border border-slate-700 rounded-md
                     text-sm text-slate-100 py-1 focus:outline-none focus:ring-1
                     focus:ring-rose-500/40 focus:border-rose-500/50 transition-colors"
        />
        <button
          type="button"
          onClick={() => onChange(Math.min(maxQty, item.quantity + 1))}
          className="w-7 h-7 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 flex items-center justify-center
                     transition-colors text-base leading-none disabled:opacity-40"
          disabled={item.quantity >= maxQty}
        >
          +
        </button>
      </div>

      {/* Subtotal + remove */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-sm font-semibold text-slate-200 w-24 text-right">
          {formatCurrency(
            (item.product.price?.sellingPrice ?? 0) * item.quantity,
            "DZD",
            "fr-DZ"
          )}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          title="Remove item"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

export default function SaleForm({ products = [], onSuccess, onCancel }) {
  const createMutation = useCreateSale();

  // Each item: { product: Product, quantity: number }
  const [items,       setItems]       = useState([]);
  const [itemErrors,  setItemErrors]  = useState({});  // keyed by product._id
  const [serverError, setServerError] = useState("");

  // ── Derived ────────────────────────────────────────────────────────────────
  const totalAmount = useMemo(
    () => items.reduce(
      (sum, i) => sum + (i.product.price?.sellingPrice ?? 0) * i.quantity,
      0
    ),
    [items]
  );

  const excludeIds = items.map((i) => i.product._id);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleAddProduct = (product) => {
    setItems((prev) => [...prev, { product, quantity: 1 }]);
    // Clear any prior server error when the cart changes
    setServerError("");
  };

  const handleChangeQty = (productId, qty) => {
    setItems((prev) =>
      prev.map((i) => i.product._id === productId ? { ...i, quantity: qty } : i)
    );
    setItemErrors((prev) => ({ ...prev, [productId]: "" }));
    setServerError("");
  };

  const handleRemove = (productId) => {
    setItems((prev) => prev.filter((i) => i.product._id !== productId));
    setItemErrors((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  };

  // ── Validate ───────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};

    items.forEach(({ product, quantity }) => {
      const max = product.stock?.quantity ?? 0;
      if (quantity < 1)     errs[product._id] = "Quantity must be at least 1.";
      else if (quantity > max) errs[product._id] = `Only ${max} in stock.`;
    });

    return errs;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    setServerError("");

    if (items.length === 0) {
      setServerError("Add at least one product to record a sale.");
      return;
    }

    const errs = validate();
    if (Object.keys(errs).length) { setItemErrors(errs); return; }

    // Build the payload the backend expects:
    // { items: [{ product: ObjectId, quantity: number }] }
    const payload = {
      items: items.map((i) => ({
        product:  i.product._id,
        quantity: i.quantity,
      })),
    };

    createMutation.mutate(payload, {
      onSuccess: () => onSuccess?.(),
      onError: (err) =>
        setServerError(err?.message ?? "Failed to record sale. Please try again."),
    });
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">

      {/* Server error */}
      {serverError && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-400">{serverError}</p>
        </div>
      )}

      {/* Product search */}
      <Field label="Add product to sale">
        <ProductSearch
          products={products}
          excludeIds={excludeIds}
          onSelect={handleAddProduct}
        />
      </Field>

      {/* Line items */}
      {items.length > 0 ? (
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Items ({items.length})
          </p>
          {items.map((item) => (
            <LineItem
              key={item.product._id}
              item={item}
              error={itemErrors[item.product._id]}
              onChange={(qty) => handleChangeQty(item.product._id, qty)}
              onRemove={() => handleRemove(item.product._id)}
            />
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-10 gap-2
                         border border-dashed border-slate-700 rounded-xl text-slate-600">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <p className="text-sm">No items added yet</p>
          <p className="text-xs">Search for a product above to get started</p>
        </div>
      )}

      {/* Order summary */}
      {items.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 space-y-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
            Order Summary
          </p>

          {items.map((item) => (
            <div key={item.product._id} className="flex items-center justify-between text-xs">
              <span className="text-slate-400 truncate max-w-[180px]">
                {item.product.name}
                <span className="text-slate-600 ml-1">× {item.quantity}</span>
              </span>
              <span className="text-slate-300 font-medium flex-shrink-0 ml-4">
                {formatCurrency(
                  (item.product.price?.sellingPrice ?? 0) * item.quantity,
                  "DZD",
                  "fr-DZ"
                )}
              </span>
            </div>
          ))}

          <div className="border-t border-slate-700/60 pt-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-200">Total</span>
            <span className="text-base font-bold text-rose-400">
              {formatCurrency(totalAmount, "DZD", "fr-DZ")}
            </span>
          </div>

          {/* Item count hint */}
          <p className="text-[10px] text-slate-600 text-right">
            {items.reduce((s, i) => s + i.quantity, 0)} unit{items.reduce((s, i) => s + i.quantity, 0) !== 1 ? "s" : ""} ·{" "}
            {items.length} product{items.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* Note: saleNumber + status are generated by the backend */}
      <p className="text-[10px] text-slate-600 flex items-center gap-1.5">
        <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Sale number and status are assigned automatically by the system.
        Stock will be deducted immediately upon confirmation.
      </p>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-700/50">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200
                     bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={createMutation.isPending || items.length === 0}
          className="px-5 py-2 text-sm font-semibold text-white
                     bg-gradient-to-r from-rose-500 to-pink-600
                     hover:from-rose-400 hover:to-pink-500
                     rounded-lg shadow-lg shadow-rose-500/25 transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center gap-2"
        >
          {createMutation.isPending ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10"
                  stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Recording…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Confirm Sale
              {items.length > 0 && (
                <span className="ml-0.5 opacity-70">
                  · {formatCurrency(totalAmount, "DZD", "fr-DZ")}
                </span>
              )}
            </>
          )}
        </button>
      </div>
    </form>
  );
}