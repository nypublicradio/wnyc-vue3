addEventListener('remoteNotification', (resolve, reject/* , args */) => {
    try {
        //console.log('received silent push notification')

        resolve()
    } catch (err) {
        reject()
    }
})