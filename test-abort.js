// Test file to verify abort functionality
// You can run this in browser console to test

async function testAbortFunctionality() {
    console.log('Testing abort functionality...')

    // Create an abort controller
    const controller = new AbortController()

    // Start a fetch request
    const fetchPromise = fetch('/api/schedule/wnyc-fm939', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            localDate: new Date(),
            isToday: true
        }),
        signal: controller.signal
    })

    // Abort after 100ms
    setTimeout(() => {
        console.log('Aborting request...')
        controller.abort()
    }, 100)

    try {
        const response = await fetchPromise
        console.log('Request completed:', response)
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Request was successfully aborted')
        } else {
            console.error('Request failed:', error)
        }
    }
}

// Uncomment to run test
// testAbortFunctionality();
