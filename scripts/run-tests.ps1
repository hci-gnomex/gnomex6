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
    Node: the Angular tests use Node 12 (or another 10-16) and Playwright the newest Node 18+,
    found on PATH or under nvm whatever the current default is. Override with NG_NODE / E2E_NODE.
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

# The Angular 9 build (webpack 4) fails on Node 17+ ("digital envelope routines::unsupported"),
# while Playwright needs Node 18+, so each suite picks its own Node regardless of the nvm default.
# Searches the PATH node and nvm installs for a major version in [Min, Max]; -Prefer wins if
# present, otherwise the highest version in range. An explicit override env var always wins.
function Find-Node([int]$Min, [int]$Max, [int]$Prefer, [string]$OverrideVar, [string]$Purpose) {
    $override = [Environment]::GetEnvironmentVariable($OverrideVar)
    if ($override) { return $override }
    $candidates = @()
    $pathNode = Get-Command node -ErrorAction SilentlyContinue
    if ($pathNode) { $candidates += $pathNode.Source }
    $searchDirs = @($env:NVM_HOME, 'C:/nvm', (Join-Path "$env:APPDATA" 'nvm'), 'C:/Program Files/nodejs')
    foreach ($dir in $searchDirs | Where-Object { $_ -and (Test-Path $_) }) {
        $candidates += Get-ChildItem -Path $dir -Filter node.exe -Recurse -Depth 1 -ErrorAction SilentlyContinue |
            ForEach-Object { $_.FullName }
    }
    $best = $null; $bestScore = -1
    foreach ($exe in $candidates | Select-Object -Unique) {
        $version = & $exe -v 2>$null
        if ($version -notmatch '^v(\d+)\.') { continue }
        $major = [int]$Matches[1]
        if ($major -lt $Min -or $major -gt $Max) { continue }
        $score = if ($major -eq $Prefer) { 1000 } else { $major }
        if ($score -gt $bestScore) { $best = $exe; $bestScore = $score }
    }
    if ($best) { return $best }
    throw "$Purpose needs Node $Min-$Max. Install one (e.g. 'nvm install $(if ($Prefer) { $Prefer } else { $Min })') or set $OverrideVar to its node.exe."
}

if ($runAll -or $Backend) {
    Invoke-Suite 'Backend (JUnit)' $root { & .\gradlew.bat test --console=plain }
}

if ($runAll -or $Frontend) {
    $ng = Join-Path $root 'gnomex_ng'
    $savedPath = $env:PATH
    try {
        $ngNode = Find-Node -Min 10 -Max 16 -Prefer 12 -OverrideVar 'NG_NODE' -Purpose 'The Angular 9 build'
        Write-Host "Using $ngNode ($(& $ngNode -v)) for the Angular tests"
        # npm and the ng shim both run whichever `node` is first on PATH.
        $env:PATH = "$(Split-Path $ngNode);$savedPath"
        if (-not (Test-Path (Join-Path $ng 'node_modules'))) {
            Write-Host "gnomex_ng\node_modules missing - running npm install first" -ForegroundColor Yellow
            Push-Location $ng; try { npm install } finally { Pop-Location }
        }
        $script = if ($Coverage) { 'test:coverage' } else { 'test:ci' }
        Invoke-Suite 'Frontend (Karma)' $ng { npm run $script }
    } catch {
        Write-Host $_ -ForegroundColor Red
        $results['Frontend (Karma)'] = [pscustomobject]@{ Passed = $false; Seconds = 0 }
    } finally {
        $env:PATH = $savedPath
    }
}

if ($E2E) {
    $e2eDir = Join-Path $root 'e2e'
    $node = Find-Node -Min 18 -Max 999 -Prefer 0 -OverrideVar 'E2E_NODE' -Purpose 'Playwright'
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
