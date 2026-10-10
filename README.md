# AI-Powered Smart Population, Crowd Forecasting & Government Resource Optimization Platform

## Project Objective
The government needs a centralized system to understand population distribution, forecast future crowd and public-service demand, and allocate available resources efficiently. This platform provides capabilities to model demand, visualize geospatial capacity, run constrained fleet optimization, and forecast crowds during regular days and special events (such as festivals).

## Technology Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (Chart.js, Leaflet.js). No frontend frameworks.
- **Backend**: Python with Flask.
- **Database**: PostgreSQL with PostGIS extension (via SQLAlchemy/Alembic).
- **AI/ML Forecasting**: Scikit-learn (RandomForest) and Pandas for time-series demand modeling.
- **Optimization**: Google OR-Tools for fixed-fleet vehicle reallocation constraints.
- **Testing**: Pytest (backend units) and Playwright.
- **Deployment**: Docker and Docker Compose.

## Architecture
The application uses a standard MVC-inspired pattern:
1. `app/models/`: SQLAlchemy ORM definitions for Geography, Population, Events, Transport, Facilities, Forecasting, and Optimization.
2. `app/routes/`: Flask Blueprints serving both HTML templates and JSON API endpoints.
3. `app/services/`: Core business logic, including `optimization_service.py` for Google OR-Tools fixed-fleet logic.
4. `app/ai/`: Scikit-learn based demand forecasting models (`forecast_model.py`).
5. `app/templates/` & `app/static/`: Server-rendered HTML and Vanilla JS interactive frontend (no React).

## Directory Structure
```
app/
├── ai/                # AI and Forecasting models
├── models/            # SQLAlchemy Database Models
├── routes/            # Flask API and View Routes
├── services/          # Business logic and Optimization (OR-Tools)
├── static/            # CSS and Vanilla JavaScript
└── templates/         # Jinja2 HTML Templates
migrations/            # Alembic DB migrations
scripts/               # Seed scripts
tests/                 # Pytest test cases
docker-compose.yml     # Docker setup with PostGIS
Dockerfile             # Flask app image
```

## Setup & Execution

### Local Python Setup
1. Create virtual env: `python -m venv venv`
2. Activate env: `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Linux)
3. Install dependencies: `pip install -r requirements.txt`

### Database Setup (Docker)
Ensure Docker is running.
```bash
docker-compose up -d db
```
*Note*: This requires a Postgres 15+ container with PostGIS enabled.

### Environment Variables
Copy `.env.example` to `.env` and set appropriate values (e.g. `DATABASE_URL`).

### Running the App
Run Flask server locally:
```bash
python wsgi.py
```
Or run the full stack via Docker:
```bash
docker-compose up --build
```

### Testing
Run tests using Pytest:
```bash
pytest tests/unit/
```

## AI Models & Optimization Constraints
- **Forecasting**: `DemandForecaster` in `app/ai/forecast_model.py` uses RandomForest Regressor, drawing features from weather, timestamps, and historical event flags.
- **Optimization**: `FixedFleetOptimizer` in `app/services/optimization_service.py` uses Google OR-Tools to solve an integer programming problem, ensuring that the total assigned vehicles never exceed the available fleet limit and that capacity trade-offs between source and destination are explicitly calculated and minimized.

## Known Limitations & Missing Integrations
- Since we are in a disconnected sandbox, external telemetry APIs (live buses) are mocked.
- For deployment without PostGIS, geographic queries in `GeoAlchemy2` would fall back to basic floats, but the schema requires PostGIS enabled in PostgreSQL.
