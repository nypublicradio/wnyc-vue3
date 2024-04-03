fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

## iOS

### ios certificates

```sh
[bundle exec] fastlane ios certificates
```

certs

### ios test

```sh
[bundle exec] fastlane ios test
```

Test the ios app

### ios test_version_bump

```sh
[bundle exec] fastlane ios test_version_bump
```

Test version bump

### ios test_build_bump

```sh
[bundle exec] fastlane ios test_build_bump
```

Test build bump

### ios build

```sh
[bundle exec] fastlane ios build
```

Build an ios app

### ios alpha

```sh
[bundle exec] fastlane ios alpha
```

Submits a new WNYC Alpha Build to Apple TestFlight

### ios beta

```sh
[bundle exec] fastlane ios beta
```

Submits a new WNYC Beta Build to Apple TestFlight

### ios release

```sh
[bundle exec] fastlane ios release
```

Release a new version of the app to the App Store

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
