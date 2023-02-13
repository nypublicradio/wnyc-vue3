import { initializeApp } from 'firebase/app'

export default defineNuxtPlugin(nuxtApp => {
    const config = useRuntimeConfig()

    const firebaseConfig = {
        apiKey: 'AIzaSyB4to38Hl9td4RQmpyAgHMLt1M9HKKEczg',
        projectId: 'wnyc-app---android',
        messagingSenderId: '431848840548',
        appId: '1:431848840548:android:5d4c75e63f37f507cf6e71',
    };

    const app = initializeApp(firebaseConfig)
})