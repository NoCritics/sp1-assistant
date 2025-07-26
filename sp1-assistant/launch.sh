#!/bin/bash
# /root/sp1-assistant/launch.sh

# Create logs directory
mkdir -p logs

# Install dependencies
npm install

# Start with PM2
pm2 delete sp1-assistant 2>/dev/null
pm2 start ecosystem.config.js

# Show status
pm2 status sp1-assistant
pm2 logs sp1-assistant --lines 20

echo "SP1 Assistant is running on http://localhost:4000"
echo "Access the web interface at http://100.75.183.101:4000"
