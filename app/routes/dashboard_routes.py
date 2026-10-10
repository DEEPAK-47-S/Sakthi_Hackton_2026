from flask import Blueprint, render_template

bp = Blueprint('dashboard', __name__)

@bp.route('/dashboard')
@bp.route('/')
def index():
    return render_template('dashboard.html')

@bp.route('/optimization')
def optimization():
    return render_template('optimization.html')
