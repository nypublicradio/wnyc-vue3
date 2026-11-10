#!/usr/bin/env bash
# Sizes Node's V8 old-space heap from the container's cgroup memory limit so heap
# exhaustion throws a catchable "JavaScript heap out of memory" error instead of a
# silent kernel SIGKILL — and so the same image works unchanged across environments
# with different task memory (e.g. demo 2048MB vs. web-prod 4096MB).
set -euo pipefail

DEFAULT_HEAP_MB=1536
HEAP_FRACTION_PCT=70
# Above this, a limit reading is almost certainly cgroup's "unlimited" sentinel
# (e.g. ~8 exabytes) rather than a real container memory limit.
MAX_PLAUSIBLE_LIMIT_MB=65536

read_cgroup_limit_bytes() {
    if [[ -r /sys/fs/cgroup/memory.max ]]; then
        local v
        v="$(cat /sys/fs/cgroup/memory.max)"
        [[ "$v" == "max" ]] && return 1
        echo "$v"
        return 0
    fi
    if [[ -r /sys/fs/cgroup/memory/memory.limit_in_bytes ]]; then
        cat /sys/fs/cgroup/memory/memory.limit_in_bytes
        return 0
    fi
    return 1
}

heap_mb="$DEFAULT_HEAP_MB"
if limit_bytes="$(read_cgroup_limit_bytes)" && [[ "$limit_bytes" =~ ^[0-9]+$ ]]; then
    limit_mb=$(( limit_bytes / 1024 / 1024 ))
    if (( limit_mb > 0 && limit_mb < MAX_PLAUSIBLE_LIMIT_MB )); then
        heap_mb=$(( limit_mb * HEAP_FRACTION_PCT / 100 ))
    fi
fi

echo "start-nuxt: sizing Node heap to ${heap_mb}MB (--max-old-space-size)"
exec node --max-old-space-size="$heap_mb" .output/server/index.mjs
