"""
Smoke test: load pipeline and metrics, run predict_one with sample payload, print result.
Run from repo root: python backend/ml/smoke_test_predict.py
Or from backend: python ml/smoke_test_predict.py
"""
from __future__ import annotations

import json
import os
import sys

# Same keys as chat / PredictRequest
SAMPLE_PAYLOAD = {
    "age": 42,
    "tenure": 24,
    "monthlyCharges": 72.3,
    "contract": "One year",
    "internetService": "Fiber optic",
    "paymentDelay": 5,
}


def main():
    ml_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.dirname(ml_dir)
    repo_root = os.path.dirname(backend_dir)
    if repo_root not in sys.path:
        sys.path.insert(0, repo_root)
    from backend.ml.model_store import load_metrics, predict_one

    print("Loading metrics...", flush=True)
    metrics = load_metrics()
    print("  version:", metrics.get("model", {}).get("version"), flush=True)
    print("Running predict_one with sample payload...", flush=True)
    result = predict_one(SAMPLE_PAYLOAD)
    print("Result:", json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
