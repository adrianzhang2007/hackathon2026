#!/bin/bash

# Kimi API 测试脚本
# OpenAI Compatible 格式

API_ENDPOINT="https://api.kimi.com/coding/v1/chat/completions"
API_KEY="${KIMI_API_KEY:-}"
MODEL="kimi-for-coding"

if [ -z "$API_KEY" ]; then
  echo "KIMI_API_KEY 未设置，请先导出环境变量后再运行。"
  exit 1
fi

# 请求体
curl -sS -N "$API_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d "{
    \"model\": \"$MODEL\",
    \"stream\": true,
    \"max_tokens\": 32768,
    \"reasoning_effort\": \"medium\",
    \"messages\": [
      {
        \"role\": \"system\",
        \"content\": \"你是一个有帮助的 AI 助手。\"
      },
      {
        \"role\": \"user\",
        \"content\": \"你好，请简单介绍一下自己。\"
      }
    ]
  }" | while read -r line; do
    # 跳过空行
    [ -z "$line" ] && continue

    # 处理 SSE 数据行
    if [[ $line == data:* ]]; then
      data="${line#data: }"

      # 检查是否结束
      [ "$data" = "[DONE]" ] && break

      # 提取内容
      content=$(echo "$data" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('choices',[{}])[0].get('delta',{}).get('content',''), end='')" 2>/dev/null)
      printf '%s' "$content"
    fi
  done

echo ""  # 最后换行
