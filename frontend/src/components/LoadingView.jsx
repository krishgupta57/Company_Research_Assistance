import React from 'react';

export default function LoadingView({ title }) {
  return (
    <div className="loading-container fade-in">
      <div className="spinner"></div>
      <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>Researching...</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '3rem' }}>{title}</p>
      
      <div style={{ width: '100%', maxWidth: '24rem', background: 'var(--bg-surface)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-side)', textAlign: 'left', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem', color: 'var(--primary)', marginBottom: '1rem', transform: 'translateX(8px)', transition: 'all 0.3s' }}>
            <div style={{ width: '1.25rem', height: '1.25rem', borderRadius: '50%', border: '2px solid var(--primary)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
            <span style={{ fontWeight: 500 }}>Scanning web for data...</span>
         </div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)', opacity: 0.5 }}>
            <div style={{ width: '1.25rem', height: '1.25rem', borderRadius: '50%', border: '2px solid currentColor' }}></div>
            <span style={{ fontWeight: 500 }}>Analyzing with OpenRouter AI...</span>
         </div>
      </div>
    </div>
  );
}
