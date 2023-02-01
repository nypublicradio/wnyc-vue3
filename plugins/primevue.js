import { defineNuxtPlugin } from '#app'; import Button from
'primevue/button/button.esm.js'; import Menubar from
'primevue/menubar/menubar.esm.js'; import PrimeVue from
'primevue/config/config.esm.js'; import Sidebar from
'primevue/sidebar/sidebar.esm.js'; import Skeleton from
'primevue/skeleton/skeleton.esm.js'; export default defineNuxtPlugin(nuxtApp =>
{ nuxtApp.vueApp.use( PrimeVue, { ripple: true } ); nuxtApp.vueApp.component(
'Button', Button ); nuxtApp.vueApp.component( 'Menubar', Menubar );
nuxtApp.vueApp.component( 'Sidebar', Sidebar ); nuxtApp.vueApp.component(
'Skeleton', Skeleton ); })
