import { formatCurrency, formatDate } from "../../utils/FormatDate";

// ─── Status config ─────────────────────────────────────────────────────────
const STATUS = {
  completed: { cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-400", label: "Completed" },
  cancelled: { cls: "bg-red-500/15 text-red-400 border-red-500/20",             dot: "bg-red-400",    label: "Cancelled" },
};

const StatusBadge = ({ status }) => {
  const s = STATUS[status] ?? STATUS.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
      {s.label}
    </span>
  );
};

const Th = ({ children, className = "" }) => (
  <th className={`px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap ${className}`}>
    {children}
  </th>
);

const SkeletonRow = () => (
  <tr className="border-b border-slate-800/60">
    {[100, 120, 40, 90, 80, 80, 90, 60].map((w, i) => (
      <td key={i} className="px-4 py-3.5">
        <div className="h-3.5 bg-slate-800 rounded animate-pulse" style={{ width: w }} />
      </td>
    ))}
  </tr>
);

const Pagination = ({ page, pages, total, limit, onPageChange, onLimitChange }) => {
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to   = Math.min(page * limit, total);
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-t border-slate-800/60">
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
          .reduce((acc, p, i, arr) => { if (i > 0 && p - arr[i-1] > 1) acc.push("…"); acc.push(p); return acc; }, [])
          .map((p, i) => p === "…"
            ? <span key={`e${i}`} className="text-slate-600 text-xs px-1">…</span>
            : <button key={p} onClick={() => onPageChange(p)}
                className={`min-w-[30px] px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${p === page ? "bg-rose-500/20 border-rose-500/40 text-rose-300" : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600"}`}>
                {p}
              </button>
          )}
        <button disabled={page >= pages} onClick={() => onPageChange(page + 1)}
          className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 text-xs hover:text-slate-200 hover:border-slate-600 disabled:opacity-40 disabled:pointer-events-none transition-colors">
          Next →
        </button>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────
export default function SaleTable({
  sales = [], total = 0, page = 1, pages = 1, limit = 10,
  loading = false, onView, onCancel, onPageChange, onLimitChange,
}) {
  return (
    <div className="bg-slate-900 border border-slate-700/50 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="border-b border-slate-800">
            <tr>
              <Th>Sale #</Th>
              <Th className="text-center">Items</Th>
              <Th>Total</Th>
              <Th>Status</Th>
              <Th>Date</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
            ) : sales.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                      <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                      </svg>
                    </div>
                    <p className="text-sm text-slate-400 font-medium">No sales found</p>
                    <p className="text-xs text-slate-600">Try adjusting your filters or record a new sale</p>
                  </div>
                </td>
              </tr>
            ) : sales.map((sale) => (
              <tr key={sale._id}
                className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors group">
                {/* Sale # */}
                <td className="px-4 py-3.5">
                  <button onClick={() => onView?.(sale)}
                    className="font-mono text-sm font-semibold text-rose-400 hover:text-rose-300 transition-colors">
                    {sale.saleNumber ?? sale._id?.slice(-6)?.toUpperCase()}
                  </button>
                </td>
                
                {/* Items */}
                <td className="px-4 py-3.5 text-center">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-slate-400">
                    {sale.items?.length ?? 0}
                  </span>
                </td>
                {/* Total */}
                <td className="px-4 py-3.5">
                  <span className="text-sm font-semibold text-slate-100 whitespace-nowrap">
                    {formatCurrency(sale.totalAmount)}
                  </span>
                </td>
                
                {/* Status */}
                <td className="px-4 py-3.5">
                  <StatusBadge status={sale.status} />
                </td>
                {/* Date */}
                <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                  {formatDate(sale.createdAt)}
                </td>
                {/* Actions */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onView?.(sale)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-700 transition-colors" title="View details">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    </button>
                    {sale.status !== "cancelled" && (
                      <button onClick={() => onCancel?.(sale)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Cancel sale">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!loading && total > 0 && (
        <Pagination page={page} pages={pages} total={total} limit={limit}
          onPageChange={onPageChange} onLimitChange={onLimitChange} />
      )}
    </div>
  );
}