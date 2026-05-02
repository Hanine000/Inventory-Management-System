import { formatCurrency, formatDate } from "../../utils/FormatDate";

// ─── Status config ─────────────────────────────────────────────────────────
const STATUS = {
  Pending:   { cls: "bg-amber-500/15 text-amber-400 border-amber-500/20",      dot: "bg-amber-400" },
  Accepted:  { cls: "bg-blue-500/15 text-blue-400 border-blue-500/20",         dot: "bg-blue-400" },
  Received:  { cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-400" },
  Cancelled: { cls: "bg-red-500/15 text-red-400 border-red-500/20",            dot: "bg-red-400" },
};

const StatusBadge = ({ status }) => {
  const s = STATUS[status] ?? STATUS.Pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
      {status}
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
    {[140, 120, 40, 90, 100, 90, 80].map((w, i) => (
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
        <span className="text-slate-300 font-medium">{total}</span> orders
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
export default function OrderTable({
  orders = [], total = 0, page = 1, pages = 1, limit = 20,
  loading = false, onView, onDelete, onPageChange, onLimitChange,
}) {
  return (
    <div className="bg-slate-900 border border-slate-700/50 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead className="border-b border-slate-800">
            <tr>
              <Th>Order #</Th>
              <Th>Supplier</Th>
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
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                      <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                      </svg>
                    </div>
                    <p className="text-sm text-slate-400 font-medium">No orders found</p>
                    <p className="text-xs text-slate-600">Try adjusting your filters</p>
                  </div>
                </td>
              </tr>
            ) : orders.map((order) => (
              <tr key={order._id}
                className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors group">
                {/* Order # */}
                <td className="px-4 py-3.5">
                  <button onClick={() => onView?.(order)}
                    className="font-mono text-sm font-semibold text-rose-400 hover:text-rose-300 transition-colors">
                    {order.orderNumber}
                  </button>
                </td>
                {/* Supplier */}
                <td className="px-4 py-3.5 max-w-[160px]">
                  <p className="text-sm text-slate-200 truncate font-medium">{order.supplierName}</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{order.supplierEmail}</p>
                </td>
                {/* Items count */}
                <td className="px-4 py-3.5 text-center">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-slate-400">
                    {order.items?.length ?? 0}
                  </span>
                </td>
                {/* Total */}
                <td className="px-4 py-3.5">
                  <span className="text-sm font-semibold text-slate-100 whitespace-nowrap">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </td>
                {/* Status */}
                <td className="px-4 py-3.5">
                  <StatusBadge status={order.status} />
                </td>
                {/* Date */}
                <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                  {formatDate(order.createdAt)}
                </td>
                {/* Actions */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onView?.(order)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-700 transition-colors" title="View details">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    </button>
                    {order.status === "Cancelled" && (
                      <button onClick={() => onDelete?.(order)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Delete">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
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