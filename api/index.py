import os
import sys

# Add project root directory to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from wsgi import app

# For Vercel Serverless Function entry point
app = app
