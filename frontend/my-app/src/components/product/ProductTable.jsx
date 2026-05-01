import { formatCurrency, formatRelative } from "../../utils/formatDate";
import { useNavigate } from "react-router-dom";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Pill badge shared across status and stock states */
const Badge = ({ children, color }) => {
  const colors = {
    green: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    red: "bg-red-500/15    text-red-400    border-red-500/20",
    amber: "bg-amber-500/15  text-amber-400  border-amber-500/20",
    slate: "bg-slate-700/60  text-slate-400  border-slate-600/40",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${colors[color]}`}
    >
      {children}
    </span>
  );
};

/** Stock quantity cell — colours based on quantity vs threshold */
const StockCell = ({ stock }) => {
  const { quantity, lowStockThreshold } = stock;
  if (quantity === 0) return <Badge color="red">Out</Badge>;
  if (quantity <= lowStockThreshold)
    return <Badge color="amber">{quantity}</Badge>;
  return <span className="text-sm text-slate-300 font-medium">{quantity}</span>;
};

/** Primary image thumbnail or fallback icon */
const Thumbnail = ({ images, name }) => {
  const primary = images?.find((i) => i.isPrimary) ?? images?.[0];
  if (primary?.url) {
    return (
      <img
        src={primary.url}
        alt={primary.altText || name}
        className="min-w-[48px] w-12 h-12 rounded-lg object-cover border border-slate-700/60 flex-shrink-0" // ← هنا
      />
    );
  }
  return (
    <div className="min-w-[48px] w-16 h-16 rounded-lg bg-slate-800 border border-slate-700/40 flex items-center justify-center flex-shrink-0">
      {" "}
      // ← وهنا
      <svg
        className="w-5 h-5 text-slate-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
  );
};

/** Icon button used for row actions */
const ActionBtn = ({ onClick, title, danger = false, children }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={[
      "p-1.5 rounded-lg transition-colors duration-150",
      danger
        ? "text-slate-500 hover:text-red-400 hover:bg-red-500/10"
        : "text-slate-500 hover:text-rose-400 hover:bg-rose-500/10",
    ].join(" ")}
  >
    {children}
  </button>
);

/** Skeleton row shown while loading */
const SkeletonRow = () => (
  <tr className="border-b border-slate-800/60">
    {[40, 200, 100, 80, 80, 80, 60].map((w, i) => (
      <td key={i} className="px-4 py-3">
        <div
          className="h-3.5 bg-slate-800 rounded animate-pulse"
          style={{ width: w }}
        />
      </td>
    ))}
  </tr>
);

// ─── Column header ────────────────────────────────────────────────────────────
const Th = ({ children, className = "" }) => (
  <th
    className={`px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap ${className}`}
  >
    {children}
  </th>
);

// ─── Pagination ───────────────────────────────────────────────────────────────
const Pagination = ({
  page,
  pages,
  total,
  limit,
  onPageChange,
  onLimitChange,
}) => {
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-800/60">
      {/* Info */}
      <p className="text-xs text-slate-500 order-2 sm:order-1">
        Showing{" "}
        <span className="text-slate-300 font-medium">
          {from}–{to}
        </span>{" "}
        of <span className="text-slate-300 font-medium">{total}</span> products
      </p>

      {/* Controls */}
      <div className="flex items-center gap-2 order-1 sm:order-2">
        {/* Rows per page */}
        <select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-rose-500/40"
        >
          {[10, 20, 50].map((n) => (
            <option key={n} value={n}>
              {n} / page
            </option>
          ))}
        </select>

        {/* Prev */}
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 text-xs
                     hover:text-slate-200 hover:border-slate-600 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          ← Prev
        </button>

        {/* Page numbers (max 5 visible) */}
        {Array.from({ length: pages }, (_, i) => i + 1)
          .filter((p) => {
            if (pages <= 5) return true;
            if (p === 1 || p === pages) return true;
            return Math.abs(p - page) <= 1;
          })
          .reduce((acc, p, i, arr) => {
            if (i > 0 && p - arr[i - 1] > 1) acc.push("…");
            acc.push(p);
            return acc;
          }, [])
          .map((p, i) =>
            p === "…" ? (
              <span
                key={`ellipsis-${i}`}
                className="text-slate-600 text-xs px-1"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={[
                  "min-w-[30px] px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                  p === page
                    ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600",
                ].join(" ")}
              >
                {p}
              </button>
            ),
          )}

        {/* Next */}
        <button
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
          className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 text-xs
                     hover:text-slate-200 hover:border-slate-600 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProductTable({
  products    = [],
  total       = 0,
  page        = 1,
  pages       = 1,
  limit       = 10,
  loading     = false,
  onEdit,
  onDelete,
  onRestore,
  onPageChange,
  onLimitChange,
}) {
  const navigate = useNavigate(); 

  return (

    <div className="bg-slate-900 border border-slate-700/50 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          {/* Head */}
          <thead className="border-b border-slate-800">
            <tr>
              <Th className="w-20" /> {/* thumbnail */}
              <Th>Product</Th>
              <Th>Category / Brand</Th>
              <Th>Cost</Th>
              <Th>Selling</Th>
              <Th>Stock</Th>
              <Th>Status</Th>
              <Th>Added</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-slate-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </div>
                    <p className="text-sm text-slate-400 font-medium">
                      No products found
                    </p>
                    <p className="text-xs text-slate-600">
                      Try adjusting your filters or add a new product
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr
                  key={product._id}
                  onClick={() => navigate(`/products/${product._id}`)}
                  className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors duration-100 group cursor-pointer"
                >
                  {/* Thumbnail */}
                  <td className="pl-4 pr-2 py-3">
                    <Thumbnail images={product.images} name={product.name} />
                  </td>

                  {/* Name + supplier */}
                  <td className="px-4 py-3 max-w-[200px]">
                    <p className="text-sm font-semibold text-slate-100 truncate">
                      {product.name}
                    </p>
                    {product.supplier?.name && (
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {product.supplier.name}
                      </p>
                    )}
                  </td>

                  {/* Category + Brand */}
                  <td className="px-4 py-3">
                    <p className="text-xs text-slate-300 font-medium">
                      {product.category?.name ?? "—"}
                    </p>
                    {product.brand?.name && (
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {product.brand.name}
                      </p>
                    )}
                  </td>

                  {/* Cost price */}
                  <td className="px-4 py-3 text-sm text-slate-400 whitespace-nowrap">
                    {formatCurrency(product.price?.costPrice, "DZD", "fr-DZ")}
                  </td>

                  {/* Selling price */}
                  <td className="px-4 py-3 text-sm text-slate-200 font-medium whitespace-nowrap">
                    {formatCurrency(
                      product.price?.sellingPrice,
                      "DZD",
                      "fr-DZ",
                    )}
                  </td>

                  {/* Stock */}
                  <td className="px-4 py-3">
                    <StockCell
                      stock={
                        product.stock ?? { quantity: 0, lowStockThreshold: 10 }
                      }
                    />
                  </td>

                  {/* Active status */}
                  <td className="px-4 py-3">
                    <Badge color={product.isActive ? "green" : "slate"}>
                      {product.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>

                  {/* Created at */}
                  <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                    {formatRelative(product.createdAt)}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      {/* Edit — always available */}
                      <ActionBtn
                        title="Edit product"
                        onClick={() => onEdit?.(product)}
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </ActionBtn>

                      {/* Restore (inactive) or Delete (active) */}
                      {product.isActive ? (
                        <ActionBtn
                          title="Deactivate product"
                          danger
                          onClick={() => onDelete?.(product)}
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
                              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                            />
                          </svg>
                        </ActionBtn>
                      ) : (
                        <ActionBtn
                          title="Restore product"
                          onClick={() => onRestore?.(product)}
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
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                        </ActionBtn>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination — only when not loading and there are rows */}
      {!loading && total > 0 && (
        <Pagination
          page={page}
          pages={pages}
          total={total}
          limit={limit}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
        />
      )}
    </div>
  );
}
