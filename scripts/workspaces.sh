#!/usr/bin/env bash

print_workspaces() {
    # Get workspaces, compact them to one line (-c), and ensure a newline follows
    niri msg -j workspaces | jq -c 'sort_by(.idx)'
}

# 1. Print the initial state immediately
print_workspaces

# 2. Start the event listener
# We pipe to a loop to ensure we control exactly when printing happens
niri msg --json event-stream | jq --unbuffered -c '
  select(
    .WorkspacesChanged or 
    .WorkspaceActivated or 
    .WindowFocusChanged
  )
' | while read -r _; do
    print_workspaces
done
