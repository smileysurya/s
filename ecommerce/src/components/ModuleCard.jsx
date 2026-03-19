import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function ModuleCard({ title, icon, path, description, phase, reference }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={() => navigate(path)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...styles.card,
        transform: isHovered ? "translateY(-4px)" : "translateY(0)",
        borderColor: isHovered ? "#000000" : "#e5e5e5",
        boxShadow: isHovered ? "0 8px 16px rgba(0,0,0,0.08)" : "0 2px 4px rgba(0,0,0,0.02)",
      }}
    >
      <div style={{
        ...styles.iconContainer,
        backgroundColor: isHovered ? "#000000" : "#f5f5f5",
        color: isHovered ? "#ffffff" : "#000000",
      }}>
        {icon}
      </div>
      <div style={styles.title}>{title}</div>
      {phase ? <div style={styles.phase}>{phase}</div> : null}
      {description ? <div style={styles.description}>{description}</div> : null}
      {reference ? <div style={styles.reference}>Inspired by {reference}</div> : null}
    </div>
  );
}

const styles = {
  card: {
    cursor: "pointer",
    backgroundColor: "#ffffff",
    padding: "24px 20px",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #e5e5e5",
    transition: "all 0.2s ease-in-out",
    textAlign: "center",
    gap: "6px",
  },
  iconContainer: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "16px",
    transition: "all 0.2s ease-in-out",
  },
  title: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "#111111",
  },
  phase: {
    fontSize: "0.74rem",
    color: "#1d4ed8",
    fontWeight: 700,
    background: "#eff6ff",
    borderRadius: "999px",
    padding: "4px 8px",
  },
  description: {
    fontSize: "0.82rem",
    color: "#64748b",
    lineHeight: 1.5,
  },
  reference: {
    fontSize: "0.76rem",
    color: "#0f172a",
    fontWeight: 600,
  },
};
