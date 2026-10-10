import os
from flask import Flask
from app.config import config_by_name
from app.extensions import db, migrate, login_manager, csrf

def create_app(config_name='dev'):
    app = Flask(__name__)
    app.config.from_object(config_by_name[config_name])

    # Initialize extensions (Bypassed for frontend demo since PostgreSQL is not running)
    # db.init_app(app)
    # migrate.init_app(app, db)
    # login_manager.init_app(app)
    # csrf.init_app(app)
    
    login_manager.login_view = 'auth.login'
    login_manager.login_message_category = 'info'

    # Register Blueprints (to be added)
    # from app.routes.auth_routes import bp as auth_bp
    # app.register_blueprint(auth_bp)
    
    from app.routes.dashboard_routes import bp as dashboard_bp
    app.register_blueprint(dashboard_bp)
    
    from app.routes.optimization_routes import bp as optimization_bp
    app.register_blueprint(optimization_bp)
    # Error Handlers
    @app.errorhandler(403)
    def forbidden(e):
        return "Forbidden", 403
        
    @app.errorhandler(404)
    def not_found(e):
        return "Not Found", 404
        
    @app.errorhandler(500)
    def internal_error(e):
        return "Internal Server Error", 500

    return app
