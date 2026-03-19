import { Link, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, User, ShoppingCart, Settings, LogOut, Briefcase, Shirt, Building2, HardHat, Users } from "lucide-react";

export default function SidebarLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { name: "Home", path: "/", icon: <LayoutDashboard size={20} /> },
    { name: "Profile", path: "/profile", icon: <User size={20} /> },
    { name: "Orders", path: "/orders", icon: <ShoppingCart size={20} /> },
    { name: "Account", path: "/account", icon: <Briefcase size={20} /> },
    { name: "Settings", path: "/settings", icon: <Settings size={20} /> },
  ];

  const quickLinks = [
    { name: "Dress", path: "/dress", icon: <Shirt size={18} /> },
    { name: "B2B", path: "/b2b", icon: <Building2 size={18} /> },
    { name: "Civil", path: "/civil", icon: <HardHat size={18} /> },
    { name: "Manpower", path: "/manpower", icon: <Users size={18} /> },
  ];

  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "250px",
          height: "100vh",
          backgroundColor: "#000000",
          color: "white",
          padding: "24px",
          position: "fixed",
          left: 0,
          top: 0,
          display: "flex",
          flexDirection: "column",
          boxShadow: "10px 0 40px rgba(15,23,42,0.12)",
          background: "linear-gradient(180deg, #020617 0%, #111827 100%)"
        }}
      >
        <div style={{ marginBottom: "28px" }}>
          <h2 style={{ marginBottom: "10px", fontWeight: 700, fontSize: "1.5rem", letterSpacing: "1px", color: "white" }}>UNIMART</h2>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem", lineHeight: 1.5 }}>Products, sourcing, rentals, and service modules in one working dashboard.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                style={{
                  ...linkStyle,
                  backgroundColor: isActive ? "#222222" : "transparent",
                  color: isActive ? "#ffffff" : "#a1a1aa",
                  fontWeight: isActive ? 600 : 500,
                  borderLeft: isActive ? "3px solid white" : "3px solid transparent",
                  paddingLeft: isActive ? "13px" : "16px"
                }}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}

          <div style={{ marginTop: "18px", paddingTop: "18px", borderTop: "1px solid #1f2937" }}>
            <div style={{ color: "#94a3b8", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
              Quick Access
            </div>
            {quickLinks.map((item) => (
              <Link key={item.name} to={item.path} style={{ ...linkStyle, color: "#cbd5e1" }}>
                {item.icon}
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom actions */}
        <div style={{ borderTop: "1px solid #222222", paddingTop: "20px", marginTop: "20px" }}>
          <div
            onClick={handleLogout}
            style={{
              ...linkStyle,
              cursor: "pointer",
              color: "#a1a1aa",
              paddingLeft: "16px"
            }}
          >
            <LogOut size={20} />
            Logout
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          marginLeft: "250px",
          width: "calc(100% - 250px)",
          padding: "32px",
          backgroundColor: "#f9fafb",
          minHeight: "100vh"
        }}
      >
        {children}
      </div>
    </div>
  );
}

const linkStyle = {
  textDecoration: "none",
  padding: "12px 16px",
  fontSize: "0.95rem",
  transition: "all 0.2s ease-in-out",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  borderRadius: "6px"
};
