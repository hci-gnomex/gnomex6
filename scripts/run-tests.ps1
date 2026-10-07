<#
.SYNOPSIS
    Runs the GNomEx automated test suites (backend JUnit, Angular Karma, and optionally the
    Playwright end-to-end tests) and prints a summary.

.EXAMPLE
    .\scripts\run-tests.ps1                 # backend + frontend
    .\scripts\run-tests.ps1 -Backend        # JUnit only
    .\scripts\run-tests.ps1 -Frontend       # Angular only
    .\scripts\run-tests.ps1 -Coverage       # Angular with coverage report
    .\scripts\run-tests.ps1 -E2E            # Playwright only (needs a running GNomEx; see e2e\README.md)
    .\scripts\run-tests.ps1 -Backend -Frontend -E2E   # all three

.NOTES
    Exit code is 0 only if every suite that ran passed, so this can gate a CI job or a deploy.
    Reports:
      build\reports\tests\test\index.html            (JUnit)
      gnomex_ng\coverage\gnomex-ng\index.html        (Angular coverage, with -Coverage)
      e2e\playwright-report\index.html               (Playwright, with -E2E)
#>
param(
    [switch]$Backend,
    [switch]$Frontend,
    [switch]$Coverage,
    [switch]$E2E
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
# E2E needs a running server, so it only runs when asked for.
$runAll = -not ($Backend -or $Frontend -or $E2E)
$results = [ordered]@{}

function Invoke-Suite([string]$name, [string]$dir, [scriptblock]$command) {
    Write-Host "`n=== $name ===" -ForegroundColor Cyan
    $start = Get-Date
    Push-Location $dir
    try {
        & $command
        $ok = ($LASTEXITCODE -eq 0)
    } catch {
        Write-Host $_ -ForegroundColor Red
        $ok = $false
    } finally {
        Pop-Location
    }
    $results[$name] = [pscustomobject]@{
        Passed  = $ok
        Seconds = [int]((Get-Date) - $start).TotalSeconds
    }
}

# Playwright needs Node 18+, but the Angular 9 build needs Node 12, so the default `node`
# may be too old. Use E2E_NODE if set, else the newest of the PATH node and any nvm installs.
function Find-ModernNode {
    if ($env:E2E_NODE) { return $env:E2E_NODE }
    $candidates = @()
    $pathNode = Get-Command node -ErrorAction SilentlyContinue
    if ($pathNode) { $candidates += $pathNode.Source }
    $searchDirs = @($env:NVM_HOME, 'C:/nvm', (Join-Path "$env:APPDATA" 'nvm'), 'C:/Program Files/nodejs')
    foreach ($dir in $searchDirs | Where-Object { $_ -and (Test-Path $_) }) {
        $candidates += Get-ChildItem -Path $dir -Filter node.exe -Recurse -Depth 1 -ErrorAction SilentlyContinue |
            ForEach-Object { $_.FullName }
    }
    $best = $null; $bestMajor = 0
    foreach ($exe in $candidates | Select-Object -Unique) {
        $version = & $exe -v 2>$null
        if ($version -match '^v(\d+)\.' -and [int]$Matches[1] -gt $bestMajor) {
            $best = $exe; $bestMajor = [int]$Matches[1]
        }
    }
    if ($bestMajor -ge 18) { return $best }
    throw "Playwright needs Node 18 or newer. Install one (e.g. 'nvm install 22') or set E2E_NODE to its node.exe."
}

if ($runAll -or $Backend) {
    Invoke-Suite 'Backend (JUnit)' $root { & .\gradlew.bat test --console=plain }
}

if ($runAll -or $Frontend) {
    $ng = Join-Path $root 'gnomex_ng'
    if (-not (Test-Path (Join-Path $ng 'node_modules'))) {
        Write-Host "gnomex_ng\node_modules missing - running npm install first" -ForegroundColor Yellow
        Push-Location $ng; try { npm install } finally { Pop-Location }
    }
    $script = if ($Coverage) { 'test:coverage' } else { 'test:ci' }
    Invoke-Suite 'Frontend (Karma)' $ng { npm run $script }
}

if ($E2E) {
    $e2eDir = Join-Path $root 'e2e'
    $node = Find-ModernNode
    Write-Host "Using $node ($(& $node -v)) for Playwright"
    if (-not (Test-Path (Join-Path $e2eDir 'node_modules'))) {
        $npmCli = Join-Path (Split-Path $node) 'node_modules/npm/bin/npm-cli.js'
        Push-Location $e2eDir; try { & $node $npmCli install } finally { Pop-Location }
    }
    Invoke-Suite 'End-to-end (Playwright)' $e2eDir {
        & $node 'node_modules/@playwright/test/cli.js' test
    }
}

Write-Host "`n=== Summary ===" -ForegroundColor Cyan
$failed = 0
foreach ($entry in $results.GetEnumerator()) {
    if ($entry.Value.Passed) {
        Write-Host ("  PASS  {0} ({1}s)" -f $entry.Key, $entry.Value.Seconds) -ForegroundColor Green
    } else {
        Write-Host ("  FAIL  {0} ({1}s)" -f $entry.Key, $entry.Value.Seconds) -ForegroundColor Red
        $failed++
    }
}
if ($results.Contains('Backend (JUnit)')) {
    Write-Host "  JUnit report: $root\build\reports\tests\test\index.html"
}
if ($Coverage) {
    Write-Host "  Coverage:     $root\gnomex_ng\coverage\gnomex-ng\index.html"
}
if ($E2E) {
    Write-Host "  Playwright:   $root\e2e\playwright-report\index.html"
}

exit $failed
