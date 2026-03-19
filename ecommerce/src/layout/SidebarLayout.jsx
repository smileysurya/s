import { Link } from "react-router-dom";

export default function SidebarLayout({ children }) {
  return (
    <div style={{ display: "flex" }}>
      
      {/* SIDEBAR */}
      <div
        style={{
          width: "230px",
          height: "100vh",
          backgroundColor: "#ffffff",
          color: "white",
          padding: "20px",
          position: "fixed",
          left: 0,
          top: 0
        }}
      >
        <h2 style={{ marginBottom: "30px" }}>UniMart</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <Link to="/" style={linkStyle}>Home</Link>
          <Link to="/login" style={linkStyle}>Login</Link>
          <Link to="/profile" style={linkStyle}>Profile</Link>
          <Link to="/orders" style={linkStyle}>Orders</Link>
          <Link to="/account" style={linkStyle}>Account</Link>
          <Link to="/settings" style={linkStyle}>Settings</Link>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div
        style={{
          marginLeft: "210px",
          width: "100%",
          padding: "20px"
        }}
      >
        {children}
      </div>
    </div>
  );
}

const linkStyle = {
  color: "white",
  textDecoration: "none",
  padding: "8px 0",
  fontSize: "15px"
};
