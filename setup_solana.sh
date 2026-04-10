#!/bin/bash

# SolPact Environment Setup Script
# Installs Rust, Solana CLI, and Anchor (avm)

echo "🚀 Starting SolPact environment setup..."

# 1. Install Rust
if ! command -v rustc &> /dev/null; then
    echo "🦀 Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source $HOME/.cargo/env
else
    echo "✅ Rust is already installed."
fi

# 2. Install Solana CLI
if ! command -v solana &> /dev/null; then
    echo "☀️ Installing Solana CLI..."
    sh -c "$(curl -sSfL https://release.solana.com/v1.18.15/install)"
    export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
else
    echo "✅ Solana CLI is already installed."
fi

# 3. Install Anchor (via avm)
if ! command -v anchor &> /dev/null; then
    echo "⚓ Installing Anchor (avm)..."
    cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
    avm install latest
    avm use latest
else
    echo "✅ Anchor is already installed."
fi

echo "🎉 Setup complete! Please restart your terminal or run 'source ~/.bashrc' or 'source ~/.zshrc'."
echo "Verify versions:"
rustc --version
solana --version
anchor --version
