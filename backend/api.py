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
MODEL_PATH = BASE_DIR / "model_outputs" / "SentimentAnalysis.pickle"

import os
import glob
if not MODEL_PATH.exists():
    print("Full model not found, looking for chunks...")
    chunks = sorted(glob.glob(str(MODEL_PATH) + ".part*"))
    if chunks:
        print(f"Found {len(chunks)} chunks, reassembling...")
        with open(MODEL_PATH, "wb") as outfile:
            for chunk_path in chunks:
                with open(chunk_path, "rb") as infile:
                    outfile.write(infile.read())
        print("Reassembly complete!")
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

if __name__ == "__main__":
    import os
    # Start the server on port 8000 or dynamically assigned PORT
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting Python API server on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port)
