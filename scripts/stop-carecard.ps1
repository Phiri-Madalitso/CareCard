# Stopper CareCard API og eventuelle npm/React-prosesser pa vanlige porter.
# Kjør: .\scripts\stop-carecard.ps1

Write-Host ""
Write-Host "Stopper CareCard..." -ForegroundColor Yellow

foreach ($port in @(5014, 3000, 3001, 3002)) {
    $listeners = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    foreach ($conn in $listeners) {
        $processId = $conn.OwningProcess
        $name = (Get-Process -Id $processId -ErrorAction SilentlyContinue).ProcessName
        Write-Host "  Stopper $name (PID $processId) pa port $port"
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    }
}

Get-Process -Name "CareCard.API" -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "  Stopper CareCard.API (PID $($_.Id))"
    Stop-Process -Id $_.Id -Force
}

Write-Host "Ferdig. Du kan starte pa nytt med .\scripts\start-carecard.ps1" -ForegroundColor Green
Write-Host ""
