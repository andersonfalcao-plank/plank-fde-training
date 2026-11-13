#!/bin/sh
# PostToolUse hook for Edit and Write. It formats the created or updated file with Prettier.
# Claude Code sends the tool call as JSON on stdin.

file=$(jq -r '.tool_input.file_path // .tool_response.filePath // empty')
[ -n "$file" ] || exit 0

# Format only files in this repository, for example not the files in the scratchpad.
case "$file" in
  "$CLAUDE_PROJECT_DIR"/*) ;;
  *) exit 0 ;;
esac
[ -f "$file" ] || exit 0

# Prettier is installed in apps/web. Run it from apps/web, so that it uses apps/web/.prettierignore.
# --ignore-unknown skips the file types that Prettier cannot format.
web="$CLAUDE_PROJECT_DIR/apps/web"
prettier="$web/node_modules/.bin/prettier"
[ -x "$prettier" ] || exit 0

cd "$web" && "$prettier" --write --ignore-unknown --log-level warn "$file"
