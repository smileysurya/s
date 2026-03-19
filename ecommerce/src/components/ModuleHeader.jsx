export default function ModuleHeader({ title, subtitle, children }) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        border: "1px solid #e2e8f0",
        borderRadius: "22px",
        padding: "24px",
        boxShadow: "0 12px 30px rgba(15, 23, 42, 0.06)",
        display: "grid",
        gap: "18px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "start", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.65rem", color: "#0f172a" }}>{title}</h1>
          <p style={{ margin: "8px 0 0", color: "#64748b", lineHeight: 1.6 }}>{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
