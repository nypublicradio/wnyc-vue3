import { initializeApp } from 'firebase/app'

export default defineNuxtPlugin(nuxtApp => {
    const config = useRuntimeConfig()

    const firebaseConfig = {
        apiKey: 'AIzaSyBfHQsq3tu7qs18Nw0r_-kvP0nH0x26Igw',
        projectId: 'wnyc-app-android',
        messagingSenderId: '426209036575',
        appId: '1:426209036575:android:d4376ea8427ce382',
    };

    const app = initializeApp(firebaseConfig)
})