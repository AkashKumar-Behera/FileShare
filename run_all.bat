@echo off
echo ===================================================
echo   FileShare Offline Launcher (Django + Next.js)
echo ===================================================
echo.
echo [1/2] Starting Django backend server on port 8000...
start "FileShare Django Backend" cmd /k "if exist venv\Scripts\activate.bat ( call venv\Scripts\activate.bat && python manage.py runserver 0.0.0.0:8000 ) else ( python manage.py runserver 0.0.0.0:8000 )"

echo [2/2] Starting Next.js frontend server on port 3000...
start "FileShare Next.js Frontend" cmd /k "cd frontend && npm run dev:https"

echo.
echo Both servers starting!
echo - Access platform at: https://localhost:3000
echo - Access backend API at: http://localhost:8000/api
echo.
echo Press any key to exit this launcher window...
pause > nul
