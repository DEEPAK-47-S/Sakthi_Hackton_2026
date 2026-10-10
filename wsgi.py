import os
try:
    from dotenv import load_dotenv
    dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
    if os.path.exists(dotenv_path):
        load_dotenv(dotenv_path)
except ImportError:
    pass

from app import create_app

app = create_app(os.getenv('FLASK_ENV') or 'dev')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
