
# Requirements

- Node v18.18.2
- [Homebrew pacakge manager](https://brew.sh/)
- Ruby >= 3
- [Xcode](https://apps.apple.com/us/app/xcode/id497799835?mt=12)
- [Android Studio](https://developer.android.com/studio)
- OSX (building the Android version only should be possible in other platforms but we don't have instructions for that yet)

# OSX Setup

## Install Build tools and dependencies

[Install Xcode](https://apps.apple.com/us/app/xcode/id497799835?mt=12)

After installing Xcode, run the following command to install the Xcode command line tools:
```bash
xcode-select --install
```

Install the dependencies:
Install Homebrew:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Install CocoaPods
```bash
brew install cocoapods
```

Install fastlane
```bash
brew install fastlane
```

(optional) Install Ruby if current version is lower than 3
```bash
brew install ruby
```

## Setting up secrets

Secret keys are in the developer 1password library

.env
/android/keystore.properties
/android/app/keystore.jks

to access our github-hosted dependencies you will need to create a personal access token

## Environment variables
Setting environment variables in your shell
```bash
export $(cat .env | xargs -L 1)
```

## Local Development

```
Install project dependencies:

```bash
npm install
```

To start the development server, run the following command:

```bash
npm run dev
```

To work on the mobile builds, run the following commands:
```bash
npm run generate
npx cap sync
npx cap open ios/android
```

Running this project in xcode for the first time may present an error about not having permissions. From a terminal run the following command : (Path will need to match the path present in the error.)

```bash
sudo xattr -w com.apple.xcode.CreatedByBuildSystem true /Users/username/Library/Developer/Xcode/DerivedData/App-fetbnufjaqwaadatgkquwnaykmin/SourcePackages/checkouts/nanopb/build
```
In xcode, select the AppLocal target to run the app on your development device. The device needs to be added to the development team in the Apple Developer Console.


## Learned Instructions for Ionic/Capacitor module for Nuxt 3
https://nypublicradio-digital.atlassian.net/l/cp/tV6d4Cwh