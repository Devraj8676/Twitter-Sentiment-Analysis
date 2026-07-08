# =====================
# Imports
# =====================
import pandas as pd
import re
import pickle
import os

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score


# =====================
# Text Cleaning
# =====================
def clean_text(text):
    text = str(text).lower()
    text = re.sub(r'[^\w\s]', '', text)
    return text


# =====================
# Load Dataset
# =====================
df = pd.read_csv(
    r"C:\Users\mishr\OneDrive\Desktop\Finalyear\dataset\twitter_training.csv",
    header=None,
    names=["post_id", "topic", "label", "text"]
)

print("Dataset loaded successfully!")
print("Total rows:", len(df))

print("\nClass Distribution:")
print(df["label"].value_counts())


# =====================
# Prepare Data
# Same method as Random Forest
# =====================
X = df["text"].fillna("").apply(clean_text)
y = df["label"]


# =====================
# Train-Test Split
# Same settings as Random Forest
# =====================
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

print("\nTraining samples:", len(X_train))
print("Testing samples:", len(X_test))


# =====================
# Logistic Regression Pipeline
# Same TF-IDF settings as Random Forest
# =====================
lr_pipeline = Pipeline([
    (
        "tfidf",
        TfidfVectorizer(
            max_features=5000,
            ngram_range=(1, 2)
        )
    ),

    (
        "classifier",
        LogisticRegression(
            max_iter=1000,
            random_state=42
        )
    )
])


# =====================
# Train Model
# =====================
print("\nTraining Logistic Regression model...")

lr_pipeline.fit(X_train, y_train)

print("Logistic Regression Model Trained Successfully!")


# =====================
# Prediction
# =====================
y_pred = lr_pipeline.predict(X_test)


# =====================
# Evaluation
# =====================
accuracy = accuracy_score(y_test, y_pred)

print("\n============================")
print("LOGISTIC REGRESSION RESULTS")
print("============================")

print("\nAccuracy:", accuracy)

print("\nClassification Report:\n")

report = classification_report(y_test, y_pred)

print(report)


# =====================
# Save Classification Report
# =====================
results_folder = r"C:\Users\mishr\OneDrive\Desktop\Finalyear\results"

os.makedirs(results_folder, exist_ok=True)

report_path = os.path.join(
    results_folder,
    "logistic_regression_report.txt"
)

with open(report_path, "w") as file:
    file.write("Logistic Regression Results\n")
    file.write("===========================\n\n")
    file.write(f"Accuracy: {accuracy}\n\n")
    file.write(report)

print("Classification report saved successfully!")


# =====================
# Test New Tweets
# =====================
sample_tweets = [
    "I love this phone!",
    "This is the worst movie ever.",
    "The service was average."
]

predictions = lr_pipeline.predict(sample_tweets)

print("\nSample Predictions:")

for tweet, sentiment in zip(sample_tweets, predictions):
    print(f"{tweet} --> {sentiment}")


# =====================
# Save Logistic Regression Model
# =====================
models_folder = r"C:\Users\mishr\OneDrive\Desktop\Finalyear\models"

os.makedirs(models_folder, exist_ok=True)

model_path = os.path.join(
    models_folder,
    "LogisticRegression_Sentiment.pkl"
)

with open(model_path, "wb") as file:
    pickle.dump(lr_pipeline, file)

print("\nLogistic Regression model saved successfully!")
print("Model location:", model_path)