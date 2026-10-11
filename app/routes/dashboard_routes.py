from flask import Blueprint, render_template

bp = Blueprint('dashboard', __name__)

@bp.route('/')
@bp.route('/dashboard')
def index():
    return render_template('dashboard.html')

@bp.route('/optimization')
def optimization():
    return render_template('optimization.html')

@bp.route('/map')
def live_map():
    return render_template('map.html')

@bp.route('/forecasting')
def forecasting():
    return render_template('forecasting.html')

@bp.route('/crowd-monitoring')
@bp.route('/crowd_monitoring')
def crowd_monitoring():
    return render_template('crowd_monitoring.html')


@bp.route('/routes')
def routes():
    return render_template('routes.html')

@bp.route('/schedule')
def schedule():
    return render_template('schedule.html')

@bp.route('/reports')
def reports():
    return render_template('reports.html')

@bp.route('/fleet')
def fleet():
    return render_template('fleet.html')
