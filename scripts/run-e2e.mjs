// Runs scripts/e2e.ps1 with PowerShell 7 (pwsh) when available, otherwise Windows PowerShell 5.1.
// Runs from the repository root. Arguments are forwarded, e.g. `npm run e2e -- -DotnetCommand ./.tools/dotnet/dotnet.exe`.
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptsDir = dirname(fileURLToPath(import.meta.url))
const script = join(scriptsDir, 'e2e.ps1')
const hasPwsh = spawnSync('pwsh', ['-NoProfile', '-Command', 'exit 0'], { stdio: 'ignore' }).status === 0
const shell = hasPwsh ? 'pwsh' : 'powershell'
const result = spawnSync(shell, ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', script, ...process.argv.slice(2)],
  { stdio: 'inherit', cwd: join(scriptsDir, '..') }) // repo root, so documented relative paths resolve
if (result.error) {
  console.error(`Could not start ${shell}: ${result.error.message}`)
  process.exit(1)
}
process.exit(result.status ?? 1)
