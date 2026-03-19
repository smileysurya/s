import React, { useState } from 'react';
import { CreditCard, FileText, Download, CheckCircle, Plus } from 'lucide-react';

export default function Account() {
  const [activeTab, setActiveTab] = useState('billing');

  const plans = [
    { name: 'Basic', price: '$0/mo', current: false },
    { name: 'Pro', price: '$29/mo', current: true },
    { name: 'Enterprise', price: '$99/mo', current: false },
  ];

  return (
    <div style={styles.container}>
      <h2 style={{ color: '#000000', marginBottom: '2rem', fontWeight: 600 }}>Account Management</h2>

      <div style={styles.card}>
        {/* Tabs */}
        <div style={styles.tabs}>
          <button style={activeTab === 'billing' ? styles.activeTab : styles.tab} onClick={() => setActiveTab('billing')}>
            <CreditCard size={18} style={{ marginRight: '8px' }} /> Billing & Plans
          </button>
          <button style={activeTab === 'invoices' ? styles.activeTab : styles.tab} onClick={() => setActiveTab('invoices')}>
            <FileText size={18} style={{ marginRight: '8px' }} /> Invoices
          </button>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {activeTab === 'billing' && (
            <div>
              <h3 style={{ marginBottom: '1rem', color: '#111111', fontWeight: 600 }}>Subscription Plans</h3>
              <p style={{ color: '#555555', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Upgrade or downgrade your active workspace plan.</p>

              <div style={styles.planGrid}>
                {plans.map((plan, idx) => (
                  <div key={idx} style={plan.current ? styles.planCardActive : styles.planCard}>
                    {plan.current && <span style={styles.badge}>Current Plan</span>}
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', color: '#111111', fontWeight: 600 }}>{plan.name}</h4>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#000000', marginBottom: '1rem' }}>{plan.price}</div>
                    <button style={plan.current ? styles.planBtnActive : styles.planBtn}>
                      {plan.current ? 'Manage Plan' : 'Upgrade'}
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e5e5' }}>
                <h3 style={{ marginBottom: '1rem', color: '#111111', fontWeight: 600 }}>Payment Methods</h3>
                <div style={styles.paymentMethod}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={styles.cardIcon}>
                      <CreditCard size={24} color="#333" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#111111' }}>Visa ending in 4242</div>
                      <div style={{ fontSize: '0.85rem', color: '#555555' }}>Expires 12/2026</div>
                    </div>
                  </div>
                  <button style={styles.textBtn}>Edit</button>
                </div>
                <button style={{ ...styles.textBtn, marginTop: '1rem', color: '#000000', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                  <Plus size={16} /> Add new payment method
                </button>
              </div>
            </div>
          )}

          {activeTab === 'invoices' && (
            <div>
              <h3 style={{ marginBottom: '1rem', color: '#111111', fontWeight: 600 }}>Past Invoices</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e5e5', color: '#555555' }}>
                    <th style={{ padding: '1rem 0', fontWeight: 500 }}>Date</th>
                    <th style={{ padding: '1rem 0', fontWeight: 500 }}>Amount</th>
                    <th style={{ padding: '1rem 0', fontWeight: 500 }}>Status</th>
                    <th style={{ padding: '1rem 0', textAlign: 'right', fontWeight: 500 }}>Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f9fafb' }}>
                    <td style={{ padding: '1rem 0', color: '#333333' }}>Feb 1, 2026</td>
                    <td style={{ padding: '1rem 0', color: '#333333' }}>$29.00</td>
                    <td style={{ padding: '1rem 0' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#000000', fontWeight: 500 }}>
                        <CheckCircle size={16} /> Paid
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0', textAlign: 'right' }}>
                      <button style={{ ...styles.textBtn, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Download size={16} /> Download
                      </button>
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f9fafb' }}>
                    <td style={{ padding: '1rem 0', color: '#333333' }}>Jan 1, 2026</td>
                    <td style={{ padding: '1rem 0', color: '#333333' }}>$29.00</td>
                    <td style={{ padding: '1rem 0' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#000000', fontWeight: 500 }}>
                        <CheckCircle size={16} /> Paid
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0', textAlign: 'right' }}>
                      <button style={{ ...styles.textBtn, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Download size={16} /> Download
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '2rem' },
  card: { background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden', border: '1px solid #e5e5e5' },
  tabs: { display: 'flex', borderBottom: '1px solid #e5e5e5', background: '#fafafa' },
  tab: { display: 'flex', alignItems: 'center', padding: '1rem 1.5rem', border: 'none', background: 'transparent', color: '#666666', fontWeight: 500, cursor: 'pointer', fontSize: '0.95rem' },
  activeTab: { display: 'flex', alignItems: 'center', padding: '1rem 1.5rem', border: 'none', background: 'white', color: '#000000', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem', borderTop: '2px solid #000000' },
  content: { padding: '2rem' },
  planGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' },
  planCard: { border: '1px solid #e5e5e5', borderRadius: '8px', padding: '2rem', textAlign: 'center', transition: 'all 0.2s' },
  planCardActive: { border: '2px solid #000000', borderRadius: '8px', padding: '2rem', textAlign: 'center', position: 'relative', background: '#fafafa' },
  badge: { position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#000000', color: 'white', fontSize: '0.75rem', padding: '4px 12px', borderRadius: '99px', fontWeight: 600 },
  planBtn: { width: '100%', padding: '0.75rem', background: '#ffffff', border: '1px solid #cccccc', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, color: '#333333', transition: 'all 0.2s' },
  planBtnActive: { width: '100%', padding: '0.75rem', background: '#000000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, color: 'white', transition: 'all 0.2s' },
  paymentMethod: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', border: '1px solid #e5e5e5', borderRadius: '8px', background: '#fafafa' },
  cardIcon: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', background: '#ffffff', border: '1px solid #e5e5e5', borderRadius: '6px' },
  textBtn: { border: 'none', background: 'transparent', color: '#555555', cursor: 'pointer', fontWeight: 500, transition: 'color 0.2s' }
};
