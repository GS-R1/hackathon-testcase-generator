@echo off
title PBI/PR Analyzer - Web Version
echo.
echo ============================================
echo   PBI/PR Analyzer - Web Version
echo   Starting server...
echo ============================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo [ERROR] Dependencies not installed!
    echo.
    echo Please run: npm install
    echo.
    pause
    exit /b 1
)

REM No API key needed - uses AWS Bedrock with your existing AWS credentials

REM Check if dist exists, if not build it
if not exist "dist\pbi-pr-analyzer\browser\index.html" (
    echo Building Angular application...
    call npm run build
    if %errorLevel% neq 0 (
        echo [ERROR] Build failed!
        pause
        exit /b 1
    )
)

REM Start the server
echo Starting server...
echo.
node server.js

REM If we get here, the server stopped
echo.
echo ============================================
echo   Server stopped
echo ============================================
echo.
pause
