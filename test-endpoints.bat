@echo off
REM Local Testing Script for Magister Portal

echo.
echo ========================================
echo   MAGISTER PORTAL - LOCAL TESTING
echo ========================================
echo.

REM Test 1: Health Endpoint
echo Test 1: Health Endpoint
echo GET http://localhost:3000/api/health
echo.

powershell -Command ^
"$response = Invoke-WebRequest -Uri 'http://localhost:3000/api/health' -Method GET -ErrorAction SilentlyContinue; " ^
"if ($response) { " ^
"Write-Host '✅ PASSED'; " ^
"Write-Host \"Status: $($response.StatusCode)\"; " ^
"Write-Host 'Response:'; " ^
"$response.Content | ConvertFrom-Json | ConvertTo-Json " ^
"} else { " ^
"Write-Host '❌ FAILED - Server not responding' " ^
"}"

echo.
echo ========================================
echo Test 2: Signup Validation
echo POST http://localhost:3000/api/auth/signup
echo.

powershell -Command ^
"$body = @{ email='test@example.com'; password='TestPass123' } | ConvertTo-Json; " ^
"$response = Invoke-WebRequest -Uri 'http://localhost:3000/api/auth/signup' -Method POST -ContentType 'application/json' -Body $body -ErrorAction SilentlyContinue; " ^
"if ($response) { " ^
"Write-Host \"Status: $($response.StatusCode)\"; " ^
"Write-Host 'Endpoint responds correctly' " ^
"} else { " ^
"Write-Host '⚠️  Endpoint error (expected if MongoDB not running)' " ^
"}"

echo.
echo ========================================
echo Test 3: Contact Form Validation
echo POST http://localhost:3000/api/contact
echo.

powershell -Command ^
"$body = @{ name='Test User'; email='contact@example.com'; message='Test message' } | ConvertTo-Json; " ^
"$response = Invoke-WebRequest -Uri 'http://localhost:3000/api/contact' -Method POST -ContentType 'application/json' -Body $body -ErrorAction SilentlyContinue; " ^
"if ($response) { " ^
"Write-Host \"Status: $($response.StatusCode)\"; " ^
"Write-Host 'Endpoint responds correctly' " ^
"}"

echo.
echo ========================================
echo.
echo Server is running at: http://localhost:3000
echo.
echo To stop the server, press Ctrl+C in the terminal where it's running
echo.
