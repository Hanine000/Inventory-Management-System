import { useState } from "react";
import { useCreateCategory, useUpdateCategory } from "../../hooks/useCategories";

const inputCls = (err) =>
  ["w-full bg-slate-800/60 border rounded-lg px-3 py-2.5 text-sm text-slate-100",
   "placeholder:text-slate-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0",
   err
     ? "border-red-500/60 focus:ring-red-500/20"
     : "border-slate-700 hover:border-slate-600 focus:border-rose-500/60 focus:ring-rose-500/15",
  ].join(" ");

const CategoryForm = ({ category = null, onSuccess, onCancel }) => {
  const isEdit = Boolean(category);
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const [name, setName]           = useState(category?.name ?? "");
  const [error, setError]         = useState("");
  const [serverError, setServerError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setServerError("");
    if (!name.trim()) { setError("Category name is required."); return; }

    const opts = {
      onSuccess: () => onSuccess?.(),
      onError: (err) =>
        setServerError(err?.response?.data?.message ?? err?.message ?? "Something went wrong."),
    };

    if (isEdit) {
      updateMutation.mutate({ id: category.categoryId, body: { name: name.trim() } }, opts);
    } else {
      createMutation.mutate({ name: name.trim() }, opts);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {serverError && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p className="text-sm text-red-400">{serverError}</p>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Category Name <span className="text-rose-400">*</span>
        </label>
        <input
          value={name}
          onChange={(e) => { setName(e.target.value); setError(""); setServerError(""); }}
          placeholder="Enter category name..."
          className={inputCls(error)}
          autoFocus
        />
        {error && (
          <p className="text-xs text-red-400 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            {error}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-slate-700/50">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={isPending}
          className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 rounded-lg shadow-lg shadow-rose-500/25 transition-all disabled:opacity-50 flex items-center gap-2">
          {isPending
            ? <><svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Saving…</>
            : isEdit ? "Save Changes" : "Create Category"
          }
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;