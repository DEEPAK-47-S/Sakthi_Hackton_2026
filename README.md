# 🚀 FestivalFlow AI - Smart Population & Transit Engine

## Project Objective
A state-of-the-art predictive platform designed for the Tamil Nadu Government to intelligently model population distribution, predict massive crowd surges during major festivals (e.g., Pongal, Deepavali), and dynamically optimize public transit resources.

## 🌟 Hackathon Breakthroughs & Features
1. **5-Model AI Ensemble Architecture**: Evolved from a basic model to a powerful ensemble of LSTM, GRU, SARIMA, XGBoost, and Random Forest, providing highly resilient predictions under data drift.
2. **Auto-Warden Dynamic Dispatch**: Analyzes live high-deficit hubs across 38 districts and physically re-routes reserve fleets via a constrained optimization engine powered by Google OR-Tools.
3. **Live State-wide Monitoring**: Highly interactive Live Map with dynamic marker states.
4. **Custom Unplanned Events Simulator**: Trigger emergency AI dispatches instantly for political rallies or local thiruvizhas to see how the system immediately responds to new load points.
5. **Weather-Driven Modeling**: Fully integrated deterministic weather engine that spikes transit loads during monsoons in real-time.

## Technology Stack
- **Frontend**: HTML5, CSS3 (Premium Glassmorphism & Animations), Vanilla JS, Leaflet.js
- **Backend**: Python, Flask, Blueprint Architecture
- **AI / ML**: TensorFlow, Keras, Scikit-Learn, Statsmodels
- **Optimization Algorithms**: Google OR-Tools
- **Database**: PostgreSQL with PostGIS

## Local Python Setup
1. Create virtual env: `python -m venv venv`
2. Activate env: `venv\Scripts\activate` (Windows)
3. Install dependencies: `pip install -r requirements.txt`
4. Set up `.env` from `.env.example`
5. Start Server: Double click `start_server.bat` or run `python wsgi.py`

## Automation & Background Tasks
- The AI Ensemble actively infers new projections continuously without user prompt.
- Background fleet simulation replicates continuous state-wide transit operation dynamically simulating ticket transactions and boarding queues.
