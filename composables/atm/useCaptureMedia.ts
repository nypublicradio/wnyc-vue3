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
     * Convert a MediaFile from Cordova to a File object using native fetch
     */
    const mediaFileToFile = async (mediaFile: MediaFile): Promise<File> => {
        try {
            console.log('Converting MediaFile:', {
                name: mediaFile.name,
                fullPath: mediaFile.fullPath,
                localURL: mediaFile.localURL,
                type: mediaFile.type,
                size: mediaFile.size
            })

            // Use Capacitor's convertFileSrc to get the proper webview URL
            const { Capacitor } = await import('@capacitor/core')
            const webPath = Capacitor.convertFileSrc(mediaFile.fullPath)

            console.log('Converted to webPath:', webPath)

            // Fetch the file using the webview path
            const response = await fetch(webPath)
            if (!response.ok) {
                throw new Error(`Failed to fetch file: ${response.statusText}`)
            }

            const blob = await response.blob()
            console.log('Blob created:', blob.type, blob.size)

            // Create File object
            const file = new File([blob], mediaFile.name, {
                type: mediaFile.type || blob.type,
                lastModified: mediaFile.lastModifiedDate.getTime()
            })

            console.log('File object created:', file.name, file.type, file.size)
            return file
        } catch (err) {
            console.error('Error converting MediaFile to File:', err)
            console.error('MediaFile details:', mediaFile)
            throw new Error(`Failed to convert media file: ${err.message}`)
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
                console.log('Starting native audio capture with options:', options)

                navigator.device.capture!.captureAudio(
                    async (mediaFiles) => {
                        console.log('Audio capture success, files:', mediaFiles)
                        try {
                            if (mediaFiles.length > 0) {
                                const file = await mediaFileToFile(mediaFiles[0])
                                resolve(file)
                            } else {
                                reject(new Error('No audio file captured'))
                            }
                        } catch (err) {
                            console.error('Error in audio capture callback:', err)
                            reject(err)
                        }
                    },
                    (err) => {
                        console.error('Audio capture error:', err)
                        error.value = `Audio capture failed: ${err.message || 'Unknown error (code: ' + err.code + ')'}`
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
                console.log('Starting native video capture with options:', options)

                // Quality: 0 = low (front-facing works better), 1 = high (default)
                const captureOptions: CaptureVideoOptions = {
                    limit: 1,
                    duration: options?.duration,
                    quality: options?.quality !== undefined ? options.quality : 0 // Default to low quality for better compatibility
                }

                console.log('Final capture options:', captureOptions)

                navigator.device.capture!.captureVideo(
                    async (mediaFiles) => {
                        console.log('Video capture success, files:', mediaFiles)
                        try {
                            if (mediaFiles.length > 0) {
                                const file = await mediaFileToFile(mediaFiles[0])
                                resolve(file)
                            } else {
                                reject(new Error('No video file captured'))
                            }
                        } catch (err) {
                            console.error('Error in video capture callback:', err)
                            reject(err)
                        }
                    },
                    (err) => {
                        console.error('Video capture error:', err)
                        error.value = `Video capture failed: ${err.message || 'Unknown error (code: ' + err.code + ')'}`
                        reject(new Error(error.value))
                    },
                    captureOptions
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
                console.log('Starting native image capture with options:', options)

                navigator.device.capture!.captureImage(
                    async (mediaFiles) => {
                        console.log('Image capture success, files:', mediaFiles)
                        try {
                            if (mediaFiles.length > 0) {
                                const file = await mediaFileToFile(mediaFiles[0])
                                resolve(file)
                            } else {
                                reject(new Error('No image file captured'))
                            }
                        } catch (err) {
                            console.error('Error in image capture callback:', err)
                            reject(err)
                        }
                    },
                    (err) => {
                        console.error('Image capture error:', err)
                        error.value = `Image capture failed: ${err.message || 'Unknown error (code: ' + err.code + ')'}`
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
