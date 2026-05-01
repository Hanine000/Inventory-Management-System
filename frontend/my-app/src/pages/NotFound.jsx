import { useNavigate } from "react-router-dom";

const Orb = ({ className }) => (
  <div className={`absolute rounded-full blur-3xl opacity-20 pointer-events-none ${className}`} />
);

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <Orb className="w-[500px] h-[500px] bg-rose-500 -top-40 -right-40" />
      <Orb className="w-[400px] h-[400px] bg-pink-600 -bottom-32 -left-32" />

      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(148,163,184,0.12) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Card */}
      <div className="relative w-full max-w-md text-center">
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-rose-500/30 via-transparent to-pink-600/20 blur-sm" />

        <div className="relative bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden px-8 py-12">
          <div className="h-px bg-gradient-to-r from-transparent via-rose-500/60 to-transparent mb-8" />

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-600
                            flex items-center justify-center shadow-xl shadow-rose-500/30 ring-1 ring-rose-400/30">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 2a5 5 0 015 5c0 2.5-1.5 4.5-3.5 5.5V14a1 1 0 01-1 1h-1a1 1 0 01-1-1v-1.5C8.5 11.5 7 9.5 7 7a5 5 0 015-5z" />
              </svg>
            </div>
          </div>

          {/* 404 */}
          <h1 className="text-8xl font-bold bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent leading-none mb-4">
            404
          </h1>

          <h2 className="text-xl font-bold text-slate-100 mb-2">Page Not Found</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-8">
            The page you are looking for doesn't exist or has been moved.
          </p>

          <button
            onClick={() => navigate("/dashboard")}
            className="w-full flex items-center justify-center gap-2.5 py-3 px-6
                       bg-gradient-to-r from-rose-500 to-pink-600
                       hover:from-rose-400 hover:to-pink-500
                       text-white text-sm font-semibold rounded-xl
                       shadow-lg shadow-rose-500/30 transition-all duration-200
                       active:scale-[0.98] focus:outline-none focus:ring-2
                       focus:ring-rose-500/50 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go Back Home
          </button>

          <div className="h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent mt-8" />
        </div>

        <p className="text-center text-[10px] text-slate-700 mt-4 tracking-widest uppercase">
          Lumière v1.0 · Beauty Management
        </p>
      </div>
    </div>
  );
}