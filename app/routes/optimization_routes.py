from flask import Blueprint, jsonify, request
from app.services.optimization_service import FixedFleetOptimizer
import datetime

bp = Blueprint('optimization_api', __name__, url_prefix='/api/v1/optimization')

@bp.route('/run', methods=['POST'])
def run_optimization():
    # In a real scenario, these come from DB based on request params
    # For demonstration, we synthesize the "Festival Scenario"
    
    available_buses = [
        {'id': i, 'capacity': 50, 'current_stop': 'Stop_A'} for i in range(1, 13)
    ] + [
        {'id': i, 'capacity': 50, 'current_stop': 'Stop_B'} for i in range(13, 17)
    ]
    
    # 40k people leaving in 2 hours -> high demand at Stop A
    # Stop B has low demand
    stops_demand = {
        'Stop_A': 1000, 
        'Stop_B': 50
    }
    
    stops_capacity = {'Stop_A': 600, 'Stop_B': 200}
    travel_times = {('Stop_B', 'Stop_A'): 15, ('Stop_A', 'Stop_B'): 15}
    cost_matrix = {('Stop_B', 'Stop_A'): 10, ('Stop_A', 'Stop_B'): 10}
    
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
        'transfers': result['transfers']
    })
