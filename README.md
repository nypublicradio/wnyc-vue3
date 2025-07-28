
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

## Testing

This project uses [Vitest](https://vitest.dev/) for unit testing. Tests are located in the `tests/` directory.

### Running Tests

```bash
# Run tests in watch mode (recommended for development)
npm run test

# Run all tests once
npm run test:run

# Run tests with coverage report
npm run coverage

# Run tests with UI interface
npm run test:ui
```

### Writing Tests

Tests are organized in the `tests/` directory with the following structure:
- `tests/utilities/` - Unit tests for utility functions
- `tests/components/` - Vue component tests (future)
- `tests/composables/` - Vue composable tests (future)

Example test:
```typescript
import { describe, it, expect } from 'vitest'

describe('MyFunction', () => {
  it('should return expected result', () => {
    const result = myFunction('input')
    expect(result).toBe('expected')
  })
})
```

For more detailed testing information, see [TESTING.md](./TESTING.md).

## Mobile Development

Running this project in xcode for the first time may present an error about not having permissions. From a terminal run the following command : (Path will need to match the path present in the error.)

```bash
sudo xattr -w com.apple.xcode.CreatedByBuildSystem true /Users/username/Library/Developer/Xcode/DerivedData/App-fetbnufjaqwaadatgkquwnaykmin/SourcePackages/checkouts/nanopb/build
```
In xcode, select the AppLocal target to run the app on your development device. The device needs to be added to the development team in the Apple Developer Console.


## Learned Instructions for Ionic/Capacitor module for Nuxt 3
https://nypublicradio-digital.atlassian.net/l/cp/tV6d4Cwh


## font size scale reference helper
--font-size = 16px
--font-ratio = 1.125
--font-size-20 = 5.202rem/83.23px	
--font-size-19 = 4.624rem/73.98px	
--font-size-18 = 4.11rem/65.76px	    
--font-size-17 = 3.653rem/58.45px	
--font-size-16 = 3.247rem/51.96px	
--font-size-15 = 2.887rem/46.18px	
--font-size-14 = 2.566rem/41.05px	
--font-size-13 = 2.281rem/36.49px	
--font-size-12 = 2.027rem/32.44px	
--font-size-11 = 1.802rem/28.83px	
--font-size-10 = 1.602rem/25.63px	
--font-size-9 = 1.424rem/22.78px	
--font-size-8 = 1.266rem/20.25px	
--font-size-7 = 1.125rem/18.00px	
--font-size-6 = 1rem/16.00px	
--font-size-5 = 0.889rem/14.22px	
--font-size-4 = 0.79rem/12.64px	
--font-size-3 = 0.702rem/11.24px	
--font-size-2 = 0.624rem/9.99px	
--font-size-1 = 0.555rem/8.88px	
--font-size-0 = 0.493rem/7.89px	