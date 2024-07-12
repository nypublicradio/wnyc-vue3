NODE v18.18.2
# Nuxt 3 Minimal Starter

Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup
On a MacOS computer only, [install xCode](https://apps.apple.com/us/app/xcode/id497799835?mt=12)
After installing xCode, run the following command to install the xcode command line tools:
```bash
xcode-select --install
```
Make sure to install the dependencies:
```bash
# Install Homebrew:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install CocoaPods:
brew install cocoapods

# Install fastlane:
brew install fastlane

```
Once the dependencies are installed, run the following command to install the project dependencies:

```bash
# npm
npm install
```

## Local Development
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