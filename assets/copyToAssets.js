const fs = require('fs')

const images = ['logo.png', 'splash.png']
images.forEach((image) => {
    console.log('Copying images to platforms...', image)
    fs.copyFile(`./public/${image}`, `./assets/${image}`, (err) => {
        if (err) throw err
        console.log(`${image} was copied to assets/`)
    })
})