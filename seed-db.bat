@echo off
title EstateFlow Database Seeder
echo ========================================================
echo   Running EstateFlow Safe Database Seeder
echo ========================================================
cd /d "%~dp0backend"
npm run seed
echo.
pause
