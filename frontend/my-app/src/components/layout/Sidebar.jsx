import { useContext } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const navItems = [
  {
    group: "Overview",
    links: [
      { to: "/dashboard", label: "Dashboard",
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-3a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z"/> },
    ],
  },
  {
    group: "Catalog",
    links: [
      { to: "/products",   label: "Products",
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/> },
      { to: "/categories", label: "Categories",
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"/> },
      { to: "/brands",     label: "Brands",
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/> },
    ],
  },
  {
    group: "Operations",
    links: [
      { to: "/sales",     label: "Sales",
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/> },
      { to: "/orders",    label: "Orders",
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/> },
      { to: "/suppliers", label: "Suppliers",
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/> },
    ],
  },
  {
    group: "Intelligence",
    links: [
      { to: "/ai", label: "AI Insights", badge: "New",
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/> },
    ],
  },
];

const NavIcon = ({ d }) => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">{d}</svg>
);

const Sidebar = ({ collapsed = false }) => {
  const { user } = useContext(AuthContext);

  return (
    <aside className={["flex flex-col h-full bg-slate-950 border-r border-slate-800/70 transition-all duration-300 flex-shrink-0", collapsed ? "w-16" : "w-64"].join(" ")}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-800/70 flex-shrink-0">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/30">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2a5 5 0 015 5c0 2.5-1.5 4.5-3.5 5.5V14a1 1 0 01-1 1h-1a1 1 0 01-1-1v-1.5C8.5 11.5 7 9.5 7 7a5 5 0 015-5z"/>
          </svg>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-100 tracking-tight leading-none">Lumière</p>
            <p className="text-[10px] text-rose-400/80 font-semibold tracking-widest uppercase mt-0.5">Beauty Admin</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        {navItems.map((section) => (
          <div key={section.group} className="mb-5">
            {!collapsed && (
              <p className="px-5 mb-1.5 text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em]">
                {section.group}
              </p>
            )}
            <ul className="space-y-0.5 px-2">
              {section.links.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    className={({ isActive }) => ["flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group relative border",
                      isActive ? "bg-rose-500/15 text-rose-400 border-rose-500/20" : "text-slate-500 hover:text-slate-200 hover:bg-slate-800/60 border-transparent"].join(" ")}
                  >
                    {({ isActive }) => (
                      <>
                        <span className={isActive ? "text-rose-400" : "text-slate-500 group-hover:text-slate-300 transition-colors"}>
                          <NavIcon d={link.icon} />
                        </span>
                        {!collapsed && (
                          <>
                            <span className="flex-1 truncate">{link.label}</span>
                            {link.badge && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 tracking-wide">
                                {link.badge}
                              </span>
                            )}
                          </>
                        )}
                        {collapsed && (
                          <span className="absolute left-full ml-3 px-2.5 py-1 rounded-md bg-slate-800 text-slate-100 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl border border-slate-700 z-50">
                            {link.label}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* User footer */}
      {user && (
        <div className={["flex items-center gap-3 px-4 py-3 border-t border-slate-800/70 bg-slate-900/50 flex-shrink-0", collapsed ? "justify-center" : ""].join(" ")}>
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user.name?.[0]?.toUpperCase() ?? "A"}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate leading-none">{user.name}</p>
              <p className="text-[10px] text-slate-500 truncate mt-0.5 capitalize">{user.role ?? "admin"}</p>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};

export default Sidebar;