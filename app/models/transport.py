from app.extensions import db
from geoalchemy2 import Geometry

class Vehicle(db.Model):
    __tablename__ = 'vehicles'
    id = db.Column(db.Integer, primary_key=True)
    identifier = db.Column(db.String(64), unique=True, nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(64), default='AVAILABLE')

class VehicleAssignment(db.Model):
    __tablename__ = 'vehicle_assignments'
    id = db.Column(db.Integer, primary_key=True)
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicles.id'), nullable=False)
    route_id = db.Column(db.Integer, db.ForeignKey('transport_routes.id'), nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)

class BusSchedule(db.Model):
    __tablename__ = 'bus_schedules'
    id = db.Column(db.Integer, primary_key=True)
    route_id = db.Column(db.Integer, db.ForeignKey('transport_routes.id'), nullable=False)
    departure_time = db.Column(db.DateTime, nullable=False)

class RouteStopTime(db.Model):
    __tablename__ = 'route_stop_times'
    id = db.Column(db.Integer, primary_key=True)
    schedule_id = db.Column(db.Integer, db.ForeignKey('bus_schedules.id'), nullable=False)
    bus_stop_id = db.Column(db.Integer, db.ForeignKey('bus_stops.id'), nullable=False)
    arrival_time = db.Column(db.DateTime, nullable=False)

class StopCapacity(db.Model):
    __tablename__ = 'stop_capacity'
    id = db.Column(db.Integer, primary_key=True)
    bus_stop_id = db.Column(db.Integer, db.ForeignKey('bus_stops.id'), nullable=False)
    max_waiting_passengers = db.Column(db.Integer)
