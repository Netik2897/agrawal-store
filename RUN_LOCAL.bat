@echo off
echo.
echo ===========================================
echo   PREM JEWELLERS - LOCAL DEVELOPMENT
echo ===========================================
echo.
echo 1. Starting Django Backend...
cd server
start /b venv\Scripts\python manage.py runserver
timeout /t 5

echo.
echo 2. Opening Local Website...
start http://127.0.0.1:8000/
timeout /t 2

echo.
echo 3. Opening Admin Dashboard...
echo Username: Netik Goyal
echo Password: admin123
start http://127.0.0.1:8000/admin/

echo.
echo -------------------------------------------
echo Server is running in the background.
echo To STOP the server, close this window or use Task Manager.
echo -------------------------------------------
echo.
pause
