@echo off
echo Starting Social Media App...

REM Start backend server in a new window
start "Backend Server" cmd /k "cd /d c:\Users\Asus\OneDrive\Desktop\A College\New folder\Social_Media_App\backend && npm run dev"

REM Wait a moment for the backend to start
timeout /t 5 /nobreak >nul

REM Start frontend server in a new window
start "Frontend Server" cmd /k "cd /d c:\Users\Asus\OneDrive\Desktop\A College\New folder\Social_Media_App\apk && npm start"

echo Servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
pause