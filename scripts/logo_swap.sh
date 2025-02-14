#!/usr/bin/env bash
source ~/.bash_profile

echo "Swapping logo by environment..."
cd assets
mv logo-${ENV}.png logo.png

echo "Logo swapped by environment: ${ENV}"