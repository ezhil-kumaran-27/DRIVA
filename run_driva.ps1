Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "       Starting DRIVA Platform               " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# 1. Start the FastAPI Backend
Write-Host "Starting FastAPI Backend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; pip install -r requirements.txt; uvicorn main:app --reload --port 8000"

# 2. Wait for backend to boot
Start-Sleep -Seconds 5

# 3. Start the React Frontend
Write-Host "Starting React Frontend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm install; npm run dev"

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host " Both servers are starting in new windows!   " -ForegroundColor Cyan
Write-Host " Backend: http://localhost:8000              " -ForegroundColor Cyan
Write-Host " Frontend: http://localhost:5173             " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
