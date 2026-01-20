import { Capacitor } from '@capacitor/core'
import { VideoRecorder, VideoRecorderCamera, VideoRecorderQuality } from '@capacitor-community/video-recorder'
import { Filesystem } from '@capacitor/filesystem'
import { ref } from 'vue'
import { decode } from 'base64-arraybuffer'
// root composable for media capture
export default function useCaptureMedia () {
    const isNative = Capacitor.isNativePlatform()
    const error = ref<string | null>(null)

    // Helper to convert base64 to Blob (using base64-arraybuffer instead)
    // const b64toBlob = (b64Data: string, contentType = '', sliceSize = 512) => {
    //     const byteCharacters = atob(b64Data)
    //     const byteArrays = []

    //     for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    //         const slice = byteCharacters.slice(offset, offset + sliceSize)
    //         const byteNumbers = new Array(slice.length)
    //         for (let i = 0; i < slice.length; i++) {
    //             byteNumbers[i] = slice.charCodeAt(i)
    //         }
    //         const byteArray = new Uint8Array(byteNumbers)
    //         byteArrays.push(byteArray)
    //     }

    //     const blob = new Blob(byteArrays, { type: contentType })
    //     return blob
    // }

    /**
     * Convert a file URI to a File object using native fetch, with Filesystem fallback
     */
    const uriToFile = async (fileUri: string, fileName?: string): Promise<File> => {
        try {
            const { Capacitor } = await import('@capacitor/core')

            // Try fetch first (skip on iOS as it can be unreliable for local large video files)
            const platform = Capacitor.getPlatform()
            const isIOS = platform === 'ios'

            if (!isIOS) {
                try {
                    const webPath = Capacitor.convertFileSrc(fileUri)
                    const response = await fetch(webPath)
                    if (!response.ok) {
                        throw new Error(`Fetch failed: ${response.statusText}`)
                    }

                    const blob = await response.blob()
                    const date = new Date()
                    const name = fileName || `video_${date.getTime()}.${blob.type.split('/')[1] || 'mp4'}`

                    return new File([blob], name, {
                        type: blob.type,
                        lastModified: date.getTime()
                    })
                } catch (fetchErr) {
                    console.warn('Fetch failed, trying Filesystem fallback:', fetchErr)
                }
            } else {
                // Skipping fetch on iOS, using Filesystem directly
            }

            // Filesystem Fallback (or primary for iOS)
            let path = fileUri

            // Parsing path from capacitor:// url
            // Decode URI component if needed
            path = decodeURIComponent(path)

            // Generic handling for both iOS (capacitor://) and Android (http(s)://)
            // We need to construct a file:// URL so Filesystem accepts it as absolute path
            if (path.includes('_capacitor_file_')) {
                const internalPath = path.split('_capacitor_file_')[1]
                path = `file://${internalPath}`
            } else if (path.startsWith('file://')) {
                // Already a file URL
            } else {
                // Fallback for paths that might be absolute but missing protocol?
                if (path.startsWith('/')) {
                    path = `file://${path}`
                }
            }
            const fileData = await Filesystem.readFile({
                path
            })

            // Detect mime type via signature (magic bytes) because the plugin often returns .mp4 extension for .mov files
            // fileData.data is base64
            const dataString = typeof fileData.data === 'string' ? fileData.data : ''

            // Peak at signature
            const headerB64 = dataString.substring(0, 20)
            const headerStr = atob(headerB64)

            // Default to mp4
            let mimeType = 'video/mp4'
            let extension = path.split('.').pop()?.toLowerCase() || 'mp4'

            // QuickTime signature is usually 'ftypqt' near the start
            if (headerStr.includes('ftypqt')) {
                mimeType = 'video/quicktime'
                extension = 'mov'
            } else if (extension === 'mov') {
                mimeType = 'video/quicktime'
            }
            const arrayBuffer = decode(dataString)

            const date = new Date()
            const name = fileName || `video_${date.getTime()}.${extension}`

            const file = new File([arrayBuffer], name, {
                type: mimeType,
                lastModified: date.getTime()
            })

            // Attach raw ArrayBuffer for direct upload (to bypass iOS Fetch/Blob issues)
            // We use defineProperty to avoid enumeration if possible, or just direct assignment
            Object.defineProperty(file, 'arrayBufferData', {
                value: arrayBuffer,
                writable: false,
                enumerable: false // Hide it from standard iterations
            })

            return file

        } catch (err) {
            console.error('Error converting URI to File:', err)
            throw new Error(`Failed to convert media file: ${err.message}`)
        }
    }
    // on initialize video 
    const initializeVideo = async (options: {
        id: string,
        x: number,
        y: number,
        width: number,
        height: number,
        stackPosition?: 'front' | 'back'
    }) => {
        if (error.value) {
            return
        }
        error.value = null
        if (isNative) {
            try {
                // Add a shorter timeout to catch hangs
                const initPromise = VideoRecorder.initialize({
                    camera: VideoRecorderCamera.FRONT,
                    previewFrames: [{
                        id: options.id,
                        stackPosition: options.stackPosition || 'front',
                        x: options.x,
                        y: options.y,
                        width: options.width,
                        height: options.height,
                        borderRadius: 0
                    }],
                    autoShow: true,
                    quality: VideoRecorderQuality.MAX_720P,
                })

                // 5 second timeout should be enough if permissions are granted
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Initialization timed out.')), 5000)
                )

                await Promise.race([initPromise, timeoutPromise])
            } catch (err) {
                console.error('Error initializing video:', err)
                error.value = `Failed to initialize camera: ${err.message}`
                throw err
            }
        }
    }

    /**
     * Start recording
     */
    const startVideoRecording = async () => {
        error.value = null
        if (isNative) {
            try {
                await VideoRecorder.startRecording()
            } catch (err) {
                console.error('Error starting recording:', err)
                error.value = `Failed to start recording: ${err.message}`
                throw err
            }
        }
    }

    /**
     * Stop recording and get the file
     */
    const stopVideoRecording = async (): Promise<File> => {
        error.value = null
        if (isNative) {
            try {
                const result = await VideoRecorder.stopRecording()
                if (result?.videoUrl) {
                    return await uriToFile(result.videoUrl)
                } else {
                    throw new Error('No video URL returned from plugin')
                }
            } catch (err) {
                console.error('Error stopping recording:', err)
                error.value = `Failed to stop recording: ${err.message}`
                throw err
            }
        }
        throw new Error('Not running on native platform')
    }

    /**
     * Destroy the camera instance
     */
    const destroyVideo = async () => {
        if (isNative) {
            try {
                await VideoRecorder.destroy()
            } catch (err) {
                console.error('Error destroying camera:', err)
            }
        }
    }

    // Stubs for other media types
    const captureAudio = async (): Promise<File> => {
        throw new Error('Native audio capture temporarily disabled.')
    }
    // capture image stub
    const captureImage = async (): Promise<File> => {
        throw new Error('Native image capture temporarily disabled.')
    }
    // check if media capture is available
    const isMediaCaptureAvailable = (): boolean => {
        if (isNative) {
            return true
        }
        return Boolean(navigator.mediaDevices?.getUserMedia)
    }

    // check permissions wrapper
    const requestPermissions = async () => {
        if (isNative) {
            try {
                const { Camera } = await import('@capacitor/camera')
                const permissionStatus = await Camera.requestPermissions({ permissions: ['camera'] })

                if (permissionStatus.camera !== 'granted' && permissionStatus.camera !== 'limited') {
                    throw new Error('Camera permission denied')
                }
                return true
            } catch (err) {
                console.error('Permission request failed:', err)
                error.value = `Failed to request permissions: ${err.message}`
                throw err
            }
        }
        return true
    }

    return {
        isNative,
        error,
        initializeVideo,
        startVideoRecording,
        stopVideoRecording,
        destroyVideo,
        captureAudio,
        captureImage,
        isMediaCaptureAvailable,
        requestPermissions
    }
}
