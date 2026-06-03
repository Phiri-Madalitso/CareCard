# Stopper gammelt API og starter CareCard (backend + frontend) i to nye vinduer.
# Kjør fra prosjektmappen:  .\scripts\start-carecard.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$apiPath = Join-Path $root "backend\CareCard.API"
$webPath = Join-Path $root "frontend\carecard-web"

Write-Host ""
Write-Host "=== CareCard utviklingsstart ===" -ForegroundColor Cyan
Write-Host ""

# 1. Stopp gammelt API (prosess som lytter pa port 5014)
$listeners = Get-NetTCPConnection -LocalPort 5014 -State Listen -ErrorAction SilentlyContinue
if ($listeners) {
    $processIds = $listeners.OwningProcess | Sort-Object -Unique
    foreach ($processId in $processIds) {
        $name = (Get-Process -Id $processId -ErrorAction SilentlyContinue).ProcessName
        Write-Host "Stopper gammelt API (PID $processId, $name)..." -ForegroundColor Yellow
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
    Write-Host "Gammelt API stoppet." -ForegroundColor Green
} else {
    Write-Host "Ingen API kjorer pa port 5014 (OK)." -ForegroundColor Green
}

# 2. Start backend i nytt vindu
Write-Host "Starter API (http://localhost:5014)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$apiPath'; Write-Host 'CareCard API - IKKE LUKK DETTE VINDUET' -ForegroundColor Green; dotnet run --launch-profile http"
)

Start-Sleep -Seconds 4

# 3. Start frontend i nytt vindu
Write-Host "Starter React (http://localhost:3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$webPath'; Write-Host 'CareCard Frontend - IKKE LUKK DETTE VINDUET' -ForegroundColor Green; npm start"
)

Write-Host ""
Write-Host "Ferdig! To nye vinduer apnet:" -ForegroundColor Green
Write-Host "  1) API      -> http://localhost:5014/scalar" -ForegroundColor White
Write-Host "  2) Frontend -> http://localhost:3000 (eller 3001/3002 hvis opptatt)" -ForegroundColor White
Write-Host ""
Write-Host "Logg inn: ansatt@carecard.no / CareCard123" -ForegroundColor DarkGray
Write-Host "Velg: Langtidsavdeling (har testpasienter)" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Avslutt: Lukk begge vinduer, eller kjør .\scripts\stop-carecard.ps1" -ForegroundColor DarkGray
Write-Host ""
