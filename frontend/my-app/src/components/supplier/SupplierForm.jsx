import { useState } from "react";
import { useCreateSupplier, useUpdateSupplier } from "../../hooks/useSuppliers";

const inputCls = (err) =>
  ["w-full bg-slate-800/60 border rounded-lg px-3 py-2.5 text-sm text-slate-100",
   "placeholder:text-slate-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0",
   err
     ? "border-red-500/60 focus:ring-red-500/20"
     : "border-slate-700 hover:border-slate-600 focus:border-rose-500/60 focus:ring-rose-500/15",
  ].join(" ");

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

const SupplierForm = ({ supplier = null, onSuccess, onCancel }) => {
  const isEdit        = Boolean(supplier);
  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();
  const isPending     = createMutation.isPending || updateMutation.isPending;

  const [form, setForm] = useState({
    name:    supplier?.name    ?? "",
    email:   supplier?.email   ?? "",
    phone:   supplier?.phone   ?? "",
    address: supplier?.address ?? "",
    note:    supplier?.note    ?? "",
  });
  const [errors, setErrors]           = useState({});
  const [serverError, setServerError] = useState("");

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Supplier name is required.";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email))
      e.email = "Enter a valid email address.";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
    setServerError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setServerError("");
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const body = {
      name:    form.name.trim(),
      email:   form.email.trim()   || undefined,
      phone:   form.phone.trim()   || undefined,
      address: form.address.trim() || undefined,
      note:    form.note.trim()    || undefined,
    };

    const opts = {
      onSuccess: () => onSuccess?.(),
      onError: (err) =>
        setServerError(err?.response?.data?.message ?? err?.message ?? "Something went wrong."),
    };

    isEdit
      ? updateMutation.mutate({ id: supplier._id, body }, opts)
      : createMutation.mutate(body, opts);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* Server error */}
      {serverError && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p className="text-sm text-red-400">{serverError}</p>
        </div>
      )}

      {/* Name */}
      <Field label="Supplier Name" required error={errors.name}>
        <input name="name" value={form.name} onChange={handleChange}
          placeholder="Enter supplier name..." autoFocus
          className={inputCls(errors.name)} />
      </Field>

      {/* Email + Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Email" error={errors.email}>
          <input name="email" type="email" value={form.email} onChange={handleChange}
            placeholder="supplier@gmail.com"
            className={inputCls(errors.email)} />
        </Field>
        <Field label="Phone">
          <input name="phone" value={form.phone} onChange={handleChange}
            placeholder="+213 555 000 000"
            className={inputCls(false)} />
        </Field>
      </div>

      {/* Address */}
      <Field label="Address">
        <input name="address" value={form.address} onChange={handleChange}
          placeholder="Street, City, Country"
          className={inputCls(false)} />
      </Field>

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
            : isEdit ? "Save Changes" : "Create Supplier"
          }
        </button>
      </div>
    </form>
  );
};

export default SupplierForm;