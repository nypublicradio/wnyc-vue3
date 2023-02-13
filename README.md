# Nuxt 3 Minimal Starter

Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install the dependencies:

```bash
# yarn
yarn install

# npm
npm install

# pnpm
pnpm install
```

## Development Server

Start the development server on http://localhost:3000

```bash
npm run dev
```

## Production

Build the application for production:

```bash
npm run build
```

Locally preview production build:

```bash
npm run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.


## Learned Instructions for Ionic/Capacitor module for Nuxt 3
First, follow the [instructions here](https://ionic.nuxtjs.org/getting-started) to get everything installed and enabling Capacitor 

Before you install iOS and Android, run a generate once
```bash
npm run generate
```
Then follow the instructions to add ios and android. 

run dev to generate the `ionic.config.json` file
```bash
npm run dev
```

if the `ionic.config.json` does not appear when running the first time, run the following init
```bash
ionic init
```

If your default.vue layout is not rendering, add a `App.vue` to the root and add the following:

```html
<script setup>
import { IonApp } from '@ionic/vue'
</script>
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

```
if you added an `App.vue` file, add the following to your global css file:

```css
body { 
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  transform: none;
}
```

## SSR setup
We want SSR to run on the web, but not on the native app. To do this,

add the following var to the `.env` file:
```bash
ISAPP='false'
```

then, add the following to the `nuxt.config.js` file:

```js
ssr: process.env.ISAPP === 'false' ? true : false,
```
Not sure how to change this when generating the app, but it should be possible.

## Update ionic.config.json
Update the `ionic.config.json` file to include the following:
```json
{
  "name": "com.nypr.YOURAPPNAME",
  "integrations": {
    "capacitor": {}
  },
  "type": "vue"
}
```

## Update capacitor.config.json
Update the `capacitor.config.json` file to include the following:

```json
{
  "appId": "com.nypr.YOURAPPNAME",
  "appName": "YOURAPPNAME",
  "webDir": ".output/public",
  "bundledWebRuntime": false,
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 0
      //additional splash screen options here
    }
  }
}
```

Find and replace `io.ionic.starter` with `com.nypr.YOURAPPNAME` in the `\android\app\src\main\res\values\strings.xml` and `\android\app\build.gradle` files.

Find and replace `nuxt-ionic-project` with `YOURAPPNAME` in `\android\app\src\main\res\values\strings.xml` and `\ios\App\App\Info.plist` files.


Additional plugins documention can be found [here](https://capacitorjs.com/docs/plugins)

Additional SplashScreen documentation can be found [here](https://capacitorjs.com/docs/apis/splash-screen)

## Generating Icons and Splash Screens
In the root of the `public` folder, add the following files: `logo.png`, `icon.png` and `splash.png`. 

You can use these [PSD Templates](https://drive.google.com/drive/folders/1ctIhkcvM2YRDMbMrHUlMmg_xhVe63of0?usp=sharing) to create your splash and icon images.

install this package:
```bash
npm install @capacitor/assets
````

add this file to the `assets` folder: `copyToAssets.js`

```js
const fs = require('fs')

const images = ['logo.png', 'splash.png']
images.forEach((image) => {
    console.log('Copying images to platforms...', image)
    fs.copyFile(`./public/${image}`, `./assets/${image}`, (err) => {
        if (err) throw err
        console.log(`${image} was copied to assets/`)
    })
})
```

add the following to the `package.json` file:

```json
"scripts": {
    "generate-splash": "node assets/copyToAssets.js && npx capacitor-assets generate"
  }
```

Then, to generate all the icons and splash screens for all platforms run the following command:
```bash
npm run generate-splash
```
This will create grab the images in your public folder and generate and configure all the icons and splash images in a folder on the root called `icons`

If the `generate` script is not set up, add it to yout `package.json` file:
```json
"scripts": {
    "generate": "nuxt generate",
  }
```

## Build for Android
```bash
npm run gererate
npx cap sync
npx cap open android 
```
`npx cap open android ` will open Android Studio. From there, you can build the app and run it on an emulator or device.
In the lower right of Android Studio, you may be prompted to update Gradle. If so, do so and follow the instructions to update it.
To build the debug APK file in Android Studio, go to `Build > Build Bundle(s)/APK(s) > Build APK(s)` and follow the instructions.
To build the production installer APK file in Android Studio, go to `Build > Generate Signed Bundle...` and follow the instructions.

To install the debug APK file on a device, go to `Run > Run 'app'` and follow the instructions.


## Setup for iOS
in terminal install Homebrew:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```
then install cocoaPods:
```bash
brew install cocoapods
```

## Build for iOS
```bash
npm run gererate
npx cap sync
npx cap open ios 
```
`npx cap open ios ` will open Xcode. From there, you can build the app and run it on an emulator or device.


## Setup for push notifications
```bash
npm install @capacitor/push-notifications
npm i firebase
```

## Update the capacitor.config.json file
add the following to the `capacitor.config.json` file:
```json
 "plugins": {
    "PushNotifications": {
      "presentationOptions": ["badge", "sound", "alert"]
    }
  }
```

## Create custom notification icon:
Go to this [site](https://romannurik.github.io/AndroidAssetStudio/icons-notification.html) and create a custom notification icon. Be sure to use the name `ic_stat_notification_default`. Make sure your source image is white on a transparent background PNG. Download the zip file and place the 5 folders in the `android\app\src\main\res\` folder.

## Add Meta-data tag to the AndroidManifest.xml
`/android\app\src\main\AndroidManifest.xml`
add the following in the `<application>`
```xml
<meta-data android:name="com.google.firebase.messaging.default_notification_icon"   android:resource="@drawable/ic_stat_notification_default" />
```

If you want to add a custome backgorund color to your notification icon, add this as well.
```xml
    <meta-data android:name="com.google.firebase.messaging.default_notification_color" android:resource="@color/customColorAccent" tools:replace="android:resource"/>
```

... then also add the following to the  `<manifest>` tag:
```xml
    <manifest xmlns:tools="http://schemas.android.com/tools" >
```

...then, create a new file in the `android\app\src\main\res\values` folder called `colors.xml` and add the following (replace the hex code with your color):
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="colorPrimary">#de1e3d</color>
    <color name="colorPrimaryDark">#de1e3d</color>
    <color name="colorAccent">#de1e3d</color>
    <color name="customColorAccent">#de1e3d</color>
</resources>

```

## Set up Firebase Project
Create a new project in [Firebase](https://console.firebase.google.com/u/2/).
Make sure the project name is the same as the `appName` in the `capacitor.config.json` file.
Add and Android app to the project.
STEP 1: For Android package name, put your appId from the capacitor.config.json file. example `com.nypr.YOURAPPNAME`
STEP 2: Download the `google-services.json` file and place it in the `android/app` folder.
STEP 3: Follow the instructions for adding code the 2 build.gradle files


## Add Firebase plugin
Add a file to your project `/plugins/firebase.client.ts` and add the following code & set up the ENV variables:

```js
import { initializeApp } from 'firebase/app'

export default defineNuxtPlugin(nuxtApp => {
    const config = useRuntimeConfig()

    const firebaseConfig = {
        apiKey: config['API_KEY'],
        projectId: 'YOURAPPNAME',
        messagingSenderId: config['SENDER_ID'],
        appId: config['APP_ID'],
    };

    const app = initializeApp(firebaseConfig)
})
```

Be sure to check that all these packages are installed. They should be, but just double check at this point in the process:
```bash
  "@capacitor/android": "4.6.2",
  "@capacitor/app": "4.1.1",
  "@capacitor/assets": "^2.0.4",
  "@capacitor/core": "4.6.2",
  "@capacitor/haptics": "4.1.0",
  "@capacitor/ios": "4.6.2",
  "@capacitor/keyboard": "4.1.0",
  "@capacitor/push-notifications": "^4.1.2",
  "@capacitor/status-bar": "4.1.1",
```

## Add script to your project (default.vue layout is prob best)
```js
import { onMounted, ref } from 'vue'
import { App, URLOpenListenerEvent } from '@capacitor/app'
import { PushNotifications } from '@capacitor/push-notifications'
import { Capacitor } from '@capacitor/core'

const fcmToken = ref('')

const addListeners = async () => {
  await PushNotifications.addListener('registration', (token) => {
    fcmToken.value = token.value
    console.info('Registration token: ', token.value)
  })

  await PushNotifications.addListener('registrationError', (err) => {
    console.error('Registration error: ', err.error)
  })

  await PushNotifications.addListener(
    'pushNotificationReceived',
    (notification) => {
      console.log('Push notification received: ', notification)
    }
  )

  await PushNotifications.addListener(
    'pushNotificationActionPerformed',
    (notification) => {
      console.log(
        'Push notification action performed',
        notification.actionId,
        notification.inputValue
      )
    }
  )
  await App.addListener('appUrlOpen', function (event: URLOpenListenerEvent) {
    // Example url: https://beerswift.app/tabs/tabs2
    // slug = /tabs/tabs2
    const slug = event.url.split('.app').pop()
    // We only push to the route if there is a slug present
    if (slug) {
      router.push({ path: slug })
    }
  })
  await App.addListener('appStateChange', ({ isActive }) => {
    console.log('App state changed. Is active?', isActive)
  })

  await App.addListener('appRestoredResult', (data) => {
    console.log('Restored state:', data)
  })
}

const registerNotifications = async () => {
  let permStatus = await PushNotifications.checkPermissions()

  if (permStatus.receive === 'prompt') {
    permStatus = await PushNotifications.requestPermissions()
  }

  if (permStatus.receive !== 'granted') {
    throw new Error('User denied permissions!')
  }

  await PushNotifications.register()
}

const getDeliveredNotifications = async () => {
  const notificationList = await PushNotifications.getDeliveredNotifications()
  console.log('delivered notifications', notificationList)
}

const checkAppLaunchUrl = async () => {
  const url = await App.getLaunchUrl()
  console.log('App opened with URL: ' + url)
}

onMounted(() => {
  if (Capacitor.getPlatform() !== 'web') {
    registerNotifications()
    addListeners()
    getDeliveredNotifications()
    checkAppLaunchUrl()
  }
})

<template>
  <div>
    <div>
      <p>fcm token =</p>
      <input :value="fcmToken" />
    </div>
  </div>
</template>

```

## register the scheme iOS
Add the following to the bottom of the `info.plist` file in the `ios/App/App` folder:
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLName</key>
    <string>com.getcapacitor.capacitor</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>mycustomscheme</string>
    </array>
  </dict>
</array>
```

## register the scheme Android
Add the following to the `activity` section in the `AndroidManifest.xml` file in the `android/app/src/main` folder:
```xml
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <!-- the line below stopped the click on the notification from working -->
    <!-- <data android:scheme="@string/custom_url_scheme" /> -->
</intent-filter>
```

## Xcode setup



## Enable the iOS Push Notifications
On iOS you must enable the Push Notifications capability. To add a new capability, open your app in Xcode, select the `App` project and the `App target`, click `Signing & Capabilities` in the tab bar, and then click the + Capability button (it may look disabled). Select `Push Notifications` by double clicking it. See [this article](https://developer.apple.com/documentation/xcode/adding_capabilities_to_your_app) for more information about iOS capabilities.

This will update the `project.pbxproj` file in the `ios/App/App.xcodeproj` folder. You will need to commit this file to your repository.

Add the following to the `AppDelegate.swift` file in the `ios/App/App` folder:
```swift
  func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: deviceToken)
  }

  func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
    NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
  }
```

## setup a notification in Firebase
Go to the [Messaging tab](https://console.firebase.google.com/u/2/project/wnyc-stream/messaging) in Firebase and create a New Campaign.

follow the steps

## Test the notification
To send test message, go to step 1 (Notification) and click on the button on the right.

You need to add a FCM registration token. This token is populated in the input filed that we added in the code above. Copy the token and paste it in the notification input field, then press the PLUS icon on the right to add it.

Then, click on the `Test` button. Your device should get the nortification, it can take a few seconds sometimes. 
