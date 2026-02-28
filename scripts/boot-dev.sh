#!/bin/bash

# Boot development environment using tmux
# This script starts both backend (Laravel) and frontend (Next.js) in split panes

SESSION_NAME="marknest-dev"
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Check if tmux is installed
if ! command -v tmux &> /dev/null; then
    echo "Error: tmux is not installed. Please install it first."
    exit 1
fi

# Kill existing session if it exists
tmux kill-session -t "$SESSION_NAME" 2>/dev/null

# Create a new tmux session with the backend pane
tmux new-session -d -s "$SESSION_NAME" -c "$PROJECT_ROOT/apps/backend"

# Run Laravel server in the first pane
tmux send-keys -t "$SESSION_NAME" "php artisan serve" C-m

# Split the window horizontally and navigate to frontend
tmux split-window -h -t "$SESSION_NAME" -c "$PROJECT_ROOT/apps/frontend"

# Run Next.js dev server in the second pane
tmux send-keys -t "$SESSION_NAME" "npm run dev" C-m

# Attach to the session
tmux attach-session -t "$SESSION_NAME"
