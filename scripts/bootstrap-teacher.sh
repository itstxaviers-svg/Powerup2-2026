#!/usr/bin/env bash
set -euo pipefail

: "${POWER_UP_API_URL:?Set POWER_UP_API_URL}"
: "${POWER_UP_BOOTSTRAP_SECRET:?Set POWER_UP_BOOTSTRAP_SECRET}"
: "${POWER_UP_TEACHER_EMAIL:?Set POWER_UP_TEACHER_EMAIL}"
: "${POWER_UP_TEACHER_PASSWORD:?Set POWER_UP_TEACHER_PASSWORD}"
: "${POWER_UP_JOIN_CODE:?Set POWER_UP_JOIN_CODE}"

curl --fail-with-body --silent --show-error \
  -H 'Content-Type: application/json' \
  -H "X-Bootstrap-Secret: ${POWER_UP_BOOTSTRAP_SECRET}" \
  -d "{\"email\":\"${POWER_UP_TEACHER_EMAIL}\",\"password\":\"${POWER_UP_TEACHER_PASSWORD}\",\"displayName\":\"Teacher\",\"groupName\":\"Power Up 2\",\"joinCode\":\"${POWER_UP_JOIN_CODE}\"}" \
  "${POWER_UP_API_URL%/}/setup/teacher"
