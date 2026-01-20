#!/bin/bash
# Quick start script for local development with AWS SSO

set -e

echo "🚀 WNYC-VUE3 - Local Development Setup"
echo "=================================================="
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ Error: AWS CLI is not installed"
    echo "Please install AWS CLI v2: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

echo "✅ AWS CLI is installed"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo "📝 Please edit .env and set your configuration values"
    exit 0
fi

# Check if AWS_PROFILE is set in .env
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "   Copy .env.example to .env and configure it"
    exit 1
fi

# Extract profile name from .env (look for AWS_PROFILE if it exists, otherwise use default)
AWS_PROFILE=$(grep "^AWS_PROFILE=" .env 2>/dev/null | cut -d '=' -f2 | tr -d '"' | tr -d "'")

if [ -z "$AWS_PROFILE" ]; then
    AWS_PROFILE="default"
    echo "⚠️  AWS_PROFILE not set in .env, using 'default'"
fi

echo "📋 Using AWS Profile: $AWS_PROFILE"

# Check if profile exists
if ! aws configure list-profiles | grep -q "^${AWS_PROFILE}$"; then
    echo "❌ Error: AWS profile '$AWS_PROFILE' not found"
    echo "Available profiles:"
    aws configure list-profiles
    echo ""
    echo "To create a new profile, run: aws configure sso"
    exit 1
fi

# Check if already logged in
echo "🔐 Checking AWS SSO session..."
if aws sts get-caller-identity --profile "$AWS_PROFILE" &> /dev/null; then
    echo "✅ AWS SSO session is valid"
    IDENTITY=$(aws sts get-caller-identity --profile "$AWS_PROFILE" --query 'Arn' --output text)
    echo "   Logged in as: $IDENTITY"
else
    echo "⏳ AWS SSO session expired or not logged in"
    echo "   Running: aws sso login --profile $AWS_PROFILE"
    aws sso login --profile "$AWS_PROFILE"
    
    if [ $? -eq 0 ]; then
        echo "✅ AWS SSO login successful"
        IDENTITY=$(aws sts get-caller-identity --profile "$AWS_PROFILE" --query 'Arn' --output text)
        echo "   Logged in as: $IDENTITY"
    else
        echo "❌ AWS SSO login failed"
        exit 1
    fi
fi

echo ""
echo "🔑 Extracting AWS credentials from SSO cache..."
# Extract credentials
CREDS_SCRIPT="./export-aws-credentials.py"
if [ ! -f "$CREDS_SCRIPT" ]; then
    echo "❌ Error: $CREDS_SCRIPT not found"
    exit 1
fi

# Run the script and capture output
CREDS_OUTPUT=$("$CREDS_SCRIPT" 2>&1)
if [ $? -ne 0 ]; then
    echo "$CREDS_OUTPUT"
    echo "❌ Failed to extract credentials"
    exit 1
fi

# Extract the export commands and write to .env
ACCESS_KEY=$(echo "$CREDS_OUTPUT" | grep 'AWS_ACCESS_KEY_ID=' | sed 's/export AWS_ACCESS_KEY_ID="//' | sed 's/"$//')
SECRET_KEY=$(echo "$CREDS_OUTPUT" | grep 'AWS_SECRET_ACCESS_KEY=' | sed 's/export AWS_SECRET_ACCESS_KEY="//' | sed 's/"$//')
SESSION_TOKEN=$(echo "$CREDS_OUTPUT" | grep 'AWS_SESSION_TOKEN=' | sed 's/export AWS_SESSION_TOKEN="//' | sed 's/"$//')

# Update or add credentials to .env
echo "📝 Updating .env file with fresh credentials..."
if grep -q "^AWS_ACCESS_KEY_ID=" .env 2>/dev/null; then
    # Update existing credentials
    sed -i.bak "s|^AWS_ACCESS_KEY_ID=.*|AWS_ACCESS_KEY_ID=\"$ACCESS_KEY\"|" .env
    sed -i.bak "s|^AWS_SECRET_ACCESS_KEY=.*|AWS_SECRET_ACCESS_KEY=\"$SECRET_KEY\"|" .env
    sed -i.bak "s|^AWS_SESSION_TOKEN=.*|AWS_SESSION_TOKEN=\"$SESSION_TOKEN\"|" .env
    rm -f .env.bak
else
    # Add credentials if they don't exist
    echo "" >> .env
    echo "# AWS SSO Credentials (auto-updated by start-local.sh)" >> .env
    echo "AWS_ACCESS_KEY_ID=\"$ACCESS_KEY\"" >> .env
    echo "AWS_SECRET_ACCESS_KEY=\"$SECRET_KEY\"" >> .env
    echo "AWS_SESSION_TOKEN=\"$SESSION_TOKEN\"" >> .env
fi

# Remove AWS_PROFILE if it exists (we're using explicit credentials now)
if grep -q "^AWS_PROFILE=" .env 2>/dev/null; then
    sed -i.bak '/^AWS_PROFILE=/d' .env
    rm -f .env.bak
fi

echo "✅ Credentials updated in .env"

echo ""
echo "🐳 Starting Docker Compose..."
echo "💡 Tip: Credentials are valid for ~12 hours. Re-run this script when they expire."
echo ""
docker compose up --build

echo ""
echo "� Extracting AWS credentials from SSO cache..."
# Extract credentials and export them
CREDS_SCRIPT="./export-aws-credentials.py"
if [ ! -f "$CREDS_SCRIPT" ]; then
    echo "❌ Error: $CREDS_SCRIPT not found"
    exit 1
fi

# Run the script and capture output
CREDS_OUTPUT=$("$CREDS_SCRIPT" 2>&1)
if [ $? -ne 0 ]; then
    echo "$CREDS_OUTPUT"
    echo "❌ Failed to extract credentials"
    exit 1
fi

# Extract the export commands and source them
eval $(echo "$CREDS_OUTPUT" | grep '^export')
echo "✅ AWS credentials extracted and exported"

echo ""
echo "�🐳 Starting Docker Compose..."
echo "💡 Tip: If you see 'Token has expired' errors, stop the container and re-run this script"
echo ""
docker compose up --build

# Note: The script will block here while docker-compose runs
# Press Ctrl+C to stop the containers
