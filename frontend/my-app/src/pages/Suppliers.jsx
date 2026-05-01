import { useState } from "react";
import { useSuppliers, useDeleteSupplier, useRestoreSupplier } from "../hooks/useSuppliers";
import SupplierForm from "../components/supplier/SupplierForm";
import { formatDate } from "../utils/FormatDate";

// ─── Shared modal shell ───────────────────────────────────────────────────────
const ModalShell = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
    <div className="w-full max-w-lg bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
        <h2 className="text-base font-semibold text-slate-100">{title}</h2>
        <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  </div>
);

// ─── Confirm deactivate modal ─────────────────────────────────────────────────
const ConfirmModal = ({ supplier, onConfirm, onCancel, isPending }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
    <div className="w-full max-w-sm bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-100">Deactivate Supplier</h3>
          <p className="text-xs text-slate-500 mt-0.5">Products will be detached from this supplier.</p>
        </div>
      </div>
      <p className="text-sm text-slate-400">
        Deactivate <span className="font-semibold text-slate-200">"{supplier?.name}"</span>? This will detach all products linked to them.
      </p>
      <div className="flex gap-3 justify-end">
        <button onClick={onCancel} className="px-4 py-2 text-sm text-slate-400 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">Cancel</button>
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

// ─── Detail drawer (view supplier info) ──────────────────────────────────────
const DetailModal = ({ supplier, onClose, onEdit }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
    <div className="w-full max-w-md bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
        <h2 className="text-base font-semibold text-slate-100">Supplier Details</h2>
        <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors">
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
            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${supplier.isActive ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-red-500/15 text-red-400 border border-red-500/30"}`}>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Notes</p>
                <p className="text-sm text-slate-300 mt-0.5 leading-relaxed">{supplier.note}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-1 border-t border-slate-800">
            <p className="text-xs text-slate-600">Added {formatDate(supplier.createdAt)}</p>
          </div>
        </div>

        <button onClick={() => { onClose(); onEdit(supplier); }}
          className="w-full py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 rounded-xl shadow-lg shadow-rose-500/25 transition-all">
          Edit Supplier
        </button>
      </div>
    </div>
  </div>
);

// ─── Status badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ isActive }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
    isActive
      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
      : "bg-red-500/15 text-red-400 border border-red-500/20"
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-400" : "bg-red-400"}`}/>
    {isActive ? "Active" : "Inactive"}
  </span>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Suppliers() {
  const [params, setParams] = useState({ page: 1, limit: 10, isActive: "true" });
  const { data, isLoading, error, refetch } = useSuppliers(params);
  const deleteMutation  = useDeleteSupplier();
  const restoreMutation = useRestoreSupplier();

  const suppliers = data?.data  ?? [];
  const total     = data?.total ?? 0;
  const pages     = data?.pages ?? 1;

  const [search, setSearch]           = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [modalOpen, setModalOpen]     = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);

  const openCreate = () => { setEditTarget(null); setModalOpen(true); };
  const openEdit   = (s)  => { setEditTarget(s);  setModalOpen(true); };
  const closeModal = ()   => { setModalOpen(false); setEditTarget(null); };

  const handleToggleActive = () => {
    const next = !showInactive;
    setShowInactive(next);
    setParams((p) => ({ ...p, isActive: next ? "false" : "true", page: 1 }));
  };

  const handleSearch = (val) => {
    setSearch(val);
    setParams((p) => ({ ...p, search: val || undefined, page: 1 }));
  };

  const columns = ["Supplier", "Contact", "Address", "Status", "Added", "Actions"];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Suppliers</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {total} supplier{total !== 1 ? "s" : ""}{showInactive ? " (inactive)" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleToggleActive}
            className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${showInactive ? "bg-amber-500/15 text-amber-400 border-amber-500/30" : "bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600"}`}>
            {showInactive ? "Viewing Inactive" : "Show Inactive"}
          </button>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 rounded-xl shadow-lg shadow-rose-500/25 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            Add Supplier
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
        </svg>
        <input value={search} onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search suppliers by name, email…"
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-rose-500/60 focus:ring-2 focus:ring-rose-500/15 transition-all" />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p className="text-sm text-red-400">Failed to load suppliers. <button onClick={() => refetch()} className="underline">Retry</button></p>
        </div>
      )}

      {/* Table */}
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl overflow-hidden">
        {/* Head */}
        <div className="grid grid-cols-12 px-5 py-3 border-b border-slate-700/50 bg-slate-800/60">
          {[
            { label: "Supplier", span: "col-span-3" },
            { label: "Contact",  span: "col-span-3" },
            { label: "Address",  span: "col-span-2" },
            { label: "Status",   span: "col-span-1" },
            { label: "Added",    span: "col-span-1" },
            { label: "Actions",  span: "col-span-2 text-right" },
          ].map(({ label, span }) => (
            <div key={label} className={`${span} text-xs font-semibold text-slate-400 uppercase tracking-widest`}>
              {label}
            </div>
          ))}
        </div>

        {/* Skeleton */}
        {isLoading && (
          <div className="divide-y divide-slate-800/60">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid grid-cols-12 px-5 py-4 items-center gap-2">
                <div className="col-span-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 animate-pulse flex-shrink-0"/>
                  <div className="h-4 bg-slate-800 rounded animate-pulse w-28"/>
                </div>
                <div className="col-span-3 space-y-1.5">
                  <div className="h-3 bg-slate-800 rounded animate-pulse w-32"/>
                  <div className="h-3 bg-slate-800/60 rounded animate-pulse w-24"/>
                </div>
                <div className="col-span-2"><div className="h-3 bg-slate-800 rounded animate-pulse w-20"/></div>
                <div className="col-span-1"><div className="h-5 bg-slate-800 rounded-full animate-pulse w-14"/></div>
                <div className="col-span-1"><div className="h-3 bg-slate-800 rounded animate-pulse w-16"/></div>
                <div className="col-span-2 flex justify-end gap-2">
                  <div className="h-7 w-7 bg-slate-800 rounded animate-pulse"/>
                  <div className="h-7 w-7 bg-slate-800 rounded animate-pulse"/>
                  <div className="h-7 w-7 bg-slate-800 rounded animate-pulse"/>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && suppliers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center">
              <svg className="w-7 h-7 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
              </svg>
            </div>
            <p className="text-sm text-slate-400 font-medium">
              {search ? `No suppliers match "${search}"` : "No suppliers yet"}
            </p>
            {!search && (
              <button onClick={openCreate} className="text-xs text-rose-400 hover:text-rose-300 underline">
                Add your first supplier
              </button>
            )}
          </div>
        )}

        {/* Rows */}
        {!isLoading && suppliers.length > 0 && (
          <div className="divide-y divide-slate-800/50">
            {suppliers.map((s) => (
              <div key={s._id}
                className="grid grid-cols-12 px-5 py-4 items-center hover:bg-slate-800/30 transition-colors group">

                {/* Name + avatar */}
                <div className="col-span-3 flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-violet-400">{s.name[0]?.toUpperCase()}</span>
                  </div>
                  <button onClick={() => setDetailTarget(s)}
                    className="text-sm font-medium text-slate-200 hover:text-rose-400 transition-colors truncate text-left">
                    {s.name}
                  </button>
                </div>

                {/* Contact */}
                <div className="col-span-3 space-y-0.5 min-w-0">
                  {s.email ? (
                    <p className="text-xs text-slate-400 truncate">{s.email}</p>
                  ) : (
                    <p className="text-xs text-slate-600 italic">No email</p>
                  )}
                  {s.phone && <p className="text-xs text-slate-500 truncate">{s.phone}</p>}
                </div>

                {/* Address */}
                <div className="col-span-2 min-w-0">
                  {s.address
                    ? <p className="text-xs text-slate-400 truncate">{s.address}</p>
                    : <p className="text-xs text-slate-600 italic">—</p>
                  }
                </div>

                {/* Status */}
                <div className="col-span-1">
                  <StatusBadge isActive={s.isActive} />
                </div>

                {/* Date */}
                <div className="col-span-1">
                  <p className="text-xs text-slate-500">{formatDate(s.createdAt)}</p>
                </div>

                {/* Actions */}
                <div className="col-span-2 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* View */}
                  <button onClick={() => setDetailTarget(s)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors" title="View details">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  </button>
                  {/* Edit */}
                  <button onClick={() => openEdit(s)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors" title="Edit">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                  {/* Deactivate / Restore */}
                  {s.isActive ? (
                    <button onClick={() => setDeleteTarget(s)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Deactivate">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                      </svg>
                    </button>
                  ) : (
                    <button onClick={() => restoreMutation.mutate(s._id)} disabled={restoreMutation.isPending}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors disabled:opacity-50" title="Restore">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {!isLoading && suppliers.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-800/60 bg-slate-800/30 flex items-center justify-between">
            <p className="text-xs text-slate-600">
              Showing {suppliers.length} of {total} supplier{total !== 1 ? "s" : ""}
            </p>
            {pages > 1 && (
              <div className="flex items-center gap-2">
                <button onClick={() => setParams((p) => ({ ...p, page: p.page - 1 }))} disabled={params.page === 1}
                  className="px-3 py-1 text-xs text-slate-400 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 disabled:opacity-40 transition-colors">
                  ← Prev
                </button>
                <span className="text-xs text-slate-500">{params.page} / {pages}</span>
                <button onClick={() => setParams((p) => ({ ...p, page: p.page + 1 }))} disabled={params.page === pages}
                  className="px-3 py-1 text-xs text-slate-400 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 disabled:opacity-40 transition-colors">
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {modalOpen && (
        <ModalShell title={editTarget ? "Edit Supplier" : "New Supplier"} onClose={closeModal}>
          <SupplierForm supplier={editTarget} onSuccess={closeModal} onCancel={closeModal} />
        </ModalShell>
      )}

      {deleteTarget && (
        <ConfirmModal supplier={deleteTarget} isPending={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(deleteTarget._id, { onSuccess: () => setDeleteTarget(null) })}
          onCancel={() => setDeleteTarget(null)} />
      )}

      {detailTarget && (
        <DetailModal supplier={detailTarget} onClose={() => setDetailTarget(null)} onEdit={openEdit} />
      )}
    </div>
  );
}

