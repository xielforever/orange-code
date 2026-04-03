#!/bin/bash
set -e

echo "Building Rust Backend..."
cd "$(dirname "$0")/../rust"
cargo build --release

echo "Building Frontend and Electron app..."
cd ../client
npm run build
npm run dist

echo "Build complete! Check client/release directory."