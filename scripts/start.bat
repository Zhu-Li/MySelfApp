@echo off
title 观己小说 API 服务
echo.
echo   启动观己小说 API 服务 (端口 3001)...
echo   按 Ctrl+C 停止服务
echo.
node "%~dp0server.js" %1
pause
