import pandas as pd
import joblib
import os

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report

# LOAD DATASET

DATA_PATH = "../data/spam.csv"

if not os.path.exists(DATA_PATH):
    raise FileNotFoundError("Dataset file not found!")

df = pd.read_csv(DATA_PATH, encoding="latin-1")

df = df[["v1", "v2"]]
df.columns = ["label", "message"]

df["label"] = df["label"].map({"ham": 0, "spam": 1})

# TRAIN TEST SPLIT

X_train, X_test, y_train, y_test = train_test_split(
    df["message"],
    df["label"],
    test_size=0.2,
    random_state=42
)

# BUILD MODEL PIPELINE

model = Pipeline([
    ("tfidf", TfidfVectorizer(stop_words="english")),
    ("nb", MultinomialNB())
])

# TRAIN MODEL

model.fit(X_train, y_train)

# EVALUATE MODEL

y_pred = model.predict(X_test)

print("Accuracy:", accuracy_score(y_test, y_pred))
print("\nClassification Report:\n")
print(classification_report(y_test, y_pred))

# SAVE MODEL

joblib.dump(model, "spam_model.pkl")

print("\n✅ Model saved as spam_model.pkl")
