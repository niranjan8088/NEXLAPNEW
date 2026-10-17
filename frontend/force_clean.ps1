$nm = 'C:\Users\DELL\Downloads\ne\ne\nexbyte\frontend\node_modules'

Write-Host "Resetting file attributes in node_modules..." -ForegroundColor Cyan
Get-ChildItem -Path $nm -Recurse -Force -ErrorAction SilentlyContinue | ForEach-Object {
    try { $_.Attributes = 'Normal' } catch {}
}

Write-Host "Deleting node_modules..." -ForegroundColor Cyan
cmd /c "rd /s /q `"$nm`"" 2>&1

if (Test-Path $nm) {
    Write-Host "Still exists, trying again..." -ForegroundColor Yellow
    Remove-Item -Path $nm -Recurse -Force -ErrorAction SilentlyContinue
}

if (Test-Path $nm) {
    Write-Host "FAILED to delete node_modules" -ForegroundColor Red
} else {
    Write-Host "Successfully deleted node_modules" -ForegroundColor Green
}
