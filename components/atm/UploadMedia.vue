<script setup>
import { ref, computed } from "vue"
import { trackClickEvent } from "~/utilities/helpers"
import CaptureVideoAudio from "./CaptureVideoAudio.vue"
import useTranscribe from "~/composables/atm/useTranscribe"

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
  user: {
    type: Object,
    default: null,
  },
  metadata: {
    type: Array,
    default: () => [],
  },
  invalid: {
    type: Boolean,
    default: false,
  },
  // Kept for compatibility but hardcoded to true only for video in logic if needed
  videoButton: {
    type: Boolean,
    default: true,
  },
  videoButtonLabel: {
    type: String,
    default: "Record Video",
  },
  // Autosave props kept if needed for compatibility, though complex logic removed if unused.
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

const { transcribeMedia } = useTranscribe()

// Supabase client
const supabase = useSupabaseClient()

// State
const capturedFile = ref(null)
const captureMetadata = ref(null)
const isCapturing = ref(true) // Default to capturing since that's the only mode
const isProcessing = ref(false)
const numOfRetakes = ref(0)
const lastCapturedVideoUrl = ref(null)

// Function called by parent (submission.vue)
const uploadFiles = async () => {
  if (!capturedFile.value) {
    return null
  }

  isProcessing.value = true
  emit("upload-progress", "Video uploading...")

  try {
    const file = capturedFile.value
    const timestamp = new Date().getTime()

    // Helper to format date
    const timeStampToDate = (ts) => {
      const date = new Date(ts)
      return date.toISOString().split("T")[0]
    }

    // Generate unique filename
    // Sanitize filename
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const rawName = props.user?.user_metadata?.name
    const userName = rawName ? rawName.replace(" ", "_") : "unknown-user"
    const userId = props.user?.id ? `--${props.user?.id}--` : ""

    // Use metadata subfolder if available, or prop
    const subfolder =
      captureMetadata.value?.originalProps?.subfolder || props.subfolder

    const fileName = `${userName}${userId}${timeStampToDate(
      timestamp
    )}_capture_${sanitizedName}`
    const fileNamePath = `${`/${subfolder}`}/${timeStampToDate(
      timestamp
    )}/${fileName}`

    // Upload to Supabase
    const bucket = captureMetadata.value?.originalProps?.bucket || props.bucket

    // Check for ArrayBuffer (iOS compatibility from CaptureVideoAudio)
    let fileBody = file
    if (file.arrayBufferData) {
      try {
        fileBody = new Blob([file.arrayBufferData], { type: file.type })
      } catch (e) {
        console.error("Failed to create blob from array buffer", e)
        fileBody = file.arrayBufferData
      }
    }

    const uploadOptions = {
      cacheControl: "3600",
      upsert: false,
      contentType: fileBody.type || file.type || "video/quicktime",
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

    // Prepare final metadata
    const finalMetadata = captureMetadata.value
      ? { ...captureMetadata.value, path: data.path }
      : {
          uploadTimestamp: Date.now(),
          uploadDate: new Date().toISOString(),
          bucket: bucket,
          path: data.path,
        }

    // Transcribe
    let transcription = null
    try {
      transcription = await transcribeMedia(file)
    } catch (error) {
      console.error("Transcription failed:", error)
      transcription = "transcribe failed"
    }

    emit("upload-progress", "Data processing...")

    // Insert into submission table
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

    // Reset retakes
    numOfRetakes.value = 0

    // Reset progress after delay
    setTimeout(() => {
      emit("upload-progress", null)
    }, 3000)

    const result = { path: data.path, metadata: finalMetadata }
    emit("upload-complete", result)
    return result
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Upload failed"
    console.error("Upload error:", err)
    emit("upload-error", errorMessage)
    return null
  } finally {
    isProcessing.value = false
  }
}

// Handler for capture completion
const handleCaptureComplete = (captureData) => {
  if (captureData.file) {
    capturedFile.value = captureData.file
    captureMetadata.value = captureData.metadata

    // Create preview URL
    if (lastCapturedVideoUrl.value) {
      URL.revokeObjectURL(lastCapturedVideoUrl.value)
    }
    try {
      lastCapturedVideoUrl.value = URL.createObjectURL(captureData.file)
    } catch (e) {
      console.error("Failed to create preview URL", e)
    }

    isCapturing.value = false
    emit("has-files", true)

    // Emit files-updated as single element array for potential compat
    emit("files-updated", [captureData.file])
  }
}

const handleRetake = () => {
  capturedFile.value = null
  captureMetadata.value = null
  if (lastCapturedVideoUrl.value) {
    URL.revokeObjectURL(lastCapturedVideoUrl.value)
    lastCapturedVideoUrl.value = null
  }
  numOfRetakes.value++
  isCapturing.value = true
  emit("has-files", false)
}

const handleCloseCapture = () => {
  emit("close-capture")
}

defineExpose({
  uploadFiles,
})
</script>

<template>
  <div class="upload-media-component">
    <div v-if="header" class="header mb-3">
      <h3>{{ header }}</h3>
    </div>

    <div class="capture-container">
      <!-- Video Capture Component -->
      <div v-if="isCapturing" class="capture-wrapper">
        <CaptureVideoAudio
          :bucket="bucket"
          :subfolder="subfolder"
          :patientId="user?.id"
          :metadata="metadata"
          :recordTimeLimit="recordTimeLimit"
          @capture-complete="handleCaptureComplete"
          @close-capture="handleCloseCapture"
        />
      </div>

      <!-- Preview and Actions (When not capturing) -->
      <div
        v-else
        class="preview-wrapper flex flex-column align-items-center gap-4"
      >
        <div v-if="isProcessing" class="w-full my-4">
          <ProgressBar mode="indeterminate" style="height: 6px"></ProgressBar>
        </div>

        <div v-else-if="lastCapturedVideoUrl" class="video-preview-box">
          <video
            :src="lastCapturedVideoUrl"
            controls
            playsinline
            class="preview-video"
          ></video>
        </div>

        <div v-if="!isProcessing" class="actions flex gap-3">
          <Button
            label="Not happy? Try again"
            icon="pi pi-refresh"
            class="p-button-secondary"
            @click="handleRetake"
            :disabled="isProcessing"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.upload-media-component {
  width: 100%;
}

.preview-video {
  width: 100%;
  height: auto;
  max-height: 60vh;
  border-radius: 8px;
  background: #000;
  object-fit: contain;
}

.video-preview-box {
  width: 100%;
  display: flex;
  justify-content: center;
  background: var(--p-sky-50);
  padding: 1rem;
  border-radius: 8px;
}
</style>
