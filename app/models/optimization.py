from app.extensions import db
from datetime import datetime

class OptimizationRun(db.Model):
    __tablename__ = 'optimization_runs'
    id = db.Column(db.Integer, primary_key=True)
    forecast_run_id = db.Column(db.Integer, db.ForeignKey('forecast_runs.id'), nullable=False)
    run_time = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(64), nullable=False)
    objective_value = db.Column(db.Float)

class AllocationRecommendation(db.Model):
    __tablename__ = 'allocation_recommendations'
    id = db.Column(db.Integer, primary_key=True)
    optimization_run_id = db.Column(db.Integer, db.ForeignKey('optimization_runs.id'), nullable=False)
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicles.id'), nullable=False)
    source_stop_id = db.Column(db.Integer, db.ForeignKey('bus_stops.id'), nullable=False)
    destination_stop_id = db.Column(db.Integer, db.ForeignKey('bus_stops.id'), nullable=False)
    departure_time = db.Column(db.DateTime, nullable=False)
    estimated_arrival_time = db.Column(db.DateTime, nullable=False)
    source_capacity_reduction = db.Column(db.Integer)
    destination_capacity_improvement = db.Column(db.Integer)
    net_demand_change = db.Column(db.Integer)
    status = db.Column(db.String(64), default='PENDING') # PENDING, APPROVED, REJECTED

class AllocationPlan(db.Model):
    __tablename__ = 'allocation_plans'
    id = db.Column(db.Integer, primary_key=True)
    recommendation_id = db.Column(db.Integer, db.ForeignKey('allocation_recommendations.id'), nullable=False)
    approved_by_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    approval_time = db.Column(db.DateTime, default=datetime.utcnow)
    implementation_status = db.Column(db.String(64), default='PLANNED')
