$ErrorActionPreference = 'Stop'
$node = Get-Command node -ErrorAction SilentlyContinue
if ($node) { $nodePath = $node.Source } else { $nodePath = 'C:\Program Files\nodejs\node.exe' }
if (!(Test-Path $nodePath)) { throw 'Node.js not found. Install Node.js LTS.' }
& $nodePath --use-system-ca (Join-Path $PSScriptRoot 'ai-agent.mjs') @args
exit $LASTEXITCODE
