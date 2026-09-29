#!/usr/bin/env bash
# Smoke test for the live site. Exits non-zero (and lists every failure) if anything is off.
# Runs hourly from .github/workflows/uptime.yml and at the end of every deploy.
# Usage: scripts/smoke_test.sh [base_url]   (default https://ajtrev.com)
set -uo pipefail

BASE="${1:-https://ajtrev.com}"
HOST="${BASE#https://}"
CERT_MIN_DAYS=30   # ACM renews ~60 days before expiry; under 30 means renewal is stuck
failures=0

pass() { printf '  ok    %s\n' "$1"; }
fail() { printf '  FAIL  %s\n' "$1"; failures=$((failures + 1)); }

# curl with retries so a single network blip doesn't page anyone.
fetch() { curl -sS --retry 3 --retry-all-errors --retry-delay 5 --max-time 20 "$@"; }

check_status() {  # name, url, expected status, [expected Location]
    local name="$1" url="$2" want="$3" want_loc="${4:-}" out code loc
    out=$(fetch -o /dev/null -w '%{http_code} %{redirect_url}' "$url") || { fail "$name: request failed"; return; }
    code=${out%% *}; loc=${out#* }
    if [ "$code" != "$want" ]; then fail "$name: HTTP $code, expected $want"; return; fi
    if [ -n "$want_loc" ] && [ "$loc" != "$want_loc" ]; then fail "$name: Location '$loc', expected '$want_loc'"; return; fi
    pass "$name ($code${want_loc:+ -> $loc})"
}

echo "Smoke test for $BASE"

# 1. Home page renders the real site
body=$(fetch "$BASE/") || body=""
# Match with [[ ]], not "printf | grep -q": grep -q exits on the first match, and if printf is still
# writing, the SIGPIPE makes the pipeline fail under pipefail (an intermittent false alarm).
if [[ $body == *'<title>Alexander J. Trevelyan, PhD</title>'* ]]; then pass "home page title"; else fail "home page title missing"; fi
if [[ $body == *'src="main.js"'* ]]; then pass "home page loads main.js"; else fail "home page doesn't reference main.js"; fi

# 2. Redirects
check_status "http -> https" "http://$HOST/" 301 "$BASE/"
check_status "www -> apex" "https://www.$HOST/cv.pdf?x=1" 301 "$BASE/cv.pdf?x=1"

# 3. Assets and error page
check_status "cv.pdf" "$BASE/cv.pdf" 200
check_status "main.js" "$BASE/main.js" 200
check_status "missing page" "$BASE/smoke-test-missing-page" 404
notfound=$(fetch "$BASE/smoke-test-missing-page") || notfound=""
if [[ $notfound == *'Page not found'* ]]; then pass "404 page content"; else fail "404 page content missing"; fi

# 4. Security headers on the home page
headers=$(fetch -I "$BASE/" | tr -d '\r' | tr 'A-Z' 'a-z') || headers=""
for h in "strict-transport-security: max-age=31536000" "content-security-policy: default-src 'none'" \
         "x-content-type-options: nosniff" "x-frame-options: deny" "referrer-policy:"; do
    if [[ $headers == *"$h"* ]]; then pass "header ${h%%:*}"; else fail "header missing: $h"; fi
done

# 5. TLS certificate not close to expiry
enddate=$(echo | openssl s_client -connect "$HOST:443" -servername "$HOST" 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
if [ -z "$enddate" ]; then
    fail "could not read TLS certificate"
else
    days=$(( ( $(date -d "$enddate" +%s) - $(date +%s) ) / 86400 ))
    if [ "$days" -ge "$CERT_MIN_DAYS" ]; then pass "certificate valid for $days more days"; else fail "certificate expires in $days days (auto-renewal may be stuck)"; fi
fi

if [ "$failures" -gt 0 ]; then echo "$failures check(s) failed"; exit 1; fi
echo "All checks passed"
