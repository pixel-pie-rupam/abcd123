import React from 'react';

export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 18 }}>P</span>
        <span style={{ fontSize: 22, fontWeight: 700 }}>pragni<span style={{ color: 'var(--accent2)' }}>.</span></span>
      </div>
      <div className="spinner" />
    </div>
  );
}
