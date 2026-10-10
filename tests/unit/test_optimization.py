import pytest
from app.services.optimization_service import FixedFleetOptimizer

def test_fixed_fleet_constraint():
    available_buses = [
        {'id': 1, 'capacity': 50, 'current_stop': 'A'},
        {'id': 2, 'capacity': 50, 'current_stop': 'A'},
        {'id': 3, 'capacity': 50, 'current_stop': 'B'},
    ]
    stops_demand = {'A': 200, 'B': 10}
    stops_capacity = {'A': 100, 'B': 100}
    travel_times = {('B', 'A'): 10, ('A', 'B'): 10}
    cost_matrix = {('B', 'A'): 5, ('A', 'B'): 5}

    optimizer = FixedFleetOptimizer(available_buses, stops_demand, stops_capacity, travel_times, cost_matrix)
    result = optimizer.optimize()

    assert result['status'] in ['OPTIMAL', 'FEASIBLE']
    
    # Prove fleet constraint: Total transferred buses cannot exceed available buses at source B
    # Since B has 1 bus, max 1 bus can transfer to A
    transfers = result['transfers']
    assert len(transfers) <= 1
    
    if transfers:
        t = transfers[0]
        assert t['vehicle_id'] == 3
        assert t['source'] == 'B'
        assert t['destination'] == 'A'
        
        # Source/Destination impacts
        assert t['source_capacity_reduction'] == 50
        assert t['destination_capacity_improvement'] == 50

def test_no_double_booking():
    # If A and C both have high demand, Bus 3 from B cannot go to BOTH A and C.
    available_buses = [
        {'id': 3, 'capacity': 50, 'current_stop': 'B'}
    ]
    stops_demand = {'A': 200, 'B': 0, 'C': 200}
    stops_capacity = {'A': 100, 'B': 100, 'C': 100}
    travel_times = {('B', 'A'): 10, ('B', 'C'): 10}
    cost_matrix = {('B', 'A'): 5, ('B', 'C'): 5}
    
    optimizer = FixedFleetOptimizer(available_buses, stops_demand, stops_capacity, travel_times, cost_matrix)
    result = optimizer.optimize()
    
    # Ensure bus 3 is only transferred once
    assigned_destinations = [t['destination'] for t in result['transfers'] if t['vehicle_id'] == 3]
    assert len(assigned_destinations) <= 1
