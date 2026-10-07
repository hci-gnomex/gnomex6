<#
.SYNOPSIS
    Runs the GNomEx automated test suites (backend JUnit + Angular Karma) and prints a summary.

.EXAMPLE
    .\scripts\run-tests.ps1                 # everything
    .\scripts\run-tests.ps1 -Backend        # JUnit only
    .\scripts\run-tests.ps1 -Frontend       # Angular only
    .\scripts\run-tests.ps1 -Coverage       # Angular with coverage report

.NOTES
    Exit code is 0 only if every suite that ran passed, so this can gate a CI job or a deploy.
    Reports:
      build\reports\tests\test\index.html            (JUnit)
      gnomex_ng\coverage\gnomex-ng\index.html        (Angular coverage, with -Coverage)
#>
param(
    [switch]$Backend,
    [switch]$Frontend,
    [switch]$Coverage
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$runAll = -not ($Backend -or $Frontend)
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

exit $failed
