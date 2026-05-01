import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useResetPassword } from "../hooks/useAuth";

const Orb = ({ className }) => (
  <div
    className={`absolute rounded-full blur-3xl opacity-20 pointer-events-none ${className}`}
  />
);

export default function ResetPassword() {
  const resetMutation = useResetPassword();
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!password) return "Password is required.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (password !== confirm) return "Passwords do not match.";
    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return setError(err);

    resetMutation.mutate(
      { token, newPassword: password },
      {
        onSuccess: () => setSuccess(true),
        onError: (err) =>
          setError(
            err?.response?.data?.message ?? "Link is invalid or expired.",
          ),
      },
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <Orb className="w-[500px] h-[500px] bg-rose-500 -top-40 -right-40" />
      <Orb className="w-[400px] h-[400px] bg-pink-600 -bottom-32 -left-32" />

      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(148,163,184,0.12) 1px, transparent 0)",
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
              <div
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-600
                              flex items-center justify-center shadow-xl shadow-rose-500/30 mb-5 ring-1 ring-rose-400/30"
              >
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-50 tracking-tight">
                Reset Password
              </h1>
              <p className="text-xs text-rose-400/80 font-semibold tracking-[0.3em] uppercase mt-1">
                Lumière Admin
              </p>
              <p className="text-sm text-slate-500 mt-4 text-center">
                Enter your new password below.
              </p>
            </div>

            {/* Success */}
            {success ? (
              <div className="space-y-5">
                <div className="flex flex-col items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-6 text-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-emerald-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-emerald-400 font-medium">
                    Password reset successfully!
                  </p>
                  <p className="text-xs text-slate-500">
                    You can now sign in with your new password.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/login")}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6
                             bg-gradient-to-r from-rose-500 to-pink-600
                             hover:from-rose-400 hover:to-pink-500
                             text-white text-sm font-semibold rounded-xl
                             shadow-lg shadow-rose-500/30 transition-all duration-200"
                >
                  Sign in
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {error && (
                  <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                    <svg
                      className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                {/* New password */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.18em]">
                    New Password
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </span>
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                      }}
                      placeholder="••••••••"
                      disabled={loading}
                      className="w-full pl-10 pr-11 py-3 bg-slate-800/50 rounded-xl text-sm text-slate-100
                                 placeholder:text-slate-600 border border-slate-700/60 hover:border-slate-600
                                 focus:border-rose-500/60 focus:ring-2 focus:ring-rose-500/15 focus:outline-none
                                 transition-all duration-200 disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-0.5"
                      tabIndex={-1}
                    >
                      {showPass ? (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.8}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.8}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.8}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.18em]">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </span>
                    <input
                      type={showPass ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => {
                        setConfirm(e.target.value);
                        setError("");
                      }}
                      placeholder="••••••••"
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-3 bg-slate-800/50 rounded-xl text-sm text-slate-100
                                 placeholder:text-slate-600 border border-slate-700/60 hover:border-slate-600
                                 focus:border-rose-500/60 focus:ring-2 focus:ring-rose-500/15 focus:outline-none
                                 transition-all duration-200 disabled:opacity-50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={resetMutation.isPending}
                  className="w-full flex items-center justify-center gap-2.5 py-3 px-6
                             bg-gradient-to-r from-rose-500 to-pink-600
                             hover:from-rose-400 hover:to-pink-500
                             text-white text-sm font-semibold rounded-xl
                             shadow-lg shadow-rose-500/30 transition-all duration-200
                             active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed
                             focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                  {resetMutation.isPending ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white/80"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Resetting…
                    </>
                  ) : (
                    <>
                      Reset Password
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </>
                  )}
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
