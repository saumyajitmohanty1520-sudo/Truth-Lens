# 🔍 TruthLens — AI-Powered Digital Forensics & Veracity Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.0+-000000?logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.4+-F7931E?logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?logo=bootstrap&logoColor=white)](https://getbootstrap.com/)

**TruthLens** is an open-source, full-stack digital forensics and evidence-inquest platform designed for investigative journalists, fact-checkers, intelligence analysts, and citizen researchers. TruthLens combines collaborative case dossier management with a calibrated Machine Learning veracity detection engine to combat misinformation at scale.

---

## 🌟 Key Features

### 1. 📁 Comprehensive Investigation Management
- **Forensic Dossiers**: Multi-stage inquiry workflows (`Active`, `Inquest`, `Resolved`, `Archived`).
- **Primary Evidence Repository**: Ingest text transcripts, archived web captures, images, documents, and peer-reviewed citations.
- **Chronological Timeline Audit**: Interactive chronological visualization mapping the propagation of claims against verified facts.
- **Field Notes & Working Hypotheses**: Markdown research notebooks with tagging and source attribution.
- **Synthesized Verdicts**: Formulate conclusions with confidence scores (`Verified`, `Debunked`, `Misleading`, `Unsubstantiated`).

### 2. 👥 Role-Based Access Control (RBAC) & 3 Dedicated Portals
- **Administrator Console (`admin-dashboard.html`)**:
  - Global public claims triage queue.
  - Case assignment and investigator workload distribution.
  - Role management (`Admin`, `Investigator`, `Citizen User`) with active/suspended controls.
  - 1-click database backup and demonstration reset.
- **Investigator Forensic Lab (`dashboard.html`)**:
  - Case pipeline metrics and domain credibility distributions.
  - Evidence correlation, contradictory claim analysis, and verdict synthesis.
  - Instant access to Notes, Timeline, and Report generation.
- **Citizen Fact-Checking Portal (`user-dashboard.html`)**:
  - Community claim submission portal for viral rumors and news items.
  - Real-time submission tracking (`Under Review`, `Approved`, `Published`).
  - Public repository of peer-reviewed fact-checks and transparency reports.

### 3. 🧠 Hybrid AI/ML Veracity Engine
- **Statistical NLP**: TF-IDF vectorization paired with calibrated statistical classifiers (Complement Naive Bayes, Logistic Regression, SGD, and Random Forest) trained on over 11,000+ verified claims across 12 domains.
- **Linguistic Heuristic Signals**: Sensationalism detection, urgency/fear triggers, vague attribution analysis, punctuation/capitalization anomalies, and domain authority weighting.
- **High-Performance REST Microservice**: Flask API with real-time inference, batch prediction, domain scoring, and on-demand retraining.
- **Resilient Dual-Mode Execution**: The frontend seamlessly queries the Python REST engine when available, gracefully falling back to a client-side heuristic engine when offline.

### 4. ☁️ Flexible Data Layer (Cloud Firestore + Local Demo Mode)
- **Firebase Firestore**: Real-time cloud persistence for teams and distributed newsrooms.
- **Zero-Setup Local Mode**: Automatically operates offline via browser `localStorage` when cloud keys are omitted.

---

## 🏗️ Architecture Overview

```
                      ┌────────────────────────────────────────┐
                      │          TruthLens Web UI              │
                      │  (HTML5 / CSS3 / Vanilla JS / BootStrap)│
                      └──────────────────┬─────────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 │                                               │
                 ▼                                               ▼
   ┌───────────────────────────┐                   ┌───────────────────────────┐
   │    Python ML REST API     │                   │   Firebase Cloud / Local  │
   │   (Flask + Scikit-Learn)  │                   │     (Firestore & Auth)    │
   │  • TF-IDF Vectorizer      │                   │  • Dossiers & Evidence    │
   │  • Calibrated Classifiers │                   │  • Timelines & Notes      │
   │  • Domain Scoring Engine  │                   │  • User Roles & RBAC      │
   └───────────────────────────┘                   └───────────────────────────┘
```

---

## 📁 Project Structure

```text
Truth-Lens/
├── css/                           # Stylesheets
│   ├── auth.css                   # Authentication & registration styles
│   ├── dashboard.css              # Dashboard component styles
│   ├── investigation.css          # Dossier & evidence styles
│   └── style.css                  # Main theme & responsive framework
├── data/
│   └── dataset.csv                # Curated training dataset (11,000+ entries)
├── js/                            # Client-side JavaScript modules
│   ├── auth.js                    # RBAC authentication & session manager
│   ├── dashboard.js               # Dashboard charts & UI controllers
│   ├── evidence.js                # Evidence management & citation helpers
│   ├── firebase-config.js         # Firebase initialization (safe template)
│   ├── firebase-config.example.js # Template configuration for developers
│   ├── firebase-db.js             # Firestore persistence & local fallback
│   ├── investigation.js           # Investigation CRUD & workflows
│   ├── main.js                    # Global navigation, alerts & utilities
│   ├── ml-model.js                # Python API bridge & client-side heuristics
│   ├── notes.js                   # Investigator notes module
│   ├── profile.js                 # User profile management
│   ├── timeline.js                # Chronological timeline builder
│   └── validation.js              # Form input validation routines
├── models/
│   ├── fake_news_model.joblib     # Pre-trained production Scikit-learn model
│   └── model_metadata.json        # Accuracy benchmarks & top lexical features
├── 404.html                       # 404 error page
├── add-evidence.html              # Evidence submission view
├── admin-dashboard.html           # Administrator control center
├── app.py                         # Flask REST API microservice
├── conclusion.html                # Case verdict & conclusion view
├── create-investigation.html      # New dossier creation form
├── dashboard.html                 # Lead investigator workspace
├── evidence.html                  # Evidence catalog view
├── FIREBASE_SETUP.md              # Firebase Cloud setup guide
├── generate_large_dataset.py      # Dataset generation script
├── index.html                     # Public homepage & claim scanner
├── investigation-details.html     # Dossier detail inspection view
├── investigations.html            # Case directory & filters
├── login.html                     # Multi-role authentication page
├── ml_model.py                    # Python ML veracity engine & CLI
├── notes.html                     # Field notes scratchpad
├── profile.html                   # User profile & preferences
├── README.md                      # Platform documentation
├── README_ML.md                   # ML pipeline documentation
├── register.html                  # User registration page
├── reports.html                   # Forensic report generator & exporter
├── requirements.txt               # Python package dependencies
├── run_ml_server.bat              # 1-click REST API server launcher (Windows)
├── settings.html                  # Platform settings & config panel
├── timeline.html                  # Chronological event timeline
├── train.py                       # ML model training & evaluation script
├── train_model.bat                # 1-click model trainer (Windows)
└── user-dashboard.html            # Citizen contributor portal
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Python 3.10+ (for running the AI/ML microservice)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/saumyajitmohanty1520-sudo/Truth-Lens.git
cd Truth-Lens
```

### 2. Launch the Web Interface
TruthLens runs out-of-the-box in static/client mode! Simply open `index.html` in your favorite browser, or serve it locally:

```bash
# Using Python's built-in HTTP server:
python -m http.server 8080
```
Then visit `http://localhost:8080` in your browser.

---

### 3. (Optional) Run the Python AI/ML Veracity Engine

To enable real-time Scikit-learn predictions in addition to client heuristics:

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Start the API server**:
   ```bash
   python app.py
   ```
   *(Or double-click `run_ml_server.bat` on Windows)*

   The API will listen at `http://127.0.0.1:5000`.

3. **(Optional) Retrain the Machine Learning Model**:
   ```bash
   python train.py
   ```
   *(Or double-click `train_model.bat` on Windows)*

---

## 🔑 Demo Accounts & Test Credentials

For quick local testing and evaluation, the following demo accounts are pre-configured:

| Role | Name | Email | Password | Target Dashboard |
|---|---|---|---|---|
| **Administrator** | Morgan Vance | `admin@truthlens.org` | `Admin@12345` | [`admin-dashboard.html`](admin-dashboard.html) |
| **Investigator** | Abinash Panigrahy | `investigator@truthlens.org` | `Investigator@12345` | [`dashboard.html`](dashboard.html) |
| **Citizen User** | Elena Rostova | `user@truthlens.org` | `User@12345` | [`user-dashboard.html`](user-dashboard.html) |

> 💡 **Tip:** You can also click the **1-Click Quick Fill** buttons directly on the [Login Page](login.html).

---

## ⚙️ Configuration & Firebase Setup

TruthLens operates in **Local Demo Mode** by default. To connect a shared Google Firebase Cloud Firestore database:

1. Create a project at the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Firestore Database** and **Firebase Authentication** (Email/Password).
3. Copy your Web App credentials into `js/firebase-config.js` or create a git-ignored `js/firebase-config.local.js`:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_FIREBASE_API_KEY",
     authDomain: "your-project-id.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project-id.appspot.com",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```
4. For complete step-by-step instructions, see [FIREBASE_SETUP.md](FIREBASE_SETUP.md).

---

## 🛡️ Security & Privacy

- **No Secrets in Source Control**: Credentials, private keys, and `.env` files are excluded via `.gitignore`.
- **Safe Firebase Configuration**: Sample configuration templates are used for version control. Real credentials should remain in private local files (`firebase-config.local.js`) or environment secrets.
- **Client-Side Sanitization**: All user-submitted evidence text and URLs are validated and escaped prior to rendering to defend against Cross-Site Scripting (XSS).

---

## 🤝 Contributing

Contributions are welcomed! Follow these steps to contribute:

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
