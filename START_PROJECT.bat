@echo off
echo Starting Prem Jewellers Project...
cd server
call .\venv\Scripts\activate.bat
start http://127.0.0.1:8000/admin
start ..\index.html
python manage.py runserver
pause
