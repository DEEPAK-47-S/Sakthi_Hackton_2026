from app.extensions import db
from datetime import datetime

class ModelVersion(db.Model):
    __tablename__ = 'model_versions'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    version = db.Column(db.String(64), nullable=False)
    metrics = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class ForecastRun(db.Model):
    __tablename__ = 'forecast_runs'
    id = db.Column(db.Integer, primary_key=True)
    model_id = db.Column(db.Integer, db.ForeignKey('model_versions.id'))
    run_time = db.Column(db.DateTime, default=datetime.utcnow)
    target_horizon_start = db.Column(db.DateTime, nullable=False)
    target_horizon_end = db.Column(db.DateTime, nullable=False)

class ForecastResult(db.Model):
    __tablename__ = 'forecast_results'
    id = db.Column(db.Integer, primary_key=True)
    forecast_run_id = db.Column(db.Integer, db.ForeignKey('forecast_runs.id'), nullable=False)
    bus_stop_id = db.Column(db.Integer, db.ForeignKey('bus_stops.id'))
    area_id = db.Column(db.Integer, db.ForeignKey('areas.id'))
    predicted_demand = db.Column(db.Float, nullable=False)
    confidence_interval_low = db.Column(db.Float)
    confidence_interval_high = db.Column(db.Float)
    target_time = db.Column(db.DateTime, nullable=False)
