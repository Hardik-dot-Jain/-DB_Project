@echo off
title EstateFlow Frontend Dev Server
echo ========================================================
echo   Starting EstateFlow Frontend Server (Vite + React)
echo   URL: http://localhost:3000
echo ========================================================
cd /d "%~dp0frontend"
npm run dev
