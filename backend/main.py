from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
import pickle
import re

app = FastAPI(title="Twitter Sentiment Analysis API")

# Allow the React dev server (Vite) to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://192.168.29.8:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Build a path that works on any machine, relative to this file's location
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "model_outputs" / "SentimentAnalysis.pickle"

print(f"Loading model from: {MODEL_PATH}")

with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

print("Model loaded successfully.")
print(f"Model type: {type(model)}")


def clean_text(text: str) -> str:
    """Same cleaning function used during training."""
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    return text


class PredictRequest(BaseModel):
    text: str


@app.get("/")
def root():
    return {"message": "Sentiment Analysis API is running"}


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "model_type": str(type(model))
    }


@app.post("/predict")
def predict(request: PredictRequest):
    original_text = request.text

    if not original_text or not original_text.strip():
        return {"error": "Input text cannot be empty"}

    cleaned = clean_text(original_text)
    prediction = model.predict([cleaned])[0]

    return {
        "text": original_text,
        "sentiment": prediction
    }