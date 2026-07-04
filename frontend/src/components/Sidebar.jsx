import React, { useState } from 'react';
import { Plus, Check, Settings, MessageSquare } from 'lucide-react';

export default function Sidebar({ config, setConfig, onNewResearch }) {
  const [tab, setTab] = useState('api');
  const [savedApi, setSavedApi] = useState(false);
  const [savedDiscord, setSavedDiscord] = useState(false);

  const handleChange = (e) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const handleSaveApi = () => {
    localStorage.setItem('rc_openrouter_key', config.openRouterKey);
    localStorage.setItem('rc_serper_key', config.serperKey);
    localStorage.setItem('rc_ai_model', config.model);
    setSavedApi(true);
    setTimeout(() => setSavedApi(false), 2000);
  };

  const handleSaveDiscord = () => {
    localStorage.setItem('rc_discord_token', config.discordToken);
    localStorage.setItem('rc_discord_channel', config.discordChannel);
    localStorage.setItem('rc_app_name', config.appName);
    localStorage.setItem('rc_app_email', config.appEmail);
    setSavedDiscord(true);
    setTimeout(() => setSavedDiscord(false), 2000);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="sidebar-logo">R</div>
          <div>
            <h1 style={{ fontSize: '0.875rem', fontWeight: 700, letterSpacing: '0.025em' }}>Relu Consultancy</h1>
            <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Company Intelligence</p>
          </div>
        </div>
      </div>

      <div className="sidebar-content custom-scrollbar">
        <button onClick={onNewResearch} className="btn-outline" style={{ marginBottom: '1.5rem' }}>
          <Plus size={16} className="text-primary" /> New Research
        </button>

        <div className="tabs">
          <button onClick={() => setTab('api')} className={`tab ${tab === 'api' ? 'active' : ''}`}><Settings size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }}/> API</button>
          <button onClick={() => setTab('discord')} className={`tab ${tab === 'discord' ? 'active' : ''}`}><MessageSquare size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }}/> DISCORD</button>
        </div>

        {tab === 'api' && (
          <div className="fade-in">
            <div className="form-group">
              <label className="label">OpenRouter API Key</label>
              <input type="password" name="openRouterKey" value={config.openRouterKey} onChange={handleChange} className="input-field" placeholder="sk-or-v1-..." />
            </div>
            <div className="form-group">
              <label className="label">Serper.dev API Key</label>
              <input type="password" name="serperKey" value={config.serperKey} onChange={handleChange} className="input-field" placeholder="Your Serper key..." />
            </div>
            <div className="form-group">
              <label className="label">AI Model</label>
              <select name="model" value={config.model} onChange={handleChange} className="input-field">
                <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet (Recommended)</option>
                <option value="openai/gpt-4o">GPT-4o</option>
                <option value="meta-llama/llama-3-70b-instruct">Llama 3 70B</option>
                <option value="google/gemini-pro-1.5">Gemini 1.5 Pro</option>
              </select>
            </div>
            <button onClick={handleSaveApi} className="btn-primary" style={{ marginTop: '1rem' }}>
              {savedApi ? <><Check size={16}/> Saved</> : 'Save Configuration'}
            </button>
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-side)' }}>
               <h3 className="label" style={{ marginBottom: '1rem' }}>How it works</h3>
               <ul style={{ listStyle: 'none', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                 <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}><span style={{ color: 'var(--primary)' }}>1.</span> Enter a company name or URL</li>
                 <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}><span style={{ color: 'var(--primary)' }}>2.</span> Serper.dev searches & discovers URLs</li>
                 <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}><span style={{ color: 'var(--primary)' }}>3.</span> Python backend crawls content</li>
                 <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}><span style={{ color: 'var(--primary)' }}>4.</span> OpenRouter AI generates insights</li>
                 <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}><span style={{ color: 'var(--primary)' }}>5.</span> Download a professional PDF report</li>
               </ul>
            </div>
          </div>
        )}

        {tab === 'discord' && (
          <div className="fade-in">
            <div style={{ padding: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.75rem', color: '#a5b4fc' }}>
              <strong style={{ display: 'block', color: '#c7d2fe', marginBottom: '0.25rem' }}>Discord Bot Integration</strong>
              After research completes, the report can auto-send to your configured channel.
            </div>
            <div className="form-group">
              <label className="label">Bot Token</label>
              <input type="password" name="discordToken" value={config.discordToken} onChange={handleChange} className="input-field" placeholder="Bot token..." />
            </div>
            <div className="form-group">
              <label className="label">Channel ID</label>
              <input type="text" name="discordChannel" value={config.discordChannel} onChange={handleChange} className="input-field" placeholder="000000000000000000" />
            </div>
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-side)' }}>
              <label className="label" style={{ marginBottom: '1rem' }}>Applicant Details</label>
              <div className="form-group">
                <input type="text" name="appName" value={config.appName} onChange={handleChange} className="input-field" placeholder="Your full name" />
              </div>
              <div className="form-group">
                <input type="email" name="appEmail" value={config.appEmail} onChange={handleChange} className="input-field" placeholder="email@example.com" />
              </div>
            </div>
            <button onClick={handleSaveDiscord} className="btn-primary" style={{ marginTop: '1rem', backgroundColor: '#4f46e5' }}>
              {savedDiscord ? <><Check size={16}/> Saved</> : 'Save Discord Config'}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
