# =====================
# Imports
# =====================
import pandas as pd
import re
import pickle
import numpy as np
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, ConfusionMatrixDisplay

# =====================
# Config
# =====================
DROP_IRRELEVANT = False
LABEL_COL = "label"

# =====================
# Text cleaning
# =====================
def clean_text(text):
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    return text

# =====================
# Load dataset FIRST
# =====================
df = pd.read_csv(
    r"C:\Users\mishr\OneDrive\Desktop\Finalyear\dataset\twitter_training.csv",
    header=None,
    names=["post_id", "topic", "label", "text"]
)

# =====================
# Drop irrelevant (AFTER df exists)
# =====================
if DROP_IRRELEVANT:
    before = len(df)
    df = df[df[LABEL_COL] != "irrelevant"].reset_index(drop=True)
    print(f"Dropped 'irrelevant': {before - len(df)} rows removed")

# =====================
# Prepare data
# =====================
X = df["text"].fillna("").apply(clean_text)
y = df["label"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# =====================
# Model pipeline
# =====================
pipeline = Pipeline([
    ("tfidf", TfidfVectorizer(max_features=5000, ngram_range=(1, 2))),
    ("clf", RandomForestClassifier(random_state=42))
])

pipeline.fit(X_train, y_train)

# =====================
# Evaluation
# =====================
y_pred = pipeline.predict(X_test)

report = classification_report(y_test, y_pred)
print(report)

with open(r"C:\Users\mishr\OneDrive\Desktop\Finalyear\results\classification_report.txt", "w") as f:
    f.write(report)

# =====================
# Confusion matrix
# =====================
cm = confusion_matrix(y_test, y_pred, labels=np.unique(y_test))

disp = ConfusionMatrixDisplay(
    confusion_matrix=cm,
    display_labels=np.unique(y_test)
)

disp.plot(cmap="Blues", values_format="d", colorbar=True)
plt.title("Confusion Matrix")
plt.savefig(r"C:\Users\mishr\OneDrive\Desktop\Finalyear\results\confusion_matrix.png", dpi=300, bbox_inches="tight")
plt.close()

# =====================
# Save model
# =====================
with open(r"C:\Users\mishr\OneDrive\Desktop\Finalyear\model_outputs\SentimentAnalysis.pickle", "wb") as f:
    pickle.dump(pipeline, f)

print("Model trained and all outputs saved successfully.")
