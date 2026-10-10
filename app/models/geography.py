from app.extensions import db
from geoalchemy2 import Geometry
from datetime import datetime

class State(db.Model):
    __tablename__ = 'states'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), unique=True, nullable=False)
    districts = db.relationship('District', backref='state', lazy=True)

class District(db.Model):
    __tablename__ = 'districts'
    id = db.Column(db.Integer, primary_key=True)
    state_id = db.Column(db.Integer, db.ForeignKey('states.id'), nullable=False)
    name = db.Column(db.String(128), nullable=False)
    areas = db.relationship('Area', backref='district', lazy=True)
    __table_args__ = (db.UniqueConstraint('name', 'state_id', name='uix_district_state'),)

class Area(db.Model):
    __tablename__ = 'areas'
    id = db.Column(db.Integer, primary_key=True)
    district_id = db.Column(db.Integer, db.ForeignKey('districts.id'), nullable=False)
    name = db.Column(db.String(128), nullable=False)
    geom = db.Column(Geometry('POLYGON', srid=4326))
    bus_stops = db.relationship('BusStop', backref='area', lazy=True)
    __table_args__ = (db.UniqueConstraint('name', 'district_id', name='uix_area_district'),)

class GeographicBoundary(db.Model):
    __tablename__ = 'geographic_boundaries'
    id = db.Column(db.Integer, primary_key=True)
    area_id = db.Column(db.Integer, db.ForeignKey('areas.id'), nullable=False)
    geom = db.Column(Geometry('MULTIPOLYGON', srid=4326))

class BusStop(db.Model):
    __tablename__ = 'bus_stops'
    id = db.Column(db.Integer, primary_key=True)
    area_id = db.Column(db.Integer, db.ForeignKey('areas.id'), nullable=False)
    name = db.Column(db.String(128), nullable=False)
    geom = db.Column(Geometry('POINT', srid=4326))

class TransportRoute(db.Model):
    __tablename__ = 'transport_routes'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    geom = db.Column(Geometry('LINESTRING', srid=4326))
