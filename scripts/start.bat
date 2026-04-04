@echo off
title 观己书籍 API 服务
echo.
echo   启动观己书籍 API 服务 (端口 80)...
echo   按 Ctrl+C 停止服务
echo.
node "%~dp0server.js" %1
pause
