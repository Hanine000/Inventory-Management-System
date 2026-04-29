import { useState } from "react";
import { useCategories, useDeleteCategory } from "../hooks/useCategories";
import CategoryForm from "../components/category/CategoryForm";

const ConfirmModal = ({ category, onConfirm, onCancel, isPending }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
    <div className="w-full max-w-sm bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-100">Delete Category</h3>
          <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone.</p>
        </div>
      </div>
      <p className="text-sm text-slate-400">
        Are you sure you want to delete <span className="font-semibold text-slate-200">"{category?.name}"</span>?
        Categories with products cannot be deleted.
      </p>
      <div className="flex gap-3 justify-end pt-1">
        <button onClick={onCancel} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">Cancel</button>
        <button onClick={onConfirm} disabled={isPending}
          className="px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
          {isPending ? <><svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Deleting…</> : "Delete"}
        </button>
      </div>
    </div>
  </div>
);

const FormModal = ({ category, onSuccess, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
    <div className="w-full max-w-md bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
        <h2 className="text-base font-semibold text-slate-100">{category ? "Edit Category" : "New Category"}</h2>
        <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <div className="px-6 py-5">
        <CategoryForm category={category} onSuccess={onSuccess} onCancel={onClose} />
      </div>
    </div>
  </div>
);

export default function Categories() {
  const { data: categories = [], isLoading, error, refetch } = useCategories();
  const deleteMutation = useDeleteCategory();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
  const openCreate = () => { setEditTarget(null); setModalOpen(true); };
  const openEdit = (cat) => { setEditTarget(cat); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditTarget(null); };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Categories</h1>
          <p className="text-sm text-slate-500 mt-0.5">{categories.length} total</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 rounded-xl shadow-lg shadow-rose-500/25 transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
          Add Category
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
        </svg>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search categories…"
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-rose-500/60 focus:ring-2 focus:ring-rose-500/15 transition-all" />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p className="text-sm text-red-400">Failed to load. <button onClick={() => refetch()} className="underline">Retry</button></p>
        </div>
      )}

      {/* Table */}
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-12 px-5 py-3 border-b border-slate-700/50 bg-slate-800/60">
          <div className="col-span-1 text-xs font-semibold text-slate-400 uppercase tracking-widest">#</div>
          <div className="col-span-6 text-xs font-semibold text-slate-400 uppercase tracking-widest">Name</div>
          <div className="col-span-3 text-xs font-semibold text-slate-400 uppercase tracking-widest text-center">Products</div>
          <div className="col-span-2 text-xs font-semibold text-slate-400 uppercase tracking-widest text-right">Actions</div>
        </div>

        {isLoading && (
          <div className="divide-y divide-slate-800/60">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid grid-cols-12 px-5 py-4 items-center">
                <div className="col-span-1"><div className="h-3 w-4 bg-slate-800 rounded animate-pulse"/></div>
                <div className="col-span-6"><div className="h-4 w-32 bg-slate-800 rounded animate-pulse"/></div>
                <div className="col-span-3 flex justify-center"><div className="h-5 w-16 bg-slate-800 rounded animate-pulse"/></div>
                <div className="col-span-2 flex justify-end gap-2"><div className="h-7 w-7 bg-slate-800 rounded animate-pulse"/><div className="h-7 w-7 bg-slate-800 rounded animate-pulse"/></div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"/>
              </svg>
            </div>
            <p className="text-sm text-slate-400">{search ? `No results for "${search}"` : "No categories yet"}</p>
            {!search && <button onClick={openCreate} className="text-xs text-rose-400 hover:text-rose-300 underline">Create your first category</button>}
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="divide-y divide-slate-800/50">
            {filtered.map((cat, idx) => (
              <div key={cat.categoryId} className="grid grid-cols-12 px-5 py-4 items-center hover:bg-slate-800/30 transition-colors group">
                <div className="col-span-1"><span className="text-xs text-slate-600">{idx + 1}</span></div>
                <div className="col-span-6 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500/20 to-pink-500/10 border border-rose-500/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"/>
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-slate-200">{cat.name}</span>
                </div>
                <div className="col-span-3 flex justify-center">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cat.productCount > 0 ? "bg-blue-500/15 text-blue-400 border border-blue-500/20" : "bg-slate-800 text-slate-500 border border-slate-700"}`}>
                    {cat.productCount} product{cat.productCount !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="col-span-2 flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors" title="Edit">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </button>
                  <button onClick={() => setDeleteTarget(cat)} disabled={cat.productCount > 0}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title={cat.productCount > 0 ? "Cannot delete — has products" : "Delete"}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-800/60 bg-slate-800/30">
            <p className="text-xs text-slate-600">Showing {filtered.length} of {categories.length} categories</p>
          </div>
        )}
      </div>

      {modalOpen && <FormModal category={editTarget} onSuccess={closeModal} onClose={closeModal} />}
      {deleteTarget && (
        <ConfirmModal category={deleteTarget} isPending={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(deleteTarget.categoryId, { onSuccess: () => setDeleteTarget(null) })}
          onCancel={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}