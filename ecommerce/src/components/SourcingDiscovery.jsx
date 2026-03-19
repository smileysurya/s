import { useState } from "react";
import { Search, X } from "lucide-react";

export default function SourcingDiscovery({ onClose, onSelectDiscovery }) {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("All");
  const [category, setCategory] = useState("All");

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div>
            <h3 style={styles.title}>Sourcing discovery</h3>
            <p style={styles.subtitle}>Choose a quick filter set and jump into the B2B marketplace with context.</p>
          </div>
          <button type="button" onClick={onClose} style={styles.close}><X size={18} /></button>
        </div>

        <div style={styles.body}>
          <div style={styles.searchWrap}>
            <Search size={16} color="#64748b" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by product or supplier" style={styles.inputBare} />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={styles.field}>
            <option>All</option>
            <option>Packaging</option>
            <option>Furniture</option>
            <option>Industrial</option>
            <option>Gifting</option>
          </select>
          <select value={city} onChange={(e) => setCity(e.target.value)} style={styles.field}>
            <option>All</option>
            <option>Mumbai</option>
            <option>Bengaluru</option>
            <option>Hyderabad</option>
            <option>Delhi</option>
          </select>
        </div>

        <div style={styles.actions}>
          <button type="button" onClick={onClose} style={styles.secondary}>Close</button>
          <button type="button" onClick={() => onSelectDiscovery?.({ query, city, category })} style={styles.primary}>Apply filters</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1400 },
  modal: { width: "min(560px, 92vw)", background: "#fff", borderRadius: "24px", padding: "24px", border: "1px solid #e2e8f0", display: "grid", gap: "18px" },
  header: { display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "start" },
  title: { margin: 0, color: "#0f172a" },
  subtitle: { margin: "8px 0 0", color: "#64748b", lineHeight: 1.6 },
  close: { border: "1px solid #cbd5e1", background: "#fff", borderRadius: "12px", width: "38px", height: "38px", cursor: "pointer" },
  body: { display: "grid", gap: "12px" },
  searchWrap: { display: "flex", alignItems: "center", gap: "8px", border: "1px solid #cbd5e1", borderRadius: "14px", padding: "0 12px" },
  inputBare: { width: "100%", border: "none", outline: "none", padding: "12px 0", background: "transparent" },
  field: { width: "100%", border: "1px solid #cbd5e1", borderRadius: "14px", padding: "12px 14px", outline: "none", background: "#fff" },
  actions: { display: "flex", justifyContent: "end", gap: "10px" },
  secondary: { border: "1px solid #cbd5e1", background: "#fff", borderRadius: "12px", padding: "11px 14px", cursor: "pointer", fontWeight: 700 },
  primary: { border: "none", background: "#2563eb", color: "#fff", borderRadius: "12px", padding: "11px 14px", cursor: "pointer", fontWeight: 800 },
};
