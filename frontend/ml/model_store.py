"""
Lazy-load pipeline and metrics; predict_one(payload) for single-row prediction.
CLI: read JSON from stdin, print prediction JSON to stdout; on error print to stderr and exit non-zero.
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

# Single source of truth: chat/frontend keys -> dataset column names used in pipeline
CHAT_TO_DATASET = {
    "age": "age",
    "tenure": "tenure",
    "monthlyCharges": "monthlyCharges",
    "contract": "contract",
    "internetService": "internetService",
    "paymentDelay": "paymentDelay",
}
REQUIRED_KEYS = list(CHAT_TO_DATASET.keys())
PIPELINE_COLUMNS = list(CHAT_TO_DATASET.values())

_models_dir = os.environ.get("CHURN_MODELS_DIR")
if _models_dir is None:
    _repo = Path(__file__).resolve().parent.parent
    _models_dir = _repo / "models"
else:
    _models_dir = Path(_models_dir)

_pipeline_path = _models_dir / "rf_pipeline.joblib"
_metrics_path = _models_dir / "metrics.json"

_pipeline_cache = None
_metrics_cache = None


def _load_pipeline():
    global _pipeline_cache
    if _pipeline_cache is None:
        import joblib
        if not _pipeline_path.exists():
            raise FileNotFoundError(f"Pipeline not found: {_pipeline_path}. Run train_rf.py first.")
        _pipeline_cache = joblib.load(_pipeline_path)
    return _pipeline_cache


def load_metrics():
    """Read and return backend/models/metrics.json as dict."""
    global _metrics_cache
    if _metrics_cache is None:
        if not _metrics_path.exists():
            raise FileNotFoundError(f"Metrics not found: {_metrics_path}. Run train_rf.py first.")
        with open(_metrics_path, "r", encoding="utf-8") as f:
            _metrics_cache = json.load(f)
    return _metrics_cache


def predict_one(payload_dict: dict) -> dict:
    """
    Run model prediction for one record. payload_dict must contain REQUIRED_KEYS.
    Returns {"label": "CHURN"|"NO_CHURN", "score": float, "proba": float, "model_version": str}.
    """
    import pandas as pd

    missing = [k for k in REQUIRED_KEYS if payload_dict.get(k) is None]
    if missing:
        raise ValueError(f"Missing required fields: {missing}")

    row = {PIPELINE_COLUMNS[i]: [payload_dict[k]] for i, k in enumerate(REQUIRED_KEYS)}
    X = pd.DataFrame(row, columns=PIPELINE_COLUMNS)

    pipeline = _load_pipeline()
    proba = float(pipeline.predict_proba(X)[0][1])
    label = "CHURN" if proba >= 0.5 else "NO_CHURN"
    try:
        meta = load_metrics()
        model_version = (meta.get("model") or {}).get("version") or meta.get("model_version") or ""
    except Exception:
        model_version = ""

    return {
        "label": label,
        "score": proba,
        "proba": proba,
        "model_version": model_version,
    }


def _cli():
    try:
        raw = sys.stdin.read().strip()
        if not raw:
            err = {"error": "Empty input"}
            print(json.dumps(err), file=sys.stderr)
            sys.exit(1)
        payload = json.loads(raw)
        out = predict_one(payload)
        print(json.dumps(out))
    except ValueError as e:
        err = {"error": str(e)}
        print(json.dumps(err), file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        err = {"error": str(e)}
        print(json.dumps(err), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    _cli()
