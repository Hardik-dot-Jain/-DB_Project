@echo off
title EstateFlow Database Inspector
echo ========================================================
echo   Running EstateFlow Database Inspector
echo ========================================================
cd /d "%~dp0backend"
npm run inspect
echo.
pause
