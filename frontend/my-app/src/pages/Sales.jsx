import { useState, useCallback } from "react";
import SaleForm from "../components/sale/SaleForm";
import { useSales, useCancelSale } from "../hooks/useSales";
import { useProducts } from "../hooks/useProducts";
import { formatCurrency, formatDateTime, formatRelative } from "../utils/formatDate";

// ─── Shared micro-UI (same patterns as Products.jsx) ─────────────────────────

/** Pill badge */
const Badge = ({ children, color }) => {
  const colors = {
    green: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    red:   "bg-red-500/15    text-red-400    border-red-500/20",
    slate: "bg-slate-700/60  text-slate-400  border-slate-600/40",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${colors[color]}`}>
      {children}
    </span>
  );
};

const statusBadge = (status) =>
  status === "completed" ? <Badge color="green">Completed</Badge>
  : status === "cancelled" ? <Badge color="red">Cancelled</Badge>
  : <Badge color="slate">{status}</Badge>;

/** Slide-over panel */
const SlideOver = ({ open, onClose, title, wide = false, children }) => (
  <>
    {open && (
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
    )}
    <div className={[
      "fixed top-0 right-0 z-50 h-full bg-slate-950 border-l border-slate-800",
      "shadow-2xl flex flex-col transition-transform duration-300 ease-in-out w-full",
      wide ? "max-w-2xl" : "max-w-xl",
      open ? "translate-x-0" : "translate-x-full",
    ].join(" ")}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 flex-shrink-0">
        <h2 className="text-base font-semibold text-slate-100">{title}</h2>
        <button onClick={onClose}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
    </div>
  </>
);

/** Confirm cancel dialog */
const ConfirmDialog = ({ open, onClose, onConfirm, sale, loading }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl p-6 space-y-4">
        <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center mx-auto">
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="text-center">
          <h3 className="text-sm font-semibold text-slate-100">Cancel sale?</h3>
          <p className="text-xs text-slate-500 mt-1">
            <span className="text-slate-300 font-medium">{sale?.saleNumber}</span> will be
            marked as cancelled and all stock will be reverted. This cannot be undone.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-slate-400 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
            Keep it
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-400 rounded-lg transition-all disabled:opacity-50">
            {loading ? "Cancelling…" : "Cancel Sale"}
          </button>
        </div>
      </div>
    </div>
  );
};

/** Table header cell */
const Th = ({ children, className = "" }) => (
  <th className={`px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap ${className}`}>
    {children}
  </th>
);

/** Skeleton row */
const SkeletonRow = () => (
  <tr className="border-b border-slate-800/60">
    {[120, 80, 160, 100, 80, 60].map((w, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-3.5 bg-slate-800 rounded animate-pulse" style={{ width: w }} />
      </td>
    ))}
  </tr>
);

/** Filter select */
const FilterSelect = ({ value, onChange, children }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)}
    className="bg-slate-800/60 border border-slate-700 hover:border-slate-600 text-slate-300 text-sm
               rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500/20
               focus:border-rose-500/50 transition-all">
    {children}
  </select>
);

/** Pagination (identical logic to ProductTable) */
const Pagination = ({ page, pages, total, limit, onPageChange, onLimitChange }) => {
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to   = Math.min(page * limit, total);
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-800/60">
      <p className="text-xs text-slate-500 order-2 sm:order-1">
        Showing <span className="text-slate-300 font-medium">{from}–{to}</span> of{" "}
        <span className="text-slate-300 font-medium">{total}</span> sales
      </p>
      <div className="flex items-center gap-2 order-1 sm:order-2">
        <select value={limit} onChange={(e) => onLimitChange(Number(e.target.value))}
          className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-rose-500/40">
          {[10, 20, 50].map((n) => <option key={n} value={n}>{n} / page</option>)}
        </select>
        <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}
          className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 text-xs hover:text-slate-200 hover:border-slate-600 disabled:opacity-40 disabled:pointer-events-none transition-colors">
          ← Prev
        </button>
        {Array.from({ length: pages }, (_, i) => i + 1)
          .filter((p) => pages <= 5 || p === 1 || p === pages || Math.abs(p - page) <= 1)
          .reduce((acc, p, i, arr) => {
            if (i > 0 && p - arr[i - 1] > 1) acc.push("…");
            acc.push(p);
            return acc;
          }, [])
          .map((p, i) =>
            p === "…" ? (
              <span key={`e-${i}`} className="text-slate-600 text-xs px-1">…</span>
            ) : (
              <button key={p} onClick={() => onPageChange(p)}
                className={["min-w-[30px] px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                  p === page ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                             : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600",
                ].join(" ")}>
                {p}
              </button>
            )
          )}
        <button disabled={page >= pages} onClick={() => onPageChange(page + 1)}
          className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 text-xs hover:text-slate-200 hover:border-slate-600 disabled:opacity-40 disabled:pointer-events-none transition-colors">
          Next →
        </button>
      </div>
    </div>
  );
};

// ─── Sale Detail Drawer ───────────────────────────────────────────────────────

const SaleDetail = ({ sale }) => {
  if (!sale) return null;
  return (
    <div className="space-y-5">
      {/* Header info */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Sale Number",  value: sale.saleNumber },
          { label: "Status",       value: statusBadge(sale.status) },
          { label: "Date",         value: formatDateTime(sale.createdAt) },
          { label: "Total Amount", value: <span className="text-rose-400 font-bold">{formatCurrency(sale.totalAmount, "DZD", "fr-DZ")}</span> },
        ].map(({ label, value }) => (
          <div key={label} className="bg-slate-800/50 border border-slate-700/40 rounded-xl px-3 py-2.5">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
            <div className="text-sm text-slate-200">{value}</div>
          </div>
        ))}
      </div>

      {/* Items */}
      <div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
          Items ({sale.items?.length ?? 0})
        </p>
        <div className="space-y-2">
          {sale.items?.map((item, i) => (
            <div key={i}
              className="flex items-center gap-3 bg-slate-800/40 border border-slate-700/40 rounded-xl px-3 py-2.5">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-100 truncate">
                  {item.productName ?? item.product?.name ?? "—"}
                </p>
                {item.product?.sku && (
                  <p className="text-[11px] text-slate-500 mt-0.5">SKU: {item.product.sku}</p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-slate-400">
                  {formatCurrency(item.unitPrice, "DZD", "fr-DZ")} × {item.quantity}
                </p>
                <p className="text-sm font-semibold text-slate-200 mt-0.5">
                  {formatCurrency(item.subtotal, "DZD", "fr-DZ")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total strip */}
      <div className="flex items-center justify-between bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3">
        <span className="text-sm font-semibold text-slate-200">Total Amount</span>
        <span className="text-lg font-bold text-rose-400">
          {formatCurrency(sale.totalAmount, "DZD", "fr-DZ")}
        </span>
      </div>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Sales() {
  // ── Filters / pagination ─────────────────────────────────────────────────
  const [status,    setStatus]    = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate,   setEndDate]   = useState("");
  const [page,      setPage]      = useState(1);
  const [limit,     setLimit]     = useState(10);

  // ── Panel / dialog state ──────────────────────────────────────────────────
  const [createOpen,   setCreateOpen]   = useState(false);
  const [detailSale,   setDetailSale]   = useState(null);   // sale to show in drawer
  const [cancelTarget, setCancelTarget] = useState(null);   // sale to cancel

  // ── Queries ───────────────────────────────────────────────────────────────
  const params = {
    ...(status    && { status }),
    ...(startDate && { startDate }),
    ...(endDate   && { endDate }),
    page,
    limit,
  };

  const { data, isLoading, isError, refetch } = useSales(params);

  const sales = data?.data  ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;

  // Active products for SaleForm (all pages, no pagination — we need the full list)
  const { data: productsData } = useProducts({ isActive: "true", limit: 200 });
  const activeProducts = productsData?.data ?? [];

  // ── Mutation ──────────────────────────────────────────────────────────────
  const cancelMutation = useCancelSale();

  // ── Handlers ──────────────────────────────────────────────────────────────
  const onFilter = (setter) => (val) => { setter(val); setPage(1); };

  const handleFormSuccess = () => {
    setCreateOpen(false);
    refetch();
  };

  const handleCancel = useCallback(() => {
    if (!cancelTarget) return;
    cancelMutation.mutate(cancelTarget._id, {
      onSuccess: () => {
        setCancelTarget(null);
        // If the detail drawer is showing this sale, close it
        if (detailSale?._id === cancelTarget._id) setDetailSale(null);
        refetch();
      },
      onError: () => setCancelTarget(null),
    });
  }, [cancelTarget, cancelMutation, detailSale, refetch]);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 max-w-7xl mx-auto">

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Sales</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {total > 0 ? `${total} sale${total !== 1 ? "s" : ""} recorded` : "Record and track your sales"}
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white
                     bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500
                     rounded-xl shadow-lg shadow-rose-500/20 transition-all active:scale-[0.98]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Record Sale
        </button>
      </div>

      {/* ── Toolbar ───────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status */}
        <FilterSelect value={status} onChange={onFilter(setStatus)}>
          <option value="">All statuses</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </FilterSelect>

        {/* Date range */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
            className="bg-slate-800/60 border border-slate-700 hover:border-slate-600 text-slate-300 text-sm
                       rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500/20
                       focus:border-rose-500/50 transition-all"
          />
          <span className="text-slate-600 text-sm">→</span>
          <input
            type="date"
            value={endDate}
            min={startDate}
            onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
            className="bg-slate-800/60 border border-slate-700 hover:border-slate-600 text-slate-300 text-sm
                       rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500/20
                       focus:border-rose-500/50 transition-all"
          />
          {(startDate || endDate) && (
            <button
              onClick={() => { setStartDate(""); setEndDate(""); setPage(1); }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition-colors"
              title="Clear date filter"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

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
            Failed to load sales.{" "}
            <button onClick={() => refetch()} className="underline hover:no-underline">Try again</button>
          </p>
        </div>
      )}

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="border-b border-slate-800">
              <tr>
                <Th>Sale #</Th>
                <Th>Status</Th>
                <Th>Items</Th>
                <Th>Total</Th>
                <Th>Date</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)

              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                        <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-sm text-slate-400 font-medium">No sales found</p>
                      <p className="text-xs text-slate-600">Adjust filters or record a new sale</p>
                    </div>
                  </td>
                </tr>

              ) : (
                sales.map((sale) => (
                  <tr
                    key={sale._id}
                    className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors duration-100 group"
                  >
                    {/* Sale number */}
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setDetailSale(sale)}
                        className="text-sm font-semibold text-rose-400 hover:text-rose-300 transition-colors font-mono"
                      >
                        {sale.saleNumber}
                      </button>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      {statusBadge(sale.status)}
                    </td>

                    {/* Items summary */}
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-300">
                        {sale.items?.length ?? 0} product{(sale.items?.length ?? 0) !== 1 ? "s" : ""}
                      </p>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        {sale.items?.reduce((s, i) => s + i.quantity, 0) ?? 0} units total
                      </p>
                    </td>

                    {/* Total */}
                    <td className="px-4 py-3 text-sm font-semibold text-slate-100 whitespace-nowrap">
                      {formatCurrency(sale.totalAmount, "DZD", "fr-DZ")}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {formatRelative(sale.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        {/* View detail */}
                        <button
                          type="button"
                          title="View detail"
                          onClick={() => setDetailSale(sale)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>

                        {/* Cancel — only for completed sales */}
                        {sale.status === "completed" && (
                          <button
                            type="button"
                            title="Cancel sale"
                            onClick={() => setCancelTarget(sale)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && total > 0 && (
          <Pagination
            page={page}
            pages={pages}
            total={total}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={(l) => { setLimit(l); setPage(1); }}
          />
        )}
      </div>

      {/* ── Slide-over: Record Sale ────────────────────────────────────────── */}
      <SlideOver
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Record New Sale"
      >
        {createOpen && (
          <SaleForm
            products={activeProducts}
            onSuccess={handleFormSuccess}
            onCancel={() => setCreateOpen(false)}
          />
        )}
      </SlideOver>

      {/* ── Slide-over: Sale Detail ────────────────────────────────────────── */}
      <SlideOver
        open={!!detailSale}
        onClose={() => setDetailSale(null)}
        title={detailSale?.saleNumber ?? "Sale Detail"}
      >
        <SaleDetail sale={detailSale} />

        {/* Cancel button inside the detail drawer too */}
        {detailSale?.status === "completed" && (
          <div className="mt-6 pt-4 border-t border-slate-800">
            <button
              onClick={() => { setCancelTarget(detailSale); setDetailSale(null); }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-400
                         bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl
                         transition-colors w-full justify-center"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              Cancel this sale
            </button>
          </div>
        )}
      </SlideOver>

      {/* ── Confirm: Cancel Sale ──────────────────────────────────────────── */}
      <ConfirmDialog
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        sale={cancelTarget}
        loading={cancelMutation.isPending}
      />
    </div>
  );
}