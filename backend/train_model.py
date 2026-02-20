import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
import joblib

# Load dataset
df = pd.read_csv("../data/upi_transactions.csv")


# Fraud Label Creation

fraud_labels = ["Transaction failed", "Invalid UPI ID", "Beneficiary Not Found"]

df["fraud"] = df["Resolution"].apply(
    lambda x: 1 if any(lbl in str(x) for lbl in fraud_labels) else 0
)

# Time Feature
df["Date"] = pd.to_datetime(df["Date"])

df["day_of_week"] = df["Date"].dt.dayofweek

df["is_weekend"] = df["day_of_week"].apply(lambda x: 1 if x >= 5 else 0)

df["Time"] = pd.to_datetime(df["Time"], format="%H:%M:%S", errors="coerce")

df["hour"] = df["Time"].dt.hour

df["is_night"] = df["hour"].apply(lambda x: 1 if 0 <= x <= 4 else 0)

df["high_risk_hour"] = df["hour"].apply(
    lambda x: 1 if (0 <= x <= 4) or (x == 23) else 0
)

# Feature Selection

features = [
    "Amount",
    "Issue Type",
    "Bank (Sender)",
    "Bank (Receiver)",
    "day_of_week",
    "is_weekend",
    "hour",
    "is_night",
    "high_risk_hour"
]

X = df[features]
y = df["fraud"]

# Preprocessing

categorical_features = ["Issue Type", "Bank (Sender)", "Bank (Receiver)"]

preprocessor = ColumnTransformer(
    transformers=[
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_features)
    ],
    remainder="passthrough"
)

model = Pipeline(steps=[
    ("preprocess", preprocessor),
    ("classifier", RandomForestClassifier(n_estimators=300, random_state=42))
])

# Train

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model.fit(X_train, y_train)

accuracy = model.score(X_test, y_test)
print("Model Accuracy:", round(accuracy * 100, 2), "%")

joblib.dump(model, "fraud_model.pkl")
print("Model Saved Successfully!")
