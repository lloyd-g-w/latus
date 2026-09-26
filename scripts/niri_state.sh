#!/usr/bin/env bash
set -euo pipefail

print_state() {
  # workspaces
  ws="$(niri msg -j workspaces | jq -c 'sort_by(.idx)')"

  # windows (example; adjust to your actual niri msg output)
  # if you don't have a direct "windows" command, remove this and keep only ws
  win="$(niri msg -j windows 2>/dev/null | jq -c '.')"
  if [[ -z "${win}" ]]; then win="[]"; fi

  # attach the owning output to each window so widgets can filter by monitor
  jq -cn --argjson workspaces "$ws" --argjson windows "$win" '
    ($workspaces | map({ key: (.id | tostring), value: .output }) | from_entries) as $wsOut
    | { workspaces: $workspaces,
        windows: ($windows | map(. + { output: ($wsOut[(.workspace_id // -1) | tostring] // null) })) }
  '
}

# initial
print_state

# listen + reprint
niri msg --json event-stream | jq --unbuffered -c '
select(.WorkspacesChanged or .WorkspaceActivated or .WindowFocusChanged or .WindowClosed or .WindowOpenedOrChanged)
' | while read -r _; do
  print_state
done
