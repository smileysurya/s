import { useMemo, useState } from "react";
import { Package, Search, ShoppingBag, Sparkles } from "lucide-react";

const defaultProducts = [
  { _id: "p-1", name: "Industrial Paper Rolls", category: "Packaging", sellerCompany: "Apex Mills", price: 1250, stock: 120, gstPercent: 18, city: "Mumbai" },
  { _id: "p-2", name: "Office Chair Batch", category: "Furniture", sellerCompany: "SeatCraft", price: 4200, stock: 40, gstPercent: 18, city: "Bengaluru" },
  { _id: "p-3", name: "Safety Helmet Bulk Pack", category: "Industrial", sellerCompany: "ShieldPro", price: 680, stock: 300, gstPercent: 12, city: "Hyderabad" },
  { _id: "p-4", name: "Corporate Gift Set", category: "Gifting", sellerCompany: "BrandNest", price: 950, stock: 180, gstPercent: 18, city: "Delhi" },
];

const readProducts = () => {
  try {
    const local = JSON.parse(localStorage.getItem("b2b_products") || "[]");
    return [...local, ...defaultProducts].filter((item, index, arr) => arr.findIndex((match) => match._id === item._id) === index);
  } catch {
    return defaultProducts;
  }
};

export default function ProductCatalog({ activeRole, onAddToCart, initialFilters, onAddProduct }) {
  const [query, setQuery] = useState(initialFilters?.query || "");
  const [city, setCity] = useState(initialFilters?.city || "All");
  const [category, setCategory] = useState(initialFilters?.category || "All");
  const products = readProducts();

  const cities = ["All", ...new Set(products.map((item) => item.city))];
  const categories = ["All", ...new Set(products.map((item) => item.category))];

  const filtered = useMemo(() => {
    return products.filter((item) => {
      const matchesQuery = item.name.toLowerCase().includes(query.toLowerCase()) || item.sellerCompany.toLowerCase().includes(query.toLowerCase());
      const matchesCity = city === "All" || item.city === city;
      const matchesCategory = category === "All" || item.category === category;
      return matchesQuery && matchesCity && matchesCategory;
    });
  }, [products, query, city, category]);

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <div>
          <div style={styles.badge}><Sparkles size={15} /> Marketplace catalog</div>
          <h3 style={styles.title}>Discover verified B2B inventory</h3>
          <p style={styles.subtitle}>This replaces the missing marketplace component with a clean buyer-seller catalog that works with your existing B2B page.</p>
        </div>
        {activeRole === "seller" && (
          <button type="button" onClick={onAddProduct} style={styles.addBtn}>List Product</button>
        )}
      </div>

      <div style={styles.filters}>
        <div style={styles.searchWrap}>
          <Search size={16} color="#64748b" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products or sellers" style={styles.searchInput} />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={styles.select}>{categories.map((item) => <option key={item}>{item}</option>)}</select>
        <select value={city} onChange={(e) => setCity(e.target.value)} style={styles.select}>{cities.map((item) => <option key={item}>{item}</option>)}</select>
      </div>

      <div style={styles.grid}>
        {filtered.map((item) => (
          <article key={item._id} style={styles.card}>
            <div style={styles.cardHead}>
              <div>
                <div style={styles.meta}>{item.category} • {item.city}</div>
                <h4 style={styles.cardTitle}>{item.name}</h4>
              </div>
              <div style={styles.stock}>Stock {item.stock}</div>
            </div>
            <div style={styles.company}>{item.sellerCompany}</div>
            <div style={styles.footer}>
              <div>
                <div style={styles.price}>Rs. {item.price.toLocaleString("en-IN")}</div>
                <div style={styles.tax}>GST {item.gstPercent}%</div>
              </div>
              <button type="button" onClick={() => onAddToCart?.(item)} style={styles.cartBtn}>
                <ShoppingBag size={15} />
                Add
              </button>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={styles.empty}>
          <Package size={28} />
          No products matched these filters.
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { display: "grid", gap: "18px" },
  hero: { display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "end", flexWrap: "wrap", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "22px", padding: "22px" },
  badge: { display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 12px", background: "#eff6ff", color: "#1d4ed8", borderRadius: "999px", fontWeight: 700, fontSize: "0.82rem", marginBottom: "10px" },
  title: { margin: 0, color: "#0f172a", fontSize: "1.3rem" },
  subtitle: { margin: "8px 0 0", color: "#64748b", maxWidth: "700px", lineHeight: 1.6 },
  addBtn: { border: "none", background: "#0f172a", color: "#fff", borderRadius: "14px", padding: "12px 16px", cursor: "pointer", fontWeight: 800 },
  filters: { display: "grid", gridTemplateColumns: "minmax(220px, 1fr) 180px 180px", gap: "12px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "22px", padding: "18px" },
  searchWrap: { display: "flex", alignItems: "center", gap: "8px", border: "1px solid #cbd5e1", borderRadius: "14px", padding: "0 12px" },
  searchInput: { width: "100%", border: "none", outline: "none", padding: "12px 0", background: "transparent" },
  select: { border: "1px solid #cbd5e1", borderRadius: "14px", padding: "12px 14px", outline: "none", background: "#fff" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" },
  card: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "18px", display: "grid", gap: "14px" },
  cardHead: { display: "flex", justifyContent: "space-between", gap: "10px" },
  meta: { color: "#64748b", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" },
  cardTitle: { margin: 0, color: "#0f172a" },
  stock: { color: "#166534", background: "#f0fdf4", borderRadius: "999px", padding: "8px 10px", height: "fit-content", fontSize: "0.78rem", fontWeight: 700 },
  company: { color: "#475569", fontWeight: 600 },
  footer: { display: "flex", justifyContent: "space-between", alignItems: "end", gap: "12px" },
  price: { color: "#0f172a", fontSize: "1.1rem", fontWeight: 800 },
  tax: { color: "#64748b", fontSize: "0.82rem" },
  cartBtn: { border: "none", background: "#2563eb", color: "#fff", borderRadius: "12px", padding: "10px 14px", display: "inline-flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: 700 },
  empty: { background: "#fff", border: "1px dashed #cbd5e1", borderRadius: "20px", padding: "28px", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" },
};
