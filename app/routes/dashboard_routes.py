from flask import Blueprint, render_template

bp = Blueprint('dashboard', __name__)

@bp.route('/')
def index():
    return render_template('public.html')

from flask import request, redirect, url_for

@bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        if username == 'admin' and password == 'admin123':
            return redirect(url_for('dashboard.dashboard_view'))
        else:
            return render_template('login.html', error="Invalid credentials. Please try again.")
    return render_template('login.html')

@bp.route('/dashboard')
def dashboard_view():
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
