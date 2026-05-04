$ErrorActionPreference = 'Stop'

Write-Host "Downloading MongoDB ZIP..."
Invoke-WebRequest -Uri "https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-8.0.3.zip" -OutFile "mongodb.zip"

Write-Host "Extracting MongoDB..."
Expand-Archive -Path "mongodb.zip" -DestinationPath "mongodb_temp" -Force

Write-Host "Moving files..."
# The zip usually contains a single folder, e.g., mongodb-win32-x86_64-windows-8.0.3
$extractedFolder = Get-ChildItem -Path "mongodb_temp" | Select-Object -First 1
Move-Item -Path "$($extractedFolder.FullName)\*" -Destination "mongodb_temp" -Force
Rename-Item -Path "mongodb_temp" -NewName "local_mongodb" -Force

Write-Host "Cleaning up..."
Remove-Item -Force "mongodb.zip"

Write-Host "Creating data directory..."
New-Item -ItemType Directory -Force -Path "local_mongodb\data\db" | Out-Null

Write-Host "Done! You can start MongoDB by running: .\local_mongodb\bin\mongod.exe --dbpath .\local_mongodb\data\db"
