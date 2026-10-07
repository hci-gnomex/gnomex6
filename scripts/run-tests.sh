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

set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RUN_BACKEND=0; RUN_FRONTEND=0; RUN_E2E=0; COVERAGE=0

for arg in "$@"; do
  case "$arg" in
    --backend)  RUN_BACKEND=1 ;;
    --frontend) RUN_FRONTEND=1 ;;
    --coverage) COVERAGE=1 ;;
    --e2e)      RUN_E2E=1 ;;
    -h|--help)  sed -n '2,13p' "$0"; exit 0 ;;
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

if [ $RUN_BACKEND -eq 1 ]; then
  run_suite "Backend (JUnit)" "$ROOT" ./gradlew test --console=plain
fi

if [ $RUN_FRONTEND -eq 1 ]; then
  if [ ! -d "$ROOT/gnomex_ng/node_modules" ]; then
    echo "gnomex_ng/node_modules missing - running npm install first"
    (cd "$ROOT/gnomex_ng" && npm install)
  fi
  SCRIPT=test:ci
  [ $COVERAGE -eq 1 ] && SCRIPT=test:coverage
  run_suite "Frontend (Karma)" "$ROOT/gnomex_ng" npm run "$SCRIPT"
fi

if [ $RUN_E2E -eq 1 ]; then
  # Playwright needs Node 18+; E2E_NODE can point at a newer node than the one on PATH.
  NODE_BIN="${E2E_NODE:-node}"
  if [ "$("$NODE_BIN" -p 'process.versions.node.split(".")[0]')" -lt 18 ]; then
    echo "Playwright needs Node 18 or newer; set E2E_NODE to its node binary." >&2
    SUMMARY+=("  FAIL  End-to-end (Playwright) (no Node 18+)"); FAILED=$((FAILED + 1))
  else
    NODE_DIR="$(dirname "$(command -v "$NODE_BIN")")"
    if [ ! -d "$ROOT/e2e/node_modules" ]; then
      (cd "$ROOT/e2e" && PATH="$NODE_DIR:$PATH" npm install)
    fi
    run_suite "End-to-end (Playwright)" "$ROOT/e2e" "$NODE_BIN" node_modules/@playwright/test/cli.js test
  fi
fi

echo; echo "=== Summary ==="
printf '%s\n' "${SUMMARY[@]}"
[ $RUN_BACKEND -eq 1 ] && echo "  JUnit report: $ROOT/build/reports/tests/test/index.html"
[ $COVERAGE -eq 1 ] && echo "  Coverage:     $ROOT/gnomex_ng/coverage/gnomex-ng/index.html"
[ $RUN_E2E -eq 1 ] && echo "  Playwright:   $ROOT/e2e/playwright-report/index.html"
exit $FAILED
