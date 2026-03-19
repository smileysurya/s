import { useState } from "react";
import { Building2 } from "lucide-react";

const roles = ["buyer", "seller"];

export default function RegistrationForm({
  moduleType = "b2b",
  initialRole,
  availableRoles = [],
  onRegistrationSuccess,
}) {
  const [role, setRole] = useState(initialRole || "buyer");
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const appUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!appUser) {
      setMessage("Please use the main login page first, then come back to set your buyer or seller role.");
      return;
    }

    if (!form.email || !form.password) {
      setMessage("Email and password are required.");
      return;
    }

    const key = `${moduleType}_partners`;
    const partners = JSON.parse(localStorage.getItem(key) || "[]");
    const normalizedEmail = form.email.trim().toLowerCase();

    const partner = {
      id: `${moduleType}-${role}-${Date.now()}`,
      role,
      name: form.name.trim() || appUser.name || "Partner User",
      company: form.company.trim() || `${role === "seller" ? "Seller" : "Buyer"} Company`,
      email: normalizedEmail || appUser.email,
      phone: form.phone.trim(),
      password: form.password,
      userId: appUser.id,
    };

    const nextPartners = [...partners.filter((item) => !(item.email === normalizedEmail && item.role === role)), partner];
    localStorage.setItem(key, JSON.stringify(nextPartners));
    localStorage.setItem(`${moduleType}_partner`, JSON.stringify(partner));
    onRegistrationSuccess?.({ partner });
    setMessage(`${role === "seller" ? "Seller" : "Buyer"} account ready.`);
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div style={styles.badge}>
          <Building2 size={16} />
          Marketplace Role Setup
        </div>
        <h2 style={styles.title}>Choose your B2B role</h2>
        <p style={styles.subtitle}>The app login stays on the main login page. This form only activates your buyer or seller role inside B2B.</p>
      </div>

      <div style={styles.roleRow}>
        {roles.map((item) => (
          <button key={item} type="button" onClick={() => setRole(item)} style={{ ...styles.roleBtn, ...(role === item ? styles.roleBtnActive : {}) }}>
            {item === "buyer" ? "Buyer" : "Seller"}
            {availableRoles.includes(item) ? " ready" : ""}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input value={form.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="Full name" style={styles.input} />
        <input value={form.company} onChange={(e) => handleChange("company", e.target.value)} placeholder="Company name" style={styles.input} />
        <input value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} placeholder="Phone number" style={styles.input} />
        <input value={form.email} onChange={(e) => handleChange("email", e.target.value)} placeholder="Email address" style={styles.input} />
        <input type="password" value={form.password} onChange={(e) => handleChange("password", e.target.value)} placeholder="Role access password" style={styles.input} />
        {message ? <div style={styles.message}>{message}</div> : null}
        <button type="submit" style={styles.submit}>
          {`Activate ${role} workspace`}
        </button>
      </form>
    </div>
  );
}

const styles = {
  wrap: {
    width: "min(520px, 92vw)",
    background: "#fff",
    borderRadius: "24px",
    padding: "28px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 24px 50px rgba(15, 23, 42, 0.22)",
    display: "grid",
    gap: "18px",
  },
  header: { display: "grid", gap: "8px" },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "#eff6ff",
    color: "#1d4ed8",
    borderRadius: "999px",
    padding: "8px 12px",
    width: "fit-content",
    fontWeight: 700,
    fontSize: "0.84rem",
  },
  title: { margin: 0, color: "#0f172a" },
  subtitle: { margin: 0, color: "#64748b", lineHeight: 1.6 },
  roleRow: { display: "flex", gap: "10px" },
  roleBtn: {
    flex: 1,
    border: "1px solid #cbd5e1",
    background: "#fff",
    borderRadius: "14px",
    padding: "12px 14px",
    cursor: "pointer",
    fontWeight: 700,
  },
  roleBtnActive: { background: "#dbeafe", color: "#1d4ed8", borderColor: "#93c5fd" },
  form: { display: "grid", gap: "12px" },
  input: {
    width: "100%",
    border: "1px solid #cbd5e1",
    borderRadius: "14px",
    padding: "12px 14px",
    outline: "none",
  },
  message: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    color: "#334155",
    borderRadius: "14px",
    padding: "12px 14px",
    fontSize: "0.92rem",
  },
  submit: {
    border: "none",
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    color: "#fff",
    borderRadius: "14px",
    padding: "13px 16px",
    cursor: "pointer",
    fontWeight: 800,
  },
};
