import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createLocalOrder, getLocalOrders, getStoredUser } from '../utils/localData';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchOrders = React.useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const res = await fetch('/api/orders', {
        headers: { 'x-auth-token': token }
      });

      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        const localUser = getStoredUser();
        setOrders(localUser ? getLocalOrders(localUser.id) : []);
      }
    } catch {
      const localUser = getStoredUser();
      if (localUser) {
        setOrders(getLocalOrders(localUser.id));
      } else {
        setError('Error fetching orders.');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const createFakeOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          items: [{ productName: 'Civil Engineering Toolset', quantity: 1, price: 1500 }],
          totalAmount: 1500
        })
      });

      if (res.ok) {
        fetchOrders();
        return;
      }
    } catch {
      const localUser = getStoredUser();
      if (localUser) {
        createLocalOrder({
          userId: localUser.id,
          module: 'Orders',
          itemName: 'Civil Engineering Toolset',
          quantity: 1,
          price: 1500
        });
        fetchOrders();
      }
    }
  };

  if (loading) return <div style={styles.container}>Loading orders...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={{ color: '#1e3a8a', margin: 0 }}>My Orders</h2>
        <button onClick={createFakeOrder} style={styles.simulateBtn}>
          + Simulate Order
        </button>
      </div>

      {error && <div style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</div>}

      {orders.length === 0 && !error ? (
        <div style={styles.emptyState}>You have no past orders.</div>
      ) : (
        <div style={styles.grid}>
          {orders.map((order) => (
            <div key={order._id} style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={{ fontWeight: 600, color: '#334155' }}>Order #{order._id.substring(order._id.length - 6)}</span>
                <span style={styles.badge(order.status)}>{order.status}</span>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>
                  Date: {new Date(order.createdAt).toLocaleDateString()}
                </div>

                <ul style={styles.list}>
                  {order.items.map((item, index) => (
                    <li key={index} style={styles.listItem}>
                      <span>{item.quantity}x {item.productName}</span>
                      <span style={{ fontWeight: 600 }}>${item.price}</span>
                    </li>
                  ))}
                </ul>

                <div style={styles.totalRow}>
                  <span>Total Amount</span>
                  <span style={{ fontSize: '1.2rem', color: '#1e3a8a' }}>${order.totalAmount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '2rem', backgroundColor: '#f8fafc', minHeight: '80vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  simulateBtn: { background: '#2563eb', color: 'white', border: 'none', padding: '0.6rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 },
  emptyState: { textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '8px', color: '#64748b' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' },
  card: { background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' },
  list: { listStyle: 'none', padding: 0, margin: '1rem 0', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' },
  listItem: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#475569' },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px dashed #cbd5e1', fontWeight: 700 },
  badge: (status) => {
    const colors = {
      'Pending': { bg: '#fef3c7', text: '#d97706' },
      'Processing': { bg: '#e0e7ff', text: '#4f46e5' },
      'Shipped': { bg: '#dcfce3', text: '#16a34a' },
      'Complete': { bg: '#ccfbf1', text: '#0d9488' }
    };
    const style = colors[status] || colors['Pending'];
    return {
      backgroundColor: style.bg,
      color: style.text,
      padding: '0.25rem 0.5rem',
      borderRadius: '999px',
      fontSize: '0.8rem',
      fontWeight: 'bold'
    };
  }
};
