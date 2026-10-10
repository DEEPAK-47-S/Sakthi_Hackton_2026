from app.extensions import db
from datetime import datetime

class Event(db.Model):
    __tablename__ = 'events'
    id = db.Column(db.Integer, primary_key=True)
    area_id = db.Column(db.Integer, db.ForeignKey('areas.id'), nullable=False)
    name = db.Column(db.String(256), nullable=False)
    event_type = db.Column(db.String(128))
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    expected_attendance = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class EventProgramme(db.Model):
    __tablename__ = 'event_programmes'
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)
    description = db.Column(db.String(512))
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)

class WeatherForecast(db.Model):
    __tablename__ = 'weather_forecasts'
    id = db.Column(db.Integer, primary_key=True)
    area_id = db.Column(db.Integer, db.ForeignKey('areas.id'), nullable=False)
    forecast_date = db.Column(db.DateTime, nullable=False)
    temperature = db.Column(db.Float)
    precipitation = db.Column(db.Float)
    conditions = db.Column(db.String(128))

class ServiceDisruption(db.Model):
    __tablename__ = 'service_disruptions'
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(256), nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime)
