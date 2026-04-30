import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useUpdateProfile, useChangePassword } from "../hooks/useAuth";
import { formatDate } from "../utils/formatDate";

// ─── Shared field wrapper ──────────────────────────────────────────────────
const Field = ({ label, error, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</label>
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
   err ? "border-red-500/60 focus:ring-red-500/20"
       : "border-slate-700 hover:border-slate-600 focus:border-rose-500/60 focus:ring-rose-500/15",
  ].join(" ");

// ─── Alert banner ──────────────────────────────────────────────────────────
const Alert = ({ type, message }) => {
  const styles = {
    success: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    error:   "bg-red-500/10 border-red-500/30 text-red-400",
  };
  const icons = {
    success: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    error:   "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  };
  return (
    <div className={`flex items-start gap-2 border rounded-xl px-4 py-3 ${styles[type]}`}>
      <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icons[type]}/>
      </svg>
      <p className="text-sm">{message}</p>
    </div>
  );
};

// ─── Section card ──────────────────────────────────────────────────────────
const Card = ({ title, subtitle, icon, children }) => (
  <div className="bg-slate-900 border border-slate-700/50 rounded-2xl overflow-hidden">
    <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-700/50 bg-slate-800/40">
      <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/20 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={icon}/>
        </svg>
      </div>
      <div>
        <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    <div className="px-6 py-5">{children}</div>
  </div>
);

// ─── Profile Info Section ──────────────────────────────────────────────────
const ProfileSection = ({ user, onUpdated }) => {
  const updateMutation = useUpdateProfile();
  const { login } = useContext(AuthContext);

  const [form, setForm]   = useState({ name: user?.name ?? "", email: user?.email ?? "" });
  const [errors, setErrors] = useState({});
  const [alert, setAlert]   = useState(null);

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = "Name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email.";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setAlert(null);
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    updateMutation.mutate(
      { name: form.name.trim(), email: form.email.trim().toLowerCase() },
      {
        onSuccess: (res) => {
          const updated = res.data?.data ?? res.data;
          // Sync AuthContext so navbar shows new name immediately
          const stored = JSON.parse(localStorage.getItem("user") ?? "{}");
          const merged = { ...stored, ...updated };
          localStorage.setItem("user", JSON.stringify(merged));
          login({ data: merged });
          setAlert({ type: "success", message: "Profile updated successfully." });
          onUpdated?.();
        },
        onError: (err) =>
          setAlert({ type: "error", message: err?.response?.data?.message ?? err?.message ?? "Update failed." }),
      }
    );
  };

  return (
    <Card
      title="Profile Information"
      subtitle="Update your name and email address"
      icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {alert && <Alert type={alert.type} message={alert.message} />}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full Name" error={errors.name}>
            <input value={form.name}
              onChange={(e) => { setForm((p) => ({ ...p, name: e.target.value })); setErrors((p) => ({ ...p, name: "" })); setAlert(null); }}
              placeholder="Your full name"
              className={inputCls(errors.name)} />
          </Field>
          <Field label="Email Address" error={errors.email}>
            <input type="email" value={form.email}
              onChange={(e) => { setForm((p) => ({ ...p, email: e.target.value })); setErrors((p) => ({ ...p, email: "" })); setAlert(null); }}
              placeholder="you@example.com"
              className={inputCls(errors.email)} />
          </Field>
        </div>

        <div className="flex justify-end pt-1">
          <button type="submit" disabled={updateMutation.isPending}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 rounded-xl shadow-lg shadow-rose-500/25 transition-all disabled:opacity-50">
            {updateMutation.isPending
              ? <><svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Saving…</>
              : "Save Changes"
            }
          </button>
        </div>
      </form>
    </Card>
  );
};

// ─── Change Password Section ───────────────────────────────────────────────
const PasswordSection = () => {
  const changeMutation = useChangePassword();

  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [errors, setErrors] = useState({});
  const [alert, setAlert]   = useState(null);

  const validate = () => {
    const e = {};
    if (!form.currentPassword)            e.currentPassword = "Current password is required.";
    if (!form.newPassword)                e.newPassword     = "New password is required.";
    else if (form.newPassword.length < 8) e.newPassword     = "Must be at least 8 characters.";
    if (form.newPassword !== form.confirmPassword) e.confirmPassword = "Passwords do not match.";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setAlert(null);
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    changeMutation.mutate(
      { currentPassword: form.currentPassword, newPassword: form.newPassword },
      {
        onSuccess: () => {
          setAlert({ type: "success", message: "Password changed successfully." });
          setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        },
        onError: (err) =>
          setAlert({ type: "error", message: err?.response?.data?.message ?? err?.message ?? "Failed to change password." }),
      }
    );
  };

  const EyeIcon = ({ visible, onClick }) => (
    <button type="button" onClick={onClick} tabIndex={-1}
      className="text-slate-500 hover:text-slate-300 transition-colors p-0.5">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {visible
          ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
          : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></>
        }
      </svg>
    </button>
  );

  const PasswordField = ({ name, label, showKey, placeholder, error }) => (
    <Field label={label} error={error}>
      <div className="relative">
        <input
          type={show[showKey] ? "text" : "password"}
          value={form[name]}
          onChange={(e) => { setForm((p) => ({ ...p, [name]: e.target.value })); setErrors((p) => ({ ...p, [name]: "" })); setAlert(null); }}
          placeholder={placeholder}
          className={`${inputCls(error)} pr-10`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <EyeIcon visible={show[showKey]} onClick={() => setShow((p) => ({ ...p, [showKey]: !p[showKey] }))} />
        </div>
      </div>
    </Field>
  );

  // Password strength
  const strength = (() => {
    const p = form.newPassword;
    if (!p) return null;
    let score = 0;
    if (p.length >= 8)  score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { label: "Weak",   color: "bg-red-500",    width: "w-1/5" };
    if (score <= 2) return { label: "Fair",   color: "bg-amber-500",  width: "w-2/5" };
    if (score <= 3) return { label: "Good",   color: "bg-blue-500",   width: "w-3/5" };
    if (score <= 4) return { label: "Strong", color: "bg-emerald-500", width: "w-4/5" };
    return { label: "Very Strong", color: "bg-emerald-400", width: "w-full" };
  })();

  return (
    <Card
      title="Change Password"
      subtitle="Use a strong password with at least 8 characters"
      icon="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {alert && <Alert type={alert.type} message={alert.message} />}

        <PasswordField name="currentPassword" label="Current Password" showKey="current"
          placeholder="Your current password" error={errors.currentPassword} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <PasswordField name="newPassword" label="New Password" showKey="new"
              placeholder="Min. 8 characters" error={errors.newPassword} />
            {/* Strength meter */}
            {strength && (
              <div className="space-y-1">
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                </div>
                <p className={`text-[10px] font-semibold ${
                  strength.label === "Weak" ? "text-red-400"
                  : strength.label === "Fair" ? "text-amber-400"
                  : strength.label === "Good" ? "text-blue-400"
                  : "text-emerald-400"
                }`}>{strength.label}</p>
              </div>
            )}
          </div>
          <PasswordField name="confirmPassword" label="Confirm Password" showKey="confirm"
            placeholder="Repeat new password" error={errors.confirmPassword} />
        </div>

        <div className="flex justify-end pt-1">
          <button type="submit" disabled={changeMutation.isPending}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 rounded-xl shadow-lg shadow-rose-500/25 transition-all disabled:opacity-50">
            {changeMutation.isPending
              ? <><svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Changing…</>
              : "Change Password"
            }
          </button>
        </div>
      </form>
    </Card>
  );
};

// ─── Main Profile Page ─────────────────────────────────────────────────────
export default function Profile() {
  const { user } = useContext(AuthContext);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-100">My Profile</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your account settings and password</p>
      </div>

      {/* Avatar card */}
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6">
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center shadow-xl shadow-rose-500/30 border border-rose-400/20">
              <span className="text-3xl font-bold text-white">
                {user?.name?.[0]?.toUpperCase() ?? "A"}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-slate-900" title="Active" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-slate-100 truncate">{user?.name ?? "Admin"}</h2>
            <p className="text-sm text-slate-400 truncate mt-0.5">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/20 capitalize">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                </svg>
                {user?.role ?? "admin"}
              </span>
              <span className="text-xs text-slate-600">
                · Member since {formatDate(user?.createdAt ?? new Date())}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile form */}
      <ProfileSection user={user} />

      {/* Password form */}
      <PasswordSection />

      {/* Account info strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: "Account Status", value: "Active",     color: "text-emerald-400" },
          { label: "Role",           value: user?.role ?? "admin",  color: "text-rose-400 capitalize" },
          { label: "Last Login",     value: formatDate(user?.lastLogin ?? new Date()), color: "text-slate-300" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-slate-900 border border-slate-700/40 rounded-xl px-4 py-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
            <p className={`text-sm font-semibold ${color}`}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}