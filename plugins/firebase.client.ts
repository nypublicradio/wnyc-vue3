// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from 'firebase/analytics';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
export default defineNuxtPlugin(() => {
    // Your web app's Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyAeebKJtmVl7uXRxTs15d3s95rjdsEIG1g",
        authDomain: "wnyc-app-demo.firebaseapp.com",
        projectId: "wnyc-app-demo",
        storageBucket: "wnyc-app-demo.appspot.com",
        messagingSenderId: "162090348678",
        appId: "1:162090348678:web:973b5693bc06830150a107",
        measurementId: "G-HR1Q2F6S29"
    };
    // Initialize Firebase
    const firebaseApp = initializeApp(firebaseConfig);
    const analytics = getAnalytics(firebaseApp);
    console.log("analytics = ", analytics)

    return {
        provide: {
            firebaseApp,
        },
    }
    // Initialize Analytics and get a reference to the service
    //getAnalytics(app);

})