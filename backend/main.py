from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import joblib
import pandas as pd
from datetime import datetime
import csv
import os
from fastapi import HTTPException

app = FastAPI()
transactions_history = []

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

spam_model = joblib.load("spam_model.pkl")
model = joblib.load("fraud_model.pkl")

@app.post("/predict")
def predict(transaction: dict):

    try:
        date_obj = datetime.strptime(transaction["date"], "%Y-%m-%d")
        time_obj = datetime.strptime(transaction["time"], "%H:%M")

        day_of_week = date_obj.weekday()
        is_weekend = 1 if day_of_week >= 5 else 0
        hour = time_obj.hour
        is_night = 1 if 0 <= hour <= 4 else 0
        high_risk_hour = 1 if (0 <= hour <= 4) or hour == 23 else 0

        data_input = {
            "Amount": float(transaction["amount"]),
            "Issue Type": transaction["issue_type"],
            "Bank (Sender)": transaction["bank_sender"],
            "Bank (Receiver)": transaction["bank_receiver"],
            "day_of_week": day_of_week,
            "is_weekend": is_weekend,
            "hour": hour,
            "is_night": is_night,
            "high_risk_hour": high_risk_hour
        }

        df_input = pd.DataFrame([data_input])

        prob = model.predict_proba(df_input)[0][1]
        risk_score = round(prob * 100, 2)

        # Risk Level
        if risk_score > 70:
            risk_level = "High"
        elif risk_score > 40:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        file_path = "transactions.csv"
        file_exists = os.path.exists(file_path)

        with open(file_path, "a", newline="") as file:
            writer = csv.writer(file)

            # Write header if file does not exist
            if not file_exists:
                writer.writerow([
                    "user_email",
                    "amount",
                    "issue_type",
                    "bank_sender",
                    "bank_receiver",
                    "risk_score",
                    "risk_level",
                    "hour",
                    "date"
                ])

                writer.writerow([
                    transaction["user_email"],
                    transaction["amount"],
                    transaction["issue_type"],
                    transaction["bank_sender"],
                    transaction["bank_receiver"],
                    risk_score,
                    risk_level,
                    hour,
                    transaction["date"]
                ])


        # ----------------------------
        # 🔎 FRAUD EXPLANATION LOGIC
        # ----------------------------

        reasons = []

        if float(transaction["amount"]) > 20000:
            reasons.append("High transaction amount")

        if high_risk_hour:
            reasons.append("Transaction during high-risk hour")

        if is_weekend:
            reasons.append("Weekend transaction")

        if transaction["issue_type"] in ["Invalid UPI ID", "Beneficiary Not Found"]:
            reasons.append("Suspicious issue type detected")

        if not reasons:
            reasons.append("No major risk indicators detected")

        # Save transaction for analytics
        transactions_history.append({
            "risk_score": risk_score,
            "risk_level": risk_level,
            "hour": hour
        })

        return {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "explanation": reasons
        }

    except Exception as e:
        return {"error": str(e)}
    

@app.get("/stats")
def get_stats():

    if not os.path.exists("transactions.csv"):
        return {
            "total_transactions": 0,
            "risk_distribution": {"low": 0, "medium": 0, "high": 0},
            "hour_distribution": {"night": 0, "morning": 0, "afternoon": 0, "evening": 0}
        }

    df = pd.read_csv("transactions.csv")

    total = len(df)

    low = len(df[df["risk_level"] == "Low"])
    medium = len(df[df["risk_level"] == "Medium"])
    high = len(df[df["risk_level"] == "High"])

    night = len(df[(df["hour"] >= 0) & (df["hour"] <= 4)])
    morning = len(df[(df["hour"] >= 5) & (df["hour"] <= 11)])
    afternoon = len(df[(df["hour"] >= 12) & (df["hour"] <= 18)])
    evening = len(df[(df["hour"] >= 19) & (df["hour"] <= 23)])

    return {
        "total_transactions": total,
        "risk_distribution": {
            "low": low,
            "medium": medium,
            "high": high
        },
        "hour_distribution": {
            "night": night,
            "morning": morning,
            "afternoon": afternoon,
            "evening": evening
        }
    }


@app.get("/admin-stats")
def admin_stats():

    if not os.path.exists("transactions.csv"):
        return {
            "total_transactions": 0,
            "risk_distribution": {}
        }

    df = pd.read_csv("transactions.csv")

    total = len(df)
    risk_counts = df["risk_level"].value_counts().to_dict()

    return {
        "total_transactions": total,
        "risk_distribution": risk_counts
    }


@app.post("/register")
def register(user: dict):

    file_path = "users.csv"

    if not os.path.exists(file_path):
        with open(file_path, "w", newline="") as file:
            writer = csv.writer(file)
            writer.writerow(["id", "name", "email", "password", "role"])

    with open(file_path, "r") as file:
        reader = csv.DictReader(file)
        rows = list(reader)
        for row in rows:
            if row["email"] == user["email"]:
                raise HTTPException(status_code=400, detail="Email already registered")

    new_id = len(rows) + 1

    with open(file_path, "a", newline="") as file:
        writer = csv.writer(file)
        writer.writerow([new_id, user["name"], user["email"], user["password"], "user"])

    return {"message": "User registered successfully"}


@app.post("/login")
def login(user: dict):

    with open("users.csv", "r") as file:
        reader = csv.DictReader(file)
        for row in reader:
            if row["email"] == user["email"] and row["password"] == user["password"]:
                return {
                    "message": "Login successful",
                    "role": row["role"],
                    "email": row["email"]
                }

    raise HTTPException(status_code=401, detail="Invalid credentials")


@app.get("/user-history/{email}")
def user_history(email: str):

    history = []

    with open("transactions.csv", "r") as file:
        reader = csv.DictReader(file)
        for row in reader:
            if row["user_email"] == email:
                history.append(row)

    return {"transactions": history}


@app.post("/detect-spam")
def detect_spam(data: dict):

    try:
        message = data.get("message")

        if not message:
            raise HTTPException(status_code=400, detail="Message is required")

        prediction = spam_model.predict([message])[0]
        probability = spam_model.predict_proba([message])[0][1]

        spam_score = round(probability * 100, 2)

        if prediction == 1:
            label = "Spam"
        else:
            label = "Ham"

        return {
            "label": label,
            "spam_score": spam_score
        }

    except Exception as e:
        return {"error": str(e)}
