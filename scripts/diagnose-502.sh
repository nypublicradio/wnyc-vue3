#!/usr/bin/env bash
# Read-only diagnostics for the intermittent 502 investigation.
# Only calls describe-*/list-*/get-metric-statistics/filter-log-events — nothing mutating.
set -euo pipefail

CLUSTER="${CLUSTER:-}"
SERVICE="${SERVICE:-}"
REGION="${AWS_REGION:-us-east-1}"
DAYS="${DAYS:-10}"

command -v jq >/dev/null || { echo "jq is required"; exit 1; }

START="$(date -u -v-"${DAYS}"d +%Y-%m-%dT%H:%M:%SZ 2>/dev/null \
  || date -u -d "${DAYS} days ago" +%Y-%m-%dT%H:%M:%SZ)"
END="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

hdr() { printf '\n\033[1m=== %s ===\033[0m\n' "$1"; }

# ---------------------------------------------------------------- discovery
if [[ -z "$CLUSTER" ]]; then
  hdr "Clusters (set CLUSTER=... to pin one)"
  aws ecs list-clusters --region "$REGION" \
    --query 'clusterArns[]' --output text | tr '\t' '\n'
  echo "Re-run with: CLUSTER=<name> SERVICE=<name> $0"
  exit 0
fi

if [[ -z "$SERVICE" ]]; then
  hdr "Services in $CLUSTER"
  aws ecs list-services --cluster "$CLUSTER" --region "$REGION" \
    --query 'serviceArns[]' --output text | tr '\t' '\n'
  echo "Re-run with: CLUSTER=$CLUSTER SERVICE=<name> $0"
  exit 0
fi

echo "Cluster=$CLUSTER  Service=$SERVICE  Region=$REGION"
echo "Window: $START -> $END"

# ------------------------------------------------- 1. task definition limits
hdr "1. Task definition memory limits"
TD_ARN="$(aws ecs describe-services --cluster "$CLUSTER" --services "$SERVICE" \
  --region "$REGION" --query 'services[0].taskDefinition' --output text)"
echo "Task definition: $TD_ARN"

aws ecs describe-task-definition --task-definition "$TD_ARN" --region "$REGION" \
  --query 'taskDefinition.{taskMemory:memory,taskCpu:cpu,containers:containerDefinitions[].{name:name,memory:memory,memoryReservation:memoryReservation,logDriver:logConfiguration.logDriver}}' \
  --output json | jq .

TASK_MEM_MB="$(aws ecs describe-task-definition --task-definition "$TD_ARN" --region "$REGION" \
  --query 'taskDefinition.memory' --output text)"
[[ "$TASK_MEM_MB" =~ ^[0-9]+$ ]] || TASK_MEM_MB=0

LOG_DRIVER="$(aws ecs describe-task-definition --task-definition "$TD_ARN" --region "$REGION" \
  --query 'taskDefinition.containerDefinitions[0].logConfiguration.logDriver' --output text)"

echo
echo ">>> Task memory limit: ${TASK_MEM_MB} MB. Node's default V8 old-space heap on a"
echo "    container this size is roughly half that, so expect a V8 'heap out of memory'"
echo "    FATAL ERROR around ~50% utilization rather than a 100% kernel OOM kill."
echo ">>> App container log driver: ${LOG_DRIVER}"

# --------------------------------------------- 2. memory utilization history
# CloudWatch caps one call at 1440 datapoints; round the period up to a legal multiple of 60.
RANGE_SECS=$(( DAYS * 86400 ))
PERIOD=$(( ((RANGE_SECS / 1440) / 60 + 1) * 60 ))

hdr "2. Memory utilization (Container Insights, MB)"
echo "Overview period=${PERIOD}s over ${DAYS}d"
CI_OUT="$(aws cloudwatch get-metric-statistics \
  --namespace ECS/ContainerInsights --metric-name MemoryUtilized \
  --dimensions Name=ClusterName,Value="$CLUSTER" Name=ServiceName,Value="$SERVICE" \
  --start-time "$START" --end-time "$END" --period "$PERIOD" \
  --statistics Maximum Average --region "$REGION" 2>/dev/null || echo '{}')"

if [[ "$(echo "$CI_OUT" | jq '.Datapoints // [] | length')" -gt 0 ]]; then
  echo "$CI_OUT" | jq -r '.Datapoints | sort_by(.Timestamp) | .[]
    | "\(.Timestamp)  max=\(.Maximum|floor)MB  avg=\(.Average|floor)MB"' | tail -80
  echo
  echo "Peak observed:"
  echo "$CI_OUT" | jq -r '[.Datapoints[].Maximum] | max | "  \(.|floor) MB"'
else
  echo "No Container Insights data (likely not enabled) — falling back to AWS/ECS %."
fi

hdr "2b. Memory utilization (AWS/ECS, percent) — overview"
echo "Overview period=${PERIOD}s over ${DAYS}d"
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS --metric-name MemoryUtilization \
  --dimensions Name=ClusterName,Value="$CLUSTER" Name=ServiceName,Value="$SERVICE" \
  --start-time "$START" --end-time "$END" --period "$PERIOD" \
  --statistics Maximum Average --region "$REGION" \
  --output json > /tmp/mem-overview.json

jq -r '.Datapoints | sort_by(.Timestamp) | .[]
  | "\(.Timestamp)  max=\(.Maximum|floor)%  avg=\(.Average|floor)%"' /tmp/mem-overview.json

echo
if [[ "$(jq '.Datapoints | length' /tmp/mem-overview.json)" -gt 0 ]]; then
  echo "Peak over window:"
  jq -r --argjson lim "$TASK_MEM_MB" '[.Datapoints[].Maximum] | max
    | "  \(.|floor)%" + (if $lim > 0 then " of \($lim)MB = ~\((. * $lim / 100)|floor) MB" else "" end)' \
    /tmp/mem-overview.json
else
  echo "(no datapoints returned)"
fi

hdr "2c. Last 24h at 2-minute resolution"
DAY_START="$(date -u -v-1d +%Y-%m-%dT%H:%M:%SZ 2>/dev/null \
  || date -u -d '1 day ago' +%Y-%m-%dT%H:%M:%SZ)"

aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS --metric-name MemoryUtilization \
  --dimensions Name=ClusterName,Value="$CLUSTER" Name=ServiceName,Value="$SERVICE" \
  --start-time "$DAY_START" --end-time "$END" --period 120 \
  --statistics Maximum --region "$REGION" \
  --output json | jq -r '.Datapoints | sort_by(.Timestamp) | .[]
    | "\(.Timestamp)  max=\(.Maximum|floor)%"'

echo
echo ">>> LOOK FOR: a sawtooth climbing then dropping = memory exhaustion."
echo ">>> Metrics are service-level across all tasks, so a single task's spike gets"
echo "    diluted by Average — always read Maximum."

# ------------------------------------------------ 3. stopped tasks/exit codes
hdr "3. Stopped tasks — exit codes and reasons"
echo "NOTE: ECS only retains stopped tasks for ~1 hour. Empty output != no crashes."
STOPPED="$(aws ecs list-tasks --cluster "$CLUSTER" --service-name "$SERVICE" \
  --desired-status STOPPED --region "$REGION" --query 'taskArns[]' --output text || true)"

if [[ -n "${STOPPED// /}" ]]; then
  # shellcheck disable=SC2086
  aws ecs describe-tasks --cluster "$CLUSTER" --tasks $STOPPED --region "$REGION" \
    --query 'tasks[].{stoppedAt:stoppedAt,stoppedReason:stoppedReason,stopCode:stopCode,containers:containers[].{name:name,exitCode:exitCode,reason:reason}}' \
    --output json | jq .
  echo
  echo ">>> exitCode 137 or reason containing OutOfMemoryError == kernel OOM kill."
else
  echo "(none currently retained)"
fi

# ----------------------------------------------------- 4. service event log
hdr "4. Recent service events"
aws ecs describe-services --cluster "$CLUSTER" --services "$SERVICE" --region "$REGION" \
  --query 'services[0].events[0:25].{at:createdAt,message:message}' --output json | jq .

# ------------------------------------------------ 5. container stdout search
hdr "5. Container log search (only if the app container uses awslogs)"

# With awsfirelens the only awslogs group belongs to the log_router sidecar, not the app.
if [[ "$LOG_DRIVER" == "awslogs" ]]; then
  LOG_GROUP="$(aws ecs describe-task-definition --task-definition "$TD_ARN" --region "$REGION" \
    --query 'taskDefinition.containerDefinitions[0].logConfiguration.options."awslogs-group"' \
    --output text 2>/dev/null)"
else
  LOG_GROUP=""
fi

if [[ -n "$LOG_GROUP" && "$LOG_GROUP" != "None" ]]; then
  echo "Log group: $LOG_GROUP"
  START_MS=$(( $(date -u +%s) - DAYS*86400 ))000
  for PAT in "exited: nuxt" "spawned: 'nuxt'" "JavaScript heap out of memory" \
             "Ineffective mark-compacts" "Connection refused"; do
    echo
    echo "--- pattern: $PAT"
    aws logs filter-log-events --log-group-name "$LOG_GROUP" \
      --start-time "$START_MS" --filter-pattern "\"$PAT\"" \
      --max-items 20 --region "$REGION" \
      --query 'events[].{t:timestamp,msg:message}' --output json 2>/dev/null \
      | jq -r '.[]? | "\(.t|tonumber/1000|todate)  \(.msg|rtrimstr("\n"))"' || echo "  (none)"
  done
else
  echo "App container log driver is '${LOG_DRIVER}' — stdout ships to New Relic, not CloudWatch."
  echo "Run the NRQL queries below instead."
fi

hdr "Done"
cat <<'EOF'
CONFIRMED 2026-09-11: production logs contain
  "FATAL ERROR: Ineffective mark-compacts near heap limit
   Allocation failed - JavaScript heap out of memory"
=> V8 heap exhaustion. Node exits, supervisord restarts it, and nginx returns 502
   for every request in the gap. ECS never notices because /_health is answered by
   nginx rather than the app.

New Relic (Query Builder) — to chart frequency and correlate:

  SELECT count(*) FROM Log
  WHERE message LIKE '%JavaScript heap out of memory%'
     OR message LIKE '%Ineffective mark-compacts%'
  SINCE 10 days ago TIMESERIES 1 hour

  SELECT count(*) FROM Log
  WHERE message LIKE '%exited: nuxt%' OR message LIKE "%spawned: 'nuxt'%"
  SINCE 10 days ago TIMESERIES 1 hour

  SELECT count(*) FROM Log
  WHERE message LIKE '%Connection refused%' AND message LIKE '%:3000%'
  SINCE 10 days ago TIMESERIES 1 hour

Note: V8 hits its own heap ceiling before the kernel OOM killer fires, so ECS
MemoryUtilization tops out around 60-62% (~2.5GB of the 4096MB limit: ~2GB V8 heap
plus nginx/supervisord/Node non-heap overhead) and no memory alarm can ever fire.
A repeating climb to ~60% followed by an abrupt drop IS the signature. Do not
dismiss it because utilization never approaches 100%.

Also: exitCode 137 on a task whose stopCode is ServiceSchedulerInitiated is a
SIGKILL from a normal scale-in, NOT an OOM kill. It does indicate supervisord
isn't forwarding SIGTERM (a clean stop should exit 0), which drops in-flight
connections on every deploy and scale-in.
EOF