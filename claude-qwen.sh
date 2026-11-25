#!/usr/bin/env bash
# claude-qwen.sh — run Claude Code against the Qwen3.8 server on "studio" over Tailscale.
#
# Runs in the directory you call it from and passes every argument through to `claude`:
#   ./claude-qwen.sh                      interactive session in the current directory
#   ./claude-qwen.sh -p "explain main.go"   one-shot
#   ./claude-qwen.sh --continue           resume the last session here
#
# Overrides (optional):
#   QWEN_URL      server address        (default http://studio.tail9e3836.ts.net:11234)
#   QWEN_API_KEY  server key, once one is set on the server (default: any placeholder)
#   QWEN_CONTEXT  context window Claude Code plans for (default 524288, the server's max)
set -euo pipefail

QWEN_URL="${QWEN_URL:-http://studio.tail9e3836.ts.net:11234}"
QWEN_MODEL="qwen3.8"   # the server serves one model and accepts any name

command -v claude >/dev/null 2>&1 || {
  echo "claude-qwen: Claude Code is not installed (see https://code.claude.com/docs/en/overview)" >&2
  exit 1
}
if ! curl -sf -m 5 "$QWEN_URL/health" >/dev/null 2>&1; then
  echo "claude-qwen: cannot reach $QWEN_URL — is Tailscale connected? (fallback: QWEN_URL=http://100.120.190.85:11234)" >&2
  exit 1
fi

export ANTHROPIC_BASE_URL="$QWEN_URL"
export ANTHROPIC_AUTH_TOKEN="${QWEN_API_KEY:-local}"
# Never send a real Anthropic API key from this shell to the local server.
unset ANTHROPIC_API_KEY

# Every model slot (main, subagents, background calls) goes to the one server model.
export ANTHROPIC_MODEL="$QWEN_MODEL"
export ANTHROPIC_DEFAULT_OPUS_MODEL="$QWEN_MODEL"
export ANTHROPIC_DEFAULT_SONNET_MODEL="$QWEN_MODEL"
export ANTHROPIC_DEFAULT_HAIKU_MODEL="$QWEN_MODEL"
export CLAUDE_CODE_SUBAGENT_MODEL="$QWEN_MODEL"

# Keep the server's prompt cache usable: without this, Claude Code puts a per-message
# "x-anthropic-billing-header" line at the very top of the system prompt, so every request
# re-processes the whole ~15-70k-token prompt from scratch.
export CLAUDE_CODE_ATTRIBUTION_HEADER=0
# No telemetry / update / side requests to Anthropic.
export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1
# Claude Code assumes 200k for models it does not know; the server holds 524k per session.
export CLAUDE_CODE_MAX_CONTEXT_TOKENS="${QWEN_CONTEXT:-524288}"

exec claude --model "$QWEN_MODEL" "$@"
