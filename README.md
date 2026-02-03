<<<<<<< HEAD
# Customer Churn Web App

[![UI tests](https://github.com/owner/repo/actions/workflows/ui-tests.yml/badge.svg)](https://github.com/owner/repo/actions/workflows/ui-tests.yml)

Full-stack app for customer churn prediction: React (Vite) frontend, Spring Boot REST API, and a scikit-learn RandomForest model invoked via Python for predictions.

## Prerequisites

- **Java 17** and **Maven**
- **Node.js 18+** and npm
- **Python 3.10+** (for model training and for predict; backend invokes Python at runtime)

## Project structure

```
/
  backend/     Spring Boot API (port 8080)
  frontend/    React + Vite (port 5173)
  e2e/         Playwright end-to-end tests
```

## Run locally

### Backend

Ensure `backend/models/metrics.json` and `backend/models/rf_pipeline.joblib` exist (see [Model training](#model-training)). The backend resolves the metrics file from several locations (configured path, then `./backend/models/metrics.json`, then `./models/metrics.json`, then the bundled classpath copy), so you can run from the **backend** directory or from the repo root:

```bash
cd backend
mvn spring-boot:run
```

Or from repo root: `mvn spring-boot:run -f backend/pom.xml`. API runs at http://localhost:8080.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at http://localhost:5173.

**Codespaces:** Use this so the forwarded port is reachable:

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

Then open the **port 5173** URL from the Ports tab.

### Verify connection

1. Start backend, then run:
   ```bash
   curl -i http://localhost:8080/api/health
   ```
   Expect: `HTTP/1.1 200` and body `{"ok":true}`.

2. Start frontend, open http://localhost:5173 (or the forwarded 5173 URL in Codespaces). Backend status should show "Online". API calls use relative `/api/*` and are proxied to the backend by Vite.

3. In the browser: `GET <frontend_url>/api/health` should return `{"ok":true}`. Submitting a prediction in the UI triggers `POST /api/predict` and shows the returned prediction (or the backend error message if validation/backend fails).

### Codespaces

- **No `VITE_API_URL` needed.** The frontend uses relative `/api` paths; the Vite dev server proxies them to `http://localhost:8080` inside the Codespace. Open the app via the **port 5173** URL from the Ports tab. Backend can stay private (port 8080); only 5173 needs to be public.
- Run backend: `cd backend && mvn spring-boot:run`. Run frontend: `cd frontend && npm run dev -- --host 0.0.0.0 --port 5173`.

### Environment variables

- **Frontend:** The app uses the Vite proxy by default (relative `/api`). No `VITE_API_URL` required for local or Codespaces. See `frontend/.env.example` for optional overrides.
- **Backend:** Defaults in `application.properties` work when you run from `backend/`. To run from the repo root or override paths, use `backend/.env.example` as reference and set `MODEL_METRICS_PATH`, `MODEL_PYTHON_SCRIPT`, `MODEL_PYTHON_WORKING_DIR` (e.g. in your IDE run config or by exporting before `mvn spring-boot:run`).

## Tests

**Backend (unit + integration):**

```bash
cd backend
mvn test
```

**Frontend build:**

```bash
cd frontend
npm run build
```

**E2E (Playwright):**

1. Start backend in one terminal: `cd backend && mvn spring-boot:run`
2. Start frontend in another: `cd frontend && npm run dev`
3. Run E2E:

```bash
cd e2e
npm install
npx playwright install
npm run e2e
```

## QA / UI automation

A dedicated **Playwright (TypeScript)** UI automation suite lives in `frontend/tests/ui/`. Tests use **data-testid** selectors and run against **mocked APIs** (no backend or LLM required). The suite is suitable for CI and for QA/SDET demos.

**What’s covered:** Smoke (app load, sessions list, chat input), sessions (create and switch), delete (non-active and active session), async safety (response does not mix between sessions), persistence (refresh keeps sessions), basic accessibility (aria-labels, keyboard send), and report/panel tabs (Profile, Insights).

**Run locally:**

```bash
cd frontend
npm ci
npx playwright install
npm run test:ui
```

**View report:**

```bash
npm run test:ui:report
```

**CI:** The **UI tests** workflow runs on every push and pull request. It installs dependencies, installs Playwright browsers (Chromium), and runs `npm run test:ui` in the frontend (the app is started with `VITE_E2E=true` so MSW mocks are active). The **Playwright HTML report** and, on failure, **traces, screenshots, and videos** are uploaded as workflow artifacts. On push to `main`, the workflow also publishes the Playwright report and a summary JSON to **GitHub Pages**: the report is at `https://<owner>.github.io/<repo>/playwright-report/` and the summary at `https://<owner>.github.io/<repo>/qa/automation-summary.json`. Replace `<owner>` and `<repo>` with your GitHub org and repo name.

**Automation Dashboard:** The app has a read-only **Automation** page at `/automation` that shows the latest UI automation run summary (pass/fail, counts, duration, commit, links to the CI run and the Playwright HTML report). When running locally, it uses the sample JSON in `frontend/public/qa/automation-summary.json`. When the app is deployed from the same repo as GitHub Pages, it fetches the published summary from `/qa/automation-summary.json`; otherwise set `VITE_AUTOMATION_SUMMARY_URL` to the full JSON URL when building. The Automation Dashboard is read-only and reflects the last main-branch run published to GitHub Pages.

## API

- **Health:** `GET http://localhost:8080/api/health` → `{"ok":true}`
- **Predict:** `POST http://localhost:8080/api/predict` with JSON body.

Sample curl:

```bash
curl -X POST http://localhost:8080/api/predict \
  -H "Content-Type: application/json" \
  -d "{\"age\":40,\"tenure\":24,\"monthlyCharges\":70,\"contract\":\"Month-to-month\",\"internetService\":\"DSL\",\"paymentDelay\":5}"
```

Request fields: `age` (0–120), `tenure` (0–120), `monthlyCharges` (0–1000), `contract` ("Month-to-month" | "One year" | "Two year"), `internetService` ("DSL" | "Fiber optic" | "None"), `paymentDelay` (0–60).

Response: `label` ("CHURN" | "NO_CHURN"), `score` (0–1), `votes`, `explanation` (array of `{feature, reason}`), optional `modelVersion`.

- **Metadata (optional):** `GET http://localhost:8080/api/metadata` → `contractOptions`, `internetServiceOptions` for UI enum options.

- **Model metrics (dashboard):** `GET http://localhost:8080/api/model/metrics` → model info, KPIs (accuracy, F1, ROC-AUC, churn rate, samples), confusion matrix, ROC curve, feature importance. Used by the Dashboard page. The backend looks for metrics in order: configured `model.metrics-path`, then `./backend/models/metrics.json`, then `./models/metrics.json`, then the classpath resource `models/metrics.json` (bundled in the JAR), so the dashboard works whether you run from `backend/` or repo root.
- **Feature importance only:** `GET http://localhost:8080/api/model/feature-importance` → array of `{feature, importance}`.

## Model training

The backend uses a **RandomForest** model trained in Python. Training produces the pipeline and metrics file that the Java API reads and invokes.

1. **Dataset:** Place your churn CSV at `backend/data/telecom_churn.csv` (or set `CHURN_CSV_PATH` / use `--csv path`). Required columns (or renames): `age`, `tenure`, `monthlyCharges`, `contract`, `internetService`, `paymentDelay`, and a binary target column `Churn` (0/1 or Yes/No).
2. **Install Python deps:** `pip install -r backend/requirements.txt` (scikit-learn, pandas, numpy, joblib).
3. **Train:** From the repository root:
   ```bash
   python -m backend.ml.train_rf
   ```
   Or with a custom CSV: `python -m backend.ml.train_rf --csv backend/data/your_file.csv`
4. **Outputs:** `backend/models/rf_pipeline.joblib` and `backend/models/metrics.json`. The Java app reads metrics from the file system and calls `python backend/ml/model_store.py` for each `POST /api/predict` (JSON in via stdin, JSON out via stdout).

**Smoke test:** After training, run `python backend/ml/smoke_test_predict.py` to verify loading and a sample prediction.

## Dashboard

The **Model Dashboard** is the app **home page** (route `/`). Opening the app shows it immediately; metrics are loaded once on page load (no click required). It displays evaluation metrics and session-based predictions: KPI cards (Accuracy, F1, ROC-AUC, Churn Rate, Test Samples), a confusion matrix grid, ROC curve chart, feature importance bar chart, Model Info panel, **Latest prediction (current session)** (label, probability, optional model version), and **Last 10 session predictions** (session title, label, score, date). Metrics come from **`backend/models/metrics.json`** (written by `train_rf.py`) or the bundled classpath copy; the backend resolves the file from several locations so running from `backend/` or repo root both work. Session predictions come from the frontend’s stored chat sessions (localStorage). The route `/dashboard` also shows the same page.

## Environment

- Frontend API base URL: set `VITE_API_URL` (default `http://localhost:8080`) when building or in `.env`.

## Frontend stack

- **React + Vite** (JavaScript). Styling: **TailwindCSS** for layout, typography, and components; **`frontend/src/styles/app.css`** for theme CSS variables (`:root` and `.dark`), custom scrollbars, typing-indicator keyframes, and message fade/slide animations. Tailwind is applied globally via `src/styles/globals.css` (`@tailwind base/components/utilities`); `main.jsx` imports both `globals.css` and `app.css`.

## UI (Churn Assistant)

The frontend is a **chatbot-style** assistant. The assistant asks for customer details step by step (age, tenure, monthly charges, contract, internet service, payment delay). For numbers you type a value and click Send; for contract and internet service you choose from chips/buttons. After all answers, a **Summary** card shows with "Confirm & Predict" and "Edit Answers". On confirm, the app calls `POST /api/predict` and shows the result (CHURN/NO_CHURN, score, explanation) and a recommended retention action. The **header** shows "Churn Assistant", a Backend Online/Offline status pill, a "Reset chat" button, and a **theme toggle (Light/Dark)**. The **left sidebar** (desktop) has links: Chat, Dashboard (home), About, Model, Testing, Batch, Sessions, Automation. The **right panel** (desktop) shows a live **Customer Profile** (answers) and **Prediction Insight** (after prediction). On mobile, sidebar and right panel are behind a hamburger/drawer.

**Theme:** The theme toggle in the header switches between light and dark mode. The choice is **persisted in localStorage** and **system preference** is used on first visit. To change the palette, edit the CSS variables in **`frontend/src/styles/app.css`**: `:root` for the light theme and `.dark` for the dark theme.
=======
<div id="top">

<!-- HEADER STYLE: CLASSIC -->
<div align="center">


# CUSTOMER-CHURN-PREDICTION-RANDOM-FOREST-

<em>Predict Customer Loyalty, Drive Business Growth</em>

<!-- BADGES -->
<img src="https://img.shields.io/github/last-commit/AhmedKamal-41/Customer-Churn-Prediction-Random-Forest-?style=flat&logo=git&logoColor=white&color=0080ff" alt="last-commit">
<img src="https://img.shields.io/github/languages/top/AhmedKamal-41/Customer-Churn-Prediction-Random-Forest-?style=flat&color=0080ff" alt="repo-top-language">
<img src="https://img.shields.io/github/languages/count/AhmedKamal-41/Customer-Churn-Prediction-Random-Forest-?style=flat&color=0080ff" alt="repo-language-count">

<em>Built with the tools and technologies:</em>

<img src="https://img.shields.io/badge/Java-007396.svg?style=flat&logo=Java&logoColor=white" alt="Java">
<img src="https://img.shields.io/badge/JUnit-25A162.svg?style=flat&logo=JUnit5&logoColor=white" alt="JUnit">

</div>
<br>

---

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Usage](#usage)
    - [Testing](#testing)

---

## Overview

Customer-Churn-Prediction-Random-Forest is an open-source toolkit designed to facilitate the development of reliable customer churn prediction models using Random Forest algorithms. It integrates data processing, model training, validation, and performance evaluation within a scalable architecture.

**Why Customer-Churn-Prediction-Random-Forest?**

This project helps data scientists and developers build effective customer retention solutions. The core features include:

- 🧪 **Data Preparation:** Seamless data ingestion, cleaning, and missing value imputation to ensure high-quality inputs.
- 🌲 **Decision Tree & Random Forest Models:** Robust implementations for accurate, interpretable predictions.
- 🔍 **Model Validation:** Comprehensive testing and evaluation pipelines to guarantee model reliability.
- 💻 **User Interface:** An intuitive interface for deploying predictions and generating actionable retention strategies.
- ⚙️ **Extensible Architecture:** Modular components supporting scalable machine learning workflows.

---

## Getting Started

### Prerequisites

This project requires the following dependencies:

- **Programming Language:** Java
- **Package Manager:** Maven

### Installation

Build Customer-Churn-Prediction-Random-Forest- from the source and install dependencies:

1. **Clone the repository:**

    ```sh
    ❯ git clone https://github.com/AhmedKamal-41/Customer-Churn-Prediction-Random-Forest-
    ```

2. **Navigate to the project directory:**

    ```sh
    ❯ cd Customer-Churn-Prediction-Random-Forest-
    ```

3. **Install the dependencies:**

**Using [maven](https://maven.apache.org/):**

```sh
❯ mvn install
```
**Using [maven](https://maven.apache.org/):**

```sh
❯ mvn install
```

### Usage

Run the project with:

**Using [maven](https://maven.apache.org/):**

```sh
mvn exec:java
```
**Using [maven](https://maven.apache.org/):**

```sh
mvn exec:java
```

### Testing

Customer-churn-prediction-random-forest- uses the {__test_framework__} test framework. Run the test suite with:

**Using [maven](https://maven.apache.org/):**

```sh
mvn test
```
**Using [maven](https://maven.apache.org/):**

```sh
mvn test
```

---

<div align="left"><a href="#top">⬆ Return</a></div>

---
>>>>>>> 0070b2ff8a1da9390007a233ad66469fc91189a6
