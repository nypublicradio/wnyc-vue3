<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue"
import useGallery from "~/composables/useGallery"

const props = defineProps({
  bucket: {
    type: String,
    default: "media",
  },
  subfolder: {
    type: String,
    default: null,
  },
  patientId: {
    type: String,
    default: "",
  },
  metadata: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(["capture-complete", "capture-error"])

const videoRef = ref(null)
const canvasRef = ref(null)
const devices = ref([])
const selectedDeviceId = ref(null)
const stream = ref(null)
const error = ref(null)
const isProcessing = ref(null) // Changed to null initially, will be set by captureImage

const processImageFile = (file) => {
  if (!file || !(file instanceof File) || !file.type.startsWith("image/")) {
    return file
  }
  // Skip resizing for now to simplify; focus on capture & EXIF.
  // User can add this back if needed, or it can be a separate step.
  // The main goal is to get it to FilePond for preview and editing.
  console.log(
    "Skipping processImageFile (resize/WebP) for captured image, will be handled by FilePond."
  )
  return file
}

const captureImage = () => {
  if (!videoRef.value || !canvasRef.value || !stream.value) {
    error.value = "Camera stream not available for capture."
    return
  }
  isProcessing.value = true
  error.value = null

  const video = videoRef.value
  const canvas = canvasRef.value
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const context = canvas.getContext("2d")
  context.drawImage(video, 0, 0, canvas.width, canvas.height)

  canvas.toBlob(
    async (blob) => {
      if (!blob) {
        error.value = "Failed to create image blob."
        isProcessing.value = false
        return
      }
      const timestamp = new Date().getTime()
      const fileName = `capture_${timestamp}.jpg`
      const imageFile = new File([blob], fileName, {
        type: "image/jpeg",
        lastModified: Date.now(),
      })

      try {
        // Instead of uploading, emit the captured file with metadata
        const captureMetadata = {
          captureMethod: "browser_camera",
          captureTimestamp: timestamp,
          captureDate: new Date().toISOString(),
          originalProps: {
            bucket: props.bucket,
            subfolder: props.subfolder,
            patientId: props.patientId,
            metadata: props.metadata,
          },
        }

        emit("capture-complete", {
          file: imageFile,
          metadata: captureMetadata,
        })

        // Optionally, stop camera after capture or keep it running for multiple captures
        // stopCamera(); // Uncomment if you want to stop after one capture
      } catch (error) {
        const errorMessage = error.message || "Image capture failed"
        console.error("Capture failed:", errorMessage)
        error.value = `Capture failed: ${errorMessage}`
        emit("capture-error", errorMessage)
      } finally {
        isProcessing.value = false
      }
    },
    "image/jpeg",
    0.9
  )
}

const getDevices = async () => {
  try {
    await navigator.mediaDevices.getUserMedia({ video: true }) // Request permission first
    const allDevices = await navigator.mediaDevices.enumerateDevices()
    devices.value = allDevices.filter((device) => device.kind === "videoinput")
    if (devices.value.length > 0 && !selectedDeviceId.value) {
      selectedDeviceId.value = devices.value[0].deviceId
    }
  } catch (err) {
    console.error("Error enumerating devices:", err)
    error.value = `Error accessing media devices: ${err.name}. Please ensure permissions are granted.`
    if (err.name === "NotAllowedError") {
      error.value =
        "Camera access was denied. Please enable camera permissions in your browser settings."
    } else if (err.name === "NotFoundError") {
      error.value = "No camera found. Please ensure a camera is connected and enabled."
    } else {
      error.value = `Could not access camera: ${err.message}.`
    }
  }
}

const stopCamera = () => {
  if (stream.value) {
    stream.value.getTracks().forEach((track) => track.stop())
    stream.value = null
  }
  if (videoRef.value?.srcObject) {
    videoRef.value.srcObject = null
  }
}

const startCamera = async () => {
  if (stream.value) {
    stopCamera() // Stop existing stream before starting a new one
  }
  if (!selectedDeviceId.value && devices.value.length > 0) {
    selectedDeviceId.value = devices.value[0].deviceId // Default to first camera if none selected
  }
  if (!selectedDeviceId.value) {
    error.value = "No camera selected or available."
    console.warn("No camera selected or available to start.")
    return
  }

  const constraints = {
    video: {
      deviceId: { exact: selectedDeviceId.value },
      width: { ideal: 1920 },
      height: { ideal: 1080 },
    },
  }

  try {
    error.value = null // Clear previous errors
    stream.value = await navigator.mediaDevices.getUserMedia(constraints)
    if (videoRef.value) {
      videoRef.value.srcObject = stream.value
      videoRef.value.onloadedmetadata = () => {
        // Ensure the video dimensions are set for the canvas
        if (canvasRef.value) {
          canvasRef.value.width = videoRef.value.videoWidth
          canvasRef.value.height = videoRef.value.videoHeight
        }
      }
    }
  } catch (err) {
    console.error("Error starting camera:", err)
    error.value = `Error starting camera: ${err.name}. Check permissions and device availability.`
    if (err.name === "NotAllowedError") {
      error.value =
        "Camera access was denied. Please enable camera permissions in your browser settings."
    } else if (
      err.name === "OverconstrainedError" ||
      err.name === "ConstraintNotSatisfiedError"
    ) {
      error.value =
        "Selected camera does not support the requested resolution. Trying default."
      // Fallback to default constraints if specific device fails (e.g. resolution)
      try {
        stream.value = await navigator.mediaDevices.getUserMedia({ video: true })
        if (videoRef.value) videoRef.value.srcObject = stream.value
      } catch (fallbackErr) {
        error.value = `Fallback camera access failed: ${fallbackErr.message}`
      }
    } else {
      error.value = `Could not access camera: ${err.message}.`
    }
  }
}

// Lifecycle hooks
onMounted(async () => {
  await getDevices()
  if (selectedDeviceId.value) {
    await startCamera()
  } else if (devices.value.length > 0) {
    // If no device was pre-selected but devices are available, start the first one.
    selectedDeviceId.value = devices.value[0].deviceId
    // startCamera will be called by the watcher now
  } else {
    error.value = "No video input devices found. Please connect a camera."
  }
})

onBeforeUnmount(() => {
  stopCamera()
})

// Watch for changes in selectedDeviceId to restart the camera
watch(selectedDeviceId, async (newVal, oldVal) => {
  if (newVal && newVal !== oldVal) {
    await startCamera()
  }
})

// Watch for changes in devices list to auto-select if initially empty
watch(devices, (newDevices) => {
  if (newDevices.length > 0 && !selectedDeviceId.value) {
    selectedDeviceId.value = newDevices[0].deviceId
    // startCamera will be called by the selectedDeviceId watcher
  }
})
</script>

<template>
  <div class="capture-image">
    <div v-if="error" class="error-message">{{ error }}</div>

    <div class="controls">
      <!-- <label for="camera-select">Select Camera:</label> -->
      <select
        id="camera-select"
        v-model="selectedDeviceId"
        @change="startCamera"
        class="w-full"
      >
        <option
          v-for="device in devices"
          :key="device.deviceId"
          :value="device.deviceId"
          class="w-full"
        >
          {{ device.label ? device.label : device.deviceId }}
          {{ device.label || `Camera ${devices.indexOf(device) + 1}` }}
        </option>
      </select>
    </div>

    <div class="preview-container">
      <video ref="videoRef" autoplay playsinline muted class="camera-preview"></video>
      <canvas ref="canvasRef" style="display: none"></canvas>
    </div>

    <div class="actions">
      <button @click="captureImage" :disabled="!stream">Capture Image</button>
    </div>

    <div v-if="isProcessing" class="loading-indicator">Processing capture...</div>
  </div>
</template>

<style scoped>
.capture-image {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #333;
}

.controls label {
  font-weight: bold;
}

.controls select {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.preview-container {
  position: relative;
  width: 100%;
  max-width: 640px;
  /* Max width for the preview */
  margin: 0 auto;
  /* Center the preview */
}

.camera-preview {
  width: 100%;
  height: auto;
  border-radius: 4px;
  background-color: #333;
  /* Placeholder background */
  display: block;
  /* Remove extra space below video */
}

.actions {
  display: flex;
  justify-content: center;
}

.actions button {
  padding: 0.75rem 1.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.actions button:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}

.error-message {
  color: red;
  background-color: #ffe0e0;
  border: 1px solid red;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.loading-indicator {
  text-align: center;
  padding: 1rem;
  font-style: italic;
}
</style>
