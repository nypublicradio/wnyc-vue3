import { onMounted } from 'vue'
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'

export default defineNuxtPlugin(nuxtApp => {
    onMounted(() => {
        const firebaseConfig = {
            apiKey: "AIzaSyAeebKJtmVl7uXRxTs15d3s95rjdsEIG1g",
            authDomain: "wnyc-app-demo.firebaseapp.com",
            projectId: "wnyc-app-demo",
            storageBucket: "wnyc-app-demo.appspot.com",
            messagingSenderId: "162090348678",
            appId: "1:162090348678:web:973b5693bc06830150a107",
            measurementId: "G-HR1Q2F6S29"
        }
        const app = initializeApp(firebaseConfig)
        const analytics = getAnalytics(app)
    })
})