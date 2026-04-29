import { useState } from "react";
import { useBrands, useDeleteBrand, useRestoreBrand } from "../hooks/useBrands";
import BrandForm from "../components/brand/BrandForm";

const ConfirmModal = ({ brand, onConfirm, onCancel, isPending }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
    <div className="w-full max-w-sm bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-100">Deactivate Brand</h3>
          <p className="text-xs text-slate-500 mt-0.5">Brand will be detached from its products.</p>
        </div>
      </div>
      <p className="text-sm text-slate-400">
        Deactivate <span className="font-semibold text-slate-200">"{brand?.name}"</span>? Products linked to this brand will have their brand removed.
      </p>
      <div className="flex gap-3 justify-end pt-1">
        <button onClick={onCancel} className="px-4 py-2 text-sm text-slate-400 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">Cancel</button>
        <button onClick={onConfirm} disabled={isPending}
          className="px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg disabled:opacity-50 flex items-center gap-2">
          {isPending ? <><svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Deactivating…</> : "Deactivate"}
        </button>
      </div>
    </div>
  </div>
);

const FormModal = ({ brand, onSuccess, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
    <div className="w-full max-w-md bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
        <h2 className="text-base font-semibold text-slate-100">{brand ? "Edit Brand" : "New Brand"}</h2>
        <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <div className="px-6 py-5">
        <BrandForm brand={brand} onSuccess={onSuccess} onCancel={onClose} />
      </div>
    </div>
  </div>
);

export default function Brands() {
  const [params, setParams] = useState({ page: 1, limit: 10, isActive: "true" });
  const { data, isLoading, error, refetch } = useBrands(params);
  const deleteMutation  = useDeleteBrand();
  const restoreMutation = useRestoreBrand();

  const brands = data?.data ?? [];
  const total  = data?.total ?? 0;
  const pages  = data?.pages ?? 1;

  const [search, setSearch]         = useState("");
  const [modalOpen, setModalOpen]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showInactive, setShowInactive] = useState(false);

  const openCreate = () => { setEditTarget(null); setModalOpen(true); };
  const openEdit   = (b)  => { setEditTarget(b);  setModalOpen(true); };
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Brands</h1>
          <p className="text-sm text-slate-500 mt-0.5">{total} brand{total !== 1 ? "s" : ""} {showInactive ? "(inactive)" : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleToggleActive}
            className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${showInactive ? "bg-amber-500/15 text-amber-400 border-amber-500/30" : "bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600"}`}>
            {showInactive ? "Viewing Inactive" : "Show Inactive"}
          </button>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 rounded-xl shadow-lg shadow-rose-500/25 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            Add Brand
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
        </svg>
        <input value={search} onChange={(e) => handleSearch(e.target.value)} placeholder="Search brands…"
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-rose-500/60 focus:ring-2 focus:ring-rose-500/15 transition-all" />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p className="text-sm text-red-400">Failed to load. <button onClick={() => refetch()} className="underline">Retry</button></p>
        </div>
      )}

      {/* Grid of brand cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-700/50 rounded-2xl p-5 animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-slate-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-800 rounded w-24" />
                  <div className="h-3 bg-slate-800/60 rounded w-16" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-7 flex-1 bg-slate-800 rounded" />
                <div className="h-7 flex-1 bg-slate-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : brands.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 bg-slate-900 border border-slate-700/50 rounded-2xl">
          <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center">
            <svg className="w-7 h-7 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
            </svg>
          </div>
          <p className="text-sm text-slate-400 font-medium">{search ? `No brands match "${search}"` : "No brands yet"}</p>
          {!search && <button onClick={openCreate} className="text-xs text-rose-400 hover:text-rose-300 underline">Create your first brand</button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {brands.map((brand) => (
            <div key={brand._id} className={`bg-slate-900 border rounded-2xl p-5 transition-all group ${brand.isActive ? "border-slate-700/50 hover:border-slate-600/70" : "border-amber-500/20 bg-amber-500/5"}`}>
              {/* Brand info */}
              <div className="flex items-center gap-4 mb-4">
                {/* Logo */}
                <div className="w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {brand.logo?.url ? (
                    <img src={brand.logo.url} alt={brand.name} className="w-full h-full object-contain p-1" />
                  ) : (
                    <span className="text-xl font-bold text-slate-600">{brand.name[0]?.toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-100 truncate">{brand.name}</p>
                  {!brand.isActive && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      Inactive
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button onClick={() => openEdit(brand)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-slate-400 hover:text-blue-400 bg-slate-800 hover:bg-blue-500/10 border border-slate-700 hover:border-blue-500/30 rounded-lg transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  Edit
                </button>
                {brand.isActive ? (
                  <button onClick={() => setDeleteTarget(brand)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-slate-400 hover:text-red-400 bg-slate-800 hover:bg-red-500/10 border border-slate-700 hover:border-red-500/30 rounded-lg transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
                    Deactivate
                  </button>
                ) : (
                  <button onClick={() => restoreMutation.mutate(brand._id)} disabled={restoreMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors disabled:opacity-50">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                    Restore
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setParams((p) => ({ ...p, page: p.page - 1 }))} disabled={params.page === 1}
            className="px-3 py-1.5 text-sm text-slate-400 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 disabled:opacity-40 transition-colors">
            ← Prev
          </button>
          <span className="text-xs text-slate-500 px-2">Page {params.page} of {pages}</span>
          <button onClick={() => setParams((p) => ({ ...p, page: p.page + 1 }))} disabled={params.page === pages}
            className="px-3 py-1.5 text-sm text-slate-400 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 disabled:opacity-40 transition-colors">
            Next →
          </button>
        </div>
      )}

      {/* Modals */}
      {modalOpen && <FormModal brand={editTarget} onSuccess={closeModal} onClose={closeModal} />}
      {deleteTarget && (
        <ConfirmModal brand={deleteTarget} isPending={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(deleteTarget._id, { onSuccess: () => setDeleteTarget(null) })}
          onCancel={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}