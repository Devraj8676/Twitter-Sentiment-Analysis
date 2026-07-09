import React, { useState } from 'react';
import './HeroInput.css';

const HeroInput = ({ onAnalyze, isLoading }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onAnalyze(input);
    }
  };

  return (
    <div className="hero-container">
      <h1 className="hero-title">
        Discover the <span className="highlight">Sentiment</span>
      </h1>
      <p className="hero-subtitle">
        Paste a tweet URL or raw text to instantly analyze its emotional tone.
      </p>
      
      <form onSubmit={handleSubmit} className="hero-form">
        <div className="input-wrapper glass-panel">
          <textarea
            className="hero-textarea"
            placeholder="What's happening?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            rows={4}
          />
          <div className="form-footer">
            <span className="char-count">{input.length} characters</span>
            <button 
              type="submit" 
              className={`analyze-btn ${isLoading ? 'loading' : ''}`}
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? 'Analyzing...' : 'Analyze Sentiment'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default HeroInput;
