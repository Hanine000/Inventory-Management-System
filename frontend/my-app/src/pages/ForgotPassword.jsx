import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForgotPassword } from "../hooks/useAuth";

const Orb = ({ className }) => (
  <div className={`absolute rounded-full blur-3xl opacity-20 pointer-events-none ${className}`} />
);

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

export default function ForgotPassword() {
  const forgotMutation = useForgotPassword();
  const navigate = useNavigate();
  const [email,   setEmail]   = useState("");
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
  e.preventDefault();
  setError("");

  if (!email.trim()) return setError("Email is required.");
  if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email address.");

  forgotMutation.mutate(
    { email: email.trim().toLowerCase() },
    {
      onSuccess: () => setSuccess(true),
      onError: (err) => setError(err?.response?.data?.message ?? "Something went wrong."),
    }
  );
};

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <Orb className="w-[500px] h-[500px] bg-rose-500 -top-40 -right-40" />
      <Orb className="w-[400px] h-[400px] bg-pink-600 -bottom-32 -left-32" />

      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(148,163,184,0.12) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative w-full max-w-md">
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-rose-500/30 via-transparent to-pink-600/20 blur-sm" />

        <div className="relative bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-px bg-gradient-to-r from-transparent via-rose-500/60 to-transparent" />

          <div className="px-8 py-10">
            {/* Brand */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-600
                              flex items-center justify-center shadow-xl shadow-rose-500/30 mb-5 ring-1 ring-rose-400/30">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-50 tracking-tight">Forgot Password</h1>
              <p className="text-xs text-rose-400/80 font-semibold tracking-[0.3em] uppercase mt-1">Lumière Admin</p>
              <p className="text-sm text-slate-500 mt-4 text-center leading-relaxed">
                Enter your email and we'll send you a reset link.
              </p>
            </div>

            {/* Success state */}
            {success ? (
              <div className="space-y-5">
                <div className="flex flex-col items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-6 text-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm text-emerald-400 font-medium">Reset link sent!</p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    If <span className="text-slate-300">{email}</span> is registered,
                    you'll receive a reset link within a few minutes.
                    Check your spam folder too.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/login")}
                  className="w-full py-3 text-sm font-medium text-slate-400 bg-slate-800
                             hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Back to Sign in
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {error && (
                  <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                    <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                <Field label="Email address" error="">
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); }}
                      placeholder="admin@lumiere.com"
                      autoComplete="email"
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-3 bg-slate-800/50 rounded-xl text-sm text-slate-100
                                 placeholder:text-slate-600 border border-slate-700/60 hover:border-slate-600
                                 focus:border-rose-500/60 focus:ring-2 focus:ring-rose-500/15 focus:outline-none
                                 transition-all duration-200 disabled:opacity-50"
                    />
                  </div>
                </Field>

                <button
                  type="submit"
                  disabled={forgotMutation.isPending} 
                  className="w-full flex items-center justify-center gap-2.5 py-3 px-6
                             bg-gradient-to-r from-rose-500 to-pink-600
                             hover:from-rose-400 hover:to-pink-500
                             text-white text-sm font-semibold rounded-xl
                             shadow-lg shadow-rose-500/30 transition-all duration-200
                             active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed
                             focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                  {forgotMutation.isPending ? (  
    <>
      <svg className="animate-spin h-4 w-4 text-white/80" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      Sending…
                    </>
                  ) : (
                    <>
                      Send Reset Link
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="w-full py-3 text-sm font-medium text-slate-500 hover:text-slate-300 transition-colors"
                >
                  ← Back to Sign in
                </button>
              </form>
            )}
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
        </div>
      </div>
    </div>
  );
}