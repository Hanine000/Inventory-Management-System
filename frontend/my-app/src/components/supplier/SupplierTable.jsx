import { formatDate } from "../../utils/FormatDate";

// ─── Status badge ──────────────────────────────────────────────────────────
const StatusBadge = ({ isActive }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${
    isActive
      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
      : "bg-red-500/15 text-red-400 border-red-500/20"
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-400" : "bg-red-400"}`} />
    {isActive ? "Active" : "Inactive"}
  </span>
);

const Th = ({ children, className = "" }) => (
  <th className={`px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap ${className}`}>
    {children}
  </th>
);

const SkeletonRow = () => (
  <tr className="border-b border-slate-800/60">
    {[160, 140, 120, 70, 80, 60].map((w, i) => (
      <td key={i} className="px-4 py-4">
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
        <span className="text-slate-300 font-medium">{total}</span> suppliers
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
          .map((p, i) => p === "…"
            ? <span key={`e${i}`} className="text-slate-600 text-xs px-1">…</span>
            : <button key={p} onClick={() => onPageChange(p)}
                className={`min-w-[30px] px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  p === page
                    ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600"
                }`}>
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
export default function SupplierTable({
  suppliers = [], total = 0, page = 1, pages = 1, limit = 10,
  loading = false, onView, onEdit, onDeactivate, onRestore,
  onPageChange, onLimitChange,
}) {
  return (
    <div className="bg-slate-900 border border-slate-700/50 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead className="border-b border-slate-800">
            <tr>
              <Th>Supplier</Th>
              <Th>Email</Th>
              <Th>Phone</Th>
              <Th>Status</Th>
              <Th>Added</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
            ) : suppliers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                      <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                    <p className="text-sm text-slate-400 font-medium">No suppliers found</p>
                    <p className="text-xs text-slate-600">Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
            ) : (
              suppliers.map((s) => (
                <tr key={s._id}
                  className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors group">

                  {/* Name + avatar */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-violet-400">
                          {s.name[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <button onClick={() => onView?.(s)}
                          className="text-sm font-semibold text-slate-200 hover:text-rose-400 transition-colors truncate block text-left max-w-[160px]">
                          {s.name}
                        </button>
                        {s.address && (
                          <p className="text-xs text-slate-500 truncate max-w-[160px] mt-0.5">{s.address}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-4 py-4 max-w-[180px]">
                    {s.email
                      ? <p className="text-sm text-slate-300 truncate">{s.email}</p>
                      : <p className="text-xs text-slate-600 italic">No email</p>
                    }
                  </td>

                  {/* Phone */}
                  <td className="px-4 py-4">
                    {s.phone
                      ? <p className="text-sm text-slate-300 whitespace-nowrap">{s.phone}</p>
                      : <p className="text-xs text-slate-600 italic">—</p>
                    }
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <StatusBadge isActive={s.isActive} />
                  </td>

                  {/* Date */}
                  <td className="px-4 py-4 text-xs text-slate-500 whitespace-nowrap">
                    {formatDate(s.createdAt)}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* View */}
                      <button onClick={() => onView?.(s)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-700 transition-colors"
                        title="View details">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                      </button>
                      {/* Edit */}
                      <button onClick={() => onEdit?.(s)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                        title="Edit">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </button>
                      {/* Deactivate / Restore */}
                      {s.isActive ? (
                        <button onClick={() => onDeactivate?.(s)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Deactivate">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                          </svg>
                        </button>
                      ) : (
                        <button onClick={() => onRestore?.(s)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                          title="Restore">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
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

      {!loading && total > 0 && (
        <Pagination
          page={page} pages={pages} total={total} limit={limit}
          onPageChange={onPageChange} onLimitChange={onLimitChange}
        />
      )}
    </div>
  );
}