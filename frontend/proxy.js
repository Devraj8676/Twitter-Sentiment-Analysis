import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const PYTHON_BACKEND_URL = 'http://127.0.0.1:8000/predict';

app.use(cors());
app.use(express.json());

// Endpoint to predict sentiment of a single text
app.post('/api/predict', async (req, res) => {
  try {
    const response = await axios.post(PYTHON_BACKEND_URL, { text: req.body.text });
    res.json(response.data);
  } catch (error) {
    console.error('Error predicting sentiment:', error.message);
    res.status(500).json({ error: 'Failed to connect to Python backend' });
  }
});

// Endpoint to fetch tweets and their sentiment
app.get('/api/tweets', async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    let tweets = [];

    // If RAPIDAPI_KEY is not set, we'll return some mock live-like data for demonstration
    // Once you get your key from rapidapi.com (e.g., Twitter v2 scraper), this block will run
    if (process.env.RAPIDAPI_KEY) {
      console.log(`Fetching tweets for query: ${query} using RapidAPI...`);
      // Note: This is an example RapidAPI endpoint. Depending on which specific 
      // Twitter scraper you subscribe to, the URL and parameters might change slightly.
      const options = {
        method: 'GET',
        url: 'https://twitter154.p.rapidapi.com/search/search',
        params: { query: query, section: 'top', limit: '20' },
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'twitter154.p.rapidapi.com'
        }
      };

      const response = await axios.request(options);

      // Extract tweet text based on standard rapidapi scraper response format
      if (response.data && response.data.results) {
        tweets = response.data.results.map(item => item.text || item.full_text).filter(Boolean);
      } else if (response.data && response.data.timeline) {
        tweets = response.data.timeline.map(item => item.text || item.full_text).filter(Boolean);
      } else {
        throw new Error("Unexpected response format from RapidAPI: " + JSON.stringify(response.data).substring(0, 100));
      }
    } else {
      console.log(`RAPIDAPI_KEY not found. Generating mock tweets for: ${query}`);
      // Fallback mock tweets for testing the UI flow without an API key
      tweets = [
        `I really love how ${query} is shaping the future!`,
        `Not sure if ${query} is overhyped or actually useful.`,
        `The latest update regarding ${query} is extremely disappointing.`,
        `${query} is okay, but I prefer the alternatives.`,
        `Absolutely amazed by the performance of ${query} today.`,
        `Terrible experience trying to use ${query} for my project.`,
        `Just learning about ${query}, seems interesting so far.`
      ];
    }

    console.log(`Found ${tweets.length} tweets. Analyzing sentiment via Python backend...`);

    // We use Promise.all to send concurrent requests to the Python backend
    // If the python backend struggles with concurrent requests, we could do a for-loop instead
    const analysisPromises = tweets.map(async (text) => {
      try {
        const pyRes = await axios.post(PYTHON_BACKEND_URL, { text });
        return pyRes.data; // Expected: { sentiment: 'Positive', text: '...' }
      } catch (err) {
        console.error(`Failed to analyze tweet: "${text.substring(0, 30)}..."`, err.message);
        return { sentiment: 'Neutral', text }; // Fallback sentiment on error
      }
    });

    const analyzedTweets = await Promise.all(analysisPromises);

    // Aggregate results
    let positiveCount = 0;
    let neutralCount = 0;
    let negativeCount = 0;

    analyzedTweets.forEach(t => {
      if (t.sentiment === 'Positive') positiveCount++;
      else if (t.sentiment === 'Negative') negativeCount++;
      else neutralCount++;
    });

    const total = positiveCount + neutralCount + negativeCount;

    // Calculate percentages
    const positivePercentage = total === 0 ? 0 : Math.round((positiveCount / total) * 100);
    const neutralPercentage = total === 0 ? 0 : Math.round((neutralCount / total) * 100);
    const negativePercentage = total === 0 ? 0 : Math.round((negativeCount / total) * 100);

    // Provide some dummy trend data since we are only doing a one-time fetch
    // Real trend data would require a database or historical scraping
    const lineData = [
      { name: 'Mon', Positive: Math.max(0, positivePercentage - 5), Neutral: neutralPercentage, Negative: negativePercentage },
      { name: 'Tue', Positive: Math.max(0, positivePercentage - 3), Neutral: neutralPercentage, Negative: negativePercentage },
      { name: 'Wed', Positive: Math.max(0, positivePercentage - 2), Neutral: neutralPercentage, Negative: negativePercentage },
      { name: 'Thu', Positive: positivePercentage, Neutral: neutralPercentage, Negative: negativePercentage },
      { name: 'Fri', Positive: positivePercentage, Neutral: neutralPercentage, Negative: negativePercentage },
      { name: 'Sat', Positive: positivePercentage, Neutral: neutralPercentage, Negative: negativePercentage },
      { name: 'Sun', Positive: positivePercentage, Neutral: neutralPercentage, Negative: negativePercentage },
    ];

    res.json({
      query,
      metrics: {
        positivePercentage,
        neutralPercentage,
        negativePercentage,
        totalAnalyzed: total
      },
      chartData: {
        pieData: [
          { name: 'Positive', value: positivePercentage },
          { name: 'Neutral', value: neutralPercentage },
          { name: 'Negative', value: negativePercentage },
        ],
        lineData
      },
      recentTweets: analyzedTweets // Return all analyzed tweets
    });

  } catch (error) {
    console.error('Error fetching tweets:', error.message);
    res.status(500).json({ error: 'Failed to fetch and analyze tweets' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend proxy server running on http://localhost:${PORT}`);
  console.log(`Waiting for Python sentiment backend on ${PYTHON_BACKEND_URL}`);
});
