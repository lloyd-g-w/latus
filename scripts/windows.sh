#!/usr/bin/env bash

print_windows() {
    niri msg -j windows | jq -c 'sort_by(.idx)'
}

# 1. Print the initial state immediately
print_windows

# 2. Start the event listener
# We pipe to a loop to ensure we control exactly when printing happens
niri msg --json event-stream | jq --unbuffered -c '
  select(
    .WindowClosed or
    .WindowOpenedOrChanged
  )
' | while read -r _; do
    print_windows
done

