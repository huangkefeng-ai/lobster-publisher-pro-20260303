#!/usr/bin/env bash
set -euo pipefail
cd /home/kkk/.openclaw/workspace-web3/lobster-publisher-pro
export PATH="$HOME/.local/bin:$HOME/.npm-global/bin:$PATH"
while true; do
  gemini --yolo --model gemini-3.1-pro --prompt "Continue UI and theme implementation for lobster-publisher-pro from current repository state. Do concrete code changes, run build/tests when needed, then commit and push incremental improvements to main."
  echo "[gemini cycle completed, restarting in 10s]"
  sleep 10
done
