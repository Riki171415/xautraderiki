@echo off
echo.
echo  ============================================================
echo   COP TAH Analytics Dashboard — Starting All Services
echo  ============================================================
echo.
echo  [1/3] Starting MT5 Exness Python Bridge...
start "COP TAH MT5 Bridge" cmd /k "cd /d %~dp0 && python exness_mt5_bridge.py"
timeout /t 2 /nobreak >nul

echo  [2/3] Starting Backend (Express + CCXT + WebSocket)...
start "COP TAH Backend" cmd /k "cd /d %~dp0backend && node server.js"
timeout /t 3 /nobreak >nul

echo  [3/3] Starting Frontend (React + Vite)...
start "COP TAH Frontend" cmd /k "cd /d %~dp0frontend && npx vite --host 0.0.0.0 --port 5173"
timeout /t 3 /nobreak >nul

echo.
echo  ============================================================
echo   Dashboard running at: http://localhost:5173
echo   Tablet / Wi-Fi at:    http://192.168.100.42:5173
echo   Backend API at:       http://localhost:3001/api
echo   WebSocket at:         ws://localhost:3001
echo  ============================================================
echo.
echo  Press any key to open the dashboard in your browser...
pause >nul
start http://localhost:5173
