#!/usr/bin/env bash
source ~/.bash_profile

echo "Writting configuration file..."
echo "writting android configuration file..."
echo $GSERVICE_FILE_ANDROID | base64 -d > android/app/google-services.json
echo "writting ios configuration file..."
echo $GSERVICE_FILE_IOS | base64 -d > ios/App/App/GoogleService-Info.plist