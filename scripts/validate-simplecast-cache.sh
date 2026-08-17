#!/bin/bash
#
# Validates that the Simplecast TtlCache (server/utils/simplecastCache.ts) reduces
# outbound Simplecast API calls, by comparing request timing behavior between two
# deployed environments: one WITH the cache (candidate) and one WITHOUT it (baseline).
#
# It runs, against each environment:
#   1. N sequential requests for the same episode - a working cache should show the
#      first request slower (miss) and the rest much faster (hits); no cache should
#      show every request taking roughly the same time (each one hits Simplecast).
#   2. N concurrent requests for the same episode - a working cache coalesces
#      concurrent callers onto a single in-flight fetch, so total wall-clock time
#      stays close to a single request's latency; no cache/coalescing lets total
#      wall-clock time scale up with the number of concurrent requests.
#
# Usage:
#   ./scripts/validate-simplecast-cache.sh --candidate <url> --baseline <url> [options]
#
# Example:
#   ./scripts/validate-simplecast-cache.sh \
#     --candidate https://pr-695-nypublicradio-wnyc-vue3.fly.dev \
#     --baseline https://wnyc-vue3-main.fly.dev \
#     --episode-id 33e5f931-2e47-4823-abf7-513b48e41e7a
#
# Options:
#   --candidate URL   Base URL of the deployment WITH the TtlCache fix (required)
#   --baseline URL    Base URL of the deployment WITHOUT the fix, for comparison (required)
#   --episode-id ID   Simplecast episode UUID to request (default: sample below)
#   --path TEMPLATE   API path template with %s for the episode id
#                     (default: /api/v2/show/episode/simplecast/%s)
#   --requests N      Number of sequential requests per environment (default: 5)
#   --concurrency N   Number of concurrent requests per environment (default: 5)
#   --no-cache-bust   Don't append a unique query param to each request (see note below)
#   -h, --help        Show this help text
#
# Note on nginx's microcache (nginx/microcache.conf):
#   Both wnyc.org and demo.wnyc.org sit behind a shared nginx layer that caches
#   200 responses for 1s with proxy_cache_lock (its own request coalescing),
#   keyed on the full request URI including the query string. Since this
#   script's requests fire well within that 1s window, they would mostly hit
#   nginx's cache/lock rather than the app - on BOTH environments - making the
#   comparison meaningless. By default each request gets a unique cache-busting
#   query param so nginx always proxies through to the app; the app's TtlCache
#   key is the episode/show id only (it ignores the query string), so a
#   speedup after busting nginx's cache reflects the app-level TtlCache only.

set -uo pipefail

EPISODE_ID="33e5f931-2e47-4823-abf7-513b48e41e7a"
PATH_TEMPLATE="/api/v2/show/episode/simplecast/%s"
NUM_REQUESTS=5
NUM_CONCURRENT=5
CANDIDATE_URL=""
BASELINE_URL=""
CACHE_BUST=1

usage() {
    sed -n '2,41p' "$0" | sed 's/^# \{0,1\}//'
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        --candidate) CANDIDATE_URL="$2"; shift 2 ;;
        --baseline) BASELINE_URL="$2"; shift 2 ;;
        --episode-id) EPISODE_ID="$2"; shift 2 ;;
        --path) PATH_TEMPLATE="$2"; shift 2 ;;
        --requests) NUM_REQUESTS="$2"; shift 2 ;;
        --concurrency) NUM_CONCURRENT="$2"; shift 2 ;;
        --no-cache-bust) CACHE_BUST=0; shift ;;
        -h|--help) usage; exit 0 ;;
        *) echo "Unknown option: $1" >&2; usage; exit 1 ;;
    esac
done

if [[ -z "$CANDIDATE_URL" || -z "$BASELINE_URL" ]]; then
    echo "Error: --candidate and --baseline are required." >&2
    usage
    exit 1
fi

CANDIDATE_URL="${CANDIDATE_URL%/}"
BASELINE_URL="${BASELINE_URL%/}"
# shellcheck disable=SC2059
REQUEST_PATH=$(printf "$PATH_TEMPLATE" "$EPISODE_ID")

# Millisecond timestamp; python3 gives sub-second precision, `date +%s` is a fallback.
now_ms() {
    if command -v python3 >/dev/null 2>&1; then
        python3 -c 'import time; print(int(time.time() * 1000))'
    else
        echo $(( $(date +%s) * 1000 ))
    fi
}

# Appends a unique query param so nginx's 1s microcache can't serve a stale hit
request_url() {
    local base_url="$1"
    if [[ "$CACHE_BUST" -eq 1 ]]; then
        echo "${base_url}${REQUEST_PATH}?_cb=$(now_ms)-$RANDOM"
    else
        echo "${base_url}${REQUEST_PATH}"
    fi
}

run_sequential() {
    local base_url="$1" label="$2" i
    echo ""
    echo "--- $label: $NUM_REQUESTS sequential requests ---"
    for ((i = 1; i <= NUM_REQUESTS; i++)); do
        curl -s -o /dev/null -w "  request $i: %{http_code}  %{time_total}s\n" \
            "$(request_url "$base_url")"
    done
}

run_concurrent() {
    local base_url="$1" label="$2" i start_ms end_ms
    echo ""
    echo "--- $label: $NUM_CONCURRENT concurrent requests ---"
    local pids=()
    start_ms=$(now_ms)
    for ((i = 1; i <= NUM_CONCURRENT; i++)); do
        curl -s -o /dev/null -w "  request $i: %{http_code}  %{time_total}s\n" \
            "$(request_url "$base_url")" &
        pids+=("$!")
    done
    for pid in "${pids[@]}"; do
        wait "$pid"
    done
    end_ms=$(now_ms)
    echo "  total wall-clock time: $((end_ms - start_ms))ms"
}

echo "Simplecast TtlCache validation"
echo "Episode ID:   $EPISODE_ID"
echo "Request path: $REQUEST_PATH"
if [[ "$CACHE_BUST" -eq 1 ]]; then
    echo "Cache-busting nginx's 1s microcache with a unique query param per request (use --no-cache-bust to disable)"
fi

echo ""
echo "=== BASELINE (no cache expected): $BASELINE_URL ==="
run_sequential "$BASELINE_URL" "Baseline sequential"
run_concurrent "$BASELINE_URL" "Baseline concurrent"

echo ""
echo "=== CANDIDATE (TtlCache expected): $CANDIDATE_URL ==="
run_sequential "$CANDIDATE_URL" "Candidate sequential"
run_concurrent "$CANDIDATE_URL" "Candidate concurrent"

cat <<'EOF'

--- How to read these results ---
Baseline (no cache):   sequential requests should all take roughly the same time
                       (each is a fresh round-trip to Simplecast); the concurrent
                       burst's total wall-clock time should scale up with the
                       number of concurrent requests.
Candidate (TtlCache):  the first sequential request may be slow (cache miss), but
                       the rest should be noticeably faster (cache hits); the
                       concurrent burst's total wall-clock time should stay close
                       to a single request's latency, since concurrent callers
                       coalesce onto one in-flight fetch.
EOF
