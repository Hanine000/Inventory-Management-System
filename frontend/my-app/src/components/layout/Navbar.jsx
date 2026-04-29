import { useState, useRef, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const pageTitles = {
  "/dashboard":  { title: "Dashboard",    sub: "Overview & key metrics" },
  "/products":   { title: "Products",     sub: "Manage your product catalog" },
  "/categories": { title: "Categories",   sub: "Organise product categories" },
  "/brands":     { title: "Brands",       sub: "Beauty brand management" },
  "/sales":      { title: "Sales",        sub: "Sales transactions" },
  "/orders":     { title: "Orders",       sub: "Supplier purchase orders" },
  "/suppliers":  { title: "Suppliers",    sub: "Supplier directory" },
  "/ai":         { title: "AI Insights",  sub: "Forecasts & smart alerts" },
};

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout }    = useContext(AuthContext);
  const location            = useLocation();
  const navigate            = useNavigate();
  const [dropdown, setDropdown] = useState(false);
  const dropdownRef         = useRef(null);

  const page = pageTitles[location.pathname] ?? { title: "Admin Panel", sub: "" };

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    setDropdown(false);
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="h-16 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800/70
                       flex items-center px-5 gap-4 flex-shrink-0 z-10">
      {/* Sidebar toggle */}
      <button
        onClick={onToggleSidebar}
        className="p-2 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800
                   transition-colors flex-shrink-0"
        aria-label="Toggle sidebar"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-semibold text-slate-100 truncate leading-none">
          {page.title}
        </h1>
        {page.sub && (
          <p className="text-xs text-slate-600 hidden sm:block mt-0.5 truncate">{page.sub}</p>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Notification bell (placeholder) */}
        <button className="p-2 rounded-lg text-slate-500 hover:text-slate-200
                           hover:bg-slate-800 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002
                 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6
                 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6
                 0v-1m6 0H9" />
          </svg>
        </button>

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdown((v) => !v)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl
                       hover:bg-slate-800/70 transition-colors"
          >
            {/* Avatar */}
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-400 to-pink-600
                            flex items-center justify-center text-white text-xs font-bold
                            shadow-md shadow-rose-500/20 flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() ?? "A"}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-slate-200 leading-none">
                {user?.name ?? "Admin"}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5 capitalize">
                {user?.role ?? "admin"}
              </p>
            </div>
            <svg
              className={`w-3 h-3 text-slate-600 transition-transform duration-200 ${dropdown ? "rotate-180" : ""}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown menu */}
          {dropdown && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-slate-900
                            border border-slate-700/60 rounded-xl shadow-2xl py-1.5 z-50
                            animate-in fade-in zoom-in-95 duration-150 origin-top-right">
              {/* User info */}
              <div className="px-4 py-3 border-b border-slate-700/50">
                <p className="text-xs font-semibold text-slate-100 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{user?.email}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs
                             text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3
                         3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;