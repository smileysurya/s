import React, { useState } from 'react';

export default function Settings() {
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    marketing: false,
    newOrders: true
  });

  const [security, setSecurity] = useState({
    twoFactor: false
  });

  const toggleNotif = (key) => setNotifications({ ...notifications, [key]: !notifications[key] });
  const toggleSec = (key) => setSecurity({ ...security, [key]: !security[key] });

  return (
    <div style={styles.container}>
      <h2 style={{ color: '#000000', marginBottom: '2rem', fontWeight: 600 }}>Platform Settings</h2>

      <div style={styles.grid}>

        {/* Notifications */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Notifications</h3>
          <p style={styles.cardSubtitle}>Manage how UniMart contacts you.</p>

          <div style={styles.settingRow}>
            <div>
              <div style={styles.settingLabel}>Email Alerts</div>
              <div style={styles.settingDesc}>Receive critical system alerts via email.</div>
            </div>
            <Toggle isOn={notifications.emailAlerts} onToggle={() => toggleNotif('emailAlerts')} />
          </div>

          <div style={styles.settingRow}>
            <div>
              <div style={styles.settingLabel}>SMS Alerts</div>
              <div style={styles.settingDesc}>Get order updates sent to your phone.</div>
            </div>
            <Toggle isOn={notifications.smsAlerts} onToggle={() => toggleNotif('smsAlerts')} />
          </div>

          <div style={styles.settingRow}>
            <div>
              <div style={styles.settingLabel}>New Orders</div>
              <div style={styles.settingDesc}>Notify me when new B2B or Civil orders are placed.</div>
            </div>
            <Toggle isOn={notifications.newOrders} onToggle={() => toggleNotif('newOrders')} />
          </div>

          <div style={{ ...styles.settingRow, borderBottom: 'none' }}>
            <div>
              <div style={styles.settingLabel}>Marketing & Offers</div>
              <div style={styles.settingDesc}>Receive promotional emails and partner offers.</div>
            </div>
            <Toggle isOn={notifications.marketing} onToggle={() => toggleNotif('marketing')} />
          </div>
        </div>

        {/* Security & Access */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Security & Access</h3>
          <p style={styles.cardSubtitle}>Manage your account security and authentication.</p>

          <div style={styles.settingRow}>
            <div>
              <div style={styles.settingLabel}>Two-Factor Authentication</div>
              <div style={styles.settingDesc}>Require a secure code to log in.</div>
            </div>
            <Toggle isOn={security.twoFactor} onToggle={() => toggleSec('twoFactor')} />
          </div>

          <div style={{ ...styles.settingRow, borderBottom: 'none' }}>
            <div>
              <div style={styles.settingLabel}>Active Sessions</div>
              <div style={styles.settingDesc}>You are currently logged in from 1 device (Chrome, Windows).</div>
            </div>
            <button style={styles.dangerBtn}>Logout of all devices</button>
          </div>
        </div>

      </div>
    </div>
  );
}

// Simple reusable Toggle switch component inside this file for styling
const Toggle = ({ isOn, onToggle }) => (
  <div
    onClick={onToggle}
    style={{
      width: '44px', height: '24px', borderRadius: '24px',
      background: isOn ? '#000000' : '#e5e5e5',
      position: 'relative', cursor: 'pointer', transition: '0.2s ease-in-out'
    }}
  >
    <div style={{
      width: '20px', height: '20px', background: 'white', borderRadius: '50%',
      position: 'absolute', top: '2px', left: isOn ? '22px' : '2px',
      transition: '0.2s ease-in-out', boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
    }} />
  </div>
);

const styles = {
  container: { padding: '2rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' },
  card: { background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', border: '1px solid #e5e5e5' },
  cardTitle: { margin: '0 0 0.5rem 0', color: '#111111', fontSize: '1.2rem', fontWeight: 600 },
  cardSubtitle: { margin: '0 0 2rem 0', color: '#555555', fontSize: '0.95rem' },
  settingRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 0', borderBottom: '1px solid #f0f0f0' },
  settingLabel: { fontWeight: 600, color: '#333333', marginBottom: '0.25rem', fontSize: '1rem' },
  settingDesc: { fontSize: '0.85rem', color: '#666666' },
  dangerBtn: { padding: '0.6rem 1.25rem', background: 'white', color: '#000000', border: '1px solid #000000', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', alignSelf: 'center' }
};
