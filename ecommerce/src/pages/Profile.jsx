import React, { useState, useEffect } from 'react';
import { getStoredUser, updateStoredUser } from '../utils/localData';

export default function Profile() {
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('/api/auth/profile', {
        headers: { 'x-auth-token': token }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      } else {
        const localUser = getStoredUser();
        if (localUser) setProfile(localUser);
      }
    } catch {
      const localUser = getStoredUser();
      if (localUser) setProfile(localUser);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ name: profile.name, phone: profile.phone, address: profile.address })
      });
      if (res.ok) {
        setMessage('Profile updated successfully!');
        setEditing(false);
        const user = await res.json().catch(() => profile);
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        const nextUser = updateStoredUser({ name: profile.name, phone: profile.phone, address: profile.address });
        if (nextUser) {
          setProfile(nextUser);
          setMessage('Profile updated locally.');
          setEditing(false);
        } else {
          setMessage('Failed to update profile.');
        }
      }
    } catch {
      const nextUser = updateStoredUser({ name: profile.name, phone: profile.phone, address: profile.address });
      if (nextUser) {
        setProfile(nextUser);
        setMessage('Profile updated locally.');
        setEditing(false);
      } else {
        setMessage('Error updating profile.');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  if (loading) return <div style={{ padding: '2rem', color: '#555' }}>Loading profile...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ color: '#000000', margin: 0, fontWeight: 600 }}>My Profile</h2>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>

        {message && <div style={{ marginBottom: '1.5rem', color: '#111', backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '6px', borderLeft: '4px solid #000', fontWeight: 500 }}>{message}</div>}

        <div style={styles.infoGroup}>
          <label style={styles.label}>Name</label>
          <input type="text" name="name" value={profile.name} onChange={handleChange} disabled={!editing} style={editing ? styles.inputActive : styles.inputDisabled} />
        </div>

        <div style={styles.infoGroup}>
          <label style={styles.label}>Email</label>
          <input type="email" value={profile.email} disabled style={styles.inputDisabled} />
        </div>

        <div style={styles.infoGroup}>
          <label style={styles.label}>Phone</label>
          <input type="text" name="phone" value={profile.phone} onChange={handleChange} disabled={!editing} style={editing ? styles.inputActive : styles.inputDisabled} />
        </div>

        <div style={styles.infoGroup}>
          <label style={styles.label}>Address</label>
          <textarea name="address" value={profile.address} onChange={handleChange} disabled={!editing} style={editing ? { ...styles.inputActive, height: '100px', resize: 'vertical' } : { ...styles.inputDisabled, height: '100px', resize: 'none' }} />
        </div>

        <div style={{ marginTop: '2.5rem' }}>
          {editing ? (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={handleSave} style={styles.saveBtn}>Save Changes</button>
              <button onClick={() => setEditing(false)} style={styles.cancelBtn}>Cancel</button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} style={styles.editBtn}>Edit Profile</button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '2rem' },
  card: { background: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', maxWidth: '650px', margin: '0 auto', border: '1px solid #e5e5e5' },
  infoGroup: { marginBottom: '1.5rem' },
  label: { display: 'block', marginBottom: '0.5rem', fontSize: '0.95rem', color: '#333333', fontWeight: 600 },
  inputDisabled: { width: '100%', padding: '0.85rem', border: '1px solid #e5e5e5', borderRadius: '6px', background: '#fafafa', color: '#666666', boxSizing: 'border-box', fontSize: '0.95rem' },
  inputActive: { width: '100%', padding: '0.85rem', border: '1px solid #000000', borderRadius: '6px', background: 'white', color: '#000000', outline: 'none', boxSizing: 'border-box', fontSize: '0.95rem', transition: 'border 0.2s' },
  editBtn: { background: '#000000', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, transition: 'background 0.2s', width: '100%' },
  saveBtn: { background: '#000000', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, flex: 1, transition: 'background 0.2s' },
  cancelBtn: { background: '#ffffff', color: '#000000', border: '1px solid #cccccc', padding: '0.75rem 1.5rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, flex: 1, transition: 'background 0.2s' },
  logoutBtn: { background: 'transparent', color: '#666666', border: '1px solid #cccccc', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s' },
};
