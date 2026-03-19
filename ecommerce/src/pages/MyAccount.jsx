import { logoutUser } from "../utils/auth";

export default function MyAccount() {
  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>My Account</h2>

        <div style={styles.section}>
          <h3>👤 YOUR INFORMATION</h3>
          <p>📦 My Orders</p>
          <p>💰 Wallet</p>
          <p>💳 Payment Settings</p>
        </div>

        <div style={styles.section}>
          <h3>⚙️ OTHER INFORMATION</h3>
          <p>🔒 Account Privacy</p>
          <p>❓ Need Help</p>
          <p>ℹ️ General Info</p>
        </div>

        <button style={styles.logout} onClick={logoutUser}>
          Logout
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    padding: "30px",
    display: "flex",
    justifyContent: "center",
  },
  card: {
    width: "100%",
    maxWidth: "500px",
    background: "#fff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
  },
  title: {
    marginBottom: "20px",
  },
  section: {
    marginBottom: "20px",
  },
  logout: {
    width: "100%",
    padding: "12px",
    background: "#000",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};
