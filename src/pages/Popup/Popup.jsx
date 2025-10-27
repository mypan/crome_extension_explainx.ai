import React, { useState, useEffect } from 'react';
import './Popup.css';

const Popup = () => {
  const [summaries, setSummaries] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState('summaries'); // 'summaries' or 'settings'
  const [apiKey, setApiKey] = useState('');
  const [tempApiKey, setTempApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    loadSummaries();
    loadApiKey();
  }, []);

  const loadApiKey = () => {
    chrome.storage.local.get(['openai_api_key'], (result) => {
      const key = result.openai_api_key || '';
      setApiKey(key);
      setTempApiKey(key);
    });
  };

  const saveApiKey = () => {
    chrome.storage.local.set({ openai_api_key: tempApiKey }, () => {
      setApiKey(tempApiKey);
      setSaveMessage('API key saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    });
  };

  const clearApiKey = () => {
    if (window.confirm('Are you sure you want to remove your API key?')) {
      chrome.storage.local.set({ openai_api_key: '' }, () => {
        setApiKey('');
        setTempApiKey('');
        setSaveMessage('API key removed');
        setTimeout(() => setSaveMessage(''), 3000);
      });
    }
  };

  const loadSummaries = () => {
    chrome.storage.local.get(['summaries'], (result) => {
      setSummaries(result.summaries || []);
    });
  };

  const deleteSummary = (id) => {
    const updatedSummaries = summaries.filter((s) => s.id !== id);
    chrome.storage.local.set({ summaries: updatedSummaries }, () => {
      setSummaries(updatedSummaries);
    });
  };

  const clearAll = () => {
    if (window.confirm('Are you sure you want to delete all summaries?')) {
      chrome.storage.local.set({ summaries: [] }, () => {
        setSummaries([]);
      });
    }
  };

  const openUrl = (url) => {
    chrome.tabs.create({ url });
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredSummaries = summaries.filter(
    (summary) =>
      summary.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      summary.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="popup-container">
      <div className="popup-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
            </div>
            <div>
              <h1>Explainx</h1>
              <p className="subtitle">
                {view === 'summaries' ? 'Your saved summaries' : 'Settings'}
              </p>
            </div>
          </div>
          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', position: 'relative', zIndex: 100 }}>
            <button
              className="settings-toggle"
              onClick={() => setView(view === 'summaries' ? 'settings' : 'summaries')}
              title={view === 'summaries' ? 'Settings' : 'Back to summaries'}
              style={{
                background: 'rgba(255, 255, 255, 0.3) !important',
                border: '2px solid white !important',
                borderRadius: '8px !important',
                padding: '8px 14px !important',
                display: 'flex !important',
                alignItems: 'center !important',
                gap: '6px !important',
                cursor: 'pointer !important',
                color: 'white !important',
                fontSize: '14px !important',
                fontWeight: '500 !important',
                position: 'relative !important',
                zIndex: '100 !important',
                minWidth: '100px !important'
              }}
            >
              {view === 'summaries' ? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"></path>
                  </svg>
                  <span className="button-label">Settings</span>
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                  <span className="button-label">Back</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {view === 'summaries' && (
        <div className="popup-search">
          <div className="search-input-wrapper">
            <svg
              className="search-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              placeholder="Search summaries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button
                className="clear-search"
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      <div className="popup-content">
        {view === 'settings' ? (
          <div className="settings-view">
            <div className="settings-section">
              <div className="settings-header">
                <h3>OpenAI API Key</h3>
                {apiKey && (
                  <span className="api-status">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    Configured
                  </span>
                )}
              </div>
              <p className="settings-description">
                Enter your OpenAI API key to enable AI-powered summarization. Your key is stored locally and never shared.
              </p>

              <div className="api-key-input-group">
                <div className="input-with-toggle">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    placeholder="sk-..."
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    className="api-key-input"
                  />
                  <button
                    className="toggle-visibility"
                    onClick={() => setShowApiKey(!showApiKey)}
                    title={showApiKey ? 'Hide' : 'Show'}
                  >
                    {showApiKey ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
                <div className="button-group">
                  <button
                    className="save-api-key-btn"
                    onClick={saveApiKey}
                    disabled={!tempApiKey}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                      <polyline points="17 21 17 13 7 13 7 21"></polyline>
                      <polyline points="7 3 7 8 15 8"></polyline>
                    </svg>
                    Save API Key
                  </button>
                  {apiKey && (
                    <button className="clear-api-key-btn" onClick={clearApiKey}>
                      Remove Key
                    </button>
                  )}
                </div>
              </div>

              {saveMessage && (
                <div className="save-message">{saveMessage}</div>
              )}
            </div>

            <div className="settings-section">
              <h3>How to get an API key</h3>
              <ol className="instructions-list">
                <li>Visit <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">OpenAI API Keys</a></li>
                <li>Sign in or create an account</li>
                <li>Click "Create new secret key"</li>
                <li>Copy the key and paste it above</li>
              </ol>
            </div>

            <div className="settings-section">
              <h3>About</h3>
              <p className="about-text">
                <strong>Explainx v1.0.0</strong><br />
                AI-powered webpage summarizer that extracts and summarizes content with a single click.
              </p>
            </div>
          </div>
        ) : filteredSummaries.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <h3>
              {searchQuery
                ? 'No summaries found'
                : 'No saved summaries yet'}
            </h3>
            <p>
              {searchQuery
                ? 'Try a different search term'
                : 'Visit any webpage and click the Explainx button to create a summary'}
            </p>
          </div>
        ) : (
          <>
            <div className="summary-list">
              {filteredSummaries.map((summary) => (
                <div key={summary.id} className="summary-item">
                  <div className="summary-header">
                    <h3
                      className="summary-title"
                      onClick={() => openUrl(summary.url)}
                      title={summary.title}
                    >
                      {summary.title}
                    </h3>
                    <button
                      className="delete-btn"
                      onClick={() => deleteSummary(summary.id)}
                      title="Delete summary"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                  <p className="summary-text">
                    {expandedId === summary.id ? summary.fullText : summary.text}
                  </p>
                  {summary.fullText && summary.fullText.length > 500 && (
                    <button
                      className="expand-btn"
                      onClick={() => toggleExpand(summary.id)}
                    >
                      {expandedId === summary.id ? 'Show less' : 'Show more'}
                    </button>
                  )}
                  <div className="summary-meta">
                    <span className="timestamp">{formatDate(summary.timestamp)}</span>
                    <a
                      href={summary.url}
                      className="url-link"
                      onClick={(e) => {
                        e.preventDefault();
                        openUrl(summary.url);
                      }}
                      title={summary.url}
                    >
                      Visit page
                    </a>
                  </div>
                </div>
              ))}
            </div>
            {summaries.length > 0 && (
              <div className="popup-footer">
                <button className="clear-all-btn" onClick={clearAll}>
                  Clear all summaries
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Popup;
