#!/usr/bin/env bash
# Emits the same {workspaces, windows} JSON shape as niri_state.sh, sourced from
# mango's IPC (mmsg). Mango has fixed per-monitor tags rather than workspaces, so
# a "workspace" here is a tag that is active, urgent, or has clients on it.
set -euo pipefail

print_state() {
  tags="$(mmsg get all-tags | jq -c '.all_tags // []')"
  clients="$(mmsg get all-clients | jq -c '.clients // []')"

  jq -cn --argjson tags "$tags" --argjson clients "$clients" '
    # Tag ids are unique across monitors: <monitor index> * 100 + <tag index>.
    ($tags | to_entries | map(.key as $mi | .value.monitor as $mon
      | .value.tags[]
      | select(.is_active or .is_urgent or .client_count > 0)
      | { idx: .index,
          id: ($mi * 100 + .index),
          output: $mon,
          is_active: .is_active })) as $workspaces
    | ($tags | to_entries | map({ key: .value.monitor, value: .key }) | from_entries) as $monIdx
    | ($clients | map(
        { id: .id,
          title: .title,
          app_id: .appid,
          is_focused: .is_focused,
          output: .monitor,
          workspace_id: (if (.tags | length) > 0 and ($monIdx[.monitor] != null)
                         then ($monIdx[.monitor] * 100 + .tags[0]) else null end) }))
      as $windows
    | { workspaces: $workspaces, windows: $windows }
  '
}

# initial
print_state

# listen + reprint: merge the watch streams and re-query on any change.
{
  trap 'kill $(jobs -p) 2>/dev/null' EXIT
  mmsg watch all-tags &
  mmsg watch all-clients &
  mmsg watch focusing-client &
  wait
} | while read -r _; do
  # coalesce bursts of events (a focus change fires several streams at once)
  while read -r -t 0.05 _; do :; done
  print_state
done
