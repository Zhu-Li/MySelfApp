@echo off
title 观己 - 应用服务器
echo.
echo   启动观己应用服务器...
echo   按 Ctrl+C 停止服务
echo.
node "%~dp0server.js" %1
pause
