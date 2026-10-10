class FixedFleetOptimizer:
    def __init__(self, available_buses, stops_demand, stops_capacity, travel_times, cost_matrix):
        self.available_buses = available_buses
        self.stops_demand = stops_demand
        self.stops_capacity = stops_capacity
        self.travel_times = travel_times
        self.cost_matrix = cost_matrix

    def optimize(self, forecast_run_id=None):
        """
        Rule-Based Prototype for Phase 3: Bus Consolidation and Dynamic Fleet Reallocation.
        
        Constraints:
        - Fleet is fixed. We can only redistribute existing buses.
        - Must show trade-off (which route loses service).
        - Consolidate passengers if 2 buses have low passenger counts on same route.
        - Reallocate spare bus to route with shortage.
        """
        recommendations = []
        
        # 1. Identify underutilized buses
        # In this prototype, we look for buses with < 15 passengers on the same route.
        # Since we use dictionaries, we will simulate the logic.
        
        underutilized_buses = [b for b in self.available_buses if b.get('current_passengers', 0) < 15]
        
        if len(underutilized_buses) >= 2:
            bus_1 = underutilized_buses[0]
            bus_2 = underutilized_buses[1]
            
            # 2. Consolidate passengers
            total_pax = bus_1.get('current_passengers', 0) + bus_2.get('current_passengers', 0)
            
            # Check feasibility (fits in one bus of capacity 50)
            if total_pax <= 50 and bus_1.get('route_id') == bus_2.get('route_id'):
                # 3. Identify shortage route
                # Find a stop with demand > capacity
                shortage_stops = [stop for stop, demand in self.stops_demand.items() if demand > self.stops_capacity.get(stop, 0)]
                
                if shortage_stops:
                    target_stop = shortage_stops[0]
                    
                    # 4. Reallocate the spare bus (bus_2)
                    recommendations.append({
                        'recommendation_id': f"REC-{bus_1['id']}-{bus_2['id']}",
                        'action': 'CONSOLIDATE_AND_REALLOCATE',
                        'consolidated_buses': [bus_1['id'], bus_2['id']],
                        'freed_bus_id': bus_2['id'],
                        'trade_off': f"Service reduced slightly on Route {bus_1.get('route_id')} (merged 2 buses into 1).",
                        'reallocated_to': target_stop,
                        'reason': f"Consolidated {total_pax} total passengers into Bus {bus_1['id']}. Reallocated spare Bus {bus_2['id']} to {target_stop} to handle shortage."
                    })

        return {
            'status': 'OPTIMAL' if recommendations else 'INFEASIBLE',
            'objective_value': 100.0 if recommendations else 0.0,
            'transfers': recommendations
        }


