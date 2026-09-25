param(
    [string]$DotnetCommand = "dotnet"
)

$ErrorActionPreference = "Stop"
$repositoryRoot = Split-Path -Parent $PSScriptRoot

& (Join-Path $PSScriptRoot "check-agent-docs.ps1")

Push-Location (Join-Path $repositoryRoot "apps/web")
try {
    npm ci
    npm run lint
    npm run typecheck
    npm run test:run
    npm run build
}
finally {
    Pop-Location
}

& $DotnetCommand restore (Join-Path $repositoryRoot "OfficeCaseFiles.slnx") --locked-mode --configfile (Join-Path $repositoryRoot "NuGet.Config")
& $DotnetCommand build (Join-Path $repositoryRoot "OfficeCaseFiles.slnx") --no-restore
& $DotnetCommand test (Join-Path $repositoryRoot "OfficeCaseFiles.slnx") --no-build
