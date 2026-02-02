"""Generate synthetic telecom churn CSV with same schema as telecom_churn_sample.csv."""
import csv
import random

random.seed(42)
CONTRACTS = ["Month-to-month", "One year", "Two year"]
INTERNET = ["DSL", "Fiber optic", "None"]

def row():
    age = random.randint(18, 75)
    tenure = random.randint(0, 72)
    monthlyCharges = round(random.uniform(25, 120), 1)
    contract = random.choices(CONTRACTS, weights=[0.55, 0.30, 0.15])[0]
    internetService = random.choices(INTERNET, weights=[0.42, 0.44, 0.14])[0]
    paymentDelay = random.choices(
        [0, 1, 2, 3, 5, 7, 10, 15, 20, 30, 45, 60],
        weights=[0.50, 0.08, 0.06, 0.05, 0.05, 0.04, 0.04, 0.04, 0.04, 0.04, 0.03, 0.03],
    )[0]
    # Churn tendency: short tenure, month-to-month, fiber, high delay -> more churn
    churn_score = 0.0
    if contract == "Month-to-month":
        churn_score += 0.35
    elif contract == "One year":
        churn_score += 0.15
    if tenure < 12:
        churn_score += 0.25
    elif tenure < 24:
        churn_score += 0.10
    if internetService == "Fiber optic":
        churn_score += 0.10
    if paymentDelay >= 15:
        churn_score += 0.25
    elif paymentDelay >= 5:
        churn_score += 0.10
    if monthlyCharges > 80:
        churn_score += 0.05
    Churn = 1 if random.random() < min(0.95, churn_score + random.gauss(0.1, 0.2)) else 0
    return [age, tenure, monthlyCharges, contract, internetService, paymentDelay, Churn]

out = "e:\\SW Engineering projects\\Cust_churn\\backend\\data\\telecom_churn_sample.csv"
with open(out, "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["age", "tenure", "monthlyCharges", "contract", "internetService", "paymentDelay", "Churn"])
    for _ in range(800):
        w.writerow(row())
print("Wrote 800 rows to", out)
