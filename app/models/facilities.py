from app.extensions import db
from geoalchemy2 import Geometry

class FacilityType(db.Model):
    __tablename__ = 'facility_types'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), unique=True, nullable=False)

class PublicFacility(db.Model):
    __tablename__ = 'public_facilities'
    id = db.Column(db.Integer, primary_key=True)
    area_id = db.Column(db.Integer, db.ForeignKey('areas.id'), nullable=False)
    facility_type_id = db.Column(db.Integer, db.ForeignKey('facility_types.id'), nullable=False)
    name = db.Column(db.String(256), nullable=False)
    geom = db.Column(Geometry('POINT', srid=4326))

class FacilityCapacity(db.Model):
    __tablename__ = 'facility_capacity'
    id = db.Column(db.Integer, primary_key=True)
    facility_id = db.Column(db.Integer, db.ForeignKey('public_facilities.id'), nullable=False)
    capacity_value = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(64), nullable=False)
