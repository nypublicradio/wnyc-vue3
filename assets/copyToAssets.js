const fs = require('fs')

const images = ['logo.png', 'splash.png']
images.forEach((image) => {
    fs.copyFile(`./public/${image}`, `./assets/${image}`, (err) => {
        if (err) throw err
    })
})