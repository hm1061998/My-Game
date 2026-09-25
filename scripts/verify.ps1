param(
    [string]$DotnetCommand = "dotnet"
)

$ErrorActionPreference = "Stop"
$repositoryRoot = Split-Path -Parent $PSScriptRoot

& (Join-Path $PSScriptRoot "check-agent-docs.ps1")

Push-Location (Join-Path $repositoryRoot "apps/web")
try {
    npm ci
    if ($LASTEXITCODE -ne 0) { throw "npm ci failed with exit code $LASTEXITCODE" }
    npm run lint
    if ($LASTEXITCODE -ne 0) { throw "npm run lint failed with exit code $LASTEXITCODE" }
    npm run typecheck
    if ($LASTEXITCODE -ne 0) { throw "npm run typecheck failed with exit code $LASTEXITCODE" }
    npm run test:run
    if ($LASTEXITCODE -ne 0) { throw "npm run test:run failed with exit code $LASTEXITCODE" }
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "npm run build failed with exit code $LASTEXITCODE" }
}
finally {
    Pop-Location
}

& $DotnetCommand restore (Join-Path $repositoryRoot "OfficeCaseFiles.slnx") --locked-mode --configfile (Join-Path $repositoryRoot "NuGet.Config")
if ($LASTEXITCODE -ne 0) { throw "dotnet restore failed with exit code $LASTEXITCODE" }
& $DotnetCommand build (Join-Path $repositoryRoot "OfficeCaseFiles.slnx") --no-restore
if ($LASTEXITCODE -ne 0) { throw "dotnet build failed with exit code $LASTEXITCODE" }
& $DotnetCommand test (Join-Path $repositoryRoot "OfficeCaseFiles.slnx") --no-build
if ($LASTEXITCODE -ne 0) { throw "dotnet test failed with exit code $LASTEXITCODE" }
