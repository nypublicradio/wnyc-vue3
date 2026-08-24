import axios from 'axios'

export default defineNitroPlugin(() => {
    axios.defaults.timeout = 8000
})
