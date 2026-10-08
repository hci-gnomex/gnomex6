#!/usr/bin/env bash
# Runs the GNomEx automated test suites (backend JUnit, Angular Karma, and optionally the
# Playwright end-to-end tests) and prints a summary.
#
#   scripts/run-tests.sh              # backend + frontend
#   scripts/run-tests.sh --backend    # JUnit only
#   scripts/run-tests.sh --frontend   # Angular only
#   scripts/run-tests.sh --coverage   # Angular with coverage report
#   scripts/run-tests.sh --e2e        # Playwright only (needs a running GNomEx; see e2e/README.md)
#
# Exit code is the number of failed suites (0 = all green), so it can gate CI or a deploy.
# Needs a Chromium browser for Karma; set CHROME_BIN if it isn't auto-detected.
# Node: the Angular tests use Node 12 (or another 10-16) and Playwright the newest Node 18+,
# found on PATH or under nvm whatever the current default is. Override with NG_NODE / E2E_NODE.

set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RUN_BACKEND=0; RUN_FRONTEND=0; RUN_E2E=0; COVERAGE=0

for arg in "$@"; do
  case "$arg" in
    --backend)  RUN_BACKEND=1 ;;
    --frontend) RUN_FRONTEND=1 ;;
    --coverage) COVERAGE=1 ;;
    --e2e)      RUN_E2E=1 ;;
    -h|--help)  sed -n '2,15p' "$0"; exit 0 ;;
    *) echo "unknown option: $arg" >&2; exit 2 ;;
  esac
done
# E2E needs a running server, so it only runs when asked for.
if [ $RUN_BACKEND -eq 0 ] && [ $RUN_FRONTEND -eq 0 ] && [ $RUN_E2E -eq 0 ]; then
  RUN_BACKEND=1; RUN_FRONTEND=1
fi

SUMMARY=()
FAILED=0

run_suite() {
  local name="$1" dir="$2"; shift 2
  echo; echo "=== $name ==="
  local start=$SECONDS
  if (cd "$dir" && "$@"); then
    SUMMARY+=("  PASS  $name ($((SECONDS - start))s)")
  else
    SUMMARY+=("  FAIL  $name ($((SECONDS - start))s)")
    FAILED=$((FAILED + 1))
  fi
}

# The Angular 9 build (webpack 4) fails on Node 17+ ("digital envelope routines::unsupported"),
# while Playwright needs Node 18+, so each suite picks its own Node regardless of the nvm default.
# find_node MIN MAX PREFER: prints the PATH node or an nvm-installed node whose major version is in
# [MIN, MAX]; PREFER wins if present, otherwise the highest version in range.
find_node() {
  local min=$1 max=$2 prefer=$3 best="" best_score=-1 dir n major score
  local candidates=()
  command -v node >/dev/null 2>&1 && candidates+=("$(command -v node)")
  for dir in "${NVM_HOME:-}" "${NVM_DIR:-$HOME/.nvm}/versions/node" /c/nvm "${APPDATA:-}/nvm"; do
    [ -n "$dir" ] || continue
    command -v cygpath >/dev/null 2>&1 && dir="$(cygpath -u "$dir")"
    [ -d "$dir" ] || continue
    for n in "$dir"/v*/node.exe "$dir"/v*/bin/node; do
      [ -x "$n" ] && candidates+=("$n")
    done
  done
  for n in "${candidates[@]}"; do
    major=$("$n" -p 'process.versions.node.split(".")[0]' 2>/dev/null) || continue
    [ "$major" -ge "$min" ] && [ "$major" -le "$max" ] || continue
    score=$major; [ "$major" -eq "$prefer" ] && score=1000
    if [ "$score" -gt "$best_score" ]; then best="$n"; best_score=$score; fi
  done
  [ -n "$best" ] && echo "$best"
}

if [ $RUN_BACKEND -eq 1 ]; then
  run_suite "Backend (JUnit)" "$ROOT" ./gradlew test --console=plain
fi

if [ $RUN_FRONTEND -eq 1 ]; then
  NG_NODE_BIN="${NG_NODE:-$(find_node 10 16 12)}"
  if [ -z "$NG_NODE_BIN" ]; then
    echo "The Angular 9 build needs Node 10-16 (12 preferred); install one (nvm install 12) or set NG_NODE." >&2
    SUMMARY+=("  FAIL  Frontend (Karma) (no Node 10-16)"); FAILED=$((FAILED + 1))
  else
    echo "Using $NG_NODE_BIN ($("$NG_NODE_BIN" -v)) for the Angular tests"
    # npm and the ng shim both run whichever `node` is first on PATH.
    NG_PATH="$(dirname "$NG_NODE_BIN"):$PATH"
    if [ ! -d "$ROOT/gnomex_ng/node_modules" ]; then
      echo "gnomex_ng/node_modules missing - running npm install first"
      (cd "$ROOT/gnomex_ng" && PATH="$NG_PATH" npm install)
    fi
    SCRIPT=test:ci
    [ $COVERAGE -eq 1 ] && SCRIPT=test:coverage
    run_suite "Frontend (Karma)" "$ROOT/gnomex_ng" env PATH="$NG_PATH" npm run "$SCRIPT"
  fi
fi

if [ $RUN_E2E -eq 1 ]; then
  E2E_NODE_BIN="${E2E_NODE:-$(find_node 18 999 0)}"
  if [ -z "$E2E_NODE_BIN" ]; then
    echo "Playwright needs Node 18 or newer; install one (nvm install 22) or set E2E_NODE." >&2
    SUMMARY+=("  FAIL  End-to-end (Playwright) (no Node 18+)"); FAILED=$((FAILED + 1))
  else
    echo "Using $E2E_NODE_BIN ($("$E2E_NODE_BIN" -v)) for Playwright"
    if [ ! -d "$ROOT/e2e/node_modules" ]; then
      (cd "$ROOT/e2e" && PATH="$(dirname "$E2E_NODE_BIN"):$PATH" npm install)
    fi
    run_suite "End-to-end (Playwright)" "$ROOT/e2e" "$E2E_NODE_BIN" node_modules/@playwright/test/cli.js test
  fi
fi

echo; echo "=== Summary ==="
printf '%s\n' "${SUMMARY[@]}"
[ $RUN_BACKEND -eq 1 ] && echo "  JUnit report: $ROOT/build/reports/tests/test/index.html"
[ $COVERAGE -eq 1 ] && echo "  Coverage:     $ROOT/gnomex_ng/coverage/gnomex-ng/index.html"
[ $RUN_E2E -eq 1 ] && echo "  Playwright:   $ROOT/e2e/playwright-report/index.html"
exit $FAILED
