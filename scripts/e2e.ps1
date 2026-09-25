param(
    [string]$DotnetCommand = "dotnet",
    [int]$ApiPort = 5063,
    [int]$WebPort = 5174
)

$ErrorActionPreference = "Stop"
$repositoryRoot = Split-Path -Parent $PSScriptRoot
$e2eRoot = Join-Path $repositoryRoot ".tools/e2e"
$runRoot = Join-Path $e2eRoot ("run-" + [Guid]::NewGuid().ToString("N"))
$databasePath = Join-Path $runRoot "office-case-files-e2e.db"
$apiUrl = "http://127.0.0.1:$ApiPort"
$webUrl = "http://127.0.0.1:$WebPort"
$apiProcess = $null
$viteProcess = $null
$passed = $false
$runTimer = [Diagnostics.Stopwatch]::StartNew()

function Resolve-Executable([string]$command) {
    if (Test-Path -LiteralPath $command) { return (Resolve-Path -LiteralPath $command).Path }
    $resolved = Get-Command $command -ErrorAction Stop
    return $resolved.Source
}

function Assert-PortAvailable([int]$port) {
    $listener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, $port)
    try { $listener.Start() }
    catch { throw "E2E port $port is already occupied; stop the owning service and retry." }
    finally { $listener.Stop() }
}

function Wait-ForUrl([string]$url, [string]$name) {
    $timer = [Diagnostics.Stopwatch]::StartNew()
    $deadline = [DateTime]::UtcNow.AddSeconds(45)
    do {
        try {
            $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2
            if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
                return [Math]::Round($timer.Elapsed.TotalMilliseconds)
            }
        } catch { Start-Sleep -Milliseconds 250 }
    } while ([DateTime]::UtcNow -lt $deadline)
    throw "$name did not become ready at $url within 45 seconds."
}

function Stop-OwnedProcess($process) {
    if ($null -ne $process -and -not $process.HasExited) {
        Stop-Process -Id $process.Id -Force
        $process.WaitForExit(5000) | Out-Null
    }
}

$savedEnvironment = @{}
$environmentNames = @(
    "ASPNETCORE_ENVIRONMENT", "ConnectionStrings__Game", "Security__AllowedOrigin",
    "Logging__LogLevel__Microsoft.EntityFrameworkCore", "VITE_API_PROXY_TARGET",
    "VITE_E2E_OBSERVABILITY", "E2E_BASE_URL"
)
foreach ($name in $environmentNames) { $savedEnvironment[$name] = [Environment]::GetEnvironmentVariable($name) }

try {
    Assert-PortAvailable $ApiPort
    Assert-PortAvailable $WebPort
    New-Item -ItemType Directory -Path $runRoot -Force | Out-Null

    $resolvedE2eRoot = [IO.Path]::GetFullPath($e2eRoot).TrimEnd([IO.Path]::DirectorySeparatorChar)
    $resolvedRunRoot = [IO.Path]::GetFullPath($runRoot)
    if (-not $resolvedRunRoot.StartsWith($resolvedE2eRoot + [IO.Path]::DirectorySeparatorChar,
        [StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing to use E2E path outside $resolvedE2eRoot."
    }

    $dotnet = Resolve-Executable $DotnetCommand
    $node = Resolve-Executable "node"
    $apiProject = Join-Path $repositoryRoot "services/api"
    $apiDll = Join-Path $apiProject "bin/Debug/net10.0/OfficeCaseFiles.Api.dll"
    $viteScript = Join-Path $repositoryRoot "apps/web/node_modules/vite/bin/vite.js"
    $playwrightCli = Join-Path $repositoryRoot "apps/web/node_modules/@playwright/test/cli.js"

    $env:ASPNETCORE_ENVIRONMENT = "Development"
    $env:ConnectionStrings__Game = "Data Source=$databasePath"
    $env:Security__AllowedOrigin = $webUrl
    ${env:Logging__LogLevel__Microsoft.EntityFrameworkCore} = "Warning"
    $env:VITE_API_PROXY_TARGET = $apiUrl
    $env:VITE_E2E_OBSERVABILITY = "1"
    $env:E2E_BASE_URL = $webUrl

    $migrationTimer = [Diagnostics.Stopwatch]::StartNew()
    & $dotnet run --project $apiProject --no-launch-profile -- --migrate
    if ($LASTEXITCODE -ne 0) { throw "E2E database migration failed with exit code $LASTEXITCODE." }
    $migrationMs = [Math]::Round($migrationTimer.Elapsed.TotalMilliseconds)
    if (-not (Test-Path -LiteralPath $apiDll)) { throw "Migrated API build not found at $apiDll." }

    $apiProcess = Start-Process -FilePath $dotnet -ArgumentList @("`"$apiDll`"", "--urls", $apiUrl) `
        -WorkingDirectory $apiProject -WindowStyle Hidden -PassThru `
        -RedirectStandardOutput (Join-Path $runRoot "api.log") `
        -RedirectStandardError (Join-Path $runRoot "api.err.log")
    $viteProcess = Start-Process -FilePath $node -ArgumentList @("`"$viteScript`"", "--host", "127.0.0.1",
        "--port", "$WebPort", "--strictPort") -WorkingDirectory (Join-Path $repositoryRoot "apps/web") `
        -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $runRoot "vite.log") `
        -RedirectStandardError (Join-Path $runRoot "vite.err.log")

    $apiReadyMs = Wait-ForUrl "$apiUrl/api/v1/health" "API"
    $viteReadyMs = Wait-ForUrl $webUrl "Vite"
    $proxyReadyMs = Wait-ForUrl "$webUrl/api/v1/health" "Vite API proxy"
    Write-Host ("E2E readiness: migration={0}ms api={1}ms vite={2}ms proxy={3}ms total={4}ms" -f `
        $migrationMs, $apiReadyMs, $viteReadyMs, $proxyReadyMs, [Math]::Round($runTimer.Elapsed.TotalMilliseconds))

    Push-Location (Join-Path $repositoryRoot "apps/web")
    try {
        & $node $playwrightCli test --config playwright.config.ts
        $testExitCode = $LASTEXITCODE
    } finally { Pop-Location }
    if ($testExitCode -ne 0) { throw "Playwright E2E failed with exit code $testExitCode. Logs remain in $runRoot." }
    $passed = $true
}
finally {
    Stop-OwnedProcess $viteProcess
    Stop-OwnedProcess $apiProcess
    foreach ($name in $environmentNames) {
        [Environment]::SetEnvironmentVariable($name, $savedEnvironment[$name])
    }
    foreach ($path in @($databasePath, "$databasePath-shm", "$databasePath-wal")) {
        if (Test-Path -LiteralPath $path) { Remove-Item -LiteralPath $path -Force }
    }
    if ($passed -and (Test-Path -LiteralPath $runRoot)) {
        $resolvedE2eRoot = [IO.Path]::GetFullPath($e2eRoot).TrimEnd([IO.Path]::DirectorySeparatorChar)
        $resolvedRunRoot = [IO.Path]::GetFullPath($runRoot)
        if ($resolvedRunRoot.StartsWith($resolvedE2eRoot + [IO.Path]::DirectorySeparatorChar,
            [StringComparison]::OrdinalIgnoreCase)) {
            Remove-Item -LiteralPath $runRoot -Recurse -Force
        }
    }
}
