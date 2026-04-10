#!/bin/bash

# Configuration
WALLET_ADDRESS="9uWPELiCiZEEZP5mLgmupEC5XbbesKWoqkd5rmQvbYFc"
TARGET_BALANCE=0.5
RPC_URL="https://api.devnet.solana.com"
MAX_RETRIES=20
SLEEP_INTERVAL=60

# Add tools to path
source $HOME/.cargo/env
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"

echo "🚀 Starting automated airdrop for $WALLET_ADDRESS"

for ((i=1; i<=MAX_RETRIES; i++)); do
    CURRENT_BALANCE=$(solana balance $WALLET_ADDRESS --url $RPC_URL | awk '{print $1}')
    
    if (( $(echo "$CURRENT_BALANCE >= $TARGET_BALANCE" | bc -l) )); then
        echo "✅ Target balance reached: $CURRENT_BALANCE SOL"
        exit 0
    fi
    
    echo "⏳ [$i/$MAX_RETRIES] Current balance: $CURRENT_BALANCE SOL. Requesting airdrop..."
    
    solana airdrop 1 $WALLET_ADDRESS --url $RPC_URL
    
    echo "💤 Sleeping for $SLEEP_INTERVAL seconds before next attempt..."
    sleep $SLEEP_INTERVAL
done

echo "❌ Failed to reach target balance after $MAX_RETRIES attempts."
exit 1
