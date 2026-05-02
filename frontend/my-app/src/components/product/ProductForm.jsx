import { useState, useEffect, useRef } from "react";
import { useCreateProduct, useUpdateProduct } from "../../hooks/useProducts";

// ─── Small helpers ─────────────────────────────────────────────────────────
const Field = ({ label, required, error, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
      {label}{required && <span className="text-rose-400 ml-1">*</span>}
    </label>
    {children}
    {error && (
      <p className="text-xs text-red-400 flex items-center gap-1">
        <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
        </svg>
        {error}
      </p>
    )}
  </div>
);

const inputCls = (err) =>
  ["w-full bg-slate-800/60 border rounded-lg px-3 py-2.5 text-sm text-slate-100",
   "placeholder:text-slate-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0",
   err ? "border-red-500/60 focus:ring-red-500/20" : "border-slate-700 hover:border-slate-600 focus:border-rose-500/60 focus:ring-rose-500/15",
  ].join(" ");

// ─── Main Form ─────────────────────────────────────────────────────────────
const ProductForm = ({ product = null, categories = [], brands = [], suppliers = [], onSuccess, onCancel }) => {
  const isEdit = Boolean(product);
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const isPending = createMutation.isPending || updateMutation.isPending;
  const fileRef = useRef(null);

  // ── Form state ──────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    name:              product?.name              ?? "",
    description:       product?.description       ?? "",
    category:          product?.category?._id     ?? product?.category ?? "",
    brand:             product?.brand?._id        ?? product?.brand    ?? "",
    supplier:          product?.supplier?._id     ?? product?.supplier ?? "",
    costPrice:         product?.price?.costPrice  ?? "",
    sellingPrice:      product?.price?.sellingPrice ?? "",
    quantity:          product?.stock?.quantity   ?? "",
    lowStockThreshold: product?.stock?.lowStockThreshold ?? 10,
    isActive:          product?.isActive ?? true,
  });

  const [errors, setErrors]         = useState({});
  const [serverError, setServerError] = useState("");
  const [newImages, setNewImages]   = useState([]);     // File objects to upload
  const [previews, setPreviews]     = useState([]);     // preview URLs for new files
  const [existingImages, setExistingImages] = useState(product?.images ?? []); // already-saved images

  // Cleanup preview object URLs on unmount
  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews]);

  // ── Validation ──────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.name.trim())        e.name        = "Product name is required.";
    if (!form.category)           e.category    = "Category is required.";
    if (!form.costPrice)          e.costPrice    = "Cost price is required.";
    if (!form.sellingPrice)       e.sellingPrice = "Selling price is required.";
    if (Number(form.costPrice) < 0)    e.costPrice    = "Must be ≥ 0.";
    if (Number(form.sellingPrice) < 0) e.sellingPrice = "Must be ≥ 0.";
    if (form.quantity === "")     e.quantity    = "Stock quantity is required.";
    if (Number(form.quantity) < 0)     e.quantity    = "Must be ≥ 0.";
    return e;
  };

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
    setServerError("");
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    const total = existingImages.length + newImages.length + files.length;
    if (total > 5) {
      setServerError("Maximum 5 images allowed per product.");
      return;
    }
    const urls = files.map((f) => URL.createObjectURL(f));
    setNewImages((p) => [...p, ...files]);
    setPreviews((p) => [...p, ...urls]);
  };

  const removeNewImage = (idx) => {
    URL.revokeObjectURL(previews[idx]);
    setNewImages((p) => p.filter((_, i) => i !== idx));
    setPreviews((p) => p.filter((_, i) => i !== idx));
  };

  const removeExistingImage = (url) => {
    setExistingImages((p) => p.filter((img) => img.url !== url));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    // Build multipart FormData
    const fd = new FormData();
    fd.append("name",        form.name);
    fd.append("description", form.description);
    fd.append("category",    form.category);
    if (form.brand)    fd.append("brand",    form.brand);
    if (form.supplier) fd.append("supplier", form.supplier);
    fd.append("isActive",    String(form.isActive));
    fd.append("price",  JSON.stringify({ costPrice: Number(form.costPrice), sellingPrice: Number(form.sellingPrice) }));
    fd.append("stock",  JSON.stringify({ quantity: Number(form.quantity), lowStockThreshold: Number(form.lowStockThreshold) }));

    // New image files
    newImages.forEach((file) => fd.append("images", file));

    // Removed existing images (send URLs backend uses to delete from Cloudinary)
    if (isEdit) {
      const originalUrls = (product?.images ?? []).map((img) => img.url);
      const keepUrls     = existingImages.map((img) => img.url);
      const removed      = originalUrls.filter((u) => !keepUrls.includes(u));
      if (removed.length) fd.append("removedImages", JSON.stringify(removed));
    }

    const opts = {
      onSuccess: () => onSuccess?.(),
      onError: (err) => setServerError(err?.response?.data?.message ?? err?.message ?? "Something went wrong."),
    };

    if (isEdit) {
      updateMutation.mutate({ id: product._id, formData: fd }, opts);
    } else {
      createMutation.mutate(fd, opts);
    }
  };

  const totalImages = existingImages.length + newImages.length;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Server error */}
      {serverError && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p className="text-sm text-red-400">{serverError}</p>
        </div>
      )}

      {/* Name + Active */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <Field label="Product Name" required error={errors.name}>
            <input name="name" value={form.name} onChange={handleChange}
              placeholder="Enter product name..." className={inputCls(errors.name)} />
          </Field>
        </div>
        <Field label="Status">
          <label className="flex items-center gap-3 h-[42px] cursor-pointer group">
            <div className={`relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0 ${form.isActive ? "bg-emerald-500" : "bg-slate-700"}`}>
              <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="sr-only" />
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${form.isActive ? "left-5" : "left-0.5"}`} />
            </div>
            <span className={`text-sm font-medium ${form.isActive ? "text-emerald-400" : "text-slate-500"}`}>
              {form.isActive ? "Active" : "Inactive"}
            </span>
          </label>
        </Field>
      </div>

      {/* Description */}
      <Field label="Description">
        <textarea name="description" value={form.description} onChange={handleChange}
          rows={3} placeholder="Describe the product…"
          className={`${inputCls(false)} resize-none`} />
      </Field>

      {/* Category + Brand + Supplier */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Category" required error={errors.category}>
          <select name="category" value={form.category} onChange={handleChange} className={inputCls(errors.category)}>
            <option value="">Select category…</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Brand">
          <select name="brand" value={form.brand} onChange={handleChange} className={inputCls(false)}>
            <option value="">No brand</option>
            {brands.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
          </select>
        </Field>
        <Field label="Supplier">
          <select name="supplier" value={form.supplier} onChange={handleChange} className={inputCls(false)}>
            <option value="">No supplier</option>
            {suppliers.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </Field>
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Cost Price (DZD)" required error={errors.costPrice}>
          <input type="number" name="costPrice" value={form.costPrice} onChange={handleChange}
            min="0" step="0.01" placeholder="0.00" className={inputCls(errors.costPrice)} />
        </Field>
        <Field label="Selling Price (DZD)" required error={errors.sellingPrice}>
          <input type="number" name="sellingPrice" value={form.sellingPrice} onChange={handleChange}
            min="0" step="0.01" placeholder="0.00" className={inputCls(errors.sellingPrice)} />
        </Field>
      </div>

      {/* Stock */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Stock Quantity" required error={errors.quantity}>
          <input type="number" name="quantity" value={form.quantity} onChange={handleChange}
            min="0" placeholder="0" className={inputCls(errors.quantity)} />
        </Field>
        <Field label="Low Stock Threshold">
          <input type="number" name="lowStockThreshold" value={form.lowStockThreshold} onChange={handleChange}
            min="0" placeholder="10" className={inputCls(false)} />
        </Field>
      </div>

      {/* Images */}
      <Field label={`Images (${totalImages}/5)`}>
        {/* Existing images */}
        {existingImages.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {existingImages.map((img) => (
              <div key={img.url} className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-700 group">
                <img src={img.url} alt={img.altText} className="w-full h-full object-cover" />
                {img.isPrimary && (
                  <span className="absolute bottom-0 left-0 right-0 text-center text-[9px] font-bold bg-rose-500/80 text-white py-0.5">Primary</span>
                )}
                <button type="button" onClick={() => removeExistingImage(img.url)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* New image previews */}
        {previews.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {previews.map((url, i) => (
              <div key={url} className="relative w-20 h-20 rounded-lg overflow-hidden border border-rose-500/40 group">
                <img src={url} alt="preview" className="w-full h-full object-cover" />
                <span className="absolute bottom-0 left-0 right-0 text-center text-[9px] font-bold bg-rose-500/80 text-white py-0.5">New</span>
                <button type="button" onClick={() => removeNewImage(i)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload trigger */}
        {totalImages < 5 && (
          <>
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
            <button type="button" onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-slate-600 hover:border-rose-500/60 text-slate-500 hover:text-rose-400 text-sm transition-colors w-full justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              Click to upload images ({5 - totalImages} remaining)
            </button>
          </>
        )}
      </Field>

      {/* Profit margin hint */}
      {form.costPrice && form.sellingPrice && Number(form.sellingPrice) > 0 && (
        <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700/40 rounded-lg px-3 py-2">
          <svg className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
          </svg>
          <p className="text-xs text-slate-400">
            Margin:{" "}
            <span className="text-emerald-400 font-semibold">
              {(((Number(form.sellingPrice) - Number(form.costPrice)) / Number(form.sellingPrice)) * 100).toFixed(1)}%
            </span>
            {" "}· Profit per unit:{" "}
            <span className="text-emerald-400 font-semibold">
              {(Number(form.sellingPrice) - Number(form.costPrice)).toLocaleString("fr-DZ")} DZD
            </span>
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-700/50">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={isPending}
          className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 rounded-lg shadow-lg shadow-rose-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
          {isPending ? (
            <><svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Saving…</>
          ) : (
            <>{isEdit ? "Save Changes" : "Create Product"}</>
          )}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;