import React, { useState } from 'react';
import { useAdmin } from './AdminContext';
import { adminLogin } from '../utils/api';

export default function AdminLogin() {
  const { login } = useAdmin();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const r = await adminLogin(form.email, form.password);
      login(r.data.token, r.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 24 }}>
      <div style={{ position: 'fixed', top: 20, right: 20 }}>
      </div>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 24, margin: '0 auto 16px' }}>P</div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Pragni Tech Admin</h1>
          <p style={{ fontSize: 14, color: 'var(--text3)', marginTop: 4 }}>Secure access portal</p>
        </div>
        <div className="card card-inner">
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {error && <div className="tag red" style={{ borderRadius: 10, padding: '10px 14px', fontSize: 13, justifyContent: 'flex-start' }}>⚠️ {error}</div>}
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input type="email" className="input" required placeholder="admin@pragni-tech.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} autoComplete="username" />
            </div>
            <div className="input-group">
              <label className="input-label">Password</label>
              <input type="password" className="input" required placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} autoComplete="current-password" />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 4 }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>
        </div>
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text3)', marginTop: 24 }}>
          This portal is for authorized personnel only.
        </p>
      </div>
    </div>
  );
}
