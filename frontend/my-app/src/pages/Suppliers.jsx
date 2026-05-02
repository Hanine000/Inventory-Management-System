import { useState } from "react";
import { useSuppliers, useDeleteSupplier, useRestoreSupplier } from "../hooks/useSuppliers";
import SupplierTable from "../components/supplier/SupplierTable";
import SupplierForm from "../components/supplier/SupplierForm";
import { formatDate } from "../utils/FormatDate";   // ← fixed case (was FormatDate)

// ─── Modal shell ───────────────────────────────────────────────────────────
const ModalShell = ({ title, size = "max-w-lg", onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
    <div className={`w-full ${size} bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden`}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
        <h2 className="text-base font-semibold text-slate-100">{title}</h2>
        <button onClick={onClose}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  </div>
);

// ─── Detail modal ──────────────────────────────────────────────────────────
const DetailModal = ({ supplier, onClose, onEdit }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
    <div className="w-full max-w-md bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
        <h2 className="text-base font-semibold text-slate-100">Supplier Details</h2>
        <button onClick={onClose}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div className="px-6 py-5 space-y-4">
        {/* Avatar + name */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/30 to-purple-600/20 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-bold text-violet-400">{supplier.name[0]?.toUpperCase()}</span>
          </div>
          <div>
            <p className="text-base font-semibold text-slate-100">{supplier.name}</p>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              supplier.isActive
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                : "bg-red-500/15 text-red-400 border-red-500/30"
            }`}>
              {supplier.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {/* Info rows */}
        <div className="space-y-3 pt-1">
          {[
            { label: "Email",   value: supplier.email,   icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
            { label: "Phone",   value: supplier.phone,   icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" },
            { label: "Address", value: supplier.address, icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" },
          ].map(({ label, value, icon }) => value ? (
            <div key={label} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={icon}/>
                </svg>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">{label}</p>
                <p className="text-sm text-slate-300 mt-0.5">{value}</p>
              </div>
            </div>
          ) : null)}

          {supplier.note && (
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Notes</p>
                <p className="text-sm text-slate-300 mt-0.5 leading-relaxed">{supplier.note}</p>
              </div>
            </div>
          )}

          <div className="pt-1 border-t border-slate-800">
            <p className="text-xs text-slate-600">Added {formatDate(supplier.createdAt)}</p>
          </div>
        </div>

        <button onClick={() => { onClose(); onEdit(supplier); }}
          className="w-full py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-600
                     hover:from-rose-400 hover:to-pink-500 rounded-xl shadow-lg shadow-rose-500/25 transition-all">
          Edit Supplier
        </button>
      </div>
    </div>
  </div>
);

// ─── Confirm deactivate modal ──────────────────────────────────────────────
const ConfirmModal = ({ supplier, onConfirm, onCancel, isPending }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
    <div className="w-full max-w-sm bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-100">Deactivate Supplier</h3>
          <p className="text-xs text-slate-500 mt-0.5">Products will be detached from this supplier.</p>
        </div>
      </div>
      <p className="text-sm text-slate-400">
        Deactivate <span className="font-semibold text-slate-200">"{supplier?.name}"</span>?
        All linked products will have their supplier removed.
      </p>
      <div className="flex gap-3 justify-end">
        <button onClick={onCancel}
          className="px-4 py-2 text-sm text-slate-400 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
          Cancel
        </button>
        <button onClick={onConfirm} disabled={isPending}
          className="px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg disabled:opacity-50 flex items-center gap-2">
          {isPending
            ? <><svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Deactivating…</>
            : "Deactivate"
          }
        </button>
      </div>
    </div>
  </div>
);

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function Suppliers() {
  const [params, setParams]             = useState({ page: 1, limit: 10, isActive: "true" });
  const [search, setSearch]             = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [modalOpen, setModalOpen]       = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);

  const { data, isLoading, error, refetch } = useSuppliers(params);
  const deleteMutation  = useDeleteSupplier();
  const restoreMutation = useRestoreSupplier();

  const suppliers = data?.data  ?? [];
  const total     = data?.total ?? 0;
  const pages     = data?.pages ?? 1;

  const openCreate = () => { setEditTarget(null); setModalOpen(true); };
  const openEdit   = (s)  => { setEditTarget(s);  setModalOpen(true); };
  const closeModal = ()   => { setModalOpen(false); setEditTarget(null); };

  const handleToggleInactive = () => {
    const next = !showInactive;
    setShowInactive(next);
    setParams((p) => ({ ...p, isActive: next ? "false" : "true", page: 1 }));
  };

  const handleSearch = (val) => {
    setSearch(val);
    setParams((p) => ({ ...p, search: val || undefined, page: 1 }));
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Suppliers</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {total} supplier{total !== 1 ? "s" : ""}{showInactive ? " (inactive)" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleToggleInactive}
            className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
              showInactive
                ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                : "bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600"
            }`}>
            {showInactive ? "Viewing Inactive" : "Show Inactive"}
          </button>
          <button onClick={() => refetch()}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors"
            title="Refresh">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </button>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white
                       bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500
                       rounded-xl shadow-lg shadow-rose-500/25 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            Add Supplier
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
        </svg>
        <input value={search} onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search suppliers…"
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm
                     text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-rose-500/60
                     focus:ring-2 focus:ring-rose-500/15 transition-all" />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p className="text-sm text-red-400">
            Failed to load suppliers.{" "}
            <button onClick={() => refetch()} className="underline hover:no-underline">Retry</button>
          </p>
        </div>
      )}

      {/* Table */}
      <SupplierTable
        suppliers={suppliers}
        total={total}
        page={params.page}
        pages={pages}
        limit={params.limit}
        loading={isLoading}
        onView={setDetailTarget}
        onEdit={openEdit}
        onDeactivate={setDeleteTarget}
        onRestore={(s) => restoreMutation.mutate(s._id)}
        onPageChange={(p) => setParams((prev) => ({ ...prev, page: p }))}
        onLimitChange={(l) => setParams((prev) => ({ ...prev, limit: l, page: 1 }))}
      />

      {/* Create / Edit modal */}
      {modalOpen && (
        <ModalShell title={editTarget ? "Edit Supplier" : "New Supplier"} onClose={closeModal}>
          <SupplierForm supplier={editTarget} onSuccess={closeModal} onCancel={closeModal} />
        </ModalShell>
      )}

      {/* Detail modal */}
      {detailTarget && (
        <DetailModal
          supplier={detailTarget}
          onClose={() => setDetailTarget(null)}
          onEdit={(s) => { setDetailTarget(null); openEdit(s); }}
        />
      )}

      {/* Deactivate confirm */}
      {deleteTarget && (
        <ConfirmModal
          supplier={deleteTarget}
          isPending={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(deleteTarget._id, {
            onSuccess: () => setDeleteTarget(null),
          })}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}