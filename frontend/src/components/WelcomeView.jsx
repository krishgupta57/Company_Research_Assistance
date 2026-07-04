import React from 'react';

export default function WelcomeView({ onSearch }) {
  const examples = ['stripe.com', 'Tesla', 'Figma', 'OpenAI'];

  return (
    <div className="welcome-view fade-in">
      <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '1.5rem', display: 'block' }} className="animate-pulse">
        AI-Powered Intelligence
      </span>
      <h1 className="welcome-title">
        Know any company<br/>in minutes.
      </h1>
      <p className="welcome-subtitle">
        Enter a company name or website URL to get AI-powered insights, competitor analysis, pain points, and a professional PDF report.
      </p>
      
      <div className="example-tags">
        {examples.map(ex => (
          <button key={ex} onClick={() => onSearch(ex)} className="example-tag">
            {ex}
          </button>
        ))}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', width: '100%', marginTop: '3rem' }}>
        <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, var(--border-side))', flex: 1 }}></div>
        <span>Configure API keys in the sidebar to get started</span>
        <div style={{ height: '1px', background: 'linear-gradient(to left, transparent, var(--border-side))', flex: 1 }}></div>
      </div>
    </div>
  );
}
