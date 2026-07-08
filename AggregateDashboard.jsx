import React, { useState } from 'react';
import axios from 'axios';
import { Search, ArrowRight, Smile, Meh, Frown, MessageSquare, Loader2 } from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import './AggregateDashboard.css';

const AggregateDashboard = () => {
  const [query, setQuery] = useState('#AI');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Dashboard state
  const [metrics, setMetrics] = useState({
    positivePercentage: 62,
    neutralPercentage: 21,
    negativePercentage: 17,
    totalAnalyzed: 1240
  });

  const [pieData, setPieData] = useState([
    { name: 'Positive', value: 62 },
    { name: 'Neutral', value: 21 },
    { name: 'Negative', value: 17 },
  ]);

  const [lineData, setLineData] = useState([
    { name: 'Mon', Positive: 55, Neutral: 25, Negative: 20 },
    { name: 'Tue', Positive: 60, Neutral: 22, Negative: 18 },
    { name: 'Wed', Positive: 58, Neutral: 24, Negative: 18 },
    { name: 'Thu', Positive: 65, Neutral: 20, Negative: 15 },
    { name: 'Fri', Positive: 62, Neutral: 21, Negative: 17 },
    { name: 'Sat', Positive: 67, Neutral: 18, Negative: 15 },
    { name: 'Sun', Positive: 62, Neutral: 21, Negative: 17 },
  ]);

  const [recentTweets, setRecentTweets] = useState([]);
  const [showAllTweets, setShowAllTweets] = useState(false);

  const COLORS = ['#10b981', '#94a3b8', '#f43f5e'];

  const handleAnalyze = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Call our local Node.js proxy backend
      const response = await axios.get(`http://localhost:3001/api/tweets`, {
        params: { query: query.trim() }
      });

      const data = response.data;
      
      setMetrics(data.metrics);
      setPieData(data.chartData.pieData);
      setLineData(data.chartData.lineData);
      setRecentTweets(data.recentTweets || []);
      setShowAllTweets(false); // Reset to showing only top 5

    } catch (err) {
      console.error(err);
      setError("Failed to fetch real-time tweets. Make sure the local Node.js backend (port 3001) is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTagClick = (tag) => {
    setQuery(tag);
    // Note: To automatically analyze on tag click, uncomment the line below:
    // handleAnalyze(); 
    // However, since state updates are async, it's better to trigger it effectively if desired.
  };

  return (
    <div className="aggregate-dashboard">
      {/* Search Section */}
      <div className="search-section">
        <div className="search-bar-container">
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            className="search-input" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            placeholder="Search topic or hashtag..."
            disabled={isLoading}
          />
          <button 
            className="analyze-btn-purple" 
            onClick={handleAnalyze}
            disabled={isLoading}
            style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
          >
            {isLoading ? (
              <>Analyzing <Loader2 size={16} className="animate-spin" /></>
            ) : (
              <>Analyze <ArrowRight size={16} /></>
            )}
          </button>
        </div>
        <div className="tags-row">
          <span className="tags-label">Try:</span>
          <span className="tag" onClick={() => handleTagClick('#Python')}>#Python</span>
          <span className="tag" onClick={() => handleTagClick('#ClimateChange')}>#ClimateChange</span>
          <span className="tag" onClick={() => handleTagClick('ChatGPT')}>ChatGPT</span>
          <span className="tag" onClick={() => handleTagClick('#WorldCup')}>#WorldCup</span>
        </div>
        {error && <div className="error-message glass-panel" style={{ padding: '12px', marginTop: '8px', fontSize: '0.9rem' }}>{error}</div>}
      </div>

      {/* Metrics Cards */}
      <div className="metrics-grid" style={{ opacity: isLoading ? 0.5 : 1, transition: 'opacity 0.3s' }}>
        <div className="metric-card glass-panel" style={{ borderBottom: '4px solid var(--positive-color)' }}>
          <div className="metric-header">
            <span className="metric-title">Positive</span>
            <Smile className="metric-icon" style={{ color: 'var(--positive-color)' }} />
          </div>
          <div className="metric-value" style={{ color: 'var(--positive-color)' }}>{metrics.positivePercentage}%</div>
        </div>

        <div className="metric-card glass-panel" style={{ borderBottom: '4px solid var(--text-muted)' }}>
          <div className="metric-header">
            <span className="metric-title">Neutral</span>
            <Meh className="metric-icon" style={{ color: 'var(--text-muted)' }} />
          </div>
          <div className="metric-value">{metrics.neutralPercentage}%</div>
        </div>

        <div className="metric-card glass-panel" style={{ borderBottom: '4px solid var(--negative-color)' }}>
          <div className="metric-header">
            <span className="metric-title">Negative</span>
            <Frown className="metric-icon" style={{ color: 'var(--negative-color)' }} />
          </div>
          <div className="metric-value" style={{ color: 'var(--negative-color)' }}>{metrics.negativePercentage}%</div>
        </div>

        <div className="metric-card glass-panel" style={{ borderBottom: '4px solid var(--accent-color)' }}>
          <div className="metric-header">
            <span className="metric-title">Tweets Analyzed</span>
            <MessageSquare className="metric-icon" style={{ color: 'var(--accent-color)' }} />
          </div>
          <div className="metric-value" style={{ color: 'var(--accent-color)' }}>{metrics.totalAnalyzed.toLocaleString()}</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid" style={{ opacity: isLoading ? 0.5 : 1, transition: 'opacity 0.3s' }}>
        <div className="chart-card glass-panel">
          <h3 className="chart-title">Sentiment Distribution</h3>
          <div className="chart-legend-custom">
            <span className="legend-item"><span className="legend-dot" style={{backgroundColor: COLORS[0]}}></span> Positive</span>
            <span className="legend-item"><span className="legend-dot" style={{backgroundColor: COLORS[1]}}></span> Neutral</span>
            <span className="legend-item"><span className="legend-dot" style={{backgroundColor: COLORS[2]}}></span> Negative</span>
          </div>
          <div className="pie-chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(5,5,5,0.9)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card glass-panel">
          <h3 className="chart-title">7-Day Sentiment Trend</h3>
          <div className="chart-legend-custom">
            <span className="legend-item"><span className="legend-dot" style={{backgroundColor: COLORS[0]}}></span> Positive</span>
            <span className="legend-item"><span className="legend-dot" style={{backgroundColor: COLORS[1]}}></span> Neutral</span>
            <span className="legend-item"><span className="legend-dot" style={{backgroundColor: COLORS[2]}}></span> Negative</span>
          </div>
          <div className="line-chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={lineData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={true} horizontal={true} />
                <XAxis dataKey="name" stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)', fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)', fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(5,5,5,0.9)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="Positive" stroke={COLORS[0]} strokeWidth={2} dot={{ r: 4, fill: 'var(--bg-color)', stroke: COLORS[0], strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Neutral" stroke={COLORS[1]} strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4, fill: 'var(--bg-color)', stroke: COLORS[1], strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Negative" stroke={COLORS[2]} strokeWidth={2} strokeDasharray="2 2" dot={{ r: 4, fill: 'var(--bg-color)', stroke: COLORS[2], strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Tweets Section */}
      {recentTweets.length > 0 && (
        <div className="recent-tweets-section" style={{ opacity: isLoading ? 0.5 : 1, transition: 'opacity 0.3s', marginTop: '24px' }}>
          <h3 className="chart-title" style={{ marginBottom: '16px' }}>Recent Analyzed Tweets</h3>
          <div className="tweets-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(showAllTweets ? recentTweets : recentTweets.slice(0, 5)).map((tweet, index) => {
              // Determine color based on sentiment
              let sentimentColor = 'var(--text-muted)';
              if (tweet.sentiment === 'Positive') sentimentColor = 'var(--positive-color)';
              if (tweet.sentiment === 'Negative') sentimentColor = 'var(--negative-color)';
              
              return (
                <div key={index} className="glass-panel" style={{ padding: '16px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ 
                    minWidth: '80px', 
                    color: sentimentColor, 
                    fontWeight: '600', 
                    fontSize: '0.875rem',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: `color-mix(in srgb, ${sentimentColor} 15%, transparent)`
                  }}>
                    {tweet.sentiment}
                  </div>
                  <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.5', margin: 0 }}>
                    {tweet.text}
                  </p>
                </div>
              );
            })}
          </div>
          
          {recentTweets.length > 5 && (
            <button 
              onClick={() => setShowAllTweets(!showAllTweets)}
              className="glass-panel"
              style={{ 
                marginTop: '16px', 
                width: '100%', 
                padding: '12px', 
                background: 'rgba(255,255,255,0.05)', 
                color: 'var(--text-main)', 
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
            >
              {showAllTweets ? 'Show Less' : `Show ${recentTweets.length - 5} More Tweets`}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AggregateDashboard;
