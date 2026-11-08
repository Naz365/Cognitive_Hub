# Setup script for Security & Pentesting MCP Tools (HexStrike AI & ClaudIT Security)
$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Cognitive Hub - Security Tools Installer" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$ToolsDir = Join-Path $PSScriptRoot "..\tools"
if (-not (Test-Path $ToolsDir)) {
    New-Item -ItemType Directory -Path $ToolsDir | Out-Null
    Write-Host "[+] Created tools directory: $ToolsDir" -ForegroundColor Green
}

# 1. ClaudIT Security (HarmonicSecurity/claudit-sec)
$ClauditDir = Join-Path $ToolsDir "claudit-sec"
if (-not (Test-Path $ClauditDir)) {
    Write-Host "[*] Cloning ClaudIT Security repository..." -ForegroundColor Yellow
    git clone https://github.com/HarmonicSecurity/claudit-sec.git $ClauditDir
} else {
    Write-Host "[+] ClaudIT Security already present." -ForegroundColor Green
}

# 2. HexStrike AI (0x4m4/hexstrike-ai)
$HexStrikeDir = Join-Path $ToolsDir "hexstrike-ai"
if (-not (Test-Path $HexStrikeDir)) {
    Write-Host "[*] Cloning HexStrike AI repository..." -ForegroundColor Yellow
    git clone https://github.com/0x4m4/hexstrike-ai.git $HexStrikeDir
} else {
    Write-Host "[+] HexStrike AI already present." -ForegroundColor Green
}

# 3. Ensure Windows temp directory for HexStrike
if (-not (Test-Path "C:\tmp")) {
    New-Item -ItemType Directory -Path "C:\tmp" | Out-Null
    Write-Host "[+] Created C:\tmp for HexStrike" -ForegroundColor Green
}

# 4. Install Python Dependencies
Write-Host "[*] Installing Python dependencies..." -ForegroundColor Yellow
pip install flask requests psutil aiohttp beautifulsoup4 selenium webdriver-manager mitmproxy fastmcp

Write-Host "========================================" -ForegroundColor Green
Write-Host "[✓] Security tools setup complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
