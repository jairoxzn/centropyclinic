Set-Location c:\www\Apache24\htdocs\pysco

Write-Host "Moving frontend files..."
Move-Item -Path "frontend\src" -Destination "." -Force
Move-Item -Path "frontend\public" -Destination "." -Force
Move-Item -Path "frontend\index.html" -Destination "." -Force
Move-Item -Path "frontend\vite.config.js" -Destination "." -Force
Move-Item -Path "frontend\tailwind.config.js" -Destination "." -Force
Move-Item -Path "frontend\postcss.config.js" -Destination "." -Force
Move-Item -Path "frontend\.oxlintrc.json" -Destination "." -Force
Move-Item -Path "frontend\README.md" -Destination "FRONTEND_README.md" -Force

Write-Host "Moving backend files..."
Move-Item -Path "backend\server.js" -Destination "." -Force
Move-Item -Path "backend\prisma" -Destination "." -Force
Move-Item -Path "backend\prisma.config.ts" -Destination "." -Force
if (Test-Path "backend\.env") {
    Move-Item -Path "backend\.env" -Destination "." -Force
}

Write-Host "Unpacking backend src..."
Get-ChildItem -Path "backend\src" | Move-Item -Destination "." -Force

Write-Host "Cleaning up old folders..."
Remove-Item -Path "backend" -Recurse -Force
Remove-Item -Path "frontend" -Recurse -Force
if (Test-Path "node_modules") { Remove-Item -Path "node_modules" -Recurse -Force }
if (Test-Path "package-lock.json") { Remove-Item -Path "package-lock.json" -Force }

Write-Host "Installing dependencies..."
npm install
