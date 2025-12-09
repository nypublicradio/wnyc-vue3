import { Capacitor } from '@capacitor/core'
import { ref } from 'vue'

// Type definitions for Cordova Media Capture plugin
interface CaptureError {
    code: number
    message?: string
}

interface MediaFile {
    name: string
    localURL: string
    type: string
    lastModifiedDate: Date
    size: number
    fullPath: string
}

interface CaptureImageOptions {
    limit?: number
    quality?: number
}

interface CaptureVideoOptions {
    limit?: number
    duration?: number
    quality?: number
}

interface CaptureAudioOptions {
    limit?: number
    duration?: number
}

declare global {
    interface Navigator {
        device?: {
            capture?: {
                captureAudio: (
                    successCallback: (mediaFiles: MediaFile[]) => void,
                    errorCallback: (error: CaptureError) => void,
                    options?: CaptureAudioOptions
                ) => void
                captureVideo: (
                    successCallback: (mediaFiles: MediaFile[]) => void,
                    errorCallback: (error: CaptureError) => void,
                    options?: CaptureVideoOptions
                ) => void
                captureImage: (
                    successCallback: (mediaFiles: MediaFile[]) => void,
                    errorCallback: (error: CaptureError) => void,
                    options?: CaptureImageOptions
                ) => void
            }
        }
    }
}

export default function useCaptureMedia () {
    const isNative = Capacitor.isNativePlatform()
    const error = ref<string | null>(null)

    /**
     * Convert a MediaFile from Cordova to a File object
     */
    const mediaFileToFile = async (mediaFile: MediaFile): Promise<File> => {
        try {
            // Use Capacitor Filesystem to read the file
            const { Filesystem } = await import('@capacitor/filesystem')

            // Read file as base64
            const fileContent = await Filesystem.readFile({
                path: mediaFile.fullPath
            })

            // Convert base64 to blob
            const base64Response = await fetch(`data:${mediaFile.type};base64,${fileContent.data}`)
            const blob = await base64Response.blob()

            // Create File object
            return new File([blob], mediaFile.name, {
                type: mediaFile.type,
                lastModified: mediaFile.lastModifiedDate.getTime()
            })
        } catch (err) {
            console.error('Error converting MediaFile to File:', err)
            throw new Error('Failed to convert media file')
        }
    }

    /**
     * Capture audio using native plugin or web API
     */
    const captureAudio = async (options?: { duration?: number }): Promise<File> => {
        error.value = null

        if (isNative && navigator.device?.capture) {
            // Use Cordova plugin for native platforms
            return new Promise((resolve, reject) => {
                navigator.device.capture!.captureAudio(
                    async (mediaFiles) => {
                        try {
                            if (mediaFiles.length > 0) {
                                const file = await mediaFileToFile(mediaFiles[0])
                                resolve(file)
                            } else {
                                reject(new Error('No audio file captured'))
                            }
                        } catch (err) {
                            reject(err)
                        }
                    },
                    (err) => {
                        error.value = `Audio capture failed: ${err.message || 'Unknown error'}`
                        reject(new Error(error.value))
                    },
                    {
                        limit: 1,
                        duration: options?.duration
                    }
                )
            })
        } else {
            // Fallback to web API for browser
            throw new Error('Web API audio capture not implemented in composable. Use component-specific implementation.')
        }
    }

    /**
     * Capture video using native plugin or web API
     */
    const captureVideo = async (options?: { duration?: number; quality?: number }): Promise<File> => {
        error.value = null

        if (isNative && navigator.device?.capture) {
            // Use Cordova plugin for native platforms
            return new Promise((resolve, reject) => {
                navigator.device.capture!.captureVideo(
                    async (mediaFiles) => {
                        try {
                            if (mediaFiles.length > 0) {
                                const file = await mediaFileToFile(mediaFiles[0])
                                resolve(file)
                            } else {
                                reject(new Error('No video file captured'))
                            }
                        } catch (err) {
                            reject(err)
                        }
                    },
                    (err) => {
                        error.value = `Video capture failed: ${err.message || 'Unknown error'}`
                        reject(new Error(error.value))
                    },
                    {
                        limit: 1,
                        duration: options?.duration,
                        quality: options?.quality
                    }
                )
            })
        } else {
            // Fallback to web API for browser
            throw new Error('Web API video capture not implemented in composable. Use component-specific implementation.')
        }
    }

    /**
     * Capture image using native plugin or web API
     */
    const captureImage = async (options?: { quality?: number }): Promise<File> => {
        error.value = null

        if (isNative && navigator.device?.capture) {
            // Use Cordova plugin for native platforms
            return new Promise((resolve, reject) => {
                navigator.device.capture!.captureImage(
                    async (mediaFiles) => {
                        try {
                            if (mediaFiles.length > 0) {
                                const file = await mediaFileToFile(mediaFiles[0])
                                resolve(file)
                            } else {
                                reject(new Error('No image file captured'))
                            }
                        } catch (err) {
                            reject(err)
                        }
                    },
                    (err) => {
                        error.value = `Image capture failed: ${err.message || 'Unknown error'}`
                        reject(new Error(error.value))
                    },
                    {
                        limit: 1,
                        quality: options?.quality
                    }
                )
            })
        } else {
            // Fallback to web API for browser
            throw new Error('Web API image capture not implemented in composable. Use component-specific implementation.')
        }
    }

    /**
     * Check if media capture is available
     */
    const isMediaCaptureAvailable = (): boolean => {
        if (isNative) {
            return !!navigator.device?.capture
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
