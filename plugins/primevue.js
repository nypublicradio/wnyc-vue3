import { defineNuxtPlugin } from '#app'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import Menu from 'primevue/menu'
import Listbox from 'primevue/listbox'
import Menubar from 'primevue/menubar'
import PrimeVue from 'primevue/config'
import Sidebar from 'primevue/sidebar'
import Skeleton from 'primevue/skeleton'
import TabMenu from 'primevue/tabmenu'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Textarea from 'primevue/textarea'
import TieredMenu from 'primevue/tieredmenu'
import Toast from 'primevue/toast'
import ToastService from 'primevue/toastservice'
import SelectButton from 'primevue/selectbutton'
import Inplace from 'primevue/inplace'
import InputText from 'primevue/inputtext'
import Avatar from 'primevue/avatar'
import InlineMessage from 'primevue/inlinemessage'
import Divider from 'primevue/divider'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import Ripple from 'primevue/ripple'
//import Tooltip from 'primevue/tooltip'

export default defineNuxtPlugin(nuxtApp => {
    nuxtApp.vueApp.use(PrimeVue, { ripple: true })
    nuxtApp.vueApp.use(ToastService)
    nuxtApp.vueApp.directive('ripple', Ripple)
    nuxtApp.vueApp.component('Button', Button)
    nuxtApp.vueApp.component('Dropdown', Dropdown)
    nuxtApp.vueApp.component('Listbox', Listbox)
    nuxtApp.vueApp.component('Menu', Menu)
    nuxtApp.vueApp.component('Menubar', Menubar)
    nuxtApp.vueApp.component('Sidebar', Sidebar)
    nuxtApp.vueApp.component('Skeleton', Skeleton)
    nuxtApp.vueApp.component('TabMenu', TabMenu)
    nuxtApp.vueApp.component('TabView', TabView)
    nuxtApp.vueApp.component('TabPanel', TabPanel)
    nuxtApp.vueApp.component('Textarea', Textarea)
    nuxtApp.vueApp.component('TieredMenu', TieredMenu)
    nuxtApp.vueApp.component('Toast', Toast)
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
