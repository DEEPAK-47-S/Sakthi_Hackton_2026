from app.extensions import db
from datetime import datetime

class PopulationEstimate(db.Model):
    __tablename__ = 'population_estimates'
    id = db.Column(db.Integer, primary_key=True)
    area_id = db.Column(db.Integer, db.ForeignKey('areas.id'), nullable=False)
    resident_population = db.Column(db.Integer, nullable=False)
    estimated_visitors = db.Column(db.Integer, default=0)
    data_source = db.Column(db.String(128))
    reference_date = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class CrowdObservation(db.Model):
    __tablename__ = 'crowd_observations'
    id = db.Column(db.Integer, primary_key=True)
    area_id = db.Column(db.Integer, db.ForeignKey('areas.id'))
    bus_stop_id = db.Column(db.Integer, db.ForeignKey('bus_stops.id'))
    observed_count = db.Column(db.Integer, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False)
    source = db.Column(db.String(128))
