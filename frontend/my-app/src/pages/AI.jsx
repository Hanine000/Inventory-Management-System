import { useState } from "react";
import { useAlerts, useTopProducts, useForecast } from "../hooks/useAI";
import { formatCurrency, formatDateTime } from "../utils/formatDate";

// ─── Shared helpers ────────────────────────────────────────────────────────────
const SectionSkeleton = ({ rows = 4 }) => (
  <div className="space-y-3">
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/40 animate-pulse">
        <div className="w-8 h-8 rounded-lg bg-slate-700 flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 bg-slate-700 rounded w-40" />
          <div className="h-2 bg-slate-700/60 rounded w-24" />
        </div>
        <div className="h-5 w-16 bg-slate-700 rounded-full" />
      </div>
    ))}
  </div>
);

const ErrorBanner = ({ message, onRetry }) => (
  <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
    <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <p className="text-sm text-red-400 flex-1">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="text-xs text-red-400 underline hover:no-underline flex-shrink-0">Retry</button>
    )}
  </div>
);

const EmptyState = ({ icon, message, sub }) => (
  <div className="flex flex-col items-center justify-center py-12 gap-3">
    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
      <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
      </svg>
    </div>
    <p className="text-sm text-slate-400 font-medium">{message}</p>
    {sub && <p className="text-xs text-slate-600">{sub}</p>}
  </div>
);

// ─── Card shell ────────────────────────────────────────────────────────────────
const Card = ({ title, subtitle, badge, icon, iconColor = "text-rose-400", iconBg = "bg-rose-500/15 border-rose-500/20", children, action }) => (
  <div className="bg-slate-900 border border-slate-700/50 rounded-2xl overflow-hidden">
    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50 bg-slate-800/40">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <svg className={`w-4 h-4 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={icon} />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
            {badge !== undefined && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold border ${
                badge > 0
                  ? "bg-red-500/15 text-red-400 border-red-500/30"
                  : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
              }`}>
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

// ─── SECTION 1: Stock Alerts ───────────────────────────────────────────────────
const AlertRow = ({ item }) => {
  const isOut = item.status === "out_of_stock";
  const isOver = item.status === "overstock";

  const config = isOut
    ? { bg: "bg-red-500/10 border-red-500/20",    dot: "bg-red-500",    label: "Out of stock",  labelCls: "bg-red-500/15 text-red-400 border-red-500/30" }
    : isOver
    ? { bg: "bg-blue-500/10 border-blue-500/20",   dot: "bg-blue-400",   label: "Overstock",     labelCls: "bg-blue-500/15 text-blue-400 border-blue-500/30" }
    : { bg: "bg-amber-500/10 border-amber-500/20", dot: "bg-amber-400",  label: "Low stock",     labelCls: "bg-amber-500/15 text-amber-400 border-amber-500/30" };

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${config.bg}`}>
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${config.dot}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200 truncate">{item.name}</p>
        <p className="text-xs text-slate-500 mt-0.5">SKU: {item.sku} · Threshold: {item.threshold}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-sm font-bold text-slate-200">{item.quantity}</span>
        <span className="text-xs text-slate-500">units</span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${config.labelCls}`}>
          {config.label}
        </span>
      </div>
    </div>
  );
};

const AlertsSection = () => {
  const { data, isLoading, error, refetch } = useAlerts();
  const [tab, setTab] = useState("low");

  const lowStock  = data?.lowStock  ?? [];
  const overStock = data?.overStock ?? [];
  const totalAlerts = (data?.lowStockCount ?? 0) + (data?.overStockCount ?? 0);

  return (
    <Card
      title="Stock Alerts"
      subtitle="Products needing your attention"
      badge={totalAlerts}
      icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      iconColor="text-amber-400"
      iconBg="bg-amber-500/15 border-amber-500/20"
      action={
        <button onClick={() => refetch()}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      }
    >
      {error && <ErrorBanner message="Failed to load alerts." onRetry={refetch} />}

      {!error && (
        <>
          {/* Tabs */}
          <div className="flex gap-1 mb-4 bg-slate-800/60 rounded-xl p-1">
            {[
              { key: "low",  label: "Low / Out of Stock", count: data?.lowStockCount  ?? 0, color: "text-amber-400" },
              { key: "over", label: "Overstock",          count: data?.overStockCount ?? 0, color: "text-blue-400" },
            ].map(({ key, label, count, color }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                  tab === key ? "bg-slate-700 text-slate-100 shadow" : "text-slate-500 hover:text-slate-300"
                }`}>
                {label}
                <span className={`font-bold ${tab === key ? color : "text-slate-600"}`}>{count}</span>
              </button>
            ))}
          </div>

          {isLoading ? <SectionSkeleton /> : (
            tab === "low" ? (
              lowStock.length === 0
                ? <EmptyState icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" message="No low stock alerts" sub="All products are sufficiently stocked" />
                : <div className="space-y-2">{lowStock.map((p) => <AlertRow key={p._id} item={p} />)}</div>
            ) : (
              overStock.length === 0
                ? <EmptyState icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" message="No overstock alerts" sub="Inventory levels look healthy" />
                : <div className="space-y-2">{overStock.map((p) => <AlertRow key={p._id} item={p} />)}</div>
            )
          )}
        </>
      )}
    </Card>
  );
};

// ─── SECTION 2: Top Products ───────────────────────────────────────────────────
const ProductRankRow = ({ item, rank, type }) => {
  const isBest = type === "best";
  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-800/50 last:border-0">
      {/* Rank */}
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${
        rank === 1 ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
        : rank === 2 ? "bg-slate-400/10 text-slate-400 border border-slate-600"
        : rank === 3 ? "bg-orange-500/10 text-orange-500 border border-orange-500/20"
        : "bg-slate-800 text-slate-600 border border-slate-700"
      }`}>
        {rank}
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200 truncate">{item.productName}</p>
        <p className="text-xs text-slate-500 mt-0.5">SKU: {item.sku ?? "—"}</p>
      </div>
      {/* Stats */}
      <div className="text-right flex-shrink-0 space-y-0.5">
        <p className="text-sm font-bold text-slate-100">{item.totalQuantitySold} sold</p>
        <p className="text-xs text-slate-500">{formatCurrency(item.totalRevenue ?? 0)}</p>
      </div>
    </div>
  );
};

const TopProductsSection = () => {
  const { data, isLoading, error, refetch } = useTopProducts();
  const [tab, setTab] = useState("best");

  const bestSellers = data?.bestSellers ?? [];
  const slowMovers  = data?.slowMovers  ?? [];

  return (
    <Card
      title="Product Performance"
      subtitle={data?.period ? `Based on ${data.period}` : "Last 30 days"}
      icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      iconColor="text-violet-400"
      iconBg="bg-violet-500/15 border-violet-500/20"
    >
      {error && <ErrorBanner message="Failed to load product performance." onRetry={refetch} />}

      {!error && (
        <>
          <div className="flex gap-1 mb-4 bg-slate-800/60 rounded-xl p-1">
            {[
              { key: "best", label: "🏆 Best Sellers" },
              { key: "slow", label: "🐢 Slow Movers" },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                  tab === key ? "bg-slate-700 text-slate-100 shadow" : "text-slate-500 hover:text-slate-300"
                }`}>
                {label}
              </button>
            ))}
          </div>

          {isLoading ? <SectionSkeleton /> : (
            tab === "best" ? (
              bestSellers.length === 0
                ? <EmptyState icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10" message="No sales data yet" sub="Record some sales to see top performers" />
                : bestSellers.map((p, i) => <ProductRankRow key={p._id} item={p} rank={i + 1} type="best" />)
            ) : (
              slowMovers.length === 0
                ? <EmptyState icon="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" message="No slow movers detected" sub="All products are selling well" />
                : slowMovers.map((p, i) => <ProductRankRow key={p._id} item={p} rank={i + 1} type="slow" />)
            )
          )}
        </>
      )}
    </Card>
  );
};

// ─── SECTION 3: Forecast ───────────────────────────────────────────────────────
const GrowthBadge = ({ rate }) => {
  const isPos = rate > 0;
  const isNeutral = rate === 0;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${
      isNeutral ? "bg-slate-700 text-slate-400 border-slate-600"
      : isPos    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
      :            "bg-red-500/15 text-red-400 border-red-500/30"
    }`}>
      {isNeutral ? "—" : isPos ? `+${rate}%` : `${rate}%`}
    </span>
  );
};

const ForecastRow = ({ item }) => {
  const needsRestock = !item.stockSufficient;
  return (
    <div className={`p-4 rounded-xl border transition-colors ${
      needsRestock
        ? "bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10"
        : "bg-slate-800/40 border-slate-700/40 hover:bg-slate-800/60"
    }`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-slate-100 truncate">{item.productName}</p>
            {needsRestock && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex-shrink-0">
                Restock needed
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">SKU: {item.sku ?? "—"}</p>
        </div>
        <GrowthBadge rate={item.growthRate} />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Prev 30d",  value: item.previousQty,     color: "text-slate-300" },
          { label: "Recent 30d", value: item.recentQty,      color: "text-slate-100 font-semibold" },
          { label: "Predicted",  value: item.predictedNextMonth, color: needsRestock ? "text-amber-400 font-bold" : "text-emerald-400 font-bold" },
          { label: "In Stock",   value: item.currentStock,   color: needsRestock ? "text-red-400 font-semibold" : "text-slate-300" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-slate-900/60 rounded-lg px-2 py-2 text-center">
            <p className={`text-sm ${color}`}>{value}</p>
            <p className="text-[10px] text-slate-600 mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const ForecastSection = () => {
  const { data, isLoading, error, refetch } = useForecast();
  const [filter, setFilter] = useState("all");

  const allForecast = data?.forecast ?? [];
  const restockNeeded = allForecast.filter((f) => !f.stockSufficient);
  const sufficient    = allForecast.filter((f) =>  f.stockSufficient);

  const displayed = filter === "restock" ? restockNeeded
    : filter === "ok"      ? sufficient
    : allForecast;

  return (
    <Card
      title="Next Month Forecast"
      subtitle={data?.generatedAt ? `Generated ${formatDateTime(data.generatedAt)}` : "AI-powered demand prediction"}
      icon="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
      iconColor="text-cyan-400"
      iconBg="bg-cyan-500/15 border-cyan-500/20"
      action={
        <button onClick={() => refetch()}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      }
    >
      {error && <ErrorBanner message="Failed to load forecast." onRetry={refetch} />}

      {!error && (
        <>
          {/* Filter pills */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {[
              { key: "all",     label: "All Products", count: allForecast.length },
              { key: "restock", label: "⚠️ Restock Needed", count: restockNeeded.length },
              { key: "ok",      label: "✅ Stock OK", count: sufficient.length },
            ].map(({ key, label, count }) => (
              <button key={key} onClick={() => setFilter(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  filter === key
                    ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                    : "bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600"
                }`}>
                {label}
                <span className={`font-bold ${filter === key ? "text-rose-300" : "text-slate-600"}`}>
                  {count}
                </span>
              </button>
            ))}
          </div>

          {isLoading ? <SectionSkeleton rows={3} /> : (
            displayed.length === 0
              ? <EmptyState icon="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707" message="No forecast data available" sub="Record sales in the last 60 days to generate predictions" />
              : <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1 scrollbar-thin">
                  {displayed.map((item) => <ForecastRow key={item._id} item={item} />)}
                </div>
          )}
        </>
      )}
    </Card>
  );
};

// ─── Summary KPI strip ─────────────────────────────────────────────────────────
const SummaryStrip = () => {
  const alerts   = useAlerts();
  const topProds = useTopProducts();
  const forecast = useForecast();

  const restockCount  = forecast.data?.forecast?.filter((f) => !f.stockSufficient).length ?? 0;
  const bestRevenue   = topProds.data?.bestSellers?.reduce((s, p) => s + (p.totalRevenue ?? 0), 0) ?? 0;
  const lowStockCount = alerts.data?.lowStockCount  ?? 0;
  const overCount     = alerts.data?.overStockCount ?? 0;

  const items = [
    { label: "Low / Out of Stock", value: lowStockCount, color: lowStockCount > 0 ? "text-amber-400" : "text-emerald-400" },
    { label: "Overstock Items",    value: overCount,     color: overCount     > 0 ? "text-blue-400"  : "text-emerald-400" },
    { label: "Restock Needed",     value: restockCount,  color: restockCount  > 0 ? "text-red-400"   : "text-emerald-400" },
    { label: "Top 5 Revenue (30d)",value: formatCurrency(bestRevenue), color: "text-rose-400" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map(({ label, value, color }) => (
        <div key={label} className="bg-slate-900 border border-slate-700/40 rounded-xl px-4 py-3 text-center">
          <p className={`text-lg font-bold ${color}`}>{value}</p>
          <p className="text-xs text-slate-500 mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  );
};

// ─── Main AI Page ──────────────────────────────────────────────────────────────
export default function AI() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/30 to-violet-500/20 border border-cyan-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-100">AI Insights</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1.5 max-w-lg">
            Smart alerts, product performance analysis, and AI-powered demand forecasting for your beauty store.
          </p>
        </div>
        <span className="flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 tracking-wide uppercase">
          Live Data
        </span>
      </div>

      {/* KPI summary strip */}
      <SummaryStrip />

      {/* Main grid: Alerts + Top Products side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AlertsSection />
        <TopProductsSection />
      </div>

      {/* Forecast — full width */}
      <ForecastSection />
    </div>
  );
}

