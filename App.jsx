import React, { useState } from 'react';
import axios from 'axios';
import HeroInput from './components/HeroInput';
import SentimentDashboard from './components/SentimentDashboard';
import AggregateDashboard from './components/AggregateDashboard';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async (text) => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    
    try {
      const response = await axios.post('http://192.168.29.8:8000/predict', { text });
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to connect to the backend API. Please make sure the backend is running and CORS is enabled.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <header className="app-header glass-panel">
        <div className="logo">
          <svg className="twitter-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"/>
          </svg>
          <span className="logo-text">Sentiment<span className="logo-highlight">X</span></span>
        </div>
      </header>
      
      <main className="app-main">
        <AggregateDashboard />
        
        <div style={{ width: '100%', height: '1px', background: 'var(--glass-border)', margin: '48px 0' }}></div>

        <HeroInput onAnalyze={handleAnalyze} isLoading={isLoading} />
        {error && <div className="error-message glass-panel">{error}</div>}
        <SentimentDashboard result={result} />
      </main>
      
      <footer className="app-footer">
        <p>Built for Twitter Sentiment Analysis. Awaiting Backend Integration.</p>
      </footer>
    </div>
  );
}

export default App;
