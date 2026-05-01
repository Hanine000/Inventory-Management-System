import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProduct } from "../hooks/useProducts";
import { useCategories } from "../hooks/useCategories";
import { useBrands } from "../hooks/useBrands";
import { useSuppliers } from "../hooks/useSuppliers";
import ProductForm from "../components/product/ProductForm";

// ─── SlideOver (same as Products.jsx) ────────────────────────────────────────
const SlideOver = ({ open, onClose, title, children }) => (
  <>
    {open && (
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
    )}
    <div
      className={[
        "fixed top-0 right-0 z-50 h-full w-full max-w-xl bg-slate-950 border-l border-slate-800",
        "shadow-2xl flex flex-col transition-transform duration-300 ease-in-out",
        open ? "translate-x-0" : "translate-x-full",
      ].join(" ")}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 flex-shrink-0">
        <h2 className="text-base font-semibold text-slate-100">{title}</h2>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
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
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
    </div>
  </>
);

// ─── Stat card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, accent }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-xl px-5 py-4 space-y-1">
    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
      {label}
    </p>
    <p className={`text-2xl font-bold ${accent ?? "text-slate-100"}`}>
      {value}
    </p>
    {sub && <p className="text-xs text-slate-600">{sub}</p>}
  </div>
);

// ─── Detail row ───────────────────────────────────────────────────────────────
const DetailRow = ({ label, value }) => (
  <div className="flex items-start justify-between py-3 border-b border-slate-800/60 last:border-0">
    <span className="text-xs text-slate-500 font-medium uppercase tracking-wider w-36 flex-shrink-0 pt-0.5">
      {label}
    </span>
    <span className="text-sm text-slate-200 text-right flex-1">
      {value ?? "—"}
    </span>
  </div>
);

// ─── Badge ────────────────────────────────────────────────────────────────────
const Badge = ({ active }) => (
  <span
    className={[
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
      active
        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
        : "bg-red-500/15 text-red-400 border border-red-500/25",
    ].join(" ")}
  >
    <span
      className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-400" : "bg-red-400"}`}
    />
    {active ? "Active" : "Inactive"}
  </span>
);

// ─── Stock indicator ──────────────────────────────────────────────────────────
const StockBar = ({ stock, threshold = 10 }) => {
  const pct = Math.min((stock / (threshold * 3)) * 100, 100);
  const isLow = stock <= threshold;
  const color = isLow ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span
          className={`text-xs font-medium ${isLow ? "text-amber-400" : "text-emerald-400"}`}
        >
          {isLow ? "⚠ Low stock" : "In stock"}
        </span>
        <span className="text-xs text-slate-500">{stock} units</span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// ─── Image gallery ────────────────────────────────────────────────────────────
const ImageGallery = ({ images = [], name }) => {
  const [active, setActive] = useState(0);

  if (!images.length) {
    return (
      <div className="aspect-square bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center">
        <svg
          className="w-12 h-12 text-slate-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="aspect-square bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <img
          src={images[active]}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={[
                "w-14 h-14 rounded-lg overflow-hidden border-2 transition-all",
                i === active
                  ? "border-rose-500"
                  : "border-slate-800 hover:border-slate-600",
              ].join(" ")}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Skeleton loader ──────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="animate-pulse space-y-6 max-w-7xl mx-auto">
    <div className="h-8 bg-slate-800 rounded-lg w-48" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="aspect-square bg-slate-800 rounded-xl" />
      <div className="lg:col-span-2 space-y-4">
        <div className="h-6 bg-slate-800 rounded w-3/4" />
        <div className="h-4 bg-slate-800 rounded w-1/2" />
        <div className="grid grid-cols-2 gap-4 mt-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-800 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function OneProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [panelOpen, setPanelOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useProduct(id);
  const product = data?.data ?? data ?? null;

  const { data: catData } = useCategories();
  const { data: brandData } = useBrands({ limit: 200 });
  const { data: supplierData } = useSuppliers({ limit: 200 });

  const categories = catData?.data ?? catData ?? [];
  const brands = brandData?.data ?? brandData ?? [];
  const suppliers = supplierData?.data ?? supplierData ?? [];

  const handleEditSuccess = () => {
    setPanelOpen(false);
    refetch();
  };

  if (isLoading) return <Skeleton />;

  if (isError || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
        <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-slate-300 font-medium">Product not found</p>
        <button
          onClick={() => navigate("/products")}
          className="text-sm text-rose-400 hover:text-rose-300 underline transition-colors"
        >
          Back to Products
        </button>
      </div>
    );
  }

  const images = product.images?.map(img => img.url) ?? [];
  const sellingPrice = Number(product.price?.sellingPrice ?? 0);
  const costPrice = Number(product.price?.costPrice ?? 0);
  const margin =
    sellingPrice && costPrice
      ? (((sellingPrice - costPrice) / sellingPrice) * 100).toFixed(1)
      : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Back + actions ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/products")}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors group"
        >
          <svg
            className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Products
        </button>

        <button
          onClick={() => setPanelOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white
                     bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500
                     rounded-xl shadow-lg shadow-rose-500/20 transition-all active:scale-[0.98]"
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
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Edit Product
        </button>
      </div>

      {/* ── Main layout ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: image */}
        <div>
          <ImageGallery images={images} name={product.name} />
        </div>

        {/* Right: info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Name + status */}
          <div className="space-y-2">
            <div className="flex items-start gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-100 leading-tight flex-1">
                {product.name}
              </h1>
              <Badge active={product.isActive ?? true} />
            </div>
            {product.description && (
              <p className="text-sm text-slate-400 leading-relaxed">
                {product.description}
              </p>
            )}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              label="Selling Price"
              value={`$${sellingPrice.toFixed(2)}`}
              accent="text-rose-400"
            />
            <StatCard label="Cost Price" value={`$${costPrice.toFixed(2)}`} />
            <StatCard
              label="Margin"
              value={margin ? `${margin}%` : "—"}
              accent={margin >= 30 ? "text-emerald-400" : "text-amber-400"}
            />
            <StatCard
              label="Stock"
              value={product.stock?.quantity ?? 0}
              sub="units available"
              accent={
                product.stock?.quantity <= product.stock?.lowStockThreshold
                  ? "text-amber-400"
                  : "text-slate-100"
              }
            />
          </div>

          {/* Stock bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-5 py-4">
            <StockBar
              stock={product.stock?.quantity ?? 0}
              threshold={product.stock?.lowStockThreshold ?? 10}
            />
          </div>

          {/* Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-5 py-2">
            <DetailRow label="SKU" value={product.sku} />
            <DetailRow
              label="Category"
              value={product.category?.name ?? product.category}
            />
            <DetailRow
              label="Brand"
              value={product.brand?.name ?? product.brand}
            />
            <DetailRow
              label="Supplier"
              value={product.supplier?.name ?? product.supplier}
            />
            
            <DetailRow
              label="Created"
              value={
                product.createdAt
                  ? new Date(product.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : null
              }
            />
            <DetailRow
              label="Updated"
              value={
                product.updatedAt
                  ? new Date(product.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : null
              }
            />
          </div>
        </div>
      </div>

      {/* ── Edit slide-over ─────────────────────────────────────────────────── */}
      <SlideOver
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        title="Edit Product"
      >
        {panelOpen && (
          <ProductForm
            product={product}
            categories={categories}
            brands={brands}
            suppliers={suppliers}
            onSuccess={handleEditSuccess}
            onCancel={() => setPanelOpen(false)}
          />
        )}
      </SlideOver>
    </div>
  );
}
