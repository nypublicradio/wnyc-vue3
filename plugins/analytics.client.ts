//import { useMembershipStatus } from "~~/composables/states"
import { FirebaseAnalytics } from '@capacitor-firebase/analytics';
import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from 'firebase/analytics';

export default defineNuxtPlugin(async () => {

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
  const app = initializeApp(firebaseConfig);
  const fbAnalytics = getAnalytics(app);
  //const membershipStatus = useMembershipStatus()
  await FirebaseAnalytics.setEnabled({
    enabled: true,
  });



  logEvent(fbAnalytics, 'notification_received');
  // event to use when sending gtag events
  const sendEvent = async (name: string, params: Record<string, string>) => {
    console.log('sendEvent', name, params)
    await FirebaseAnalytics.logEvent({
      name: name,
      params: params,
    });
  }
  // gtag event for reporting on page views
  const sendPageView = async (params: Record<string, string>) => {
    const currentUser = useCurrentUser()
    sendEvent('page_view', {
      page_location: document.location.href,
      page_title: document.title,
      user_id: currentUser.value?.id,
      //NYPRMember: membershipStatus.value,
      ...params
    })
  }
  return {
    provide: {
      analytics: {
        sendEvent,
        sendPageView
      }
    }
  }
})