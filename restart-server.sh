#!/bin/bash
# 重启脚本 - 请手动运行: sudo ./restart-server.sh

killall -9 node
rm -rf /home/teammate/hackathon/.next
cd /home/teammate/hackathon
su - teammate -c "cd /home/teammate/hackathon && npm run dev"
