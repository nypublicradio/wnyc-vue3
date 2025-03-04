const fs = require('fs')

fs.copyFile('./public/splash.png', './assets/splash.png', (err) => {
    if (err) throw err
})
require('dotenv').config()
const env = process.env.ENV
fs.copyFile(`./public/icon-only-${env}.png`, './assets/icon-only.png', (err) => {
    if (err) throw err
})
