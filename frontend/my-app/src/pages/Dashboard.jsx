import { useContext } from "react";
import { Link } from "react-router-dom";
import {
  useDashboardStats,
  useLowStock,
  useSalesLast7Days,
  useSalesByCategory,
  useTopProducts,
} from "../hooks/useDashboard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { AuthContext } from "../context/AuthContext";
import { formatCurrency } from "../utils/FormatDate";

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

const StatCard = ({ label, value, sub, icon, gradient, loading }) => (
  <div
    className={`relative overflow-hidden rounded-2xl p-5 border border-white/5 backdrop-blur-sm ${gradient}`}
  >
    <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full blur-2xl opacity-20 bg-white pointer-events-none" />
    <div className="relative flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-2">
          {label}
        </p>
        {loading ? (
          <div className="h-8 w-24 bg-white/10 rounded-lg animate-pulse mb-1" />
        ) : (
          <p className="text-2xl font-bold text-white tracking-tight leading-none">
            {value}
          </p>
        )}
        {sub && <p className="text-xs text-white/50 mt-2">{sub}</p>}
      </div>
      <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 backdrop-blur-sm border border-white/10">
        {icon}
      </div>
    </div>
  </div>
);

const SectionHeader = ({ title, sub, action }) => (
  <div className="flex items-center justify-between mb-4">
    <div>
      <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
    {action}
  </div>
);

const LowStockRow = ({ product }) => {
  const isOut = product.stock.quantity === 0;
  return (
    <div className="flex items-center gap-4 py-3 border-b border-slate-800/60 last:border-0">
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isOut ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-400"}`}
      >
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
            d={
              isOut
                ? "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                : "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            }
          />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-200 font-medium truncate">
          {product.name}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">SKU: {product.sku}</p>
      </div>
      <span
        className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold flex-shrink-0 ${isOut ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-400"}`}
      >
        {isOut ? "Out of stock" : `${product.stock.quantity} left`}
      </span>
    </div>
  );
};

const QuickAction = ({ to, label, sub, icon, color }) => (
  <Link
    to={to}
    className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700/40 hover:bg-slate-800 hover:border-slate-600/60 transition-all duration-200 group"
  >
    <div
      className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}
    >
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
        {label}
      </p>
      <p className="text-xs text-slate-500 truncate">{sub}</p>
    </div>
    <svg
      className="w-4 h-4 text-slate-600 group-hover:text-slate-400 ml-auto flex-shrink-0 transition-colors"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  </Link>
);

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch,
  } = useDashboardStats();
  const { data: lowStockData, isLoading: lowStockLoading } = useLowStock();
  const lowStockProducts = lowStockData?.products ?? [];
  const { data: salesLast7Days } = useSalesLast7Days();
  const { data: salesByCategory } = useSalesByCategory();
  const { data: topProducts } = useTopProducts();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">
            {greeting()}, {user?.name?.split(" ")[0] ?? "Admin"} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Here's what's happening with your beauty store today.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>

      {/* Error */}
      {statsError && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <svg
            className="w-4 h-4 text-red-400 flex-shrink-0"
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
          <p className="text-sm text-red-400">
            Failed to load stats.{" "}
            <button
              onClick={() => refetch()}
              className="underline hover:no-underline"
            >
              Try again
            </button>
          </p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          loading={statsLoading}
          value={formatCurrency(stats?.totalRevenue ?? 0, "DZD")}
          sub={`${stats?.totalSalesCount ?? 0} completed sales`}
          gradient="bg-gradient-to-br from-rose-600/30 to-pink-700/30"
          icon={
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
        <StatCard
          label="Total Products"
          loading={statsLoading}
          value={stats?.totalProducts ?? 0}
          sub="Active in catalog"
          gradient="bg-gradient-to-br from-violet-600/30 to-purple-700/30"
          icon={
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          }
        />
        <StatCard
          label="Categories"
          loading={statsLoading}
          value={stats?.totalCategories ?? 0}
          sub="Active categories"
          gradient="bg-gradient-to-br from-blue-600/30 to-cyan-700/30"
          icon={
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
          }
        />
        <StatCard
          label="Low Stock Alerts"
          loading={statsLoading}
          value={stats?.lowStockCount ?? 0}
          sub={
            (stats?.lowStockCount ?? 0) > 0
              ? "Needs attention"
              : "All items stocked"
          }
          gradient={
  (stats?.lowStockCount ?? 0) > 0
    ? "bg-gradient-to-br from-amber-600/30 to-orange-700/30"
    : "bg-gradient-to-br from-emerald-600/30 to-teal-700/30"
}
          icon={
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          }
        />
      </div>

      {/* Low stock + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Low stock — 2/3 */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-700/50 rounded-2xl p-5">
          <SectionHeader
            title="Low Stock Alerts"
            sub="Products at or below their threshold"
            action={
              <Link
                to="/products"
                className="text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors"
              >
                View all →
              </Link>
            }
          />
          {lowStockLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 py-3 border-b border-slate-800/60 last:border-0"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-800 animate-pulse" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-slate-800 rounded animate-pulse w-40" />
                    <div className="h-2 bg-slate-800/60 rounded animate-pulse w-24" />
                  </div>
                  <div className="h-5 w-20 bg-slate-800 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : lowStockProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-sm text-slate-400 font-medium">
                All products well stocked
              </p>
              <p className="text-xs text-slate-600">No items below threshold</p>
            </div>
          ) : (
            lowStockProducts.map((p) => <LowStockRow key={p._id} product={p} />)
          )}
        </div>

        {/* Quick actions — 1/3 */}
        <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-5">
          <SectionHeader title="Quick Actions" sub="Jump to common tasks" />
          <div className="space-y-2">
            {[
              {
                to: "/products",
                label: "Add Product",
                sub: "New item to catalog",
                color: "bg-rose-500/15 text-rose-400",
                d: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
              },
              {
                to: "/sales",
                label: "Record Sale",
                sub: "Log a new transaction",
                color: "bg-emerald-500/15 text-emerald-400",
                d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
              },
              {
                to: "/orders",
                label: "Create Order",
                sub: "Purchase from supplier",
                color: "bg-blue-500/15 text-blue-400",
                d: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z",
              },
              {
                to: "/suppliers",
                label: "Add Supplier",
                sub: "Register new supplier",
                color: "bg-violet-500/15 text-violet-400",
                d: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4",
              },
              {
                to: "/categories",
                label: "Manage Categories",
                sub: "Organise your catalog",
                color: "bg-amber-500/15 text-amber-400",
                d: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z",
              },
            ].map((item) => (
              <QuickAction
                key={item.to}
                to={item.to}
                label={item.label}
                sub={item.sub}
                color={item.color}
                icon={
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
                      d={item.d}
                    />
                  </svg>
                }
              />
            ))}
          </div>
        </div>
      </div>
      {/* ── Charts ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Line Chart — Revenue last 7 Days */}
        <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-5">
          <SectionHeader
            title="Revenue — Last 7 Days"
            sub="Daily sales revenue"
          />
          {salesLast7Days?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={salesLast7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#475569", fontSize: 11 }}
                  tickFormatter={(v) =>
                    new Date(v).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <YAxis
                  tick={{ fill: "#475569", fontSize: 11 }}
                  tickFormatter={(v) =>
                    new Intl.NumberFormat("fr-DZ", {
                      style: "currency",
                      currency: "DZD",
                      maximumFractionDigits: 0,
                    }).format(v)
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #1e293b",
                    borderRadius: 8,
                  }}
                  labelStyle={{ color: "#94a3b8", fontSize: 11 }}
                  formatter={(v) => [
                    new Intl.NumberFormat("fr-DZ", {
                      style: "currency",
                      currency: "DZD",
                    }).format(v),
                    "Revenue",
                  ]}
                  labelFormatter={(v) =>
                    new Date(v).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="rgba(244,63,94,0.7)"
                  strokeWidth={1.5}
                  dot={{ fill: "rgba(244,63,94,0.7)", r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-slate-600 text-sm">
              No sales data yet
            </div>
          )}
        </div>

        {/* Pie Chart — Sales by Category */}
        <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-5">
          <SectionHeader title="Sales by Category" sub="Revenue distribution" />
          {salesByCategory?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={salesByCategory}
                  dataKey="revenue"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                >
                  {salesByCategory.map((_, i) => (
                    <Cell
                      key={i}
                      fill={
                        [
                          "rgba(244,63,94,0.6)",
                          "rgba(139,92,246,0.6)",
                          "rgba(59,130,246,0.6)",
                          "rgba(16,185,129,0.6)",
                          "rgba(245,158,11,0.6)",
                          "rgba(236,72,153,0.6)",
                        ][i % 6]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #1e293b",
                    borderRadius: 8,
                  }}
                  formatter={(v) => [`$${v.toLocaleString()}`, "Revenue"]}
                />
                <Legend
                  formatter={(v) => (
                    <span style={{ color: "#94a3b8", fontSize: 12 }}>{v}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-slate-600 text-sm">
              No category data yet
            </div>
          )}
        </div>
      </div>

      {/* Bar Chart — Top Products */}
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-5">
        <SectionHeader title="Top 5 Products" sub="By total revenue" />
        {topProducts?.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topProducts} layout="vertical" barSize={14}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fill: "#475569", fontSize: 11 }}
                tickFormatter={(v) => `$${v.toLocaleString()}`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                width={120}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #1e293b",
                  borderRadius: 8,
                }}
                formatter={(v) => [`$${v.toLocaleString()}`, "Revenue"]}
              />
              <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
                {topProducts.map((_, i) => (
                  <Cell
                    key={i}
                    fill={
                      [
                        "rgba(244,63,94,0.6)",
                        "rgba(139,92,246,0.6)",
                        "rgba(59,130,246,0.6)",
                        "rgba(16,185,129,0.6)",
                        "rgba(245,158,11,0.6)",
                      ][i % 5]
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[220px] text-slate-600 text-sm">
            No product data yet
          </div>
        )}
      </div>
    </div>
  );
}
