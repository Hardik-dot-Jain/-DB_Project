@echo off
title EstateFlow Backend Server
echo ========================================================
echo   Starting EstateFlow Backend Server (Express + Oracle)
echo   Port: 5000
echo ========================================================
cd /d "%~dp0backend"
npm start
