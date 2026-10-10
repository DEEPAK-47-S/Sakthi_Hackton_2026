from flask import Blueprint, jsonify, request
from app.services.optimization_service import FixedFleetOptimizer
import datetime

bp = Blueprint('optimization_api', __name__, url_prefix='/api/v1/optimization')

@bp.route('/run', methods=['POST'])
def run_optimization():
    # In a real scenario, these come from DB based on request params
    # For demonstration of Phase 3 Consolidation, we synthesize the data
    
    # 2 underutilized buses on the same route (Route 99)
    available_buses = [
        {'id': 101, 'capacity': 50, 'current_stop': 'Rural_Stop_B', 'route_id': 'Route_99', 'current_passengers': 4},
        {'id': 102, 'capacity': 50, 'current_stop': 'Rural_Stop_C', 'route_id': 'Route_99', 'current_passengers': 8},
        {'id': 103, 'capacity': 50, 'current_stop': 'Stop_X', 'route_id': 'Route_12', 'current_passengers': 45}
    ]
    
    # High demand at Stop A (Shortage)
    stops_demand = {
        'Chennai CMBT': 1000, 
        'Rural_Stop_B': 4,
        'Rural_Stop_C': 8
    }
    
    stops_capacity = {
        'Chennai CMBT': 600, # Shortage of 400!
        'Rural_Stop_B': 200,
        'Rural_Stop_C': 200
    }
    
    travel_times = {('Rural_Stop_B', 'Chennai CMBT'): 45}
    cost_matrix = {('Rural_Stop_B', 'Chennai CMBT'): 10}
    
    optimizer = FixedFleetOptimizer(
        available_buses, 
        stops_demand, 
        stops_capacity, 
        travel_times, 
        cost_matrix
    )
    
    result = optimizer.optimize()
    
    return jsonify({
        'status': result['status'],
        'objective_value': result['objective_value'],
        'transfers': result.get('transfers', [])
    })
