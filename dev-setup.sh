tmux send-keys "nvim" C-m

tmux new-window 
tmux send-keys "claude" C-m

tmux new-window 
tmux send-keys "cd frontend && cmd.exe /C npx tauri dev" C-m
tmux split-window -h
tmux send-keys "cd backend && cmd.exe /C air" C-m
