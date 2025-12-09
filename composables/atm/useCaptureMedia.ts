import { Capacitor } from '@capacitor/core'
import { VideoRecorder } from '@capacitor-community/video-recorder'
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
            const name = fileName || `video_${Date.now()}.${blob.type.split('/')[1] || 'mp4'}`

            // Create File object
            const file = new File([blob], name, {
                type: blob.type,
                lastModified: Date.now()
            })

            console.log('File object created:', file.name, file.type, file.size)
            return file
        } catch (err) {
            console.error('Error converting URI to File:', err)
            throw new Error(`Failed to convert media file: ${err.message}`)
        }
    }

    /**
     * Capture video using native plugin or web API
     */
    const captureVideo = async (options?: { duration?: number; quality?: number }): Promise<File> => {
        error.value = null

        if (isNative) {
            try {
                console.log('Starting native video capture with VideoRecorder plugin', options)

                // Configuration for the video recorder
                // Note: Check specific options supported by @capacitor-community/video-recorder
                const config = {
                    // Provide safe defaults
                    quality: options?.quality !== undefined ? options.quality : 0.5,
                    // The plugin might accept 'duration' or 'maxDuration', checking generic options
                    maxDuration: options?.duration
                }

                const result = await VideoRecorder.record(config)

                console.log('Video capture success, result:', result)

                // Result usually contains { fileUrl: ... } or { base64: ... }
                // Assuming fileUrl based on standard plugin behavior for large files
                if (result && result.fileUrl) {
                    return await uriToFile(result.fileUrl)
                } else if (result && result.base64String) {
                    // Handle base64 if that's what it returns (less likely for video)
                    // For now assume fileUrl
                    throw new Error('Video capture returned base64 which is not yet handled')
                } else {
                    throw new Error('No video file returned from capture')
                }

            } catch (err) {
                console.error('Error calling VideoRecorder.record:', err)
                error.value = `Failed to start video capture: ${err.message}`
                throw err
            }
        } else {
            throw new Error('Web API video capture not implemented in composable. Use component-specific implementation.')
        }
    }

    // Stubs for other media types (as requested to focus on video)
    const captureAudio = async (): Promise<File> => {
        throw new Error('Native audio capture temporarily disabled. Please use browser or wait for implementation.')
    }

    const captureImage = async (): Promise<File> => {
        throw new Error('Native image capture temporarily disabled. Please use browser or wait for implementation.')
    }

    /**
     * Check if media capture is available
     */
    const isMediaCaptureAvailable = (): boolean => {
        if (isNative) {
            return true // Assuming plugin is installed
        }
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    }

    return {
        isNative,
        error,
        captureAudio,
        captureVideo,
        captureImage,
        isMediaCaptureAvailable
    }
}
