@echo off
echo ===================================================
echo Starting AI Population Analyser Server...
echo ===================================================

:: Check if virtual environment exists
if not exist "venv\Scripts\activate.bat" (
    echo [INFO] Virtual environment not found. Creating one...
    python -m venv venv
    echo [INFO] Installing requirements...
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
) else (
    echo [INFO] Activating virtual environment...
    call venv\Scripts\activate.bat
)

:: Check for .env file, if not exist, copy from .env.example
if not exist ".env" (
    if exist ".env.example" (
        echo [INFO] .env file not found, creating from .env.example...
        copy .env.example .env > nul
    ) else (
        echo [WARNING] No .env or .env.example file found.
    )
)

echo ===================================================
echo Server is launching at: http://127.0.0.1:5000
echo Opening browser automatically...
echo Press Ctrl+C in this window to stop the server.
echo ===================================================
start http://127.0.0.1:5000
python wsgi.py

pause
