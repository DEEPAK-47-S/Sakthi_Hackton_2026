import csv
import json
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_STOPS = os.path.join(BASE_DIR, 'data', 'bus_stops.csv')
CSV_EVENTS = os.path.join(BASE_DIR, 'data', 'events_2026_tamil_nadu.csv')
OUT_STOPS = os.path.join(BASE_DIR, 'app', 'static', 'data', 'bus_stops.json')
OUT_EVENTS = os.path.join(BASE_DIR, 'app', 'static', 'data', 'events.json')

def process_stops():
    stops = []
    by_district = {}
    
    with open(CSV_STOPS, mode='r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            stop = {
                'id': row['stop_id'].strip(),
                'name': row['stop_name'].strip(),
                'district': row['district'].strip(),
                'town': row['town'].strip(),
                'type': row['stop_type'].strip(),
                'lat': float(row['lat']),
                'lng': float(row['lng']),
                'tier': row['tier'].strip(),
                'capacity': int(row['capacity']),
                'synthetic': int(row['is_synthetic'])
            }
            stops.append(stop)
            dist = stop['district']
            if dist not in by_district:
                by_district[dist] = {
                    'district': dist,
                    'total_stops': 0,
                    'total_capacity': 0,
                    'main_terminus': None,
                    'town_stands': [],
                    'stops': []
                }
            by_district[dist]['total_stops'] += 1
            by_district[dist]['total_capacity'] += stop['capacity']
            by_district[dist]['stops'].append(stop['id'])
            if stop['type'] == 'main_terminus':
                by_district[dist]['main_terminus'] = stop
            elif stop['type'] == 'town_stand':
                by_district[dist]['town_stands'].append(stop)

    districts_list = sorted(list(by_district.keys()))
    
    data = {
        'total_stops': len(stops),
        'total_districts': len(districts_list),
        'districts': districts_list,
        'by_district': by_district,
        'stops': stops
    }
    
    with open(OUT_STOPS, 'w', encoding='utf-8') as out:
        json.dump(data, out, ensure_ascii=False, indent=2)
    print(f"Processed {len(stops)} stops across {len(districts_list)} districts into {OUT_STOPS}")

def process_events():
    events = []
    with open(CSV_EVENTS, mode='r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            event = {
                'id': row['event_id'].strip(),
                'month': row['month'].strip(),
                'date_start': row['date_start'].strip() if row.get('date_start') else '',
                'date_end': row['date_end'].strip() if row.get('date_end') else '',
                'name': row['event_name'].strip(),
                'district_scope': row['district_scope'].strip(),
                'venue': row['venue_or_area'].strip(),
                'type': row['event_type'].strip(),
                'crowd_level': row['expected_crowd_level'].strip(),
                'basis': row['crowd_level_basis'].strip(),
                'status': row['date_status'].strip(),
                'source': row['source_url'].strip()
            }
            events.append(event)
            
    with open(OUT_EVENTS, 'w', encoding='utf-8') as out:
        json.dump(events, out, ensure_ascii=False, indent=2)
    print(f"Processed {len(events)} events into {OUT_EVENTS}")

if __name__ == '__main__':
    process_stops()
    process_events()
