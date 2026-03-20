#!/bin/bash

# Kimi API 测试脚本 - Anthropic Messages 格式

API_ENDPOINT="https://api.kimi.com/coding/v1/messages"
API_KEY="${KIMI_API_KEY:-}"
MODEL="kimi-for-coding"

if [ -z "$API_KEY" ]; then
  echo "KIMI_API_KEY 未设置，请先导出环境变量后再运行。"
  exit 1
fi

# Anthropic Messages API 格式
curl -sS "$API_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d "{
    \"model\": \"$MODEL\",
    \"stream\": false,
    \"max_tokens\": 32768,
    \"reasoning_effort\": \"medium\",
    \"messages\": [
      {
        \"role\": \"user\",
        \"content\": \"你好，请简单介绍一下自己。\"
      }
    ]
  }" | python3 -m json.tool
