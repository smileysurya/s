import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <div style={styles.navbar}>
      <h2 style={styles.logo}>UniCart</h2>

      <div
        style={styles.avatar}
        onClick={() => navigate("/account")}
      >
        👤
      </div>
    </div>
  );
}

const styles = {
  navbar: {
    height: "60px",
    background: "#000",
    color: "#fff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 20px",
  },
  logo: {
    fontSize: "20px",
  },
  avatar: {
    cursor: "pointer",
    fontSize: "24px",
  },
};
