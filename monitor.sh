#!/bin/bash
# 黑客松服务监控脚本 - 自动检查并拉起服务（构建启动模式）

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="/tmp/hackathon-monitor.log"
PID_FILE="/tmp/hackathon-server.pid"
PORT=3000
MAX_LOG_LINES=1000

# 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# 检查服务是否运行
check_service() {
    # 检查端口是否监听
    if command -v ss &> /dev/null; then
        ss -tlnp | grep -q ":$PORT "
    elif command -v netstat &> /dev/null; then
        netstat -tlnp 2>/dev/null | grep -q ":$PORT "
    else
        # 回退到检查进程
        pgrep -f "next start" > /dev/null
    fi
}

# 检查 HTTP 响应
check_http() {
    curl -sf "http://localhost:$PORT" > /dev/null 2>&1
}

# 构建项目
build_project() {
    log "开始构建项目..."
    cd "$SCRIPT_DIR" || exit 1
    
    if npm run build >> "$LOG_FILE" 2>&1; then
        log "✓ 构建成功"
        return 0
    else
        log "✗ 构建失败，请检查日志"
        return 1
    fi
}

# 启动服务
start_service() {
    log "正在启动黑客松服务（生产模式）..."
    cd "$SCRIPT_DIR" || exit 1
    
    # 检查是否存在构建输出
    if [ ! -d "$SCRIPT_DIR/.next" ]; then
        log "未找到构建输出，先执行构建..."
        if ! build_project; then
            return 1
        fi
    fi
    
    # 清理旧的进程
    pkill -f "next start" 2>/dev/null
    sleep 2
    
    # 启动服务（生产模式）
    nohup npm run start > /tmp/hackathon-server.log 2>&1 &
    local pid=$!
    echo $pid > "$PID_FILE"
    
    # 等待服务启动
    local retry=0
    local max_retry=30
    while [ $retry -lt $max_retry ]; do
        sleep 1
        if check_service; then
            log "✓ 服务启动成功 (PID: $pid, 端口: $PORT)"
            return 0
        fi
        retry=$((retry + 1))
    done
    
    log "✗ 服务启动超时，请检查日志: /tmp/hackathon-server.log"
    return 1
}

# 清理旧日志
rotate_log() {
    if [ -f "$LOG_FILE" ] && [ $(wc -l < "$LOG_FILE") -gt $MAX_LOG_LINES ]; then
        tail -n 500 "$LOG_FILE" > "$LOG_FILE.tmp"
        mv "$LOG_FILE.tmp" "$LOG_FILE"
    fi
}

# 主逻辑
main() {
    rotate_log
    
    log "=== 开始检查服务状态 ==="
    
    if check_service; then
        # 服务在运行，额外检查 HTTP 响应
        if check_http; then
            log "✓ 服务运行正常 (端口: $PORT)"
        else
            log "⚠ 端口监听但 HTTP 无响应，检查中..."
            # 等待几秒再试一次
            sleep 3
            if ! check_http; then
                log "✗ HTTP 检查失败，准备重启服务"
                start_service
            fi
        fi
    else
        log "✗ 服务未运行，准备启动"
        start_service
    fi
}

# 执行主函数
main "$@"
