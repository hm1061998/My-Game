$ErrorActionPreference = "Stop"
$repositoryRoot = Split-Path -Parent $PSScriptRoot

$requiredPaths = @(
    "AGENTS.md",
    "docs/agent/protocol.md",
    "docs/agent/improvement.md",
    "docs/agent/lessons.md",
    "docs/tasks/TEMPLATE.md",
    ".agents/skills/project-handoff/SKILL.md",
    ".agents/skills/product-lifecycle/SKILL.md"
)

foreach ($relativePath in $requiredPaths) {
    $fullPath = Join-Path $repositoryRoot $relativePath
    if (-not (Test-Path -LiteralPath $fullPath -PathType Leaf)) {
        throw "Missing agent foundation file: $relativePath"
    }
}

$taskFiles = Get-ChildItem (Join-Path $repositoryRoot "docs/tasks") -File -Filter "T*.md"
foreach ($taskFile in $taskFiles) {
    $hasImprovementReview = Select-String -LiteralPath $taskFile.FullName -Pattern '^## Improvement review$' -Quiet
    if (-not $hasImprovementReview) {
        throw "Task file is missing an Improvement review section: $($taskFile.Name)"
    }
}

Write-Output "Agent foundation checks passed for $($taskFiles.Count) task files."
