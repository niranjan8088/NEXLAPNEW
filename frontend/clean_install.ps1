$frontend = 'C:\Users\DELL\Downloads\ne\ne\nexbyte\frontend'
$nm = "$frontend\node_modules"

Write-Host "Step 1: Reset all attributes..." -ForegroundColor Cyan
if (Test-Path $nm) {
    Get-ChildItem -Path $nm -Recurse -Force -ErrorAction SilentlyContinue | ForEach-Object {
        try { $_.Attributes = 'Normal' } catch {}
    }
    # Use robocopy mirror trick with empty dir to clear contents
    $empty = "$env:TEMP\empty_dir_$$"
    New-Item -ItemType Directory -Path $empty -Force | Out-Null
    Write-Host "  Using robocopy to empty node_modules..." -ForegroundColor Yellow
    robocopy $empty $nm /MIR /NFL /NDL /NJH /NJS | Out-Null
    Remove-Item $empty -Force -ErrorAction SilentlyContinue
    # Now delete the empty shell
    cmd /c "rd /s /q `"$nm`"" 2>&1 | Out-Null
}

if (Test-Path $nm) {
    Write-Host "WARN: node_modules still exists, forcing..." -ForegroundColor Yellow
    Remove-Item $nm -Recurse -Force -ErrorAction SilentlyContinue
}

if (Test-Path $nm) {
    Write-Host "ERROR: Could not fully clean node_modules!" -ForegroundColor Red
    exit 1
}

Write-Host "Step 2: node_modules fully cleaned." -ForegroundColor Green

Write-Host "Step 3: Running npm install..." -ForegroundColor Cyan
Set-Location $frontend
$result = cmd /c "npm install --legacy-peer-deps 2>&1"
$result | ForEach-Object { Write-Host $_ }

Write-Host "Step 4: Verifying next binary..." -ForegroundColor Cyan
if (Test-Path "$nm\next\dist\bin\next") {
    Write-Host "SUCCESS: next\dist\bin\next exists!" -ForegroundColor Green
} else {
    Write-Host "ERROR: next\dist\bin\next still missing!" -ForegroundColor Red
    # List what's in next/
    Get-ChildItem "$nm\next" -ErrorAction SilentlyContinue | Select-Object Name
}
