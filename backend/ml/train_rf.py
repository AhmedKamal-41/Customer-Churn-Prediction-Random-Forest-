"""
Train RandomForest churn model from CSV. Outputs rf_pipeline.joblib and metrics.json.
Usage: python -m backend.ml.train_rf [--csv path]   or set CHURN_CSV_PATH.
Default CSV: backend/data/telecom_churn.csv
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix as sk_confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
    roc_curve,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

# Same canonical column names as model_store (chat keys = pipeline columns)
NUMERIC_FEATURES = ["age", "tenure", "monthlyCharges", "paymentDelay"]
CATEGORICAL_FEATURES = ["contract", "internetService"]
FEATURE_COLUMNS = NUMERIC_FEATURES + CATEGORICAL_FEATURES
TARGET_COLUMN = "Churn"


def _resolve_csv_path(csv_arg: str | None) -> Path:
    base = Path(__file__).resolve().parent.parent
    default = base / "data" / "telecom_churn.csv"
    path = os.environ.get("CHURN_CSV_PATH") or csv_arg or str(default)
    return Path(path)


def _load_and_prepare_df(path: Path) -> pd.DataFrame:
    if not path.exists():
        raise FileNotFoundError(f"CSV not found: {path}. Place your churn CSV there or set CHURN_CSV_PATH / --csv.")
    df = pd.read_csv(path)
    # Normalize column names to canonical (lowercase, no spaces)
    df = df.rename(columns=lambda c: c.strip().replace(" ", "") if isinstance(c, str) else c)
    col_map = {
        "monthlycharges": "monthlyCharges",
        "paymentdelay": "paymentDelay",
        "internetservice": "internetService",
    }
    for old, new in col_map.items():
        if old in df.columns and new not in df.columns:
            df = df.rename(columns={old: new})
    if TARGET_COLUMN not in df.columns and "churn" in df.columns:
        df = df.rename(columns={"churn": TARGET_COLUMN})
    return df


def _normalize_target(y: pd.Series) -> np.ndarray:
    if y.dtype in ("bool", "int", "int64"):
        return (y.astype(int)).values
    return (y.astype(str).str.lower().isin(("yes", "1", "true", "churn"))).astype(int).values


def main():
    parser = argparse.ArgumentParser(description="Train RandomForest churn model")
    parser.add_argument("--csv", default=None, help="Path to churn CSV (default: backend/data/telecom_churn.csv)")
    parser.add_argument("--target", default=TARGET_COLUMN, help="Target column name")
    args = parser.parse_args()
    csv_path = _resolve_csv_path(args.csv)
    target_col = args.target

    df = _load_and_prepare_df(csv_path)
    for col in FEATURE_COLUMNS + [target_col]:
        if col not in df.columns:
            raise ValueError(f"CSV missing column: {col}. Required: {FEATURE_COLUMNS} and target '{target_col}'.")

    X = df[FEATURE_COLUMNS].copy()
    y_raw = df[target_col]
    y = _normalize_target(y_raw)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    numeric_transformer = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
    ])
    categorical_transformer = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore")),
    ])
    preprocessor = ColumnTransformer([
        ("num", numeric_transformer, NUMERIC_FEATURES),
        ("cat", categorical_transformer, CATEGORICAL_FEATURES),
    ])
    clf = RandomForestClassifier(
        n_estimators=300,
        random_state=42,
        class_weight="balanced",
        n_jobs=-1,
    )
    pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", clf),
    ])
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    y_proba = pipeline.predict_proba(X_test)[:, 1]

    accuracy = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    precision = precision_score(y_test, y_pred, zero_division=0)
    recall = recall_score(y_test, y_pred, zero_division=0)
    roc_auc = roc_auc_score(y_test, y_proba) if len(np.unique(y_test)) > 1 else 0.0
    cm = sk_confusion_matrix(y_test, y_pred)
    fpr, tpr, _ = roc_curve(y_test, y_proba)
    roc_curve_list = [{"fpr": float(a), "tpr": float(b)} for a, b in zip(fpr, tpr)]

    # Feature names from pipeline (numeric + one-hot)
    ct = pipeline.named_steps["preprocessor"]
    cat_names = ct.named_transformers_["cat"].named_steps["onehot"].get_feature_names_out(CATEGORICAL_FEATURES)
    feature_names = list(NUMERIC_FEATURES) + list(cat_names)
    importances = pipeline.named_steps["classifier"].feature_importances_
    fi_pairs = sorted(zip(feature_names, importances), key=lambda x: -x[1])[:15]
    feature_importance = [{"feature": name, "importance": float(imp)} for name, imp in fi_pairs]

    from datetime import datetime, timezone
    model_version = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    metrics = {
        "model": {
            "name": "RandomForestChurn",
            "version": model_version,
            "lastTrainedAt": model_version,
            "lastEvaluatedAt": model_version,
            "dataset": csv_path.name,
            "notes": "Trained with train_rf.py on holdout test set.",
        },
        "model_version": model_version,
        "kpis": {
            "accuracy": round(accuracy, 4),
            "f1": round(f1, 4),
            "rocAuc": round(roc_auc, 4),
            "churnRate": round(float(y.mean()), 4),
            "samples": int(len(X_test)),
        },
        "confusionMatrix": {
            "labels": ["NO_CHURN", "CHURN"],
            "matrix": cm.tolist(),
        },
        "rocCurve": roc_curve_list,
        "featureImportance": feature_importance,
    }

    models_dir = Path(__file__).resolve().parent.parent / "models"
    models_dir.mkdir(parents=True, exist_ok=True)
    import joblib
    joblib.dump(pipeline, models_dir / "rf_pipeline.joblib")
    with open(models_dir / "metrics.json", "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    print("Training done.", file=sys.stderr)
    print(f"  Pipeline: {models_dir / 'rf_pipeline.joblib'}", file=sys.stderr)
    print(f"  Metrics:  {models_dir / 'metrics.json'}", file=sys.stderr)
    print(f"  Accuracy: {accuracy:.4f}  F1: {f1:.4f}  ROC-AUC: {roc_auc:.4f}", file=sys.stderr)


if __name__ == "__main__":
    main()
