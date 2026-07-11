import pickle
import re
from pathlib import Path
from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow CORS so the frontend/node proxy can communicate with it
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# We must redefine the clean_text function used during training
# so we can process incoming tweets the exact same way before predicting.
def clean_text(text):
    text = str(text).lower()
    text = re.sub(r'[^\w\s]', '', text)
    return text

# Load the trained model from your exact path
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "model_outputs" / "SentimentAnalysisLite.pickle"

try:
    with open(MODEL_PATH, "rb") as f:
        pipeline = pickle.load(f)
    print("Success: Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    pipeline = None

# Define the expected JSON format from the POST request
class PredictRequest(BaseModel):
    text: str

@app.post("/predict")
def predict_sentiment(request: PredictRequest):
    if not pipeline:
        return {"sentiment": "Neutral", "text": request.text, "error": "Model not loaded"}
    
    # 1. Clean the incoming text
    cleaned_text = clean_text(request.text)
    
    # 2. Predict the sentiment
    prediction = pipeline.predict([cleaned_text])[0]
    
    # 3. Capitalize the result to match the React frontend (Positive, Negative, Neutral, Irrelevant)
    sentiment = str(prediction).capitalize()
    
    return {
        "sentiment": sentiment,
        "text": request.text
    }

@app.get("/")
def read_root():
    return {"message": "Welcome to Twitter Sentiment Analysis API. The backend is live! 🚀"}

@app.get("/api/tweets")
def get_tweets(query: str):
    # Fallback mock tweets for testing the UI flow without a Twitter API key
    tweets = [
        f"I really love how {query} is shaping the future!",
        f"Not sure if {query} is overhyped or actually useful.",
        f"The latest update regarding {query} is extremely disappointing.",
        f"{query} is okay, but I prefer the alternatives.",
        f"Absolutely amazed by the performance of {query} today.",
        f"Terrible experience trying to use {query} for my project.",
        f"Just learning about {query}, seems interesting so far."
    ]
    
    analyzed_tweets = []
    positive_count = 0
    neutral_count = 0
    negative_count = 0
    
    for text in tweets:
        if pipeline:
            cleaned_text = clean_text(text)
            prediction = pipeline.predict([cleaned_text])[0]
            sentiment = str(prediction).capitalize()
        else:
            sentiment = "Neutral"
            
        analyzed_tweets.append({"sentiment": sentiment, "text": text})
        
        if sentiment == "Positive":
            positive_count += 1
        elif sentiment == "Negative":
            negative_count += 1
        else:
            neutral_count += 1
            
    total = positive_count + neutral_count + negative_count
    pos_pct = round((positive_count / total) * 100) if total > 0 else 0
    neu_pct = round((neutral_count / total) * 100) if total > 0 else 0
    neg_pct = round((negative_count / total) * 100) if total > 0 else 0
    
    line_data = [
      { "name": 'Mon', "Positive": max(0, pos_pct - 5), "Neutral": neu_pct, "Negative": neg_pct },
      { "name": 'Tue', "Positive": max(0, pos_pct - 3), "Neutral": neu_pct, "Negative": neg_pct },
      { "name": 'Wed', "Positive": max(0, pos_pct - 2), "Neutral": neu_pct, "Negative": neg_pct },
      { "name": 'Thu', "Positive": pos_pct, "Neutral": neu_pct, "Negative": neg_pct },
      { "name": 'Fri', "Positive": pos_pct, "Neutral": neu_pct, "Negative": neg_pct },
      { "name": 'Sat', "Positive": pos_pct, "Neutral": neu_pct, "Negative": neg_pct },
      { "name": 'Sun', "Positive": pos_pct, "Neutral": neu_pct, "Negative": neg_pct },
    ]
    
    return {
      "query": query,
      "metrics": {
        "positivePercentage": pos_pct,
        "neutralPercentage": neu_pct,
        "negativePercentage": neg_pct,
        "totalAnalyzed": total
      },
      "chartData": {
        "pieData": [
          { "name": 'Positive', "value": pos_pct },
          { "name": 'Neutral', "value": neu_pct },
          { "name": 'Negative', "value": neg_pct },
        ],
        "lineData": line_data
      },
      "recentTweets": analyzed_tweets
    }

if __name__ == "__main__":
    import os
    # Start the server on port 8000 or dynamically assigned PORT
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting Python API server on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port)
