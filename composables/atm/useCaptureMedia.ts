import { Capacitor } from '@capacitor/core'
import { VideoRecorder, VideoRecorderCamera } from '@capacitor-community/video-recorder'
import { ref } from 'vue'

export default function useCaptureMedia () {
    const isNative = Capacitor.isNativePlatform()
    const error = ref<string | null>(null)

    /**
     * Convert a file URI to a File object using native fetch
     */
    const uriToFile = async (fileUri: string, fileName?: string): Promise<File> => {
        try {
            console.log('Converting URI to File:', fileUri)

            // Use Capacitor's convertFileSrc to get the proper webview URL
            const { Capacitor } = await import('@capacitor/core')
            const webPath = Capacitor.convertFileSrc(fileUri)
            console.log('Converted to webPath:', webPath)

            // Fetch the file using the webview path
            const response = await fetch(webPath)
            if (!response.ok) {
                throw new Error(`Failed to fetch file: ${response.statusText}`)
            }

            const blob = await response.blob()
            console.log('Blob created:', blob.type, blob.size)

            // Generate a filename if not provided
            const date = new Date()
            const name = fileName || `video_${date.getTime()}.${blob.type.split('/')[1] || 'mp4'}`

            // Create File object
            const file = new File([blob], name, {
                type: blob.type,
                lastModified: date.getTime()
            })

            console.log('File object created:', file.name, file.type, file.size)
            return file
        } catch (err) {
            console.error('Error converting URI to File:', err)
            throw new Error(`Failed to convert media file: ${err.message}`)
        }
    }

    /**
     * Initialize the camera preview
     */
    const initializeVideo = async (options: {
        id: string,
        x: number,
        y: number,
        width: number,
        height: number,
        stackPosition?: 'front' | 'back'
    }) => {
        error.value = null
        if (isNative) {
            try {
                console.log('Initializing native video preview:', options)
                await VideoRecorder.initialize({
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
                    autoShow: true
                })
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
                console.log('Starting native recording')
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
                console.log('Stopping native recording')
                const result = await VideoRecorder.stopRecording()

                console.log('Native recording stopped, result:', result)

                if (result && result.videoUrl) {
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
                console.log('Destroying native camera')
                await VideoRecorder.destroy()
            } catch (err) {
                console.error('Error destroying camera:', err)
                // Don't set error state on destroy as it's often called on unmount
            }
        }
    }

    // Stubs for other media types
    const captureAudio = async (): Promise<File> => {
        throw new Error('Native audio capture temporarily disabled.')
    }

    const captureImage = async (): Promise<File> => {
        throw new Error('Native image capture temporarily disabled.')
    }

    const isMediaCaptureAvailable = (): boolean => {
        if (isNative) {
            return true
        }
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
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
        isMediaCaptureAvailable
    }
}
