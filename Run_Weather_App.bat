@echo off
cd /d "C:\Users\ADMIN\Downloads\weather_fresh_clean_project"
start "" http://localhost:5500/app.html
python -m http.server 5500
pause
