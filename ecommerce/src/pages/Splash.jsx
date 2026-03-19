export default function Splash() {
  return (
    <div style={styles.wrapper}>
      <h1 style={styles.logo}>Unified E-Commerce Platform</h1>
    </div>
  );
}

const styles = {
  wrapper: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#000",
    color: "#fff"
  },
  logo: {
    fontSize: "32px",
    fontWeight: "700",
    letterSpacing: "2px"
  }
};
