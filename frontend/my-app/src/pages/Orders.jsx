import { useState } from "react";
import { useOrders, useUpdateOrderStatus, useDeleteOrder } from "../hooks/useOrders";
import OrderTable from "../components/order/OrderTable";
import OrderForm from "../components/order/OrderForm";
import { formatCurrency, formatDate } from "../utils/FormatDate";

// ─── Status config ─────────────────────────────────────────────────────────
const TRANSITIONS = {
  Pending:   ["Cancelled"],
  Accepted:  ["Received", "Cancelled"],
  Received:  [],
  Cancelled: [],
};

const STATUS_STYLE = {
  Pending:   "bg-amber-500/15 text-amber-400 border-amber-500/20",
  Accepted:  "bg-blue-500/15 text-blue-400 border-blue-500/20",
  Received:  "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  Cancelled: "bg-red-500/15 text-red-400 border-red-500/20",
};

// ─── Modal shell ───────────────────────────────────────────────────────────
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

// ─── Order Detail ──────────────────────────────────────────────────────────
const OrderDetail = ({ order, onClose, statusMutation }) => {
  const [serverError, setServerError] = useState("");
  const transitions = TRANSITIONS[order.status] ?? [];

  const handleStatus = (status) => {
    setServerError("");
    statusMutation.mutate({ id: order._id, status }, {
      onSuccess: onClose,
      onError: (err) => setServerError(err?.response?.data?.message ?? err?.message ?? "Failed."),
    });
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

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Order Number", value: order.orderNumber },
          { label: "Status",       value: <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_STYLE[order.status]}`}>{order.status}</span> },
          { label: "Supplier",     value: order.supplierName },
          { label: "Email",        value: order.supplierEmail },
          { label: "Total",        value: <span className="text-rose-400 font-bold">{formatCurrency(order.totalAmount)}</span> },
          { label: "Created",      value: formatDate(order.createdAt) },
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
                      {item.receivedQuantity ?? 0}/{item.quantity}
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

      {/* Status transitions */}
      {transitions.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-700/50">
          <p className="w-full text-xs text-slate-500 mb-1">Update status:</p>
          {transitions.map((status) => {
            const isCancel   = status === "Cancelled";
            const isReceived = status === "Received";
            return (
              <button key={status} onClick={() => handleStatus(status)} disabled={statusMutation.isPending}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all disabled:opacity-50 border ${
                  isCancel   ? "bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/25"
                  : isReceived ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
                  : "bg-blue-500/15 text-blue-400 border-blue-500/30 hover:bg-blue-500/25"
                }`}>
                {statusMutation.isPending && (
                  <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                )}
                Mark as {status}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Delete Confirm ────────────────────────────────────────────────────────
const DeleteConfirm = ({ order, onConfirm, onCancel, isPending }) => (
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
          <p className="text-xs text-slate-500">Only cancelled orders can be deleted.</p>
        </div>
      </div>
      <p className="text-sm text-slate-400">
        Delete <span className="font-mono font-semibold text-slate-200">{order?.orderNumber}</span>? This cannot be undone.
      </p>
      <div className="flex gap-3 justify-end">
        <button onClick={onCancel} className="px-4 py-2 text-sm text-slate-400 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">Cancel</button>
        <button onClick={onConfirm} disabled={isPending}
          className="px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg disabled:opacity-50 flex items-center gap-2">
          {isPending ? <><svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Deleting…</> : "Delete"}
        </button>
      </div>
    </div>
  </div>
);

// ─── Summary cards ─────────────────────────────────────────────────────────
const SummaryCard = ({ label, value, color = "text-slate-100" }) => (
  <div className="bg-slate-900 border border-slate-700/40 rounded-xl px-4 py-3 text-center">
    <p className={`text-lg font-bold ${color}`}>{value}</p>
    <p className="text-xs text-slate-500 mt-0.5">{label}</p>
  </div>
);

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function Orders() {
  const [params, setParams]         = useState({ page: 1, limit: 20 });
  const [statusFilter, setStatusFilter] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOrder, setDetailOrder] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading, error, refetch } = useOrders(params);
  const statusMutation  = useUpdateOrderStatus();
  const deleteMutation  = useDeleteOrder();

  const orders = data?.data              ?? [];
  const total  = data?.pagination?.total ?? 0;
  const limit  = params.limit            ?? 20;
  const pages  = Math.ceil(total / limit);

  // ── Status filter summary counts ─────────────────────────────────────────
  const countByStatus = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  const handleStatusFilter = (s) => {
    setStatusFilter(s);
    setParams((p) => ({ ...p, status: s || undefined, page: 1 }));
  };

  const handleStatusChange = ({ id, status }) => {
    statusMutation.mutate({ id, status }, {
      onSuccess: () => setDetailOrder(null),
    });
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Purchase Orders</h1>
          <p className="text-sm text-slate-500 mt-0.5">{total} order{total !== 1 ? "s" : ""} total</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors" title="Refresh">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </button>
          <button onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 rounded-xl shadow-lg shadow-rose-500/25 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            New Order
          </button>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {["", "Pending", "Accepted", "Received", "Cancelled"].map((s) => (
          <button key={s || "all"} onClick={() => handleStatusFilter(s)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              statusFilter === s
                ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                : "bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600"
            }`}>
            {s || "All Orders"}
            {s && countByStatus[s] > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-slate-400">
                {countByStatus[s]}
              </span>
            )}
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
      <OrderTable
        orders={orders}
        total={total}
        page={params.page}
        pages={pages}
        limit={limit}
        loading={isLoading}
        onView={setDetailOrder}
        onDelete={setDeleteTarget}
        onPageChange={(p) => setParams((prev) => ({ ...prev, page: p }))}
        onLimitChange={(l) => setParams((prev) => ({ ...prev, limit: l, page: 1 }))}
      />

      {/* Create modal */}
      {createOpen && (
        <ModalShell title="New Purchase Order" onClose={() => setCreateOpen(false)}>
          <OrderForm onSuccess={() => setCreateOpen(false)} onCancel={() => setCreateOpen(false)} />
        </ModalShell>
      )}

      {/* Detail modal */}
      {detailOrder && (
        <ModalShell title={`Order — ${detailOrder.orderNumber}`} size="max-w-3xl" onClose={() => setDetailOrder(null)}>
          <OrderDetail order={detailOrder} onClose={() => setDetailOrder(null)} statusMutation={statusMutation} />
        </ModalShell>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <DeleteConfirm
          order={deleteTarget}
          isPending={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(deleteTarget._id, { onSuccess: () => setDeleteTarget(null) })}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
