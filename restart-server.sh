#!/bin/bash
# 重启脚本 - 构建并启动生产模式
# 用法: sudo ./restart-server.sh [--build]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="/tmp/hackathon-server.log"

echo "[*] 正在停止服务..."
killall -9 node 2>/dev/null
sleep 2

cd "$SCRIPT_DIR" || exit 1

# 如果需要重新构建
if [ "$1" == "--build" ] || [ ! -d "$SCRIPT_DIR/.next" ]; then
    echo "[*] 正在构建项目..."
    rm -rf .next
    if ! npm run build 2>&1 | tee "$LOG_FILE"; then
        echo "[✗] 构建失败"
        exit 1
    fi
    echo "[✓] 构建成功"
fi

echo "[*] 正在启动服务（生产模式）..."
nohup npm run start > "$LOG_FILE" 2>&1 &
echo $! > /tmp/hackathon-server.pid

sleep 3

# 检查是否启动成功
if pgrep -f "next start" > /dev/null; then
    echo "[✓] 服务已启动 (PID: $(cat /tmp/hackathon-server.pid))"
    echo "[*] 访问: http://localhost:3000"
else
    echo "[✗] 服务启动失败，请查看日志: $LOG_FILE"
    exit 1
fi
