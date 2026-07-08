import React from 'react';
import './SentimentDashboard.css';

const SentimentDashboard = ({ result }) => {
  if (!result) return null;

  const { sentiment, text } = result;

  const getSentimentColor = () => {
    switch (sentiment) {
      case 'Positive': return 'var(--positive-color)';
      case 'Negative': return 'var(--negative-color)';
      case 'Neutral': return 'var(--neutral-color)';
      case 'Irrelevant': return 'var(--irrelevant-color)';
      default: return 'var(--text-main)';
    }
  };

  const getSentimentGlow = () => {
    switch (sentiment) {
      case 'Positive': return 'var(--positive-glow)';
      case 'Negative': return 'var(--negative-glow)';
      case 'Neutral': return 'var(--neutral-glow)';
      case 'Irrelevant': return 'var(--irrelevant-glow)';
      default: return 'var(--glass-shadow)';
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-grid">
        
        {/* Main Sentiment Card */}
        <div className="glass-panel result-card main-sentiment">
          <h3 className="card-title">Overall Sentiment</h3>
          <div 
            className="sentiment-display" 
            style={{ 
              color: getSentimentColor(),
              textShadow: `0 0 30px ${getSentimentGlow()}`
            }}
          >
            {sentiment}
          </div>
        </div>

        {/* Text Preview Card */}
        <div className="glass-panel result-card text-preview">
          <h3 className="card-title">Analyzed Text</h3>
          <p className="tweet-text">"{text}"</p>
        </div>

      </div>
    </div>
  );
};

export default SentimentDashboard;
