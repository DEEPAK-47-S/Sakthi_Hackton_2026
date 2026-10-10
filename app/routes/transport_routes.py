import os
import json
from flask import Blueprint, jsonify, request

bp = Blueprint('transport_api', __name__, url_prefix='/api/v1/transport')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STOPS_FILE = os.path.join(BASE_DIR, 'static', 'data', 'bus_stops.json')
EVENTS_FILE = os.path.join(BASE_DIR, 'static', 'data', 'events.json')

def load_stops_data():
    if os.path.exists(STOPS_FILE):
        with open(STOPS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {'total_stops': 0, 'total_districts': 0, 'districts': [], 'by_district': {}, 'stops': []}

def load_events_data():
    if os.path.exists(EVENTS_FILE):
        with open(EVENTS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

@bp.route('/stops', methods=['GET'])
def get_stops():
    data = load_stops_data()
    stops = data.get('stops', [])
    
    district = request.args.get('district', '').strip()
    stop_type = request.args.get('type', '').strip()
    query = request.args.get('q', '').strip().lower()
    
    filtered = stops
    if district:
        filtered = [s for s in filtered if s['district'].lower() == district.lower()]
    if stop_type:
        filtered = [s for s in filtered if s['type'].lower() == stop_type.lower()]
    if query:
        filtered = [s for s in filtered if query in s['name'].lower() or query in s['town'].lower() or query in s['id'].lower()]
        
    return jsonify({
        'total': len(filtered),
        'stops': filtered
    })

@bp.route('/districts', methods=['GET'])
def get_districts():
    data = load_stops_data()
    return jsonify({
        'total': data.get('total_districts', 0),
        'districts': data.get('districts', []),
        'by_district': data.get('by_district', {})
    })

@bp.route('/events', methods=['GET'])
def get_events():
    events = load_events_data()
    month = request.args.get('month', '').strip().lower()
    if month:
        events = [e for e in events if e.get('month', '').lower() == month]
    return jsonify({
        'total': len(events),
        'events': events
    })

@bp.route('/summary', methods=['GET'])
def get_summary():
    data = load_stops_data()
    events = load_events_data()
    stops = data.get('stops', [])
    total_capacity = sum(s.get('capacity', 0) for s in stops)
    main_count = sum(1 for s in stops if s.get('type') == 'main_terminus')
    town_count = sum(1 for s in stops if s.get('type') == 'town_stand')
    local_count = sum(1 for s in stops if s.get('type') == 'local_stop')
    
    return jsonify({
        'total_stops': len(stops),
        'total_districts': data.get('total_districts', 38),
        'main_terminuses': main_count,
        'town_stands': town_count,
        'local_stops': local_count,
        'total_capacity': total_capacity,
        'total_events_2026': len(events),
        'active_fleet': 1452,
        'total_fleet': 1500
    })
