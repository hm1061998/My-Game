param(
    [string]$DotnetCommand = "dotnet"
)

$ErrorActionPreference = "Stop"
$repositoryRoot = Split-Path -Parent $PSScriptRoot

Push-Location (Join-Path $repositoryRoot "apps/web")
try {
    pnpm install --frozen-lockfile
    pnpm lint
    pnpm typecheck
    pnpm test:run
    pnpm build
}
finally {
    Pop-Location
}

& $DotnetCommand restore (Join-Path $repositoryRoot "OfficeCaseFiles.slnx") --locked-mode --configfile (Join-Path $repositoryRoot "NuGet.Config")
& $DotnetCommand build (Join-Path $repositoryRoot "OfficeCaseFiles.slnx") --no-restore
& $DotnetCommand test (Join-Path $repositoryRoot "OfficeCaseFiles.slnx") --no-build
