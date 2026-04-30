import { useState } from "react";
import { useOrders, useUpdateOrderStatus, useDeleteOrder } from "../hooks/useOrders";
import OrderForm from "../components/order/OrderForm";
import { formatDate, formatCurrency } from "../utils/formatDate";

// ─── Status config ─────────────────────────────────────────────────────────────
const STATUS = {
  Pending:   { color: "bg-amber-500/15 text-amber-400 border-amber-500/20",   dot: "bg-amber-400" },
  Accepted:  { color: "bg-blue-500/15 text-blue-400 border-blue-500/20",      dot: "bg-blue-400" },
  Received:  { color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-400" },
  Cancelled: { color: "bg-red-500/15 text-red-400 border-red-500/20",         dot: "bg-red-400" },
};

const TRANSITIONS = {
  Pending:  ["Accepted", "Cancelled"],
  Accepted: ["Received", "Cancelled"],
  Received: [],
  Cancelled: [],
};

const StatusBadge = ({ status }) => {
  const s = STATUS[status] ?? STATUS.Pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
};

// ─── Modal shell ───────────────────────────────────────────────────────────────
const ModalShell = ({ title, size = "max-w-2xl", onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
    <div className={`w-full ${size} bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col`}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 flex-shrink-0">
        <h2 className="text-base font-semibold text-slate-100">{title}</h2>
        <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
    </div>
  </div>
);

// ─── Order Detail view ─────────────────────────────────────────────────────────
const OrderDetail = ({ order, onClose, onStatusChange, statusMutation }) => {
  const transitions = TRANSITIONS[order.status] ?? [];
  const [serverError, setServerError] = useState("");

  const handleStatus = (status) => {
    setServerError("");
    onStatusChange(
      { id: order._id, status },
      {
        onSuccess: onClose,
        onError: (err) => setServerError(err?.response?.data?.message ?? err?.message ?? "Failed."),
      }
    );
  };

  return (
    <div className="space-y-5">
      {serverError && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p className="text-sm text-red-400">{serverError}</p>
        </div>
      )}

      {/* Header info */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Order Number", value: order.orderNumber },
          { label: "Status",       value: <StatusBadge status={order.status} /> },
          { label: "Supplier",     value: order.supplierName },
          { label: "Created",      value: formatDate(order.createdAt) },
          { label: "Total Amount", value: <span className="text-rose-400 font-bold">{formatCurrency(order.totalAmount)}</span> },
          { label: "Items",        value: `${order.items?.length ?? 0} product${order.items?.length !== 1 ? "s" : ""}` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/40">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
            <div className="text-sm text-slate-200 font-medium">{value}</div>
          </div>
        ))}
      </div>

      {/* Items table */}
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Order Items</p>
        <div className="rounded-xl border border-slate-700/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/60 border-b border-slate-700/50">
              <tr>
                {["Product", "Qty", "Unit Cost", "Received", "Subtotal"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {order.items?.map((item, i) => (
                <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 text-slate-200 font-medium">{item.productName}</td>
                  <td className="px-4 py-3 text-slate-300">{item.quantity}</td>
                  <td className="px-4 py-3 text-slate-300">{formatCurrency(item.unitCost)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold ${item.receivedQuantity >= item.quantity ? "text-emerald-400" : "text-slate-500"}`}>
                      {item.receivedQuantity}/{item.quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-200 font-semibold">{formatCurrency(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-800/40 border-t border-slate-700/50">
              <tr>
                <td colSpan={4} className="px-4 py-2.5 text-xs font-bold text-slate-400 text-right uppercase tracking-widest">Total</td>
                <td className="px-4 py-2.5 text-sm font-bold text-rose-400">{formatCurrency(order.totalAmount)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Status transition buttons */}
      {transitions.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-700/50">
          <p className="w-full text-xs text-slate-500 mb-1">Update status:</p>
          {transitions.map((status) => {
            const isCancel   = status === "Cancelled";
            const isReceived = status === "Received";
            return (
              <button key={status} onClick={() => handleStatus(status)}
                disabled={statusMutation.isPending}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all disabled:opacity-50 ${
                  isCancel   ? "bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25"
                  : isReceived ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                  : "bg-blue-500/15 text-blue-400 border border-blue-500/30 hover:bg-blue-500/25"
                }`}>
                {statusMutation.isPending
                  ? <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  : null
                }
                Mark as {status}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Main Orders Page ──────────────────────────────────────────────────────────
export default function Orders() {
  const [params, setParams] = useState({ page: 1, limit: 20 });
  const { data, isLoading, error, refetch } = useOrders(params);
  const statusMutation = useUpdateOrderStatus();
  const deleteMutation = useDeleteOrder();

  const orders    = data?.data              ?? [];
  const total     = data?.pagination?.total ?? 0;
  const pages     = Math.ceil(total / (params.limit ?? 20));

  const [createOpen, setCreateOpen]   = useState(false);
  const [detailOrder, setDetailOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleStatusFilter = (s) => {
    setStatusFilter(s);
    setParams((p) => ({ ...p, status: s || undefined, page: 1 }));
  };

  const handleStatusChange = (payload, callbacks) => {
    statusMutation.mutate(payload, {
      ...callbacks,
      onSuccess: (...args) => {
        setDetailOrder(null);
        callbacks?.onSuccess?.(...args);
      },
    });
  };

  const statuses = ["Pending", "Accepted", "Received", "Cancelled"];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Purchase Orders</h1>
          <p className="text-sm text-slate-500 mt-0.5">{total} order{total !== 1 ? "s" : ""} total</p>
        </div>
        <button onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 rounded-xl shadow-lg shadow-rose-500/25 transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
          </svg>
          New Order
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {["", ...statuses].map((s) => (
          <button key={s || "all"} onClick={() => handleStatusFilter(s)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              statusFilter === s
                ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                : "bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600"
            }`}>
            {s || "All Orders"}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p className="text-sm text-red-400">Failed to load orders. <button onClick={() => refetch()} className="underline">Retry</button></p>
        </div>
      )}

      {/* Table */}
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl overflow-hidden">
        {/* Head */}
        <div className="grid grid-cols-12 px-5 py-3 border-b border-slate-700/50 bg-slate-800/60">
          {[
            { label: "Order #",   cls: "col-span-2" },
            { label: "Supplier",  cls: "col-span-2" },
            { label: "Items",     cls: "col-span-1 text-center" },
            { label: "Total",     cls: "col-span-2" },
            { label: "Status",    cls: "col-span-2" },
            { label: "Date",      cls: "col-span-2" },
            { label: "Actions",   cls: "col-span-1 text-right" },
          ].map(({ label, cls }) => (
            <div key={label} className={`${cls} text-xs font-semibold text-slate-400 uppercase tracking-widest`}>{label}</div>
          ))}
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="divide-y divide-slate-800/60">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="grid grid-cols-12 px-5 py-4 items-center gap-2">
                <div className="col-span-2"><div className="h-4 bg-slate-800 rounded animate-pulse w-28"/></div>
                <div className="col-span-2"><div className="h-4 bg-slate-800 rounded animate-pulse w-24"/></div>
                <div className="col-span-1 flex justify-center"><div className="h-5 w-6 bg-slate-800 rounded animate-pulse"/></div>
                <div className="col-span-2"><div className="h-4 bg-slate-800 rounded animate-pulse w-20"/></div>
                <div className="col-span-2"><div className="h-5 bg-slate-800 rounded-full animate-pulse w-20"/></div>
                <div className="col-span-2"><div className="h-4 bg-slate-800 rounded animate-pulse w-20"/></div>
                <div className="col-span-1 flex justify-end"><div className="h-7 w-7 bg-slate-800 rounded animate-pulse"/></div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center">
              <svg className="w-7 h-7 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
            </div>
            <p className="text-sm text-slate-400 font-medium">
              {statusFilter ? `No ${statusFilter} orders` : "No orders yet"}
            </p>
            {!statusFilter && (
              <button onClick={() => setCreateOpen(true)} className="text-xs text-rose-400 hover:text-rose-300 underline">
                Create your first order
              </button>
            )}
          </div>
        )}

        {/* Rows */}
        {!isLoading && orders.length > 0 && (
          <div className="divide-y divide-slate-800/50">
            {orders.map((order) => (
              <div key={order._id}
                className="grid grid-cols-12 px-5 py-4 items-center hover:bg-slate-800/30 transition-colors group">

                {/* Order number */}
                <div className="col-span-2">
                  <button onClick={() => setDetailOrder(order)}
                    className="text-sm font-mono font-semibold text-rose-400 hover:text-rose-300 transition-colors text-left">
                    {order.orderNumber}
                  </button>
                </div>

                {/* Supplier */}
                <div className="col-span-2 min-w-0">
                  <p className="text-sm text-slate-200 truncate">{order.supplierName}</p>
                  <p className="text-xs text-slate-500 truncate">{order.supplierEmail}</p>
                </div>

                {/* Item count */}
                <div className="col-span-1 flex justify-center">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-xs font-bold text-slate-400 flex items-center justify-center border border-slate-700">
                    {order.items?.length ?? 0}
                  </span>
                </div>

                {/* Total */}
                <div className="col-span-2">
                  <p className="text-sm font-semibold text-slate-100">{formatCurrency(order.totalAmount)}</p>
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <StatusBadge status={order.status} />
                </div>

                {/* Date */}
                <div className="col-span-2">
                  <p className="text-xs text-slate-400">{formatDate(order.createdAt)}</p>
                </div>

                {/* Actions */}
                <div className="col-span-1 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setDetailOrder(order)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors" title="View details">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  </button>
                  {order.status === "Cancelled" && (
                    <button onClick={() => setDeleteTarget(order)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Delete">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer pagination */}
        {!isLoading && orders.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-800/60 bg-slate-800/30 flex items-center justify-between">
            <p className="text-xs text-slate-600">Showing {orders.length} of {total} orders</p>
            {pages > 1 && (
              <div className="flex items-center gap-2">
                <button onClick={() => setParams((p) => ({ ...p, page: p.page - 1 }))} disabled={params.page === 1}
                  className="px-3 py-1 text-xs text-slate-400 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 disabled:opacity-40 transition-colors">← Prev</button>
                <span className="text-xs text-slate-500">{params.page} / {pages}</span>
                <button onClick={() => setParams((p) => ({ ...p, page: p.page + 1 }))} disabled={params.page === pages}
                  className="px-3 py-1 text-xs text-slate-400 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 disabled:opacity-40 transition-colors">Next →</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create modal */}
      {createOpen && (
        <ModalShell title="New Purchase Order" onClose={() => setCreateOpen(false)}>
          <OrderForm onSuccess={() => setCreateOpen(false)} onCancel={() => setCreateOpen(false)} />
        </ModalShell>
      )}

      {/* Detail / status modal */}
      {detailOrder && (
        <ModalShell title={`Order ${detailOrder.orderNumber}`} size="max-w-3xl" onClose={() => setDetailOrder(null)}>
          <OrderDetail order={detailOrder} onClose={() => setDetailOrder(null)}
            onStatusChange={handleStatusChange} statusMutation={statusMutation} />
        </ModalShell>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Delete Order</h3>
                <p className="text-xs text-slate-500">This cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-slate-400">
              Delete order <span className="font-mono font-semibold text-slate-200">{deleteTarget.orderNumber}</span>?
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm text-slate-400 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">Cancel</button>
              <button disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deleteTarget._id, { onSuccess: () => setDeleteTarget(null) })}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg disabled:opacity-50 flex items-center gap-2">
                {deleteMutation.isPending
                  ? <><svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Deleting…</>
                  : "Delete"
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}