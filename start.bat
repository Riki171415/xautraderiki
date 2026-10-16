@echo off
echo.
echo  ============================================================
echo   COP TAH Analytics Dashboard — Starting All Services
echo  ============================================================
echo.
echo  [1/2] Starting Backend (Express + CCXT + WebSocket)...
start "COP TAH Backend" cmd /k "cd /d %~dp0backend && node server.js"
timeout /t 3 /nobreak >nul

echo  [2/2] Starting Frontend (React + Vite)...
start "COP TAH Frontend" cmd /k "cd /d %~dp0frontend && npx vite --port 5173"
timeout /t 3 /nobreak >nul

echo.
echo  ============================================================
echo   Dashboard running at: http://localhost:5173
echo   Backend API at:       http://localhost:3001/api
echo   WebSocket at:         ws://localhost:3001
echo  ============================================================
echo.
echo  Press any key to open the dashboard in your browser...
pause >nul
start http://localhost:5173
