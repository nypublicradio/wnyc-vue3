#!/usr/bin/env python3
"""
Export AWS SSO credentials from cache to environment variables.
Run this before starting Docker to export fresh credentials.
"""
import json
import os
import glob
from datetime import datetime, timezone


def find_latest_credentials():
    """Find the most recent valid credentials in AWS CLI cache."""
    cache_dir = os.path.expanduser("~/.aws/cli/cache")
    cache_files = glob.glob(os.path.join(cache_dir, "*.json"))

    if not cache_files:
        print("❌ No AWS CLI cache files found")
        print(f"   Run: aws sso login --profile <profile-name>")
        return None

    latest_creds = None
    latest_expiration = None

    for cache_file in cache_files:
        try:
            with open(cache_file, "r") as f:
                data = json.load(f)

            if "Credentials" in data:
                expiration_str = data["Credentials"]["Expiration"]
                expiration = datetime.fromisoformat(
                    expiration_str.replace("Z", "+00:00")
                )

                # Only consider non-expired credentials
                if expiration > datetime.now(timezone.utc):
                    if latest_expiration is None or expiration > latest_expiration:
                        latest_creds = data["Credentials"]
                        latest_expiration = expiration
        except (json.JSONDecodeError, KeyError, ValueError):
            continue

    return latest_creds, latest_expiration


def main():
    creds, expiration = find_latest_credentials() or (None, None)

    if not creds:
        print("❌ No valid AWS credentials found in cache")
        print("   Run: aws sso login --profile <profile-name>")
        return 1

    print("✅ Found valid AWS SSO credentials")
    print(f"   Expires: {expiration.strftime('%Y-%m-%d %H:%M:%S %Z')}")
    print("")
    print("🔑 Export these to your shell:")
    print("")
    print(f'export AWS_ACCESS_KEY_ID="{creds["AccessKeyId"]}"')
    print(f'export AWS_SECRET_ACCESS_KEY="{creds["SecretAccessKey"]}"')
    print(f'export AWS_SESSION_TOKEN="{creds["SessionToken"]}"')
    print("")
    print("📝 Or run: eval $(./export-aws-credentials.py)")

    return 0


if __name__ == "__main__":
    exit(main())
