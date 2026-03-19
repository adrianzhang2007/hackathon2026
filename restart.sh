#!/bin/bash
echo 'hackathon2024' | sudo -S killall -9 node
echo 'hackathon2024' | sudo -S rm -rf /home/teammate/hackathon/.next
cd /home/teammate/hackathon
npm run dev
