<script setup>
import { ref, nextTick, computed, onMounted } from "vue"
import { trackClickEvent } from "~/utilities/helpers"
import { Capacitor } from "@capacitor/core"
import useGallery from "~/composables/atm/useGallery"
// Import FilePond and its plugins
import vueFilePond from "vue-filepond"
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type"
import FilePondPluginImageEditor from "@pqina/filepond-plugin-image-editor"
import FilePondPluginFilePoster from "filepond-plugin-file-poster"
import FilePondPluginMediaPreview from "filepond-plugin-media-preview"

// Import new capture components
import CaptureImage from "./CaptureImage.vue"
import CaptureVideoAudio from "./CaptureVideoAudio.vue"
import CaptureAudio from "./CaptureAudio.vue"

// Import Pintura for image editing and its necessary factory functions
import {
  openEditor as pinturaOpenEditor,
  processImage as pinturaProcessImage,
  createDefaultImageReader as pinturaCreateDefaultImageReader,
  createDefaultImageWriter as pinturaCreateDefaultImageWriter,
  getEditorDefaults as pinturaGetEditorDefaults,
  // legacyDataToImageState as pinturaLegacyDataToImageState, // Only if needed for v6 data
} from "@pqina/pintura"

// Import required styles
import "filepond/dist/filepond.min.css"
import "filepond-plugin-file-poster/dist/filepond-plugin-file-poster.css"
import "filepond-plugin-media-preview/dist/filepond-plugin-media-preview.min.css"
import "@pqina/pintura/pintura.css"

import useTranscribe from "~/composables/atm/useTranscribe"

const mediaType = {
  IMAGE: "image",
  VIDEO: "video",
  AUDIO: "audio",
}

// Component props with defaults
const props = defineProps({
  bucket: {
    type: String,
    default: "media",
  },
  subfolder: {
    type: String,
    default: null,
  },
  submissionTable: {
    type: String,
    default: null,
  },
  header: {
    type: String,
    default: "Capture/Upload Media",
  },
  maxFiles: {
    type: Number,
    default: 10,
  },
  maxFileSize: {
    type: String,
    default: "50MB", // Increased limit since we auto-process large images
  },
  user: {
    type: Object,
    default: null,
  },
  acceptedFileTypes: {
    type: Array,
    default: () => ["image/*", "video/*", "audio/*"],
  },
  metadata: {
    type: Array,
    default: () => [],
  },
  invalid: {
    type: Boolean,
    default: false,
  },
  uploadButton: {
    type: Boolean,
    default: true,
  },
  cameraButton: {
    type: Boolean,
    default: true,
  },
  videoButton: {
    type: Boolean,
    default: true,
  },
  audioButton: {
    type: Boolean,
    default: false,
  },
  cameraButtonLabel: {
    type: String,
    default: "Capture Photo",
  },
  videoButtonLabel: {
    type: String,
    default: "Record Video",
  },
  audioButtonLabel: {
    type: String,
    default: "Record Audio",
  },
  autoSelect: {
    type: String,
    default: null,
    // audio, video, image
  },
  browseButton: {
    type: Boolean,
    default: true,
  },
  // New prop for autosave integration
  autosaveComposable: {
    type: Object,
    default: null,
  },
  recordTimeLimit: {
    type: Number,
    default: null,
  },
  miscData: {
    type: Object,
    default: null,
  },
})

// Component emits
const emit = defineEmits([
  "upload-complete",
  "upload-error",
  "upload-progress",
  "files-updated",
  "has-files",
  "close-capture",
])

const { embedMetadataInImage } = useGallery()
const { transcribeMedia } = useTranscribe()

// Supabase client
const supabase = useSupabaseClient()

// FilePond instance reference
const pond = ref(null)

// Track if files are present (including during editing)
const hasFiles = ref(false)

// Store edited files mapped by file item ID
const editedFiles = ref(new Map())

// Map to store raw ArrayBuffers for upload (iOS bypass)
const arrayBufferMap = ref(new Map())

// Store last captured video URL for manual preview
const lastCapturedVideoUrl = ref(null)

// Track if images are being processed
const isProcessing = ref(false)

// Ref for the component root to enable scrolling
const uploadMediaPanel = ref(null)

// Track if images are being captured
const isCapturing = ref(false)

// Track autosave mode
const isAutosaveMode = computed(() => !!props.autosaveComposable)

// Track number of retakes
const numOfRetakes = ref(0)

// Map to store capture metadata for files
const captureMetadataMap = ref(new Map())

// Server configuration for FilePond (used for restoring autosaved files)
const serverConfig = computed(() => {
  if (!isAutosaveMode.value) return null

  return {
    process: (fieldName, file, metadata, load, error, progress, abort) => {
      // In autosave mode, files are already handled by onAddFile
      // Just immediately signal success to FilePond
      progress(1)
      load(Date.now().toString()) // Return a unique ID
    },
    restore: async (
      uniqueFileId,
      load,
      error,
      progress /* , abort, headers */
    ) => {
      try {
        progress(true, 0, 1)

        // Find the file reference by ID
        const mediaFiles =
          props.autosaveComposable.autosaveMediaFiles?.value || []
        const fileRef = mediaFiles.find((f) => f.id === uniqueFileId)
        if (!fileRef) {
          error("File not found")
          return
        }

        // Use the API endpoint to restore the file with proper MIME type
        const response = await fetch("/api/autosave-restore", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileId: uniqueFileId,
            userId: props.autosaveComposable.user?.value?.id,
            formId: props.autosaveComposable.formId,
            patientId: props.autosaveComposable.patient_id,
          }),
        })

        if (!response.ok) {
          console.error(
            `[UploadMedia] Error restoring file: ${response.status} ${response.statusText}`
          )
          error("Could not restore file")
          return
        }

        // Get the blob from response
        const blob = await response.blob()

        // Create a File object with the original name and type
        const file = new File([blob], fileRef.original_name, {
          type: fileRef.file_type, // Use the stored MIME type from fileRef
        })

        progress(true, 1, 1)
        load(file)
      } catch (err) {
        console.error("Error restoring autosave file:", err)
        error("Error restoring file")
      }
    },
    revert: async (uniqueFileId, load, error) => {
      try {
        // Remove the autosaved file when reverted
        await props.autosaveComposable.removeAutosaveMediaFile(uniqueFileId)
        load()
      } catch (err) {
        console.error("Error reverting autosave file:", err)
        error("Error removing file")
      }
    },
  }
})

// Initial files for FilePond (disabled in autosave mode to prevent restore cycle)
const initialFiles = computed(() => {
  // In autosave mode, don't set initial files to prevent FilePond from trying to restore them
  // We'll populate them manually after component mounts
  if (isAutosaveMode.value) {
    return []
  }

  return []
})

// Computed metadata object that combines all information from props.metadata
const fileMetadata = computed(() => {
  // Convert the metadata array [user, patient] into a flat object for FilePond
  const metadataObject = {}

  props.metadata.forEach((item, index) => {
    if (typeof item === "object" && item !== null) {
      // Add a prefix to distinguish between user and patient data and 3rd item
      const prefix =
        index === 0 ? "user__" : index === 1 ? "patient__" : "item__"

      Object.keys(item).forEach((key) => {
        // Skip unwanted user metadata fields
        const unwantedFields = [
          "app_metadata",
          "aud",
          "confirmed_at",
          "created_at",
          "email_confirmed_at",
          "identities",
          "is_anonymous",
          "last_sign_in_at",
          "role",
          "updated_at",
          "user_metadata",
        ]

        if (index === 0 && unwantedFields.includes(key)) {
          return // Skip this field
        }

        metadataObject[`${prefix}${key}`] = item[key]
      })
    }
  })

  // Add system information
  metadataObject.uploadTimestamp = Date.now()
  metadataObject.uploadDate = new Date().toISOString()
  metadataObject.bucket = props.bucket

  return metadataObject
})

// Pintura editor configuration using the new structure for FilePondPluginImageEditor
const imageEditorPinturaOptions = {
  // Maps legacy data objects to new imageState objects (optional, uncomment if needed)
  // legacyDataToImageState: pinturaLegacyDataToImageState,

  // Used to create the editor (required)
  createEditor: pinturaOpenEditor,

  // Used for reading the image data (required)
  imageReader: [pinturaCreateDefaultImageReader, {}],

  // Required when generating a preview thumbnail and/or output image
  imageWriter: [
    pinturaCreateDefaultImageWriter,
    {
      // Temporarily disable automatic conversions to isolate the issue
      // The manual processing will handle resizing and WebP conversion
      // format: 'image/webp',
      // quality: 0.8,
      // progressive: true,
      // targetSize: {
      //   width: 1920,
      //   height: 1080,
      //   fit: 'contain',
      //   upscale: false
      // },
    },
  ],

  // Used to create poster and output images, runs an invisible "headless" editor instance
  imageProcessor: pinturaProcessImage,

  // Pintura Image Editor options
  editorOptions: {
    ...pinturaGetEditorDefaults(), // Load default Pintura configuration
    // Override or add specific Pintura options here
    // For example, to match the previous 'editor' object's utils:
    utils: ["crop", "finetune", "filter", "color", "markup", "resize"],
    cropAspectRatioOptions: [
      {
        label: "Free",
        value: null,
      },
      {
        label: "Square",
        value: 1,
      },
      {
        label: "4:3",
        value: 4 / 3,
      },
      {
        label: "16:9",
        value: 16 / 9,
      },
      // Add other previous options if necessary, like sticker sources, etc.
    ],
    // Example: imageCropAspectRatio: 1, // to default to square
  },
}

// Create FilePond component with plugins and the new imageEditor options
const FilePond = vueFilePond(
  FilePondPluginFileValidateType,
  FilePondPluginImageEditor,
  FilePondPluginFilePoster,
  FilePondPluginMediaPreview
)

// Function to resize and convert image to WebP if not already processed
const processImageFile = (file) => {
  // Validate file input
  if (!file || !(file instanceof File)) {
    console.warn("Invalid file provided to processImageFile:", file)
    return file
  }

  return new Promise((resolve /* , reject */) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onerror = (error) => {
      console.error("Error loading image for processing:", error)
      resolve(file) // Return original file if processing fails
    }

    img.onload = () => {
      try {
        // Calculate new dimensions maintaining aspect ratio
        let { width, height } = img
        const maxWidth = 1920
        const maxHeight = 1080

        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height
          if (width > height) {
            width = maxWidth
            height = width / aspectRatio
            if (height > maxHeight) {
              height = maxHeight
              width = height * aspectRatio
            }
          } else {
            height = maxHeight
            width = height * aspectRatio
            if (width > maxWidth) {
              width = maxWidth
              height = width / aspectRatio
            }
          }
        }

        // Set canvas dimensions
        canvas.width = width
        canvas.height = height

        // Draw resized image
        ctx.drawImage(img, 0, 0, width, height)

        // Convert to WebP blob with error handling
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              console.error("Failed to create blob from canvas")
              resolve(file) // Return original file if blob creation fails
              return
            }

            try {
              // Create new file with WebP extension
              const originalName = file.name.replace(/\.[^/.]+$/, "") // Remove extension
              const webpFile = new File([blob], `${originalName}.webp`, {
                type: "image/webp",
                lastModified: Date.now(),
              })
              resolve(webpFile)
            } catch (error) {
              console.error("Error creating WebP file:", error)
              resolve(file) // Return original file if File creation fails
            }
          },
          "image/webp",
          0.7
        ) // 70% quality

        // Clean up object URL
        URL.revokeObjectURL(img.src)
      } catch (error) {
        console.error("Error processing image:", error)
        resolve(file) // Return original file if processing fails
      }
    }

    try {
      img.src = URL.createObjectURL(file)
    } catch (error) {
      console.error("Error creating object URL for image processing:", error)
      resolve(file) // Return original file if URL creation fails
    }
  })
}

// Function to actually upload the file after editing
const uploadEditedFile = async (
  file,
  fileMetadataArg,
  rawArrayBuffer = null
) => {
  // Check if this file has capture metadata
  const fileKey = `${file.name}_${file.lastModified}`
  const captureMetadata = captureMetadataMap.value.get(fileKey)

  // Process ALL image files (both edited and non-edited) for consistency
  let processedFile = file
  if (file.type.startsWith(`${mediaType.IMAGE}/`)) {
    processedFile = await processImageFile(file)

    // For captured images, we need to build the metadata object from capture metadata
    let metadataForEmbedding = fileMetadataArg
    if (captureMetadata) {
      // Build metadata object similar to how it was done in CaptureImage
      const fileMetadataObject = {}
      if (captureMetadata.originalProps?.metadata) {
        captureMetadata.originalProps.metadata.forEach((item, index) => {
          if (typeof item === "object" && item !== null) {
            const prefix =
              index === 0 ? "user__" : index === 1 ? "patient__" : "item__"
            Object.keys(item).forEach((key) => {
              const unwantedFields = [
                "app_metadata",
                "aud",
                "confirmed_at",
                "created_at",
                "email_confirmed_at",
                "identities",
                "is_anonymous",
                "last_sign_in_at",
                "role",
                "updated_at",
                "user_metadata",
              ]
              if (index === 0 && unwantedFields.includes(key)) return
              fileMetadataObject[`${prefix}${key}`] = item[key]
            })
          }
        })
      }
      fileMetadataObject.uploadTimestamp = Date.now()
      fileMetadataObject.uploadDate = new Date().toISOString()
      fileMetadataObject.bucket =
        captureMetadata.originalProps?.bucket || props.bucket
      fileMetadataObject.captureMethod = captureMetadata.captureMethod
      fileMetadataObject.captureTimestamp = captureMetadata.captureTimestamp
      fileMetadataObject.captureDate = captureMetadata.captureDate

      metadataForEmbedding = fileMetadataObject
    }

    // Embed metadata into the processed image
    processedFile = await embedMetadataInImage(
      processedFile,
      metadataForEmbedding,
      captureMetadata?.originalProps?.metadata || props.metadata
    )
  }

  const timeStampToDate = (timestamp) => {
    const date = new Date(timestamp)
    // format date to YYYY_MM_DD
    return date.toISOString().split("T")[0]
  }

  // Generate unique filename with timestamp
  const timestamp = new Date().getTime()
  const sanitizedName = processedFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")

  // Safeguard against missing user/metadata/name which causes crash
  const rawName = props.user?.user_metadata?.name
  const userName = rawName ? rawName.replace(" ", "_") : "unknown-user"

  const userId = `--${props.user?.id}--` || ""
  const subfolder = captureMetadata?.originalProps?.subfolder || props.subfolder

  const fileName = `${userName}${userId}${timeStampToDate(timestamp)}_${
    captureMetadata ? "capture" : "upload"
  }_${sanitizedName}`
  const fileNamePath = `${`/${subfolder}`}/${timeStampToDate(
    timestamp
  )}/${fileName}`

  emit("upload-progress", "Video uploading...")
  try {
    // Upload the file to Supabase Storage
    const bucket = captureMetadata?.originalProps?.bucket || props.bucket

    // Use raw ArrayBuffer if available (iOS fix), otherwise use processed file
    // Convert ArrayBuffer to Blob for better compatibility if needed
    let fileBody = processedFile

    if (rawArrayBuffer) {
      try {
        fileBody = new Blob([rawArrayBuffer], {
          type: file.type || "video/quicktime",
        })
      } catch (e) {
        console.error("Failed to create Blob from ArrayBuffer", e)
        fileBody = rawArrayBuffer
      }
    }

    const uploadOptions = {
      cacheControl: "3600",
      upsert: false,
      contentType: fileBody.type || file.type || "video/quicktime", // Ensure content type is set
    }

    const { data, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileNamePath, fileBody, uploadOptions)

    if (uploadError) {
      console.error("Upload error:", uploadError)
      emit("upload-error", uploadError.message || JSON.stringify(uploadError))
      return null
    }
    emit("upload-progress", "Video processing...")

    // Use the original metadata or capture metadata
    const finalMetadata = captureMetadata
      ? { ...captureMetadata, path: data.path }
      : { ...fileMetadataArg, path: data.path }

    //if the file is audio or video, we need to transcribe it
    let transcription = null
    if (
      processedFile.type.startsWith("audio/") ||
      processedFile.type.startsWith("video/")
    ) {
      try {
        transcription = await transcribeMedia(processedFile)
      } catch (error) {
        console.error("Transcription failed:", error)
        transcription = "transcribe failed"
      }
    }

    emit("upload-progress", "Data processing...")

    // Save everything to Supabase in the submission table
    const { error: submissionError } = await supabase
      .from(props.submissionTable)
      .insert([
        {
          user_id: props.user?.id,
          video_filename: fileName,
          metadata: finalMetadata,
          subfolder_date: timeStampToDate(timestamp),
          transcript: transcription,
          retakes: numOfRetakes.value,
          instagram_handle: props.miscData?.instagramHandle,
        },
      ])
      .select()

    if (submissionError) {
      console.error("Submission error:", submissionError)
      emit("upload-error", submissionError)
      return null
    }

    emit("upload-progress", "Upload complete")

    //reset retakes
    numOfRetakes.value = 0

    //reset progress
    setTimeout(() => {
      emit("upload-progress", null)
    }, 3000)

    emit("upload-complete", { path: data.path, metadata: finalMetadata })
    return { path: data.path, metadata: finalMetadata }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Upload failed"
    console.error("Upload error:", err)
    emit("upload-error", errorMessage)
    return null
  }
}

// Handle when files are added/edited and ready to upload
const handleFilesReady = async () => {
  if (!pond.value) return

  // Clear the video preview when user submits
  if (lastCapturedVideoUrl.value) {
    URL.revokeObjectURL(lastCapturedVideoUrl.value)
    lastCapturedVideoUrl.value = null
  }

  // Scroll the component into view to show progress
  if (uploadMediaPanel.value?.$el) {
    uploadMediaPanel.value.$el.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }

  isProcessing.value = true
  const files = pond.value.getFiles()

  try {
    if (isAutosaveMode.value) {
      // In autosave mode, files are automatically saved as they're added
      // Just emit the current state
      emit("files-updated", files)
    } else {
      // Normal mode: upload files to final destination
      for (const fileItem of files) {
        let fileToUpload = fileItem.file

        // Check if this file has edited content
        if (
          editedFiles.value.has(fileItem.id) &&
          editedFiles.value.get(fileItem.id)
        ) {
          fileToUpload = editedFiles.value.get(fileItem.id)
        }

        // Retrieve raw ArrayBuffer using FilePond ID if available
        const rawBuffer = arrayBufferMap.value.get(fileItem.id)

        await uploadEditedFile(fileToUpload, fileMetadata.value, rawBuffer)
      }

      // Clear all files from FilePond and reset the component
      if (pond.value) {
        pond.value.removeFiles()
      }

      // Clear the edited files map
      editedFiles.value.clear()

      // Clear the capture metadata map
      captureMetadataMap.value.clear()
      arrayBufferMap.value.clear()

      // Reset the hasFiles state after upload
      hasFiles.value = false
    }
  } catch (error) {
    isProcessing.value = false
    console.error("Upload error:", error)
    console.error("Upload error json:", JSON.stringify(error))
    throw error // Re-throw error so parent can catch it
  } finally {
    isProcessing.value = false
  }
}

// Reactive states for showing capture components
const showImageCapture = ref(false)
const showVideoAudioCapture = ref(false)
const showAudioCapture = ref(false)

// Method to open a specific capture component and hide others
const openCaptureMode = (mode) => {
  showImageCapture.value = mode === mediaType.IMAGE
  showVideoAudioCapture.value = mode === mediaType.VIDEO
  showAudioCapture.value = mode === mediaType.AUDIO
  isCapturing.value = !!mode
}

// Event handlers for capture components
const handleCaptureComplete = async (captureData) => {
  // Add the captured file to FilePond
  if (pond.value && captureData.file) {
    // Add file to FilePond and wait for the item to be created
    try {
      const fileItem = await pond.value.addFile(captureData.file)

      if (fileItem) {
        // Store ArrayBuffer if present (iOS fix) using the reliable FilePond ID
        if (captureData.file.arrayBufferData) {
          arrayBufferMap.value.set(
            fileItem.id,
            captureData.file.arrayBufferData
          )
        }
      }
    } catch (err) {
      console.error("Error adding file to FilePond:", err)
    }

    // Create manual preview for iOS verification
    // Revoke previous URL if exists to avoid leaks
    if (lastCapturedVideoUrl.value) {
      URL.revokeObjectURL(lastCapturedVideoUrl.value)
    }
    try {
      lastCapturedVideoUrl.value = URL.createObjectURL(captureData.file)
    } catch (e) {
      console.error("Failed to create object URL for preview:", e)
    }

    // Store the capture metadata for later use during upload
    // We'll store it keyed by file name since we don't have file item ID yet (or mixed strategy)
    // Keeping name key for metadata for now to avoid breaking other logic.
    const fileKey = `${captureData.file.name}_${captureData.file.lastModified}`
    captureMetadataMap.value.set(fileKey, captureData.metadata)
  }

  // Close the capture mode and show FilePond
  openCaptureMode(null)
  hasFiles.value = true
}

const handleCaptureError = (errorData) => {
  console.error("Capture error:", errorData)
  emit("upload-error", errorData) // Propagate event upwards
  // Keep the capture component open so user can retry
}

const reset = () => {
  if (pond.value) {
    pond.value.removeFiles()
    hasFiles.value = false
    editedFiles.value.clear()
    captureMetadataMap.value.clear()
    arrayBufferMap.value.clear()
    isProcessing.value = false

    // Clear manual video preview
    if (lastCapturedVideoUrl.value) {
      URL.revokeObjectURL(lastCapturedVideoUrl.value)
      lastCapturedVideoUrl.value = null
    }

    // In autosave mode, clear all autosaved files
    if (isAutosaveMode.value && props.autosaveComposable) {
      // Note: We don't automatically clear autosaved files on reset
      // They should only be cleared on form submission or explicit user action
      //console.log("[UploadMedia] Reset in autosave mode - files preserved")
    }
  }
}

// Expose method for parent component to trigger upload
defineExpose({
  uploadFiles: handleFilesReady,
  getFiles: () => pond.value?.getFiles() || [],
  reset: () => {
    reset()
  },
})

// Manually restore autosaved files (called on mount)
const restoreAutosavedFiles = async () => {
  if (
    !isAutosaveMode.value ||
    !props.autosaveComposable?.autosaveMediaFiles?.value?.length
  ) {
    // console.log(`[UploadMedia] No files to restore:`, {
    //   autosaveMode: isAutosaveMode.value,
    //   mediaFilesExists: !!props.autosaveComposable?.autosaveMediaFiles?.value,
    //   fileCount:
    //     props.autosaveComposable?.autosaveMediaFiles?.value?.length || 0,
    // })
    return
  }

  // Wait for user to be loaded
  if (!props.autosaveComposable.user?.value?.id) {
    // Add a retry counter to prevent infinite loops
    const retryCount = (restoreAutosavedFiles._retryCount || 0) + 1
    if (retryCount > 10) {
      // Max 10 retries (5 seconds)
      console.error(
        `[UploadMedia] Failed to load user after ${retryCount} attempts, giving up`
      )
      return
    }
    restoreAutosavedFiles._retryCount = retryCount

    setTimeout(restoreAutosavedFiles, 500)
    return
  }

  // Reset retry counter on success
  restoreAutosavedFiles._retryCount = 0

  const mediaFiles = props.autosaveComposable.autosaveMediaFiles.value
  for (const fileRef of mediaFiles) {
    try {
      const apiParams = {
        fileId: fileRef.id,
        userId: props.autosaveComposable.user?.value?.id,
        formId: props.autosaveComposable.formId,
        patientId: props.autosaveComposable.patient_id,
      }

      // Validate required parameters
      if (!apiParams.fileId || !apiParams.userId) {
        console.error(`[UploadMedia] Missing required parameters:`, {
          fileId: !!apiParams.fileId,
          userId: !!apiParams.userId,
          formId: !!apiParams.formId,
          patientId: !!apiParams.patientId,
          userObject: props.autosaveComposable.user?.value,
        })
        continue
      }

      // Use the API endpoint to restore the file with proper MIME type
      const response = await fetch("/api/autosave-restore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiParams),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(
          `[UploadMedia] Error restoring file: ${response.status} ${response.statusText}`,
          errorText
        )
        continue
      }

      // Get the blob from response
      const blob = await response.blob()

      // Create a File object with the original name and type
      const file = new File([blob], fileRef.original_name, {
        type: fileRef.file_type, // Use the stored MIME type from fileRef
      })

      // Add the file to FilePond manually
      if (pond.value) {
        pond.value.addFile(file, {
          metadata: {
            autosaveId: fileRef.id,
            ...fileRef.metadata,
          },
        })
      }
    } catch (err) {
      console.error(
        `[UploadMedia] Error restoring autosaved file ${fileRef.id}:`,
        err
      )
    }
  }
}

// FilePond event handlers
const onAddFile = async (error, file) => {
  if (error) return

  hasFiles.value = true

  // In autosave mode, save the file immediately
  if (isAutosaveMode.value && file && file.file) {
    // Check if this is a restored file (it will have a string source instead of File object)
    // Restored files should not be re-uploaded
    if (typeof file.source === "string" && file.origin === 4) {
      // origin === 4 means FilePond.FileOrigin.LIMBO (restored file)
      return
    }

    // Also check if file has an autosaveId metadata (already processed)
    if (file.getMetadata("autosaveId")) {
      return
    }

    try {
      const metadata = {
        ...fileMetadata.value,
        originalProps: {
          bucket: props.bucket,
          subfolder: props.subfolder,
          patientId: props.user?.id,
        },
      }

      const fileRef = await props.autosaveComposable.saveAutosaveMediaFile(
        file.file,
        metadata
      )

      if (fileRef) {
        // Update the FilePond file item with the autosave ID for later reference
        file.setMetadata("autosaveId", fileRef.id)
      }
    } catch (error) {
      console.error("[UploadMedia] Error autosaving file:", error)
    }
  }
}

const onRemoveFile = async (error, file) => {
  if (error) return

  // In autosave mode, remove the file from autosave storage
  if (isAutosaveMode.value && file) {
    const autosaveId = file.getMetadata("autosaveId") || file.source
    if (autosaveId) {
      try {
        await props.autosaveComposable.removeAutosaveMediaFile(autosaveId)
      } catch (error) {
        console.error("[UploadMedia] Error removing autosaved file:", error)
      }
    }
  }

  // Check if there are still files after removal
  nextTick(() => {
    const fileCount = pond.value?.getFiles()?.length || 0
    hasFiles.value = fileCount > 0

    // If no files left, clear the manual video preview
    if (fileCount === 0 && lastCapturedVideoUrl.value) {
      URL.revokeObjectURL(lastCapturedVideoUrl.value)
      lastCapturedVideoUrl.value = null
    }
  })
}
// Handle FilePond initialization
const handleFilePondInit = () => {
  //console.log("FilePond has initialized")
}

// Handle FilePond errors
const onError = (error) => {
  console.error("FilePond error:", error)
  emit("upload-error", error)
}

// Add handler for when image is edited
const onProcessFile = (error /* , file */) => {
  if (error) {
    console.error("Process file error:", error)
  }
}

// Add handler for when file is updated (including after editing)
// const onUpdateFiles = (files) => {
//   emit("files-updated", files)
// }

// Add handler for prepare file (this is where edited data might be available)
// const onPrepareFile = (fileItem, output) => {
//   // Validate that output is a proper File or Blob before processing
//   if (fileItem && output) {
//     // Check if output is a File, Blob, or has the necessary properties
//     if (output instanceof File) {
//       editedFiles.value.set(fileItem.id, output)
//       return output
//     } else if (output instanceof Blob) {
//       // Convert Blob to File with proper name
//       const originalFile = fileItem.file
//       const editedFile = new File([output], originalFile.name, {
//         type: output.type || originalFile.type,
//         lastModified: Date.now(),
//       })
//       editedFiles.value.set(fileItem.id, editedFile)
//       return editedFile
//     } else if (output && typeof output === "object" && output.dest) {
//       // Handle cases where output has a dest property (some editor configurations)
//       const destFile = output.dest
//       if (destFile instanceof File || destFile instanceof Blob) {
//         const finalFile =
//           destFile instanceof File
//             ? destFile
//             : new File([destFile], fileItem.file.name, {
//                 type: destFile.type || fileItem.file.type,
//                 lastModified: Date.now(),
//               })
//         editedFiles.value.set(fileItem.id, finalFile)
//         return finalFile
//       }
//     }
//   }

//   // Return the output as-is if we can't process it, or return undefined to let FilePond handle it
//   return output
// }

watch(hasFiles, (newVal) => {
  emit("has-files", newVal)
})

const tryAgain = () => {
  trackClickEvent("Click Tracking - Try Again", "Video Capture", "Try Again")
  numOfRetakes.value++
  reset()
  openCaptureMode(mediaType.VIDEO)
}

// Restore autosaved files when component mounts
onMounted(async () => {
  // Wait a bit for FilePond to initialize
  await nextTick()

  // Only restore if FilePond is empty (to avoid duplicates during user interaction)
  if (pond.value && pond.value.getFiles().length === 0) {
    await restoreAutosavedFiles()
  }

  // Restore files if in autosave mode
  await restoreAutosavedFiles()

  if (props.autoSelect) {
    openCaptureMode(props.autoSelect)
  }
})
</script>

<template>
  <div>
    <Panel
      ref="uploadMediaPanel"
      class="upload-media"
      :class="props.invalid ? 'p-invalid !border-red-300' : ''"
      :header="props.header"
    >
      <div
        v-if="!isCapturing && !hasFiles"
        class="flex items-center justify-center gap-4 mb-4"
      >
        <Button
          v-if="props.cameraButton"
          @click="openCaptureMode(mediaType.IMAGE)"
          class="grow"
          :class="props.invalid ? '!border-red-300' : ''"
          icon="pi pi-camera"
          :label="props.cameraButtonLabel"
          severity="secondary"
        />
        <Button
          v-if="props.videoButton"
          @click="openCaptureMode(mediaType.VIDEO)"
          class="grow"
          :class="props.invalid ? '!border-red-300' : ''"
          icon="pi pi-video"
          :label="props.videoButtonLabel"
          severity="secondary"
        />
        <Button
          v-if="props.audioButton"
          @click="openCaptureMode(mediaType.AUDIO)"
          class="grow"
          :class="props.invalid ? '!border-red-300' : ''"
          icon="pi pi-microphone"
          :label="props.audioButtonLabel"
          severity="secondary"
        />
      </div>

      <div v-if="showImageCapture" class="capture-component-container">
        <CaptureImage
          :bucket="props.bucket"
          :subfolder="props.subfolder"
          :patient-id="props.user?.id"
          :metadata="props.metadata"
          @capture-complete="handleCaptureComplete"
          @capture-error="handleCaptureError"
        />
        <button @click="openCaptureMode(null)" class="close-capture-btn">
          Close Capture
        </button>
      </div>

      <div v-if="showVideoAudioCapture" class="capture-component-container">
        <CaptureVideoAudio
          :bucket="props.bucket"
          :subfolder="props.subfolder"
          :patient-id="props.user?.id"
          :metadata="props.metadata"
          :record-time-limit="props.recordTimeLimit"
          @capture-complete="handleCaptureComplete"
          @capture-error="handleCaptureError"
          @close-capture="emit('close-capture')"
        />
        <!-- <button @click="openCaptureMode(null)" class="close-capture-btn">
          Close Capture
        </button> -->
      </div>

      <div v-if="showAudioCapture" class="capture-component-container">
        <CaptureAudio
          :bucket="props.bucket"
          :subfolder="props.subfolder"
          :patient-id="props.user?.id"
          :metadata="props.metadata"
          :record-time-limit="props.recordTimeLimit"
          @capture-complete="handleCaptureComplete"
          @capture-error="handleCaptureError"
        />
        <button @click="openCaptureMode(null)" class="close-capture-btn">
          Close Capture
        </button>
      </div>

      <!-- Existing FilePond uploader, conditionally hide if a capture mode is active -->
      <!-- Manual Video Preview -->
      <div v-if="lastCapturedVideoUrl" class="manual-preview">
        <!-- <h3>Review Recording</h3> -->
        <video
          v-if="Capacitor.getPlatform() === 'ios'"
          :src="lastCapturedVideoUrl"
          controls
          playsinline
          webkit-playsinline
          width="100%"
          class="rounded border"
        ></video>
      </div>

      <ClientOnly>
        <FilePond
          v-show="
            !isProcessing &&
            !showImageCapture &&
            !showVideoAudioCapture &&
            !showAudioCapture &&
            (props.browseButton || hasFiles)
          "
          ref="pond"
          name="media-upload"
          class-name="my-pond"
          label-idle="Drop files here or <span class='filepond--label-action'>Browse</span>"
          :allow-multiple="true"
          :allow-browse="props.browseButton"
          :allow-drop="props.browseButton"
          :accepted-file-types="acceptedFileTypes"
          :max-files="maxFiles"
          :max-file-size="maxFileSize"
          :server="serverConfig"
          :files="initialFiles"
          :image-editor="imageEditorPinturaOptions"
          :capture-method="null"
          credits="false"
          @init="handleFilePondInit"
          @addfile="onAddFile"
          @removefile="onRemoveFile"
          @processfile="onProcessFile"
          @error="onError"
          :class="props.invalid ? '!border-red-300' : ''"
        />
      </ClientOnly>

      <!--
        Note:
        - `allow-image-preview` might now be controlled by FilePondPluginFilePoster's presence.
        - `allow-image-edit` is a new prop for FilePondPluginImageEditor (default true).
        - `image-edit-instant-edit` is also a new prop for FilePondPluginImageEditor (default false).
          The old `image-edit-instant-edit` was for the old plugin.
        - `image-preview-height` might be superseded or work with `file-poster-max-height`.
        - Removed `:image-edit-editor="editor"`.
        - Added `:image-editor="imageEditorPinturaOptions"` which is the standard prop for the new plugin.
        - Added `file-poster-max-height` as it's relevant for the new poster plugin.
      -->
      <div
        v-if="
          hasFiles &&
          !isProcessing &&
          !showImageCapture &&
          !showVideoAudioCapture &&
          !showAudioCapture &&
          props.uploadButton
        "
        class="upload-actions"
      >
        <button @click="handleFilesReady" class="upload-btn" type="button">
          Upload Files
        </button>
      </div>
    </Panel>
    <!-- Upload button appears after files are ready -->
    <!-- Conditionally hide FilePond related status/actions if capture mode is active -->
    <div
      class="upload-status"
      v-if="
        !showImageCapture &&
        !showVideoAudioCapture &&
        !showAudioCapture &&
        !showAudioCapture &&
        (props.browseButton || hasFiles)
      "
    >
      <span v-if="isProcessing" class="processing">
        <i class="pi pi-spin pi-spinner mr-2" style="font-size: 1rem"></i>
        Processing and uploading your video...
      </span>
      <span v-else-if="hasFiles" class="flex flex-column gap-4">
        <p class="font-bold ready">
          <i class="pi pi-check-circle mr-1 font-bold"></i> Your video is ready
          for submission
        </p>
        <Button
          label="Not happy? Try again."
          severity="secondary"
          @click="tryAgain()"
          icon="pi pi-refresh"
          class="w-16rem m-auto"
        />
        <!-- <Button
          label="Cancel"
          severity="danger"
          @click="reset()"
          class="w-13rem m-auto"
        /> -->
      </span>
      <span v-else class="empty"> 📁 No files selected </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.upload-media {
  width: 100%;
}

.capture-btn:hover {
  background-color: var(
    --primary-color-dark,
    #0056b3
  ); // Darken or lighten distinct color
}

.capture-component-container {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border: 1px dashed #ccc;
  border-radius: 8px;
  position: relative;
  /* For positioning the close button if needed */
}

.close-capture-btn {
  display: block;
  margin: 1rem auto 0;
  padding: 0.5rem 1rem;
  background-color: #ff4d4f;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.close-capture-btn:hover {
  background-color: #d9363e;
}

.upload-status {
  margin-top: 1rem;
  text-align: center;
  font-size: 0.9rem;
  padding: 0.5rem;
  border-radius: 6px;
}

.upload-status .processing {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color, #007bff);
  font-weight: 500;
}

.upload-status .ready .pi {
  color: var(--p-green-500);
}

.upload-status .empty {
  color: var(--text-color-secondary, #666);
}

.upload-actions {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
}

.upload-btn {
  background-color: var(--primary-color, #007bff);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.upload-btn:hover {
  background-color: var(--primary-color-dark, #0056b3);
}

.upload-btn:disabled {
  background-color: var(--surface-border, #ccc);
  cursor: not-allowed;
}
</style>

<style lang="scss">
.upload-media {
  &.p-invalid {
    .filepond--drop-label {
      border: 2px dashed var(--p-inputtext-invalid-border-color);
    }
  }
}
.filepond--wrapper {
  cursor: pointer;

  .filepond--credits {
    display: none;
  }

  .filepond--drop-label {
    border-radius: 6px;
    background: var(--p-button-secondary-background);
    border: 2px dashed var(--p-button-secondary-color);
    transition: background 0.3s ease;

    &:hover {
      background: var(--p-button-secondary-hover-background);
    }

    label {
      pointer-events: none;
      color: var(--p-button-secondary-color);
    }
  }
}
</style>
