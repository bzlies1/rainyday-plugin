#!/usr/bin/env bash
# Extract PROJ-123 identifiers from stdin or arguments.
# Usage: echo "Fix RD-42 login bug" | ./extract-identifier.sh
#    or: ./extract-identifier.sh "Fix RD-42 login bug"
set -euo pipefail

input="${1:-$(cat)}"
echo "$input" | grep -oE '[A-Z]{2,4}-[0-9]+' | sort -u
