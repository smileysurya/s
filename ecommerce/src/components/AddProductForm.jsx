import { useState } from "react";

export default function AddProductForm({ product, onClose, onSuccess }) {
  const [form, setForm] = useState({
    _id: product?._id || `local-${Date.now()}`,
    name: product?.name || "",
    category: product?.category || "",
    sellerCompany: product?.sellerCompany || "",
    price: product?.price || "",
    stock: product?.stock || "",
    gstPercent: product?.gstPercent || 18,
    city: product?.city || "",
  });

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    const items = JSON.parse(localStorage.getItem("b2b_products") || "[]");
    const next = [
      { ...form, price: Number(form.price), stock: Number(form.stock), gstPercent: Number(form.gstPercent) },
      ...items.filter((item) => item._id !== form._id),
    ];
    localStorage.setItem("b2b_products", JSON.stringify(next));
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} style={styles.wrap}>
      <h3 style={styles.title}>{product ? "Edit product" : "Add product"}</h3>
      <div style={styles.grid}>
        <input value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="Product name" style={styles.input} />
        <input value={form.category} onChange={(e) => setField("category", e.target.value)} placeholder="Category" style={styles.input} />
        <input value={form.sellerCompany} onChange={(e) => setField("sellerCompany", e.target.value)} placeholder="Seller company" style={styles.input} />
        <input value={form.city} onChange={(e) => setField("city", e.target.value)} placeholder="City" style={styles.input} />
        <input type="number" value={form.price} onChange={(e) => setField("price", e.target.value)} placeholder="Price" style={styles.input} />
        <input type="number" value={form.stock} onChange={(e) => setField("stock", e.target.value)} placeholder="Stock" style={styles.input} />
      </div>
      <div style={styles.actions}>
        <button type="button" onClick={onClose} style={styles.secondary}>Cancel</button>
        <button type="submit" style={styles.primary}>Save product</button>
      </div>
    </form>
  );
}

const styles = {
  wrap: { width: "min(560px, 92vw)", background: "#fff", borderRadius: "24px", padding: "24px", display: "grid", gap: "16px", border: "1px solid #e2e8f0" },
  title: { margin: 0, color: "#0f172a" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  input: { width: "100%", border: "1px solid #cbd5e1", borderRadius: "14px", padding: "12px 14px", outline: "none" },
  actions: { display: "flex", justifyContent: "end", gap: "10px" },
  secondary: { border: "1px solid #cbd5e1", background: "#fff", borderRadius: "12px", padding: "11px 14px", cursor: "pointer", fontWeight: 700 },
  primary: { border: "none", background: "#2563eb", color: "#fff", borderRadius: "12px", padding: "11px 14px", cursor: "pointer", fontWeight: 800 },
};
