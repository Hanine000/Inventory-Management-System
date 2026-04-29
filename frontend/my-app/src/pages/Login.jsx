import { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLogin } from "../hooks/useAuth";
import { AuthContext } from "../context/AuthContext";

// ─── Decorative floating orb ──────────────────────────────────────────────
const Orb = ({ className }) => (
  <div className={`absolute rounded-full blur-3xl opacity-20 pointer-events-none ${className}`} />
);

// ─── Field component ──────────────────────────────────────────────────────
const Field = ({ label, error, children }) => (
  <div className="space-y-1.5">
    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.18em]">
      {label}
    </label>
    {children}
    {error && (
      <p className="flex items-center gap-1 text-xs text-red-400">
        <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd" />
        </svg>
        {error}
      </p>
    )}
  </div>
);

// ─── Main Login Page ──────────────────────────────────────────────────────
export default function Login() {
  const navigate     = useNavigate();
  const location     = useLocation();
  const { login }    = useContext(AuthContext);
  const loginMutation = useLogin();

  const [form, setForm]         = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");

  // Where to go after login (supports redirect-after-protect)
  const from = location.state?.from?.pathname ?? "/dashboard";

  // ── Validation ────────────────────────────────────────────────────────
  const validate = () => {
    const errors = {};
    if (!form.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      errors.email = "Enter a valid email address.";
    }
    if (!form.password) {
      errors.password = "Password is required.";
    } else if (form.password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field error on type
    if (fieldErrors[name]) setFieldErrors((p) => ({ ...p, [name]: "" }));
    if (serverError) setServerError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setServerError("");

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    loginMutation.mutate(
      { email: form.email.trim().toLowerCase(), password: form.password },
      {
        onSuccess: (response) => {
          // useLogin hook already stored to localStorage + queryClient
          // We also update AuthContext so the UI reflects immediately
          const userData = response.data?.data;
          if (userData) login({ data: userData });
          navigate(from, { replace: true });
        },
        onError: (err) => {
          setServerError(
            err?.response?.data?.message ||
            err?.message ||
            "Login failed. Please check your credentials."
          );
        },
      }
    );
  };

  const isPending = loginMutation.isPending;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* ── Background decoration ── */}
      <Orb className="w-[500px] h-[500px] bg-rose-500 -top-40 -right-40" />
      <Orb className="w-[400px] h-[400px] bg-pink-600 -bottom-32 -left-32" />
      <Orb className="w-[200px] h-[200px] bg-fuchsia-500 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(148,163,184,0.12) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* ── Card ── */}
      <div className="relative w-full max-w-md">
        {/* Glow ring */}
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-rose-500/30 via-transparent to-pink-600/20 blur-sm" />

        <div className="relative bg-slate-900/90 backdrop-blur-xl border border-slate-700/50
                        rounded-2xl shadow-2xl overflow-hidden">

          {/* Top accent line */}
          <div className="h-px bg-gradient-to-r from-transparent via-rose-500/60 to-transparent" />

          <div className="px-8 py-10">
            {/* ── Brand ── */}
            <div className="flex flex-col items-center mb-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-600
                              flex items-center justify-center shadow-xl shadow-rose-500/30 mb-5
                              ring-1 ring-rose-400/30">
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 2a5 5 0 015 5c0 2.5-1.5 4.5-3.5 5.5V14a1 1 0 01-1 1h-1a1 1 0 01-1-1v-1.5C8.5 11.5 7 9.5 7 7a5 5 0 015-5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 21h6M10 17h4v4h-4z" />
                </svg>
              </div>

              <h1 className="text-2xl font-bold text-slate-50 tracking-tight">
                Lumière
              </h1>
              <p className="text-xs text-rose-400/80 font-semibold tracking-[0.3em] uppercase mt-1">
                Beauty Admin
              </p>
              <p className="text-sm text-slate-500 mt-4 text-center leading-relaxed">
                Sign in to manage your cosmetics inventory
              </p>
            </div>

            {/* ── Server error banner ── */}
            {serverError && (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30
                              rounded-xl px-4 py-3 mb-6 animate-in fade-in slide-in-from-top-1 duration-200">
                <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none"
                  stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-400 leading-relaxed">{serverError}</p>
              </div>
            )}

            {/* ── Form ── */}
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Email */}
              <Field label="Email address" error={fieldErrors.email}>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="admin@lumiere.com"
                    autoComplete="email"
                    disabled={isPending}
                    className={[
                      "w-full pl-10 pr-4 py-3 bg-slate-800/50 rounded-xl text-sm text-slate-100",
                      "placeholder:text-slate-600 border transition-all duration-200",
                      "focus:outline-none focus:ring-2 focus:ring-offset-0",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      fieldErrors.email
                        ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/20"
                        : "border-slate-700/60 hover:border-slate-600 focus:border-rose-500/60 focus:ring-rose-500/15",
                    ].join(" ")}
                  />
                </div>
              </Field>

              {/* Password */}
              <Field label="Password" error={fieldErrors.password}>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    type={showPass ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={isPending}
                    className={[
                      "w-full pl-10 pr-11 py-3 bg-slate-800/50 rounded-xl text-sm text-slate-100",
                      "placeholder:text-slate-600 border transition-all duration-200",
                      "focus:outline-none focus:ring-2 focus:ring-offset-0",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      fieldErrors.password
                        ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/20"
                        : "border-slate-700/60 hover:border-slate-600 focus:border-rose-500/60 focus:ring-rose-500/15",
                    ].join(" ")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500
                               hover:text-slate-300 transition-colors p-0.5"
                    tabIndex={-1}
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    {showPass ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </Field>

              {/* Submit */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full mt-2 flex items-center justify-center gap-2.5 py-3 px-6
                           bg-gradient-to-r from-rose-500 to-pink-600
                           hover:from-rose-400 hover:to-pink-500
                           text-white text-sm font-semibold rounded-xl
                           shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50
                           transition-all duration-200 active:scale-[0.98]
                           disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100
                           focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                {isPending ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white/80" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10"
                        stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* ── Footer note ── */}
            <p className="text-center text-xs text-slate-600 mt-8">
              Access restricted to authorised personnel only.
            </p>
          </div>

          {/* Bottom accent line */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
        </div>

        {/* Version tag */}
        <p className="text-center text-[10px] text-slate-700 mt-4 tracking-widest uppercase">
          Lumière v1.0 · Beauty Management
        </p>
      </div>
    </div>
  );
}