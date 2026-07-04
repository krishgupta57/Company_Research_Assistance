import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, Loader2 } from 'lucide-react';
import Sidebar from './components/Sidebar';
import WelcomeView from './components/WelcomeView';
import LoadingView from './components/LoadingView';
import ResultsView from './components/ResultsView';

const STORAGE_KEYS = {
    OPENROUTER: 'rc_openrouter_key',
    SERPER: 'rc_serper_key',
    MODEL: 'rc_ai_model',
    DISCORD_TOKEN: 'rc_discord_token',
    DISCORD_CHANNEL: 'rc_discord_channel',
    APP_NAME: 'rc_app_name',
    APP_EMAIL: 'rc_app_email'
};

function App() {
  const [config, setConfig] = useState({
    openRouterKey: localStorage.getItem(STORAGE_KEYS.OPENROUTER) || '',
    serperKey: localStorage.getItem(STORAGE_KEYS.SERPER) || '',
    model: localStorage.getItem(STORAGE_KEYS.MODEL) || 'anthropic/claude-3.5-sonnet',
    discordToken: localStorage.getItem(STORAGE_KEYS.DISCORD_TOKEN) || '',
    discordChannel: localStorage.getItem(STORAGE_KEYS.DISCORD_CHANNEL) || '',
    appName: localStorage.getItem(STORAGE_KEYS.APP_NAME) || '',
    appEmail: localStorage.getItem(STORAGE_KEYS.APP_EMAIL) || ''
  });

  const [view, setView] = useState('welcome'); // welcome, loading, results
  const [inputQuery, setInputQuery] = useState('');
  const [researchData, setResearchData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [discordStatus, setDiscordStatus] = useState(null);

  const handleNewResearch = () => {
    setView('welcome');
    setInputQuery('');
    setResearchData(null);
    setErrorMsg('');
    setDiscordStatus(null);
  };

  const startResearch = async (query) => {
    const q = query || inputQuery;
    if (!q.trim()) return;

    setErrorMsg('');
    setView('loading');
    setDiscordStatus(null);

    try {
      const res = await fetch('/api/research/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          serperKey: config.serperKey,
          openRouterKey: config.openRouterKey,
          model: config.model
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to research company');
      }

      setResearchData(data);
      setView('results');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
      setView('welcome');
    }
  };

  const sendToDiscord = async (fileBlob, filename) => {
    if (!config.discordToken || !config.discordChannel) return;

    try {
      const formData = new FormData();
      formData.append('discordToken', config.discordToken);
      formData.append('discordChannel', config.discordChannel);
      formData.append('file', fileBlob, filename);
      
      const payload = `**🚀 New Company Intelligence Report Generated!**\n\n**Applicant Details**\n👤 Name: ${config.appName || 'Not provided'}\n📧 Email: ${config.appEmail || 'Not provided'}\n\n**Research Summary**\n🏢 **Company:** ${researchData.name}\n🌐 **Website:** <${researchData.website}>\n\n*See attached PDF for full AI-generated insights.*`;
      formData.append('payload_json', JSON.stringify({ content: payload }));

      const res = await fetch('/api/discord/', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        setDiscordStatus('success');
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Failed to send to Discord');
      }
    } catch (e) {
      console.error(e);
      setDiscordStatus('error');
    }
  };

  return (
    <div className="app-container">
      <Sidebar config={config} setConfig={setConfig} onNewResearch={handleNewResearch} />
      
      <main className="main-content">
        <header style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-side)', background: 'rgba(24, 24, 27, 0.8)', backdropFilter: 'blur(8px)', zIndex: 10 }}>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            Company Research
            <span style={{ fontSize: '0.625rem', padding: '0.25rem 0.5rem', borderRadius: '9999px', background: 'var(--success-faded)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.2)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Live System</span>
          </h2>
        </header>

        <div className="content-scroll">
          {errorMsg && (
            <div className="fade-in" style={{ maxWidth: '42rem', margin: '0 auto 1.5rem', padding: '1rem', background: 'var(--danger-faded)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '0.75rem', color: 'var(--danger)', fontSize: '0.875rem' }}>
              <strong>Error:</strong> {errorMsg}
            </div>
          )}

          {view === 'welcome' && <WelcomeView onSearch={(q) => { setInputQuery(q); startResearch(q); }} />}
          {view === 'loading' && <LoadingView title={`Analyzing ${inputQuery}...`} />}
          {view === 'results' && <ResultsView data={researchData} sendToDiscord={sendToDiscord} discordStatus={discordStatus} />}
        </div>

        <div className="search-bar-container">
          <form className="search-form" onSubmit={(e) => { e.preventDefault(); startResearch(inputQuery); }}>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Enter a company name or website URL..." 
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
            />
            <button type="submit" className="search-btn" disabled={view === 'loading' || !inputQuery.trim()}>
              {view === 'loading' ? <Loader2 className="animate-spin" size={20} /> : <><span style={{ display: 'none' }} className="md:inline">Research</span> <ArrowRight size={20} /></>}
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Powered by OpenRouter AI & Serper
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
