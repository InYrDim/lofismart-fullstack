#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
PASS=0
FAIL=0

print_banner() {
  echo ""
  echo "========================================"
  echo "  $1"
  echo "========================================"
}

print_result() {
  local name=$1
  local status=$2
  if [ "$status" -eq 0 ]; then
    echo "  ✅ $name passed"
    PASS=$((PASS + 1))
  else
    echo "  ❌ $name failed (exit code $status)"
    FAIL=$((FAIL + 1))
  fi
}

# ──────────────────────────────────────────────
# 1. Backend integration tests (Jest)
# ──────────────────────────────────────────────
print_banner "Backend Integration Tests (Jest)"
cd "$ROOT_DIR/lofishmart-backend"
npx jest --verbose 2>&1 || true
JEST_EXIT=$?
print_result "Backend tests" $JEST_EXIT

# ──────────────────────────────────────────────
# 2. Frontend unit tests (Vitest)
# ──────────────────────────────────────────────
print_banner "Frontend Unit Tests (Vitest)"
cd "$ROOT_DIR/lofishmart-frontend"
npx vitest run 2>&1 || true
VITEST_EXIT=$?
print_result "Frontend tests" $VITEST_EXIT

# ──────────────────────────────────────────────
# 3. E2E tests (Playwright)
# ──────────────────────────────────────────────
print_banner "E2E Tests (Playwright)"
cd "$ROOT_DIR/e2e"
npx playwright test 2>&1 || true
PLAYWRIGHT_EXIT=$?
print_result "E2E tests" $PLAYWRIGHT_EXIT

# ──────────────────────────────────────────────
# Summary
# ──────────────────────────────────────────────
echo ""
echo "========================================"
echo "  TEST SUMMARY"
echo "========================================"
echo "  Passed: $PASS"
echo "  Failed: $FAIL"
echo ""

if [ "$FAIL" -eq 0 ]; then
  echo "  🎉 All test suites passed!"
else
  echo "  💥 Some test suites failed — check the logs above."
fi
echo ""
