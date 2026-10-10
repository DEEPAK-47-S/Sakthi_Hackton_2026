import unittest
from app.services.optimization_service import FixedFleetOptimizer

class TestOptimizationService(unittest.TestCase):
    def test_successful_consolidation(self):
        buses = [
            {'id': 1, 'route_id': 'R1', 'current_passengers': 10},
            {'id': 2, 'route_id': 'R1', 'current_passengers': 12},
        ]
        demand = {'A': 1000, 'B': 10}
        capacity = {'A': 500, 'B': 50}
        opt = FixedFleetOptimizer(buses, demand, capacity, {}, {})
        res = opt.optimize()
        self.assertEqual(res['status'], 'OPTIMAL')
        self.assertEqual(len(res['transfers']), 1)
        self.assertEqual(res['transfers'][0]['action'], 'CONSOLIDATE_AND_REALLOCATE')
        
    def test_insufficient_capacity(self):
        # 30 + 30 = 60 > 50 (max capacity)
        buses = [
            {'id': 1, 'route_id': 'R1', 'current_passengers': 30},
            {'id': 2, 'route_id': 'R1', 'current_passengers': 30},
        ]
        demand = {'A': 1000}
        capacity = {'A': 500}
        opt = FixedFleetOptimizer(buses, demand, capacity, {}, {})
        res = opt.optimize()
        self.assertEqual(res['status'], 'INFEASIBLE')
        
    def test_different_routes(self):
        # Cannot consolidate buses on different routes
        buses = [
            {'id': 1, 'route_id': 'R1', 'current_passengers': 10},
            {'id': 2, 'route_id': 'R2', 'current_passengers': 10},
        ]
        demand = {'A': 1000}
        capacity = {'A': 500}
        opt = FixedFleetOptimizer(buses, demand, capacity, {}, {})
        res = opt.optimize()
        self.assertEqual(res['status'], 'INFEASIBLE')
        
    def test_no_destination_shortage(self):
        # No route needs extra buses
        buses = [
            {'id': 1, 'route_id': 'R1', 'current_passengers': 10},
            {'id': 2, 'route_id': 'R1', 'current_passengers': 10},
        ]
        demand = {'A': 100}
        capacity = {'A': 500} # Capacity > demand, no shortage
        opt = FixedFleetOptimizer(buses, demand, capacity, {}, {})
        res = opt.optimize()
        self.assertEqual(res['status'], 'INFEASIBLE')

if __name__ == '__main__':
    unittest.main()
