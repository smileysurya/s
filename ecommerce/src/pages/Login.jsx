import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginLocalUser, registerLocalUser } from '../utils/localData';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin ? { email: formData.email, password: formData.password } : formData;

    try {
      const response = await fetch(`${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json().catch(() => null);

      if (response.ok && data?.token && data?.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/');
        return;
      }
    } catch (err) {
      try {
        const localSession = isLogin ? loginLocalUser(payload) : registerLocalUser(payload);
        localStorage.setItem('token', localSession.token);
        localStorage.setItem('user', JSON.stringify(localSession.user));
        navigate('/');
        return;
      } catch (localErr) {
        setError(localErr.message || err.message || 'Unable to continue');
        return;
      }
    }

    try {
      const localSession = isLogin ? loginLocalUser(payload) : registerLocalUser(payload);
      localStorage.setItem('token', localSession.token);
      localStorage.setItem('user', JSON.stringify(localSession.user));
      navigate('/');
    } catch (localErr) {
      setError((localErr && localErr.message) || 'Something went wrong');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{ color: '#000000', textAlign: 'center', marginBottom: '2rem', fontWeight: 700 }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {!isLogin && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} style={styles.input} required />
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} style={styles.input} required />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} style={styles.input} required />
          </div>

          <button type="submit" style={styles.button}>
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <p style={styles.toggleText}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span style={styles.toggleLink} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Create one' : 'Sign in'}
          </span>
        </p>
        <p style={styles.helperText}>
          If backend APIs are offline, this screen now falls back to local demo storage so the project still runs.
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f9fafb' },
  card: { background: 'white', padding: '3rem 2.5rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', width: '100%', maxWidth: '420px', border: '1px solid #e5e5e5' },
  error: { backgroundColor: '#fef2f2', color: '#dc2626', padding: '0.85rem', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center', fontWeight: 500, border: '1px solid #fecaca' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label: { fontSize: '0.9rem', color: '#111111', fontWeight: 600 },
  input: { padding: '0.85rem', border: '1px solid #d1d5db', borderRadius: '6px', outline: 'none', transition: 'border 0.2s', fontSize: '0.95rem' },
  button: { background: '#000000', color: 'white', padding: '0.85rem', border: 'none', borderRadius: '6px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', marginTop: '0.75rem', transition: 'background 0.2s' },
  toggleText: { textAlign: 'center', marginTop: '2rem', fontSize: '0.95rem', color: '#555555' },
  toggleLink: { color: '#000000', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' },
  helperText: { marginTop: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.82rem', lineHeight: 1.5 }
};
