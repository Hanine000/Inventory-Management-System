import { useState, useCallback } from "react";
import ProductTable from "../components/product/ProductTable";
import ProductForm  from "../components/product/ProductForm";
import {
  useProducts,
  useDeleteProduct,
  useRestoreProduct,
} from "../hooks/useProducts";

// ─── Placeholder hooks (fill in when those modules are built) ─────────────────
// These will return { data: [] } until their API + hooks are implemented.
const useList = (hook) => {
  try { return hook(); }
  catch { return { data: { data: [] } }; }
};

// ─── Small reusable UI pieces ─────────────────────────────────────────────────

/** Slide-over panel used for Create / Edit */
const SlideOver = ({ open, onClose, title, children }) => (
  <>
    {/* Backdrop */}
    {open && (
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
    )}

    {/* Panel */}
    <div
      className={[
        "fixed top-0 right-0 z-50 h-full w-full max-w-xl bg-slate-950 border-l border-slate-800",
        "shadow-2xl flex flex-col transition-transform duration-300 ease-in-out",
        open ? "translate-x-0" : "translate-x-full",
      ].join(" ")}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 flex-shrink-0">
        <h2 className="text-base font-semibold text-slate-100">{title}</h2>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
    </div>
  </>
);

/** Confirmation dialog for destructive actions */
const ConfirmDialog = ({ open, onClose, onConfirm, title, message, confirmLabel, loading, danger = true }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl p-6 space-y-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto ${danger ? "bg-red-500/15" : "bg-emerald-500/15"}`}>
          {danger ? (
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
        </div>
        <div className="text-center">
          <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
          <p className="text-xs text-slate-500 mt-1">{message}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-slate-400 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={[
              "flex-1 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all disabled:opacity-50",
              danger
                ? "bg-red-500 hover:bg-red-400"
                : "bg-emerald-500 hover:bg-emerald-400",
            ].join(" ")}
          >
            {loading ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

/** Small search input */
const SearchInput = ({ value, onChange }) => (
  <div className="relative">
    <svg
      className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none"
      fill="none" stroke="currentColor" viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search products…"
      className="w-full sm:w-64 bg-slate-800/60 border border-slate-700 hover:border-slate-600
                 text-slate-100 text-sm placeholder:text-slate-600 rounded-lg pl-9 pr-3 py-2
                 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/50 transition-all"
    />
  </div>
);

/** Filter select (category / brand / status) */
const FilterSelect = ({ value, onChange, children }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="bg-slate-800/60 border border-slate-700 hover:border-slate-600 text-slate-300 text-sm
               rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500/20
               focus:border-rose-500/50 transition-all"
  >
    {children}
  </select>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Products() {
  // ── Filter / Pagination state ────────────────────────────────────────────
  const [search,   setSearchRaw] = useState("");
  const [category, setCategory]  = useState("");
  const [brand,    setBrand]     = useState("");
  const [isActive, setIsActive]  = useState("true");      // "true" | "false" | ""
  const [lowStock, setLowStock]  = useState(false);
  const [page,     setPage]      = useState(1);
  const [limit,    setLimit]     = useState(10);

  // Debounced search — reset to page 1 on new search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchTimer = useState(null);

  const handleSearch = (val) => {
    setSearchRaw(val);
    clearTimeout(searchTimer[0]);
    searchTimer[0] = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 400);
  };

  // ── Slide-over state ─────────────────────────────────────────────────────
  const [panelOpen,    setPanelOpen]    = useState(false);
  const [editProduct,  setEditProduct]  = useState(null);  // null = create mode

  // ── Confirm dialog state ─────────────────────────────────────────────────
  const [confirmTarget, setConfirmTarget] = useState(null);  // { product, action: 'delete'|'restore' }

  // ── Queries ──────────────────────────────────────────────────────────────
  const params = {
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(category         && { category }),
    ...(brand            && { brand }),
    ...(isActive !== ""  && { isActive }),
    ...(lowStock         && { lowStock: true }),
    page,
    limit,
  };

  const { data, isLoading, isError, refetch } = useProducts(params);

  const products = data?.data   ?? [];
  const total    = data?.total  ?? 0;
  const pages    = data?.pages  ?? 1;

  // ── Supporting data (categories, brands, suppliers for the form) ─────────
  // These will be replaced by real hooks (useCategories, useBrands, useSuppliers)
  // when those modules are built. The Products page imports them from their
  // own hooks — ProductForm receives them as plain arrays.
  const categories = [];   // replace: useCategories().data?.data ?? []
  const brands     = [];   // replace: useBrands().data?.data     ?? []
  const suppliers  = [];   // replace: useSuppliers().data?.data  ?? []

  // ── Mutations ────────────────────────────────────────────────────────────
  const deleteMutation  = useDeleteProduct();
  const restoreMutation = useRestoreProduct();

  // ── Handlers ─────────────────────────────────────────────────────────────
  const openCreate = () => { setEditProduct(null); setPanelOpen(true); };
  const openEdit   = (product) => { setEditProduct(product); setPanelOpen(true); };
  const closePanel = () => { setPanelOpen(false); setEditProduct(null); };

  const handleFormSuccess = () => {
    closePanel();
    refetch();
  };

  const handleDelete  = (product) => setConfirmTarget({ product, action: "delete" });
  const handleRestore = (product) => setConfirmTarget({ product, action: "restore" });
  const closeConfirm  = () => setConfirmTarget(null);

  const handleConfirm = useCallback(() => {
    if (!confirmTarget) return;
    const { product, action } = confirmTarget;

    const opts = {
      onSuccess: () => { closeConfirm(); refetch(); },
      onError:   () => { closeConfirm(); },
    };

    if (action === "delete") {
      deleteMutation.mutate(product._id, opts);
    } else {
      restoreMutation.mutate(product._id, opts);
    }
  }, [confirmTarget, deleteMutation, restoreMutation, refetch]);

  const confirmLoading =
    deleteMutation.isPending || restoreMutation.isPending;

  // ── Filter change helpers (reset page to 1) ───────────────────────────────
  const onFilter = (setter) => (val) => { setter(val); setPage(1); };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 max-w-7xl mx-auto">

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Products</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {total > 0 ? `${total} product${total !== 1 ? "s" : ""} in catalog` : "Manage your beauty catalog"}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white
                     bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500
                     rounded-xl shadow-lg shadow-rose-500/20 transition-all active:scale-[0.98]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </button>
      </div>

      {/* ── Toolbar ───────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={handleSearch} />

        <FilterSelect value={category} onChange={onFilter(setCategory)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </FilterSelect>

        <FilterSelect value={brand} onChange={onFilter(setBrand)}>
          <option value="">All brands</option>
          {brands.map((b) => (
            <option key={b._id} value={b._id}>{b.name}</option>
          ))}
        </FilterSelect>

        <FilterSelect value={isActive} onChange={onFilter(setIsActive)}>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
          <option value="">All</option>
        </FilterSelect>

        {/* Low-stock toggle */}
        <button
          onClick={() => { setLowStock((v) => !v); setPage(1); }}
          className={[
            "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all",
            lowStock
              ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
              : "bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300",
          ].join(" ")}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Low Stock
        </button>

        {/* Refresh */}
        <button
          onClick={() => refetch()}
          className="p-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-400
                     hover:text-slate-200 hover:border-slate-600 transition-colors ml-auto"
          title="Refresh"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* ── Error banner ──────────────────────────────────────────────────── */}
      {isError && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-400">
            Failed to load products.{" "}
            <button onClick={() => refetch()} className="underline hover:no-underline">
              Try again
            </button>
          </p>
        </div>
      )}

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <ProductTable
        products={products}
        total={total}
        page={page}
        pages={pages}
        limit={limit}
        loading={isLoading}
        onEdit={openEdit}
        onDelete={handleDelete}
        onRestore={handleRestore}
        onPageChange={setPage}
        onLimitChange={(l) => { setLimit(l); setPage(1); }}
      />

      {/* ── Slide-over: Create / Edit ─────────────────────────────────────── */}
      <SlideOver
        open={panelOpen}
        onClose={closePanel}
        title={editProduct ? "Edit Product" : "New Product"}
      >
        {/* Mount only when open to reset form state cleanly */}
        {panelOpen && (
          <ProductForm
            product={editProduct}
            categories={categories}
            brands={brands}
            suppliers={suppliers}
            onSuccess={handleFormSuccess}
            onCancel={closePanel}
          />
        )}
      </SlideOver>

      {/* ── Confirm: Deactivate ───────────────────────────────────────────── */}
      <ConfirmDialog
        open={confirmTarget?.action === "delete"}
        onClose={closeConfirm}
        onConfirm={handleConfirm}
        loading={confirmLoading}
        danger
        title="Deactivate product?"
        message={`"${confirmTarget?.product?.name}" will be hidden from the catalog but not deleted. You can restore it later.`}
        confirmLabel="Deactivate"
      />

      {/* ── Confirm: Restore ──────────────────────────────────────────────── */}
      <ConfirmDialog
        open={confirmTarget?.action === "restore"}
        onClose={closeConfirm}
        onConfirm={handleConfirm}
        loading={confirmLoading}
        danger={false}
        title="Restore product?"
        message={`"${confirmTarget?.product?.name}" will become active and visible in the catalog again.`}
        confirmLabel="Restore"
      />
    </div>
  );
}