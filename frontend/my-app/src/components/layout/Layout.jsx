import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* ── Sidebar ── */}
      <Sidebar collapsed={collapsed} />

      {/* ── Main area ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Navbar */}
        <Navbar onToggleSidebar={() => setCollapsed((v) => !v)} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-slate-950">
          {/* Subtle grid texture */}
          <div
            className="min-h-full p-6"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(148,163,184,0.04) 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          >
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  );
};

export default Layout;