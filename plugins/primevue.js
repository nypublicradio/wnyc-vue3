import { defineNuxtPlugin } from '#app'
import Button from 'primevue/button/button.esm.js'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown/dropdown.esm.js'
import Menubar from 'primevue/menubar/menubar.esm.js'
import PrimeVue from 'primevue/config/config.esm.js'
import Sidebar from 'primevue/sidebar/sidebar.esm.js'
import Skeleton from 'primevue/skeleton/skeleton.esm.js'
import TabMenu from 'primevue/tabmenu/tabmenu.esm.js'
import TieredMenu from 'primevue/tieredmenu/tieredmenu.esm.js'
import SelectButton from 'primevue/selectbutton'
import Inplace from 'primevue/inplace'
import InputText from 'primevue/inputtext'
import Avatar from 'primevue/avatar'
import InlineMessage from 'primevue/inlinemessage'
import Divider from 'primevue/divider'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
//import Tooltip from 'primevue/tooltip'

export default defineNuxtPlugin(nuxtApp => {
    nuxtApp.vueApp.use(PrimeVue, { ripple: false })
    nuxtApp.vueApp.component('Button', Button)
    nuxtApp.vueApp.component('Dropdown', Dropdown)
    nuxtApp.vueApp.component('Menubar', Menubar)
    nuxtApp.vueApp.component('Sidebar', Sidebar)
    nuxtApp.vueApp.component('Skeleton', Skeleton)
    nuxtApp.vueApp.component('TabMenu', TabMenu)
    nuxtApp.vueApp.component('TieredMenu', TieredMenu)
    nuxtApp.vueApp.component('SelectButton', SelectButton)
    nuxtApp.vueApp.component('Inplace', Inplace)
    nuxtApp.vueApp.component('InputText', InputText)
    nuxtApp.vueApp.component('Avatar', Avatar)
    nuxtApp.vueApp.component('InlineMessage', InlineMessage)
    nuxtApp.vueApp.component('Divider', Divider)
    nuxtApp.vueApp.component('Message', Message)
    nuxtApp.vueApp.component('ProgressSpinner', ProgressSpinner)
    nuxtApp.vueApp.component('Dialog', Dialog)
    // nuxtApp.vueApp.component('Tooltip', Tooltip)
    // nuxtApp.vueApp.directive('tooltip', Tooltip)
})
