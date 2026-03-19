function ProductCard({ title }) {
  return (
    <div style={styles.card}>
      <div style={styles.image}>IMG</div>
      <h4>{title}</h4>
      <p>₹ 999</p>
    </div>
  );
}

export default ProductCard;

const styles = {
  card: {
    background: "#fff",
    borderRadius: "14px",
    padding: "15px",
    textAlign: "center",
    boxShadow: "0 6px 15px rgba(0,0,0,0.1)"
  },

  image: {
    height: "120px",
    background: "#eaeaea",
    borderRadius: "10px",
    marginBottom: "10px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  }
};
