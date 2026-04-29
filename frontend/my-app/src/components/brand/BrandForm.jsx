import { useState, useRef } from "react";
import { useCreateBrand, useUpdateBrand } from "../../hooks/useBrands";

const inputCls = (err) =>
  ["w-full bg-slate-800/60 border rounded-lg px-3 py-2.5 text-sm text-slate-100",
   "placeholder:text-slate-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0",
   err
     ? "border-red-500/60 focus:ring-red-500/20"
     : "border-slate-700 hover:border-slate-600 focus:border-rose-500/60 focus:ring-rose-500/15",
  ].join(" ");

const BrandForm = ({ brand = null, onSuccess, onCancel }) => {
  const isEdit = Boolean(brand);
  const createMutation = useCreateBrand();
  const updateMutation = useUpdateBrand();
  const isPending = createMutation.isPending || updateMutation.isPending;
  const fileRef = useRef(null);

  const [name, setName]               = useState(brand?.name ?? "");
  const [logoFile, setLogoFile]       = useState(null);
  const [logoPreview, setLogoPreview] = useState(brand?.logo?.url ?? null);
  const [removeLogo, setRemoveLogo]   = useState(false);
  const [nameError, setNameError]     = useState("");
  const [serverError, setServerError] = useState("");

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setRemoveLogo(false);
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setRemoveLogo(true);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setServerError("");
    if (!name.trim()) { setNameError("Brand name is required."); return; }

    const fd = new FormData();
    fd.append("name", name.trim());
    if (logoFile) fd.append("logo", logoFile);
    if (isEdit && removeLogo) fd.append("removeLogo", "true");

    const opts = {
      onSuccess: () => onSuccess?.(),
      onError: (err) =>
        setServerError(err?.response?.data?.message ?? err?.message ?? "Something went wrong."),
    };

    if (isEdit) {
      updateMutation.mutate({ id: brand._id, formData: fd }, opts);
    } else {
      createMutation.mutate(fd, opts);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {serverError && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p className="text-sm text-red-400">{serverError}</p>
        </div>
      )}

      {/* Brand name */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Brand Name <span className="text-rose-400">*</span>
        </label>
        <input
          value={name}
          onChange={(e) => { setName(e.target.value); setNameError(""); setServerError(""); }}
          placeholder="e.g. L'Oréal, MAC, Fenty Beauty…"
          className={inputCls(nameError)}
          autoFocus
        />
        {nameError && (
          <p className="text-xs text-red-400 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            {nameError}
          </p>
        )}
      </div>

      {/* Logo upload */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Brand Logo</label>

        {logoPreview ? (
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl border border-slate-700 bg-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0">
              <img src={logoPreview} alt="logo preview" className="w-full h-full object-contain p-1" />
            </div>
            <div className="flex flex-col gap-2">
              <button type="button" onClick={() => fileRef.current?.click()}
                className="px-3 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors">
                Replace logo
              </button>
              <button type="button" onClick={handleRemoveLogo}
                className="px-3 py-1.5 text-xs text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-colors">
                Remove logo
              </button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 py-8 rounded-xl border border-dashed border-slate-600 hover:border-rose-500/60 text-slate-500 hover:text-rose-400 transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <span className="text-sm">Click to upload brand logo</span>
            <span className="text-xs text-slate-600">PNG, JPG, WEBP — max 5MB</span>
          </button>
        )}

        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2 border-t border-slate-700/50">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={isPending}
          className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 rounded-lg shadow-lg shadow-rose-500/25 transition-all disabled:opacity-50 flex items-center gap-2">
          {isPending
            ? <><svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Saving…</>
            : isEdit ? "Save Changes" : "Create Brand"
          }
        </button>
      </div>
    </form>
  );
};

export default BrandForm;