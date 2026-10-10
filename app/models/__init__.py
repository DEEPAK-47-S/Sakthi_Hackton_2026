from app.extensions import db

# Import all models here to register them with SQLAlchemy
from app.models.users import User, Role
from app.models.geography import State, District, Area, GeographicBoundary, BusStop, TransportRoute
from app.models.population import PopulationEstimate, CrowdObservation
from app.models.events import Event, EventProgramme, WeatherForecast, ServiceDisruption
from app.models.transport import Vehicle, VehicleAssignment, BusSchedule, RouteStopTime, StopCapacity
from app.models.facilities import PublicFacility, FacilityType, FacilityCapacity
from app.models.forecasting import ForecastRun, ForecastResult, ModelVersion
from app.models.optimization import OptimizationRun, AllocationRecommendation, AllocationPlan
from app.models.audit import AuditLog
