#!/usr/bin/env bash

out="$(wpctl get-volume @DEFAULT_AUDIO_SINK@)"

# If muted, return -1
if [[ "$out" == *"[MUTED]"* ]]; then
    echo -1
else
    awk '{print int($2 * 100)}' <<< "$out"
fi
