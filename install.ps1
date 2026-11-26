# Anti-Tools One-Line Installer for Antigravity 2.0 (Windows PowerShell)
# Usage: irm https://raw.githubusercontent.com/Felix2G/anti-tools/main/install.ps1 | iex
$ErrorActionPreference = 'Stop'

$repo = if ($env:ANTI_TOOLS_REPO) { $env:ANTI_TOOLS_REPO } else { 'Felix2G/anti-tools' }
$reqVer = $env:ANTI_TOOLS_VERSION

$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCmd) {
    Write-Error "Node.js 20+ is required. Please install from https://nodejs.org/"
    exit 1
}

$nodeMajor = [int]((node -p "parseInt(process.versions.node.split('.')[0], 10)").Trim())
if ($nodeMajor -lt 20) {
    Write-Error "Node.js 20+ is required (current: $(node -v))."
    exit 1
}

$tmpDir = Join-Path $env:TEMP ("anti-tools-agy2-" + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $tmpDir -Force | Out-Null

try {
    $zipUrl = ''
    if ($reqVer) {
        $cleanVer = $reqVer.TrimStart('v')
        $zipUrl = "https://github.com/$repo/releases/download/v$cleanVer/anti-tools-agy2-$cleanVer.zip"
    } else {
        Write-Host "Checking latest Anti-Tools AGY 2.0 release from $repo..." -ForegroundColor Cyan
        $release = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/releases/latest" -Headers @{ 'User-Agent' = 'Anti-Tools-Installer' }
        $asset = $release.assets | Where-Object { $_.name -match '^anti-tools-agy2-.*\.zip$' } | Select-Object -First 1
        if ($asset) { $zipUrl = $asset.browser_download_url }
    }

    if (-not $zipUrl) {
        throw "Could not find anti-tools-agy2-*.zip in latest GitHub Release of $repo."
    }

    $zipPath = Join-Path $tmpDir 'anti-tools-agy2.zip'
    $extractDir = Join-Path $tmpDir 'pkg'
    Write-Host "Downloading $zipUrl..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath -UseBasicParsing

    Write-Host "Extracting package..." -ForegroundColor Cyan
    Expand-Archive -Path $zipPath -DestinationPath $extractDir -Force

    $installer = Join-Path $extractDir 'scripts\install-agy2.js'
    if (-not (Test-Path -LiteralPath $installer)) {
        throw "Installer script not found inside archive: $installer"
    }

    Write-Host "Running Anti-Tools AGY 2.0 installer..." -ForegroundColor Green
    $installArgs = if ($args.Count -gt 0) { $args } else { @('-y') }
    & node $installer @installArgs
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally {
    Remove-Item -LiteralPath $tmpDir -Recurse -Force -ErrorAction SilentlyContinue
}

