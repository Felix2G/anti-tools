# Anti-Tools One-Line Installer for Antigravity 2.0 (Windows PowerShell)
# Usage: irm https://raw.githubusercontent.com/Felix2G/anti-tools/main/install.ps1 | iex
$ErrorActionPreference = 'Stop'

$repo = if ($env:ANTI_TOOLS_REPO) { $env:ANTI_TOOLS_REPO } else { 'Felix2G/anti-tools' }
$reqVer = $env:ANTI_TOOLS_VERSION

$nodeCandidates = @()
$sysNode = Get-Command node -CommandType Application -ErrorAction SilentlyContinue
if ($sysNode) { $nodeCandidates += $sysNode.Source }
if ($env:ANTIGRAVITY_USER_DATA_DIR) {
    $nodeCandidates += (Join-Path $env:ANTIGRAVITY_USER_DATA_DIR 'bin\agy-node.cmd')
}
$appData = [Environment]::GetFolderPath('ApplicationData')
if ($appData) {
    $nodeCandidates += (Join-Path $appData 'Antigravity\bin\agy-node.cmd')
    $nodeCandidates += (Join-Path $appData 'Antigravity IDE\bin\agy-node.cmd')
}

$nodeRuntime = $null
$nodeVerText = ''
foreach ($cand in $nodeCandidates) {
    if (-not $cand -or -not (Test-Path -LiteralPath $cand)) { continue }
    $verCheck = & $cand -p "process.versions.node" 2>$null
    if ($LASTEXITCODE -eq 0 -and $verCheck) {
        $verStr = "$verCheck".Trim()
        $major = 0
        if ([int]::TryParse(($verStr.Split('.')[0]), [ref]$major) -and $major -ge 20) {
            $nodeRuntime = $cand
            $nodeVerText = "v$verStr"
            break
        }
    }
}

if (-not $nodeRuntime) {
    Write-Error "Node.js 20+ or Antigravity built-in agy-node is required. Please launch Antigravity once first, or install Node.js 20+ from https://nodejs.org/"
    exit 1
}

if ($nodeRuntime -match 'agy-node') {
    Write-Host "Using Antigravity built-in agy-node ($nodeVerText): $nodeRuntime" -ForegroundColor DarkCyan
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
    $prevNodeEnv = $env:ANTI_TOOLS_NODE_BIN
    $env:ANTI_TOOLS_NODE_BIN = $nodeRuntime
    try {
        & $nodeRuntime $installer @installArgs
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    } finally {
        if ($null -eq $prevNodeEnv) { Remove-Item Env:ANTI_TOOLS_NODE_BIN -ErrorAction SilentlyContinue }
        else { $env:ANTI_TOOLS_NODE_BIN = $prevNodeEnv }
    }
} finally {
    Remove-Item -LiteralPath $tmpDir -Recurse -Force -ErrorAction SilentlyContinue
}
