@echo off
REM Get the directory where this script is located
set "PROJECT_DIR=%~dp0"
cd /d "%PROJECT_DIR%"

cls
echo ===========================================
echo      PREM JEWELLERS PROJECT MANAGER
echo ===========================================
echo.
echo [1] Run LOCAL (New Dashboard + Live Rates)
echo [2] Run LIVE (PythonAnywhere Site)
echo.
set /p choice="Enter your choice (1 or 2) and press Enter: "

if "%choice%"=="1" goto LOCAL
if "%choice%"=="2" goto LIVE
goto END

:LOCAL
echo.
echo Checking project files in: %PROJECT_DIR%
if not exist "server\manage.py" (
    echo ERROR: 'server\manage.py' not found!
    echo Please ensure this file is inside: %PROJECT_DIR%
    pause
    exit /b
)

echo Starting Local Server...
cd server

REM Start browsers
start http://127.0.0.1:8000/
start http://127.0.0.1:8000/admin/

echo.
echo -------------------------------------------
echo LOCAL LOGIN DETAILS:
echo Username: Netik Goyal
echo Password: admin123
echo -------------------------------------------
echo.
echo Keep this window open while using the local site.
echo.

REM Running server using absolute path to venv
"%PROJECT_DIR%server\venv\Scripts\python.exe" manage.py runserver
goto END

:LIVE
echo Opening Live Website...
start http://premgold.pythonanywhere.com/admin/
start http://premgold.pythonanywhere.com/
timeout /t 5
goto END

:END
pause



